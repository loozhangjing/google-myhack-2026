<script lang='ts'>
	import { onMount } from 'svelte';

	let domElement: HTMLSpanElement;
	let { fragment } = $props();

	onMount(() => {
		domElement.innerHTML = fragment;
	});
</script>

<span bind:this={domElement}></span>
