<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/icon.png';
	import Background from '$lib/components/ui/Background.svelte';
	import Navbar from '$lib/components/layout/Navbar.svelte';

	let { children } = $props();
</script>

<Background />
<Navbar />

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="คิดไม่ออก" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://sorting-match.space/" />
	<meta property="og:title" content="Sorting Match" />
	<meta property="og:description" content="คิดไม่ออก" />
	<meta property="og:image" content="https://sorting-match.space/images/og-image.jpg" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://sorting-match.space/" />
	<meta name="twitter:title" content="Sorting Match" />
	<meta name="twitter:description" content="คิดไม่ออก" />
	<meta name="twitter:image" content="https://sorting-match.space/images/og-image.jpg" />
</svelte:head>
{@render children()}
