<script lang="ts">
	import { SvelteFlow, Background, Controls } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';

	import ProfileNode from './ProfileNode.svelte';
	import CenterNode from './CenterNode.svelte';

	let { filteredProfiles = [], extractedSkills = [], matchedHistory = [], searchQuery = "", onNodeClick } = $props();

	// Convert properties into reactive SvelteFlow structures
	const nodeTypes = {
		profile: ProfileNode,
		center: CenterNode
	};

	let containerWidth = $state(800);
	let containerHeight = $state(600);

	function calculateSimilarity(profileA: any, profileB: any) {
		let score = 0;
		// Skill overlap
		const skillsA = profileA.expertise?.map(s => s.toLowerCase()) || [];
		const skillsB = profileB.expertise?.map(s => s.toLowerCase()) || [];
		skillsA.forEach(s => {
			if (skillsB.some(b => b.includes(s) || s.includes(b))) score += 2;
		});
		
		// Experience (Company) overlap
		const companiesA = profileA.history?.map(h => h.company.toLowerCase()) || [];
		const companiesB = profileB.history?.map(h => h.company.toLowerCase()) || [];
		companiesA.forEach(c => {
			if (companiesB.some(b => b.includes(c) || c.includes(b))) score += 5;
		});

		// Location overlap
		if (profileA.location && profileB.location && profileA.location.toLowerCase() === profileB.location.toLowerCase()) {
			score += 3;
		}

		// Education overlap
		if (profileA.education && profileB.education && profileA.education.toLowerCase() === profileB.education.toLowerCase()) {
			score += 4;
		}

		return score;
	}

	function generateGraph() {
		const generatedNodes = [];
		const generatedEdges = [];
		const centerId = 'center-node';

		// 1. Center Node (The User/Query)
		// We shift its internal offset slightly since SvelteFlow handles position as top-left
		generatedNodes.push({
			id: centerId,
			type: 'center',
			position: { x: -100, y: -50 }, // roughly centering the center node
			data: { query: searchQuery, skills: extractedSkills }
		});

		// Track which profiles are matched
		const matchedIds = new Set(matchedHistory.map(m => m.profile.id.toString()));

		// 2. Score Profiles
		let profilesWithScores = filteredProfiles.map((profile: any) => {
			const id = profile.id.toString();
			const isMatched = matchedIds.has(id);
			
			let queryScore = 1;
			extractedSkills.forEach(skill => {
				const sLower = skill.toLowerCase();
				if (profile.expertise?.some(e => e.toLowerCase().includes(sLower))) queryScore += 3;
				if (profile.role?.toLowerCase().includes(sLower)) queryScore += 5;
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
		let maxNodesInCurrentRing = Math.max(5, Math.floor((2 * Math.PI * currentRadius) / 280)); 

		profilesWithScores.forEach((item) => {
			if (nodesInCurrentRing >= maxNodesInCurrentRing) {
				// Ring is full, expand outwards to the next orbit
				currentRadius += 280;
				nodesInCurrentRing = 0;
				maxNodesInCurrentRing = Math.floor((2 * Math.PI * currentRadius) / 280);
			}

			// Calculate angle (evenly spaced around the current ring)
			const angle = (nodesInCurrentRing / maxNodesInCurrentRing) * 2 * Math.PI;
			
			// Top-left offset compensation for a ~220x100 node
			const x = Math.cos(angle) * currentRadius - 110;
			const y = Math.sin(angle) * currentRadius - 50;

			const id = item.profile.id.toString();

			generatedNodes.push({
				id,
				type: 'profile',
				position: { x, y },
				data: { profile: item.profile, score: item.score, isMatched: item.isMatched }
			});

			nodesInCurrentRing++;
		});

		// No edges returned
		return { generatedNodes, generatedEdges: [] };
	}

	// Calculate statically during initialization
	const { generatedNodes: nodes, generatedEdges: edges } = generateGraph();
</script>

<div class="w-full h-full bg-[#0D0D12]" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
	<SvelteFlow
		{nodes}
		{edges}
		{nodeTypes}
		onnodeclick={(event, node) => {
			if (node.type === 'profile' && onNodeClick) {
				onNodeClick(node.data.profile);
			}
		}}
		fitView
		minZoom={0.1}
		maxZoom={4}
		proOptions={{ hideAttribution: true }}
		class="svelte-flow-dark"
	>
		<Background bgColor="#0D0D12" patternColor="#2A2A35" />
		<Controls />
	</SvelteFlow>
</div>

<style>
	:global(.svelte-flow-dark) {
		--xy-edge-stroke-default: #3A3A45;
	}
</style>
