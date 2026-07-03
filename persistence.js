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
      const data = []
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
      console.log('Carregado do Firestore (usuário)')
      // Merge with localStorage to recover items that failed to sync
      const stored = readLocalStorageFallback()
      if (stored) {
        const localItems = JSON.parse(stored)
        const firestoreIds = new Set(data.map(x => x.id))
        const missing = localItems.filter(x => !firestoreIds.has(x.id))
        if (missing.length) {
          console.log(`Mesclando ${missing.length} itens do localStorage perdidos no Firestore`)
          const batch = firebase.firestore().batch()
          missing.forEach(item => {
            const ref = col.doc(String(item.id))
            batch.set(ref, item)
          })
          await batch.commit()
          data.push(...missing)
        }
      }
      return data
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
    await col.doc(String(item.id)).set(item)
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
