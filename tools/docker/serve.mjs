// Static file server for the INKWAVE web build, used by the Docker image (tools/serve.py is the
// dev/LAN equivalent for bare-metal runs). Same behaviour that matters to the game: every response
// carries `Cache-Control: no-cache` so ES modules can never go stale, the MIME map covers every
// extension the game serves, and 4xx paths are logged to stdout — index.html's error beacon sends
// failures to /__inkwave_error/… and relies on the server logging them, which is how a phone's
// invisible boot error gets into `docker logs`.
//   usage: node serve.mjs   (PORT env overrides the default 8490)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PORT = Number(process.env.PORT) || 8490;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.cjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.wasm': 'application/wasm',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.opus': 'audio/opus',
  '.wav': 'audio/wav', '.flac': 'audio/flac', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end('bad request'); return; }
  if (pathname.includes('\0') || pathname.includes('..')) { notFound(res, pathname); return; }
  if (pathname === '/') pathname = '/index.html';

  let file = path.join(ROOT, pathname);
  let stat;
  try { stat = fs.statSync(file); } catch { notFound(res, pathname); return; }
  if (stat.isDirectory()) {
    file = path.join(file, 'index.html');
    try { stat = fs.statSync(file); } catch { notFound(res, pathname); return; }
  }
  res.writeHead(200, {
    'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(file)
    .on('error', () => { try { res.destroy(); } catch { /* already gone */ } })
    .pipe(res);
});

function notFound(res, pathname) {
  // every 4xx is logged with its path: the in-page error beacon depends on this
  console.log(`[web] 404 ${pathname}`);
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end('not found');
}

server.listen(PORT, '0.0.0.0', () => console.log(`[web] INKWAVE listening on http://0.0.0.0:${PORT}`));
