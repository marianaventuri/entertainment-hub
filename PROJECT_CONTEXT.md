# Minha Biblioteca — Catálogo de Mídias

App para catalogar filmes, séries, animes, mangás, doramas, jogos e livros com Firebase.

## Arquitetura

| Arquivo | Função |
|---|---|---|
| `index.html` | Estrutura HTML (504 linhas) — página principal |
| `style.css` | Todos os estilos (~1620 linhas) |
| `app.js` | Lógica principal: estado, navegação, home, CRUD, dashboard, conquistas (1454 linhas) |
| `persistence.js` | Persistência: localStorage + Firestore CRUD + migração (140 linhas) |
| `firebase.js` | Config Firebase + Auth (53 linhas) |
| `.gitignore` | node_modules/, .firebase/, .firebaserc |
| `firebase.json` | Config Firebase Hosting (público: raiz, sem rewrites SPA) |
| `.firebaserc` | Vincula ao projeto `entertainment-hub-7777a` |
| `.github/workflows/deploy.yml` | GitHub Actions: deploy automático no push |
| `migrate.html` | Script de migração avulso (não carregado pelo app) |
| `firestore-crud.js` | Versão antiga com ES modules (não usado) |

## Funcionalidades

- **Home** com saudação, "Continue consumindo", Minha Biblioteca, estatísticas, últimas obras e atalhos
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
- Responsivo (sidebar + bottom nav mobile)
- Atalhos de teclado (Esc, Ctrl+K)

## APIs integradas

- Firebase Auth (Google Sign-In)
- Firestore (dados por usuário)
- TMDB (filmes, séries, doramas)
- AniList (animes, mangás)
- Open Library (livros)
- RAWG (jogos)

## Modelo de dados

```
Firestore:  /users/{uid}/media/{id}  ← fonte principal
localStorage: biblioteca_v2           ← cache offline + fallback
```

Cada usuário autenticado possui sua própria coleção `users/{uid}/media`. A collection raiz `media` existe como legado — é migrada automaticamente na primeira autenticação de cada usuário.

## Navigation

| Page | Route | Description |
|---|---|---|
| Home | `navigate('home')` | Dashboard inicial: saudação, continue consumindo, biblioteca, stats, recentes, atalhos |
| Catálogo | `navigate('catalogo')` | Grade pesquisável/filtrável de todas as obras |
| Estatísticas | `navigate('dashboard')` | Dashboard completo com gráficos, top 5, gêneros |
| Timeline | `navigate('timeline')` | Linha do tempo mensal de obras finalizadas |
| Wishlist | `navigate('wishlist')` | Lista de desejos |
| Conquistas | `navigate('conquistas')` | 15 conquistas com progresso |

Sidebar: Home → Catálogo → Estatísticas → Timeline → Wishlist → Conquistas  
Bottom nav: Home → Catálogo → Wishlist → Conquistas

```
1. initAuth(onAuthStateChanged)
2. Usuário não logado → loginOverlay visível, app oculto
3. Login → oculta overlay, mostra app
4. migrateIfNeeded() → localStorage → Firestore (se vazio)
5. loadCatalog() → Firestore primeiro, fallback localStorage
6. subscribeCatalog(onSnapshot) → tempo real
```

## Sincronização

- `onSnapshot` escuta `users/{uid}/media` em tempo real
- Toast ao detectar mudanças remotas
- Echo loop prevenido por comparação sorted JSON + IDs
- Operações de escrita (save/delete) fazem Firestore + localStorage sempre

## Deploy

- **Firebase Hosting:** https://entertainment-hub-7777a.web.app
- **GitHub (código):** https://github.com/marianaventuri/entertainment-hub
- **Automático:** GitHub Actions (`.github/workflows/deploy.yml`) — deploy em todo `git push` para `main`
- **Manual:** `firebase deploy --only hosting`

### CI/CD

O workflow `Deploy Firebase Hosting`:
1. Escuta pushes na branch `main`
2. Instala `firebase-tools`
3. Executa `firebase deploy --only hosting` com o token do secret `FIREBASE_TOKEN`

**Setup único:** `firebase login:ci` → token adicionado como secret `FIREBASE_TOKEN` no repositório GitHub.

## PWA

- Manifest JSON em `/manifest.json` (display standalone, theme #07090f)
- Service Worker em `/sw.js` (cache-first + network update)
- Ícone SVG em `/icon.svg` (livro gradiente, `purpose: any maskable`)
- Meta tags: `theme-color`, `apple-mobile-web-app-capable`
- Botão "📲 Instalar app" aparece por 30s se o navegador suportar instalação
- Splash screen gerada pelo browser a partir de `background_color` + `icon.svg`

## Design System

Sistema de tokens CSS no `:root` (`style.css:4-85`).

### Palette (Dark Mode)

| Token | Value | Uso |
|---|---|---|
| `--bg` | `#06080e` | Fundo principal |
| `--surface` | `#0b0d14` | Cards, sidebar, modais |
| `--surface2` | `#11141e` | Inputs, hover, nav |
| `--surface3` | `#171d2a` | Barras de progresso |
| `--border` | `#1c2438` | Bordas default |
| `--border2` | `#253050` | Bordas hover |
| `--accent` | `#7c6dff` | Roxo principal (#7c6dff) |
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

### Espaçamento

Escala `--space-{1..12}` com base 4: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px.

### Sombras

- `--shadow-sm`: `0 2px 8px rgba(0,0,0,.3)` — cards em hover
- `--shadow-md`: `0 8px 24px rgba(0,0,0,.4)` — toasts, login
- `--shadow-lg`: `0 16px 48px rgba(0,0,0,.5)` — modais, cards hover

### Transições

- `--transition-fast`: `.15s ease` — hovers, focus
- `--transition-base`: `.25s ease` — animações de entrada
- `--transition-slow`: `.35s ease`

### Componentes

- **Botões:** `--radius-md` (10px), `--weight-semibold`, `--font-base`, min-height 40px. `.btn-primary` usa accent; `.btn-ghost` usa surface2+border.
- **Inputs:** `--radius-sm` (6px), `--surface2`, foco com `box-shadow: 0 0 0 3px var(--accent-dim)`.
- **Cards:** `--radius` (14px), hover com `--shadow-lg` + translateY(-4px).
- **Filter pills / chips:** `--radius-full`, `--weight-semibold`, `--font-sm`.
- **Badges:** `--radius-full`, `--font-xs`, `--weight-bold`.
- **Modais:** `--radius-lg` (18px), `--shadow-lg`, animação `modalIn` (scale .96 + translateY 8px).
- **Nav:** `--radius-sm`, side active com `--accent-dim` background + barra 3px.
- **Toasts:** `--radius-md`, `--shadow-md`, animação slideUp.
- **Timeline:** `--weight-extrabold` nos anos, bola 8px com `--border2`.

## Pendências

- [ ] Firestore Security Rules (restringir `users/{uid}/media` ao próprio uid)
- [ ] README.md com visão geral do projeto
- [ ] Limpar arquivos obsoletos (`app.js` v1, `style.css` v1)
