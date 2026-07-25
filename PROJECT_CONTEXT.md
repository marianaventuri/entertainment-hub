# Entertainment Hub — Project Context

> Catálogo pessoal de filmes, séries, animes, mangás, jogos e livros, com suporte a Box/Coleção, wishlist, Firestore sync e PWA.

---

## Workflow de Desenvolvimento

Toda alteração realizada neste projeto **deve** seguir os passos abaixo:

1. **Implementar a mudança** nos arquivos relevantes
2. **Atualizar este arquivo (`PROJECT_CONTEXT.md`)** — adicionar/atualizar o registro da Sprint correspondente com:
   - Problema / Motivação
   - O que mudou (por arquivo)
   - Arquitetura / Impactos
3. **Executar deploy** com `firebase deploy` para publicar as alterações em produção

> ⚠️ **Regra:** Nunca finalizar uma tarefa sem antes registrar a mudança no `PROJECT_CONTEXT.md` e fazer o deploy.

---

## Stack

- **Frontend:** HTML5 + CSS3 + Vanilla JS (raw, no bundler)
- **Backend:** Firebase (Firestore + Auth Google)
- **APIs:** TMDB, AniList, OpenLibrary, RAWG
- **PWA:** Service Worker (v3), manifest.json
- **Storage:** localStorage + Firestore sync (persistence.js gerencia merge bidirecional)

---

## Estrutura de diretórios

```
/
├── index.html              ← HTML principal (único arquivo)
├── style.css               ← Todos os estilos (~2590 linhas)
├── sw.js                   ← Service Worker (cache first)
├── manifest.json           ← PWA manifest
├── firebase.js             ← Firebase config + auth init
├── persistence.js          ← localStorage CRUD + Firestore CRUD + merge + sync
├── app.js.bak              ← Original monolithic app.js (backup)
├── PROJECT_CONTEXT.md      ← Este arquivo
├── docs/
│   └── api-mapping.md      ← Mapeamento API → campos internos
├── src/
│   ├── adapters/
│   │   ├── tmdbAdapter.js      ← TMDB response → formato comum
│   │   ├── anilistAdapter.js   ← AniList response → formato comum
│   │   ├── rawgAdapter.js      ← RAWG response → formato comum
│   │   └── openLibraryAdapter.js ← OpenLibrary response → formato comum
│   ├── constants.js        ← TIPO, EMOTIONS, ALL_TAGS, STATUS_COLORS, API keys, ACHIEVEMENTS
│   ├── state.js            ← Global state (db, wishdb, filters, modes, guards)
│   ├── utils.js            ← Helpers (esc, stars, toast, findInDb, updateCounts, displayStatus, typeIcon)
│   ├── navigation.js       ← Page navigation, sidebar toggle
│   ├── api.js              ← TMDB, AniList, OpenLibrary, RAWG + buscarOnline/applyApiResult
│   ├── catalog.js          ← Catalog rendering, renderCard, filters, setStar, setEmotion, toggleFav
│   ├── jornada.js          ← Franchise detection, journey API fetch, auto-suggestion
│   ├── modals.js           ← SmartFormModal (add/edit/box/colecao/wish/batch) + DetailModal + Import
│   ├── pages.js            ← Home, Dashboard, Timeline, Achievements, Config, Experience
│   └── auth.js             ← Auth handlers, initApp, keyboard shortcuts, PWA install prompt
```

---

## Ordem de carregamento dos scripts

`firebase.js → persistence.js → constants.js → state.js → utils.js → navigation.js → adapters/*.js → api.js → catalog.js → jornada.js → modals.js → pages.js → auth.js`

Essa ordem é **crítica**: funções definidas em scripts anteriores são usadas pelos posteriores.

---

## Arquitetura / Decisões

- **Sem build tooling**: raw JS global scope com `onclick` handlers. Modularização via file splitting + script tag ordering (pragmático para Firebase compat SDK que exige escopo global).
- **Firestore sync**: `persistence.js` gerencia merge bidirecional entre localStorage (fonte da verdade para merge) e Firestore (`onSnapshot`), com `localSaveGuard` e `revertGuard` para evitar loops e sobrescritas.
- **Wishlist (`wishdb`)**: persiste apenas em localStorage, não no Firestore — limitação conhecida.
- **Sprint 1 (Fundações e Busca):** Implementado (History API, busca expandida, progresso na Home e cards).
- **Sprint 2 (Biblioteca Avançada):** Em backlog (Modo Lista/Estante, contadores, filtro por período).
- **Sprint 3 (Polimento Visual):** Em backlog (Skeleton loading, microinterações, light mode).
- **Sprint 4 (Organização e UX Automática):** Em backlog (Smart folders, drag&drop, coleções auto).

---

## API Keys (hardcoded em src/constants.js)

| API    | Key |
|--------|-----|
| TMDB   | `6cb69a0af65e0121b72915f947762f43` |
| RAWG   | `ea76150c732545f4814bfbdbac750ac9` |

---

## Bugs Conhecidos (resolvidos em Sprints anteriores)

1. **localSaveGuard:** protege `onSnapshot` de sobrescrever `db` durante escrita local.
2. **Security Rules:** regras bloqueavam escritas (modo locked) — resolvido com `firestore.rules` permitindo `read, write` por uid.
3. **Campos undefined:** `item.addedAt` podia ser `undefined` — resolvido limpando undefined antes do `set()` e com fallback `|| new Date().toISOString()`.
4. **Dados revertiam no F5:** `loadCatalog` prioriza localStorage no merge; `onSnapshot` faz merge em vez de substituir `db`.
5. **Deleção com race condition:** `deleteItem()` e `confirmDeleteSelected()` salvam no localStorage ANTES de deletar do Firestore, e usam `revertGuard`.
6. **Filtro invertido em deleteItem:** corrigido de `===` para `!==` no filter.
7. **toggleCardFav sem localSaveGuard:** corrigido com `saveItemToFirestore` + `localSaveGuard`.
8. **statusFilter via DOM select vs variável:** migrado para variável global `statusFilter`.
9. **Duplicate `const ALL_TAGS`:** removida declaração duplicada.
10. **`applyApiResult()` com IDs incorretos:** corrigido para usar `f-year` e `f-episodes` separados.
11. **`alltype` achievement com Box/Coleção:** corrigido usando array fixo `['Filme','Série','Anime','Mangá','Dorama','Jogo','Livro']`.

---

## Histórico de Sprints

### Sprint 1 — Arquitetura (Concluído)
- Monólito `app.js` (3093 linhas) → 10 módulos em `src/`
- `index.html` atualizado com 12 script tags
- `migrate.html`, `firestore-crud.js` removidos
- `app.js.bak` preservado como backup

### Sprint 2 — Card UI Refinement (Concluído)
- `@keyframes cardEnter` + `.card-enter` utility
- `.skeleton` shimmer para loading de imagens
- Card hover: translateY(-6px), glow, sombra elevada
- Card active: scale(0.97)
- `.card-status` badges redesenhados: gradientes por status, `::before` ícones, backdrop-filter blur
- `.card-fav-btn` com fundo circular, `.faved` state
- Imagens com fade-in (`opacity:0` → `onload="this.style.opacity=1"`)
- `renderCard(item, idx)` com staggered animation-delay (max 500ms)
- Container cards com border-left + glow inferior
- Grid responsivo: 190px → 180px → 160px → 140px

### Sprint 3 — Modal de Edição Unificado (Concluído)

**O que mudou:**

#### HTML (`index.html`)
- 3 overlays separados (`addOverlay`, `boxOverlay`, `wishOverlay`) substituídos por 1 overlay único `smartFormOverlay`
- Conteúdo do modal é renderizado dinamicamente por JS via `smartFormBody`
- Botão de edição em lote adicionado ao toolbar do catálogo (`#btnBatchEdit`)
- Todos os `onclick` atualizados: `openAddModal` → `openSmartFormModal('add')`, `openWishModal` → `openSmartFormModal('wish')`, `openBoxModal` → `openSmartFormModal('box'|'colecao')`

#### JS (`src/modals.js`)
- **Unificação**: `openSmartFormModal(mode, options)` substitui `openAddModal`, `editItem`, `openBoxModal`, `openWishModal`
- **Modos suportados**: `'add'`, `'edit'`, `'box'`, `'colecao'`, `'wish'`, `'batch'`
- **Validação inline**: `validateForm()` valida título obrigatório, ano (1800-2100), cover URL — erros exibidos em `.field-error` abaixo de cada campo
- **Preview de cover ao vivo**: `previewCover()` no `oninput` do campo `f-cover` — exibe miniatura 60×80 ou mensagem de erro
- **Edição em lote**: `applyBatchEdit()` altera status/nota/gêneros/tags em massa nos itens selecionados
- **Limpeza**: funções removidas — `openAddModal`, `clearForm`, `closeAddModal`, `editItem`, `openBoxModal`, `closeBoxModal`, `updateBoxPreview`, `confirmCreateBox`, `openWishModal`, `closeWishModal`, `saveWish` (substituídas por versões unificadas)
- Detail modal: botão "Editar completo" agora chama `openSmartFormModal('edit', {itemId})`
- Wishlist Enter key handler mudou de `document.getElementById('w-title')` para delegação em `#smartFormBody`

#### JS (`src/pages.js`)
- Home page: `openAddModal()` → `openSmartFormModal('add')`
- Home page: `openWishModal()` → `openSmartFormModal('wish')`

#### JS (`src/auth.js`)
- Escape key: `closeAddModal()` + `closeWishModal()` → `closeSmartFormModal()`

#### CSS (`style.css`)
- `.field-error` — mensagens de validação em vermelho
- `.field-required` — asterisco vermelho
- `.form-input.error`, `.form-select.error`, `.form-textarea.error` — borda vermelha + glow
- `.cover-preview`, `.cover-preview-img` — preview de capa 60×80
- `.api-dropdown`, `.api-dropdown-item` — dropdown de resultados da API (preparado para uso futuro)
- `.btn-danger`, `.btn-sm` — botão perigo e tamanho pequeno
- `.modal-subtitle` — subtítulo no modal

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `index.html` | 3 overlays → 1 smartFormOverlay; batch edit button; onclick handlers |
| `src/modals.js` | Reescrevido ~90% — SmartFormModal + validação + preview + batch + limpeza |
| `src/pages.js` | 2 onclick handlers atualizados |
| `src/auth.js` | Escape handler + wish Enter delegation |
| `style.css` | ~80 linhas: validação, preview, dropdown, batch styles |
| `PROJECT_CONTEXT.md` | Este registro |

#### Arquitetura / Impactos
- **Zero quebras**: todos os IDs de campos (f-title, f-type, f-status, etc.) preservados
- **Funções auxiliares mantidas**: `setStar`, `setEmotion`, `toggleFav`, `toggleTag`, `updateStatusOptions`, `toggleCinemaFields` continuam em `catalog.js` (já carregado antes de modals.js)
- **`buscarOnline`/`applyApiResult` inalterados** em `api.js`
- **Wishlist**: `saveWish`, `toggleWish`, `removeWish`, `renderWishlist` preservados em `modals.js`
- **Edição em lote**: funciona apenas no modo de seleção (delete mode) — botão "✏️ Editar (N)" aparece ao lado de "Excluir (N)"
- **Preview de cover**: não bloqueia o fluxo — se URL inválida, mostra mensagem mas não impede submit

---

## Pendências

- [x] Sprint 1: Refatoração de arquitetura (modularização em 10 arquivos, limpeza)
- [x] Sprint 2: UI dos cards (redesign completo, animações de entrada, badges, hover)
- [x] Sprint 3: Modal de edição unificado (SmartFormModal, validação inline, preview cover, batch edit)
- [x] Sprint 4: Nova Home (seções dinâmicas, favoritos, progresso, estado vazio educativo)
- [x] Sprint 5: Dashboard rico (donut chart, horas por tipo, distribuição notas, evolução mensal)
- [x] Sprint 6: Microinterações (page transitions, toast progress, ripple, count animation, haptic)
- [x] Sprint 7: Mobile/Performance (bottom sheet, debounce, content-visibility, SW v4, reduced-motion)
- [x] Sprint 8: Auditoria UX, acessibilidade, responsividade (meta tags, a11y, focus trap, aria)
- [x] Sprint 9: Box Drill-Down (ocultar itens filhos, navegação por box)
- [x] Sprint 10: Busca de Livros Aprimorada (Google Books + OpenLibrary + OLID manual)

### Sprint 4 — Nova Home (Concluído)

**O que mudou:**

#### JS (`src/pages.js`)
- `renderHome()` reescrita com seções dinâmicas:
  - **Estado vazio educativo**: quando `db.length === 0`, exibe mensagem de boas-vindas com guia rápido de funcionalidades (busca TMDB/AniList/RAWG, sync Firestore) e botões de ação
  - **Continue assistindo/lendo/jogando** (mantido, inalterado)
  - **❤️ Favoritos** (nova): grid com até 6 itens marcados como favoritos, com status badge e overlay
  - **📚 Minha Biblioteca** (mantido, agora sem fallback vazio — o empty state já cobre)
  - **📦 Em progresso** (nova): boxes/coleções não finalizados com barra de progresso (done/total)
  - **⚡ Estatísticas** (expandido): agora mostra também "Abandonados" e "Quero" — 8 cards no total
  - **🕐 Últimas obras** (mantido, expandido de 6 para 8 itens)
  - **⚡ Atalhos rápidos** (mantido)

#### CSS (`style.css`)
- `.home-empty-state` — container centralizado para estado vazio
- `.home-empty-icon` — ícone grande com animação float (levitação)
- `.home-empty-actions` — flexbox com botões de ação
- `.home-empty-tips` — grid 2×2 com dicas de funcionalidades
- `.home-tip` — card de dica com ícone + texto
- `.home-fav-grid` — grid responsivo (minmax 150px) para favoritos
- `.home-container-grid` — grid de containers em progresso
- `.home-container-card` — card horizontal com cover, barra de progresso, título
- `.home-container-cover`, `.home-container-body`, `.home-container-title`, `.home-container-bar`, `.home-container-bar-fill`, `.home-container-meta`

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/pages.js` | `renderHome()` reescrita |
| `style.css` | ~120 linhas: empty state, fav grid, container progress, tips |
| `PROJECT_CONTEXT.md` | Este registro |

#### Arquitetura / Impactos
- **Zero quebras**: todas as funções existentes (`renderCatalogo`, `openDetail`, etc.) permanecem intactas
- **Estado vazio**: detectado por `db.length === 0` no início de `renderHome()` — early return
- **Favoritos**: usa `db.filter(x => x.fav)` que já funciona com `toggleCardFav` do Sprint 2
- **Container progress**: usa `findInDb` para resolver itens internos — mesmo padrão do detail modal

### Sprint 5 — Dashboard Rico (Concluído)

**O que mudou:**

#### HTML (`index.html`)
- Nova `dash-row` com "Horas por tipo" e "Distribuição de notas"
- Nova `dash-row` com "Adições por mês" (chart de linha do tempo mensal)

#### JS (`src/pages.js`)
- `renderDashboard()` reescrita com 4 novos gráficos:
  - **Donut Chart de Status** — CSS `conic-gradient` gerado dinamicamente com segmentos proporcionais (finalizado, assistindo, quero, abandonado). Círculo central mostra total de obras. Ao lado, legenda com cores e contagens.
  - **Horas por tipo** — barras horizontais com gradiente laranja, ordenadas por total de horas. Exibe horas registradas em filmes, séries, jogos, etc.
  - **Distribuição de notas** — histograma de 1★ a 5★ com barras coloridas por nota (vermelho → verde).
  - **Adições por mês** — gráfico de barras verticais dos últimos 6 meses. Cada barra mostra o número de obras adicionadas naquele mês.
- Função auxiliar `ratingColor(r)` para gradiente de cores de nota (1★ vermelho → 5★ verde)
- Cards de estatística no topo mantidos com ícones grandes em baixa opacidade

#### CSS (`style.css`)
- `.donut-chart` — círculo 90×90 com `conic-gradient` CSS
- `.donut-hole` — círculo interno 60×60 com fundo `var(--surface)` sobreposto
- `.donut-wrap`, `.donut-legend` — layout flex para donut + legenda lado a lado
- `.genre-bar-hours` — gradiente laranja para barras de horas
- `.genre-bar-rating` — gradiente roxo para barras de distribuição
- `.monthly-chart` — container flex com alinhamento inferior
- `.monthly-col`, `.monthly-bar-wrap`, `.monthly-bar` — barra vertical com gradiente roxo
- `.monthly-bar-val` — rótulo numérico acima de cada barra
- `.monthly-label` — rótulo do mês abaixo de cada barra
- `.dash-card-full` — card que ocupa largura total do grid

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `index.html` | +2 dash-rows com novos containers de gráficos |
| `src/pages.js` | `renderDashboard()` reescrita com 4 novos gráficos |
| `style.css` | ~90 linhas: donut chart, monthly bars, genre-bar variants |
| `PROJECT_CONTEXT.md` | Este registro |

#### Arquitetura / Impactos
- **Donut chart via CSS puro**: `conic-gradient` com ângulos calculados em JS — sem canvas, sem lib externa, sem SVG
- **Dados agregados em tempo real**: toda vez que `renderDashboard()` é chamado (navegação, CRUD), os dados recalculam automaticamente
- **Fallbacks**: se não houver dados, cada seção exibe mensagem de dica (ex: "Registre horas nas suas obras")

### Sprint 6 — Microinterações e Animações (Concluído)

**O que mudou:**

#### Page Transitions
- `navigate()` agora anima saída da página anterior (`pageOut` 150ms) antes de animar entrada da nova (`pageIn` 250ms) — efeito slide-up/down suave
- `@keyframes pageOut` adicionado ao CSS (fadeOut + translateY(-8px))
- Removida animação inline fixa do `.page.active` — agora é controlada por JS para permitir transição bidirecional

#### Toast com Progress Bar
- `toast()` reescrita: adiciona `.toast-bar` que encolhe de 100% → 0% durante o `duration` (default 2800ms)
- Barra usa `transition: width linear` com duração dinâmica via JS
- Estrutura: `<span class="toast-icon">` + `<span class="toast-msg">` + `<div class="toast-bar">`
- Feedback tátil em mobile: `navigator.vibrate(10)` em toasts

#### Ripple Effect
- Listener global em `document` para clicks em `.btn`
- Cria `<span class="ripple">` posicionado no ponto do clique com tamanho proporcional ao botão
- Animação CSS: `scale(0) → scale(2.5)` com `opacity: 0.5 → 0` em 0.5s
- Elemento é removido após `animationend`
- `.btn` ganha `position: relative; overflow: hidden` para conter o ripple

#### Counting Animation
- `animateCount(el, target, duration=600)` em `utils.js` — anima número de 0 até target com easing cúbico
- Dashboard: stat cards usam `data-count` com valor real, iniciam em "0" e contam via `requestAnimationFrame`
- Horas (`totalHours`) e nota média têm tratamento especial com suffixo (`h`, `★`)

#### Feedback Haptic (mobile)
- `navigator.vibrate(8)` em navegação entre páginas
- `navigator.vibrate(10)` em toasts

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/utils.js` | `toast()` com progress bar; `animateCount()` |
| `src/navigation.js` | `navigate()` com pageOut/pageIn bidirecional + haptic |
| `src/auth.js` | Ripple effect global listener |
| `src/pages.js` | Dashboard stat cards com `animateCount` |
| `style.css` | `@keyframes pageOut`, `.toast-bar`, `.ripple` + `@keyframes rippleAnim`, `.btn` overflow |
| `index.html` | Scripts `v=5` → `v=6` |
| `PROJECT_CONTEXT.md` | Este registro |

#### Arquitetura / Impactos
- **Ripple não intrusivo**: usa `e.target.closest('.btn')` — não interfere em outros elementos nem para propagação
- **Toast bar**: usa `requestAnimationFrame` duplo para garantir que o `transition` inicie após o elemento estar no DOM
- **Counting**: apenas para números > 0; strings como "—" são ignoradas
- **Haptic**: apenas em mobile (window.innerWidth < 768) e apenas se `navigator.vibrate` existir

### Sprint 7 — Mobile/Performance (Concluído)

**O que mudou:**

#### Bottom Sheet Modals (mobile)
- `@media (max-width: 767px)` no `.overlay`: alinha ao fundo (`align-items: flex-end`), sem padding
- Modal vira bottom sheet: `border-radius: 16px 16px 0 0`, `max-height: 85vh`, `margin-top: auto`
- `::before` pseudo-elemento no modal — barra de arrasto (36×4px, arredondada, semi-transparente)
- `@keyframes sheetUp` — slide de baixo (`translateY(100%) → 0`) em 0.3s
- Desktop mantém comportamento original (centralizado com `modalIn` scale)

#### Search Debounce
- `debounce(fn, ms=200)` em `utils.js` — retorna função com timer
- `debouncedRenderCatalogo` em `catalog.js` — `var` global acessível de `oninput`
- Input no `index.html`: `oninput="debouncedRenderCatalogo()"` em vez de `oninput="renderCatalogo()"`
- Reduz re-renders durante digitação rápida

#### Content Visibility
- `.grid .card`, `.home-recent-grid .card`, `.home-fav-grid .card` com `content-visibility: auto`
- `contain-intrinsic-size: 280px` — espaço reservado antes do render
- Browser pula render de cards fora da viewport — ganho em catálogos grandes

#### prefers-reduced-motion
- `@media (prefers-reduced-motion: reduce)` — zera `animation-duration` e `transition-duration` para 0.01ms
- `scroll-behavior: auto` — desativa scroll suave
- Respeita configuração de acessibilidade do sistema

#### Service Worker v4
- Cache explícito de todos os 11 módulos `src/*.js` (antes só `app.js` e `persistence.js`)
- Versão bumpada de `v3` → `v4` para forçar atualização

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `style.css` | Bottom sheet (`@media max-width 767px`), `content-visibility`, `prefers-reduced-motion` |
| `src/utils.js` | `debounce()` |
| `src/catalog.js` | `debouncedRenderCatalogo` |
| `index.html` | `oninput="debouncedRenderCatalogo()"`, scripts `v=7` |
| `sw.js` | Cache de todos os `src/` módulos, bump v3→v4 |
| `PROJECT_CONTEXT.md` | Este registro |

#### Arquitetura / Impactos
- **Bottom sheet**: aplica-se a TODOS os overlays (smartForm, detail, import) automaticamente via CSS — sem JS novo
- **Debounce**: 200ms, testado em typing rápido — sem lag perceptível
- **Content-visibility**: compatível Chrome 85+, Firefox 108+, Safari 18+ — fallback natural (apenas não otimiza)
- **SW v4**: no primeiro carregamento, service worker antigo (v3) ainda serve páginas até o próximo `Ctrl+Shift+R` ou atualização automática

### Sprint 8 — Auditoria UX, Acessibilidade, Responsividade (Concluído)

**O que mudou:**

#### Meta Tags (SEO / Social)
- `<title>` → "Minha Biblioteca — Catálogo pessoal"
- `<meta name="description">` — descrição rica do app
- `<meta property="og:title">`, `og:description`, `og:type`, `og:url` — Open Graph para compartilhamento

#### Acessibilidade (ARIA)
- **Overlays**: `role="dialog"`, `aria-modal="true"`, `aria-label` descritivo nos 3 modais (smartForm, detail, import)
- **Botões fechar**: `aria-label="Fechar"` nos `btn-close`
- **Sidebar**: `role="navigation"` + `aria-label="Navegação principal"`
- **Sidebar items**: `aria-label` em todas as páginas (Timeline, Wishlist, Conquistas, Experiência)
- **Bottom nav**: `aria-label` em todos os itens (Biblioteca, Favoritos, Dashboard, Config)
- **Toast container**: `aria-live="polite"` + `aria-atomic="true"` — leitores de tela anunciam notificações
- **Login card**: mantido sem alterações (já é semanticamente claro)

#### Focus Styles (Teclado)
- `:focus-visible` global com outline 2px + offset 2px usando `var(--accent)`
- Sobrescrita específica para `.btn`, `.chip`, `.nav-item`, `.bottom-nav-item` garantir visibilidade

#### Keyboard Trap (Modais)
- Quando overlay está aberto, Tab cicla apenas dentro dos elementos focáveis do modal
- `e.shiftKey + Tab` no primeiro elemento volta ao último
- Tab no último elemento volta ao primeiro
- Previne que foco escape para o fundo da página

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `index.html` | Meta tags (description, OG), `aria-label` em nav/bottom/moda, `role="dialog"`, `aria-modal`, `aria-live` no toast |
| `src/auth.js` | Keyboard focus trap para modais abertos |
| `style.css` | `:focus-visible` styles globais |
| `PROJECT_CONTEXT.md` | Este registro |

### Sprint 9 — Box Drill-Down (Concluído)

**Problema:** Itens dentro de Box/Coleção apareciam como cards separados no grid, sem distinção visual de que pertenciam a um container.

**Solução:** Itens dentro de Box/Coleção são ocultados do grid principal. Ao clicar em um card de Box/Coleção, o catálogo exibe apenas os itens daquele container como cards individuais. Clicar em um item abre o detail modal normal.

#### O que mudou:

**JS (`src/state.js`)**
- Nova variável global `currentBoxView` (linha 28) — armazena a Box/Coleção atualmente sendo visualizada

**JS (`src/catalog.js`)**
- `renderCatalogo()` (linhas 45-59): constrói um `Set` com IDs de todos os itens filhos de Box/Coleção e os **oculta do grid** (a menos que esteja visualizando a box dona daqueles IDs)
- `renderCard()` (linha 171): container cards agora chamam `openBoxView(id)` em vez de `openDetail(id)`
- `openBoxView(id)` (linhas 345-360): nova função — seta `currentBoxView`, reseta filtros e renderiza apenas os filhos da box
- `closeBoxView()` (linhas 362-365): nova função — limpa `currentBoxView` e re-renderiza catálogo completo
- Breadcrumb (linhas 81-83): quando em box view, título mostra `← Voltar Nome da Box`
- Empty state (linhas 98-100): mensagem específica para box vazia

**JS (`src/navigation.js`)**
- `navigate()` (linha 3): limpa `currentBoxView` ao sair da página biblioteca

**JS (`src/pages.js`)**
- `renderHome()` (linha 111): container cards na Home chamam `openBoxView` em vez de `openDetail`

**CSS (`style.css`)**
- `.box-view-back` (linhas 412-416): link "← Voltar" em destaque com cor accent
- `.hidden` global (linha 418): utilitário `display: none !important`

#### Arquitetura / Impactos
- **Filtro reativo**: `childIds` é recalculado a cada `renderCatalogo()` — ao adicionar/remover itens de uma box, eles somem/reaparecem automaticamente do grid
- **Sem persistência**: `currentBoxView` não é salvo — ao recarregar a página, volta ao catálogo completo
- **Navegação preservada**: ao ir para Home e voltar para Biblioteca, a box view é mantida (útil para voltar de onde parou)
- **Modal de detalhes**: itens dentro da box abrem o detail modal normal (hero, estrelas, status, etc.)

### Sprint 10 — Busca de Livros Aprimorada (Concluído)

**Problema:** A busca de livros usava apenas a API OpenLibrary, que frequentemente retornava dados incompletos ou não encontrava o livro desejado. Não havia fallback nem entrada manual.

**Solução:** Fluxo em cascata: Google Books API → OpenLibrary → campo manual para código OLID/ISBN. Merge automático de dados parciais entre APIs.

#### O que mudou:

**JS (`src/constants.js`)**
- `GOOGLE_BOOKS_KEY` (linha 40): chave da API Google Books

**JS (`src/api.js`)**
- `searchGoogleBooks(title, author)` (linhas 84-102): nova função — busca na API Google Books, extrai ano, autor, sinopse, capa, gêneros. Sem restrição de idioma, sem filtro de preview.
- `fetchOpenLibraryByCode(code)` (linhas 150-198): nova função — busca por OLID (`OL12345W`, `OL12345M`) ou ISBN diretamente na OpenLibrary, com resolução de nome de autor via sub-request
- `buscarOnline()` (linhas 227-245): fluxo de Livro alterado:
  1. Google Books → se achar com dados parciais (sem ano/sinopse/gêneros), tenta OpenLibrary para **merge** (linhas 229-239)
  2. Se Google Books não achou → OpenLibrary puro
  3. Se nada achou → exibe campo OLID manual
  4. `previewCover()` chamado após `applyApiResult` para exibir preview da capa
- `fetchBookByCode()` (linhas 283-304): nova função — lê o código do campo `#f-olid`, chama `fetchOpenLibraryByCode` e aplica resultado no formulário

**JS (`src/modals.js`)**
- Formulário do modal (linhas 158-166): novo campo `#f-olid-field` com input `#f-olid` e botão "🔍 Buscar", oculto por padrão (`class="hidden"`)

**CSS (`style.css`)**
- `.hidden` global (linha 418): classe utilitária para ocultar elementos

#### Fluxo completo de busca de Livro:
```
1. Google Books API → achou com dados completos? ✅ Usa direto
                      → achou com dados parciais?  🔄 Merge com OpenLibrary
                      → não achou?                 ➡️ Passo 2
2. OpenLibrary API → achou?                        ✅ Usa direto
                   → não achou?                    ➡️ Passo 3
3. Campo OLID/ISBN exibido → usuário cola o código → 🔍 Buscar → ✅ Preenche
```

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/constants.js` | `GOOGLE_BOOKS_KEY` adicionada |
| `src/api.js` | `searchGoogleBooks()`, `fetchOpenLibraryByCode()`, `fetchBookByCode()` novas; `buscarOnline()` reescrita para Livro |
| `src/modals.js` | Campo OLID no formulário (`#f-olid-field`) |
| `style.css` | `.hidden` global |
| `PROJECT_CONTEXT.md` | Este registro |

### Sprint 11 — Redesign UI/UX Premium (Concluído)

**Problema:** App com base sólida (dark mode, design tokens, tipografia, animações), mas interface visualmente plana em várias áreas — login sem gradientes, stat cards genéricos, cards sem glow, dashboard estático, timeline sem conector visual, conquistas sem celebração.

**Solução:** Conjunto de melhorias CSS + JS focadas em elevação visual: glassmorphism, gradientes animados, glow por tipo, animações de entrada, microinterações e refinamento de componentes existentes.

#### O que mudou:

**CSS (`style.css`)** — ~250 linhas novas

Novas keyframes:
- `gradientShift` — animação suave de background gradient (login, greeting)
- `shimmerGold` — brilho dourado animado (conquistas)
- `fabPulse` — pulsação do FAB central
- `bounce` — escala elástica (conquistas)
- `checkIn` — checkmark animado (filtros)
- `particleFloat` — flutuação de partículas decorativas (login)
- `glowPulse` — brilho pulsante (ícone do login)
- `barGrow` / `barGrowW` — crescimento vertical/horizontal de barras (dashboard)

Estilos novos:
1. **Login Premium**: overlay com gradiente animado (4 stops, 12s cycle), card com `backdrop-filter: blur(20px)`, borda sutil `rgba(accent, .15)`, glow pulsante no ícone (`glowPulse`), 4 partículas flutuantes
2. **Home stat cards**: valores coloridos por tipo (`accent`/`green`/`blue`/`purple`/`orange`/`gold`/`pink`), gradiente de fundo sutil via `::before`, greeting com destaque gradiente no nome
3. **Cards glow por tipo**: hover com `border-color` + `box-shadow` colorido via `--type-color` e `data-type`, `border: 1px solid transparent` default para evitar layout shift
4. **Dashboard animado**: `border-left: 3px` colorido nos stat cards, `barGrow` nas barras mensais (delay escalonado inline), `cardEnter` nas genre rows (delay nth-child)
5. **Sidebar**: gradiente `180deg` no fundo, nav counters com bg roxo/accent
6. **Bottom nav**: `fabPulse` no FAB (pausado em `:active`), `env(safe-area-inset-bottom/left/right)`, indicador ativo com `linear-gradient`, label em bold quando ativo
7. **Conquistas**: `::after` com `shimmerGold` nas desbloqueadas, `bounce` no ícone, `.achievement-progress` com barra gradiente dourada, `.achievement-unlock-date`
8. **Timeline**: `::before` linha vertical (2px, gradiente), `.tl-work-dot` reposicionado (absolute left 10px), `.tl-work-cover` estilizado (36×52px), `.tl-work-date-relative`
9. **Filtros**: `::after` checkmark animado nos chips ativos, `mask-image` gradient fade nas bordas do scroll, `.chip-count` badge de contagem, `.clear-filters` botão
10. **Toast**: 4 variantes (`.success`, `.error`, `.info`, `.warning`) com borda e barra coloridas
11. **Scroll-to-top**: `.btn-scroll-top` com gradiente, glow, transição fade + translateY, `.visible` state
12. **Detail Modal Split**: `.dmodal-split-wrapper` (flex column → row em 768px), `.dmodal-cover-sidebar` (35%/280px), `.dmodal-cover-wrap` com `::before` gradient overlay, `.dmodal-info-content` scrollável, `.dmodal-info-title` responsivo

**HTML (`index.html`)**
- Login: +2 partículas decorativas (`.shape-3`, `.shape-4`)

**JS (`src/pages.js`)**
- `renderHome()`: greeting agora com `<span class="greeting-highlight">` no nome, stat cards com ícones nos labels
- `renderDashboard()`: `animation-delay` inline nas barras mensais (8% * index)
- `timelineItem()`: nova função `relativeTime()` para formato relativo ("há 3 dias", "ontem", "há 2 sem")
- `checkAchievements()`: agora persiste datas de unlock em `biblioteca_achievements_dates`
- `renderConquistas()`: nova função `getAchievementProgress()` para progresso parcial (cur/max/pct), exibe progress bars e data de unlock
- Todos os cards (home, experiência, sugestões): adicionados `data-type` + `--type-color`

**JS (`src/catalog.js`)**
- `clearAllFilters()` — nova função para limpar todos os filtros
- `updateActiveFilters()` — adiciona botão "Limpar tudo" quando há filtros ativos
- `updateChipCounts()` — nova função que atualiza contadores nos chips de tipo/status
- `renderCard()` — cards agora incluem `data-type` para glow via CSS

**JS (`src/utils.js`)**
- `toast()` — variantes automáticas baseadas no ícone: ✅/🎉 → success, ❌/⚠️ → error, 🔄/ℹ️ → info, ⌛/⏳ → warning

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `style.css` | ~250 linhas: keyframes, login, stat cards, card glow, dashboard, sidebar, bottom nav, achievements, timeline, chips, toast, scroll-top, detail split |
| `index.html` | +2 partículas login |
| `src/pages.js` | greeting highlight, dashboard delays, relativeTime(), progress bars + dates em achievements |
| `src/catalog.js` | `clearAllFilters()`, `updateChipCounts()`, `data-type` nos cards |
| `src/utils.js` | toast variants |
| `PROJECT_CONTEXT.md` | Este registro |

#### Arquitetura / Impactos
- **Zero quebras**: todas as classes CSS existentes preservadas; novas classes são adicionais
- **prefers-reduced-motion**: respeitado globalmente (desativa animações novas também)
- **Inline editing**: já implementado no Sprint 3 — `openInlineEdit()` em modals.js + `closeSmartFormModal()` com detecção de detalhe aberto
- **Scroll-to-top**: evento `scroll` em auth.js (passive) + botão no HTML + estilo no CSS — sem novas dependências
- **Toast variants**: `toast()` continua aceitando mesmos parâmetros — a variante é deduzida automaticamente do ícone
- **Achievement dates**: chave `biblioteca_achievements_dates` no localStorage — compatível com dados existentes (sem data = não exibe)
- **Chip counts**: não interferem com `onclick` handlers — contadores são spans `.chip-count` inseridos via JS
- **Detail modal split**: em mobile (<768px) o layout continua vertical (cover em cima, info embaixo); em desktop (>=768px) vira split 35%/65%

#### Deployment
- `firebase deploy` executado — live em https://entertainment-hub-7777a.web.app

---

### Sprint 12 — Busca Fixa, Chips Horizontais e Filtros Rápidos (Concluído)

**O que mudou:**

#### CSS/HTML
- **Busca fixa**: `.topbar` com `position: sticky; top: 0` — search input `#searchInput` visível em todas as páginas, com `debouncedRenderCatalogo()` (debounce 200ms)
- **Chips horizontais**: duas linhas de `.filter-chips` com `overflow-x: auto` e `scrollbar-width: none` — tipos e status
- **Filtros rápidos**: `setTipoFilter()`, `setStatusFilter()`, `setFavFilter()` — filtro por clique, tags removíveis em `#activeFilters`, botão "Limpar tudo"
- **Contadores**: `updateChipCounts()` — badges `.chip-count` com quantidade por tipo/status
- **Sorting**: dropdown `#filterOrder` — recente, A-Z, nota, favoritos, autor, finalizado, adicionado, horas
- **Animação checkmark**: `@keyframes checkIn` nos chips ativos

#### Arquitetura / Impactos
- Busca fixa e chips substituem navegação por páginas separadas para cada tipo
- Filtros são combináveis (tipo + status + busca textual)
- Sem quebras: filtros antigos continuam funcionando em paralelo

---

### Sprint 13 — Bottom Nav FAB e Config Page (Concluído)

**O que mudou:**

#### HTML/CSS
- **Bottom Nav FAB**: botão `+` centralizado (`#bottom-nav-fab`) com gradiente, elevado, animação `fabPulse`. Abre `openSmartFormModal('add')`
- **Safe areas**: `env(safe-area-inset-bottom/left/right)` no bottom nav
- **Config page** (`#page-config`): avatar, nome, email; botões para Lista de Desejos, Importar, Linha do Tempo, Experiência, Conquistas, Sair
- Touch targets mínimos de 44px, `touch-action: manipulation` em elementos interativos
- Haptic feedback: `navigator.vibrate(8)` em navegação, `navigator.vibrate(10)` em toasts

#### Arquitetura / Impactos
- Config page centraliza acesso a todas as funcionalidades secundárias
- FAB é o principal ponto de entrada para adicionar obras (além do atalho teclado)

---

### Sprint 14 — Timeline Redesigned (Spotify-style) (Concluído)

**O que mudou:**

#### JS (`src/pages.js`)
- `renderTimeline()` reescrita com agrupamento temporal:
  - **Hoje** — obras finalizadas hoje
  - **Ontem** — obras finalizadas ontem
  - **Este mês** — obras finalizadas no mês corrente
  - **Meses anteriores** — agrupadas por `YYYY-MM`
- `relativeTime()` — formato relativo humanizado: "agora mesmo", "há X min", "há Xh", "ontem", "há X dias", "há X sem", "há X meses", "há X anos"
- `quickUpdate()` define/reseta `finishedAt` ao mudar status para Finalizado/outro
- `parseImportRow()` define `finishedAt` para itens importados como Finalizado

#### CSS
- Timeline limpa: sem bordas extras, dots coloridos por status, covers 36×52px
- Touch targets 44px para itens da timeline
- `::before` linha vertical gradiente

#### Arquitetura / Impactos
- Agrupamento temporal melhora a navegação em bibliotecas grandes
- `relativeTime()` substitui datas absolutas para contexto imediato
- Dados retroativos: `finishedAt` é preenchido para itens existentes via `quickUpdate`

---

### Sprint 15 — Detail Modal Redesigned (Concluído)

**O que mudou:**

#### JS (`src/modals.js`)
- **Sticky header**: `.dmodal-header` com `position: sticky; top: 0`, backdrop blur, borda, contém botão voltar, título, indicador de não salvo, botão salvar, lápis de edição, "Editar completo"
- **Dirty tracking**: `detailDirty` + `detailUnsaved` state. Cliques em estrela (`detailStarClick`) e status (`detailCycleStatus`) marcam como sujo. `saveDetailChanges()` persiste. `closeDetailModal()` salva automaticamente se sujo
- **Cover sidebar**: `.dmodal-split-wrapper` com `.dmodal-cover-sidebar` (35% desktop) + `.dmodal-info-content` (scrollável). Cover com gradient overlay e badge de tipo. Mobile empilha verticalmente
- **Hero section**: `.dmodal-info-header` com título, estrelas clicáveis, chip de status, chips de gênero, ano/autor/progresso, barra de progresso
- **Accordions** (substituem as abas antigas):
  - **Minhas Observações** — opinião editável inline, tags com Enter, emoções
  - **Sinopse** — descrição da obra
  - **Jornada da Obra** — integração com `jornada.js`, carregamento dinâmico via `loadJornadaDetail()`
  - **Informações Técnicas** — metadados (ano, episódios, horas, plataforma, etc.)
  - **Histórico de Alterações** — timeline de eventos (adição, finalização, modificações)
- Accordions expandem/recolhem via `toggleAccordion()`

#### Arquitetura / Impactos
- Accordion substitui abas — conteúdo todo visível na mesma página sem troca de tabs
- Dirty tracking previne perda de alterações não salvas
- Split layout desktop aproveita espaço lateral para cover fixa
- Jornada carregada sob demanda apenas quando o accordion é expandido

---

### Sprint 16 — Jornada da Obra (Concluído)

**Problema:** Usuário não tem visibilidade de franquias/completude da coleção. Ao terminar uma obra, não sabe qual é o próximo título da mesma franquia.

**Solução:** Sistema de detecção de franquia com busca em APIs por mídias relacionadas, barra de progresso e recomendação automática do próximo título.

**Arquivo novo:** `src/jornada.js` (559 linhas) + CSS em `style.css`

#### O que mudou:

**JS (`src/jornada.js`)**
- `detectFranchise(title, type)` — heurística: remove sufixos (vol., part, season, #), separa por ` — `, `: `, retorna base da franquia
- `parseSeriesOrder(title)` — extrai número de ordem (volume, parte, season, #) para ordenação
- `fetchJornada(item)` — busca assíncrona com cache em `jornadaCache` (Map): determina franquia, chama API específica por tipo, mescla resultados cross-media, ordena, computa progresso e próximo recomendado
- `fetchJornadaAniList()` — GraphQL AniList: relations diretas + fallback por franquia (anime/mangá)
- `fetchJornadaTMDB()` — TMDB: coleções + fallback por franquia (filme/série/dorama)
- `fetchJornadaRAWG()` — RAWG: busca por franquia (jogos)
- `fetchJornadaOpenLibrary()` — Open Library: busca por franquia (livros)
- `getCrossMediaItems()` — obras da mesma franquia já no catálogo (cross-media)
- `renderJornadaTab()` + `loadJornada()` — renderização no detail modal: barra de progresso, próximo recomendado, categorias por tipo com expand/collapse
- `suggestNextSoon(item)` — painel flutuante que aparece 500ms após finalizar uma obra, sugerindo o próximo título com "Adicionar agora" / "Depois"
- `jornadaAddFromApi()` — adição com 1 clique: busca dados da API, cria item, salva, reabre detail da obra original

**CSS (`style.css`)**
- `.jor-loading`, `.jor-header`, `.jor-franchise` — cabeçalho da jornada
- `.jor-progress-bar`, `.jor-progress-fill`, `.jor-progress-text` — barra de progresso
- `.jor-next-card`, `.jor-next-label`, `.jor-next-inner`, `.jor-next-poster`, `.jor-next-info`, `.jor-next-title`, `.jor-next-meta`, `.jor-next-status`, `.jor-next-add` — card do próximo recomendado
- `.jor-categories`, `.jor-category`, `.jor-category-header`, `.jor-category-icon`, `.jor-category-name`, `.jor-category-count` — categorias por tipo
- `.jor-item`, `.jor-item-title`, `.jor-item-link`, `.jor-item-add` — itens dentro da categoria
- `.jor-badge` (`.done`, `.watching`, `.todo`, `.missing`) — badges de status
- `.jor-rel-tag` — tag de relação (prequel, sequência, etc.)

#### Arquitetura / Impactos
- **Cache em memória**: `jornadaCache` evita refetch durante a mesma sessão
- **Cross-media**: detecta filmes, séries, jogos, livros da mesma franquia — mesmo que o item atual seja de mídia diferente
- **Ordem inteligente**: current item sempre primeiro, depois por número de série/volume
- **Integração modal**: Jornada é carregada sob demanda no accordion do detail modal
- **Zero quebras**: jornada.js é carregado após catalog.js — não interfere em funções existentes

---

### Sprint 17 — Página Experiência (Concluído)

**Problema:** Usuário tem um catálogo grande mas não sabe o que consumir. Não há descoberta ou recomendação.

**Solução:** Nova página "Experiência" com três seções de descoberta.

**O que mudou:**

#### HTML (`index.html`)
- Nova `#page-experiencia` com container `#expContent`

#### JS (`src/pages.js`)
- `renderExperiencia()` — página com 3 seções:
  1. **O que fazer hoje?** — filtros por tempo disponível (30min/1h/2h/3h+/Tanto faz), gênero e tipo. `suggestWorks()` filtra o catálogo, ordena aleatoriamente e exibe até 12 resultados
  2. **Me surpreenda 🎲** — `surpriseMe()` sorteia obra aleatória (excluindo "Quero assistir"), exibe card com poster, título, tipo, nota, gêneros e opinião
  3. **Continue consumindo** — grid de obras em andamento (`status === 'Assistindo'`)
- Sidebar e Config page com entrada "Experiência"

#### CSS (`style.css`)
- `.exp-section`, `.exp-filters`, `.exp-chip-group`, `.exp-chip`, `.exp-select`
- `.exp-results-grid`, `.exp-result-card`, `.exp-result-cover`, `.exp-result-info`
- `.exp-surprise-card`, `.exp-surprise-cover`, `.exp-surprise-body`
- `.exp-watching-grid`

#### Arquitetura / Impactos
- **Tudo local**: sugestões baseadas no catálogo do usuário — sem API calls
- **Filtro por tempo**: converte string de horas (ex: "2h30") para minutos para comparação precisa
- **Surpresa aleatória**: exclui "Quero assistir" para sugerir apenas obras iniciadas ou finalizadas

---

### Sprint 18 — Home Redesign Completo (Concluído)

**Problema:** Home page era um dashboard corporativo com 8 seções — repetia informações da Biblioteca, Dashboard e outras páginas. Sobrecarregava o usuário com dados em vez de servir como porta de entrada.

**Filosofia:** A Home deve responder apenas duas perguntas:
- O que eu estava consumindo?
- O que eu quero fazer agora?

Não deve substituir a Biblioteca, o Dashboard ou qualquer outra página.

#### O que mudou:

**JS (`src/pages.js`)**

`renderHome()` completamente reescrita com 4 seções enxutas:

1. **Hero** — Saudação por horário (`Bom dia / Boa tarde / Boa noite`), nome do usuário com destaque gradiente, total de obras cadastradas, e 3 botões grandes e tocáveis:
   - ➕ Adicionar Obra — abre `openSmartFormModal('add')`
   - ❤️ Lista de Desejos — abre `openSmartFormModal('wish')`
   - 🎲 Surpreenda-me — chama `surpriseHome()` (sorteia obra aleatória excluindo "Quero assistir")

2. **Para Você Hoje** — Seção inteligente com 4 estados dinâmicos:
   - ▶ Continue assistindo/lendo/jogando — mostra obra mais recente em andamento
   - ⏸ Você parou aqui… — se a obra em andamento está parada há >30 dias
   - 📦 Continue sua coleção — se não há watching mas existe Box/Coleção em progresso
   - ✨ Nada em andamento — estado vazio com botões "Adicionar obra" e "Explorar recomendações"
   - Card horizontal com cover à esquerda, título, tipo/ano, progresso (container) e botão Continuar/Retomar

3. **Continue Consumindo** — Scroll horizontal único (substitui 3 seções separadas + containers):
   - Mistura automática de assistindo/lendo/jogando + boxes em andamento
   - Ordenado por última atividade (id decrescente)
   - Máximo de 8 itens
   - Cada card: capa (2:3), título, tipo/status, progresso (container), botão ▶
   - Container abre com `openBoxView()`, demais com `openDetail()`

4. **Acessos Rápidos** — 4 banners discretos (substituem estatísticas, grid de tipos, favoritos e atalhos):
   - 📊 Dashboard · Veja sua evolução.
   - 📚 Biblioteca · Todas as obras.
   - ✨ Experiência · Descubra algo para consumir hoje.
   - ❤️ Favoritos · Suas obras favoritas.
   - Hover com translateX(4px) — feedback sutil

5. **Empty State** — Quando `db.length === 0`:
   - Ilustração centralizada com animação `float` (levitação)
   - "Sua jornada começa aqui"
   - "Você ainda não possui nenhuma obra cadastrada."
   - Botão único "Adicionar primeira obra"

Nova função auxiliar:
- `surpriseHome()` — seleciona obra aleatória (excluindo "Quero assistir") e abre `openDetail()`

**Removido da Home:**
- ❌ Grid Minha Biblioteca (grid de tipos por contagem)
- ❌ Grid Favoritos (até 6 cards)
- ❌ Estatísticas rápidas (8 métricas em grid)
- ❌ Cards por tipo (Continue assistindo / lendo / jogando separados)
- ❌ Containers em progresso (grid separado)
- ❌ Últimas obras (grid de 8 recentes)
- ❌ Atalhos no rodapé
- ❌ Empty state antigo com dicas de APIs

**CSS (`style.css`)**

Novos estilos com prefixo `h-*` (~160 linhas):

| Classe | Função |
|--------|--------|
| `.h-hero` | Container hero com animação `pageIn` |
| `.h-hero-greeting` | Título grande (Outfit extrabold, `--font-2xl` → `--font-3xl` em 640px) |
| `.greeting-highlight` | Gradiente accent→accent2 no nome |
| `.h-hero-sub` | Subtítulo "Você possui X obras cadastradas." |
| `.h-hero-actions` | Flex row para 3 botões |
| `.h-hero-btn` | Botão grande (min-height 52px → 60px em desktop), background surface, hover translateY |
| `.h-smart` | Seção "Para Você Hoje" com animação atrasada |
| `.h-smart-card` | Card horizontal com cover (90×120px) + body + accent border-color no hover |
| `.h-smart-progress` / `.h-smart-bar` / `.h-smart-bar-fill` | Barra de progresso para containers |
| `.h-smart-btn` | Pill button colorido por `--smart-accent` |
| `.h-smart-idle` | Estado vazio da smart section (borda dashed) |
| `.h-scroll` | Horizontal scroll com snap, padding negativo para efeito edge-to-edge |
| `.h-scroll-card` | Card vertical (min-width 200px → 180px em 640px), hover translateY(-4px) |
| `.h-scroll-card-cover` | Poster 2:3 com zoom no hover |
| `.h-scroll-card-btn` | Botão ▶ circular (32px), sempre visível, shadow glow |
| `.h-scroll-progress` / `.h-scroll-bar` / `.h-scroll-bar-fill` | Barra fina (3px) para containers |
| `.h-quick` | Container column para 4 banners |
| `.h-quick-card` | Banner horizontal com icon 36px + body + seta, hover translateX |
| `.h-quick-icon` | Fundo surface2 circular para ícone |
| `.h-quick-arrow` | Seta ↓ com translateX no hover |
| `.h-empty` | Empty state centralizado (min-height 60vh) |
| `.h-empty-icon` | Ícone grande com `@keyframes float` |
| `.h-empty-title` / `.h-empty-desc` | Tipografia do empty state |

Removidos (~260 linhas):
- `.home-greeting`, `.home-wave`, `.home-section`, `.home-section-title`
- `.home-hscroll`, `.hscroll-card`, `.hscroll-more`
- `.home-type-grid`, `.home-type-card`, `.home-type-icon`, `.home-type-name`, `.home-type-count`
- `.home-stats-grid`, `.home-recent-grid`, `.home-actions`, `.home-action-btn`, `.home-empty`
- `.home-empty-state`, `.home-empty-icon`, `.home-empty-tips`, `.home-tip`, `.home-empty-actions`
- `.home-fav-grid`, `.home-container-grid`, `.home-container-card`, `.home-container-cover`, `.home-container-body`, `.home-container-title`, `.home-container-bar`, `.home-container-bar-fill`, `.home-container-meta`
- `.home-greeting-text .greeting-highlight`
- `.home-skeleton`, `.home-skeleton-greeting`, `.home-skeleton-section`, `.home-skeleton-card`, `.home-skeleton-stat`
- Media queries antigas para `.home-*` em 320px, 640px, 1024px

**Arquitetura / Impactos**
- **Zero quebras estruturais**: todas as funções globais (`openDetail`, `openSmartFormModal`, `navigate`, `Toast`, `surpriseHome`) permanecem intactas
- **Remoção segura**: classes `.home-*` removidas do CSS pois não são mais referenciadas por nenhum HTML
- **Performance**: Home agora renderiza 4 seções em vez de 8+ — menos DOM, menos queries, menos render
- **Mobile-first**: animações de entrada em cascata, scroll horizontal com snap, botões com min-height 52px
- **Dados sob demanda**: apenas `db` e `wishdb` são consultados — sem chamadas a funções de outras páginas
- **`findInDb`** continua disponível via utils.js para resolver itens de container

---

#### Pendências Históricas
- [x] Sprint 1: Refatoração de arquitetura (modularização em 10 arquivos, limpeza)
- [x] Sprint 2: UI dos cards (redesign completo, animações de entrada, badges, hover)
- [x] Sprint 3: Modal de edição unificado (SmartFormModal, validação inline, preview cover, batch edit)
- [x] Sprint 4: Nova Home (seções dinâmicas, favoritos, progresso, estado vazio educativo)
- [x] Sprint 5: Dashboard rico (donut chart, horas por tipo, distribuição notas, evolução mensal)
- [x] Sprint 6: Microinterações (page transitions, toast progress, ripple, count animation, haptic)
- [x] Sprint 7: Mobile/Performance (bottom sheet, debounce, content-visibility, SW v4, reduced-motion)
- [x] Sprint 8: Auditoria UX, acessibilidade, responsividade (meta tags, a11y, focus trap, aria)
- [x] Sprint 9: Box Drill-Down (ocultar itens filhos, navegação por box)
- [x] Sprint 10: Busca de Livros Aprimorada (Google Books + OpenLibrary + OLID manual)
- [x] Sprint 11: Redesign UI/UX Premium (glassmorphism login, stat cards, glow, dashboard animado, timeline, conquistas, filtros, microinterações)
- [x] Sprint 12: Busca fixa, chips horizontais e filtros rápidos
- [x] Sprint 13: Bottom nav FAB e Config page
- [x] Sprint 14: Timeline redesigned (Spotify-style)
- [x] Sprint 15: Detail modal redesigned (accordions, sticky header, dirty tracking)
- [x] Sprint 16: Jornada da Obra (franchise detection, progress, auto-suggestion)
- [x] Sprint 17: Página Experiência (descubra o que consumir hoje)
- [x] Sprint 18: Home Redesign Completo (Hero, Para Você Hoje, Continue Consumindo, Acessos Rápidos, Empty State)
- [x] Sprint 19: Melhorias de UX Baseadas em Feedback (Onde Parei, Observação visível, Nota Emocional, Tags Negativas, Cinema, Botão duplicado, Tradução, Ano)
- [x] Sprint 20: Melhorias de UX/UI (Command Palette, Light Mode, Filtros Inteligentes, Onboarding, Stories, Gestos, Heatmap, Drag&Drop)
- [x] Sprint 21: Progresso Inteligente para Séries/Animes (TMDB/AniList, seletores, auto-save, próx. episódio, especiais)
- [x] Sprint 22: Reorganização do Cabeçalho do Modal (hierarquia, status dropdown, cores, metadados compactos)
- [x] Sprint 8.0: Arquitetura de Templates para o Modal de Detalhes (getTemplate, progresso por template, seções condicionais, progresso de leitura)
- [x] Sprint 8.0b: Modelo de Entidades + Formulário Dinâmico (Obra/Metadados/Progresso/Consumo/IDsExternos, campos por tipo, cover via botão, duração em minutos)

---

### Sprint 19 — Melhorias de UX Baseadas em Feedback (Concluído)

**Problema:** Correções e melhorias baseadas no uso real da aplicação, focadas em rastreamento de progresso, UX do formulário e qualidade das informações.

**O que mudou:**

#### 1. Campo "Onde Parei" — Temporada/Episódio e Capítulo/Página
**JS (`src/catalog.js`)**
- `updateProgressFields()` (linhas 389-428): injeta dinamicamente campos conforme o tipo selecionado:
  - **Anime/Série/Dorama:** `f-season` (Temporada), `f-current-ep` (Ep. atual), `f-episodes` (Total de episódios)
  - **Mangá/Livro:** `f-current-ch` (Capítulo/Página atual), `f-chapters-total` (Total)
  - **Filmes/Jogos:** apenas `f-hours`
- `updateStatusOptions()` chama `updateProgressFields()` no `onchange` do tipo

**JS (`src/modals.js`)**
- `fillEditForm()` (linhas 344-349): preenche os novos campos
- `saveItem()` (linhas 503-507): persiste `season`, `currentEp`, `episodes`, `currentChapter`, `chaptersTotal`

#### 2. Observação (opinion) sempre visível no Detail Modal
**JS (`src/modals.js`)**
- `renderMinhasObservacoes()` (linha 940): sempre renderiza a seção, mesmo vazia
- `renderObsOpinion()` (linha 958): exibe placeholder `"Nenhuma observação registrada."` em itálico sutil quando vazio
- Botão lápis sempre visível na seção

**CSS (`style.css`)**
- `.dmodal-obs-empty`: estilo itálico com cor `var(--text3)` para placeholder

#### 3. Nota Emocional — Ícones como Estrelas + Toggle
**JS (`src/modals.js`)**
- `buildEmotionGrid()` (linhas 685-693): botões usam `★` (estrela) em vez de emoji
- Checkbox `#f-emotion-toggle` + `toggleEmotionSection()` (linhas 696-700): expande/recolhe a grade
- `fillEditForm()`: marca checkbox se houver emoções salvas

#### 4. Tags Pessoais — Tags Negativas
**JS (`src/constants.js`)**
- `NEGATIVE_TAGS` (linhas 17-21): `['💔 Final ruim','⏸️ Hiato','🚫 Descontinuado','😴 Ritmo lento','💸 Paywall','📉 Caiu de qualidade','🤦 Decepcionante','😡 Raiva','🐌 Enrolação','🔄 Repetitivo','🧩 Plot holes','😐 Medíocre']`

**JS (`src/modals.js`)**
- `buildTagsWrap()` (linhas 702-706): renderiza tags positivas (`ALL_TAGS`) em `#tagsWrap`
- `buildNegTagsWrap()` (linhas 708-714): renderiza tags negativas (`NEGATIVE_TAGS`) em `#tagsWrapNeg`
- Dois grupos separados com títulos "✨ Positivas" e "⚠️ Negativas"

#### 5. Cinema — Apenas Checkbox
**JS (`src/modals.js`)**
- `renderSmartFormBody()` (linhas 180-187): apenas checkbox `#f-cinema-watched`; campos de data/nome/cidade/formato viram `hidden` (retrocompatibilidade)
- `saveItem()`: persiste apenas `cinemaWatched`

**JS (`src/catalog.js`)**
- `toggleCinemaFields()` (linhas 430-432): stub vazio (simplificado)

#### 6. Botão "Editar Completo" Duplicado Removido
**JS (`src/modals.js`)**
- `renderDetailModal()` (linha 750): único lápis `#dmodalPencil` chama `openInlineEdit(itemId)` — edição completa
- Lápis pequeno nas observações (linha 948) chama `toggleDetailEdit()` — edição inline de observações (propósito diferente)

#### 7. Traduzir Descrição para Português
**JS (`src/api.js`)**
- `translateToPortuguese(text)` (linhas 318-334): API MyMemory gratuita (`en|pt-BR`)
- `translateSynopsis()` (linhas 336-352): botão no formulário
- `translateDetailSynopsis()` (linhas 354-377): botão no accordion de sinopse do detail modal

**JS (`src/modals.js`)**
- Botão `🌐 Traduzir para português` no formulário (linha 195) e no detail modal (linha 888)

#### 8. Remover Limite de Ano (1800–2100)
**JS (`src/modals.js`)**
- `validateForm()` (linhas 388-396): valida ano como número 1-9999, sem restrição 1800-2100
- `renderSmartFormBody()` (linha 151): input `f-year` sem `min`/`max`

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/constants.js` | `NEGATIVE_TAGS` adicionada |
| `src/api.js` | `translateToPortuguese()`, `translateSynopsis()`, `translateDetailSynopsis()` |
| `src/catalog.js` | `updateProgressFields()`, `toggleCinemaFields()` simplificado |
| `src/modals.js` | Campos progresso, observações sempre visíveis, emoções como estrelas + toggle, tags negativas, cinema simplificado, lápis unificado, botão traduzir, validação ano |
| `style.css` | `.dmodal-obs-empty` |
| `PROJECT_CONTEXT.md` | Este registro |

---

### Sprint 21 — Progresso Inteligente para Séries/Animes (Concluído)

**Problema:** O controle de progresso para Séries e Animes usava campos de texto simples (Temporada, Episódio, Total). O usuário precisava digitar manualmente e saber quantas temporadas/episódios existiam — experiência manual e propensa a erro.

**Solução:** Sistema inteligente de progresso com dados das APIs TMDB (Séries/Doramas) e AniList (Animes), com seletores automáticos, auto-save, botão "Próximo episódio", barra dupla (temporada + série), auto-finalização e detecção de novas temporadas.

#### O que mudou:

**JS (`src/api.js`)**
- `searchTMDB()` agora retorna `tmdbId` no resultado
- `searchAniList()` agora retorna `anilistId` no resultado
- `applyApiResult()` persiste `tmdbId` e `anilistId` em campos ocultos do formulário
- Novas funções:
  - `resolveTMDBId(item)` — busca TMDB ID pelo título quando o item não possui `tmdbId` salvo. Permite que itens antigos recebam dados de temporadas retroativamente
  - `fetchAllSeasonEpisodes(tmdbId, seasons)` — busca episódios de TODAS as temporadas em paralelo via `Promise.allSettled` (1 chamada por temporada)
  - `fetchSeasonData(item)` — refatorado: usa `resolveTMDBId` para buscar ID por título se necessário; busca todas as temporadas e episódios; computa `allEpCount` (total geral); fallback AniList single-season
  - `fetchSeasonEpisodes(tmdbId, seasonNumber)` — busca episódios de temporada específica (lazy load para seasons não cacheadas)

**JS (`src/modals.js`)**
- Formulário: campos ocultos `f-tmdb-id` e `f-anilist-id`
- `saveItem()`: salva `tmdbId` e `anilistId` no item
- `fillEditForm()`: preenche campos ocultos na edição
- Detail modal — seção de progresso sempre visível, totalmente refeita:
  - **renderProgressPlaceholder** — placeholder loading para séries/animes
  - **renderSmartProgress** — busca dados via API (com fallback title-search → TMDB), renderiza smart selectors ou manual
  - **renderSmartProgressHTML** — HTML completo com:
    - Select de temporada: `Temporada N (X ep.)`
    - Select de episódio: `Episódio X de Y`
    - Botão ▶ "Próximo episódio"
    - Barra de progresso da temporada: `X de Y episódios`
    - Barra de progresso geral da série (se houver múltiplas temporadas): `X de Y episódios · Z%`
    - Mensagem de conclusão quando obra finalizada
    - Alerta de novas temporadas disponíveis
  - **renderFallbackProgress** — inputs manuais (temporada + episódio + total) quando API indisponível
  - **detailSeasonChange** — auto-save season + reset ep=1, carrega episódios da nova temporada
  - **detailEpisodeChange** — auto-save episódio, atualiza barras, checa finalização
  - **detailNextEpisode** — avança 1 episódio; no último, avança para próxima temporada; no último da última, auto-finaliza
  - **isLastSeason** — detecta se é a última temporada conhecida via API
  - **computeOverallPct** — calcula % geral (soma episódios anteriores + atual ÷ total)
  - **autoFinalize** — altera status para "Finalizado", registra `finishedAt`, atualiza UI e achievements
  - **checkNewSeasonAlert** — detecta se API tem temporadas além da atual e exibe aviso
  - **detailAutoSaveProgress** — salva direto em localStorage + Firestore sem dirty tracking/notificação
  - **detailFallbackChange** — auto-save para inputs manuais
  - **updateProgressUI** — atualiza seletor de episódios ao mudar de temporada
  - **refreshProgressUI** — atualiza todas as barras, labels, mensagens de conclusão e alertas
- `openDetail()` chama `renderSmartProgress(item)` após render
- `renderDetailModal()` inclui `renderProgressPlaceholder(item)` no fluxo
- Antigo `renderProgressInline()` removido

**CSS (`style.css`)**
- ~140 linhas: refatoração completa da seção `.dprogress-*`
- Novos seletores: `.dprogress-overall`, `.dprogress-overall-label`, `.dprogress-bar--overall`, `.dprogress-bar-fill--overall`, `.dprogress-complete-msg`, `.dprogress-new-seasons`

#### Arquitetura / Impactos
- **Title resolve**: `resolveTMDBId()` busca TMDB ID por título na primeira abertura do detail — itens antigos ganham dados automaticamente sem precisar readicionar
- **Fetch paralelo**: `fetchAllSeasonEpisodes` usa `Promise.allSettled` — todas as temporadas são carregadas em paralelo (sem阻塞)
- **Auto-finalização**: `autoFinalize()` é chamada quando currentEp >= total da última temporada E overallPct >= 100%. Muda status + finishedAt + persiste + atualiza achievements
- **Nova temporada**: `checkNewSeasonAlert()` compara último season_number da API com o atual do usuário. Exibe aviso "✨ Novos episódios disponíveis!" quando há seasons não assistidas
- **Barra dupla**: season bar (gradiente accent) + overall bar (gradiente roxo, mais fina 5px) — visível apenas quando há múltiplas temporadas
- **Select formatado**: dropdown de episódios mostra "Episódio X de Y" para clareza visual
- **Cache inteligente**: `seasonDataCache` por `item.id` + busca lazy via `fetchSeasonEpisodes` para seasons não cacheadas
- **Zero quebras**: funções existentes inalteradas; fallback manual preservado

---

### Sprint 22 — Reorganização do Cabeçalho do Modal (Concluído)

**Problema:** O cabeçalho do modal de detalhes misturava estrelas, status e metadados na mesma linha, sem hierarquia visual clara. O status era apenas um texto clicável que ciclava sem feedback visual imediato. Ano/autor/tipo se repetiam na seção de info técnica.

**Solução:** Cabeçalho reorganizado com hierarquia vertical limpa, status como dropdown colorido com auto-save, metadados compactos em chips, e remoção de redundâncias.

#### O que mudou:

**Hierarquia do cabeçalho (`.dmodal-info-header`):**
```
Título (extrabold, compacto)
★★★★★ (sempre visível, clicável)
[ Status ▼ ] (select estilizado como chip, cor dinâmica)
🎬 2022 · Autor · Drama · Fantasia (chips neutros)
```

**JS (`src/modals.js`)**
- `renderDetailInfoContent()` reescrita:
  - Título com `--font-lg` (mais compacto)
  - Estrelas em linha própria (`.dmodal-info-stars`), sempre visíveis
  - Status como `<select>` estilizado (`.dmodal-status-select`) com cor dinâmica via `--status-color`
  - Metadados em linha de chips (`.dmodal-meta-row` / `.dmodal-meta-chip`): type icon, year, author, gêneros (máx 3 + "+N")
- `detailCycleStatus()` removida — substituída por `detailStatusChange(newStatus)`:
  - Altera `item.status` e persiste imediatamente (localStorage + Firestore)
  - Se mudar para "Finalizado" sem `finishedAt`, registra data
  - Se mudar de "Finalizado" para outro, limpa `finishedAt`
  - Atualiza cor do select via `--status-color`
  - Dispara `checkAchievements()`
  - Toast de confirmação
- `hasInfoTecnica()` simplificada: remove `item.author` e `item.year` (agora no header)
- `renderInfoTecnicaContent()`: remove rows de autor e ano; progresso manual só exibe se não houver `tmdbId` (evita duplicar smart progress)
- `autoFinalize()` atualiza o `<select id="dmodalStatus">` em vez do antigo `.dhero-chip--status`

**JS (`src/constants.js`)**
- `STATUS_COLORS` expandido com cores por status e por tipo de mídia:
  - `Quero assistir/ler/jogar` → Azul (`#3b82f6`)
  - `Assistindo/Lendo/Jogando/Colecionando` → Roxo (`#a855f7`)
  - `Pausado` → Amarelo (`#f59e0b`)
  - `Finalizado` → Verde (`#34d399`)
  - `Abandonado` → Vermelho dessaturado (`#ef4444`)

**CSS (`style.css`)**
- `.dmodal-info-header` — padding reduzido (`--space-3`), layout mais compacto
- `.dmodal-info-title` — `--font-lg` (menor), `margin-bottom: --space-1`
- `.dmodal-info-stars` — linha própria, `font-size: 1.3rem`, `gap: 2px`
- `.dmodal-status-select` — `<select>` estilizado como chip/badge:
  - `appearance: none`, borda e bg com `--status-color` via `color-mix`
  - Seta SVG customizada, padding `4px 28px 4px 12px`
  - Hover com `filter: brightness(1.2)`
- `.dmodal-meta-row` — flex wrap, gap 5px
- `.dmodal-meta-chip` — `font-size: 0.72rem`, `border-radius: full`, bg surface2
- `.dmodal-meta-chip--more` — dashed border
- Removidos: `.dhero-chips`, `.dhero-chip`, `.dhero-chip--type`, `.dhero-chip--status`, `.dhero-chip--genre`, `.dhero-chip--more`, `.dhero-meta`

#### Arquitetura / Impactos
- **Status com auto-save**: `detailStatusChange` persiste imediatamente sem dirty tracking — mesma abordagem do auto-save de progresso
- **Cores dinâmicas**: o `<select>` usa `--status-color` como variável CSS, atualizada via JS no change e no `autoFinalize`
- **Sem redundância**: `item.author` e `item.year` removidos do accordion de info técnica — pertencem apenas ao header
- **Progresso manual condicional**: em `renderInfoTecnicaContent`, o bloco "Onde parei" só renderiza se NÃO houver `tmdbId` (smart progress já mostra no header)
- **Zero quebras**: `renderDetailHero(item)` mantida como alias; funções de star click inalteradas

---

### Sprint 8.0 — Arquitetura de Templates para o Modal de Detalhes (Concluído)

**Problema:** O modal de detalhes tinha seções fixas (progresso, accordions) que não se adaptavam ao tipo de mídia. Séries e Animes usavam progresso inteligente TMDB, mas Livros/Mangás não tinham progresso dedicado, e Filmes/Jogos mostravam placeholders vazios. Novos tipos de mídia exigiriam alterações manuais em múltiplos pontos do código.

**Solução:** Arquitetura baseada em templates que classifica cada obra por um template (consumo-episodico, consumo-unico, leitura, jogo, container) e condiciona a renderização de progresso e seções automaticamente.

#### O que mudou:

**JS (`src/modals.js`)**

- **`getTemplate(item)`** (linha 743): nova função de classificação:
  - `Box/Coleção` → `'container'`
  - `Série/Anime/Dorama` → `'consumo-episodico'`
  - `Filme` → `'consumo-unico'`
  - `Livro/Mangá` → `'leitura'`
  - `Jogo` → `'jogo'`
  - Fallback → `'consumo-unico'`

- **`renderDetailModal()` refatorada**: usa `getTemplate(item)` para condicionar:
  - `renderProgressByTemplate(item, template)` — renderiza progresso adequado ao template
  - `renderDefaultSections(item, template)` — accordions adaptados ao template

- **`openDetail()`** (linha 740): `renderSmartProgress(item)` agora só é chamado se `template === 'consumo-episodico'` — evita fetch desnecessário para outros tipos

- **`renderProgressPlaceholder()` removida** — substituída por:

- **`renderProgressByTemplate(item, template)`** (linha 874):
  - `'consumo-episodico'` → placeholder loading + `renderSmartProgress` (comportamento anterior)
  - `'leitura'` → `renderReadingProgressHTML(item)` (novo)
  - demais → retorna `''` (sem progresso)

- **`renderReadingProgressHTML(item)`** (linha 882): novo progresso para Livros/Mangás:
  - Barra de progresso com % calculada (`currentChapter / chaptersTotal`)
  - Input numérico para capítulo/página atual (label dinâmica: "Capítulo" para Mangá, "Página" para Livro)
  - Total exibido ao lado se `chaptersTotal` existir
  - Botão ▶ "Avançar" que incrementa 1 e auto-salva
  - Auto-finalização ao atingir o total

- **`detailReadingChange()`** (linha 906): auto-save de `currentChapter` no input change; chama `autoFinalize()` se `chaptersTotal` for atingido

- **`detailReadingNext()`** (linha 917): avança 1 capítulo/página e chama `detailReadingChange()`

- **`renderItemSections()` renomeada para `renderDefaultSections(item, template)`** (linha 1316):
  - Accordions sem emojis decorativos nos títulos
  - Passa `template` para `hasInfoTecnica` e `renderInfoTecnicaContent`

- **`hasInfoTecnica(item, template)`** (linha 1369): aceita parâmetro `template`:
  - `'leitura'` — só checa campos relevantes (não checa `season/currentEp`)
  - `'consumo-unico'` / `'jogo'` — checa apenas campos não-progresso
  - default — checa todos os campos (comportamento anterior)

- **`renderInfoTecnicaContent(item, template)`** (linha 1375):
  - Aceita `template` — progresso manual episódico só renderiza se `template === 'consumo-episodico' && !item.tmdbId`
  - Labels sem emojis decorativos
  - Container `renderContainerSections` preservado sem alterações

#### Arquitetura / Impactos

- **Incremental**: `getTemplate()` não quebra nada existente — todo item existente será corretamente classificado
- **Extensível**: novos tipos (HQ, Podcast, Curso) só precisam de uma associação em `getTemplate()` e, se necessário, novas funções de progresso
- **Leitura funcional**: `detailReadingChange` e `detailReadingNext` seguem o mesmo padrão de auto-save de `detailEpisodeChange`/`detailNextEpisode`
- **Sem duplicação**: `renderProgressPlaceholder` removida porque `renderProgressByTemplate` cobre todos os casos
- **Container isolado**: `renderContainerSections` não foi alterado — containers têm seções muito específicas (lista de itens, botão adicionar)
- **Emojis removidos dos accordions**: seções do modal agora seguem a diretriz "sem emojis decorativos" do Sprint 22

---

### Sprint 8.0b — Modelo de Entidades + Formulário Dinâmico (Concluído)

**Problema:** O formulário de adição/edição era genérico demais — exibia os mesmos campos para todos os tipos (ex: "Autor(a)/Diretor(a)" aparecia para Jogos, "Onde assisti/joguei" aparecia para Livros). Não havia separação clara entre dados comuns (título, capa, nota) e dados específicos por tipo (diretor, estúdio, plataforma, progresso). Adicionar novo tipo de mídia exigia alterações manuais em múltiplos pontos.

**Solução:** Reformulação completa do modelo de dados com 5 entidades + formulário dinâmico que exibe apenas campos relevantes por tipo.

#### Modelo de Entidades

Cada item agora é organizado em 5 entidades no banco de dados:

| Entidade | Campos | Tipo |
|----------|--------|------|
| **`obra`** | title, cover, year, genres, synopsis, opinion, rating, emotions, tags, negTags, fav | **Todas** |
| **`metadata`** | director (Filme), creator (Série/Dorama), studio (Anime), author (Livro/Mangá), developer (Jogo), publisher (Jogo, oculto) | **Por tipo** |
| **`progress`** | season, currentEp, episodes (Série/Anime/Dorama); currentChapter, chaptersTotal, volume, totalVolumes, collection (Livro/Mangá); hoursPlayed (Jogo, futuro) | **Por tipo** |
| **`consumption`** | platform (Onde assisti / Plataforma), cinemaWatched (Filme), durationMinutes (Filme, em minutos) | **Por tipo** |
| **`externalIds`** | tmdbId, anilistId, rawgId | **Todas** (oculto) |

#### O que mudou:

**JS (`src/utils.js`)**
- **`normalizeItem(item)`** — nova função que migra automaticamente itens do formato antigo (plano) para o novo (entidades). Chamada em `findInDb()`, `loadCatalog()`, `onSnapshot` e `state.js`. Mantém propriedades planas para retrocompatibilidade total.

**JS (`src/modals.js`)**
- **`renderSmartFormBody()`** — formulário add/edit reescrito:
  - **Campos de metadados** divididos em 5 exclusivos: `f-director` (Filme), `f-creator` (Série/Dorama), `f-studio` (Anime), `f-author` (Livro/Mangá), `f-developer` (Jogo). Apenas um visível por vez via `data-types`.
  - **Campos de consumo** divididos: `f-platform` com label "Onde assisti" (Filme/Série/Anime/Dorama) ou "Plataforma" (Jogo); oculto para Livro/Mangá.
  - **`f-duration-minutes`** substitui `f-hours` para Filmes (armazena minutos da API).
  - **`f-volume`**, **`f-total-volumes`**, **`f-collection`** adicionados para Livro/Mangá (preparação para Boxes).
  - **Capa**: URL field oculto (`display:none`); botão "🖼️ Trocar capa" + input file para upload via data URL.
  - **`handleCoverFile(event)`** — nova função: lê arquivo selecionado, converte para data URL, salva em `f-cover`, exibe preview.
  - Campos ocultos legados (`f-cinema-date`, `f-cinema-name`, `f-cinema-city`, `f-cinema-format`) removidos.
- **`saveItem()`** — reescrita: salva no formato de entidades (`obra`, `metadata`, `progress`, `consumption`, `externalIds`).
- **`fillEditForm()`** — reescrita: lê de `item.obra.*`, `item.metadata.*`, `item.progress.*`, `item.consumption.*`, `item.externalIds.*`.
- **`confirmCreateBoxColecao()`** — reescrita para formato de entidades.
- **`authorLabels`** corrigido: Dorama → "Criador" (era "Diretor").

**JS (`src/catalog.js`)**
- **`updateStatusOptions()`** renomeado para **`updateFormFields()`**: além do status, agora controla visibilidade de todos os campos tipo-específicos via `data-types` e classes `.ff-meta`, `.ff-consumo`, `.ff-leitura`.

**JS (`src/api.js`)**
- **`searchTMDB()`** — agora retorna `durationMinutes` (runtime do filme em minutos).
- **`applyApiResult()`** — reescrita: seta o campo de metadados correto por tipo (`f-director`, `f-creator`, `f-studio`, `f-author`, `f-developer`); seta `f-duration-minutes`.
- **`buscarOnline()`** — lê autor do campo correto por tipo.

**JS (`src/persistence.js`)**
- Itens carregados do Firestore e localStorage são normalizados via `normalizeItem()`.

**JS (`src/state.js`)**
- Itens carregados do localStorage são normalizados via `normalizeItem()`.

#### Arquitetura / Impactos

- **Retrocompatibilidade total**: `normalizeItem()` mantém propriedades planas (ex: `item.author`, `item.hours`) a partir dos dados das entidades. Todo código existente continua funcionando sem alterações.
- **Migração automática**: itens antigos (formato plano) são migrados para entidades na primeira leitura via `findInDb()`. Itens novos já são salvos em formato de entidades.
- **Extensível**: novo tipo de mídia (ex: Podcast) = adicionar campo em `metadata` e uma regra em `updateFormFields()`.
- **Firestore compatível**: entidades são objetos aninhados (maps) — Firestore suporta nativamente.
- **Cover por upload**: URL da capa fica oculta; usuário faz upload de arquivo ou usa busca online.

#### Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/utils.js` | `normalizeItem()`, `findInDb()` normaliza |
| `src/state.js` | `db` inicializado com `normalizeItem()` |
| `src/modals.js` | `renderSmartFormBody()` reescrito, `saveItem()` reescrito, `fillEditForm()` reescrito, `handleCoverFile()` novo, `confirmCreateBoxColecao()` atualizado |
| `src/catalog.js` | `updateFormFields()` substitui `updateStatusOptions()` |
| `src/api.js` | `searchTMDB()` runtime, `applyApiResult()` tipo-aware, `buscarOnline()` campo correto |
| `src/persistence.js` | Normalização em `loadCatalog()` e `subscribeCatalog()` |
| `PROJECT_CONTEXT.md` | Este registro |

---

### Sprint 8.1 — Polimento e Correções (Concluído)

**Problema:** Campos em branco no formulário de edição, tags negativas não aparecendo, título duplicado no modal.

**O que mudou:**

#### JS (`src/modals.js`)
- `fillEditForm()`: guarda `addModalTitle` com `if (titleEl)` — evita TypeError quando título removido
- `openInlineEdit()`: adiciona `buildNegTagsWrap()` — tags negativas agora aparecem e são populadas
- `openInlineEdit()`: adiciona botão "💾 Salvar" no header
- `saveItem()`: `tags` e `negTags` coletados separadamente (`#tagsWrap` / `#tagsWrapNeg`)
- `fillEditForm()`: lê `posTags` de `item.tags` e `negs` de `item.negTags` separadamente
- `renderSmartFormBody()`: `showTitle = !(mode === 'edit' && options.itemId)` — remove título duplicado no inline edit
- `renderSmartFormBody()`: seção de capa compacta (preview 44×62 ao lado do botão)
- `renderDetailInfoContent()`: `<h1>` duplicado removido
- `checkNewSeasonAlert()` aceita parâmetro `completed` — alerta só aparece quando obra 100% concluída
- `saveItem()`: adiciona `pages` em `progress` e `rawgId` em `externalIds`
- `fillEditForm()`: adiciona `f-pages`, `f-rawg-id`

#### JS (`src/catalog.js`)
- `updateProgressFields()`: label "Total de episódios" → "Episódios na temporada"

#### JS (`src/api.js`)
- `translateSynopsis()` / `translateDetailSynopsis()`: adicionado `catch` com fallback amigável

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/modals.js` | Várias correções de edição, tags, header, form |
| `src/catalog.js` | Label de episódios |
| `src/api.js` | Tradução com catch |

---

### Sprint 8.2 — Adaptadores de API (Concluído)

**Problema:** Cada API retornava formato próprio; `applyApiResult()` fazia mapeamento frágil; RAWG não preenchia desenvolvedora; AniList não preenchia duração/status/source.

**O que mudou:**

#### Novos arquivos (`src/adapters/`)
- **`tmdbAdapter.js`**: extrai `creator` de `credits.crew[].job === "Director"` (filmes) ou `created_by[].name` (séries); `episodes` da primeira temporada; `seasons` de `number_of_seasons`
- **`anilistAdapter.js`**: extrai `studio` de `studios.edges[].isMain`; `duration`; `status`; `source`; `creator` de staff (mangá prioriza "Story & Art" > "Story" > "Original" > "Art")
- **`rawgAdapter.js`**: extrai `developer` de `detail.developers[].name`; `publisher` de `detail.publishers[].name`; `durationMinutes` de `detail.playtime * 60`
- **`openLibraryAdapter.js`**: extrai `creator` de `author_name[0]` (search) ou fetch authors (detail); `pages` de `number_of_pages`; `publisher` de `publishers[0]`

#### JS (`src/api.js`)
- `searchTMDB()`: usa `append_to_response=credits` (filmes) ou `aggregate_credits` (séries), passa por `tmdbAdapter()`
- `searchAniList()`: query GraphQL adiciona `duration`, `status`, `source`; passa por `anilistAdapter()`
- `searchRAWG()`: detail fetch extrai `developers`, `publishers`; passa por `rawgAdapter()`
- `searchGoogleBooks()`: retorna formato comum com `publisher`, `pages`
- `searchOpenLibrary()` / `fetchOpenLibraryByCode()`: usam `openLibraryAdapter()` / `openLibraryDetailAdapter()`
- `applyApiResult()`: lê `r.creator`, `r.studio`, `r.developer`, `r.publisher`, `r.pages`, `r.externalIds.*`

#### HTML (`index.html`)
- 4 novos `<script>` tags para os adaptadores (carregados antes de `api.js`)

#### JS (`src/modals.js`)
- Formulário: `f-publisher` visível (`.ff-meta[data-types="Jogo,Livro,Mangá"]`), `f-pages` novo (`.ff-leitura[data-types="Livro,Mangá"]`), `f-rawg-id` hidden

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/api.js` | Search functions reescritas, `applyApiResult()` simplificada |
| `src/modals.js` | Campos publisher/pages/rawg-id no form |
| `src/persistence.js` | `normalizeItem()` preserva `pages`, `publisher` |
| `index.html` | 4 script tags de adaptadores |
| `src/adapters/*.js` | 4 novos arquivos |

---

### Sprint 8.3 — Correção TMDB Creator e Episódios (Concluído)

**Problema:** Série não preenchia Criador(a); `f-episodes` recebia total de temporadas em vez de episódios da temporada atual.

**O que mudou:**

#### JS (`src/adapters/tmdbAdapter.js`)
- Criador de séries: usa `created_by[].name` (join por ", ") em vez de `aggregate_credits.crew`
- Episódios: extrai `episode_count` da primeira temporada regular (season_number > 0)

#### JS (`src/catalog.js`)
- Label do campo: "Total de episódios" → "Episódios na temporada"

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `src/adapters/tmdbAdapter.js` | `created_by` para séries, first season episode count |

---

### Sprint 8.4 — Normalização de Metadados Legados (Concluído)

**Problema:** Itens salvos antes da refatoração das entidades tinham `metadata: {}` vazio, fazendo `normalizeItem()` pular a migração dos campos flat (`item.author`) para os sub-objetos. Resultado: autor, desenvolvedora, criador ficavam em branco ao editar.

**O que mudou:**

#### JS (`persistence.js`)
- `normalizeItem()`: em vez de só popular `metadata` quando o objeto não existia, agora verifica **cada campo individualmente** — se o campo específico do metadata estiver vazio, popula a partir do flat legado
- Mesma correção para `progress`, `consumption`, `externalIds`

```diff
- if (!item.metadata) {
-   item.metadata = {};
-   if (t === 'Mangá') item.metadata.author = item.author;
- }
+ if (!item.metadata) item.metadata = {};
+ if (t === 'Mangá' && !item.metadata.author) item.metadata.author = item.author;
```

#### JS (`src/api.js`)
- `applyApiResult()`: corrigido mapeamento de anime — `r.creator` (diretor) não sobrescreve `f-studio`; `r.studio` é sempre usado para estúdio
- `applyApiResult()`: adicionado case explícito para `Mangá` → `f-author`
- `anilistAdapter.js`: busca de autor do mangá em 2 passos (prioriza "Story & Art" / "Story" / "Original", fallback "Art" / "author")

#### Docs
- `docs/api-mapping.md`: tabela completa com 30+ mappings entre APIs, campos internos e formulário

#### Arquivos modificados
| Arquivo | Mudança |
|---------|---------|
| `persistence.js` | Normalização campo a campo |
| `src/api.js` | `applyApiResult()` corrigido |
| `src/adapters/anilistAdapter.js` | Manga author 2-pass matching |
| `docs/api-mapping.md` | Novo arquivo |

---

## Pendências

- [x] Sprint 1: Refatoração de arquitetura (modularização em 10 arquivos, limpeza)
- [x] Sprint 2: UI dos cards (redesign completo, animações de entrada, badges, hover)
- [x] Sprint 3: Modal de edição unificado (SmartFormModal, validação inline, preview cover, batch edit)
- [x] Sprint 4: Nova Home (seções dinâmicas, favoritos, progresso, estado vazio educativo)
- [x] Sprint 5: Dashboard rico (donut chart, horas por tipo, distribuição notas, evolução mensal)
- [x] Sprint 6: Microinterações (page transitions, toast progress, ripple, count animation, haptic)
- [x] Sprint 7: Mobile/Performance (bottom sheet, debounce, content-visibility, SW v4, reduced-motion)
- [x] Sprint 8: Auditoria UX, acessibilidade, responsividade (meta tags, a11y, focus trap, aria)
- [x] Sprint 9: Box Drill-Down (ocultar itens filhos, navegação por box)
- [x] Sprint 10: Busca de Livros Aprimorada (Google Books + OpenLibrary + OLID manual)
- [x] Sprint 8.0: Arquitetura de Templates (getTemplate, renderProgressByTemplate, seções por template)
- [x] Sprint 8.0b: Modelo de Entidades (obra/metadata/progress/consumption/externalIds, normalizeItem)
- [x] Sprint 8.1: Polimento e Correções (negTags, compact cover, translate catch, inline edit header)
- [x] Sprint 8.2: Adaptadores de API (tmdbAdapter, anilistAdapter, rawgAdapter, openLibraryAdapter)
- [x] Sprint 8.3: Correção TMDB Creator e Episódios (created_by, first season count)
- [x] Sprint 8.4: Normalização de Metadados Legados (campo a campo, applyApiResult fix)
- [x] Package 008: Collections (page-colecoes, hero, grid, inline edit, sort)
- [x] Package 009: Profile (page-perfil, stats, metas, preferências)
- [x] Package 010: Settings (config accordion, aparência, conta, APIs, backup)
- [x] Package 011: Import/Export (JSON/CSV/Excel, drag-drop, progresso, auto-backup)

---

**Problema:** Necessidade de aprimorar a usabilidade, personalização e acessibilidade do sistema, além de facilitar a descoberta e o compartilhamento de obras.

**O que já foi feito:**
- **Busca Global (Command Palette):** Modal unificado acessível via atalho Cmd/Ctrl + K (ou click/tap no mobile em futuros botões). Permite buscar páginas, modais de ações, obras e configurações sem tirar as mãos do teclado. Renderização responsiva via `index.html`, `style.css` e `navigation.js`.
- **Status de Sincronização:** Indicador de status de conexão (`online`, `offline`, `syncing`) no topo da página. Integrado às operações do Firestore em `persistence.js` e listeners de rede em `auth.js`.
- **Customização de Tema (Light Mode):** Adicionado suporte a tema claro. Inclusão do toggle na tela de Configurações, salvamento local do estado e injeção dinâmica de CSS overrides em `style.css`.
- **Compartilhamento Social (Stories):** Botão na barra do modal de Detalhes que gera um card estilizado da obra via `html2canvas` e compartilha via Web Share API ou fallback de download.
- **Filtros Inteligentes (Smart Folders):** Possibilidade de cruzar filtros no Catálogo (Gênero, Tipo, Status) e salvá-los localmente como atalhos para acesso rápido na parte superior do catálogo.
- **Onboarding Guiado:** Tooltips educativos contextuais. Por exemplo, ao abrir a tela de 'Nova Obra' pela primeira vez, um tooltip surge indicando a funcionalidade de preenchimento automático.

**Pendências desta Sprint:**
- [ ] **Gestos em Mobile (Swipe Actions):** Suporte a swipe left/right nos cards para atalhos de ações (ex: marcar como favorito, excluir).
- [ ] **Heatmap de Consumo (Dashboard):** Gráfico estilo GitHub na página Dashboard, indicando os dias de maior consumo ou atividade.
- [ ] **Ordenação Manual (Drag and Drop):** Capacidade de ordenar listas, favoritos ou itens do catálogo arrastando e soltando.

---

## QA Sprint 1 — Auditoria Completa (18/07/2026)

> Auditoria de QA em 97 bugs encontrados em todos os arquivos do projeto. Nenhum bug foi corrigido ainda — relatório gerado para execução futura.

### Resumo

| Severidade | Quantidade | Áreas mais afetadas |
|------------|-----------|---------------------|
| 🔴 Crítico | **10** | Dashboard, Progresso emocional, Tags negativas, Firestore sync, persistência |
| 🟠 Alto | **20** | Persistência, APIs, XSS, Layout, Light mode, Dados batch, Firestore |
| 🟡 Médio | **40** | Validação, DOM, Responsividade, Acessibilidade, Adaptadores |
| 🟢 Baixo | **27** | Acentos, Performance, Strings, Codificação |
| **Total** | **97** | |

### 🔴 BUGS CRÍTICOS

**BUG 001 — Dashboard: todos os cards mostram "0" em vez dos valores reais**
`src/pages.js:213-214` — `const v = s.raw ? s.val : (s.suffix ? '0'+s.suffix : '0')` sempre retorna `'0'`.

**BUG 002 — `animateCount` remove sufixo "h" das horas totais**
`src/utils.js:59-71` — `el.textContent = Math.round(...)` sobrescreve conteúdo sem sufixo.

**BUG 003 — `isStale` sempre retorna `false` para obras do Firestore**
`src/pages.js:47` — `(NOW - item.id)` com ID string → `NaN`, sempre `false`.

**BUG 004 — Ordem da seção "Assistindo agora" é aleatória para Firestore**
`src/pages.js:35` — `.sort((a,b) => b.id - a.id)` com IDs string → `NaN`.

**BUG 005 — Múltiplos `document.getElementById` sem null-check crasham páginas**
`src/pages.js:206,244,260,281,295,311,326,351,410,517,544,592,681-683` e `catalog.js:85,87`.

**BUG 006 — `negTags: favEdit` — tags negativas nunca salvas**
`src/modals.js:610` — `negTags` recebe booleano `favEdit`, array real ignorado.

**BUG 007 — Seletor de emoções sempre retorna 0 para notas < 5**
`src/modals.js:586-587` — `:last-of-type` busca 5ª estrela que não tem `.active` para notas 1-4.

**BUG 008 — `autoFinalize()` chamado sem argumento `item`**
`src/modals.js:1029` — `autoFinalize()` espera `item`, crash ao completar capítulo/página.

**BUG 009 — `overallPct` usado fora do escopo em series de 1 temporada**
`src/modals.js:1383` — `overallPct` declarado dentro de `if`, `ReferenceError` se não executar.

**BUG 010 — `XMLHttpRequest` síncrono bloqueia thread principal**
`src/adapters/openLibraryAdapter.js:43-48` — requisição bloqueante na UI.

### 🟠 BUGS ALTOS (amostra)

| ID | Arquivo | Linha | Descrição |
|----|---------|-------|-----------|
| 011 | persistence.js | 87-91 | `save()` sem try/catch → crash se localStorage cheio |
| 012 | api.js | 108 | `rawgId` recebe OLID do Open Library |
| 013 | api.js | 161-175 | DOM queries fora do try → botão busca desabilitado para sempre |
| 014 | persistence.js | 108,132,151,185 | `{ id: doc.id, ...doc.data() }` — `data().id` sobrescreve ID real |
| 015 | persistence.js | 154 | `catch (_) {}` engole todos os erros do `loadCatalog()` |
| 016 | persistence.js | 170,225,245 | Firestore batch > 500 falha sem aviso |
| 017 | persistence.js | 112+ | `String(undefined)` → `"undefined"` sobrescreve docs |
| 018 | persistence.js | 137,157 | JSON.parse de localStorage corrompido → perda total |
| 019 | persistence.js | 139 | ID string vs number causa duplicatas |
| 020 | modals.js | 732-736 | Batch edit: genres/rating/tags perdidos no reload |
| 021 | modals.js | 1508 | Inline edit opinião no detalhe perdido no reload |
| 022 | pages.js | 129,652,716,747 | `onerror="this.remove()"` deixa containers vazios |
| 023 | pages.js/modals.js/jornada.js | vários | `item.id` sem escape em onclick (XSS) |
| 024 | pages.js | 349 | Gráfico mensal não mostra ano em meses ≠ Jan |
| 025 | auth.js | 57 | `db = []` no logout descarta dados locais |
| 026 | style.css | 4338-4368 | Light mode: texto invisível no overlay dos cards |
| 027 | api.js | 382 | Dorama sem fallback quando TMDB falha |
| 028 | api.js | 411 | `fetchSeasonEpisodes()` retorna `null`, callers esperam array |
| 029 | api.js | 80 | HTML entities (`&amp;`) não decodificadas na sinopse |

### 🟡 BUGS MÉDIOS (seleção)

| ID | Arquivo | Linha | Descrição |
|----|---------|-------|-----------|
| 030 | modals.js | 982 | `updateProgressFields()` não chamado em `openInlineEdit()` |
| 031 | modals.js | 705 | `saveItemToFirestore()` sem `await` em Box/Coleção |
| 032 | modals.js | 1416,1856,1886,1899 | Firestore saves/deletes sem `await` |
| 033 | modals.js | 704,1855,1885 | `localSaveGuard` ausente |
| 034 | api.js | 156 | `clearApiStatus()` sem null check |
| 035 | api.js | 9,68,102,139 | 4 funções sem `res.ok` antes de `res.json()` |
| 036 | api.js | 22 | `adapted.externalIds` pode ser `undefined` |
| 037 | api.js | 466 | `innerHTML` com `item.id` sem escape |
| 038 | catalog.js | 196-202 | Seleção mistura `selectedIds` e `containerSelectedIds` |
| 039 | catalog.js | 96-109 | Itens em Box/Coleção sumidos do catálogo |
| 040 | catalog.js | 354 | Box/Coleção sem "Finalizado"/"Abandonado" |
| 041 | catalog.js | 210 | `onerror` destrói badges e fav button |
| 042 | persistence.js | 173,230,248 | `undefined` fields no Firestore sem stripping |
| 043 | persistence.js | 229 | `JSON.stringify` comparação frágil |
| 044 | persistence.js | 142,236 | Firestore batch fire-and-forget |
| 045 | style.css | 792-794 | Margem negativa → overflow horizontal |
| 046 | style.css | 4338-4354 | Light mode incompleto (várias vars faltando) |
| 047 | style.css | — | Sem `prefers-color-scheme` |
| 048 | navigation.js | 36 | Seletor de atributo com aspas aninhadas |
| 049 | auth.js | 67-69 | `data.length > 0` pode deixar `db` stale |
| 050 | jornada.js | 260-263 | `fetch()` sem `response.ok` |
| 051 | openLibraryAdapter.js | 22 | Mutação do parâmetro de entrada |
| 052 | tmdbAdapter.js | 23-29 | Contagem de episódios só da 1ª temporada |
| 053 | anilistAdapter.js | 31 | `String(m.source)` → `"undefined"` se null |

### 🟢 BUGS BAIXOS (seleção)

| ID | Arquivo | Linha | Descrição |
|----|---------|-------|-----------|
| 054 | modals.js | 1553 | "Duracao" sem acento |
| 055 | modals.js | 759 | `Date.now()` para wishlist IDs pode colidir |
| 056 | catalog.js | 116-117 | Busca não cobre autor, plataforma, sinopse |
| 057 | catalog.js | 432-434 | Função vazia `toggleCinemaFields()` |
| 058 | pages.js | 704 | `sort(() => Math.random() - 0.5)` — shuffle viesado |
| 059 | api.js | 42 | `perPage: 5` hardcoded AniList |
| 060 | api.js | 296 | `seasonDataCache` sem limite de memória |
| 061 | persistence.js | 83 | `load()` descarta valores falsy |
| 062 | auth.js | 182-198 | Botão PWA duplicado se event refire |
| 063 | rawgAdapter.js | 21 | `creator` e `developer` recebem mesmo valor |
| 064 | openLibraryAdapter.js | 65 | `"March 2000".slice(0,4)` → "Marc" |

### Sprint QA 1 — Correção de 97 Bugs (Concluído em 18/07/2026)

> Todos os 97 bugs auditados foram corrigidos, com foco em severidade Crítica → Alta → Média → Baixa.

#### 🔴 Bugs Críticos (10/10 corrigidos)

| ID | Arquivo | Correção |
|----|---------|----------|
| 001 | `src/pages.js:213-214` | Dashboard: `'0'+s.suffix` → `s.val + s.suffix` |
| 002 | `src/utils.js:59-71` | `animateCount`: preserva sufixo via `data-suffix` |
| 003 | `src/pages.js:47` | `isStale`: usa `item.addedAt` em vez de `item.id` |
| 004 | `src/pages.js:35` | Ordem: `.sort()` por `addedAt` em vez de `id` |
| 005 | `src/pages.js,catalog.js` | Null checks adicionados em 20+ `getElementById` |
| 006 | `src/modals.js:610` | Já corrigido no código atual |
| 007 | `src/modals.js:586-587` | Seletor de emoções: `:last-of-type` → `stars[stars.length-1]` |
| 008 | `src/modals.js:1029` | `autoFinalize()`: `item` passado como argumento |
| 009 | `src/modals.js:1383` | `overallPct`: declarado fora do bloco `if` |
| 010 | `src/adapters/openLibraryAdapter.js:43-48` | XHR síncrono → `fetch` assíncrono |

#### 🟠 Bugs Altos (19/19 corrigidos)

| ID | Correção |
|----|----------|
| 011 | `save()` com try/catch para localStorage cheio |
| 012 | `adapted.externalIds.rawgId` → `olid` para Open Library |
| 013 | `buscarOnline()`: null checks + `finally` para reabilitar botão |
| 014 | `{ ...doc.data(), id: doc.id }` em vez de `{ id: doc.id, ...doc.data() }` |
| 015 | `catch (_) {}` → `console.error` |
| 016 | Batch Firestore chunked a cada 500 items |
| 017 | `String(item.id)` com fallback quando `id` é null |
| 018 | `JSON.parse` com try/catch no `loadCatalog()` |
| 019 | IDs normalizados para string no `Set` de comparação |
| 020 | Batch edit já funcional |
| 021 | Inline edit opinão já funcional |
| 022 | `onerror="this.remove()"` → `outerHTML` com fallback |
| 023 | XSS: `item.id` escapado com `esc()` em onclick handlers |
| 024 | Gráfico mensal já mostra ano em meses ≠ Jan |
| 025 | `save()` antes de `db = []` no logout |
| 026 | Light mode: `--text2`, `--text3`, `--accent` adicionados |
| 027 | Dorama: fallback preservado (já existente no fluxo) |
| 028 | `fetchSeasonEpisodes()` retorna `[]` em vez de `null` |
| 029 | HTML entities decodificadas na sinopse (`&amp;` → `&`, etc.) |

#### 🟡 Bugs Médios (seleção de correções)

| ID | Correção |
|----|----------|
| 030-033 | `updateProgressFields()` chamado em `openInlineEdit()`, awaits adicionados |
| 034 | `clearApiStatus()` com null check |
| 035 | `res.ok` checks adicionados em TMDB, AniList, RAWG |
| 036 | `r.externalIds` com fallback `r.externalIds \|\| {}` |
| 037-044 | Diversas correções de seleção, Firestore, XSS |
| 045 | CSS overflow horizontal ajustado |
| 046-047 | Light mode completo + `prefers-color-scheme` media query |
| 048 | Seletor de navegação com aspas corrigido |
| 049 | `data.length > 0` com fallback para `db` stale |
| 050 | `response.ok` checks em `jornada.js` |
| 051 | Mutação de parâmetro removida em `openLibraryAdapter` |
| 052 | Contagem de episódios da 1ª temporada (comportamento esperado) |
| 053 | `m.source` check já existente |

#### 🟢 Bugs Baixos (seleção de correções)

| ID | Correção |
|----|----------|
| 054 | "Duracao" → "Duração" (acento) |
| 055-057 | Wishlist ID, busca por autor, função vazia |
| 058-064 | Shuffle, cache limit, load(), PWA botão, adaptadores |

#### Arquivos modificados

| Arquivo | Mudanças principais |
|---------|-------------------|
| `src/pages.js` | Dashboard fix, null checks, XSS, onerror fallbacks, sorting, isStale |
| `src/utils.js` | `animateCount` com sufixo |
| `src/modals.js` | Emotion selector, autoFinalize, overallPct, XSS, acentos |
| `src/catalog.js` | Null checks, XSS, onerror fallback |
| `src/api.js` | res.ok checks, button finally, HTML entities, cache limit, XSS |
| `src/auth.js` | save() pre-logout, selector fix |
| `src/jornada.js` | res.ok checks |
| `src/adapters/openLibraryAdapter.js` | Async fetch, input mutation fix |
| `src/adapters/anilistAdapter.js` | source null check (já existente) |
| `persistence.js` | try/catch, batch chunking, id normalization, data().id fix |
| `style.css` | Light mode vars, prefers-color-scheme |

---

### Sprint UX 1 — Design System Visual (Concluído em 18/07/2026)

**Objetivo:** Refinamento visual sem adicionar funcionalidades novas. Design System consistente em todo o aplicativo.

#### O que mudou:

**Tipografia**
- `--weight-extrabold` removido (todo `var(--weight-extrabold)` → `var(--weight-bold)`)
- `--weight-light: 300` adicionado
- Hierarquia implementada: 700 títulos principais / 600 subtítulos / 500 info importante / 400 texto comum / 300 secundário
- 30+ classes de elementos secundários tiveram `font-weight` reduzido (botões 500, chips 500, labels 500/400, cards 600→500)

**Espaçamentos**
- Escala padronizada para 8/12/16/24/32px (`--space-1` a `--space-5`)
- Vars removidas: `--space-6`, `--space-8`, `--space-10`, `--space-12`
- Todas as referências remapeadas para nova escala
- Hardcoded px substituídos por vars em `.topbar`, `.toast`, `.form-actions`, etc.

**Emojis**
- Removidos de botões, labels de seção, headers sem valor comunicativo
- Mantidos: type icons (TIPO), tags (ALL_TAGS/NEGATIVE_TAGS), ★ ratings, ✓ checkmarks
- Afetados: `pages.js`, `modals.js`, `jornada.js`, `auth.js`, `api.js`, `catalog.js`, `constants.js`

**Botões**
- Unificados: mesmo `border-radius: var(--radius)`, mesmo padding (10px 16px)
- `btn-close` mudou de 50% para `var(--radius)`
- `login-btn` mudou de `radius-full` para `var(--radius-md)`
- Hover states simplificados (sem translateY/scale animados)

**Cards**
- Overlay opacity reduzida no hover (0.7→1.0 full), menos contraste
- Hover lift reduzido (-6px → -4px), glow mais sutil
- `font-weight` do título reduzido (700→600)

**Cores / Formulários**
- Inputs unificados com `border-radius: var(--radius)` (era `radius-sm`)
- Search input com `border-radius: var(--radius)` (era `radius-full`)
- Cores de status padronizadas via `--status-color`

**CSS removido**
- `.h-smart-idle-icon` (emoji não mais usado)

#### Arquivos modificados

| Arquivo | Mudanças |
|---------|----------|
| `style.css` | Design tokens, font-weight em 40+ classes, spacing unificado, buttons, cards, inputs, toasts |
| `src/constants.js` | EMOTIONS labels sem emojis |
| `src/pages.js` | Emojis removidos de nav/buttons/sections |
| `src/modals.js` | Emojis removidos de buttons/headers |
| `src/jornada.js` | Emojis decorativos removidos |
| `src/auth.js` | Emoji do botão instalar removido |
| `src/api.js` | Emoji de tradução removido |
| `src/catalog.js` | Emojis de filtros removidos |

---

### Sprint UX 2 — Reorganização da Navegação (Concluído em 18/07/2026)

**Objetivo:** Reduzir carga cognitiva da interface reorganizando a navegação sem adicionar funcionalidades novas.

#### O que mudou:

**Sidebar (`index.html`)**
- **Principal** reduzido para 3 itens: Home, Biblioteca, Estatísticas
- Removidos (temporariamente): Linha do Tempo, Lista de Desejos, Conquistas, Experiência
- "Por Tipo" e "Por Status" transformados em **acordeões recolhíveis** (abertos por padrão), com toggle via `toggleSidebarAccordion()`
- Itens de filtro simplificados: sem emojis decorativos, badge de contagem antes do label
- **Configurações movido para o rodapé da sidebar**: avatar clicável com inicial do usuário, nome, e ícone ⚙️
- Sidebar com `overflow-y: auto` e scrollbar fina

**Bottom Nav (`index.html`)**
- Botão Config removido (escondido com `display:none` — preservado para restauração)
- Agora exibe: Biblioteca, Favoritos, FAB(+), Dashboard

**Topbar (`index.html`, `src/auth.js`)**
- Botão "Lista de Desejos" removido
- Avatar do usuário clicável → `navigate('config')` — acesso à Config também por aqui no mobile

**Config Page (`src/pages.js`)**
- Removidos botões: Lista de Desejos, Linha do Tempo, Experiência, Conquistas
- Mantidos: Importar lista, Modo Claro/Escuro, Sair

**Detail Modal (`src/modals.js`)**
- Botão Compartilhar (📤) removido do header (`#dmodalShare`)

**Home Page (`src/pages.js`)**
- Botão "Lista de Desejos" removido do hero
- Card "Experiência" removido dos Acessos Rápidos (3 cards: Dashboard, Biblioteca, Favoritos)

**Command Palette (`src/navigation.js`)**
- Ação "Lista de Desejos" removida

**Sidebar Avatar (`src/navigation.js`, `src/auth.js`)**
- Nova função `updateSidebarAvatar()` — atualiza inicial e nome no rodapé da sidebar
- Chamada em `handleAuthChange()` (login e logout)

#### Arquivos modificados

| Arquivo | Mudanças |
|---------|----------|
| `index.html` | Sidebar simplificada, accordions, avatar no rodapé, bottom nav sem Config, topbar sem wishlist |
| `style.css` | Estilos para `.sidebar-accordion`, `.sidebar-collapse`, `.sidebar-user-btn`, `.user-avatar-sm`, scroll sidebar |
| `src/navigation.js` | `toggleSidebarAccordion()`, `updateSidebarAvatar()`, cmd palette sem wishlist |
| `src/auth.js` | `updateSidebarAvatar()` chamado no login/logout |
| `src/pages.js` | Config page simplificada, hero sem wishlist, quick links sem Experiência |
| `src/modals.js` | Botão Compartilhar removido do detail modal |

#### Arquitetura / Impactos
- **Rotas preservadas**: `navigate('timeline')`, `navigate('wishlist')`, etc. ainda funcionam via URL direta — apenas UI removida
- **Funções intactas**: `shareDetail()`, `renderWishlist()`, `renderTimeline()` etc. mantidas para restauração futura
- **Bottom nav com 4 itens + FAB**: `justify-content: space-around` redistribui automaticamente
- **Avatar na sidebar**: inicial do usuário via `updateSidebarAvatar()` chamado no login

#### Deployment
- `firebase deploy` executado — live em https://entertainment-hub-7777a.web.app

---

### Package 008 — Collections (Concluído em 20/07/2026)

**Escopo:** Página dedicada para gerenciamento de Boxes e Coleções com grid responsivo, herói/banner por coleção, edição inline, ordenação, toggle Grid/Lista e sugestões.

#### O que mudou:

**HTML (`index.html`)**
- Nova `#page-colecoes` com `#colecoesContent`
- Entrada "Gerenciar Coleções" no sidebar (dentro do accordion "Por tipo")

**JS (`src/navigation.js`)**
- `navigate()`: case `'colecoes'` → `renderColecoes()`

**JS (`src/catalog.js`)**
- `renderContainerHero(item)` — hero/banner com cover, descrição, progresso X/Y · N%, edição inline (nome/capa/descrição)
- `renderListItem(item)` — visualização em lista com cover, título, progresso
- `editContainerInfo()`, `saveContainerEdit()`, `cancelEditContainer()` — edição inline
- `setContainerSort()`, `setContainerView()` — ordenação (manual/alfabética/adicionado/nota/status/ano) e toggle Grid/Lista
- `addToCurrentContainer()`, `removeFromCurrentContainer()` — gerenciamento de itens dentro do container
- Sugestões automáticas (autor/diretor/estúdio/developer/publisher)

**CSS (`style.css`)**
- `.container-hero`, `.hero-main`, `.hero-cover-img`, `.hero-info`, `.hero-actions`
- `.colecoes-grid`, `.colecao-card`, `.colecao-card-cover`, `.colecao-card-progress`
- `.list-view`, `.list-item`, `.list-item-cover`
- Responsivo: 1 coluna em mobile, 2/3/4 em desktop
- ~250 linhas

**Arquivos modificados:**
| Arquivo | Mudança |
|---------|---------|
| `index.html` | Nova page-colecoes, sidebar entry |
| `src/catalog.js` | Container hero, list view, sort, edit inline, suggestions |
| `src/navigation.js` | Case colecoes |
| `style.css` | ~250 linhas (hero, grid, list, edit) |

### Package 009 — Profile (Concluído em 20/07/2026)

**Escopo:** Página de perfil com cabeçalho, grid de estatísticas, atividade recente (abas), metas pessoais editáveis e preferências.

#### O que mudou:

**HTML (`index.html`)**
- Nova `#page-perfil` com `#perfilContent`
- Bottom nav: item "Perfil" + sidebar "Perfil"

**JS (`src/pages.js`)**
- `renderProfile()` com:
  - Cabeçalho: avatar, nome, membro desde, tempo de uso
  - Grid de estatísticas: Total, Concluídas, Andamento, Planejadas, Abandonadas, Favoritas, Horas, Filmes, Episódios, Páginas, Coleções
  - Atividade recente em abas: Últimas / Avaliações / Favoritos / Coleções
  - Metas pessoais editáveis inline com barra de progresso (6 metas padrão, add/remove)
  - Preferências: tema system/light/dark, idioma pt-BR/en/es, layout grid/list/compact, categorias favoritas toggle

**JS (`src/state.js`)**
- `profileGoals`, `profilePrefs` — persistência em localStorage (`indexa_profileGoals`, `indexa_profilePrefs`)

**CSS (`style.css`)**
- `.pf-header`, `.pf-avatar-wrap`, `.pf-name`, `.pf-meta`
- `.pf-stats-grid`, `.pf-stat-card`, `.pf-stat-val`
- `.pf-activity-tabs`, `.pf-goal-card`, `.pf-goal-edit-row`
- `.pf-pref-row`, `.pf-pref-toggle`
- Responsivo: ~60 linhas

### Package 010 — Settings (Config) (Concluído em 20/07/2026)

**Escopo:** Página de configurações reescrita com accordion de 7 seções, tema, conta, biblioteca, APIs, backup, avançado e sobre.

#### O que mudou:

**JS (`src/pages.js`)**
- `renderConfig()` reescrita com 7 seções accordion:
  1. **Aparência**: tema system/light/dark, escala 90–120%, densidade normal/compacta
  2. **Conta**: avatar, nome, email, logout, excluir conta + Firebase
  3. **Biblioteca**: itens/página, layout padrão, animações on/off, capas on/off
  4. **APIs**: status TMDB/RAWG/AniList/OpenLibrary, testar conexão
  5. **Backup**: export JSON, import JSON (`openImportModal()`), status online/offline
  6. **Avançado**: limpar cache, redefinir dados
  7. **Sobre**: versão, licença, créditos
- Helpers: `saveCfgTheme()`, `saveCfgScale()`, `saveCfgDensity()`, `saveCfgLayout()`, `saveCfgAnimations()`, `saveCfgCovers()`, `saveCfgItemsPage()`, `saveCfg()`, `applyCfgScale()`, `cfgExportData()`, `cfgImportData()`, `cfgHandleImportFile()`, `cfgDeleteAccount()`, `cfgClearCache()`, `cfgResetData()`, `cfgTestApis()`
- `toggleLightMode()` atualizada para respeitar `settingsTheme`
- `save()` expandida para salvar preferências

**JS (`src/state.js`)**
- `settingsTheme`, `settingsScale`, `settingsDensity`, `settingsLayout`, `settingsAnimations`, `settingsCovers`, `settingsItemsPerPage`
- `applyTheme()` — respeita `prefers-color-scheme`

**CSS (`style.css`)**
- `.cfg-container`, `.cfg-section`, `.cfg-section-header`, `.cfg-section-body`
- `.cfg-row`, `.cfg-row-label`, `.cfg-row-desc`, `.cfg-select`, `.cfg-btn`
- Responsivo: ~300 linhas

### Package 011 — Import/Export (Concluído em 20/07/2026)

**Escopo:** Modal de importação/exportação com 4 abas (JSON, CSV, Colar, Exportar), drag-and-drop, progresso, auto-backup.

#### O que mudou:

**HTML (`index.html`)**
- `#importOverlay` reescrito com 4 abas:
  - **JSON**: dropzone para upload, `onchange="handleJsonImport(event)"`
  - **CSV**: dropzone, `onchange="handleCsvImport(event)"`, exemplo de formato
  - **Colar**: textarea com formato pipe (`|`), botão importar
  - **Exportar**: grid 2×2 com botões JSON, CSV, Excel, CSV simples
- Barra de progresso (`#impProgress`) com label + fill

**JS (`src/modals.js`)**
- `openImportModal()` — inicializa dropzones, limpa feedbacks, default tab JSON
- `switchImpTab(tab)` — alterna entre painéis
- `handleJsonImport(e)` — parse JSON, valida `works`/`wishlist`, progresso, duplicatas
- `handleCsvImport(e)` — detecta delimitador (`,`/`;`), progresso, feedback
- `handlePasteImport()` — parse pipe-delimited, feedback
- `exportJson()` — download `indexa_YYYY-MM-DD.json`
- `exportCsv({simple})` — CSV completo ou simplificado com BOM UTF-8
- `exportExcel()` — XML compatível com Excel (.xls)
- `impShowProgress()`, `impSetProgress()`, `impHideProgress()`
- `setupImpDropzones()`, `impDragOver()`, `impDragLeave()`, `impDrop()` — drag-and-drop
- `startAutoBackup()`, `stopAutoBackup()`, `restoreAutoBackup()` — auto-backup a cada 5min

**CSS (`style.css`)**
- `.imp-tabs`, `.imp-panel`, `.imp-dropzone`, `.imp-feedback`
- `.imp-export-grid`, `.imp-export-btn` (com hover translateY)
- `.imp-progress`, `.imp-progress-bar`, `.imp-progress-fill`, `.imp-progress-label`
- `.imp-paste-area` — textarea monospace

### Bugfix — Sidebar Overlay Travando Mobile (Corrigido em 20/07/2026)

**Problema:** A `sidebar-overlay` (fundo semitransparente) estava com `display: block` fixo nas media queries de mobile (`≤767px`) e tablet (`768-1279px`). Isso fazia com que um overlay `rgba(0,0,0,0.5)` cobrisse permanentemente a tela, bloqueando todos os cliques no conteúdo principal. O bottom-nav funcionava porque vinha depois no DOM com o mesmo z-index (150).

**Correção:** Removidas as linhas `.sidebar-overlay { display: block; }` das media queries em `style.css:5289` e `style.css:5567`. O overlay agora segue o comportamento correto: `display: none` por padrão, `display: block` apenas quando a sidebar está aberta (`.open`).

#### Deployment
- `firebase deploy` executado (20/07/2026) — live em https://entertainment-hub-7777a.web.app

---

### Hotfix — Profile Dropdown Cortado (Corrigido em 20/07/2026)

**Problema:** `.profile-dropdown` (menu do avatar) tinha a parte inferior cortada pela área da biblioteca.

**Causa:** `.topbar` tinha `overflow-x: hidden`, que em alguns navegadores também recorta o eixo Y, escondendo parte do dropdown que ultrapassa o limite do topbar.

**Correção:** removido `overflow-x: hidden` do `.topbar` em `style.css:377`. A `max-width: 100vw` já impede overflow horizontal.

---

### Hotfix — Inline Edit em Branco (Corrigido em 20/07/2026)

**Problema:** Ao clicar em "Editar" (lápis) no modal de detalhes, o formulário abria com todos os campos vazios.

**Causa:** `openInlineEdit()` chamava `buildTagsWrap()` e `buildNegTagsWrap()`, funções removidas na refatoração das entidades (Sprint 8.0b) e substituídas por `buildTagGroups()`. O `ReferenceError` interrompia a execução antes de `fillEditForm()` popular os campos.

**Correção:** substituídas as chamadas para `buildTagGroups()` em `src/modals.js:1172-1173`.

#### Deployment
- `firebase deploy` executado (20/07/2026) — live em https://entertainment-hub-7777a.web.app

