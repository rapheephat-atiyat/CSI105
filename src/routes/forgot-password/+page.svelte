<script lang="ts">
	import { authClient } from '$lib/client/auth';
	import { goto } from '$app/navigation';
	import { Loader2, Mail, KeyRound, ArrowLeft } from 'lucide-svelte';
	import Swal from 'sweetalert2';
	import { PUBLIC_APP_NAME } from '$env/static/public';

	let email = $state('');
	let isLoading = $state(false);
	let isSent = $state(false);

	async function handleResetPassword(e: Event) {
		e.preventDefault();
		isLoading = true;

		const { data, error } = await (authClient as any).requestPasswordReset({
			email,
			redirectTo: '/reset-password'
		});

		isLoading = false;

		if (error) {
			Swal.fire({
				icon: 'error',
				title: 'เกิดข้อผิดพลาด',
				text: error.message || 'ไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านได้',
				background: '#171717',
				color: '#fff',
				confirmButtonColor: '#ef4444'
			});
		} else {
			isSent = true;
			Swal.fire({
				icon: 'success',
				title: 'ส่งลิงก์สำเร็จ',
				text: 'กรุณาตรวจสอบลิงก์รีเซ็ตรหัสผ่านในอีเมลของคุณ',
				background: '#171717',
				color: '#fff',
				confirmButtonColor: '#2563eb'
			});
		}
	}
</script>

<svelte:head>
	<title>ลืมรหัสผ่าน - {PUBLIC_APP_NAME}</title>
</svelte:head>

{#if isLoading}
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/50 backdrop-blur-sm">
		<Loader2 class="h-10 w-10 animate-spin text-blue-500" />
	</div>
{/if}

<div class="flex min-h-screen flex-col items-center justify-center p-4">
	<div class="w-full max-w-md rounded-4xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl">
		<div class="mb-8 text-center">
			<div class="mb-4 inline-flex rounded-2xl bg-blue-600/20 p-3">
				<KeyRound class="h-8 w-8 text-blue-500" />
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-white">ลืมรหัสผ่าน?</h1>
			<p class="mt-2 text-sm text-neutral-400">กรอกอีเมลที่คุณใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้</p>
		</div>

		{#if !isSent}
			<form onsubmit={handleResetPassword} class="space-y-4">
				<div class="space-y-1">
					<label for="email" class="ml-1 text-sm font-medium text-neutral-400">อีเมล</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
							<Mail class="h-5 w-5 text-neutral-500" />
						</div>
						<input id="email" type="email" required bind:value={email} placeholder="name@example.com" class="w-full rounded-2xl border border-white/10 bg-neutral-900/50 py-3.5 pr-4 pl-11 text-white transition-all placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none" />
					</div>
				</div>

				<button type="submit" class="mt-6 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-500 active:scale-[0.98]">ส่งลิงก์รีเซ็ตรหัสผ่าน</button>
			</form>
		{:else}
			<div class="flex flex-col items-center gap-4 rounded-2xl bg-green-500/10 p-6 text-center">
				<div class="text-green-400">
					<Mail class="mx-auto h-12 w-12 opacity-80" />
				</div>
				<div>
					<h3 class="font-bold text-green-400">ส่งลิงก์สำเร็จ!</h3>
					<p class="mt-2 text-sm text-neutral-400">หากอีเมลนี้อยู่ในระบบ คุณจะได้รับลิงก์สำหรับรีเซ็ตรหัสผ่าน กรุณาตรวจสอบในกล่องจดหมายของคุณ (หรือ Console ถ้ายังไม่มีระบบอีเมล)</p>
				</div>
			</div>
		{/if}

		<div class="mt-8 text-center">
			<a href="/signin" class="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white">
				<ArrowLeft size={16} />
				กลับไปหน้าเข้าสู่ระบบ
			</a>
		</div>
	</div>
</div>
