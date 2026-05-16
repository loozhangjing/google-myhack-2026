<script lang="ts">
	import { fade } from "svelte/transition";
	import SwipeDeck from "$lib/components/SwipeDeck.svelte";
	import { Search, Sparkles } from "lucide-svelte";

	import { GoogleGenAI } from '@google/genai';
	import { swipeProfiles } from '$lib/data';

	const GEMINI_API_KEY = 'PUT YO API KEY HERE';

	let searchQuery = $state("");
	let isSearching = $state(false);
	let hasSearched = $state(false);
	let filteredProfiles = $state([]);

	const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

	async function handleSearch() {
		if (!searchQuery.trim()) return;

		isSearching = true;

		try {
			const prompt = `
				You are an expert technical recruiter AI for a high-end hiring platform. 
				The employer is looking for: "${searchQuery}".
				
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

			filteredProfiles = matchedProfiles;
			hasSearched = true;
		} catch (error) {
			console.error('Search error:', error);
			// Fallback: search failed, maybe show an error or just transition with all profiles
			// hasSearched = true;
			// filteredProfiles = swipeProfiles;
		} finally {
			isSearching = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			handleSearch();
		}
	}
</script>

<svelte:head>
	<title>Connect | Midnight Luxe</title>
</svelte:head>

<main
	class="w-full h-[100dvh] bg-[#0D0D12] text-[#FAF8F5] overflow-hidden relative"
>
	{#if !hasSearched}
		<div
			out:fade={{ duration: 400 }}
			class="absolute inset-0 flex flex-col items-center justify-center px-6 z-20 bg-[#0D0D12]"
		>
			<!-- Background Ambient Glow -->
			<div
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B5CF6]/10 rounded-full blur-[120px] pointer-events-none"
			></div>

			<div class="max-w-3xl w-full flex flex-col items-center z-10">
				<div
					class="flex items-center gap-3 mb-8 px-4 py-2 rounded-full bg-[#2A2A35]/50 border border-[#FAF8F5]/10 text-sm font-mono text-[#8B5CF6] shadow-lg"
				>
					<Sparkles size={16} />
					<span>AI-Powered Talent Matching</span>
				</div>

				<h1
					class="text-5xl md:text-7xl font-bold tracking-tight text-center mb-12 text-white leading-tight"
				>
					Who do you need on <br class="hidden md:block" /> your team?
				</h1>

				<div class="w-full max-w-2xl relative group">
					<div
						class="absolute inset-y-0 left-6 md:left-8 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors"
					>
						<Search size={28} />
					</div>

					<input
						type="text"
						bind:value={searchQuery}
						onkeydown={handleKeydown}
						placeholder="e.g. 'A SvelteKit and WebGL frontend dev'"
						class="w-full bg-[#1A1A24] border-2 border-[#2A2A35] rounded-full py-5 md:py-6 pl-16 md:pl-20 pr-8 text-lg md:text-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#8B5CF6] transition-all shadow-2xl focus:shadow-[#8B5CF6]/20"
						disabled={isSearching}
					/>

					{#if isSearching}
						<div
							class="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1.5"
						>
							<div
								class="w-2.5 h-2.5 bg-[#8B5CF6] rounded-full animate-bounce"
								style="animation-delay: 0ms"
							></div>
							<div
								class="w-2.5 h-2.5 bg-[#8B5CF6] rounded-full animate-bounce"
								style="animation-delay: 150ms"
							></div>
							<div
								class="w-2.5 h-2.5 bg-[#8B5CF6] rounded-full animate-bounce"
								style="animation-delay: 300ms"
							></div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- We keep SwipeDeck mounted or mount it behind the scenes for a smoother transition, 
       but here we'll reveal it gracefully using an in transition -->
	{#if hasSearched}
		<div in:fade={{ duration: 600, delay: 400 }} class="absolute inset-0">
			{#if filteredProfiles.length > 0}
				<SwipeDeck initialProfiles={filteredProfiles} />
			{:else}
				<div
					class="flex flex-col items-center justify-center h-full z-30 relative px-6 text-center"
				>
					<p class="text-gray-400 text-xl font-mono mb-8">
						No candidates matched your prompt.
					</p>
					<button
						onclick={() => {
							hasSearched = false;
							searchQuery = "";
						}}
						class="px-8 py-4 bg-[#2A2A35] rounded-full text-white font-bold hover:bg-white hover:text-black transition-colors shadow-2xl"
						>Try Another Search</button
					>
				</div>
			{/if}
		</div>
	{/if}
</main>
