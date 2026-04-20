<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Background from '$lib/components/ui/Background.svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';

	let { children } = $props();
</script>

<Background />
<Navbar />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
