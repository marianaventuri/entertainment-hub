/* ── Smart Form Modal (Add / Edit / Box / Coleção / Wish / Batch) ── */

let smartFormMode = '';
let smartFormItemId = null;
let smartFormBatchIds = [];
let smartFormWishData = {};

function renderSmartFormBody(mode, options = {}) {
  const labels = {
    add: 'Nova obra',
    edit: 'Editar obra',
    box: 'Criar Box',
    colecao: 'Criar Coleção',
    wish: 'Adicionar à lista de desejos',
    batch: 'Edição em lote'
  };
  const title = labels[mode] || 'Nova obra';

  if (mode === 'box' || mode === 'colecao') {
    const isBox = mode === 'box';
    const count = containerSelectedIds.size;
    return `
      <div class="modal-title">${title}</div>
      <div class="modal-subtitle" style="font-size:0.82rem;color:var(--text3);margin:-8px 0 16px">${count} item(ns) selecionado(s)</div>
      <div class="form-grid" style="grid-template-columns:1fr">
        <div class="form-field">
          <label class="form-label">Nome <span class="field-required">*</span></label>
          <input class="form-input" id="b-name" placeholder="Ex: Box Harry Potter 1-3" oninput="updateBoxColecaoPreview()"/>
          <div class="field-error" id="b-name-error"></div>
        </div>
        <div class="form-field">
          <label class="form-label">URL da capa</label>
          <input class="form-input" id="b-cover" placeholder="Automática ou personalizada" oninput="updateBoxColecaoPreview()"/>
          <div class="cover-preview" id="b-cover-preview" style="margin-top:6px"></div>
        </div>
        <div class="form-field">
          <label class="form-label">Descrição</label>
          <textarea class="form-textarea" id="b-desc" rows="3" placeholder="Opcional"></textarea>
        </div>
      </div>
      <div class="box-preview" id="boxPreview">
        <div class="box-preview-cover" id="boxPreviewCover">${isBox ? '📦' : '📚'}</div>
        <div class="box-preview-info">
          <div class="box-preview-title" id="boxPreviewTitle">Nova coleção</div>
          <div class="box-preview-count" id="boxPreviewCount">${count} item(ns)</div>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeSmartFormModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnConfirmBoxCreate" onclick="handleSmartFormSubmit()">${isBox ? 'Criar Box' : 'Criar Coleção'}</button>
      </div>`;
  }

  if (mode === 'wish') {
    return `
      <div class="modal-title">${title}</div>
      <div class="form-grid" style="grid-template-columns:1fr">
        <div class="form-field">
          <label class="form-label">Título <span class="field-required">*</span></label>
          <input class="form-input" id="w-title" placeholder="Nome da obra…"/>
          <div class="field-error" id="w-title-error"></div>
        </div>
        <div class="form-field">
          <label class="form-label">Tipo</label>
          <select class="form-select" id="w-type">
            <option>Filme</option><option>Série</option><option>Anime</option>
            <option>Mangá</option><option>Dorama</option><option>Jogo</option><option>Livro</option><option>Box</option><option>Coleção</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">Nota / motivo</label>
          <input class="form-input" id="w-note" placeholder="Recomendação de alguém, trailer incrível…"/>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeSmartFormModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="handleSmartFormSubmit()">Adicionar</button>
      </div>`;
  }

  if (mode === 'batch') {
    const count = smartFormBatchIds.length;
    return `
      <div class="modal-title">Editar ${count} obra(ns)</div>
      <div class="modal-subtitle" style="font-size:0.82rem;color:var(--text3);margin:-8px 0 16px">Altere apenas os campos desejados — os demais permanecem intactos.</div>
      <div class="form-grid" style="grid-template-columns:1fr 1fr">
        <div class="form-field">
          <label class="form-label">Status (novo)</label>
          <select class="form-select" id="batch-status">
            <option value="">— Manter atual —</option>
            <option>Quero assistir</option>
            <option>Assistindo</option>
            <option>Finalizado</option>
            <option>Abandonado</option>
          </select>
        </div>
        <div class="form-field">
          <label class="form-label">Nota (1-5)</label>
          <select class="form-select" id="batch-rating">
            <option value="">— Manter atual —</option>
            <option value="1">1 ★</option>
            <option value="2">2 ★★</option>
            <option value="3">3 ★★★</option>
            <option value="4">4 ★★★★</option>
            <option value="5">5 ★★★★★</option>
          </select>
        </div>
        <div class="form-field full">
          <label class="form-label">Gêneros</label>
          <input class="form-input" id="batch-genres" placeholder="Substitui os gêneros atuais (separados por vírgula)"/>
        </div>
        <div class="form-field full">
          <label class="form-label">Tags (adicionar)</label>
          <div class="tags-wrap" id="batchTagsWrap"></div>
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeSmartFormModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="handleSmartFormSubmit()">Aplicar a ${count} obra(ns)</button>
      </div>`;
  }

  return `
    <div class="editor-topbar" id="editorTopbar">
      <div class="editor-topbar-title-wrap">
        <input class="form-input" id="f-title" placeholder="Título da obra…" autocomplete="off"
          oninput="clearApiStatus();editorAutoSave();debouncedSearchAc()"/>
        <div class="field-error" id="f-title-error"></div>
        <div id="searchAcContainer"></div>
      </div>
      <div class="editor-topbar-actions">
        <button type="button" class="btn-icon" id="btnBuscarOnline" onclick="buscarOnline()"
          title="Buscar dados automaticamente" aria-label="Buscar dados"><span class="material-symbols-rounded">search</span></button>
        <button type="button" class="btn-icon" id="favBtn" onclick="toggleFav()"
          title="Favorito" aria-label="Favorito"><span class="material-symbols-rounded" id="favIcon">favorite_border</span></button>
        <button class="editor-topbar-save" id="editorSaveBtn" onclick="handleSmartFormSubmit()">
          <span id="editorSaveLabel">Salvar</span>
        </button>
        <span class="editor-save-status" id="editorSaveStatus"></span>
      </div>
    </div>

    <div class="editor-sections" id="editorSections">

      <!-- 1. Informações principais -->
      <div class="editor-section">
        <div class="editor-section-header open" onclick="toggleEditorSection(this)">
          <span class="editor-section-title"><span class="material-symbols-rounded" style="font-size:1.1rem">info</span> Informações principais</span>
          <span class="material-symbols-rounded mat-sym">expand_more</span>
        </div>
        <div class="editor-section-body" id="secMainInfo">
          <div class="form-field">
            <label class="form-label">Tipo</label>
            <select class="form-select" id="f-type" onchange="updateFormFields();editorAutoSave()">
              <option>Filme</option><option>Série</option><option>Anime</option>
              <option>Mangá</option><option>Dorama</option><option>Jogo</option><option>Livro</option>
              <option>Box</option><option>Coleção</option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Status</label>
            <select class="form-select" id="f-status" onchange="editorAutoSave()"></select>
          </div>
          <div class="form-field">
            <label class="form-label">Ano</label>
            <input class="form-input" id="f-year" type="number" placeholder="2024" oninput="editorAutoSave()"/>
            <div class="field-error" id="f-year-error"></div>
          </div>
          <div class="form-field ff-meta" data-types="Filme">
            <label class="form-label">Diretor(a)</label>
            <input class="form-input" id="f-director" placeholder="Opcional" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-meta" data-types="Série,Dorama">
            <label class="form-label">Criador(a)</label>
            <input class="form-input" id="f-creator" placeholder="Opcional" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-meta" data-types="Anime">
            <label class="form-label">Estúdio</label>
            <input class="form-input" id="f-studio" placeholder="Opcional" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-meta" data-types="Livro,Mangá">
            <label class="form-label">Autor(a)</label>
            <input class="form-input" id="f-author" placeholder="Opcional" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-meta" data-types="Jogo">
            <label class="form-label">Desenvolvedora</label>
            <input class="form-input" id="f-developer" placeholder="Opcional" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-meta" data-types="Jogo">
            <label class="form-label">Publicadora</label>
            <input class="form-input" id="f-publisher" placeholder="Opcional" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-consumo" data-types="Filme,Série,Anime,Dorama">
            <label class="form-label">Onde assisti</label>
            <input class="form-input" id="f-platform" placeholder="Netflix, Crunchyroll…" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-consumo" data-types="Jogo">
            <label class="form-label">Plataforma</label>
            <input class="form-input" id="f-platform" placeholder="Steam, PlayStation…" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-leitura" data-types="Livro,Mangá">
            <label class="form-label">Onde leio</label>
            <input class="form-input" id="f-platform" placeholder="MangaPlus, TMO Browser…" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-leitura" data-types="Livro,Mangá">
            <label class="form-label">Link</label>
            <input class="form-input" id="f-read-url" type="url" placeholder="https://..." oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-consumo" data-types="Filme,Anime,Série,Dorama">
            <label class="form-label">Duração (min)</label>
            <input class="form-input" id="f-duration-minutes" type="number" min="1" placeholder="150" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-consumo" data-types="Filme" style="justify-content:flex-end">
            <label class="cinema-check-label"><input type="checkbox" id="f-cinema-watched" onchange="editorAutoSave()"/> Vi no cinema</label>
          </div>
          <div class="form-field full">
            <label class="form-label">Gêneros</label>
            <input class="form-input" id="f-genres" placeholder="Fantasia, Aventura, Drama" oninput="editorAutoSave()"/>
          </div>
        </div>
      </div>

      <!-- 2. Progresso -->
      <div class="editor-section">
        <div class="editor-section-header" onclick="toggleEditorSection(this)">
          <span class="editor-section-title"><span class="material-symbols-rounded" style="font-size:1.1rem">trending_up</span> Progresso</span>
          <span class="material-symbols-rounded mat-sym">expand_more</span>
        </div>
        <div class="editor-section-body hidden" id="secProgress">
          <div id="f-progress-fields"></div>
          <div class="form-field ff-leitura" data-types="Livro,Mangá">
            <label class="form-label">Volume</label>
            <input class="form-input" id="f-volume" type="number" min="1" placeholder="1" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-leitura" data-types="Livro,Mangá">
            <label class="form-label">Total de volumes</label>
            <input class="form-input" id="f-total-volumes" type="number" min="1" placeholder="5" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-leitura" data-types="Livro,Mangá">
            <label class="form-label">Coleção</label>
            <input class="form-input" id="f-collection" placeholder="Ex: Harry Potter" oninput="editorAutoSave()"/>
          </div>
          <div class="form-field ff-leitura" data-types="Livro,Mangá">
            <label class="form-label">Páginas</label>
            <input class="form-input" id="f-pages" type="number" min="1" placeholder="350" oninput="editorAutoSave()"/>
          </div>
        </div>
      </div>

      <!-- 3. Avaliação -->
      <div class="editor-section">
        <div class="editor-section-header" onclick="toggleEditorSection(this)">
          <span class="editor-section-title"><span class="material-symbols-rounded" style="font-size:1.1rem">star</span> Avaliação</span>
          <span class="material-symbols-rounded mat-sym">expand_more</span>
        </div>
        <div class="editor-section-body hidden" id="secRating">
          <div class="form-field full">
            <label class="form-label">Nota geral</label>
            <div class="star-input" id="starInput" data-val="0">
              <button class="star-btn" data-star="1" onclick="setStar(1);editorAutoSave()">★</button>
              <button class="star-btn" data-star="2" onclick="setStar(2);editorAutoSave()">★</button>
              <button class="star-btn" data-star="3" onclick="setStar(3);editorAutoSave()">★</button>
              <button class="star-btn" data-star="4" onclick="setStar(4);editorAutoSave()">★</button>
              <button class="star-btn" data-star="5" onclick="setStar(5);editorAutoSave()">★</button>
            </div>
          </div>
          <div class="form-field full">
            <label class="emotion-toggle-label">
              <input type="checkbox" id="f-emotion-toggle" onchange="toggleEmotionSection()"/>
              <span>Nota emocional detalhada</span>
            </label>
          </div>
          <div id="emotionSection" style="display:none" class="full">
            <div class="emotion-grid" id="emotionGrid"></div>
          </div>
        </div>
      </div>

      <!-- 4. Coleções -->
      <div class="editor-section">
        <div class="editor-section-header" onclick="toggleEditorSection(this)">
          <span class="editor-section-title"><span class="material-symbols-rounded" style="font-size:1.1rem">collections_bookmark</span> Coleções</span>
          <span class="material-symbols-rounded mat-sym">expand_more</span>
        </div>
        <div class="editor-section-body hidden full" id="secCollections">
          <div class="form-field full">
            <label class="form-label">Box / Coleção</label>
            <select class="form-select" id="f-container-select" onchange="editorAutoSave()">
              <option value="">Nenhuma</option>
            </select>
            <div style="font-size:var(--font-xs);color:var(--text3);margin-top:4px">Associe esta obra a uma Box ou Coleção existente.</div>
          </div>
        </div>
      </div>

      <!-- 5. Tags -->
      <div class="editor-section">
        <div class="editor-section-header" onclick="toggleEditorSection(this)">
          <span class="editor-section-title"><span class="material-symbols-rounded" style="font-size:1.1rem">label</span> Tags</span>
          <span class="material-symbols-rounded mat-sym">expand_more</span>
        </div>
        <div class="editor-section-body hidden full" id="secTags">
          <div class="tag-group-wrap" id="tagGroupWrap"></div>
        </div>
      </div>

      <!-- 6. Informações adicionais -->
      <div class="editor-section">
        <div class="editor-section-header" onclick="toggleEditorSection(this)">
          <span class="editor-section-title"><span class="material-symbols-rounded" style="font-size:1.1rem">more_horiz</span> Informações adicionais</span>
          <span class="material-symbols-rounded mat-sym">expand_more</span>
        </div>
        <div class="editor-section-body hidden" id="secAdicional">
          <div class="form-field full">
            <label class="form-label">Sinopse</label>
            <textarea class="form-textarea" id="f-synopsis" placeholder="Breve descrição da obra…" oninput="editorAutoSave()"></textarea>
            <button type="button" class="btn btn-ghost btn-sm" onclick="translateSynopsis()" style="margin-top:6px;font-size:0.78rem">Traduzir para português</button>
          </div>
          <div class="form-field full">
            <label class="form-label">Minha opinião / diário</label>
            <textarea class="form-textarea" id="f-opinion" placeholder="O que você achou?" oninput="editorAutoSave()"></textarea>
          </div>
          <div class="form-field full">
            <label class="form-label">Capa</label>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <button type="button" class="btn btn-ghost" onclick="toggleCoverUrlInput()" style="padding:7px 14px;font-size:0.83rem;white-space:nowrap">URL da capa</button>
              <button type="button" class="btn btn-ghost" onclick="document.getElementById('f-cover-file').click()" style="padding:7px 10px;font-size:0.78rem" title="Upload">📁</button>
              <input type="text" id="f-cover" style="display:none;flex:1;min-width:180px" placeholder="https://..." oninput="previewCover();editorAutoSave()"/>
              <input type="file" id="f-cover-file" accept="image/*" style="display:none" onchange="handleCoverFile(event)"/>
              <span id="f-cover-name" style="font-size:0.82rem;color:var(--text3);flex-shrink:0"></span>
              <div class="field-error" id="f-cover-error"></div>
              <div class="cover-preview" id="coverPreview" style="width:44px;height:62px;border-radius:6px;overflow:hidden;flex-shrink:0;margin-left:auto;background:var(--bg2);display:block;font-size:1.5rem;line-height:62px;text-align:center"></div>
            </div>
          </div>

          <input type="hidden" id="f-tmdb-id"/>
          <input type="hidden" id="f-anilist-id"/>
          <input type="hidden" id="f-rawg-id"/>

          <div class="form-field full hidden" id="f-olid-field">
            <label class="form-label">Código OpenLibrary (OLID / ISBN)</label>
            <div style="display:flex;gap:8px">
              <input class="form-input" id="f-olid" placeholder="OL12345W ou 9781234567890" style="flex:1"/>
              <button type="button" class="btn btn-ghost" onclick="fetchBookByCode()" style="white-space:nowrap">Buscar</button>
            </div>
            <div class="field-error" id="f-olid-error"></div>
          </div>
        </div>
      </div>

      <div class="form-actions" style="display:flex;justify-content:space-between;padding:0">
        <div>
          ${mode === 'edit' ? `<button class="btn btn-danger" onclick="deleteItemFromEdit(smartFormItemId)">Excluir</button>` : ''}
        </div>
        <div style="display:flex;gap:var(--space-1)">
          <button class="btn btn-ghost" onclick="closeSmartFormModal()">Cancelar</button>
        </div>
      </div>
    </div>`;
}

function openSmartFormModal(mode, options = {}) {
  document.getElementById('detailOverlay').classList.remove('open');
  smartFormMode = mode;
  smartFormItemId = options.itemId || null;
  smartFormBatchIds = options.batchIds || [];
  editingId = smartFormItemId;
  favEdit = false;

  const body = document.getElementById('smartFormBody');
  body.innerHTML = renderSmartFormBody(mode, options);
  document.getElementById('smartFormOverlay').classList.add('open');

  if (mode === 'add' || mode === 'edit') {
    buildEmotionGrid();
    buildTagGroups();
    updateFormFields();
    updateProgressFields();
    buildContainerSelect();
    if (mode === 'edit' && smartFormItemId) {
      fillEditForm(smartFormItemId);
      setTimeout(() => {
        const titleEl = document.getElementById('addModalTitle');
        if (titleEl) titleEl.textContent = 'Editar obra';
      }, 0);
    }
    setupSearchAc();
  }
  if (mode === 'batch') {
    document.getElementById('batchTagsWrap').innerHTML = ALL_TAGS.map(tg =>
      `<button class="tag-toggle" onclick="this.classList.toggle('active')">${tg}</button>`
    ).join('');
  }
  setTimeout(() => {
    const fi = body.querySelector('input, select, textarea');
    if (fi) fi.focus();
    
    if (mode === 'add' && !localStorage.getItem('biblioteca_onboarding')) {
      const tooltip = document.createElement('div');
      tooltip.className = 'onboarding-tooltip';
      tooltip.innerHTML = '✨ Digite o título aqui que a gente preenche o resto para você!';
      if (fi) {
        fi.parentNode.appendChild(tooltip);
      }
      localStorage.setItem('biblioteca_onboarding', 'true');
      setTimeout(() => { if (tooltip.parentNode) tooltip.classList.add('fade-out'); }, 5000);
      setTimeout(() => { if (tooltip.parentNode) tooltip.remove(); }, 5500);
    }
  }, 100);
}

function closeSmartFormModal(e) {
  if (e && e.target !== document.getElementById('smartFormOverlay')) return;
  clearTimeout(editorSaveTimer);
  editorDirty = false;
  const isInlineEdit = document.getElementById('detailOverlay').classList.contains('open');
  if (isInlineEdit && smartFormItemId) {
    const id = smartFormItemId;
    editingId = null;
    smartFormItemId = null;
    smartFormBatchIds = [];
    smartFormMode = '';
    openDetail(id);
    return;
  }
  document.getElementById('smartFormOverlay').classList.remove('open');
  editingId = null;
  smartFormItemId = null;
  smartFormBatchIds = [];
  smartFormMode = '';
}

function toggleCoverUrlInput() {
  const el = document.getElementById('f-cover');
  if (!el) return;
  if (el.style.display === 'none') {
    el.style.display = '';
    el.focus();
  } else {
    el.style.display = 'none';
  }
}

function previewCover() {
  const url = document.getElementById('f-cover').value.trim();
  const container = document.getElementById('coverPreview');
  if (!container) return;
  if (!url) { container.innerHTML = ''; return; }
  container.innerHTML = `<img src="${esc(url)}" alt="preview" style="width:100%;height:100%;object-fit:cover;border-radius:6px" onerror="this.parentNode.innerHTML='<span style=color:var(--text3);font-size:0.7rem>⚠️</span>'">`;
}

function handleCoverFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    document.getElementById('f-cover').value = dataUrl;
    previewCover();
    const cnEl = document.getElementById('f-cover-name');
    if (cnEl) cnEl.textContent = file.name;
  };
  reader.readAsDataURL(file);
}

function fillEditForm(id) {
  try {
  const item = findInDb(id);
  if (!item) { console.warn('fillEditForm: item not found', id); return; }
  document.getElementById('f-title').value  = item.obra.title||'';
  document.getElementById('f-type').value   = item.type||'Filme';
  updateFormFields();
  updateProgressFields();
  document.getElementById('f-status').value = item.status||'Quero assistir';
  document.getElementById('f-year').value   = item.obra.year||'';
  document.getElementById('f-genres').value = item.obra.genres||'';
  document.getElementById('f-synopsis').value = item.obra.synopsis||'';
  document.getElementById('f-opinion').value  = item.obra.opinion||'';
  const coverUrl = item.obra.cover||'';
  document.getElementById('f-cover').value = coverUrl;
  if (coverUrl) {
    document.getElementById('f-cover').style.display = '';
    previewCover();
  }
  const cnEl = document.getElementById('f-cover-name');
  if (cnEl && item.obra.cover) cnEl.textContent = 'Capa definida';

  // Metadados
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val||''; };
  set('f-director',   item.metadata?.director || item.author);
  set('f-creator',    item.metadata?.creator || item.author);
  set('f-studio',     item.metadata?.studio || item.author);
  set('f-author',     item.metadata?.author || item.author);
  set('f-developer',  item.metadata?.developer || item.author);
  set('f-publisher',  item.metadata?.publisher);

  // Consumo
  set('f-platform',        item.consumption?.platform);
  set('f-read-url',        item.consumption?.readUrl);
  set('f-duration-minutes', item.consumption?.durationMinutes);
  const cwEl = document.getElementById('f-cinema-watched');
  if (cwEl) cwEl.checked = !!item.consumption?.cinemaWatched;

  // IDs Externos
  set('f-tmdb-id',    item.externalIds?.tmdbId);
  set('f-anilist-id', item.externalIds?.anilistId);
  set('f-rawg-id',    item.externalIds?.rawgId);
 
  // Progresso
  set('f-season',         item.progress?.season);
  set('f-current-ep',     item.progress?.currentEp);
  set('f-episodes',       item.progress?.episodes);
  set('f-pages',          item.progress?.pages);
  set('f-current-ch',     item.progress?.currentChapter);
  set('f-chapters-total', item.progress?.chaptersTotal);
  set('f-volume',         item.progress?.volume);
  set('f-total-volumes',  item.progress?.totalVolumes);
  set('f-collection',     item.progress?.collection);
  set('f-hours-played',   item.progress?.hoursPlayed);

  setStar(item.rating||0);

  // Nota emocional: mostrar seção se há dados
  const hasEmotions = item.emotions && Object.values(item.emotions).some(v => v > 0);
  if (hasEmotions) {
    const toggle = document.getElementById('f-emotion-toggle');
    if (toggle) { toggle.checked = true; toggleEmotionSection(); }
    EMOTIONS.forEach(e => {
      const v = item.emotions[e.key]||0;
      setEmotion(e.key, v, false);
    });
  }

  const allTags = [...(item.tags || []), ...(item.negTags || [])];
  document.querySelectorAll('#tagGroupWrap .tag-toggle').forEach(b => {
    if (allTags.includes(b.dataset.tag)) b.classList.add('active');
  });

  favEdit = !!item.fav;
  const favIcon = document.getElementById('favIcon');
  if (favIcon) favIcon.textContent = favEdit ? 'favorite' : 'favorite_border';
  } catch(e) { console.error('fillEditForm error', e); toast('Erro ao carregar dados: ' + e.message); }
}

function validateForm() {
  let valid = true;
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');

  const title = document.getElementById('f-title');
  if (title && !title.value.trim()) {
    showError('f-title-error', 'O título é obrigatório.');
    title.focus();
    valid = false;
  }

  const year = document.getElementById('f-year');
  if (year && year.value) {
    const y = parseInt(year.value);
    if (isNaN(y) || y < 1 || y > 9999) {
      showError('f-year-error', 'Ano inválido.');
      if (valid) year.focus();
      valid = false;
    }
  }

  const cover = document.getElementById('f-cover');
  const cv = cover && cover.value.trim().toLowerCase();
  if (cv && !cv.startsWith('http://') && !cv.startsWith('https://') && !cv.startsWith('data:')) {
    showError('f-cover-error', 'URL inválida. Deve começar com http:// ou https://');
    valid = false;
  }

  return valid;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function validateWishForm() {
  document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
  const title = document.getElementById('w-title');
  if (!title.value.trim()) {
    showError('w-title-error', 'O título é obrigatório.');
    title.focus();
    return false;
  }
  return true;
}

function updateBoxColecaoPreview() {
  const name = document.getElementById('b-name').value.trim() || 'Nova coleção';
  const cover = document.getElementById('b-cover').value.trim();
  const count = containerSelectedIds.size;
  const pName = document.getElementById('boxPreviewTitle');
  const pCount = document.getElementById('boxPreviewCount');
  if (pName) pName.textContent = name;
  if (pCount) pCount.textContent = count + ' item(ns)';

  const ce = document.getElementById('boxPreviewCover');
  if (!ce) return;
  if (cover) {
    ce.innerHTML = `<img src="${esc(cover)}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px" onerror="this.parentNode.innerHTML=this.parentNode.dataset.fallback">`;
    ce.dataset.fallback = smartFormMode === 'box' ? '📦' : '📚';
  } else {
    ce.innerHTML = smartFormMode === 'box' ? '📦' : '📚';
  }
}

async function handleSmartFormSubmit() {
  clearTimeout(editorSaveTimer);
  editorDirty = false;
  if (smartFormMode === 'add' || smartFormMode === 'edit') {
    if (!validateForm()) return;
    await saveItem(false);
    return;
  }

  if (smartFormMode === 'box' || smartFormMode === 'colecao') {
    const name = document.getElementById('b-name').value.trim();
    if (!name) {
      showError('b-name-error', 'O nome é obrigatório.');
      document.getElementById('b-name').focus();
      return;
    }
    await confirmCreateBoxColecao();
    return;
  }

  if (smartFormMode === 'wish') {
    if (!validateWishForm()) return;
    saveWish();
    return;
  }

  if (smartFormMode === 'batch') {
    await applyBatchEdit();
    return;
  }
}

/* ── Save Item (Add / Edit) ── */

async function saveItem(isSilent = false) {
  const title = document.getElementById('f-title').value.trim();
  if (!title) return;

  const emotions = {};
  EMOTIONS.forEach(e => {
    const stars = document.querySelectorAll(`#em-${e.key} .emotion-star.active`);
    const v = stars.length > 0 ? stars[stars.length - 1] : null;
    emotions[e.key] = v ? parseInt(v.dataset.val) : 0;
  });

  const allActiveTags = [...document.querySelectorAll('#tagGroupWrap .tag-toggle.active')].map(b => b.dataset.tag || b.textContent.trim());
  const negSet = new Set(NEGATIVE_TAGS);
  const tags = allActiveTags.filter(t => !negSet.has(t));
  const negTags = allActiveTags.filter(t => negSet.has(t));
  const rating = parseInt(document.getElementById('starInput').dataset.val) || 0;

  const g = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const gb = id => { const el = document.getElementById(id); return el ? el.checked : false; };

  const item = {
    id:       editingId || String(Date.now() + Math.random()),
    type:     g('f-type'),
    status:   g('f-status'),
    addedAt:  editingId ? (findInDb(editingId)||{}).addedAt || new Date().toISOString() : new Date().toISOString(),
    finishedAt: (g('f-status')==='Finalizado')
      ? (editingId ? (findInDb(editingId)||{}).finishedAt || new Date().toISOString() : new Date().toISOString())
      : null,

    obra: {
      title, cover: g('f-cover').trim(), year: g('f-year'),
      genres: g('f-genres').trim(), synopsis: g('f-synopsis').trim(),
      opinion: g('f-opinion').trim(), rating, emotions, tags,
      negTags, fav: favEdit
    },

    metadata: {
      director:  g('f-director').trim(),
      creator:   g('f-creator').trim(),
      studio:    g('f-studio').trim(),
      author:    g('f-author').trim(),
      developer: g('f-developer').trim(),
      publisher: g('f-publisher').trim()
    },

    progress: {
      season:         g('f-season'),
      currentEp:      g('f-current-ep'),
      episodes:       g('f-episodes'),
      currentChapter: g('f-current-ch'),
      chaptersTotal:  g('f-chapters-total'),
      volume:         g('f-volume'),
      totalVolumes:   g('f-total-volumes'),
      collection:     g('f-collection').trim(),
      pages:          g('f-pages'),
      hoursPlayed:    g('f-hours-played')
    },

    consumption: {
      platform:        g('f-platform').trim(),
      readUrl:         g('f-read-url').trim(),
      cinemaWatched:   gb('f-cinema-watched'),
      durationMinutes: g('f-duration-minutes')
    },

    externalIds: {
      tmdbId:    g('f-tmdb-id'),
      anilistId: g('f-anilist-id'),
      rawgId:    g('f-rawg-id')
    }
  };
  if (!item.addedAt) item.addedAt = new Date().toISOString()

  if (editingId) {
    const idx = findIdxInDb(editingId);
    if (idx>=0) db[idx]=item;
  } else {
    db.unshift(item);
    editingId = item.id;
  }

  save();
  localSaveGuard = true;
  const saved = await saveItemToFirestore(item);
  setTimeout(() => { localSaveGuard = false; }, 100);

  if (!isSilent) {
    closeSmartFormModal();
    renderCatalogo();
    if (saved) {
      toast(editingId ? '✏️ Obra atualizada!' : '🎉 Obra adicionada!');
    } else {
      revertGuard = true;
      setTimeout(() => { revertGuard = false; }, 3000);
      toast('⚠️ Salvo localmente, mas erro no servidor.', '⚠️');
    }
    checkAchievements();
    editingId = null;
  }
}

/* ── Box / Coleção creation ── */

async function confirmCreateBoxColecao() {
  const name = document.getElementById('b-name').value.trim();
  if (!name) return;
  const isBox = smartFormMode === 'box';

  const item = {
    id:       String(Date.now() + Math.random()),
    type:     isBox ? 'Box' : 'Coleção',
    status:   'Assistindo',
    addedAt:   new Date().toISOString(),
    finishedAt: null,
    containerItems: [...containerSelectedIds].map(String),
    containerDesc: document.getElementById('b-desc').value.trim(),
    obra: {
      title: name, cover: document.getElementById('b-cover').value.trim() || '',
      year: '', genres: '', synopsis: '', opinion: '',
      rating: 0, emotions: {}, tags: [], negTags: [], fav: false
    },
    metadata: {},
    progress: {},
    consumption: {},
    externalIds: {}
  };
  db.push(item);
  save();
  saveItemToFirestore(item);

  if (isBox) toggleBoxMode(); else toggleColecaoMode();
  closeSmartFormModal();
  renderCatalogo();
  checkAchievements();
  toast(`✅ ${isBox ? 'Box' : 'Coleção'} criado!`, isBox ? '📦' : '📚');
}

/* ── Batch Edit ── */

async function applyBatchEdit() {
  const newStatus = document.getElementById('batch-status').value;
  const newRating = document.getElementById('batch-rating').value;
  const newGenres = document.getElementById('batch-genres').value.trim();
  const newTags = [...document.querySelectorAll('#batchTagsWrap .tag-toggle.active')].map(b => b.textContent.trim());

  if (!newStatus && !newRating && !newGenres && !newTags.length) {
    toast('Nenhuma alteração selecionada.', '⚠️');
    return;
  }

  const ids = smartFormBatchIds;
  let changed = 0;
  ids.forEach(id => {
    const item = findInDb(id);
    if (!item) return;
    if (newStatus) item.status = newStatus;
    if (newRating) item.rating = parseInt(newRating);
    if (newGenres) item.genres = newGenres;
    if (newTags.length) {
      item.tags = [...new Set([...(item.tags||[]), ...newTags])];
    }
    const idx = findIdxInDb(id);
    if (idx >= 0) db[idx] = item;
    changed++;
  });

  save();
  localSaveGuard = true;
  await Promise.all(ids.map(id => saveItemToFirestore(findInDb(id))));
  setTimeout(() => { localSaveGuard = false; }, 100);

  closeSmartFormModal();
  toast(`✅ ${changed} obra(ns) atualizada(s) em lote!`);
  renderCatalogo();
}

/* ── Wishlist ── */

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
  closeSmartFormModal();
  renderWishlist();
  toast('Adicionado à lista de desejos', '❤️');
}

function toggleWish(id) {
  const w = wishdb.find(x => x.id === id);
  if (w) w.done = !w.done;
  save();
  renderWishlist();
}

function removeWish(id) {
  wishdb = wishdb.filter(x => x.id !== id);
  save();
  renderWishlist();
}

function renderWishlist() {
  const list  = document.getElementById('wishList');
  const empty = document.getElementById('wishEmpty');
  if (!wishdb.length) { list.innerHTML=''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  list.innerHTML = wishdb.map(w =>
    `<div class="wish-item ${w.done?'done':''}">
      <div class="wish-check ${w.done?'checked':''}" onclick="toggleWish(${w.id})">${w.done?'✓':''}</div>
      <span class="wish-type-icon"><span class="material-symbols-rounded">${esc(typeIcon(w.type))}</span></span>
      <div style="flex:1;min-width:0">
        <div class="wish-title">${esc(w.title)}</div>
        ${w.note?`<div class="wish-sub">${esc(w.note)}</div>`:''}
      </div>
      <button class="wish-remove" onclick="removeWish(${w.id})">✕</button>
    </div>`
  ).join('');
}

/* ── Emotion Grid & Tags ── */

function buildEmotionGrid() {
  document.getElementById('emotionGrid').innerHTML = EMOTIONS.map(e =>
    `<div class="emotion-item" id="em-${e.key}">
      <div class="emotion-label">${e.label}</div>
      <div class="emotion-stars">${[1,2,3,4,5].map(v =>
        `<button class="emotion-star" data-val="${v}" onclick="setEmotion('${e.key}',${v})">★</button>`
      ).join('')}</div>
    </div>`
  ).join('');
}

function toggleEmotionSection() {
  const checked = document.getElementById('f-emotion-toggle')?.checked;
  const section = document.getElementById('emotionSection');
  if (section) section.style.display = checked ? '' : 'none';
}

function buildTagGroups() {
  const wrap = document.getElementById('tagGroupWrap');
  if (!wrap) return;
  wrap.innerHTML = Object.entries(TAG_GROUPS).map(([groupName, tags]) => {
    const cls = groupName === 'Negativas' ? ' tag-group-btn--neg' : '';
    return `<div class="tag-group-row">
      <button class="tag-group-btn${cls}" onclick="toggleTagGroup(this)" data-group="${esc(groupName)}">
        <span class="material-symbols-rounded" style="font-size:1rem">add</span> ${groupName}
        <span class="tag-count">${tags.length}</span>
      </button>
      <div class="tag-group-popover" id="tagPopover-${esc(groupName)}">
        ${tags.map(tg => {
          const neg = groupName === 'Negativas' ? ' tag-toggle--neg' : '';
          return `<button class="tag-toggle${neg}" data-tag="${esc(tg)}" onclick="toggleTag(this)">${esc(tg)}</button>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

function toggleTagGroup(btn) {
  const group = btn.dataset.group;
  const popover = document.getElementById('tagPopover-' + group);
  if (popover) popover.classList.toggle('open');
}


/* ── Editor helpers ── */

function toggleEditorSection(header) {
  const body = header.nextElementSibling;
  if (!body) return;
  body.classList.toggle('hidden');
  header.classList.toggle('open');
}

let editorSaveTimer = null;
let editorDirty = false;

function editorAutoSave() {
  if (smartFormMode !== 'add' && smartFormMode !== 'edit') return;
  editorDirty = true;
  const status = document.getElementById('editorSaveStatus');
  if (status) status.textContent = 'Salvando…';
  clearTimeout(editorSaveTimer);
  editorSaveTimer = setTimeout(() => doEditorSave(), 1200);
}

async function doEditorSave() {
  if (!editorDirty) return;
  if (!validateForm()) { editorDirty = false; return; }
  const status = document.getElementById('editorSaveStatus');
  try {
    await saveItem(true);
    if (status) status.textContent = 'Salvo.';
  } catch(e) {
    if (status) status.textContent = 'Erro ao salvar';
    console.error('auto-save error', e);
  }
  editorDirty = false;
}

const debouncedSearchAc = debounce(function() {
  const q = document.getElementById('f-title')?.value.trim() || '';
  const container = document.getElementById('searchAcContainer');
  if (!container) return;
  if (q.length < 2) { container.innerHTML = ''; return; }
  buscarOnline(true).then(results => {
    if (!results || !results.length) { container.innerHTML = ''; return; }
    container.innerHTML = `<div class="search-ac-results">
      ${results.slice(0, 6).map((r, i) => `<div class="search-ac-item" onclick="applySearchAcResult(${i})" data-idx="${i}">
        ${r.cover ? `<img src="${esc(r.cover)}" alt="" loading="lazy">` : '<div style="width:36px;height:54px;background:var(--surface2);border-radius:4px;flex-shrink:0"></div>'}
        <div class="ac-info">
          <div class="ac-title">${esc(r.title || r.titulo || '')}</div>
          <div class="ac-meta">${r.year || ''}${r.genres ? ' · ' + esc(r.genres.split(',').slice(0, 2).join(', ')) : ''}</div>
        </div>
      </div>`).join('')}
    </div>`;
    window._acResults = results;
  }).catch(() => {});
}, 400);

function setupSearchAc() {
  const title = document.getElementById('f-title');
  if (!title) return;
  title.addEventListener('blur', () => setTimeout(() => {
    const c = document.getElementById('searchAcContainer');
    if (c) c.innerHTML = '';
  }, 200));
}

let _acResults = [];
function applySearchAcResult(idx) {
  const results = window._acResults || [];
  const r = results[idx];
  if (!r) return;
  document.getElementById('searchAcContainer').innerHTML = '';
  applyApiResult(r, true);
}

function buildContainerSelect() {
  const sel = document.getElementById('f-container-select');
  if (!sel) return;
  const containers = db.filter(x => x.type === 'Box' || x.type === 'Coleção');
  const currentId = editingId;
  sel.innerHTML = '<option value="">Nenhuma</option>' + containers.map(c =>
    `<option value="${esc(c.id)}" ${currentId === c.id ? 'disabled' : ''}>${esc(c.type)}: ${esc(c.title || c.obra?.title || '')}</option>`
  ).join('');
}

let detailEditMode = false;

function openDetail(id) {
  const item = findInDb(id);
  if (!item) { console.warn('openDetail: item not found', id); return; }
  detailId = id;
  detailDirty = false;
  detailUnsaved = {};
  detailEditMode = false;
  const overlay = document.getElementById('detailOverlay');
  overlay.classList.add('open');
  renderDetailModal(item);
  if (getTemplate(item) === 'consumo-episodico') renderSmartProgress(item);
}

function getTemplate(item) {
  if (item.type === 'Box' || item.type === 'Coleção') return 'container';
  if (item.type === 'Filme') return 'consumo-unico';
  if (item.type === 'Série' || item.type === 'Anime' || item.type === 'Dorama') return 'consumo-episodico';
  if (item.type === 'Livro' || item.type === 'Mangá') return 'leitura';
  if (item.type === 'Jogo') return 'jogo';
  return 'consumo-unico';
}

function renderDetailModal(item) {
  const template = getTemplate(item);
  const body = document.getElementById('detailBody');
  const containerDeleteBtn = template === 'container'
    ? `<button class="btn btn-danger btn-sm" onclick="deleteContainer('${esc(item.id)}')">Excluir ${item.type}</button>`
    : '';
  const favIconDetail = item.fav ? 'favorite' : 'favorite_border';
  body.innerHTML = `
    <div class="dmodal-header">
      <button class="dmodal-back" onclick="closeDetailModal()" aria-label="Voltar">←</button>
      <div class="dmodal-header-center">
        <span class="dmodal-header-category">${esc(item.type)}</span>
        <span class="dmodal-header-title">${esc(item.title)}</span>
      </div>
      <div class="dmodal-actions">
        <button class="dmodal-header-fav${item.fav ? ' faved' : ''}" onclick="event.stopPropagation();detailFavClick('${esc(item.id)}')" aria-label="${item.fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}">
          <span class="material-symbols-rounded">${favIconDetail}</span>
        </button>
        <span class="dmodal-unsaved hidden" id="dmodalUnsaved">●</span>
        <button class="btn btn-primary dmodal-save hidden" id="dmodalSave" onclick="saveDetailChanges()">Salvar</button>
        <button class="dmodal-pencil" id="dmodalPencil" onclick="openInlineEdit('${esc(item.id)}')" title="Editar obra" aria-label="Editar obra">
          <span class="material-symbols-rounded" style="font-size:1.2rem">edit</span>
        </button>
        ${containerDeleteBtn}
      </div>
    </div>
    <div class="dmodal-split-wrapper">
      <div class="dmodal-cover-sidebar">
        ${renderDetailCoverSidebar(item)}
      </div>
      <div class="dmodal-info-content">
        ${renderDetailInfoContent(item)}
        ${renderProgressByTemplate(item, template)}
        ${item.synopsis ? renderSinopseSection(item) : ''}
        ${template === 'container' ? renderContainerSections(item) : renderDefaultSections(item, template)}
        ${renderColecoesSection(item)}
      </div>
    </div>`;
}

function closeDetailModal(e) {
  if (e && e.target !== document.getElementById('detailOverlay')) return;
  if (detailDirty && detailId) saveDetailChanges();
  document.getElementById('detailOverlay').classList.remove('open');
  detailId = null;
  detailEditMode = false;
}

/* ── Cover Sidebar ── */
function renderDetailCoverSidebar(item) {
  const t = TIPO[item.type] || { icon: 'movie', color: '#555' };
  const coverHtml = item.cover
    ? `<img src="${esc(item.cover)}" alt="" onerror="this.parentElement.innerHTML='<span class=\\'material-symbols-rounded\\' style=\\'font-size:3rem\\'>${esc(t.icon)}</span>'">`
    : `<span class="material-symbols-rounded" style="font-size:3rem">${esc(t.icon)}</span>`;
  return `
    <div class="dmodal-cover-wrap" style="background:${t.color}15">
      ${coverHtml}
      <span class="dmodal-cover-badge dmodal-cover-badge--type" style="background:${t.color}d5"><span class="material-symbols-rounded">${esc(t.icon)}</span> ${esc(item.type)}</span>
    </div>`;
}

/* ── Info Content Header ── */
function renderDetailInfoContent(item) {
  const stars = item.rating || 0;
  const genres = item.genres ? item.genres.split(',').map(g => g.trim()).filter(Boolean) : [];
  const currentStatus = item.status || 'Quero assistir';
  const statusLabel = displayStatus(currentStatus, item.type);
  const statusColor = STATUS_COLORS[statusLabel] || STATUS_COLORS[currentStatus] || '#6b7280';

  const authorLabels = {
    'Filme': 'Diretor', 'Série': 'Criador', 'Anime': 'Estúdio',
    'Mangá': 'Autor(a)', 'Dorama': 'Criador', 'Jogo': 'Desenvolvedora', 'Livro': 'Autor(a)'
  };
  const authorLabel = authorLabels[item.type] || 'Autor';

  const genreLimit = 5;
  const visibleGenres = genres.slice(0, genreLimit);
  const overflow = genres.length - genreLimit;

  let ctxFieldsHtml = '';
  if (item.type === 'Filme') {
    if (item.director) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Diretor:</span><span>${esc(item.director)}</span></div>`;
    if (item.duration) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Duração:</span><span>${esc(item.duration)}</span></div>`;
    if (item.studio) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Estúdio:</span><span>${esc(item.studio)}</span></div>`;
  } else if (item.type === 'Jogo') {
    if (item.developer) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Desenvolvedora:</span><span>${esc(item.developer)}</span></div>`;
    if (item.publisher) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Publicadora:</span><span>${esc(item.publisher)}</span></div>`;
    if (item.platform) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Plataforma:</span><span>${esc(item.platform)}</span></div>`;
    if (item.hours) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Tempo médio:</span><span>${item.hours}h</span></div>`;
    if (item.hoursPlayed) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Horas jogadas:</span><span>${item.hoursPlayed}h</span></div>`;
  } else if (item.type === 'Livro') {
    if (item.publisher) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Editora:</span><span>${esc(item.publisher)}</span></div>`;
    if (item.pages) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Páginas:</span><span>${esc(item.pages)}</span></div>`;
    if (item.isbn) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">ISBN:</span><span>${esc(item.isbn)}</span></div>`;
    if (item.platform) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Onde leio:</span><span>${item.readUrl ? `<a href="${esc(item.readUrl)}" target="_blank" rel="noopener">${esc(item.platform)}</a>` : esc(item.platform)}</span></div>`;
  } else if (item.type === 'Mangá') {
    if (item.publisher) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Editora:</span><span>${esc(item.publisher)}</span></div>`;
    if (item.volumes) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Volumes:</span><span>${esc(item.volumes)}</span></div>`;
    if (item.platform) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Onde leio:</span><span>${item.readUrl ? `<a href="${esc(item.readUrl)}" target="_blank" rel="noopener">${esc(item.platform)}</a>` : esc(item.platform)}</span></div>`;
  } else if (item.type === 'Série' || item.type === 'Dorama') {
    if (item.studio) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Estúdio:</span><span>${esc(item.studio)}</span></div>`;
    if (item.seasons) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Temporadas:</span><span>${esc(item.seasons)}</span></div>`;
  } else if (item.type === 'Anime') {
    if (item.studio) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Estúdio:</span><span>${esc(item.studio)}</span></div>`;
    if (item.episodes) ctxFieldsHtml += `<div class="dmodal-ctx-field"><span class="dmodal-meta-label">Episódios:</span><span>${esc(item.episodes)}</span></div>`;
  }

  return `
    <div class="dmodal-info-header">
      <div class="dmodal-info-stars">
        ${[1,2,3,4,5].map(i => `<span class="dhero-star${i <= stars ? ' on' : ''}" data-val="${i}" onclick="detailStarClick(this)">★</span>`).join('')}
      </div>
      <div class="dmodal-status-row">
        <select class="dmodal-status-select" id="dmodalStatus" onchange="detailStatusChange(this.value)" style="--status-color:${statusColor}">
          ${VALID_STATUS.map(s => {
            const label = displayStatus(s, item.type);
            return `<option value="${s}" ${s === currentStatus ? 'selected' : ''}>${label}</option>`;
          }).join('')}
        </select>
      </div>
      <div class="dmodal-meta-line">
        <span>${item.type}</span>
        ${item.year ? `<span class="dmodal-meta-sep">•</span><span>${item.year}</span>` : ''}
      </div>
      ${item.author ? `
      <div class="dmodal-meta-line dmodal-meta-line--author">
        <span class="dmodal-meta-label">${authorLabel}:</span>
        <span class="dmodal-meta-value">${esc(item.author)}</span>
      </div>` : ''}
      ${ctxFieldsHtml ? `<div class="dmodal-ctx-fields">${ctxFieldsHtml}</div>` : ''}
      ${genres.length ? `
      <div class="dmodal-genre-row">
        ${visibleGenres.map(g => `<span class="dmodal-genre-chip">${esc(g)}</span>`).join('')}
        ${overflow > 0 ? `<span class="dmodal-genre-chip dmodal-genre-chip--more">+${overflow}</span>` : ''}
      </div>` : ''}
    </div>`;
}

function openInlineEdit(id) {
  smartFormMode = 'edit';
  smartFormItemId = id;
  editingId = id;
  favEdit = false;
  
  const body = document.getElementById('detailBody');
  const item = findInDb(id);
  const cat = item ? item.type : 'Obra';
  body.innerHTML = `
    <div class="dmodal-header">
      <button class="dmodal-back" onclick="openDetail('${id}')" aria-label="Voltar">←</button>
      <div class="dmodal-header-center">
        <span class="dmodal-header-category">${esc(cat)}</span>
        <span class="dmodal-header-title">Editar obra</span>
      </div>
      <div class="dmodal-actions">
        <button class="btn btn-primary btn-sm" onclick="handleSmartFormSubmit()" style="padding:4px 12px;font-size:0.8rem">Salvar</button>
      </div>
    </div>
    <div class="dmodal-body inline-edit-body" style="padding: var(--space-4) var(--space-5) var(--space-5)">
      ${renderSmartFormBody('edit', { itemId: id })}
    </div>`;
    
  buildEmotionGrid();
  buildTagGroups();
  updateFormFields();
  updateProgressFields();
  buildContainerSelect();
  fillEditForm(id);
  setupSearchAc();
}

/* ── Detail Favorito ── */
function detailFavClick(id) {
  const item = findInDb(id);
  if (!item) return;
  item.fav = !item.fav;
  save();
  saveItemToFirestore(item);
  const btn = document.querySelector('.dmodal-header-fav');
  if (btn) {
    btn.classList.toggle('faved', item.fav);
    btn.querySelector('.material-symbols-rounded').textContent = item.fav ? 'favorite' : 'favorite_border';
    btn.setAttribute('aria-label', item.fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
  }
  renderCatalogo();
  renderHome();
  toast(item.fav ? '❤️ Adicionado aos favoritos' : 'Removido dos favoritos');
}

/* ── Hero (Kept for compatibility) ── */
function renderDetailHero(item) {
  return renderDetailInfoContent(item);
}

function renderProgressByTemplate(item, template) {
  if (template === 'consumo-episodico')
    return '<div class="dprogress-section" id="dprogress-section"><div class="loading-spinner" style="margin:12px auto"></div></div>';
  if (template === 'leitura')
    return renderReadingProgressHTML(item);
  return '';
}

function renderReadingProgressHTML(item) {
  const ch = parseInt(item.currentChapter) || 0;
  const total = parseInt(item.chaptersTotal) || 0;
  const pct = total > 0 ? Math.min(100, Math.round((ch / total) * 100)) : 0;
  const unit = item.type === 'Mangá' ? 'Capítulo' : 'Página';
  return `
    <div class="dprogress-section" id="dprogress-reading-section">
      <div class="dprogress-bar-wrapper">
        <div class="dprogress-bar-bg">
          <div class="dprogress-bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="dprogress-pct">${pct}%</span>
      </div>
      <div class="dprogress-controls">
        <label class="dprogress-label">${unit} atual</label>
        <div class="dprogress-input-row">
          <input type="number" class="dprogress-input" id="dreadingChapter" value="${ch}" min="0" ${total ? `max="${total}"` : ''} onchange="detailReadingChange()">
          ${total ? `<span class="dprogress-sep">de</span><span class="dprogress-total">${total}</span>` : ''}
          <button class="btn btn-sm btn-primary dprogress-next-btn" onclick="detailReadingNext()" title="Avançar ${unit.toLowerCase()}">></button>
        </div>
      </div>
    </div>`;
}

function detailReadingChange() {
  const item = findInDb(detailId);
  if (!item) return;
  const input = document.getElementById('dreadingChapter');
  const val = parseInt(input.value) || 0;
  const total = parseInt(item.chaptersTotal) || 0;
  item.currentChapter = val;
  detailAutoSaveProgress('currentChapter', val);
  if (total > 0 && val >= total) autoFinalize(item);
}

function detailReadingNext() {
  const input = document.getElementById('dreadingChapter');
  const item = findInDb(detailId);
  if (!item) return;
  const total = parseInt(item.chaptersTotal) || 0;
  const cur = parseInt(input.value) || 0;
  const next = cur + 1;
  if (total > 0 && next > total) return;
  input.value = next;
  detailReadingChange();
}

async function renderSmartProgress(item) {
  const progressEl = document.getElementById('dprogress-section');
  if (!progressEl) return;

  progressEl.innerHTML = '<div class="loading-spinner" style="margin:12px auto"></div>';

  const seasonData = await fetchSeasonData(item);
  if (!progressEl) return;

  if (seasonData.seasons.length > 0) {
    const currentSeason = parseInt(item.season) || seasonData.seasons[0].seasonNumber;
    const hasEp = seasonData.episodes[currentSeason];
    if (!hasEp || hasEp.length === 0) {
      if (seasonData.tmdbId) {
        const fetched = await fetchSeasonEpisodes(seasonData.tmdbId, currentSeason);
        if (fetched) seasonData.episodes[currentSeason] = fetched;
      }
    }
    progressEl.innerHTML = renderSmartProgressHTML(item, seasonData, currentSeason);
  } else {
    progressEl.innerHTML = renderFallbackProgress(item);
  }
}

function renderSmartProgressHTML(item, seasonData, currentSeason) {
  const currentEp = parseInt(item.currentEp) || 0;
  const seasonEpisodes = seasonData.episodes[currentSeason] || [];
  const seasonInfo = seasonData.seasons.find(s => s.seasonNumber === currentSeason);
  const totalInSeason = seasonInfo ? seasonInfo.episodeCount : seasonEpisodes.length;
  const pct = totalInSeason > 0 ? Math.min(100, Math.round((currentEp / totalInSeason) * 100)) : 0;
  const epDuration = parseInt(item.consumption?.durationMinutes) || 0;
  const estMinutes = currentEp * epDuration;
  const estHours = estMinutes >= 60 ? Math.floor(estMinutes / 60) + 'h' + (estMinutes % 60 ? estMinutes % 60 + 'min' : '') : (estMinutes ? estMinutes + 'min' : '');

  const isLastSeasonIdx = seasonData.seasons[seasonData.seasons.length - 1].seasonNumber === currentSeason;
  const isLastEp = currentEp >= totalInSeason;

  const allPrevSeasonsEp = seasonData.seasons
    .filter(s => s.seasonNumber < currentSeason)
    .reduce((acc, s) => acc + s.episodeCount, 0);
  const overallWatched = allPrevSeasonsEp + currentEp;
  const overallTotal = seasonData.allEpCount || seasonData.seasons.reduce((acc, s) => acc + s.episodeCount, 0);
  const overallPct = overallTotal > 0 ? Math.min(100, Math.round((overallWatched / overallTotal) * 100)) : 0;

  const hasNewSeasons = overallPct >= 100 && seasonData.seasons.some(s => s.seasonNumber > currentSeason);

  return `
    <div class="dprogress-inner" id="dprogress-inner">
      <div class="dprogress-row">
        <div class="dprogress-field">
          <label class="dprogress-field-label">Temporada</label>
          <select class="dprogress-select" id="dprogress-season" onchange="detailSeasonChange(this.value)">
            ${seasonData.seasons.map(s => `
              <option value="${s.seasonNumber}" ${s.seasonNumber === currentSeason ? 'selected' : ''}>
                ${s.name} (${s.episodeCount} ep.)
              </option>
            `).join('')}
          </select>
        </div>
        <div class="dprogress-field">
          <label class="dprogress-field-label">Episódio</label>
          <select class="dprogress-select" id="dprogress-episode" onchange="detailEpisodeChange(this.value)">
            ${seasonEpisodes.map(ep => `
              <option value="${ep.episodeNumber}" ${ep.episodeNumber === currentEp ? 'selected' : ''}>
                Episódio ${ep.episodeNumber} de ${totalInSeason}
              </option>
            `).join('')}
          </select>
        </div>
        <button class="dprogress-next-btn" id="dprogressNext" onclick="detailNextEpisode()" title="Próximo episódio" aria-label="Próximo episódio">▶</button>
      </div>

      <div class="dprogress-bar-section">
        <div class="dprogress-bar">
          <div class="dprogress-bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="dprogress-bar-label">${currentEp} de ${totalInSeason} episódios</span>
      </div>

      ${overallTotal > (seasonData.seasons[0]?.episodeCount || 0) ? `
      <div class="dprogress-overall">
        <span class="dprogress-overall-label">Progresso da série</span>
        <div class="dprogress-bar-section">
          <div class="dprogress-bar dprogress-bar--overall">
            <div class="dprogress-bar-fill dprogress-bar-fill--overall" style="width:${overallPct}%"></div>
          </div>
          <span class="dprogress-bar-label">${overallWatched} de ${overallTotal} episódios · ${overallPct}%</span>
        </div>
      </div>` : ''}
      ${epDuration && currentEp ? `<div class="dprogress-est-time">⏱ ~${estHours} consumidos</div>` : ''}

      ${isLastSeasonIdx && isLastEp && overallPct >= 100 ? `
      <div class="dprogress-complete-msg">🎉 Obra concluída! Status alterado para "Finalizado".</div>` : ''}

      ${hasNewSeasons ? `
      <div class="dprogress-new-seasons">✨ Novos episódios disponíveis! A obra ganhou novas temporadas.</div>` : ''}
    </div>`;
}

function renderFallbackProgress(item) {
  const currentEp = parseInt(item.currentEp) || 0;
  const season = item.season || '';
  const totalEps = item.episodes || '';
  const epDuration = parseInt(item.consumption?.durationMinutes) || 0;
  const estMinutes = currentEp * epDuration;
  const estHours = estMinutes >= 60 ? Math.floor(estMinutes / 60) + 'h' + (estMinutes % 60 ? estMinutes % 60 + 'min' : '') : (estMinutes ? estMinutes + 'min' : '');

  return `
    <div class="dprogress-inner dprogress-fallback" id="dprogress-inner">
      <div class="dprogress-manual-label">Progresso manual</div>
      <div class="dprogress-row">
        <div class="dprogress-field">
          <label class="dprogress-field-label">Temporada</label>
          <input class="dprogress-input" type="number" id="dprogress-season-input" min="1" placeholder="1" value="${season}" onchange="detailFallbackChange('season', this.value)">
        </div>
        <div class="dprogress-field">
          <label class="dprogress-field-label">Episódio</label>
          <input class="dprogress-input" type="number" id="dprogress-episode-input" min="1" placeholder="1" value="${currentEp}" onchange="detailFallbackChange('currentEp', this.value)">
        </div>
        <div class="dprogress-field">
          <label class="dprogress-field-label">Total</label>
          <input class="dprogress-input" type="number" id="dprogress-total-input" min="1" placeholder="12" value="${totalEps}" onchange="detailFallbackChange('episodes', this.value)">
        </div>
      </div>
      ${epDuration && currentEp ? `<div class="dprogress-est-time">⏱ ~${estHours} consumidos</div>` : ''}
    </div>`;
}

function detailSeasonChange(seasonNum) {
  const item = findInDb(detailId);
  if (!item) return;
  seasonNum = parseInt(seasonNum);
  detailAutoSaveProgress('season', seasonNum);
  detailAutoSaveProgress('currentEp', 1);

  const seasonData = seasonDataCache.get(`season_${detailId}`);
  if (!seasonData || !seasonData.episodes[seasonNum]) {
    const epSel = document.getElementById('dprogress-episode');
    if (epSel) epSel.innerHTML = '<option>Carregando…</option>';
    fetchSeasonEpisodes(seasonData?.tmdbId, seasonNum).then(eps => {
      if (eps && seasonData) {
        seasonData.episodes[seasonNum] = eps;
        updateProgressUI(seasonNum, seasonData);
      }
    });
    return;
  }
  updateProgressUI(seasonNum, seasonData);
}

function detailEpisodeChange(epNum) {
  epNum = parseInt(epNum);
  const item = findInDb(detailId);
  if (!item) return;
  const seasonData = seasonDataCache.get(`season_${detailId}`);
  if (!seasonData) return;
  const currentSeason = parseInt(item.season) || seasonData.seasons[0].seasonNumber;

  item.currentEp = epNum;
  const idx = findIdxInDb(detailId);
  if (idx >= 0) db[idx] = item;
  detailAutoSaveProgress('currentEp', epNum);

  const seasonInfo = seasonData.seasons.find(s => s.seasonNumber === currentSeason);
  const totalInSeason = seasonInfo ? seasonInfo.episodeCount : (seasonData.episodes[currentSeason] || []).length;
  const overallPct = computeOverallPct(seasonData, currentSeason, epNum);

  if (epNum >= totalInSeason && isLastSeason(seasonData, currentSeason) && overallPct >= 100) {
    autoFinalize(item);
  }

  refreshProgressUI(currentSeason, seasonData);
  checkNewSeasonAlert(seasonData, currentSeason, overallPct >= 100);
}

function detailNextEpisode() {
  const item = findInDb(detailId);
  if (!item) return;

  const seasonData = seasonDataCache.get(`season_${detailId}`);
  if (!seasonData || !seasonData.seasons.length) return;

  const currentSeason = parseInt(item.season) || seasonData.seasons[0].seasonNumber;
  const currentEp = parseInt(item.currentEp) || 0;
  const seasonEpisodes = seasonData.episodes[currentSeason] || [];
  const maxEp = seasonEpisodes.length;

  if (currentEp < maxEp) {
    const nextEp = currentEp + 1;
    item.currentEp = nextEp;
    detailAutoSaveProgress('currentEp', nextEp);
    refreshProgressUI(currentSeason, seasonData);
    toast(`▶ Episódio ${nextEp}`);

    if (nextEp >= maxEp && isLastSeason(seasonData, currentSeason) && computeOverallPct(seasonData, currentSeason, nextEp) >= 100) {
      autoFinalize(item);
    }
  } else {
    if (isLastSeason(seasonData, currentSeason)) {
      autoFinalize(item);
      return;
    }
    const seasonIdx = seasonData.seasons.findIndex(s => s.seasonNumber === currentSeason);
    const nextSeason = seasonData.seasons[seasonIdx + 1].seasonNumber;
    item.season = nextSeason;
    item.currentEp = 1;
    detailAutoSaveProgress('season', nextSeason);
    detailAutoSaveProgress('currentEp', 1);

    const selS = document.getElementById('dprogress-season');
    if (selS) selS.value = nextSeason;

    if (seasonData.episodes[nextSeason]) {
      refreshProgressUI(nextSeason, seasonData);
    } else {
      const epSel = document.getElementById('dprogress-episode');
      if (epSel) epSel.innerHTML = '<option>Carregando…</option>';
      fetchSeasonEpisodes(seasonData.tmdbId, nextSeason).then(eps => {
        if (eps) {
          seasonData.episodes[nextSeason] = eps;
          refreshProgressUI(nextSeason, seasonData);
        }
      });
    }
    toast(`▶ Temporada ${nextSeason}, Episódio 1`);
  }
}

function isLastSeason(seasonData, seasonNum) {
  return seasonData.seasons[seasonData.seasons.length - 1].seasonNumber === seasonNum;
}

function computeOverallPct(seasonData, currentSeason, currentEp) {
  const prevTotal = seasonData.seasons
    .filter(s => s.seasonNumber < currentSeason)
    .reduce((acc, s) => acc + s.episodeCount, 0);
  const total = seasonData.allEpCount || seasonData.seasons.reduce((acc, s) => acc + s.episodeCount, 0);
  const watched = prevTotal + currentEp;
  return total > 0 ? Math.round((watched / total) * 100) : 0;
}

function autoFinalize(item) {
  if (item.status === 'Finalizado') return;
  item.status = 'Finalizado';
  item.finishedAt = new Date().toISOString();
  const idx = findIdxInDb(detailId);
  if (idx >= 0) db[idx] = item;
  save();
  localSaveGuard = true;
  saveItemToFirestore(item);
  setTimeout(() => { localSaveGuard = false; }, 100);
  checkAchievements();

  const statusSel = document.getElementById('dmodalStatus');
  if (statusSel) {
    statusSel.value = 'Finalizado';
    statusSel.style.setProperty('--status-color', STATUS_COLORS['Finalizado']);
  }
  toast('🎉 Obra concluída! Status alterado para Finalizado.');
}

function checkNewSeasonAlert(seasonData, currentSeason, completed) {
  const hasNew = completed && seasonData.seasons.some(s => s.seasonNumber > currentSeason);
  const el = document.getElementById('dprogress-inner');
  if (!el) return;
  const existing = el.querySelector('.dprogress-new-seasons');
  if (hasNew && !existing) {
    const msg = document.createElement('div');
    msg.className = 'dprogress-new-seasons';
    msg.textContent = '✨ Novos episódios disponíveis! A obra ganhou novas temporadas.';
    el.appendChild(msg);
  } else if (!hasNew && existing) {
    existing.remove();
  }
}

async function detailAutoSaveProgress(field, value) {
  if (!detailId) return;
  const item = findInDb(detailId);
  if (!item) return;
  item[field] = value;
  const idx = findIdxInDb(detailId);
  if (idx >= 0) db[idx] = item;
  save();
  localSaveGuard = true;
  await saveItemToFirestore(item);
  setTimeout(() => { localSaveGuard = false; }, 100);
}

function detailFallbackChange(field, value) {
  detailAutoSaveProgress(field, value);
  const item = findInDb(detailId);
  if (item) renderSmartProgress(item);
}

function updateProgressUI(seasonNum, seasonData) {
  const item = findInDb(detailId);
  if (!item) return;
  const seasonEpisodes = seasonData.episodes[seasonNum] || [];
  const seasonInfo = seasonData.seasons.find(s => s.seasonNumber === seasonNum);
  const totalInSeason = seasonInfo ? seasonInfo.episodeCount : seasonEpisodes.length;
  const epSel = document.getElementById('dprogress-episode');
  if (epSel) {
    epSel.innerHTML = seasonEpisodes.map(ep =>
      `<option value="${ep.episodeNumber}" ${ep.episodeNumber === 1 ? 'selected' : ''}>Episódio ${ep.episodeNumber} de ${totalInSeason}</option>`
    ).join('');
  }
  refreshProgressUI(seasonNum, seasonData);
}

function refreshProgressUI(seasonNum, seasonData) {
  const item = findInDb(detailId);
  if (!item) return;
  const currentEp = parseInt(item.currentEp) || 0;
  const seasonInfo = seasonData.seasons.find(s => s.seasonNumber === seasonNum);
  const totalInSeason = seasonInfo ? seasonInfo.episodeCount : (seasonData.episodes[seasonNum] || []).length;
  const pct = totalInSeason > 0 ? Math.min(100, Math.round((currentEp / totalInSeason) * 100)) : 0;

  const barFill = document.querySelector('.dprogress-bar-fill');
  const barLabel = document.querySelector('.dprogress-bar-label');
  if (barFill) barFill.style.width = `${pct}%`;
  if (barLabel) barLabel.textContent = `${currentEp} de ${totalInSeason} episódios`;

  const overallTotal = seasonData.allEpCount || seasonData.seasons.reduce((acc, s) => acc + s.episodeCount, 0);
  let overallPct = 0;
  if (overallTotal > (seasonData.seasons[0]?.episodeCount || 0)) {
    const prevTotal = seasonData.seasons
      .filter(s => s.seasonNumber < seasonNum)
      .reduce((acc, s) => acc + s.episodeCount, 0);
    const overallWatched = prevTotal + currentEp;
    overallPct = overallTotal > 0 ? Math.round((overallWatched / overallTotal) * 100) : 0;
    const ofill = document.querySelector('.dprogress-bar-fill--overall');
    const olabel = document.querySelector('.dprogress-overall .dprogress-bar-label');
    if (ofill) ofill.style.width = `${overallPct}%`;
    if (olabel) olabel.textContent = `${overallWatched} de ${overallTotal} episódios · ${overallPct}%`;

    const completeMsg = document.querySelector('.dprogress-complete-msg');
    if (overallPct >= 100 && isLastSeason(seasonData, seasonNum) && currentEp >= totalInSeason) {
      if (!completeMsg) {
        const inner = document.getElementById('dprogress-inner');
        if (inner) {
          const msg = document.createElement('div');
          msg.className = 'dprogress-complete-msg';
          msg.textContent = '🎉 Obra concluída! Status alterado para "Finalizado".';
          inner.appendChild(msg);
        }
      }
    } else if (completeMsg) {
      completeMsg.remove();
    }
  }

  checkNewSeasonAlert(seasonData, seasonNum, overallPct >= 100);
}

/* ── Stars (sempre clicáveis) ── */
function detailStarClick(el) {
  const val = parseInt(el.dataset.val);
  const item = findInDb(detailId);
  if (!item) return;
  document.querySelectorAll('.dhero-star').forEach(s => {
    s.classList.toggle('on', parseInt(s.dataset.val) <= val);
  });
  editDetailField('rating', val);
  saveDetailChanges();
}

/* ── Status change (dropdown) ── */
function detailStatusChange(newStatus) {
  const item = findInDb(detailId);
  if (!item) return;
  if (item.status === newStatus) return;

  const wasComplete = item.status === 'Finalizado';
  item.status = newStatus;
  if (newStatus === 'Finalizado' && !item.finishedAt) {
    item.finishedAt = new Date().toISOString();
  } else if (newStatus !== 'Finalizado') {
    item.finishedAt = null;
  }

  const idx = findIdxInDb(detailId);
  if (idx >= 0) db[idx] = item;
  save();
  localSaveGuard = true;
  saveItemToFirestore(item);
  setTimeout(() => { localSaveGuard = false; }, 100);
  checkAchievements();

  const statusColor = STATUS_COLORS[displayStatus(newStatus, item.type)] || STATUS_COLORS[newStatus] || '#6b7280';
  const sel = document.getElementById('dmodalStatus');
  if (sel) {
    sel.value = newStatus;
    sel.style.setProperty('--status-color', statusColor);
  }

  renderCatalogo();
  renderHome();
  toast(newStatus === 'Finalizado' ? '🎉 Obra finalizada!' : `📌 Status: ${displayStatus(newStatus, item.type)}`);
}

/* ── Sinopse (prominent section, not accordion) ── */
function renderSinopseSection(item) {
  const short = item.synopsis.length > 200;
  return `
    <div class="dmodal-sinopse">
      <div class="dmodal-sinopse-label">Sinopse</div>
      <p class="dmodal-sinopse-text" id="sinopseText">${esc(item.synopsis)}</p>
      ${short ? `<button class="btn btn-ghost btn-sm" onclick="toggleSinopseExpand()" id="sinopseToggle" style="font-size:0.78rem;margin-top:4px">Ler mais</button>` : ''}
      <button id="btnTranslateDetail" class="btn btn-ghost btn-sm" style="margin-top:4px;font-size:0.78rem" onclick="translateDetailSynopsis('${esc(item.id)}')">Traduzir para português</button>
    </div>`;
}

function toggleSinopseExpand() {
  const text = document.getElementById('sinopseText');
  const btn = document.getElementById('sinopseToggle');
  if (!text || !btn) return;
  const expanded = text.classList.toggle('expanded');
  btn.textContent = expanded ? 'Ler menos' : 'Ler mais';
}

/* ── Coleções (show which Box/Coleção contains this work) ── */
function renderColecoesSection(item) {
  const containers = db.filter(c => (c.type === 'Box' || c.type === 'Coleção') && (c.containerItems || []).some(id => String(id) === String(item.id)));
  if (!containers.length) return '';
  return `
    <div class="dmodal-colecoes">
      <div class="dmodal-colecoes-label">Coleções</div>
      <div class="dmodal-colecoes-list">
        ${containers.map(c => {
          const t = TIPO[c.type] || { icon: 'inventory_2', color: '#f59e0b' };
          const total = (c.containerItems || []).length;
          const done = (c.containerItems || []).filter(id => { const ci = findInDb(id); return ci && ci.status === 'Finalizado'; }).length;
          return `<button class="dmodal-colecao-chip" onclick="closeDetailModal();openBoxView('${esc(c.id)}')" style="--chip-color:${t.color}">
            <span class="material-symbols-rounded" style="font-size:1rem">${esc(t.icon)}</span>
            <span>${esc(c.title)}</span>
            <span class="dmodal-colecao-pct">${done}/${total}</span>
          </button>`;
        }).join('')}
      </div>
    </div>`;
}

/* ── Sections by template (accordions) ── */
function renderDefaultSections(item, template) {
  let html = '';
  html += renderMinhasObservacoes(item);
  html += renderAccordion('jornada', 'Jornada da obra', '<div id="jornadaContent" style="min-height:60px"><div class="loading-spinner"></div></div>', 'loadJornadaDetail');
  if (hasInfoTecnica(item, template)) html += renderAccordion('info', 'Informações técnicas', renderInfoTecnicaContent(item, template));
  if (item.history && item.history.length) html += renderAccordion('historico', 'Histórico de alterações', renderHistoricoContent(item));
  return html;
}

function renderContainerSections(item) {
  const itemsCount = (item.containerItems || []).length;
  let html = '';
  html += renderMinhasObservacoes(item);
  html += renderAccordion('itens', `Itens (${itemsCount})`, renderContainerItemsList(item), null, true);
  if (hasInfoTecnica(item)) html += renderAccordion('info', 'Informações', renderInfoTecnicaContent(item));
  if (item.history && item.history.length) html += renderAccordion('historico', 'Histórico', renderHistoricoContent(item));
  html += `<button class="btn btn-ghost" style="margin:var(--space-3) var(--space-4);width:calc(100% - var(--space-4) * 2)" onclick="addItemsToContainer('${esc(item.id)}')">${item.type === 'Box' ? 'Adicionar livros' : 'Adicionar obras'}</button>`;
  return html;
}

function renderAccordion(id, title, content, loadFn, open) {
  return `
    <div class="dmodal-accordion">
      <button class="dmodal-accordion-header" onclick="toggleAccordion(this)" data-load="${loadFn || ''}">
        <span class="dmodal-accordion-arrow">${open ? '▼' : '▶'}</span>
        ${title}
      </button>
      <div class="dmodal-accordion-body${open ? ' open' : ''}" id="acc-${id}">
        ${content}
      </div>
    </div>`;
}

function toggleAccordion(btn) {
  const body = btn.nextElementSibling;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open');
  const arrow = btn.querySelector('.dmodal-accordion-arrow');
  arrow.textContent = isOpen ? '▶' : '▼';
  if (!isOpen && btn.dataset.load && !body.dataset.loaded) {
    body.dataset.loaded = 'true';
    const loadFn = window[btn.dataset.load];
    if (typeof loadFn === 'function') loadFn();
  }
}

function loadJornadaDetail() {
  const item = findInDb(detailId);
  if (item) loadJornada(item);
}

/* ── Minhas observações ── */
function renderMinhasObservacoes(item) {
  const tags = item.tags || [];
  const hasEmotions = item.emotions && Object.values(item.emotions).some(v => v > 0);
  // Sempre renderiza a seção de observações para facilitar acesso
  return `
    <div class="dmodal-obs${detailEditMode ? ' editing' : ''}" id="dmodalObsSection">
      <div class="dmodal-obs-header">
        <span>Minhas observações</span>
        <button class="dmodal-pencil dmodal-pencil--sm" onclick="toggleDetailEdit()" title="Editar" aria-label="Editar">✏️</button>
      </div>
      <div class="dmodal-obs-body">
        ${renderObsOpinion(item)}
        ${renderObsTags(item)}
        ${hasEmotions ? `<div class="dmodal-obs-emotions">${EMOTIONS.filter(e => (item.emotions[e.key] || 0) > 0).map(e => `<span class="dmodal-obs-emotion">${(e.label||'').split(' ')[0]||'⭐'} ${item.emotions[e.key]}</span>`).join('')}</div>` : ''}
      </div>
    </div>`;
}

function renderObsOpinion(item) {
  if (detailEditMode) {
    return `<textarea class="dmodal-obs-edit" id="obsOpinion" oninput="detailFieldChange('opinion',this.value)" placeholder="O que você achou dessa obra?">${esc(item.opinion || '')}</textarea>`;
  }
  if (item.opinion) {
    return `<p class="dmodal-obs-text">${esc(item.opinion)}</p>`;
  }
  return '<p class="dmodal-obs-text dmodal-obs-empty">Nenhuma observação registrada.</p>';
}

function renderObsTags(item) {
  const tags = item.tags || [];
  if (!tags.length && !detailEditMode) return '';

  const posSet = new Set(TAG_GROUPS.Positivas || []);
  const neutSet = new Set(TAG_GROUPS.Neutras || []);
  const negSet = new Set(TAG_GROUPS.Negativas || []);

  function classify(t) {
    if (posSet.has(t)) return 'Positivas';
    if (neutSet.has(t)) return 'Neutras';
    if (negSet.has(t)) return 'Negativas';
    return null;
  }

  const groups = { Positivas: [], Neutras: [], Negativas: [] };
  tags.forEach(t => {
    const g = classify(t);
    if (g) groups[g].push(t);
    else groups.Positivas.push(t);
  });

  function renderGroup(label, groupTags) {
    if (!groupTags.length) return '';
    return `<div class="dmodal-obs-tag-group">
      <span class="dmodal-obs-tag-group-label">${label}</span>
      <div class="dmodal-obs-tags-inner">
        ${groupTags.map(t => detailEditMode
          ? `<span class="dmodal-obs-tag editing" onclick="removeObsTag(this)">${esc(t)} ✕</span>`
          : `<span class="dmodal-obs-tag">${esc(t)}</span>`
        ).join('')}
      </div>
    </div>`;
  }

  const inputHtml = detailEditMode
    ? `<input class="dmodal-obs-tag-input" id="obsTagInput" placeholder="Nova tag..." onkeydown="if(event.key==='Enter')addObsTag()">`
    : '';
  const hasAny = groups.Positivas.length || groups.Neutras.length || groups.Negativas.length || inputHtml;
  if (!hasAny) return '';
  return `<div class="dmodal-obs-tags" id="obsTags">${renderGroup('Positivas', groups.Positivas)}${renderGroup('Neutras', groups.Neutras)}${renderGroup('Negativas', groups.Negativas)}${inputHtml}</div>`;
}

/* ── Info técnica (sem repetir tipo/status/ano/autor do header) ── */
function hasInfoTecnica(item, template) {
  if (template === 'leitura') return item.platform || item.readUrl || item.hours || item.cinemaWatched || item.finishedAt || item.addedAt || item.fav || item.chaptersTotal;
  if (template === 'consumo-unico' || template === 'jogo') return item.platform || item.hours || item.hoursPlayed || item.cinemaWatched || item.finishedAt || item.addedAt || item.fav;
  return item.platform || item.episodes || item.hours ||
         item.cinemaWatched || item.finishedAt || item.addedAt || item.fav ||
         item.season || item.currentEp || item.currentChapter || item.chaptersTotal;
}

function renderInfoTecnicaContent(item, template) {
  const rows = [];
  if (item.platform) rows.push(['Plataforma', item.readUrl ? `<a href="${esc(item.readUrl)}" target="_blank" rel="noopener">${esc(item.platform)}</a>` : esc(item.platform)]);
  if (template === 'consumo-episodico' && (item.season || item.currentEp) && !item.tmdbId) {
    const parts = [];
    if (item.season) parts.push(`Temp. ${item.season}`);
    if (item.currentEp) parts.push(`Ep. ${item.currentEp}`);
    if (item.episodes) parts.push(`de ${item.episodes}`);
    rows.push(['Onde parei', parts.join(' · ')]);
  }
  if (item.consumption?.durationMinutes) {
    const h = Math.floor(parseInt(item.consumption.durationMinutes) / 60);
    const m = parseInt(item.consumption.durationMinutes) % 60;
    rows.push(['Duração', h > 0 ? `${h}h${m > 0 ? m + 'min' : ''}` : `${m}min`]);
  } else if (item.hours) rows.push(['Duração', `${item.hours}h`]);
  if (item.hoursPlayed) rows.push(['Horas jogadas', `${item.hoursPlayed}h`]);
  if (item.cinemaWatched) rows.push(['Cinema', 'Assistido no cinema']);
  if (item.finishedAt) rows.push(['Finalizado', new Date(item.finishedAt).toLocaleDateString('pt-BR')]);
  if (item.addedAt) rows.push(['Adicionado', new Date(item.addedAt).toLocaleDateString('pt-BR')]);
  if (item.fav) rows.push(['Favorito', 'Sim']);
  return `<div class="dmodal-info-grid">${rows.map(r => `<div class="dmodal-info-row"><span class="dmodal-info-label">${r[0]}</span><span class="dmodal-info-value">${r[1]}</span></div>`).join('')}</div>`;
}

/* ── Container items list ── */
function renderContainerItemsList(item) {
  const containerItems = (item.containerItems || []).map(id => findInDb(id)).filter(Boolean);
  const total = containerItems.length;
  const done = containerItems.filter(i => i.status === 'Finalizado').length;
  const pct = total ? Math.round(done / total * 100) : 0;
  if (!total) return '<p style="color:var(--text3)">Nenhum item neste ' + item.type.toLowerCase() + '.</p>';
  return `
    <div class="container-detail-progress" style="margin-bottom:var(--space-3)">
      <div class="container-detail-bar"><div class="container-detail-bar-fill" style="width:${pct}%"></div></div>
      <span class="container-detail-pct" style="font-size:var(--font-sm);color:var(--text3)">${done}/${total} · ${pct}%</span>
    </div>
    ${containerItems.map(ci => {
      const ciType = TIPO[ci.type] || { icon: 'movie' };
      const ciCover = ci.cover
        ? `<img src="${esc(ci.cover)}" alt="" loading="lazy" onerror="this.outerHTML='<span class=\\'material-symbols-rounded\\' style=\\'font-size:1.5rem\\'>${esc(ciType.icon)}</span>'">`
        : `<span class="material-symbols-rounded">${esc(ciType.icon)}</span>`;
      const ciStatus = ci.status === 'Finalizado' ? '✅ ' : (ci.status === 'Assistindo' ? '▶️ ' : '');
      return `
        <div class="container-item-row">
          <div class="container-item-cover">${ciCover}</div>
          <div class="container-item-info">
            <div class="container-item-title">${esc(ci.title)}</div>
            <div class="container-item-meta"><span class="material-symbols-rounded">${esc(ciType.icon)}</span> ${esc(ci.type)} ${ci.year ? '· ' + esc(ci.year) : ''}</div>
          </div>
          <span class="container-item-status">${ciStatus}${esc(displayStatus(ci.status, ci.type))}</span>
          <button class="container-item-remove" onclick="removeFromContainer('${esc(item.id)}','${esc(ci.id)}')" title="Remover">✕</button>
        </div>`;
    }).join('')}`;
}

/* ── Histórico ── */
function renderHistoricoContent(item) {
  const history = item.history || [];
  if (!history.length) return '<p style="color:var(--text3)">Nenhuma alteração registrada.</p>';
  return history.slice().reverse().map(h => `
    <div class="hist-item">
      <div class="hist-icon">📝</div>
      <div class="hist-info">
        <div class="hist-event">${esc(h.change)}</div>
        <div class="hist-date">${new Date(h.date).toLocaleString('pt-BR')}</div>
      </div>
    </div>`).join('');
}

/* ── Edit mode ── */
async function toggleDetailEdit() {
  const enteringEditMode = !detailEditMode;
  if (!enteringEditMode && detailDirty) {
    await saveDetailChanges();
  }
  detailEditMode = enteringEditMode;
  const item = findInDb(detailId);
  if (!item) return;
  const obs = document.getElementById('dmodalObsSection');
  if (obs) {
    const html = renderMinhasObservacoes(item);
    if (html) obs.outerHTML = html;
    else obs.remove();
  } else if (detailEditMode) {
    const hero = document.querySelector('.dhero');
    if (hero) hero.insertAdjacentHTML('afterend', renderMinhasObservacoes(item));
  }
  const pencil = document.getElementById('dmodalPencil');
  if (pencil) pencil.style.opacity = detailEditMode ? '' : '0.5';
}

function detailFieldChange(field, value) {
  editDetailField(field, value);
}

function removeObsTag(el) {
  const tagText = el.textContent.replace(' ✕', '').trim();
  const item = findInDb(detailId);
  if (!item) return;
  const tags = (item.tags || []).filter(t => t !== tagText);
  editDetailField('tags', tags);
  el.remove();
  saveDetailChanges();
}

function addObsTag() {
  const input = document.getElementById('obsTagInput');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;
  const item = findInDb(detailId);
  if (!item) return;
  const tags = [...(item.tags || []), val];
  editDetailField('tags', tags);
  input.value = '';
  const container = document.getElementById('obsTags');
  if (container) {
    const tag = document.createElement('span');
    tag.className = 'dmodal-obs-tag editing';
    tag.textContent = val + ' ✕';
    tag.onclick = function () { removeObsTag(this); };
    container.insertBefore(tag, input);
  }
  saveDetailChanges();
}

/* ── Save / Dirty ── */
function editDetailField(field, value) {
  detailDirty = true;
  detailUnsaved[field] = value;
  const unsaved = document.getElementById('dmodalUnsaved');
  const saveBtn = document.getElementById('dmodalSave');
  if (unsaved) unsaved.classList.remove('hidden');
  if (saveBtn) saveBtn.classList.remove('hidden');
}

async function saveDetailChanges() {
  if (!detailId || !detailDirty) return;
  const item = findInDb(detailId);
  if (!item) { console.warn('saveDetailChanges: item not found', detailId); return; }
  Object.assign(item, detailUnsaved);
  if (!item.obra) item.obra = {};
  const obraFields = ['title','cover','year','genres','synopsis','opinion','rating','emotions','tags','negTags','fav']
  obraFields.forEach(f => { if (f in detailUnsaved) item.obra[f] = detailUnsaved[f] })
  const idx = findIdxInDb(detailId);
  if (idx >= 0) db[idx] = item;
  save();
  localSaveGuard = true;
  await saveItemToFirestore(item);
  setTimeout(() => { localSaveGuard = false; }, 100);
  detailDirty = false;
  detailUnsaved = {};
  const unsaved = document.getElementById('dmodalUnsaved');
  const saveBtn = document.getElementById('dmodalSave');
  if (unsaved) unsaved.classList.add('hidden');
  if (saveBtn) saveBtn.classList.add('hidden');
  renderCatalogo();
  renderHome();
  toast('✏️ Alterações salvas!');
}
/* ═══════════════════════════════════════════
   DELETE
   ═══════════════════════════════════════════ */

async function deleteItemFromEdit(id) {
  if (!confirm('Remover esta obra do catálogo?')) return;
  document.getElementById('detailOverlay').classList.remove('open');
  detailId = null;
  detailEditMode = false;
  document.getElementById('smartFormOverlay').classList.remove('open');
  editingId = null;
  smartFormItemId = null;
  smartFormBatchIds = [];
  smartFormMode = '';
  
  db = db.filter(x => x.id !== id && String(x.id) !== String(id));
  save();
  revertGuard = true;
  try {
    await deleteItemFromFirestore(id);
  } finally {
    revertGuard = false;
    renderCatalogo();
    toast('Obra removida');
  }
}

function toggleDeleteMode() {
  isDeleteMode = !isDeleteMode;
  selectedIds.clear();

  document.getElementById('btnToggleBox').style.display = isDeleteMode ? 'none' : '';
  document.getElementById('btnToggleColecao').style.display = isDeleteMode ? 'none' : '';

  const btn = document.getElementById('btnToggleDelete');
  const btnConfirm = document.getElementById('btnConfirmDelete');
  const btnBatch = document.getElementById('btnBatchEdit');
  if (isDeleteMode) {
    btn.innerHTML = 'Cancelar Exclusão';
    btn.style.color = 'var(--text)';
    btn.style.borderColor = 'var(--border)';
    btnConfirm.style.display = 'block';
    btnConfirm.textContent = `Excluir (0)`;
    btnBatch.style.display = 'block';
    btnBatch.textContent = `Editar (0)`;
  } else {
    btn.innerHTML = 'Excluir Vários';
    btn.style.color = 'var(--red)';
    btn.style.borderColor = 'rgba(248,113,113,0.3)';
    btnConfirm.style.display = 'none';
    btnBatch.style.display = 'none';
  }
  renderCatalogo();
}

function toggleSelection(id, e) {
  if (e) e.stopPropagation();
  if (isBoxMode || isColecaoMode) {
    if (containerSelectedIds.has(id)) containerSelectedIds.delete(id);
    else containerSelectedIds.add(id);
    const count = containerSelectedIds.size;
    if (isBoxMode) {
      const btn = document.getElementById('btnConfirmBoxAction');
      if (btn) { btn.textContent = `Criar Box (${count})`; btn.style.display = count ? '' : 'none'; }
    } else {
      const btn = document.getElementById('btnConfirmColecaoAction');
      if (btn) { btn.textContent = `Criar Coleção (${count})`; btn.style.display = count ? '' : 'none'; }
    }
  } else {
    if (selectedIds.has(id)) selectedIds.delete(id);
    else selectedIds.add(id);
    const btnConfirm = document.getElementById('btnConfirmDelete');
    if (btnConfirm) btnConfirm.textContent = `Excluir (${selectedIds.size})`;
    const btnBatch = document.getElementById('btnBatchEdit');
    if (btnBatch) btnBatch.textContent = `Editar (${selectedIds.size})`;
  }
  renderCatalogo();
}

function openBatchEdit() {
  if (selectedIds.size === 0) return;
  openSmartFormModal('batch', { batchIds: [...selectedIds] });
}

async function confirmDeleteSelected() {
  if (selectedIds.size === 0) return;
  if (!confirm(`Remover ${selectedIds.size} obra(s) do catálogo?`)) return;

  const size = selectedIds.size;
  const deletedIds = [...selectedIds];
  const delSet = new Set(deletedIds.map(String));
  db = db.filter(x => !delSet.has(String(x.id)));
  save();
  revertGuard = true;
  try {
    await Promise.all(deletedIds.map(id => deleteItemFromFirestore(id)));
  } finally {
    revertGuard = false;
  }
  toggleDeleteMode();
  renderCatalogo();
  toast(`${size} obra(s) removida(s)`);
}

/* ═══════════════════════════════════════════
   BOX / COLEÇÃO SELECTION MODE
   ═══════════════════════════════════════════ */

function toggleBoxMode() {
  if (isColecaoMode) toggleColecaoMode();
  isBoxMode = !isBoxMode;
  containerSelectedIds.clear();
  const btn = document.getElementById('btnToggleBox');
  const btnConfirm = document.getElementById('btnConfirmBoxAction');
  document.getElementById('btnToggleColecao').style.display = isBoxMode ? 'none' : '';
  if (isBoxMode) {
    btn.textContent = 'Cancelar';
    btn.style.color = 'var(--text)';
    btn.style.borderColor = 'var(--border)';
    btnConfirm.style.display = 'none';
    btnConfirm.textContent = 'Criar Box (0)';
  } else {
    btn.textContent = 'Box';
    btn.style.color = '';
    btn.style.borderColor = '';
    btnConfirm.style.display = 'none';
  }
  renderCatalogo();
}

function toggleColecaoMode() {
  if (isBoxMode) toggleBoxMode();
  isColecaoMode = !isColecaoMode;
  containerSelectedIds.clear();
  const btn = document.getElementById('btnToggleColecao');
  const btnConfirm = document.getElementById('btnConfirmColecaoAction');
  document.getElementById('btnToggleBox').style.display = isColecaoMode ? 'none' : '';
  if (isColecaoMode) {
    btn.textContent = 'Cancelar';
    btn.style.color = 'var(--text)';
    btn.style.borderColor = 'var(--border)';
    btnConfirm.style.display = 'none';
    btnConfirm.textContent = 'Criar Coleção (0)';
  } else {
    btn.textContent = 'Coleção';
    btn.style.color = '';
    btn.style.borderColor = '';
    btnConfirm.style.display = 'none';
  }
  renderCatalogo();
}

/* ═══════════════════════════════════════════
   CONTAINER MANAGEMENT
   ═══════════════════════════════════════════ */

function removeFromContainer(containerId, itemId) {
  const item = findInDb(containerId);
  if (!item) return;
  item.containerItems = (item.containerItems||[]).filter(id => String(id) !== String(itemId));
  const idx = findIdxInDb(containerId);
  if (idx >= 0) db[idx] = item;
  save();
  saveItemToFirestore(item);
  if (detailId === containerId) openDetail(containerId);
  renderCatalogo();
  toast('✕ Item removido');
}

function addItemsToContainer(containerId) {
  const item = findInDb(containerId);
  if (!item) return;
  const query = prompt('Digite o título da obra para adicionar:');
  if (!query) return;
  const matches = db.filter(x =>
    x.id !== containerId &&
    !(item.containerItems||[]).some(cid => String(cid) === String(x.id)) &&
    (item.type === 'Box' ? x.type === 'Livro' : true) &&
    x.title.toLowerCase().includes(query.toLowerCase()));
  if (!matches.length) { toast('Nenhuma obra encontrada'); return; }
  if (matches.length === 1) {
    item.containerItems = [...(item.containerItems||[]), String(matches[0].id)];
  } else {
    const names = matches.map((m,i) => `${i+1}. ${m.title} (${m.type})`).join('\n');
    const choice = prompt(`Obras encontradas:\n${names}\n\nDigite o número:`);
    const idx = parseInt(choice) - 1;
    if (idx >= 0 && idx < matches.length) {
      item.containerItems = [...(item.containerItems||[]), String(matches[idx].id)];
    } else { toast('Opção inválida'); return; }
  }
  const idx2 = findIdxInDb(containerId);
  if (idx2 >= 0) db[idx2] = item;
  save();
  saveItemToFirestore(item);
  if (detailId === containerId) openDetail(containerId);
  renderCatalogo();
  toast('✅ Item adicionado');
}

function deleteContainer(containerId) {
  const item = findInDb(containerId);
  if (!item) return;
  const typeLabel = item.type === 'Box' ? 'Box' : 'Coleção';
  if (!confirm(`Remover este ${typeLabel}? Os itens dentro NÃO serão removidos.`)) return;
  db = db.filter(x => String(x.id) !== String(containerId));
  save();
  deleteItemFromFirestore(containerId);
  closeDetailModal();
  renderCatalogo();
  toast(`🗑 ${typeLabel} removido`);
}

/* ═══════════════════════════════════════════
   IMPORT MODAL
   ═══════════════════════════════════════════ */

function openImportModal() {
  document.getElementById('importOverlay').classList.add('open');
  ['csv','json','paste','export'].forEach(id => {
    const el = document.getElementById(id+'Feedback');
    if (el) el.textContent = '';
  });
  document.getElementById('pasteInput').value = '';
  document.getElementById('csvFileInput').value = '';
  document.getElementById('jsonFileInput').value = '';
  impHideProgress();
  setupImpDropzones();
  switchImpTab('json');
}

function setupImpDropzones() {
  document.querySelectorAll('.imp-dropzone').forEach(z => {
    z.removeEventListener('dragover', impDragOver);
    z.removeEventListener('dragleave', impDragLeave);
    z.removeEventListener('drop', impDrop);
    z.addEventListener('dragover', impDragOver);
    z.addEventListener('dragleave', impDragLeave);
    z.addEventListener('drop', impDrop);
  });
}
function impDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('dragover'); }
function impDragLeave(e) { e.currentTarget.classList.remove('dragover'); }
function impDrop(e) {
  e.preventDefault();
  const zone = e.currentTarget;
  zone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (!files.length) return;
  const file = files[0];
  const input = zone.parentElement.querySelector('input[type="file"]');
  if (input) {
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    input.dispatchEvent(new Event('change'));
  }
}

function closeImportModal(e) {
  if (e && e.target !== document.getElementById('importOverlay')) return;
  document.getElementById('importOverlay').classList.remove('open');
}

function switchImpTab(tab) {
  ['json','csv','paste','export'].forEach(t => {
    const panel = document.getElementById('imp-panel-' + t);
    if (panel) panel.style.display = t === tab ? '' : 'none';
    const btn = document.getElementById('imp-tab-' + t);
    if (btn) btn.className = 'btn ' + (t === tab ? 'btn-primary' : 'btn-ghost') + ' btn-sm';
  });
}

/* ── Progress Bar ── */

function impShowProgress(label, pct = 0) {
  const container = document.getElementById('impProgress');
  const labelEl = document.getElementById('impProgressLabel');
  const fill = document.getElementById('impProgressFill');
  if (container) container.classList.remove('hidden');
  if (labelEl) labelEl.textContent = label;
  if (fill) fill.style.width = pct + '%';
}
function impSetProgress(pct) {
  const fill = document.getElementById('impProgressFill');
  if (fill) fill.style.width = pct + '%';
}
function impHideProgress() {
  const container = document.getElementById('impProgress');
  if (container) container.classList.add('hidden');
}

/* ── JSON Import ── */

function handleJsonImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || (!data.works && !Array.isArray(data))) {
        document.getElementById('jsonFeedback').textContent = '❌ Formato inválido. Esperado {"works": [...]}';
        document.getElementById('jsonFeedback').style.color = 'var(--red)';
        return;
      }
      const items = data.works || data;
      if (!Array.isArray(items) || !items.length) {
        document.getElementById('jsonFeedback').textContent = '⚠️ Nenhuma obra encontrada no arquivo.';
        document.getElementById('jsonFeedback').style.color = 'var(--warning, #f59e0b)';
        return;
      }
      impShowProgress('Importando...', 10);
      let imported = 0, skipped = 0, dupes = 0;
      items.forEach((raw, i) => {
        const item = normalizeItem({ ...raw, id: raw.id || String(Date.now() + Math.random() + i) });
        if (!item.title) { skipped++; return; }
        if (alreadyInDb(item.title, item.type)) { dupes++; return; }
        db.push(item);
        imported++;
        if (i % 10 === 0) impSetProgress(10 + Math.round((i / items.length) * 80));
      });
      if (data.wishlist && Array.isArray(data.wishlist)) {
        data.wishlist.forEach(w => { if (!wishdb.some(x => x.title === w.title)) wishdb.push(w); });
      }
      save();
      if (imported) saveCatalogToFirestore(db);
      renderCatalogo();
      updateCounts();
      checkAchievements();
      impHideProgress();
      const fb = document.getElementById('jsonFeedback');
      const parts = [];
      if (imported) parts.push(`${imported} importada(s)`);
      if (dupes) parts.push(`${dupes} duplicata(s)`);
      if (skipped) parts.push(`${skipped} inválida(s)`);
      fb.textContent = `✅ ${parts.join(', ')}`;
      fb.style.color = 'var(--accent)';
      toast(`✅ ${imported} obra(s) importada(s)` + (dupes ? ` · ${dupes} duplicata(s)` : ''), '✅');
    } catch(err) {
      document.getElementById('jsonFeedback').textContent = '❌ Erro ao ler JSON: ' + err.message;
      document.getElementById('jsonFeedback').style.color = 'var(--red)';
      impHideProgress();
    }
  };
  reader.readAsText(file, 'UTF-8');
  event.target.value = '';
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
    id:     String(Date.now() + Math.random()),
    title,
    type,
    status,
    rating: Math.min(5, Math.max(0, rating)),
    year: '', author: '', platform: '', episodes: '', hours: '',
    genres: '', synopsis: '', opinion: '', cover: '',
    cinemaWatched: false, cinemaDate: '', cinemaName: '', cinemaCity: '', cinemaFormat: '',
    containerItems: [], containerDesc: '',
    emotions: {}, tags: [], fav: false,
    addedAt: new Date().toISOString(),
    finishedAt: status === 'Finalizado' ? new Date().toISOString() : null
  };
}

function alreadyInDb(title, type) {
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()
  const tNorm = norm(title)
  const typeNorm = norm(type)
  return db.some(x => norm(x.title) === tNorm && norm(x.type) === typeNorm)
}

function handleCsvImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const lines = e.target.result.split(/\r?\n/).filter(l => l.trim());
    if (lines.length === 0) {
      document.getElementById('csvFeedback').textContent = '⚠️ Arquivo vazio.';
      document.getElementById('csvFeedback').style.color = 'var(--warning, #f59e0b)';
      return;
    }
    impShowProgress('Importando CSV...', 5);
    let imported = 0, skipped = 0;
    const delimiter = lines[0].includes(';') ? ';' : ',';
    const startIdx = lines[0].toLowerCase().includes('title') ? 1 : 0;
    let dupes = 0;
    lines.slice(startIdx).forEach((line, i) => {
      const cells = line.split(delimiter);
      const item = parseImportRow(cells);
      if (item) {
        if (alreadyInDb(item.title, item.type)) { dupes++; return }
        db.push(item); imported++;
      }
      else skipped++;
      if (i % 20 === 0) impSetProgress(5 + Math.round((i / lines.length) * 85));
    });
    save();
    if (imported) saveCatalogToFirestore(db);
    renderCatalogo();
    updateCounts();
    checkAchievements();
    impHideProgress();
    const fb = document.getElementById('csvFeedback');
    const parts = []
    if (imported) parts.push(`${imported} importada(s)`)
    if (dupes) parts.push(`${dupes} duplicata(s)`)
    if (skipped) parts.push(`${skipped} inválida(s)`)
    fb.textContent = `✅ ${parts.join(', ')}`;
    fb.style.color = 'var(--accent)';
    const toastMsg = imported ? `${imported} obra(s) importada(s)` : 'Nenhuma obra nova'
    const toastExtra = dupes ? ` · ${dupes} duplicata(s)` : ''
    toast(`✅ ${toastMsg}${toastExtra}`, '✅');
  };
  reader.readAsText(file, 'UTF-8');
  event.target.value = '';
}

function handlePasteImport() {
  const text = document.getElementById('pasteInput').value;
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  let imported = 0, skipped = 0, dupes = 0;
  lines.forEach(line => {
    const cells = line.split('|');
    const item = parseImportRow(cells);
    if (item) {
      if (alreadyInDb(item.title, item.type)) { dupes++; return }
      db.push(item); imported++;
    }
    else skipped++;
  });
  save();
  if (imported) saveCatalogToFirestore(db);
  renderCatalogo();
  updateCounts();
  checkAchievements();
  const fb = document.getElementById('pasteFeedback');
  if (imported === 0 && dupes === 0) {
    fb.textContent = '⚠️ Nenhuma linha válida encontrada. Verifique o formato.';
    fb.style.color = 'var(--warning, #f59e0b)';
    return;
  }
  const parts = []
  if (imported) parts.push(`${imported} importada(s)`)
  if (dupes) parts.push(`${dupes} duplicata(s) ignorada(s)`)
  if (skipped) parts.push(`${skipped} inválida(s)`)
  fb.textContent = `✅ ${parts.join(', ')}`;
  fb.style.color = 'var(--accent)';
  const toastMsg = imported ? `${imported} obra(s) importada(s)` : 'Nenhuma obra nova'
  const toastExtra = dupes ? ` · ${dupes} duplicata(s)` : ''
  toast(`✅ ${toastMsg}${toastExtra}`, '✅');
  setTimeout(() => document.getElementById('importOverlay').classList.remove('open'), 1500);
}

/* ── COMPARTILHAMENTO SOCIAL ── */
async function shareDetail(id) {
  const item = findInDb(id);
  if (!item) return;
  if (!window.html2canvas) {
    toast('⚠️ Ferramenta de exportação ainda carregando...', '⚠️');
    return;
  }
  
  toast('⏳ Gerando imagem...', '⏳');
  
  const container = document.createElement('div');
  const t = TIPO[item.type] || { icon: 'movie', color: '#555' };
  
  container.innerHTML = `
    <div id="shareCard" style="width: 400px; padding: 40px; background: linear-gradient(135deg, ${t.color}80, #000); border-radius: 20px; color: #fff; font-family: 'Outfit', sans-serif; position: fixed; top: -9999px; left: -9999px;">
      <div style="background: rgba(0,0,0,0.6); backdrop-filter: blur(20px); border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 20px;">
          ${item.cover ? `<img src="${esc(item.cover)}" style="width: 100px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">` : ''}
          <div>
            <div style="font-size: 1.5rem; font-weight: 700; line-height: 1.2; margin-bottom: 8px;">${esc(item.title)}</div>
            <div style="color: ${t.color}; font-weight: 600; margin-bottom: 8px;"><span class="material-symbols-rounded" style="vertical-align:middle">${esc(t.icon)}</span> ${esc(item.type)} ${item.year ? '· ' + item.year : ''}</div>
            ${item.rating ? `<div style="color: #ffc107; font-size: 1.2rem;">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</div>` : ''}
          </div>
        </div>
        ${item.opinion ? `
          <div style="background: rgba(255,255,255,0.05); padding: 16px; border-radius: 12px; font-style: italic; font-size: 1.1rem; line-height: 1.5;">
            "${esc(item.opinion)}"
          </div>
        ` : ''}
        <div style="margin-top: 20px; text-align: center; font-size: 0.9rem; opacity: 0.6;">
          Minha Biblioteca App
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(container);
  
  try {
    const el = document.getElementById('shareCard');
    const canvas = await html2canvas(el, { backgroundColor: null, scale: 2, useCORS: true });
    document.body.removeChild(container);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'share.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: item.title,
          text: 'Confira minha avaliação sobre ' + item.title
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${item.title.replace(/\s+/g, '_')}_share.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast('✅ Imagem salva!', '✅');
      }
    }, 'image/png');
  } catch (err) {
    console.error('Erro ao gerar share:', err);
    toast('❌ Erro ao gerar imagem.', '❌');
    if (container.parentNode) document.body.removeChild(container);
  }
}

/* ═══════════════════════════════════════════
   PACKAGE 011 — EXPORT FUNCTIONS
   ═══════════════════════════════════════════ */

function exportJson() {
  const data = { exportedAt: new Date().toISOString(), works: db, wishlist: wishdb };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `indexa_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  document.getElementById('exportFeedback').textContent = '✅ JSON exportado com ' + db.length + ' obras!';
  toast('✅ JSON exportado!', '✅');
}

function exportCsv(opts = {}) {
  const header = opts.simple
    ? 'title,type,status,rating'
    : 'title,type,status,rating,year,genres,author,platform,synopsis,opinion,tags';
  const rows = db.map(item => {
    const esc = s => '"' + String(s||'').replace(/"/g, '""') + '"';
    const genres = (item.genres||'').split(',').map(g => g.trim()).filter(Boolean).join(';');
    const tags = (item.tags||[]).join(';');
    if (opts.simple) {
      return [esc(item.title), esc(item.type), esc(item.status), item.rating||0].join(',');
    }
    return [esc(item.title), esc(item.type), esc(item.status), item.rating||0,
      esc(item.year), esc(genres), esc(item.author||''), esc(item.platform||''),
      esc(item.synopsis||''), esc(item.opinion||''), esc(tags)
    ].join(',');
  }).join('\n');

  const bom = '\uFEFF';
  const blob = new Blob([bom + header + '\n' + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `indexa_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  const label = opts.simple ? 'CSV simples' : 'CSV';
  document.getElementById('exportFeedback').textContent = `✅ ${label} exportado com ${db.length} obras!`;
  toast(`✅ ${label} exportado!`, '✅');
}

function exportExcel() {
  // Generate a simple XLSX-compatible XML spreadsheet
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Worksheet ss:Name="Obras">
  <Table>
   <Row>
    <Cell><Data ss:Type="String">Título</Data></Cell>
    <Cell><Data ss:Type="String">Tipo</Data></Cell>
    <Cell><Data ss:Type="String">Status</Data></Cell>
    <Cell><Data ss:Type="String">Nota</Data></Cell>
    <Cell><Data ss:Type="String">Ano</Data></Cell>
    <Cell><Data ss:Type="String">Gêneros</Data></Cell>
    <Cell><Data ss:Type="String">Autor/Diretor</Data></Cell>
    <Cell><Data ss:Type="String">Plataforma</Data></Cell>
   </Row>
   ${db.map(item => `   <Row>
    <Cell><Data ss:Type="String">${esc(String(item.title||''))}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(item.type||'')}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(item.status||'')}</Data></Cell>
    <Cell><Data ss:Type="Number">${item.rating||0}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(item.year||'')}</Data></Cell>
    <Cell><Data ss:Type="String">${esc((item.genres||'').split(',').map(g=>g.trim()).filter(Boolean).join(';'))}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(item.author||'')}</Data></Cell>
    <Cell><Data ss:Type="String">${esc(item.platform||'')}</Data></Cell>
   </Row>`).join('\n')}
  </Table>
 </Worksheet>
</Workbook>`;
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `indexa_${new Date().toISOString().slice(0,10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
  document.getElementById('exportFeedback').textContent = `✅ Excel exportado com ${db.length} obras!`;
  toast('✅ Excel exportado!', '✅');
}

/* ═══════════════════════════════════════════
   PACKAGE 011 — AUTO-BACKUP
   ═══════════════════════════════════════════ */

let autoBackupTimer = null;
function startAutoBackup() {
  stopAutoBackup();
  autoBackupTimer = setInterval(() => {
    try {
      const backupKey = 'indexa_autobackup';
      const data = { backedUpAt: new Date().toISOString(), works: db, wishlist: wishdb };
      localStorage.setItem(backupKey, JSON.stringify(data));
    } catch (_) {}
  }, 5 * 60 * 1000); // every 5 minutes
}
function stopAutoBackup() {
  if (autoBackupTimer) { clearInterval(autoBackupTimer); autoBackupTimer = null; }
}
function restoreAutoBackup() {
  try {
    const raw = localStorage.getItem('indexa_autobackup');
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.works || !data.works.length) return false;
    const date = new Date(data.backedUpAt).toLocaleDateString('pt-BR');
    if (!confirm(`Restaurar backup automático de ${date} (${data.works.length} obras)?`)) return false;
    db = data.works.map(normalizeItem);
    wishdb = data.wishlist || [];
    save();
    renderCatalogo();
    renderHome();
    navigate('biblioteca');
    toast(`✅ Backup de ${date} restaurado!`, '✅');
    return true;
  } catch (_) { return false; }
}
// Start auto-backup on load
setTimeout(startAutoBackup, 3000);
