<script>
	import { spring } from "svelte/motion";
	import { X, Check } from "lucide-svelte";

	let { initialProfiles = [] } = $props();

	let profiles = $state([...initialProfiles]);

	let x = spring(0, { stiffness: 0.1, damping: 0.4 });
	let y = spring(0, { stiffness: 0.1, damping: 0.4 });
	let rotation = spring(0, { stiffness: 0.1, damping: 0.4 });

	let isDragging = false;
	let startX = 0;
	let startY = 0;

	function handlePointerDown(e) {
		if (profiles.length === 0) return;
		isDragging = true;
		startX = e.clientX;
		startY = e.clientY;
		e.target.setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e) {
		if (!isDragging) return;
		const dx = e.clientX - startX;
		const dy = e.clientY - startY;
		x.set(dx);
		y.set(dy);
		rotation.set(dx * 0.05);
	}

	function handlePointerUp(e) {
		if (!isDragging) return;
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
			}, 300);
		} else {
			x.set(0);
			y.set(0);
			rotation.set(0);
		}
	}

	function swipeButton(direction) {
		x.set(window.innerWidth * direction);
		setTimeout(() => {
			let currentProfile = profiles[0];
			profiles = [...profiles.slice(1), currentProfile];
			x.set(0, { hard: true });
			y.set(0, { hard: true });
			rotation.set(0, { hard: true });
		}, 300);
	}

	function handleKeydown(e) {
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
