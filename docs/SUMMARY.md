# Project Summary (attached to conversation)

## Objective
- Build a premium library experience (Package 003): responsive grid, empty states, skeleton loading, grouped filters, sort options, real-time search, performance, smooth scroll, consistent spacing.

## Important Details
- Cannot alter: modal da obra, sistema de edição, dashboard, Firebase, APIs, importação.
- Cards (grid, overlays, status badges, fav button) **are** in scope.
- Grid columns: Desktop 6–8 (auto-fill, minmax 170px), Tablet 4, Mobile 2.
- Skeleton loading replaces spinner as primary loading indicator.
- Empty states: library empty, no search results, filter empty, box empty, no favorites — each with Material icon, title, description, optional action button.
- Sort options added: **year**, **progress**, **updated**.
- Search bar stays real-time — no submit button.
- **All decorative emojis replaced by Material Symbols** (favorite heart, cinema badge, container icon, type icon, check mark) across the entire app (catalog, pages, modals, jornada).
- TIPO icons changed from emojis to Material Symbol names in `constants.js`.
- `#userMenu`, `#userAvatar`, `#sidebar`, `#searchInput`, `#catalogoGrid` IDs preserved.
- SVG logo files in `docs/design/Logo/` served via relative path.
- Breakpoints: Desktop ≥1280, Tablet 768–1279, Mobile ≤767.

## Work State

### Completed (Package 001 – Foundation UI)
- Topbar, sidebar, bottom nav, profile dropdown, consolidated breakpoints, Inter + Material Symbols, SVG logo, chip icons, button states.

### Completed (Package 002 – Navigation)
- Breadcrumb + back button, profile menu (Perfil / Configurações / Integrações / Backup / Tema / Sobre / Sair), keyboard ESC/CTRL+K, command palette prepared, aria-label + title on all header/profile buttons, :active/:disabled/:focus-visible states globally.

### Completed (Package 003 – Library)
- `src/constants.js` – TIPO icons changed from emojis to Material Symbol names.
- `src/utils.js` – typeIcon fallback changed to 'movie'.
- `style.css` – skeleton-card with shimmer, `.skeleton-grid`, `.grid.is-loading`, `@keyframes cardEnter`, `@keyframes skeletonShimmer`; `.grid` responsive columns (Desktop auto-fill 170px, Tablet 4, Mobile 2); `.fav-icon` sizing.
- `index.html` – breadcrumb nav, skeleton grid (`#catalogoSkeleton`), restyled empty state (`#catalogoEmpty` with icon/title/desc/action), sort row with all options including year/progress/updated, sort-view button for author grouping.
- `src/catalog.js`:
  - `showSkeleton()` / `hideSkeleton()` integrated.
  - Sort options: year, progress, updated added.
  - Title uses Material Symbols for tipo filter and favorites.
  - Empty state uses Material Symbol for heart.
  - `renderCard()` fully rewritten: default icon 'movie', container child icon 'movie', type icons in `material-symbols-rounded` spans, fav icons as `favorite`/`favorite_border`, cinema badge as `movie` icon.
- `src/pages.js` – All t.icon usages updated to Material Symbol spans across home, dashboard (top5, tipoList, hoursByTypeList), timeline, experiência (continue consuming, suggest, surprise).
- `src/modals.js` – Updated by subagent (8 edits: emoji fallbacks → 'movie', t.icon spans).
- `src/jornada.js` – Updated by subagent (6 edits: emoji fallbacks, t.icon spans, category icons).

### Completed (Package 006 – Work Editor)
- **`src/constants.js`** — Tags reorganized into `TAG_GROUPS` (Positivas, Neutras, Negativas). `ALL_TAGS` and `NEGATIVE_TAGS` derived from groups.
- **`style.css`** — Editor styles added:
  - `.editor-topbar` — flex row with title, search icon, fav heart, save button, save status
  - `.editor-section` — collapsible card-style sections with header/body
  - `.tag-group-btn` / `.tag-group-popover` — click-to-open tag group lists
  - `@keyframes apiHighlight` — animated highlight for API-filled fields
  - `.search-ac-results` / `.search-ac-item` — autocomplete dropdown
  - `.editor-section-body` — 2-column grid (1fr 1fr) collapsing to 1 column on tablet/mobile
  - Responsive: `@media (max-width: 1023px)` single column, `@media (max-width: 767px)` stacked topbar
  - Modal `max-width` increased from 660px → 720px
- **`src/modals.js`** — `renderSmartFormBody()` rewritten:
  - **Top bar**: title input + search icon + fav heart + save button + auto-save status
  - **6 collapsible sections**: Informações principais, Progresso, Avaliação, Coleções, Tags, Informações adicionais
  - Tags: 3 groups with click-to-open popover (no dozens of chips visible)
  - Auto-save via `editorAutoSave()` / `doEditorSave()` with 1200ms debounce
  - Search autocomplete via `debouncedSearchAc()` + `setupSearchAc()` + `applySearchAcResult()`
  - `buildTagGroups()` replaces `buildTagsWrap()` / `buildNegTagsWrap()`
  - `buildContainerSelect()` for Box/Coleção association
  - `toggleEditorSection()` for collapsible sections
  - `handleSmartFormSubmit()` clears auto-save timer
  - `saveItem(isSilent)` supports silent auto-save; splits tags into pos/neg by `NEGATIVE_TAGS` set
  - `fillEditForm()` updated: no `addModalTitle`, reads tags from `#tagGroupWrap`, Material Symbol fav icon
  - `closeSmartFormModal()` cancels auto-save timer
- **`src/catalog.js`** — `toggleFav()` uses `#favIcon` Material Symbol; `updateProgressFields()` adds `oninput="editorAutoSave()"` to dynamic fields
- **`src/api.js`**:
  - `buscarOnline(acOnly)` supports autocomplete mode (returns results array instead of applying)
  - `applyApiResult(r, highlight)` highlights changed fields with `editor-field-highlight` class, shows undo button per field, auto-clears after 8s
  - `clearApiStatus()` clears autocomplete results
- **Fields**: Contextual per type — Filme shows director/duration/cinema; Jogo shows developer/publisher/platform; Livro/Mangá show author/publisher/volume/pages/collection; etc.
- **Validation**: inline errors only (no popups), for title/year/cover URL

### Pending / Next
- Verify auto-save flow with Firestore writes.
- Test favorite toggle in editor topbar.
- Test tag group popover interaction.
- Test autocomplete search and API fill with highlight/undo.
- Update `docs/PROJECT_MAP.md` and `docs/MASTER_BACKLOG.md`.

