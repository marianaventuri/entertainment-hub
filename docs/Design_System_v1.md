# Indexa Design System v1.0

Versão: 1.0

Status: Em construção

---

# Introdução

O Design System do Indexa define todas as regras visuais, comportamentais e de experiência do produto.

Seu objetivo é garantir consistência entre todas as telas, reduzir retrabalho e facilitar futuras evoluções.

Toda nova funcionalidade deve seguir estas diretrizes antes de ser implementada.

---

# Filosofia

O Indexa não é apenas um catálogo.

É uma biblioteca pessoal.

A interface deve transmitir calma, organização e sofisticação.

Ela nunca deve competir com o conteúdo.

As obras são o centro da experiência.

---

# Os cinco pilares

## 1. Clareza

Toda informação deve ser encontrada rapidamente.

O usuário nunca deve se perguntar:

"Onde está isso?"

---

## 2. Simplicidade

Toda tela deve conter apenas os elementos necessários.

Se um componente não agrega valor, ele deve ser removido.

---

## 3. Consistência

Botões, campos, cards e menus devem manter sempre o mesmo comportamento.

Aprender uma tela significa compreender todas.

---

## 4. Eficiência

As ações mais frequentes devem exigir o menor número possível de cliques.

Alterar status, favoritar e registrar progresso precisam ser extremamente rápidos.

---

## 5. Elegância

O visual deve ser limpo.

Sem excesso de cores.

Sem excesso de ícones.

Sem excesso de elementos decorativos.

---

# Princípios de UX

## O conteúdo é protagonista

Capas.

Títulos.

Notas.

Progresso.

Essas informações possuem prioridade máxima.

---

## Rolagem mínima

O usuário deve conseguir visualizar as principais informações sem precisar percorrer grandes distâncias.

Sempre que possível utilizar:

• accordions

• chips

• dropdowns

• menus contextuais

---

## Interface silenciosa

O aplicativo não deve chamar atenção para si.

Quem deve chamar atenção são as obras.

---

## Uma ação principal

Cada tela possui apenas uma ação principal.

Exemplo:

Home → Continuar consumindo

Biblioteca → Encontrar obras

Dashboard → Descobrir estatísticas

Editar → Salvar alterações

---

# Linguagem Visual

## Estilo

Minimalista

Premium

Editorial

Moderno

Calmo

Organizado

---

## O que evitar

Excesso de emojis

Gradientes exagerados

Sombras fortes

Muitas bordas

Muitas cores simultaneamente

Fontes pesadas

Interfaces "gamificadas"

Poluição visual

---

# Hierarquia Tipográfica

Toda tela segue a mesma estrutura.

H1

Título da página

H2

Título da obra

H3

Nome de seções

Body

Informações principais

Caption

Metadados

Helper

Informações auxiliares

---

# Espaçamento

Todo o sistema utiliza múltiplos de 8px.

8

16

24

32

40

48

64

Nunca utilizar valores aleatórios.

---

# Grid

Desktop

12 colunas

Tablet

8 colunas

Mobile

4 colunas

---

# Cores

A definir.

As cores devem transmitir:

Organização

Tecnologia

Conforto visual

---

# Tipografia

A definir.

Critérios:

Alta legibilidade

Boa leitura em telas pequenas

Boa leitura em português

Pesos limitados

Regular

Medium

SemiBold

Evitar Bold excessivo.

---

# Ícones

Utilizar apenas uma biblioteca.

Preferência:

Lucide

ou

Material Symbols

Jamais misturar estilos.

---

# Componentes

Todos os componentes seguem o mesmo padrão visual.

Botões

Inputs

Dropdown

Accordion

Cards

Modal

Sidebar

Bottom Navigation

Toast

Badge

Tooltip

Search

Rating

---

# Cards

Os cards representam as obras.

São o componente mais importante do produto.

Eles devem apresentar apenas as informações essenciais.

Título

Avaliação

Status

Ano

Categoria

Informação específica do tipo

Gêneros

Todo o restante fica dentro do modal.

---

# Modal

O modal é uma ficha da obra.

Não deve parecer um formulário.

A edição deve ser rápida.

Os dados principais aparecem imediatamente.

Informações secundárias permanecem recolhidas.

---

# Responsividade

Desktop

Prioriza produtividade.

Mobile

Prioriza rapidez.

Nunca esconder funcionalidades importantes.

Apenas reorganizá-las.

---

# Navegação

Máximo de um clique até qualquer funcionalidade principal.

Evitar menus profundos.

Evitar excesso de abas.

---

# Motion

As animações devem existir apenas para orientar o usuário.

Nunca como decoração.

Tempo recomendado:

150ms

200ms

250ms

---

# Acessibilidade

Contraste AA.

Área mínima de clique:

44x44 px

Suporte completo ao teclado.

Foco sempre visível.

---

# Estados

Todo componente deve possuir:

Default

Hover

Focus

Active

Disabled

Loading

Error

Success

---

# Critérios para novas funcionalidades

Antes de implementar qualquer funcionalidade responder:

Resolve um problema real?

Reduz trabalho do usuário?

É consistente com o restante?

Aumenta ou reduz a complexidade?

Pode ser simplificada?

Se alguma resposta for negativa, reavaliar antes da implementação.

---

# Regra de Ouro

Sempre que houver duas soluções possíveis, escolher a mais simples.

---

# Brand Identity

## Conceito

O Indexa é uma biblioteca pessoal de entretenimento.

Ele não busca competir com plataformas especializadas como Letterboxd, MyAnimeList ou Goodreads. Seu objetivo é reunir todas as mídias em uma única experiência consistente, elegante e organizada.

O foco do produto não é descobrir novos conteúdos, mas registrar, organizar e acompanhar a jornada pessoal do usuário.

---

## Personalidade

O Indexa transmite:

- Organização
- Elegância
- Simplicidade
- Inteligência
- Calma
- Sofisticação

Nunca deve transmitir:

- Excesso de informações
- Infantilidade
- Poluição visual
- Gamificação exagerada
- Interface chamativa

---

## Posicionamento

O conteúdo é o protagonista.

A interface existe para valorizar as obras, nunca para competir com elas.

---

## Linguagem Visual

Referências que inspiram o produto:

• Apple
• Notion
• Arc Browser
• Letterboxd
• Readwise

Não copiar nenhum deles.

O objetivo é criar uma identidade própria baseada nesses princípios.

---

## Estilo

Biblioteca Moderna

Minimalista

Premium

Editorial

Muito espaço em branco

Poucas cores

Tipografia limpa

Poucos ícones

Poucos elementos decorativos

---

## Princípios de Interface

- O usuário encontra qualquer obra rapidamente.
- Alterar informações deve exigir poucos cliques.
- O usuário não deve precisar pensar onde clicar.
- Cada tela deve possuir um objetivo claro.
- O design deve desaparecer para que o conteúdo apareça.

---

## Objetivo

Construir a melhor biblioteca pessoal de entretenimento disponível.

# Design Tokens

Os Design Tokens representam os valores fundamentais utilizados em toda a interface do Indexa.

Todos os componentes devem utilizar exclusivamente estes valores.

---

## Cores

### Primary

#3563E9

Representa confiança, organização e tecnologia.

---

### Background

#15171A

Fundo principal da aplicação.

Evitar preto absoluto (#000000).

---

### Surface

#1C1F24

Cards, modais e painéis.

---

### Surface Hover

#252932

---

### Border

#2E3440

---

### Text Primary

#F8F9FB

---

### Text Secondary

#B7BEC9

---

### Success

#22C55E

---

### Warning

#F59E0B

---

### Error

#EF4444

---

## Radius

Input
12px

Button
12px

Card
20px

Modal
24px

Badge
999px

---

## Shadow

Small

Medium

Large

---

## Spacing

4
8
12
16
24
32
40
48
64

---

## Motion

150ms

200ms

250ms

Curva:

ease-out

---

## Grid

Desktop

12 colunas

Tablet

8 colunas

Mobile

4 colunas

Gutter

24px

# Componentes Fundamentais

O Indexa é construído a partir de um conjunto reduzido de componentes reutilizáveis.

Nenhuma tela deve criar novos componentes quando um existente puder ser reutilizado.

## Componentes Base

- Button
- Icon Button
- Input
- Textarea
- Dropdown
- Badge
- Chip
- Card
- Modal
- Accordion
- Progress Bar
- Empty State

Todos os componentes devem seguir os Design Tokens definidos anteriormente.

# Princípios de Componentes

## Consistência

O mesmo componente deve possuir sempre o mesmo comportamento.

Um botão Primary nunca muda de aparência dependendo da tela.

---

## Reutilização

Sempre reutilizar um componente existente antes de criar outro.

---

## Simplicidade

Cada componente deve resolver apenas um problema.

---

## Descoberta Progressiva

Informações secundárias devem permanecer recolhidas até que o usuário demonstre interesse.

---

## Baixa carga cognitiva

Mostrar apenas as informações necessárias para cada momento da jornada.

---

## Mobile First

Todo componente deve funcionar primeiro em telas pequenas.

Depois será adaptado ao desktop.

---

# 05. Arquitetura do Card Mestre

## Objetivo

O Card Mestre é o principal componente do Indexa e representa a visualização completa de uma obra.

### Estrutura

1. Header
- Voltar
- Categoria
- Favoritar
- Editar

2. Hero
- Capa
- Título
- Subtítulo (Autor/Diretor/Estúdio + Ano)
- Avaliação
- Status
- Gêneros

3. Conteúdo
- Progresso
- Sinopse
- Observações
- Coleção (quando aplicável)

4. Detalhes
- Informações Técnicas (recolhidas)

### Regras

- O título aparece apenas uma vez.
- A capa é o elemento visual principal.
- Status é um Badge clicável.
- Avaliação utiliza estrelas clicáveis.
- Informações secundárias permanecem recolhidas.
- O Card possui dois modos: Visualização e Edição.
- O modo padrão é sempre Visualização.
- O Card memoriza quais seções estavam expandidas para cada usuário.

# 06. Biblioteca

## Objetivo

A Biblioteca é o principal ambiente de navegação do Indexa.

Seu objetivo é permitir que qualquer obra seja localizada rapidamente.

### Fluxo

Pesquisar

↓

Filtrar

↓

Ordenar

↓

Abrir Card

### Filtros

- Tipo
- Status
- Favoritos
- Coleções

### Ordenação

Principais

- Recentes
- A → Z
- Favoritos
- Categoria

Avançadas

- Ano
- Criador
- Avaliação
- Última atualização

### Grid

Desktop Grande: 5 colunas

Desktop Médio: 4 colunas

Tablet: 3 colunas

Mobile: 2 colunas

### Pesquisa

A pesquisa deve localizar informações em todos os campos relevantes da obra:

- Título
- Título original
- Autor
- Diretor
- Estúdio
- Desenvolvedora
- Gêneros
- Plataforma
- Streaming
- Tags
- Observações

# 07. Home Experience

## Objetivo

A Home tem como única missão permitir que o usuário retome sua jornada de entretenimento.

Ela não substitui a Biblioteca.

---

## Estrutura

1. Saudação

2. Continue de onde parou

3. Adicionados recentemente

4. Sugestões inteligentes

5. Atalhos rápidos

---

## Regras

- Não possui filtros.
- Não possui estatísticas.
- Não possui timeline.
- Não possui scroll excessivo.
- Deve destacar apenas informações relevantes para o momento atual.

---

## Princípios

A Home responde apenas duas perguntas:

• O que eu estava consumindo?

• O que posso fazer agora?

# 08. Jornada do Usuário

## Conceito

A Jornada registra automaticamente os principais acontecimentos relacionados às obras.

O objetivo não é criar uma rede social nem um diário manual.

A Jornada existe para preservar a memória do usuário ao longo dos anos.

---

## Eventos registrados

- Obra adicionada
- Início do consumo
- Mudança de status
- Favoritado
- Conclusão
- Última atualização

---

## Regras

- Registro automático.
- Máximo de cinco eventos por obra.
- Linguagem simples e discreta.
- Nunca utilizar gamificação exagerada.

---

## Objetivo

Transformar dados em lembranças.