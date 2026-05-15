<script lang='ts'>
	import PromptResponseFragment from './PromptResponseFragment.svelte';
	import PromptResponseSeparator from './PromptResponseSeparator.svelte';

	import { mount, unmount } from 'svelte';
	import { GoogleGenAI } from '@google/genai';
	import { marked } from 'marked';
	import { Progress } from '@skeletonlabs/skeleton-svelte';

	let promptResponseContainer: HTMLDivElement;
	let inputElement: HTMLInputElement;
	let prompt: string;

	const MODEL = 'gemini-2.5-flash';
	const GEMINI_API_KEY = 'AIzaSyC3OoS1IwvfljJRcbMSvPBOHzfEduwIFQ0';

	const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

	async function submitPrompt(event: SubmitEvent) {
		event.preventDefault();
		inputElement.value = '';

		const loadingIndicator = mount(PromptResponseFragment, {
			target: promptResponseContainer,
			props: { fragment: marked.parse('*Thinking...*') }
		});

		const response = await ai.models.generateContentStream({
			model: MODEL,
			contents: prompt,
		});

		unmount(loadingIndicator);

		for await (const chunk of response) {
			if (chunk === undefined) continue;

			mount(PromptResponseFragment, {
				target: promptResponseContainer,
				props: { fragment: marked.parse(chunk.text) }
			});
		}

		mount(PromptResponseSeparator, { target: promptResponseContainer });
	}
</script>

<h2 class='h2'>Gemini</h2>
<div bind:this={promptResponseContainer} class='overflow-auto flex-grow-2'>
</div>
<form onsubmit={submitPrompt}>
	<input type='text' placeholder='Ask Gemini' bind:this={inputElement} bind:value={prompt} class='input'>
</form>
