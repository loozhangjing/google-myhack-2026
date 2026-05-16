<script lang="ts">
	import { SvelteFlow, Background, Controls } from "@xyflow/svelte";
	import "@xyflow/svelte/dist/style.css";

	import { spring } from "svelte/motion";
	import { fade } from "svelte/transition";
	import { writable } from "svelte/store";
	import { X, Check, Phone } from "lucide-svelte";
	import ProfileNode from "./ProfileNode.svelte";
	import CenterNode from "./CenterNode.svelte";

	let {
		filteredProfiles = [],
		extractedSkills = [],
		matchedHistory = $bindable([]),
		searchQuery = "",
	} = $props();

	// Convert properties into reactive SvelteFlow structures
	const nodeTypes = {
		profile: ProfileNode,
		center: CenterNode,
	};

	let containerWidth = $state(800);
	let containerHeight = $state(600);

	let selectedProfile = $state<any>(null);
	let showMatchModal = $state(false);
	let matchedPhoneNumber = $state("");
	let matchedName = $state("");

	let x = spring(0, { stiffness: 0.1, damping: 0.4 });
	let y = spring(0, { stiffness: 0.1, damping: 0.4 });
	let rotation = spring(0, { stiffness: 0.1, damping: 0.4 });

	let isDragging = $state(false);
	let startX = 0;
	let startY = 0;

	function generatePhoneNumber() {
		return `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
	}

	function handlePointerDown(e: any) {
		e.stopPropagation();
		isDragging = true;
		startX = e.clientX;
		startY = e.clientY;
		e.target.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: any) {
		e.stopPropagation();
		if (!isDragging) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		x.set(dx);
		y.set(dy);
		rotation.set(dx * 0.05);
	}

	function handlePointerUp(e: any) {
		e.stopPropagation();
		if (!isDragging) return;
		isDragging = false;
		const currentX = $x;

		if (Math.abs(currentX) > window.innerWidth * 0.25) {
			const direction = currentX > 0 ? 1 : -1;
			x.set(window.innerWidth * direction);

			setTimeout(() => {
				let currentProfile = selectedProfile;
				selectedProfile = null;
				x.set(0, { hard: true });
				y.set(0, { hard: true });
				rotation.set(0, { hard: true });

				if (direction === 1 && currentProfile) {
					matchedName = currentProfile.name;
					matchedPhoneNumber = generatePhoneNumber();
					matchedHistory = [
						...matchedHistory,
						{
							profile: currentProfile,
							name: currentProfile.name,
							role: currentProfile.role,
							phone: matchedPhoneNumber,
						},
					];
					showMatchModal = true;
				}
			}, 300);
		} else {
			x.set(0);
			y.set(0);
			rotation.set(0);
		}
	}

	function swipeButton(direction: number) {
		x.set(window.innerWidth * direction);
		setTimeout(() => {
			let currentProfile = selectedProfile;
			selectedProfile = null;
			x.set(0, { hard: true });
			y.set(0, { hard: true });
			rotation.set(0, { hard: true });

			if (direction === 1 && currentProfile) {
				matchedName = currentProfile.name;
				matchedPhoneNumber = generatePhoneNumber();
				matchedHistory = [
					...matchedHistory,
					{
						profile: currentProfile,
						name: currentProfile.name,
						role: currentProfile.role,
						phone: matchedPhoneNumber,
					},
				];
				showMatchModal = true;
			}
		}, 300);
	}

	function calculateSimilarity(profileA: any, profileB: any) {
		let score = 0;
		// Skill overlap
		const skillsA = profileA.expertise?.map((s) => s.toLowerCase()) || [];
		const skillsB = profileB.expertise?.map((s) => s.toLowerCase()) || [];
		skillsA.forEach((s) => {
			if (skillsB.some((b) => b.includes(s) || s.includes(b))) score += 2;
		});

		// Experience (Company) overlap
		const companiesA =
			profileA.history?.map((h) => h.company.toLowerCase()) || [];
		const companiesB =
			profileB.history?.map((h) => h.company.toLowerCase()) || [];
		companiesA.forEach((c) => {
			if (companiesB.some((b) => b.includes(c) || c.includes(b)))
				score += 5;
		});

		// Location overlap
		if (
			profileA.location &&
			profileB.location &&
			profileA.location.toLowerCase() === profileB.location.toLowerCase()
		) {
			score += 3;
		}

		// Education overlap
		if (
			profileA.education &&
			profileB.education &&
			profileA.education.toLowerCase() ===
				profileB.education.toLowerCase()
		) {
			score += 4;
		}

		return score;
	}

	function generateGraph() {
		const generatedNodes = [];
		const generatedEdges = [];
		const centerId = "center-node";

		// 1. Center Node (The User/Query)
		// We shift its internal offset slightly since SvelteFlow handles position as top-left
		generatedNodes.push({
			id: centerId,
			type: "center",
			position: { x: -100, y: -50 }, // roughly centering the center node
			data: { query: searchQuery, skills: extractedSkills },
		});

		// Track which profiles are matched
		const matchedIds = new Set(
			matchedHistory.map((m) => m.profile.id.toString()),
		);

		// 2. Score Profiles
		let profilesWithScores = filteredProfiles.map((profile: any) => {
			const id = profile.id.toString();
			const isMatched = matchedIds.has(id);

			let queryScore = 1;
			extractedSkills.forEach((skill) => {
				const sLower = skill.toLowerCase();
				if (
					profile.expertise?.some((e) =>
						e.toLowerCase().includes(sLower),
					)
				)
					queryScore += 3;
				if (profile.role?.toLowerCase().includes(sLower))
					queryScore += 5;
			});

			// Matched profiles get a massive boost so they sort to the very front
			const sortScore = isMatched ? 1000 + queryScore : queryScore;
			return { profile, score: queryScore, isMatched, sortScore };
		});

		// Sort by highest score first
		profilesWithScores.sort((a, b) => b.sortScore - a.sortScore);

		// 3. Ring Placement Algorithm
		let currentRadius = 250;
		let nodesInCurrentRing = 0;
		let maxNodesInCurrentRing = Math.max(
			5,
			Math.floor((2 * Math.PI * currentRadius) / 280),
		);

		profilesWithScores.forEach((item) => {
			if (nodesInCurrentRing >= maxNodesInCurrentRing) {
				// Ring is full, expand outwards to the next orbit
				currentRadius += 280;
				nodesInCurrentRing = 0;
				maxNodesInCurrentRing = Math.floor(
					(2 * Math.PI * currentRadius) / 280,
				);
			}

			// Calculate angle (evenly spaced around the current ring)
			const angle =
				(nodesInCurrentRing / maxNodesInCurrentRing) * 2 * Math.PI;

			// Top-left offset compensation for a ~220x100 node
			const x = Math.cos(angle) * currentRadius - 110;
			const y = Math.sin(angle) * currentRadius - 50;

			const id = item.profile.id.toString();

			generatedNodes.push({
				id,
				type: "profile",
				position: { x, y },
				data: {
					profile: item.profile,
					score: item.score,
					isMatched: item.isMatched,
				},
			});

			nodesInCurrentRing++;
		});

		// No edges returned
		return { generatedNodes, generatedEdges: [] };
	}

	let nodes = $state<any[]>([]);
	let edges = $state<any[]>([]);

	$effect(() => {
		const graph = generateGraph();
		nodes = graph.generatedNodes;
		edges = graph.generatedEdges;
	});
</script>

<div
	class="w-full h-full bg-[#0D0D12]"
	bind:clientWidth={containerWidth}
	bind:clientHeight={containerHeight}
>
	{#key matchedHistory.length}
		<SvelteFlow
			bind:nodes
			bind:edges
			{nodeTypes}
			onnodeclick={(...args: any[]) => {
				const e = args[0];
				const node = e?.detail?.node || e?.node || args[1];
				if (node && node.type === "profile") {
					selectedProfile = node.data.profile;
				}
			}}
			fitView
			minZoom={0.1}
			maxZoom={4}
			panOnDrag={!selectedProfile}
			nodesDraggable={!selectedProfile}
			nodesConnectable={!selectedProfile}
			elementsSelectable={!selectedProfile}
			proOptions={{ hideAttribution: true }}
			class="svelte-flow-dark"
		>
			<Background bgColor="#0D0D12" patternColor="#2A2A35" />
			<Controls />
		</SvelteFlow>
	{/key}
</div>

{#if selectedProfile && !showMatchModal}
	<div
		class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6"
		transition:fade
	>
		<button
			class="absolute top-6 right-6 text-gray-400 hover:text-white"
			onclick={() => (selectedProfile = null)}
		>
			<X size={32} />
		</button>

		<div
			class="relative w-full max-w-[460px] md:max-w-[560px] h-[70vh] min-h-[500px] z-10 perspective-1000"
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="absolute inset-0 rounded-[3rem] bg-[#2A2A35] shadow-2xl border border-[#FAF8F5]/10 select-none touch-none"
				style="
				transform: translate3d({$x}px, {$y}px, 0) rotate({$rotation}deg);
				transition: {isDragging ? 'none' : 'transform 0.3s ease-out'};
				"
				onpointerdown={handlePointerDown}
				onpointermove={handlePointerMove}
				onpointerup={handlePointerUp}
				onpointercancel={handlePointerUp}
			>
				<div
					class="relative w-full h-full bg-[#1A1A24] rounded-[3rem] overflow-auto custom-scrollbar"
				>
					<div
						class="absolute inset-0 bg-gradient-to-b from-[#1A1A24] to-[#0D0D12] rounded-[3rem] z-0 pointer-events-none"
					></div>

					<div
						class="relative z-20 flex flex-col justify-between h-full p-5 md:p-6 pointer-events-none"
					>
						<div
							class="flex flex-col items-center justify-center flex-1 text-center space-y-2"
						>
							<div>
								<p
									class="text-white font-mono text-xs uppercase tracking-widest mb-1 font-bold"
								>
									{selectedProfile.name}
								</p>
								<h2
									class="text-3xl md:text-4xl font-bold text-white leading-tight"
								>
									{selectedProfile.role}
								</h2>
							</div>

							<p
								class="text-gray-100 text-sm md:text-base leading-relaxed max-w-[380px] mx-auto mt-2 line-clamp-3 font-medium"
							>
								{selectedProfile.bio}
							</p>
						</div>

						<div
							class="w-full mt-auto pt-4 flex flex-col gap-3 shrink-0"
						>
							<div>
								<h3
									class="text-gray-400 font-bold text-xs uppercase tracking-widest font-mono mb-3 text-center"
								>
									Core Expertise
								</h3>
								<ul class="flex flex-wrap justify-center gap-2">
									{#each selectedProfile.expertise as skill}
										<li
											class="bg-[#2A2A35]/80 border border-[#FAF8F5]/10 rounded-full px-4 py-2 flex items-center gap-2 text-white shadow-sm"
										>
											<div
												class="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]"
											></div>
											<span
												class="font-bold text-xs md:text-sm tracking-wide"
												>{skill}</span
											>
										</li>
									{/each}
								</ul>
							</div>

							{#if selectedProfile.history}
								<div>
									<h3
										class="text-gray-400 font-bold text-xs uppercase tracking-widest font-mono mb-2 text-center"
									>
										Career History
									</h3>
									<ul class="flex flex-col gap-2">
										{#each selectedProfile.history as job}
											<li
												class="w-full bg-[#2A2A35]/80 border border-[#FAF8F5]/10 rounded-xl px-4 py-2 flex items-center justify-between shadow-sm"
											>
												<div
													class="flex flex-col text-left"
												>
													<span
														class="font-bold text-sm text-white"
														>{job.role}</span
													>
													<span
														class="text-gray-300 font-medium text-xs"
														>{job.company}</span
													>
												</div>
												<span
													class="text-[#8B5CF6] font-mono text-xs font-bold"
													>{job.years}</span
												>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						</div>
					</div>

					<!-- Swipe Indicators -->
					<div
						class="absolute top-10 left-10 z-20 border-4 border-red-500 text-red-500 rounded-xl px-6 py-2 font-bold text-3xl uppercase tracking-widest pointer-events-none"
						style="opacity: {Math.max(
							0,
							-$x / 100,
						)}; transform: rotate(-15deg);"
					>
						Pass
					</div>
					<div
						class="absolute top-10 right-10 z-20 border-4 border-[#8B5CF6] text-[#8B5CF6] rounded-xl px-6 py-2 font-bold text-3xl uppercase tracking-widest pointer-events-none"
						style="opacity: {Math.max(
							0,
							$x / 100,
						)}; transform: rotate(15deg);"
					>
						Match
					</div>
				</div>
			</div>
		</div>

		<div class="flex items-center gap-12 mt-8 shrink-0 z-50 relative">
			<button
				onclick={() => swipeButton(-1)}
				class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#2A2A35] flex items-center justify-center text-white hover:bg-white hover:text-[#0D0D12] transition-colors shadow-xl pointer-events-auto"
			>
				<X size={28} strokeWidth={3} />
			</button>
			<button
				onclick={() => swipeButton(1)}
				class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white hover:bg-white hover:text-[#0D0D12] transition-colors shadow-xl shadow-[#8B5CF6]/30 pointer-events-auto"
			>
				<Check size={28} strokeWidth={3} />
			</button>
		</div>
	</div>
{/if}

{#if showMatchModal}
	<div
		class="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
		transition:fade
	>
		<div
			class="bg-[#1A1A24] border border-[#2A2A35] rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-6 shadow-2xl relative text-center"
		>
			<button
				class="absolute top-4 right-4 text-gray-400 hover:text-white"
				onclick={() => (showMatchModal = false)}
			>
				<X size={24} />
			</button>
			<div
				class="w-20 h-20 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center mb-2"
			>
				<Check size={40} class="text-[#8B5CF6]" strokeWidth={3} />
			</div>
			<h2 class="text-3xl font-bold text-white font-serif italic">
				It's a Match!
			</h2>
			<p class="text-gray-400">You connected with {matchedName}</p>

			<div
				class="w-full bg-[#0D0D12] rounded-xl p-4 border border-[#2A2A35] mt-2"
			>
				<p
					class="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center justify-center gap-2"
				>
					<Phone size={14} /> Contact Number
				</p>
				<p
					class="text-[#FAF8F5] text-xl font-mono font-bold tracking-wider"
				>
					{matchedPhoneNumber}
				</p>
			</div>

			<button
				onclick={() => (showMatchModal = false)}
				class="w-full py-4 rounded-xl bg-[#8B5CF6] text-white font-bold hover:opacity-90 transition-opacity mt-2 tracking-wide shadow-lg shadow-[#8B5CF6]/20"
			>
				Keep Exploring
			</button>
		</div>
	</div>
{/if}

<style>
	:global(.svelte-flow-dark) {
		--xy-edge-stroke-default: #3a3a45;
	}
</style>
