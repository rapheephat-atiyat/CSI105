<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade, scale, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { Cpu, Zap, BarChart3, Info, Play, RotateCcw, Dumbbell, Settings, ArrowLeft } from 'lucide-svelte';
	import Swal from 'sweetalert2';
	import { generateArray, getSolutionSteps } from '$lib/utils/sorting';
	import type { Algorithm, Difficulty, Step } from '$lib/types';
	import Select from '$lib/components/ui/Select.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let algoName = $state<Algorithm>('Bubble Sort');
	let difficulty = $state<Difficulty>('normal');

	let dataArray = $state<{ id: string; val: number }[]>([]);
	let maxVal = $derived(dataArray.length > 0 ? Math.max(...dataArray.map((d) => d.val)) : 100);

	let draggingIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);
	let clickedIndex = $state<number | null>(null);

	let hintedIndices = $state<number[]>([]);
	let solutionSteps = $state<Step[]>([]);
	let stepIndex = $state(0);

	let isAutoPlaying = $state(false);
	let autoPlayInterval: ReturnType<typeof setInterval>;

	function initGame() {
		stopAutoPlay();
		clickedIndex = null;
		draggingIndex = null;
		dragOverIndex = null;
		hintedIndices = [];
		const rawArray = generateArray(difficulty);
		dataArray = rawArray.map((val) => ({ id: crypto.randomUUID(), val }));
		const sol = getSolutionSteps(algoName, rawArray);
		solutionSteps = sol.steps;
		stepIndex = 0;
	}

	$effect(() => {
		// When algo or difficulty strongly changes (by user selection), rerun initGame
		if (algoName && difficulty) {
			initGame();
		}
	});

	onMount(() => {
		initGame();
		return () => stopAutoPlay();
	});

	function playSound(type: 'correct' | 'wrong' | 'hint') {
		try {
			const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);

			if (type === 'correct') {
				osc.frequency.setValueAtTime(600, ctx.currentTime);
				osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
				gain.gain.setValueAtTime(0.1, ctx.currentTime);
			} else if (type === 'wrong') {
				osc.frequency.setValueAtTime(300, ctx.currentTime);
				osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
				gain.gain.setValueAtTime(0.1, ctx.currentTime);
			} else {
				osc.frequency.setValueAtTime(800, ctx.currentTime);
				gain.gain.setValueAtTime(0.05, ctx.currentTime);
			}
			osc.start();
			osc.stop(ctx.currentTime + 0.2);
		} catch (e) {}
	}

	function checkMove(indexA: number, indexB: number) {
		if (isAutoPlaying) return;

		const minIndex = Math.min(indexA, indexB);
		const maxIndex = Math.max(indexA, indexB);

		const expectedStep = solutionSteps[stepIndex];
		if (expectedStep && expectedStep.type === 'swap' && expectedStep.a === minIndex && expectedStep.b === maxIndex) {
			// Correct
			let temp = dataArray[indexA];
			dataArray[indexA] = dataArray[indexB];
			dataArray[indexB] = temp;
			dataArray = [...dataArray];
			stepIndex++;
			hintedIndices = [];
			playSound('correct');

			checkWin();
		} else {
			// Wrong
			playSound('wrong');
			Swal.fire({
				toast: true,
				position: 'bottom',
				icon: 'error',
				title: 'ผิดตำแหน่ง! ลองตรวจสอบอัลกอริทึมอีกครั้ง',
				showConfirmButton: false,
				timer: 2000,
				background: '#450a0a',
				color: '#fca5a5'
			});
		}
	}

	function checkWin() {
		const isSorted = dataArray.every((val, i, arr) => i === 0 || arr[i - 1].val <= val.val);
		if (isSorted) {
			Swal.fire({
				icon: 'success',
				title: 'เรียงลำดับสำเร็จ!',
				text: 'คุณทำได้ถูกต้องตามขั้นตอนของอัลกอริทึม',
				background: '#0a0a0a',
				color: '#fff',
				confirmButtonColor: '#3b82f6'
			}).then(() => {
				initGame();
			});
		}
	}

	function handleDragStart(index: number) {
		if (isAutoPlaying) return;
		draggingIndex = index;
	}

	function handleDrop(targetIndex: number) {
		if (draggingIndex !== null && draggingIndex !== targetIndex) {
			checkMove(draggingIndex, targetIndex);
		}
		draggingIndex = null;
		dragOverIndex = null;
	}

	function handleClick(index: number) {
		if (isAutoPlaying) return;
		if (clickedIndex === null) {
			clickedIndex = index;
		} else if (clickedIndex === index) {
			clickedIndex = null;
		} else {
			checkMove(clickedIndex, index);
			clickedIndex = null;
		}
	}

	function requestHint() {
		if (isAutoPlaying) return;
		const nextStep = solutionSteps[stepIndex];
		if (nextStep && nextStep.type === 'swap') {
			playSound('hint');
			hintedIndices = [nextStep.a, nextStep.b];
		}
	}

	function toggleAutoPlay() {
		if (isAutoPlaying) {
			stopAutoPlay();
		} else {
			startAutoPlay();
		}
	}

	function startAutoPlay() {
		isAutoPlaying = true;
		hintedIndices = [];
		clickedIndex = null;
		autoPlayInterval = setInterval(() => {
			const expectedStep = solutionSteps[stepIndex];
			if (expectedStep && expectedStep.type === 'swap') {
				let temp = dataArray[expectedStep.a];
				dataArray[expectedStep.a] = dataArray[expectedStep.b];
				dataArray[expectedStep.b] = temp;
				dataArray = [...dataArray];
				stepIndex++;
				playSound('correct');

				const isSorted = dataArray.every((val, i, arr) => i === 0 || arr[i - 1].val <= val.val);
				if (isSorted) {
					stopAutoPlay();
					Swal.fire({
						icon: 'info',
						title: 'การจำลองเสร็จสิ้น',
						background: '#0a0a0a',
						color: '#fff',
						confirmButtonColor: '#3b82f6'
					});
				}
			} else {
				stopAutoPlay();
			}
		}, 800);
	}

	function stopAutoPlay() {
		isAutoPlaying = false;
		clearInterval(autoPlayInterval);
	}
</script>

<svelte:head>
	<title>Practice Mode</title>
</svelte:head>
			<div class="glow box1"></div>
			<div class="glow box2"></div>
			<div class="glow box3"></div>
			<div class="glow box4"></div>
<div class="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col gap-6 overflow-hidden p-4 md:flex-row md:p-8">
	<!-- Sidebar Settings -->
	<aside class="flex w-full shrink-0 flex-col gap-6 md:w-72">
		<button onclick={() => goto('/lobby')} class="flex w-fit items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10">
			<ArrowLeft size={16} /> กลับสู่ล็อบบี้
		</button>

		<div class="rounded-3xl border border-white/5 bg-neutral-950/40 p-6 backdrop-blur-md">
			<div class="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
				<Settings size={20} class="text-amber-400" />
				<h2 class="text-sm font-black tracking-widest text-white uppercase">ตั้งค่าการซ้อม</h2>
			</div>

			<div class="flex flex-col gap-4">
				<Select
					label="อัลกอริทึม"
					bind:value={algoName}
					options={[
						{ value: 'Bubble Sort', label: 'Bubble Sort' },
						{ value: 'Selection Sort', label: 'Selection Sort' },
						{ value: 'Insertion Sort', label: 'Insertion Sort' },
						{ value: 'Merge Sort', label: 'Merge Sort' },
						{ value: 'Quick Sort', label: 'Quick Sort' }
					]}
					flavor="indigo"
				/>

				<Select
					label="ความยาก (ขนาดข้อมูล)"
					bind:value={difficulty}
					options={[
						{ value: 'easy', label: 'ง่าย (5-8 ค่า)' },
						{ value: 'normal', label: 'ปานกลาง (8-12 ค่า)' },
						{ value: 'hard', label: 'ยาก (12-20 ค่า)' }
					]}
					flavor="indigo"
				/>

				<Button variant="primary" class="mt-2 flex w-full items-center justify-center" onclick={initGame}>
					<RotateCcw size={16} class="mr-2" /> โหลดข้อมูลใหม่
				</Button>
			</div>
		</div>

		<div class="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 backdrop-blur-md">
			<h3 class="mb-4 text-xs font-black tracking-widest text-blue-400 uppercase">โหมดจำลอง</h3>
			<p class="mb-4 text-xs font-medium text-zinc-400">ระบบจะทำการสลับข้อมูลให้ดูเป็นตัวอย่างทีละขั้นตอนจนกว่าจะเสร็จสิ้น</p>

			<Button variant="indigo" class="flex w-full items-center justify-center" onclick={toggleAutoPlay}>
				{#if isAutoPlaying}
					<RotateCcw size={16} class="mr-2 animate-spin" />หยุดการจำลอง
				{:else}
					<Play size={16} class="mr-2" />เริ่มการจำลอง
				{/if}
			</Button>
		</div>
	</aside>

	<!-- Main Arena -->
	<div class="flex min-h-[60vh] w-full flex-1 flex-col gap-6 md:h-[80vh]">
		<header class="flex w-full flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/10 bg-neutral-950/40 p-6 backdrop-blur-md">
			<div class="flex items-center gap-5">
				<div class="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
					<Dumbbell size={24} />
				</div>
				<div>
					<h1 class="text-2xl font-black tracking-tight text-white uppercase italic">ลานฝึกซ้อม</h1>
					<div class="mt-1 flex items-center gap-2">
						<Badge flavor="emerald" class="text-[9px]">{algoName}</Badge>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-4">
				<button class="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 text-xs font-black transition-all hover:bg-white/10" onclick={requestHint} disabled={isAutoPlaying}>
					<Zap size={16} class="text-amber-400" /> ขอคำใบ้
				</button>
			</div>
		</header>

		<main class="relative w-full flex-1 overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-950/40 shadow-xl backdrop-blur-md">
			<div class="flex items-center border-b border-white/5 bg-white/2 px-5 py-3">
				<div class="flex gap-1.5">
					<span class="h-2 w-2 rounded-full bg-white/10"></span>
					<span class="h-2 w-2 rounded-full bg-white/10"></span>
					<span class="h-2 w-2 rounded-full bg-white/10"></span>
				</div>
				<div class="mx-auto flex items-center gap-2 font-mono text-[9px] tracking-widest text-zinc-600 uppercase" id="boxx">
					<BarChart3 size={12} /> ห้องฝึกซ้อมอิสระ
				</div>
			</div>

			<div class="absolute inset-0 flex items-end justify-center p-8 pt-20 pb-16">
				{#if dataArray.length === 0}
					<div class="flex flex-col items-center gap-4">
						<div class="h-8 w-8 animate-spin rounded-full border-2 border-white/5 border-t-amber-500"></div>
						<p class="animate-pulse font-mono text-[10px] text-zinc-500 uppercase">กำลังโหลดข้อมูล...</p>
					</div>
				{:else}
					<div class="flex h-full w-full items-end justify-center gap-2 sm:gap-3">
						{#each dataArray as item, i (item.id)}
							<div
								animate:flip={{ duration: 300, easing: cubicOut }}
								role="button"
								tabindex="0"
								draggable={!isAutoPlaying}
								ondragstart={() => handleDragStart(i)}
								ondragover={(e) => {
									e.preventDefault();
									if (!isAutoPlaying) dragOverIndex = i;
								}}
								ondrop={() => handleDrop(i)}
								onclick={() => handleClick(i)}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										handleClick(i);
									}
								}}
								class="group/bar relative w-full rounded-t-xl transition-all duration-300
                                {isAutoPlaying && !hintedIndices.includes(i) ? 'opacity-50' : 'cursor-pointer hover:brightness-125'} 
								{dragOverIndex === i ? 'z-40 scale-105 border-2 border-amber-400 bg-amber-500/20 ring-4 ring-amber-500/20' : 'border border-white/10'}
								{clickedIndex === i ? 'z-40 scale-110 border-2 border-amber-400 bg-amber-400/30' : ''}
								{hintedIndices.includes(i) ? 'z-50 animate-pulse border-2 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.8)] ring-4 ring-emerald-500/50' : ''}"
								style="
                                    height: {(item.val / maxVal) * 85 + 5}%; 
                                    background: {hintedIndices.includes(i) ? 'linear-gradient(to top, rgba(16, 185, 129, 0.4), rgba(52, 211, 153, 0.9))' : `linear-gradient(to top, hsla(${(item.val / maxVal) * 280}, 80%, 20%, 0.5), hsla(${(item.val / maxVal) * 280}, 80%, 60%, 0.9))`};
                                "
							>
								<div class="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover/bar:opacity-100">
									<span class="rounded-lg bg-white px-2.5 py-1 text-xs font-black text-black shadow-xl">{item.val}</span>
								</div>
								<div class="absolute bottom-4 left-0 w-full text-center font-mono text-[10px] font-black text-white/20 select-none">{item.val}</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="absolute bottom-5 left-8 flex items-center gap-2 text-[9px] font-black tracking-tighter text-zinc-700 uppercase">
				<Info size={12} /> คลิกหรือลากวางเพื่อเรียงลำดับ | ตามขั้นตอนของ {algoName}
			</div>
		</main>
	</div>
</div>
<style>
	.box1 {
		position: absolute;
		top: 400px;
		right: 20px;
		width: 300px;
		height: 300px;
		border-radius: 50%;
		filter: blur(50px);
	}
	.box2 {
		position: absolute;
		top: 200px;
		right: 150px;
		width: 560px;
		height: 560px;
		border-radius: 50%;
		filter: blur(50px);
	}
	.box3 {
		position: absolute;
		top: 10px;
		right: 820px;
		width: 300px;
		height: 300px;
		border-radius: 50%;
		filter: blur(50px);
	}
	.box4 {
		position: absolute;
		top:100px;
		right: 950px;
		width: 500px;
		height: 500px;
		border-radius: 50%;
		filter: blur(50px);
	}
	.box1 {
		background: rgba(255, 0, 234, 0.2);
	}
	.box2 {
		background: rgba(153, 0, 255, 0.2);
	}
	.box3 {
		background: rgba(9, 0, 255, 0.2);
	}
	.box4 {
		background: rgba(0, 170, 255, 0.2);
	}
</style>
