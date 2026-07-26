# Mapeamento de APIs → Metadados Internos

## Formato Comum (adapter)

Todas as APIs convertem sua resposta para este formato intermediário via adapters em `src/adapters/`.

```js
{
  title, year, creator, studio, developer, publisher,
  genres, cover, synopsis, durationMinutes, episodes, seasons,
  pages, chapters, source, anilistStatus,
  rating, esrb, platform, readUrl,
  externalIds: { tmdbId, anilistId, rawgId, isbn }
}
```

## Mapeamento por Tipo e API

| Tipo | API | Campo na API | Campo interno | Campo no formulário | Adapter |
|------|-----|-------------|---------------|-------------------|---------|
| Filme | TMDB | `credits.crew[].job = "Director"` → `name` | `creator` | `f-director` | `tmdbAdapter.js` |
| Filme | TMDB | `runtime` | `durationMinutes` | `f-duration-minutes` | `tmdbAdapter.js` |
| Filme/Série | TMDB | `production_companies[].name` (join) | `studio` | `f-studio` | `tmdbAdapter.js` |
| Série/Dorama | TMDB | `networks[].name` (join) | `publisher` | `f-publisher` | `tmdbAdapter.js` |
| Série | TMDB | `created_by[].name` (join por ", ") | `creator` | `f-creator` | `tmdbAdapter.js` |
| Série | TMDB | `number_of_episodes` (total) | `episodes` | `f-episodes` | `tmdbAdapter.js` |
| Série | TMDB | `number_of_seasons` | `seasons` | `f-season` | `tmdbAdapter.js` |
| Dorama | TMDB | `created_by[].name` | `creator` | `f-creator` | `tmdbAdapter.js` |
| Anime | AniList | `studios.edges[].isMain == true` → `node.name` | `studio` | `f-studio` | `anilistAdapter.js` |
| Anime | AniList | `staff.edges[].role ~ /director\|creator\|story/` → `node.name.full` | `creator` | `f-creator` | `anilistAdapter.js` |
| Anime | AniList | `episodes` | `episodes` | `f-episodes` | `anilistAdapter.js` |
| Anime | AniList | `duration` | `durationMinutes` | `f-duration-minutes` | `anilistAdapter.js` |
| Anime | AniList | `status` | `anilistStatus` | → `f-status` (sugestão) | `anilistAdapter.js` |
| Anime | AniList | `source` | `source` | — | `anilistAdapter.js` |
| Mangá | AniList | `staff.edges[].role ~ /Story & Art\|Story\|Original/` (prioridade) | `creator` | `f-author` | `anilistAdapter.js` |
| Mangá | AniList | fallback: `staff.edges[].role ~ /Art\|author/` | `creator` | `f-author` | `anilistAdapter.js` |
| Mangá | AniList | `chapters` | `chapters` | `f-chapters-total` | `anilistAdapter.js` |
| Jogo | RAWG | `detail.developers[].name` (primeiro) | `creator` / `developer` | `f-developer` | `rawgAdapter.js` |
| Jogo | RAWG | `detail.publishers[].name` (primeiro) | `publisher` | `f-publisher` | `rawgAdapter.js` |
| Jogo | RAWG | `detail.playtime * 60` | `durationMinutes` | `f-duration-minutes` | `rawgAdapter.js` |
| Jogo | RAWG | `detail.description_raw` | `synopsis` | `f-synopsis` | `rawgAdapter.js` |
| Jogo | RAWG | `detail.platforms[].platform.name` (join) | `platform` | `f-platform` | `rawgAdapter.js` |
| Jogo | RAWG | `detail.website` | `readUrl` | `f-read-url` | `rawgAdapter.js` |
| Jogo | RAWG | `detail.metacritic` / `detail.rating` (→0-5) | `rating` | → estrelas | `rawgAdapter.js` |
| Jogo | RAWG | `detail.esrb_rating.name` | `esrb` | — | `rawgAdapter.js` |
| Livro | Google Books | `volumeInfo.authors[0]` | `creator` | `f-author` | `api.js` (inline) |
| Livro | Google Books | `volumeInfo.publisher` | `publisher` | `f-publisher` | `api.js` (inline) |
| Livro | Google Books | `volumeInfo.pageCount` | `pages` | `f-pages` | `api.js` (inline) |
| Livro | Google Books | `volumeInfo.categories` | `genres` | `f-genres` | `api.js` (inline) |
| Livro | Google Books | `industryIdentifiers[].identifier` (ISBN-13 > ISBN-10) | `externalIds.isbn` | (hidden) | `api.js` (inline) |
| Livro | Open Library (search) | `author_name[0]` | `creator` | `f-author` | `openLibraryAdapter.js` |
| Livro | Open Library (search) | `first_publish_year` | `year` | `f-year` | `openLibraryAdapter.js` |
| Livro | Open Library (detail) | `authors[].key` → fetch → `name` | `creator` | `f-author` | `openLibraryAdapter.js` |
| Livro | Open Library (detail) | `number_of_pages` | `pages` | `f-pages` | `openLibraryAdapter.js` |
| Livro | Open Library (detail) | `publishers[0]` | `publisher` | `f-publisher` | `openLibraryAdapter.js` |
| Livro | Open Library (detail) | `isbn_13[0]` / `isbn_10[0]` | `externalIds.isbn` | (hidden) | `openLibraryAdapter.js` |
| Todos | TMDB / AniList / RAWG / Google Books | `id` da API | `externalIds.tmdbId/anilistId/rawgId/isbn` | (hidden) | cada adapter |

## Fluxo de Aplicação

```
API call → JSON bruto → Adapter → formato comum → applyApiResult() → campos do formulário
                                     ↑
                              usado também por
                            fillEditForm() para
                            pré-preencher edição
```

Os adaptadores estão em `src/adapters/` e são carregados antes de `api.js` (ver `index.html`).

## Normalização Legada (`persistence.js`)

Itens salvos antes da refatoração (formato plano sem sub-objetos `obra`, `metadata`, etc.) são migrados automaticamente por `normalizeItem()`:

- `item.author` → `item.metadata.director | creator | studio | author | developer` (segundo `item.type`)
- `item.publisher` → `item.metadata.publisher`
- `item.episodes` / `item.season` / etc. → `item.progress.*`
- `item.platform` / `item.durationMinutes` → `item.consumption.*`
- `item.tmdbId` / `item.anilistId` / `item.rawgId` / `item.isbn` → `item.externalIds.*`
