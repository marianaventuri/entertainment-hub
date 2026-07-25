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