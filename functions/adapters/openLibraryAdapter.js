/**
 * Adapter para OpenLibrary (Cloud Functions / Node 18)
 */
class OpenLibraryAdapter {
  constructor() {
    this.name = 'OpenLibrary';
    this.mediaTypes = ['Livro', 'HQ'];
    this.baseURL = 'https://openlibrary.org';
  }

  capabilities() {
    return {
      title: ['Livro', 'HQ'],
      authors: ['Livro', 'HQ'],
      cover: ['Livro', 'HQ'],
      isbn: ['Livro', 'HQ'],
      number_of_pages: ['Livro', 'HQ'],
      publish_date: ['Livro', 'HQ'],
      publishers: ['Livro', 'HQ'],
      subjects: ['Livro', 'HQ'],
      description: ['Livro', 'HQ']
    };
  }

  async fetch(workId, fields) {
    let url;
    let olid = '';

    if (/^OL\d+/.test(workId)) {
      olid = workId;
      url = `${this.baseURL}${workId.startsWith('/') ? '' : '/'}${workId}.json`;
    } else if (/^\d{9,13}$/.test(workId.replace(/-/g, ''))) {
      const isbn = workId.replace(/-/g, '');
      url = `${this.baseURL}/isbn/${isbn}.json`;
    } else {
      const searchRes = await fetch(`${this.baseURL}/search.json?q=${encodeURIComponent(workId)}&limit=1`);
      const searchData = await searchRes.json();
      if (!searchData.docs || searchData.docs.length === 0) return {};
      const doc = searchData.docs[0];
      olid = doc.key || '';
      url = `${this.baseURL}${doc.key}.json`;
    }

    let raw;
    try {
      const detailsRes = await fetch(url);
      if (!detailsRes.ok) return {};
      raw = await detailsRes.json();
    } catch (e) {
      return {};
    }

    const result = {};
    const now = new Date().toISOString();

    const addField = (field, value, confidence = 4) => {
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

    addField('title', raw.title);
    addField('openlibrary_id', olid);

    let synopsis = '';
    if (typeof raw.description === 'string') synopsis = raw.description;
    else if (raw.description && raw.description.value) synopsis = raw.description.value;
    addField('description', synopsis);

    addField('publish_date', raw.publish_date);
    addField('number_of_pages', raw.number_of_pages);

    if (raw.publishers) addField('publishers', raw.publishers.join(', '));
    if (raw.subjects) addField('subjects', raw.subjects.slice(0, 5).join(', '));

    if (raw.authors && raw.authors[0]) {
      const authorKey = raw.authors[0].author && raw.authors[0].author.key ? raw.authors[0].author.key : (raw.authors[0].key || '');
      if (authorKey) {
        try {
          const authorRes = await fetch(`${this.baseURL}${authorKey}.json`);
          if (authorRes.ok) {
            const authorData = await authorRes.json();
            if (authorData.name) addField('authors', authorData.name, 4);
          }
        } catch (_) {}
      }
    }

    if (raw.covers && raw.covers.length > 0) {
      addField('cover', `https://covers.openlibrary.org/b/id/${raw.covers[0]}-L.jpg`);
    }

    if (raw.isbn_13 && raw.isbn_13.length > 0) {
      addField('isbn', raw.isbn_13[0]);
    } else if (raw.isbn_10 && raw.isbn_10.length > 0) {
      addField('isbn', raw.isbn_10[0]);
    }

    return result;
  }
}

module.exports = OpenLibraryAdapter;
