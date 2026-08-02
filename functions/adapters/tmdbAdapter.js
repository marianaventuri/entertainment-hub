/**
 * Adapter para TMDB (Cloud Functions / Node 18)
 */
class TMDBAdapter {
  constructor(apiKey) {
    this.name = 'TMDB';
    this.mediaTypes = ['Filme', 'Série', 'Dorama'];
    this.apiKey = apiKey;
    this.baseURL = 'https://api.themoviedb.org/3';
    this.imgBase = 'https://image.tmdb.org/t/p/w500';
  }

  capabilities() {
    return {
      title: ['Filme', 'Série', 'Dorama'],
      original_title: ['Filme', 'Série', 'Dorama'],
      overview: ['Filme', 'Série', 'Dorama'],
      poster: ['Filme', 'Série', 'Dorama'],
      backdrop: ['Filme', 'Série', 'Dorama'],
      release_date: ['Filme', 'Série', 'Dorama'],
      runtime: ['Filme', 'Série', 'Dorama'],
      genres: ['Filme', 'Série', 'Dorama'],
      imdb_id: ['Filme', 'Série', 'Dorama'],
      collection_id: ['Filme'],
      director: ['Filme'],
      producer: ['Filme', 'Série', 'Dorama']
    };
  }

  async fetch(workId, fields) {
    if (!this.apiKey) throw new Error('TMDB API Key missing');

    let tmdbId = workId;
    let type = 'movie';

    if (isNaN(tmdbId)) {
      const searchRes = await fetch(`${this.baseURL}/search/multi?api_key=${this.apiKey}&query=${encodeURIComponent(workId)}&language=pt-BR`);
      const searchData = await searchRes.json();
      if (!searchData.results || searchData.results.length === 0) return {};
      const first = searchData.results.find(r => r.media_type === 'movie' || r.media_type === 'tv');
      if (!first) return {};
      tmdbId = first.id;
      type = first.media_type;
    }

    const detailsRes = await fetch(`${this.baseURL}/${type}/${tmdbId}?api_key=${this.apiKey}&language=pt-BR&append_to_response=credits`);
    const raw = await detailsRes.json();
    const isMovie = type === 'movie';

    const result = {};
    const now = new Date().toISOString();

    const addField = (field, value, confidence = 5) => {
      if (value !== undefined && value !== null && value !== '') {
        if (fields.includes(field) || fields.length === 0) {
          result[field] = {
            value,
            source: this.name,
            confidence,
            fetchedAt: now
          };
        }
      }
    };

    addField('title', raw.title || raw.name);
    addField('original_title', raw.original_title || raw.original_name);
    addField('overview', raw.overview);
    addField('poster', raw.poster_path ? this.imgBase + raw.poster_path : null);
    addField('backdrop', raw.backdrop_path ? this.imgBase + raw.backdrop_path : null);
    addField('release_date', raw.release_date || raw.first_air_date);
    addField('runtime', isMovie && raw.runtime ? raw.runtime : (!isMovie && raw.episode_run_time && raw.episode_run_time[0] ? raw.episode_run_time[0] : null));
    addField('genres', (raw.genres || []).map(g => g.name).join(', '));
    addField('imdb_id', raw.imdb_id);
    addField('tmdb_id', tmdbId);
    addField('seasons', !isMovie && raw.number_of_seasons ? raw.number_of_seasons : null);
    addField('episodes', !isMovie && raw.number_of_episodes ? raw.number_of_episodes : null);
    addField('studio', (raw.production_companies || []).map(c => c.name).join(', '));
    addField('publisher', !isMovie && raw.networks && raw.networks.length ? raw.networks.map(n => n.name).join(', ') : null);

    if (isMovie && raw.belongs_to_collection) {
      addField('collection_id', raw.belongs_to_collection.id);
    }

    if (isMovie && raw.credits && raw.credits.crew) {
      const dir = raw.credits.crew.find(c => c.job === 'Director');
      if (dir) addField('director', dir.name, 5);
      const prod = raw.credits.crew.find(c => c.job === 'Producer');
      if (prod) addField('producer', prod.name);
    } else if (!isMovie && raw.created_by && raw.created_by.length > 0) {
      addField('creator', raw.created_by.map(c => c.name).join(', '));
    }

    return result;
  }
}

module.exports = TMDBAdapter;
