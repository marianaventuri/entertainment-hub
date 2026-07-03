// ── Estado ────────────────────────────────────────────────────────────────────
let catalogo = JSON.parse(localStorage.getItem('catalogo') || '[]');
let filtroTipo = 'todos';

// ── Ícones por tipo ────────────────────────────────────────────────────────────
const TIPO_ICON = {
  'Filme': '🎬',
  'Série': '📺',
  'Anime': '⛩️',
  'Mangá': '📖',
  'Dorama': '🎭'
};

// ── Classes de badge por status ────────────────────────────────────────────────
const STATUS_CLASS = {
  'Assistindo':     'badge-status-assistindo',
  'Finalizado':     'badge-status-finalizado',
  'Abandonado':     'badge-status-abandonado',
  'Quero assistir': 'badge-status-quero'
};

// ── Estrelas ───────────────────────────────────────────────────────────────────
function buildStars(rating) {
  const n = parseInt(rating);
  if (!n) return '';
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// ── Salvar ─────────────────────────────────────────────────────────────────────
function save() {
  localStorage.setItem('catalogo', JSON.stringify(catalogo));
}

// ── Adicionar ──────────────────────────────────────────────────────────────────
function addItem() {
  const title = document.getElementById('title').value.trim();
  const type = document.getElementById('type').value;
  const status = document.getElementById('status').value;
  const rating = document.getElementById('rating').value;
  const notes = document.getElementById('notes').value.trim();

  if (!title) {
    const input = document.getElementById('title');
    input.focus();
    input.style.borderColor = '#e63946';
    setTimeout(() => input.style.borderColor = '', 1200);
    return;
  }

  catalogo.unshift({ id: Date.now(), title, type, status, rating, notes });
  save();

  document.getElementById('title').value = '';
  document.getElementById('notes').value = '';
  document.getElementById('rating').value = '0';

  renderList();
  updateStats();
}

// ── Deletar ────────────────────────────────────────────────────────────────────
function deleteItem(id) {
  catalogo = catalogo.filter(i => i.id !== id);
  save();
  renderList();
  updateStats();
}

// ── Filtro de tipo ─────────────────────────────────────────────────────────────
function setFilter(tipo, btn) {
  filtroTipo = tipo;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderList();
}

// ── Render ─────────────────────────────────────────────────────────────────────
function renderList() {
  const list = document.getElementById('list');
  const empty = document.getElementById('empty-state');
  const filtroStatus = document.getElementById('filterStatus').value;

  let items = catalogo;
  if (filtroTipo !== 'todos') items = items.filter(i => i.type === filtroTipo);
  if (filtroStatus)           items = items.filter(i => i.status === filtroStatus);

  if (items.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  list.innerHTML = items.map(item => {
    const statusClass = STATUS_CLASS[item.status] || '';
    const stars = buildStars(item.rating);
    const icon  = TIPO_ICON[item.type] || '🎞️';
    const notesHtml = item.notes
      ? `<div class="card-notes">${escapeHtml(item.notes)}</div>`
      : '';

    return `
      <div class="card" data-type="${item.type}">
        <div class="card-type-icon">${icon}</div>
        <div class="card-body">
          <div class="card-title">${escapeHtml(item.title)}</div>
          <div class="card-meta">
            <span class="badge">${item.type}</span>
            <span class="badge ${statusClass}">${item.status}</span>
            ${stars ? `<span class="card-rating">${stars}</span>` : ''}
          </div>
          ${notesHtml}
        </div>
        <div class="card-actions">
          <button class="btn-delete" onclick="deleteItem(${item.id})" title="Remover">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

// ── Stats no header ────────────────────────────────────────────────────────────
function updateStats() {
  const total = catalogo.length;
  const watching = catalogo.filter(i => i.status === 'Assistindo').length;
  document.getElementById('stat-total').textContent =
    `${total} ${total === 1 ? 'obra' : 'obras'}`;
  document.getElementById('stat-watching').textContent =
    `${watching} assistindo`;
}

// ── Escape XSS ────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Enter no campo de título ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('title').addEventListener('keydown', e => {
    if (e.key === 'Enter') addItem();
  });
  document.getElementById('notes').addEventListener('keydown', e => {
    if (e.key === 'Enter') addItem();
  });
  renderList();
  updateStats();
// Removed per-type default status mapping to use generic status options.
// No automatic status change based on type.

});
