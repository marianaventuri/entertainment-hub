import { db } from './firebase.js'
import { collection, getDocs, doc, setDoc, onSnapshot } from 'firebase/firestore'

function readLocalStorage() {
  return (
    localStorage.getItem('biblioteca_v2')
    || localStorage.getItem('catalogo')
    || null
  )
}

async function loadCatalog() {
  try {
    const snapshot = await getDocs(collection(db, 'media'))
    if (!snapshot.empty) {
      const data = []
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
      console.log('Carregado do Firestore')
      return data
    }
  } catch (_) {}
  const stored = readLocalStorage()
  console.log('Carregado do localStorage')
  return stored ? JSON.parse(stored) : []
}

async function migrateIfNeeded() {
  const snapshot = await getDocs(collection(db, 'media'))
  if (!snapshot.empty) return

  const stored = readLocalStorage()
  if (!stored) return

  const items = JSON.parse(stored)
  console.log(`Migrando ${items.length} obras...`)

  await Promise.all(items.map(item =>
    setDoc(doc(db, 'media', String(item.id)), item)
  ))

  console.log('Migração concluída com sucesso.')
}

function subscribeCatalog(onUpdate) {
  return onSnapshot(collection(db, 'media'), snapshot => {
    const data = []
    snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }))
    onUpdate(data)
  }, err => console.error('Erro no snapshot Firestore:', err))
}

export { loadCatalog, migrateIfNeeded, subscribeCatalog }
