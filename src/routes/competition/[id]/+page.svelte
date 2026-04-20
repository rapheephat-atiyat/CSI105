<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { io, type Socket } from 'socket.io-client';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { Cpu } from 'lucide-svelte';
	import Swal from 'sweetalert2';

	let { data }: { data: PageData } = $props();

	let room = $derived(data.room);
	let players = $state(untrack(() => data.participantsData));
	let isHost = $derived(data.isHost);

	const algorithms = [
		{ name: 'Bubble Sort', type: 'Quadratic', complexity: 'O(n²)', desc: 'เปรียบเทียบเลขคู่ติดกันและสลับที่กันไปเรื่อยๆ' },
		{ name: 'Selection Sort', type: 'Selection-Based', complexity: 'O(n²)', desc: 'ค้นหาตัวเลขที่น้อยที่สุดแล้วนำมาสลับไว้ข้างหน้า' },
		{ name: 'Insertion Sort', type: 'Insertion-Based', complexity: 'O(n²)', desc: 'ดึงข้อมูลมาแทรกในตำแหน่งที่ถูกต้องทีละตัว' },
		{ name: 'Quick Sort', type: 'Divide & Conquer', complexity: 'O(n log n)', desc: 'แบ่งข้อมูลด้วย Pivot แล้วแยกจัดซ้ายขวา' },
		{ name: 'Merge Sort', type: 'Divide & Conquer', complexity: 'O(n log n)', desc: 'ทุบแบ่งครึ่งเรื่อยๆ แล้วจับประกบเรียงใหม่' }
	];

	let selectedAlgoIndex = $state(0);
	let socket: Socket;

	let isStarting = $state(false);

	let authStatus = $state<'verifying' | 'granted'>('verifying');

	onMount(() => {
		socket = io({ withCredentials: true });

		const params = new URLSearchParams(window.location.search);
		const urlName = params.get('name');

		let joinedPin = params.get('pin');
		if (!joinedPin) {
			const cachedPin = sessionStorage.getItem('room_pin_' + room.joinCode);
			if (cachedPin) {
				joinedPin = cachedPin;
				sessionStorage.removeItem('room_pin_' + room.joinCode);
			}
		}

		socket.emit('room:join', {
			rCode: room.joinCode,
			guestName: urlName || undefined,
			pin: joinedPin || undefined
		});

		socket.on('room:join_success', () => {
			authStatus = 'granted';
		});

		socket.on('room:update', (payload) => {
			if (payload.players) players = payload.players;
			if (payload.algoIndex !== undefined) selectedAlgoIndex = payload.algoIndex;
		});

		socket.on('room:started', ({ algo }) => {
			isStarting = true;
			let href = `/competition/${room.joinCode}/play?algo=${algo}`;
			if (urlName) href += `&name=${urlName}`;
			goto(href);
		});

		socket.on('error', (msg) => {
			Swal.fire({
				icon: 'error',
				title: 'เกิดข้อผิดพลาด',
				text: msg,
				background: '#0a0a0a',
				color: '#fff',
				confirmButtonColor: '#3b82f6'
			}).then(() => goto('/lobby'));
		});

		socket.on('lobby:remove', ({ id }) => {
			if (id === room.joinCode && !isStarting) {
				goto('/lobby');
			}
		});

		return () => {
			if (socket?.connected) socket.disconnect();
		};
	});

	function selectAlgo(index: number) {
		if (!isHost) return;
		selectedAlgoIndex = index;
		socket.emit('room:settings:update', { roomId: room.id, algoIndex: index });
	}

	function toggleReady() {
		socket.emit('player:ready', { roomId: room.id });
	}

	function startGame() {
		socket.emit('room:start', { roomId: room.id, algo: algorithms[selectedAlgoIndex].name });
	}

	function handleManualLeave() {
		if (socket?.connected) {
			socket.emit('room:leave');
		}
		goto('/lobby');
	}
</script>

<svelte:head>
	<title>Sorting Match - ห้อง {room.joinCode}</title>
</svelte:head>

<div class="relative z-10 flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4 md:p-8">
	{#if authStatus === 'verifying'}
		<div class="flex flex-col items-center justify-center gap-6">
			<div class="h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-blue-500"></div>
			<p class="animate-pulse text-lg font-bold tracking-widest text-blue-400 uppercase">กำลังตรวจสอบสิทธิ์...</p>
		</div>
	{:else}
		<div class="grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
			<div class="flex max-h-[85vh] flex-col gap-6 lg:col-span-4">
				<div class="group relative overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/40 shadow-xl backdrop-blur-md">
					<div class="flex items-center border-b border-white/5 bg-white/2 px-4 py-3 md:px-5">
						<div class="flex gap-2">
							<span class="h-2.5 w-2.5 rounded-full bg-red-500/50"></span>
							<span class="h-2.5 w-2.5 rounded-full bg-yellow-500/50"></span>
							<span class="h-2.5 w-2.5 rounded-full bg-green-500/50"></span>
						</div>
						<div class="mx-auto flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 uppercase">
							<Cpu size={12} /> ข้อมูลห้อง.sys
						</div>
					</div>

					<div class="p-6 md:p-8">
						<div class="mb-8 flex items-center justify-between">
							<button class="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-xs font-bold text-zinc-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400" onclick={handleManualLeave}>
								<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
								ออกจากห้อง
							</button>
							<div class="text-right">
								<span class="text-[10px] font-black tracking-widest text-blue-500/60 uppercase">รหัสเข้าห้อง</span>
								<h1 class="bg-linear-to-br from-white to-white/40 bg-clip-text font-mono text-4xl font-black tracking-tight text-transparent">
									{room.joinCode}
								</h1>
							</div>
						</div>

						<div class="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-4">
							<div class="flex items-center gap-3">
								<div class="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">
									<svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" /></svg>
								</div>
								<div>
									<span class="block text-xs font-bold text-white">จำนวนผู้เล่น</span>
									<span class="text-[10px] tracking-tighter text-zinc-500 uppercase">ความจุ: {room.maxPlayers} คน</span>
								</div>
							</div>
							<div class="text-2xl font-black {players.length === room.maxPlayers ? 'text-blue-400' : 'text-zinc-300'}">
								{players.length}<span class="text-sm text-zinc-600">/{room.maxPlayers}</span>
							</div>
						</div>
					</div>
				</div>

				<div class="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-neutral-950/40 shadow-xl backdrop-blur-md">
					<div class="flex items-center border-b border-white/5 bg-white/2 px-4 py-3 md:px-5">
						<div class="flex items-center gap-2 font-mono text-[10px] text-zinc-500 uppercase">
							<span class="h-2 w-2 animate-pulse rounded-full bg-blue-500"></span> ผู้เล่นในห้อง.log
						</div>
					</div>

					<div class="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-6 pt-4">
						{#each players as p}
							<div class="group relative flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300 {p.isReady ? 'border-blue-500/40 bg-blue-500/5' : 'border-white/5 bg-black/40'}">
								<img src={p.avatar} alt="avatar" class="relative z-10 h-10 w-10 rounded-xl border border-white/10 grayscale-[0.5] transition-all group-hover:grayscale-0 {p.isReady ? 'border-blue-400 ring-2 ring-blue-500/20' : ''}" />

								<div class="relative z-10 min-w-0 flex-1">
									<p class="truncate text-sm font-bold text-zinc-200">{p.name}</p>
									<div class="flex items-center gap-1.5 pt-1">
										<span class="h-1 w-1 rounded-full {p.isReady ? 'animate-pulse bg-blue-400' : 'bg-zinc-600'}"></span>
										<span class="text-[9px] font-black tracking-widest uppercase {p.isReady ? 'text-blue-400' : 'text-zinc-500'}">
											{p.isReady ? 'พร้อมแล้ว' : 'กำลังรอ'}
										</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="flex h-full flex-col gap-6 lg:col-span-8">
				<div class="relative flex flex-1 flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-neutral-950/40 shadow-xl backdrop-blur-md">
					<div class="flex items-center border-b border-white/5 bg-white/2 px-6 py-4 md:px-10 md:py-6">
						<div class="mr-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
							<Cpu class="h-6 w-6 text-blue-400" />
						</div>
						<div>
							<h2 class="bg-linear-to-r from-white to-white/50 bg-clip-text text-2xl font-black tracking-tight text-transparent uppercase">ตั้งค่าการแข่งขัน</h2>
							<p class="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">เลือกอัลกอริทึมที่จะใช้งาน</p>
						</div>
					</div>
					<div class="relative z-10 grid gap-4 p-6 sm:grid-cols-2 lg:p-10">
						{#each algorithms as algo, i}
							<button class="group relative flex flex-col overflow-hidden rounded-2xl border p-6 text-left transition-all duration-300 {selectedAlgoIndex === i ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/5 bg-black/20 hover:border-white/20'}" onclick={() => selectAlgo(i)} disabled={!isHost}>
								{#if selectedAlgoIndex === i}
									<div class="absolute -top-4 -right-4 text-blue-500/20"><Cpu size={120} /></div>
								{/if}

								<div class="mb-4">
									<span class="rounded-md border border-white/5 bg-white/5 px-2 py-1 text-[9px] font-black tracking-widest text-zinc-500 uppercase">{algo.type}</span>
								</div>
								<h3 class="mb-2 text-xl font-black text-white">{algo.name}</h3>
								<p class="mb-6 flex-1 text-xs leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">{algo.desc}</p>

								<div class="flex items-center gap-2 border-t border-white/5 pt-4">
									<span class="text-[9px] font-bold text-zinc-600 uppercase">การวิเคราะห์:</span>
									<span class="font-mono text-[10px] font-black text-blue-500/80">{algo.complexity}</span>
								</div>
							</button>
						{/each}
					</div>

					<div class="mt-auto flex flex-col items-center justify-between gap-4 border-t border-white/5 bg-white/2 p-6 sm:flex-row lg:p-10">
						<div class="flex items-center gap-3">
							<div class="h-2 w-2 rounded-full {isHost ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse"></div>
							<p class="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
								{isHost ? 'สถานะ: คุณคือหัวหน้าห้อง' : 'สถานะ: รอหัวหน้าห้องเริ่มความท้าทาย'}
							</p>
						</div>

						<div class="flex w-full items-center gap-4 sm:w-auto">
							<button class="flex-1 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-black text-white uppercase transition-all hover:bg-white/10 active:scale-95 sm:flex-none" onclick={toggleReady}>
								{players.find((p) => p.playerId === data.user?.id)?.isReady ? 'ยกเลิกพร้อม' : 'กดยืนยันความพร้อม'}
							</button>
							{#if isHost}
								<button class="flex-1 rounded-2xl bg-blue-600 px-10 py-4 text-sm font-black text-white uppercase shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] active:scale-95 disabled:opacity-50 sm:flex-none" onclick={startGame}> เริ่มการแข่งขัน </button>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	:global(body) {
		background-color: #050505;
		margin: 0;
		overflow-x: hidden;
	}
	.custom-scrollbar::-webkit-scrollbar {
		width: 3px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.1);
	}
</style>
