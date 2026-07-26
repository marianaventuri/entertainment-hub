# 03 — Adapter Standards

Versão: 1.0

Status: Oficial

---

# Objetivo

Definir as regras obrigatórias para todos os adapters do Indexa.

Nenhum adapter deve possuir comportamento diferente dos demais.

---

# Filosofia

Adapters traduzem.

Eles não decidem.

Toda regra de negócio pertence ao sistema.

Nunca ao adapter.

---

# Responsabilidades

Um adapter pode:

✓ consultar APIs

✓ converter dados

✓ normalizar valores

✓ retornar o Data Model

Um adapter nunca pode:

✗ modificar interface

✗ alterar formulário

✗ salvar no Firestore

✗ acessar componentes visuais

✗ executar regras de negócio

---

# Contrato

Todo adapter deve retornar exatamente esta estrutura.

```ts
{
    title,
    year,
    cover,
    synopsis,

    genres,

    director,
    creator,
    author,

    studio,
    developer,
    publisher,

    durationMinutes,

    seasons,
    episodes,

    chapters,

    volumes,

    pages,

    platform,

    source,

    status,

    externalIds
}
```

Campos inexistentes devem retornar:

```
null
```

Nunca:

```
undefined
```

---

# Normalização

Todos os adapters devem utilizar os mesmos formatos.

Datas

```
2003
```

Nunca

```
03/05/2003
```

Gêneros

Sempre array.

```
[
 "Drama",
 "Romance"
]
```

Nunca string.

---

# Capas

Todos os adapters devem retornar a maior resolução disponível.

Nunca thumbnails quando existir versão HD.

---

# IDs

Jamais reutilizar IDs entre APIs.

Exemplo

```
tmdbId

anilistId

rawgId

openLibraryId

googleBooksId
```

---

# Campos Obrigatórios

Todo adapter deve tentar preencher:

• título

• capa

• ano

• sinopse

• gêneros

Quando inexistentes:

retornar null.

---

# Campos Opcionais

• diretor

• estúdio

• publisher

• temporadas

• episódios

• capítulos

• volumes

• duração

• páginas

• plataforma

---

# Tratamento de Erros

Qualquer erro deve retornar:

```
success = false
```

Jamais lançar exceções para a interface.

---

# Logs

Toda inconsistência deve ser registrada.

Exemplo

```
TMDB

Campo production_companies ausente.
```

---

# Versionamento

Sempre que um adapter mudar:

Atualizar

01_API_Mapping.md

04_Data_Quality.md

---

# Definition of Done

Todo novo adapter deverá obedecer integralmente este padrão antes de ser integrado ao sistema.