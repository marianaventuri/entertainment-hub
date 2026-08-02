/**
 * Adapter para AniList (Cloud Functions / Node 18)
 */
class AniListAdapter {
  constructor() {
    this.name = 'AniList';
    this.mediaTypes = ['Anime', 'Mangá'];
    this.baseURL = 'https://graphql.anilist.co';
  }

  capabilities() {
    return {
      title: ['Anime', 'Mangá'],
      synonyms: ['Anime', 'Mangá'],
      synopsis: ['Anime', 'Mangá'],
      start_date: ['Anime', 'Mangá'],
      end_date: ['Anime', 'Mangá'],
      episodes: ['Anime'],
      chapters: ['Mangá'],
      volumes: ['Mangá'],
      studios: ['Anime'],
      genres: ['Anime', 'Mangá'],
      rating: ['Anime', 'Mangá'],
      coverImage: ['Anime', 'Mangá'],
      bannerImage: ['Anime', 'Mangá'],
      tags: ['Anime', 'Mangá'],
      status: ['Anime', 'Mangá']
    };
  }

  async fetch(workId, fields) {
    let query, variables;
    const isSearch = isNaN(workId);

    query = `
      query($id: Int, $search: String) {
        Media(id: $id, search: $search, sort: SEARCH_MATCH) {
          id
          title { romaji english native }
          synonyms
          description(asHtml: false)
          startDate { year month day }
          endDate { year month day }
          episodes
          chapters
          volumes
          status
          averageScore
          coverImage { large }
          bannerImage
          genres
          tags { name rank }
          studios { edges { isMain node { name } } }
        }
      }
    `;

    variables = isSearch ? { search: workId } : { id: parseInt(workId) };

    const res = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables })
    });

    const data = await res.json();
    const raw = data && data.data && data.data.Media;
    if (!raw) return {};

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

    const title = raw.title.romaji || raw.title.english || raw.title.native;
    addField('title', title);
    addField('anilist_id', raw.id);
    if (raw.synonyms && raw.synonyms.length > 0) addField('synonyms', raw.synonyms.join(', '));
    addField('synopsis', raw.description);

    if (raw.startDate && raw.startDate.year) addField('start_date', `${raw.startDate.year}-${String(raw.startDate.month || 1).padStart(2, '0')}-${String(raw.startDate.day || 1).padStart(2, '0')}`);
    if (raw.endDate && raw.endDate.year) addField('end_date', `${raw.endDate.year}-${String(raw.endDate.month || 1).padStart(2, '0')}-${String(raw.endDate.day || 1).padStart(2, '0')}`);

    addField('episodes', raw.episodes);
    addField('chapters', raw.chapters);
    addField('volumes', raw.volumes);

    if (raw.studios && raw.studios.edges) {
      const mainStudios = raw.studios.edges.filter(e => e.isMain).map(e => e.node.name);
      if (mainStudios.length > 0) addField('studios', mainStudios.join(', '));
    }

    addField('genres', (raw.genres || []).join(', '));
    if (raw.averageScore) addField('rating', raw.averageScore / 10);

    addField('coverImage', raw.coverImage && raw.coverImage.large);
    addField('bannerImage', raw.bannerImage);

    if (raw.tags && raw.tags.length > 0) {
      addField('tags', raw.tags.slice(0, 5).map(t => t.name).join(', '));
    }

    addField('status', raw.status);

    return result;
  }
}

module.exports = AniListAdapter;
