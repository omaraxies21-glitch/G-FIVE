# G-FIVE — catálogo web demo

Sitio estático, rápido y adaptable a móvil para que clientes vean productos, los agreguen a una lista de cotización y contacten ventas por WhatsApp. La demo ya usa los recursos oficiales que compartiste en `assets/brand/`. No consulta Profit, no muestra inventario en vivo y no cobra en línea.

## Aviso para la demo

El catálogo incluido es ficticio: nombres y precios son ejemplos de presentación. El banner/logo son las imágenes oficiales que compartiste para preparar esta demo. No publicar precios ficticios. Antes de enlazarlo desde el Instagram oficial, reemplazar los productos por una lista de precios aprobada por G-FIVE.

## Abrir en la PC

Se necesita Node.js, sin instalar paquetes externos:

```powershell
npm start
```

Abre `http://localhost:4173`. Para probar en un celular conectado al mismo Wi-Fi, abre `http://IP-LOCAL-DE-LA-PC:4173`; el firewall de Windows debe permitir la conexión entrante. Ese enlace local no funciona desde cualquier lugar; para acceso público se debe desplegar con HTTPS.

Antes de subir una actualización del catálogo, valida que los códigos no estén duplicados y los precios sean válidos:

```powershell
npm run check
npm run build
```

`npm run build` prepara solo los archivos públicos del sitio en `dist/`; no incluye README, scripts de mantenimiento ni CSV de muestra.

### Recorrido corto para mostrar la demo

1. Abre el catálogo, filtra por **Laptops** y busca `monitor`.
2. Agrega dos productos y pulsa **Mi cotización**.
3. Cambia cantidades y escribe una nota de ejemplo.
4. Muestra el botón de WhatsApp; se activará con el número autorizado de ventas en `config.js`.
5. Explica que los artículos y precios visibles son ficticios y que no hay stock en vivo ni integración con Profit.

## Configurar para la tienda

1. Edita `config.js`:
   - `storeName`: nombre que G-FIVE autorice para el sitio.
   - `whatsappNumber`: WhatsApp de ventas en formato internacional, solo dígitos. Venezuela: `58` + número, sin `+`, espacios ni guiones. Ejemplo de formato ficticio: `584120000000`.
   - `showDemoNotice`: mantener `true` para demo; cambiar a `false` únicamente al sustituir todos los productos por catálogo y precios autorizados.
2. Los recursos recibidos están guardados en `assets/brand/`; reemplaza las imágenes de producto demo por fotos autorizadas. La publicación pública, el catálogo y sus precios requieren visto bueno del dueño.
3. Exporta el inventario/precios aprobados desde Profit a CSV. No exportar costo interno, proveedor, margen, datos de clientes ni otros campos confidenciales.
4. Ajusta el CSV a las columnas `codigo;nombre;marca;categoria;precio_usd;etiqueta;descripcion;imagen;destacado`. El código debe ser único. El precio debe ser el precio de venta aprobado.
5. Guarda imágenes WebP/JPG optimizadas en `assets/products/` y referencia su ruta relativa, por ejemplo `assets/products/GF-002.webp`.
6. Genera el catálogo:

```powershell
node scripts/catalog-from-csv.js .\catalogo-aprobado.csv
```

El programa valida las columnas, códigos duplicados, precios y rutas de imágenes; genera `data/catalog.js`. No modifica el CSV original. Revisa el catálogo en pantalla antes de publicar.

Para 3.000 productos, usar miniaturas WebP de unos 60–120 KB, proporción consistente, nombres basados en código/SKU y carga diferida. El inventario se filtra localmente en el navegador. No subir un catálogo con datos internos de Profit.

## Lista y WhatsApp

- El usuario puede agregar varios productos, editar cantidades o quitarlos.
- La lista se conserva en `localStorage` de ese navegador/dispositivo.
- Al enviar, se abre `wa.me` con productos, cantidades, precios de referencia y nota opcional.
- No hay stock en vivo ni reserva de productos. Ventas debe confirmar disponibilidad y precio final.
- El botón WhatsApp no queda configurado hasta que se ponga el número autorizado en `config.js`.

## Publicar para abrir desde cualquier lugar

Para el demo de mañana, GitHub Pages o Cloudflare Pages pueden servir esta web estática sin base de datos. El usuario debe abrir el URL HTTPS en el celular. En Chrome Android: menú → **Añadir a pantalla principal**; en Safari iOS: **Compartir → Añadir a pantalla de inicio**.

El repositorio de código puede ser privado, pero GitHub Pages para un repo privado depende del plan de la cuenta/organización; no asumir que está incluido. Si no permite publicar desde privado, usar Cloudflare Pages conectando el repo privado, o crear un repo público solo después de confirmar que el catálogo y los archivos no son confidenciales y que G Five autorizó la publicación.

URL esperado si se despliega un repositorio de proyecto bajo la organización, sujeto a que el nombre/repositorio esté disponible:

`https://gfivevzla.github.io/gfiveweb/`

Para publicarlo en `https://gfivevzla.github.io/` raíz, el repo debe llamarse `gfivevzla.github.io`, o configurarse un dominio propio. No se puede asumir que el primer URL existe.

### GitHub Pages con GitHub Actions

1. El repositorio privado `omaraxies21-glitch/G-FIVE` ya fue creado. Publicar desde la rama `main` de este proyecto local.
2. En **Settings → Pages**, seleccionar **GitHub Actions** como fuente. El workflow `.github/workflows/pages.yml` publicará el sitio al hacer push a `main`.
3. Esperar el workflow y abrir el enlace HTTPS que indica Pages.
4. Probar en celular: búsqueda, filtro, lista, actualización de cantidades y enlace WhatsApp.

Alternativa: importar el repo privado en Cloudflare Pages, usar `npm run build` y el directorio de salida `dist`. No se necesita configurar secretos ni backend.

## Actualización quincenal

Exportar desde Profit solo la lista pública autorizada, actualizar el CSV y fotos por SKU, regenerar `data/catalog.js`, revisar en móvil y desplegar. Mantener una copia del CSV publicado por fecha. El precio siempre debe mostrar fecha de actualización/aclarar que se confirma por WhatsApp; no publicar cambios automáticamente sin aprobación del responsable de G Five.

## Límites y cosas que no promete este demo

- Sin inventario en vivo ni integración con Profit.
- Sin pagos web, cuentas de clientes, órdenes confirmadas ni reservas.
- La lista existe solo en el dispositivo donde se armó.
- Un precio visible es referencia; el equipo de ventas confirma el monto y disponibilidad.
- El lanzamiento con Instagram, marca y contenido reales requiere visto bueno de G Five.
