const STORAGE_KEY  = 'biblioteca_v2';
const WISH_KEY     = 'biblioteca_wishlist';

function load(key, def) {
  try { return JSON.parse(localStorage.getItem(key)) || def; }
  catch { return def; }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  localStorage.setItem(WISH_KEY, JSON.stringify(wishdb));
  updateCounts();
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
    legacySnap.forEach(doc => items.push({ id: doc.id, ...doc.data() }))
    const batch = firebase.firestore().batch()
    const col = getMediaCollection()
    items.forEach(item => {
      const ref = col.doc(String(item.id))
      batch.set(ref, item)
    })
    await batch.commit()
    console.log(`Migrados ${items.length} itens da coleção raiz para o usuário.`)
    return items.length
  } catch (err) {
    console.error('Erro na migração legada:', err)
    return 0
  }
}

async function loadCatalog() {
  const uid = getUserUid()
  if (!uid) return readLocalStorageFallback ? JSON.parse(readLocalStorageFallback() || '[]') : []
  try {
    const col = getMediaCollection()
    const snapshot = await col.get()
    if (!snapshot.empty) {
      const firestoreData = []
      snapshot.forEach(doc => firestoreData.push({ id: doc.id, ...doc.data() }))
      console.log('Carregado do Firestore (usuário)')
      // Prefer localStorage data (user's latest edits); Firestore fills gaps
      const stored = readLocalStorageFallback()
      if (stored) {
        const localItems = JSON.parse(stored)
        const localIds = new Set(localItems.map(x => x.id))
        const onlyInFirestore = firestoreData.filter(x => !localIds.has(x.id))
        console.log(`localStorage: ${localItems.length}, Firestore: ${firestoreData.length}, mesclados: ${onlyInFirestore.length}`)
        // Try to recover local items back to Firestore in background
        recoverLocalItems(localItems, firestoreData, col)
        return [...localItems, ...onlyInFirestore]
      }
      return firestoreData
    }
    const migrated = await migrateLegacyData()
    if (migrated > 0) {
      const snapshot = await col.get()
      const data = []
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
      return data
    }
  } catch (_) {}
  const stored = readLocalStorageFallback()
  console.log('Carregado do localStorage')
  return stored ? JSON.parse(stored) : []
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
  const batch = firebase.firestore().batch()
  items.forEach(item => {
    const ref = col.doc(String(item.id))
    batch.set(ref, item)
  })
  await batch.commit()
  console.log('Migração concluída com sucesso.')
}

function subscribeCatalog(onUpdate) {
  const uid = getUserUid()
  if (!uid) return null
  const col = getMediaCollection()
  return col.onSnapshot(snapshot => {
    const data = []
    snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
    onUpdate(data)
  }, err => console.error('Erro no snapshot Firestore:', err))
}

async function saveItemToFirestore(item) {
  try {
    const col = getMediaCollection()
    // Strip undefined fields – Firestore rejects them
    const clean = {}
    Object.entries(item).forEach(([k, v]) => { if (v !== undefined) clean[k] = v })
    await col.doc(String(item.id)).set(clean)
    console.log('Salvo no Firestore:', item.title)
    return true
  } catch (err) {
    console.error('Erro ao salvar no Firestore:', err)
    toast('❌ Erro ao salvar no servidor: ' + (err.message || err.code || 'verifique regras de segurança'), '❌')
    return false
  }
}

async function deleteItemFromFirestore(id) {
  try {
    const col = getMediaCollection()
    await col.doc(String(id)).delete()
    console.log('Removido do Firestore:', id)
    return true
  } catch (err) {
    console.error('Erro ao remover do Firestore:', err)
    return false
  }
}

// Silently try to sync local items that Firestore is missing/stale
function recoverLocalItems(localItems, firestoreItems, col) {
  const fsMap = new Map(firestoreItems.map(x => [x.id, x]))
  const batch = firebase.firestore().batch()
  let count = 0
  localItems.forEach(item => {
    const existing = fsMap.get(item.id)
    if (!existing || JSON.stringify(existing) !== JSON.stringify(item)) {
      batch.set(col.doc(String(item.id)), item)
      count++
    }
  })
  if (count) {
    console.log(`Recuperando ${count} obras para o Firestore...`)
    batch.commit().then(() => console.log('Recuperação concluída')).catch(err => {
      if (err.code !== 'permission-denied') console.error('Erro na recuperação:', err)
    })
  }
}

async function saveCatalogToFirestore(items) {
  try {
    const col = getMediaCollection()
    const batch = firebase.firestore().batch()
    items.forEach(item => {
      const ref = col.doc(String(item.id))
      batch.set(ref, item)
    })
    await batch.commit()
    console.log(`Catálogo salvo no Firestore (${items.length} obras)`)
    return true
  } catch (err) {
    console.error('Erro ao salvar catálogo no Firestore:', err)
    return false
  }
}
