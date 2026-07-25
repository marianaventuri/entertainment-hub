var catalogCache = { items: null, html: '', filters: {} };

function updateQuickFilters() {
  const collSelect = document.getElementById('ff-collection');
  if (!collSelect) return;
  const current = collSelect.value;
  const containers = db.filter(x => x.type === 'Box' || x.type === 'Coleção');
  collSelect.innerHTML = `<option value="">Coleção</option>` + containers.map(c => `<option value="${esc(c.id)}">${esc(c.title)}</option>`).join('');
  if (current) collSelect.value = current;
}

/* ── SEARCH HISTORY ── */
function getSearchHistory() {
  try { return JSON.parse(localStorage.getItem('indexa_searchHistory')) || []; }
  catch { return []; }
}
function saveSearchHistory(h) {
  localStorage.setItem('indexa_searchHistory', JSON.stringify(h));
}
function addSearchHistory(query) {
  const q = query.trim();
  if (!q || q.length < 2) return;
  let h = getSearchHistory();
  h = h.filter(x => normalizeStr(x) !== normalizeStr(q));
  h.unshift(q);
  if (h.length > 20) h = h.slice(0, 20);
  saveSearchHistory(h);
}
function clearSearchHistory() {
  saveSearchHistory([]);
  renderSearchSuggestions();
}

/* ── SEARCH SUGGESTIONS ── */
function renderSearchSuggestions() {
  const container = document.getElementById('searchSuggestions');
  const input = document.getElementById('searchInput');
  if (!container || !input) return;
  const val = input.value.trim();
  if (val.length > 0) { container.classList.add('hidden'); return; }

  const h = getSearchHistory();
  const favs = db.filter(x => x.fav).sort((a,b) => (b.updatedAt||'').localeCompare(a.updatedAt||'')).slice(0, 4);
  const recent = [...db].sort((a,b) => (b.updatedAt||'').localeCompare(a.updatedAt||'')).slice(0, 4);

  let html = '';
  if (h.length) {
    html += `<div class="ss-group"><div class="ss-group-label"><span class="material-symbols-rounded" style="font-size:1rem">history</span> Recentes</div>`;
    html += h.slice(0, 5).map(q => `<button class="ss-item" onclick="document.getElementById('searchInput').value='${esc(q)}';debouncedRenderCatalogo();container.classList.add('hidden')"><span class="material-symbols-rounded" style="font-size:1rem;color:var(--text3)">history</span> ${esc(q)}</button>`).join('');
    html += `<button class="ss-item ss-clear" onclick="clearSearchHistory()"><span class="material-symbols-rounded" style="font-size:1rem">delete_sweep</span> Limpar histórico</button>`;
    html += `</div>`;
  }
  if (favs.length) {
    html += `<div class="ss-group"><div class="ss-group-label"><span class="material-symbols-rounded" style="font-size:1rem">favorite</span> Favoritos</div>`;
    html += favs.map(x => {
      const t = TIPO[x.type]||{icon:'movie'};
      return `<button class="ss-item" onclick="openDetail('${esc(x.id)}');container.classList.add('hidden')">
        <span class="material-symbols-rounded" style="font-size:1rem;color:${t.color}">${esc(t.icon)}</span> ${esc(x.title)}</button>`;
    }).join('');
    html += `</div>`;
  }
  if (recent.length && !h.length) {
    html += `<div class="ss-group"><div class="ss-group-label"><span class="material-symbols-rounded" style="font-size:1rem">schedule</span> Últimas adicionadas</div>`;
    html += recent.map(x => {
      const t = TIPO[x.type]||{icon:'movie'};
      return `<button class="ss-item" onclick="openDetail('${esc(x.id)}');container.classList.add('hidden')">
        <span class="material-symbols-rounded" style="font-size:1rem;color:${t.color}">${esc(t.icon)}</span> ${esc(x.title)}</button>`;
    }).join('');
    html += `</div>`;
  }
  container.innerHTML = html || '';
  container.classList.toggle('hidden', !html);
}

function calcCardProgress(item) {
  if (item.type === 'Box' || item.type === 'Coleção' || item.type === 'Filme') return 0;
  if (item.status === 'Finalizado') return 100;
  if ((item.type === 'Série' || item.type === 'Anime' || item.type === 'Dorama') && item.currentEp && item.episodes) {
    return Math.min(100, Math.round((item.currentEp / item.episodes) * 100));
  }
  if ((item.type === 'Mangá' || item.type === 'Livro') && item.currentChapter && item.chaptersTotal) {
    return Math.min(100, Math.round((item.currentChapter / item.chaptersTotal) * 100));
  }
  return 0;
}

function clearAllFilters() {
  tipoFilter = '';
  statusFilter = '';
  const typeSel = document.getElementById('fbTypeSelect');
  if (typeSel) typeSel.value = '';
  const statusSel = document.getElementById('fbStatusSelect');
  if (statusSel) statusSel.value = '';
  const yearSel = document.getElementById('ff-year');
  if (yearSel) yearSel.value = '';
  const ratingSel = document.getElementById('ff-rating');
  if (ratingSel) ratingSel.value = '';
  const collSel = document.getElementById('ff-collection');
  if (collSel) collSel.value = '';
  renderCatalogo();
}

function setTipoFilter(tipo) {
  tipoFilter = tipo;
  renderCatalogo();
}

function setStatusFilter(status) {
  statusFilter = status;
  renderCatalogo();
}

function setFavFilter() {
  statusFilter = 'fav';
  const statusSel = document.getElementById('fbStatusSelect');
  if (statusSel) statusSel.value = '';
  renderCatalogo();
}

function showSkeleton() {
  const grid = document.getElementById('catalogoGrid');
  const skeleton = document.getElementById('catalogoSkeleton');
  const empty = document.getElementById('catalogoEmpty');
  if (!skeleton) return;
  skeleton.classList.remove('hidden');
  grid.classList.add('is-loading');
  empty.classList.add('hidden');
  if (skeleton.children.length === 0) {
    const count = window.innerWidth >= 1280 ? 12 : (window.innerWidth >= 768 ? 8 : 4);
    skeleton.innerHTML = Array(count).fill('<div class="skeleton-card"></div>').join('');
  }
}

function hideSkeleton() {
  const skeleton = document.getElementById('catalogoSkeleton');
  const grid = document.getElementById('catalogoGrid');
  if (skeleton) skeleton.classList.add('hidden');
  grid.classList.remove('is-loading');
}

function updateActiveFilters() {
  const container = document.getElementById('activeFilters');
  const tags = [];
  if (tipoFilter) tags.push({ label: tipoFilter, onRemove: "document.getElementById('fbTypeSelect').value='';clearAllFilters()" });
  if (statusFilter === 'fav') tags.push({ label: 'Favoritos', onRemove: "document.getElementById('fbStatusSelect').value='';clearAllFilters()" });
  else if (statusFilter) tags.push({ label: statusFilter, onRemove: "document.getElementById('fbStatusSelect').value='';clearAllFilters()" });
  const hasFilters = tags.length > 0;
  container.innerHTML = tags.map(t => `<span class="active-filter-tag"><span class="material-symbols-rounded" style="font-size:.85rem">filter_alt</span> ${esc(t.label)} <span class="remove" onclick="${esc(t.onRemove)};event.stopPropagation()">✕</span></span>`).join('');
  if (hasFilters) {
    container.innerHTML += `<span class="active-filter-tag save-filter" onclick="saveCurrentFilter()" style="background:var(--accent);color:#fff;border-color:var(--accent)"><span class="material-symbols-rounded" style="font-size:.85rem">bookmark</span> Salvar</span>`;
    container.innerHTML += `<span class="clear-filters" onclick="clearAllFilters()"><span class="material-symbols-rounded" style="font-size:.85rem">close</span> Limpar</span>`;
  }
  if (typeof renderSavedFilters === 'function') {
    container.innerHTML += `<div id="savedFiltersContainer" style="display:inline-flex;gap:8px;margin-left:8px;padding-left:8px;border-left:1px solid var(--border)"></div>`;
    renderSavedFilters();
  }
  const cardCount = document.querySelectorAll('#catalogoGrid .card').length;
  document.getElementById('resultCount').textContent = cardCount 
    ? cardCount + ' obra' + (cardCount !== 1 ? 's' : '')
    : '0 obras';
  updateChipCounts();
}

function updateChipCounts() {
  const counts = { total: db.length };
  db.forEach(item => {
    if (item.type) counts[item.type] = (counts[item.type] || 0) + 1;
    if (item.status) counts[item.status] = (counts[item.status] || 0) + 1;
  });
  
  document.querySelectorAll('.nav-count').forEach(badge => {
    const id = badge.id.replace('nc-', '');
    if (id === 'total') badge.textContent = counts.total;
    else if (id === 'Quero') badge.textContent = counts['Quero assistir'] || 0;
    else badge.textContent = counts[id] || 0;
    
    // Hide if 0
    if (badge.textContent === '0') badge.style.display = 'none';
    else badge.style.display = 'inline-block';
  });
}

function renderCatalogo() {
  showSkeleton();
  const searchInput = document.getElementById('searchInput');
  const orderSelect = document.getElementById('filterOrder');
  const searchRaw = (searchInput ? searchInput.value : '')||'';
  const search  = normalizeStr(searchRaw);
  const status  = statusFilter;
  const order   = orderSelect ? orderSelect.value : '';

  if (search.length >= 2) addSearchHistory(searchRaw);

  const yearFilter = document.getElementById('ff-year')?.value || '';
  const ratingFilter = document.getElementById('ff-rating')?.value || '';
  const collFilter = document.getElementById('ff-collection')?.value || '';

  const typeSel = document.getElementById('fbTypeSelect');
  if (typeSel && tipoFilter) typeSel.value = tipoFilter;
  const statusSel = document.getElementById('fbStatusSelect');
  if (statusSel && status) statusSel.value = status === 'fav' ? '' : status;

  let items = [...db];

  // Build set of child IDs from all Box/Coleção (except the one being viewed)
  const childIds = new Set();
  for (const item of db) {
    if ((item.type === 'Box' || item.type === 'Coleção') && (!currentBoxView || item.id !== currentBoxView.id)) {
      (item.containerItems || []).forEach(cid => childIds.add(String(cid)));
    }
  }

  // Apply box view filtering
  if (currentBoxView) {
    const boxChildIds = new Set((currentBoxView.containerItems || []).map(String));
    items = items.filter(x => boxChildIds.has(String(x.id)));
  } else {
    items = items.filter(x => !childIds.has(String(x.id)));
  }

  if (tipoFilter) items = items.filter(x=>x.type===tipoFilter);
  if (status) {
    if (status === 'fav') items = items.filter(x => x.fav);
    else items = items.filter(x=>x.status===status);
  }
  if (search) {
    const terms = search.split(/\s+/).filter(Boolean);
    items = items.filter(x => {
      const haystack = normalizeStr(
        (x.title||'') + ' ' + (x.author||'') + ' ' + (x.genres||'') + ' ' + (x.tags||[]).join(' ') +
        ' ' + (x.director||'') + ' ' + (x.studio||'') + ' ' + (x.developer||'') + ' ' + (x.publisher||'') +
        ' ' + (x.platform||'') + ' ' + (x.creator||'') + ' ' + (x.synopsis||x.description||'') + ' ' + (x.opinion||'')
      );
      return terms.every(t => haystack.includes(t));
    });
  }
  if (yearFilter) {
    if (yearFilter.startsWith('<')) items = items.filter(x => parseInt(x.year) < parseInt(yearFilter.slice(1)));
    else if (yearFilter.startsWith('>')) items = items.filter(x => parseInt(x.year) > parseInt(yearFilter.slice(1)));
    else items = items.filter(x => String(x.year) === yearFilter);
  }
  if (ratingFilter) {
    const min = parseInt(ratingFilter);
    items = items.filter(x => (x.rating||0) >= min);
  }
  if (collFilter) {
    items = items.filter(x => {
      const containers = db.filter(c => (c.type === 'Box' || c.type === 'Coleção') && (c.containerItems || []).some(id => String(id) === String(x.id)));
      return containers.some(c => c.title === collFilter || c.id === collFilter);
    });
  }

  // Sorting
  const isGroup = order.startsWith('group_');
  const sortParam = isGroup ? 'year_asc' : order; // if grouping, force sort by year ascending inside groups

  if (currentBoxView && containerSortBy !== 'manual') {
    const cSort = containerSortBy;
    if (cSort === 'title')  items.sort((a,b)=>a.title.localeCompare(b.title));
    else if (cSort === 'rating') items.sort((a,b)=>(b.rating||0)-(a.rating||0));
    else if (cSort === 'status') items.sort((a,b)=>(b.status||'').localeCompare(a.status||''));
    else if (cSort === 'added')  items.sort((a,b)=>(b.addedAt||'').localeCompare(a.addedAt||''));
    else if (cSort === 'year')   items.sort((a,b)=>(b.year||'')-(a.year||''));
  } else if (sortParam==='title')  items.sort((a,b)=>a.title.localeCompare(b.title));
  else if (sortParam==='rating') items.sort((a,b)=>(b.rating||0)-(a.rating||0));
  else if (sortParam==='year_asc') items.sort((a,b)=>(a.year||'')-(b.year||'')); // oldest first
  else if (sortParam==='year')     items.sort((a,b)=>(b.year||'')-(a.year||''));
  else if (sortParam==='progress') items.sort((a,b)=>(b.progress||0)-(a.progress||0));
  else if (sortParam==='updated')  items.sort((a,b)=>(b.updatedAt||'').localeCompare(a.updatedAt||''));
  else if (sortParam==='added')    items.sort((a,b)=>(b.addedAt||'').localeCompare(a.addedAt||''));
  else items.sort((a,b)=>b.id-a.id); // recent

  if (currentBoxView) {
    const titleEl = document.getElementById('fbTitle');
    if (titleEl) titleEl.innerHTML = `<span class="box-view-back" onclick="closeBoxView()" style="cursor:pointer;font-size:0.8em;color:var(--text3)">← Voltar</span> ` + esc(currentBoxView.title);
  } else {
    const titleEl = document.getElementById('fbTitle');
    if (titleEl) {
      if (tipoFilter) titleEl.textContent = tipoFilter + 's';
      else if (status === 'fav') titleEl.textContent = 'Favoritos';
      else titleEl.textContent = status || 'Biblioteca';
    }
  }

  const grid  = document.getElementById('catalogoGrid');
  const empty = document.getElementById('catalogoEmpty');

  if (!items.length) {
    grid.innerHTML = currentBoxView ? renderContainerHero() : '';
    empty.classList.remove('hidden');
    const icon = empty.querySelector('#emptyIcon .material-symbols-rounded');
    const action = empty.querySelector('#emptyAction');
    if (currentBoxView) {
      icon.textContent = 'inventory_2';
      empty.querySelector('h3').textContent = 'Está vazia';
      empty.querySelector('p').textContent = 'Adicione itens a esta ' + esc(currentBoxView.type).toLowerCase() + ' pelo modal de detalhes';
      action.style.display = 'none';
    } else if (statusFilter === 'fav') {
      icon.textContent = 'favorite';
      empty.querySelector('h3').textContent = 'Nenhum favorito ainda';
      empty.querySelector('p').textContent = 'Clique no coração de um card para marcar como favorito';
      action.style.display = 'none';
    } else if (!db.length) {
      icon.textContent = 'library_books';
      empty.querySelector('h3').textContent = 'Sua biblioteca está vazia';
      empty.querySelector('p').textContent = 'Adicione sua primeira obra para começar!';
      action.style.display = 'inline-flex';
      action.innerHTML = '<span class="material-symbols-rounded">add</span> Adicionar obra';
    } else {
      icon.textContent = 'search';
      empty.querySelector('h3').textContent = 'Nenhum resultado';
      empty.querySelector('p').textContent = 'Tente ajustar os filtros ou buscar por outro termo.';
      action.style.display = 'none';
    }
    hideSkeleton();
    updateActiveFilters();
    return;
  }
  empty.classList.add('hidden');

  const isListView = currentBoxView && containerViewMode === 'list';
  grid.className = isListView ? 'grid list-view' : 'grid';
  let cardHtml = '';
  let cardIndex = 0;

  function renderCardWithIndex(item) {
    const html = renderCard(item, cardIndex);
    cardIndex++;
    return html;
  }

  const containerHeroHtml = currentBoxView ? renderContainerHero() : '';

  if (isListView) {
    cardHtml = items.map((item, i) => renderListItem(item, i)).join('');
  } else if (isGroup) {
    const groupKeyMap = {
      'group_category': 'type',
      'group_author': 'author',
      'group_director': 'director',
      'group_studio': 'studio',
      'group_collection': 'collection'
    };
    const prop = groupKeyMap[order] || 'author';
    const groups = {};
    items.forEach(item => {
      const gValue = item[prop] || 'Desconhecido';
      if (!groups[gValue]) groups[gValue] = [];
      groups[gValue].push(item);
    });
    const sortedGroupNames = Object.keys(groups).sort((a,b) => a.localeCompare(b));
    sortedGroupNames.forEach(gName => {
      cardHtml += `<div class="author-group-header" style="animation:cardEnter .3s ease both;animation-delay:${Math.min(cardIndex * 30, 300)}ms; grid-column: 1/-1; font-size:1.2rem; font-weight:600; margin-top:24px; padding-bottom:8px; border-bottom:1px solid var(--border)">${esc(gName)}</div>`;
      groups[gName].forEach(item => { cardHtml += renderCardWithIndex(item); });
    });
  } else {
    cardHtml = items.map(item => renderCardWithIndex(item)).join('');
  }

  grid.innerHTML = containerHeroHtml + cardHtml;

  function renderCard(item, idx = 0) {
    const t = TIPO[item.type]||{icon:'movie', color:'#555'};
    const isContainer = item.type === 'Box' || item.type === 'Coleção';
    const delay = Math.min(idx * 40, 500);

    let selMode = isDeleteMode;
    if (isBoxMode) selMode = item.type === 'Livro';
    if (isColecaoMode) selMode = true;
    const selectionActive = selMode;
    const isSelected = (isDeleteMode || isBoxMode || isColecaoMode) &&
      (containerSelectedIds.has(item.id) || containerSelectedIds.has(String(item.id)) ||
       selectedIds.has(item.id) || selectedIds.has(String(item.id)));

    if (isContainer) {
      const containerItems = (item.containerItems||[]).map(id => findInDb(id)).filter(Boolean);
      const total = containerItems.length;
      const done = containerItems.filter(i => i.status === 'Finalizado').length;
      const pct = total ? Math.round(done/total*100) : 0;
      const coverEl = item.cover
        ? `<img src="${esc(item.cover)}" alt="" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\\'card-placeholder skeleton\\'><span class=\\'material-symbols-rounded type-icon\\'>${esc(t.icon)}</span><span class=\\'type-label\\'>${esc(item.type)}</span></div>'">`
        : `<div class="card-placeholder skeleton"><span class="material-symbols-rounded type-icon">${esc(t.icon)}</span><span class="type-label">${esc(item.type)}</span></div>`;
      const coversData = esc(JSON.stringify(containerItems.map(ci => ci.cover).filter(Boolean)));
    return `
      <div class="card card-container" data-id="${esc(item.id)}" data-type="${esc(item.type)}" style="--type-color: ${t.color}; animation:cardEnter .35s ease both; animation-delay:${delay}ms" onclick="${selectionActive ? `toggleSelection('${esc(item.id)}', event)` : `openBoxView('${esc(item.id)}')`}" onmouseenter="startCoverCycle(this)" onmouseleave="stopCoverCycle(this)">
          <div class="card-poster">
            ${coverEl}
            <div class="card-container-cycling" data-covers='${coversData}'></div>
            <div class="card-container-badge"><span class="material-symbols-rounded">${esc(t.icon)}</span> ${esc(item.type)}</div>
            <div class="card-container-bar"><div class="card-container-bar-fill" style="width:${pct}%"></div></div>
            <div class="card-container-count">${done}/${total}</div>
            <button class="card-container-settings-btn" onclick="event.stopPropagation();toggleContainerCoverPopover('${esc(item.id)}')" aria-label="Configurar capa">
              <span class="material-symbols-rounded" style="font-size:1.1rem">more_horiz</span>
            </button>
            <div class="card-container-cover-popover" id="coverPopover-${esc(item.id)}" onclick="event.stopPropagation()">
              <div style="font-size:.7rem;font-weight:var(--weight-medium);color:var(--text2);margin-bottom:6px">URL da capa</div>
              <input class="form-input" id="coverInput-${esc(item.id)}" placeholder="https://..." value="${esc(item.cover||'')}" style="font-size:.75rem;padding:6px 8px"/>
              <div style="display:flex;gap:4px;margin-top:6px">
                <button class="btn btn-primary btn-sm" style="font-size:.7rem;padding:4px 10px" onclick="saveContainerCoverFromCard('${esc(item.id)}')">Salvar</button>
                <button class="btn btn-ghost btn-sm" style="font-size:.7rem;padding:4px 10px" onclick="closeContainerCoverPopover('${esc(item.id)}')">Cancelar</button>
              </div>
            </div>
            ${selectionActive ? `
              <div class="card-select-overlay" style="background:rgba(0,0,0,${isSelected ? '0.6' : '0.3'})">
                <div class="card-select-circle" style="background:${isSelected ? 'var(--accent)' : 'transparent'}">
                  ${isSelected ? '✓' : ''}
                </div>
              </div>
            ` : ''}
          </div>
        </div>`;
    }

    const coverEl = item.cover
      ? `<img src="${esc(item.cover)}" alt="${esc(item.title)}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=\\'card-placeholder skeleton\\'><span class=\\'material-symbols-rounded type-icon\\'>${esc(t.icon)}</span><span class=\\'type-label\\'>${esc(item.type)}</span></div>'">`
      : `<div class="card-placeholder skeleton"><span class="material-symbols-rounded type-icon">${esc(t.icon)}</span><span class="type-label">${esc(item.type)}</span></div>`;
    const ratingStars = item.rating ? `<div class="card-info-rating">${'★'.repeat(item.rating)}</div>` : '';
    const favIcon = item.fav ? '<span class="material-symbols-rounded fav-icon">favorite</span>' : '<span class="material-symbols-rounded fav-icon">favorite_border</span>';
    const platformHtml = item.platform ? `<span class="card-info-platform">${esc(item.platform)}</span>` : '';
    const detailsParts = [esc(item.type), item.year].filter(Boolean);
    const cineBadge = item.type === 'Filme' && item.cinemaWatched
      ? `<div class="card-cinema-badge"><span class="material-symbols-rounded">movie</span> Cinema</div>` : '';
    const progPct = calcCardProgress(item);
    const progBar = progPct > 0 ? `<div class="card-progress-bar"><div class="card-progress-fill" style="width:${progPct}%"></div></div>` : '';
    const readLink = item.readUrl ? `<a class="card-read-link" href="${esc(item.readUrl)}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><span class="material-symbols-rounded" style="font-size:.85rem">open_in_new</span> Continue lendo</a>` : '';
    const progLabelText = getProgressLabel(item);
    const progLabelBadge = (item.status === 'Assistindo' && progLabelText) ? `<div class="card-progress-badge">${esc(progLabelText)}</div>` : '';
    return `
      <div class="card" data-type="${esc(item.type)}" style="--type-color: ${t.color}; animation:cardEnter .35s ease both; animation-delay:${delay}ms" onclick="${selectionActive ? `toggleSelection('${esc(item.id)}', event)` : `openDetail('${esc(item.id)}')`}">
        <div class="card-poster">
          ${coverEl}
          <span class="card-status ${statusBadgeClass(item.status)}">${esc(displayStatus(item.status, item.type))}</span>
          <button class="card-fav-btn${item.fav ? ' faved' : ''}" onclick="event.stopPropagation();toggleCardFav('${esc(item.id)}')" aria-label="${item.fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">${favIcon}</button>
          ${cineBadge}
          ${progLabelBadge}
          ${progBar}
          ${readLink}
          <div class="card-overlay">
            <div class="card-info">
              <div class="card-info-title">${esc(item.title)}</div>
              ${ratingStars}
              <div class="card-info-details">
                ${detailsParts.join('<span class="sep">·</span>')}
                ${platformHtml}
              </div>
            </div>
          </div>
          ${selectionActive ? `
            <div class="card-select-overlay" style="background:rgba(0,0,0,${isSelected ? '0.6' : '0.3'})">
              <div class="card-select-circle" style="background:${isSelected ? (isDeleteMode ? 'var(--red)' : 'var(--accent)') : 'transparent'}">
                ${isSelected ? '✓' : ''}
              </div>
            </div>
          ` : ''}
        </div>
      </div>`;
  }

  function renderListItem(item, idx = 0) {
    const t = TIPO[item.type]||{icon:'movie', color:'#555'};
    const delay = Math.min(idx * 40, 500);
    const ratingStars = item.rating ? '<span class="lli-rating">' + '★'.repeat(item.rating) + '</span>' : '';
    const progPct = calcCardProgress(item);
    const progHtml = progPct > 0 ? `<div class="lli-progress"><div class="lli-progress-fill" style="width:${progPct}%"></div></div>` : '';
    const readLink = item.readUrl ? `<a class="lli-read-link" href="${esc(item.readUrl)}" target="_blank" rel="noopener" onclick="event.stopPropagation()"><span class="material-symbols-rounded" style="font-size:.8rem">open_in_new</span> Continue lendo</a>` : '';
    const coverEl = item.cover
      ? `<img src="${esc(item.cover)}" alt="" loading="lazy" class="lli-cover-img" onerror="this.outerHTML='<span class=\\'material-symbols-rounded\\' style=\\'font-size:1.5rem;color:${t.color}\\'>${esc(t.icon)}</span>'">`
      : `<span class="material-symbols-rounded" style="font-size:1.5rem;color:${t.color}">${esc(t.icon)}</span>`;
    const removeBtn = currentBoxView
      ? `<button class="lli-remove" onclick="event.stopPropagation();removeFromCurrentContainer('${esc(item.id)}')" title="Remover da coleção">
          <span class="material-symbols-rounded" style="font-size:1rem">remove_circle_outline</span>
        </button>`
      : '';
    return `
      <div class="list-item" style="animation:cardEnter .35s ease both;animation-delay:${delay}ms" onclick="openDetail('${esc(item.id)}')">
        <div class="lli-cover">${coverEl}</div>
        <div class="lli-body">
          <div class="lli-title">${esc(item.title)}</div>
          <div class="lli-meta">
            <span class="lli-type" style="color:${t.color}">${esc(item.type)}</span>
            <span class="lli-sep">·</span>
            <span class="lli-status">${esc(displayStatus(item.status, item.type))}</span>
            ${item.year ? `<span class="lli-sep">·</span><span>${esc(item.year)}</span>` : ''}
            ${ratingStars}
          </div>
            ${progHtml}
            ${readLink}
          <div class="lli-tags">
            ${(item.genres||'').split(',').filter(Boolean).slice(0,3).map(g => `<span class="lli-tag">${esc(g.trim())}</span>`).join('')}
          </div>
        </div>
        ${removeBtn}
        <button class="lli-fav ${item.fav?'faved':''}" onclick="event.stopPropagation();toggleCardFav('${esc(item.id)}')">
          <span class="material-symbols-rounded" style="font-size:1.2rem">${item.fav ? 'favorite' : 'favorite_border'}</span>
        </button>
      </div>`;
  }

  hideSkeleton();
  updateActiveFilters();
  updateQuickFilters();
}

async function quickUpdate(id, field, value) {
  const item = findInDb(id)
  if (!item) return
  item[field] = value
  if (field === 'status') {
    if (value === 'Finalizado' && !item.finishedAt) item.finishedAt = new Date().toISOString();
    else if (value !== 'Finalizado') item.finishedAt = null;
  }
  save()
  saveItemToFirestore(item)
  const overlay = document.getElementById('detailOverlay')
  if (overlay.classList.contains('open') && document.getElementById('detailBody').dataset.currentId === id) {
    openDetail(id)
  }
  renderCatalogo()
  if (field === 'status' && value === 'Finalizado') {
    suggestNextSoon(item);
  }
}

var debouncedRenderCatalogo = debounce(() => renderCatalogo(), 200);

function toggleGroupAuthor() {
  groupByAuthor = !groupByAuthor;
  const btn = document.getElementById('btnGroupAuthor');
  if (btn) btn.classList.toggle('active', groupByAuthor);
  renderCatalogo();
}

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
  const icon = document.getElementById('favIcon');
  if (icon) icon.textContent = favEdit ? 'favorite' : 'favorite_border';
}

function toggleTag(btn) { btn.classList.toggle('active'); }

async function toggleCardFav(id) {
  const item = findInDb(id)
  if (!item) { console.log('toggleCardFav: item not found', id); return; }
  item.fav = !item.fav
  console.log('toggleCardFav:', item.title, 'fav agora:', item.fav);
  save()
  localSaveGuard = true
  await saveItemToFirestore(item)
  setTimeout(() => { localSaveGuard = false; }, 100)
  renderCatalogo()
  renderHome()
}

function updateFormFields() {
  const type = document.getElementById('f-type').value;
  const statusSelect = document.getElementById('f-status');
  const currentVal = statusSelect.value;

  // --- Status options ---
  let options = '';
  if (type === 'Box' || type === 'Coleção') {
    options = `<option value="Assistindo">Colecionando</option>`;
  } else if (type === 'Livro' || type === 'Mangá') {
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

  // --- Show/hide type-specific fields ---
  const types = type.split(',');
  document.querySelectorAll('.ff-meta, .ff-consumo, .ff-leitura').forEach(el => {
    const match = (el.dataset.types || '').split(',').some(t => types.includes(t));
    el.style.display = match ? '' : 'none';
  });

  updateProgressFields();
}

function updateProgressFields() {
  const container = document.getElementById('f-progress-fields');
  if (!container) return;
  const typeEl = document.getElementById('f-type');
  if (!typeEl) return;
  const type = typeEl.value;

  if (type === 'Anime' || type === 'Série' || type === 'Dorama') {
    container.innerHTML = `
      <div class="form-field">
        <label class="form-label">Temporada atual</label>
        <input class="form-input" id="f-season" type="number" placeholder="1" min="1" oninput="editorAutoSave()"/>
      </div>
      <div class="form-field">
        <label class="form-label">Episódio atual</label>
        <input class="form-input" id="f-current-ep" type="number" placeholder="5" min="1" oninput="editorAutoSave()"/>
      </div>
      <div class="form-field">
        <label class="form-label">Episódios na temporada</label>
        <input class="form-input" id="f-episodes" type="number" placeholder="24" min="1" oninput="editorAutoSave()"/>
      </div>`;
  } else if (type === 'Mangá' || type === 'Livro') {
    const epLabel = type === 'Mangá' ? 'Capítulo atual' : 'Página atual';
    const epPlaceholder = type === 'Mangá' ? '45' : '120';
    const totalLabel = type === 'Mangá' ? 'Total de capítulos' : 'Total de páginas';
    const totalPlaceholder = type === 'Mangá' ? '200' : '350';
    container.innerHTML = `
      <div class="form-field">
        <label class="form-label">${epLabel}</label>
        <input class="form-input" id="f-current-ch" type="number" placeholder="${epPlaceholder}" min="1" oninput="editorAutoSave()"/>
      </div>
      <div class="form-field">
        <label class="form-label">${totalLabel}</label>
        <input class="form-input" id="f-chapters-total" type="number" placeholder="${totalPlaceholder}" min="1" oninput="editorAutoSave()"/>
      </div>`;
  } else if (type === 'Jogo') {
    container.innerHTML = `
      <div class="form-field">
        <label class="form-label">Horas jogadas</label>
        <input class="form-input" id="f-hours-played" type="number" min="0" step="0.1" placeholder="40" oninput="editorAutoSave()"/>
      </div>`;
  } else {
    container.innerHTML = '';
  }
}

function toggleCinemaFields() {
  // Simplificado: o cinema agora é apenas um checkbox, sem campos extras
}


function openBoxView(id) {
  const item = findInDb(id);
  if (!item) return;
  currentBoxView = item;
  tipoFilter = '';
  statusFilter = '';
  containerSortBy = 'manual';
  containerViewMode = 'grid';
  const searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.value = '';
  const typeSel = document.getElementById('fbTypeSelect');
  if (typeSel) typeSel.value = '';
  const statusSel = document.getElementById('fbStatusSelect');
  if (statusSel) statusSel.value = '';
  renderCatalogo();
}

function closeBoxView() {
  currentBoxView = null;
  containerSortBy = 'manual';
  containerViewMode = 'grid';
  renderCatalogo();
}

function renderContainerHero() {
  const item = currentBoxView;
  if (!item) return '';
  const containerItems = (item.containerItems||[]).map(id => findInDb(id)).filter(Boolean);
  const total = containerItems.length;
  const done = containerItems.filter(i => i.status === 'Finalizado').length;
  const pct = total ? Math.round(done/total*100) : 0;
  const t = TIPO[item.type]||{icon:'library_books',color:'#8b5cf6'};

  // Suggestions: same author, director, studio, developer, publisher
  const metaFields = ['author','director','studio','developer','publisher'];
  const metaValues = new Set();
  containerItems.forEach(ci => {
    metaFields.forEach(f => { if (ci[f]) metaValues.add(ci[f]); });
  });
  const suggestions = db.filter(x =>
    !containerItems.some(ci => String(ci.id) === String(x.id)) &&
    (metaValues.has(x.author) || metaValues.has(x.director) || metaValues.has(x.studio) ||
     metaValues.has(x.developer) || metaValues.has(x.publisher)) &&
    !(x.type === 'Box' || x.type === 'Coleção')
  ).slice(0, 4);

  const isEdit = smartFormMode === 'colecao' || smartFormMode === 'box';
  const coverEl = item.cover
    ? `<img src="${esc(item.cover)}" alt="" class="hero-cover-img">`
    : `<div class="hero-cover-placeholder"><span class="material-symbols-rounded" style="font-size:2.5rem">${esc(t.icon)}</span></div>`;

  let editFields = '';
  if (isEdit) {
    editFields = `
      <div class="hero-edit-fields">
        <div class="form-field">
          <label class="form-label">Nome</label>
          <input class="form-input" id="he-name" value="${esc(item.title)}"/>
        </div>
        <div class="form-field">
          <label class="form-label">Capa URL</label>
          <input class="form-input" id="he-cover" value="${esc(item.cover||'')}"/>
        </div>
        <div class="form-field">
          <label class="form-label">Descrição</label>
          <textarea class="form-textarea" id="he-desc" rows="2">${esc(item.containerDesc||'')}</textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:8px">
          <button class="btn btn-ghost btn-sm" onclick="cancelEditContainer()">Cancelar</button>
          <button class="btn btn-primary btn-sm" onclick="saveContainerEdit()">Salvar</button>
        </div>
      </div>`;
  }

  return `
    <div class="container-hero" id="containerHero">
      <div class="hero-main">
        ${coverEl}
        <div class="hero-info">
          <div class="hero-type-badge" style="background:${t.color}20;color:${t.color}">
            <span class="material-symbols-rounded" style="font-size:1rem">${esc(t.icon)}</span>
            ${esc(item.type)}
          </div>
          <h2 class="hero-title">${esc(item.title)}</h2>
          ${item.containerDesc ? `<p class="hero-desc">${esc(item.containerDesc)}</p>` : ''}
          <div class="hero-progress">
            <div class="hero-progress-text">${done}/${total} concluídos · ${pct}%</div>
            <div class="hero-progress-bar"><div class="hero-progress-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="hero-actions">
            <button class="btn btn-ghost btn-sm" onclick="editContainerInfo()">
              <span class="material-symbols-rounded" style="font-size:1rem">edit</span> Editar
            </button>
            <button class="btn btn-ghost btn-sm" onclick="closeBoxView()">
              <span class="material-symbols-rounded" style="font-size:1rem">arrow_back</span> Voltar
            </button>
          </div>
          ${editFields}
        </div>
      </div>
      ${suggestions.length ? `
      <div class="hero-suggestions">
        <div class="hero-suggestions-label">
          <span class="material-symbols-rounded" style="font-size:1rem;color:var(--text3)">auto_awesome</span>
          Sugestões para esta coleção
        </div>
        <div class="hero-suggestions-items">
          ${suggestions.map(x => {
            const st = TIPO[x.type]||{icon:'movie',color:'#555'};
            return `<button class="suggestion-chip" onclick="addToCurrentContainer('${esc(x.id)}')">
              <span class="material-symbols-rounded" style="font-size:.85rem;color:${st.color}">${esc(st.icon)}</span>
              ${esc(x.title)}
            </button>`;
          }).join('')}
        </div>
      </div>` : ''}
    </div>
    <div class="container-toolbar">
      <div class="container-toolbar-left">
        <span class="container-toolbar-count">${total} ${total === 1 ? 'item' : 'itens'}</span>
      </div>
      <div class="container-toolbar-right">
        <select class="container-sort-select" onchange="setContainerSort(this.value)">
          <option value="manual" ${containerSortBy==='manual'?'selected':''}>Ordem manual</option>
          <option value="title" ${containerSortBy==='title'?'selected':''}>Alfabética</option>
          <option value="added" ${containerSortBy==='added'?'selected':''}>Adicionado</option>
          <option value="rating" ${containerSortBy==='rating'?'selected':''}>Nota</option>
          <option value="status" ${containerSortBy==='status'?'selected':''}>Status</option>
          <option value="year" ${containerSortBy==='year'?'selected':''}>Ano</option>
        </select>
        <div class="container-view-toggle">
          <button class="view-toggle-btn ${containerViewMode==='grid'?'active':''}" onclick="setContainerView('grid')" title="Grid">
            <span class="material-symbols-rounded" style="font-size:1.15rem">grid_view</span>
          </button>
          <button class="view-toggle-btn ${containerViewMode==='list'?'active':''}" onclick="setContainerView('list')" title="Lista">
            <span class="material-symbols-rounded" style="font-size:1.15rem">view_list</span>
          </button>
        </div>
      </div>
    </div>`;
}

function editContainerInfo() {
  smartFormMode = 'colecao';
  renderContainerHero();
  const hero = document.getElementById('containerHero');
  if (hero) hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function cancelEditContainer() {
  smartFormMode = '';
  renderContainerHero();
}

function saveContainerEdit() {
  if (!currentBoxView) return;
  const name = document.getElementById('he-name').value.trim();
  if (!name) { toast('⚠️ Nome obrigatório', '⚠️'); return; }
  currentBoxView.title = name;
  currentBoxView.cover = document.getElementById('he-cover').value.trim();
  currentBoxView.containerDesc = document.getElementById('he-desc').value.trim();
  save();
  saveItemToFirestore(currentBoxView);
  smartFormMode = '';
  renderContainerHero();
  renderCatalogo();
  toast('✏️ Coleção atualizada!', '✏️');
}

function setContainerSort(val) {
  containerSortBy = val;
  renderCatalogo();
}

function setContainerView(mode) {
  containerViewMode = mode;
  renderCatalogo();
}

async function addToCurrentContainer(id) {
  if (!currentBoxView) return;
  const item = findInDb(id);
  if (!item) return;
  if (!currentBoxView.containerItems) currentBoxView.containerItems = [];
  if (currentBoxView.containerItems.some(cid => String(cid) === String(id))) {
    toast('⚠️ Item já está nesta coleção', '⚠️');
    return;
  }
  currentBoxView.containerItems.push(String(id));
  save();
  await saveItemToFirestore(currentBoxView);
  renderContainerHero();
  renderCatalogo();
  toast('✅ Item adicionado à coleção!', '✅');
}

async function removeFromCurrentContainer(id) {
  if (!currentBoxView || !currentBoxView.containerItems) return;
  const item = findInDb(id);
  if (!item) return;
  if (!confirm(`Remover "${item.title}" desta coleção?`)) return;
  currentBoxView.containerItems = currentBoxView.containerItems.filter(cid => String(cid) !== String(id));
  save();
  await saveItemToFirestore(currentBoxView);
  renderContainerHero();
  renderCatalogo();
  toast('🗑️ Item removido da coleção', '🗑️');
}

/* ── CONTAINER COVER CYCLING ── */
const _cycleTimers = new Map();

function startCoverCycle(card) {
  const cyclingEl = card.querySelector('.card-container-cycling');
  if (!cyclingEl) return;
  const covers = JSON.parse(cyclingEl.dataset.covers || '[]');
  if (!covers.length) return;
  const id = card.dataset.id || Math.random();
  let idx = 0;
  cyclingEl.innerHTML = `<img src="${esc(covers[0])}" alt="" style="width:100%;height:100%;object-fit:cover">`;
  cyclingEl.classList.add('active');
  _cycleTimers.set(id, setInterval(() => {
    idx = (idx + 1) % covers.length;
    cyclingEl.innerHTML = `<img src="${esc(covers[idx])}" alt="" style="width:100%;height:100%;object-fit:cover">`;
  }, 1200));
}

function stopCoverCycle(card) {
  const id = card.dataset.id || Math.random();
  const timer = _cycleTimers.get(id);
  if (timer) clearInterval(timer);
  _cycleTimers.delete(id);
  const cyclingEl = card.querySelector('.card-container-cycling');
  if (cyclingEl) {
    cyclingEl.classList.remove('active');
    cyclingEl.innerHTML = '';
  }
}

/* ── CONTAINER COVER POPOVER ── */
function toggleContainerCoverPopover(id) {
  const pop = document.getElementById('coverPopover-' + id);
  if (!pop) return;
  const open = pop.classList.contains('open');
  document.querySelectorAll('.card-container-cover-popover.open').forEach(el => el.classList.remove('open'));
  if (!open) {
    pop.classList.add('open');
    setTimeout(() => document.addEventListener('click', closeCoverPopoverOnOutside, true), 0);
  }
}

function closeContainerCoverPopover(id) {
  const pop = document.getElementById('coverPopover-' + id);
  if (pop) pop.classList.remove('open');
  document.removeEventListener('click', closeCoverPopoverOnOutside, true);
}

function closeCoverPopoverOnOutside(e) {
  if (!e.target.closest('.card-container-cover-popover.open') && !e.target.closest('.card-container-settings-btn')) {
    document.querySelectorAll('.card-container-cover-popover.open').forEach(el => el.classList.remove('open'));
    document.removeEventListener('click', closeCoverPopoverOnOutside, true);
  }
}

async function saveContainerCoverFromCard(id) {
  const item = findInDb(id);
  if (!item) return;
  const input = document.getElementById('coverInput-' + id);
  if (!input) return;
  item.cover = input.value.trim();
  if (!item.obra) item.obra = {};
  item.obra.cover = item.cover;
  item.containerCover = item.cover;
  save();
  localSaveGuard = true;
  await saveItemToFirestore(item);
  setTimeout(() => { localSaveGuard = false; }, 100);
  closeContainerCoverPopover(id);
  renderCatalogo();
  toast('🖼️ Capa atualizada!', '🖼️');
}

/* ── SMART FOLDERS (FILTROS SALVOS) ── */
function getSavedFilters() {
  try { return JSON.parse(localStorage.getItem('biblioteca_savedFilters')) || []; }
  catch { return []; }
}

function saveSavedFilters(filters) {
  localStorage.setItem('biblioteca_savedFilters', JSON.stringify(filters));
  renderSavedFilters();
}

function saveCurrentFilter() {
  if (!tipoFilter && !statusFilter) return;
  const name = prompt('Nome para este filtro inteligente:');
  if (!name) return;
  const filters = getSavedFilters();
  filters.push({ id: Date.now(), name, tipo: tipoFilter, status: statusFilter });
  saveSavedFilters(filters);
  toast('✅ Filtro salvo!', '✅');
}

function applySavedFilter(tipo, status) {
  clearAllFilters();
  if (tipo) {
    tipoFilter = tipo;
    const typeSel = document.getElementById('fbTypeSelect');
    if (typeSel) typeSel.value = tipo;
  }
  if (status) {
    statusFilter = status;
    const statusSel = document.getElementById('fbStatusSelect');
    if (statusSel) statusSel.value = status === 'fav' ? '' : status;
  }
  renderCatalogo();
}

function removeSavedFilter(id, e) {
  e.stopPropagation();
  let filters = getSavedFilters();
  filters = filters.filter(f => f.id !== id);
  saveSavedFilters(filters);
}

function renderSavedFilters() {
  const container = document.getElementById('savedFiltersContainer');
  if (!container) return;
  const filters = getSavedFilters();
  if (filters.length === 0) {
    container.innerHTML = '';
    return;
  }
  container.innerHTML = filters.map(f => `
    <span class="active-filter-tag" style="background:var(--surface2);cursor:pointer;border-style:dashed;" onclick="applySavedFilter('${esc(f.tipo)}', '${esc(f.status)}')">
      📁 ${esc(f.name)}
      <span class="remove" onclick="removeSavedFilter(${f.id}, event)">✕</span>
    </span>
  `).join('');
}
