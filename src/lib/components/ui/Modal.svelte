<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	let {
		title,
		description,
		glowColor = 'bg-blue-500',
		maxWidth = 'max-w-sm',
		children
	} = $props<{
		title: string;
		description?: string;
		glowColor?: string;
		maxWidth?: 'max-w-sm' | 'max-w-md' | 'max-w-lg';
		children: Snippet;
	}>();
</script>

<div transition:fade={{ duration: 100 }} class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
	<div transition:scale={{ start: 0.95, duration: 300 }} class="w-full {maxWidth} relative rounded-4xl border border-white/10 bg-neutral-950 p-6 shadow-2xl">
		<div class="absolute -top-20 -right-20 h-40 w-40 rounded-full blur-[80px] {glowColor}"></div>

		<h3 class="relative z-10 mb-2 text-xl font-black text-white">{title}</h3>

		{#if description}
			<p class="relative z-10 mb-6 text-sm font-medium text-zinc-400">{description}</p>
		{/if}

		<div class="relative z-10 flex flex-col gap-4">
			{@render children()}
		</div>
	</div>
</div>
