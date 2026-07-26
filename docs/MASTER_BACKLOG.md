# MASTER BACKLOG — Indexa

> Lista mestra de todas as melhorias, refatorações e correções do projeto.
> Organizada por prioridade (P0–P3), cada item contém descrição, arquivos envolvidos, complexidade, dependências, benefício e ordem recomendada.

---

## Como este backlog foi construído

Baseado na análise completa de:

- Todo o código-fonte (6.600+ linhas em JS, 4.600+ linhas em CSS)
- 14 documentos de produto, design e arquitetura
- Backlog existente (`docs/11_Backlog.md`)
- Roadmap (`docs/10_Product_Roadmap.md`)
- Decision Log (`docs/09_Decision_Log.md`)

Cada item foi avaliado contra os **Product Pillars**, **Product Principles** e o **Design System** do Indexa.

---

## Como priorizamos

| Prioridade | Critério |
|---|---|
| **P0 – Crítico** | Impede o funcionamento básico, expõe segurança, ou causa perda de dados |
| **P1 – Alta** | Impacto significativo na UX, performance ou manutenibilidade |
| **P2 – Média** | Melhoria importante mas não urgente, ou refatoração de médio porte |
| **P3 – Baixa** | Melhoria cosmética, funcionalidade futura, ou dívida técnica menor |

---

## P0 — Crítico

### P0.1 — Mover API keys para backend proxy

**Descrição**: As chaves de API do TMDB, RAWG e Google Books estão expostas no bundle JavaScript (`src/constants.js`). Qualquer pessoa pode extraí-las do source e usá-las indevidamente. Criar uma Cloud Function (ou similar) que atue como proxy para todas as chamadas de API, mantendo as chaves no servidor.

**Arquivos envolvidos**: `src/constants.js`, `src/api.js`, `src/jornada.js`, `src/adapters/*.js`, `index.html`, `firebase.json`

**Complexidade**: Alta

**Dependências**: Nenhuma

**Benefício para o usuário**: Segurança — chaves não podem ser roubadas ou abusadas. Previne uso não autorizado que poderia levar ao bloqueio das APIs.

**Ordem recomendada**: 1

---

### P0.2 — Implementar schema version e migração de dados

**Descrição**: Não há versão de schema nos dados salvos. Mudanças na estrutura de dados (como a refatoração para o formato `obra/metadata/progress/consumption/externalIds`) quebram registros antigos sem migração automática. Adicionar campo `_version` nos dados e implementar migração progressiva no `normalizeItem()`.

**Arquivos envolvidos**: `src/state.js`, `src/utils.js`, `src/auth.js` (`migrateIfNeeded`), `src/persistence.js`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Dados não são perdidos durante atualizações. Permite evolução segura da estrutura de dados.

**Ordem recomendada**: 2

---

### P0.3 — Implementar merge inteligente e queue offline no Firebase

**Descrição**: Atualmente o Firestore recebe write completo do array de obras a cada alteração (altíssimo custo). Além disso, alterações feitas offline são perdidas ao reconectar — o snapshot remoto simplesmente sobrescreve o estado local sem merge. Implementar escrita apenas do documento alterado, e uma queue de operações offline que seja reproduzida ao reconectar.

**Arquivos envolvidos**: `src/auth.js` (`subscribeCatalog`, `saveCatalogToFirestore`, `saveItemToFirestore`), `src/state.js`, `src/persistence.js`

**Complexidade**: Alta

**Dependências**: P0.2 (schema version é pré-requisito para operaçoes delta confiáveis)

**Benefício para o usuário**: Dados offline não são perdidos. Redução drástica de custos de Firestore writes. Sincronização confiável entre dispositivos.

**Ordem recomendada**: 3

---

### P0.4 — Sanitizar HTML de descrições de API (XSS)

**Descrição**: A AniList retorna descrições em HTML bruto (tags `<b>`, `<i>`, `<br>`). Estas descrições são inseridas no DOM sem sanitização em vários pontos (`fillEditForm`, modais de detalhes, sinopse). Implementar sanitização antes de qualquer inserção ou usar `textContent` em vez de `innerHTML`.

**Arquivos envolvidos**: `src/api.js`, `src/modals.js`, `src/jornada.js`, `src/adapters/anilistAdapter.js`

**Complexidade**: Baixa

**Dependências**: Nenhuma

**Benefício para o usuário**: Previne vulnerabilidade XSS que poderia executar scripts maliciosos no contexto do usuário.

**Ordem recomendada**: 4

---

## P1 — Alta Prioridade

### P1.1 — Modularizar `style.css` em arquivos por componente

**Descrição**: `style.css` tem 4.612 linhas monolíticas. Separar em arquivos CSS por componente (cards, modals, dashboard, sidebar, filters, toast, etc.) e importá-los via `@import` no HTML ou via build tool futura. Isso melhora drasticamente a manutenibilidade.

**Arquivos envolvidos**: `style.css`, `index.html`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Nenhum direto (refatoração interna). Para o time: manutenção muito mais fácil, menos risco de regressão visual, reuso facilitado.

**Ordem recomendada**: 5

---

### P1.2 — Remover duplicação entre `app.js` e `src/`

**Descrição**: Existem duas versões da aplicação: `app.js` (monolítico, ~3100 linhas, carregado via `<script>` no HTML) e `src/` (modularizado com `api.js`, `catalog.js`, `modals.js`, `pages.js`, `state.js`, `utils.js`, `auth.js`, `jornada.js`, `navigation.js`, `constants.js`). As funções em `src/` sobrescrevem as de `app.js` na ordem de carregamento. Isso é frágil, confuso e dificulta debug. Unificar em uma única base modular, eliminando `app.js`.

**Arquivos envolvidos**: `app.js`, `src/*.js`, `index.html` (ordem dos scripts)

**Complexidade**: Alta

**Dependências**: Nenhuma

**Benefício para o usuário**: Nenhum direto. Para o time: elimina fonte constante de bugs por duplicação de lógica.

**Ordem recomendada**: 6

---

### P1.3 — Unificar estado global em um módulo dedicado

**Descrição**: Variáveis de estado estão espalhadas: `db` e `wishdb` em `state.js`, mas `currentPage`, `tipoFilter`, `statusFilter`, `editingId`, `isDeleteMode`, `selectedIds`, `containerSelectedIds`, etc. também em `state.js`. Muitas funções modificam essas variáveis diretamente sem setters. Criar um módulo `Store` com getters/setters e notificação de mudanças, eliminando mutações diretas.

**Arquivos envolvidos**: `src/state.js`, `src/api.js`, `src/catalog.js`, `src/modals.js`, `src/pages.js`, `src/auth.js`, `src/jornada.js`

**Complexidade**: Alta

**Dependências**: P1.2 (unificação app.js/src)

**Benefício para o usuário**: Redução de bugs de estado inconsistentes (ex: filtro ativo mas catálogo não re-renderiza). Base para testes unitários.

**Ordem recomendada**: 7

---

### P1.4 — Adicionar testes automatizados

**Descrição**: Zero testes no projeto. Adicionar ao menos:
- Testes unitários para adapters (normalização de dados)
- Testes unitários para funções de utils (`displayStatus`, `statusBadgeClass`, `relativeTime`, etc.)
- Testes de integração para fluxo CRUD
Usar framework leve (Vitest) sem necessidade de bundler.

**Arquivos envolvidos**: `src/adapters/*.js`, `src/utils.js`, `src/catalog.js`, `src/state.js`

**Complexidade**: Alta

**Dependências**: P1.2, P1.3 (código precisa ser modular para ser testável)

**Benefício para o usuário**: Redução drástica de regressões. Confiança para refatorar.

**Ordem recomendada**: 8

---

### P1.5 — Implementar feedback de erro consistente

**Descrição**: Muitos `catch` são genéricos com `console.error` e nenhum feedback ao usuário (ex: `fetchJornada*`, `searchTMDB`, `searchRAWG`, `fillEditForm`). Implementar sistema de error boundary com toasts descritivos, incluindo ações de "Tentar novamente" e fallback para dados offline quando aplicável.

**Arquivos envolvidos**: `src/api.js`, `src/modals.js`, `src/jornada.js`, `src/catalog.js`, `src/pages.js`, `src/utils.js`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Usuário entende quando algo dá errado e sabe como proceder. Reduz frustração.

**Ordem recomendada**: 9

---

### P1.6 — Implementar lazy loading no carregamento inicial

**Descrição**: Ao carregar a página, todas as seções são renderizadas de uma vez. Com muitos dados (1000+ obras), o `renderCatalogo()` e `renderDashboard()` processam arrays inteiros, causando travamentos. Implementar virtual scrolling na grid da biblioteca e lazy render no dashboard.

**Arquivos envolvidos**: `src/pages.js`, `src/catalog.js`, `style.css`

**Complexidade**: Alta

**Dependências**: Nenhuma

**Benefício para o usuário**: App não trava ao abrir com catálogo grande. Scroll suave na biblioteca.

**Ordem recomendada**: 10

---

### P1.7 — Responsividade mobile-first

**Descrição**: Muitos estilos são desktop-first com overrides mobile. Algumas seções (dashboard, timeline, tela de experiência) quebram em telas <360px. Reimplementar abordagem mobile-first conforme especificado no Design System (`docs/03_Design_System.md`).

**Arquivos envolvidos**: `style.css`, `index.html`

**Complexidade**: Alta

**Dependências**: Nenhuma

**Benefício para o usuário**: Experiência consistente em qualquer dispositivo. Especialmente importante dado que mobile é o principal caso de uso.

**Ordem recomendada**: 11

---

### P1.8 — Migrar emojis para Material Symbols Rounded ✅ (concluído — Package 003)

**Descrição**: O Brand Guidelines (`docs/02_Brand_Guidelines.md`) e o Design System especificam Material Symbols Rounded como família oficial de ícones. Atualmente o app usa emojis nativos como ícones de navegação, tipo de mídia, ações, etc. Substituir gradualmente por ícones SVG da biblioteca Material Symbols.

**Arquivos envolvidos**: `index.html`, `style.css`, `src/constants.js`, `src/pages.js`, `src/catalog.js`, `src/modals.js`, `src/navigation.js`

**Complexidade**: Alta (muitos pontos de mudança)

**Dependências**: Nenhuma

**Benefício para o usuário**: Interface mais elegante, consistente e profissional. Ícones com peso visual uniforme.

**Ordem recomendada**: 12

---

### P1.9 — Adicionar suporte a navegação por histórico (History API)

**Descrição**: A navegação SPA não usa History API. O botão "voltar" do browser sai do app. Implementar roteador simples com `pushState`/`popState` que mantenha a navegação do browser funcional.

**Arquivos envolvidos**: `src/navigation.js`, `index.html`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Navegação previsível — botão "voltar" funciona como esperado. Possibilidade de compartilhar URLs de obras.

**Ordem recomendada**: 13

---

## P2 — Média Prioridade

### P2.1 — Implementar tabs dinâmicas de temporada/episódio via API

**Descrição**: O UX Patterns (`docs/06_UX_Patterns.md`) especifica que temporadas e episódios devem ser Selects populados pela API, não campos numéricos. Atualmente são inputs numéricos simples. Integrar com TMDB para séries/animes e AniList para animes.

**Arquivos envolvidos**: `src/api.js`, `src/modals.js`, `src/catalog.js`, `style.css`

**Complexidade**: Alta

**Dependências**: P0.1 (API key movida para backend — necessário para chamadas seguras)

**Benefício para o usuário**: Seleção precisa de temporada/episódio sem digitar. Dados sempre atualizados da API.

**Ordem recomendada**: 14

---

### P2.2 — Refatorar adapters para schema padronizado

**Descrição**: Cada adapter normaliza os dados de forma ligeiramente diferente. O schema padronizado documentado em `docs/api-mapping.md` não é seguido consistentemente. Por exemplo, `googlebooksAdapter.js` retorna campos inline enquanto a convenção é usar sub-objeto. Unificar todos os adapters para o schema oficial.

**Arquivos envolvidos**: `src/adapters/*.js`, `src/api.js`, `docs/api-mapping.md`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Dados mais consistentes entre diferentes tipos de mídia. Menos campos vazios ou com formato inesperado.

**Ordem recomendada**: 15

---

### P2.3 — Adicionar Home minimalista

**Descrição**: O Roadmap e a Screen Architecture definem a Home como uma tela de retomada rápida com hero, continue assistindo, adicionados recentemente e ações rápidas. A implementação atual já faz isso parcialmente, mas falta o hero refinado e a seção de adicionados recentemente.

**Arquivos envolvidos**: `src/pages.js`, `style.css`, `index.html`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Home mais útil e visualmente atraente. Retomada mais rápida da jornada.

**Ordem recomendada**: 16

---

### P2.4 — Refinar dashboard com estatísticas inteligentes

**Descrição**: O Dashboard atual tem cards básicos e gráficos. Adicionar: comparação entre períodos, obras mais rápidas de consumir, dias mais produtivos, evolução mensal de consumo por tipo.

**Arquivos envolvidos**: `src/pages.js`, `style.css`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Descoberta de padrões de consumo. Dashboard mais informativo e motivador.

**Ordem recomendada**: 17

---

### P2.5 — Adicionar busca avançada e busca instantânea

**Descrição**: A busca atual é por título/gênero. Adicionar busca por: autor, diretor, estúdio, plataforma, tags, ano, avaliação, período de adição. Implementar busca instantânea com debounce conforme o roadmap.

**Arquivos envolvidos**: `src/catalog.js`, `src/modals.js`, `style.css`, `index.html`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Encontrar qualquer obra em segundos, mesmo em catálogos grandes.

**Ordem recomendada**: 18

---

### P2.6 — Implementar modo lista e modo estante

**Descrição**: O Roadmap prevê modos alternativos de visualização: modo lista (tabela compacta), modo estante (prateleiras visuais). Atualmente só existe grid de cards.

**Arquivos envolvidos**: `src/catalog.js`, `style.css`, `index.html`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Visualização adaptável ao tamanho do catálogo e preferência pessoal.

**Ordem recomendada**: 19

---

### P2.7 — Adicionar coleções automáticas por franquia/universo/autor

**Descrição**: Atualmente o usuário cria Boxes/Coleções manualmente. Implementar coleções automáticas que detectam obras relacionadas (mesma franquia, mesmo autor, mesmo universo) e sugerem agrupamento. A lógica de detecção já existe parcialmente em `jornada.js` (`detectFranchise`).

**Arquivos envolvidos**: `src/jornada.js`, `src/catalog.js`, `src/modals.js`, `style.css`

**Complexidade**: Alta

**Dependências**: P2.2 (adapters consistentes para detectar relações)

**Benefício para o usuário**: Organização automática. Descoberta de conexões entre obras.

**Ordem recomendada**: 20

---

### P2.8 — Adicionar exportação/importação de dados

**Descrição**: Atualmente só existe importação CSV. Adicionar: exportação para JSON, exportação para CSV, importação JSON. Incluir dados da wishlist e configurações.

**Arquivos envolvidos**: `src/modals.js`, `index.html`, `style.css`

**Complexidade**: Baixa

**Dependências**: Nenhuma

**Benefício para o usuário**: Backup portável dos dados. Liberdade para migrar para outros sistemas.

**Ordem recomendada**: 21

---

### P2.9 — Implementar onboarding progressivo

**Descrição**: O onboarding atual é apenas um tooltip no campo de título. Implementar tour completo: primeiro acesso explica busca por API, segundo acesso explica filtros, terceiro acesso explica dashboard e jornada. Usar localStorage para controlar progresso.

**Arquivos envolvidos**: `src/modals.js`, `src/catalog.js`, `style.css`, `index.html`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Curva de aprendizado suave. Usuário descobre funcionalidades gradualmente.

**Ordem recomendada**: 22

---

### P2.10 — Adicionar skeleton loading em todas as telas ✅ (parcial — grid da biblioteca no Package 003)

**Descrição**: O Design System especifica skeleton para carregamentos >300ms. Atualmente não há skeletons — os dados aparecem de uma vez. Implementar skeletons para: grid da biblioteca, dashboard, timeline, modal de detalhes.

**Arquivos envolvidos**: `src/catalog.js`, `src/pages.js`, `src/modals.js`, `style.css`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Percepção de performance muito melhor. Interface não "pula" ao carregar.

**Ordem recomendada**: 23

**Nota**: Skeleton implementado no grid da biblioteca (`showSkeleton()`/`hideSkeleton()`). Restante (dashboard, timeline, modal) ainda pendente.

---

### P2.11 — Refinar modal de detalhes (split layout responsivo)

**Descrição**: O modal atual tem layout split em desktop (capa à esquerda, info à direita) e empilhado em mobile. Melhorias: reduzir rolagem (acordions na vertical), melhor distribuição de informações, botão de fechar fixo, footer com ações fixo.

**Arquivos envolvidos**: `src/modals.js`, `style.css`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Modal mais rápido de usar. Menos rolagem para encontrar informações.

**Ordem recomendada**: 24

---

### P2.12 — Implementar busca por código de barras (ISBN)

**Descrição**: O Roadmap lista leitor de código de barras como funcionalidade futura. Implementar usando a API `BarcodeDetector` do browser (Chrome/Edge) ou biblioteca leve como `quagga2` para livros (detecção de ISBN → OpenLibrary).

**Arquivos envolvidos**: `src/api.js`, `src/modals.js`, `index.html`, `src/constants.js`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Adicionar livros em segundos apenas escaneando o código de barras.

**Ordem recomendada**: 25

---

### P2.13 — Adicionar perfil público

**Descrição**: O Roadmap prevê página de perfil. Implementar perfil resumido do usuário com: nome, foto, total de obras, últimas obras adicionadas, favoritos, estatísticas básicas.

**Arquivos envolvidos**: `src/pages.js`, `style.css`, `index.html`, `src/navigation.js`

**Complexidade**: Baixa

**Dependências**: Nenhuma

**Benefício para o usuário**: Sensação de identidade e pertencimento. Pode compartilhar perfil.

**Ordem recomendada**: 26

---

### P2.14 — Adicionar atalhos de teclado

**Descrição**: Já existe Ctrl+K (command palette) e Enter em wish. Adicionar: Ctrl+N (nova obra), Ctrl+F (foco na busca), Ctrl+S (salvar modal aberto), Ctrl+D (dashboard), / (foco na busca).

**Arquivos envolvidos**: `src/auth.js`, `index.html`

**Complexidade**: Baixa

**Dependências**: Nenhuma

**Benefício para o usuário**: Usuários avançados navegam muito mais rápido. Ações frequentes em um toque.

**Ordem recomendada**: 27

---

### P2.15 — Refinar página de experiência (recomendação)

**Descrição**: A tela "Experiência" (`renderExperiencia`) tem filtro por tempo, gênero e tipo, mais sugestão aleatória. Melhorar: adicionar recomendação baseada em obras similares (mesmos gêneros, mesmo autor/estúdio/diretor), "se você gostou de X, tente Y".

**Arquivos envolvidos**: `src/pages.js`, `style.css`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Redescobre obras esquecidas e encontra recomendações relevantes.

**Ordem recomendada**: 28

---

## P3 — Baixa Prioridade

### P3.1 — Adicionar filtro por data de adição/período

**Descrição**: Poder filtrar obras adicionadas em um período específico (último mês, último ano, personalizado).

**Arquivos envolvidos**: `src/catalog.js`, `style.css`, `index.html`

**Complexidade**: Baixa

**Dependências**: Nenhuma

**Benefício para o usuário**: Encontra obras recém-adicionadas rapidamente.

**Ordem recomendada**: 29

---

### P3.2 — Adicionar arrastar e soltar para reordenar coleções

**Descrição**: Permitir reordenar itens dentro de um Box/Coleção via drag & drop.

**Arquivos envolvidos**: `src/modals.js`, `style.css`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Controle sobre a ordem dos itens na coleção.

**Ordem recomendada**: 30

---

### P3.3 — Adicionar estatísticas avançadas no dashboard

**Descrição**: Ranking de horas por plataforma, distribuição etária das obras (ano de lançamento), evolução de nota ao longo do tempo, nuvem de tags/gêneros.

**Arquivos envolvidos**: `src/pages.js`, `style.css`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Insights mais profundos sobre o próprio consumo.

**Ordem recomendada**: 31

---

### P3.4 — Implementar "surpreenda-me" no dashboard

**Descrição**: Já existe na tela de experiência e na home. Adicionar card no dashboard "Obra aleatória do seu catálogo" com possibilidade de refazer o sorteio.

**Arquivos envolvidos**: `src/pages.js`, `style.css`

**Complexidade**: Baixa

**Dependências**: Nenhuma

**Benefício para o usuário**: Redescobre obras esquecidas. Elemento de surpresa e nostalgia.

**Ordem recomendada**: 32

---

### P3.5 — Adicionar retrospectiva anual automática

**Descrição**: Ao final do ano, gerar um resumo automático: total de obras consumidas, mais por tipo, gênero favorito, obra mais bem avaliada, total de horas, dias mais produtivos.

**Arquivos envolvidos**: `src/pages.js`, `style.css`, `index.html`, `src/navigation.js`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Momento de reflexão e nostalgia sobre o ano de consumo. Fortalece o pilar "Memória".

**Ordem recomendada**: 33

---

### P3.6 — Adicionar timeline de conquistas

**Descrição**: Conquistas desbloqueadas aparecem em uma linha do tempo visual, não apenas na grade. Mostrar data, ícone, nome e uma breve descrição do contexto.

**Arquivos envolvidos**: `src/pages.js`, `style.css`

**Complexidade**: Baixa

**Dependências**: Nenhuma

**Benefício para o usuário**: Celebrar conquistas de forma visual. Reforça senso de progresso.

**Ordem recomendada**: 34

---

### P3.7 — Compartilhar obra como imagem

**Descrição**: Já existe `shareDetail()` em `modals.js` que gera imagem com html2canvas. Melhorar: adicionar template personalizável (cores, layout), permitir compartilhar diretamente no WhatsApp/Instagram/outros.

**Arquivos envolvidos**: `src/modals.js`, `style.css`

**Complexidade**: Baixa

**Dependências**: Nenhuma

**Benefício para o usuário**: Compartilhar opinião sobre obras em redes sociais de forma visual.

**Ordem recomendada**: 35

---

### P3.8 — Adicionar variáveis de tradução (i18n)

**Descrição**: Preparar o app para i18n: externalizar strings para um arquivo de locale (`locales/pt-BR.json`, `locales/en.json`). Começar com português e inglês.

**Arquivos envolvidos**: `src/*.js`, `index.html`, novos arquivos `locales/`

**Complexidade**: Alta

**Dependências**: P1.2, P1.3 (código modularizado)

**Benefício para o usuário**: Suporte a múltiplos idiomas. Alcance global.

**Ordem recomendada**: 36

---

### P3.9 — Adicionar integração com Steam/Letterboxd/MyAnimeList

**Descrição**: O Roadmap prevê integração com outras plataformas. Implementar importação de dados via API ou CSV exportado dessas plataformas.

**Arquivos envolvidos**: `src/adapters/` (novos adapters), `src/modals.js`, `src/api.js`

**Complexidade**: Alta

**Dependências**: P0.1 (backend proxy para autenticação OAuth)

**Benefício para o usuário**: Migração facilitada de outras plataformas. Catálogo completo sem retrabalho.

**Ordem recomendada**: 37

---

### P3.10 — Adicionar service worker para funcionamento offline total

**Descrição**: Já existe service worker registrado, mas o app não funciona offline (depende de Firebase CDN, Google Fonts, APIs externas). Implementar cache estratégico com sw-precache ou Workbox: app shell cached, dados sincronizados via IndexedDB.

**Arquivos envolvidos**: `sw.js` (ou novo), `index.html`, `manifest.json`

**Complexidade**: Alta

**Dependências**: P0.3 (queue offline necessária para escrita offline consistente)

**Benefício para o usuário**: App funcional mesmo sem internet. Experiência confiável em qualquer lugar.

**Ordem recomendada**: 38

---

### P3.11 — Adicionar widgets Android/iOS

**Descrição**: Para PWA, implementar widgets que mostrem na tela inicial: últimas obras adicionadas, em andamento, estatísticas rápidas, obra aleatória.

**Arquivos envolvidos**: `index.html`, `manifest.json`, `style.css`

**Complexidade**: Média

**Dependências**: Nenhuma (PWA já habilitado)

**Benefício para o usuário**: Acesso rápido às informações sem abrir o app.

**Ordem recomendada**: 39

---

### P3.12 — Limpar CSS não utilizado e consolidar variáveis

**Descrição**: Após anos de desenvolvimento incremental, o CSS deve conter seletores obsoletos e variáveis não utilizadas. Auditar e remover dead code. Consolidar variáveis duplicadas (ex: `--bg` vs `--background`).

**Arquivos envolvidos**: `style.css`

**Complexidade**: Média

**Dependências**: Nenhuma

**Benefício para o usuário**: Nenhum direto. Para o time: CSS mais leve e fácil de navegar.

**Ordem recomendada**: 40

---

### P3.13 — Adicionar E2E testing com Playwright

**Descrição**: Após testes unitários, adicionar testes E2E para os fluxos críticos: login, adicionar obra, editar, filtrar, dashboard, wishlist, coleções.

**Arquivos envolvidos**: `e2e/` (nova pasta), `.github/workflows/deploy.yml`

**Complexidade**: Alta

**Dependências**: P1.4 (testes unitários primeiro)

**Benefício para o usuário**: Qualidade garantida em cada deploy. Menos bugs em produção.

**Ordem recomendada**: 41

---

### P3.14 — Adicionar modo escuro automático (respeitar sistema)

**Descrição**: Atualmente o tema escuro é padrão e o claro é manual. Adicionar detecção de `prefers-color-scheme` com fallback.

**Arquivos envolvidos**: `style.css`, `src/state.js`

**Complexidade**: Baixa

**Dependências**: Nenhuma

**Benefício para o usuário**: Tema adaptado automaticamente à preferência do sistema.

**Ordem recomendada**: 42

---

### P3.15 — Adicionar "continuar assistindo" persistente na home

**Descrição**: A home já mostra a última obra em andamento, mas não persiste a posição exata. Salvar e exibir temporada/episódio/página atual na home.

**Arquivos envolvidos**: `src/pages.js`, `src/state.js`, `style.css`

**Complexidade**: Baixa

**Dependências**: Nenhuma

**Benefício para o usuário**: Sabe exatamente onde parou sem abrir o modal.

**Ordem recomendada**: 43

---

## Itens do backlog existente não cobertos acima

Alguns itens do `docs/11_Backlog.md` não estão listados acima porque já estão implementados ou foram priorizados de forma diferente:

| Item do backlog original | Status neste master backlog |
|---|---|
| Revisar componentes | Distribuído entre P1.2, P1.3, P2.11 |
| Melhorar carregamento de imagens | P1.6 (lazy loading) + P3.10 (service worker) |
| Melhorar cache | P3.10 (service worker) |
| Melhorar performance | P1.6 (virtual scroll) |
| Hero novo | P2.3 (home refinada) |
| Continue de onde parou | P3.15 (persistente na home) |
| Modo compacto | P2.6 (modo lista/estante) |
| Busca instantânea | P2.5 (busca com debounce) |
| Capa personalizada | Implementado (via URL ou upload) |
| IA / recomendações | P2.15 (experiência) + P3.9 (futuro) |
| Resumo anual | P3.5 |
| Timeline inteligente | Parcialmente em `pages.js` (`renderTimeline`), refinamento em P3.6 |
| Widgets | P3.11 |
| Scanner | P2.12 (código de barras) |
| OCR | Não coberto — exige backend dedicado |

---

## Ordem recomendada de execução resumida

```
 1. P0.1 — API keys → backend proxy
 2. P0.2 — Schema version + migração
 3. P0.3 — Merge offline + Firestore delta
 4. P0.4 — Sanitização HTML (XSS)
 5. P1.1 — Modularizar CSS
 6. P1.2 — Unificar app.js + src/
 7. P1.3 — Store unificado
 8. P1.4 — Testes unitários
 9. P1.5 — Error handling consistente
10. P1.6 — Lazy loading / virtual scroll
11. P1.7 — Responsividade mobile-first
12. P1.8 — Material Symbols nos ícones
13. P1.9 — History API (navegação)
14. P2.1 — Tabs temporada/episódio via API
15. P2.2 — Schema padronizado nos adapters
16. P2.3 — Home minimalista
... (demais P2 e P3 em qualquer ordem)
```

---

## Pacotes concluídos

### Package 003 — Library Grid & Refinements (Jul 2026)
- Skeleton loading no grid da biblioteca
- Grid responsivo (Desktop 6-8, Tablet 4, Mobile 2)
- Empty states com Material Symbols
- Novos sorts: Ano, Progresso, Última atualização
- Migração de todos os emojis TIPO para Material Symbols (toda a interface)
- Emoji → Material Symbols em cards, dashboard, timeline, experiência, modais, jornada

### Package 006 — Work Editor (Jul 2026)
- Editor reestruturado em 6 seções colapsáveis
- Topo com título + busca API (lupa) + favorito + Salvar + auto-save
- Auto-save com debounce e indicador "Salvando…" / "Salvo."
- Autocomplete na digitação com resultados em dropdown
- API highlight e undo por campo
- Tags em 3 grupos (Positivas/Neutras/Negativas) com popover
- Campos contextuais por tipo de mídia
- Validação inline (sem popups)
- Layout responsivo: 2 colunas desktop, 1 coluna tablet/mobile

## Notas

- Itens P0 devem ser resolvidos antes de qualquer feature nova.
- Itens de refatoração (P1.1, P1.2, P1.3, P1.4) são pré-requisitos para sustentar crescimento futuro.
- Features visíveis ao usuário (P2.x) podem ser desenvolvidas em paralelo com refatorações, desde que os P0 estejam resolvidos.
- Toda implementação deve ser verificada contra os **Product Principles** (`docs/08_Product_Principles.md`) antes de iniciar.
