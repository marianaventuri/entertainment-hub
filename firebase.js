import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBtshsP-a2tCOdugp-rqdY_XM8RCkIx9hA",
  authDomain: "entertainment-hub-7777a.firebaseapp.com",
  projectId: "entertainment-hub-7777a",
  storageBucket: "entertainment-hub-7777a.firebasestorage.app",
  messagingSenderId: "892977006495",
  appId: "1:892977006495:web:0007bbc575a24676161faa"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// ── Teste de conexão com Firestore ──
async function testFirestoreConnection() {
  try {
    const testRef = doc(db, 'teste', 'validacao')
    await setDoc(testRef, {
      mensagem: 'Firebase conectado',
      data: serverTimestamp(),
    })
    const snap = await getDoc(testRef)
    if (snap.exists()) {
      console.log('Firebase conectado com sucesso')
    }
  } catch (error) {
    console.error(error)
  }
}

testFirestoreConnection()

export { db, auth }
