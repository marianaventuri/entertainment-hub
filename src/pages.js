/* ── HOME ── */

function surpriseHome() {
  const available = db.filter(x => x.status !== 'Quero assistir');
  if (!available.length) { toast('Nenhuma obra disponível para sortear.'); return; }
  const item = available[Math.floor(Math.random() * available.length)];
  openDetail(item.id);
}

function renderHome() {
  const c = document.getElementById('homeContent');
  if (!c) { console.error('homeContent não encontrado!'); return; }

  const total = db.length;
  const userName = currentUser?.displayName || 'Mari';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  /* ── Empty state ── */
  if (total === 0) {
    c.innerHTML = `
      <div class="h-empty">
        <div class="h-empty-icon">🎬</div>
        <h2 class="h-empty-title">Sua jornada começa aqui</h2>
        <p class="h-empty-desc">Você ainda não possui nenhuma obra cadastrada.<br>Que tal adicionar a primeira?</p>
        <button class="btn btn-primary h-empty-btn" onclick="openSmartFormModal('add')">Adicionar primeira obra</button>
      </div>`;
    return;
  }

  /* ── Data ── */
  const NOW = Date.now();
  const ONE_MONTH = 30 * 24 * 60 * 60 * 1000;

  const watching = db.filter(x => x.status === 'Assistindo').sort((a, b) => new Date(b.addedAt||0) - new Date(a.addedAt||0));
  const containers = db.filter(x => (x.type === 'Box' || x.type === 'Coleção') && x.status !== 'Finalizado');

  /* ── Para Você Hoje ── */
  let smartHtml = '';

  if (watching.length > 0) {
    const item = watching[0];
    const t = TIPO[item.type] || { icon: 'movie', color: '#555' };
    const isGame = item.type === 'Jogo';
    const isReading = item.type === 'Mangá' || item.type === 'Livro';
    const action = isGame ? 'jogando' : isReading ? 'lendo' : 'assistindo';
    const lastActivity = item.addedAt ? new Date(item.addedAt).getTime() : NOW;
    const isStale = (NOW - lastActivity) > ONE_MONTH;

    smartHtml = `
      <div class="h-smart">
        <div class="h-smart-label">${isStale ? '⏸ Você parou aqui…' : `▶ Continue ${action}`}</div>
        <div class="h-smart-card" onclick="openDetail('${esc(item.id)}')" style="--smart-accent:${t.color}">
          <div class="h-smart-cover">
            ${item.cover
              ? `<img src="${esc(item.cover)}" alt="" loading="lazy">`
              : `<div class="h-smart-cover-fallback"><span class="material-symbols-rounded">${esc(t.icon)}</span></div>`}
          </div>
          <div class="h-smart-body">
            <div class="h-smart-title">${esc(item.title)}</div>
            <div class="h-smart-meta"><span class="material-symbols-rounded">${esc(t.icon)}</span> ${esc(item.type)}${item.year ? ' · ' + item.year : ''}</div>
            ${getProgressLabel(item) ? `<div class="h-smart-progress-badge" style="display:inline-block;margin-top:4px;font-size:.7rem;background:var(--surface2);padding:2px 6px;border-radius:4px;color:var(--text2);border:1px solid var(--border)"><span class="material-symbols-rounded" style="font-size:.8rem;vertical-align:middle;margin-right:2px">schedule</span>${esc(getProgressLabel(item))}</div>` : ''}
            <button class="h-smart-btn" onclick="event.stopPropagation();openDetail('${esc(item.id)}')">▶ ${isStale ? 'Retomar' : 'Continuar'}</button>
          </div>
        </div>
      </div>`;
  } else if (containers.length > 0) {
    const cont = containers[0];
    const t = TIPO[cont.type] || { icon: 'inventory_2', color: '#f59e0b' };
    const cItems = (cont.containerItems || []).map(id => findInDb(id)).filter(Boolean);
    const totalC = cItems.length;
    const doneC = cItems.filter(i => i.status === 'Finalizado').length;
    const pct = totalC ? Math.round(doneC / totalC * 100) : 0;

    smartHtml = `
      <div class="h-smart">
        <div class="h-smart-label">Continue sua coleção</div>
        <div class="h-smart-card" onclick="openBoxView('${cont.id}')" style="--smart-accent:${t.color}">
          <div class="h-smart-cover">
            ${cont.cover
              ? `<img src="${esc(cont.cover)}" alt="" loading="lazy">`
              : `<div class="h-smart-cover-fallback"><span class="material-symbols-rounded">${esc(t.icon)}</span></div>`}
          </div>
          <div class="h-smart-body">
            <div class="h-smart-title">${esc(cont.title)}</div>
            <div class="h-smart-meta"><span class="material-symbols-rounded">${esc(t.icon)}</span> ${esc(cont.type)}</div>
            <div class="h-smart-progress"><div class="h-smart-bar"><div class="h-smart-bar-fill" style="width:${pct}%"></div></div><span>${doneC}/${totalC}</span></div>
            <button class="h-smart-btn" onclick="event.stopPropagation();openBoxView('${cont.id}')">▶ Continuar</button>
          </div>
        </div>
      </div>`;
  } else {
    smartHtml = `
      <div class="h-smart h-smart-idle">
        <p class="h-smart-idle-text">Nada em andamento no momento.</p>
        <div class="h-smart-idle-actions">
          <button class="btn btn-primary" onclick="openSmartFormModal('add')">Adicionar obra</button>
          <button class="btn btn-ghost" onclick="navigate('experiencia')">Explorar recomendações</button>
        </div>
      </div>`;
  }

  /* ── Continue Consumindo ── */
  const continueItems = watching.slice(0, 6);
  const continueContainers = containers.slice(0, Math.max(0, 8 - continueItems.length));
  const allContinue = [...continueItems, ...continueContainers].slice(0, 8);

  const continueHtml = allContinue.length ? `
    <div class="h-section">
      <h2 class="h-section-title">Continue consumindo</h2>
      <div class="h-scroll">
        ${allContinue.map((item) => {
          const t = TIPO[item.type] || { icon: 'movie', color: '#555' };
          const isContainer = item.type === 'Box' || item.type === 'Coleção';

          let progressHtml = '';
          if (isContainer) {
            const cItems = (item.containerItems || []).map(id => findInDb(id)).filter(Boolean);
            const totalC = cItems.length;
            const doneC = cItems.filter(i => i.status === 'Finalizado').length;
            const pct = totalC ? Math.round(doneC / totalC * 100) : 0;
            progressHtml = `<div class="h-scroll-progress"><div class="h-scroll-bar"><div class="h-scroll-bar-fill" style="width:${pct}%"></div></div><span>${doneC}/${totalC}</span></div>`;
          } else {
            const lbl = getProgressLabel(item);
            if (lbl) progressHtml = `<div style="font-size:.65rem;color:var(--text2);margin-top:2px"><span class="material-symbols-rounded" style="font-size:.7rem;vertical-align:middle;margin-right:2px">schedule</span>${esc(lbl)}</div>`;
          }

          const clickAction = isContainer ? `openBoxView('${esc(item.id)}')` : `openDetail('${esc(item.id)}')`;
          return `
            <div class="h-scroll-card" onclick="${clickAction}">
              <div class="h-scroll-card-cover">
                ${item.cover
                  ? `<img src="${esc(item.cover)}" alt="" loading="lazy" onerror="this.outerHTML='<div class=\\'h-scroll-card-fallback\\'><span class=\\'material-symbols-rounded\\'>${esc(t.icon)}</span></div>'">`
                  : `<div class="h-scroll-card-fallback"><span class="material-symbols-rounded">${esc(t.icon)}</span></div>`}
              </div>
              <div class="h-scroll-card-body">
                <div class="h-scroll-card-title">${esc(item.title)}</div>
                <div class="h-scroll-card-type"><span class="material-symbols-rounded">${esc(t.icon)}</span> ${isContainer ? esc(item.type) : esc(displayStatus(item.status, item.type))}</div>
                ${progressHtml}
                <button class="h-scroll-card-btn" onclick="event.stopPropagation();${clickAction}">▶</button>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>` : '';

  /* ── Acessos Rápidos ── */
  const quickLinks = [
    { icon: '', label: 'Dashboard', desc: 'Veja sua evolução.', page: 'dashboard' },
    { icon: '', label: 'Biblioteca', desc: 'Todas as obras.', page: 'biblioteca' },
    { icon: '', label: 'Favoritos', desc: 'Suas obras favoritas.', page: 'favoritos' },
  ];

  c.innerHTML = `
    <div class="h-hero">
      <div>
        <h1 class="h-hero-greeting">${greeting}, <span class="greeting-highlight">${esc(userName)}</span></h1>
        <p class="h-hero-sub">Você possui ${total} obra${total !== 1 ? 's' : ''} cadastrada${total !== 1 ? 's' : ''}.</p>
      </div>
      <div class="h-hero-actions">
        <button class="h-hero-btn" onclick="openSmartFormModal('add')">
          <span class="h-hero-btn-label">Adicionar Obra</span>
        </button>
        <button class="h-hero-btn" onclick="surpriseHome()">
          <span class="h-hero-btn-label">Surpreenda-me</span>
        </button>
      </div>
    </div>

    ${smartHtml}

    ${continueHtml}

    <div class="h-quick">
      ${quickLinks.map(q => `
        <button class="h-quick-card" onclick="navigate('${q.page}')">
          <span class="h-quick-icon">${q.icon}</span>
          <div class="h-quick-body">
            <div class="h-quick-title">${q.label}</div>
            <div class="h-quick-desc">${q.desc}</div>
          </div>
          <span class="h-quick-arrow">↓</span>
        </button>
      `).join('')}
    </div>
  `;
}

/* ── DASHBOARD ── */

function renderDashboard() {
  const total   = db.length;
  const finished = db.filter(x=>x.status==='Finalizado').length;
  const watching = db.filter(x=>x.status==='Assistindo').length;
  const want = db.filter(x=>x.status==='Quero assistir').length;
  const dropped = db.filter(x=>x.status==='Abandonado').length;
  const totalHours = db.reduce((s,x)=>s+(parseFloat(x.hours)||0),0);
  const avgRating = db.filter(x=>x.rating).length
    ? (db.filter(x=>x.rating).reduce((s,x)=>s+x.rating,0)/db.filter(x=>x.rating).length).toFixed(1)
    : '—';
  const favCount = db.filter(x=>x.fav).length;

  const statsGrid = document.getElementById('statsGrid');
  if (!statsGrid) return;
  statsGrid.innerHTML = [
    { val: total,           label:'Total de obras',     icon:'', cls: 'stat-total' },
    { val: finished,        label:'Finalizados',         icon:'', cls: 'stat-finished' },
    { val: watching,        label:'Assistindo agora',    icon:'', cls: 'stat-watching' },
    { val: totalHours,      label:'Horas registradas',   icon:'', suffix:'h', cls: 'stat-hours' },
    { val: avgRating,       label:'Nota média',          icon:'', suffix:'★', raw: true, cls: 'stat-rating' },
    { val: favCount,        label:'Favoritos',           icon:'', cls: 'stat-favs' },
  ].map(s=>{
    const v = s.raw ? s.val : (s.suffix ? s.val + s.suffix : s.val);
    return `<div class="stat-card ${s.cls}" data-icon="${s.icon}">
      <div class="stat-val" data-count="${s.val}" data-suffix="${s.suffix||''}">${v}</div>
      <div class="stat-label">${s.label}</div>
    </div>`;
  }).join('');
  requestAnimationFrame(() => {
    document.querySelectorAll('#statsGrid .stat-val[data-count]').forEach(el => {
      const target = parseFloat(el.dataset.count);
      if (!isNaN(target) && target > 0) animateCount(el, target);
    });
  });

  /* ── Status donut ── */
  const statusData = [
    { name:'Finalizado',    color:'var(--green)',  n: finished },
    { name:'Assistindo',    color:'var(--blue)',   n: watching },
    { name:'Quero assistir',color:'var(--purple)', n: want },
    { name:'Abandonado',    color:'var(--text3)',  n: dropped },
  ];
  const totalWithStatus = statusData.reduce((s, x) => s + x.n, 0) || 1;
  let angleSum = 0;
  const conicParts = statusData.filter(x => x.n > 0).map(x => {
    const pct = x.n / totalWithStatus * 100;
    const start = angleSum;
    angleSum += pct;
    return `${x.color} ${start}% ${angleSum}%`;
  }).join(', ');
  const donutStyle = conicParts ? `background: conic-gradient(${conicParts})` : '';

  const el = id => document.getElementById(id);
  const setHTML = (id, html) => { const e = el(id); if (e) e.innerHTML = html; };

  setHTML('statusList', `
    <div class="donut-wrap">
      <div class="donut-chart" style="${donutStyle}"><div class="donut-hole">${total}</div></div>
      <div class="donut-legend">
        ${statusData.map(s=> s.n > 0 ? `
          <div class="donut-row">
            <div class="donut-dot" style="background:${s.color}"></div>
            <span class="donut-name">${s.name}</span>
            <span class="donut-val">${s.n}</span>
          </div>` : ''
        ).join('')}
      </div>
    </div>`);

  /* ── Top 5 ── */
  const top5 = [...db].filter(x=>x.rating).sort((a,b)=>b.rating-a.rating).slice(0,5);
  setHTML('topList', top5.length
    ? top5.map((item,i)=>`
      <div class="top-item">
        <span class="top-num ${i===0?'gold':''}">${i+1}</span>
        <div class="top-info">
          <div class="top-title"><span class="material-symbols-rounded" style="font-size:1rem;vertical-align:middle">${esc(typeIcon(item.type))}</span> ${esc(item.title)}</div>
          <div class="top-sub">${esc(item.type)} ${item.year?'· '+item.year:''}</div>
        </div>
        <span class="top-stars">${'★'.repeat(item.rating)}</span>
      </div>`).join('')
    : '<div style="color:var(--text3);font-size:0.85rem">Avalie obras para ver o ranking</div>');

  /* ── Gêneros ── */
  const genreMap = {};
  db.forEach(x=>{
    (x.genres||'').split(',').map(g=>g.trim()).filter(Boolean).forEach(g=>{
      genreMap[g] = (genreMap[g]||0)+1;
    });
  });
  const topGenres = Object.entries(genreMap).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const maxG = topGenres[0]?.[1]||1;
  setHTML('genreList', topGenres.length
    ? topGenres.map(([g,n])=>`
      <div class="genre-row">
        <span class="genre-name">${esc(g)}</span>
        <div class="genre-bar-track"><div class="genre-bar-fill" style="width:${n/maxG*100}%"></div></div>
        <span class="genre-count">${n}</span>
      </div>`).join('')
    : '<div style="color:var(--text3);font-size:0.85rem">Adicione gêneros nas suas obras</div>');

  /* ── Por tipo ── */
  const tipoData = Object.entries(TIPO).map(([t,meta])=>({
    name:t, icon:meta.icon, n:db.filter(x=>x.type===t).length
  })).filter(x=>x.n).sort((a,b)=>b.n-a.n);
  const maxT = tipoData[0]?.n||1;
  setHTML('tipoList', tipoData.length
    ? tipoData.map(t=>`
      <div class="genre-row">
        <span class="genre-name"><span class="material-symbols-rounded" style="font-size:1rem;vertical-align:middle">${esc(t.icon)}</span> ${t.name}</span>
        <div class="genre-bar-track"><div class="genre-bar-fill" style="width:${t.n/maxT*100}%"></div></div>
        <span class="genre-count">${t.n}</span>
      </div>`).join('')
    : '<div style="color:var(--text3);font-size:0.85rem">Nenhuma obra ainda</div>');

  /* ── Horas por tipo ── */
  const hoursByType = Object.entries(TIPO).map(([t,meta])=>{
    const items = db.filter(x=>x.type===t);
    const hrs = items.reduce((s,x)=>s+(parseFloat(x.hours)||0), 0);
    return { name: t, icon: meta.icon, hours: hrs, count: items.length };
  }).filter(x=>x.hours > 0).sort((a,b)=>b.hours-a.hours);
  const maxH = hoursByType[0]?.hours || 1;
  setHTML('hoursByTypeList', hoursByType.length
    ? hoursByType.map(t=>`
      <div class="genre-row">
        <span class="genre-name"><span class="material-symbols-rounded" style="font-size:1rem;vertical-align:middle">${esc(t.icon)}</span> ${t.name}</span>
        <div class="genre-bar-track"><div class="genre-bar-fill genre-bar-hours" style="width:${t.hours/maxH*100}%"></div></div>
        <span class="genre-count">${t.hours.toFixed(0)}h</span>
      </div>`).join('')
    : '<div style="color:var(--text3);font-size:0.85rem">Registre horas nas suas obras</div>');

  /* ── Distribuição de notas ── */
  const ratingDist = [1,2,3,4,5].map(r => ({
    rating: r,
    count: db.filter(x=>x.rating===r).length
  }));
  const maxR = Math.max(...ratingDist.map(r=>r.count), 1);
  setHTML('ratingDistList', ratingDist.map(r=>`
    <div class="genre-row">
      <span class="genre-name" style="min-width:50px">${'★'.repeat(r.rating)}</span>
      <div class="genre-bar-track"><div class="genre-bar-fill genre-bar-rating" style="width:${r.count/maxR*100}%;background:${ratingColor(r.rating)}"></div></div>
      <span class="genre-count">${r.count}</span>
    </div>`).join(''));

  /* ── Adições por mês ── */
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d);
  }
  const monthLabels = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const monthlyData = months.map(m => {
    const start = m;
    const end = new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59);
    const count = db.filter(x => {
      const added = x.addedAt ? new Date(x.addedAt) : null;
      return added && added >= start && added <= end;
    }).length;
    return { label: monthLabels[m.getMonth()] + (m.getMonth() === 0 ? '/'+String(m.getFullYear()).slice(2) : ''), count };
  });
  const maxM = Math.max(...monthlyData.map(m=>m.count), 1);
  setHTML('monthlyChart', monthlyData.map((m, i) => `
    <div class="monthly-col">
      <div class="monthly-bar-wrap">
        <div class="monthly-bar" style="height:${m.count/maxM*100}%;animation-delay:${i * 0.08}s"><span class="monthly-bar-val">${m.count}</span></div>
      </div>
      <div class="monthly-label">${m.label}</div>
    </div>`).join(''));
}

function ratingColor(r) {
  return r >= 5 ? '#22c55e' : r >= 4 ? '#84cc16' : r >= 3 ? '#eab308' : r >= 2 ? '#f97316' : '#ef4444';
}

/* ── TIMELINE ── */

function relativeTime(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  if (diffSec < 60) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffHour < 24) return `há ${diffHour}h`;
  if (diffDay === 1) return 'ontem';
  if (diffDay < 7) return `há ${diffDay} dias`;
  if (diffDay < 30) return `há ${Math.floor(diffDay / 7)} sem`;
  if (diffMonth < 12) return `há ${diffMonth} mes${diffMonth > 1 ? 'es' : ''}`;
  return `há ${Math.floor(diffMonth / 12)} ano${Math.floor(diffMonth / 12) > 1 ? 's' : ''}`;
}

function timelineItem(item) {
  const t = TIPO[item.type] || { icon: 'movie', color: '#555' };
  const coverHtml = item.cover
    ? `<img class="tl-work-cover" src="${esc(item.cover)}" alt="" onerror="this.outerHTML='<div class=\\'tl-work-cover-placeholder\\'><span class=\\'material-symbols-rounded\\'>${esc(t.icon)}</span></div>'">`
    : `<div class="tl-work-cover-placeholder"><span class="material-symbols-rounded">${esc(t.icon)}</span></div>`;
  const ratingHtml = item.rating ? `<span class="tl-work-stars">${'★'.repeat(item.rating)}</span>` : '';
  const relTime = item.finishedAt ? relativeTime(item.finishedAt) : '';
  
  return `<div class="tl-work" onclick="openDetail('${esc(item.id)}')" style="--type-color: ${t.color}">
    <div class="tl-work-dot" style="background:${t.color}; box-shadow: 0 0 8px ${t.color}80"></div>
    ${coverHtml}
    <div class="tl-work-info">
      <div class="tl-work-title">${esc(item.title)}</div>
      <div class="tl-work-meta">
        <span class="tl-work-type"><span class="material-symbols-rounded" style="font-size:1rem;vertical-align:middle">${esc(t.icon)}</span> ${esc(item.type)}</span>
        ${item.year ? `· <span>📅 ${item.year}</span>` : ''}
      </div>
    </div>
    ${ratingHtml}
    ${relTime ? `<span class="tl-work-date-relative">${relTime}</span>` : ''}
  </div>`;
}

function renderTimeline() {
  const finished = db.filter(x => x.status === 'Finalizado' && x.finishedAt);
  const tl = document.getElementById('timelineEl');
  const empty = document.getElementById('timelineEmpty');

  if (!finished.length) { tl.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const groups = { today: [], yesterday: [], thisMonth: [], older: {} };

  finished.sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));

  finished.forEach(item => {
    const d = new Date(item.finishedAt);
    const itemDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    if (itemDay.getTime() === today.getTime()) {
      groups.today.push(item);
    } else if (itemDay.getTime() === yesterday.getTime()) {
      groups.yesterday.push(item);
    } else if (d >= thisMonthStart) {
      groups.thisMonth.push(item);
    } else {
      const key = d.getFullYear() + '-' + String(d.getMonth()).padStart(2, '0');
      if (!groups.older[key]) groups.older[key] = [];
      groups.older[key].push(item);
    }
  });

  const olderKeys = Object.keys(groups.older).sort((a, b) => b.localeCompare(a));

  let html = '';
  if (groups.today.length) {
    html += '<div class="tl-group"><div class="tl-group-title">Hoje</div>' +
      groups.today.map(timelineItem).join('') + '</div>';
  }
  if (groups.yesterday.length) {
    html += '<div class="tl-group"><div class="tl-group-title">Ontem</div>' +
      groups.yesterday.map(timelineItem).join('') + '</div>';
  }
  if (groups.thisMonth.length) {
    html += '<div class="tl-group"><div class="tl-group-title">Este mês</div>' +
      groups.thisMonth.map(timelineItem).join('') + '</div>';
  }
  olderKeys.forEach(key => {
    const [y, m] = key.split('-').map(Number);
    const date = new Date(y, m);
    const monthName = date.toLocaleString('pt-BR', { month: 'long' });
    html += '<div class="tl-group"><div class="tl-group-title">' + monthName + ' ' + y + '</div>' +
      groups.older[key].map(timelineItem).join('') + '</div>';
  });

  tl.innerHTML = html;
}

/* ── CONQUISTAS ── */

function checkAchievements() {
  const prev = load('biblioteca_achievements', []);
  const prevDates = load('biblioteca_achievements_dates', {});
  const unlocked = [];
  ACHIEVEMENTS.forEach(a=>{
    if (!prev.includes(a.id) && a.check()) {
      unlocked.push(a.id);
      if (!prevDates[a.id]) prevDates[a.id] = new Date().toISOString();
      setTimeout(()=>toast(`🏆 Conquista desbloqueada: ${a.name}`, '🏆'), 600);
    }
  });
  if (unlocked.length) {
    localStorage.setItem('biblioteca_achievements', JSON.stringify([...prev,...unlocked]));
    localStorage.setItem('biblioteca_achievements_dates', JSON.stringify(prevDates));
  }
}

function getAchievementProgress(a) {
  const total = db.length;
  const done = db.filter(x => x.status === 'Finalizado').length;
  const anime = db.filter(x => x.type === 'Anime').length;
  const fav = db.filter(x => x.fav).length;
  const hours = db.reduce((s,x) => s + (parseFloat(x.hours)||0), 0);
  const opinions = db.filter(x => x.opinion && x.opinion.length > 10).length;
  const tagsUsed = db.filter(x => x.tags && x.tags.length > 0).length;
  const wishCount = wishdb.length;

  const thresholds = {
    ten: [total, 10], fifty: [total, 50],
    ten_done: [done, 10], fifty_done: [done, 50],
    anime_5: [anime, 5], anime_20: [anime, 20],
    fav_5: [fav, 5],
    hours100: [hours, 100],
    opinion: [opinions, 5],
    wish10: [wishCount, 10],
    tags: [tagsUsed, 5],
  };
  const t = thresholds[a.id];
  if (t && t[0] < t[1]) return { cur: t[0], max: t[1], pct: Math.round(t[0]/t[1]*100) };
  return null;
}

function renderConquistas() {
  const unlocked = load('biblioteca_achievements', []);
  const dates = load('biblioteca_achievements_dates', {});
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;
  const sub  = document.getElementById('achieveSubtitle');
  if (sub) sub.textContent = `${unlocked.length} de ${ACHIEVEMENTS.length} desbloqueadas`;

  grid.innerHTML = ACHIEVEMENTS.map(a=>{
    const done = unlocked.includes(a.id) || a.check();
    const progress = !done ? getAchievementProgress(a) : null;
    const unlockDate = done && dates[a.id] ? new Date(dates[a.id]).toLocaleDateString('pt-BR') : null;
    return `<div class="achievement ${done?'unlocked':''}">
      ${done?'<span class="achievement-badge">✓</span>':''}
      <span class="achievement-icon">${a.icon}</span>
      <div class="achievement-name">${a.name}</div>
      <div class="achievement-desc">${a.desc}</div>
      ${progress ? `
        <div class="achievement-progress">
          <div class="achievement-progress-bar"><div class="achievement-progress-fill" style="width:${progress.pct}%"></div></div>
          <span>${progress.cur}/${progress.max}</span>
        </div>` : ''}
      ${unlockDate ? `<div class="achievement-unlock-date">🗓️ ${unlockDate}</div>` : ''}
    </div>`;
  }).join('');
}

/* ── CONFIG (Package 010) ── */

function renderConfig() {
  const configContent = document.getElementById('configContent');
  if (!configContent) return;
  const user = auth.currentUser;

  /* ── Helper to build accordion sections ── */
  function section(id, title, icon, body, open=false) {
    return `<div class="cfg-section">
      <button class="cfg-section-header ${open?'open':''}" onclick="this.classList.toggle('open');document.getElementById('${id}').classList.toggle('hidden')">
        <span class="cfg-section-title"><span class="material-symbols-rounded" style="font-size:1.15rem">${icon}</span> ${title}</span>
        <span class="material-symbols-rounded cfg-chevron">expand_more</span>
      </button>
      <div class="cfg-section-body ${open?'':'hidden'}" id="${id}">${body}</div>
    </div>`;
  }

  function toggleRow(label, desc, id, checked, onChange) {
    return `<div class="cfg-row">
      <div class="cfg-row-info"><div class="cfg-row-label">${label}</div>${desc ? `<div class="cfg-row-desc">${desc}</div>` : ''}</div>
      <label class="cfg-toggle"><input type="checkbox" id="${id}" ${checked?'checked':''} onchange="${onChange}"><span class="cfg-toggle-slider"></span></label>
    </div>`;
  }

  function selectRow(label, id, value, options, onChange) {
    return `<div class="cfg-row">
      <div class="cfg-row-label">${label}</div>
      <select class="cfg-select" id="${id}" onchange="${onChange}">${options.map(o => `<option value="${o[0]}" ${value===o[0]?'selected':''}>${o[1]}</option>`).join('')}</select>
    </div>`;
  }

  const userName = user ? (user.displayName || 'Usuário') : 'Visitante';
  const userEmail = user ? (user.email || '') : 'Não logado';
  const userInitial = (user ? (user.displayName || user.email || 'U') : 'U').charAt(0).toUpperCase();
  const userPhoto = user ? user.photoURL : '';

  /* ── 1. APARÊNCIA ── */
  const themeOptions = [['system','Sistema'], ['light','Claro'], ['dark','Escuro']];
  const scaleOptions = [[90,'Pequena'],[100,'Normal'],[110,'Grande'],[120,'Extra grande']];
  const densityOptions = [['compact','Compacta'],['normal','Normal']];
  const apeBody = `
    ${selectRow('Tema', 'cfgTheme', settingsTheme, themeOptions, 'saveCfgTheme(this.value)')}
    ${selectRow('Escala', 'cfgScale', settingsScale, scaleOptions, 'saveCfgScale(this.value)')}
    ${selectRow('Densidade', 'cfgDensity', settingsDensity, densityOptions, 'saveCfgDensity(this.value)')}
  `;

  /* ── 2. CONTA ── */
  const contaBody = `
    <div class="cfg-user">
      <div class="cfg-user-avatar">${userPhoto ? `<img src="${esc(userPhoto)}" alt="">` : esc(userInitial)}</div>
      <div class="cfg-user-info">
        <div class="cfg-user-name">${esc(userName)}</div>
        <div class="cfg-user-email">${esc(userEmail)}</div>
      </div>
    </div>
    <button class="cfg-btn cfg-btn-danger" onclick="signOutUser()">
      <span class="material-symbols-rounded" style="font-size:1.15rem">logout</span> Sair da conta
    </button>
    <button class="cfg-btn cfg-btn-danger" onclick="cfgDeleteAccount()" style="margin-top:4px">
      <span class="material-symbols-rounded" style="font-size:1.15rem">delete_forever</span> Excluir conta e dados
    </button>
  `;

  /* ── 3. BIBLIOTECA ── */
  const itemsOptions = [[0,'Todas'],[20,'20'],[40,'40'],[60,'60'],[100,'100']];
  const layoutOptions = [['grid','Grid'],['list','Lista'],['compact','Compacto']];
  const bibBody = `
    ${selectRow('Itens por página', 'cfgItemsPage', settingsItemsPerPage, itemsOptions, 'saveCfgItemsPage(this.value)')}
    ${selectRow('Layout padrão', 'cfgLayout', settingsLayout, layoutOptions, 'saveCfgLayout(this.value)')}
    ${toggleRow('Animações', 'Ativar/desativar animações de cards e transições', 'cfgAnimations', settingsAnimations, 'saveCfgAnimations(this.checked)')}
    ${toggleRow('Capas', 'Mostrar capas dos itens nos cards', 'cfgCovers', settingsCovers, 'saveCfgCovers(this.checked)')}
  `;

  /* ── 4. APIs ── */
  const apiStatus = {
    tmdb:   { key: TMDB_KEY,    label: 'TMDB (Filmes/Séries)' },
    rawg:   { key: RAWG_KEY,    label: 'RAWG (Jogos)' },
    anilist:{ key: '—',         label: 'AniList (Animes/Mangás)' },
    openlib:{ key: '—',         label: 'OpenLibrary (Livros)' },
  };
  const apiBody = `
    <div class="cfg-row cfg-row-desc-only">As APIs abaixo são usadas para buscar dados automaticamente ao adicionar obras.</div>
    ${Object.entries(apiStatus).map(([k, v]) => `
      <div class="cfg-row cfg-api-row">
        <div class="cfg-row-info">
          <div class="cfg-row-label">${esc(v.label)}</div>
          <div class="cfg-row-desc" style="font-family:monospace;font-size:0.7rem;word-break:break-all">${esc(v.key)}</div>
        </div>
        <span class="cfg-api-badge ${v.key && v.key !== '—' ? 'cfg-api-ok' : 'cfg-api-warn'}">
          ${v.key && v.key !== '—' ? '✓ Ativa' : '— Chave pública'}
        </span>
      </div>
    `).join('')}
    <div class="cfg-row" style="margin-top:8px">
      <button class="cfg-btn cfg-btn-sm" onclick="cfgTestApis()"><span class="material-symbols-rounded" style="font-size:1rem">refresh</span> Testar conexão</button>
    </div>
  `;

  /* ── 5. BACKUP ── */
  const backupBody = `
    <div class="cfg-row cfg-row-desc-only">Exporte ou importe seus dados para backup ou migração entre dispositivos.</div>
    <button class="cfg-btn" onclick="cfgExportData()">
      <span class="material-symbols-rounded" style="font-size:1.15rem">download</span> Exportar dados (JSON)
    </button>
    <button class="cfg-btn" onclick="cfgImportData()" style="margin-top:4px">
      <span class="material-symbols-rounded" style="font-size:1.15rem">upload</span> Importar dados (JSON)
    </button>
    <button class="cfg-btn" onclick="openImportModal()" style="margin-top:4px">
      <span class="material-symbols-rounded" style="font-size:1.15rem">file_present</span> Importar CSV / colar lista
    </button>
    <input type="file" id="cfgImportFile" accept=".json" style="display:none" onchange="cfgHandleImportFile(event)"/>
    <div class="cfg-row" style="margin-top:12px;border-top:1px solid var(--border);padding-top:12px">
      <div class="cfg-row-info">
        <div class="cfg-row-label">Sincronização</div>
        <div class="cfg-row-desc">Os dados são sincronizados automaticamente com o Firebase quando você está logado.</div>
      </div>
      <span class="cfg-sync-badge" id="cfgSyncBadge">${navigator.onLine ? '🟢 Online' : '🔴 Offline'}</span>
    </div>
  `;

  /* ── 6. AVANÇADO ── */
  const avancBody = `
    <button class="cfg-btn cfg-btn-danger" onclick="cfgClearCache()">
      <span class="material-symbols-rounded" style="font-size:1.15rem">cleaning_services</span> Limpar cache local
    </button>
    <button class="cfg-btn cfg-btn-danger" onclick="cfgResetData()" style="margin-top:4px">
      <span class="material-symbols-rounded" style="font-size:1.15rem">restart_alt</span> Redefinir todos os dados
    </button>
    <div class="cfg-row" style="margin-top:12px"><div class="cfg-row-label" style="color:var(--text3);font-size:var(--font-xs)">Os dados no servidor (Firebase) não são afetados por estas ações.</div></div>
  `;

  /* ── 7. SOBRE ── */
  const sobreBody = `
    <div class="cfg-about">
      <div class="cfg-about-icon">📖</div>
      <div class="cfg-about-name">Indexa</div>
      <div class="cfg-about-version">Versão 3.0</div>
      <div class="cfg-about-desc">Sua biblioteca. Sua jornada.</div>
      <p class="cfg-about-text">
        Uma biblioteca pessoal para reunir toda a sua jornada de entretenimento em um único lugar —
        filmes, séries, animes, mangás, doramas, livros, HQs e jogos.
        Registre progresso e avaliações, acompanhe metas e estatísticas, e retome exatamente de onde parou.
      </p>
      <div class="cfg-about-links">
        <a href="#" onclick="event.preventDefault();toast('📖 Indexa — código aberto')">Licença MIT</a>
        <span class="cfg-about-sep">·</span>
        <a href="#" onclick="event.preventDefault();toast('✨ Feito com carinho')">Créditos</a>
      </div>
    </div>
  `;

  configContent.innerHTML = `
    <div class="cfg-container">
      ${section('secApe', 'Aparência', 'palette', apeBody, true)}
      ${section('secConta', 'Conta', 'person', contaBody)}
      ${section('secBiblio', 'Biblioteca', 'library_books', bibBody)}
      ${section('secApis', 'APIs', 'api', apiBody)}
      ${section('secBackup', 'Backup', 'backup', backupBody)}
      ${section('secAvanc', 'Avançado', 'tune', avancBody)}
      ${section('secSobre', 'Sobre', 'info', sobreBody)}
    </div>
  `;

  applyCfgScale();
}

/* ── Config Persistence Helpers ── */

function openCfgSection(id) {
  const wasConfig = currentPage === 'config';
  if (!wasConfig) navigate('config');
  setTimeout(() => {
    const sec = document.getElementById(id);
    if (!sec) return;
    const header = sec.previousElementSibling;
    if (header && header.classList.contains('cfg-section-header') && !header.classList.contains('open')) {
      header.classList.add('open');
      sec.classList.remove('hidden');
    }
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const wrap = sec.closest('.cfg-section');
    if (wrap) {
      wrap.classList.remove('cfg-highlight');
      void wrap.offsetWidth;
      wrap.classList.add('cfg-highlight');
      setTimeout(() => wrap.classList.remove('cfg-highlight'), 1600);
    }
  }, wasConfig ? 0 : 400);
}

function toggleLightMode() {
  const modes = ['system', 'light', 'dark'];
  const idx = modes.indexOf(settingsTheme);
  settingsTheme = modes[(idx + 1) % modes.length];
  saveCfg();
  applyTheme();
  renderConfig();
  renderProfile();
}

function saveCfgTheme(val) { settingsTheme = val; saveCfg(); applyTheme(); renderConfig(); renderProfile(); }
function saveCfgScale(val) { settingsScale = parseInt(val); saveCfg(); applyCfgScale(); renderConfig(); }
function saveCfgDensity(val) { settingsDensity = val; saveCfg(); document.body.classList.toggle('cfg-density-compact', val==='compact'); renderConfig(); }
function saveCfgLayout(val) { settingsLayout = val; saveCfg(); renderConfig(); }
function saveCfgAnimations(val) { settingsAnimations = val; saveCfg(); document.body.classList.toggle('cfg-no-animations', !val); renderConfig(); }
function saveCfgCovers(val) { settingsCovers = val; saveCfg(); renderConfig(); }
function saveCfgItemsPage(val) { settingsItemsPerPage = parseInt(val); saveCfg(); renderConfig(); }

function saveCfg() {
  ['settingsTheme','settingsScale','settingsDensity','settingsLayout','settingsAnimations','settingsCovers','settingsItemsPerPage']
    .forEach(k => { try { localStorage.setItem('indexa_' + k, JSON.stringify(eval(k))); } catch(_) {} });
}

function applyCfgScale() {
  document.documentElement.style.fontSize = (settingsScale / 100) * 16 + 'px';
}

/* ── Config Actions ── */

function cfgExportData() {
  const data = { exportedAt: new Date().toISOString(), works: db, wishlist: wishdb };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `indexa_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('✅ Dados exportados!', '✅');
}

function cfgImportData() {
  document.getElementById('cfgImportFile').click();
}

function cfgHandleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.works || !Array.isArray(data.works)) { toast('❌ Arquivo inválido', '❌'); return; }
      if (!confirm(`Importar ${data.works.length} obras? Isso substituirá seus dados locais.`)) return;
      db = data.works.map(normalizeItem);
      wishdb = data.wishlist || [];
      save();
      toast(`✅ Importado ${db.length} obras!`, '✅');
      renderCatalogo();
      renderHome();
      navigate('biblioteca');
    } catch(err) { toast('❌ Erro ao ler arquivo: ' + err.message, '❌'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function cfgDeleteAccount() {
  if (!auth.currentUser) { toast('⚠️ Nenhuma conta logada', '⚠️'); return; }
  if (!confirm('Tem certeza? Esta ação é irreversível. Todos os seus dados serão perdidos.')) return;
  if (!confirm('Digite seu email para confirmar:\n' + auth.currentUser.email)) return;
  const col = getMediaCollection();
  const batch = firebase.firestore().batch();
  db.forEach(item => { const ref = col.doc(String(item.id)); batch.delete(ref); });
  batch.commit().then(() => {
    localStorage.clear();
    db = []; wishdb = [];
    auth.currentUser.delete().catch(() => {});
    toast('🗑️ Dados excluídos', '🗑️');
  }).catch(err => toast('❌ Erro: ' + err.message, '❌'));
}

function cfgClearCache() {
  const keys = ['biblioteca_searchHistory','biblioteca_savedFilters','biblioteca_achievements','biblioteca_achievements_dates','biblioteca_jornada_suggest','biblioteca_onboarding','indexa_searchHistory','indexa_profileGoals','indexa_profilePrefs'];
  keys.forEach(k => { try { localStorage.removeItem(k); } catch(_) {} });
  toast('🧹 Cache limpo!', '🧹');
}

function cfgResetData() {
  if (!confirm('Tem certeza? Todos os dados locais serão perdidos.')) return;
  if (!confirm('Esta ação limpa todo o catálogo local. Os dados no servidor permanecem.')) return;
  try { localStorage.removeItem('biblioteca_v2'); localStorage.removeItem('biblioteca_wishlist'); } catch(_) {}
  db = []; wishdb = [];
  save();
  renderCatalogo();
  renderHome();
  navigate('biblioteca');
  toast('🗑️ Dados redefinidos!', '🗑️');
}

function cfgTestApis() {
  const tests = [
    { name: 'TMDB', url: `https://api.themoviedb.org/3/configuration?api_key=${TMDB_KEY}` },
    { name: 'RAWG', url: `https://api.rawg.io/api/platforms?key=${RAWG_KEY}` },
  ];
  let results = [];
  Promise.all(tests.map(t =>
    fetch(t.url).then(r => ({ name: t.name, ok: r.ok })).catch(() => ({ name: t.name, ok: false }))
  )).then(res => {
    const allOk = res.every(r => r.ok);
    res.forEach(r => results.push(`${r.ok ? '✅' : '❌'} ${r.name}`));
    toast(results.join(' · '), allOk ? '✅' : '⚠️');
  });
}

/* ── EXPERIÊNCIA ── */

function renderExperiencia() {
  const c = document.getElementById('experienciaContent');
  if (!c) return;

  const allGenres = [...new Set(
    db.flatMap(x => (x.genres||'').split(',').map(g => g.trim()).filter(Boolean))
  )].sort();

  const watching = db.filter(x => x.status === 'Assistindo');

  c.innerHTML = `
    <div class="exp-section">
      <div class="exp-section-title">O que fazer hoje?</div>
      <p class="exp-section-desc">Filtre obras pelo tempo disponível, gênero e tipo.</p>

      <div class="exp-filters">
        <div class="exp-filter-group">
          <label class="exp-filter-label">Quanto tempo tenho?</label>
          <div class="exp-chip-group" id="expTimeChips">
            ${['30min','1h','2h','3h+','Tanto faz'].map((v,i) =>
              `<button class="exp-chip ${i===4?'active':''}" data-value="${v}" onclick="selectExpTime('${v}')">${v}</button>`
            ).join('')}
          </div>
        </div>

        <div class="exp-filter-group">
          <label class="exp-filter-label">Gênero</label>
          <select class="exp-select" id="expGenre">
            <option value="">Todos</option>
            ${allGenres.map(g => `<option value="${esc(g)}">${esc(g)}</option>`).join('')}
          </select>
        </div>

        <div class="exp-filter-group">
          <label class="exp-filter-label">Tipo</label>
          <select class="exp-select" id="expType">
            <option value="">Todos</option>
            ${Object.keys(TIPO).map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>

        <button class="btn btn-primary exp-suggest-btn" onclick="suggestWorks()">Sugerir</button>
      </div>

      <div id="expResults" class="exp-results hidden"></div>
    </div>

    <div class="exp-section">
      <div class="exp-section-title">Me surpreenda</div>
      <p class="exp-section-desc">Escolha aleatória do catálogo.</p>
      <button class="btn btn-primary" onclick="surpriseMe()">Sortear</button>
      <div id="expSurprise" class="exp-surprise hidden"></div>
    </div>

    <div class="exp-section">
      <div class="exp-section-title">Continue consumindo</div>
      <p class="exp-section-desc">${watching.length} obra(s) em andamento.</p>
      <div id="expWatching" class="exp-watching-grid">
        ${watching.length
          ? watching.map((item, i) => {
              const t = TIPO[item.type]||{icon:'movie',color:'#555'};
               const coverEl = item.cover
                ? `<img src="${esc(item.cover)}" alt="" loading="lazy" onerror="this.outerHTML='<div class=\\'card-placeholder skeleton\\' style=\\'gap:4px\\'><span class=\\'material-symbols-rounded type-icon\\' style=\\'font-size:1.8rem\\'>${esc(t.icon)}</span></div>'" style="opacity:0" onload="this.style.opacity=1">`
                : `<div class="card-placeholder skeleton" style="gap:4px"><span class="material-symbols-rounded type-icon" style="font-size:1.8rem">${esc(t.icon)}</span></div>`;
              const ratingStars = item.rating ? `<div class="card-info-rating">${'★'.repeat(item.rating)}</div>` : '';
              return `
                <div class="card" data-type="${esc(item.type)}" style="--type-color: ${t.color}; animation:cardEnter .35s ease both;animation-delay:${Math.min(i * 60, 400)}ms" onclick="openDetail('${esc(item.id)}')">
                  <div class="card-poster">
                    ${coverEl}
                    <div class="card-overlay">
                      <div class="card-info">
                        <div class="card-info-title">${esc(item.title)}</div>
                        ${ratingStars}
                      </div>
                    </div>
                  </div>
                </div>`;
            }).join('')
          : '<div class="exp-empty">Nenhuma obra em andamento.</div>'
        }
      </div>
    </div>
  `;
}

function selectExpTime(val) {
  expTime = val;
  document.querySelectorAll('#expTimeChips .exp-chip').forEach(b => b.classList.toggle('active', b.dataset.value === val));
}

function suggestWorks() {
  const genreEl = document.getElementById('expGenre');
  const typeEl = document.getElementById('expType');
  const results = document.getElementById('expResults');
  if (!genreEl || !typeEl || !results) return;
  const genre = genreEl.value.toLowerCase();
  const type = typeEl.value;

  let filtered = [...db];

  if (expTime !== 'Tanto faz') {
    const maxHours = expTime === '30min' ? 0.5 : expTime === '1h' ? 1 : expTime === '2h' ? 2 : Infinity;
    if (maxHours < Infinity) {
      filtered = filtered.filter(x => parseFloat(x.hours) > 0 && parseFloat(x.hours) <= maxHours);
    } else {
      filtered = filtered.filter(x => parseFloat(x.hours) >= 3 || !x.hours);
    }
  }

  if (genre) {
    filtered = filtered.filter(x => (x.genres||'').toLowerCase().includes(genre));
  }

  if (type) {
    filtered = filtered.filter(x => x.type === type);
  }

  const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 12);

  if (!shuffled.length) {
    results.innerHTML = '<div class="exp-empty">Nenhuma obra encontrada com esses filtros. Tente outros!</div>';
    results.classList.remove('hidden');
    return;
  }

  results.innerHTML = `<div class="exp-results-grid">
    ${shuffled.map((item, i) => {
      const t = TIPO[item.type]||{icon:'movie',color:'#555'};
      const coverEl = item.cover
        ? `<img src="${esc(item.cover)}" alt="" loading="lazy" onerror="this.outerHTML='<div class=\\'card-placeholder skeleton\\' style=\\'gap:4px\\'><span class=\\'material-symbols-rounded type-icon\\' style=\\'font-size:1.8rem\\'>${esc(t.icon)}</span></div>'" style="opacity:0" onload="this.style.opacity=1">`
        : `<div class="card-placeholder skeleton" style="gap:4px"><span class="material-symbols-rounded type-icon" style="font-size:1.8rem">${esc(t.icon)}</span></div>`;
      const ratingStars = item.rating ? `<div class="card-info-rating">${'★'.repeat(item.rating)}</div>` : '';
      return `
        <div class="card" data-type="${esc(item.type)}" style="--type-color: ${t.color}; animation:cardEnter .35s ease both;animation-delay:${Math.min(i * 60, 400)}ms" onclick="openDetail('${esc(item.id)}')">
          <div class="card-poster">
            ${coverEl}
            <div class="card-overlay">
              <div class="card-info">
                <div class="card-info-title">${esc(item.title)}</div>
                ${ratingStars}
              </div>
            </div>
          </div>
        </div>`;
    }).join('')}
  </div>`;
  results.classList.remove('hidden');
}

function surpriseMe() {
  const el = document.getElementById('expSurprise');
  const available = db.filter(x => x.status !== 'Quero assistir');
  if (!available.length) {
    el.innerHTML = '<div class="exp-empty">Nenhuma obra disponível para sortear.</div>';
    el.classList.remove('hidden');
    return;
  }
  const item = available[Math.floor(Math.random() * available.length)];
  const t = TIPO[item.type]||{icon:'movie',color:'#555'};
  const coverEl = item.cover
    ? `<img src="${esc(item.cover)}" alt="" loading="lazy" onerror="this.outerHTML='<div class=\\'card-placeholder\\' style=\\'font-size:2rem\\'><span class=\\'material-symbols-rounded type-icon\\'>${esc(t.icon)}</span></div>'">`
    : `<div class="card-placeholder" style="font-size:2rem"><span class="material-symbols-rounded type-icon">${esc(t.icon)}</span></div>`;
  const genresHtml = (item.genres||'').split(',').filter(Boolean).map(g =>
    `<span class="detail-badge">${esc(g.trim())}</span>`
  ).join('');

  el.innerHTML = `
    <div class="exp-surprise-card" onclick="openDetail('${esc(item.id)}')">
      <div class="exp-surprise-poster">${coverEl}</div>
      <div class="exp-surprise-info">
        <div class="exp-surprise-type" style="color:${t.color}"><span class="material-symbols-rounded" style="font-size:1.2rem;vertical-align:middle">${esc(t.icon)}</span> ${item.type}</div>
        <div class="exp-surprise-title">${esc(item.title)}</div>
        ${item.rating ? `<div class="exp-surprise-rating">${'★'.repeat(item.rating)}</div>` : ''}
        <div class="exp-surprise-genres">${genresHtml}</div>
        ${item.opinion ? `<div class="exp-surprise-opinion">${esc(item.opinion)}</div>` : ''}
      </div>
    </div>`;
  el.classList.remove('hidden');
}

/* ── COLEÇÕES ── */

function renderColecoes() {
  const c = document.getElementById('colecoesContent');
  if (!c) return;

  const containers = db.filter(x => x.type === 'Box' || x.type === 'Coleção');

  if (!containers.length) {
    c.innerHTML = `
      <div class="h-empty">
        <div class="h-empty-icon">📚</div>
        <h2 class="h-empty-title">Nenhuma coleção ainda</h2>
        <p class="h-empty-desc">Crie uma Box ou Coleção para agrupar suas obras!</p>
        <button class="btn btn-primary h-empty-btn" onclick="openSmartFormModal('colecao')">Criar primeira coleção</button>
      </div>`;
    return;
  }

  c.innerHTML = `<div class="colecoes-grid">${containers.map(item => {
    const t = TIPO[item.type]||{icon:'library_books',color:'#8b5cf6'};
    const containerItems = (item.containerItems||[]).map(id => findInDb(id)).filter(Boolean);
    const total = containerItems.length;
    const done = containerItems.filter(i => i.status === 'Finalizado').length;
    const pct = total ? Math.round(done/total*100) : 0;
    const coverEl = item.cover
      ? `<img src="${esc(item.cover)}" alt="" loading="lazy" class="colecao-card-cover" onerror="this.outerHTML='<div class=\\'colecao-card-placeholder\\' style=\\'background:${t.color}20\\'><span class=\\'material-symbols-rounded\\' style=\\'font-size:2rem;color:${t.color}\\'>${esc(t.icon)}</span></div>'">`
      : `<div class="colecao-card-placeholder" style="background:${t.color}20"><span class="material-symbols-rounded" style="font-size:2rem;color:${t.color}">${esc(t.icon)}</span></div>`;

    const itemsPreview = containerItems.slice(0, 6).map(ci => {
      const ciType = TIPO[ci.type] || { icon: 'movie' };
      const ciCover = ci.cover
        ? `<img src="${esc(ci.cover)}" alt="" loading="lazy" class="colecao-mini-cover" onerror="this.outerHTML='<span class=\\'material-symbols-rounded\\' style=\\'font-size:.9rem\\'>${esc(ciType.icon)}</span>'">`
        : `<span class="material-symbols-rounded" style="font-size:.9rem">${esc(ciType.icon)}</span>`;
      return `<div class="colecao-mini-item" title="${esc(ci.title)}">${ciCover}</div>`;
    }).join('');
    const overflow = containerItems.length > 6 ? `<div class="colecao-mini-more">+${containerItems.length - 6}</div>` : '';

    return `
      <div class="colecao-card" onclick="openBoxView('${esc(item.id)}')">
        <div class="colecao-card-cover-wrap">
          ${coverEl}
          <div class="colecao-card-type" style="background:${t.color}">${esc(item.type)}</div>
        </div>
        <div class="colecao-card-body">
          <h3 class="colecao-card-title">${esc(item.title)}</h3>
          ${item.containerDesc ? `<p class="colecao-card-desc">${esc(item.containerDesc)}</p>` : ''}
          <div class="colecao-card-progress">
            <div class="colecao-card-progress-text">${done}/${total} · ${pct}%</div>
            <div class="colecao-card-progress-bar"><div class="colecao-card-progress-fill" style="width:${pct}%"></div></div>
          </div>
          <div class="colecao-card-items-preview">
            ${itemsPreview}${overflow}
          </div>
        </div>
      </div>`;
  }).join('')}</div>`;

  document.getElementById('colecoesSubtitle').textContent = `${containers.length} ${containers.length === 1 ? 'coleção' : 'coleções'}`;
}

/* ═══════════════════════════════════════════
   PACKAGE 009 — PERFIL
   ═══════════════════════════════════════════ */

function calcProfileStats() {
  const total = db.length;
  const completed = db.filter(x => x.status === 'Finalizado').length;
  const watching = db.filter(x => x.status === 'Assistindo').length;
  const planned = db.filter(x => x.status === 'Quero assistir').length;
  const dropped = db.filter(x => x.status === 'Abandonado').length;
  const favs = db.filter(x => x.fav).length;
  const totalHours = db.reduce((s, x) => s + (parseFloat(x.hours) || parseFloat(x.hoursPlayed) || 0), 0);
  const pagesRead = db.filter(x => x.type === 'Livro' || x.type === 'Mangá').reduce((s, x) => {
    const p = parseInt(x.pages) || 0;
    const c = parseInt(x.currentChapter) || 0;
    return s + Math.max(p, c);
  }, 0);
  const episodesWatched = db.filter(x => x.type === 'Anime' || x.type === 'Série' || x.type === 'Dorama')
    .reduce((s, x) => s + (parseInt(x.currentEp) || parseInt(x.episodes) || 0), 0);
  const moviesWatched = db.filter(x => x.type === 'Filme' && x.status === 'Finalizado').length;
  const containers = db.filter(x => x.type === 'Box' || x.type === 'Coleção').length;

  // Time since first item
  const dates = db.map(x => x.addedAt).filter(Boolean).sort();
  const oldest = dates[0];
  let memberSince = '—';
  let timeOfUse = '';
  if (oldest) {
    const d = new Date(oldest);
    memberSince = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 30) timeOfUse = `${days} dia${days !== 1 ? 's' : ''}`;
    else if (days < 365) timeOfUse = `${Math.floor(days / 30)} mese${Math.floor(days / 30) !== 1 ? 's' : ''}`;
    else timeOfUse = `${Math.floor(days / 365)} ano${Math.floor(days / 365) !== 1 ? 's' : ''}`;
  }

  return { total, completed, watching, planned, dropped, favs, totalHours, pagesRead, episodesWatched, moviesWatched, containers, memberSince, timeOfUse };
}

function getRecentActivity() {
  const recent = [...db].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 8);
  const recentFavs = db.filter(x => x.fav).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 4);
  const recentRating = db.filter(x => x.rating > 0).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 4);
  const recentColls = db.filter(x => x.type === 'Box' || x.type === 'Coleção')
    .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 4);
  return { recent, recentFavs, recentRating, recentColls };
}

function calcGoalProgress(goal) {
  const { total, completed } = calcProfileStats();
  const type = goal.type || 'total';
  const target = parseInt(goal.target) || 1;
  let current = 0;
  if (type === 'completed') current = completed;
  else if (type === 'movies') current = db.filter(x => x.type === 'Filme' && x.status === 'Finalizado').length;
  else if (type === 'books') current = db.filter(x => (x.type === 'Livro' || x.type === 'Mangá') && x.status === 'Finalizado').length;
  else if (type === 'episodes') current = db.filter(x => x.type === 'Anime' || x.type === 'Série' || x.type === 'Dorama')
    .reduce((s, x) => s + (parseInt(x.currentEp) || parseInt(x.episodes) || 0), 0);
  else if (type === 'hours') current = Math.round(db.reduce((s, x) => s + (parseFloat(x.hours) || parseFloat(x.hoursPlayed) || 0), 0));
  else if (type === 'pages') current = db.filter(x => x.type === 'Livro' || x.type === 'Mangá')
    .reduce((s, x) => s + (parseInt(x.pages) || parseInt(x.currentChapter) || 0), 0);
  else current = total;
  return { current, target, pct: Math.min(100, Math.round((current / target) * 100)) };
}

function saveProfileGoals() {
  try { localStorage.setItem('indexa_profileGoals', JSON.stringify(profileGoals)); } catch (_) {}
}

function saveProfilePrefs() {
  try { localStorage.setItem('indexa_profilePrefs', JSON.stringify(profilePrefs)); } catch (_) {}
}

const DEFAULT_GOALS = [
  { id: 'g1', label: 'Obras concluídas', type: 'completed', target: '50', icon: '✅' },
  { id: 'g2', label: 'Filmes vistos', type: 'movies', target: '100', icon: '🎬' },
  { id: 'g3', label: 'Livros/Mangás lidos', type: 'books', target: '12', icon: '📚' },
  { id: 'g4', label: 'Episódios assistidos', type: 'episodes', target: '500', icon: '📺' },
  { id: 'g5', label: 'Horas consumidas', type: 'hours', target: '100', icon: '⏱️' },
  { id: 'g6', label: 'Páginas lidas', type: 'pages', target: '5000', icon: '📄' },
];

function renderProfile() {
  const c = document.getElementById('perfilContent');
  if (!c) return;

  const stats = calcProfileStats();
  const activity = getRecentActivity();
  const user = currentUser || {};
  const userName = user.displayName || 'Usuário';
  const userAvatar = user.photoURL || '';
  const userInitial = (user.displayName || user.email || 'U').charAt(0).toUpperCase();

  const goals = profileGoals.length ? profileGoals : DEFAULT_GOALS;

  /* ── Header ── */
  const headerHtml = `
    <div class="pf-header">
      <div class="pf-avatar-wrap">
        ${userAvatar ? `<img src="${esc(userAvatar)}" alt="" class="pf-avatar-img">` : `<div class="pf-avatar-placeholder">${esc(userInitial)}</div>`}
      </div>
      <div class="pf-header-info">
        <h2 class="pf-name">${esc(userName)}</h2>
        <div class="pf-meta">
          <span class="pf-meta-item"><span class="material-symbols-rounded" style="font-size:1rem">calendar_month</span> Membro desde ${esc(stats.memberSince)}</span>
          <span class="pf-meta-item"><span class="material-symbols-rounded" style="font-size:1rem">inventory_2</span> ${stats.total} obra${stats.total !== 1 ? 's' : ''}</span>
          ${stats.timeOfUse ? `<span class="pf-meta-item"><span class="material-symbols-rounded" style="font-size:1rem">schedule</span> ${esc(stats.timeOfUse)} de uso</span>` : ''}
        </div>
      </div>
    </div>`;

  /* ── Stats Grid ── */
  const statsHtml = `
    <div class="pf-section">
      <h3 class="pf-section-title"><span class="material-symbols-rounded" style="font-size:1.2rem">bar_chart</span> Estatísticas</h3>
      <div class="pf-stats-grid">
        <div class="pf-stat-card" data-icon="total"><div class="pf-stat-val">${stats.total}</div><div class="pf-stat-label">Total</div></div>
        <div class="pf-stat-card" data-icon="done"><div class="pf-stat-val">${stats.completed}</div><div class="pf-stat-label">Concluídas</div></div>
        <div class="pf-stat-card" data-icon="watching"><div class="pf-stat-val">${stats.watching}</div><div class="pf-stat-label">Em andamento</div></div>
        <div class="pf-stat-card" data-icon="planned"><div class="pf-stat-val">${stats.planned}</div><div class="pf-stat-label">Planejadas</div></div>
        <div class="pf-stat-card" data-icon="dropped"><div class="pf-stat-val">${stats.dropped}</div><div class="pf-stat-label">Abandonadas</div></div>
        <div class="pf-stat-card" data-icon="fav"><div class="pf-stat-val">${stats.favs}</div><div class="pf-stat-label">Favoritas</div></div>
        <div class="pf-stat-card" data-icon="hours"><div class="pf-stat-val">${Math.round(stats.totalHours)}h</div><div class="pf-stat-label">Tempo consumido</div></div>
        <div class="pf-stat-card" data-icon="movies"><div class="pf-stat-val">${stats.moviesWatched}</div><div class="pf-stat-label">Filmes vistos</div></div>
        <div class="pf-stat-card" data-icon="episodes"><div class="pf-stat-val">${stats.episodesWatched}</div><div class="pf-stat-label">Episódios</div></div>
        <div class="pf-stat-card" data-icon="pages"><div class="pf-stat-val">${stats.pagesRead}</div><div class="pf-stat-label">Páginas lidas</div></div>
        <div class="pf-stat-card" data-icon="containers"><div class="pf-stat-val">${stats.containers}</div><div class="pf-stat-label">Coleções</div></div>
      </div>
    </div>`;

  /* ── Recent Activity ── */
  function renderActivityItems(items, iconFn) {
    if (!items.length) return '<div class="pf-empty">Nenhuma atividade ainda</div>';
    return items.map(x => {
      const t = TIPO[x.type] || { icon: 'movie', color: '#555' };
      const label = x.status === 'Finalizado' ? 'Concluído' : x.status === 'Assistindo' ? 'Em andamento' : x.status || '';
      return `<div class="pf-activity-item" onclick="openDetail('${esc(x.id)}')">
        <span class="material-symbols-rounded" style="font-size:1rem;color:${t.color}">${esc(t.icon)}</span>
        <div class="pf-activity-info">
          <span class="pf-activity-title">${esc(x.title)}</span>
          <span class="pf-activity-meta">${label} · ${x.type}</span>
        </div>
        ${x.rating ? `<span class="pf-activity-rating">${'★'.repeat(x.rating)}</span>` : ''}
      </div>`;
    }).join('');
  }

  const activityHtml = `
    <div class="pf-section">
      <h3 class="pf-section-title"><span class="material-symbols-rounded" style="font-size:1.2rem">history</span> Atividade recente</h3>
      <div class="pf-tabs">
        <button class="pf-tab active" onclick="switchPfTab(this,'recent')">Últimas</button>
        <button class="pf-tab" onclick="switchPfTab(this,'ratings')">Avaliações</button>
        <button class="pf-tab" onclick="switchPfTab(this,'favs')">Favoritos</button>
        <button class="pf-tab" onclick="switchPfTab(this,'collections')">Coleções</button>
      </div>
      <div class="pf-activity-list" id="pfActivityList">
        ${renderActivityItems(activity.recent)}
      </div>
      <div class="pf-activity-data" style="display:none">
        <div id="pfData-recent">${renderActivityItems(activity.recent)}</div>
        <div id="pfData-ratings">${renderActivityItems(activity.recentRating)}</div>
        <div id="pfData-favs">${renderActivityItems(activity.recentFavs)}</div>
        <div id="pfData-collections">${renderActivityItems(activity.recentColls)}</div>
      </div>
    </div>`;

  /* ── Goals ── */
  const goalsHtml = `
    <div class="pf-section">
      <h3 class="pf-section-title">
        <span class="material-symbols-rounded" style="font-size:1.2rem">flag</span> Metas
        <button class="btn btn-ghost btn-sm" onclick="pfEditGoals()" style="margin-left:auto;padding:4px 10px">
          <span class="material-symbols-rounded" style="font-size:1rem">edit</span> Editar
        </button>
      </h3>
      <div class="pf-goals" id="pfGoalsList">
        ${goals.map(g => {
          const { current, target, pct } = calcGoalProgress(g);
          return `<div class="pf-goal">
            <div class="pf-goal-header">
              <span class="pf-goal-icon">${g.icon || '🎯'}</span>
              <span class="pf-goal-label">${esc(g.label)}</span>
              <span class="pf-goal-progress-text">${current}/${target}</span>
            </div>
            <div class="pf-goal-bar"><div class="pf-goal-fill" style="width:${pct}%"></div></div>
            <div class="pf-goal-pct">${pct}%</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;

  /* ── Preferences ── */
  const themeChecked = lightMode ? 'checked' : '';
  const themeToggleLabel = lightMode ? 'Claro' : 'Escuro';
  const layoutPref = profilePrefs.layout || 'grid';
  const langPref = profilePrefs.lang || 'pt-BR';
  const favCats = profilePrefs.favCats || [];

  const prefsHtml = `
    <div class="pf-section">
      <h3 class="pf-section-title"><span class="material-symbols-rounded" style="font-size:1.2rem">settings</span> Preferências</h3>
      <div class="pf-prefs">
        <div class="pf-pref-row">
          <span class="pf-pref-label"><span class="material-symbols-rounded" style="font-size:1.1rem">${lightMode ? 'light_mode' : 'dark_mode'}</span> Tema</span>
          <label class="pf-toggle">
            <input type="checkbox" ${themeChecked} onchange="pfToggleTheme()">
            <span class="pf-toggle-slider"></span>
            <span class="pf-toggle-label">${themeToggleLabel}</span>
          </label>
        </div>
        <div class="pf-pref-row">
          <span class="pf-pref-label"><span class="material-symbols-rounded" style="font-size:1.1rem">language</span> Idioma</span>
          <select class="pf-pref-select" onchange="profilePrefs.lang=this.value;saveProfilePrefs()">
            <option value="pt-BR" ${langPref==='pt-BR'?'selected':''}>Português (BR)</option>
            <option value="en" ${langPref==='en'?'selected':''}>English</option>
            <option value="es" ${langPref==='es'?'selected':''}>Español</option>
          </select>
        </div>
        <div class="pf-pref-row">
          <span class="pf-pref-label"><span class="material-symbols-rounded" style="font-size:1.1rem">grid_view</span> Layout preferido</span>
          <select class="pf-pref-select" onchange="profilePrefs.layout=this.value;saveProfilePrefs()">
            <option value="grid" ${layoutPref==='grid'?'selected':''}>Grid</option>
            <option value="list" ${layoutPref==='list'?'selected':''}>Lista</option>
            <option value="compact" ${layoutPref==='compact'?'selected':''}>Compacto</option>
          </select>
        </div>
        <div class="pf-pref-row pf-pref-row--column">
          <span class="pf-pref-label"><span class="material-symbols-rounded" style="font-size:1.1rem">category</span> Categorias favoritas</span>
          <div class="pf-cats">
            ${['Filme','Série','Anime','Mangá','Dorama','Jogo','Livro'].map(t => {
              const tInfo = TIPO[t] || { icon: 'movie', color: '#555' };
              const active = favCats.includes(t);
              return `<button class="pf-cat-chip ${active?'active':''}" style="--chip-color:${tInfo.color}" onclick="pfToggleCat('${esc(t)}')">
                <span class="material-symbols-rounded" style="font-size:.85rem">${esc(tInfo.icon)}</span> ${t}
              </button>`;
            }).join('')}
          </div>
        </div>
      </div>
    </div>`;

  c.innerHTML = headerHtml + statsHtml + activityHtml + goalsHtml + prefsHtml;
  document.getElementById('perfilSubtitle').textContent = `${stats.total} obra${stats.total !== 1 ? 's' : ''} · ${stats.completed} concluídas`;
}

/* ── Profile helpers ── */

function switchPfTab(btn, tab) {
  document.querySelectorAll('.pf-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const list = document.getElementById('pfActivityList');
  const data = document.getElementById('pfData-' + tab);
  if (data) list.innerHTML = data.innerHTML;
}

function pfToggleTheme() {
  lightMode = !lightMode;
  document.body.classList.toggle('light-mode', lightMode);
  try { localStorage.setItem('biblioteca_lightMode', JSON.stringify(lightMode)); } catch (_) {}
  renderProfile();
}

function pfToggleCat(cat) {
  if (!profilePrefs.favCats) profilePrefs.favCats = [];
  const idx = profilePrefs.favCats.indexOf(cat);
  if (idx >= 0) profilePrefs.favCats.splice(idx, 1);
  else profilePrefs.favCats.push(cat);
  saveProfilePrefs();
  renderProfile();
}

function pfEditGoals() {
  const goals = profileGoals.length ? profileGoals : DEFAULT_GOALS;
  const list = document.getElementById('pfGoalsList');
  if (!list) return;

  if (list.dataset.editing === 'true') {
    // Save
    const newGoals = [];
    list.querySelectorAll('.pf-goal-edit-row').forEach(row => {
      const id = row.dataset.id || 'g' + Date.now() + Math.random();
      const label = row.querySelector('.pf-ge-label').value.trim();
      const type = row.querySelector('.pf-ge-type').value;
      const target = row.querySelector('.pf-ge-target').value;
      const icon = row.querySelector('.pf-ge-icon').value || '🎯';
      if (label && target) {
        newGoals.push({ id, label, type, target, icon });
      }
    });
    profileGoals = newGoals;
    saveProfileGoals();
    renderProfile();
    return;
  }

  list.dataset.editing = 'true';
  list.innerHTML = goals.map(g => {
    const { current, target, pct } = calcGoalProgress(g);
    return `<div class="pf-goal pf-goal-editing" data-id="${esc(g.id)}">
      <div class="pf-goal-edit-row">
        <input class="pf-ge-icon pf-input-sm" value="${esc(g.icon||'🎯')}" style="width:36px;text-align:center">
        <input class="pf-ge-label pf-input-sm" value="${esc(g.label)}" style="flex:1">
        <select class="pf-ge-type pf-input-sm">
          <option value="completed" ${g.type==='completed'?'selected':''}>Concluídas</option>
          <option value="movies" ${g.type==='movies'?'selected':''}>Filmes</option>
          <option value="books" ${g.type==='books'?'selected':''}>Livros/Mangás</option>
          <option value="episodes" ${g.type==='episodes'?'selected':''}>Episódios</option>
          <option value="hours" ${g.type==='hours'?'selected':''}>Horas</option>
          <option value="pages" ${g.type==='pages'?'selected':''}>Páginas</option>
          <option value="total" ${g.type==='total'?'selected':''}>Total obras</option>
        </select>
        <input class="pf-ge-target pf-input-sm" type="number" min="1" value="${esc(g.target)}" style="width:70px">
        <button class="pf-ge-remove" onclick="this.closest('.pf-goal').remove()">✕</button>
      </div>
      <div class="pf-goal-header" style="margin-top:4px">
        <span class="pf-goal-progress-text" style="font-size:0.75rem">Atual: ${current}/${target} · ${pct}%</span>
      </div>
    </div>`;
  }).join('');
  list.innerHTML += `
    <button class="btn btn-ghost btn-sm" onclick="pfAddGoalRow()" style="width:100%;margin-top:8px">
      <span class="material-symbols-rounded" style="font-size:1rem">add</span> Adicionar meta
    </button>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn btn-primary btn-sm" onclick="pfEditGoals()" style="flex:1">Salvar</button>
      <button class="btn btn-ghost btn-sm" onclick="profileGoals=[];renderProfile()" style="flex:1">Cancelar</button>
    </div>`;
}

function pfAddGoalRow() {
  const list = document.getElementById('pfGoalsList');
  if (!list) return;
  const row = document.createElement('div');
  row.className = 'pf-goal pf-goal-editing';
  row.innerHTML = `
    <div class="pf-goal-edit-row">
      <input class="pf-ge-icon pf-input-sm" value="🎯" style="width:36px;text-align:center">
      <input class="pf-ge-label pf-input-sm" value="" placeholder="Nova meta" style="flex:1">
      <select class="pf-ge-type pf-input-sm">
        <option value="completed">Concluídas</option>
        <option value="movies">Filmes</option>
        <option value="books">Livros/Mangás</option>
        <option value="episodes">Episódios</option>
        <option value="hours">Horas</option>
        <option value="pages">Páginas</option>
        <option value="total">Total obras</option>
      </select>
      <input class="pf-ge-target pf-input-sm" type="number" min="1" value="10" style="width:70px">
      <button class="pf-ge-remove" onclick="this.closest('.pf-goal').remove()">✕</button>
    </div>`;
  list.insertBefore(row, list.lastElementChild);
}
