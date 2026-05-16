import { json } from '@sveltejs/kit';

/* 
	BOILERPLATE FOR GOOGLE GEMINI API
	1. Install the SDK: `npm install @google/generative-ai`
	2. Add your API key to .env as GEMINI_API_KEY
*/

import { GoogleGenAI } from '@google/genai';
import { swipeProfiles } from '$lib/talent';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST({ request }) {
	try {
		const { query } = await request.json();

		if (!query) {
			return json({ error: 'Query is required' }, { status: 400 });
		}
		const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

		const prompt = `
			You are an expert technical recruiter AI for a high-end hiring platform. 
			The employer is looking for: "${query}".
			
			Extract the core technical expertise, tools, and domain skills required from this query.
			If the query is vague, infer the necessary underlying skills.
			Return ONLY a clean JSON array of strings representing the skills. Do not use markdown blocks.
			Example: ["SvelteKit", "WebGL", "Frontend Architecture"]
		`;

		const response = await ai.models.generateContent({
			model: 'gemini-2.5-flash',
			contents: prompt,
		});

		console.log(response);
		
		// Parse the JSON array from the response
		const extractedSkills = JSON.parse(response.text);
		
		console.log(`[Gemini] Extracted Skills: ${extractedSkills}`);
		
		// Fuzzy search against the database of profiles
		const scoredProfiles = swipeProfiles.map(profile => {
			let score = 0;
			// Combine all searchable text from the profile into one lowercase string
			const searchString = [
				profile.role,
				profile.bio,
				...profile.expertise,
				...profile.history.map(h => h.role + ' ' + h.company)
			].join(' ').toLowerCase();
			
			extractedSkills.forEach((skill: string) => {
				const lowerSkill = skill.toLowerCase();
				if (searchString.includes(lowerSkill)) {
					score += 3; // Direct match
				}
				
				// Check partial word matches
				lowerSkill.split(' ').forEach(word => {
					if (word.length > 2 && searchString.includes(word)) {
						score += 1;
					}
				});
			});
			return { profile, score };
		});

		const matchedProfiles = scoredProfiles
			.filter(p => p.score > 0)
			.sort((a, b) => b.score - a.score)
			.map(p => p.profile);
		
		return json({ skills: extractedSkills, profiles: matchedProfiles, success: true });
	} catch (error) {
		console.error('Error in search API:', error);
		return json({ error: 'Failed to process search' }, { status: 500 });
	}
}
