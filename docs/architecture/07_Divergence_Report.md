# 07 — Relatório de Divergências

Versão: 1.0

Status: Diagnóstico

---

# Objetivo

Listar todas as divergências entre a documentação de arquitetura (`docs/architecture/`) e a implementação real do código.

Cada item inclui:

- Arquivo
- Problema
- Impacto
- Recomendação

Nenhuma alteração de código foi realizada para corrigir estas divergências — este relatório serve como guia para sprints futuras.

---

# Divergências de Schema (Data Model vs Código)

## D1 — `obra.favorite` vs `obra.fav`

| Campo | Arquivo |
|-------|---------|
| **Doc** | `00_Data_Model.md:66` — `obra { favorite }` |
| **Código** | `modals.js:680` — `obra.fav` |

**Problema**: O nome do campo no Data Model documentado (`favorite`) difere do implementado (`fav`).

**Impacto**: 🟡 Médio. Dados seguem o nome `fav`, então a documentação está incorreta. Quem ler o Data Model e tentar acessar `item.obra.favorite` não encontrará o campo.

**Recomendação**: Atualizar `00_Data_Model.md` para refletir `fav`.

---

## D2 — `consumption.watchedInCinema` vs `consumption.cinemaWatched`

| Campo | Arquivo |
|-------|---------|
| **Doc** | `00_Data_Model.md:223` — `consumption { watchedInCinema }` |
| **Código** | `modals.js:708` — `consumption.cinemaWatched` |

**Problema**: Nome do campo divergente entre doc e implementação.

**Impacto**: 🟡 Médio. Mesmo cenário do D1.

**Recomendação**: Atualizar `00_Data_Model.md` para `cinemaWatched`.

---

## D3 — `progress.currentEpisode` vs `progress.currentEp`

| Campo | Arquivo |
|-------|---------|
| **Doc** | `00_Data_Model.md:190` — `progress { currentEpisode }` |
| **Código** | `modals.js:694` — `progress.currentEp` |

**Problema**: Nome abreviado no código.

**Impacto**: 🟡 Médio.

**Recomendação**: Atualizar `00_Data_Model.md` para `currentEp`.

---

## D4 — `progress.totalChapters` vs `progress.chaptersTotal`

| Campo | Arquivo |
|-------|---------|
| **Doc** | `00_Data_Model.md:196` — `progress { totalChapters }` |
| **Código** | `modals.js:698` — `progress.chaptersTotal` |

**Problema**: Ordem das palavras invertida.

**Impacto**: 🟡 Médio.

**Recomendação**: Atualizar `00_Data_Model.md` para `chaptersTotal`.

---

## D5 — `progress.currentVolume` vs `progress.volume`

| Campo | Arquivo |
|-------|---------|
| **Doc** | `00_Data_Model.md:198` — `progress { currentVolume }` |
| **Código** | `modals.js:699` — `progress.volume` |

**Problema**: Nome simplificado no código.

**Impacto**: 🟡 Médio.

**Recomendação**: Atualizar `00_Data_Model.md` para `volume`.

---

## D6 — `externalIds.isbn10` + `isbn13` vs `externalIds.isbn` (único)

| Campo | Arquivo |
|-------|---------|
| **Doc** | `00_Data_Model.md:276-277` — `externalIds { isbn10, isbn13 }` |
| **Código** | `modals.js:716` — `externalIds.isbn` (campo único) |

**Problema**: A documentação prevê dois campos separados (ISBN-10 e ISBN-13), mas o código armazena apenas um `isbn` (prioriza ISBN-13, fallback para ISBN-10).

**Impacto**: 🟡 Médio. Perde-se a distinção entre os dois formatos. `normalizeItem()` trata `isbn` como campo único, então migrar para dois campos exigiria script de migração.

**Recomendação**: Decidir se quer manter campo único (simplifica) ou separar (mais preciso). Atualizar doc conforme decisão.

---

## D7 — `externalIds.googleBooksId` não implementado

| Campo | Arquivo |
|-------|---------|
| **Doc** | `01_API_Mapping.md:155` — ❌ Não implementado |
| **Código** | `api.js:106` — `externalIds` não inclui `googleBooksId` |

**Problema**: O volume ID do Google Books não é armazenado, impossibilitando re-consulta direta.

**Impacto**: 🟢 Baixo. O ISBN já permite re-consulta via OpenLibrary.

**Recomendação**: Adicionar `googleBooksId` ao `externalIds` quando houver necessidade de re-consulta direta.

---

## D8 — `externalIds.openLibraryId` não implementado

| Campo | Arquivo |
|-------|---------|
| **Doc** | `01_API_Mapping.md:180` — ❌ Não implementado |
| **Código** | `openLibraryAdapter.js:34` e `openLibraryDetailAdapter.js:70` — `externalIds` sem `openLibraryId` |

**Problema**: O OLID (OpenLibrary ID) não é armazenado, impossibilitando re-consulta direta.

**Impacto**: 🟢 Baixo. ISBN permite re-consulta.

**Recomendação**: Adicionar `openLibraryId` ao `externalIds` quando necessário.

---

# Divergências do Adapter Standards

## D9 — `null` vs `''` para campos ausentes

| Campo | Arquivo |
|-------|---------|
| **Doc** | `03_Adapter_Standards.md:97-101` — "Campos inexistentes devem retornar: null. Nunca: undefined." |
| **Código** | Todos os adapters retornam `''` (string vazia), nunca `null` |

**Problema**: Inconsistência entre o padrão documentado e a implementação.

**Impacto**: 🟢 Baixo. Ambos são falsy em JS. `''` é mais seguro que `null` para interpolação em templates.

**Recomendação**: Atualizar `03_Adapter_Standards.md` para refletir `''` como padrão, ou ajustar código para retornar `null` (traria risco de regressão em templates).

---

## D10 — Contrato de retorno: `director`/`creator`/`author` separados vs `creator` coringa

| Campo | Arquivo |
|-------|---------|
| **Doc** | `03_Adapter_Standards.md:68-70` — contrato pede `director`, `creator`, `author` como campos distintos |
| **Código** | Todos os adapters retornam apenas `creator` (campo coringa) |

**Problema**: A documentação especifica 3 campos separados, mas a implementação usa 1 campo coringa. O roteamento para o campo correto do formulário é feito pelo `applyApiResult()`, não pelo adapter.

**Impacto**: 🔴 Alto. A documentação do contrato está incorreta. Novo desenvolvedor criaria adapter com campos errados.

**Recomendação**: Atualizar `03_Adapter_Standards.md` para refletir o campo `creator` único, documentando que o roteamento é responsabilidade do mapper.

---

## D11 — Contrato não inclui `rating`, `esrb`, `readUrl`

| Campo | Arquivo |
|-------|---------|
| **Doc** | `03_Adapter_Standards.md:59-94` — contrato não lista `rating`, `esrb`, `readUrl` |
| **Código** | Todos os adapters retornam `rating`, `esrb` (RAWG) e `readUrl` |

**Problema**: O contrato documentado está incompleto.

**Impacto**: 🟡 Médio. Campos existentes no código não constam na documentação.

**Recomendação**: Adicionar `rating`, `esrb` e `readUrl` ao contrato em `03_Adapter_Standards.md`.

---

## D12 — Contrato inclui `volumes` mas nenhum adapter implementa

| Campo | Arquivo |
|-------|---------|
| **Doc** | `03_Adapter_Standards.md:83` — contrato pede `volumes` |
| **Código** | Nenhum adapter retorna `volumes`. AniListAdapter.java ignora o campo mesmo ele existindo na API. |

**Problema**: Campo documentado como obrigatório no contrato mas zerado em todos os adapters.

**Impacto**: 🟡 Médio. Inconsistência entre expectativa e realidade.

**Recomendação**: Remover `volumes` do contrato obrigatório (mover para "campos opcionais") ou implementar no adapter AniList.

---

## D13 — Erros devem retornar `{ success: false }`, código retorna `[]`/`null`

| Campo | Arquivo |
|-------|---------|
| **Doc** | `03_Adapter_Standards.md:218-223` — "Qualquer erro deve retornar: success = false. Jamais lançar exceções para a interface." |
| **Código** | `api.js` — funções retornam `[]` (busca vazia) ou `null` (detalhe não encontrado) |

**Problema**: Formato de erro documentado difere do implementado.

**Impacto**: 🟢 Baixo. O padrão `[]`/`null` é mais simples e funciona para o caso de uso (caller verifica `.length` ou truthiness).

**Recomendação**: Atualizar `03_Adapter_Standards.md` para documentar o padrão real: `[]` para busca sem resultados, `null` para detalhe não encontrado.

---

## D14 — Gêneros como array vs string CSV

| Campo | Arquivo |
|-------|---------|
| **Doc** | `03_Adapter_Standards.md:129-138` — "Gêneros: Sempre array. Nunca string." |
| **Código** | Todos os adapters retornam `genres.join(', ')` — string CSV |

**Problema**: A normalização documentada exige array, mas todos os adapters produzem string.

**Impacto**: 🟡 Médio. Se algum componente consumir `genres` esperando um array, quebrará.

**Recomendação**: Decidir se mantém string CSV (como está hoje, consumido como `f-genres` no formulário) ou converte para array. Atualizar doc conforme decisão.

---

## D15 — Capas: maior resolução vs thumbnail (Google Books)

| Campo | Arquivo |
|-------|---------|
| **Doc** | `03_Adapter_Standards.md:144-146` — "Todos os adapters devem retornar a maior resolução disponível. Nunca thumbnails quando existir versão HD." |
| **Código** | `api.js:81` — Google Books usa `imageLinks.thumbnail` (≈128px) |

**Problema**: Google Books viola o padrão de capas.

**Impacto**: 🟢 Baixo. Capas de livros em thumbnail ficam visíveis mas com baixa qualidade.

**Recomendação**: Modificar a URL da thumbnail para obter maior resolução (ex: remover `&zoom=1` ou usar `imageLinks.extraLarge` quando disponível).

---

# Divergências de Fluxo

## D16 — Import Flow não documenta Smart Search

| Campo | Arquivo |
|-------|---------|
| **Doc** | `02_Import_Flow.md` — fluxo básico de importação |
| **Código** | `modals.js` — Smart Search com múltiplos resultados, trust level, keyboard navigation |

**Problema**: O documento `02_Import_Flow.md` descreve apenas o fluxo básico (1 resultado, auto-import). O fluxo real é mais sofisticado (seleção explícita, trust levels, fonte badgeada).

**Impacto**: 🟢 Baixo. O documento está desatualizado mas não causa bugs.

**Recomendação**: Atualizar `02_Import_Flow.md` para refletir o Smart Search (Etapas 3-5: lista de resultados, trust level, keyboard nav).

---

## D17 — `applyApiResult` não mapeia `f-hours-played`

| Campo | Arquivo |
|-------|---------|
| **Doc** | `06_Common_Adapter_Format.md` (novo) — tabela de mapeamento |
| **Código** | `api.js:233-301` — `applyApiResult()` não popula `f-hours-played` |

**Problema**: O campo `f-hours-played` existe no formulário (`modals.js:702`) mas o mapper da API nunca o preenche. O adapter RAWG mapeia `playtime` como `durationMinutes` (erro semântico), não como `hoursPlayed`.

**Impacto**: 🟡 Médio. Horas jogadas de RAWG não são importadas automaticamente — usuário precisa digitar manualmente.

**Recomendação**: Corrigir o fluxo: RAWG adapter retornar `hoursPlayed` (ou `playtime` em horas), e `applyApiResult` mapear para `f-hours-played`.

---

## D18 — Google Books inline em `api.js` (sem adapter separado)

| Campo | Arquivo |
|-------|---------|
| **Doc** | `03_Adapter_Standards.md` e `01_API_Mapping.md` tratam Google Books como adapter |
| **Código** | Google Books é implementado inline em `api.js:68-111` |

**Problema**: Único adapter sem arquivo próprio em `src/adapters/`. Difícil manutenção e inconsistente com os demais.

**Impacto**: 🟢 Baixo. Funciona, mas fere o princípio de isolamento.

**Recomendação**: Extrair para `src/adapters/googlebooksAdapter.js` seguindo o mesmo padrão dos demais.

---

## D19 — RAWG: playtime mapeado como durationMinutes em vez de hoursPlayed

| Campo | Arquivo |
|-------|---------|
| **Doc** | `04_Data_Quality.md v2.0` — documentado como bug 🟡 |
| **Código** | `rawgAdapter.js:20` — `durationMinutes = detail.playtime * 60` |

**Problema**: O RAWG `playtime` representa horas jogadas estimadas pelo usuário, mas é mapeado como `durationMinutes` (minutos por episódio). Semanticamente pertence a `progress.hoursPlayed`.

**Impacto**: 🟡 Médio. O valor não aparece no campo "Horas jogadas" do formulário, e `durationMinutes` exibe minutos (corretos) em vez de horas.

**Recomendação**: Alterar adapter para retornar campo `hoursPlayed` e ajustar `applyApiResult` para mapeá-lo a `f-hours-played`.

---

## D20 — Editor tem auto-save mas Import Flow documenta "Nada é salvo automaticamente"

| Campo | Arquivo |
|-------|---------|
| **Doc** | `02_Import_Flow.md:227` — "Nada é salvo automaticamente" (referindo-se ao fluxo de importação) |
| **Código** | `modals.js` — `editorAutoSave()` com debounce de 1.2s salva alterações no editor |

**Problema**: A frase "Nada é salvo automaticamente" pode ser interpretada como ausência total de auto-save, mas o editor de obras possui auto-save.

**Impacto**: 🟢 Baixo. O contexto do documento é o fluxo de importação, não o editor. Mas pode gerar confusão.

**Recomendação**: Esclarecer em `02_Import_Flow.md` que "nada é salvo automaticamente durante a importação — o usuário deve clicar em Salvar. O editor, por outro lado, possui auto-save."

---

# Resumo por Prioridade

| Prioridade | ID | Descrição |
|------------|----|-----------|
| 🔴 Alto | D10 | Contrato adapter: director/creator/author vs creator coringa |
| 🟡 Médio | D1–D6 | Inconsistências de nomenclatura no Data Model |
| 🟡 Médio | D11 | Contrato adapter incompleto (rating, esrb, readUrl) |
| 🟡 Médio | D12 | volumes no contrato mas nunca implementado |
| 🟡 Médio | D14 | Gêneros: array na doc, string CSV no código |
| 🟡 Médio | D17 | applyApiResult não mapeia f-hours-played |
| 🟡 Médio | D19 | RAWG playtime mapeado como durationMinutes |
| 🟢 Baixo | D7–D8 | googleBooksId / openLibraryId não armazenados |
| 🟢 Baixo | D9 | null vs '' para campos ausentes |
| 🟢 Baixo | D13 | Formato de erro: { success: false } vs []/null |
| 🟢 Baixo | D15 | Google Books thumbnail vs HD |
| 🟢 Baixo | D16 | Import Flow desatualizado (Smart Search) |
| 🟢 Baixo | D18 | Google Books inline sem adapter separado |
| 🟢 Baixo | D20 | Auto-save do editor vs afirmação no Import Flow |

---

# Nota sobre divergências já resolvidas na Sprint atual

As seguintes divergências foram **corrigidas na documentação** durante esta Sprint:

| Documento | O que mudou |
|-----------|-------------|
| `01_API_Mapping.md` | Status de todos os campos atualizados para refletir implementação real. Fluxo corrigido para incluir Common Adapter Format + Mapper. |
| `04_Data_Quality.md` | Cobertura recalculada (TMDB: 100%, AniList: 92%, RAWG: 92%, Google Books: 90%, OpenLibrary: 75%). Bugs e pendências atualizados. |
| `06_Common_Adapter_Format.md` (novo) | Documenta a arquitetura real com a camada intermédia Common Adapter Format + Mapper. Inclui documentação do `normalizeItem` como camada de compatibilidade legada. |
