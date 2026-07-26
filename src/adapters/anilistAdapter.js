function anilistAdapter(m, type) {
  const cleanDesc = (m.description || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\n\n+/g, '\n').trim();

  let director = '';
  let author = '';
  if (m.staff && m.staff.edges) {
    if (type === 'Mangá') {
      const edges = m.staff.edges;
      const storyEdge = edges.find(e => e.role && /story\s*&?\s*art|story|original/i.test(e.role))
                     || edges.find(e => e.role && /art|author/i.test(e.role));
      if (storyEdge) author = storyEdge.node.name.full;
    } else {
      const dirEdge = m.staff.edges.find(e =>
        e.role && /director|creator|story/i.test(e.role));
      if (dirEdge) director = dirEdge.node.name.full;
    }
  }

  let studio = '';
  if (type === 'Anime' && m.studios && m.studios.edges) {
    const mainEdge = m.studios.edges.find(e => e.isMain === true);
    if (mainEdge && mainEdge.node) studio = mainEdge.node.name;
  }

  const genres = translateGenres(m.genres || []);
  const cover = m.coverImage && m.coverImage.large ? m.coverImage.large : '';
  const year = m.startDate && m.startDate.year ? String(m.startDate.year) : '';
  const episodes = m.episodes || '';
  const durationMinutes = m.duration || '';
  const source = m.source ? m.source.replace(/_/g, ' ') : '';
  const anilistStatus = m.status ? m.status.replace(/_/g, ' ') : '';

  return {
    title: m.title?.romaji || m.title?.english || m.title?.native || '',
    year, director, author, studio, developer: '', publisher: '',
    genres, cover, synopsis: cleanDesc, durationMinutes, hoursPlayed: '', episodes, seasons: '',
    pages: '', chapters: m.chapters || '', volumes: m.volumes || '', source, anilistStatus,
    rating: '', esrb: '', platform: '', readUrl: '',
    externalIds: { tmdbId: '', anilistId: m.id, rawgId: '', isbn: '' }
  };
}
