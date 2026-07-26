# 02 — Import Flow

Versão: 1.0

Status: Oficial

---

# Objetivo

Documentar todo o fluxo de importação de uma obra, desde a digitação do título até a persistência no banco de dados.

Todo processo de importação deve seguir este fluxo.

---

# Filosofia

A importação deve ser:

• previsível

• transparente

• reutilizável

• independente da API utilizada

O usuário sempre possui controle sobre a obra que será importada.

---

# Fluxo Geral

```
Usuário

↓

Digita o título

↓

Autocomplete

↓

Consulta API

↓

Lista de sugestões

↓

Usuário escolhe

↓

Adapter

↓

Data Model

↓

Validação

↓

Preenchimento do formulário

↓

Usuário revisa

↓

Salvar

↓

Firestore
```

---

# Etapa 1 — Digitação

O usuário informa um título.

Exemplo

```
Matrix Reloaded
```

Nenhuma informação é salva nesta etapa.

---

# Etapa 2 — Busca

O sistema identifica o tipo da mídia.

Exemplo

Filme

↓

TMDB

Livro

↓

Google Books + OpenLibrary

Anime

↓

AniList

Jogo

↓

RAWG

---

# Etapa 3 — Adapter

Cada API retorna um formato diferente.

O adapter converte esse retorno para o Data Model oficial.

Nenhum dado da API deve chegar diretamente ao formulário.

---

# Etapa 4 — Lista de Resultados

O adapter retorna uma coleção de obras.

Exemplo

```
[
    Matrix Reloaded (2003)

    Matrix Revolutions (2003)

    The Matrix (1999)

    Matrix Resurrections (2021)
]
```

Nenhuma obra é considerada selecionada automaticamente.

---

# Etapa 5 — Seleção

Somente o usuário pode confirmar uma obra.

São ações válidas:

• clique

• Enter

• confirmação por teclado

Enquanto isso:

selectedResult = null

---

# Etapa 6 — Conversão

A obra escolhida é convertida para o Data Model.

Neste momento ocorre a normalização.

Exemplo

```
TMDB

↓

poster_path

↓

cover
```

---

# Etapa 7 — Validação

Antes do formulário receber os dados:

• verificar campos obrigatórios

• verificar tipos

• normalizar listas

• remover valores inválidos

---

# Etapa 8 — Formulário

O formulário recebe apenas dados validados.

O usuário ainda pode editar qualquer informação.

Nada é salvo automaticamente.

---

# Etapa 9 — Persistência

Somente ao clicar em Salvar.

```
Formulário

↓

Firestore
```

---

# Regras

Nunca importar automaticamente.

Nunca salvar automaticamente.

Nunca sobrescrever alterações do usuário.

Sempre permitir edição manual.

---

# Fluxo de Erros

Caso a API falhe:

↓

mostrar mensagem amigável

↓

permitir preenchimento manual

A aplicação nunca deve bloquear o usuário.

---

# Benefícios

• menor acoplamento

• maior previsibilidade

• menor quantidade de bugs

• facilidade para adicionar novas APIs

---

# Definition of Done

Todo fluxo de importação deverá seguir exatamente esta arquitetura.