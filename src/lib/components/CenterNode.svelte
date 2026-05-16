<script lang="ts">
	import { Handle, Position } from '@xyflow/svelte';
	import { UserRound } from 'lucide-svelte';

	let { data } = $props();
	
	// data has: query, skills
	let query = data.query || "Your Query";
	let skills = data.skills || [];
</script>

<div class="relative flex flex-col items-center justify-center p-6 bg-[#0D0D12] border border-[#2A2A35] rounded-full shadow-[0_0_40px_rgba(201,168,76,0.3)] z-50 min-w-[180px] max-w-[250px] text-center">
	<Handle type="source" position={Position.Right} style="opacity: 0;" />
	<Handle type="target" position={Position.Left} style="opacity: 0;" />
	
	<div class="w-12 h-12 bg-[#2A2A35] rounded-full flex items-center justify-center text-[#C9A84C] mb-3">
		<UserRound size={24} />
	</div>
	
	<h3 class="text-white font-bold text-lg mb-1 leading-tight line-clamp-2">{query}</h3>
	
	{#if skills.length > 0}
		<p class="text-xs text-[#C9A84C] font-mono tracking-wider">{skills.length} Required Skills</p>
	{/if}
</div>
