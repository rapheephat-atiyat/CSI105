<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_APP_NAME } from '$env/static/public';
	import { authClient } from '$lib/client/auth';
	import { BookOpen, ChevronDown, Gamepad2, Home, LogOut, Trophy, UserIcon, Menu, X } from 'lucide-svelte';

	const user = $derived($page.data.user);
	let isMobileMenuOpen = $state(false);

	const links = [
		{ name: 'หน้าหลัก', href: '/', icon: Home },
		{ name: 'บทเรียน', href: '/education', icon: BookOpen },
		{ name: 'แข่งขัน', href: '/lobby', icon: Trophy },
		{ name: 'ฝึกซ้อม', href: '/practice', icon: Gamepad2 }
	];

	async function handleLogout() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = '/signin';
				}
			}
		});
	}

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}
</script>

<nav class="sticky top-0 z-50 w-full backdrop-blur-md">
	<div class="absolute bottom-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent opacity-70"></div>

	<div class="container mx-auto flex h-16 items-center justify-between px-4">
		<div class="flex items-center gap-6">
			<a href="/" class="text-xl font-black tracking-tighter whitespace-nowrap text-white transition-all hover:opacity-80 md:text-2xl">
				{PUBLIC_APP_NAME || 'Sorting Match'}
			</a>

			<div class="hidden items-center gap-1 md:flex">
				{#each links as l}
					<a href={l.href} class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all duration-200 hover:bg-white/10 hover:text-white {$page.url.pathname === l.href ? 'bg-white/10 text-white' : 'text-zinc-400'}">
						<l.icon size={16} />
						<span class="text-sm font-medium whitespace-nowrap">{l.name}</span>
					</a>
				{/each}
			</div>
		</div>

		<div class="flex items-center">
			<div class="hidden items-center md:flex">
				{#if user}
					<div class="group relative">
						<button class="group flex items-center gap-2 rounded-full border border-white/5 bg-zinc-900/50 p-1 pr-3 transition-all hover:border-white/20 hover:bg-zinc-800">
							<div class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-800">
								<img src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="avatar" class="h-full w-full object-cover" />
							</div>
							<span class="text-sm font-medium">{user?.name}</span>
							<ChevronDown size={13} class="text-zinc-600 transition-transform duration-300 group-hover:rotate-180" />
						</button>

						<div class="invisible absolute top-full right-0 z-50 w-48 origin-top-right scale-95 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
							<div class="rounded-2xl border border-white/5 bg-black/95 p-1.5 shadow-2xl backdrop-blur-2xl">
								<a href="/profile" class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-zinc-400 transition-all hover:bg-white/5 hover:text-white">
									<UserIcon size={14} />
									โปรไฟล์ของฉัน
								</a>
								<div class="my-1 h-px bg-white/5"></div>
								<button onclick={handleLogout} class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300">
									<LogOut size={14} />
									ออกจากระบบ
								</button>
							</div>
						</div>
					</div>
				{:else}
					<a href="/signin" class="flex items-center rounded-xl bg-white px-5 py-1.5 text-sm font-bold text-black transition-all hover:bg-zinc-200 active:scale-95">เริ่มเล่นเกม</a>
				{/if}
			</div>

			<button class="p-2 text-zinc-400 transition-colors hover:text-white md:hidden" onclick={toggleMobileMenu} aria-label="Toggle Menu">
				{#if isMobileMenuOpen}
					<X size={24} />
				{:else}
					<Menu size={24} />
				{/if}
			</button>
		</div>
	</div>

	{#if isMobileMenuOpen}
		<div class="relative bg-black/95 backdrop-blur-2xl md:hidden">
			<div class="absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent via-white/20 to-transparent opacity-70"></div>

			<div class="flex flex-col gap-2 p-4">
				{#each links as l}
					<a href={l.href} onclick={() => (isMobileMenuOpen = false)} class="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:bg-white/5 {$page.url.pathname === l.href ? 'bg-white/10 text-white' : 'text-zinc-400'}">
						<l.icon size={18} />
						<span class="font-medium">{l.name}</span>
					</a>
				{/each}

				<div class="my-2 h-px bg-white/5"></div>

				{#if user}
					<div class="mb-2 flex items-center gap-3 px-4 py-2">
						<div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-zinc-800">
							<img src={user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="avatar" class="h-full w-full object-cover" />
						</div>
						<div class="flex flex-col">
							<span class="text-sm font-bold text-white">{user?.name}</span>
							<span class="text-xs text-zinc-500">Player</span>
						</div>
					</div>
					<a href="/profile" onclick={() => (isMobileMenuOpen = false)} class="flex items-center gap-3 rounded-xl px-4 py-3 text-zinc-400 transition-all hover:bg-white/5 hover:text-white">
						<UserIcon size={18} />
						<span class="font-medium">โปรไฟล์ของฉัน</span>
					</a>
					<button
						onclick={() => {
							handleLogout();
							isMobileMenuOpen = false;
						}}
						class="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
					>
						<LogOut size={18} />
						<span class="font-bold">ออกจากระบบ</span>
					</button>
				{:else}
					<a href="/login" onclick={() => (isMobileMenuOpen = false)} class="flex w-full items-center justify-center rounded-xl bg-white py-3 font-bold text-black transition-all hover:bg-zinc-200 active:scale-95"> เริ่มเล่นเกม </a>
				{/if}
			</div>
		</div>
	{/if}
</nav>
