<script>
	import { page } from '$app/stores';
	import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-svelte';
</script>

<svelte:head>
	<title>{$page.status} — System Error</title>
</svelte:head>

<div class="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
	<div class="relative z-10 flex w-full max-w-lg flex-col items-center">
		<div class="relative mb-8">
			<h1 class="text-[10rem] leading-none font-black tracking-tighter text-white opacity-5">
				{$page.status}
			</h1>
			<div class="absolute inset-0 flex items-center justify-center">
				<div class="flex flex-col items-center gap-2">
					<AlertCircle class="size-20 text-blue-500" />
				</div>
			</div>
		</div>

		<div class="text-center">
			<h2 class="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
				{$page.status === 404 ? 'Lost in Space?' : 'System Override'}
			</h2>
			<p class="mx-auto mb-10 max-w-sm text-lg leading-relaxed text-zinc-400">
				{$page.error?.message || 'The request could not be processed by the core matrix. Please re-calibrate your connection.'}
			</p>
		</div>

		<div class="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
			<a href="/" class="group flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all hover:bg-zinc-200 active:scale-95">
				<ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
				Back to Home
			</a>

			<button onclick={() => window.location.reload()} class="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10 active:scale-95">
				<RefreshCw class="h-4 w-4" />
				Retry Signal
			</button>
		</div>

		<div class="mt-12 flex items-center gap-2 rounded-full border border-white/5 bg-white/2 px-4 py-1.5">
			<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"></div>
			<span class="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
				Trace ID: {Math.random().toString(36).substring(7).toUpperCase()}
			</span>
		</div>
	</div>
</div>
