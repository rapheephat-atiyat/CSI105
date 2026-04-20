<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		flavor = 'blue',
		class: className = ''
	} = $props<{
		children: Snippet;
		flavor: 'blue' | 'indigo' | 'emerald';
		class?: HTMLSpanElement['className'];
	}>();

	const flavors = {
		blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
		indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
		emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
		red: 'bg-red-500/10 border-red-500/20 text-red-400',
		zinc: 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
	};
</script>

<span class="rounded-lg border px-3 py-1 {flavors[flavor as keyof typeof flavors]} {className}">
	{@render children()}
</span>
