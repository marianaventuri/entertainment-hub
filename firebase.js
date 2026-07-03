const firebaseConfig = {
  apiKey: "AIzaSyBtshsP-a2tCOdugp-rqdY_XM8RCkIx9hA",
  authDomain: "entertainment-hub-7777a.firebaseapp.com",
  projectId: "entertainment-hub-7777a",
  storageBucket: "entertainment-hub-7777a.firebasestorage.app",
  messagingSenderId: "892977006495",
  appId: "1:892977006495:web:0007bbc575a24676161faa"
}

firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
let currentUser = null

function initAuth(onUserChanged) {
  auth.onAuthStateChanged(user => {
    currentUser = user
    onUserChanged(user)
  })
}

function getUserUid() {
  return currentUser ? currentUser.uid : null
}

async function testFirestoreConnection() {
  try {
    const testRef = firebase.firestore().collection('teste').doc('validacao')
    await testRef.set({ mensagem: 'Firebase conectado', data: firebase.firestore.FieldValue.serverTimestamp() })
    const snap = await testRef.get()
    if (snap.exists) console.log('Firebase conectado com sucesso')
  } catch (error) {
    console.error(error)
  }
}
testFirestoreConnection()
