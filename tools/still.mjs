// Style frames: serve this folder, open the page headless and save a PNG of a scene.
//   node tools/still.mjs maintenance portrait out.png [extra query]
import { launch, connect } from './cdp.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { writeFileSync } from 'node:fs';
import { extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [scene = 'maintenance', o = 'portrait', out = 'still.png', extra = ''] = process.argv.slice(2);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json' };
const srv = createServer(async (q, s) => {
  const p = resolve(root, '.' + decodeURIComponent(new URL(q.url, 'http://x').pathname).replace(/\/$/, '/index.html'));
  if (!p.startsWith(root)) { s.writeHead(403); return s.end(); }
  try { const b = await readFile(p); s.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); s.end(b); } catch { s.writeHead(404); s.end(); }
}).listen(0, '127.0.0.1');
await new Promise((r) => srv.once('listening', r));
const [W, H] = o === 'portrait' ? [1080, 1920] : [1920, 1080];
const { proc, page } = await launch({ w: W, h: H, gpu: process.env.GPU || 'd3d11', port: 9600 + Math.floor(Math.random() * 300) });
const c = await connect(page.webSocketDebuggerUrl);
const logs = [];
c.on((m) => {
  if (m.method === 'Runtime.consoleAPICalled') logs.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
  if (m.method === 'Runtime.exceptionThrown') logs.push('EXC ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
});
await c.send('Runtime.enable'); await c.send('Page.enable');
await c.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await c.send('Page.navigate', { url: `http://127.0.0.1:${srv.address().port}/?still=${scene}&o=${o}${extra}` });
const t0 = Date.now();
while (!(await c.evaluate('window.__ready === true').catch(() => false))) {
  if (Date.now() - t0 > 30000) { console.error(logs.join('\n')); throw new Error('never ready'); }
  await new Promise((r) => setTimeout(r, 150));
}
await new Promise((r) => setTimeout(r, 600));
const { data } = await c.send('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(data, 'base64'));
if (logs.length) console.error(logs.join('\n'));
c.close(); proc.kill(); srv.close();
