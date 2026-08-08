// Encrypt the Random Walks section of the built site (dist/) with StatiCrypt.
// 1. Inline every figure referenced by a note page as a data URI, so images
//    are protected along with the text, then delete the standalone files.
// 2. Encrypt the note pages and the notes index in place.
// Requires STATICRYPT_PASSWORD in the environment. Run after `astro build`.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, rmSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const dist = 'dist';
const pass = process.env.STATICRYPT_PASSWORD;
if (!pass) { console.error('STATICRYPT_PASSWORD not set'); process.exit(1); }

const pages = [join(dist, 'notes', 'index.html')];
for (const e of readdirSync(join(dist, 'notes'))) {
  const p = join(dist, 'notes', e, 'index.html');
  if (existsSync(p)) pages.push(p);
}

for (const page of pages) {
  let html = readFileSync(page, 'utf8');
  html = html.replace(/src="(\/notes\/[^"]+\.(png|jpg|jpeg|gif|svg))"/g, (m, url, ext) => {
    const file = join(dist, url);
    if (!existsSync(file)) return m;
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    const b64 = readFileSync(file).toString('base64');
    return `src="data:${mime};base64,${b64}"`;
  });
  writeFileSync(page, html);
}

// remove now-inlined figure files
for (const e of readdirSync(join(dist, 'notes'))) {
  const figs = join(dist, 'notes', e, 'figures');
  if (existsSync(figs) && statSync(figs).isDirectory()) rmSync(figs, { recursive: true });
}

// encrypt each page in place (staticrypt flattens to basename, so use
// each file's own directory as the output dir)
for (const page of pages) {
  execFileSync('npx', ['staticrypt', page, '-d', dirname(page), '--remember', '30', '--short',
    '--template-title', 'Random Walks - protected',
    '--template-instructions', 'This section is password protected. Ask Lulu for access.',
    '-p', pass], { stdio: 'inherit' });
}
console.log(`protected ${pages.length} pages`);
