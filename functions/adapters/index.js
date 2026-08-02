/**
 * Registro de Adapters (Cloud Functions)
 * As chaves de API são injetadas em runtime via functions/.env (process.env).
 */
const TMDBAdapter = require('./tmdbAdapter');
const AniListAdapter = require('./anilistAdapter');
const RAWGAdapter = require('./rawgAdapter');
const GoogleBooksAdapter = require('./googleBooksAdapter');
const OpenLibraryAdapter = require('./openLibraryAdapter');

class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
    this.weights = new Map();
  }

  register(name, instance, weight = 5) {
    this.adapters.set(name, instance);
    this.weights.set(name, weight);
  }

  getAdapter(name) { return this.adapters.get(name); }
  getWeight(name)  { return this.weights.get(name) || 0; }
  allAdapters()    { return [...this.adapters.entries()]; }
}

const registry = new AdapterRegistry();
registry.register('TMDB',         new TMDBAdapter(process.env.TMDB_KEY || ''), 5);
registry.register('AniList',      new AniListAdapter(),                        5);
registry.register('RAWG',         new RAWGAdapter(process.env.RAWG_KEY || ''), 5);
registry.register('Google Books', new GoogleBooksAdapter(process.env.GOOGLE_BOOKS_KEY || ''), 5);
registry.register('OpenLibrary',  new OpenLibraryAdapter(),                    4);

module.exports = registry;
