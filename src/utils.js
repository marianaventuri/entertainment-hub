function esc(s) {
  return String(s||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function normalizeStr(s) {
  return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function stars(n, max=5) {
  n = parseInt(n)||0;
  return '★'.repeat(n) + '☆'.repeat(max-n);
}

function statusBadgeClass(s) {
  if (s==='Assistindo')    return 'badge-assistindo';
  if (s==='Finalizado')    return 'badge-finalizado';
  if (s==='Abandonado')    return 'badge-abandonado';
  if (s==='Quero assistir')return 'badge-quero';
  return '';
}

function typeIcon(t) { return (TIPO[t]||{icon:'movie'}).icon; }

function displayStatus(status, type) {
  if (type === 'Box' || type === 'Coleção') return 'Colecionando';
  if (type === 'Livro' || type === 'Mangá') {
    if (status === 'Assistindo') return 'Lendo';
    if (status === 'Quero assistir') return 'Quero ler';
  } else if (type === 'Jogo') {
    if (status === 'Assistindo') return 'Jogando';
    if (status === 'Quero assistir') return 'Quero jogar';
  }
  return status || '';
}

function toast(msg, icon='✅', duration=2800) {
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  let variant = '';
  if (icon === '✅' || icon === '🎉' || icon === '✏️') variant = 'success';
  else if (icon === '❌' || icon === '⚠️') variant = 'error';
  else if (icon === '🔄' || icon === 'ℹ️') variant = 'info';
  else if (icon === '⌛' || icon === '⏳') variant = 'warning';
  el.className = 'toast' + (variant ? ' ' + variant : '');
  el.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${esc(msg)}</span><div class="toast-bar"></div>`;
  c.appendChild(el);
  requestAnimationFrame(() => { const bar = el.querySelector('.toast-bar'); if (bar) bar.style.transitionDuration = duration+'ms'; requestAnimationFrame(() => { if (bar) bar.style.width = '0%'; }); });
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 350);
  }, duration);
  const isMobile = window.innerWidth < 768;
  if (isMobile && navigator.vibrate) navigator.vibrate(10);
}

function debounce(fn, ms=200) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

function animateCount(el, target, duration=600) {
  if (!el) return;
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const from = 0;
  const step = (now) => {
    const pct = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - pct, 3);
    el.textContent = Math.round(from + (target - from) * eased) + suffix;
    if (pct < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(step);
}

function updateCounts() {
  const set = (id, n) => { const el = document.getElementById(id); if(el) el.textContent = n||''; };
  set('nc-total',     db.length);
  set('nc-wish',      wishdb.filter(w=>!w.done).length || '');
  ['Filme','Série','Anime','Mangá','Dorama','Jogo','Livro','Box','Coleção'].forEach(t =>
    set('nc-'+t, db.filter(x=>x.type===t).length || ''));
  set('nc-Assistindo', db.filter(x=>x.status==='Assistindo').length || '');
  set('nc-Finalizado', db.filter(x=>x.status==='Finalizado').length || '');
  set('nc-Abandonado', db.filter(x=>x.status==='Abandonado').length || '');
  set('nc-Quero',      db.filter(x=>x.status==='Quero assistir').length || '');
}

function findInDb(id) {
  const item = db.find(x => x.id === id) || db.find(x => String(x.id) === String(id));
  return item ? normalizeItem(item) : undefined;
}

function findIdxInDb(id) {
  const i = db.findIndex(x => x.id === id)
  return i !== -1 ? i : db.findIndex(x => String(x.id) === String(id))
}

function setSyncStatus(state) {
  const el = document.getElementById('syncStatus');
  if (!el) return;
  el.className = 'sync-status';
  if (state === 'offline') {
    el.classList.add('offline');
    el.title = 'Offline (Alterações salvas localmente)';
    el.textContent = '☁️';
  } else if (state === 'syncing') {
    el.classList.add('syncing');
    el.title = 'Sincronizando...';
    el.textContent = '🔄';
  } else {
    el.title = 'Sincronizado';
    el.textContent = '✅';
  }
}
