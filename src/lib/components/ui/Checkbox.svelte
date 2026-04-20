<script lang="ts">
	let {
		label,
		checked = $bindable(false),
		flavor = 'blue',
		class: className = ''
	}: {
		label: string;
		checked: boolean;
		flavor: 'blue' | 'indigo' | 'emerald';
		class?: HTMLDivElement['className'];
	} = $props();

	const FLAVORS = {
		blue: 'text-blue-600 focus:ring-blue-500',
		indigo: 'text-indigo-600 focus:ring-indigo-500',
		emerald: 'text-emerald-600 focus:ring-emerald-500',
		red: 'text-red-600 focus:ring-red-500'
	};
</script>

<div class="flex items-center gap-3 {className}">
	<input type="checkbox" bind:checked class="h-4 w-4 rounded border-gray-700 bg-gray-900 transition-colors {FLAVORS[flavor as keyof typeof FLAVORS]}" />
	<label for="checkbox" class="cursor-pointer text-sm font-medium text-white select-none">{label}</label>
</div>
