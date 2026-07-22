function tmdbAdapter(raw, type) {
  const isMovie = type === 'Filme';
  const title = (raw.title || raw.name || '');
  const year = (raw.release_date || raw.first_air_date || '').slice(0,4);
  const genres = (raw.genres || []).map(g => g.name).join(', ');
  const cover = raw.poster_path ? TMDB_IMG + raw.poster_path : '';
  const synopsis = raw.overview || '';
  const durationMinutes = isMovie && raw.runtime ? raw.runtime : (!isMovie && raw.episode_run_time && raw.episode_run_time[0]) ? raw.episode_run_time[0] : '';
  const seasons = !isMovie && raw.number_of_seasons ? raw.number_of_seasons : '';

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

  let episodes = '';
  if (!isMovie && raw.seasons) {
    const firstSeason = raw.seasons
      .filter(s => s.season_number > 0 && s.episode_count > 0)
      .sort((a, b) => a.season_number - b.season_number)[0];
    if (firstSeason) episodes = firstSeason.episode_count;
  }

  return {
    title, year, creator, studio: '', developer: '', publisher: '',
    genres, cover, synopsis, durationMinutes, episodes, seasons, pages: '',
    source: '', anilistStatus: '',
    externalIds: { tmdbId: raw.id, anilistId: '', rawgId: '' }
  };
}
