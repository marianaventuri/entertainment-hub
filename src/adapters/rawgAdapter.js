function rawgAdapter(item, detail) {
  const title = item.name || '';
  const year = (item.released || '').slice(0, 4);
  const cover = item.background_image || '';
  const genres = (item.genres || []).map(g => g.name).join(', ');

  let synopsis = '';
  let developers = [];
  let publishers = [];
  let durationMinutes = '';
  let platform = '';
  let readUrl = '';
  let rating = '';
  let esrb = '';

  if (detail) {
    synopsis = detail.description_raw || '';
    developers = (detail.developers || []).map(d => d.name);
    publishers = (detail.publishers || []).map(p => p.name);
    if (detail.playtime) durationMinutes = detail.playtime * 60;
    platform = (detail.platforms || []).map(p => p.platform?.name).filter(Boolean).join(', ');
    readUrl = detail.website || '';
    if (detail.metacritic) rating = Math.round(detail.metacritic / 20);
    else if (detail.rating) rating = Math.round(detail.rating);
    if (detail.esrb_rating?.name) esrb = detail.esrb_rating.name;
  }

  return {
    title, year,
    creator: developers[0] || '',
    studio: '', developer: developers[0] || '', publisher: publishers[0] || '',
    genres, cover, synopsis, durationMinutes, episodes: '', seasons: '', pages: '', chapters: '',
    source: '', anilistStatus: '', rating, esrb, platform, readUrl,
    externalIds: { tmdbId: '', anilistId: '', rawgId: item.id || '', isbn: '' }
  };
}
