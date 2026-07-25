/* ── HISTORY API ── */
let _navPushingState = false;

function navigate(page, resetFilters = true, fromPopState = false) {
  currentPage = page;
  if (page !== 'biblioteca') currentBoxView = null;

  let domPage = page;
  if (page === 'favoritos') {
    statusFilter = 'fav';
    domPage = 'biblioteca';
  } else if (resetFilters) {
    tipoFilter = '';
    statusFilter = '';
  }

  const prev = document.querySelector('.page.active');
  const next = document.getElementById('page-' + domPage);
  if (prev && next && prev !== next) {
    prev.style.animation = 'pageOut .15s ease both';
    setTimeout(() => {
      prev.classList.remove('active');
      prev.style.animation = '';
      next.style.animation = 'pageIn .25s ease both';
      next.classList.add('active');
      setTimeout(() => { next.style.animation = ''; }, 300);
    }, 120);
  } else {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    if (next) next.classList.add('active');
  }

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));

  const bnEl = document.getElementById('bn-' + page);
  if (bnEl) bnEl.classList.add('active');

  document.querySelectorAll(`.nav-item[onclick*="navigate('${page}'"]`).forEach(n => n.classList.add('active'));

  closeSidebar();

  const isMobile = window.innerWidth < 768;
  if (isMobile && navigator.vibrate) navigator.vibrate(8);

  updateBreadcrumb(page);

  if      (domPage === 'biblioteca') { renderCatalogo(); }
  else if (page === 'home')          { renderHome(); }
  else if (page === 'dashboard')     { renderDashboard(); }
  else if (page === 'timeline')      { renderTimeline(); }
  else if (page === 'wishlist')      { renderWishlist(); }
  else if (page === 'colecoes')      { renderColecoes(); }
  else if (page === 'perfil')        { renderProfile(); }
  else if (page === 'conquistas')    { renderConquistas(); }
  else if (page === 'config')        { renderConfig(); }
  else if (page === 'experiencia')   { renderExperiencia(); }

  // History API — push state only on user-initiated navigation
  if (!fromPopState) {
    const hash = '#' + page;
    if (window.location.hash !== hash) {
      history.pushState({ page }, '', hash);
    }
  }
}

window.addEventListener('popstate', (e) => {
  const page = (e.state && e.state.page) || 'home';
  navigate(page, true, true);
});

function updateBreadcrumb(page) {
  const trail = document.getElementById('breadcrumbTrail');
  const back = document.getElementById('breadcrumbBack');
  if (!trail) return;

  const labels = {
    home:        'Home',
    biblioteca:  'Biblioteca',
    dashboard:   'Dashboard',
    timeline:    'Linha do Tempo',
    wishlist:    'Lista de Desejos',
    conquistas:  'Conquistas',
    config:      'Configurações',
    experiencia: 'Experiência',
    favoritos:   'Favoritos'
  };

  if (page === 'home') {
    trail.innerHTML = '';
    back.style.display = 'none';
    return;
  }

  back.style.display = 'flex';
  back.onclick = function() { navigate('home'); };

  let trailHtml = '';
  const addCrumb = (label, isLast) => {
    if (trailHtml) trailHtml += '<span class="breadcrumb-sep">›</span>';
    trailHtml += `<span class="breadcrumb-item${isLast ? ' current' : ''}">${esc(label)}</span>`;
  };

  if (page === 'biblioteca') {
    addCrumb('Biblioteca', true);
  } else if (page === 'favoritos') {
    addCrumb('Biblioteca', false);
    addCrumb('Favoritos', true);
  } else {
    addCrumb(labels[page] || page, true);
    back.onclick = function() { navigate('home'); };
  }

  trail.innerHTML = trailHtml;
}

function navigateFilter(page, dim, val) {
  if (dim === 'tipo') {
    tipoFilter = val;
    document.getElementById('fbTypeSelect').value = val;
    document.getElementById('fbStatusSelect').value = '';
  }
  if (dim === 'status') {
    tipoFilter = '';
    statusFilter = val;
    document.getElementById('fbTypeSelect').value = '';
    document.getElementById('fbStatusSelect').value = val;
  }
  navigate(page, false);
  updateBreadcrumbFilter(page, dim, val);
}

function updateBreadcrumbFilter(page, dim, val) {
  const trail = document.getElementById('breadcrumbTrail');
  if (!trail || !val) return;
  const labels = { Filme:'Filmes', Série:'Séries', Anime:'Animes', Mangá:'Mangás',
    Dorama:'Doramas', Jogo:'Jogos', Livro:'Livros', Box:'Boxes', Coleção:'Coleções',
    Assistindo:'Assistindo', Finalizado:'Finalizados', Abandonado:'Abandonados',
    'Quero assistir':'Quero assistir' };
  const dimLabels = { tipo:'Por tipo', status:'Por status' };
  const label = labels[val] || val;
  const dimLabel = dimLabels[dim] || dim;
  const trailHtml = `<span class="breadcrumb-item">Biblioteca</span><span class="breadcrumb-sep">›</span><span class="breadcrumb-item">${esc(dimLabel)}</span><span class="breadcrumb-sep">›</span><span class="breadcrumb-item current">${esc(label)}</span>`;
  trail.innerHTML = trailHtml;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}

function toggleProfileMenu() {
  document.getElementById('profileDropdown').classList.toggle('open');
}

document.addEventListener('click', function(e) {
  const menu = document.getElementById('profileDropdown');
  const trigger = document.getElementById('profileTrigger');
  if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !trigger.contains(e.target)) {
    menu.classList.remove('open');
  }
});

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

function toggleSidebarAccordion(id) {
  const el = document.getElementById('collapse-' + id);
  const btn = el.parentElement.querySelector('.sidebar-accordion');
  if (el) {
    el.classList.toggle('open');
    if (btn) btn.classList.toggle('open');
  }
}

function updateSidebarAvatar() {
  const el = document.getElementById('sidebarAvatar');
  const nameEl = document.getElementById('sidebarUserName');
  if (!el) return;
  if (auth.currentUser) {
    const initial = auth.currentUser.displayName?.charAt(0) || auth.currentUser.email?.charAt(0) || 'U';
    el.textContent = initial.toUpperCase();
    el.style.background = 'var(--primary)';
    if (nameEl) nameEl.textContent = auth.currentUser.displayName || auth.currentUser.email || 'Usuário';
  } else {
    el.textContent = '?';
    el.style.background = 'var(--surface2)';
    if (nameEl) nameEl.textContent = 'Visitante';
  }
}

/* ── COMMAND PALETTE ── */
let cmdSelectedIndex = 0;
let cmdCurrentResults = [];

function openCmdPalette() {
  document.getElementById('cmdPaletteOverlay').classList.add('open');
  const input = document.getElementById('cmdInput');
  input.value = '';
  handleCmdSearch('');
  setTimeout(() => input.focus(), 100);
}

function closeCmdPalette(e) {
  if (e && e.target !== document.getElementById('cmdPaletteOverlay')) return;
  document.getElementById('cmdPaletteOverlay').classList.remove('open');
}

function handleCmdSearch(query) {
  const normQuery = typeof normalizeStr === 'function' ? normalizeStr(query) : (query || '').toLowerCase().trim();
  const resultsEl = document.getElementById('cmdResults');
  
  const pages = [
    { title: 'Home', action: () => navigate('home'), icon: 'home', type: 'Página' },
    { title: 'Biblioteca', action: () => navigate('biblioteca'), icon: 'library_books', type: 'Página' },
    { title: 'Dashboard', action: () => navigate('dashboard'), icon: 'bar_chart', type: 'Página' },
    { title: 'Configurações', action: () => navigate('config'), icon: 'settings', type: 'Página' }
  ];
  
  const actions = [
    { title: 'Adicionar Obra', action: () => openSmartFormModal('add'), icon: 'add', type: 'Ação' }
  ];
  
  let results = [];
  
  if (normQuery.length === 0) {
    results = [...pages, ...actions];
  } else {
    const terms = normQuery.split(/\s+/).filter(Boolean);
    const dbResults = db.filter(x => {
      const haystack = typeof normalizeStr === 'function'
        ? normalizeStr(
            (x.title||'') + ' ' + (x.author||'') + ' ' + (x.genres||'') +
            ' ' + (x.director||'') + ' ' + (x.studio||'') + ' ' + (x.developer||'') +
            ' ' + (x.platform||'') + ' ' + (x.creator||'') +
            ' ' + (x.synopsis||x.description||'') + ' ' + (x.opinion||'')
          )
        : (x.title||'').toLowerCase();
      return terms.every(t => haystack.includes(t));
    }).slice(0, 8).map(x => ({
      title: x.title,
      action: () => openDetail(x.id),
      icon: 'search',
      type: x.type
    }));
    
    const navStr = (query || '').toLowerCase().trim();
    const navResults = [...pages, ...actions].filter(x => x.title.toLowerCase().includes(navStr));
    results = [...dbResults, ...navResults];
  }
  
  cmdCurrentResults = results;
  cmdSelectedIndex = 0;
  renderCmdResults();
}

function renderCmdResults() {
  const resultsEl = document.getElementById('cmdResults');
  if (cmdCurrentResults.length === 0) {
    resultsEl.innerHTML = '<div class="cmd-empty">Nenhum resultado encontrado.</div>';
    return;
  }
  
  resultsEl.innerHTML = cmdCurrentResults.map((res, i) => `
    <div class="cmd-item ${i === cmdSelectedIndex ? 'active' : ''}" onclick="executeCmdItem(${i})">
      <span class="cmd-item-icon"><span class="material-symbols-rounded">${res.icon}</span></span>
      <div class="cmd-item-info">
        <div class="cmd-item-title">${esc(res.title)}</div>
        <div class="cmd-item-type">${esc(res.type)}</div>
      </div>
      <span class="cmd-item-arrow material-symbols-rounded">keyboard_return</span>
    </div>
  `).join('');
}

function executeCmdItem(index) {
  const item = cmdCurrentResults[index];
  if (item) {
    closeCmdPalette();
    item.action();
  }
}

document.getElementById('cmdInput')?.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    cmdSelectedIndex = (cmdSelectedIndex + 1) % cmdCurrentResults.length;
    renderCmdResults();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    cmdSelectedIndex = (cmdSelectedIndex - 1 + cmdCurrentResults.length) % cmdCurrentResults.length;
    renderCmdResults();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    executeCmdItem(cmdSelectedIndex);
  }
});

/* ── GLOBAL KEYBOARD NAVIGATION ── */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown && dropdown.classList.contains('open')) {
      dropdown.classList.remove('open');
      return;
    }
    const cmdOverlay = document.getElementById('cmdPaletteOverlay');
    if (cmdOverlay && cmdOverlay.classList.contains('open')) {
      cmdOverlay.classList.remove('open');
      return;
    }
    const sidebar = document.getElementById('sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
      return;
    }
  }

  if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    openCmdPalette();
  }

  if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && !document.querySelector('.overlay.open')) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  }
});
