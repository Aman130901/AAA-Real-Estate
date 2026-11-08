/**
 * AAA Real Estate — feature layer (listings, filters, compare, EMI, enquiries, motion)
 * NOTE: All property data below is SAMPLE data. Data/forms are stored in this browser only
 * (localStorage) until a backend such as Supabase is connected.
 */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toast = (m) => (window.showToast ? window.showToast(m) : alert(m));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked */ } };

  /* ===== CONFIG ===== */
  const BUSINESS_WHATSAPP = '919967981427'; // Primary WhatsApp
  const BUSINESS_WHATSAPP_2 = '917021650366'; // Secondary WhatsApp
  const CITIES = ['Mumbai', 'Thane', 'Navi Mumbai', 'Pune']; // add more cities here
  const TYPES = ['Apartment', 'Villa', 'Penthouse', 'Commercial', 'Plot', 'Luxury Home'];
  const BUDGETS = {
    buy: [5e6, 1e7, 2e7, 5e7, 1e8],
    rent: [15000, 25000, 50000, 100000],
    commercial: [1e7, 3e7, 5e7, 1e8],
  };
  const PAGE_SIZE = 6;

  /* ===== SAMPLE DATA (not real listings) ===== */
  const A1 = ['Lift', 'Parking', 'Gym', '24x7 Security'], A2 = ['Garden', 'Clubhouse', 'Swimming Pool', 'Power Backup'];
  const P = (id, title, mode, type, city, locality, pin, bhk, bath, carpet, price, furn, poss, img, amen, added) =>
    ({ id, title, mode, type, city, locality, pin, bhk, bath, carpet, price, furn, poss, img, amen, added });
  const PROPS = [
    P(1, 'Sample 2 BHK Apartment, Andheri West', 'buy', 'Apartment', 'Mumbai', 'Andheri West', '400053', 2, 2, 780, 21500000, 'Semi-furnished', 'Ready to move', 'assets/rec-1.jpg', A1, 3),
    P(2, 'Sample 3 BHK Apartment, Ghodbunder Road', 'buy', 'Apartment', 'Thane', 'Ghodbunder Road', '400615', 3, 3, 1050, 14500000, 'Unfurnished', 'Under construction', 'assets/rec-2.jpg', [...A1, 'Clubhouse'], 8),
    P(3, 'Sample 2 BHK for Rent, Vashi', 'rent', 'Apartment', 'Navi Mumbai', 'Vashi', '400703', 2, 2, 850, 42000, 'Furnished', 'Ready to move', 'assets/rec-3.jpg', ['Lift', 'Parking', 'Security'], 1),
    P(4, 'Sample 4 BHK Villa, Baner', 'buy', 'Villa', 'Pune', 'Baner', '411045', 4, 4, 3200, 48000000, 'Semi-furnished', 'Ready to move', 'assets/rec-2.jpg', [...A2, 'Parking'], 12),
    P(5, 'Sample 4 BHK Penthouse, Powai', 'buy', 'Penthouse', 'Mumbai', 'Powai', '400076', 4, 4, 2600, 79000000, 'Furnished', 'Ready to move', 'assets/rec-1.jpg', [...A1, ...A2], 5),
    P(6, 'Sample Office Space, BKC', 'commercial', 'Commercial', 'Mumbai', 'Bandra Kurla Complex', '400051', 0, 2, 1500, 45000000, 'Unfurnished', 'Ready to move', 'assets/step2-map.png', ['Lift', 'Parking', 'Power Backup', 'Security'], 6),
    P(7, 'Sample Residential Plot, Panvel', 'buy', 'Plot', 'Navi Mumbai', 'Panvel', '410206', 0, 0, 1800, 11000000, 'Unfurnished', 'Ready to move', 'assets/rec-3.jpg', ['Gated Community', 'Road Access'], 10),
    P(8, 'Sample 1 BHK for Rent, Hinjewadi', 'rent', 'Apartment', 'Pune', 'Hinjewadi', '411057', 1, 1, 600, 22000, 'Semi-furnished', 'Ready to move', 'assets/rec-3.jpg', ['Lift', 'Parking'], 2),
    P(9, 'Sample 5 BHK Luxury Home, Majiwada', 'buy', 'Luxury Home', 'Thane', 'Majiwada', '400601', 5, 5, 4000, 65000000, 'Furnished', 'Ready to move', 'assets/rec-1.jpg', [...A2, ...A1], 4),
  ];
  const byId = (id) => PROPS.find((p) => p.id === +id);
  const fmt = (n, mode) => {
    if (mode === 'rent') return '₹' + n.toLocaleString('en-IN') + '/mo';
    const t = (v) => String(+v.toFixed(2));
    return n >= 1e7 ? '₹' + t(n / 1e7) + ' Cr' : '₹' + t(n / 1e5) + ' L';
  };
  const spec = (p) => (p.bhk ? p.bhk + ' BHK' : p.type) + ' · ' + p.carpet + ' sq ft';

  /* ===== STATE (URL query params) ===== */
  const D = { mode: 'buy', q: '', type: '', bhk: '', furn: '', max: '', sort: 'relevant', view: 'grid', saved: '', page: '1' };
  const F = { ...D };
  new URLSearchParams(location.search).forEach((v, k) => { if (k in D) F[k] = v.slice(0, 60); });
  if (!BUDGETS[F.mode]) F.mode = 'buy';
  let favs = ls('aaa_favs', []);
  let cmp = ls('aaa_cmp', []).filter((id) => byId(id));
  let token = 0;

  const grid = $('#recGrid');
  if (!grid) return;

  const opts = (arr, first) => `<option value="">${first}</option>` + arr.map((v) => `<option>${esc(v)}</option>`).join('');
  const budgetOpts = (mode) => '<option value="">Any budget</option>' + BUDGETS[mode].map((v) => `<option value="${v}">Up to ${fmt(v, mode)}</option>`).join('');
  $('#hsType').innerHTML = opts(TYPES, 'Any type');
  $('#lsType').innerHTML = opts(TYPES, 'Type');
  $('#cityList').innerHTML = [...CITIES, ...new Set(PROPS.map((p) => p.locality))].map((v) => `<option value="${esc(v)}">`).join('');
  const lsSort = $('#lsSort');
  const lsPrice = document.createElement('select');
  lsPrice.id = 'lsPrice'; lsPrice.setAttribute('aria-label', 'Max price');
  lsSort.before(lsPrice);

  /* ===== RENDER ===== */
  function syncURL() {
    const u = new URLSearchParams();
    Object.keys(D).forEach((k) => { if (F[k] !== D[k]) u.set(k, F[k]); });
    history.replaceState(null, '', (u.toString() ? '?' + u : location.pathname) + location.hash);
  }
  function filtered() {
    const q = F.q.trim().toLowerCase();
    const r = PROPS.filter((p) =>
      p.mode === F.mode &&
      (!q || (p.city + ' ' + p.locality + ' ' + p.pin + ' ' + p.title).toLowerCase().includes(q)) &&
      (!F.type || p.type === F.type) &&
      (!F.bhk || (F.bhk === '4' ? p.bhk >= 4 : p.bhk === +F.bhk)) &&
      (!F.furn || p.furn === F.furn) &&
      (!F.max || p.price <= +F.max) &&
      (!F.saved || favs.includes(p.id)));
    const s = { plh: (a, b) => a.price - b.price, phl: (a, b) => b.price - a.price, new: (a, b) => a.added - b.added };
    if (s[F.sort]) r.sort(s[F.sort]);
    return r;
  }
  function cardHTML(p) {
    const f = favs.includes(p.id);
    return `<article class="property-card" data-id="${p.id}">
      <div class="property-image-box" data-act="view" style="cursor:pointer;" title="Click to view details">
        <img src="${p.img}" alt="${esc(p.title)}" class="property-img" loading="lazy" width="400" height="260" data-act="view">
        <div class="property-badge">Sample</div>
        <button type="button" class="fav${f ? ' on' : ''}" data-act="fav" aria-pressed="${f}" aria-label="${f ? 'Remove from' : 'Add to'} saved">${f ? '♥' : '♡'}</button>
      </div>
      <div class="property-details">
        <div class="property-meta-row"><span class="rooms-count">${esc(spec(p))}</span><span class="price-tag"><strong class="price-val">${fmt(p.price, p.mode)}</strong></span></div>
        <h3 class="property-title" data-act="view" style="cursor:pointer;" title="Click to view details">${esc(p.title)}</h3>
        <p class="property-subtext">📍 ${esc(p.locality)}, ${esc(p.city)} · ${esc(p.poss)}</p>
        <div class="card-actions"><button type="button" class="link-btn" data-act="view">View details</button>
          <label class="cmp"><input type="checkbox" data-act="cmp" ${cmp.includes(p.id) ? 'checked' : ''}> Compare</label></div>
      </div></article>`;
  }
  function render(skeleton) {
    const my = ++token;
    syncURL();
    $$('#lsMode button').forEach((b) => { const a = b.dataset.mode === F.mode; b.classList.toggle('active', a); b.setAttribute('aria-selected', a ? 'true' : 'false'); });
    $$('.view-toggle button').forEach((b) => b.classList.toggle('active', b.dataset.view === F.view));
    lsPrice.innerHTML = budgetOpts(F.mode);
    $('#lsQ').value = F.q; $('#lsType').value = F.type; $('#lsBhk').value = F.bhk; $('#lsFurn').value = F.furn;
    lsPrice.value = F.max; lsSort.value = F.sort; $('#lsSaved').checked = !!F.saved;
    grid.classList.toggle('list-view', F.view === 'list');
    const list = filtered();
    const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    const page = Math.min(Math.max(1, +F.page || 1), pages);
    F.page = String(page);
    const show = () => {
      if (my !== token) return;
      grid.setAttribute('aria-busy', 'false');
      grid.innerHTML = list.length
        ? list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(cardHTML).join('')
        : `<div class="empty"><h3>No properties match your search</h3><p>Try removing a filter or explore a city:</p>
           <div>${CITIES.map((c) => `<button type="button" class="chip" data-city="${esc(c)}">${esc(c)}</button>`).join('')}</div>
           <button type="button" class="btn-coral-lg" data-act="clear">Clear all filters</button></div>`;
    };
    $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'property' : 'properties'} found`;
    if (skeleton && !RM) {
      grid.setAttribute('aria-busy', 'true');
      grid.innerHTML = '<div class="property-card skel"></div>'.repeat(3);
      setTimeout(show, 250);
    } else show();
    chips(); pager(pages, page); extras(); cmpBar();
  }
  function chips() {
    const L = [];
    if (F.q) L.push(['q', '“' + esc(F.q) + '”']);
    if (F.type) L.push(['type', esc(F.type)]);
    if (F.bhk) L.push(['bhk', esc(F.bhk) + ' BHK']);
    if (F.furn) L.push(['furn', esc(F.furn)]);
    if (F.max) L.push(['max', 'Up to ' + fmt(+F.max, F.mode)]);
    if (F.saved) L.push(['saved', 'Saved only']);
    $('#chips').innerHTML = L.map(([k, t]) => `<button type="button" class="chip" data-chip="${k}">${t} ✕</button>`).join('') +
      (L.length ? '<button type="button" class="chip clear" data-act="clear">Clear all</button><button type="button" class="chip save" data-act="savesearch">★ Save this search</button>' : '');
  }
  function pager(pages, page) {
    const el = $('#pager');
    if (pages < 2) { el.innerHTML = ''; return; }
    let h = `<button ${page < 2 ? 'disabled' : ''} data-page="${page - 1}">‹ Prev</button>`;
    for (let i = 1; i <= pages; i++) h += `<button class="${i === page ? 'active' : ''}" data-page="${i}" ${i === page ? 'aria-current="page"' : ''}>${i}</button>`;
    el.innerHTML = h + `<button ${page >= pages ? 'disabled' : ''} data-page="${page + 1}">Next ›</button>`;
  }
  function extras() {
    let el = $('#extras');
    if (!el) { el = document.createElement('div'); el.id = 'extras'; $('#pager').after(el); }
    const rec = ls('aaa_recent', []).map(byId).filter(Boolean);
    const ss = ls('aaa_searches', []);
    el.innerHTML = (rec.length ? `<h3>Recently viewed</h3><div class="mini-row">${rec.map((p) => `<button type="button" class="mini" data-open="${p.id}"><img src="${p.img}" alt="" width="64" height="48" loading="lazy"><span>${esc(p.title)}<br><b>${fmt(p.price, p.mode)}</b></span></button>`).join('')}</div>` : '') +
      (ss.length ? `<h3>Saved searches</h3><div>${ss.map((s, i) => `<span class="chip"><button type="button" data-ss="${i}">${esc(s.label)}</button> <button type="button" data-ssdel="${i}" aria-label="Delete saved search">✕</button></span>`).join('')}</div>` : '');
  }

  /* ===== FILTER EVENTS ===== */
  const set = (k, v) => { F[k] = v; F.page = '1'; render(true); };
  $('#lsMode').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { F.max = ''; set('mode', b.dataset.mode); } });
  let qt; $('#lsQ').addEventListener('input', (e) => { clearTimeout(qt); qt = setTimeout(() => set('q', e.target.value.slice(0, 60)), 300); });
  [['lsType', 'type'], ['lsBhk', 'bhk'], ['lsFurn', 'furn'], ['lsSort', 'sort']].forEach(([id, k]) => $('#' + id).addEventListener('change', (e) => set(k, e.target.value)));
  lsPrice.addEventListener('change', (e) => set('max', e.target.value));
  $('#lsSaved').addEventListener('change', (e) => set('saved', e.target.checked ? '1' : ''));
  $('.view-toggle').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { F.view = b.dataset.view; render(); } });
  $('#pager').addEventListener('click', (e) => { const b = e.target.closest('[data-page]'); if (b) { F.page = b.dataset.page; render(true); $('#recommendations').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); } });
  const clearAll = () => { const m = F.mode; Object.assign(F, D, { mode: m }); render(true); };
  const savedSearch = () => {
    const u = new URLSearchParams(); Object.keys(D).forEach((k) => { if (F[k] !== D[k] && k !== 'page') u.set(k, F[k]); });
    const ss = ls('aaa_searches', []); const label = F.mode + (F.q ? ' · ' + F.q : '') + (F.type ? ' · ' + F.type : '') + (F.bhk ? ' · ' + F.bhk + ' BHK' : '');
    ss.push({ label, qs: u.toString() }); sv('aaa_searches', ss.slice(-5)); extras(); toast('Search saved');
  };
  document.addEventListener('click', (e) => {
    const t = e.target;
    const chip = t.closest('[data-chip]'); if (chip) { set(chip.dataset.chip, ''); return; }
    const city = t.closest('[data-city]'); if (city) { openCity(city.dataset.city); return; }
    const ss = t.closest('[data-ss]'); if (ss) { const s = ls('aaa_searches', [])[+ss.dataset.ss]; if (s) { Object.assign(F, D); new URLSearchParams(s.qs).forEach((v, k) => { if (k in D) F[k] = v; }); render(true); } return; }
    const sd = t.closest('[data-ssdel]'); if (sd) { const a = ls('aaa_searches', []); a.splice(+sd.dataset.ssdel, 1); sv('aaa_searches', a); extras(); return; }
    const op = t.closest('[data-open]'); if (op) { openProperty(op.dataset.open); return; }
    const act = t.closest('[data-act]'); if (!act) return;
    const card = act.closest('.property-card'); const id = card && +card.dataset.id;
    switch (act.dataset.act) {
      case 'clear': clearAll(); break;
      case 'savesearch': savedSearch(); break;
      case 'view': openProperty(id); break;
      case 'fav': toggleFav(id); break;
      case 'cmp': toggleCmp(id, act); break;
    }
  });
  function openCity(c) {
    Object.assign(F, D); F.q = c;
    F.mode = ['buy', 'rent', 'commercial'].find((m) => PROPS.some((p) => p.mode === m && p.city === c)) || 'buy';
    render(true); $('#recommendations').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  }

  /* ===== HERO SEARCH ===== */
  let heroMode = F.mode;
  const hsPrice = $('#hsPrice'); hsPrice.innerHTML = budgetOpts(heroMode);
  $('.adv-search .mode-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.mode-tab'); if (!b) return;
    heroMode = b.dataset.mode; $$('.adv-search .mode-tab').forEach((x) => { const a = x === b; x.classList.toggle('active', a); x.setAttribute('aria-selected', a ? 'true' : 'false'); }); hsPrice.innerHTML = budgetOpts(heroMode);
  });
  $('#heroSearch').addEventListener('submit', (e) => {
    e.preventDefault();
    Object.assign(F, D, { mode: heroMode, q: $('#hsQ').value.trim().slice(0, 60), type: $('#hsType').value, bhk: $('#hsBhk').value, max: hsPrice.value });
    render(true); $('#recommendations').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  });
  $$('[data-nav]').forEach((a) => a.addEventListener('click', () => {
    const n = a.dataset.nav;
    if (n === 'buy' || n === 'rent') { Object.assign(F, D, { mode: n }); render(true); }
    if (n === 'sell') {
      const et = $('#eType');
      if (et) et.value = 'Sell my property';
      const c = $('#contact');
      if (window.lenis) {
        window.lenis.scrollTo(c, { offset: -72, duration: 1.2 });
      } else if (c) {
        c.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
      }
    }
    if (n === 'contact') {
      const f = $('#footer');
      if (window.lenis) {
        window.lenis.scrollTo(f, { offset: -72, duration: 1.2 });
      } else if (f) {
        f.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
      }
    }
  }));
  $$('a[href="#contact"]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    const c = $('#contact');
    if (window.lenis) {
      window.lenis.scrollTo(c, { offset: -72, duration: 1.2 });
    } else if (c) {
      c.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    }
    const nm = $('#navMenu'), mt = $('#mobileToggle');
    if (nm) { nm.classList.remove('open'); nm.style.removeProperty('display'); }
    if (mt) mt.classList.remove('active');
  }));
  $$('a[href="#footer"]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    const f = $('#footer');
    if (window.lenis) {
      window.lenis.scrollTo(f, { offset: -72, duration: 1.2 });
    } else if (f) {
      f.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
    }
    const nm = $('#navMenu'), mt = $('#mobileToggle');
    if (nm) { nm.classList.remove('open'); nm.style.removeProperty('display'); }
    if (mt) mt.classList.remove('active');
  }));
  $$('.nav-link').forEach((a) => a.addEventListener('click', () => {
    const nm = $('#navMenu'), mt = $('#mobileToggle');
    if (nm) { nm.classList.remove('open'); nm.style.removeProperty('display'); }
    if (mt) mt.classList.remove('active');
  }));
  $$('.logo-link, [data-nav="home"]').forEach((el) => el.addEventListener('click', (e) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
  }));
  window.bookSiteVisit = () => {
    const el = $('#contact');
    const type = $('#eType');
    if (type) type.value = 'Schedule a site visit';
    if (el) el.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  };

  /* ===== FAVOURITES / COMPARE ===== */
  function toggleFav(id) {
    favs = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id]; sv('aaa_favs', favs);
    toast(favs.includes(id) ? 'Saved to your list' : 'Removed from saved');
    render();
  }
  function toggleCmp(id, box) {
    if (cmp.includes(id)) cmp = cmp.filter((x) => x !== id);
    else if (cmp.length >= 4) { box.checked = false; toast('You can compare up to 4 properties'); return; }
    else cmp.push(id);
    sv('aaa_cmp', cmp); cmpBar();
  }
  function cmpBar() {
    let b = $('#cmpBar');
    if (!b) { b = document.createElement('div'); b.id = 'cmpBar'; b.className = 'cmp-bar'; document.body.appendChild(b); }
    b.hidden = !cmp.length;
    b.innerHTML = `<span>${cmp.length}/4 selected</span><button type="button" class="btn-coral-full" id="cmpGo" ${cmp.length < 2 ? 'disabled' : ''}>Compare</button><button type="button" id="cmpClr">Clear</button>`;
    $('#cmpGo').onclick = openCompare;
    $('#cmpClr').onclick = () => { cmp = []; sv('aaa_cmp', cmp); render(); };
  }
  function modal(id) {
    let m = $('#' + id);
    if (!m) { m = document.createElement('div'); m.id = id; m.className = 'modal-backdrop'; m.innerHTML = '<div class="modal-dialog room-dialog wide" role="dialog" aria-modal="true"><button class="modal-close-btn" aria-label="Close dialog">&times;</button><div class="room-modal-body"></div></div>';
      m.addEventListener('click', (e) => { if (e.target === m || e.target.classList.contains('modal-close-btn')) closeM(m); }); document.body.appendChild(m); }
    return m;
  }
  const openM = (m) => { m.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeM = (m) => { m.classList.remove('open'); document.body.style.overflow = ''; if (m.id === 'roomModal' && location.hash.startsWith('#property-')) history.replaceState(null, '', location.pathname + location.search); };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $$('.modal-backdrop.open').forEach(closeM); });
  function openCompare() {
    const m = modal('cmpModal'), L = cmp.map(byId);
    const row = (l, f) => `<tr><th scope="row">${l}</th>${L.map((p) => `<td>${f(p)}</td>`).join('')}</tr>`;
    const best = Math.min(...L.map((p) => p.price / p.carpet));
    $('.room-modal-body', m).innerHTML = `<h3>Compare properties</h3><p class="sample-note">Sample data.</p><div class="tbl"><table class="cmp-table"><thead><tr><th></th>${L.map((p) => `<th>${esc(p.title)}</th>`).join('')}</tr></thead><tbody>` +
      row('Price', (p) => fmt(p.price, p.mode)) + row('Price / sq ft', (p) => '₹' + Math.round(p.price / p.carpet).toLocaleString('en-IN') + (p.price / p.carpet === best && L.length > 1 ? ' ✓ lowest' : '')) +
      row('Carpet area', (p) => p.carpet + ' sq ft') + row('BHK / Baths', (p) => (p.bhk || '—') + ' / ' + (p.bath || '—')) + row('Furnishing', (p) => p.furn) +
      row('Possession', (p) => p.poss) + row('Location', (p) => esc(p.locality + ', ' + p.city + ' ' + p.pin)) +
      row('Amenities', (p) => esc(p.amen.join(', '))) + '</tbody></table></div>';
    openM(m);
  }

  /* ===== DETAILS MODAL ===== */
  function waLink(msg, num = BUSINESS_WHATSAPP) {
    if (!num) { toast('WhatsApp number not configured'); return; }
    window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }
  const propMsg = (p) => `Hi AAA Real Estate, I'm interested in "${p.title}" (${fmt(p.price, p.mode)}), ${p.locality}, ${p.city}. Please share more details.`;
  function openProperty(id) {
    const p = byId(id); if (!p) return;
    const rv = [p.id, ...ls('aaa_recent', []).filter((x) => x !== p.id)].slice(0, 4); sv('aaa_recent', rv); extras();
    history.replaceState(null, '', location.pathname + location.search + '#property-' + p.id);
    const m = $('#roomModal'); const body = $('#roomModalBody');
    body.innerHTML = `<img class="pd-img" src="${p.img}" alt="${esc(p.title)}" width="700" height="380" loading="lazy">
      <div class="pd-head"><span>${esc(spec(p))}</span><strong>${fmt(p.price, p.mode)}</strong></div>
      <h3>${esc(p.title)}</h3><p class="pd-loc">📍 ${esc(p.locality)}, ${esc(p.city)} ${esc(p.pin)} <em class="sample-note">(sample)</em></p>
      <ul class="pd-spec"><li>Carpet area<b>${p.carpet} sq ft</b></li>${p.mode !== 'rent' ? `<li>Price / sq ft<b>₹${Math.round(p.price / p.carpet).toLocaleString('en-IN')}</b></li>` : ''}<li>Bathrooms<b>${p.bath || '—'}</b></li><li>Furnishing<b>${esc(p.furn)}</b></li><li>Possession<b>${esc(p.poss)}</b></li><li>Type<b>${esc(p.type)}</b></li></ul>
      <h4>Amenities</h4><p>${p.amen.map((a) => `<span class="chip">${esc(a)}</span>`).join('')}</p>
      <div class="pd-actions"><button class="btn-coral-full" data-pd="visit">Schedule site visit</button><button class="btn-wa" data-pd="wa">WhatsApp</button><button data-pd="share">Share</button><button data-pd="fav">${favs.includes(p.id) ? '♥ Saved' : '♡ Save'}</button><button data-pd="report">Report listing</button></div>`;
    body.onclick = (e) => {
      const a = e.target.closest('[data-pd]'); if (!a) return;
      ({
        visit: () => { closeM(m); $('#eProp').value = p.id; $('#eType').value = 'Schedule a site visit'; $('#contact').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }); },
        wa: () => waLink(propMsg(p)),
        share: async () => { const url = location.origin + location.pathname + '#property-' + p.id; try { if (navigator.share) await navigator.share({ title: p.title, url }); else { await navigator.clipboard.writeText(url); toast('Link copied'); } } catch (er) { /* cancelled */ } },
        fav: () => { toggleFav(p.id); a.textContent = favs.includes(p.id) ? '♥ Saved' : '♡ Save'; },
        report: () => { const r = ls('aaa_reports', []); r.push({ id: p.id, at: Date.now() }); sv('aaa_reports', r); toast('Thanks — listing reported for review'); },
      })[a.dataset.pd]();
    };
    openM(m);
  }
  window.openRoomModal = openProperty;
  window.closeRoomModal = (e) => { const m = $('#roomModal'); if (!e || e.target === m || (e.target.classList && e.target.classList.contains('modal-close-btn'))) closeM(m); };

  /* ===== CITIES ===== */
  const cImg = ['assets/rec-1.jpg', 'assets/rec-2.jpg', 'assets/rec-3.jpg', 'assets/step2-map.png'];
  $('#cityGrid').innerHTML = CITIES.map((c, i) => `<button type="button" class="city-card" data-city="${esc(c)}" style="background-image:linear-gradient(transparent 30%,rgba(10,20,40,.8)),url(${cImg[i % 4]})"><b>${esc(c)}</b><span>${PROPS.filter((p) => p.city === c).length} sample listings</span></button>`).join('');

  /* ===== EMI ===== */
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  function emi() {
    const P0 = +$('#emiAmt').value, R = +$('#emiRate').value, Y = +$('#emiYrs').value;
    if (!(P0 > 0) || !(Y > 0) || R < 0) { $('#emiMonthly').textContent = '—'; return; }
    const r = R / 1200, n = Y * 12;
    const e = r ? (P0 * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P0 / n;
    $('#emiMonthly').textContent = inr(e); $('#emiP').textContent = inr(P0); $('#emiI').textContent = inr(e * n - P0); $('#emiT').textContent = inr(e * n);
    $('#emiBarP').style.width = Math.min(100, (P0 / (e * n)) * 100) + '%';
  }
  ['Amt', 'Rate', 'Yrs'].forEach((k) => {
    const n = $('#emi' + k), r = $('#emi' + k + 'R');
    n.addEventListener('input', () => { r.value = n.value; emi(); }); r.addEventListener('input', () => { n.value = r.value; emi(); });
  });
  emi();

  /* ===== ENQUIRY / SITE VISIT ===== */
  const form = $('#enqForm'), eProp = $('#eProp');
  eProp.innerHTML = '<option value="">No specific property</option>' + PROPS.map((p) => `<option value="${p.id}">${esc(p.title)}</option>`).join('');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  $('#eDate').min = new Date(today - today.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  let editId = null;
  const err = (m) => { $('#eErr').textContent = m; return false; };
  function enqList() {
    const L = ls('aaa_enquiries', []);
    $('#myEnquiries').innerHTML = L.length ? '<h3>Your requests</h3>' + L.map((x) => `<div class="enq-item"><div><b>${esc(x.type)}</b>${x.prop ? ' · ' + esc(byId(x.prop)?.title || '') : ''}<br><small>${x.date ? esc(x.date) + ', ' + esc(x.slot) + ' · ' : ''}<span class="status ${x.status === 'Cancelled' ? 'off' : ''}">${esc(x.status)}</span></small></div>
      ${x.status !== 'Cancelled' ? `<div><button data-enq="resched" data-id="${x.id}">Reschedule</button><button data-enq="cancel" data-id="${x.id}">Cancel</button></div>` : ''}</div>`).join('') : '';
  }
  $('#myEnquiries').addEventListener('click', (e) => {
    const b = e.target.closest('[data-enq]'); if (!b) return;
    const L = ls('aaa_enquiries', []), x = L.find((i) => i.id === b.dataset.id); if (!x) return;
    if (b.dataset.enq === 'cancel') { x.status = 'Cancelled'; sv('aaa_enquiries', L); enqList(); toast('Request cancelled'); return; }
    editId = x.id; ['Name', 'Phone', 'Email', 'Msg'].forEach((k) => { $('#e' + k).value = x[k.toLowerCase()] || ''; });
    $('#eType').value = x.type; eProp.value = x.prop || ''; $('#eDate').value = x.date || ''; $('#eSlot').value = x.slot || '';
    $('button[type=submit]', form).textContent = 'Update request'; form.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  });
  function readForm() {
    const v = (id) => $('#' + id).value.trim();
    const phone = v('ePhone').replace(/[\s-]/g, '').replace(/^(\+91|91|0)/, '');
    if (v('eName').length < 2) return err('Please enter your name.');
    if (!/^[6-9]\d{9}$/.test(phone)) return err('Enter a valid 10-digit Indian mobile number.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('eEmail'))) return err('Enter a valid email address.');
    const visit = $('#eType').value === 'Schedule a site visit';
    if (visit && !v('eDate')) return err('Please choose a date for the site visit.');
    if (v('eDate') && new Date(v('eDate')) < today) return err('Date cannot be in the past.');
    err('');
    return { name: v('eName').slice(0, 80), phone, email: v('eEmail').slice(0, 120), msg: v('eMsg').slice(0, 500), type: $('#eType').value, prop: eProp.value, date: v('eDate'), slot: $('#eSlot').value };
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#eHp').value) return; // honeypot (spam)
    const d = readForm(); if (!d) return;
    const L = ls('aaa_enquiries', []);
    if (editId) { Object.assign(L.find((i) => i.id === editId) || {}, d, { status: 'New' }); editId = null; $('button[type=submit]', form).textContent = 'Submit request'; toast('Request updated'); }
    else {
      const last = ls('aaa_last_enq', 0); if (Date.now() - last < 5000) return err('Please wait a few seconds before sending another request.');
      L.unshift({ id: 'e' + Date.now(), ...d, status: 'New', created: Date.now() }); sv('aaa_last_enq', Date.now()); toast('Request received (saved in this browser — demo)');
    }
    sv('aaa_enquiries', L); enqList(); form.reset(); fillUser();
  });
  $('#eWa').addEventListener('click', () => {
    const p = byId(eProp.value), n = $('#eName').value.trim();
    waLink(p ? propMsg(p) : `Hi AAA Real Estate, I'm ${n || 'interested in a property'} and would like to talk about ${$('#eType').value.toLowerCase()}.`);
  });

  /* ===== AUTH (demo, this browser only) ===== */
  if (!ls('aaa_account', null)) {
    sv('aaa_account', { email: 'demo@example.com', name: 'Demo User' });
  }
  let user = ls('aaa_user', null);
  function fillUser() {
    if (user) {
      const en = $('#eName'), ee = $('#eEmail');
      if (en) en.value = user.name;
      if (ee) ee.value = user.email;
    }
    const b = $('#authSignIn');
    if (b) {
      b.textContent = user ? 'Hi, ' + user.name.split(' ')[0] + ' · Logout' : 'Login';
      b.onclick = user ? () => { user = null; try { localStorage.removeItem('aaa_user'); } catch (e) { /* */ } fillUser(); toast('Logged out'); } : () => window.openAuthModal('signin');
    }
    const regBtn = $('.btn-getstarted');
    if (regBtn) regBtn.style.display = user ? 'none' : '';
    const mobAuth = $('#mobAuthBtn');
    if (mobAuth) {
      mobAuth.textContent = user ? 'Logout (' + user.name.split(' ')[0] + ')' : 'Login / Register';
      mobAuth.onclick = user ? () => { user = null; try { localStorage.removeItem('aaa_user'); } catch (e) { /* */ } fillUser(); toast('Logged out'); } : () => window.openAuthModal('signin');
    }
  }
  window.handleAuthSubmit = (e, type) => {
    e.preventDefault();
    const em = $(type === 'signin' ? '#signinEmail' : '#signupEmail').value.trim().toLowerCase();
    if (type === 'signup') {
      if ($('#signupPass').value.length < 8) return toast('Password must be at least 8 characters');
      user = { name: ($('#signupFirst').value + ' ' + $('#signupLast').value).trim().slice(0, 80), email: em };
      sv('aaa_user', user);
      sv('aaa_account', { email: em, name: user.name });
    } else {
      let acc = ls('aaa_account', null);
      if (em === 'demo@example.com' || em === 'example@email.com') {
        acc = { email: em, name: 'Demo User' };
        sv('aaa_account', acc);
      }
      if (!acc || acc.email !== em) return toast('No demo account found for this email — please register first');
      user = acc;
      sv('aaa_user', user);
    }
    window.closeAuthModal(); fillUser(); toast('Welcome, ' + user.name + ' (demo account, this browser only)');
  };

  /* ===== MOTION (respects prefers-reduced-motion) ===== */
  $$('.stats-grid [data-count]').forEach((el) => { if (el.id === 'statProps') el.dataset.count = PROPS.length; });
  const countUp = (el) => {
    const end = +el.dataset.count, suf = el.dataset.suffix || '';
    if (RM) { el.textContent = end + suf; return; }
    const t0 = performance.now();
    (function tick(t) { const k = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(tick); })(t0);
  };
  if ('IntersectionObserver' in window && !RM) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); $$('[data-count]', en.target).forEach(countUp); io.unobserve(en.target); } }), { threshold: 0.12 });
    $$('main > section:not(.hero-section), .footer').forEach((s) => { s.classList.add('reveal'); io.observe(s); });
  } else $$('[data-count]').forEach(countUp);
  if (!RM && matchMedia('(hover:hover)').matches) {
    grid.addEventListener('pointermove', (e) => { const c = e.target.closest('.property-card'); if (!c) return; const r = c.getBoundingClientRect(); c.style.transform = `perspective(700px) rotateX(${(-(e.clientY - r.top) / r.height + 0.5) * 6}deg) rotateY(${((e.clientX - r.left) / r.width - 0.5) * 6}deg)`; });
    grid.addEventListener('pointerout', (e) => { const c = e.target.closest('.property-card'); if (c) c.style.transform = ''; });
  }
  // Mouse-reactive particle background (lightweight 2D canvas; skipped on reduced motion / low-power devices)
  const hero = $('#hero'), lowPower = innerWidth < 760 || (navigator.hardwareConcurrency || 8) < 4 || (navigator.deviceMemory || 8) < 4;
  if (hero && !RM && !lowPower) {
    const cv = document.createElement('canvas'); cv.className = 'fx'; cv.setAttribute('aria-hidden', 'true'); hero.prepend(cv);
    const x = cv.getContext('2d'); let w, h, run = true, mx = -999, my = -999;
    const pts = Array.from({ length: 55 }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0004, vy: (Math.random() - 0.5) * 0.0004 }));
    const size = () => { w = cv.width = hero.clientWidth; h = cv.height = hero.clientHeight; }; size(); addEventListener('resize', size);
    hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    new IntersectionObserver((es) => { run = es[0].isIntersecting; if (run) loop(); }).observe(hero);
    (function loop() {
      if (!run || document.hidden) { if (run) requestAnimationFrame(loop); return; }
      x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(229,168,53,.7)';
      pts.forEach((p) => {
        p.x = (p.x + p.vx + 1) % 1; p.y = (p.y + p.vy + 1) % 1;
        let px = p.x * w, py = p.y * h; const dx = px - mx, dy = py - my, d = Math.hypot(dx, dy);
        if (d < 120) { px += (dx / d) * (120 - d) * 0.3; py += (dy / d) * (120 - d) * 0.3; }
        x.beginPath(); x.arc(px, py, 2, 0, 6.3); x.fill();
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ===== INIT ===== */
  fillUser(); enqList();
  const pm = /^#property-(\d+)$/.exec(location.hash);
  render();
  if (pm) openProperty(pm[1]);
})();
