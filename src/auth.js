/* ═══════════════════════════════════════════
   AUTH
═══════════════════════════════════════════ */

async function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider()
  try {
    await auth.signInWithPopup(provider)
  } catch (err) {
    console.error('Erro login:', err)
    if (err.code === 'auth/popup-blocked') {
      toast('⚠️ Popup bloqueado — redirecionando...', '⚠️')
      await auth.signInWithRedirect(provider)
    } else if (err.code === 'auth/unauthorized-domain') {
      toast('⚠️ Domínio não autorizado no Firebase Console.', '⚠️')
    } else {
      toast('❌ Erro ao fazer login.', '❌')
    }
  }
}

async function signOutUser() {
  try {
    await auth.signOut()
  } catch (err) {
    console.error('Erro ao sair:', err)
    toast('❌ Erro ao sair.', '❌')
  }
}

/* ═══════════════════════════════════════════
   AUTH + INIT
═══════════════════════════════════════════ */

function handleAuthChange(user) {
  const overlay = document.getElementById('loginOverlay')
  const mainContent = document.querySelector('.main')
  const userMenu = document.getElementById('userMenu')
  const avatar = document.getElementById('userAvatar')
  const sidebar = document.getElementById('sidebar')
  const bottomNav = document.getElementById('bottomNav')

  if (user) {
    overlay.classList.add('hidden')
    mainContent.style.display = ''
    if (sidebar) sidebar.style.display = ''
    if (bottomNav) bottomNav.style.display = ''
    userMenu.style.display = 'flex'
    avatar.textContent = user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()
    updateSidebarAvatar()
    initApp()
  } else {
    overlay.classList.remove('hidden')
    mainContent.style.display = 'none'
    if (sidebar) sidebar.style.display = 'none'
    if (bottomNav) bottomNav.style.display = 'none'
    userMenu.style.display = 'none'
    updateSidebarAvatar()
    save()
    db = []
    wishdb = load(WISH_KEY, [])
    if (unsubscribeSync) { unsubscribeSync(); unsubscribeSync = null; }
  }
}

async function initApp() {
  try {
    await migrateIfNeeded()
    const data = await loadCatalog()
    if (data && data.length > 0) {
      db = data
    }
  } catch (_) {}
  if (!document.getElementById('page-home')) {
    const content = document.querySelector('.content');
    if (content) {
      content.querySelectorAll('.page.active').forEach(p => p.classList.remove('active'));
      const div = document.createElement('div');
      div.className = 'page active';
      div.id = 'page-home';
      div.innerHTML = '<div id="homeContent"></div>';
      content.insertBefore(div, content.firstChild);
    }
  }
  document.querySelectorAll('.nav-item.active, .bottom-nav-item.active').forEach(n => n.classList.remove('active'));
  const bnBiblio = document.getElementById('bn-biblioteca');
  if (bnBiblio) bnBiblio.classList.add('active');
  const biblioNav = document.querySelector('.nav-item[onclick*="biblioteca"]');
  if (biblioNav) biblioNav.classList.add('active');
  if (unsubscribeSync) unsubscribeSync()
  unsubscribeSync = subscribeCatalog(updatedData => {
    if (localSaveGuard || revertGuard) return;
    updatedData = updatedData.map(normalizeItem);
    const norm = a => JSON.stringify([...a].sort((x,y)=>String(x.id).localeCompare(String(y.id))))
    if (norm(db) === norm(updatedData)) return
    const prevIds = new Set(db.map(x=>String(x.id)))
    const nextIds = new Set(updatedData.map(x=>String(x.id)))
    const added = [...nextIds].filter(id => !prevIds.has(id))
    const removed = [...prevIds].filter(id => !nextIds.has(id))
    const localMap = new Map(db.map(x => [String(x.id), x]))
    updatedData.forEach(item => {
      localMap.set(String(item.id), item)
    })
    db = [...localMap.values()]
    const saved = readLocalStorageFallback()
    if (saved) {
      const localItems = JSON.parse(saved).map(normalizeItem)
      localItems.forEach(item => localMap.set(String(item.id), item))
      db = [...localMap.values()]
    }
    updateCounts()
    renderHome()
    renderCatalogo()
    const msgs = []
    if (added.length) msgs.push(`${added.length} adicionada(s)`)
    if (removed.length) msgs.push(`${removed.length} removida(s)`)
    if (!added.length && !removed.length) msgs.push('alterada(s)')
    toast(`🔄 Sincronizado: ${msgs.join(', ')}`, '🔄')
  })
  updateCounts()

  // Restore page from URL hash (History API support)
  const validPages = ['home','biblioteca','dashboard','timeline','wishlist','colecoes','perfil','conquistas','config','experiencia','favoritos'];
  const hashPage = window.location.hash.replace('#', '');
  const startPage = validPages.includes(hashPage) ? hashPage : 'home';
  // Set initial history state so popstate works on first back
  history.replaceState({ page: startPage }, '', '#' + startPage);
  navigate(startPage, true, true);
}

auth.getRedirectResult().catch(err => {
  console.error('Erro redirect:', err)
  toast('❌ ' + (err.message || err.code), '❌')
})
initAuth(handleAuthChange)

/* ═══════════════════════════════════════════
   KEYBOARD SHORTCUTS
═══════════════════════════════════════════ */

document.addEventListener('keydown', e=>{
  if (e.key==='Escape') {
    closeSmartFormModal();
    closeDetailModal();
    document.getElementById('importOverlay').classList.remove('open');
    if (typeof closeCmdPalette === 'function') closeCmdPalette();
  }
  if ((e.ctrlKey||e.metaKey) && e.key==='k') {
    e.preventDefault();
    if (typeof openCmdPalette === 'function') openCmdPalette();
  }
  if (e.key==='Tab') {
    const openOverlay = document.querySelector('.overlay.open');
    if (!openOverlay) return;
    const focusable = openOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

document.getElementById('smartFormBody').addEventListener('keydown', e=>{
  if (e.key==='Enter' && e.target.id==='w-title') saveWish();
});

/* ═══════════════════════════════════════════
   RIPPLE EFFECT
═══════════════════════════════════════════ */

document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove());
});

/* ═══════════════════════════════════════════
   PWA INSTALL PROMPT
═══════════════════════════════════════════ */

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  installPrompt = e
  const btn = document.createElement('button')
  btn.className = 'btn btn-primary'
  btn.textContent = 'Instalar app'
  btn.style.cssText = 'position:fixed;bottom:80px;right:16px;z-index:999;padding:10px 20px;border-radius:40px;box-shadow:0 4px 20px rgba(108,92,231,.4)'
  btn.onclick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') btn.remove()
    installPrompt = null
  }
  document.body.appendChild(btn)
  setTimeout(() => { if (btn.parentNode) btn.remove() }, 30000)
})

/* ═══════════════════════════════════════════
   SCROLL TO TOP VISIBILITY
═══════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const btn = document.getElementById('btnScrollTop');
  if (!btn) return;
  if (window.scrollY > 400) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}, { passive: true });

/* ═══════════════════════════════════════════
   NETWORK STATUS
═══════════════════════════════════════════ */
window.addEventListener('online', () => { if (typeof setSyncStatus === 'function') setSyncStatus('online'); });
window.addEventListener('offline', () => { if (typeof setSyncStatus === 'function') setSyncStatus('offline'); });
if (!navigator.onLine && typeof setSyncStatus === 'function') setSyncStatus('offline');
