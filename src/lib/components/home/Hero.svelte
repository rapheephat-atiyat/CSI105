<script>
	import { Cpu } from 'lucide-svelte';

	const bars = [30, 45, 65, 90, 100, 90, 65, 45, 30];
	const matrix = [
		{ name: 'Bubble Sort', best: 'O(n)', avg: 'Θ(n²)', worst: 'O(n²)', space: 'O(1)' },
		{ name: 'Quick Sort', best: 'O(n log n)', avg: 'Θ(n log n)', worst: 'O(n²)', space: 'O(log n)' },
		{ name: 'Merge Sort', best: 'O(n log n)', avg: 'Θ(n log n)', worst: 'O(n log n)', space: 'O(n)' }
	];
</script>

<div class="relative flex flex-col items-center overflow-hidden px-4 pt-16 pb-20 md:px-6 md:pt-24 md:pb-32">
	<div class="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
		<div class="mb-6 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs md:px-4 md:py-1.5 md:text-sm">
			<span class="mr-2 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"></span>
			System Ready
		</div>

		<h1 class="mb-4 text-4xl leading-tight font-black tracking-tight text-white uppercase sm:text-5xl md:mb-6 md:text-[clamp(3.5rem,6vw,5.5rem)]">
			<span class="bg-linear-to-b from-white to-white/40 bg-clip-text text-transparent">Sorting</span> Match
		</h1>

		<p class="mb-8 max-w-2xl text-base leading-relaxed font-medium text-zinc-400 sm:text-lg md:mb-10 md:text-xl">
			Master the Sequence. Solve the Experiment.<br class="hidden sm:block" />
			<span class="text-white/60">A high-performance algorithm simulation for competitive developers.</span>
		</p>
	</div>

	<div class="animate-float relative z-10 mt-8 w-full max-w-5xl md:mt-20">
		<div class="absolute -inset-1 rounded-2xl bg-blue-500/10 blur-xl md:rounded-4xl md:blur-3xl"></div>

		<div class="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/50 shadow-2xl backdrop-blur-2xl md:rounded-4xl">
			<div class="relative flex items-center border-b border-white/5 bg-white/2 px-4 py-3 md:px-8 md:py-5">
				<div class="flex flex-1 gap-1.5 md:gap-2.5">
					<span class="h-2.5 w-2.5 rounded-full bg-red-500 md:h-3 md:w-3"></span>
					<span class="h-2.5 w-2.5 rounded-full bg-yellow-500 md:h-3 md:w-3"></span>
					<span class="h-2.5 w-2.5 rounded-full bg-green-500 md:h-3 md:w-3"></span>
				</div>
				<div class="flex flex-1 items-center justify-center gap-1.5 text-center font-mono text-[9px] text-zinc-500 md:gap-2 md:text-[10px]">
					<Cpu size={12} class="hidden sm:block" /> Sorting Match.exe
				</div>
				<div class="flex-1"></div>
			</div>

			<div class="relative flex h-40 items-end px-3 py-6 sm:h-50 sm:px-10 sm:py-8 md:h-75 md:px-20 md:py-12">
				<div class="pointer-events-none absolute inset-x-0 inset-y-0 z-0 flex flex-col justify-between py-6 opacity-30 md:py-12 md:opacity-50">
					<div class="h-px w-full bg-white/5"></div>
					<div class="h-px w-full bg-white/5"></div>
					<div class="h-px w-full bg-white/5"></div>
				</div>

				<div class="relative z-10 flex h-full w-full flex-row items-end justify-center gap-1 sm:gap-2 md:gap-4">
					{#each bars as height, i}
						<div class="flex h-full max-w-12 flex-1 flex-col items-center justify-end overflow-hidden rounded-t-sm bg-white/5 md:max-w-16 md:rounded-t-lg">
							<div class="sort-bar relative w-full origin-bottom rounded-t-sm bg-linear-to-t from-blue-600 via-blue-400 to-white md:rounded-t-lg" style="height: {height}%; animation-delay: {Math.abs(4 - i) * 0.15}s;">
								<div class="absolute inset-0 bg-white/20 blur-[2px]"></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.animate-float {
		animation: float 8s ease-in-out infinite;
	}
	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotateX(0deg);
		}
		50% {
			transform: translateY(-15px) rotateX(2deg);
		}
	}

	.sort-bar {
		animation: sort-bounce 3s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate;
	}
	@keyframes sort-bounce {
		0%,
		100% {
			transform: scaleY(1);
			filter: brightness(1);
		}
		50% {
			transform: scaleY(0.6);
			filter: brightness(1.3);
		}
	}
</style>
