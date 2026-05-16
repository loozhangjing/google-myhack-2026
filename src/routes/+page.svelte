<script lang="ts">
	import { fade, slide } from "svelte/transition";
	import SwipeDeck from "$lib/components/SwipeDeck.svelte";
	import { Search, Sparkles, Briefcase, UserRound } from "lucide-svelte";

	import { GoogleGenAI } from '@google/genai';
	import { swipeProfiles } from '$lib/talent';
	import { jobProfiles } from '$lib/jobs';
	import { searchCache } from '$lib/searchCache';

	const GEMINI_API_KEY = 'AIzaSyCH5W-Ah_4bTsuP_5Ogrpj0EZBozw7bn3Q';

	let userType = $state<"provider" | "seeker" | null>(null);
	let searchQuery = $state("");
	let isSearching = $state(false);
	let hasSearched = $state(false);
	let filteredProfiles = $state<any[]>([]);
	let extractedSkills = $state<string[]>([]);

	const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

	async function handleSearch() {
		if (!searchQuery.trim() || !userType) return;

		isSearching = true;

		try {
			const cacheKey = `${userType}:${searchQuery.trim().toLowerCase()}`;

			if (searchCache[cacheKey]) {
				extractedSkills = searchCache[cacheKey];
				console.log(`[Cache Hit] Skills:\n${extractedSkills}`);
			} else {
				const prompt = userType === 'seeker' ? `
					You are an expert technical recruiter AI for a high-end hiring platform. 
					The employer is looking for: "${searchQuery}".
					
					Extract the core technical expertise, tools, and domain skills required from this query.
					If the query is vague, infer the necessary underlying skills.
					Return ONLY a clean JSON array of strings representing the skills. Do not use markdown blocks.
					Example: ["SvelteKit", "WebGL", "Frontend Architecture"]
				` : `
					You are an expert career advisor AI for a high-end job matching platform. 
					The candidate is looking for a job based on this description: "${searchQuery}".
					
					Extract the core technical expertise, tools, and domain skills the candidate possesses or desires.
					If the query is vague, infer the necessary underlying skills.
					Return ONLY a clean JSON array of strings representing the skills. Do not use markdown blocks.
					Example: ["React", "Node.js", "Backend Architecture"]
				`;

				const response = await ai.models.generateContent({
					model: 'gemini-2.5-flash',
					contents: prompt,
				});

				console.log(response);
				
				// Parse the JSON array from the response
				extractedSkills = JSON.parse(response.text || "[]");
				
				console.log(`[Gemini] Extracted Skills:\n${extractedSkills}`);
				
				// Write to our persistent physical cache
				searchCache[cacheKey] = extractedSkills;
				await fetch('/api/cache', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ key: cacheKey, value: extractedSkills })
				}).catch(e => console.error("Cache save failed:", e));
			}
			
			const targetDatabase = userType === 'seeker' ? swipeProfiles : jobProfiles;

			// Fuzzy search against the database of profiles
			const scoredProfiles = targetDatabase.map(profile => {
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
			// filteredProfiles = targetDatabase;
		} finally {
			isSearching = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter") {
			handleSearch();
		}
	}

	function resetSearch() {
		hasSearched = false;
		searchQuery = "";
		userType = null;
		filteredProfiles = [];
	}
</script>

<svelte:head>
	<title>LinkedOut | AI-powered Talent Matchmaking</title>
</svelte:head>

<main
	class="w-full h-[100dvh] bg-[#0D0D12] text-[#FAF8F5] overflow-hidden relative font-sans"
>
	{#if userType === null}
		<!-- STEP 1: CHOOSE PATH -->
		<div
			out:fade={{ duration: 400 }}
			class="absolute inset-0 flex flex-col items-center justify-center px-6 z-20 bg-[#0D0D12]"
		>
			<div
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C9A84C]/10 rounded-full blur-[140px] pointer-events-none"
			></div>

			<div class="max-w-4xl w-full flex flex-col items-center z-10">
				<h1 class="text-4xl md:text-6xl font-bold tracking-tight text-center mb-4 text-white leading-tight" style="font-family: 'Inter', sans-serif;">
					LinkedOut
				</h1>
				<h2 class="text-3xl mb-16">AI-powered <span class="text-[#C9A84C] italic font-serif" style="font-family: 'Playfair Display', serif;">talent matchmaking</span>.</h2>
				<br>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
					<button
						onclick={() => userType = 'provider'}
						class="group relative overflow-hidden bg-[#1A1A24] border border-[#2A2A35] hover:border-[#C9A84C]/50 rounded-[2rem] p-10 text-left transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#C9A84C]/10"
					>
						<div class="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
						<div class="relative z-10 flex flex-col items-start gap-6">
							<div class="w-16 h-16 rounded-full bg-[#2A2A35] flex items-center justify-center text-[#C9A84C] group-hover:scale-110 transition-transform duration-500">
								<Briefcase size={32} />
							</div>
							<div>
								<h2 class="text-3xl font-bold mb-3 tracking-tight" style="font-family: 'Inter', sans-serif;">Service Provider</h2>
								<p class="text-gray-400 text-lg leading-relaxed">I am world-class talent. Show me the best opportunities and elite teams seeking my expertise.</p>
							</div>
						</div>
					</button>

					<button
						onclick={() => userType = 'seeker'}
						class="group relative overflow-hidden bg-[#1A1A24] border border-[#2A2A35] hover:border-[#8B5CF6]/50 rounded-[2rem] p-10 text-left transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#8B5CF6]/10"
					>
						<div class="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
						<div class="relative z-10 flex flex-col items-start gap-6">
							<div class="w-16 h-16 rounded-full bg-[#2A2A35] flex items-center justify-center text-[#8B5CF6] group-hover:scale-110 transition-transform duration-500">
								<UserRound size={32} />
							</div>
							<div>
								<h2 class="text-3xl font-bold mb-3 tracking-tight" style="font-family: 'Inter', sans-serif;">Service Seeker</h2>
								<p class="text-gray-400 text-lg leading-relaxed">I am building something great. I need to find the best 1% of technical talent to join my mission.</p>
							</div>
						</div>
					</button>
				</div>
			</div>
		</div>
	{:else if !hasSearched}
		<!-- STEP 2: SEARCH PROMPT -->
		<div
			in:fade={{ duration: 400, delay: 200 }}
			out:fade={{ duration: 400 }}
			class="absolute inset-0 flex flex-col items-center justify-center px-6 z-20 bg-[#0D0D12]"
		>
			<button 
				onclick={() => userType = null}
				class="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-bold"
			>
				← Back
			</button>

			<!-- Background Ambient Glow -->
			<div
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] {userType === 'seeker' ? 'bg-[#8B5CF6]/10' : 'bg-[#C9A84C]/10'} rounded-full blur-[120px] pointer-events-none"
			></div>

			<div class="max-w-3xl w-full flex flex-col items-center z-10">
				<div
					class="flex items-center gap-3 mb-8 px-4 py-2 rounded-full bg-[#2A2A35]/50 border border-[#FAF8F5]/10 text-sm font-mono {userType === 'seeker' ? 'text-[#8B5CF6]' : 'text-[#C9A84C]'} shadow-lg"
				>
					<Sparkles size={16} />
					<span>AI-Powered Matching</span>
				</div>

				<h1
					class="text-5xl md:text-7xl font-bold tracking-tight text-center mb-12 text-white leading-tight" style="font-family: 'Inter', sans-serif;"
				>
					{#if userType === 'seeker'}
						Who do you need on <br class="hidden md:block" /> your team?
					{:else}
						What is your next <br class="hidden md:block" /> great endeavor?
					{/if}
				</h1>

				<div class="w-full max-w-2xl relative group">
					<div
						class="absolute inset-y-0 left-6 md:left-8 flex items-center pointer-events-none text-gray-400 group-focus-within:{userType === 'seeker' ? 'text-[#8B5CF6]' : 'text-[#C9A84C]'} transition-colors"
					>
						<Search size={28} />
					</div>

					<input
						type="text"
						bind:value={searchQuery}
						onkeydown={handleKeydown}
						placeholder={userType === 'seeker' ? "e.g. 'A SvelteKit and WebGL frontend dev'" : "e.g. 'Building low-latency LLM infrastructure in Rust'"}
						class="w-full bg-[#1A1A24] border-2 border-[#2A2A35] rounded-full py-5 md:py-6 pl-16 md:pl-20 pr-8 text-lg md:text-2xl text-white placeholder-gray-500 focus:outline-none focus:border-{userType === 'seeker' ? '[#8B5CF6]' : '[#C9A84C]'} transition-all shadow-2xl focus:shadow-{userType === 'seeker' ? '[#8B5CF6]' : '[#C9A84C]'}/20"
						disabled={isSearching}
					/>

					{#if isSearching}
						<div
							class="absolute right-6 top-1/2 -translate-y-1/2 flex gap-1.5"
						>
							<div
								class="w-2.5 h-2.5 {userType === 'seeker' ? 'bg-[#8B5CF6]' : 'bg-[#C9A84C]'} rounded-full animate-bounce"
								style="animation-delay: 0ms"
							></div>
							<div
								class="w-2.5 h-2.5 {userType === 'seeker' ? 'bg-[#8B5CF6]' : 'bg-[#C9A84C]'} rounded-full animate-bounce"
								style="animation-delay: 150ms"
							></div>
							<div
								class="w-2.5 h-2.5 {userType === 'seeker' ? 'bg-[#8B5CF6]' : 'bg-[#C9A84C]'} rounded-full animate-bounce"
								style="animation-delay: 300ms"
							></div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}

	<!-- STEP 3: RESULTS (SWIPE DECK) -->
	{#if hasSearched}
		<div in:fade={{ duration: 600, delay: 400 }} class="absolute inset-0 flex flex-col">
			<div class="p-6 z-40 absolute top-0 left-0 w-full flex justify-between items-center pointer-events-none">
				<button 
					onclick={resetSearch}
					class="pointer-events-auto px-6 py-2 bg-[#1A1A24]/80 backdrop-blur-md rounded-full border border-[#2A2A35] hover:border-gray-400 transition-colors text-sm font-bold tracking-wider text-white"
				>
					NEW SEARCH
				</button>
			</div>

			{#if filteredProfiles.length > 0}
				{#key filteredProfiles}
					<SwipeDeck initialProfiles={filteredProfiles} />
				{/key}
			{:else}
				<div
					class="flex flex-col items-center justify-center h-full z-30 relative px-6 text-center"
				>
					<p class="text-gray-400 text-xl font-mono mb-8">
						No matches found for your query.
					</p>
					<button
						onclick={() => {
							hasSearched = false;
							searchQuery = "";
						}}
						class="px-8 py-4 bg-[#2A2A35] rounded-full text-white font-bold hover:bg-white hover:text-black transition-colors shadow-2xl"
					>
						Try Another Search
					</button>
				</div>
			{/if}
		</div>
	{/if}
</main>
