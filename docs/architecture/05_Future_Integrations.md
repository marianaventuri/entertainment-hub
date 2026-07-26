# 05 — Future Integrations

Versão: 1.0

Status: Roadmap

---

# Objetivo

Documentar possíveis integrações futuras do Indexa.

Este documento serve como referência para evolução da plataforma.

Nenhuma integração listada aqui é obrigatória.

---

# Filosofia

Novas APIs só devem ser adicionadas quando entregarem informações relevantes que não possam ser obtidas pelas integrações atuais.

Evitar duplicidade de responsabilidades.

---

# Prioridade Alta

## IMDb

Tipo

Filmes

Séries

Pode fornecer

- nota IMDb
- elenco
- idioma original
- país
- classificação indicativa

Status

Planejado

---

## IGDB

Tipo

Jogos

Pode fornecer

- franquias
- screenshots
- trailers
- engines
- multiplayer
- DLCs

Status

Planejado

---

## Steam

Tipo

Jogos

Pode fornecer

- tempo jogado
- conquistas
- preço
- loja
- plataformas

Status

Planejado

---

## ComicVine

Tipo

HQs

Pode fornecer

- personagens
- roteiristas
- artistas
- volumes
- editoras

Status

Planejado

---

# Prioridade Média

## Goodreads

Livros

Pode fornecer

- avaliações
- séries literárias
- edições

---

## Letterboxd

Filmes

Pode fornecer

- listas
- reviews
- diário

---

## MyAnimeList

Anime

Mangá

Pode fornecer

- notas
- reviews
- rankings

---

# Prioridade Baixa

Spotify

Audiobooks

Apple Books

Kindle

Audible

BoardGameGeek

---

# Integrações Inteligentes

No futuro o Indexa poderá combinar APIs.

Exemplo

Filme

TMDB

+

IMDb

+

YouTube

↓

Resultado unificado.

---

Livro

Google Books

+

OpenLibrary

+

Goodreads

↓

Resultado unificado.

---

Jogo

RAWG

+

IGDB

+

Steam

↓

Resultado unificado.

---

# Regras

Nenhuma API pode alterar diretamente o banco.

Toda integração deve passar por:

API

↓

Adapter

↓

Data Model

↓

Validação

↓

Persistência

---

# Critérios para novas integrações

Uma API somente será incorporada quando atender pelo menos um dos critérios abaixo.

- fornecer novos metadados
- melhorar qualidade dos dados
- complementar APIs existentes
- reduzir preenchimento manual
- aumentar a confiabilidade das informações

---

# Roadmap

## Curto prazo

- Revisão completa dos adapters atuais
- Cobertura mínima de 90%

---

## Médio prazo

- IMDb
- IGDB

---

## Longo prazo

- Goodreads
- ComicVine
- Steam
- Letterboxd

---

# Definition of Done

Toda nova integração deverá ser documentada neste arquivo antes de iniciar sua implementação.