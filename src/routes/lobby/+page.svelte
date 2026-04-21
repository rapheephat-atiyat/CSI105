<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import { io, type Socket } from 'socket.io-client';
	import ActionCard from '$lib/components/ui/ActionCard.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import { Lock, Play, Plus, Search, Server, Users, Wifi, Globe, Key, Trophy, Crown, Dumbbell } from 'lucide-svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import Swal from 'sweetalert2';

	interface Room {
		id: string;
		joinCode: string;
		name: string;
		host: string;
		players: number;
		maxPlayers: number;
		mode: string;
		algorithm: string;
		status: 'waiting' | 'playing' | 'ended';
		isPrivate: boolean;
		ping: number;
		createdAt: Date | string;
	}

	let { data } = $props();

	let showGuestJoinModal = $state(false);
	let showCreateModal = $state(false);
	let showManualJoinModal = $state(false);
	let showPinModal = $state(false);

	let guestJoinCode = $state('');
	let guestNameInput = $state('');
	let joinRoomPin = $state('');
	let searchQuery = $state('');

	let createRoomMode = $state<string>('normal');
	let createRoomAlgo = $state<string>('Bubble Sort');
	let createRoomMaxPlayers = $state(2);
	let createRoomPrivate = $state(false);
	let createRoomPin = $state('');

	let rooms = $state<Room[]>(untrack(() => data.init ?? []));
	let filteredRooms = $derived(rooms.filter((r) => r.joinCode.toLowerCase().includes(searchQuery.toLowerCase()) || r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.host.toLowerCase().includes(searchQuery.toLowerCase())));

	let ping = $state(0);
	let user = $derived(data.user);

	let socket: Socket;
	let waveCanvas: HTMLCanvasElement;
	let pingHistory: number[] = Array(40).fill(0);
	let animId: number;

	const algorithms = $derived(data.algorithms);
	const difficulties = $derived(data.modes);

	onMount(() => {
		socket = io({ withCredentials: true });

		socket.on('lobby:update', (update: { id: string; players: number }) => {
			rooms = rooms.map((r) => (r.joinCode === update.id ? { ...r, players: update.players } : r));
		});

		socket.on('lobby:new', (room: Room) => {
			if (!rooms.find((r) => r.id === room.id)) {
				rooms = [room, ...rooms];
			}
		});

		socket.on('lobby:remove', ({ id }: { id: string }) => {
			rooms = rooms.filter((r) => r.joinCode !== id);
		});

		socket.on('connect', () => {
			startPing();
		});

		startWave();
	});

	onDestroy(() => {
		if (browser) {
			socket?.disconnect();
			cancelAnimationFrame(animId);
		}
	});

	function handleCreateClick() {
		showCreateModal = true;
	}

	function handleManualJoinClick() {
		guestJoinCode = '';
		showManualJoinModal = true;
	}

	function handleJoinClick(rCode: string, isPrivate: boolean = false) {
		guestJoinCode = rCode;
		if (isPrivate) {
			joinRoomPin = '';
			showPinModal = true;
		} else if (user) {
			goto(`/competition/${rCode}`);
		} else {
			showGuestJoinModal = true;
		}
	}

	async function createRoom() {
		const finalName = guestNameInput.trim() === '' ? 'Anonymous' : guestNameInput.trim();
		const res = await fetch('/api/rooms', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mode: createRoomMode,
				algorithm: createRoomAlgo,
				maxPlayers: createRoomMaxPlayers,
				isPrivate: createRoomPrivate,
				password: createRoomPrivate ? createRoomPin || undefined : undefined,
				name: finalName
			})
		});
		const json = await res.json();

		if (json.success) {
			const room = json.data;
			if (!user) {
				goto(`/competition/${room.joinCode}?name=${encodeURIComponent(finalName)}`);
			} else {
				goto(`/competition/${room.joinCode}`);
			}
		}
	}

	function startPing() {
		const interval = setInterval(() => {
			if (!socket?.connected) {
				clearInterval(interval);
				return;
			}
			const start = Date.now();
			socket.emit('ping:check');
			socket.once('ping:response', () => {
				ping = Date.now() - start;
				pingHistory = [...pingHistory.slice(1), ping];
			});
		}, 2000);
	}

	function startWave() {
		function draw() {
			if (!waveCanvas) {
				animId = requestAnimationFrame(draw);
				return;
			}
			const ctx = waveCanvas.getContext('2d')!;
			const W = waveCanvas.width;
			const H = waveCanvas.height;
			ctx.clearRect(0, 0, W, H);

			const max = Math.max(...pingHistory, 50);
			const min = Math.min(...pingHistory, 0);
			const range = Math.max(max - min, 10);

			const pts = pingHistory.map((v, i) => ({
				x: (i / (pingHistory.length - 1)) * W,
				y: H - 4 - ((v - min) / range) * (H - 8)
			}));

			const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
			fillGrad.addColorStop(0, 'rgba(0,200,255,0.15)');
			fillGrad.addColorStop(1, 'rgba(0,200,255,0)');

			ctx.beginPath();
			ctx.moveTo(pts[0].x, pts[0].y);
			for (let i = 1; i < pts.length - 1; i++) {
				ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
			}
			ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
			ctx.lineTo(W, H);
			ctx.lineTo(0, H);
			ctx.closePath();
			ctx.fillStyle = fillGrad;
			ctx.fill();

			const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
			lineGrad.addColorStop(0, 'rgba(0,180,255,0)');
			lineGrad.addColorStop(0.4, 'rgba(0,220,255,0.5)');
			lineGrad.addColorStop(0.7, 'rgba(80,200,255,0.85)');
			lineGrad.addColorStop(1, 'rgba(120,255,230,1)');

			ctx.beginPath();
			ctx.moveTo(pts[0].x, pts[0].y);
			for (let i = 1; i < pts.length - 1; i++) {
				ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) / 2, (pts[i].y + pts[i + 1].y) / 2);
			}
			ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
			ctx.strokeStyle = lineGrad;
			ctx.lineWidth = 1.5;
			ctx.shadowColor = 'rgba(0,220,255,0.6)';
			ctx.shadowBlur = 4;
			ctx.stroke();
			ctx.shadowBlur = 0;

			const tip = pts[pts.length - 1];
			ctx.beginPath();
			ctx.arc(tip.x, tip.y, 2.5, 0, Math.PI * 2);
			ctx.fillStyle = '#00e5ff';
			ctx.shadowColor = '#00e5ff';
			ctx.shadowBlur = 8;
			ctx.fill();
			ctx.shadowBlur = 0;

			animId = requestAnimationFrame(draw);
		}
		draw();
	}
</script>

<div class="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:py-24">
	<div class="mb-10 flex flex-col justify-between gap-6 sm:mb-14 md:flex-row md:items-end">
		<div>
			<h1 class="text-4xl font-black tracking-tight text-white uppercase md:text-5xl lg:text-6xl">
				Sort <span class="bg-linear-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">Lobby</span>
			</h1>
			<p class="mt-3 text-sm font-medium tracking-wide text-zinc-400/80">เข้าร่วมการแข่งขันหรือสร้างห้องของคุณเอง</p>
		</div>

		<div class="inline-flex items-center gap-2.5 self-start rounded-lg border px-3.5 py-2 md:self-auto" style="background: rgba(5,20,40,0.85); border-color: rgba(0,200,255,0.2);">
			<span class="size-1.5 shrink-0 animate-pulse rounded-full bg-cyan-400" style="box-shadow: 0 0 6px #22d3ee;"></span>
			<span class="font-mono text-[11px] tracking-widest text-cyan-400/70 uppercase"> Ping </span>
			<canvas bind:this={waveCanvas} width="80" height="28" class="block"></canvas>
			<span class="min-w-11 text-right font-mono text-[13px] font-semibold text-cyan-400">
				{ping} ms
			</span>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
		<div class="flex flex-col gap-10 lg:col-span-8">
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<ActionCard title="แข่งขันด่วน" description="เข้าร่วมการแข่งขันทันที" colorClass="blue" onClick={() => {}}>
					{#snippet icon()}<Play size={24} fill="currentColor" class="ml-1" />{/snippet}
				</ActionCard>

				<ActionCard title="สร้างห้อง" description="สร้างห้องของคุณเอง" colorClass="indigo" onClick={handleCreateClick}>
					{#snippet icon()}<Plus size={24} class="ml-1" />{/snippet}
				</ActionCard>

				<ActionCard title="เข้าร่วมรหัส" description="เข้าห้องส่วนตัวด้วยรหัส" colorClass="emerald" onClick={handleManualJoinClick}>
					{#snippet icon()}<Key size={24} class="ml-1" />{/snippet}
				</ActionCard>

				<ActionCard title="โหมดฝึกซ้อม" description="แวะฝึกซ้อมทักษะก่อนท้าดวล" colorClass="indigo" onClick={() => goto('/practice')}>
					{#snippet icon()}<Dumbbell size={24} />{/snippet}
				</ActionCard>
			</div>

			<div class="rounded-3xl border border-white/5 bg-neutral-950/50 p-1 shadow-2xl backdrop-blur-3xl sm:rounded-4xl sm:p-1.5">
				<div class="flex flex-col rounded-3xl bg-white/1 sm:rounded-4xl">
					<div class="flex flex-col justify-between gap-4 border-b border-white/5 px-5 py-5 sm:flex-row sm:items-center sm:px-8 sm:py-6">
						<div class="flex items-center gap-2">
							<Server size={22} class="ml-1 text-blue-400 sm:h-6 sm:w-6" />
							<h3 class="text-lg font-bold text-white sm:text-xl">ห้องแข่งขัน</h3>
						</div>

						<div class="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/1 px-3 py-2 sm:w-auto sm:px-4">
							<Search size={16} class="shrink-0 text-zinc-500" />
							<input type="text" bind:value={searchQuery} placeholder="ค้นหาห้อง" class="w-full bg-transparent text-sm text-white/90 transition-all outline-none placeholder:text-zinc-600 focus:w-full sm:w-32 sm:focus:w-48" />
						</div>
					</div>

					<div class="flex flex-col gap-2 px-3 py-4 sm:px-4">
						{#if filteredRooms.length === 0}
							<div class="flex items-center justify-center py-12">
								<p class="text-sm text-zinc-500">ไม่พบห้องแข่งขัน</p>
							</div>
						{:else}
							{#each filteredRooms as room (room.id)}
								<div class="group flex flex-col items-start justify-between gap-4 rounded-2xl border border-transparent p-3 transition-all hover:border-white/5 hover:bg-white/3 sm:flex-row sm:items-center sm:p-4">
									<div class="flex w-full items-center gap-4 sm:w-auto sm:gap-6">
										<div class="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-black/40 font-mono text-xs text-zinc-500 transition-colors group-hover:border-blue-500/30 group-hover:text-blue-400 sm:w-16">
											{room.joinCode}
										</div>
										<div class="flex w-full flex-col">
											<div class="text-sm font-bold text-white/90 sm:text-base">{room.name}</div>
											<div class="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-zinc-500/80 sm:text-xs">
												<span class="flex items-center gap-1 sm:gap-1.5"><Server size={14} class="text-zinc-600" /> {room.host}</span>
												<span class="flex items-center gap-1 sm:gap-1.5">
													{#if room.isPrivate}
														<Lock size={14} class="text-amber-500/70" /> ส่วนตัว
													{:else}
														<Globe size={14} class="text-emerald-500/70" /> สาธารณะ
													{/if}
												</span>
												<span class="flex items-center gap-1 sm:gap-1.5"><Users size={14} class="text-zinc-600" /> {room.players}/{room.maxPlayers}</span>
												<span class="flex items-center gap-1 text-blue-500/70 sm:gap-1.5"><Wifi size={14} /> {room.ping}ms</span>
											</div>
										</div>
									</div>
									<button onclick={() => handleJoinClick(room.joinCode, room.isPrivate)} class="w-full shrink-0 rounded-xl border border-blue-500/20 bg-blue-600/10 px-8 py-3 text-xs font-bold tracking-widest text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0)] transition-all hover:border-blue-500/0 hover:bg-blue-600 hover:text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95 sm:w-auto"> JOIN </button>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-8 lg:col-span-4">
			<div class="relative overflow-hidden rounded-3xl border border-white/5 bg-neutral-950/50 p-6 opacity-90 shadow-2xl backdrop-blur-3xl transition-all hover:border-white/10 hover:opacity-100 sm:rounded-4xl sm:p-8">
				<div class="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-600/10 blur-[80px]"></div>

				<div class="relative z-10 flex flex-col items-center">
					<div class="mb-4 flex w-full items-center gap-3 border-b border-white/10 pb-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-tr from-amber-500/20 to-orange-500/20 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)] ring-1 ring-amber-500/30">
							<Trophy size={24} />
						</div>
						<div>
							<h3 class="text-xl font-black tracking-tight text-white">LeaderBoard</h3>
							<p class="text-[10px] font-medium tracking-wider text-amber-500/80 uppercase">Top Players</p>
						</div>
					</div>

					<div class="flex w-full flex-col gap-2.5">
						{#each data.leaderboard as player, index}
							<div class="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-3 transition-all hover:border-amber-500/20 hover:bg-white/10">
								{#if index === 0}
									<div class="absolute inset-0 bg-linear-to-r from-amber-500/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
								{:else if index === 1}
									<div class="absolute inset-0 bg-linear-to-r from-zinc-400/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
								{:else if index === 2}
									<div class="absolute inset-0 bg-linear-to-r from-orange-600/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
								{/if}

								<div class="relative z-10 flex w-full items-center justify-between">
									<div class="flex items-center gap-3.5">
										<div
											class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black shadow-inner
											{index === 0 ? 'bg-linear-to-br from-amber-300 to-amber-600 text-amber-950 shadow-amber-500/50' : index === 1 ? 'bg-linear-to-br from-zinc-300 to-zinc-500 text-zinc-900 shadow-zinc-400/50' : index === 2 ? 'bg-linear-to-br from-orange-400 to-orange-700 text-orange-950 shadow-orange-600/50' : 'bg-white/5 text-white/40 ring-1 ring-white/10'}"
										>
											{index + 1}
										</div>
										<div class="relative">
											<img src={player.image ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} alt={player.name} class="h-10 w-10 rounded-full object-cover shadow-md ring-2 ring-white/10 transition-all group-hover:ring-white/30" />
											{#if index === 0}
												<div class="absolute -top-1.5 -right-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-linear-to-tr from-amber-300 to-amber-500 shadow-sm ring-[2.5px] ring-neutral-900">
													<Crown size={13} class="text-amber-950" strokeWidth={2.5} />
												</div>
											{/if}
										</div>
										<span class="max-w-[100px] truncate text-sm font-bold text-white/90 transition-colors group-hover:text-white sm:max-w-[120px]">{player.name}</span>
									</div>
									<div class="flex items-end gap-1">
										<span class="text-base leading-none font-black {index === 0 ? 'text-amber-400' : index === 1 ? 'text-zinc-300' : index === 2 ? 'text-orange-400' : 'text-blue-400/80'}">
											{player.rankScore.toLocaleString()}
										</span>
										<span class="mb-0.5 text-[9px] font-bold tracking-widest text-zinc-500 uppercase">PTS</span>
									</div>
								</div>
							</div>
						{:else}
							<div class="flex flex-col items-center justify-center gap-2 py-10 opacity-60">
								<Trophy size={32} class="text-zinc-600" />
								<p class="text-xs font-medium tracking-wide text-zinc-500">Unranked Region</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

{#if showGuestJoinModal}
	<Modal title="ตั้งชื่อผู้เล่นของคุณ" description="คุณยังไม่ได้เข้าสู่ระบบ กรุณาตั้งชื่อเพื่อใช้ในการแข่งขัน (หรือเว้นว่างไว้เพื่อใช้ Anonymous)" glowColor="bg-blue-600/10">
		<Input
			bind:value={guestNameInput}
			placeholder="Anonymous"
			flavor="blue"
			inputClass="py-3 font-medium"
			onkeydown={(e: KeyboardEvent) => {
				if (e.key === 'Enter') {
					showGuestJoinModal = false;
					goto(`/competition/${guestJoinCode}?name=${encodeURIComponent(guestNameInput)}`);
				}
			}}
		/>

		<div class="mt-2 flex gap-3">
			<Button variant="secondary" class="flex-1" onclick={() => (showGuestJoinModal = false)}>ยกเลิก</Button>
			<Button
				variant="primary"
				class="flex-1"
				onclick={() => {
					showGuestJoinModal = false;
					goto(`/competition/${guestJoinCode}?name=${encodeURIComponent(guestNameInput)}`);
				}}
			>
				เข้าเล่นเลย
			</Button>
		</div>
	</Modal>
{/if}

{#if showCreateModal}
	<Modal title="สร้างห้องแข่งขัน" description="ตั้งค่าห้องสำหรับการแข่งขันของคุณ" glowColor="bg-indigo-600/10" maxWidth="max-w-md">
		{#if !user}
			<Input label="ชื่อผู้เล่น (สำหรับ Guest)" bind:value={guestNameInput} placeholder="Anonymous" flavor="blue" />
		{/if}

		<div class="grid grid-cols-2 gap-4">
			<Select label="ระดับความยาก (Mode)" bind:value={createRoomMode} flavor="indigo" options={difficulties.map((d) => ({ value: d, label: d }))} />

			<Select
				label="จำนวนผู้เล่น (Max Players)"
				bind:value={createRoomMaxPlayers}
				flavor="indigo"
				options={[
					{ value: 2, label: '2 Players' },
					{ value: 3, label: '3 Players' },
					{ value: 4, label: '4 Players' },
					{ value: 8, label: '8 Players' }
				]}
			/>
		</div>

		<Select label="อัลกอริทึม (Algorithm)" bind:value={createRoomAlgo} flavor="indigo" options={algorithms.map((a) => ({ value: a, label: a }))} />

		<div class="mt-1 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
			<Checkbox label="ตั้งเป็นห้องส่วนตัว (Private Room)" bind:checked={createRoomPrivate} flavor="indigo" />

			{#if createRoomPrivate}
				<div class="animate-in fade-in slide-in-from-top-2 mt-2 border-t border-white/10 pt-3 duration-200">
					<Input label="รหัสผ่าน (PIN)" bind:value={createRoomPin} placeholder="เว้นว่างถ้าไม่ต้องการ PIN" flavor="indigo" inputClass="font-mono" />
				</div>
			{/if}
		</div>

		<div class="mt-4 flex gap-3">
			<Button variant="secondary" class="flex-1" onclick={() => (showCreateModal = false)}>ยกเลิก</Button>
			<Button
				variant="indigo"
				class="flex-1"
				onclick={() => {
					showCreateModal = false;
					createRoom();
				}}
			>
				สร้างห้องเลย
			</Button>
		</div>
	</Modal>
{/if}

{#if showManualJoinModal}
	<Modal title="เข้าร่วมห้องส่วนตัว" description="กรุณากรอกรหัสห้อง (เช่น RM-XXXXXX)" glowColor="bg-emerald-600/10">
		<Input label="รหัสห้อง (Join Code)" bind:value={guestJoinCode} placeholder="RM-XXXXXX" flavor="emerald" inputClass="font-mono uppercase" />
		{#if !user}
			<Input
				label="ชื่อผู้เล่น (สำหรับ Guest)"
				bind:value={guestNameInput}
				placeholder="Anonymous"
				flavor="emerald"
				onkeydown={(e: KeyboardEvent) => {
					if (e.key === 'Enter') {
						showManualJoinModal = false;
						goto(`/competition/${guestJoinCode.toUpperCase()}?name=${encodeURIComponent(guestNameInput)}`);
					}
				}}
			/>
		{/if}

		<div class="mt-4 flex gap-3">
			<Button variant="secondary" class="flex-1" onclick={() => (showManualJoinModal = false)}>ยกเลิก</Button>
			<Button
				variant="success"
				class="flex-1"
				onclick={() => {
					showManualJoinModal = false;
					if (!user) goto(`/competition/${guestJoinCode.toUpperCase()}?name=${encodeURIComponent(guestNameInput)}`);
					else goto(`/competition/${guestJoinCode.toUpperCase()}`);
				}}
			>
				เข้าร่วม
			</Button>
		</div>
	</Modal>
{/if}

{#if showPinModal}
	<Modal title="ห้องส่วนตัว (Private Room)" description="กรุณากรอกรหัสผ่านเพื่อเข้าห้อง" glowColor="bg-red-600/10">
		<Input label="รหัสผ่าน (PIN)" bind:value={joinRoomPin} placeholder="PIN ของห้อง" flavor="red" inputClass="font-mono" />
		{#if !user}
			<Input
				label="ชื่อผู้เล่น (สำหรับ Guest)"
				bind:value={guestNameInput}
				placeholder="Anonymous"
				flavor="red"
				onkeydown={(e: KeyboardEvent) => {
					if (e.key === 'Enter') {
						showPinModal = false;
						goto(`/competition/${guestJoinCode}?name=${encodeURIComponent(guestNameInput)}&pin=${encodeURIComponent(joinRoomPin)}`);
					}
				}}
			/>
		{/if}

		<div class="mt-4 flex gap-3">
			<Button variant="secondary" class="flex-1" onclick={() => (showPinModal = false)}>ยกเลิก</Button>
			<Button
				variant="danger"
				class="flex-1"
				onclick={async () => {
					try {
						const res = await fetch(`/api/rooms/${guestJoinCode}/verify`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ pin: joinRoomPin })
						});
						const result = await res.json();

						if (!result.success) {
							Swal.fire({
								icon: 'error',
								title: 'ไม่สามารถเข้าห้องได้',
								text: result.error || 'รหัส PIN ไม่ถูกต้อง',
								background: '#0a0a0a',
								color: '#fff'
							});
							return;
						}

						showPinModal = false;
						if (joinRoomPin) {
							sessionStorage.setItem('room_pin_' + guestJoinCode, joinRoomPin);
						}
						if (!user) goto(`/competition/${guestJoinCode}?name=${encodeURIComponent(guestNameInput)}`);
						else goto(`/competition/${guestJoinCode}`);
					} catch (e) {
						Swal.fire({
							icon: 'error',
							title: 'เกิดข้อผิดพลาด',
							text: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้',
							background: '#0a0a0a',
							color: '#fff'
						});
					}
				}}
			>
				เข้าเล่นเลย
			</Button>
		</div>
	</Modal>
{/if}
