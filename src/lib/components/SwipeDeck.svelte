<script>
	import { spring } from "svelte/motion";
	import { fade, fly } from "svelte/transition";
	import { X, Check, Phone, Users, History } from "lucide-svelte";

	let { initialProfiles = [], matchedHistory = $bindable([]) } = $props();

	let profiles = $state([...initialProfiles]);

	let x = spring(0, { stiffness: 0.1, damping: 0.4 });
	let y = spring(0, { stiffness: 0.1, damping: 0.4 });
	let rotation = spring(0, { stiffness: 0.1, damping: 0.4 });

	let isDragging = $state(false);
	let startX = 0;
	let startY = 0;

	let showMatchModal = $state(false);
	let matchedPhoneNumber = $state("");
	let matchedName = $state("");

	let showHistory = $state(false);
	let selectedHistoryProfile = $state(null);

	function generatePhoneNumber() {
		return `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
	}

	function handlePointerDown(e) {
		if (showMatchModal || selectedHistoryProfile || profiles.length === 0) return;
		isDragging = true;
		startX = e.clientX;
		startY = e.clientY;
		e.target.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e) {
		if (showMatchModal || selectedHistoryProfile || !isDragging) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		x.set(dx);
		y.set(dy);
		rotation.set(dx * 0.05);
	}

	function handlePointerUp(e) {
		if (showMatchModal || selectedHistoryProfile || !isDragging) return;
		isDragging = false;
		const currentX = $x;

		if (Math.abs(currentX) > window.innerWidth * 0.25) {
			const direction = currentX > 0 ? 1 : -1;
			x.set(window.innerWidth * direction);

			setTimeout(() => {
				let currentProfile = profiles[0];
				profiles = [...profiles.slice(1), currentProfile];
				x.set(0, { hard: true });
				y.set(0, { hard: true });
				rotation.set(0, { hard: true });

				if (direction === 1) {
					matchedName = currentProfile.name;
					matchedPhoneNumber = generatePhoneNumber();
					matchedHistory.push({
						profile: currentProfile,
						name: currentProfile.name,
						role: currentProfile.role,
						phone: matchedPhoneNumber
					});
					showMatchModal = true;
				}
			}, 300);
		} else {
			x.set(0);
			y.set(0);
			rotation.set(0);
		}
	}

	function swipeButton(direction) {
		if (showMatchModal || selectedHistoryProfile || profiles.length === 0) return;
		x.set(window.innerWidth * direction);
		setTimeout(() => {
			let currentProfile = profiles[0];
			profiles = [...profiles.slice(1), currentProfile];
			x.set(0, { hard: true });
			y.set(0, { hard: true });
			rotation.set(0, { hard: true });

			if (direction === 1) {
				matchedName = currentProfile.name;
				matchedPhoneNumber = generatePhoneNumber();
				matchedHistory.push({
					profile: currentProfile,
					name: currentProfile.name,
					role: currentProfile.role,
					phone: matchedPhoneNumber
				});
				showMatchModal = true;
			}
		}, 300);
	}

	function handleKeydown(e) {
		if (showMatchModal || selectedHistoryProfile) return;
		if (e.key === "ArrowLeft") {
			swipeButton(-1);
		} else if (e.key === "ArrowRight") {
			swipeButton(1);
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<section
	id="deck"
	class="w-full h-[100dvh] pt-16 pb-8 flex flex-col items-center relative overflow-hidden bg-[#0D0D12]"
>
	<button 
		onclick={() => showHistory = !showHistory}
		class="absolute top-6 right-6 z-40 bg-[#1A1A24]/80 backdrop-blur-md p-3 rounded-full border border-[#2A2A35] hover:border-gray-400 text-white shadow-xl transition-all"
	>
		<History size={24} />
		{#if matchedHistory.length > 0}
			<span class="absolute -top-1 -right-1 bg-[#8B5CF6] text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
				{matchedHistory.length}
			</span>
		{/if}
	</button>

	<div
		class="relative w-full max-w-[460px] md:max-w-[560px] flex-1 min-h-0 z-10 perspective-1000"
	>
		{#each profiles as profile, i (profile.id)}
			{@const isTop = i === 0}
			{@const scale = isTop ? 1 : 1 - i * 0.05}
			{@const translateY = isTop ? 0 : i * 20}
			{@const zIndex = profiles.length - i}
			{@const opacity = i < 3 ? 1 : 0}

			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="absolute inset-0 rounded-[3rem] bg-[#2A2A35] shadow-2xl border border-[#FAF8F5]/10 select-none touch-none"
				style="
		  z-index: {zIndex};
		  opacity: {opacity};
		  transform: {isTop
					? `translate3d(${$x}px, ${$y}px, 0) rotate(${$rotation}deg)`
					: `translate3d(0, ${translateY}px, 0) scale(${scale})`};
		  transition: {isTop && isDragging ? 'none' : 'transform 0.3s ease-out'};
		"
				onpointerdown={isTop ? handlePointerDown : null}
				onpointermove={isTop ? handlePointerMove : null}
				onpointerup={isTop ? handlePointerUp : null}
				onpointercancel={isTop ? handlePointerUp : null}
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
									{profile.name}
								</p>
								<h2
									class="text-3xl md:text-4xl font-bold text-white leading-tight"
								>
									{profile.role}
								</h2>
							</div>

							<p
								class="text-gray-100 text-sm md:text-base leading-relaxed max-w-[380px] mx-auto mt-2 line-clamp-3 font-medium"
							>
								{profile.bio}
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
									{#each profile.expertise as skill}
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

							{#if profile.history}
								<div>
									<h3
										class="text-gray-400 font-bold text-xs uppercase tracking-widest font-mono mb-2 text-center"
									>
										Career History
									</h3>
									<ul class="flex flex-col gap-2">
										{#each profile.history as job}
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
					{#if isTop}
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
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="flex items-center gap-12 mt-8 shrink-0 z-10 relative">
		<button
			onclick={() => swipeButton(-1)}
			class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#2A2A35] flex items-center justify-center text-white hover:bg-white hover:text-[#0D0D12] transition-colors shadow-xl"
		>
			<X size={28} strokeWidth={3} />
		</button>
		<button
			onclick={() => swipeButton(1)}
			class="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white hover:bg-white hover:text-[#0D0D12] transition-colors shadow-xl shadow-[#8B5CF6]/30"
		>
			<Check size={28} strokeWidth={3} />
		</button>
	</div>
</section>

{#if showMatchModal}
	<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" transition:fade>
		<div class="bg-[#1A1A24] border border-[#2A2A35] rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-6 shadow-2xl relative text-center">
			<button class="absolute top-4 right-4 text-gray-400 hover:text-white" onclick={() => showMatchModal = false}>
				<X size={24} />
			</button>
			<div class="w-20 h-20 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center mb-2">
				<Check size={40} class="text-[#8B5CF6]" strokeWidth={3} />
			</div>
			<h2 class="text-3xl font-bold text-white font-serif italic">It's a Match!</h2>
			<p class="text-gray-400">You connected with {matchedName}</p>
			
			<div class="w-full bg-[#0D0D12] rounded-xl p-4 border border-[#2A2A35] mt-2">
				<p class="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1 flex items-center justify-center gap-2">
					<Phone size={14} /> Contact Number
				</p>
				<p class="text-[#FAF8F5] text-xl font-mono font-bold tracking-wider">{matchedPhoneNumber}</p>
			</div>

			<button 
				onclick={() => showMatchModal = false}
				class="w-full py-4 rounded-xl bg-[#8B5CF6] text-white font-bold hover:opacity-90 transition-opacity mt-2 tracking-wide shadow-lg shadow-[#8B5CF6]/20"
			>
				Keep Swiping
			</button>
		</div>
	</div>
{/if}

{#if showHistory}
	<div 
		class="fixed top-0 right-0 h-[100dvh] w-80 sm:w-96 bg-[#1A1A24] border-l border-[#2A2A35] shadow-2xl z-50 flex flex-col"
		transition:fly={{ x: 384, duration: 300 }}
	>
		<div class="p-6 border-b border-[#2A2A35] flex items-center justify-between">
			<h2 class="text-xl font-bold text-white tracking-wide flex items-center gap-2">
				<Users size={20} class="text-[#8B5CF6]" />
				Match History
			</h2>
			<button onclick={() => showHistory = false} class="text-gray-400 hover:text-white transition-colors">
				<X size={24} />
			</button>
		</div>
		<div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
			{#if matchedHistory.length === 0}
				<div class="text-center text-gray-500 mt-10 text-sm font-mono border border-dashed border-[#2A2A35] p-6 rounded-2xl">
					No matches yet.<br />Keep swiping to build your network!
				</div>
			{/if}
			{#each matchedHistory as match}
				<button 
					onclick={() => selectedHistoryProfile = match}
					class="bg-[#2A2A35]/50 border border-[#FAF8F5]/10 rounded-2xl p-4 flex flex-col gap-3 shadow-lg text-left hover:bg-[#2A2A35] hover:border-[#8B5CF6]/50 transition-all cursor-pointer w-full"
				>
					<div>
						<h3 class="text-white font-bold text-lg">{match.name}</h3>
						<p class="text-xs text-gray-400 mt-1 line-clamp-1">{match.role}</p>
					</div>
					<div class="bg-[#0D0D12] rounded-xl p-3 flex items-center gap-3 w-full">
						<div class="w-8 h-8 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0">
							<Phone size={14} class="text-[#8B5CF6]" />
						</div>
						<span class="text-[#FAF8F5] text-sm font-mono tracking-wider">{match.phone}</span>
					</div>
				</button>
			{/each}
		</div>
	</div>
{/if}

{#if selectedHistoryProfile}
	<div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6" transition:fade>
		<div class="bg-[#1A1A24] border border-[#2A2A35] rounded-3xl p-8 max-w-2xl w-full flex flex-col gap-6 shadow-2xl relative">
			<button class="absolute top-6 right-6 text-gray-400 hover:text-white" onclick={() => selectedHistoryProfile = null}>
				<X size={24} />
			</button>
			
			<div>
				<div class="flex items-center justify-between mb-2 pr-8">
					<h2 class="text-3xl font-bold text-white">{selectedHistoryProfile.name}</h2>
					<div class="flex items-center gap-2 bg-[#8B5CF6]/20 px-3 py-1.5 rounded-full border border-[#8B5CF6]/30">
						<Phone size={14} class="text-[#8B5CF6]" />
						<span class="text-[#FAF8F5] text-sm font-mono font-bold tracking-wider">{selectedHistoryProfile.phone}</span>
					</div>
				</div>
				<h3 class="text-xl text-gray-400">{selectedHistoryProfile.role}</h3>
			</div>

			<div class="text-lg text-gray-300 leading-relaxed border-l-4 border-[#2A2A35] pl-4 max-h-[30vh] overflow-y-auto custom-scrollbar">
				{selectedHistoryProfile.profile.bio}
			</div>

			<div>
				<h3 class="text-gray-400 font-bold text-xs uppercase tracking-widest font-mono mb-3">Core Expertise</h3>
				<div class="flex flex-wrap gap-2">
					{#each selectedHistoryProfile.profile.expertise as exp}
						<span class="px-3 py-1 bg-[#2A2A35] border border-[#FAF8F5]/10 text-gray-300 rounded-full text-sm">{exp}</span>
					{/each}
				</div>
			</div>
			
			{#if selectedHistoryProfile.profile.history && selectedHistoryProfile.profile.history.length > 0}
			<div>
				<h3 class="text-gray-400 font-bold text-xs uppercase tracking-widest font-mono mb-3">Career History</h3>
				<div class="flex flex-col gap-2 max-h-[25vh] overflow-y-auto custom-scrollbar pr-2">
					{#each selectedHistoryProfile.profile.history as job}
						<div class="bg-[#0D0D12] border border-[#2A2A35] rounded-xl p-4 flex items-center justify-between">
							<div class="flex flex-col text-left">
								<span class="font-bold text-white">{job.role}</span>
								<span class="text-gray-400 text-sm">{job.company}</span>
							</div>
							<span class="text-[#8B5CF6] font-mono text-sm font-bold">{job.years}</span>
						</div>
					{/each}
				</div>
			</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
		border-radius: 10px;
		margin-block: 1rem;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(139, 92, 246, 0.3); /* Subtle purple thumb */
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(139, 92, 246, 0.6);
	}
</style>
