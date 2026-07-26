# Design System

> Sistema visual oficial do Indexa.

Versão: 1.0

---

# Objetivo

O Design System define todas as regras visuais do Indexa.

Seu objetivo é garantir consistência entre todas as telas, componentes e futuras funcionalidades.

Toda nova interface deve seguir estas diretrizes.

---

# Filosofia

O Design System do Indexa segue cinco princípios.

## 1. O conteúdo é o protagonista

O usuário deve enxergar primeiro:

- a capa
- o título
- o progresso

Nunca a interface.

---

## 2. Menos é mais

Sempre remover antes de adicionar.

A simplicidade é prioridade.

---

## 3. Consistência

O mesmo componente deve se comportar da mesma forma em qualquer lugar do sistema.

---

## 4. Hierarquia

Toda tela possui apenas uma informação principal.

Todo o restante apoia essa informação.

---

## 5. Espaço em branco faz parte do design

Espaço vazio não é desperdício.

Ele melhora leitura e organização.

---

# Grid

Desktop

12 colunas

Largura máxima:

1440px

Conteúdo centralizado.

---

Tablet

8 colunas

---

Mobile

4 colunas

---

# Espaçamentos

Utilizamos escala de 8 pontos.

| Token | Valor |
|--------|------|
| xs | 4 px |
| sm | 8 px |
| md | 16 px |
| lg | 24 px |
| xl | 32 px |
| xxl | 48 px |
| hero | 64 px |

Nunca utilizar valores aleatórios.

---

# Border Radius

Pequeno

8 px

---

Médio

12 px

---

Grande

16 px

---

Cards Premium

20 px

---

Botões arredondados

999 px

---

# Sombras

Shadow 1

Componentes elevados.

Muito suave.

---

Shadow 2

Modais.

---

Shadow 3

Menus flutuantes.

Evitar sombras fortes.

---

# Bordas

Sempre utilizar:

1 px

Cor neutra.

Baixo contraste.

Nunca utilizar bordas pesadas.

---

# Cores

## Primária

Azul Indexa

(Definir posteriormente)

---

## Secundária

Roxo

Apenas elementos de apoio.

---

## Sucesso

Verde

---

## Atenção

Amarelo

---

## Erro

Vermelho

---

## Favorito

Vermelho suave

---

## Fundo

Dark Mode

Background principal

Surface

Surface Elevada

Cards

Modal

Separadores

Todos utilizando contraste suave.

---

# Tipografia

Fonte oficial

Inter

Fallback

system-ui

---

# Escala tipográfica

Display

40 px

---

H1

32 px

---

H2

28 px

---

H3

24 px

---

Título Card

20 px

---

Subtítulo

16 px

---

Texto

15 px

---

Texto secundário

14 px

---

Legenda

13 px

---

Microtexto

12 px

---

# Peso das fontes

Light

Apenas casos especiais.

Regular

Texto padrão.

Medium

Botões.

Semibold

Subtítulos.

Bold

Somente títulos.

Nunca utilizar Bold em excesso.

---

# Altura das linhas

120%

Títulos

---

150%

Textos

---

# Ícones

Família

Material Symbols Rounded

---

Peso

Rounded

---

Tamanho

16

20

24

32

Nunca misturar bibliotecas diferentes.

---

# Botões

Primário

Cor sólida.

---

Secundário

Outline.

---

Terciário

Texto.

---

FAB

Somente para ações principais.

---

Botões sempre possuem:

Hover

Focus

Pressed

Disabled

Loading

---

# Inputs

Todos os inputs possuem:

Label

Placeholder

Helper text

Erro

Disabled

Focus

---

# Cards

Todos os cards seguem o mesmo padrão.

Imagem

↓

Título

↓

Informação secundária

↓

Status

↓

Progresso (quando existir)

---

Nunca utilizar informações sem hierarquia.

---

# Badges

Utilizadas para:

Categoria

Status

Ano

Idioma

Nunca para textos longos.

---

# Chips

Utilizadas para:

Gêneros

Filtros

Tags

Coleções

---

# Modais

Largura máxima

900 px

---

Header fixo

Footer fixo

Conteúdo central rolável.

---

Sempre possuir:

Fechar

Salvar

Cancelar

---

# Accordion

Utilizado para esconder informações secundárias.

Nunca esconder informações importantes.

---

# Skeleton

Todo carregamento superior a 300 ms deve utilizar Skeleton.

Nunca Spinner em páginas completas.

---

# Motion

Todas as animações seguem três princípios.

Suaves.

Curtas.

Discretas.

---

Duração

150 ms

200 ms

250 ms

Nunca utilizar animações longas.

---

# Responsividade

Mobile First.

Toda tela deve funcionar em:

320 px

375 px

768 px

1024 px

1440 px

1920 px

---

# Acessibilidade

Contraste mínimo AA.

Navegação por teclado.

Área mínima de toque

44 px

Todos os ícones possuem Tooltip.

Todos os botões possuem Label.

---

# Feedback

Sucesso

Toast.

Erro

Toast.

Aviso

Banner.

Nunca utilizar Alert bloqueando a tela.

---

# Estados vazios

Toda tela vazia deve orientar o usuário.

Nunca deixar áreas completamente em branco.

---

# Performance

Toda interação deve responder em menos de 200 ms.

Mudanças visuais devem parecer instantâneas.

---

# Consistência

Todo novo componente deve responder:

Existe outro componente parecido?

Posso reutilizar algum componente existente?

Se sim, reutilize.

Nunca criar componentes duplicados.

---

# Regra de Ouro

Sempre que existir dúvida entre duas soluções, escolher a mais simples.