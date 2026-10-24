const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const files = [
  'index.html',
  'styles.css',
  'app.js',
  'config.js',
  'manifest.webmanifest',
  'assets',
  'data'
];

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

for (const relativePath of files) {
  const source = path.join(root, relativePath);
  if (!fs.existsSync(source)) throw new Error(`Falta archivo del sitio: ${relativePath}`);
  fs.cpSync(source, path.join(output, relativePath), { recursive: true });
}

console.log(`Sitio listo en ${output}`);
