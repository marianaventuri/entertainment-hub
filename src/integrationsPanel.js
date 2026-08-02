/**
 * Painel de Integrações — status das fontes de dados
 * As buscas são feitas DIRETO do navegador para as APIs (sem servidor/custo).
 */
const INTEGRATION_TEST_TERMS = {
  'TMDB':         'Inception',
  'AniList':      'Naruto',
  'RAWG':         'Portal',
  'Google Books': 'Harry Potter',
  'OpenLibrary':  'Dune'
};

const INTEGRATION_DESCRIPTIONS = {
  'TMDB':         'Filmes, Séries e Doramas',
  'AniList':      'Animes e Mangás',
  'RAWG':         'Jogos',
  'Google Books': 'Livros',
  'OpenLibrary':  'Livros e HQs (fallback sem chave)'
};

function integrationStatus(name, adapter) {
  const needsKey = adapter.apiKey !== undefined;
  if (needsKey && !adapter.apiKey) {
    return { ok: false, label: 'Chave não configurada' };
  }
  return { ok: true, label: needsKey ? 'Chave configurada' : 'Sem chave necessária' };
}

function formatLastCall(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? '—' : d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function renderIntegracoes() {
  const container = document.getElementById('integracoesContent');
  if (!container) return;

  const rows = adapterRegistry.allAdapters().map(([name, adapter]) => {
    const st = integrationStatus(name, adapter);
    const usage = adapterRegistry.getUsage(name);
    const coverage = INTEGRATION_DESCRIPTIONS[name] || (adapter.mediaTypes || []).join(', ');
    const badgeColor = st.ok ? 'rgba(52, 211, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)';
    const badgeText = st.ok ? '#34d399' : '#f59e0b';
    return `
      <tr>
        <td style="padding:14px 12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="material-symbols-rounded" style="color:var(--accent)">api</span>
            <div>
              <div style="font-weight:600;">${esc(name)}</div>
              <div style="font-size:0.8rem;color:var(--text3);">${esc(coverage)}</div>
            </div>
          </div>
        </td>
        <td style="padding:14px 12px;">
          <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;background:${badgeColor};color:${badgeText};">
            <span class="material-symbols-rounded" style="font-size:0.9rem">${st.ok ? 'check_circle' : 'warning'}</span>
            ${esc(st.label)}
          </span>
        </td>
        <td style="padding:14px 12px;font-size:0.95rem;color:var(--text2);text-align:center;">${usage.count}</td>
        <td style="padding:14px 12px;font-size:0.9rem;color:var(--text3);">${formatLastCall(usage.lastCall)}</td>
        <td style="padding:14px 12px;text-align:right;">
          <button class="btn btn-ghost btn-sm" id="intg-test-${esc(name)}" onclick="testIntegration('${esc(name)}')">Testar conexão</button>
        </td>
      </tr>`;
  }).join('');

  const capabilitiesHtml = adapterRegistry.allAdapters().map(([name, adapter]) => {
    const caps = (typeof adapter.capabilities === 'function') ? adapter.capabilities() : {};
    const fieldNames = Object.keys(caps);
    const chips = fieldNames.length
      ? fieldNames.map(f => `<span style="display:inline-block;margin:3px 4px 0 0;padding:3px 8px;border-radius:6px;background:var(--bg2);border:1px solid var(--border);font-size:0.75rem;color:var(--text2);">${esc(f)}</span>`).join('')
      : '<span style="color:var(--text3);font-size:0.85rem;">—</span>';
    return `
      <div style="flex:1 1 280px;min-width:240px;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span class="material-symbols-rounded" style="color:var(--accent);font-size:1.1rem">database</span>
          <span style="font-weight:600;">${esc(name)}</span>
        </div>
        <div style="font-size:0.85rem;color:var(--text3);margin-bottom:8px;">${esc(INTEGRATION_DESCRIPTIONS[name] || '')}</div>
        <div>${chips}</div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="dash-card dash-card-full" style="margin-top:16px;">
      <div class="dash-card-title">Fontes de dados</div>
      <p style="margin:0 0 12px;font-size:0.9rem;color:var(--text2);">
        As buscas no editor são feitas <strong>direto do seu navegador</strong> para as APIs — sem servidor e sem custo.
        Os contadores abaixo valem para a sessão atual.
      </p>
      <div class="table-responsive" style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;text-align:left;">
          <thead>
            <tr style="border-bottom:1px solid var(--border);color:var(--text3);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.5px;">
              <th style="padding:12px;font-weight:600;">Fonte</th>
              <th style="padding:12px;font-weight:600;">Status</th>
              <th style="padding:12px;font-weight:600;text-align:center;">Chamadas</th>
              <th style="padding:12px;font-weight:600;">Última chamada</th>
              <th style="padding:12px;font-weight:600;text-align:right;">Ação</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>

    <div class="dash-card dash-card-full" style="margin-top:16px;">
      <div class="dash-card-title">O que cada fonte preenche</div>
      <p style="margin:0 0 12px;font-size:0.9rem;color:var(--text2);">Campos que cada API consegue preencher ao importar uma obra.</p>
      <div style="display:flex;flex-wrap:wrap;gap:12px;">${capabilitiesHtml}</div>
    </div>

    <div style="margin-top:16px;padding:14px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;font-size:0.85rem;color:var(--text3);">
      <strong>Dica:</strong> use o botão <em>Testar conexão</em> para verificar se uma API responde do seu navegador agora.
    </div>
  `;
}

async function testIntegration(name) {
  const btn = document.getElementById('intg-test-' + name);
  if (!btn) return;
  const adapter = adapterRegistry.getAdapter(name);
  if (!adapter) { if (btn) btn.textContent = 'Indisponível'; return; }

  const term = INTEGRATION_TEST_TERMS[name] || 'test';
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = '⏳ Testando…';

  const started = performance.now();
  try {
    const res = await adapter.fetch(term, []);
    const ok = res && Object.keys(res).length > 0;
    adapterRegistry.recordCall(name);
    const ms = Math.round(performance.now() - started);
    btn.textContent = ok ? `✅ ${ms}ms` : '❌ Falhou';
    btn.style.color = ok ? '#34d399' : '#ef4444';
  } catch (e) {
    adapterRegistry.recordCall(name);
    btn.textContent = '❌ Falhou';
    btn.style.color = '#ef4444';
  } finally {
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = original;
      btn.style.color = '';
      renderIntegracoes();
    }, 3500);
  }
}
