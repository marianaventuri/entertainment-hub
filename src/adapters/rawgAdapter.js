function rawgAdapter(item, detail) {
  const title = item.name || '';
  const year = (item.released || '').slice(0, 4);
  const cover = item.background_image || '';
  const genres = (item.genres || []).map(g => g.name).join(', ');

  let synopsis = '';
  let developers = [];
  let publishers = [];
  let durationMinutes = '';

  if (detail) {
    synopsis = detail.description_raw || '';
    developers = (detail.developers || []).map(d => d.name);
    publishers = (detail.publishers || []).map(p => p.name);
    if (detail.playtime) durationMinutes = detail.playtime * 60;
  }

  return {
    title, year,
    creator: developers[0] || '',
    studio: '', developer: developers[0] || '', publisher: publishers[0] || '',
    genres, cover, synopsis, durationMinutes, episodes: '', seasons: '', pages: '',
    source: '', anilistStatus: '',
    externalIds: { tmdbId: '', anilistId: '', rawgId: item.id || '' }
  };
}
