# 06 — Common Adapter Format

Versão: 2.0

Status: Oficial

---

# Objetivo

Documentar a arquitetura real de dados do Indexa, incluindo a camada intermédia entre os adapters de API e o Data Model oficial.

Este documento descreve o fluxo de dados conforme implementado atualmente, não conforme idealizado em documentos anteriores.

---

# Fluxo Real de Dados

```
                    ┌──────────────────────────┐
                    │          API             │
                    │  (TMDB / AniList / RAWG  │
                    │   / Google Books / OL)   │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │        Adapter           │
                    │  (traduz API → formato   │
                    │   intermédio achatado)   │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │ Common Adapter Format    │
                    │  (objeto achatado com    │
                    │   ~20 campos + extIds)   │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │   Mapper (applyApiResult) │
                    │  (espalha campos do CAF  │
                    │   nos campos do form)    │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │   Formulário (editor)    │
                    │  (campos f-title,        │
                    │   f-year, f-creator...)  │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │     saveItem()           │
                    │  (monta Data Model de    │
                    │   5 blocos dos campos    │
                    │   do formulário)         │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │       Data Model         │
                    │  (obra / metadata /      │
                    │   progress / consumption │
                    │   / externalIds)         │
                    └──────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────────┐
                    │      Persistência        │
                    │  (localStorage + Firestore)│
                    └──────────────────────────┘
```

---

# Responsabilidade de cada camada

## Adapter (`src/adapters/*.js` + `src/api.js` Google Books inline)

- Consulta a API externa
- Traduz campos da API para o Common Adapter Format
- Normaliza valores (ano como string, gêneros como string CSV, capa em URL absoluta)
- Sanitiza HTML quando necessário (AniList, Google Books)
- **Nunca** acessa o formulário, a interface ou o banco de dados
- Retorna `[]` em caso de erro (nunca lança exceções)

## Common Adapter Format (objeto achatado)

- Formato intermédio que todos os adapters produzem
- Não é o Data Model oficial — é uma representação achatada e simplificada
- Campos ausentes retornam `''` (string vazia), nunca `undefined` nem `null`

## Mapper (`applyApiResult()` em `src/api.js`)

- Recebe o Common Adapter Format
- Mapeia cada campo para o elemento de formulário correspondente (`f-*`)
- Roteia `creator` para o campo correto conforme o tipo de mídia (diretor/criador/autor/developer)
- Aplica highlight visual em campos alterados (quando `highlight = true`)
- Cria botões "Desfazer" por campo
- Auto-limpa o highlight após 8 segundos
- **Nunca** persiste dados — apenas preenche o formulário

## Formulário (editor, em `src/modals.js`)

- Contém todos os campos `f-*` que o usuário pode revisar e editar
- O usuário tem controle total antes de salvar
- Nada é salvo automaticamente pela busca

## saveItem() (`src/modals.js:647`)

- Lê todos os campos do formulário
- Monta o Data Model de 5 blocos: `obra`, `metadata`, `progress`, `consumption`, `externalIds`
- Adiciona campos de controle: `id`, `type`, `status`, `addedAt`, `finishedAt`
- Persiste no `db` (array em memória)
- Chama `save()` (localStorage) e `saveItemToFirestore()` (Firestore)

## Data Model

- Estrutura oficial de 5 blocos conforme `00_Data_Model.md`
- Usado exclusivamente para persistência

---

# Common Adapter Format — Schema Oficial

```ts
{
  // ── Campos obrigatórios ──
  title:      string,  // Nome oficial da obra
  year:       string,  // Ano como string ("2003")
  cover:      string,  // URL absoluta da capa
  synopsis:   string,  // Descrição (texto limpo, sem HTML)
  genres:     string,  // Gêneros separados por ", "

  // ── Metadados (campos semânticos específicos) ──
  director:   string,  // Diretor(a) — Filme, Anime
  creator:    string,  // Criador(a) — Série, Dorama
  author:     string,  // Autor(a) — Livro, Mangá
  studio:     string,  // Estúdio (anime) / produtora
  developer:  string,  // Desenvolvedora (jogo)
  publisher:  string,  // Editora / publicadora

  // ── Progresso ──
  durationMinutes: string,  // Minutos por episódio ou total (filme)
  hoursPlayed:     string,  // Horas jogadas (jogo)
  episodes:  string,  // Total de episódios
  seasons:   string,  // Total de temporadas
  pages:     string,  // Total de páginas
  chapters:  string,  // Total de capítulos
  volumes:   string,  // Total de volumes (mangá)

  // ── API metadata ──
  source:     string,  // Fonte original (AniList: "Manga", "Light Novel", etc.)
  anilistStatus: string,  // Status na AniList (usado para sugerir f-status)

  // ── Avaliação e classificação ──
  rating:     string,  // Nota 0–5
  esrb:       string,  // Classificação ESRB (RAWG)

  // ── Consumo ──
  platform:   string,  // Plataforma de consumo
  readUrl:    string,  // URL para continuar leitura

  // ── Identificadores externos ──
  externalIds: {
    tmdbId:    string | number,
    anilistId: string | number,
    rawgId:    string | number,
    isbn:      string
  },

  // ── Metadados da busca (adicionados por api.js, não pelos adapters) ──
  _source?:   string,  // Nome da API: "TMDB", "AniList", etc.
  _apiId?:    string | number  // ID na API de origem
}
```

## Regras do Common Adapter Format

1. **Sempre string**: Todos os valores são string ou string vazia `''`. Nunca `null`, `undefined` ou números.

2. **CSV para listas**: Gêneros e campos similares são string separadas por `, `.

3. **Capa em URL absoluta**: O adapter monta a URL completa da capa. Nunca caminho relativo.

4. **Ano como string**: Exemplo: `"2003"`. Nunca objeto Date.

5. **Campos semânticos de autoria**: Cada adapter retorna o campo específico correspondente ao tipo de mídia (`director` para filme/anime, `creator` para série/dorama, `author` para livro/mangá, `developer` para jogo). O `applyApiResult()` preenche os campos do formulário diretamente, sem necessidade de roteamento por tipo.

6. **IDs externos em externalIds**: Os IDs das APIs ficam no sub-objeto `externalIds`. Cada API tem seu próprio campo.

7. **_source e _apiId**: Adicionados pelo `buscarOnline()` em `api.js`, não pelos adapters. Usados pelo Smart Search para exibir badge da fonte e permitir re-consulta.

---

# Diferenças entre Common Adapter Format e Data Model

| Aspecto | Common Adapter Format | Data Model (persistência) |
|---------|----------------------|---------------------------|
| Estrutura | Achatado (1 nível + externalIds) | 5 blocos aninhados |
| Onde é criado | Nos adapters | Em `saveItem()` |
| Onde é consumido | `applyApiResult()` → formulário | Persistência + `normalizeItem()` |
| Propósito | Transporte entre API e formulário | Armazenamento permanente |
| Campos vazios | `''` | `''` |
| Creator | Campos específicos (director/creator/author/developer) | Roteado para director/creator/author/developer |

---

# Mapeamento: Common Adapter Format → Formulário (`applyApiResult`)

| Campo CAF | Campo do formulário | Tipo de mídia |
|-----------|---------------------|---------------|
| title | f-title | Todos |
| year | f-year | Todos |
| synopsis | f-synopsis | Todos |
| cover | f-cover | Todos |
| genres | f-genres | Todos |
| episodes | f-episodes | Série/Anime/Dorama |
| seasons | f-season | Série/Anime/Dorama |
| pages | f-pages | Livro/Mangá |
| chapters | f-chapters-total | Mangá |
| volumes | f-total-volumes | Mangá |
| hoursPlayed | f-hours-played | Jogo |
| director | f-director | Filme, Anime |
| creator | f-creator | Série, Dorama |
| author | f-author | Livro, Mangá |
| developer | f-developer | Jogo |
| studio | f-studio | Anime |
| publisher | f-publisher | Todos |
| durationMinutes | f-duration-minutes | Todos (visível conforme tipo) |
| platform | f-platform | Jogo |
| readUrl | f-read-url | Mangá/Livro |
| anilistStatus | f-status (sugestão) | Anime/Mangá |
| rating | starInput (via setStar()) | Todos |
| externalIds.tmdbId | f-tmdb-id | Todos |
| externalIds.anilistId | f-anilist-id | Anime/Mangá |
| externalIds.rawgId | f-rawg-id | Jogo |
| externalIds.isbn | f-isbn | Livro |

---

# Normalização aplicada pelos adapters

| Tipo | Regra |
|------|-------|
| Ano | String de 4 dígitos. `first_publish_year` já é número, convertido via `String()`. Datas completas via `.slice(0,4)`. Regex `match(/\d{4}/)` como fallback. |
| Gêneros | Array → string CSV (ex: `"Drama, Romance"`) |
| Capa | URL absoluta montada pelo adapter (TMDB_IMG + poster_path, covers.openlibrary.org + id, etc.) |
| Sinopse | HTML removido via regex (`/<[^>]+>/g`). Entidades HTML decodificadas (Google Books). |
| Duração | TMDB: `runtime` (filme) ou `episode_run_time[0]` (série). RAWG: `playtime * 60`. AniList: `duration` (min/ep). |
| Director / Creator / Author | TMDB: credits.crew → find('Director') ou created_by. AniList: staff.edges → role detection. |
| Rating | RAWG: `metacritic/20` ou `rating`. Sempre arredondado (`Math.round`) e limitado a 0–5. |

---

# Legado: normalizeItem()

## Localização

`persistence.js:4-86`

## Propósito

`normalizeItem()` existe exclusivamente para **compatibilidade com versões anteriores do projeto**.

## O que faz

1. Detecta se um item está no formato legado (achatado, sem os 5 blocos).
2. Se estiver, cria os 5 blocos a partir dos campos achatados.
3. Em seguida, faz o caminho inverso: **achata os 5 blocos de volta para o nível raiz** do objeto.

```js
// Exemplo do que normalizeItem() faz:
// Entrada legada:  { title: "X", year: "2020", author: "Y", ... }
// Saída:           { obra: { title: "X", ... }, metadata: { author: "Y" },
//                    title: "X", author: "Y", ... }  ← campos duplicados
```

## Por que existe

O Indexa passou por uma evolução de schema: inicialmente os dados eram armazenados num formato achatado. Com a adoção do Data Model de 5 blocos (`obra`, `metadata`, `progress`, `consumption`, `externalIds`), foi criada esta função de transição para:

- Ler dados legados que ainda estão no formato antigo (tanto em localStorage quanto no Firestore)
- Garantir que o resto da aplicação, que ainda consome campos no nível raiz (`item.title`, `item.author`, etc.), continue funcionando
- Evitar uma migração destrutiva que poderia perder dados de usuários existentes

## Impacto

- Duplica dados em memória (ex: `item.obra.title` e `item.title` coexistem)
- Aumenta o tamanho dos objetos em ~30%
- Cria duas formas de acessar o mesmo dado — propenso a inconsistências

## Futuro

`normalizeItem()` poderá ser removido quando:

1. Todos os dados legados tiverem sido migrados para o formato de 5 blocos
2. Toda a aplicação consumir exclusivamente o Data Model aninhado (ex: `item.obra.title` em vez de `item.title`)
3. Existir um script de migração única que converta dados antigos em lote

**Não deve ser alterado ou removido enquanto existirem dados no formato legado.**

---

# Regras para novos adapters

1. Todo novo adapter deve retornar o Common Adapter Format descrito neste documento.
2. O adapter nunca deve acessar o formulário, a interface ou o banco.
3. Campos ausentes devem retornar `''` (string vazia).
4. Erros devem retornar `[]` (busca) ou `null` (detalhe).
5. O adapter deve ser registrado em `buscarOnline()` em `src/api.js`.
6. Se a API fornecer novos campos não cobertos pelo CAF atual, este documento deve ser atualizado antes da implementação.
