<script>
	import { PUBLIC_APP_NAME } from '$env/static/public';
	import FeatureCards from '$lib/components/home/FeatureCards.svelte';
	import Hero from '$lib/components/home/Hero.svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';
	import Background from '$lib/components/ui/Background.svelte';
</script>

<svelte:head>
	<title>{PUBLIC_APP_NAME || 'Sorting Match'}</title>
</svelte:head>

<div class="flex min-h-screen flex-col">
	<Hero />
	<FeatureCards />
</div>
