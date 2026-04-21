import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as schema from './db/schema';

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: env.EMAIL_USER,
		pass: env.EMAIL_PASS
	}
});

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'pg', schema: {
			user: schema.users,
			account: schema.accounts,
			session: schema.sessions,
			verification: schema.verifications
		}
	}),
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["github", "discord", "roblox"]
		}
	},
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			try {
				await transporter.sendMail({
					from: "Sorting Match <no-reply@sorting-match.space>",
					to: user.email,
					subject: 'รีเซ็ตรหัสผ่านบัญชี Sorting Match ของคุณ',
					html: `
						<div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
							<h2 style="color: #333;">คำขอรีเซ็ตรหัสผ่าน</h2>
							<p>สวัสดี ${user.name || 'ผู้ใช้งาน'},</p>
							<p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชี <strong>${user.email}</strong></p>
							<p>หากคุณเป็นคนส่งคำขอนี้ กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
							<div style="text-align: center; margin: 30px 0;">
								<a href="${url}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
									ตั้งรหัสผ่านใหม่
								</a>
							</div>
							<p style="color: #666; font-size: 14px;">หากปุ่มด้านบนใช้งานไม่ได้ กรุณาคัดลอกลิงก์นี้ไปเปิดในเบราว์เซอร์:</p>
							<p style="word-break: break-all; color: #666; font-size: 14px;">
								<a href="${url}">${url}</a>
							</p>
							<hr style="border: 1px solid #eaeaea; margin-top: 40px;" />
							<p style="color: #999; font-size: 12px; text-align: center;">หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน คุณสามารถละเว้นอีเมลฉบับนี้ได้</p>
						</div>
					`
				});
			} catch (error) {
				console.error('Failed to send password reset email:', error);
			}
		}
	},
	socialProviders: {
		github: {
			clientId: env.GITHUB_CLIENT_ID,
			clientSecret: env.GITHUB_CLIENT_SECRET
		},
		discord: {
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET
		},
		google: {
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		},
		roblox: {
			clientId: env.ROBLOX_CLIENT_ID,
			clientSecret: env.ROBLOX_CLIENT_SECRET
		}
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
