/* ═══════════════════════════════════════════
   STATE
═══════════════════════════════════════════ */
let db = load(STORAGE_KEY, []);
let wishdb = load(WISH_KEY, []);

let currentPage = 'catalogo';
let tipoFilter  = '';
let editingId   = null;
let favEdit     = false;

let isDeleteMode = false;
let selectedIds = new Set();
let localSaveGuard = false;
let revertGuard = false;

let unsubscribeSync = null;

/* ── Emotion dims ── */
const EMOTIONS = [
  { key: 'qualidade',    label: '🎯 Qualidade técnica' },
  { key: 'emocao',       label: '😭 Emoção / impacto'  },
  { key: 'trilha',       label: '🎵 Trilha sonora'      },
  { key: 'personagens',  label: '👥 Personagens'        },
  { key: 'historia',     label: '📜 História / plot'    },
  { key: 'reassistiria', label: '🔁 Reassistiria'       },
];

/* ── Tags ── */
const ALL_TAGS = [
  '❤️ Conforto','😭 Chorei','🔥 Intenso','😂 Funny','🧙 Magia',
  '🌳 Natureza','🛡 RPG','🌙 Dark','💀 Gore','💕 Romance',
  '🧠 Mind-blow','🌊 Melancolia','⚔️ Ação','🚀 Sci-fi','🎭 Drama',
  '👶 Infância','🌸 Slice of life','🕵️ Mistério','👻 Terror','🎌 Japão',
];

/* ── Type meta ── */
const TIPO = {
  Filme:  { icon:'🎬', color:'#e63946' },
  Série:  { icon:'📺', color:'#3b82f6' },
  Anime:  { icon:'⛩️', color:'#f97316' },
  Mangá:  { icon:'📖', color:'#a855f7' },
  Dorama: { icon:'🎭', color:'#ec4899' },
  Jogo:   { icon:'🎮', color:'#22d3ee' },
  Livro:  { icon:'📕', color:'#84cc16' },
};

const STATUS_COLORS = {
  'Assistindo':    '#3b82f6',
  'Finalizado':    '#34d399',
  'Abandonado':    '#6b7280',
  'Quero assistir':'#a855f7',
};

/* ═══════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════ */
function navigate(page, resetFilters = true) {
  currentPage = page;
  if (resetFilters) tipoFilter = '';

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));
  
  const bnEl = document.getElementById('bn-' + page);
  if (bnEl) bnEl.classList.add('active');

  document.querySelectorAll(`.nav-item[onclick*="navigate('${page}'"]`).forEach(n => n.classList.add('active'));

  closeSidebar();

  if      (page === 'home')      { renderHome(); }
  else if (page === 'catalogo')  { renderCatalogo(); }
  else if (page === 'dashboard')  { renderDashboard(); }
  else if (page === 'timeline')   { renderTimeline(); }
  else if (page === 'wishlist')   { renderWishlist(); }
  else if (page === 'conquistas') { renderConquistas(); }
}

function navigateFilter(page, dim, val) {
  if (dim === 'tipo')   tipoFilter = val;
  if (dim === 'status') {
    tipoFilter = '';
    document.getElementById('filterStatus').value = val;
  }
  navigate(page, false);
  // sync pill
  document.querySelectorAll('[data-tipo]').forEach(b => {
    b.classList.toggle('active', b.dataset.tipo === tipoFilter);
  });
}

/* ═══════════════════════════════════════════
   SIDEBAR MOBILE
═══════════════════════════════════════════ */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

/* ═══════════════════════════════════════════
   COUNTS
═══════════════════════════════════════════ */
function updateCounts() {
  const set = (id, n) => { const el = document.getElementById(id); if(el) el.textContent = n||''; };
  set('nc-total',     db.length);
  set('nc-wish',      wishdb.filter(w=>!w.done).length || '');
  ['Filme','Série','Anime','Mangá','Dorama','Jogo','Livro'].forEach(t =>
    set('nc-'+t, db.filter(x=>x.type===t).length || ''));
  set('nc-Assistindo', db.filter(x=>x.status==='Assistindo').length || '');
  set('nc-Finalizado', db.filter(x=>x.status==='Finalizado').length || '');
  set('nc-Abandonado', db.filter(x=>x.status==='Abandonado').length || '');
  set('nc-Quero',      db.filter(x=>x.status==='Quero assistir').length || '');
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function esc(s) {
  return String(s||'')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

function typeIcon(t) { return (TIPO[t]||{icon:'🎞️'}).icon; }

function displayStatus(status, type) {
  if (type === 'Livro' || type === 'Mangá') {
    if (status === 'Assistindo') return 'Lendo';
    if (status === 'Quero assistir') return 'Quero ler';
  } else if (type === 'Jogo') {
    if (status === 'Assistindo') return 'Jogando';
    if (status === 'Quero assistir') return 'Quero jogar';
  }
  return status || '';
}

function toast(msg, icon='✅') {
  const c = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `<span>${icon}</span> ${esc(msg)}`;
  c.appendChild(el);
  setTimeout(()=>{ el.classList.add('out'); setTimeout(()=>el.remove(),350); }, 2800);
}

/* ═══════════════════════════════════════════
   CATALOGO
═══════════════════════════════════════════ */
function setTipoFilter(tipo, btn) {
  tipoFilter = tipo;
  document.querySelectorAll('[data-tipo]').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderCatalogo();
}

function renderCatalogo() {
  const search  = (document.getElementById('searchInput').value||'').toLowerCase();
  const status  = document.getElementById('filterStatus').value;
  const order   = document.getElementById('filterOrder').value;

  let items = [...db];
  if (tipoFilter) items = items.filter(x=>x.type===tipoFilter);
  if (status)     items = items.filter(x=>x.status===status);
  if (search)     items = items.filter(x=>x.title.toLowerCase().includes(search)||
                           (x.genres||'').toLowerCase().includes(search));

  if (order==='title')  items.sort((a,b)=>a.title.localeCompare(b.title));
  else if (order==='rating') items.sort((a,b)=>(b.rating||0)-(a.rating||0));
  else if (order==='fav')    items.sort((a,b)=>((b.fav?1:0)-(a.fav?1:0)));
  else items.sort((a,b)=>b.id-a.id);

  // title
  const title = tipoFilter
    ? (typeIcon(tipoFilter)+' '+tipoFilter+'s')
    : (status || 'Catálogo');
  document.getElementById('catalogoTitle').textContent = title;
  document.getElementById('catalogoSubtitle').textContent = items.length + ' obra' + (items.length!==1?'s':'');

  const grid  = document.getElementById('catalogoGrid');
  const empty = document.getElementById('catalogoEmpty');

  if (!items.length) { grid.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  grid.innerHTML = items.map(item => {
    const t = TIPO[item.type]||{icon:'🎞️', color:'#555'};
    const coverHtml = item.cover
      ? `<img src="${esc(item.cover)}" alt="" loading="lazy" onerror="this.remove()">`
      : `<div class="card-poster-placeholder"><span class="type-icon">${t.icon}</span><span class="type-label">${esc(item.type)}</span></div>`;
    const isSelected = isDeleteMode && selectedIds.has(item.id);
    return `
      <div class="card" onclick="${isDeleteMode ? `toggleSelection(${item.id}, event)` : `openDetail(${item.id})`}" style="--t-color:${t.color}; ${isSelected ? 'outline: 2px solid var(--red);' : ''}">
        <div class="card-poster" style="border-bottom:2px solid ${t.color}22">
          ${coverHtml}
          <span class="card-badge ${statusBadgeClass(item.status)}">${esc(displayStatus(item.status, item.type))}</span>
          ${item.fav ? '<span class="card-fav">⭐</span>' : ''}
          ${isDeleteMode ? `
            <div style="position:absolute;inset:0;background:rgba(0,0,0,${isSelected ? '0.6' : '0.3'});display:flex;align-items:center;justify-content:center;z-index:10;transition:all 0.2s;">
              <div style="width:32px;height:32px;border-radius:50%;border:2px solid white;background:${isSelected ? 'var(--red)' : 'transparent'};display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px;">
                ${isSelected ? '✓' : ''}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="card-body">
          <div class="card-title">${esc(item.title)}</div>
          <div class="card-meta">
            <span class="card-type">${t.icon} ${esc(item.type)} ${item.year?'· '+item.year:''}</span>
            ${item.rating ? `<span class="card-stars">${'★'.repeat(item.rating)}</span>` : ''}
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════════════ */
function openDetail(id) {
  const item = db.find(x=>x.id===id);
  if (!item) return;
  const t = TIPO[item.type]||{icon:'🎞️',color:'#555'};

  const emotionBars = EMOTIONS.map(e => {
    const v = item.emotions?.[e.key]||0;
    return `<div class="emotion-bar-row">
      <span class="emotion-bar-label">${e.label}</span>
      <div class="emotion-bar-track"><div class="emotion-bar-fill" style="width:${v*20}%"></div></div>
      <span class="emotion-bar-val">${v||'—'}</span>
    </div>`;
  }).join('');

  const tagsHtml = (item.tags||[]).length
    ? item.tags.map(tg=>`<span class="detail-tag">${esc(tg)}</span>`).join('')
    : '<span style="color:var(--text3);font-size:0.8rem">Nenhuma tag</span>';

  const genresHtml = (item.genres||'').split(',').filter(Boolean)
    .map(g=>`<span class="detail-badge">${esc(g.trim())}</span>`).join('');

  const coverHtml = item.cover
    ? `<img src="${esc(item.cover)}" alt="" onerror="this.parentNode.innerHTML='${t.icon}'">`
    : t.icon;

  let metaExtra = '';
  if (item.episodes) metaExtra += `<div class="detail-meta-item"><span class="detail-meta-label">Episódios</span><span class="detail-meta-val">${esc(item.episodes)}</span></div>`;
  if (item.hours)    metaExtra += `<div class="detail-meta-item"><span class="detail-meta-label">Tempo gasto</span><span class="detail-meta-val">${item.hours}h</span></div>`;
  if (item.platform) metaExtra += `<div class="detail-meta-item"><span class="detail-meta-label">Plataforma</span><span class="detail-meta-val">${esc(item.platform)}</span></div>`;

  const titleLower = item.title.toLowerCase();
  const existingTypes = new Set(db.filter(x => x.title.toLowerCase() === titleLower).map(x => x.type));
  
  let typesToShow = [];
  if (['Anime', 'Mangá'].includes(item.type)) typesToShow = ['Anime', 'Mangá', 'Livro', 'Filme', 'Jogo'];
  else if (['Filme', 'Série'].includes(item.type)) typesToShow = ['Filme', 'Série', 'Livro', 'Jogo'];
  else if (item.type === 'Livro') typesToShow = ['Livro', 'Filme', 'Série', 'Mangá'];
  else typesToShow = ['Jogo', 'Filme', 'Série', 'Anime', 'Livro'];
  
  if (!typesToShow.includes(item.type)) typesToShow.unshift(item.type);

  const relatedHtml = typesToShow.map(rt => {
    const hasIt = existingTypes.has(rt);
    const label = rt === 'Livro' && ['Anime','Mangá'].includes(item.type) ? 'Light Novel' : rt;
    if (hasIt) {
       const relatedItem = db.find(x => x.title.toLowerCase() === titleLower && x.type === rt);
       return `<button class="related-pill has-it" onclick="openDetail(${relatedItem.id})" title="Ver detalhes de ${label}">${typeIcon(rt)} ${label} ✔</button>`;
    } else {
       return `<button class="related-pill missing" onclick="addRelated('${esc(item.title).replace(/'/g,"\\'")}','${rt}','${item.cover ? esc(item.cover).replace(/'/g,"\\'") : ''}', ${item.id})" title="Adicionar ${label} ao catálogo">${typeIcon(rt)} ${label} ❌</button>`;
    }
  }).join('');

  document.getElementById('detailBody').innerHTML = `
    <div class="detail-header">
      <div class="detail-poster">${coverHtml}</div>
      <div class="detail-info">
        ${item.fav?'<div style="color:var(--gold);margin-bottom:6px;font-size:0.8rem">⭐ Favorito</div>':''}
        <div class="detail-title">${esc(item.title)}</div>
        <div class="detail-badges">
          <span class="detail-badge">${t.icon} ${esc(item.type)}</span>
          ${item.year?`<span class="detail-badge">${item.year}</span>`:''}
          <span class="detail-badge ${statusBadgeClass(item.status)}" style="border-color:transparent">${esc(displayStatus(item.status, item.type))}</span>
        </div>
        ${item.rating?`<div class="detail-stars-main">${stars(item.rating)}</div>`:''}
        <div class="detail-meta-row">
          ${metaExtra}
        </div>
        ${genresHtml?`<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:10px">${genresHtml}</div>`:''}
      </div>
    </div>

    ${item.synopsis?`<div class="detail-section">
      <div class="detail-section-title">Sinopse</div>
      <div class="detail-synopsis">${esc(item.synopsis)}</div>
    </div>`:''}

    ${item.opinion?`<div class="detail-section">
      <div class="detail-section-title">Minha opinião</div>
      <div class="detail-opinion">${esc(item.opinion)}</div>
    </div>`:''}

    <div class="detail-section">
      <div class="detail-section-title">Nota emocional</div>
      <div class="emotion-bars">${emotionBars}</div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Tags pessoais</div>
      <div class="detail-tags">${tagsHtml}</div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Obras Relacionadas</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">${relatedHtml}</div>
    </div>

    <div class="detail-actions">
      <button class="btn btn-ghost" onclick="editItem(${id})">✏️ Editar</button>
      <button class="btn btn-ghost" style="color:var(--red)" onclick="deleteItem(${id})">🗑 Remover</button>
    </div>
  `;

  document.getElementById('detailOverlay').classList.add('open');
}

async function addRelated(title, type, cover, originalId) {
  const item = {
    id: String(Date.now() + Math.random()),
    title, type, cover: cover || '',
    status: 'Quero assistir',
    rating: 0,
    year:'', platform:'', episodes:'', hours:'',
    genres:'', synopsis:'', opinion:'', emotion:'', tags:[], fav:false,
    createdAt: new Date().toISOString()
  };
  db.push(item);
  save();
  await saveItemToFirestore(item);
  renderCatalogo();
  updateCounts();
  checkAchievements();
  toast(`✅ ${type} adicionado!`, '📚');
  openDetail(originalId);
}

function closeDetailModal(e) {
  if (e && e.target !== document.getElementById('detailOverlay')) return;
  document.getElementById('detailOverlay').classList.remove('open');
}

/* ═══════════════════════════════════════════
   ADD / EDIT MODAL
═══════════════════════════════════════════ */
function buildEmotionGrid() {
  document.getElementById('emotionGrid').innerHTML = EMOTIONS.map(e=>
    `<div class="emotion-item">
      <div class="emotion-label">${e.label}</div>
      <div class="emotion-stars" id="em-${e.key}">
        ${[1,2,3,4,5].map(i=>`<button class="emotion-star" data-dim="${e.key}" data-val="${i}" onclick="setEmotion('${e.key}',${i})">★</button>`).join('')}
      </div>
    </div>`
  ).join('');
}

function buildTagsWrap() {
  document.getElementById('tagsWrap').innerHTML = ALL_TAGS.map(tg=>
    `<button class="tag-toggle" onclick="toggleTag(this)">${tg}</button>`
  ).join('');
}

function updateStatusOptions() {
  const type = document.getElementById('f-type').value;
  const statusSelect = document.getElementById('f-status');
  const currentVal = statusSelect.value;
  
  let options = '';
  if (type === 'Livro' || type === 'Mangá') {
    options = `
      <option value="Quero assistir">Quero ler</option>
      <option value="Assistindo">Lendo</option>
      <option value="Finalizado">Finalizado</option>
      <option value="Abandonado">Abandonado</option>
    `;
  } else if (type === 'Jogo') {
    options = `
      <option value="Quero assistir">Quero jogar</option>
      <option value="Assistindo">Jogando</option>
      <option value="Finalizado">Finalizado</option>
      <option value="Abandonado">Abandonado</option>
    `;
  } else {
    options = `
      <option value="Quero assistir">Quero assistir</option>
      <option value="Assistindo">Assistindo</option>
      <option value="Finalizado">Finalizado</option>
      <option value="Abandonado">Abandonado</option>
    `;
  }
  statusSelect.innerHTML = options;
  if (currentVal) statusSelect.value = currentVal;
  if (!statusSelect.value) statusSelect.selectedIndex = 0;
}

function openAddModal() {
  editingId = null;
  favEdit   = false;
  document.getElementById('addModalTitle').textContent = 'Nova obra';
  document.getElementById('addOverlay').classList.add('open');
  buildEmotionGrid();
  buildTagsWrap();
  clearForm();
}

function clearForm() {
  ['f-title','f-year','f-platform','f-episodes','f-hours','f-genres','f-synopsis','f-opinion','f-cover']
    .forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('f-type').value   = 'Filme';
  updateStatusOptions();
  document.getElementById('f-status').value = 'Quero assistir';
  setStar(0);
  document.querySelectorAll('.emotion-star').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.tag-toggle').forEach(b=>b.classList.remove('active'));
  document.getElementById('favBtn').textContent = '☆';
  favEdit = false;
}

function closeAddModal(e) {
  if (e && e.target !== document.getElementById('addOverlay')) return;
  document.getElementById('addOverlay').classList.remove('open');
  editingId = null;
}

function editItem(id) {
  document.getElementById('detailOverlay').classList.remove('open');
  const item = db.find(x=>x.id===id);
  if (!item) return;

  editingId = id;
  buildEmotionGrid();
  buildTagsWrap();

  document.getElementById('addModalTitle').textContent = 'Editar obra';
  document.getElementById('f-title').value    = item.title||'';
  document.getElementById('f-type').value     = item.type||'Filme';
  updateStatusOptions();
  document.getElementById('f-status').value   = item.status||'Quero assistir';
  document.getElementById('f-year').value     = item.year||'';
  document.getElementById('f-platform').value = item.platform||'';
  document.getElementById('f-episodes').value = item.episodes||'';
  document.getElementById('f-hours').value    = item.hours||'';
  document.getElementById('f-genres').value   = item.genres||'';
  document.getElementById('f-synopsis').value = item.synopsis||'';
  document.getElementById('f-opinion').value  = item.opinion||'';
  document.getElementById('f-cover').value    = item.cover||'';

  setStar(item.rating||0);

  if (item.emotions) {
    EMOTIONS.forEach(e=>{
      const v = item.emotions[e.key]||0;
      setEmotion(e.key, v, false);
    });
  }

  (item.tags||[]).forEach(tg => {
    document.querySelectorAll('.tag-toggle').forEach(b=>{ if(b.textContent.trim()===tg) b.classList.add('active'); });
  });

  favEdit = !!item.fav;
  document.getElementById('favBtn').textContent = favEdit ? '⭐' : '☆';

  document.getElementById('addOverlay').classList.add('open');
}

async function deleteItem(id) {
  if (!confirm('Remover esta obra do catálogo?')) return;
  db = db.filter(x=>x.id!==id);
  await deleteItemFromFirestore(id);
  save();
  document.getElementById('detailOverlay').classList.remove('open');
  renderCatalogo();
  toast('Obra removida');
}

function toggleDeleteMode() {
  isDeleteMode = !isDeleteMode;
  selectedIds.clear();
  
  const btn = document.getElementById('btnToggleDelete');
  const btnConfirm = document.getElementById('btnConfirmDelete');
  if (isDeleteMode) {
    btn.innerHTML = 'Cancelar Exclusão';
    btn.style.color = 'var(--text)';
    btn.style.borderColor = 'var(--border)';
    btnConfirm.style.display = 'block';
    btnConfirm.textContent = `Excluir (0)`;
  } else {
    btn.innerHTML = '🗑 Excluir Vários';
    btn.style.color = 'var(--red)';
    btn.style.borderColor = 'rgba(248,113,113,0.3)';
    btnConfirm.style.display = 'none';
  }
  renderCatalogo();
}

function toggleSelection(id, e) {
  if (e) e.stopPropagation();
  if (selectedIds.has(id)) selectedIds.delete(id);
  else selectedIds.add(id);
  
  const btnConfirm = document.getElementById('btnConfirmDelete');
  if (btnConfirm) btnConfirm.textContent = `Excluir (${selectedIds.size})`;
  
  renderCatalogo();
}

function confirmDeleteSelected() {
  if (selectedIds.size === 0) return;
  if (!confirm(`Remover ${selectedIds.size} obra(s) do catálogo?`)) return;
  
  const size = selectedIds.size;
  const deletedIds = [...selectedIds];
  db = db.filter(x => !selectedIds.has(x.id));
  deletedIds.forEach(id => deleteItemFromFirestore(id));
  save();
  toggleDeleteMode();
  toast(`${size} obra(s) removida(s)`);
}

async function saveItem() {
  const title = document.getElementById('f-title').value.trim();
  if (!title) {
    document.getElementById('f-title').focus();
    document.getElementById('f-title').style.borderColor='#f87171';
    setTimeout(()=>document.getElementById('f-title').style.borderColor='',1500);
    return;
  }

  const emotions = {};
  EMOTIONS.forEach(e=>{
    const v = document.querySelector(`#em-${e.key} .emotion-star.active:last-of-type`);
    emotions[e.key] = v ? parseInt(v.dataset.val) : 0;
  });

  const tags = [...document.querySelectorAll('.tag-toggle.active')].map(b=>b.textContent.trim());
  const rating = parseInt(document.getElementById('starInput').dataset.val)||0;

  const item = {
    id:       String(editingId || Date.now()),
    title,
    type:     document.getElementById('f-type').value,
    status:   document.getElementById('f-status').value,
    year:     document.getElementById('f-year').value,
    platform: document.getElementById('f-platform').value.trim(),
    episodes: document.getElementById('f-episodes').value,
    hours:    document.getElementById('f-hours').value,
    genres:   document.getElementById('f-genres').value.trim(),
    synopsis: document.getElementById('f-synopsis').value.trim(),
    opinion:  document.getElementById('f-opinion').value.trim(),
    cover:    document.getElementById('f-cover').value.trim(),
    rating,
    emotions,
    tags,
    fav:      favEdit,
    addedAt:  editingId ? (db.find(x=>x.id===editingId)||{}).addedAt : new Date().toISOString(),
    finishedAt: (document.getElementById('f-status').value==='Finalizado')
      ? (editingId ? (db.find(x=>x.id===editingId)||{}).finishedAt || new Date().toISOString() : new Date().toISOString())
      : null,
  };

  if (editingId) {
    const idx = db.findIndex(x=>x.id===editingId);
    if (idx>=0) db[idx]=item;
  } else {
    db.unshift(item);
  }

  save();
  localSaveGuard = true;
  const saved = await saveItemToFirestore(item);
  setTimeout(() => { localSaveGuard = false; }, 100);
  closeAddModal();
  renderCatalogo();
  if (saved) {
    toast(editingId ? '✏️ Obra atualizada!' : '🎉 Obra adicionada!');
  } else {
    revertGuard = true;
    setTimeout(() => { revertGuard = false; }, 3000);
    toast('⚠️ Salvo localmente, mas erro no servidor. Recarregue com cuidado.', '⚠️');
  }
  checkAchievements();
  editingId = null;
}

/* ═══════════════════════════════════════════
   STAR / EMOTION / FAV / TAG CONTROLS
═══════════════════════════════════════════ */
function setStar(n) {
  document.getElementById('starInput').dataset.val = n;
  document.querySelectorAll('.star-btn').forEach(b=>{
    b.classList.toggle('active', parseInt(b.dataset.star)<=n);
  });
}

function setEmotion(dim, val, toggle=true) {
  const btns = document.querySelectorAll(`#em-${dim} .emotion-star`);
  let cur = 0;
  btns.forEach(b=>{ if(b.classList.contains('active')) cur=parseInt(b.dataset.val); });
  const newVal = (toggle && cur===val) ? 0 : val;
  btns.forEach(b=>{
    b.classList.toggle('active', parseInt(b.dataset.val)<=newVal);
  });
}

function toggleFav() {
  favEdit = !favEdit;
  document.getElementById('favBtn').textContent = favEdit ? '⭐' : '☆';
}

function toggleTag(btn) { btn.classList.toggle('active'); }

/* ═══════════════════════════════════════════
   WISHLIST
═══════════════════════════════════════════ */
function openWishModal() {
  document.getElementById('w-title').value='';
  document.getElementById('w-note').value='';
  document.getElementById('wishOverlay').classList.add('open');
  setTimeout(()=>document.getElementById('w-title').focus(), 100);
}

function closeWishModal(e) {
  if (e && e.target !== document.getElementById('wishOverlay')) return;
  document.getElementById('wishOverlay').classList.remove('open');
}

function saveWish() {
  const title = document.getElementById('w-title').value.trim();
  if (!title) return;
  wishdb.unshift({
    id: Date.now(),
    title,
    type: document.getElementById('w-type').value,
    note: document.getElementById('w-note').value.trim(),
    done: false,
  });
  save();
  closeWishModal();
  renderWishlist();
  toast('Adicionado à lista de desejos', '❤️');
}

function toggleWish(id) {
  const w = wishdb.find(x=>x.id===id);
  if (w) w.done = !w.done;
  save();
  renderWishlist();
}

function removeWish(id) {
  wishdb = wishdb.filter(x=>x.id!==id);
  save();
  renderWishlist();
}

function renderWishlist() {
  const list  = document.getElementById('wishList');
  const empty = document.getElementById('wishEmpty');
  if (!wishdb.length) { list.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  list.innerHTML = wishdb.map(w=>
    `<div class="wish-item ${w.done?'done':''}">
      <div class="wish-check ${w.done?'checked':''}" onclick="toggleWish(${w.id})">${w.done?'✓':''}</div>
      <span class="wish-type-icon">${typeIcon(w.type)}</span>
      <div style="flex:1;min-width:0">
        <div class="wish-title">${esc(w.title)}</div>
        ${w.note?`<div class="wish-sub">${esc(w.note)}</div>`:''}
      </div>
      <button class="wish-remove" onclick="removeWish(${w.id})">✕</button>
    </div>`
  ).join('');
}

/* ═══════════════════════════════════════════
   HOME
═══════════════════════════════════════════ */
function renderHome() {
  const c = document.getElementById('homeContent');
  if (!c) { console.error('homeContent não encontrado!'); return; }

  const total = db.length;
  const userName = currentUser?.displayName || 'Mari';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const watching = db.filter(x => x.status === 'Assistindo').sort((a,b) => b.id - a.id);

  const watchSections = [
    { label: 'Continue assistindo', icon: '▶️', types: ['Filme','Série','Anime','Dorama'] },
    { label: 'Continue lendo',      icon: '📖', types: ['Mangá','Livro'] },
    { label: 'Continue jogando',    icon: '🎮', types: ['Jogo'] },
  ]
  .filter(s => watching.some(x => s.types.includes(x.type)))
  .map(s => {
    const items = watching.filter(x => s.types.includes(x.type)).slice(0, 8);
    return `
      <div class="home-section">
        <h2 class="home-section-title">${s.icon} ${s.label}</h2>
        <div class="home-hscroll">
          ${items.map(item => {
            const t = TIPO[item.type]||{icon:'🎞️',color:'#555'};
            const coverHtml = item.cover
              ? `<div class="hscroll-card-poster"><img src="${esc(item.cover)}" alt="" loading="lazy" onerror="this.remove()"></div>`
              : `<div class="hscroll-card-poster"><span class="hscroll-type-icon">${t.icon}</span></div>`;
            return `
              <div class="card hscroll-card" onclick="openDetail(${item.id})">
                ${coverHtml}
                <div class="hscroll-card-body">
                  <div class="hscroll-card-title">${esc(item.title)}</div>
                  <div class="hscroll-card-meta">${t.icon} ${esc(item.type)}</div>
                </div>
              </div>`;
          }).join('')}
          ${items.length ? `<button class="hscroll-more" onclick="navigateFilter('catalogo','status','Assistindo')">Ver todos →</button>` : ''}
        </div>
      </div>`;
  }).join('');

  const typeCounts = ['Filme','Série','Anime','Mangá','Dorama','Jogo','Livro']
    .map(t => ({ type: t, icon: TIPO[t].icon, n: db.filter(x => x.type === t).length }))
    .filter(t => t.n > 0);

  const finished = db.filter(x => x.status === 'Finalizado').length;
  const watchingCount = db.filter(x => x.status === 'Assistindo').length;
  const totalHours = db.reduce((s,x) => s + (parseFloat(x.hours)||0), 0);
  const avgRating = db.filter(x => x.rating).length
    ? (db.filter(x => x.rating).reduce((s,x) => s + x.rating, 0) / db.filter(x => x.rating).length).toFixed(1)
    : '—';
  const favCount = db.filter(x => x.fav).length;

  const recent = [...db].sort((a,b) => b.id - a.id).slice(0, 6);

  c.innerHTML = `
    <div class="home-greeting">
      <div class="home-greeting-text">${greeting}, ${esc(userName)} <span class="home-wave">👋</span> ✨</div>
      ${total > 0 ? `<div class="home-greeting-sub">Você tem ${total} obra${total !== 1 ? 's' : ''} no catálogo</div>` : ''}
    </div>

    ${watching.length > 0 ? watchSections : ''}

    <div class="home-section">
      <h2 class="home-section-title">📚 Minha Biblioteca</h2>
      <div class="home-type-grid">
        ${typeCounts.map(t => `
          <button class="home-type-card" onclick="navigateFilter('catalogo','tipo','${t.type}')">
            <span class="home-type-icon">${t.icon}</span>
            <span class="home-type-name">${t.type}</span>
            <span class="home-type-count">${t.n}</span>
          </button>
        `).join('')}
        ${typeCounts.length === 0 ? '<div class="home-empty">Adicione sua primeira obra!</div>' : ''}
      </div>
    </div>

    ${total > 0 ? `
    <div class="home-section">
      <h2 class="home-section-title">⚡ Estatísticas rápidas</h2>
      <div class="home-stats-grid">
        <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-label">Total</div></div>
        <div class="stat-card"><div class="stat-val">${finished}</div><div class="stat-label">Finalizados</div></div>
        <div class="stat-card"><div class="stat-val">${watchingCount}</div><div class="stat-label">Em andamento</div></div>
        <div class="stat-card"><div class="stat-val">${totalHours.toFixed(0)}h</div><div class="stat-label">Horas</div></div>
        <div class="stat-card"><div class="stat-val">${avgRating}★</div><div class="stat-label">Nota média</div></div>
        <div class="stat-card"><div class="stat-val">${favCount}</div><div class="stat-label">Favoritos</div></div>
      </div>
    </div>

    <div class="home-section">
      <h2 class="home-section-title">🕐 Últimas obras</h2>
      <div class="grid home-recent-grid">
        ${recent.map(item => {
          const t = TIPO[item.type]||{icon:'🎞️',color:'#555'};
          const coverHtml = item.cover
            ? `<img src="${esc(item.cover)}" alt="" loading="lazy" onerror="this.remove()">`
            : `<div class="card-poster-placeholder"><span class="type-icon">${t.icon}</span><span class="type-label">${esc(item.type)}</span></div>`;
          return `
            <div class="card" onclick="openDetail(${item.id})" style="--t-color:${t.color}">
              <div class="card-poster" style="border-bottom:2px solid ${t.color}22">${coverHtml}</div>
              <div class="card-body">
                <div class="card-title">${esc(item.title)}</div>
                <div class="card-meta"><span class="card-type">${t.icon} ${esc(item.type)}</span></div>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>
    ` : ''}

    <div class="home-section">
      <h2 class="home-section-title">⚡ Atalhos rápidos</h2>
      <div class="home-actions">
        <button class="btn btn-primary home-action-btn" onclick="openAddModal()">➕ Adicionar obra</button>
        <button class="btn btn-ghost home-action-btn" onclick="openImportModal()">⬆ Importar</button>
        <button class="btn btn-ghost home-action-btn" onclick="openWishModal()">❤️ Lista de desejos</button>
        <button class="btn btn-ghost home-action-btn" onclick="navigate('catalogo')">📋 Ver catálogo</button>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
function renderDashboard() {
  const total   = db.length;
  const finished = db.filter(x=>x.status==='Finalizado').length;
  const watching = db.filter(x=>x.status==='Assistindo').length;
  const totalHours = db.reduce((s,x)=>s+(parseFloat(x.hours)||0),0);
  const avgRating = db.filter(x=>x.rating).length
    ? (db.filter(x=>x.rating).reduce((s,x)=>s+x.rating,0)/db.filter(x=>x.rating).length).toFixed(1)
    : '—';

  document.getElementById('statsGrid').innerHTML = [
    { val: total,           label:'Total de obras',     icon:'📚' },
    { val: finished,        label:'Finalizados',         icon:'✅' },
    { val: watching,        label:'Assistindo agora',    icon:'▶️' },
    { val: totalHours.toFixed(0)+'h', label:'Horas registradas', icon:'⏱️' },
    { val: avgRating+'★',  label:'Nota média',          icon:'⭐' },
    { val: db.filter(x=>x.fav).length, label:'Favoritos',       icon:'❤️' },
  ].map(s=>`
    <div class="stat-card" data-icon="${s.icon}">
      <div class="stat-val">${s.val}</div>
      <div class="stat-label">${s.label}</div>
    </div>`).join('');

  // Status
  const statusData = [
    { name:'Finalizado',    color:'var(--green)'  },
    { name:'Assistindo',    color:'var(--blue)'   },
    { name:'Quero assistir',color:'var(--purple)' },
    { name:'Abandonado',    color:'var(--text3)'  },
  ];
  document.getElementById('statusList').innerHTML = statusData.map(s=>{
    const n = db.filter(x=>x.status===s.name).length;
    return `<div class="donut-row">
      <div class="donut-dot" style="background:${s.color}"></div>
      <span class="donut-name">${s.name}</span>
      <span class="donut-val">${n}</span>
    </div>`;
  }).join('');

  // Top 5
  const top5 = [...db].filter(x=>x.rating).sort((a,b)=>b.rating-a.rating).slice(0,5);
  document.getElementById('topList').innerHTML = top5.length
    ? top5.map((item,i)=>`
      <div class="top-item">
        <span class="top-num ${i===0?'gold':''}">${i+1}</span>
        <div class="top-info">
          <div class="top-title">${typeIcon(item.type)} ${esc(item.title)}</div>
          <div class="top-sub">${esc(item.type)} ${item.year?'· '+item.year:''}</div>
        </div>
        <span class="top-stars">${'★'.repeat(item.rating)}</span>
      </div>`).join('')
    : '<div style="color:var(--text3);font-size:0.85rem">Avalie obras para ver o ranking</div>';

  // Genres
  const genreMap = {};
  db.forEach(x=>{
    (x.genres||'').split(',').map(g=>g.trim()).filter(Boolean).forEach(g=>{
      genreMap[g] = (genreMap[g]||0)+1;
    });
  });
  const topGenres = Object.entries(genreMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxG = topGenres[0]?.[1]||1;
  document.getElementById('genreList').innerHTML = topGenres.length
    ? topGenres.map(([g,n])=>`
      <div class="genre-row">
        <span class="genre-name">${esc(g)}</span>
        <div class="genre-bar-track"><div class="genre-bar-fill" style="width:${n/maxG*100}%"></div></div>
        <span class="genre-count">${n}</span>
      </div>`).join('')
    : '<div style="color:var(--text3);font-size:0.85rem">Adicione gêneros nas suas obras</div>';

  // By type
  const tipoData = Object.entries(TIPO).map(([t,meta])=>({
    name:t, icon:meta.icon, n:db.filter(x=>x.type===t).length
  })).filter(x=>x.n).sort((a,b)=>b.n-a.n);
  const maxT = tipoData[0]?.n||1;
  document.getElementById('tipoList').innerHTML = tipoData.length
    ? tipoData.map(t=>`
      <div class="genre-row">
        <span class="genre-name">${t.icon} ${t.name}</span>
        <div class="genre-bar-track"><div class="genre-bar-fill" style="width:${t.n/maxT*100}%"></div></div>
        <span class="genre-count">${t.n}</span>
      </div>`).join('')
    : '<div style="color:var(--text3);font-size:0.85rem">Nenhuma obra ainda</div>';
}

/* ═══════════════════════════════════════════
   TIMELINE
═══════════════════════════════════════════ */
function renderTimeline() {
  const finished = db.filter(x=>x.status==='Finalizado'&&x.finishedAt);
  const tl = document.getElementById('timelineEl');
  const empty = document.getElementById('timelineEmpty');

  if (!finished.length) { tl.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  // group by year → month
  const byYear = {};
  finished.forEach(item=>{
    const d = new Date(item.finishedAt);
    const y = d.getFullYear();
    const m = d.toLocaleString('pt-BR',{month:'long'});
    if (!byYear[y]) byYear[y]={};
    if (!byYear[y][m]) byYear[y][m]=[];
    byYear[y][m].push(item);
  });

  const MONTHS_PT = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

  tl.innerHTML = Object.keys(byYear).sort((a,b)=>b-a).map(y=>`
    <div class="timeline-year">${y}</div>
    ${MONTHS_PT.filter(m=>byYear[y][m]).reverse().map(m=>`
      <div class="timeline-month">
        <div class="timeline-month-name">${m}</div>
        <div class="timeline-works">
          ${byYear[y][m].map(item=>`
            <div class="timeline-work" onclick="openDetail(${item.id})">
              <span class="timeline-work-icon">${typeIcon(item.type)}</span>
              <span class="timeline-work-title">${esc(item.title)}</span>
              ${item.rating?`<span class="timeline-work-stars">${'★'.repeat(item.rating)}</span>`:''}
            </div>`).join('')}
        </div>
      </div>`).join('')}
  `).join('');
}

/* ═══════════════════════════════════════════
   CONQUISTAS
═══════════════════════════════════════════ */
const ACHIEVEMENTS = [
  { id:'first',        icon:'🎬', name:'Primeira obra',       desc:'Adicionou a primeira obra ao catálogo',   check:()=>db.length>=1 },
  { id:'ten',          icon:'📚', name:'Dez obras',           desc:'Catálogo com 10 obras cadastradas',        check:()=>db.length>=10 },
  { id:'fifty',        icon:'🗂️', name:'Colecionador',        desc:'50 obras no catálogo',                     check:()=>db.length>=50 },
  { id:'first_done',   icon:'✅', name:'Finalizado!',         desc:'Finalizou a primeira obra',                check:()=>db.some(x=>x.status==='Finalizado') },
  { id:'ten_done',     icon:'🏅', name:'Maratoneiro',         desc:'10 obras finalizadas',                     check:()=>db.filter(x=>x.status==='Finalizado').length>=10 },
  { id:'fifty_done',   icon:'🏆', name:'Mestre da maratona',  desc:'50 obras finalizadas',                     check:()=>db.filter(x=>x.status==='Finalizado').length>=50 },
  { id:'anime_5',      icon:'⛩️', name:'Otaku iniciante',     desc:'5 animes no catálogo',                     check:()=>db.filter(x=>x.type==='Anime').length>=5 },
  { id:'anime_20',     icon:'🎌', name:'Otaku de verdade',    desc:'20 animes no catálogo',                    check:()=>db.filter(x=>x.type==='Anime').length>=20 },
  { id:'fav_5',        icon:'❤️', name:'Coração cheio',       desc:'5 obras marcadas como favorito',           check:()=>db.filter(x=>x.fav).length>=5 },
  { id:'five_star',    icon:'⭐', name:'Obra prima',          desc:'Avaliou uma obra com 5 estrelas',          check:()=>db.some(x=>x.rating===5) },
  { id:'alltype',      icon:'🌐', name:'Eclético',            desc:'Tem ao menos uma obra de cada tipo',       check:()=>Object.keys(TIPO).every(t=>db.some(x=>x.type===t)) },
  { id:'hours100',     icon:'⏱️', name:'100 horas',           desc:'Registrou 100 horas de conteúdo',          check:()=>db.reduce((s,x)=>s+(parseFloat(x.hours)||0),0)>=100 },
  { id:'opinion',      icon:'✍️', name:'Crítico literário',   desc:'Escreveu opinião em 5 obras',              check:()=>db.filter(x=>x.opinion&&x.opinion.length>10).length>=5 },
  { id:'wish10',       icon:'🔖', name:'Lista enorme',        desc:'10 itens na lista de desejos',             check:()=>wishdb.length>=10 },
  { id:'tags',         icon:'🏷️', name:'Etiquetador',         desc:'Usou tags em 5 obras',                     check:()=>db.filter(x=>x.tags&&x.tags.length>0).length>=5 },
];

function checkAchievements() {
  const prev = load('biblioteca_achievements', []);
  const unlocked = [];
  ACHIEVEMENTS.forEach(a=>{
    if (!prev.includes(a.id) && a.check()) {
      unlocked.push(a.id);
      setTimeout(()=>toast(`🏆 Conquista desbloqueada: ${a.name}`, '🏆'), 600);
    }
  });
  if (unlocked.length) localStorage.setItem('biblioteca_achievements', JSON.stringify([...prev,...unlocked]));
}

function renderConquistas() {
  const unlocked = load('biblioteca_achievements', []);
  const grid = document.getElementById('achievementsGrid');
  const sub  = document.getElementById('achieveSubtitle');
  sub.textContent = `${unlocked.length} de ${ACHIEVEMENTS.length} desbloqueadas`;

  grid.innerHTML = ACHIEVEMENTS.map(a=>{
    const done = unlocked.includes(a.id) || a.check();
    return `<div class="achievement ${done?'unlocked':''}">
      ${done?'<span class="achievement-badge">Desbloqueada</span>':''}
      <span class="achievement-icon">${a.icon}</span>
      <div class="achievement-name">${a.name}</div>
      <div class="achievement-desc">${a.desc}</div>
    </div>`;
  }).join('');
}

/* ═══════════════════════════════════════════
   BUSCA ONLINE (TMDB + ANILIST + OPEN LIBRARY)
═══════════════════════════════════════════ */
// ⚠️ Cole aqui sua chave do TMDB após criar em themoviedb.org/settings/api
const TMDB_KEY = '6cb69a0af65e0121b72915f947762f43';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w500';

// ⚠️ Cole aqui sua chave do RAWG após criar em rawg.io/apidocs
const RAWG_KEY = 'ea76150c732545f4814bfbdbac750ac9';

function clearApiStatus() {
  document.getElementById('apiStatus').textContent = '';
}

async function buscarOnline() {
  const title = document.getElementById('f-title').value.trim();
  const type  = document.getElementById('f-type').value;
  if (!title) { alert('Digite o título antes de buscar.'); return; }

  const statusEl = document.getElementById('apiStatus');
  const btn = document.getElementById('btnBuscarOnline');
  btn.disabled = true;
  statusEl.textContent = '⏳ Buscando…';

  try {
    let result = null;

    if (type === 'Anime' || type === 'Mangá') {
      result = await searchAniList(title, type);
    } else if (type === 'Livro') {
      result = await searchOpenLibrary(title);
    } else if (type === 'Jogo') {
      if (RAWG_KEY === 'SUA_CHAVE_AQUI') {
        statusEl.textContent = '⚠️ Chave RAWG não configurada. Edite RAWG_KEY no código.';
        statusEl.style.color = 'var(--warning, #f59e0b)';
        btn.disabled = false;
        return;
      }
      result = await searchRAWG(title);
    } else {
      // Filme, Série, Dorama → TMDB
      if (TMDB_KEY === 'SUA_CHAVE_AQUI') {
        statusEl.textContent = '⚠️ Chave TMDB não configurada. Edite TMDB_KEY no código.';
        statusEl.style.color = 'var(--warning, #f59e0b)';
        btn.disabled = false;
        return;
      }
      result = await searchTMDB(title, type);
    }

    if (result) {
      applyApiResult(result);
      statusEl.textContent = '✅ Dados preenchidos!';
      statusEl.style.color = 'var(--accent)';
    } else {
      statusEl.textContent = '❌ Nada encontrado. Tente outro título.';
      statusEl.style.color = '#ef4444';
    }
  } catch(err) {
    console.error(err);
    statusEl.textContent = '❌ Erro na busca. Verifique a conexão.';
    statusEl.style.color = '#ef4444';
  }
  btn.disabled = false;
}

function applyApiResult(r) {
  if (r.year)     { document.getElementById('f-year').value = r.year; }
  if (r.synopsis) { document.getElementById('f-synopsis').value = r.synopsis; }
  if (r.cover)    { document.getElementById('f-cover').value = r.cover; }
  if (r.genres)   { document.getElementById('f-genres').value = r.genres; }
  if (r.episodes) { document.getElementById('f-episodes').value = r.episodes; }
}

/* --- TMDB (Filmes, Séries, Doramas) --- */
async function searchTMDB(title, type) {
  const mediaType = (type === 'Filme') ? 'movie' : 'tv';
  const url = `${TMDB_BASE}/search/${mediaType}?query=${encodeURIComponent(title)}&api_key=${TMDB_KEY}&language=pt-BR`;
  const res  = await fetch(url);
  const data = await res.json();
  const item = data.results && data.results[0];
  if (!item) return null;

  let genres = '';
  try {
    const detUrl = `${TMDB_BASE}/${mediaType}/${item.id}?api_key=${TMDB_KEY}&language=pt-BR`;
    const detRes  = await fetch(detUrl);
    const det     = await detRes.json();
    genres = (det.genres || []).map(g => g.name).join(', ');
  } catch(_) {}

  return {
    title:    item.title || item.name || '',
    year:     (item.release_date || item.first_air_date || '').slice(0,4),
    synopsis: item.overview || '',
    cover:    item.poster_path ? TMDB_IMG + item.poster_path : '',
    genres
  };
}

/* --- AniList (Anime e Mangá) --- */
const GENRE_PT = {
  'Action':'Ação', 'Adventure':'Aventura', 'Comedy':'Comédia', 'Drama':'Drama',
  'Fantasy':'Fantasia', 'Horror':'Terror', 'Mystery':'Mistério', 'Romance':'Romance',
  'Sci-Fi':'Ficção Científica', 'Slice of Life':'Cotidiano', 'Sports':'Esporte',
  'Supernatural':'Sobrenatural', 'Thriller':'Suspense', 'Psychological':'Psicológico',
  'Mecha':'Mecha', 'Music':'Música', 'Ecchi':'Ecchi', 'Harem':'Harem',
  'Historical':'Histórico', 'Military':'Militar', 'Magic':'Magia', 'School':'Escola',
  'Shounen':'Shōnen', 'Shoujo':'Shōjo', 'Seinen':'Seinen', 'Josei':'Josei',
  'Game':'Jogo', 'Space':'Espaço', 'Isekai':'Isekai', 'Cooking':'Culinária',
  'Sports':'Esporte', 'Martial Arts':'Artes Marciais', 'Super Power':'Superpoderes'
};
function translateGenres(genres) {
  return genres.map(g => GENRE_PT[g] || g).join(', ');
}

async function searchAniList(title, type) {
  const mediaType = type === 'Mangá' ? 'MANGA' : 'ANIME';
  const query = `
    query($search: String, $type: MediaType) {
      Media(search: $search, type: $type, sort: SEARCH_MATCH) {
        title { romaji english native }
        startDate { year }
        description(asHtml: false)
        coverImage { large }
        genres
        episodes
        chapters
      }
    }
  `;
  const res  = await fetch('https://graphql.anilist.co', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({ query, variables: { search: title, type: mediaType } })
  });
  const data = await res.json();
  const m = data.data && data.data.Media;
  if (!m) return null;

  const cleanDesc = (m.description || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n\n+/g, '\n').trim();

  return {
    year:     m.startDate && m.startDate.year ? String(m.startDate.year) : '',
    synopsis: cleanDesc,
    cover:    m.coverImage && m.coverImage.large ? m.coverImage.large : '',
    genres:   translateGenres(m.genres || []),
    episodes: m.episodes || m.chapters || ''
  };
}

/* --- Open Library (Livros) --- */
async function searchOpenLibrary(title) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=1`;
  const res  = await fetch(url);
  const data = await res.json();
  const item = data.docs && data.docs[0];
  if (!item) return null;

  const coverId = item.cover_i;
  return {
    title:    item.title || '',
    year:     item.first_publish_year ? String(item.first_publish_year) : '',
    synopsis: item.first_sentence ? (Array.isArray(item.first_sentence) ? item.first_sentence[0] : item.first_sentence) : '',
    cover:    coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '',
    genres:   (item.subject || []).slice(0,4).join(', ')
  };
}

/* --- RAWG (Jogos) --- */
async function searchRAWG(title) {
  const url = `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(title)}&page_size=1`;
  const res  = await fetch(url);
  const data = await res.json();
  const item = data.results && data.results[0];
  if (!item) return null;

  let synopsis = '';
  try {
    const detUrl = `https://api.rawg.io/api/games/${item.id}?key=${RAWG_KEY}`;
    const detRes = await fetch(detUrl);
    const det = await detRes.json();
    synopsis = det.description_raw || '';
  } catch(_) {}

  return {
    title:    item.name || '',
    year:     (item.released || '').slice(0,4),
    synopsis: synopsis,
    cover:    item.background_image || '',
    genres:   (item.genres || []).map(g => g.name).join(', ')
  };
}

const VALID_TYPES   = ['Filme','Série','Anime','Mangá','Dorama','Jogo','Livro'];
const VALID_STATUS  = ['Quero assistir','Assistindo','Finalizado','Abandonado'];

/* ═══════════════════════════════════════════
   IMPORTAÇÃO CSV / PASTE
═══════════════════════════════════════════ */
function openImportModal() {
  document.getElementById('importOverlay').classList.add('open');
  document.getElementById('csvFeedback').textContent = '';
  document.getElementById('pasteFeedback').textContent = '';
  document.getElementById('pasteInput').value = '';
  document.getElementById('csvFileInput').value = '';
  switchImportTab('csv');
}
function closeImportModal(e) {
  if (e && e.target !== document.getElementById('importOverlay')) return;
  document.getElementById('importOverlay').classList.remove('open');
}

function switchImportTab(tab) {
  document.getElementById('import-panel-csv').style.display   = tab === 'csv'   ? '' : 'none';
  document.getElementById('import-panel-paste').style.display = tab === 'paste' ? '' : 'none';
  document.getElementById('import-tab-csv').className   = 'btn ' + (tab === 'csv'   ? 'btn-primary' : 'btn-ghost');
  document.getElementById('import-tab-paste').className = 'btn ' + (tab === 'paste' ? 'btn-primary' : 'btn-ghost');
}

function parseImportRow(cells) {
  const title  = (cells[0] || '').trim();
  let type   = (cells[1] || '').trim().toLowerCase();
  let status = (cells[2] || '').trim().toLowerCase();
  const rating = parseInt(cells[3]) || 0;
  if (!title) return null;

  if (type === 'filme') type = 'Filme';
  else if (type === 'serie' || type === 'série') type = 'Série';
  else if (type === 'anime') type = 'Anime';
  else if (type === 'manga' || type === 'mangá') type = 'Mangá';
  else if (type === 'dorama') type = 'Dorama';
  else if (type === 'jogo') type = 'Jogo';
  else if (type === 'livro') type = 'Livro';
  else type = 'Filme';

  if (status.includes('quero')) status = 'Quero assistir';
  else if (status.includes('assistindo') || status.includes('lendo') || status.includes('jogando')) status = 'Assistindo';
  else if (status.includes('abandonado') || status.includes('dropado')) status = 'Abandonado';
  else status = 'Finalizado';

  return {
    id:     Date.now() + Math.random(),
    title,
    type,
    status,
    rating: Math.min(5, Math.max(0, rating)),
    year: '', platform: '', episodes: '', hours: '',
    genres: '', synopsis: '', opinion: '', cover: '',
    emotion: '', tags: [], fav: false,
    createdAt: new Date().toISOString()
  };
}

function handleCsvImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const lines = e.target.result.split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) return;
    
    let imported = 0, skipped = 0;
    const delimiter = lines[0].includes(';') ? ';' : ',';
    
    const startIdx = lines[0].toLowerCase().includes('title') ? 1 : 0;
    lines.slice(startIdx).forEach(line => {
      const cells = line.split(delimiter);
      const item = parseImportRow(cells);
      if (item) { db.push(item); imported++; }
      else skipped++;
    });
    save();
    if (imported) saveCatalogToFirestore(db);
    renderCatalogo();
    updateCounts();
    checkAchievements();
    const fb = document.getElementById('csvFeedback');
    fb.textContent = `✅ ${imported} obra(s) importada(s)` + (skipped ? ` · ${skipped} linha(s) ignorada(s)` : '');
    fb.style.color = 'var(--accent)';
    toast(`✅ ${imported} obra(s) importada(s) com sucesso!`, '✅');
  };
  reader.readAsText(file, 'UTF-8');
}

function handlePasteImport() {
  const text = document.getElementById('pasteInput').value;
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  let imported = 0, skipped = 0;
  lines.forEach(line => {
    const cells = line.split('|');
    const item = parseImportRow(cells);
    if (item) { db.push(item); imported++; }
    else skipped++;
  });
  save();
  if (imported) saveCatalogToFirestore(db);
  renderCatalogo();
  updateCounts();
  checkAchievements();
  const fb = document.getElementById('pasteFeedback');
  if (imported === 0) {
    fb.textContent = '⚠️ Nenhuma linha válida encontrada. Verifique o formato.';
    fb.style.color = 'var(--warning, #f59e0b)';
    return;
  }
  fb.textContent = `✅ ${imported} obra(s) importada(s)` + (skipped ? ` · ${skipped} linha(s) ignorada(s)` : '');
  fb.style.color = 'var(--accent)';
  toast(`✅ ${imported} obra(s) importada(s) com sucesso!`, '✅');
  setTimeout(() => document.getElementById('importOverlay').classList.remove('open'), 1500);
}

/* ═══════════════════════════════════════════
   KEYBOARD SHORTCUTS + INIT
═══════════════════════════════════════════ */
document.addEventListener('keydown', e=>{
  if (e.key==='Escape') {
    closeAddModal();
    closeDetailModal();
    closeWishModal();
    document.getElementById('importOverlay').classList.remove('open');
  }
  if ((e.ctrlKey||e.metaKey) && e.key==='k') {
    e.preventDefault();
    document.getElementById('searchInput').focus();
  }
});

document.getElementById('w-title').addEventListener('keydown', e=>{ if(e.key==='Enter') saveWish(); });

/* ═══════════════════════════════════════════
   AUTH — signIn / signOut
═══════════════════════════════════════════ */
async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider()
  try {
    await auth.signInWithPopup(provider)
  } catch (err) {
    console.error('Erro login:', err)
    if (err.code === 'auth/popup-blocked') {
      toast('⚠️ Popup bloqueado — redirecionando...', '⚠️')
      await auth.signInWithRedirect(provider)
    } else if (err.code === 'auth/unauthorized-domain') {
      toast('⚠️ Domínio não autorizado no Firebase Console.', '⚠️')
    } else {
      toast('❌ Erro ao fazer login.', '❌')
    }
  }
}

async function signOutUser() {
  try {
    await auth.signOut()
  } catch (err) {
    console.error('Erro ao sair:', err)
    toast('❌ Erro ao sair.', '❌')
  }
}

/* ═══════════════════════════════════════════
   AUTH + INIT
═══════════════════════════════════════════ */
function handleAuthChange(user) {
  const overlay = document.getElementById('loginOverlay')
  const mainContent = document.querySelector('.main')
  const userMenu = document.getElementById('userMenu')
  const avatar = document.getElementById('userAvatar')
  const sidebar = document.getElementById('sidebar')
  const bottomNav = document.getElementById('bottomNav')

  if (user) {
    overlay.classList.add('hidden')
    mainContent.style.display = ''
    if (sidebar) sidebar.style.display = ''
    if (bottomNav) bottomNav.style.display = ''
    userMenu.style.display = 'flex'
    avatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()
    initApp()
  } else {
    overlay.classList.remove('hidden')
    mainContent.style.display = 'none'
    if (sidebar) sidebar.style.display = 'none'
    if (bottomNav) bottomNav.style.display = 'none'
    userMenu.style.display = 'none'
    db = []
    wishdb = load(WISH_KEY, [])
    if (unsubscribeSync) { unsubscribeSync(); unsubscribeSync = null; }
  }
}

async function initApp() {
  try {
    await migrateIfNeeded()
    const data = await loadCatalog()
    if (data && data.length > 0) {
      db = data
    }
  } catch (_) {}
  // Ensure page-home exists (in case of cached HTML)
  if (!document.getElementById('page-home')) {
    const content = document.querySelector('.content');
    if (content) {
      // Remove active from other pages
      content.querySelectorAll('.page.active').forEach(p => p.classList.remove('active'));
      const div = document.createElement('div');
      div.className = 'page active';
      div.id = 'page-home';
      div.innerHTML = '<div id="homeContent"></div>';
      content.insertBefore(div, content.firstChild);
    }
  }
  // Sync sidebar + bottom nav active state
  document.querySelectorAll('.nav-item.active').forEach(n => n.classList.remove('active'));
  const homeNav = document.querySelector('.nav-item[onclick*="navigate(\'home\'"]');
  if (homeNav) homeNav.classList.add('active');
  const bnHome = document.getElementById('bn-home');
  if (bnHome) bnHome.classList.add('active');
  if (unsubscribeSync) unsubscribeSync()
  unsubscribeSync = subscribeCatalog(updatedData => {
    if (localSaveGuard || revertGuard) return;
    const norm = a => JSON.stringify([...a].sort((x,y)=>String(x.id).localeCompare(String(y.id))))
    if (norm(db) === norm(updatedData)) return
    const prevIds = new Set(db.map(x=>x.id))
    const nextIds = new Set(updatedData.map(x=>x.id))
    const added = [...nextIds].filter(id => !prevIds.has(id))
    const removed = [...prevIds].filter(id => !nextIds.has(id))
    // Merge: preserve local version when Firestore data is stale
    const localMap = new Map(db.map(x => [x.id, x]))
    updatedData.forEach(item => {
      localMap.set(item.id, item)
    })
    db = [...localMap.values()]
    // Re-apply localStorage items that Firestore rejected
    const saved = readLocalStorageFallback()
    if (saved) {
      const localItems = JSON.parse(saved)
      localItems.forEach(item => localMap.set(item.id, item))
      db = [...localMap.values()]
    }
    updateCounts()
    renderHome()
    renderCatalogo()
    const msgs = []
    if (added.length) msgs.push(`${added.length} adicionada(s)`)
    if (removed.length) msgs.push(`${removed.length} removida(s)`)
    if (!added.length && !removed.length) msgs.push('alterada(s)')
    toast(`🔄 Sincronizado: ${msgs.join(', ')}`, '🔄')
  })
  updateCounts()
  renderHome()
  renderCatalogo()
}

auth.getRedirectResult().catch(err => {
  console.error('Erro redirect:', err)
  toast('❌ ' + (err.message || err.code), '❌')
})
initAuth(handleAuthChange)

/* ═══════════════════════════════════════════
   PWA INSTALL PROMPT
═══════════════════════════════════════════ */
let installPrompt = null
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  installPrompt = e
  const btn = document.createElement('button')
  btn.className = 'btn btn-primary'
  btn.textContent = '📲 Instalar app'
  btn.style.cssText = 'position:fixed;bottom:80px;right:16px;z-index:999;padding:10px 20px;border-radius:40px;box-shadow:0 4px 20px rgba(108,92,231,.4)'
  btn.onclick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') btn.remove()
    installPrompt = null
  }
  document.body.appendChild(btn)
  setTimeout(() => { if (btn.parentNode) btn.remove() }, 30000)
})
