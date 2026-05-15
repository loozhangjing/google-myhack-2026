<script lang='ts'>
	import Gemini from '$lib/Gemini.svelte';
</script>

<div class="card">
	<Gemini />
</div>

<style>
	:global(body) {
		height: 100vh;
	}
	.card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		padding: 50px;
	}
</style>
