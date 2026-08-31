#!/usr/bin/env node
/**
 * Stop hook — quality gate when Claude finishes a turn.
 *
 * ShopSphere has no unit-test runner configured, so the closest fast signal is the
 * TypeScript compiler. This runs `npm --prefix <proj> run typecheck` for backend and
 * frontend; if either fails, it asks Claude to keep going and fix the errors.
 *
 * Disable per-machine by setting SHOPSPHERE_STOP_TYPECHECK=0 (see settings.local.json).
 * A `stop_hook_active` guard prevents infinite continue loops.
 */
const fs = require('fs');
const { spawnSync } = require('child_process');

let payload = {};
try {
  payload = JSON.parse(fs.readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

// Opt-out + loop guard.
if (process.env.SHOPSPHERE_STOP_TYPECHECK === '0') process.exit(0);
if (payload.stop_hook_active) process.exit(0);

function typecheck(prefix) {
  const res = spawnSync('npm', ['--prefix', prefix, 'run', 'typecheck'], {
    encoding: 'utf8',
    shell: true,
  });
  return { code: res.status ?? 1, out: `${res.stdout || ''}${res.stderr || ''}` };
}

const failures = [];
for (const project of ['backend', 'frontend']) {
  const { code, out } = typecheck(project);
  if (code !== 0) {
    const tail = out.split('\n').slice(-40).join('\n');
    failures.push(`### ${project} typecheck failed\n${tail}`);
  }
}

if (failures.length) {
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: 'Type errors remain. Fix them before finishing:\n\n' + failures.join('\n\n'),
    }),
  );
}

process.exit(0);
