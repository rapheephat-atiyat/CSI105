<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface ButtonProps extends HTMLButtonAttributes {
		children?: Snippet;
		variant?: 'primary' | 'success' | 'danger' | 'indigo' | 'secondary' | 'ghost-blue';
		class?: HTMLButtonElement['className'];
	}

	let { children, variant = 'primary', class: className = '', ...props }: ButtonProps = $props();

	const VARAINT_STYLES = {
		primary: 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
		success: 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
		danger: 'bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]',
		indigo: 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]',
		secondary: 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white',
		'ghost-blue': 'bg-blue-950/20 border border-blue-500/20 text-white hover:bg-blue-900/30 hover:border-blue-400/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95'
	};

	let finalClass = $derived(`rounded-xl px-4 py-3 text-sm font-bold transition-all ${VARAINT_STYLES[variant]} ${className}`);
</script>

<button class={finalClass} {...props}>
	{#if children}
		{@render children()}
	{/if}
</button>
