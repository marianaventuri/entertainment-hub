/**
 * Adapter para Google Books (Cloud Functions / Node 18)
 */
class GoogleBooksAdapter {
  constructor(apiKey) {
    this.name = 'Google Books';
    this.mediaTypes = ['Livro'];
    this.apiKey = apiKey;
    this.baseURL = 'https://www.googleapis.com/books/v1/volumes';
  }

  capabilities() {
    return {
      title: ['Livro'],
      subtitle: ['Livro'],
      authors: ['Livro'],
      description: ['Livro'],
      industryIdentifiers: ['Livro'],
      pageCount: ['Livro'],
      categories: ['Livro'],
      publishedDate: ['Livro'],
      publisher: ['Livro'],
      language: ['Livro'],
      imageLinks: ['Livro']
    };
  }

  async fetch(workId, fields) {
    if (!this.apiKey) throw new Error('Google Books API Key missing');

    let googleBooksId = workId;

    if (workId && workId.includes(' ')) {
      const searchRes = await fetch(`${this.baseURL}?q=${encodeURIComponent(workId)}&key=${this.apiKey}&maxResults=1`);
      const searchData = await searchRes.json();
      if (!searchData.items || searchData.items.length === 0) return {};
      googleBooksId = searchData.items[0].id;
    }

    const detailsRes = await fetch(`${this.baseURL}/${googleBooksId}?key=${this.apiKey}`);
    const detailsData = await detailsRes.json();
    const info = detailsData.volumeInfo || {};

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

    addField('title', info.title);
    addField('googlebooks_id', googleBooksId);
    addField('subtitle', info.subtitle);
    if (info.authors) addField('authors', info.authors.join(', '));

    let synopsis = info.description || '';
    if (synopsis) {
      synopsis = synopsis.replace(/<[^>]+>/g, '').trim();
      synopsis = synopsis.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'");
    }
    addField('description', synopsis);

    if (info.industryIdentifiers) {
      const i13 = info.industryIdentifiers.find(i => i.type === 'ISBN_13');
      const i10 = info.industryIdentifiers.find(i => i.type === 'ISBN_10');
      const isbn = (i13 || {}).identifier || (i10 || {}).identifier;
      if (isbn) addField('industryIdentifiers', isbn);
    }

    addField('pageCount', info.pageCount);
    if (info.categories) addField('categories', info.categories.slice(0, 4).join(', '));
    addField('publishedDate', info.publishedDate);
    addField('publisher', info.publisher);
    addField('language', info.language);

    if (info.imageLinks) {
      const cover = (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '').replace(/^http:/, 'https:');
      if (cover) addField('imageLinks', cover);
    }

    return result;
  }
}

module.exports = GoogleBooksAdapter;
