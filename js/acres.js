'use strict';

document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('keydown', event => {
  const inspectorModifier = (event.ctrlKey && event.shiftKey) || (event.metaKey && event.altKey);
  if (event.key === 'F12' || (inspectorModifier && ['KeyI', 'KeyJ', 'KeyC'].includes(event.code))) {
    event.preventDefault();
  }
});

const bagKey = 'acres.bag.v1';
const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const query = new URLSearchParams(location.search);
const get = id => document.getElementById(id);

function readList(storage, key) {
  const value = JSON.parse(storage.getItem(key) || '[]');
  return Array.isArray(value) ? value : [];
}

function bagItems() {
  try {
    return readList(sessionStorage, bagKey).filter(item => item && Number.isInteger(item.id) &&
      typeof item.color === 'string' && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 99);
  } catch {
    return [];
  }
}

function updateCount() {
  get('bag-count').textContent = bagItems().reduce((total, item) => total + item.qty, 0);
}

function storeBag(items) {
  sessionStorage.setItem(bagKey, JSON.stringify(items));
  updateCount();
}

function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function link(text, href, className) {
  const anchor = element('a', text, className);
  anchor.href = href;
  return anchor;
}

function picture(product) {
  const img = element('img');
  img.src = product.mainImage;
  img.alt = product.title;
  return img;
}

function initCatalog(products) {
  const grid = get('catalog-grid');
  if (products) {
    const template = grid.firstElementChild;
    const seen = new Set();
    const cards = [];
    for (const product of products) {
      if (seen.has(product.title)) continue;
      seen.add(product.title);
      const card = template.cloneNode(true);
      const category = product.category || 'Objects';
      card.dataset.category = category;
      card.dataset.price = product.price;
      card.querySelector('a').href = 'shop_product_page.html?id=' + product.id;
      card.querySelector('img').src = product.mainImage;
      card.querySelector('img').alt = product.title;
      card.querySelector('small').textContent = category;
      card.querySelector('h3').textContent = product.title;
      card.querySelector('.product-info > span').textContent = money.format(product.price);
      cards.push(card);
    }
    grid.replaceChildren(...cards);
    const categories = Array.from(new Set(cards.map(card => card.dataset.category)));
    get('category').replaceChildren(...['All pieces', ...categories].map(value => new Option(value, value)));
  }
  const cards = Array.from(grid.children);
  function refresh() {
    const ordered = cards.slice();
    const direction = get('sort').value;
    if (direction !== 'studio') {
      ordered.sort((a, b) => (a.dataset.price - b.dataset.price) * (direction === 'low' ? 1 : -1));
    }
    for (const card of ordered) {
      card.hidden = get('category').value !== 'All pieces' && get('category').value !== card.dataset.category;
      grid.append(card);
    }
  }
  get('sort').addEventListener('change', refresh);
  get('category').addEventListener('change', refresh);
}

function initReviews(product) {
  const key = 'acres.reviews.' + product.id;
  const form = get('review');
  const list = get('review-list');
  function render() {
    const reviews = readList(localStorage, key);
    list.replaceChildren(...reviews.map(text => element('blockquote', text)));
  }
  get('reviews').hidden = false;
  try { render(); } catch { list.textContent = 'Previously saved reviews are unavailable.'; }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = form.elements.review.value.trim();
    const status = form.querySelector('[role=status]');
    if (!text) { status.textContent = 'Enter a review first.'; return; }
    try {
      localStorage.setItem(key, JSON.stringify([...readList(localStorage, key), text]));
      render();
      form.reset();
      status.textContent = 'Review saved in this browser.';
    } catch { status.textContent = 'Your browser could not save this review.'; }
  });
}

function initPiece(products) {
  const product = query.has('id') ? products.find(p => String(p.id) === query.get('id')) : products[0];
  const container = get('piece');
  if (!product) {
    container.replaceChildren(element('h1', 'Piece unavailable'), link('Browse the collection', 'shop.html'));
    return;
  }
  document.title = product.title + ' | Acres';
  for (const name of ['description', 'og:description', 'og:title']) {
    document.querySelector('meta[name="'+name+'"],meta[property="'+name+'"]').content =
      name === 'og:title' ? document.title : product.description;
  }
  const copy = element('div');
  const price = element('p', money.format(product.price), 'price');
  if (product.oldPrice > product.price) price.append(element('del', money.format(product.oldPrice)));
  const form = element('form');
  const label = element('label', 'Color');
  const colors = element('select');
  product.colors.forEach(color => colors.add(new Option(color, color)));
  label.append(colors);
  const status = element('p');
  status.setAttribute('role', 'status');
  form.append(label, element('button', 'Add to bag'), status);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const items = bagItems();
    const match = items.find(item => item.id === product.id && item.color === colors.value);
    if (match && match.qty >= 99) { status.textContent = 'The limit is 99 per color.'; return; }
    if (match) match.qty++;
    else items.push({ id: product.id, color: colors.value, qty: 1 });
    try {
      storeBag(items);
      if (desktop.matches) openDrawer();
      status.replaceChildren('Added to your bag. ', link('View bag', 'shop_cart.html'));
    } catch { status.textContent = 'Enable browser storage to save your bag.'; }
  });
  copy.append(element('span', 'Acres collection', 'eyebrow'), element('h1', product.title),
    element('p', product.description), price, form);
  container.replaceChildren(picture(product), copy);
  initReviews(product);
}

function selectedPieces(products) {
  return bagItems().map(item => ({...item, product: products.find(p => p.id === item.id)}))
    .filter(item => item.product && item.product.colors.includes(item.color));
}

function renderBag(products, bag = get('bag')) {
  bag.replaceChildren();
  const items = selectedPieces(products);
  if (!items.length) {
    const empty = element('div', undefined, 'empty');
    empty.append(element('p', 'Your bag is empty.'), link('Explore the collection', 'shop.html', 'button'));
    bag.append(empty);
    return;
  }
  const status = element('p');
  status.setAttribute('role', 'status');
  function change(item, qty, focusKey) {
    const next = bagItems();
    const index = next.findIndex(row => row.id === item.id && row.color === item.color);
    if (index < 0) return;
    if (qty) next[index].qty = qty;
    else next.splice(index, 1);
    try {
      storeBag(next);
      renderBag(products, bag);
      if (bag !== get('bag') && get('bag')) renderBag(products);
      const controls = [...bag.querySelectorAll('button:not(:disabled), a')];
      (controls.find(node => node.dataset.key === focusKey) || controls[0])?.focus();
    }
    catch { status.textContent = 'Your browser could not update this bag.'; }
  }
  for (const item of items) {
    const row = element('div', undefined, 'bag-row');
    const info = element('div');
    const title = element('h3');
    title.append(link(item.product.title, 'shop_product_page.html?id=' + item.id));
    info.append(title, element('p', item.color + ' · ' + money.format(item.product.price) + ' each'));
    const controls = element('div', undefined, 'bag-controls');
    const stepper = element('div', undefined, 'stepper');
    stepper.setAttribute('role', 'group');
    stepper.setAttribute('aria-label', 'Quantity for ' + item.product.title + ', ' + item.color);
    function quantityButton(symbol, delta, name) {
      const button = element('button', symbol);
      button.type = 'button';
      button.setAttribute('aria-label', name + ' ' + item.product.title + ' quantity');
      button.dataset.key = [item.id, item.color, delta].join('-');
      button.disabled = item.qty + delta < 1 || item.qty + delta > 99;
      button.addEventListener('click', () => change(item, item.qty + delta, button.dataset.key));
      return button;
    }
    stepper.append(quantityButton('−', -1, 'Decrease'), element('output', item.qty), quantityButton('+', 1, 'Increase'));
    const remove = element('button', 'Remove', 'remove');
    remove.addEventListener('click', () => change(item, 0));
    controls.append(stepper, remove);
    row.append(picture(item.product), info, controls);
    bag.append(row);
  }
  const total = items.reduce((sum, item) => sum + item.qty * item.product.price, 0);
  bag.append(element('h2', 'Subtotal ' + money.format(total), 'bag-total'),
    link('Ask about these pieces', 'contact.html?from=bag', 'button'), status);
}

const desktop = matchMedia('(min-width: 761px)');
const drawer = element('dialog', undefined, 'cart-drawer');
drawer.setAttribute('aria-labelledby', 'drawer-title');
const drawerHead = element('div', undefined, 'drawer-head');
const drawerTitle = element('h2', 'Shopping bag');
drawerTitle.id = 'drawer-title';
const closeDrawer = element('button', '×', 'close-drawer');
closeDrawer.setAttribute('aria-label', 'Close shopping bag');
const drawerBody = element('div');
drawerHead.append(drawerTitle, closeDrawer);
drawer.append(drawerHead, drawerBody);
document.body.append(drawer);
closeDrawer.addEventListener('click', () => drawer.close());
drawer.addEventListener('click', event => {
  if (event.target === drawer && event.clientX > drawer.getBoundingClientRect().right) drawer.close();
});
desktop.addEventListener('change', () => { if (!desktop.matches && drawer.open) drawer.close(); });
let catalogRequest;
function catalog() {
  if (!catalogRequest) catalogRequest = loadCatalog().catch(error => { catalogRequest = null; throw error; });
  return catalogRequest;
}
async function openDrawer() {
  if (!drawer.open) drawer.showModal();
  drawerBody.textContent = 'Loading your bag…';
  try { renderBag(await catalog(), drawerBody); }
  catch { drawerBody.textContent = 'Unable to load your bag. Please try again.'; }
}
document.addEventListener('click', event => {
  const anchor = event.target.closest('a[href="shop_cart.html"]');
  if (anchor && desktop.matches && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
    event.preventDefault();
    openDrawer();
  }
});

function initHomeReviews(products) {
  const slides = [];
  for (const product of products) {
    try {
      for (const text of readList(localStorage, 'acres.reviews.' + product.id)) {
        if (typeof text === 'string' && text.trim()) slides.push({product, text, source: 'Review saved on this device'});
      }
    } catch { /* Studio reviews remain available when browser storage is disabled. */ }
  }
  const studioNotes = [
    [2, 'A shallow rim gives rings and keys their own landing place while leaving the Texas silhouette in view.'],
    [3, 'The low, open shape makes it easy to reach for a pinch of salt as you cook or pass it around the table.'],
    [5, 'Blue and white do the work here. The small discs carry the pattern right to the edge, giving each earring a slightly different face.']
  ];
  for (const [id, text] of studioNotes) {
    const product = products.find(piece => piece.id === id);
    if (product) slides.push({product, text, source: 'Acres studio review'});
  }
  if (!slides.length) return;
  let index = 0;
  const slide = get('review-slide');
  function show(delta) {
    index = (index + delta + slides.length) % slides.length;
    const {product, text, source} = slides[index];
    slide.replaceChildren(element('p', source + ' · ' + (index + 1) + ' / ' + slides.length, 'review-source'),
      element('p', text, 'review-copy'), link(product.title, 'shop_product_page.html?id=' + product.id));
  }
  get('review-prev').onclick = () => show(-1);
  get('review-next').onclick = () => show(1);
  show(0);
}

async function loadCatalog() {
  const response = await fetch('products/products.json');
  if (!response.ok) throw new Error('Catalog unavailable');
  return response.json();
}
async function initProducts() {
  const products = await catalog();
  if (get('review-slide')) initHomeReviews(products);
  if (get('catalog-grid')) initCatalog(products);
  if (get('piece')) initPiece(products);
  if (get('bag')) renderBag(products);
  if (get('contact') && query.get('from') === 'bag') {
    const items = selectedPieces(products);
    if (!items.length) return;
    get('contact').elements.subject.value = 'Acres shopping bag inquiry';
    get('contact').elements.message.value = "I’m interested in these pieces:\n" +
      items.map(item => item.qty + ' × ' + item.product.title + ' (' + item.color + ')').join('\n');
  }
}

for (const form of document.querySelectorAll('form[data-endpoint]')) {
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    const status = form.querySelector('[role=status]');
    button.disabled = true;
    status.textContent = 'Sending…';
    try {
      const response = await fetch(form.dataset.endpoint, {
        method: 'POST', headers: {'Content-Type': 'text/plain;charset=utf-8'},
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      if (!response.ok) throw new Error('Request failed');
      const result = await response.json();
      if (!result.success) throw new Error('Submission failed');
      form.reset();
      status.textContent = result.message || 'Thank you. Your message was received.';
    } catch { status.textContent = 'Your submission could not be confirmed. Please try again.'; }
    finally { button.disabled = false; }
  });
}
updateCount();
window.addEventListener('pageshow', updateCount);
if (get('review-slide') || get('catalog-grid') || get('piece') || get('bag') || (get('contact') && query.get('from') === 'bag')) {
  initProducts().catch(() => {
    if (get('review-slide')) { document.querySelector('.slider-controls').hidden = true; return; }
    if (get('catalog-grid')) { initCatalog(); return; }
    const target = get('piece') || get('bag') || get('contact').querySelector('[role=status]');
    target.textContent = 'The catalog could not load. Please refresh the page and try again.';
  });
}
