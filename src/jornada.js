function suggestNextSoon(item) {
  const seen = new Set(JSON.parse(localStorage.getItem(SUGGEST_SEEN_KEY) || '[]'));
  if (seen.has(item.id)) return;
  seen.add(item.id);
  localStorage.setItem(SUGGEST_SEEN_KEY, JSON.stringify([...seen]));

  setTimeout(async () => {
    const jornada = await fetchJornada(item);
    if (!jornada.nextRecommended) return;
    const nr = jornada.nextRecommended;
    const toastId = 'jor-suggest-' + item.id;
    const t = TIPO[nr.type] || { icon: 'movie', color: '#555' };
    const existing = document.getElementById(toastId);
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = toastId;
    panel.style.cssText = 'position:fixed;bottom:100px;right:16px;z-index:9999;background:var(--surface);border:1px solid var(--border2);border-radius:var(--radius-lg);padding:var(--space-4);box-shadow:0 8px 32px rgba(0,0,0,.3);max-width:320px;animation:fadeIn .3s ease;';
    panel.innerHTML = `
      <div style="font-size:var(--font-sm);font-weight:var(--weight-bold);color:var(--text);margin-bottom:var(--space-2)">Você concluiu esta obra!</div>
      <div style="font-size:var(--font-xs);color:var(--text3);margin-bottom:var(--space-2)">Próximo recomendado:</div>
      <div style="display:flex;gap:var(--space-3);cursor:pointer;padding:var(--space-2);border-radius:var(--radius-sm);background:var(--surface2)" onclick="jornadaOpenOrAdd('${esc(nr.title).replace(/'/g,"\\'")}','${nr.type}','${nr.cover ? esc(nr.cover).replace(/'/g,"\\'") : ''}','${item.id}')">
        <div style="width:50px;height:75px;border-radius:4px;overflow:hidden;flex-shrink:0;background:var(--surface3);display:flex;align-items:center;justify-content:center;font-size:1.5rem">
          ${nr.cover ? `<img src="${esc(nr.cover)}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<span class="material-symbols-rounded">${esc(t.icon)}</span>`}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:var(--font-sm);font-weight:var(--weight-bold);color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nr.title)}</div>
          <div style="font-size:var(--font-xs);color:var(--text3)"><span class="material-symbols-rounded">${esc(t.icon)}</span> ${nr.type}${nr.year ? ' · ' + nr.year : ''}</div>
        </div>
      </div>
      <div style="display:flex;gap:var(--space-2);margin-top:var(--space-2)">
        <button class="btn btn-primary" style="flex:1;padding:6px 12px;font-size:var(--font-xs)" onclick="jornadaOpenOrAdd('${esc(nr.title).replace(/'/g,"\\'")}','${nr.type}','${nr.cover ? esc(nr.cover).replace(/'/g,"\\'") : ''}','${item.id}');this.closest('div[style]').remove()">Adicionar agora</button>
        <button class="btn btn-ghost" style="flex:1;padding:6px 12px;font-size:var(--font-xs)" onclick="this.closest('div[style]').remove()">Depois</button>
      </div>
    `;
    document.body.appendChild(panel);

    setTimeout(() => { const e = document.getElementById(toastId); if (e) e.remove(); }, 15000);
  }, 500);
}

function getStatusIcon(status) {
  if (status === 'Finalizado') return '✅';
  if (status === 'Assistindo') return '📖';
  if (status === 'Quero assistir') return '⏳';
  return '⏳';
}

function detectFranchise(title, type) {
  const cleaned = title.replace(/[:\-–—]+\s*(vol\.?\s*\d+|volume\s*\d+|part\s*\d+|season\s*\d+|episódio\s*\d+|ep\.?\s*\d+)/gi, '').trim();
  const separators = [' - ', ' – ', ' — ', ': ', ': '];
  for (const sep of separators) {
    const idx = cleaned.indexOf(sep);
    if (idx > 0) return cleaned.substring(0, idx).trim();
  }
  return cleaned;
}

function parseSeriesOrder(title) {
  const patterns = [
    /vol\.?\s*(\d+)/i,
    /volume\s*(\d+)/i,
    /part\s*(\d+)/i,
    /season\s*(\d+)/i,
    /livro\s*(\d+)/i,
    /tom(o|e)\s*(\d+)/i,
    /#(\d+)/,
    /\((\d+)\)/,
    /^(\d+)[\.\)]\s+/,
  ];
  for (const p of patterns) {
    const m = title.match(p);
    if (m) return parseInt(m[1] || m[2]);
  }
  return 999;
}

async function fetchJornada(item) {
  const franchise = detectFranchise(item.title, item.type);
  const cacheKey = franchise + '|' + item.type;

  if (jornadaCache.has(cacheKey)) return jornadaCache.get(cacheKey);

  const result = { franchise, categories: {}, items: [], nextRecommended: null, progress: { completed: 0, total: 0 } };
  const titleLower = item.title.toLowerCase();

  try {
    let allRelated = [];

    if (item.type === 'Anime' || item.type === 'Mangá') {
      const apiResults = await fetchJornadaAniList(item.title, item.type);
      allRelated.push(...apiResults);
    } else if (item.type === 'Filme' || item.type === 'Série' || item.type === 'Dorama') {
      const apiResults = await fetchJornadaTMDB(item.title, item.type);
      allRelated.push(...apiResults);
    } else if (item.type === 'Jogo') {
      const apiResults = await fetchJornadaRAWG(item.title);
      allRelated.push(...apiResults);
    } else if (item.type === 'Livro') {
      const apiResults = await fetchJornadaOpenLibrary(item.title);
      allRelated.push(...apiResults);
    }

    const crossMedia = getCrossMediaItems(item);
    allRelated.unshift(...crossMedia);

    const seen = new Set();
    allRelated = allRelated.filter(r => {
      const key = r.title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const jornadaItems = allRelated.map(r => {
      const dbItem = db.find(x => x.title.toLowerCase() === r.title.toLowerCase());
      return {
        ...r,
        dbItem: dbItem || null,
        exists: !!dbItem,
        seriesOrder: parseSeriesOrder(r.title),
        status: dbItem ? dbItem.status : 'missing',
        isCurrent: dbItem && dbItem.id === item.id
      };
    });

    jornadaItems.sort((a, b) => {
      if (a.isCurrent) return -1;
      if (b.isCurrent) return 1;
      return a.seriesOrder - b.seriesOrder;
    });

    result.items = jornadaItems;

    const catOrder = ['Anime','Mangá','Filme','Série','Dorama','Jogo','Livro'];
    for (const ci of jornadaItems) {
      const cat = ci.type;
      if (!result.categories[cat]) result.categories[cat] = { label: cat, items: [], icon: typeIcon(cat) };
      result.categories[cat].items.push(ci);
    }

    const completed = jornadaItems.filter(x => x.status === 'Finalizado').length;
    const total = jornadaItems.length;
    result.progress = { completed, total };

    const currentIdx = jornadaItems.findIndex(x => x.isCurrent);
    if (currentIdx >= 0) {
      for (let i = currentIdx + 1; i < jornadaItems.length; i++) {
        if (!jornadaItems[i].exists) {
          result.nextRecommended = jornadaItems[i];
          break;
        }
      }
      if (!result.nextRecommended) {
        for (let i = currentIdx + 1; i < jornadaItems.length; i++) {
          if (jornadaItems[i].status !== 'Finalizado') {
            result.nextRecommended = jornadaItems[i];
            break;
          }
        }
      }
    }

    if (jornadaItems.length > 0) {
      jornadaCache.set(cacheKey, result);
    }

  } catch (err) {
    console.error('fetchJornada error:', err);
  }

  return result;
}

function getCrossMediaItems(item) {
  const franchise = detectFranchise(item.title, item.type);
  const results = [];

  const related = db.filter(x => x.id !== item.id && detectFranchise(x.title, x.type).toLowerCase() === franchise.toLowerCase());
  for (const ri of related) {
    if (!results.some(r => r.title.toLowerCase() === ri.title.toLowerCase())) {
      results.push({ title: ri.title, type: ri.type, cover: ri.cover || '', year: ri.year || '', relation: '' });
    }
  }
  return results;
}

async function fetchJornadaAniList(title, type) {
  const mediaType = type === 'Mangá' ? 'MANGA' : 'ANIME';
  const query = `
    query($search: String, $type: MediaType) {
      Media(search: $search, type: $type, sort: SEARCH_MATCH) {
        title { romaji english }
        relations { edges { relationType(version:2) node { id title { romaji english } type coverImage { large } startDate { year } } } }
        synonyms
      }
    }`;
  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables: { search: title, type: mediaType } })
  });
  const data = await res.json();
  const media = data.data?.Media;
  if (!media?.relations?.edges) return [];

  const relMap = { PREQUEL:'Prequel', SEQUEL:'Sequência', SIDE_STORY:'História paralela', SPIN_OFF:'Spin-off', ADAPTATION:'Adaptação', SUMMARY:'Resumo', COMPILATION:'Compilação', CONTAINS:'Contém', CHARACTER:'Personagem', OTHER:'Outro', SOURCE:'Fonte', ALTERNATIVE:'Alternativo', PARENT:'Original' };

  const results = media.relations.edges.map(e => {
    const n = e.node;
    const t = n.title?.romaji || n.title?.english || '';
    const resultType = n.type === 'MANGA' ? 'Mangá' : n.type === 'ANIME' ? 'Anime' : type;
    return {
      title: t,
      type: resultType,
      cover: n.coverImage?.large || '',
      year: n.startDate?.year ? String(n.startDate.year) : '',
      relation: relMap[e.relationType] || e.relationType,
      apiId: String(n.id),
    };
  }).filter(r => r.title);

  if (!results.length) {
    const franchise = detectFranchise(title, type);
    const searchQuery = `
      query($search: String) {
        Page(page:1,perPage:10) {
          media(search:$search, type:${mediaType}, sort:SEARCH_MATCH) {
            id title { romaji english } type coverImage { large } startDate { year }
          }
        }
      }`;
    try {
      const sr = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query: searchQuery, variables: { search: franchise } })
      });
      const sd = await sr.json();
      const list = sd.data?.Page?.media || [];
      list.forEach(n => {
        const t = n.title?.romaji || n.title?.english || '';
        if (t && t.toLowerCase() !== title.toLowerCase() && !results.some(r => r.title.toLowerCase() === t.toLowerCase())) {
          results.push({
            title: t,
            type: n.type === 'MANGA' ? 'Mangá' : 'Anime',
            cover: n.coverImage?.large || '',
            year: n.startDate?.year ? String(n.startDate.year) : '',
            relation: 'Relacionado',
          });
        }
      });
    } catch (_) {}
  }

  return results;
}

async function fetchJornadaTMDB(title, type) {
  const mediaType = type === 'Filme' ? 'movie' : 'tv';
  const url = `https://api.themoviedb.org/3/search/${mediaType}?query=${encodeURIComponent(title)}&api_key=${TMDB_KEY}&language=pt-BR`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.results?.length) return [];

  const first = data.results[0];
  const detUrl = `https://api.themoviedb.org/3/${mediaType}/${first.id}?api_key=${TMDB_KEY}&language=pt-BR`;
  const detRes = await fetch(detUrl);
  if (!detRes.ok) return [];
  const det = await detRes.json();
  let items = [];

  if (det.belongs_to_collection) {
    const colUrl = `https://api.themoviedb.org/3/collection/${det.belongs_to_collection.id}?api_key=${TMDB_KEY}&language=pt-BR`;
    const colRes = await fetch(colUrl);
    const col = await colRes.json();
    if (col.parts) {
      items = col.parts.map(p => ({
        title: p.title || p.name || '',
        type: p.media_type === 'tv' ? 'Série' : 'Filme',
        cover: p.poster_path ? TMDB_IMG + p.poster_path : '',
        year: (p.release_date || p.first_air_date || '').slice(0,4),
        relation: 'Coleção ' + (det.belongs_to_collection.name || ''),
      })).filter(r => r.title);
    }
  }

  if (!items.length) {
    const franchise = detectFranchise(title, type);
    if (franchise !== title) {
      for (const mt of ['movie', 'tv']) {
        const furi = `https://api.themoviedb.org/3/search/${mt}?query=${encodeURIComponent(franchise)}&api_key=${TMDB_KEY}&language=pt-BR`;
        try {
          const fures = await fetch(furi);
          const fudata = await fures.json();
          (fudata.results || []).slice(0, 5).forEach(p => {
            const pt = p.title || p.name || '';
            if (pt && !items.some(i => i.title.toLowerCase() === pt.toLowerCase()) && pt.toLowerCase() !== title.toLowerCase()) {
              items.push({
                title: pt,
                type: mt === 'movie' ? 'Filme' : 'Série',
                cover: p.poster_path ? TMDB_IMG + p.poster_path : '',
                year: (p.release_date || p.first_air_date || '').slice(0,4),
                relation: '',
              });
            }
          });
        } catch (_) {}
      }
    }
  }

  return items;
}

async function fetchJornadaRAWG(title) {
  const franchise = detectFranchise(title, 'Jogo');
  let items = [];

  const url = `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(franchise)}&page_size=10`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    (data.results || []).slice(0, 8).forEach(p => {
      const pt = p.name || '';
      if (pt && pt.toLowerCase() !== title.toLowerCase()) {
        items.push({
          title: pt,
          type: 'Jogo',
          cover: p.background_image || '',
          year: (p.released || '').slice(0,4),
          relation: '',
        });
      }
    });
  } catch (_) {}

  return items;
}

async function fetchJornadaOpenLibrary(title) {
  const franchise = detectFranchise(title, 'Livro');
  let items = [];

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(franchise)}&limit=15&fields=title,first_publish_year,cover_i,key,seed`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const seen = new Set();

    (data.docs || []).forEach(p => {
      const pt = p.title || '';
      if (!pt) return;
      const lower = pt.toLowerCase();
      if (lower === title.toLowerCase() || seen.has(lower)) return;
      seen.add(lower);

      items.push({
        title: pt,
        type: 'Livro',
        cover: p.cover_i ? `https://covers.openlibrary.org/b/id/${p.cover_i}-L.jpg` : '',
        year: p.first_publish_year ? String(p.first_publish_year) : '',
        relation: '',
      });
    });
  } catch (_) {}

  return items;
}

function renderJornadaTab(item) {
  return `
    <div id="jornadaContent" class="jor-loading">Carregando jornada…</div>
  `;
}

async function loadJornada(item) {
  const el = document.getElementById('jornadaContent');
  if (!el) return;

  const jornada = await fetchJornada(item);
  if (!jornada.items.length) {
    el.innerHTML = '<div style="color:var(--text3);font-size:var(--font-sm);padding:var(--space-4) 0;text-align:center">Nenhuma obra relacionada encontrada para esta jornada.</div>';
    return;
  }

  const pct = jornada.progress.total > 0 ? Math.round(jornada.progress.completed / jornada.progress.total * 100) : 0;
  const barW = jornada.progress.total > 0 ? Math.round(jornada.progress.completed / jornada.progress.total * 100) : 0;

  let nextHtml = '';
  if (jornada.nextRecommended) {
    const nr = jornada.nextRecommended;
    const t = TIPO[nr.type] || { icon: 'movie', color: '#555' };
    nextHtml = `
      <div class="jor-next-card">
        <div class="jor-next-label">Próximo recomendado</div>
        <div class="jor-next-inner" onclick="jornadaOpenOrAdd('${esc(nr.title).replace(/'/g,"\\'")}','${nr.type}','${nr.cover ? esc(nr.cover).replace(/'/g,"\\'") : ''}','${item.id}')">
          <div class="jor-next-poster">
            ${nr.cover ? `<img src="${esc(nr.cover)}" alt="" loading="lazy" onerror="this.parentNode.innerHTML='<span class=\\'material-symbols-rounded\\'>${esc(t.icon)}</span>'">` : `<span class="material-symbols-rounded" style="font-size:2rem">${esc(t.icon)}</span>`}
          </div>
          <div class="jor-next-info">
            <div class="jor-next-title">${esc(nr.title)}</div>
            <div class="jor-next-meta"><span class="material-symbols-rounded">${esc(t.icon)}</span> ${nr.type}${nr.year ? ' · ' + nr.year : ''}</div>
            ${nr.exists
              ? '<div class="jor-next-status done">✔ Já está na biblioteca</div>'
              : '<div class="jor-next-add">+ Adicionar à biblioteca</div>'}
          </div>
        </div>
      </div>`;
  }

  const catOrder = ['Anime','Mangá','Filme','Série','Dorama','Jogo','Livro'];
  const categoryKeys = Object.keys(jornada.categories).sort((a, b) => catOrder.indexOf(a) - catOrder.indexOf(b));

  let categoriesHtml = '';
  for (const cat of categoryKeys) {
    const group = jornada.categories[cat];
    const done = group.items.filter(x => x.status === 'Finalizado').length;
    const totalInCat = group.items.length;

    categoriesHtml += `
      <details class="jor-category" ${cat === item.type ? 'open' : ''}>
        <summary class="jor-category-header">
          <span class="jor-category-icon"><span class="material-symbols-rounded">${esc(group.icon)}</span></span>
          <span class="jor-category-name">${cat}</span>
          <span class="jor-category-count">${done}/${totalInCat}</span>
        </summary>
        <div class="jor-category-items">
          ${group.items.map(ci => {
            const isCurrent = ci.isCurrent;
            const typeInfo = TIPO[ci.type] || { icon: 'movie', color: '#555' };
            let statusBadge = '';
            if (ci.status === 'Finalizado') statusBadge = '<span class="jor-badge done">✔</span>';
            else if (ci.status === 'Assistindo') statusBadge = '<span class="jor-badge watching">▶</span>';
            else if (ci.exists) statusBadge = '<span class="jor-badge todo">⏳</span>';
            else statusBadge = '<span class="jor-badge missing">+</span>';

            let rightAction = '';
            if (ci.exists && ci.dbItem) {
              rightAction = `<button class="jor-item-link" onclick="openDetail('${ci.dbItem.id}')"><span class="material-symbols-rounded">${esc(typeIcon(ci.type))}</span></button>`;
            } else {
              rightAction = `<button class="jor-item-add" onclick="jornadaAddFromApi('${esc(ci.title).replace(/'/g,"\\'")}','${ci.type}','${ci.cover ? esc(ci.cover).replace(/'/g,"\\'") : ''}','${item.id}')">+</button>`;
            }

            const relTag = ci.relation ? `<span class="jor-rel-tag">${esc(ci.relation)}</span>` : '';

            return `<div class="jor-item ${isCurrent ? 'current' : ''}">
              ${statusBadge}
              <div class="jor-item-title">${esc(ci.title)}</div>
              ${relTag}
              ${rightAction}
            </div>`;
          }).join('')}
        </div>
      </details>`;
  }

  el.innerHTML = `
    <div class="jor-header">
      <div class="jor-franchise">${esc(jornada.franchise)}</div>
      ${jornada.progress.total > 0 ? `
        <div class="jor-progress-bar">
          <div class="jor-progress-fill" style="width:${barW}%"></div>
        </div>
        <div class="jor-progress-text">${jornada.progress.completed} de ${jornada.progress.total} obras</div>
      ` : ''}
    </div>

    ${nextHtml}

    <div class="jor-categories">
      ${categoriesHtml}
    </div>
  `;
}

function jornadaOpenOrAdd(title, type, cover, originalId) {
  const found = db.find(x => x.title.toLowerCase() === title.toLowerCase());
  if (found) { openDetail(found.id); return; }
  jornadaAddFromApi(title, type, cover, originalId);
}

async function jornadaAddFromApi(title, type, cover, originalId) {
  let apiData = {};
  try {
    if (type === 'Filme' || type === 'Série' || type === 'Dorama') {
      apiData = await searchTMDB(title, type) || {};
    } else if (type === 'Anime' || type === 'Mangá') {
      apiData = await searchAniList(title, type) || {};
    } else if (type === 'Jogo') {
      apiData = await searchRAWG(title) || {};
    } else if (type === 'Livro') {
      apiData = await searchOpenLibrary(title) || {};
    }
  } catch (_) {}

  const actualStatus = type === 'Livro' || type === 'Mangá' ? 'Quero ler' : type === 'Jogo' ? 'Quero jogar' : 'Quero assistir';

  const item = {
    id: String(Date.now() + Math.random()),
    title,
    type,
    status: actualStatus,
    rating: 0,
    year: apiData.year || '',
    author: apiData.author || '',
    platform: '',
    episodes: apiData.episodes || '',
    hours: '',
    genres: apiData.genres || '',
    synopsis: apiData.synopsis || '',
    opinion: '',
    cover: apiData.cover || cover || '',
    cinemaWatched: false, cinemaDate: '', cinemaName: '', cinemaCity: '', cinemaFormat: '',
    containerItems: [], containerDesc: '',
    emotions: {}, tags: [], fav: false,
    addedAt: new Date().toISOString(),
    finishedAt: null,
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

function renderHistoricoTab(item) {
  const entries = [];
  if (item.addedAt) {
    entries.push({ icon: '➕', event: 'Adicionado ao catálogo', date: item.addedAt });
  }
  if (item.finishedAt) {
    entries.push({ icon: '✅', event: 'Finalizado', date: item.finishedAt });
  }
  const saved = localStorage.getItem('catalogo_saved');
  if (saved) {
    entries.push({ icon: '💾', event: 'Última modificação', date: saved });
  }

  entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!entries.length) {
    return `<div style="color:var(--text3);font-size:var(--font-sm);padding:var(--space-4) 0;text-align:center">Nenhum histórico disponível.</div>`;
  }

  return entries.map(e => {
    const d = new Date(e.date);
    const formatted = d.toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
    return `<div class="hist-item">
      <div class="hist-icon">${e.icon}</div>
      <div class="hist-info">
        <div class="hist-event">${e.event}</div>
        <div class="hist-date">${formatted}</div>
      </div>
    </div>`;
  }).join('');
}
