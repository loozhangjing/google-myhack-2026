<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { Phone } from 'lucide-svelte';

	let { data } = $props();
	
	// data has: profile, score, isMatched
	let profile = data.profile;
	let score = data.score || 1;
	let isMatched = data.isMatched || false;

	// Scale and border calculation based on score
	let scale = Math.max(0.6, Math.min(0.6 + (score / 15), 1.6)); // wider range, 0.6x to 1.6x
	let brightness = Math.max(0.1, Math.min(score / 10, 1.0)); // wider range, 0.1 to 1.0
	
	let borderColor = isMatched ? '#8B5CF6' : `rgba(201, 168, 76, ${brightness})`;
	let shadowColor = isMatched ? 'rgba(139, 92, 246, 0.6)' : `rgba(201, 168, 76, ${brightness * 0.6})`;
</script>

<div 
	class="relative bg-[#1A1A24] rounded-2xl flex flex-col p-3 transition-transform cursor-grab active:cursor-grabbing"
	style="
		width: 220px; 
		transform: scale({scale}); 
		border: 2px solid {borderColor};
		box-shadow: 0 4px 20px {shadowColor};
	"
>
	<Handle type="target" position={Position.Top} style="opacity: 0;" />
	
	<div class="flex flex-col gap-1 text-center items-center">
		{#if isMatched}
			<div class="absolute -top-3 -right-3 w-6 h-6 bg-[#8B5CF6] rounded-full flex items-center justify-center shadow-lg shadow-[#8B5CF6]/50">
				<Phone size={12} class="text-white" />
			</div>
		{/if}

		<p class="text-white font-bold text-sm truncate w-full">{profile.name}</p>
		<p class="text-gray-400 text-xs truncate w-full mb-2">{profile.role}</p>

		<div class="flex flex-wrap gap-1 justify-center max-h-12 overflow-hidden">
			{#each profile.expertise.slice(0, 3) as skill}
				<span class="text-[10px] px-2 py-0.5 bg-[#2A2A35] text-gray-300 rounded-full border border-[#FAF8F5]/10">
					{skill}
				</span>
			{/each}
			{#if profile.expertise.length > 3}
				<span class="text-[10px] px-1 py-0.5 text-gray-500">+{profile.expertise.length - 3}</span>
			{/if}
		</div>
	</div>

	<Handle type="source" position={Position.Bottom} style="opacity: 0;" />
</div>
