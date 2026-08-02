# Contexto do Projeto

Antes de iniciar qualquer implementação considere:

- 00_Product_Pillars.md
- 01_Product_Vision.md
- 02_Brand_Guidelines.md
- 03_Design_System.md
- 08_Product_Principles.md

Esses documentos representam a visão oficial do produto e têm prioridade sobre qualquer decisão de implementação.

Para componentes consulte:
04_Component_Library.md

Para arquitetura das telas consulte:
05_Screen_Architecture.md

Para padrões de UX consulte:
06_UX_Patterns.md

Para o backlog geral consulte:
07_MASTER_BACKLOG.md

Para o mapa do projeto consulte:
PROJECT_MAP.md

# Sessões

## Sessão — 21/07/2026

**Comando de salvar:** "Salve" → atualizar este log e commitar.

### Bugs corrigidos
1. **Capas dos cards não apareciam** — removido `opacity:0` + `onload` (src/catalog.js:400). O `content-visibility: auto` impedia o `onload` de disparar, deixando a imagem invisível.
2. **Observações não salvavam** — `saveDetailChanges()` fazia `Object.assign(item, detailUnsaved)` que só atualizava `item.opinion`, nunca `item.obra.opinion`. Adicionado sync de `obraFields` após o assign (src/modals.js:1973-1975).
3. **Estrelas/status no modal de detalhe sem re-render** — `saveDetailChanges()` e `detailStatusChange()` não chamavam `renderCatalogo()`/`renderHome()`. Adicionado.
4. **Itens do menu do avatar iam tudo pra config** — Perfil agora vai pra `navigate('perfil')`. Import removido da barra superior (já está no menu do avatar > Backup).
5. **Refresh necessário pra ver mudanças em cards** — causa raiz do #3.

### Funcionalidades novas
1. **Continue lendo (Mangá/Livro)** — campo "Link" no editor (`f-read-url`), salvo em `consumption.readUrl`. Aparece como botão "Continue lendo" nos cards (grade + lista) e como link clicável no modal de detalhe.
2. **Popover de capa em Box/Coleção** — botão `...` no card abre popover com input de URL da capa. Hover mostra capas dos itens internos em slideshow (cada 1.2s).
3. **Horas jogadas (Jogo)** — campo "Horas jogadas" no editor (seção Progresso, exibido só pra Jogo). Salvo em `progress.hoursPlayed`. Exibido no modal de detalhe.
4. **Horas consumidas em animes** — `durationMinutes` (min/ep) agora é salvo e exibido. TMDB adapter agora também extrai `episode_run_time` pra séries. Campo "Duração (min)" visível pra Anime/Série/Dorama (antes só Filme). No progresso do modal de detalhe mostra "⏱ ~Xh consumidos".

### Pendências
- Nenhuma pendência conhecida no momento.

### Commit
`c5f2301` — feat: horas consumidas em animes, link de leitura em mangás, popover de capa em box, correção de observações e outras melhorias

## Sessão — 25/07/2026

**Comando de salvar:** "Salve" → atualizar este log e commitar.

### Sprint UX.01 — Less UI, More Library

#### O que mudou:

**style.css:**
- `--sidebar-w`: 204px → 174px
- `--topbar-h`: 56px → 48px
- Cards: badges `.62rem`, fav-btn 26px, estrelas `.65rem`, gradiente mais suave, respiro título-meta
- Sidebar: header compacto, logo 34px, footer fonte menor
- Topbar: search 38px, logo 32px
- Removido CSS legado: `.filter-chips`, `.chip`, `.quick-filters`, `.qf-select`, `.sort-row`/`.sort-select`
- Empty state redesenhado (ícone em container, fadeIn)
- Smart filter bar responsiva no mobile

**index.html:**
- Smart filter bar consolidada: `[Todos ▼] [Status ▼] [Filtros ▼] [Ordenar/Agrupar ▼]`
- Dropdown "+ Criar" unificado (Nova Coleção, Novo Box)
- `qf-select` → `adv-select`

**catalog.js:**
- `clearAllFilters()`: reseta smart filter bar em vez de chips antigos
- `setTipoFilter()`/`setStatusFilter()`: parâmetro `btn` removido
- `setFavFilter()`: simplificado
- `updateActiveFilters()`: referências corrigidas para novos seletores
- `openBoxView()`: reseta selects corretamente
- `applySavedFilter()`: sem referência a chips antigos
- Empty state com 4 variações (biblioteca vazia, sem resultados, box vazia, sem favoritos)

**navigation.js:**
- `navigateFilter()`: sincroniza `fbTypeSelect`/`fbStatusSelect`

### Bugs corrigidos (pós-sprint)
1. **`clearAllFilters()` crashava** — resetava chips inexistentes
2. **`setTipoFilter()`/`setStatusFilter()` crashavam com `btn=null`** — chamadas do HTML passavam `null`
3. **`navigateFilter()` sem sincronizar selects** — filtros por sidebar não atualizavam a smart bar
4. **`openBoxView()` com referências a chips antigos**
5. **`applySavedFilter()` com referências a `#tipoFilters .chip`**

### Pendências
- Nenhuma pendência conhecida no momento.

### Commit
`feec235` — docs: session log 25/07/2026 - Sprint UX.01 Less UI More Library

## Sessão — 25/07/2026

**Comando de salvar:** "atualize o contexts" → atualizar este log (sem commit).

### Sprints concluídas

#### Sprint API.01 — Correções

| # | Arquivo | O que mudou |
|---|---|---|
| #1 | `tmdbAdapter.js` | `episodes` agora usa `number_of_episodes` (total) em vez de `seasons[0].episode_count` |
| #2/#20 | `api.js` | `r.seasons` mapeado para `f-season` |
| #6 | `anilistAdapter.js` + `api.js` | `m.chapters` → `chapters` (não `pages`); mapeado para `f-chapters-total` |
| #7/#23 | `api.js` | Anime → `f-creator` em vez de cair no `else → f-author` |
| #9/#21 | `api.js` | `anilistStatus` mapeado para sugestão de `f-status` |
| #14 | `api.js` | `adapted.externalIds.rawgId = item.olid` removido |
| #15 | `openLibraryAdapter.js` | `first_publish_date.slice(0,4)` → regex `match(/\d{4}/)` |
| — | Todos os adapters | Adicionado `chapters: ''` ao formato comum |

#### Sprint API.02 — Enriquecimento

| Fonte | Dado | Destino |
|---|---|---|
| TMDB `production_companies[].name` | join → `studio` | `metadata.studio` |
| TMDB `networks[].name` (séries) | join → `publisher` | `metadata.publisher` |
| RAWG `platforms[].platform.name` | join → `platform` | `consumption.platform` |
| RAWG `website` | `readUrl` | `consumption.readUrl` |
| RAWG `metacritic`/`rating` | normalizado 0-5 → `rating` | estrelas via `setStar()` |
| RAWG `esrb_rating.name` | `esrb` | pipeline (sem campo de formulário) |
| Google Books `industryIdentifiers` | ISBN-13 > ISBN-10 → `isbn` | `externalIds.isbn` |
| OpenLibrary ISBN | agora mapeado | (via `searchOpenLibrary`) |
| Todos adapters | `rating, esrb, platform, readUrl` | adicionados ao formato comum |
| `persistence.js` | `item.director/creator/studio/developer` | flatten para groupBy |

#### Sprint UX.02 — Context-Aware Grouping

- Menu "Agrupar por" agora é **dinâmico** — opções mudam conforme o tipo de mídia selecionado
- **Todos**: Categoria, Coleção, Status, Ano (só universais)
- **Filme**: Diretor, Estúdio, Coleção, Ano, Status
- **Série/Dorama**: Criador, Estúdio, Coleção, Ano, Status
- **Anime**: Estúdio, Diretor, Coleção, Ano, Status
- **Mangá**: ✍ Mangaká, Coleção, Ano, Status
- **Livro**: 👤 Autor, 🏢 Editora, Coleção, Ano, Status
- **Jogo**: 🎮 Desenvolvedora, 🏢 Publicadora, 🖥 Plataforma, Coleção, Ano, Status
- **Box/Coleção**: Categoria, Ano
- Agrupamentos inválidos são removidos automaticamente na troca de categoria
- `updateGroupOptions` reconstroi o `<optgroup>` via DOM, sem refresh
- `groupKeyMap` estendido com 6 novos valores (`status, year, creator, developer, publisher, platform`)
- `normalizeItem()` agora achata `director, creator, studio, developer` ao top level (necessário para groupBy)

#### Bug corrigido (pós-Sprint UX.02)
- `updateGroupOptions` dentro de `renderCatalogo()` causava perda da seleção de agrupamento: ao remover o optgroup para reconstruí-lo, o browser resetava o `select.value` para o primeiro `<option>` disponível. Removido de `renderCatalogo()` e movido para os pontos onde `tipoFilter` efetivamente muda.

### Arquivos alterados (total)
`persistence.js`, `index.html`, `src/catalog.js`, `src/navigation.js`, `src/api.js`, `src/adapters/tmdbAdapter.js`, `src/adapters/anilistAdapter.js`, `src/adapters/rawgAdapter.js`, `src/adapters/openLibraryAdapter.js`, `src/modals.js`, `docs/api-mapping.md`

### Deploy
Firebase Hosting → `https://entertainment-hub-7777a.web.app`

## Sessão — 26/07/2026

**Comando de salvar:** "Salve" → atualizar este log e commitar.

### Sprint API/UX.01 — Smart Search

#### O que mudou:

**src/api.js** — Todos os adaptadores retornam arrays de até 5 resultados:
- `searchTMDB()`: `results[0]` → `results.slice(0, 5)`. Detail fetch removido (otimização).
- `searchAniList()`: Query GraphQL migrada de `Media` (1 resultado) para `Page(perPage: 5).media`.
- `searchGoogleBooks()`: `maxResults=1` → `maxResults=5`, retorna array.
- `searchOpenLibrary()`: `limit=1` → `limit=5`, retorna array.
- `searchRAWG()`: `page_size=1` → `page_size=5`, retorna array.
- `buscarOnline()`: refatorada — sempre retorna array, sem parâmetro `acOnly`, sem auto-apply. Zero chamadas duplicadas.
- Cada resultado inclui `_source` (ex: `"TMDB"`, `"Google Books"`, `"RAWG"`) e `_apiId`.

**src/modals.js** — Autocomplete real com seleção explícita:
- `renderSearchAcResults()`: lista com até 8 sugestões, cada uma com capa, título, ano, badge da fonte (`<span class="ac-source">`), selo de confiança (🟢 Correspondência exata / 🟡 Título semelhante) e autor.
- `computeTrustLevel()`: compara título digitado vs resultado (exact, close, different).
- `handleSearchClick()`: lupa **nunca** busca — só importa se `_selectedResult` existe. Se não, exibe `"ℹ️ Digite o título e selecione uma obra na lista para importar"`.
- Navegação por teclado: ↑↓, Enter, Escape, **Home**, **End**.
- Nenhum item pré-selecionado (`_acHighlightIdx = -1`).

**style.css** — Novos estilos para sugestões:
- `.ac-source` (badge da API), `.ac-trust--exact/close` (selo de confiança), `.ac-extra` (autor/creator), `.ac-placeholder-cover`, `.search-ac-empty`.

### Pendências
- Nenhuma pendência conhecida no momento.

### Deploy
`firebase deploy` executado — live em `https://entertainment-hub-7777a.web.app`

## Sessão — 02/08/2026

**Comando de salvar:** "Atualize tudo e deixe certinho" → atualizar este log, corrigir e commitar.

### Sprint API.04 — Adapter Registry (browser) — Proxy em Cloud Functions descartado

Trabalho extenso que estava **não commitado e não anotado** em sessões anteriores (arquivos em working tree desde antes do `4cc60bf`). Auditado, corrigido e documentado nesta sessão.

#### Arquitetura final (após decisão de custo)

Os adapters viraram **classes com contrato uniforme** rodando **direto no browser** (fetch direto às APIs — sem custo):
- `capabilities()` → mapa de campos suportados por tipo de mídia
- `fetch(workId, fields)` → retorna `{ campo: { value, source, confidence, fetchedAt } }`
- Formato de campo com metadados de procedência (fonte, confiança, timestamp)

| Arquivo | Descrição |
|---|---|
| `src/adapters/index.js` | `AdapterRegistry` singleton (browser) |
| `src/adapters/adapters.json` | Config do registro (nomes + pesos) |
| `src/adapters/googleBooksAdapter.js` | Novo adapter dedicado (antes o código vivia em `api.js`) |
| `src/adapters/policies/*.json` | Pipelines por tipo de mídia (anime, filme, jogo, livro, série) |

> ⚠️ **Decisão (posterior):** a camada de **Cloud Functions** (proxy `fetchFromApi` + `adminIntegrations` em `functions/`) foi **removida**. Deploy de functions exige o plano **Blaze (pay-as-you-go)**, e a decisão foi manter as chamadas diretas às APIs no browser, como antes. Juntamente com ela, removidos o Painel de Integrações (`src/integrationsPanel.js` + `page-integracoes`), o script `firebase-functions-compat`, o hook de emulador em `firebase.js` e os blocos `functions`/`emulators` do `firebase.json`. O botão "Integrações" voltou a cair em Configurações.

#### Bugs corrigidos nesta sessão (refactor estava quebrado)

1. **`functions/index.js` quebrava no load** — `require("./adapters/index")` apontava pra pasta inexistente. Camada completa criada e depois **removida** junto com a decisão de custo (ver acima).
2. **Crash no merge de metadados** — `metadata[key].confidence` acessado antes de `metadata[key]` existir. Corrigido (existia só no código das functions, removido junto).
3. **`searchTMDB/searchAniList/searchRAWG/searchOpenLibrary` quebradas** — chamavam `tmdbAdapter()`/`anilistAdapter()` como função, mas os adapters viraram classes. Usadas pela Jornada da Obra (`jornadaAddFromApi`). Reescrevidas como wrappers sobre `adapter.fetch()` (retornam objeto único no formato comum).
4. **`openLibraryDetailAdapter` removida do refactor** — quebrava o import por código OLID/ISBN. `fetchOpenLibraryByCode()` agora usa o `OpenLibraryAdapter` (que já trata OLID/ISBN e resolve nome de autor).
5. **`_adapterResultToUi()` incompleta** — faltava `author`, `volumes`, `hoursPlayed`, `readUrl`, `externalIds`, `_source`, `_apiId`. Adicionados todos; `externalIds` populado a partir dos novos campos de id dos adapters (`tmdb_id`, `anilist_id`, `rawg_id`, `googlebooks_id`, `openlibrary_id`, `isbn`).
6. **Campos perdidos nos adapters** — TMDB não emitia `seasons`, `episodes`, `studio`, `publisher`, `tmdb_id`; AniList não emitia `anilist_id`; RAWG não emitia `rawg_id`/`website`; Google Books não emitia `googlebooks_id`; OpenLibrary não resolvia autor. Todos adicionados (browser).
7. **`firebase.json` sem `functions` antes** — bloco adicionado e depois **removido** com a decisão de custo (ver acima).

#### Nota de design
- `buscarOnline()` retorna **1 resultado** (melhor correspondência por adapter/policy), em vez dos 5 resultados do Smart Search. O autocomplete continua funcionando — seleção explícita mantida — mas com sugestão única. Coerente com o modelo de pipeline por adapter.

#### Arquivos alterados
`src/api.js`, `src/adapters/*` (5 adapters + index + adapters.json + policies), `index.html`, `firebase.js`, `firebase.json`, `CONTEXT.md`
**Removidos:** `src/integrationsPanel.js`, `functions/` (adapters + index.js + package.json + policies)

### Pendências
- Nenhuma pendência conhecida no momento.

### Deploy
`firebase deploy --only hosting` executado — live em `https://entertainment-hub-7777a.web.app`

## Sessão — 01/08/2026

**Comando de salvar:** "Salve" → atualizar este log e commitar.

### Correção pendente aplicada — Campo "Link" universal

Scripts de correção abandonados (`fix.js`, `fix.ps1`, `fix2.ps1`, `fix_readurl.ps1`) deixados na raiz em sessão anterior. As mudanças que eles aplicariam não estavam no código — aplicadas manualmente (os scripts tinham encoding corrompido no `data-types="Livro,Mangá"`).

**src/modals.js:**
1. **Campo "Link" (`f-read-url`) universal no editor** — antes restrito a Livro/Mangá (`ff-leitura data-types="Livro,Mangá"`), agora `<div class="form-field full">` — visível para todos os tipos (linha 205).
2. **`hasInfoTecnica()` simplificado** — agora retorna `true` se qualquer campo relevante existir (incluindo `readUrl`), sem branch por template (linha 1945).
3. **Linha "Link" dedicada em `renderInfoTecnicaContent()`** — exibe `readUrl` como link clicável antes da linha de Plataforma (linha 1951).

**Arquivos alterados:** `src/modals.js`
**Scripts removidos:** `fix.js`, `fix.ps1`, `fix2.ps1`, `fix_readurl.ps1`

### Pendências
- Commit anterior (`4cc60bf`) ainda não pusheado para `origin/main`.

## Sessão — 26/07/2026

**Comando de salvar:** "Salve tudo no context para continuarmos depois" → atualizar este log e commitar.

### Sprint API.03 — Semantic Creator Fields

#### Problema
O campo `creator` no Common Adapter Format era um "coringa" — cada adapter retornava o nome da pessoa relevante (diretor, criador, autor, desenvolvedor) no mesmo campo, e o `applyApiResult()` usava roteamento por tipo de mídia para decidir qual campo do formulário preencher. Isso criava acoplamento entre o mapper e os tipos de mídia, e impedia que os adapters fossem semanticamente precisos.

#### O que mudou

**Adapters — campos semânticos específicos em vez de `creator` genérico:**

| Adapter | Antes | Depois |
|---|---|---|
| `tmdbAdapter.js` | `creator` (diretor p/ filme, criador p/ série) | `director` (filme) + `creator` (série), separados |
| `anilistAdapter.js` | `creator` (sempre, como coringa) | `director` (anime) + `author` (mangá), separados |
| `rawgAdapter.js` | `creator` + `developer` (redundantes) | Só `developer` (removido `creator`) |
| `openLibraryAdapter.js` | `creator` → autor | `author` diretamente |
| Google Books (em `api.js`) | `creator` → autor | `author` diretamente |

**Mapper (`applyApiResult()` em `api.js`):**
- Substituído roteamento por tipo (`if type === 'Filme' set('f-director', r.creator)`) por leitura direta de campos específicos (`if r.director set('f-director', r.director)`)
- Lógica de "qual campo preencher" movida para os adapters, onde pertence semanticamente

**Consistência de shape:**
- `hoursPlayed: ''` adicionado aos adapters TMDB, AniList, OpenLibrary (faltava)

**Documentação:**
- `06_Common_Adapter_Format.md` v2.0: schema atualizado com `director`, `author`, `hoursPlayed`, `volumes`; regra do `creator` como coringa removida
- `01_API_Mapping.md` v2.1: todas as tabelas refletem campos específicos; AniList `volumes` marcado como ✅
- `PROJECT_CONTEXT.md`: linha do `applyApiResult()` atualizada

#### Arquivos alterados
`src/adapters/tmdbAdapter.js`, `src/adapters/anilistAdapter.js`, `src/adapters/rawgAdapter.js`, `src/adapters/openLibraryAdapter.js`, `src/api.js`, `PROJECT_CONTEXT.md`, `docs/architecture/06_Common_Adapter_Format.md`, `docs/architecture/01_API_Mapping.md`

### Pendências
- Nenhuma pendência conhecida no momento.

### Deploy
`firebase deploy` executado — live em `https://entertainment-hub-7777a.web.app`