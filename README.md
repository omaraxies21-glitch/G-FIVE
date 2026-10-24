# G-FIVE — catálogo web demo

Sitio estático, rápido y adaptable a móvil para que clientes vean productos, los agreguen a una lista de cotización y contacten ventas por WhatsApp. La demo ya usa los recursos oficiales que compartiste en `assets/brand/`. No consulta Profit, no muestra inventario en vivo y no cobra en línea.

## Aviso para la demo

El catálogo incluido contiene 50 productos completamente ficticios: nombres, marcas, especificaciones y precios son ejemplos de presentación, no representan inventario real ni cotizaciones de mercado. El banner/logo son las imágenes oficiales que compartiste para preparar esta demo. El WhatsApp configurado es el número de ventas facilitado para la demostración. Mantener visible el aviso de demo y no ofrecer estos precios como reales; antes de enlazarlo desde el Instagram oficial, reemplazar productos y precios por información aprobada por G-FIVE.

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
4. Muestra el botón de WhatsApp configurado para la demo.
5. Explica que los artículos y precios visibles son ficticios y que no hay stock en vivo ni integración con Profit.

## Configurar para la tienda

1. Edita `config.js`:
   - `storeName`: nombre que G-FIVE autorice para el sitio.
   - `whatsappNumber`: WhatsApp de ventas en formato internacional, solo dígitos. Venezuela: `58` + número, sin `+`, espacios ni guiones. El valor actual es el número que se indicó para esta demo; confirmar autorización antes de enlazarlo públicamente.
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
- El número de WhatsApp configurado debe ser un canal autorizado de ventas y permanecer activo.

## Publicar para abrir desde cualquier lugar

Para el demo de mañana, GitHub Pages puede servir esta web estática sin base de datos. El usuario debe abrir el URL HTTPS en el celular. En Chrome Android: menú → **Añadir a pantalla principal**; en Safari iOS: **Compartir → Añadir a pantalla de inicio**.

Este proyecto se publicará desde un repositorio público de GitHub, por lo que tanto el código como los productos de muestra serán visibles para cualquiera. No contiene el catálogo interno de Profit: antes de reemplazarlo por precios reales, fotos o datos de la tienda, obtener autorización de G-FIVE y revisar qué información quedará expuesta.

URL esperado si se despliega un repositorio de proyecto bajo la organización, sujeto a que el nombre/repositorio esté disponible:

`https://omaraxies21-glitch.github.io/G-FIVE/`

Para publicarlo en `https://gfivevzla.github.io/` raíz, el repo debe llamarse `gfivevzla.github.io`, o configurarse un dominio propio. No se puede asumir que el primer URL existe.

### GitHub Pages con GitHub Actions

1. El repositorio `omaraxies21-glitch/G-FIVE` se publica como público a petición del propietario.
2. En **Settings → Pages**, seleccionar **GitHub Actions** como fuente. El workflow `.github/workflows/pages.yml` publica el sitio al hacer push a `main`.
3. Esperar que termine correctamente el workflow y abrir `https://omaraxies21-glitch.github.io/G-FIVE/`.
4. Probar en celular: búsqueda, filtros, lista, cantidades y enlace de WhatsApp.

Si el despliegue automático falla, revisar la ejecución del workflow en la pestaña **Actions** y la fuente de publicación en **Settings → Pages**.

## Actualización quincenal

Exportar desde Profit solo la lista pública autorizada, actualizar el CSV y fotos por SKU, regenerar `data/catalog.js`, revisar en móvil y desplegar. Mantener una copia del CSV publicado por fecha. El precio siempre debe mostrar fecha de actualización/aclarar que se confirma por WhatsApp; no publicar cambios automáticamente sin aprobación del responsable de G Five.

## Límites y cosas que no promete este demo

- Sin inventario en vivo ni integración con Profit.
- Sin pagos web, cuentas de clientes, órdenes confirmadas ni reservas.
- La lista existe solo en el dispositivo donde se armó.
- Un precio visible es referencia; el equipo de ventas confirma el monto y disponibilidad.
- El lanzamiento con Instagram, marca y contenido reales requiere visto bueno de G Five.
