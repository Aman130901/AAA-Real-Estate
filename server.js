/**
 * AAA Real Estate - Local Development Server
 * Run: node server.js
 * API available at http://localhost:3001/api/...
 * Frontend (static) at http://localhost:8000/ (use python -m http.server 8000)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3001;

// Map route paths to handler files
const routes = {
  '/api/health': require('./api/health'),
  '/api/properties': require('./api/properties/index'),
  '/api/properties/create': require('./api/properties/create'),
  '/api/enquiries': require('./api/enquiries/index'),
  '/api/admin/login': require('./api/admin/login'),
  '/api/admin/stats': require('./api/admin/stats'),
  '/api/admin/properties': require('./api/admin/properties'),
};

// Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

// Build a minimal res wrapper (like Vercel's)
function wrapRes(nodeRes) {
  const headers = {};
  let statusCode = 200;

  const res = {
    statusCode,
    status(code) { statusCode = code; return res; },
    setHeader(k, v) { headers[k] = v; return res; },
    getHeader(k) { return headers[k]; },
    end(body) {
      nodeRes.writeHead(statusCode, headers);
      nodeRes.end(body || '');
    },
    json(data) {
      res.setHeader('Content-Type', 'application/json');
      nodeRes.writeHead(statusCode, headers);
      nodeRes.end(JSON.stringify(data));
    }
  };
  return res;
}

const server = http.createServer(async (nodeReq, nodeRes) => {
  const parsed = url.parse(nodeReq.url, true);
  const pathname = parsed.pathname.replace(/\/$/, '') || '/';
  const query = parsed.query;

  // Inject body & query into request
  const body = await parseBody(nodeReq);

  const req = Object.assign(nodeReq, {
    query,
    body,
    socket: nodeReq.socket
  });
  const res = wrapRes(nodeRes);

  // Route to handler
  const handler = routes[pathname];
  if (handler) {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[ERROR]', pathname, err.message);
      res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
    }
    return;
  }

  // Static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp',
    };
    nodeRes.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(nodeRes);
    return;
  }

  // SPA fallback
  if (!pathname.startsWith('/api/')) {
    nodeRes.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(__dirname, 'index.html')).pipe(nodeRes);
    return;
  }

  res.status(404).json({ success: false, error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║   AAA Real Estate Backend Server       ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║  API:      http://localhost:${PORT}/api  ║`);
  console.log(`║  Frontend: http://localhost:${PORT}/     ║`);
  console.log('╠════════════════════════════════════════╣');
  console.log('║  Available Routes:                     ║');
  console.log('║  GET  /api/health                      ║');
  console.log('║  GET  /api/properties                  ║');
  console.log('║  POST /api/properties/create           ║');
  console.log('║  POST /api/enquiries                   ║');
  console.log('║  POST /api/admin/login                 ║');
  console.log('║  GET  /api/admin/stats                 ║');
  console.log('║  GET  /api/admin/properties            ║');
  console.log('╚════════════════════════════════════════╝\n');
});

