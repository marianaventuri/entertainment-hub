# Screen Architecture

> Arquitetura oficial das telas do Indexa.

Este documento define como cada tela deve funcionar.

Nenhuma tela deve ser criada sem seguir esta documentação.

---

# Filosofia

Cada tela deve responder apenas uma pergunta.

Quanto menor a carga cognitiva, melhor.

O usuário nunca deve precisar "procurar" uma informação.

Ela deve estar onde ele espera.

---

# Estrutura padrão

Todas as telas seguem a mesma hierarquia.

────────────────────

Header

↓

Conteúdo principal

↓

Conteúdo secundário

↓

Ações

────────────────────

---

# Navegação

Desktop

Sidebar fixa.

Mobile

Bottom Navigation.

Nunca utilizar duas navegações principais ao mesmo tempo.

---

# HOME

## Objetivo

Retomar rapidamente a jornada.

Não é um Dashboard.

Não é uma Biblioteca.

Não é uma página de estatísticas.

Ela responde apenas:

"O que quero fazer agora?"

---

## Componentes

Header

Hero

Continue de onde parou

Adicionados recentemente

Atalhos rápidos

---

## Ordem

1 Saudação

2 Continue assistindo

3 Adicionados recentemente

4 Ações rápidas

---

## Nunca mostrar

Estatísticas

Filtros

Categorias

Biblioteca completa

Favoritos

Linha do tempo

Conquistas

---

## Ação principal

Continuar uma obra.

---

# BIBLIOTECA

## Objetivo

Encontrar qualquer obra rapidamente.

---

## Componentes

Busca

Filtros

Ordenação

Grid

Paginação infinita

---

## Ordem

Busca

↓

Filtros

↓

Ordenação

↓

Grid

---

## Informações prioritárias

Capa

Título

Status

Progresso

---

## Informações secundárias

Ano

Categoria

Autor

Diretor

Estúdio

Desenvolvedora

---

## Nunca mostrar

Sinopse

Notas

Informações técnicas

---

# MODAL DA OBRA

## Objetivo

Consultar rapidamente uma obra.

Editar quando necessário.

---

## Estrutura

Header

↓

Informações principais

↓

Progresso

↓

Accordion

---

## Header

←

Categoria

Título

❤

✏

---

## Informações principais

Avaliação

Status

Ano

Autor correspondente

Gêneros

---

## Progresso

Filmes

Nenhum.

---

Jogos

Horas.

---

Livros

Página ou capítulo.

---

Mangás

Capítulo.

---

Séries

Temporada

Episódio

---

Animes

Temporada

Episódio

---

Doramas

Temporada

Episódio

---

## Accordion

Sinopse

↓

Minha opinião

↓

Informações técnicas

---

## Nunca mostrar inicialmente

IDs

Datas técnicas

JSON

URLs

API

---

# EDITAR OBRA

## Objetivo

Editar rapidamente.

Não parecer um formulário.

---

## Organização

Informações básicas

↓

Progresso

↓

Conteúdo

↓

Personalização

↓

Avançado

---

## Sessão 1

Título

Categoria

Status

Ano

Autor correspondente

---

## Sessão 2

Campos específicos

Temporada

Episódio

Cinema

Horas

etc.

---

## Sessão 3

Sinopse

---

## Sessão 4

Minha opinião

---

## Sessão 5

Tags

(recolhidas)

---

## Sessão 6

Informações técnicas

(recolhida)

---

# DASHBOARD

## Objetivo

Mostrar estatísticas.

Nunca editar obras.

---

## Componentes

Cards

Gráficos

Ranking

Tempo consumido

Categorias

---

# CONFIGURAÇÕES

## Objetivo

Centralizar preferências.

---

## Sessões

Conta

APIs

Tema

Backup

Importação

Exportação

Sobre

---

# BUSCA

Objetivo

Encontrar qualquer obra em poucos segundos.

---

Sempre iniciar focando o cursor.

---

Resultado dividido por categorias.

---

# BOXES

Objetivo

Organizar coleções.

---

Sempre mostrar

Nome

Quantidade

Progresso

Capa

---

# PERFIL

Objetivo

Mostrar dados do usuário.

---

Nunca colocar configurações misturadas.

---

# RESPONSIVIDADE

Desktop

Sidebar

---

Tablet

Sidebar recolhida

---

Mobile

Bottom Navigation

FAB

---

# Estados vazios

Cada tela deve possuir:

Mensagem

Ilustração simples

Botão de ação

---

# Estados de erro

Mensagem amigável.

Botão tentar novamente.

Nunca mostrar erros técnicos.

---

# Performance

Toda tela deve parecer instantânea.

Skeleton durante carregamento.

---

# Regra de ouro

Toda tela deve possuir apenas um objetivo principal.

Se possuir dois, provavelmente deve ser dividida.