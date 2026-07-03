import { db } from './firebase.js'
import { doc, setDoc, deleteDoc, writeBatch, collection } from 'firebase/firestore'

export async function saveItemToFirestore(item) {
  try {
    const ref = doc(db, 'media', String(item.id))
    await setDoc(ref, item)
    console.log('Salvo no Firestore:', item.title)
    return true
  } catch (err) {
    console.error('Erro ao salvar no Firestore:', err)
    return false
  }
}

export async function deleteItemFromFirestore(id) {
  try {
    const ref = doc(db, 'media', String(id))
    await deleteDoc(ref)
    console.log('Removido do Firestore:', id)
    return true
  } catch (err) {
    console.error('Erro ao remover do Firestore:', err)
    return false
  }
}

export async function saveCatalogToFirestore(items) {
  try {
    const batch = writeBatch(db)
    items.forEach(item => {
      const ref = doc(db, 'media', String(item.id))
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
