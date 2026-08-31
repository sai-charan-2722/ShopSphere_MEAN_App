#!/usr/bin/env node
/**
 * PreToolUse hook — blocks Edit/Write/Bash actions that would leak ShopSphere secrets.
 *
 * Fires on Edit|Write|MultiEdit|Bash. Reads the tool payload from stdin and:
 *   1. Refuses any write to a real `.env` file (only `.env.example` is allowed).
 *   2. Refuses content/commands that contain live Stripe/Clerk secret keys, webhook
 *      signing secrets, a MongoDB URI with embedded credentials, or a Cloudinary secret.
 *
 * Exit 2 => the tool call is blocked and this script's stderr is shown to Claude.
 * Publishable keys (pk_test_/pk_live_) are intentionally NOT blocked — they belong in
 * the frontend environment file.
 */
const fs = require('fs');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

let payload = {};
try {
  payload = JSON.parse(readStdin() || '{}');
} catch {
  process.exit(0); // Malformed payload — don't block.
}

const input = payload.tool_input || {};
const filePath = String(input.file_path || input.path || input.notebook_path || '').replace(/\\/g, '/');
const content = [input.content, input.new_string, input.new_str]
  .filter((v) => typeof v === 'string')
  .join('\n');
const command = String(input.command || '');

const problems = [];

// 1. Never edit real secret files.
if (/(^|\/)\.env(\.[A-Za-z0-9_-]+)?$/.test(filePath) && !/\.env\.example$/.test(filePath)) {
  problems.push(`Refusing to modify secret file "${filePath}". Put shareable keys in .env.example instead.`);
}

// 2. Detect real secrets in the content being written or in a shell command.
const haystack = `${content}\n${command}`;
const secretPatterns = [
  [/sk_live_[0-9a-zA-Z]{12,}/, 'Stripe LIVE secret key'],
  [/sk_test_[0-9a-zA-Z]{16,}/, 'Stripe/Clerk secret key'],
  [/whsec_[0-9a-zA-Z]{16,}/, 'webhook signing secret'],
  [/mongodb(\+srv)?:\/\/[^\s:@/]+:[^\s@/]+@/, 'MongoDB URI with embedded credentials'],
  [/CLOUDINARY_API_SECRET\s*[=:]\s*['"]?[0-9A-Za-z_-]{12,}/, 'Cloudinary API secret'],
];
for (const [re, label] of secretPatterns) {
  if (re.test(haystack)) problems.push(`Possible ${label} in ${filePath || 'the command'}.`);
}

if (problems.length) {
  console.error(
    '🔒 block-secrets hook blocked this action:\n- ' +
      problems.join('\n- ') +
      '\n\nSecrets belong in backend/.env (gitignored) or your deploy provider’s env settings.',
  );
  process.exit(2);
}

process.exit(0);
