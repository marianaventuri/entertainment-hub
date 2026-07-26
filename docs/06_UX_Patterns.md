# UX Patterns

> Padrões oficiais de experiência do usuário do Indexa.

Este documento define como o sistema deve se comportar.

Toda nova funcionalidade deve seguir estes padrões.

---

# Filosofia

O usuário nunca deve pensar.

Ele apenas executa a ação.

Quanto menos decisões ele precisar tomar, melhor será a experiência.

---

# Regra Principal

Uma ação importante = um clique.

Nunca dois.

---

# Pattern — Progressão

Sempre que existir progresso, ele deve estar visível.

Nunca escondido.

Exemplos

✔ Episódio atual

✔ Capítulo atual

✔ Horas jogadas

✔ Página atual

---

# Pattern — Status

O status é uma das informações mais importantes da obra.

Ele deve estar sempre visível.

Preferencialmente como Badge.

Exemplo

[ Assistindo ]

[ Jogando ]

[ Lendo ]

[ Finalizado ]

---

Mudança de status

Um clique.

Sem abrir edição.

---

# Pattern — Favorito

Favorito é uma ação rápida.

Nunca deve ficar escondido.

Sempre disponível no Header.

❤

Clique alterna imediatamente.

Sem confirmação.

---

# Pattern — Avaliação

Sempre utilizar cinco estrelas.

★★★★★

Clique direto.

Sem botão salvar.

O sistema salva automaticamente.

---

# Pattern — Busca

A busca deve estar disponível em todas as telas principais.

Sempre focar rapidez.

Nunca esconder atrás de menus.

---

# Pattern — Filtros

Filtros nunca escondem outros filtros.

Filtros são cumulativos.

Sempre mostrar:

Quantidade encontrada.

---

# Pattern — Accordion

Informações secundárias permanecem recolhidas.

O usuário abre apenas quando desejar.

Exemplos

Sinopse

Minha opinião

Informações técnicas

Histórico

---

Nunca esconder

Título

Status

Progresso

Avaliação

---

# Pattern — Salvamento

Sempre que possível:

Salvar automaticamente.

Caso contrário:

Botão Salvar fixo.

Nunca obrigar o usuário a rolar a tela.

---

# Pattern — Modal

Ao abrir uma obra, o usuário deve visualizar tudo o que importa sem rolagem.

A primeira dobra da tela deve conter:

Título

Categoria

Status

Avaliação

Autor correspondente

Ano

Progresso

---

# Pattern — Cards

O card responde apenas:

O que é?

Em que ponto parei?

Qual o status?

Nada além disso.

---

# Pattern — Hover

Desktop

Hover revela ações secundárias.

Mobile

Nunca depender de Hover.

---

# Pattern — Feedback

Toda ação gera feedback.

Favorito salvo.

Obra criada.

Status alterado.

Avaliação atualizada.

Sempre utilizando Toast.

---

# Pattern — Exclusão

Excluir sempre solicita confirmação.

Nunca excluir imediatamente.

---

# Pattern — Compartilhamento

Compartilhar nunca aparece como ação principal.

É sempre secundário.

---

# Pattern — Campos específicos

Cada categoria exibe apenas informações relevantes.

Filmes

Diretor

Cinema

Duração

---

Séries

Criador

Temporada

Episódio

---

Animes

Estúdio

Temporada

Episódio

---

Livros

Autor

Página

ISBN

---

Mangás

Mangaká

Capítulo

Volumes

---

Jogos

Desenvolvedora

Editora

Horas

Plataforma

---

HQs

Autor

Editora

Volume

---

# Pattern — Temporadas

Nunca utilizar campo de texto.

Sempre Select.

Temporadas vêm da API.

---

# Pattern — Episódios

Nunca utilizar campo numérico.

Sempre Select.

Lista baseada na temporada selecionada.

---

Ao trocar a temporada:

Atualizar automaticamente os episódios.

---

# Pattern — Finalização Automática

Ao concluir o último episódio disponível:

Status muda automaticamente para:

Finalizado.

---

Se nova temporada for lançada:

Mostrar Badge

"Novo conteúdo disponível"

Sem alterar automaticamente o status.

---

# Pattern — Skeleton

Sempre utilizar Skeleton.

Nunca Spinner em páginas completas.

---

# Pattern — Navegação

Voltar sempre leva exatamente ao ponto anterior.

Nunca reiniciar a tela.

---

# Pattern — Performance

A interface deve responder imediatamente.

Mesmo que os dados ainda estejam carregando.

---

# Pattern — Consistência

Toda ação semelhante deve funcionar exatamente igual.

O usuário aprende apenas uma vez.
