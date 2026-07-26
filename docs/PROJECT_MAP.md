# PROJECT MAP — Indexa

> **Versão atual**: Package 011 — Import/Export (Jul 2026)
> Status da implementação no final deste documento.

---

## 1. Visão Geral da Arquitetura

O Indexa é uma **SPA (Single Page Application)** construída com **JavaScript Vanilla**, sem frameworks ou bundlers. O projeto é front-end puro, servido staticamente via **Firebase Hosting**, com persistência local via **localStorage** e sincronização opcional com **Firebase Firestore**.

O HTML está em um único `index.html` (~680 linhas), todo o CSS em um único `style.css` (~6800 linhas), e a lógica principal foi modularizada em `src/` com ~12 módulos (navegação, estado, páginas, catálogo, autenticação, constantes, utilitários). Módulos de API (adapters) ficam em `src/adapters/`.

O projeto consome **5 APIs externas** (TMDB, AniList, RAWG, Google Books, OpenLibrary) através de adapters isolados na pasta `src/adapters/`. As consultas são feitas diretamente do cliente (browser) com chaves de API expostas.

A camada de apresentação utiliza **CSS custom properties** para theming dinâmico (dark/light), **CSS modules** simulados via nomeclatura BEM-like, e animações performáticas com `@keyframes`.

Não há roteador — a navegação entre "páginas" (Biblioteca, Dashboard, Configurações, Wishlist, Coleções) é gerenciada manualmente via manipulação de DOM (`display: none/block` em seções).

---

## 2. Estrutura de Pastas

```
/
├── index.html                  # Entry point único da SPA
├── style.css                   # Todos os estilos (~5200 linhas)
├── firebase.js                 # Inicialização e config do Firebase
├── persistence.js              # Persistência localStorage + Firestore
├── sw.js                       # Service Worker (PWA)
├── modals.js                   # Lógica de modais de detalhes
├── firebase.json               # Configuração do Firebase Hosting
├── firestore.rules             # Regras de segurança do Firestore
├── .firebaserc                 # Projeto Firebase padrão
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD: deploy no Firebase ao push na main
├── docs/
│   ├── 00_Product_Pillars.md
│   ├── 01_Product_Vision.md
│   ├── 02_Brand_Guidelines.md
│   ├── 03_Design_System.md
│   ├── 04_Component_Library.md
│   ├── 05_Screen_Architecture.md
│   ├── 06_UX_Patterns.md
│   ├── 08_Product_Principles.md
│   ├── PROJECT_MAP.md          # Architecture map (este documento)
│   └── design/
│       └── indexa-brandbook.html  # Brandbook visual interativo
├── src/
│   ├── auth.js                 # Autenticação (Google Sign-In)
│   ├── state.js                # Estado global e reactive state
│   ├── navigation.js           # Roteamento SPA, sidebar, profile menu
│   ├── pages.js                # Páginas (Dashboard, Config, etc.)
│   ├── catalog.js              # CRUD e renderização da Biblioteca
│   ├── api.js                  # Orquestrador de busca em APIs externas
│   ├── modals.js               # Overlay e lógica de modais
│   ├── constants.js            # Constantes, mapeamentos, achievements
│   ├── utils.js                # Funções utilitárias (debounce, UUID, etc.)
│   ├── jornada.js              # Onboarding e conquistas
│   └── adapters/
│       ├── tmdbAdapter.js      # TMDB (filmes/séries)
│       ├── anilistAdapter.js   # AniList (anime/mangá)
│       ├── rawgAdapter.js      # RAWG (jogos)
│       ├── googlebooksAdapter.js # Google Books (livros) — removido
│       └── openLibraryAdapter.js # OpenLibrary (livros)
├── assets/
│   └── icons/                  # Ícones SVG
├── CONTEXT.md
└── AGENTS.md                   # Instruções para agentes de IA
```

### Responsabilidades:

| Pasta/Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura DOM inicial, modais, seções, PWA registration |
| `style.css` | Design system (variáveis), temas (dark/light), animações, responsividade, componentes visuais (~6800 linhas) |
| `firebase.js` | Inicialização do Firebase e Firestore |
| `persistence.js` | Salvamento localStorage + sincronização Firestore |
| `src/auth.js` | Autenticação Google e controle de sessão |
| `src/state.js` | Estado global (db, wishdb, filtros) |
| `src/navigation.js` | Navegação entre páginas, toggle sidebar, profile dropdown |
| `src/pages.js` | Renderização de Dashboard, Config, Wishlist, Home, Profile, Collections, Experiência |
| `src/catalog.js` | CRUD, filtros, renderização da grade da Biblioteca, container hero/view |
| `src/api.js` | Orquestrador de busca em APIs externas |
| `src/modals.js` | Overlay, abertura/fechamento de modais (detail, search, import/export) |
| `src/constants.js` | Constantes, mapeamento tipos/cores/ícones, achievements |
| `src/utils.js` | Utilitários (debounce, UUID, formatação) |
| `src/jornada.js` | Onboarding e achievements |
| `src/adapters/` | Isolamento de chamadas a APIs externas |
| `docs/` | Documentação de produto, design system, visão |
| `.github/workflows/` | Pipeline CI/CD |

---

## 3. Fluxo da Aplicação

### 3.1. Carregamento Inicial

1. `index.html` é carregado — contém toda a estrutura estática (sidebars, seções, modais).
2. `style.css` é aplicado — temas, variáveis, animações.
3. `app.js` é executado:
   - Carrega dados do `localStorage` (`catalogoDB`, `wishlistDB`).
   - Configura Firebase (se credenciais disponíveis) e escuta mudanças em tempo real.
   - Renderiza a seção ativa (default: Biblioteca).
   - Dispara onboarding se primeira visita.
   - Registra service worker para PWA.

### 3.2. Interação do Usuário

- **Navegação**: Cliques na sidebar ou bottom nav alternam a seção visível via `page-*` containers.
- **Pesquisa**: Input na biblioteca filtra cards pelo título.
- **Filtros**: Chips de tipo, status e outros filtros atualizam a lista em tempo real.
- **Adicionar obra**: Botão FAB → formulário → pesquisa em API → seleção → salvamento.
- **Editar**: Clique no card → modal de detalhes → edição → salvamento.
- **Excluir**: Modo seleção múltipla ou individual com confirmação.
- **Dashboard**: Seção com cards de estatísticas, gráfico mensal, gêneros favoritos, conquistas e timeline.
- **Wishlist**: Lista separada com gerenciamento próprio.
- **Coleções**: Modo de agrupamento por Box ou Coleção.

---

## 4. Fluxo dos Dados

### 4.1. Pesquisa de uma obra

1. Usuário digita título no campo de busca.
2. Seleciona o tipo de mídia (filme, anime, jogo, livro).
3. `app.js` dispara `searchMedia(termo, tipo)`.
4. A função roteia para o adapter correto com base no tipo.
5. O adapter monta a URL, faz `fetch`, trata erros e normaliza os dados para um schema padrão.
6. Resultados são exibidos em uma lista no modal de busca.

### 4.2. Recebimento de dados das APIs

Cada adapter implementa um `search(termo)` e `getDetails(id)`, retornando um objeto normalizado:

```js
{
  id, title, type, year, poster, rating, genres, synopsis, author,
  totalEpisodes, totalChapters, totalPages, publisher, status,
  color, source
}
```

O adapter lida com:
- Mapeamento de campos específicos da API para o schema Indexa.
- Tratamento de fallback para dados ausentes.
- Conversão de formatos (e.g., minutos ISO → runtime numérico).

### 4.3. Criação

1. Usuário confirma a obra no modal de busca.
2. O objeto normalizado ganha campos locais: `id` (UUID), `status`, `score`, `progress`, `dateAdded`, `notes`, `emotions`, `favorite`.
3. A obra é inserida no array `db`.
4. `save()` é chamado: persiste no `localStorage` e agenda sincronização com Firebase.

### 4.4. Salvamento

`save()` serializa o array `db` para JSON e armazena em `localStorage` (`catalogoDB`). Se o Firebase estiver configurado e online, também atualiza o documento no Firestore.

### 4.5. Edição

1. Usuário abre o modal de detalhes de um card.
2. Altera campos (status, score, progresso, notas, emoções).
3. Confirma → `editItem(id, data)` → mescla mudanças no objeto → `save()`.

### 4.6. Carregamento

No `init()`, os dados são lidos do `localStorage`. Se o Firebase estiver configurado, um snapshot listener (`onSnapshot`) atualiza os dados em tempo real e faz merge com o cache local.

### 4.7. Sincronização (Firebase)

- **Estrutura**: Cada usuário autenticado tem um documento `/users/{uid}/catalogo/data` (array de obras) e `/users/{uid}/wishlist/data`.
- **Escuta**: `onSnapshot` no Firestore atualiza o estado local automaticamente.
- **Escrita**: `save()` envia o array completo como atualização do documento.
- **Estratégia**: **Last-write-wins**. Sem resolução de conflitos. A versão local sobrescreve a remota em cada salvamento. O listener remoto, por sua vez, sobrescreve a local quando há mudanças externas.
- **Offline**: Se offline, a escrita local persiste no `localStorage`. Ao reconectar, o snapshot do Firestore substitui os dados locais (perdendo alterações offline).

---

## 5. Componentes

Abaixo os principais componentes da aplicação:

### 5.1. `init()`
- **Responsabilidade**: Bootstrap da aplicação. Carrega dados, configura Firebase, renderiza seção inicial, registra SW.
- **Dependências**: Firebase SDK, `localStorage`, `renderSection()`, `renderDashboard()`, `startOnboarding()`.

### 5.2. `renderSection(section)`
- **Responsabilidade**: Alterna entre abas (Biblioteca, Dashboard, Wishlist, Configurações).
- **Dependências**: `currentPage`, containers DOM.

### 5.3. `renderCards(data)`
- **Responsabilidade**: Recebe um array de obras e gera o HTML dos cards para a biblioteca.
- **Dependências**: `db`, `tipoFilter`, `statusFilter`, `searchTerm`.

### 5.4. `renderDashboard()`
- **Responsabilidade**: Calcula e exibe estatísticas, gráfico mensal, gêneros favoritos, conquistas e timeline.
- **Dependências**: `db`.

### 5.5. `openDetailModal(item)`
- **Responsabilidade**: Abre o modal de detalhes com informações completas da obra.
- **Dependências**: `modals.js`, `renderStars()`, `renderStatusSelect()`.

### 5.6. `searchMedia(term, type)`
- **Responsabilidade**: Roteia a busca para o adapter correto e exibe resultados.
- **Dependências**: Adapters, `showToast()`.

### 5.7. `save()`
- **Responsabilidade**: Persiste `db` no `localStorage` e agenda sync com Firebase.
- **Dependências**: `localStorage`, `firebase()`.

### 5.8. `deleteItems()`
- **Responsabilidade**: Exclui obras selecionadas com confirmação.
- **Dependências**: `db`, `save()`, `renderCards()`.

### 5.9. `FilterManager`
- **Responsabilidade**: Gerencia estado de filtros (tipo, status) e atualiza a exibição.
- **Dependências**: `db`, `renderCards()`.

### 5.10. `BoxManager` / `ColecaoManager`
- **Responsabilidade**: Modos de agrupamento de obras (Box/Franquia, Coleção pessoal).
- **Dependências**: `db`, `containerSelectedIds`, `containerModeType`.

### 5.11. `WishlistManager`
- **Responsabilidade**: CRUD separado para a wishlist.
- **Dependências**: `wishdb`, `saveWishlist()`.

### 5.12. `AchievementManager`
- **Responsabilidade**: Avalia e desbloqueia conquistas baseadas no catálogo.
- **Dependências**: `db`.

### 5.13. `SyncManager`
- **Responsabilidade**: Gerencia escuta do Firestore, merge de dados e indicador de status.
- **Dependências**: Firebase SDK, `db`.

### 5.14. `CommandPalette`
- **Responsabilidade**: Paleta de comandos (Ctrl+K) para navegação e ações rápidas.
- **Dependências**: `renderSection()`, `openAddModal()`.

### 5.15. `OnboardingManager`
- **Responsabilidade**: Tour interativo para novos usuários.
- **Dependências**: DOM, `localStorage`.

---

## 6. APIs

### 6.1. TMDB (The Movie Database)

- **Finalidade**: Buscar filmes e séries.
- **Endpoint principal**: `GET /3/search/multi?query={termo}&language=pt-BR`
- **Dados utilizados**: `id`, `title`, `poster_path`, `release_date`, `vote_average`, `overview`, `genre_ids`, `media_type`.
- **Limitações**: Rate limit de ~50 req/s (não documentado oficialmente, mas observado). API key exposta no client. Sem endpoint de detalhes por ID padronizado (precisa de `movie/{id}` vs `tv/{id}`).
- **Problemas encontrados**:
  - Key exposta no bundle — risco de abuso.
  - Idioma pt-BR reduz cobertura de dados (muitos filmes sem sinopse em português).
  - Dados de TV (número de episódios) inconsistentes em séries em andamento.

### 6.2. AniList

- **Finalidade**: Buscar animes e mangás.
- **Endpoint principal**: `https://graphql.anilist.co` (GraphQL)
- **Dados utilizados**: `id`, `title` (romaji, native, english), `coverImage.large`, `startDate`, `averageScore`, `description`, `genres`, `episodes`/`chapters`, `status`, `studios`.
- **Limitações**: Rate limit de 90 req/min. Consultas GraphQL complexas. Requer query fixa para cada tipo de mídia.
- **Problemas encontrados**:
  - GraphQL não permite caching HTTP simples.
  - Títulos em japonês sem fallback consistente para inglês.
  - Descrição em HTML bruto (requer sanitização).
  - `averageScore` é 0-100, precisa normalizar para 0-10.

### 6.3. RAWG

- **Finalidade**: Buscar jogos.
- **Endpoint principal**: `GET /api/games?key={key}&search={termo}`
- **Dados utilizados**: `id`, `name`, `background_image`, `released`, `rating`, `description_raw`, `genres`, `platforms`, `metacritic`, `playtime`.
- **Limitações**: API key exposta. Rate limit de 20 req/s para contas gratuitas. Sem endpoint de busca paginada eficiente.
- **Problemas encontrados**:
  - Key exposta.
  - Dados de plataformas inconsistentes (alguns jogos sem plataforma listada).
  - Sem cobertura de DLCs ou expansões.
  - Campo `description_raw` ausente em jogos mais antigos.

### 6.4. Google Books

- **Finalidade**: Buscar livros.
- **Endpoint principal**: `GET /books/v1/volumes?q={termo}`
- **Dados utilizados**: `id`, `title`, `authors`, `publishedDate`, `imageLinks.thumbnail`, `averageRating`, `description`, `categories`, `pageCount`, `publisher`.
- **Limitações**: 1000 req/dia sem chave (com chave, 10000/dia). Muitos livros sem thumbnail ou descrição.
- **Problemas encontrados**:
  - Thumbnails HTTP (causam mixed content warnings).
  - Categorias inconsistentes — mesmo gênero escrito de formas diferentes.
  - Livros sem ISBN ou com ISBN inválido.

### 6.5. OpenLibrary

- **Finalidade**: Fallback alternativo para livros (quando Google Books falha).
- **Endpoint principal**: `GET /search.json?q={termo}`
- **Dados utilizados**: `key`, `title`, `author_name`, `first_publish_year`, `cover_i`, `subject`, `number_of_pages_median`, `publisher`.
- **Limitações**: Sem rate limit documentado, mas sem garantia de SLA. API pública sem autenticação.
- **Problemas encontrados**:
  - Cobertura inconsistente (livros recentes mal indexados).
  - URLs de capa frágeis (`https://covers.openlibrary.org/b/id/{cover_i}-L.jpg` — muda de ID sem aviso).
  - Dados de páginas como mediana, não valor exato.
  - Sem campo de descrição consistente.

---

## 7. Persistência

### 7.1. LocalStorage

- **Chaves**: `catalogoDB` (obras), `wishlistDB` (wishlist).
- **Formato**: JSON.stringify do array de obras.
- **Tamanho limite**: ~5-10 MB (dependendo do browser).
- **Estratégia**: Salvamento completo do array a cada mutação (`save()` substitui o valor inteiro).

### 7.2. Firebase Firestore

- **Estrutura**: `/users/{uid}/catalogo/data` e `/users/{uid}/wishlist/data`.
- **Leitura**: `onSnapshot` (escuta em tempo real) no `init()`.
- **Escrita**: `setDoc` com merge sobrescrevendo o documento completo.
- **Autenticação**: Google Sign-In via Firebase Auth.
- **Regras**: `firestore.rules` — apenas o próprio usuário pode ler/escrever seus dados.

### 7.3. Problemas da Persistência Atual

- **Write completo**: A cada alteração (mesmo de 1 campo), o array inteiro é reescrito no Firestore. Alto custo de leitura/escrita.
- **Sem merge inteligente**: Altera uma obra → reenvia todas.
- **Conflito offline**: Alterações offline são perdidas ao reconectar (o snapshot remoto substitui o local).
- **Sem versão de dados**: Mudanças concorrentes ou de múltiplas abas podem causar perda de dados.
- **Sem migração**: Não há schema version — mudanças na estrutura de dados quebram registros antigos.

---

## 8. Responsividade

A responsividade usa três breakpoints consolidados (após Package 001):

| Breakpoint | Largura | Layout |
|---|---|---|
| **Desktop** | ≥1280px | Sidebar fixa à esquerda, topbar com logo, bottom nav oculto |
| **Tablet** | 768–1279px | Sidebar oculta (toggle por hamburger), topbar sem logo, bottom nav visível |
| **Mobile** | ≤767px | Mesmo layout do tablet com paddings reduzidos, modais como bottom sheet |

Técnicas utilizadas:

- **Media queries** em `style.css` no final do arquivo (seção "CONSOLIDATED BREAKPOINTS").
- **Flexbox/Grid** para layout adaptável.
- **CSS custom properties** para spacing e tipografia (escala 8pt, tokens `--space-*`).
- **`env(safe-area-inset-*)`** para suporte a notch (iPhone X+).
- **`-webkit-overflow-scrolling: touch`** para scroll suave em iOS.

### Pontos fortes
- Layout funcional em mobile, tablet e desktop com breakpoints limpos.
- Bottom nav em mobile/tablet, sidebar em desktop.
- Modal de detalhes com layout split horizontal em desktop, empilhado em mobile.
- Sidebar colapsável com overlay em mobile.

### Pontos fracos
- Alguns componentes (filtros, dashboard) têm comportamento sub-ótimo em telas muito pequenas (<360px).
- Sem testes de responsividade automatizados.

---

## 9. Sistema de Design

O projeto segue o design system documentado em `docs/03_Design_System.md` e visualizado no brandbook (`docs/design/indexa-brandbook.html`).

### Tokens
- **Cores**: Variáveis CSS (`--accent`, `--surface`, `--text`, etc.) com 40+ tokens. Nenhum valor hardcoded de cor.
- **Tipografia**: Fonte **Inter** (400/500/600/700). `--font-body` = `'Inter', sans-serif`. `--weight-regular/medium/semibold/bold`. Bold (700) usado exclusivamente para H1. Escala `--font-xs` a `--font-3xl`. `Outfit` removido no Package 001.
- **Espaçamento**: Escala 8pt com `--space-1` (4px) a `--space-7` (64px). Apenas esses valores.

  | Token | px | rem |
  |---|---|---|
  | `--space-1` | 4 | 0.25 |
  | `--space-2` | 8 | 0.5 |
  | `--space-3` | 16 | 1 |
  | `--space-4` | 24 | 1.5 |
  | `--space-5` | 32 | 2 |
  | `--space-6` | 40 | 2.5 |
  | `--space-7` | 64 | 4 |

- **Border radius**: `--radius-sm` (6px), `--radius` (12px), `--radius-lg` (16px), `--radius-full` (9999px).
- **Sombras**: `--shadow-sm/md/lg` com valores consistentes.
- **Transições**: `--transition-fast` (0.15s), `--transition-base` (0.25s).
- **Ícones**: **Material Symbols Rounded** (carregados via Google Fonts). Substituem todos os decorativos que usavam emoji. `font-variation-settings: 'wght' 400` (ícones finos).

### Temas
- **Dark mode** (padrão): Fundo escuro (`--bg: #07090f`), superfície elevada.
- **Light mode**: Classe `.light-mode` no body sobrepõe variáveis.
- **Auto**: `prefers-color-scheme` media query no final de `style.css`.

### Padrões visuais
- Cards com overlay gradiente, cantos arredondados.
- Modais com backdrop blur.
- Filtros como chips com ícone Material + label.
- Botão FAB gradiente com sombra (`rgba(124, 109, 255, .4)`).

### Adesão
- A maioria dos componentes usa as variáveis do design system.
- Alguns componentes mais antigos têm valores hardcoded (especialmente em `modals.js`).

---

## 10. Arquitetura Atual

### Pontos Positivos

1. **Zero dependências**: Sem frameworks, bundlers ou tooling complexa. Rápido para desenvolver e debugar.
2. **Performance inicial**: Carregamento instantâneo (arquivo único, sem bundle).
3. **PWA pronto**: Service worker registrado, manifesto presente.
4. **APIs isoladas**: Adapters facilitam manutenção e substituição de fontes de dados.
5. **Design system coeso**: Tokens CSS garantem consistência visual.
6. **CI/CD automatizado**: Deploy automático no Firebase ao push na main.
7. **Documentação rica**: Docs de produto, design system e agora architecture map.

### Pontos Negativos

1. **Monólito de JavaScript**: `app.js` com ~3100 linhas — difícil manutenção, testes e reuso.
2. **CSS monolítico**: `style.css` com ~6800 linhas — difícil escopo e manutenção.
3. **Sem módulos**: Tudo no escopo global (`window`). Propenso a colisões e difícil de testar.
4. **Sem tipagem**: Zero TypeScript — refatorações arriscadas, sem autocompletar confiável.
5. **API keys expostas**: Chaves de TMDB, RAWG e Google Books visíveis no bundle.
6. **Persistência ineficiente**: Write completo no Firestore a cada alteração.
7. **Sem testes**: Nenhum teste automatizado (unitário, integração, e2e).
8. **Sem tratamento de erro robusto**: Muitos `catch` genéricos sem feedback ao usuário.
9. **Dados sensíveis no client**: Chaves de API e configuração Firebase no bundle.

---

## 11. Dívida Técnica

| Item | Impacto | Prioridade |
|---|---|---|
| API keys expostas no source | Segurança — qualquer um pode usar as chaves | Alta |
| Variáveis globais (db, wishdb, etc.) | Colisão de nomes, difícil debug | Alta |
| `style.css` monolítico (~6800 linhas) | Manutenção custosa, sem escopo | Alta |
| `app.js` monolítico (3100 linhas) | Manutenção custosa, sem isolamento | Alta |
| Sem schema version em dados | Migração impossível sem script manual | Alta |
| Write completo no Firestore | Alto custo de banda e Firestore writes | Alta |
| Perda de dados offline | UX negativa — usuário perde alterações | Alta |
| Sem tratamento de erro consistente | Bugs silenciosos, UX frustrante | Média |
| Código duplicado em adapters | Manutenção repetitiva | Média |
| Sem sanitização de HTML (AniList) | Risco de XSS em descrições | Média |
| GraphQL sem caching | Requisições repetitivas | Média |
| Modals com lógica duplicada | Inconsistências de UX | Média |
| Sem lazy loading de dados | Carregamento inicial lento com muitos dados | Média |
| Navegação sem histórico | Botão "voltar" do browser quebra a SPA | Média |
| Variáveis CSS não utilizadas | CSS inchado | Baixa |
| `firebase.json` inclui muitos arquivos | Deploy pode incluir arquivos desnecessários | Baixa |
| Sem normalização de dados de API | Campos ausentes podem quebrar UI | Baixa |

---

## 12. Melhorias Futuras

### Curto Prazo

1. **Mover API keys para backend proxy** (Cloud Function ou similar) — remove chaves do client.
2. **Modularizar `app.js`** — separar em módulos ES6 (Rederizador, Gerenciador de Estado, Firebase Service).
3. **Modularizar `style.css`** — separar em arquivos CSS por componente.
4. **Adicionar schema version** — campo `_version` nos dados para permitir migrações.
5. **Implementar merge inteligente no Firestore** — escrever apenas o documento alterado, não o array inteiro.
6. **Implementar queue de alterações offline** — armazenar mudanças locais e aplicar ao reconectar.
7. **Adicionar testes unitários** — ao menos para adapters e funções de dados.

### Médio Prazo

8. **Migrar para TypeScript** — tipagem reduz bugs e melhora DX.
9. **Adicionar bundler (Vite)** — módulos ES6, tree-shaking, HMR, code splitting.
10. **Migrar para framework reativo (React, Vue ou Svelte)** — melhor gerenciamento de estado e ciclo de vida.
11. **Implementar roteador SPA** — navegação com suporte a histórico e deep linking.
12. **Adicionar cache offline com Service Worker** — app functionando 100% offline.
13. **Implementar busca full-text local** — IndexedDB para pesquisa rápida sem depender de APIs externas.
14. **Adicionar exportação/importação de dados** — JSON, CSV.

### Longo Prazo

15. **Backend dedicado** — API própria com cache, rate limiting e transformação de dados.
16. **Versão mobile nativa** — React Native ou Flutter reusando a lógica de negócio.
17. **Multi-idioma** — i18n para português, inglês e espanhol.
18. **Modo colaborativo** — compartilhar catálogo com outros usuários.
19. **Recomendações inteligentes** — baseadas no histórico e preferências do usuário.
20. **Integração com redes sociais** — compartilhar obras, reviews e conquistas.

---

## 13. Status da Implementação

### Package 001 — Foundation UI ✅ (concluído Jul 2026)

**Escopo**: Refatoração da base visual — tipografia, espaçamento, ícones, cores, layout, header, sidebar, bottom nav, responsividade.

**Alterações em `index.html`**:
- Google Fonts: Inter (400/500/600/700) + Material Symbols Rounded (removeu Outfit)
- Topbar: logo "Indexa", search pill 48px, botão + circular gradiente, ghost Import, dropdown perfil com Material icons
- Sidebar: scroll, sidebar-header, nav items com Material icons, accordion com `expand_more`
- Bottom nav: 5 itens com Material Symbols (sem emojis)
- Chips de filtro: ícones Material (`movie`, `tv`, `smart_display`, etc.)
- Toolbar: botões com Material icons (`edit`, `delete`, `inventory_2`)

**Alterações em `style.css`**:
- `:root` — Inter, escala 8pt (`--space-1`…`--space-7`), `--text-muted`, `--topbar-h: 60px`
- Topbar, sidebar, profile dropdown, bottom-nav refatorados
- Breakpoints consolidados (Desktop ≥1280, Tablet 768–1279, Mobile ≤767)
- Removidos breakpoints antigos e dead CSS (Outfit, emojis)

**Alterações em `src/navigation.js`**:
- `toggleProfileMenu()` + click-outside listener

**Arquivos não alterados**: Firebase, persistência, cards, detail modal, dashboard, collections, search results, stats, achievements, adapters.

---

### Package 002 — Navigation ✅ (concluído Jul 2026)

**Escopo**: Sistema de navegação consistente — breadcrumb, back button, profile menu completo, sidebar collapsible, keyboard nav, acessibilidade, command palette (arquitetura).

**Alterações em `index.html`**:
- **Breadcrumb**: `<nav class="breadcrumb">` com back arrow + trail, oculto na Home
- **Profile Menu**: reordenado — Perfil, Configurações, Integrações, Backup, Tema, Sobre, Sair (removeu "APIs")
- **Command Palette**: ícone search Material, estrutura preparada (CTRL+K futuro)
- **Acessibilidade**: `aria-label` + `title` em todos botões do header, perfil, breadcrumb

**Alterações em `style.css`**:
- BREADCRUMB: `.breadcrumb`, `.breadcrumb-back`, `.breadcrumb-trail`, `.breadcrumb-item`, `.breadcrumb-sep`
- Botões: `:active` (pressed), `:disabled` (opacity + pointer-events), `:focus-visible` adicionados globalmente
- Command palette: Material Symbols nos ícones (`.cmd-icon`, `.cmd-item-icon .material-symbols-rounded`)
- Removido `.btn` duplicado (linha 3497)

**Alterações em `src/navigation.js`**:
- `updateBreadcrumb(page)` — atualiza trail breadcrumb e visibilidade do back button
- `updateBreadcrumbFilter(page, dim, val)` — breadcrumb com filtro (ex: Biblioteca > Por tipo > Filmes)
- Global keyboard: `ESC` fecha dropdown, sidebar, command palette; `CTRL+K` abre command palette
- Command palette: emojis substituídos por Material Symbols

**Arquivos não alterados**: Firebase, persistência, cards, detail modal, dashboard, collections, search results, stats, achievements, adapters, biblioteca, editor.

---

### Package 003 — Library Grid & Refinements ✅ (concluído Jul 2026)

**Escopo**: Grid responsivo, skeleton loading, empty states, novos filtros de ordenação, substituição de emojis por Material Symbols em toda a interface.

**Alterações em `src/constants.js`**:
- TIPO icons migrados de emojis para nomes de Material Symbols (`movie`, `tv`, `book`, etc.)

**Alterações em `src/utils.js`**:
- `typeIcon()` fallback alterado de `'🎞️'` para `'movie'`

**Alterações em `style.css`**:
- Skeleton grid com shimmer animation (`.skeleton-card`, `@keyframes skeletonShimmer`)
- Grid responsivo: Desktop auto-fill minmax(170px), Tablet 4 colunas, Mobile 2 colunas
- `@keyframes cardEnter` para animação de entrada dos cards
- `.fav-icon` sizing para Material Symbols no botão favorito

**Alterações em `index.html`**:
- Breadcrumb nav adicionado antes das páginas de conteúdo
- Skeleton grid (`#catalogoSkeleton`) com 12/8/4 placeholders
- Empty state reestilizado (`#catalogoEmpty` com `#emptyIcon`, `#emptyTitle`, `#emptyDesc`, `#emptyAction`)
- Sort row com novas opções: Ano, Progresso, Última atualização
- Botão sort-view para agrupamento por autor

**Alterações em `src/catalog.js`**:
- `showSkeleton()` / `hideSkeleton()` — exibe/oculta skeleton loading
- `renderCatalogo()`: integrado skeleton, novos sorts (year/progress/updated), título com Material Symbols, empty state com Material Symbols
- `renderCard()`: todos os emojis substituídos por Material Symbols (`favorite`/`favorite_border`, `movie` badge, type icons em `material-symbols-rounded`)

**Alterações em `src/pages.js`**:
- Todos os usos de `t.icon` em templates HTML substituídos por `<span class="material-symbols-rounded">`
- Home, Dashboard (top5, tipoList, hoursByTypeList), Timeline, Experiência (continue consumindo, suggest, surprise) atualizados

**Alterações em `src/modals.js` e `src/jornada.js`**:
- Substituição de todos os emojis TIPO por Material Symbols nos templates

**Arquivos não alterados**: Firebase, persistência, detail modal, dashboard principal, collections, adapters.

---

### Package 006 — Work Editor ✅ (concluído Jul 2026)

**Escopo**: Redesenho completo do editor de obras — topo com busca/favorito/save, 6 seções colapsáveis, auto-save, autocomplete, tags em grupos, campos contextuais, API highlight.

**Alterações em `src/constants.js`**:
- Tags reorganizadas em `TAG_GROUPS` (Positivas, Neutras, Negativas)
- `ALL_TAGS` e `NEGATIVE_TAGS` derivados dos grupos

**Alterações em `style.css`**:
- `.editor-topbar` — título + search icon + fav heart + save button + save status
- `.editor-section` / `.editor-section-header` / `.editor-section-body` — seções colapsáveis
- `.tag-group-btn` / `.tag-group-popover` — tags em grupos com popover
- `.search-ac-results` / `.search-ac-item` — dropdown de autocomplete
- `.editor-field-highlight` / `@keyframes apiHighlight` — highlight de campos alterados pela API
- `.api-undo-btn` — botão desfazer por campo
- `.editor-save-indicator` — "Salvando…" / "Salvo."
- Responsivo: 2 colunas desktop → 1 coluna tablet/mobile
- Modal max-width: 660px → 720px

**Alterações em `src/modals.js`**:
- `renderSmartFormBody()` reescrito:
  - **Top bar**: input título + lupa + ♡ favorito + Salvar + status auto-save
  - **6 seções colapsáveis**: Informações principais, Progresso, Avaliação, Coleções, Tags, Informações adicionais
  - Campos contextuais por tipo (Filme: diretor/duração/cinema; Jogo: dev/pub/platform; etc.)
  - Gêneros movido para Informações principais
  - Progresso dinâmico via `updateProgressFields()`
- `buildTagGroups()` — substitui `buildTagsWrap()` / `buildNegTagsWrap()`; 3 grupos com popover
- `toggleEditorSection()` — colapsa/expande seções
- `editorAutoSave()` / `doEditorSave()` — auto-save com debounce 1.2s
- `setupSearchAc()` / `debouncedSearchAc()` — autocomplete na digitação
- `applySearchAcResult()` — preenche formulário a partir do autocomplete
- `buildContainerSelect()` — associação a Box/Coleção existente
- `saveItem(isSilent)` — suporta auto-save silencioso; separa tags pos/neg por NEGATIVE_TAGS set
- `handleSmartFormSubmit()` — limpa timer auto-save antes de salvar
- `fillEditForm()` — atualizado para nova estrutura (sem addModalTitle, tags via #tagGroupWrap, favIcon Material Symbol)
- `closeSmartFormModal()` — cancela auto-save timer

**Alterações em `src/catalog.js`**:
- `toggleFav()` — usa `#favIcon` Material Symbol
- `updateProgressFields()` — campos dinâmicos com `oninput="editorAutoSave()"`

**Alterações em `src/api.js`**:
- `buscarOnline(acOnly)` — suporta modo autocomplete (retorna array de resultados)
- `applyApiResult(r, highlight)` — highlight com `editor-field-highlight`, undo button por campo, auto-clear 8s
- `clearApiStatus()` — limpa resultados do autocomplete

**Arquivos não alterados**: Firebase, persistência, detail modal, dashboard, home, timeline, collections, adapters, navegação.

---

### Package 007 — Collections ✅ (concluído Jul 2026)

**Escopo**: Página dedicada para gerenciamento de coleções com hero/banner, grid responsivo, edição inline, ordenação, toggle Grid/Lista e sugestões automáticas.

### Package 008 — Profile ✅ (concluído Jul 2026)

**Escopo**: Página de perfil com cabeçalho, grid de estatísticas, atividade recente em abas, metas pessoais editáveis e preferências.

### Package 009 — Settings ✅ (concluído Jul 2026)

**Escopo**: Página de configurações reescrita com accordion de 7 seções: Aparência, Conta, Biblioteca, APIs, Backup, Avançado e Sobre.

### Package 010 — Import/Export ✅ (concluído Jul 2026)

**Escopo**: Modal de importação/exportação com 4 abas (JSON, CSV, Colar, Exportar), drag-and-drop, barra de progresso, validação de duplicatas e auto-backup a cada 5min.

### Package 011 — Bugfix: Sidebar Overlay Mobile ✅ (concluído Jul 2026)

**Escopo**: Correção de bug onde sidebar-overlay com `display: block` fixo em mobile/tablet bloqueava cliques no conteúdo principal.
