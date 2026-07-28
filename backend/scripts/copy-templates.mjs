// Copies HTML email templates from src/templates → dist/templates after tsc build.
import { cpSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src', 'templates');
const dest = join(root, 'dist', 'templates');

if (existsSync(src)) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log('✓ Copied email templates to dist/templates');
} else {
  console.warn('No src/templates directory found — skipping template copy.');
}
