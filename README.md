# Minha Biblioteca

Catálogo pessoal de filmes, séries, animes, mangás, doramas, jogos e livros com autenticação Google, sincronização em tempo real via Firestore e PWA.

→ **https://entertainment-hub-7777a.web.app**

## Funcionalidades

- CRUD completo com 7 tipos de mídia e 4 status
- Home com saudação, "Continue consumindo", estatísticas e atalhos
- Busca, filtros por tipo/status, ordenação
- Dashboard com gráficos, top 5, gêneros
- Linha do tempo mensal de obras finalizadas
- Wishlist
- 15 conquistas com verificação automática
- Obras relacionadas (mesmo título em tipos diferentes)
- Nota emocional (6 dimensões) e tags personalizadas (20)
- Importação CSV
- Favoritos
- Responsivo (desktop sidebar + bottom nav mobile)
- PWA — instalável como app no celular/desktop

## APIs integradas

| API | Tipos |
|---|---|
| TMDB | Filmes, Séries, Doramas |
| AniList | Animes, Mangás |
| Open Library | Livros |
| RAWG | Jogos |

## Tecnologias

- Firebase Auth (Google Sign-In)
- Cloud Firestore (dados por usuário: `users/{uid}/media`)
- Firebase Hosting
- Vanilla JS + CSS (sem frameworks)
- PWA (Service Worker, Manifest)

## Deploy

```bash
# Hosting
firebase deploy --only hosting

# Regras Firestore
firebase deploy --only firestore
```

Push na branch `main` faz deploy automático via GitHub Actions.

## Licença

MIT
