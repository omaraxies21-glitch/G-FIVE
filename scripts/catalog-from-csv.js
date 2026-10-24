const fs = require('node:fs');
const path = require('node:path');

const inputPath = path.resolve(process.argv[2] || '');
const outputPath = path.resolve(process.argv[3] || path.join(__dirname, '..', 'data', 'catalog.js'));

if (!process.argv[2]) {
  console.error('Uso: node scripts/catalog-from-csv.js <archivo.csv> [salida.js]');
  process.exit(1);
}

function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"' && value.length === 0) {
      quoted = true;
    } else if (character === delimiter) {
      row.push(value);
      value = '';
    } else if (character === '\n' || character === '\r') {
      if (character === '\r' && text[index + 1] === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }
  if (quoted) throw new Error('Hay una comilla abierta sin cerrar en el CSV.');
  row.push(value);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  return rows;
}

function parsePrice(value, line) {
  let normalized = String(value || '').replace(/[^\d,.-]/g, '');
  if (normalized.includes(',') && normalized.includes('.')) {
    normalized = normalized.lastIndexOf(',') > normalized.lastIndexOf('.')
      ? normalized.replace(/\./g, '').replace(',', '.')
      : normalized.replace(/,/g, '');
  } else if (normalized.includes(',')) {
    normalized = normalized.replace(',', '.');
  }
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error(`Precio inválido en la fila ${line}.`);
  return amount;
}

function truthy(value) {
  return ['1', 'si', 'sí', 'true', 'yes', 'x'].includes(String(value || '').trim().toLocaleLowerCase('es'));
}

try {
  if (!fs.existsSync(inputPath) || !fs.statSync(inputPath).isFile()) throw new Error(`No existe el CSV: ${inputPath}`);
  const text = fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, '');
  const delimiter = (text.split(/\r?\n/, 1)[0].match(/;/g) || []).length > (text.split(/\r?\n/, 1)[0].match(/,/g) || []).length ? ';' : ',';
  const [headerRow, ...dataRows] = parseCsv(text, delimiter);
  if (!headerRow) throw new Error('El archivo está vacío.');
  const headers = headerRow.map((header) => header.trim().toLocaleLowerCase('es'));
  const required = ['codigo', 'nombre', 'categoria', 'precio_usd'];
  const missing = required.filter((name) => !headers.includes(name));
  if (missing.length) throw new Error(`Faltan columnas requeridas: ${missing.join(', ')}.`);
  const column = (row, name) => row[headers.indexOf(name)]?.trim() || '';
  const seen = new Set();
  const products = dataRows.map((row, index) => {
    const line = index + 2;
    const code = column(row, 'codigo');
    const name = column(row, 'nombre');
    const category = column(row, 'categoria');
    if (!code || !name || !category) throw new Error(`Código, nombre o categoría vacíos en la fila ${line}.`);
    if (seen.has(code)) throw new Error(`Código duplicado "${code}" en la fila ${line}.`);
    seen.add(code);
    const image = column(row, 'imagen');
    if (image && !image.startsWith('assets/products/') && !/^https:\/\//i.test(image)) {
      throw new Error(`La imagen de la fila ${line} debe estar en assets/products/ o usar una URL HTTPS.`);
    }
    if (image.startsWith('assets/products/')) {
      const productImages = path.resolve(__dirname, '..', 'assets', 'products');
      const imagePath = path.resolve(__dirname, '..', image);
      if (!imagePath.startsWith(`${productImages}${path.sep}`) || !fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile()) {
        throw new Error(`La imagen de la fila ${line} no existe dentro de assets/products/.`);
      }
    }
    return {
      id: code,
      name,
      brand: column(row, 'marca') || 'G-FIVE',
      category,
      price: parsePrice(column(row, 'precio_usd'), line),
      tag: column(row, 'etiqueta') || category.toLocaleUpperCase('es'),
      description: column(row, 'descripcion'),
      image,
      featured: truthy(column(row, 'destacado'))
    };
  });
  if (!products.length) throw new Error('El CSV no tiene productos para publicar.');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `window.GFIVE_PRODUCTS = ${JSON.stringify(products, null, 2)};\n`, 'utf8');
  console.log(`Catálogo generado: ${products.length} productos → ${outputPath}`);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
}
