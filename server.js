// ParentShield Live Relay Server - Node.js, no dependencies
// Run: node server.js  (port 3000, or PORT env)
// Deploy on Render/Railway: Start Command: node server.js
const http = require('http');
let latest = {}; // pairCode -> {jpeg: Buffer, time: number}
let cmds = {}; // pairCode -> [commands]
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'POST' && req.url.startsWith('/frame/')) {
    const code = decodeURIComponent(req.url.split('/')[2] || 'default');
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => { latest[code] = { jpeg: Buffer.concat(chunks), time: Date.now() }; res.end('ok'); });
  } else if (req.method === 'GET' && req.url.startsWith('/live/')) {
    const code = decodeURIComponent(req.url.split('/')[2] || 'default');
    const f = latest[code];
    if (!f) { res.writeHead(404); res.end('no frame yet'); return; }
    res.writeHead(200, {'Content-Type': 'image/jpeg', 'Cache-Control': 'no-cache'});
    res.end(f.jpeg);
  } else if (req.method === 'POST' && req.url.startsWith('/cmd/')) {
    const code = decodeURIComponent(req.url.split('/')[2] || 'default');
    const chunks = []; req.on('data', c => chunks.push(c));
    req.on('end', () => { if (!cmds[code]) cmds[code] = []; cmds[code].push(Buffer.concat(chunks).toString()); res.end('ok'); });
  } else if (req.method === 'GET' && req.url.startsWith('/cmd/')) {
    const code = decodeURIComponent(req.url.split('/')[2] || 'default');
    const list = cmds[code] || []; cmds[code] = [];
    res.writeHead(200, {'Content-Type': 'application/json'}); res.end(JSON.stringify(list));
  } else { res.end('ParentShield Live Relay - POST /frame/<pairCode> with JPEG, GET /live/<pairCode>'); }
});
const port = process.env.PORT || 3000;
server.listen(port, () => console.log('ParentShield relay on ' + port));
