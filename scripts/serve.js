const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 4173);
const allowedFiles = new Set(['index.html', 'styles.css', 'app.js', 'config.js', 'manifest.webmanifest']);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg'
};

const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, requested);
  const isPublicAsset = requested.startsWith('assets/') || requested.startsWith('data/');

  if ((!filePath.startsWith(`${root}${path.sep}`) && filePath !== path.join(root, 'index.html'))
    || (!allowedFiles.has(requested) && !isPublicAsset)
    || requested.split(/[\\/]/).some((part) => part.startsWith('.'))) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500);
      response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }
    response.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache'
    });
    response.end(content);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`G-FIVE demo: http://localhost:${port}`);
  console.log('Para probar desde otro dispositivo en la misma red, usa la IP local de esta PC.');
});
