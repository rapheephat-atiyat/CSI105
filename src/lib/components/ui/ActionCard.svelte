<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		colorClass = 'blue',
		onClick,
		icon
	} = $props<{
		title: string;
		description?: string;
		colorClass?: 'blue' | 'indigo' | 'emerald';
		onClick?: () => void;
		icon?: Snippet;
	}>();

	const CONFIG_VARIANTS = {
		blue: {
			cardBorder: 'border-blue-500/20',
			cardBg: 'bg-blue-950/20',
			hoverBorder: 'hover:border-blue-400/40',
			hoverBg: 'hover:bg-blue-900/30',
			hoverShadow: 'hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]',
			glow: 'bg-blue-600/20 group-hover:bg-blue-500/40',
			iconBox: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
		},
		indigo: {
			cardBorder: 'border-indigo-500/20',
			cardBg: 'bg-indigo-950/20',
			hoverBorder: 'hover:border-indigo-400/40',
			hoverBg: 'hover:bg-indigo-900/30',
			hoverShadow: 'hover:shadow-[0_0_40px_rgba(79,70,229,0.15)]',
			glow: 'bg-indigo-600/20 group-hover:bg-indigo-500/40',
			iconBox: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
		},
		emerald: {
			cardBorder: 'border-emerald-500/20',
			cardBg: 'bg-emerald-950/20',
			hoverBorder: 'hover:border-emerald-400/40',
			hoverBg: 'hover:bg-emerald-900/30',
			hoverShadow: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]',
			glow: 'bg-emerald-600/20 group-hover:bg-emerald-500/40',
			iconBox: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
		}
	};

	let config = $derived(CONFIG_VARIANTS[colorClass as keyof typeof CONFIG_VARIANTS]);
</script>

<button
	onclick={onClick}
	class="group relative flex flex-col items-start gap-4 overflow-hidden rounded-3xl border sm:rounded-4xl {config.cardBorder} {config.cardBg}
        p-6 text-left transition-all duration-300 hover:-translate-y-1 sm:p-8
        {config.hoverBorder} {config.hoverBg} {config.hoverShadow} opacity-90 hover:opacity-100"
>
	<div class="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl transition-all duration-300 {config.glow}"></div>
	<div class="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-inner transition-transform duration-300 group-hover:scale-110 sm:h-14 sm:w-14 {config.iconBox}">
		{@render icon()}
	</div>
	<div class="relative z-10 mt-2">
		<h3 class="text-lg font-bold text-white sm:text-xl">{title}</h3>
		<p class="text-xs text-zinc-400/80 sm:text-sm">{description}</p>
	</div>
</button>
