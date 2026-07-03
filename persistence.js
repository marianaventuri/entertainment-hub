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

async function loadCatalog() {
  try {
    const snapshot = await firebase.firestore().collection('media').get()
    if (!snapshot.empty) {
      const data = []
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
      console.log('Carregado do Firestore')
      return data
    }
  } catch (_) {}
  const stored = readLocalStorageFallback()
  console.log('Carregado do localStorage')
  return stored ? JSON.parse(stored) : []
}

async function migrateIfNeeded() {
  const snapshot = await firebase.firestore().collection('media').get()
  if (!snapshot.empty) return
  const stored = readLocalStorageFallback()
  if (!stored) return
  const items = JSON.parse(stored)
  console.log(`Migrando ${items.length} obras...`)
  const batch = firebase.firestore().batch()
  items.forEach(item => {
    const ref = firebase.firestore().collection('media').doc(String(item.id))
    batch.set(ref, item)
  })
  await batch.commit()
  console.log('Migração concluída com sucesso.')
}

function subscribeCatalog(onUpdate) {
  return firebase.firestore().collection('media').onSnapshot(snapshot => {
    const data = []
    snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
    onUpdate(data)
  }, err => console.error('Erro no snapshot Firestore:', err))
}

async function saveItemToFirestore(item) {
  try {
    await firebase.firestore().collection('media').doc(String(item.id)).set(item)
    console.log('Salvo no Firestore:', item.title)
    return true
  } catch (err) {
    console.error('Erro ao salvar no Firestore:', err)
    return false
  }
}

async function deleteItemFromFirestore(id) {
  try {
    await firebase.firestore().collection('media').doc(String(id)).delete()
    console.log('Removido do Firestore:', id)
    return true
  } catch (err) {
    console.error('Erro ao remover do Firestore:', err)
    return false
  }
}

async function saveCatalogToFirestore(items) {
  try {
    const batch = firebase.firestore().batch()
    items.forEach(item => {
      const ref = firebase.firestore().collection('media').doc(String(item.id))
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
