import { env } from '../config/env';

type SendEmailOptions = {
	to: string;
	subject: string;
	text?: string;
	html?: string;
};

let nodemailer: any = null;
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	nodemailer = require('nodemailer');
} catch (_e) {
	nodemailer = null;
}

function isConfigured() {
	// Considerar configurado si hay host, user y pass; el puerto puede asumir por defecto 587
	return !!(env.mailSmtpHost && env.mailSmtpUser && env.mailSmtpPass && nodemailer);
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
	if (!isConfigured()) {
		// Fallback no-op en desarrollo cuando no hay SMTP o nodemailer
		// eslint-disable-next-line no-console
		console.log('[sendEmail noop]', options.subject, '→', options.to);
		return;
	}
	const port = env.mailSmtpPort ?? 587;
	const secure = port === 465;
	const transporter = nodemailer.createTransport({
		host: env.mailSmtpHost,
		port,
		secure,
		auth: {
			user: env.mailSmtpUser,
			pass: env.mailSmtpPass,
		},
	});
	try {
		await transporter.sendMail({
			from: env.mailFrom,
			to: options.to,
			subject: options.subject,
			text: options.text,
			html: options.html,
		});
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('[sendEmail error]', (err as Error)?.message || err);
	}
}


