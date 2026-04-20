<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import Background from '$lib/components/ui/Background.svelte';
	import { onMount, untrack } from 'svelte';
	import { io, type Socket } from 'socket.io-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { fade, scale, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import { cubicOut } from 'svelte/easing';
	import { Cpu, Zap, BarChart3, Info, Timer, Trophy } from 'lucide-svelte';
	import Swal from 'sweetalert2';

	let { data }: { data: PageData } = $props();
	let room = $derived(data.room);

	let socket: Socket;
	let algoName = $derived($page.url.searchParams.get('algo') || 'Bubble Sort');

	let currentRound = $state(1);
	let maxRounds = $state(3);
	let difficulty = $state('Normal');
	let timeLeft = $state(60);
	let interval: ReturnType<typeof setInterval>;

	let dataArray = $state<{id: string, val: number}[]>([]);
	let maxVal = $derived(dataArray.length > 0 ? Math.max(...dataArray.map(d => d.val)) : 100);

	let draggingIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);

	let hintsLeft = $state(0);
	let hintedIndices = $state<number[]>([]);
	let totalScore = $state(0);

	let isWaitingNextRound = $state(false);
	let roundSummary = $state<{ score: number; timeLeft: number; rank: number; timeout: boolean } | null>(null);

	let participants = $state<any[]>([]);
	let finishedPlayers = $state<Set<string>>(new Set());

	let toastMessage = $state<{ id: number; text: string; type: 'error' | 'success' } | null>(null);
	let toastIdCounter = 0;

	function showToast(text: string, type: 'error' | 'success') {
		const id = ++toastIdCounter;
		toastMessage = { id, text, type };
		setTimeout(() => {
			if (toastMessage?.id === id) toastMessage = null;
		}, 3000);
	}

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
		} catch (e) {
			// กุควรทำไรตรงนี้
		}
	}

	onMount(() => {
		socket = io({ withCredentials: true });
		const urlName = new URLSearchParams(window.location.search).get('name');

		socket.on('connect', () => {
			socket.emit('room:join', { rCode: room.joinCode, guestName: urlName || undefined });

			setTimeout(() => {
				socket.emit('game:ready');
				socket.emit('room:sync');
			}, 100);
		});

		socket.on('room:update', (payload) => {
			participants = payload.players || [];
		});

		socket.on('game:player_done', (payload) => {
			if (payload?.playerId) {
				finishedPlayers.add(payload.playerId);
				finishedPlayers = new Set(finishedPlayers);
			}
		});

		socket.on('game:new_round', (payload) => {
			currentRound = payload.round;
			maxRounds = payload.maxRounds;
			difficulty = payload.difficulty;
			dataArray = payload.array.map((val: number) => ({ id: crypto.randomUUID(), val }));
			hintsLeft = payload.hintsLeft ?? 3;
			totalScore = payload.totalScore || 0;

			isWaitingNextRound = false;
			roundSummary = null;
			hintedIndices = [];
			finishedPlayers = new Set();
			timeLeft = 60;

			clearInterval(interval);
			interval = setInterval(() => {
				if (timeLeft > 0) timeLeft--;
				if (timeLeft <= 0 && !isWaitingNextRound) {
					clearInterval(interval);
					socket.emit('game:timeout');
				}
			}, 1000);
		});

		socket.on('game:move_result', (payload) => {
			if (payload.correct && payload.indexA !== undefined && payload.indexB !== undefined) {
				let temp = dataArray[payload.indexA];
				dataArray[payload.indexA] = dataArray[payload.indexB];
				dataArray[payload.indexB] = temp;
				dataArray = [...dataArray];
				hintedIndices = [];
				playSound('correct');
				showToast(`ถูกต้อง!`, 'success');
			} else if (!payload.correct) {
				let penalty = payload.penalty || 5;
				timeLeft = Math.max(0, timeLeft - penalty);
				playSound('wrong');
				showToast(`ผิดพลาด! -${penalty}วิ`, 'error');
			}
		});

		socket.on('game:round_end', (payload) => {
			if (payload.correct && payload.indexA !== undefined && payload.indexB !== undefined) {
				let temp = dataArray[payload.indexA];
				dataArray[payload.indexA] = dataArray[payload.indexB];
				dataArray[payload.indexB] = temp;
				dataArray = [...dataArray];
			}
			clearInterval(interval);
			isWaitingNextRound = true;
			totalScore = payload.totalScore;
			roundSummary = {
				score: payload.roundScore,
				timeLeft: payload.timeLeft,
				rank: payload.rank,
				timeout: payload.timeout
			};
		});

		socket.on('game:next_round_start', () => {
			socket.emit('game:ready');
		});

		socket.on('game:hint_result', (payload) => {
			hintsLeft = payload.hintsLeft;
			hintedIndices = [...payload.hintIndices];
		});

		socket.on('game:match_finished', () => {
			Swal.fire({
				icon: 'success',
				title: 'การท้าทายเสร็จสิ้น!',
				text: `คะแนนรวม: ${totalScore}`,
				background: '#0a0a0a',
				color: '#fff',
				confirmButtonColor: '#3b82f6'
			}).then(() => goto('/lobby'));
		});

		return () => {
			clearInterval(interval);
			if (socket?.connected) socket.disconnect();
		};
	});

	function handleDragStart(index: number) {
		if (isWaitingNextRound || timeLeft <= 0) return;
		draggingIndex = index;
	}

	function handleDrop(targetIndex: number) {
		if (draggingIndex !== null && draggingIndex !== targetIndex) {
			socket.emit('game:try_move', { indexA: draggingIndex, indexB: targetIndex });
		}
		draggingIndex = null;
		dragOverIndex = null;
	}

	let clickedIndex = $state<number | null>(null);
	function handleClick(index: number) {
		if (isWaitingNextRound || timeLeft <= 0) return;
		if (clickedIndex === null) {
			clickedIndex = index;
		} else if (clickedIndex === index) {
			clickedIndex = null;
		} else {
			socket.emit('game:try_move', { indexA: clickedIndex, indexB: index });
			clickedIndex = null;
		}
	}

	function requestHint() {
		if (hintsLeft > 0 && !isWaitingNextRound && timeLeft > 0) {
			playSound('hint');
			socket.emit('game:request_hint');
		}
	}
</script>

<svelte:head>
	<title>Play: {algoName}</title>
</svelte:head>

<div class="relative z-10 mx-auto flex h-[calc(100vh-5rem)] w-full max-w-380 flex-col gap-6 overflow-hidden p-4 md:flex-row md:p-8">
	<aside class="flex w-full shrink-0 flex-col gap-4 md:w-64 lg:w-72">
		<div class="flex items-center gap-2 px-2">
			<div class="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
			<h2 class="text-[10px] font-black tracking-widest text-zinc-500 uppercase">รายการผู้เล่น.sys ({participants.length})</h2>
		</div>

		<div class="custom-scrollbar flex-1 space-y-3 overflow-y-auto">
			{#each participants as p}
				<div class="group relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3.5 transition-all duration-300 {finishedPlayers.has(p.playerId) ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/5 bg-neutral-950/40'}">
					<img src={p.avatar} alt="avatar" class="relative z-10 h-10 w-10 rounded-xl border border-white/10 object-cover {finishedPlayers.has(p.playerId) ? 'border-blue-400' : ''}" />
					<div class="z-10 flex min-w-0 flex-1 flex-col">
						<span class="truncate text-xs font-bold text-zinc-200">{p.name}</span>
						<span class="text-[9px] font-black tracking-widest uppercase {finishedPlayers.has(p.playerId) ? 'text-blue-400' : 'text-zinc-600'}">
							{finishedPlayers.has(p.playerId) ? 'เสร็จสมบูรณ์' : 'กำลังวิเคราะห์...'}
						</span>
					</div>
				</div>
			{/each}
		</div>
	</aside>

	<div class="flex h-full w-full flex-1 flex-col gap-6">
		<header class="flex w-full flex-wrap items-center justify-between gap-6 rounded-3xl border border-white/10 bg-neutral-950/40 p-6 backdrop-blur-md">
			<div class="flex items-center gap-5">
				<div class="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-black/40 px-5 py-2">
					<span class="text-[9px] font-black tracking-widest text-zinc-600 uppercase">ด่านที่</span>
					<span class="text-3xl font-black text-white">{currentRound}<span class="text-xs text-zinc-600">/{maxRounds}</span></span>
				</div>
				<div>
					<h1 class="text-2xl font-black tracking-tight text-white uppercase italic">{algoName}</h1>
					<div class="mt-1 flex items-center gap-2">
						<Badge flavor="blue" class="text-[9px]">ระดับความยาก: {difficulty}</Badge>
						<span class="font-mono text-[10px] text-zinc-500">คะแนนรวม: {totalScore}</span>
					</div>
				</div>
			</div>

			<div class="flex items-center gap-4">
				{#if difficulty !== 'Hard'}
					<button class="flex h-14 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 text-xs font-black transition-all hover:bg-white/10 disabled:opacity-30" onclick={requestHint} disabled={hintsLeft === 0 || isWaitingNextRound}>
						<Zap size={16} class="text-blue-400" /> ตัวช่วย [{hintsLeft}]
					</button>
				{/if}

				<div class="relative flex h-14 min-w-[120px] flex-col items-center justify-center rounded-2xl border {timeLeft <= 10 ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-neutral-950/80'} px-6">
					<span class="text-[9px] font-black text-zinc-500 uppercase">เวลาที่เหลือ</span>
					<span class="font-mono text-2xl font-black tabular-nums {timeLeft <= 10 ? 'animate-pulse text-red-500' : 'text-blue-400'}">{timeLeft}s</span>
				</div>
			</div>
		</header>

		<!-- Main Arena Window -->
		<main class="relative w-full flex-1 overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-950/40 shadow-xl backdrop-blur-md">
			<!-- Window Bar -->
			<div class="flex items-center border-b border-white/5 bg-white/2 px-5 py-3">
				<div class="flex gap-1.5">
					<span class="h-2 w-2 rounded-full bg-white/10"></span>
					<span class="h-2 w-2 rounded-full bg-white/10"></span>
					<span class="h-2 w-2 rounded-full bg-white/10"></span>
				</div>
				<div class="mx-auto flex items-center gap-2 font-mono text-[9px] tracking-widest text-zinc-600 uppercase">
					<BarChart3 size={12} /> กระดานจำลอง.vfx
				</div>
			</div>

			<div class="absolute inset-0 flex items-end justify-center p-8 pt-20 pb-16">
				{#if dataArray.length === 0}
					<div class="flex flex-col items-center gap-4">
						<div class="h-8 w-8 animate-spin rounded-full border-2 border-white/5 border-t-blue-500"></div>
						<p class="animate-pulse font-mono text-[10px] text-zinc-500 uppercase">กำลังโหลดข้อมูล...</p>
					</div>
				{:else}
					<div class="flex h-full w-full items-end justify-center gap-2 sm:gap-3">
						{#each dataArray as item, i (item.id)}
							<div
								animate:flip={{ duration: 300, easing: cubicOut }}
								role="button"
								tabindex="0"
								draggable={!isWaitingNextRound && timeLeft > 0}
								ondragstart={() => handleDragStart(i)}
								ondragover={(e) => {
									e.preventDefault();
									dragOverIndex = i;
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
                                {isWaitingNextRound ? 'opacity-30 grayscale' : 'cursor-pointer hover:brightness-125'} 
								{dragOverIndex === i ? 'scale-105 border-2 border-blue-400 bg-blue-500/20 ring-4 ring-blue-500/20 z-40' : 'border border-white/10'}
								{clickedIndex === i ? 'scale-110 border-2 border-blue-400 bg-blue-400/30 z-40' : ''}
								{hintedIndices.includes(i) ? 'animate-pulse border-2 border-emerald-400 ring-4 ring-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.8)] z-50' : ''}"
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

			{#if difficulty !== 'Hard'}
				<div class="absolute bottom-5 left-8 flex items-center gap-2 text-[9px] font-black tracking-tighter text-zinc-700 uppercase">
					<Info size={12} /> คลิกแท่งเพื่อสลับตำแหน่ง • หรือลากวางเพื่อความรวดเร็ว
				</div>
			{/if}
		</main>
	</div>
</div>

{#if toastMessage}
	<div transition:fly={{ y: 20 }} class="fixed bottom-10 left-1/2 z-200 flex -translate-x-1/2 items-center gap-3 rounded-2xl border px-6 py-3 font-bold shadow-2xl backdrop-blur-xl {toastMessage.type === 'error' ? 'border-red-500/50 bg-red-950/80 text-red-200' : 'border-blue-500/50 bg-blue-950/80 text-blue-200'}">
		<span class="text-[10px] font-black tracking-widest uppercase">{toastMessage.text}</span>
	</div>
{/if}

{#if isWaitingNextRound && roundSummary}
	<div transition:fade class="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
		<div transition:scale class="w-full max-w-lg rounded-[3rem] border border-white/5 bg-neutral-950 p-12 text-center shadow-xl">
			<div class="mb-10">
				{#if roundSummary.timeout}
					<h3 class="text-4xl font-black tracking-tighter text-red-500 uppercase italic">หมดเวลา</h3>
					<p class="mt-2 text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">ไม่สามารถทำได้ทันในเวลาที่กำหนด</p>
				{:else}
					<h3 class="text-5xl font-black tracking-tighter text-white uppercase italic">ผ่านด่าน</h3>
					<p class="mt-2 text-[10px] font-black tracking-[0.3em] text-blue-500 uppercase">การเรียงลำดับถูกต้องสมบูรณ์</p>
				{/if}
			</div>

			<div class="mb-8 grid grid-cols-2 gap-4">
				<div class="rounded-3xl border border-white/5 bg-white/2 p-6">
					<span class="mb-2 block text-[10px] font-black text-zinc-500 uppercase">อันดับ</span>
					<span class="text-4xl font-black text-white">#{roundSummary.rank}</span>
				</div>
				<div class="rounded-3xl border border-white/5 bg-white/2 p-6">
					<span class="mb-2 block text-[10px] font-black text-zinc-500 uppercase">เวลาที่ใช้ไป</span>
					<span class="text-4xl font-black text-blue-400">{(60 - roundSummary.timeLeft).toFixed(1)}s</span>
				</div>
			</div>

			<div class="rounded-3xl bg-blue-600 p-8">
				<span class="mb-1 block text-[10px] font-black tracking-widest text-blue-200 uppercase">คะแนนที่ได้</span>
				<span class="text-6xl font-black text-white">+{roundSummary.score}</span>
			</div>

			<div class="mt-10 flex flex-col items-center gap-4">
				<div class="flex animate-pulse gap-1.5">
					<span class="h-1.5 w-1.5 rounded-full bg-zinc-600"></span>
					<span class="h-1.5 w-1.5 rounded-full bg-zinc-600"></span>
					<span class="h-1.5 w-1.5 rounded-full bg-zinc-600"></span>
				</div>
				<p class="text-[9px] font-black tracking-widest text-zinc-600 uppercase">กำลังรอผู้เล่นคนอื่น...</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 0px;
	}
	.custom-scrollbar {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
</style>
