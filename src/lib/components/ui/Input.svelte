<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface InputProps extends Omit<HTMLInputAttributes, 'bind:value'> {
		label?: string;
		value?: string;
		flavor?: 'blue' | 'indigo' | 'emerald' | 'red';
		containerClass?: string;
		inputClass?: string;
	}

	let { label, value = $bindable(''), flavor = 'blue', containerClass = '', inputClass = '', ...restProps }: InputProps = $props();

	const focusStyles = {
		blue: 'focus:border-blue-500 focus:ring-blue-500',
		indigo: 'focus:border-indigo-500 focus:ring-indigo-500',
		emerald: 'focus:border-emerald-500 focus:ring-emerald-500',
		red: 'focus:border-red-500 focus:ring-red-500'
	};

	let finalClass = $derived(`w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${focusStyles[flavor]} ${inputClass}`);
</script>

<div class="flex flex-col gap-1.5 {containerClass}">
	{#if label}
		<label for="input" class="text-xs font-bold text-zinc-400">{label}</label>
	{/if}
	<input id="input" bind:value class={finalClass} {...restProps} />
</div>
