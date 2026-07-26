function openLibraryAdapter(searchItem, detail) {
  const title = searchItem.title || '';
  const year = searchItem.first_publish_year ? String(searchItem.first_publish_year) : '';
  const author = (searchItem.author_name || [])[0] || '';
  const coverId = searchItem.cover_i;
  const cover = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : '';
  const genres = (searchItem.subject || []).slice(0, 4).join(', ');

  const firstSentence = searchItem.first_sentence;
  const synopsis = firstSentence
    ? (Array.isArray(firstSentence) ? firstSentence[0] : firstSentence)
    : '';

  let pages = '';
  let publisher = '';
  let isbn = '';

  let detailSynopsis = '';
  if (detail) {
    const desc = typeof detail.description === 'object'
      ? (detail.description.value || '')
      : (detail.description || '');
    detailSynopsis = desc || '';
    pages = detail.number_of_pages || '';
    publisher = detail.publishers ? detail.publishers[0] : '';
    isbn = (detail.isbn_13 && detail.isbn_13[0]) || (detail.isbn_10 && detail.isbn_10[0]) || '';
  }

  return {
    title, year, creator: author, studio: '', developer: '', publisher,
    genres, cover, synopsis: detailSynopsis || synopsis,
    durationMinutes: '', episodes: '', seasons: '', pages, chapters: '',
    source: '', anilistStatus: '', rating: '', esrb: '', platform: '', readUrl: '',
    externalIds: { tmdbId: '', anilistId: '', rawgId: '', isbn: '' }
  };
}

async function openLibraryDetailAdapter(detail) {
  let author = '';
  if (detail.authors && detail.authors[0]) {
    const authorKey = detail.authors[0].author?.key || detail.authors[0].key || '';
    if (authorKey) {
      try {
        const resp = await fetch(`https://openlibrary.org${authorKey}.json`);
        if (resp.ok) {
          const aData = await resp.json();
          author = aData.name || '';
        }
      } catch(_) {}
    }
  }

  const desc = typeof detail.description === 'object'
    ? (detail.description.value || '')
    : (detail.description || '');

  let coverUrl = '';
  if (detail.covers && detail.covers[0]) {
    coverUrl = `https://covers.openlibrary.org/b/id/${detail.covers[0]}-L.jpg`;
  }

  return {
    title: detail.title || '',
    year: ((detail.first_publish_date || detail.publish_date || '').match(/\d{4}/) || [])[0] || '',
    creator: author, studio: '', developer: '', publisher: (detail.publishers || [])[0] || '',
    genres: (detail.subjects || []).slice(0,4).join(', '),
    cover: coverUrl, synopsis: desc,
    durationMinutes: '', episodes: '', seasons: '', pages: detail.number_of_pages || '', chapters: '',
    source: '', anilistStatus: '', rating: '', esrb: '', platform: '', readUrl: '',
    externalIds: { tmdbId: '', anilistId: '', rawgId: '', isbn: '' }
  };
}
