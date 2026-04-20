<script lang="ts">
	import Background from '$lib/components/ui/Background.svelte';
	import { authClient } from '$lib/client/auth';
	import { goto } from '$app/navigation';
	import { Loader2, Lock, UserPlus, Mail, User } from 'lucide-svelte';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');

	async function handleEmailSignup(e: Event) {
		e.preventDefault();
		isLoading = true;
		errorMessage = '';

		const { data, error } = await authClient.signUp.email({
			email,
			password,
			name: username
		});

		if (error) {
			errorMessage = error.message || 'การสมัครสมาชิกล้มเหลว กรุณาลองใหม่อีกครั้ง';
			isLoading = false;
		} else {
			goto('/');
		}
	}

	async function handleSocialSignup(provider: 'github' | 'google' | 'discord' | 'facebook') {
		isLoading = true;
		errorMessage = '';
		const { error } = await authClient.signIn.social({
			provider,
			callbackURL: '/'
		});
		if (error) {
			errorMessage = error.message || `${provider} login ล้มเหลว`;
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>สมัครสมาชิก</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-md rounded-4xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl">
		<div class="mb-8 text-center">
			<div class="mb-4 inline-flex rounded-2xl bg-blue-600/20 p-3">
				<UserPlus class="h-8 w-8 text-blue-500" />
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-white">สร้างบัญชีใหม่</h1>
			<p class="mt-2 text-sm text-neutral-400">เริ่มต้นสะสมคะแนนและไต่อันดับของคุณ</p>
		</div>

		{#if errorMessage}
			<div class="mb-6 rounded-xl border border-red-500/20 bg-red-500/20 p-3 text-center text-sm text-red-400">
				{errorMessage}
			</div>
		{/if}

		<div class="space-y-6">
			<div class="grid grid-cols-4 gap-2">
				<button onclick={() => handleSocialSignup('github')} type="button" class="flex justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-white transition-all hover:bg-[#24292e] active:scale-[0.98]"
					><span class="size-5"
						><svg fill="#000000" viewBox="0 -0.5 25 25" xmlns="http://www.w3.org/2000/svg"
							><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"
								><path
									d="m12.301 0h.093c2.242 0 4.34.613 6.137 1.68l-.055-.031c1.871 1.094 3.386 2.609 4.449 4.422l.031.058c1.04 1.769 1.654 3.896 1.654 6.166 0 5.406-3.483 10-8.327 11.658l-.087.026c-.063.02-.135.031-.209.031-.162 0-.312-.054-.433-.144l.002.001c-.128-.115-.208-.281-.208-.466 0-.005 0-.01 0-.014v.001q0-.048.008-1.226t.008-2.154c.007-.075.011-.161.011-.249 0-.792-.323-1.508-.844-2.025.618-.061 1.176-.163 1.718-.305l-.076.017c.573-.16 1.073-.373 1.537-.642l-.031.017c.508-.28.938-.636 1.292-1.058l.006-.007c.372-.476.663-1.036.84-1.645l.009-.035c.209-.683.329-1.468.329-2.281 0-.045 0-.091-.001-.136v.007c0-.022.001-.047.001-.072 0-1.248-.482-2.383-1.269-3.23l.003.003c.168-.44.265-.948.265-1.479 0-.649-.145-1.263-.404-1.814l.011.026c-.115-.022-.246-.035-.381-.035-.334 0-.649.078-.929.216l.012-.005c-.568.21-1.054.448-1.512.726l.038-.022-.609.384c-.922-.264-1.981-.416-3.075-.416s-2.153.152-3.157.436l.081-.02q-.256-.176-.681-.433c-.373-.214-.814-.421-1.272-.595l-.066-.022c-.293-.154-.64-.244-1.009-.244-.124 0-.246.01-.364.03l.013-.002c-.248.524-.393 1.139-.393 1.788 0 .531.097 1.04.275 1.509l-.01-.029c-.785.844-1.266 1.979-1.266 3.227 0 .025 0 .051.001.076v-.004c-.001.039-.001.084-.001.13 0 .809.12 1.591.344 2.327l-.015-.057c.189.643.476 1.202.85 1.693l-.009-.013c.354.435.782.793 1.267 1.062l.022.011c.432.252.933.465 1.46.614l.046.011c.466.125 1.024.227 1.595.284l.046.004c-.431.428-.718 1-.784 1.638l-.001.012c-.207.101-.448.183-.699.236l-.021.004c-.256.051-.549.08-.85.08-.022 0-.044 0-.066 0h.003c-.394-.008-.756-.136-1.055-.348l.006.004c-.371-.259-.671-.595-.881-.986l-.007-.015c-.198-.336-.459-.614-.768-.827l-.009-.006c-.225-.169-.49-.301-.776-.38l-.016-.004-.32-.048c-.023-.002-.05-.003-.077-.003-.14 0-.273.028-.394.077l.007-.003q-.128.072-.08.184c.039.086.087.16.145.225l-.001-.001c.061.072.13.135.205.19l.003.002.112.08c.283.148.516.354.693.603l.004.006c.191.237.359.505.494.792l.01.024.16.368c.135.402.38.738.7.981l.005.004c.3.234.662.402 1.057.478l.016.002c.33.064.714.104 1.106.112h.007c.045.002.097.002.15.002.261 0 .517-.021.767-.062l-.027.004.368-.064q0 .609.008 1.418t.008.873v.014c0 .185-.08.351-.208.466h-.001c-.119.089-.268.143-.431.143-.075 0-.147-.011-.214-.032l.005.001c-4.929-1.689-8.409-6.283-8.409-11.69 0-2.268.612-4.393 1.681-6.219l-.032.058c1.094-1.871 2.609-3.386 4.422-4.449l.058-.031c1.739-1.034 3.835-1.645 6.073-1.645h.098-.005zm-7.64 17.666q.048-.112-.112-.192-.16-.048-.208.032-.048.112.112.192.144.096.208-.032zm.497.545q.112-.08-.032-.256-.16-.144-.256-.048-.112.08.032.256.159.157.256.047zm.48.72q.144-.112 0-.304-.128-.208-.272-.096-.144.08 0 .288t.272.112zm.672.673q.128-.128-.064-.304-.192-.192-.32-.048-.144.128.064.304.192.192.32.044zm.913.4q.048-.176-.208-.256-.24-.064-.304.112t.208.24q.24.097.304-.096zm1.009.08q0-.208-.272-.176-.256 0-.256.176 0 .208.272.176.256.001.256-.175zm.929-.16q-.032-.176-.288-.144-.256.048-.224.24t.288.128.225-.224z"
								></path></g
							></svg
						></span
					>
				</button>
				<button onclick={() => handleSocialSignup('google')} type="button" class="flex justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-white transition-all hover:bg-white/10 active:scale-[0.98]">
					<svg class="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
				</button>
				<button onclick={() => handleSocialSignup('discord')} type="button" class="flex justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-white transition-all hover:bg-[#5865F2] active:scale-[0.98]">
					<svg class="h-5 w-5 fill-current" viewBox="0 0 24 24"
						><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" /></svg
					>
				</button>
				<button onclick={() => handleSocialSignup('facebook')} type="button" class="flex justify-center rounded-xl border border-white/10 bg-white/5 py-3 text-white transition-all hover:bg-[#1877F2] active:scale-[0.98]"
					><span class="size-5">
						<svg viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"
							><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier">
								<title>Facebook-color</title> <desc>Created with Sketch.</desc> <defs> </defs>
								<g id="Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Color-" transform="translate(-200.000000, -160.000000)" fill="#4460A0"> <path d="M225.638355,208 L202.649232,208 C201.185673,208 200,206.813592 200,205.350603 L200,162.649211 C200,161.18585 201.185859,160 202.649232,160 L245.350955,160 C246.813955,160 248,161.18585 248,162.649211 L248,205.350603 C248,206.813778 246.813769,208 245.350955,208 L233.119305,208 L233.119305,189.411755 L239.358521,189.411755 L240.292755,182.167586 L233.119305,182.167586 L233.119305,177.542641 C233.119305,175.445287 233.701712,174.01601 236.70929,174.01601 L240.545311,174.014333 L240.545311,167.535091 C239.881886,167.446808 237.604784,167.24957 234.955552,167.24957 C229.424834,167.24957 225.638355,170.625526 225.638355,176.825209 L225.638355,182.167586 L219.383122,182.167586 L219.383122,189.411755 L225.638355,189.411755 L225.638355,208 L225.638355,208 Z" id="Facebook"> </path> </g> </g>
							</g></svg
						>
					</span>
				</button>
			</div>

			<div class="relative flex items-center py-2">
				<div class="grow border-t border-white/5"></div>
				<span class="mx-4 shrink text-xs font-bold tracking-widest text-neutral-600 uppercase">หรือใช้อีเมล</span>
				<div class="grow border-t border-white/5"></div>
			</div>

			<form onsubmit={handleEmailSignup} class="space-y-4">
				<div class="space-y-1">
					<label for="username" class="ml-1 text-sm font-medium text-neutral-400">ชื่อผู้ใช้งาน</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
							<User class="h-5 w-5 text-neutral-500" />
						</div>
						<input id="username" type="text" required bind:value={username} placeholder="Player One" class="w-full rounded-2xl border border-white/10 bg-neutral-900/50 py-3.5 pr-4 pl-11 text-white transition-all placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none" />
					</div>
				</div>

				<div class="space-y-1">
					<label for="email" class="ml-1 text-sm font-medium text-neutral-400">อีเมล</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
							<Mail class="h-5 w-5 text-neutral-500" />
						</div>
						<input id="email" type="email" required bind:value={email} placeholder="name@example.com" class="w-full rounded-2xl border border-white/10 bg-neutral-900/50 py-3.5 pr-4 pl-11 text-white transition-all placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none" />
					</div>
				</div>

				<div class="space-y-1">
					<label for="password" class="ml-1 text-sm font-medium text-neutral-400">รหัสผ่าน</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
							<Lock class="h-5 w-5 text-neutral-500" />
						</div>
						<input id="password" type="password" required bind:value={password} placeholder="••••••••" class="w-full rounded-2xl border border-white/10 bg-neutral-900/50 py-3.5 pr-4 pl-11 text-white transition-all placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none" />
					</div>
				</div>

				<button type="submit" class="mt-6 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-500 active:scale-[0.98]">สร้างบัญชี</button>
			</form>

			<p class="mt-6 text-center text-sm text-neutral-500">
				มีบัญชีผู้ใช้แล้ว? <a href="/signin" class="font-bold text-white transition-colors hover:text-blue-400 hover:underline">เข้าสู่ระบบ</a>
			</p>
		</div>
	</div>
</div>
