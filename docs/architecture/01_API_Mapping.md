# 01 — API Mapping

Versão: 2.1

Status: Oficial

---

# Objetivo

Documentar como cada API externa é convertida para o formato intermédio do Indexa (Common Adapter Format).

Este documento é a referência principal para todos os adapters.

---

# APIs atualmente utilizadas

• TMDB

• AniList

• RAWG

• Google Books

• OpenLibrary

---

# Fluxo Real

```
API

↓

Adapter

↓

Common Adapter Format (formato intermédio achatado)

↓

Mapper (applyApiResult)

↓

Data Model (5 blocos: obra/metadata/progress/consumption/externalIds)

↓

Persistência
```

O adapter **não** retorna o Data Model de 5 blocos. Retorna um formato achatado que posteriormente é mapeado para o Data Model pelo `applyApiResult()`.

---

# Common Adapter Format

Todo adapter retorna um objeto com esta estrutura:

```
{
    title, year, cover, synopsis, genres,

    director, creator, author, studio, developer, publisher,

    durationMinutes, episodes, seasons, pages, chapters,

    source, anilistStatus, rating, esrb, platform, readUrl,

    externalIds: { tmdbId, anilistId, rawgId, isbn }
}
```

Campos ausentes retornam string vazia `''`.

---

# TMDB

Utilizado para:

• Filmes

• Séries

• Doramas

---

| Common Field | Campo TMDB | Data Model | Status |
|---|---|---|---|
| title | title / name | obra.title | ✅ |
| cover | poster_path (via TMDB_IMG) | obra.cover | ✅ |
| year | release_date / first_air_date | obra.year | ✅ |
| synopsis | overview | obra.synopsis | ✅ |
| genres | genres[].name | obra.genres | ✅ |
| durationMinutes | runtime (filme) / episode_run_time[0] (série) | consumption.durationMinutes | ✅ |
| director | credits.crew → find(job === 'Director') | metadata.director | ✅ |
| creator | created_by[].name | metadata.creator | ✅ |
| studio | production_companies[].name | metadata.studio | ✅ |
| publisher (série) | networks[].name | metadata.publisher | ✅ |
| episodes | number_of_episodes | progress.episodes | ✅ |
| seasons | number_of_seasons | progress.season | ✅ |
| tmdbId | id | externalIds.tmdbId | ✅ |

## Observações

• `director` (filme) e `creator` (série) são retornados em campos separados no Common Adapter Format, cada um mapeando diretamente para seu campo de formulário.

• Filmes usam `runtime` (minutos). Séries/Doramas usam `episode_run_time[0]` (minutos por episódio).

• `publisher` (networks) só é preenchido para séries.

---

# AniList

Utilizado para:

• Anime

• Mangás

---

| Common Field | Campo AniList | Data Model | Status |
|---|---|---|---|
| title | title.romaji / title.english / title.native | obra.title | ✅ |
| cover | coverImage.large | obra.cover | ✅ |
| year | startDate.year | obra.year | ✅ |
| synopsis | description (HTML sanitizado) | obra.synopsis | ✅ |
| genres | genres (via translateGenres) | obra.genres | ✅ |
| durationMinutes | duration | consumption.durationMinutes | ✅ |
| episodes | episodes | progress.episodes | ✅ |
| chapters | chapters | progress.chaptersTotal | ✅ |
| volumes | volumes | progress.totalVolumes | ✅ |
| director (anime) | staff.edges → role detection (Director/Creator/Story) | metadata.director | ✅ |
| author (mangá) | staff.edges → role detection (Story & Art/Author) | metadata.author | ✅ |
| studio (anime) | studios.edges → isMain | metadata.studio | ✅ |
| source | source | — (não armazenado) | ✅ |
| anilistStatus | status | — (sugestão de f-status) | ✅ |
| anilistId | id | externalIds.anilistId | ✅ |

## Observações

• `director` (Anime) e `author` (Mangá) são campos separados no Common Adapter Format. A detecção por role: Mangá busca `Story & Art` / `Story` / `Art` / `Author`; Anime busca `Director` / `Creator` / `Story`.

• `studio` é o estúdio principal (`isMain === true`).

• `source` e `anilistStatus` são retornados pelo adapter e usados pelo `applyApiResult()` para sugerir status automaticamente, mas não persistem em campos dedicados.

---

# RAWG

Utilizado para:

• Jogos

---

| Common Field | Campo RAWG | Data Model | Status |
|---|---|---|---|
| title | name | obra.title | ✅ |
| cover | background_image | obra.cover | ✅ |
| year | released | obra.year | ✅ |
| synopsis | description_raw (com detail) | obra.synopsis | ✅ |
| genres | genres[].name | obra.genres | ✅ |
| developer | developers[].name | metadata.developer | ✅ |
| publisher | publishers[].name | metadata.publisher | ✅ |
| hoursPlayed | playtime (horas) | progress.hoursPlayed | ✅ |
| platform | platforms[].platform.name | consumption.platform | ✅ |
| readUrl | website | consumption.readUrl | ✅ |
| rating | metacritic/20 ou rating/5 | obra.rating | ✅ |
| esrb | esrb_rating.name | — (não armazenado) | ✅ |
| rawgId | id | externalIds.rawgId | ✅ |

## Observações

• `hoursPlayed` (RAWG) mapeia para `progress.hoursPlayed` no Data Model e `f-hours-played` no formulário. Diferente dos outros adapters que usam `durationMinutes`.

• Vários campos (`synopsis`, `developer`, `publisher`, `platform`, `readUrl`, `rating`, `esrb`) dependem de `detail` (requisição adicional de detalhes). A busca básica (`searchRAWG`) não inclui detail.

• `esrb` é retornado pelo adapter mas não possui campo de formulário dedicado.

• `rating` é normalizado para escala 0–5.

---

# Google Books

Utilizado para:

• Livros

---

| Common Field | Campo Google Books | Data Model | Status |
|---|---|---|---|
| title | volumeInfo.title | obra.title | ✅ |
| cover | imageLinks.thumbnail / smallThumbnail | obra.cover | ⚠ |
| year | publishedDate | obra.year | ✅ |
| author | volumeInfo.authors[0] | metadata.author | ✅ |
| publisher | volumeInfo.publisher | metadata.publisher | ✅ |
| synopsis | volumeInfo.description (HTML sanitizado) | obra.synopsis | ✅ |
| pages | volumeInfo.pageCount | progress.pages | ✅ |
| genres | volumeInfo.categories | obra.genres | ✅ |
| isbn | industryIdentifiers (ISBN_13 > ISBN_10) | externalIds.isbn | ✅ |
| googleBooksId | id | externalIds | ❌ |

## Observações

• O adapter do Google Books é inline em `api.js` (linhas 96–108), não há um arquivo separado em `src/adapters/`.

• `cover` usa thumbnail (baixa resolução), não a maior disponível — viola o padrão de capas do Adapter Standards.

• `isbn` é retornado como campo único (`externalIds.isbn`), não separado em `isbn10`/`isbn13`.

• `googleBooksId` (volume ID) não é armazenado.

• HTML da `description` é sanitizado com regex simples (remoção de tags).

---

# OpenLibrary

Utilizado para:

• Livros (complemento / fallback do Google Books)

---

## openLibraryAdapter (search — detail = null)

| Common Field | Campo OpenLibrary | Data Model | Status |
|---|---|---|---|
| title | title | obra.title | ✅ |
| cover | cover_i → covers URL | obra.cover | ✅ |
| year | first_publish_year | obra.year | ✅ |
| author | author_name[0] | metadata.author | ✅ |
| synopsis | first_sentence | obra.synopsis | ⚠ |
| genres | subject[0..3] | obra.genres | ✅ |

## openLibraryDetailAdapter (detail — OLID/ISBN lookup)

| Common Field | Campo OpenLibrary (detail) | Data Model | Status |
|---|---|---|---|
| title | title | obra.title | ✅ |
| cover | covers[0] → covers URL | obra.cover | ✅ |
| year | first_publish_date / publish_date | obra.year | ✅ |
| author | authors[0] → fetch author name | metadata.author | ✅ |
| publisher | publishers[0] | metadata.publisher | ✅ |
| synopsis | description (objeto ou string) | obra.synopsis | ✅ |
| pages | number_of_pages | progress.pages | ✅ |
| genres | subjects[0..3] | obra.genres | ✅ |
| isbn | isbn_13[0] / isbn_10[0] | externalIds.isbn | ✅ |
| openLibraryId | key / olid | externalIds | ❌ |

## Observações

• A OpenLibrary é consultada como fallback quando Google Books não retorna resultados.

• `searchOpenLibrary()` usa `openLibraryAdapter` (sem detail) — sinopse limitada a `first_sentence`, sem publisher, pages ou ISBN.

• `fetchOpenLibraryByCode()` usa `openLibraryDetailAdapter` (com detail) — dados completos but apenas via OLID/ISBN.

• `openLibraryId` (key/olid) não é armazenado em `externalIds`.

---

# Legenda

✅ Implementado

⚠ Implementado parcialmente (com limitações)

❌ Não implementado

---

# Regras

Todos os adapters devem:

• retornar o Common Adapter Format;

• nunca acessar diretamente o formulário;

• nunca salvar dados no Firestore;

• nunca modificar a interface.

A única responsabilidade do adapter é transformar dados externos em dados internos.

---

# Responsabilidades

```
API
↓
Fornece dados

Adapter
↓
Traduz dados para Common Adapter Format

applyApiResult (Mapper)
↓
Mapeia para o Data Model de 5 blocos via formulário

Data Model
↓
Padroniza dados

Persistência
↓
Salva no banco
```

---

# Objetivos Futuros

Adicionar suporte para:

• IMDb

• Steam

• ComicVine

• IGDB

• Goodreads

• Spotify

Sem alterar o Data Model.

---

# Definition of Done

Qualquer nova API integrada ao Indexa deverá ser documentada neste arquivo antes de sua implementação.
