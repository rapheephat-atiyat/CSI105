<script lang="ts">
	import Background from '$lib/components/ui/Background.svelte';
	import { authClient } from '$lib/client/auth';
	import { goto } from '$app/navigation';
	import { Loader2, Lock, KeyRound } from 'lucide-svelte';
	import Swal from 'sweetalert2';

	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);

	async function handleResetPassword(e: Event) {
		e.preventDefault();

		if (password !== confirmPassword) {
			Swal.fire({
				icon: 'warning',
				title: 'รหัสผ่านไม่ตรงกัน',
				text: 'กรุณายืนยันรหัสผ่านให้ตรงกัน',
				background: '#171717',
				color: '#fff',
				confirmButtonColor: '#2563eb'
			});
			return;
		}

		if (password.length < 8) {
			Swal.fire({
				icon: 'warning',
				title: 'รหัสผ่านสั้นเกินไป',
				text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
				background: '#171717',
				color: '#fff',
				confirmButtonColor: '#2563eb'
			});
			return;
		}

		isLoading = true;

		const token = new URLSearchParams(window.location.search).get('token');

		if (!token) {
			isLoading = false;
			Swal.fire({
				icon: 'error',
				title: 'ไม่พบ Token',
				text: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้อง หรือคุณไม่ได้เข้าผ่านลิงก์ในอีเมล',
				background: '#171717',
				color: '#fff',
				confirmButtonColor: '#ef4444'
			});
			return;
		}

		const { data, error } = await authClient.resetPassword({
			newPassword: password,
			token: token
		});

		isLoading = false;

		if (error) {
			Swal.fire({
				icon: 'error',
				title: 'เกิดข้อผิดพลาด',
				text: error.message || 'ลิงก์รีเซ็ตรหัสผ่านอาจหมดอายุหรือไม่ถูกต้อง',
				background: '#171717',
				color: '#fff',
				confirmButtonColor: '#ef4444'
			});
		} else {
			Swal.fire({
				icon: 'success',
				title: 'เปลี่ยนรหัสผ่านสำเร็จ',
				text: 'คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที',
				background: '#171717',
				color: '#fff',
				confirmButtonColor: '#2563eb'
			}).then(() => {
				goto('/signin');
			});
		}
	}
</script>

<svelte:head>
	<title>ตั้งรหัสผ่านใหม่</title>
</svelte:head>

<Background />

{#if isLoading}
	<div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/50 backdrop-blur-sm">
		<Loader2 class="h-10 w-10 animate-spin text-blue-500" />
	</div>
{/if}

<div class="flex min-h-screen flex-col items-center justify-center p-4">
	<div class="w-full max-w-md rounded-4xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-3xl">
		<div class="mb-8 text-center">
			<div class="mb-4 inline-flex rounded-2xl bg-blue-600/20 p-3">
				<Lock class="h-8 w-8 text-blue-500" />
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-white">ตั้งรหัสผ่านใหม่</h1>
			<p class="mt-2 text-sm text-neutral-400">กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
		</div>

		<form onsubmit={handleResetPassword} class="space-y-4">
			<div class="space-y-1">
				<label for="password" class="ml-1 text-sm font-medium text-neutral-400">รหัสผ่านใหม่</label>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
						<KeyRound class="h-5 w-5 text-neutral-500" />
					</div>
					<input id="password" type="password" required bind:value={password} placeholder="ความยาวอย่างน้อย 8 ตัวอักษร" class="w-full rounded-2xl border border-white/10 bg-neutral-900/50 py-3.5 pr-4 pl-11 text-white transition-all placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none" />
				</div>
			</div>

			<div class="space-y-1">
				<label for="confirm-password" class="ml-1 text-sm font-medium text-neutral-400">ยืนยันรหัสผ่านใหม่</label>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
						<Lock class="h-5 w-5 text-neutral-500" />
					</div>
					<input id="confirm-password" type="password" required bind:value={confirmPassword} placeholder="พิมพ์รหัสผ่านอีกครั้ง" class="w-full rounded-2xl border border-white/10 bg-neutral-900/50 py-3.5 pr-4 pl-11 text-white transition-all placeholder:text-neutral-600 focus:ring-2 focus:ring-blue-500/50 focus:outline-none" />
				</div>
			</div>

			<button type="submit" class="mt-8 w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.2)] transition-all hover:bg-blue-500 active:scale-[0.98]">บันทึกรหัสผ่านใหม่</button>
		</form>
	</div>
</div>
