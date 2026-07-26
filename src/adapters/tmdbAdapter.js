function tmdbAdapter(raw, type) {
  const isMovie = type === 'Filme';
  const title = (raw.title || raw.name || '');
  const year = (raw.release_date || raw.first_air_date || '').slice(0,4);
  const genres = (raw.genres || []).map(g => g.name).join(', ');
  const cover = raw.poster_path ? TMDB_IMG + raw.poster_path : '';
  const synopsis = raw.overview || '';
  const durationMinutes = isMovie && raw.runtime ? raw.runtime : (!isMovie && raw.episode_run_time && raw.episode_run_time[0]) ? raw.episode_run_time[0] : '';
  const seasons = !isMovie && raw.number_of_seasons ? raw.number_of_seasons : '';
  const studio = (raw.production_companies || []).map(c => c.name).join(', ') || '';
  const publisher = !isMovie && (raw.networks || []).length ? raw.networks.map(n => n.name).join(', ') : '';

  let creator = '';
  if (isMovie) {
    if (raw.credits && raw.credits.crew) {
      const dir = raw.credits.crew.find(c => c.job === 'Director');
      if (dir) creator = dir.name;
    }
  } else {
    if (raw.created_by && raw.created_by.length > 0) {
      creator = raw.created_by.map(c => c.name).join(', ');
    }
  }

  let episodes = !isMovie && raw.number_of_episodes ? raw.number_of_episodes : '';

  return {
    title, year, creator, studio, developer: '', publisher,
    genres, cover, synopsis, durationMinutes, episodes, seasons, pages: '', chapters: '',
    source: '', anilistStatus: '', rating: '', esrb: '', platform: '', readUrl: '',
    externalIds: { tmdbId: raw.id, anilistId: '', rawgId: '', isbn: '' }
  };
}
