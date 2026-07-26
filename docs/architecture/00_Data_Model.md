# 00 — Data Model

Versão: 1.0

Status: Oficial

---

# Objetivo

Definir a estrutura oficial utilizada pelo Indexa para armazenar qualquer tipo de mídia.

Todo dado importado de APIs externas deve ser convertido para este modelo antes de ser salvo no banco.

Este documento é considerado a fonte oficial da estrutura de dados do projeto.

---

# Filosofia

O banco de dados nunca deve refletir a estrutura de uma API.

As APIs mudam.

O modelo interno do Indexa permanece estável.

Todos os adapters têm como responsabilidade converter dados externos para este formato.

---

# Estrutura Geral

Toda obra é composta pelos seguintes blocos:

```
Obra
│
├── obra
├── metadata
├── progress
├── consumption
└── externalIds
```

Cada bloco possui responsabilidades específicas.

---

# obra

Representa as informações principais da mídia.

```ts
obra {
    title
    cover
    year
    genres
    synopsis

    rating
    opinion

    emotions

    favorite

    positiveTags
    negativeTags
}
```

## Campos

title

Nome oficial da obra.

cover

URL da capa.

year

Ano principal de lançamento.

genres

Lista de gêneros.

synopsis

Descrição oficial.

rating

Nota atribuída pelo usuário.

opinion

Avaliação em texto.

emotions

Lista de emoções associadas.

favorite

Marca de favorito.

positiveTags

Tags positivas.

negativeTags

Tags negativas.

---

# metadata

Informações sobre criação da obra.

```ts
metadata {
    director
    creator
    author

    studio

    developer

    publisher
}
```

## Regras

Nem todos os campos serão utilizados para todas as mídias.

Exemplos

Filmes

director

studio

Séries

creator

studio

Anime

director (quando existir)

studio

Mangás

author

Livros

author

publisher

Jogos

developer

publisher

---

# progress

Representa o progresso do usuário.

```ts
progress {

    season

    currentEpisode

    totalEpisodes

    currentChapter

    totalChapters

    currentVolume

    totalVolumes

    pages

    hoursPlayed

    collection
}
```

Cada mídia utilizará apenas os campos necessários.

---

# consumption

Informações relacionadas ao consumo.

```ts
consumption {

    platform

    watchedInCinema

    readUrl

    durationMinutes
}
```

Exemplos

Filmes

Netflix

Cinema

Blu-ray

Livros

Kindle

Manga Plus

Jogos

Steam

PlayStation

Xbox

---

# externalIds

Responsável pelos identificadores externos.

```ts
externalIds {

    tmdbId

    anilistId

    rawgId

    openLibraryId

    googleBooksId

    isbn10

    isbn13
}
```

Nunca misturar identificadores.

Cada API possui seu próprio campo.

---

# Princípios

## 1

O banco nunca depende da estrutura de uma API.

---

## 2

Todos os adapters convertem dados para o modelo oficial.

---

## 3

A interface nunca consome dados diretamente das APIs.

Sempre consome o Data Model.

---

## 4

Campos ausentes permanecem nulos.

Nunca utilizar valores fictícios.

---

## 5

Novos tipos de mídia devem reutilizar esta estrutura sempre que possível.

---

# Fluxo

```
API

↓

Adapter

↓

Data Model

↓

Validação

↓

Banco

↓

Interface
```

---

# Benefícios

• Independência das APIs

• Estrutura consistente

• Facilidade de manutenção

• Facilidade para adicionar novas integrações

• Redução de código duplicado

---

# Definition of Done

Toda mídia importada pelo Indexa deve respeitar integralmente este modelo de dados antes de ser persistida no banco.