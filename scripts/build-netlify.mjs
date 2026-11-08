import {cp, mkdir, readFile, writeFile} from 'node:fs/promises';

const canonical = new URL(process.env.PUBLIC_URL || process.env.URL || 'https://launchscope-open.onrender.com/');
if (canonical.protocol !== 'https:' || canonical.username || canonical.password) throw new Error('PUBLIC_URL must be a public HTTPS URL');
canonical.pathname = '/'; canonical.search = ''; canonical.hash = '';
await mkdir('dist', {recursive: true});
await cp('public', 'dist', {recursive: true});
const html = await readFile('dist/index.html', 'utf8');
const escaped = canonical.href.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
await writeFile('dist/index.html', html.replace('https://launchscope-open.onrender.com/', escaped));
console.log('Built static assets for ' + canonical.origin);
