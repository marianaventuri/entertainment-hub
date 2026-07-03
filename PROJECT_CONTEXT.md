# Minha Biblioteca — Catálogo de Mídias

App monolítico (HTML + CSS + JS) para catalogar filmes, séries, animes, mangás, doramas, jogos e livros.

## Arquitetura

| Arquivo | Função |
|---|---|
| `biblioteca-v2.html` | App completo (~3080 linhas) — HTML+CSS+JS inline (funciona sem servidor) |
| `app.js` + `style.css` | Versão antiga (não usada, index.html redireciona para v2) |
| `index.html` | Redireciona para `biblioteca-v2.html` |

## Status Atual

✅ **Funcionalidades implementadas:**
- CRUD completo com modal (adicionar/editar/excluir/exclusão em lote)
- 7 tipos: Filme, Série, Anime, Mangá, Dorama, Jogo, Livro
- 4 status com adaptação por tipo
- Busca, filtros (tipo, status), ordenação
- Dashboard com stats, status, top 5, gêneros, tipos
- Linha do tempo mensal de obras finalizadas
- Wishlist com check
- 15 conquistas com verificação automática
- Importação CSV (`, ` ou `;`) e colar texto
- Nota emocional (6 dimensões), tags pessoais (20)
- Obras relacionadas (mesmo título em tipos diferentes)
- Favoritos
- Toast notifications
- Responsivo (sidebar + bottom nav mobile)
- Atalhos de teclado (Esc, Ctrl+K)

✅ **Sincronização:**
- Tempo real via Firestore `onSnapshot` (add/remove/alteração)
- Notificação toast ao detectar mudanças remotas
- Echo loop prevenido por comparação de conteúdo (sorted JSON + IDs)

✅ **APIs integradas:**
- Firebase / Firestore (configurado e testado)
- TMDB (filmes, séries, doramas)
- AniList (animes, mangás)
- Open Library (livros)
- RAWG (jogos)

✅ **Resolvido:** Firebase compat SDK substituiu módulos ES — agora funciona abrindo direto (`file://`)
- `firebase.js`, `persistence.js`, `firestore-crud.js` — código inline no HTML, arquivos mantidos como referência
- Firebase Auth inicializado mas não utilizado
- Chaves de API expostas no front-end
- `app.js` + `style.css` (v1) obsoletos — podem ser removidos

## Fluxo de Dados

```
Firestore (collection "media") ← fonte principal (107 docs)
     ↓ (loadCatalog — fallback se falhar)
localStorage (biblioteca_v2) ← cache local + fallback
     ↓ (migrateIfNeeded — apenas se Firestore vazio)
Firestore
```

## Próximas Etapas

- [x] Firebase compat SDK (funciona sem servidor HTTP, abre direto `file://`)
- [x] Migrar dados do localStorage para Firestore (107 obras)
- [x] Salvar novos itens também no Firestore (CRUD completo)
- [x] Editar itens no Firestore
- [x] Excluir itens no Firestore
- [ ] Adicionar autenticação (login Firebase)
- [x] Sincronizar dados entre dispositivos (onSnapshot em tempo real)
- [ ] Limpar arquivos obsoletos (app.js, style.css)
- [ ] Criar README.md com visão geral do projeto
- [ ] Transformar em PWA (service worker, manifest, offline)
