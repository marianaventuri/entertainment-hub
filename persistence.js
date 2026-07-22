const STORAGE_KEY  = 'biblioteca_v2';
const WISH_KEY     = 'biblioteca_wishlist';

function normalizeItem(item) {
  if (!item) return item;
  const t = item.type;

  if (!item.obra) {
    item.obra = {
      title: item.title, cover: item.cover, year: item.year,
      genres: item.genres, synopsis: item.synopsis, opinion: item.opinion,
      rating: item.rating, emotions: item.emotions, tags: item.tags,
      negTags: item.negTags, fav: item.fav
    };
  }

  if (!item.metadata) item.metadata = {};
  if (t === 'Filme' && !item.metadata.director) item.metadata.director = item.author;
  if ((t === 'Série' || t === 'Dorama') && !item.metadata.creator) item.metadata.creator = item.author;
  if (t === 'Anime' && !item.metadata.studio) item.metadata.studio = item.author;
  if ((t === 'Livro' || t === 'Mangá') && !item.metadata.author) item.metadata.author = item.author;
  if (t === 'Jogo' && !item.metadata.developer) item.metadata.developer = item.author;
  if (!item.metadata.publisher) item.metadata.publisher = item.publisher;

  if (!item.progress) item.progress = {};
  if (item.season !== undefined && !item.progress.season) item.progress.season = item.season;
  if (item.currentEp !== undefined && !item.progress.currentEp) item.progress.currentEp = item.currentEp;
  if (item.episodes !== undefined && !item.progress.episodes) item.progress.episodes = item.episodes;
  if (item.currentChapter !== undefined && !item.progress.currentChapter) item.progress.currentChapter = item.currentChapter;
  if (item.chaptersTotal !== undefined && !item.progress.chaptersTotal) item.progress.chaptersTotal = item.chaptersTotal;
  if (item.volume !== undefined && !item.progress.volume) item.progress.volume = item.volume;
  if (item.totalVolumes !== undefined && !item.progress.totalVolumes) item.progress.totalVolumes = item.totalVolumes;
  if (item.collection !== undefined && !item.progress.collection) item.progress.collection = item.collection;
  if (item.hoursPlayed !== undefined && !item.progress.hoursPlayed) item.progress.hoursPlayed = item.hoursPlayed;
  if (item.pages !== undefined && !item.progress.pages) item.progress.pages = item.pages;

  if (!item.consumption) item.consumption = {};
  if (item.platform !== undefined && !item.consumption.platform) item.consumption.platform = item.platform;
  if (item.readUrl !== undefined && !item.consumption.readUrl) item.consumption.readUrl = item.readUrl;
  if (item.cinemaWatched !== undefined && !item.consumption.cinemaWatched) item.consumption.cinemaWatched = item.cinemaWatched;
  if (item.durationMinutes !== undefined && !item.consumption.durationMinutes) item.consumption.durationMinutes = item.durationMinutes;

  if (!item.externalIds) item.externalIds = {};
  if (item.tmdbId !== undefined && !item.externalIds.tmdbId) item.externalIds.tmdbId = item.tmdbId;
  if (item.anilistId !== undefined && !item.externalIds.anilistId) item.externalIds.anilistId = item.anilistId;
  if (item.rawgId !== undefined && !item.externalIds.rawgId) item.externalIds.rawgId = item.rawgId;

  item.title = item.obra.title;
  item.cover = item.obra.cover;
  item.year = item.obra.year;
  item.genres = item.obra.genres;
  item.synopsis = item.obra.synopsis;
  item.opinion = item.obra.opinion;
  item.rating = item.obra.rating;
  item.emotions = item.obra.emotions;
  item.tags = item.obra.tags;
  item.negTags = item.obra.negTags;
  item.fav = item.obra.fav;
  item.author = item.metadata.director || item.metadata.creator || item.metadata.studio || item.metadata.author || item.metadata.developer || '';
  item.platform = item.consumption.platform || '';
  item.cinemaWatched = item.consumption.cinemaWatched;
  item.durationMinutes = item.consumption.durationMinutes;
  item.readUrl = item.consumption.readUrl || '';
  item.hours = item.hours || (item.consumption.durationMinutes ? (item.consumption.durationMinutes / 60).toFixed(1) : '');
  item.tmdbId = item.externalIds.tmdbId;
  item.anilistId = item.externalIds.anilistId;
  item.rawgId = item.externalIds.rawgId;
  item.season = item.progress.season;
  item.currentEp = item.progress.currentEp;
  item.episodes = item.progress.episodes;
  item.currentChapter = item.progress.currentChapter;
  item.chaptersTotal = item.progress.chaptersTotal;
  item.volume = item.progress.volume;
  item.totalVolumes = item.progress.totalVolumes;
  item.collection = item.progress.collection;
  item.hoursPlayed = item.progress.hoursPlayed;
  item.pages = item.progress.pages;
  item.publisher = item.metadata.publisher;

  return item;
}

function load(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) || def; }
  catch { return def; }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    localStorage.setItem(WISH_KEY, JSON.stringify(wishdb));
  } catch (e) {
    console.error('Erro ao salvar no localStorage:', e);
    toast('❌ Erro ao salvar localmente. Espaço insuficiente?', '❌');
  }
  updateCounts();
  if (typeof updateQuickFilters === 'function') updateQuickFilters();
}

function readLocalStorageFallback() {
  return localStorage.getItem('biblioteca_v2') || localStorage.getItem('catalogo') || null
}

function getMediaCollection() {
  const uid = getUserUid()
  if (!uid) throw new Error('Usuário não autenticado')
  return firebase.firestore().collection('users').doc(uid).collection('media')
}

async function migrateLegacyData() {
  try {
    const legacySnap = await firebase.firestore().collection('media').get()
    if (legacySnap.empty) return 0
    const items = []
    legacySnap.forEach(doc => items.push({ ...doc.data(), id: doc.id }))
    const col = getMediaCollection()
    for (let i = 0; i < items.length; i += 500) {
      const batch = firebase.firestore().batch()
      const chunk = items.slice(i, i + 500)
      chunk.forEach(item => {
        const safeId = String(item.id != null ? item.id : '')
        if (!safeId || safeId === 'undefined') return;
        const ref = col.doc(safeId)
        batch.set(ref, item)
      })
      await batch.commit()
    }
    console.log(`Migrados ${items.length} itens da coleção raiz para o usuário.`)
    return items.length
  } catch (err) {
    console.error('Erro na migração legada:', err)
    return 0
  }
}

async function loadCatalog() {
  const uid = getUserUid()
  if (!uid) {
    try {
      const fallback = readLocalStorageFallback();
      return fallback ? JSON.parse(fallback) : []
    } catch (_) { return []; }
  }
  try {
    const col = getMediaCollection()
    const snapshot = await col.get()
    if (!snapshot.empty) {
      const firestoreData = []
      snapshot.forEach(doc => firestoreData.push({ ...doc.data(), id: doc.id }))
      console.log('Carregado do Firestore (usuário)')
      // Prefer localStorage data (user's latest edits); Firestore fills gaps
    const stored = readLocalStorageFallback()
    if (stored) {
      let localItems = [];
      try { localItems = JSON.parse(stored).map(normalizeItem) } catch (_) { localItems = [] }
      const localIds = new Set(localItems.map(x => String(x.id)))
        const onlyInFirestore = firestoreData.filter(x => !localIds.has(String(x.id)))
        console.log(`localStorage: ${localItems.length}, Firestore: ${firestoreData.length}, mesclados: ${onlyInFirestore.length}`)
        // Try to recover local items back to Firestore in background
        recoverLocalItems(localItems, firestoreData, col)
        return [...localItems, ...onlyInFirestore]
      }
      return firestoreData.map(normalizeItem)
    }
    const migrated = await migrateLegacyData()
    if (migrated > 0) {
      const snapshot = await col.get()
      const data = []
      snapshot.forEach(doc => data.push({ ...doc.data(), id: doc.id }))
      return data.map(normalizeItem)
    }
  } catch (err) {
    console.error('Erro ao carregar catálogo do Firestore:', err);
  }
  const stored = readLocalStorageFallback()
  console.log('Carregado do localStorage')
  try {
    return stored ? JSON.parse(stored).map(normalizeItem) : []
  } catch (e) {
    console.error('Erro ao fazer parse do localStorage:', e);
    return [];
  }
}

async function migrateIfNeeded() {
  const uid = getUserUid()
  if (!uid) return
  const col = getMediaCollection()
  const snapshot = await col.get()
  if (!snapshot.empty) return
  const stored = readLocalStorageFallback()
  if (!stored) return
  const items = JSON.parse(stored)
  console.log(`Migrando ${items.length} obras...`)
  for (let i = 0; i < items.length; i += 500) {
    const batch = firebase.firestore().batch()
    const chunk = items.slice(i, i + 500)
    chunk.forEach(item => {
      const safeId = String(item.id != null ? item.id : '')
      if (!safeId || safeId === 'undefined') return;
      const ref = col.doc(safeId)
      batch.set(ref, item)
    })
    await batch.commit()
  }
  console.log('Migração concluída com sucesso.')
}

function subscribeCatalog(onUpdate) {
  const uid = getUserUid()
  if (!uid) return null
  const col = getMediaCollection()
  return col.onSnapshot(snapshot => {
    const data = []
    snapshot.forEach(doc => data.push(normalizeItem({ ...doc.data(), id: doc.id })))
    onUpdate(data)
  }, err => console.error('Erro no snapshot Firestore:', err))
}

function deepClean(obj) {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(deepClean)
  if (typeof obj === 'object') {
    const clean = {}
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) clean[k] = deepClean(v)
    }
    return clean
  }
  return obj
}

async function saveItemToFirestore(item) {
  try {
    const col = getMediaCollection()
    const safeId = item.id != null ? String(item.id) : String(Date.now() + Math.random())
    const clean = deepClean(item)
    if (typeof setSyncStatus === 'function') setSyncStatus('syncing')
    await col.doc(safeId).set(clean)
    console.log('Salvo no Firestore:', item.title)
    if (typeof setSyncStatus === 'function') setSyncStatus('online')
    return true
  } catch (err) {
    console.error('Erro ao salvar no Firestore:', err)
    return false
  }
}

async function deleteItemFromFirestore(id) {
  try {
    const col = getMediaCollection()
    const safeId = id != null ? String(id) : ''
    if (!safeId) return false
    if (typeof setSyncStatus === 'function') setSyncStatus('syncing')
    await col.doc(safeId).delete()
    console.log('Removido do Firestore:', id)
    if (typeof setSyncStatus === 'function') setSyncStatus('online')
    return true
  } catch (err) {
    console.error('Erro ao remover do Firestore:', err)
    return false
  }
}

// Silently try to sync local items that Firestore is missing/stale
async function recoverLocalItems(localItems, firestoreItems, col) {
  const fsMap = new Map(firestoreItems.map(x => [String(x.id), x]))
  let count = 0
  const toSave = []
  localItems.forEach(item => {
    const existing = fsMap.get(String(item.id))
    if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
      toSave.push(item)
      count++
    }
  })
  if (count) {
    console.log(`Recuperando ${count} obras para o Firestore...`)
    for (let i = 0; i < toSave.length; i += 500) {
      const batch = firebase.firestore().batch()
      const chunk = toSave.slice(i, i + 500)
      chunk.forEach(item => {
        const ref = col.doc(String(item.id))
        batch.set(ref, item)
      })
      try { await batch.commit() } catch (err) {
        if (err.code !== 'permission-denied') console.error('Erro na recuperação:', err)
      }
    }
    console.log('Recuperação concluída')
  }
}

async function saveCatalogToFirestore(items) {
  try {
    const col = getMediaCollection()
    for (let i = 0; i < items.length; i += 500) {
      const batch = firebase.firestore().batch()
      const chunk = items.slice(i, i + 500)
      chunk.forEach(item => {
        const safeId = item.id != null ? String(item.id) : ''
        if (!safeId || safeId === 'undefined') return;
        const ref = col.doc(safeId)
        batch.set(ref, item)
      })
      await batch.commit()
    }
    if (typeof setSyncStatus === 'function') setSyncStatus('syncing')
    console.log(`Catálogo salvo no Firestore (${items.length} obras)`)
    if (typeof setSyncStatus === 'function') setSyncStatus('online')
    return true
  } catch (err) {
    console.error('Erro ao salvar catálogo no Firestore:', err)
    return false
  }
}
