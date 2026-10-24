(() => {
  const config = window.GFIVE_CONFIG || {};
  const products = Array.isArray(window.GFIVE_PRODUCTS) ? window.GFIVE_PRODUCTS : [];
  const pageSize = 24;
  const state = { category: 'Todos', search: '', sort: 'featured', visibleLimit: pageSize, quote: loadQuote() };
  const $ = (selector) => document.querySelector(selector);
  const productGrid = $('#productGrid');
  const quoteDrawer = $('#quoteDrawer');
  const backdrop = $('#quoteBackdrop');
  let toastTimer;

  function loadQuote() {
    try {
      const saved = JSON.parse(localStorage.getItem('gfive-quote') || '[]');
      return Array.isArray(saved) ? saved.filter((line) => products.some((product) => product.id === line.id) && Number(line.quantity) > 0) : [];
    } catch {
      return [];
    }
  }

  function saveQuote() {
    localStorage.setItem('gfive-quote', JSON.stringify(state.quote));
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function formatPrice(price) {
    const amount = new Intl.NumberFormat('es-VE', { maximumFractionDigits: 2 }).format(Number(price) || 0);
    return `${config.currency === 'USD' ? '$' : ''}${amount}${config.currency === 'USD' ? ' USD' : ` ${config.currency || ''}`}`;
  }

  function filteredProducts() {
    const query = state.search.trim().toLocaleLowerCase('es');
    const visible = products.filter((product) => {
      const matchesCategory = state.category === 'Todos' || product.category === state.category;
      const haystack = `${product.name} ${product.brand} ${product.category} ${product.description}`.toLocaleLowerCase('es');
      return matchesCategory && (!query || haystack.includes(query));
    });
    if (state.sort === 'price-asc') visible.sort((a, b) => Number(a.price) - Number(b.price));
    else if (state.sort === 'price-desc') visible.sort((a, b) => Number(b.price) - Number(a.price));
    else if (state.sort === 'name') visible.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    else visible.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
    return visible;
  }

  function imageMarkup(product) {
    if (product.image) {
      return `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async">`;
    }
    const icon = product.category === 'Laptops' || product.category === 'Computadoras'
      ? '<rect x="29" y="30" width="102" height="66" rx="8"/><path d="M18 108h124l-12 12H31z"/><path d="M65 104h30"/>'
      : product.category === 'Monitores'
        ? '<rect x="31" y="28" width="98" height="67" rx="7"/><path d="M80 97v18m-22 7h44"/>'
        : product.category === 'Mouses'
          ? '<path d="M80 24v48m-27 0V55a27 27 0 0 1 54 0v40a27 27 0 0 1-54 0z"/>'
          : product.category === 'Procesadores'
            ? '<rect x="48" y="48" width="64" height="64" rx="7"/><rect x="62" y="62" width="36" height="36" rx="3"/><path d="M58 30v18m22-18v18m22-18v18M58 112v18m22-18v18m22-18v18M30 58h18m-18 22h18m-18 22h18m64-44h18m-18 22h18m-18 22h18"/>'
        : product.category === 'Accesorios'
          ? '<circle cx="80" cy="75" r="42"/><path d="M65 83c0-14 7-22 15-22s15 8 15 22v22H65z"/><path d="M59 71H45v31h20m30-31h20v31H95"/>'
          : '<rect x="38" y="29" width="84" height="91" rx="10"/><path d="M56 52h48m-48 16h38m-38 16h29"/>'
    ;
    return `<div class="product-placeholder" aria-hidden="true"><svg viewBox="0 0 160 150" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${icon}</svg><span>G-FIVE</span></div>`;
  }

  function renderCategories() {
    const categories = ['Todos', ...new Set(products.map((product) => product.category).filter(Boolean))];
    $('#categoryPills').innerHTML = categories.map((category) => (
      `<button class="category-pill${state.category === category ? ' active' : ''}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}${category === 'Todos' ? `<span>${products.length}</span>` : ''}</button>`
    )).join('');
  }

  function renderProducts() {
    const filtered = filteredProducts();
    const visible = filtered.slice(0, state.visibleLimit);
    $('#resultCount').textContent = filtered.length > pageSize
      ? `Mostrando ${visible.length} de ${filtered.length} productos`
      : `${filtered.length} ${filtered.length === 1 ? 'producto' : 'productos'}`;
    $('#emptyState').hidden = filtered.length > 0;
    productGrid.hidden = filtered.length === 0;
    $('#loadMore').hidden = visible.length >= filtered.length;
    $('#clearFilters').hidden = state.category === 'Todos' && !state.search;
    productGrid.innerHTML = visible.map((product, index) => {
      const inQuote = state.quote.find((line) => line.id === product.id)?.quantity || 0;
      return `<article class="product-card" style="--card-index:${Math.min(index, 10)}">
        <div class="product-visual">${imageMarkup(product)}<span class="product-tag">${escapeHtml(product.tag || product.category)}</span>${inQuote ? `<span class="in-quote">${inQuote} en tu lista</span>` : ''}</div>
        <div class="product-info"><div class="product-meta"><span>${escapeHtml(product.brand || 'G-FIVE')}</span><span>${escapeHtml(product.category || '')}</span></div>
          <h3>${escapeHtml(product.name)}</h3><p>${escapeHtml(product.description || '')}</p>
          <div class="product-buy"><strong>${formatPrice(product.price)}</strong><button class="add-button" type="button" data-add="${escapeHtml(product.id)}" aria-label="Agregar ${escapeHtml(product.name)} a la cotización">${inQuote ? '＋ Añadir otro' : '＋ Agregar'}</button></div>
        </div>
      </article>`;
    }).join('');
  }

  function quoteQuantity() {
    return state.quote.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  }

  function updateQuoteCount() {
    const count = quoteQuantity();
    $('#quoteCount').textContent = count;
    $('#drawerCount').textContent = `(${count})`;
    $('#drawerEmpty').hidden = state.quote.length > 0;
    $('#quoteForm').hidden = state.quote.length === 0;
    $('#quoteItems').innerHTML = state.quote.map((line) => {
      const product = products.find((item) => item.id === line.id);
      if (!product) return '';
      return `<div class="quote-item"><div class="quote-thumb">${product.image ? `<img src="${escapeHtml(product.image)}" alt="" loading="lazy">` : '<span>GF</span>'}</div><div class="quote-item-info"><strong>${escapeHtml(product.name)}</strong><small>${formatPrice(product.price)} · precio de referencia</small><div class="quantity-control"><button type="button" data-quantity="${escapeHtml(product.id)}" data-delta="-1" aria-label="Quitar uno">−</button><span>${line.quantity}</span><button type="button" data-quantity="${escapeHtml(product.id)}" data-delta="1" aria-label="Agregar uno">+</button></div></div><button class="remove-item" type="button" data-remove="${escapeHtml(product.id)}" aria-label="Quitar ${escapeHtml(product.name)}">×</button></div>`;
    }).join('');
  }

  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
  }

  function openQuote() {
    quoteDrawer.classList.add('open');
    backdrop.hidden = false;
    quoteDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
    $('#closeQuote').focus();
  }

  function closeQuote() {
    quoteDrawer.classList.remove('open');
    backdrop.hidden = true;
    quoteDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    $('#openQuote').focus();
  }

  function addProduct(id) {
    const existing = state.quote.find((line) => line.id === id);
    if (existing && existing.quantity >= 99) {
      showToast('Máximo 99 unidades por producto');
      return;
    }
    if (!existing && state.quote.length >= 30) {
      showToast('La lista permite hasta 30 productos distintos');
      return;
    }
    if (existing) existing.quantity += 1;
    else state.quote.push({ id, quantity: 1 });
    saveQuote();
    renderProducts();
    updateQuoteCount();
    showToast('Agregado a tu cotización');
  }

  function changeQuantity(id, delta) {
    const line = state.quote.find((item) => item.id === id);
    if (!line) return;
    if (delta > 0 && line.quantity >= 99) {
      showToast('Máximo 99 unidades por producto');
      return;
    }
    line.quantity += delta;
    if (line.quantity <= 0) state.quote = state.quote.filter((item) => item.id !== id);
    saveQuote();
    updateQuoteCount();
    renderProducts();
  }

  function sendToWhatsApp(isHelp = false) {
    const phone = String(config.whatsappNumber || '').replace(/\D/g, '');
    if (!phone) {
      showToast('Falta configurar el WhatsApp de ventas en config.js');
      return;
    }
    const greeting = isHelp
      ? `Hola, vi el catálogo web de ${config.storeName || 'G-FIVE'} y quisiera asesoría sobre un equipo.`
      : [
          `Hola, vi el catálogo web de ${config.storeName || 'G-FIVE'} y quisiera cotizar:`,
          ...state.quote.map((line) => {
            const product = products.find((item) => item.id === line.id);
            return product ? `• ${line.quantity} x ${product.name} (${formatPrice(product.price)} c/u, referencia)` : '';
          }).filter(Boolean),
          $('#customerName').value.trim() ? `Nombre: ${$('#customerName').value.trim()}` : '',
          $('#customerNote').value.trim() ? `Nota: ${$('#customerNote').value.trim()}` : '',
          '',
          '¿Me confirman disponibilidad, precio final y opciones de pago?'
        ].filter((line) => line !== '').join('\n');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(greeting)}`, '_blank', 'noopener,noreferrer');
  }

  document.title = `${config.storeName || 'G-FIVE'} | Catálogo`;
  $('#year').textContent = new Date().getFullYear();
  if (!config.showDemoNotice) $('#demoNotice').hidden = true;
  else $('#demoNotice').textContent = config.demoNotice || 'CATÁLOGO DEMO · PRECIOS ILUSTRATIVOS';

  $('#categoryPills').addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    state.visibleLimit = pageSize;
    renderCategories();
    renderProducts();
  });
  productGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add]');
    if (button) addProduct(button.dataset.add);
  });
  $('#quoteItems').addEventListener('click', (event) => {
    const quantityButton = event.target.closest('[data-quantity]');
    if (quantityButton) changeQuantity(quantityButton.dataset.quantity, Number(quantityButton.dataset.delta));
    const removeButton = event.target.closest('[data-remove]');
    if (removeButton) {
      state.quote = state.quote.filter((line) => line.id !== removeButton.dataset.remove);
      saveQuote();
      updateQuoteCount();
      renderProducts();
    }
  });
  $('#searchInput').addEventListener('input', (event) => {
    state.search = event.target.value;
    state.visibleLimit = pageSize;
    renderProducts();
  });
  $('#sortSelect').addEventListener('change', (event) => {
    state.sort = event.target.value;
    state.visibleLimit = pageSize;
    renderProducts();
  });
  $('#loadMore').addEventListener('click', () => {
    state.visibleLimit += pageSize;
    renderProducts();
  });
  $('#clearFilters').addEventListener('click', () => {
    state.category = 'Todos';
    state.search = '';
    state.visibleLimit = pageSize;
    $('#searchInput').value = '';
    renderCategories();
    renderProducts();
  });
  $('#emptyReset').addEventListener('click', () => $('#clearFilters').click());
  $('#openQuote').addEventListener('click', openQuote);
  $('#closeQuote').addEventListener('click', closeQuote);
  backdrop.addEventListener('click', closeQuote);
  $('#continueShopping').addEventListener('click', closeQuote);
  $('#sendQuote').addEventListener('click', () => sendToWhatsApp());
  $('#helpWhatsapp').addEventListener('click', () => sendToWhatsApp(true));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && quoteDrawer.classList.contains('open')) closeQuote();
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      $('#searchInput').focus();
      $('#catalogo').scrollIntoView({ behavior: 'smooth' });
    }
  });

  renderCategories();
  renderProducts();
  updateQuoteCount();
})();
