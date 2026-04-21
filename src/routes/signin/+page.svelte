<script lang="ts">
	import Background from '$lib/components/ui/Background.svelte';
	import { authClient } from '$lib/client/auth';
	import { goto } from '$app/navigation';
	import { Loader2, Lock, LogIn, Mail } from 'lucide-svelte';
	import Swal from 'sweetalert2';
	import { turnstile } from '@battlefieldduck/turnstile-svelte';
	import { PUBLIC_SITE_KEY } from '$env/static/public';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let turnstileToken = $state('');

	async function handleEmailLogin(e: Event) {
		e.preventDefault();

		if (!turnstileToken) {
			Swal.fire({
				icon: 'warning',
				title: 'กรุณายืนยันตัวตน',
				text: 'โปรดติ๊กถูกที่ช่องยืนยันตัวตนก่อนเข้าสู่ระบบ',
				background: '#171717',
				color: '#fff',
				confirmButtonColor: '#2563eb'
			});
			return;
		}

		isLoading = true;

		const { data, error } = await authClient.signIn.email({
			email,
			password,
			fetchOptions: {
				headers: {
					'x-turnstile-token': turnstileToken
				}
			}
		});

		if (error) {
			isLoading = false;
			if (window.turnstile) window.turnstile.reset();
			turnstileToken = '';
			Swal.fire({
				icon: 'error',
				title: 'เข้าสู่ระบบไม่สำเร็จ',
				text: error.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
				background: '#171717',
				color: '#fff',
				confirmButtonColor: '#ef4444'
			});
		} else {
			Swal.fire({
				icon: 'success',
				title: 'เข้าสู่ระบบสำเร็จ',
				text: 'กำลังพาท่านเข้าสู่หน้าหลัก...',
				timer: 1500,
				showConfirmButton: false,
				background: '#171717',
				color: '#fff'
			}).then(() => {
				goto('/');
			});
		}
	}

	async function handleSocialLogin(provider: 'github' | 'google' | 'discord' | 'roblox') {
		isLoading = true;
		const { error } = await authClient.signIn.social({
			provider,
			callbackURL: '/'
		});
		if (error) {
			isLoading = false;
			Swal.fire({
				icon: 'error',
				title: 'เข้าสู่ระบบล้มเหลว',
				text: error.message || `${provider} login ล้มเหลว`,
				background: '#171717',
				color: '#fff',
				confirmButtonColor: '#ef4444'
			});
		}
	}
</script>

<svelte:head>
	<title>เข้าสู่ระบบ</title>
</svelte:head>

<Background />

{#if isLoading}
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/50 backdrop-blur-sm">
		<Loader2 class="h-10 w-10 animate-spin text-blue-500" />
	</div>
{/if}

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-md rounded-4xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl">
		<div class="mb-8 text-center">
			<div class="mb-4 inline-flex rounded-2xl bg-blue-600/20 p-3">
				<LogIn class="h-8 w-8 text-blue-500" />
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-white">เข้าสู่ระบบ</h1>
			<p class="mt-2 text-sm text-neutral-400">ล็อกอินเพื่อบันทึกคะแนนสะสมและอันดับของคุณ</p>
		</div>

		<div class="space-y-6">
			<div class="grid grid-cols-2 gap-3">
				<button onclick={() => handleSocialLogin('github')} type="button" class="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#24292e] active:scale-[0.98]">
					<span class="size-5"
						><svg fill="#000000" viewBox="0 -0.5 25 25" xmlns="http://www.w3.org/2000/svg"
							><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"
								><path
									d="m12.301 0h.093c2.242 0 4.34.613 6.137 1.68l-.055-.031c1.871 1.094 3.386 2.609 4.449 4.422l.031.058c1.04 1.769 1.654 3.896 1.654 6.166 0 5.406-3.483 10-8.327 11.658l-.087.026c-.063.02-.135.031-.209.031-.162 0-.312-.054-.433-.144l.002.001c-.128-.115-.208-.281-.208-.466 0-.005 0-.01 0-.014v.001q0-.048.008-1.226t.008-2.154c.007-.075.011-.161.011-.249 0-.792-.323-1.508-.844-2.025.618-.061 1.176-.163 1.718-.305l-.076.017c.573-.16 1.073-.373 1.537-.642l-.031.017c.508-.28.938-.636 1.292-1.058l.006-.007c.372-.476.663-1.036.84-1.645l.009-.035c.209-.683.329-1.468.329-2.281 0-.045 0-.091-.001-.136v.007c0-.022.001-.047.001-.072 0-1.248-.482-2.383-1.269-3.23l.003.003c.168-.44.265-.948.265-1.479 0-.649-.145-1.263-.404-1.814l.011.026c-.115-.022-.246-.035-.381-.035-.334 0-.649.078-.929.216l.012-.005c-.568.21-1.054.448-1.512.726l.038-.022-.609.384c-.922-.264-1.981-.416-3.075-.416s-2.153.152-3.157.436l.081-.02q-.256-.176-.681-.433c-.373-.214-.814-.421-1.272-.595l-.066-.022c-.293-.154-.64-.244-1.009-.244-.124 0-.246.01-.364.03l.013-.002c-.248.524-.393 1.139-.393 1.788 0 .531.097 1.04.275 1.509l-.01-.029c-.785.844-1.266 1.979-1.266 3.227 0 .025 0 .051.001.076v-.004c-.001.039-.001.084-.001.13 0 .809.12 1.591.344 2.327l-.015-.057c.189.643.476 1.202.85 1.693l-.009-.013c.354.435.782.793 1.267 1.062l.022.011c.432.252.933.465 1.46.614l.046.011c.466.125 1.024.227 1.595.284l.046.004c-.431.428-.718 1-.784 1.638l-.001.012c-.207.101-.448.183-.699.236l-.021.004c-.256.051-.549.08-.85.08-.022 0-.044 0-.066 0h.003c-.394-.008-.756-.136-1.055-.348l.006.004c-.371-.259-.671-.595-.881-.986l-.007-.015c-.198-.336-.459-.614-.768-.827l-.009-.006c-.225-.169-.49-.301-.776-.38l-.016-.004-.32-.048c-.023-.002-.05-.003-.077-.003-.14 0-.273.028-.394.077l.007-.003q-.128.072-.08.184c.039.086.087.16.145.225l-.001-.001c.061.072.13.135.205.19l.003.002.112.08c.283.148.516.354.693.603l.004.006c.191.237.359.505.494.792l.01.024.16.368c.135.402.38.738.7.981l.005.004c.3.234.662.402 1.057.478l.016.002c.33.064.714.104 1.106.112h.007c.045.002.097.002.15.002.261 0 .517-.021.767-.062l-.027.004.368-.064q0 .609.008 1.418t.008.873v.014c0 .185-.08.351-.208.466h-.001c-.119.089-.268.143-.431.143-.075 0-.147-.011-.214-.032l.005.001c-4.929-1.689-8.409-6.283-8.409-11.69 0-2.268.612-4.393 1.681-6.219l-.032.058c1.094-1.871 2.609-3.386 4.422-4.449l.058-.031c1.739-1.034 3.835-1.645 6.073-1.645h.098-.005zm-7.64 17.666q.048-.112-.112-.192-.16-.048-.208.032-.048.112.112.192.144.096.208-.032zm.497.545q.112-.08-.032-.256-.16-.144-.256-.048-.112.08.032.256.159.157.256.047zm.48.72q.144-.112 0-.304-.128-.208-.272-.096-.144.08 0 .288t.272.112zm.672.673q.128-.128-.064-.304-.192-.192-.32-.048-.144.128.064.304.192.192.32.044zm.913.4q.048-.176-.208-.256-.24-.064-.304.112t.208.24q.24.097.304-.096zm1.009.08q0-.208-.272-.176-.256 0-.256.176 0 .208.272.176.256.001.256-.175zm.929-.16q-.032-.176-.288-.144-.256.048-.224.24t.288.128.225-.224z"
								></path></g
							></svg
						></span
					>
					GitHub
				</button>
				<button onclick={() => handleSocialLogin('google')} type="button" class="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-[0.98]">
					<svg class="h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
					Google
				</button>
				<button onclick={() => handleSocialLogin('discord')} type="button" class="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5865F2] active:scale-[0.98]">
					<span class="size-5"
						><svg viewBox="0 -28.5 256 256" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" preserveAspectRatio="xMidYMid" fill="#000000"
							><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier">
								<g>
									<path
										d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z"
										fill="#5865F2"
										fill-rule="nonzero"
									>
									</path>
								</g>
							</g>
						</svg>
					</span>
					Discord
				</button>
				<button onclick={() => handleSocialLogin('roblox')} type="button" class="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1877F2] active:scale-[0.98]">
					<span class="size-5">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320.4 320.4"><rect width="320.4" height="320.4" rx="54.8" fill="#3156ff" /><path fill="#fff" d="M99 56.5 266 99.5 223.2 266.6 56 223.7M180.2 193.5 193.5 144.6 144.6 131.4 131.4 180.2" /></svg>
					</span>
					Roblox
				</button>
			</div>

			<div class="relative flex items-center py-2">
				<div class="grow border-t border-white/5"></div>
				<span class="mx-4 shrink text-xs font-bold tracking-widest text-neutral-600 uppercase">หรือใช้อีเมล</span>
				<div class="grow border-t border-white/5"></div>
			</div>

			<form onsubmit={handleEmailLogin} class="space-y-4">
				<div class="space-y-1">
					<label for="email" class="ml-1 text-sm font-medium text-neutral-400">อีเมล</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
							<Mail class="h-5 w-5 text-neutral-500" />
						</div>
						<input id="email" type="email" bind:value={email} placeholder="name@example.com" class="w-full rounded-2xl border border-white/10 bg-neutral-900/50 py-3.5 pr-4 pl-11 text-white transition-all placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none" />
					</div>
				</div>

				<div class="space-y-1">
					<div class="ml-1 flex items-center justify-between">
						<label for="password" class="text-sm font-medium text-neutral-400">รหัสผ่าน</label>
						<a href="/forgot-password" class="text-xs text-blue-400 hover:text-blue-300 hover:underline">ลืมรหัสผ่าน?</a>
					</div>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
							<Lock class="h-5 w-5 text-neutral-500" />
						</div>
						<input id="password" type="password" required bind:value={password} placeholder="••••••••" class="w-full rounded-2xl border border-white/10 bg-neutral-900/50 py-3.5 pr-4 pl-11 text-white transition-all placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none" />
					</div>
				</div>

				<div class="mt-4 flex justify-center">
					<div {@attach turnstile({ sitekey: PUBLIC_SITE_KEY.replace(',', '').trim(), callback: (token) => turnstileToken = token, 'error-callback': () => turnstileToken = '', theme: 'dark' })}></div>
				</div>

				<button type="submit" class="mt-6 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-500 active:scale-[0.98]">เข้าสู่ระบบ</button>
			</form>

			<p class="mt-6 text-center text-sm text-neutral-500">
				ยังไม่มีบัญชีผู้ใช้? <a href="/signup" class="font-bold text-white transition-colors hover:text-blue-400 hover:underline">สมัครสมาชิกที่นี่</a>
			</p>
		</div>
	</div>
</div>
