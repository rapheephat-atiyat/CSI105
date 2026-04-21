<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface SelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'bind:value'> {
		label: string;
		options?: { value: any; label?: string }[];
		value?: any;
		flavor?: 'blue' | 'indigo' | 'emerald' | 'red';
		cClass?: string;
		sClass?: string;
	}

	let { label, options = [], value = $bindable(), flavor = 'blue', cClass = '', sClass = '', ...restProps }: SelectProps = $props();

	const id = crypto.randomUUID();

	let isOpen = $state(false);

	const FLAVORS = {
		blue: 'focus:border-blue-500 focus:ring-blue-500',
		indigo: 'focus:border-indigo-500 focus:ring-indigo-500',
		emerald: 'focus:border-emerald-500 focus:ring-emerald-500',
		red: 'focus:border-red-500 focus:ring-red-500'
	};

	const FLAVOR_BG = {
		blue: 'bg-blue-500/20 text-blue-400',
		indigo: 'bg-indigo-500/20 text-indigo-400',
		emerald: 'bg-emerald-500/20 text-emerald-400',
		red: 'bg-red-500/20 text-red-400'
	};

	let flavorClass = $derived(`w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 transition-all flex items-center justify-between ${FLAVORS[flavor]} ${sClass}`);

	let selectedLabel = $derived(options.find((opt) => opt.value === value)?.label ?? options.find((opt) => opt.value === value)?.value ?? 'Select...');

	function handleSelect(optValue: any) {
		value = optValue;
		isOpen = false;
	}
</script>

<div class="relative flex flex-col gap-1.5 {cClass}" {...restProps}>
	<label for={id} class="text-xs font-bold text-zinc-400">{label}</label>

	<div class="relative">
		<button {id} type="button" class={flavorClass} onclick={() => (isOpen = !isOpen)}>
			<span class="truncate">{selectedLabel}</span>
			<svg class="h-4 w-4 fill-current text-zinc-400 transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
				<path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
			</svg>
		</button>

		{#if isOpen}
			<button type="button" class="fixed inset-0 z-40 h-full w-full cursor-default bg-transparent" onclick={() => (isOpen = false)} aria-label="Close selection"></button>

			<ul class="custom-scrollbar absolute top-full z-50 mt-1.5 max-h-60 w-full overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-[#121212] py-1.5 shadow-xl shadow-black/60 focus:outline-none" role="listbox">
				{#each options as opt}
					<li role="presentation">
						<button type="button" class="w-full cursor-pointer px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors select-none hover:bg-white/10 hover:text-white {value === opt.value ? FLAVOR_BG[flavor] + ' font-medium' : ''}" onclick={() => handleSelect(opt.value)} role="option" aria-selected={value === opt.value}>
							{opt.label ?? opt.value}
						</button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
		margin-top: 8px;
		margin-bottom: 8px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: #52525b;
		border-radius: 10px;
	}
</style>
