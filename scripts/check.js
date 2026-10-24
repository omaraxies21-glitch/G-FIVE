const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const catalogPath = path.join(__dirname, '..', 'data', 'catalog.js');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(catalogPath, 'utf8'), context, { filename: catalogPath });

const products = context.window.GFIVE_PRODUCTS;
if (!Array.isArray(products) || products.length === 0) throw new Error('El catálogo está vacío o no tiene el formato esperado.');

const ids = new Set();
for (const [index, product] of products.entries()) {
  const line = index + 1;
  if (!product.id || !product.name || !product.category) throw new Error(`Falta código, nombre o categoría en el producto ${line}.`);
  if (ids.has(product.id)) throw new Error(`Código duplicado: ${product.id}`);
  ids.add(product.id);
  if (!Number.isFinite(Number(product.price)) || Number(product.price) <= 0) throw new Error(`Precio inválido para ${product.id}.`);
  if (product.image && !/^https:\/\//i.test(product.image)) {
    const productsDirectory = path.resolve(__dirname, '..', 'assets', 'products');
    const imagePath = path.resolve(__dirname, '..', product.image);
    if (!imagePath.startsWith(`${productsDirectory}${path.sep}`) || !fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile()) {
      throw new Error(`Imagen inexistente o fuera de assets/products/: ${product.id}`);
    }
  }
}

console.log(`Catálogo válido: ${products.length} productos, códigos únicos y precios válidos.`);
