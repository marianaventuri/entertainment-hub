/**
 * Adapter para RAWG (Cloud Functions / Node 18)
 */
class RAWGAdapter {
  constructor(apiKey) {
    this.name = 'RAWG';
    this.mediaTypes = ['Jogo'];
    this.apiKey = apiKey;
    this.baseURL = 'https://api.rawg.io/api';
  }

  capabilities() {
    return {
      title: ['Jogo'],
      description: ['Jogo'],
      released: ['Jogo'],
      background_image: ['Jogo'],
      rating: ['Jogo'],
      platforms: ['Jogo'],
      developers: ['Jogo'],
      publishers: ['Jogo'],
      genres: ['Jogo'],
      tags: ['Jogo'],
      esrb_rating: ['Jogo'],
      website: ['Jogo']
    };
  }

  async fetch(workId, fields) {
    if (!this.apiKey) throw new Error('RAWG API Key missing');

    let rawgId = workId;

    if (isNaN(rawgId)) {
      const searchRes = await fetch(`${this.baseURL}/games?key=${this.apiKey}&search=${encodeURIComponent(workId)}&page_size=1`);
      const searchData = await searchRes.json();
      if (!searchData.results || searchData.results.length === 0) return {};
      rawgId = searchData.results[0].id;
    }

    const detailsRes = await fetch(`${this.baseURL}/games/${rawgId}?key=${this.apiKey}`);
    const raw = await detailsRes.json();

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

    addField('title', raw.name);
    addField('description', raw.description_raw || raw.description);
    addField('released', raw.released);
    addField('background_image', raw.background_image);
    addField('rating', raw.rating);
    addField('rawg_id', rawgId);
    addField('website', raw.website);

    if (raw.platforms) {
      addField('platforms', raw.platforms.map(p => p.platform.name).join(', '));
    }
    if (raw.developers) {
      addField('developers', raw.developers.map(d => d.name).join(', '));
    }
    if (raw.publishers) {
      addField('publishers', raw.publishers.map(p => p.name).join(', '));
    }
    if (raw.genres) {
      addField('genres', raw.genres.map(g => g.name).join(', '));
    }
    if (raw.tags) {
      addField('tags', raw.tags.slice(0, 5).map(t => t.name).join(', '));
    }
    if (raw.esrb_rating) {
      addField('esrb_rating', raw.esrb_rating.name);
    }

    return result;
  }
}

module.exports = RAWGAdapter;
