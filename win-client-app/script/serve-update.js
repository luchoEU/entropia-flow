const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9147;
const ROOT = path.resolve(__dirname, '..');

const MIME = {
    '.json': 'application/json',
    '.zip': 'application/zip',
    '.neu': 'application/octet-stream',
};

http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'close');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const filePath = path.join(ROOT, req.url.split('?')[0]);
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403); res.end(); return;
    }

    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) {
            res.writeHead(404); res.end('Not found'); return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            'Content-Length': stat.size,
        });
        fs.createReadStream(filePath).pipe(res);
        console.log(`${new Date().toISOString()} ${req.method} ${req.url} (${stat.size} bytes)`);
    });
}).listen(PORT, '0.0.0.0', () => {
    console.log(`Serving ${ROOT} on http://0.0.0.0:${PORT}`);
});
