# 04 — Data Quality

Versão: 2.0

Status: Oficial

---

# Objetivo

Garantir que todas as integrações do Indexa forneçam dados completos, consistentes e de alta qualidade.

Este documento é utilizado para acompanhar a evolução dos adapters e identificar oportunidades de melhoria.

---

# Filosofia

Uma API não precisa fornecer todos os dados.

O Indexa deve oferecer a melhor experiência possível combinando diferentes fontes quando necessário.

O usuário nunca deve precisar corrigir informações que poderiam ser importadas automaticamente.

---

# Critérios de Qualidade

Cada adapter será avaliado em cinco categorias.

• Cobertura dos dados

• Qualidade dos dados

• Consistência

• Performance

• Manutenibilidade

---

# Legenda

🟢 Excelente

🟡 Parcial

🔴 Necessita revisão

---

# TMDB

Utilizado para:

• Filmes

• Séries

• Doramas

## Cobertura

| Campo | Status | Observação |
|-------|--------|------------|
| Título | 🟢 | title / name |
| Ano | 🟢 | release_date / first_air_date |
| Capa | 🟢 | poster_path via TMDB_IMG |
| Sinopse | 🟢 | overview |
| Gêneros | 🟢 | genres[].name |
| Duração | 🟢 | runtime (filme) / episode_run_time[0] (série) |
| Diretor | 🟢 | credits.crew → find('Director') |
| Criador (série) | 🟢 | created_by[].name |
| Estúdio | 🟢 | production_companies[].name |
| Publisher (série) | 🟢 | networks[].name |
| Temporadas | 🟢 | number_of_seasons |
| Episódios | 🟢 | number_of_episodes |

Cobertura atual

**100%** (12/12 campos do Common Adapter Format mapeados)

---

## Pendências

• `rating` (vote_average) não é importado — poderia ser normalizado para 0–5.

• `originalLanguage` não é importado.

• `status` (TMDB: "Ended", "Returning Series") não é usado para sugestão de f-status.

---

## Oportunidades

• Nenhum campo do Common Adapter Format fica por mapear.

• A qualidade é consistente entre filmes e séries.

---

# AniList

Utilizado para

• Anime

• Mangá

## Cobertura

| Campo | Status | Observação |
|-------|--------|------------|
| Título | 🟢 | title.romaji / english / native |
| Ano | 🟢 | startDate.year |
| Capa | 🟢 | coverImage.large |
| Sinopse | 🟢 | description (HTML sanitizado) |
| Gêneros | 🟢 | genres (via translateGenres) |
| Episódios | 🟢 | episodes |
| Capítulos | 🟢 | chapters |
| Volumes | 🔴 | Não mapeado (existe na API) |
| Autor | 🟢 | staff.edges → role detection aprimorada |
| Estúdio | 🟢 | studios.edges → isMain |
| Source | 🟢 | source (normalizado) |
| Status | 🟢 | status → sugestão de f-status |

Cobertura atual

**92%** (11/12 campos do Common Adapter Format mapeados)

---

## Pendências (🔴)

• `volumes`: existe no schema GraphQL mas não é extraído pelo adapter.

---

## Oportunidades

• `averageScore` (0–100) poderia ser normalizado para rating.

• `coverImage.extraLarge` disponível em vez de `large`.

• `nextAiringEpisode` poderia alimentar badge de "próximo episódio".

---

# RAWG

Utilizado para

• Jogos

## Cobertura

| Campo | Status | Observação |
|-------|--------|------------|
| Título | 🟢 | name |
| Ano | 🟢 | released |
| Capa | 🟢 | background_image |
| Sinopse | 🟢 | description_raw (com detail) |
| Gêneros | 🟢 | genres[].name |
| Developer | 🟢 | developers[].name (com detail) |
| Publisher | 🟢 | publishers[].name (com detail) |
| Plataformas | 🟢 | platforms[].platform.name (com detail) |
| Website | 🟢 | website → readUrl (com detail) |
| Rating | 🟢 | metacritic/20 ou rating (com detail) |
| ESRB | 🟢 | esrb_rating.name (com detail) |
| hoursPlayed → durationMinutes | 🟡 | playtime × 60, mapeado como durationMinutes em vez de hoursPlayed |

Cobertura atual

**92%** (11/12 campos do Common Adapter Format mapeados, 1 com ressalva)

---

## Pendências (🔴)

• Nenhum campo do Common Adapter Format fica por mapear.

## Ressalvas (🟡)

• `playtime` (horas jogadas) é mapeado como `durationMinutes` em vez de `progress.hoursPlayed` — divergência de significado.

• Vários campos (sinopse, developer, publisher, plataformas, website, rating, ESRB) dependem de `detail` (requisição extra). Sem detail, apenas título, ano, capa e gêneros são preenchidos.

---

## Oportunidades

• Separar `playtime` → `hoursPlayed` em vez de `durationMinutes`.

• `tags` (RAWG) poderiam ser importadas como tags do Indexa.

• Adicionar campo `metacritic_url`.

---

# Google Books

Utilizado para

• Livros

## Cobertura

| Campo | Status | Observação |
|-------|--------|------------|
| Título | 🟢 | volumeInfo.title |
| Ano | 🟢 | publishedDate |
| Capa | 🟡 | thumbnail (baixa resolução) |
| Autor | 🟢 | authors[0] |
| Publisher | 🟢 | publisher |
| Sinopse | 🟢 | description (HTML sanitizado) |
| Páginas | 🟢 | pageCount |
| Gêneros | 🟢 | categories[0..3] |
| ISBN | 🟢 | industryIdentifiers (ISBN_13 > ISBN_10) |
| googleBooksId | 🔴 | volume ID não armazenado |

Cobertura atual

**90%** (9/10 campos do Common Adapter Format mapeados)

---

## Pendências (🔴)

• `googleBooksId` (volume ID) não é armazenado em externalIds — impossibilita re-consulta direta.

## Ressalvas (🟡)

• `cover` usa thumbnail (≈128px), não a maior resolução disponível — viola o padrão de capas.

• `isbn` é armazenado como campo único, sem separação ISBN-10 / ISBN-13.

---

## Oportunidades

• Buscar capa em maior resolução (remover `&zoom=1` ou usar `imageLinks.extraLarge`).

• Importar `averageRating` como sugestão de rating.

---

# OpenLibrary

Utilizado como complemento dos livros.

## Cobertura — openLibraryAdapter (search, sem detail)

| Campo | Status | Observação |
|-------|--------|------------|
| Título | 🟢 | title |
| Ano | 🟢 | first_publish_year (número direto) |
| Capa | 🟢 | cover_i → URL |
| Autor | 🟢 | author_name[0] |
| Sinopse | 🟡 | first_sentence apenas |
| Gêneros | 🟢 | subject[0..3] |
| Publisher | 🔴 | Indisponível sem detail |
| Páginas | 🔴 | Indisponível sem detail |
| ISBN | 🔴 | Indisponível sem detail |

## Cobertura — openLibraryDetailAdapter (detail, via OLID/ISBN)

| Campo | Status | Observação |
|-------|--------|------------|
| Título | 🟢 | title |
| Ano | 🟢 | first_publish_date (regex) |
| Capa | 🟢 | covers[0] → URL |
| Autor | 🟢 | authors[0].key → fetch |
| Publisher | 🟢 | publishers[0] |
| Sinopse | 🟢 | description (objeto ou string) |
| Páginas | 🟢 | number_of_pages |
| Gêneros | 🟢 | subjects[0..3] |
| ISBN | 🟢 | isbn_13[0] / isbn_10[0] |
| openLibraryId | 🔴 | key / olid não armazenado |

Cobertura total (ponderada)

**75%** (search: 4/9 = 44%, detail: 9/10 = 90%, uso principal é search via buscas por título)

---

## Pendências (🔴)

• `openLibraryId` (key / olid) não é armazenado em externalIds.

• Publisher, páginas, ISBN e sinopse completa só disponíveis com detail (requisição adicional).

---

## Oportunidades

• Usar detail sempre que possível (encadear search → fetch detail).

• Armazenar OLID para re-consulta futura.

---

# Bugs Conhecidos

## Médios

• **RAWG: playtime mapeado como durationMinutes** (rawgAdapter.js:20) — `playtime * 60` alimenta `durationMinutes` em vez de `hoursPlayed`. O valor está correto em minutos, mas semanticamente pertence a `progress.hoursPlayed`. Impacto: horas jogadas não aparecem no campo "Horas jogadas" do formulário.

## Baixos

• **Google Books: capa em thumbnail** (api.js:81) — usa `imageLinks.thumbnail` em vez de buscar a maior resolução disponível.

• **OpenLibrary: sem detail no search** (api.js:122-127) — `openLibraryAdapter` é chamado com `detail = null`, perdendo publisher, páginas, ISBN e sinopse completa.

• **AniList: volumes ignorados** (anilistAdapter.js) — campo `volumes` existe no retorno GraphQL mas não é extraído.

---

# Indicadores

## Cobertura por adapter

| Adapter | Cobertura |
|---------|-----------|
| TMDB | 100% |
| AniList | 92% |
| RAWG | 92% |
| Google Books | 90% |
| OpenLibrary (search) | 44% |
| OpenLibrary (detail) | 90% |
| **Geral (ponderado)** | **~87%** |

---

# Meta

Versão 1.0

80%

Versão 2.0 (atual)

**87%**

Versão 3.0

95%

---

# Definition of Done

Um adapter só será considerado finalizado quando possuir cobertura mínima de 90% nos campos relevantes do Common Adapter Format.
