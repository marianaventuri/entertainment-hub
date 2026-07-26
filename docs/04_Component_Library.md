# Component Library

> Biblioteca oficial de componentes do Indexa.

Todos os componentes reutilizáveis do sistema devem ser documentados aqui.

Nenhum novo componente deve ser criado sem antes verificar esta biblioteca.

---

# Estrutura da documentação

Cada componente segue o padrão:

Objetivo

Quando usar

Quando NÃO usar

Anatomia

Estados

Regras

Exemplo

---

# Buttons

## Objetivo

Executar ações.

---

## Tipos

Primary

Secondary

Tertiary

Icon Button

Floating Action Button (FAB)

Danger Button

---

## Quando usar

Salvar

Adicionar

Editar

Excluir

Cancelar

Importar

Exportar

---

## Nunca usar

Como links.

Para navegação entre páginas.

---

## Anatomia

Ícone (opcional)

Texto

Área clicável

---

## Estados

Default

Hover

Focus

Pressed

Disabled

Loading

---

## Regras

Botões principais sempre aparecem apenas uma vez por tela.

Nunca utilizar dois botões primários lado a lado.

---

# Icon Button

## Objetivo

Executar ações rápidas ocupando pouco espaço.

---

## Exemplos

Editar

Favoritar

Compartilhar

Voltar

Fechar

Pesquisar

Mais opções

---

## Tamanho

40x40 px

Área de clique mínima:

44x44 px

---

# Inputs

## Objetivo

Receber informações do usuário.

---

Todos os inputs possuem:

Label

Placeholder

Valor

Erro

Focus

Disabled

---

Nunca esconder Labels.

Placeholder não substitui Label.

---

# Search

Objetivo

Encontrar obras rapidamente.

Sempre disponível nas telas principais.

---

# Dropdown

Objetivo

Escolher uma opção.

---

Utilizar para:

Categoria

Status

Temporada

Episódio

Ordenação

Nunca utilizar quando houver menos de três opções.

---

# Card Mestre

## Objetivo

Representar uma obra.

É o componente mais importante do sistema.

---

## Estrutura

Capa

↓

Título

↓

Informação secundária

↓

Status

↓

Progresso

---

## Nunca mostrar

Informações técnicas.

IDs.

Dados da API.

URLs.

---

## Informações prioritárias

Título

Avaliação

Status

Progresso

---

## Informações secundárias

Ano

Autor

Diretor

Estúdio

Desenvolvedora

---

## Informações ocultas

Sinopse

Notas

Tags

Informações técnicas

---

# Card de Coleção

Representa um Box.

Possui:

Imagem

Nome

Quantidade de obras

Progresso geral

---

# Hero

Utilizado somente na Home.

Apresenta:

Saudação

Resumo

Ações rápidas

---

# Badge

Objetivo

Representar atributos.

Exemplos

Status

Ano

Categoria

Idioma

---

Nunca utilizar para textos longos.

---

# Chip

Objetivo

Representar:

Gêneros

Tags

Filtros

---

Sempre removíveis quando utilizados em filtros.

---

# Rating

Sistema oficial

★★★★★

Cinco estrelas.

Incremento de meia estrela permitido.

Sempre clicável.

---

Nunca utilizar notas numéricas.

---

# Progress

Representa evolução.

Tipos

Barra

Circular

Percentual

---

Sempre mostrar progresso real.

Nunca estimado.

---

# Modal

Objetivo

Visualizar ou editar uma obra.

---

Estrutura

Header

Conteúdo

Footer

---

Header

Voltar

Categoria

Título

Favorito

Editar

---

Conteúdo

Informações principais

↓

Informações secundárias

↓

Accordion

↓

Notas

---

Footer

Salvar

Cancelar

---

Nunca colocar ações importantes fora da área visível.

---

# Accordion

Objetivo

Ocultar informações secundárias.

---

Utilizar para

Sinopse

Informações técnicas

Histórico

Detalhes da API

---

Nunca esconder

Título

Status

Progresso

Avaliação

---

# Tabs

Utilizar somente quando realmente necessário.

Priorizar Accordion.

---

# Tooltip

Utilizado apenas quando o ícone não for autoexplicativo.

---

# Toast

Mensagens rápidas.

Exemplos

Obra salva.

Obra removida.

Favorito atualizado.

---

Nunca bloquear a interação.

---

# Dialog

Utilizado apenas para ações destrutivas.

Exemplo

Excluir obra.

---

# Sidebar

Responsável pela navegação principal.

Sempre recolhível.

No mobile transforma-se em Bottom Navigation.

---

# Bottom Navigation

Máximo de cinco opções.

Ícones consistentes.

Sempre fixa.

---

# Empty State

Toda tela vazia deve informar:

O que aconteceu.

Como resolver.

Qual ação realizar.

---

# Skeleton

Utilizado durante carregamentos.

Nunca utilizar Spinner para páginas completas.

---

# Banner

Informações importantes.

Exemplo

Nova temporada disponível.

---

# Carousel

Utilizado apenas para:

Continue de onde parou.

Adicionados recentemente.

---

Nunca utilizar mais de dois carrosséis na mesma tela.

---

# Floating Action Button

Utilizado apenas para:

Adicionar obra.

Nunca possuir mais de um FAB por tela.

---

# Menu Contextual

Aparece ao clicar em:

⋮

Contém ações secundárias.

Nunca ações principais.

---

# Regras Gerais

Todo componente deve possuir:

Hover

Focus

Disabled

Loading

Erro (quando aplicável)

Responsividade

Acessibilidade

Tooltip quando necessário.

---

# Regra Final

Antes de criar um novo componente, verificar se algum componente existente já resolve o problema.

Se resolver, reutilizar.

Consistência é mais importante que criatividade.