function translateGenres(genres) {
  return genres.map(g => GENRE_PT[g] || g).join(', ');
}

/* ── TMDB ── */
async function searchTMDB(title, type) {
  const mediaType = (type === 'Filme') ? 'movie' : 'tv';
  const url = `${TMDB_BASE}/search/${mediaType}?query=${encodeURIComponent(title)}&api_key=${TMDB_KEY}&language=pt-BR`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.results || !data.results.length) return [];

  return data.results.slice(0, 5).map(item => {
    const adapted = tmdbAdapter(item, type);
    adapted._source = 'TMDB';
    adapted._apiId = item.id;
    return adapted;
  });
}

/* ── AniList ── */
async function searchAniList(title, type) {
  const mediaType = type === 'Mangá' ? 'MANGA' : 'ANIME';
  const query = `
    query($search: String, $type: MediaType) {
      Page(perPage: 5) {
        media(search: $search, type: $type, sort: SEARCH_MATCH) {
          title { romaji english native }
          startDate { year }
          description(asHtml: false)
          coverImage { large }
          genres
          episodes
          chapters
          duration
          status
          source
          staff(sort: ROLE, perPage: 5) {
            edges { role node { name { full } } }
          }
          studios {
            edges { isMain node { name } }
          }
        }
      }
    }
  `;
  const res  = await fetch('https://graphql.anilist.co', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({ query, variables: { search: title, type: mediaType } })
  });
  if (!res.ok) return [];
  const data = await res.json();
  const page = data.data && data.data.Page;
  if (!page || !page.media || !page.media.length) return [];

  return page.media.slice(0, 5).map(m => {
    const adapted = anilistAdapter(m, type);
    adapted._source = 'AniList';
    adapted._apiId = m.id;
    return adapted;
  });
}

/* ── Google Books ── */
async function searchGoogleBooks(title, author) {
  const q = author ? `${title} ${author}` : title;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&key=${GOOGLE_BOOKS_KEY}&maxResults=5`;
  try {
    const res  = await fetch(url);
    const data = await res.json();
    if (data.error) { console.warn('Google Books API error:', data.error); return []; }
    if (!data.items || !data.items.length) return [];

    return data.items.slice(0, 5).map(v => {
      const info = v.volumeInfo || {};
      let cover = '';
      if (info.imageLinks) {
        cover = (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '').replace(/^http:/, 'https:');
      }
      let synopsis = info.description || '';
      if (synopsis) {
        synopsis = synopsis.replace(/<[^>]+>/g, '').trim();
        synopsis = synopsis.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
      }

      let isbn = '';
      if (info.industryIdentifiers) {
        const isbn13 = info.industryIdentifiers.find(i => i.type === 'ISBN_13');
        const isbn10 = info.industryIdentifiers.find(i => i.type === 'ISBN_10');
        isbn = (isbn13 || isbn10 || {}).identifier || '';
      }

      return {
        title: info.title || '',
        year: (info.publishedDate || '').slice(0,4),
        creator: (info.authors || [])[0] || '',
        studio: '', developer: '', publisher: (info.publisher || ''),
        genres: (info.categories || []).slice(0,4).join(', '),
        cover, synopsis,
        durationMinutes: '', episodes: '', seasons: '', chapters: '',
        pages: info.pageCount || '',
        source: '', anilistStatus: '', rating: '', esrb: '', platform: '', readUrl: '',
        externalIds: { tmdbId: '', anilistId: '', rawgId: '', isbn },
        _source: 'Google Books'
      };
    });
  } catch(_) { return []; }
}

/* ── Open Library (search) ── */
async function searchOpenLibrary(title, author) {
  const q = author ? `${title} ${author}` : title;
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=5`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.docs || !data.docs.length) return [];

    return data.docs.slice(0, 5).map(item => {
      const adapted = openLibraryAdapter(item, null);
      adapted._source = 'OpenLibrary';
      return adapted;
    });
  } catch(_) { return []; }
}

/* ── Open Library (by code: OLID / ISBN) ── */
async function fetchOpenLibraryByCode(code) {
  code = code.trim();
  if (!code) return null;

  let url;
  if (/^OL\d+/.test(code)) {
    url = `https://openlibrary.org${code.startsWith('/') ? '' : '/'}${code}.json`;
  } else if (/^\d{9,13}$/.test(code.replace(/-/g, ''))) {
    const isbn = code.replace(/-/g, '');
    url = `https://openlibrary.org/isbn/${isbn}.json`;
  } else {
    return null;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return openLibraryDetailAdapter(data);
  } catch(_) { return null; }
}

/* ── RAWG ── */
async function searchRAWG(title) {
  const url = `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(title)}&page_size=5`;
  const res  = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data.results || !data.results.length) return [];

  return data.results.slice(0, 5).map(item => {
    const adapted = rawgAdapter(item, null);
    adapted._source = 'RAWG';
    adapted._apiId = item.id;
    return adapted;
  });
}

/* ── Busca online (ponto de entrada) ── */
function clearApiStatus() {
  const el = document.getElementById('apiStatus');
  if (el) el.textContent = '';
  document.getElementById('f-olid-field')?.classList.add('hidden');
  document.getElementById('searchAcContainer')?.querySelector('.search-ac-results')?.remove();
}

let _lastApiSnapshot = {};

async function buscarOnline() {
  const title  = document.getElementById('f-title')?.value?.trim() || '';
  const type   = document.getElementById('f-type')?.value || '';
  if (!title || title.length < 2) return [];

  let author = '';
  if (type === 'Filme') author = document.getElementById('f-director')?.value?.trim() || '';
  else if (type === 'Série' || type === 'Dorama') author = document.getElementById('f-creator')?.value?.trim() || '';
  else if (type === 'Anime') author = document.getElementById('f-studio')?.value?.trim() || '';
  else if (type === 'Jogo') author = document.getElementById('f-developer')?.value?.trim() || '';
  else author = document.getElementById('f-author')?.value?.trim() || '';

  let results = [];

  try {
    if (type === 'Anime' || type === 'Mangá') {
      results = await searchAniList(title, type) || [];
    } else if (type === 'Livro') {
      results = await searchGoogleBooks(title, author) || [];
      if (!results.length) results = await searchOpenLibrary(title, author) || [];
    } else if (type === 'Jogo') {
      if (RAWG_KEY !== 'SUA_CHAVE_AQUI') results = await searchRAWG(title) || [];
    } else {
      if (TMDB_KEY !== 'SUA_CHAVE_AQUI') results = await searchTMDB(title, type) || [];
    }
  } catch(err) {
    console.error(err);
  }
  return results;
}

async function fetchBookByCode() {
  const code = document.getElementById('f-olid').value.trim();
  const errorEl = document.getElementById('f-olid-error');
  if (errorEl) errorEl.textContent = '';
  if (!code) { if (errorEl) errorEl.textContent = 'Digite um código válido.'; return; }

  const statusEl = document.getElementById('apiStatus');
  const btn = document.getElementById('btnBuscarOnline');
  statusEl.textContent = '⏳ Buscando por código…';
  statusEl.style.color = 'var(--text2)';

  const result = await fetchOpenLibraryByCode(code);
  if (result) {
    applyApiResult(result);
    previewCover();
    statusEl.textContent = '✅ Dados preenchidos via código!';
    statusEl.style.color = 'var(--accent)';
  } else {
    statusEl.textContent = '❌ Código não encontrado. Verifique e tente novamente.';
    statusEl.style.color = '#ef4444';
  }
}

function applyApiResult(r, highlight = false) {
  const fieldMap = {};
  const set = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined && val !== '') { fieldMap[id] = { el, old: el.value, new: val }; el.value = val; } };
  const type = document.getElementById('f-type')?.value || '';

  _lastApiSnapshot = {};

  set('f-title', r.title || r.titulo || '');
  set('f-year', r.year);
  set('f-synopsis', r.synopsis);
  set('f-cover', r.cover);
  set('f-genres', r.genres);
  set('f-episodes', r.episodes);
  set('f-season', r.seasons);
  const extIds = r.externalIds || {};
  set('f-tmdb-id', extIds.tmdbId);
  set('f-anilist-id', extIds.anilistId);
  set('f-rawg-id', extIds.rawgId);

  if (r.creator) {
    if (type === 'Filme') set('f-director', r.creator);
    else if (type === 'Série' || type === 'Dorama' || type === 'Anime') set('f-creator', r.creator);
    else if (type === 'Jogo') set('f-developer', r.creator);
    else set('f-author', r.creator);
  }
  if (r.studio && type === 'Anime') set('f-studio', r.studio);
  if (r.developer && type === 'Jogo' && !r.creator) set('f-developer', r.developer);
  if (r.publisher) set('f-publisher', r.publisher);
  if (r.durationMinutes) set('f-duration-minutes', r.durationMinutes);
  if (r.platform) set('f-platform', r.platform);
  if (r.readUrl) set('f-read-url', r.readUrl);
  if (r.anilistStatus && !document.getElementById('f-status')?.value) {
    const st = r.anilistStatus.toUpperCase();
    const isManga = type === 'Mangá';
    const stMap = { 'FINISHED':'Finalizado', 'RELEASING': isManga ? 'Lendo' : 'Assistindo', 'NOT_YET_RELEASED': isManga ? 'Quero ler' : 'Quero assistir', 'CANCELLED':'Abandonado', 'HIATUS':'Pausado' };
    if (stMap[st]) set('f-status', stMap[st]);
  }
  if (r.pages) set('f-pages', r.pages);
  if (r.chapters) set('f-chapters-total', r.chapters);
  if (r.rating && typeof setStar === 'function') setStar(Math.min(5, Math.max(0, parseInt(r.rating) || 0)));
  if (extIds.isbn) set('f-isbn', extIds.isbn);

  const cnEl = document.getElementById('f-cover-name');
  if (cnEl && r.cover) cnEl.textContent = 'Capa definida pela busca';

  if (highlight) {
    Object.entries(fieldMap).forEach(([id, { el, old, new: nv }]) => {
      if (old !== nv) {
        el.classList.add('editor-field-highlight');
        _lastApiSnapshot[id] = old;

        const undoBtn = document.createElement('button');
        undoBtn.className = 'api-undo-btn';
        undoBtn.textContent = 'Desfazer';
        undoBtn.onclick = (e) => {
          e.stopPropagation();
          el.value = _lastApiSnapshot[id] || '';
          el.classList.remove('editor-field-highlight');
          undoBtn.remove();
        };
        el.parentNode.appendChild(undoBtn);
      }
    });
    setTimeout(() => {
      document.querySelectorAll('.editor-field-highlight').forEach(el => el.classList.remove('editor-field-highlight'));
      document.querySelectorAll('.api-undo-btn').forEach(el => el.remove());
    }, 8000);
  }
}

/* ── Season / Episode Data (TMDB + AniList) ── */

const seasonDataCache = new Map();
const SEASON_CACHE_MAX = 50;
function cacheSet(cache, key, value) {
  if (cache.size >= SEASON_CACHE_MAX) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}

async function resolveTMDBId(item) {
  if (item.tmdbId) return item.tmdbId;
  if (item.type !== 'Série' && item.type !== 'Anime' && item.type !== 'Dorama') return null;
  const cacheKey = `tmdb_search_${item.title}`;
  if (seasonDataCache.has(cacheKey)) return seasonDataCache.get(cacheKey);
  try {
    const mediaType = (item.type === 'Filme') ? 'movie' : 'tv';
    const url = `${TMDB_BASE}/search/${mediaType}?query=${encodeURIComponent(item.title)}&api_key=${TMDB_KEY}&language=pt-BR`;
    const res = await fetch(url);
    const data = await res.json();
    const first = data.results && data.results[0];
    if (first) {
      cacheSet(seasonDataCache, cacheKey, first.id);
      return first.id;
    }
  } catch (_) {}
  cacheSet(seasonDataCache, cacheKey, null);
  return null;
}

async function fetchAllSeasonEpisodes(tmdbId, seasons) {
  const episodes = {};
  const fetches = seasons.map(async (s) => {
    const ck = `tmdb_${tmdbId}_s${s.seasonNumber}`;
    if (episodes[s.seasonNumber]) return;
    try {
      const url = `${TMDB_BASE}/tv/${tmdbId}/season/${s.seasonNumber}?api_key=${TMDB_KEY}&language=pt-BR`;
      const res = await fetch(url);
      const data = await res.json();
      episodes[s.seasonNumber] = (data.episodes || []).map(e => ({
        episodeNumber: e.episode_number,
        name: e.name || `Episódio ${e.episode_number}`,
        still: e.still_path ? TMDB_IMG + e.still_path : ''
      }));
    } catch (_) {
      episodes[s.seasonNumber] = [];
    }
  });
  await Promise.allSettled(fetches);
  return episodes;
}

async function fetchSeasonData(item) {
  const isSeries = item.type === 'Série' || item.type === 'Anime' || item.type === 'Dorama';
  if (!isSeries) return null;

  const cacheKey = `season_${item.id}`;
  if (seasonDataCache.has(cacheKey)) return seasonDataCache.get(cacheKey);

  let tmdbId = await resolveTMDBId(item);
  let result = null;

  if (tmdbId) {
    try {
      const tvUrl = `${TMDB_BASE}/tv/${tmdbId}?api_key=${TMDB_KEY}&language=pt-BR`;
      const tvRes = await fetch(tvUrl);
      const tvData = await tvRes.json();
      if (tvData.seasons) {
        const seasons = tvData.seasons
          .filter(s => s.episode_count > 0)
          .map(s => ({
            seasonNumber: s.season_number,
            episodeCount: s.episode_count,
            name: s.season_number === 0 ? 'Especiais' : (s.name && s.name !== `Season ${s.season_number}` ? s.name : `Temporada ${s.season_number}`),
            airDate: s.air_date || ''
          }))
          .sort((a, b) => {
            if (a.seasonNumber === 0 && b.seasonNumber === 0) return 0;
            if (a.seasonNumber === 0) return 1;
            if (b.seasonNumber === 0) return -1;
            return a.seasonNumber - b.seasonNumber;
          });

        if (seasons.length > 0) {
          const episodes = await fetchAllSeasonEpisodes(tmdbId, seasons);
          const allEpCount = seasons.reduce((acc, s) => acc + s.episodeCount, 0);
          result = { seasons, episodes, apiType: 'tmdb', tmdbId, allEpCount };
        }
      }
    } catch (e) {
      console.warn('TMDB season fetch failed:', e);
    }
  }

  if (!result && item.type === 'Anime' && item.episodes) {
    const total = parseInt(item.episodes) || 1;
    const epList = Array.from({ length: total }, (_, i) => ({ episodeNumber: i + 1 }));
    result = {
      seasons: [{ seasonNumber: 1, episodeCount: total, name: 'Episódios' }],
      episodes: { 1: epList },
      apiType: 'anilist',
      allEpCount: total
    };
  }

  if (!result) {
    result = { seasons: [], episodes: {}, apiType: null, allEpCount: 0 };
  }

  cacheSet(seasonDataCache, cacheKey, result);
  return result;
}

async function fetchSeasonEpisodes(tmdbId, seasonNumber) {
  try {
    const url = `${TMDB_BASE}/tv/${tmdbId}/season/${seasonNumber}?api_key=${TMDB_KEY}&language=pt-BR`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.episodes || []).map(e => ({
      episodeNumber: e.episode_number,
      name: e.name || `Episódio ${e.episode_number}`,
      still: e.still_path ? TMDB_IMG + e.still_path : ''
    }));
  } catch (_) { return []; }
}

/* ── Tradução de sinopse (MyMemory API) ── */
async function translateToPortuguese(text) {
  if (!text || !text.trim()) return '';
  const chunk = text.trim().slice(0, 1500);
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|pt-BR`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    return '';
  } catch(e) {
    console.warn('Erro na tradução:', e);
    return '';
  }
}

async function translateSynopsis() {
  const el = document.getElementById('f-synopsis');
  if (!el || !el.value.trim()) { toast('⚠️ Nenhuma sinopse para traduzir.'); return; }
  const btn = document.getElementById('btnTranslateSynopsis');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Traduzindo…'; }
  try {
    const translated = await translateToPortuguese(el.value);
    if (translated) {
      el.value = translated;
      toast('Tradução concluída!');
    } else {
      toast('⚠️ Serviço de tradução indisponível no momento.');
    }
  } catch {
    toast('⚠️ Erro inesperado ao traduzir.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Traduzir'; }
  }
}

async function translateDetailSynopsis(itemId) {
  const item = findInDb(itemId || detailId);
  if (!item || !item.synopsis) { toast('⚠️ Nenhuma sinopse para traduzir.'); return; }
  const btn = document.getElementById('btnTranslateDetail');
  if (btn) { btn.disabled = true; btn.textContent = '⏳…'; }
  try {
    const translated = await translateToPortuguese(item.synopsis);
    if (translated) {
      item.synopsis = translated;
      const idx = findIdxInDb(item.id);
      if (idx >= 0) db[idx] = item;
      save();
      saveItemToFirestore(item);
      const accBody = document.getElementById('acc-sinopse');
      if (accBody) accBody.innerHTML = `<p class="dmodal-text">${esc(translated)}</p><button id="btnTranslateDetail" class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="translateDetailSynopsis('${esc(item.id)}')">Traduzir novamente</button>`;
      toast('Sinopse traduzida e salva!');
    } else {
      toast('⚠️ Serviço de tradução indisponível no momento.');
    }
  } catch {
    toast('⚠️ Erro inesperado ao traduzir.');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Traduzir'; }
}
}
