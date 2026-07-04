# Minha Biblioteca — Catálogo de Mídias

App para catalogar filmes, séries, animes, mangás, doramas, jogos e livros com Firebase.

## Arquitetura

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura HTML (~510 linhas) — página principal |
| `style.css` | Todos os estilos (~1620 linhas) |
| `app.js` | Lógica principal: estado, navegação, home, CRUD, dashboard, conquistas (~1490 linhas) |
| `persistence.js` | Persistência: localStorage + Firestore CRUD + merge + migração (~172 linhas) |
| `firebase.js` | Config Firebase + Auth (53 linhas) |
| `firestore.rules` | Regras de segurança Firestore |
| `firebase.json` | Config Firebase Hosting + Firestore |
| `.firebaserc` | Vincula ao projeto `entertainment-hub-7777a` |
| `.github/workflows/deploy.yml` | GitHub Actions: deploy automático no push |
| `manifest.json` | PWA manifest (standalone, theme #07090f, SVG icon) |
| `sw.js` | Service Worker (cache v2, cache-first assets, navegação via rede) |
| `icon.svg` | Ícone PWA (livro gradiente, `purpose: any maskable`) |
| `migrate.html` | Script de migração avulso (não carregado pelo app) |
| `firestore-crud.js` | Versão antiga com ES modules (não usado) |

## Funcionalidades

- **Home** com saudação horária, "Continue consumindo" (scroll horizontal), Minha Biblioteca (contagem por tipo), Estatísticas rápidas (6 cards), Últimas obras (6 cards), Atalhos rápidos (4 botões)
- CRUD completo (adicionar/editar/excluir/exclusão em lote)
- 7 tipos: Filme, Série, Anime, Mangá, Dorama, Jogo, Livro
- 4 status com adaptação por tipo
- Busca, filtros (tipo, status), ordenação
- Dashboard com stats, status, top 5, gêneros, tipos
- Linha do tempo mensal de obras finalizadas
- Wishlist com check
- 15 conquistas com verificação automática
- Importação CSV e colar texto
- Nota emocional (6 dimensões), tags pessoais (20)
- Obras relacionadas (mesmo título em tipos diferentes)
- Favoritos
- Toast notifications
- Responsivo (sidebar + bottom nav mobile) — mobile-first (360px+), breakpoints 640px/1024px
- Atalhos de teclado (Esc fecha modal, Ctrl+K busca)
- **PWA**: instalação via `beforeinstallprompt`, cache-first com service worker, manifest standalone

## APIs integradas

- Firebase Auth (Google Sign-In)
- Firestore (dados por usuário)
- TMDB (filmes, séries, doramas)
- AniList (animes, mangás)
- Open Library (livros)
- RAWG (jogos)

## Modelo de dados

```
Firestore:  /users/{uid}/media/{id}  ← fonte servidor (sincronização entre dispositivos)
localStorage: biblioteca_v2           ← cache local prioritário (fallback + merge no load)
```

Cada usuário autenticado possui sua própria coleção `users/{uid}/media`. A collection raiz `media` existe como legado — é migrada automaticamente na primeira autenticação de cada usuário.

### Campos do item

`id`, `title`, `type`, `status`, `year`, `platform`, `episodes`, `hours`, `genres`, `synopsis`, `opinion`, `cover`, `rating`, `emotions`, `tags`, `fav`, `addedAt`, `finishedAt`

## Navegação

| Page | Rota | Descrição |
|---|---|---|
| Home | `navigate('home')` | Dashboard inicial |
| Catálogo | `navigate('catalogo')` | Grade pesquisável/filtrável |
| Estatísticas | `navigate('dashboard')` | Dashboard completo com gráficos |
| Timeline | `navigate('timeline')` | Linha do tempo mensal |
| Wishlist | `navigate('wishlist')` | Lista de desejos |
| Conquistas | `navigate('conquistas')` | 15 conquistas com progresso |

Sidebar (desktop): Home → Catálogo → Estatísticas → Timeline → Wishlist → Conquistas  
Bottom nav (mobile): Home → Catálogo → Wishlist → Conquistas

### Fluxo de inicialização

1. `initAuth(onAuthStateChanged)` registra listener de auth
2. Usuário não logado → overlay de login visível, app oculto
3. Login (Google) → overlay ocultado, app exibido
4. `setUser()` → `loadCatalog()` → `renderHome()` + `renderCatalogo()` + `setupSync()`
5. `setupSync()` → `subscribeCatalog(onSnapshot)` → escuta em tempo real

## Persistência e sincronização

### Escrita

1. `saveItem()` → `save()` (localStorage) → `saveItemToFirestore()` (Firestore)
2. Campos `undefined` são removidos antes de enviar ao Firestore (evita erro `Unsupported field value`)
3. Se Firestore rejeitar: `revertGuard = true` (bloqueia `onSnapshot` por 3s), toast de alerta exibido

### Leitura (loadCatalog)

1. Firestore é consultado primeiro
2. Dados do localStorage são mesclados **por cima** (prioridade local) — itens que falharam ao sincronizar não são perdidos
3. Itens que estão no Firestore mas não no localStorage também são preservados
4. Em background, `recoverLocalItems()` tenta reenviar itens locais divergentes ao Firestore

### onSnapshot

- `localSaveGuard`: impede echo loop durante escrita local (100ms)
- `revertGuard`: após falha do Firestore, ignora snapshots por 3s (impede que dados revertam)
- Merge preserva versão localStorage quando Firestore tem dados desatualizados

## Segurança

- **Firestore Security Rules** (`firestore.rules`): `read/write` permitido apenas se `request.auth.uid == userId` na coleção `users/{userId}`
- Chaves de API expostas no front-end (TMDB, RAWG, Firebase) — sem solução por enquanto

## Deploy

- **Firebase Hosting:** https://entertainment-hub-7777a.web.app
- **GitHub (código):** https://github.com/marianaventuri/entertainment-hub
- **Automático:** GitHub Actions (`.github/workflows/deploy.yml`) — deploy em todo `git push` para `main`
- **Manual:** `firebase deploy --only hosting`

### CI/CD

Workflow `Deploy Firebase Hosting`:
1. Escuta pushes na branch `main`
2. Instala `firebase-tools`
3. Executa `firebase deploy --only hosting` com token do secret `FIREBASE_TOKEN`

**Setup único:** `firebase login:ci` → token como secret `FIREBASE_TOKEN` no repositório GitHub.
**Deploy regras Firestore:** `firebase deploy --only firestore`

## PWA

- Manifest JSON em `/manifest.json` (display standalone, theme #07090f)
- Service Worker em `/sw.js` (cache-first + network update, navegação via rede para não interferir com OAuth redirect)
- Ícone SVG em `/icon.svg` (livro gradiente, `purpose: any maskable`)
- Meta tags: `theme-color`, `apple-mobile-web-app-capable`
- Botão "📲 Instalar app" aparece por 30s se o navegador suportar instalação

## Design System

Sistema de tokens CSS no `:root` (`style.css:4-85`). Mobile-first (base 360px+; breakpoints 640px tablet, 1024px desktop).

### Paleta (Dark Mode)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#06080e` | Fundo principal |
| `--surface` | `#0b0d14` | Cards, sidebar, modais |
| `--surface2` | `#11141e` | Inputs, hover, nav |
| `--surface3` | `#171d2a` | Barras de progresso |
| `--border` | `#1c2438` | Bordas default |
| `--border2` | `#253050` | Bordas hover |
| `--accent` | `#7c6dff` | Roxo principal |
| `--accent-dim` | `rgba(124,109,255,.12)` | Hover de fundo accent |
| `--accent2` | `#ff6b9d` | Rosa secundário |
| `--accent2-dim` | `rgba(255,107,157,.1)` | Fundo de tags |
| `--text` | `#eef2fa` | Texto primário |
| `--text2` | `#8896b3` | Texto secundário |
| `--text3` | `#3d4f6e` | Placeholder, labels |

### Tipografia

- **Fontes:** Outfit (display/títulos), Inter (body)
- **Escala:** xs .65rem → sm .75rem → base .85rem → md .95rem → lg 1.15rem → xl 1.4rem → 2xl 1.8rem → 3xl 2.5rem
- **Pesos:** regular 400 → medium 500 → semibold 600 → bold 700 → extrabold 800

### Componentes

- **Botões:** `--radius-md` (10px), `--weight-semibold`, `--font-base`, min-height 40px. `.btn-primary` usa accent; `.btn-ghost` usa surface2+border.
- **Inputs:** `--radius-sm` (6px), `--surface2`, foco com `box-shadow: 0 0 0 3px var(--accent-dim)`.
- **Cards:** `--radius` (14px), hover com `--shadow-lg` + translateY(-4px). Grid: `repeat(2,1fr)` mobile → `repeat(3,1fr)` tablet → `auto-fill` desktop.
- **Filter pills / chips:** `--radius-full`, `--weight-semibold`, `--font-sm`.
- **Badges:** `--radius-full`, `--font-xs`, `--weight-bold`.
- **Modais:** `--radius-lg` (18px), `--shadow-lg`, animação `modalIn` (scale .96 + translateY 8px).
- **Nav:** `--radius-sm`, side active com `--accent-dim` background + barra 3px.
- **Toasts:** `--radius-md`, `--shadow-md`, animação slideUp.
- **Timeline:** `--weight-extrabold` nos anos, bola 8px com `--border2`.

## Glossário de bugs já corrigidos

1. **IDs inconsistentes (number vs string):** `String(Date.now() + Math.random())` garante IDs string; `saveItem()`, `addRelated()`, `deleteItem()` são `async` com `await saveItemToFirestore()`.
2. **localSaveGuard:** protege `onSnapshot` de sobrescrever `db` durante escrita local.
3. **Security Rules:** regras bloqueavam escritas (modo locked) — resolvido com `firestore.rules` permitindo `read, write` por uid.
4. **Campos undefined:** `item.addedAt` podia ser `undefined` quando `db.find()` não encontrava o item — resolvido limpando undefined antes do `set()` e com fallback `|| new Date().toISOString()`.
5. **Dados revertiam no F5:** `loadCatalog` foi alterado para priorizar localStorage no merge; `onSnapshot` faz merge em vez de substituir `db`.
6. **Deleção com race condition:** `deleteItem()` e `confirmDeleteSelected()` salvam no localStorage ANTES de deletar do Firestore, e usam `revertGuard` para bloquear `onSnapshot` durante a operação — impede que o merge re-adicione itens deletados a partir de dados stale do Firestore.
7. **Filtro invertido em deleteItem:** `db.filter(x => x.id === id || String(x.id) === String(id))` mantinha o item deletado e removia todos os outros — corrigido para `!==`.

## Pendências

- [ ] Limpar arquivos obsoletos (`migrate.html`, `firestore-crud.js`)
