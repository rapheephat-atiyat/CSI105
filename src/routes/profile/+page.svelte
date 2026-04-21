<script lang="ts">
	import Background from '$lib/components/ui/Background.svelte';
	import { Trophy, Clock, Swords, CheckCircle2, Gamepad2, ArrowLeft } from 'lucide-svelte';

	let { data } = $props();
	let user = $derived(data.user);
	let history = $derived(data.history);

	function formatDate(date: Date | string | null | undefined) {
		if (!date) return 'N/A';
		return new Date(date).toLocaleString('th-TH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'ended':
				return 'bg-green-500/20 text-green-400 border-green-500/20';
			case 'playing':
				return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
			case 'waiting':
				return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
			default:
				return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/20';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'ended':
				return 'จบเกมแล้ว';
			case 'playing':
				return 'กำลังเล่น';
			case 'waiting':
				return 'รอเริ่มเกม';
			default:
				return status;
		}
	}
</script>

<svelte:head>
	<title>โปรไฟล์ของฉัน | Sorting Match</title>
</svelte:head>

<Background />

<div class="container mx-auto min-h-screen px-4 py-8 pb-20">
	<a href="/" class="mb-8 inline-flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10 active:scale-95">
		<ArrowLeft size={16} />
		กลับหน้าหลัก
	</a>

	<div class="grid gap-8 lg:grid-cols-[1fr_2fr]">
		<div class="h-fit rounded-4xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
			<div class="flex flex-col items-center text-center">
				<div class="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white/10 bg-zinc-800 shadow-xl">
					<img src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="Profile avatar" class="h-full w-full object-cover" />
				</div>

				<h1 class="mt-6 text-3xl font-black tracking-tight text-white">{user.name}</h1>
				<p class="mt-2 text-sm font-medium text-zinc-400">{user.email}</p>

				<div class="mt-8 flex w-full flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
					<div class="flex items-center justify-between">
						<span class="flex items-center gap-2 text-sm font-medium text-zinc-400">
							<Trophy size={16} class="text-yellow-500" />
							คะแนนแรงค์สะสม
						</span>
					</div>
					<div class="text-left text-3xl font-black text-white">{user.rankScore ?? user.user_metadata?.rankScore ?? 0} <span class="text-sm font-bold text-zinc-500">PT</span></div>
				</div>
			</div>
		</div>

		<div class="flex flex-col gap-6">
			<div>
				<h2 class="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
					<Swords size={24} class="text-blue-400" />
					ประวัติการแข่งขันล่าสุด
				</h2>
				<p class="mt-1 text-sm text-zinc-400">เกมและการฝึกซ้อม 20 ครั้งล่าสุดของคุณ</p>
			</div>

			<div class="flex flex-col gap-4">
				{#if history.length === 0}
					<div class="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 py-16 text-center backdrop-blur-sm">
						<Clock size={48} class="mb-4 text-zinc-600" />
						<h3 class="text-lg font-bold text-white">ยังไม่มีประวัติการเล่นเลย</h3>
						<p class="mt-1 text-sm text-zinc-400">ลองไปเล่นสักเกมสิประวัติจะขึ้นที่นี่!</p>
						<a href="/lobby" class="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition-all hover:bg-blue-500 active:scale-95">เริ่มแข่งขันเดี๋ยวนี้</a>
					</div>
				{:else}
					{#each history as match}
						<div class="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 transition-all hover:border-white/20 hover:bg-white/10">
							<div class="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
								<div class="flex items-center gap-4">
									<div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
										<Gamepad2 size={24} class="text-indigo-400" />
									</div>
									<div class="flex flex-col">
										<h4 class="text-lg font-bold text-white">{match.algorithm}</h4>
										<div class="mt-0.5 flex items-center gap-2">
											<span class="rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-xs font-semibold text-zinc-300 uppercase">{match.mode}</span>
											<span class="flex items-center gap-1 text-xs font-medium text-zinc-400">
												<Clock size={12} />
												{formatDate(match.createdAt)}
											</span>
										</div>
									</div>
								</div>

								<div class="flex flex-row items-center gap-6 border-t border-white/10 pt-4 sm:flex-row-reverse sm:border-none sm:pt-0">
									<div class="text-right">
										<p class="text-xs font-medium text-zinc-400">คะแนน (Score)</p>
										<p class="text-2xl font-black text-white">{match.score}</p>
									</div>
									<div class="flex flex-col items-start gap-1 sm:items-end">
										<span class="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold {getStatusColor(match.status)}">
											{#if match.status === 'ended'}
												<CheckCircle2 size={12} />
											{:else}
												<div class="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></div>
											{/if}
											{getStatusText(match.status)}
										</span>
									</div>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>
