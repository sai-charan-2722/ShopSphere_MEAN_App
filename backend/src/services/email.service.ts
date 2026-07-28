import fs from 'fs';
import path from 'path';
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: { user: env.email.user, pass: env.email.pass },
  });
  return transporter;
}

/** Resolve the templates directory in both dev (src) and prod (dist) layouts. */
function templatesDir(): string {
  const candidates = [
    path.join(__dirname, '..', 'templates'), // dist/templates (copied at build)
    path.join(process.cwd(), 'src', 'templates'), // dev fallback
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
}

const templateCache = new Map<string, string>();

function loadTemplate(name: string): string {
  if (templateCache.has(name)) return templateCache.get(name)!;
  const file = path.join(templatesDir(), `${name}.html`);
  const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '<p>{{message}}</p>';
  templateCache.set(name, html);
  return html;
}

/** Replace {{key}} placeholders with escaped values. */
function render(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => {
    const value = vars[key];
    return value === undefined ? '' : String(value);
  });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  vars?: Record<string, string | number>;
}

/**
 * Send an HTML email using a named template. Failures are logged but never
 * throw — email is a side effect that must not break the core flow.
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  try {
    if (!env.email.user || !env.email.pass) {
      console.warn(`[email] Skipping "${options.subject}" — SMTP not configured.`);
      return;
    }
    const html = render(loadTemplate(options.template), options.vars ?? {});
    await getTransporter().sendMail({
      from: env.email.from,
      to: options.to,
      subject: options.subject,
      html,
    });
    console.log(`📧 Email sent: "${options.subject}" → ${options.to}`);
  } catch (err) {
    console.error(`[email] Failed to send "${options.subject}":`, err);
  }
}

// ── Convenience wrappers matching PRD section 17 ──────────
const inr = (paise: number): string => `₹${(paise / 100).toLocaleString('en-IN')}`;

export const emailService = {
  orderConfirmed(to: string, vars: { name: string; orderId: string; total: number }): Promise<void> {
    return sendEmail({
      to,
      subject: `Your ShopSphere order #${vars.orderId} is confirmed!`,
      template: 'order-confirmed',
      vars: { name: vars.name, orderId: vars.orderId, total: inr(vars.total) },
    });
  },
  orderShipped(to: string, vars: { name: string; orderId: string; tracking: string }): Promise<void> {
    return sendEmail({
      to,
      subject: 'Your order is on its way! 🚚',
      template: 'order-shipped',
      vars,
    });
  },
  orderDelivered(to: string, vars: { name: string; orderId: string }): Promise<void> {
    return sendEmail({
      to,
      subject: 'Your order has been delivered!',
      template: 'order-delivered',
      vars,
    });
  },
  newOrderSeller(to: string, vars: { name: string; orderId: string; total: number }): Promise<void> {
    return sendEmail({
      to,
      subject: 'You have a new order on ShopSphere!',
      template: 'new-order-seller',
      vars: { name: vars.name, orderId: vars.orderId, total: inr(vars.total) },
    });
  },
  orderCancelled(to: string, vars: { name: string; orderId: string }): Promise<void> {
    return sendEmail({
      to,
      subject: 'Your order has been cancelled',
      template: 'order-cancelled',
      vars,
    });
  },
};
