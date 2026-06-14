/* ═══════════════════════════════════════════════════════════════════════
   LORAPOK WORLDCUP 26 — popup.js
   Main controller: tabs, rendering, live updates
═══════════════════════════════════════════════════════════════════════ */

'use strict';

(function() {
  /* ─────────────────────────────────────────────────────────────────── */
  /* DOM refs                                                             */
  /* ─────────────────────────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const $q = sel => document.querySelector(sel);

  const els = {
    tabs:            document.querySelectorAll('.lw-tab'),
    panels:          document.querySelectorAll('.lw-panel'),
    liveBadge:       $('liveBadge'),
    updateTime:      $('updateTime'),
    todayDate:       $('todayDate'),
    todayLoader:     $('todayLoader'),
    todayMatches:    $('todayMatches'),
    scheduleFilter:  $('scheduleGroupFilter'),
    scheduleList:    $('scheduleList'),
    teamGrid:        $('teamGrid'),
    squadSearch:     $('squadSearch'),
    squadDetail:     $('squadDetail'),
    standingsGroup:  $('standingsGroupSelector'),
    standingsTable:  $('standingsTable'),
    resultsList:     $('resultsList'),
    predictHome:     $('predictHome'),
    predictAway:     $('predictAway'),
    runPredict:      $('runPredict'),
    predictResult:   $('predictResult'),
    tournamentOdds:  $('tournamentOdds'),
  };

  /* ─────────────────────────────────────────────────────────────────── */
  /* State                                                                */
  /* ─────────────────────────────────────────────────────────────────── */
  let state = {
    activeTab:      'today',
    scheduleGroup:  'ALL',
    standingsGroup: 'A',
    liveMatches:    [],
    standings:      {},
  };

  // Late-bound constants from API module
  let FLAGS, WC26_GROUPS, TEAM_RATINGS, SQUADS,
      TODAY_MATCHES, SCHEDULE, PAST_RESULTS,
      fetchLiveMatches, fetchGroupStandings, generateStandings;

  let predict, tournamentOdds;

  function bindAPI() {
    const api = window.LW26API;
    const pre = window.LW26Predict;
    if (!api || !pre) return false;

    FLAGS = api.FLAGS;
    WC26_GROUPS = api.WC26_GROUPS;
    TEAM_RATINGS = api.TEAM_RATINGS;
    SQUADS = api.SQUADS;
    TODAY_MATCHES = api.TODAY_MATCHES;
    SCHEDULE = api.SCHEDULE;
    PAST_RESULTS = api.PAST_RESULTS;
    fetchLiveMatches = api.fetchLiveMatches;
    fetchGroupStandings = api.fetchGroupStandings;
    generateStandings = api.generateStandings;

    predict = pre.predict;
    tournamentOdds = pre.tournamentOdds;
    return true;
  }

/* ─────────────────────────────────────────────────────────────────── */
/* Helpers                                                              */
/* ─────────────────────────────────────────────────────────────────── */
function flag(team) {
  return FLAGS[team] || '🏳️';
}

function groupColor(group) {
  return WC26_GROUPS[group]?.color || '#00ff88';
}

function teamInGroup(team) {
  for (const [g, { teams }] of Object.entries(WC26_GROUPS)) {
    if (teams.includes(team)) return g;
  }
  return '?';
}

function fmtTime(str) {
  return str || '—';
}

function setUpdateTime() {
  const now = new Date();
  els.updateTime.textContent =
    now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ─────────────────────────────────────────────────────────────────── */
/* Tab controller                                                       */
/* ─────────────────────────────────────────────────────────────────── */
function switchTab(tab) {
  state.activeTab = tab;
  els.tabs.forEach(t => {
    const active = t.dataset.tab === tab;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active);
  });
  els.panels.forEach(p => {
    p.classList.toggle('active', p.id === `panel-${tab}`);
  });
}

els.tabs.forEach(t => {
  t.addEventListener('click', () => switchTab(t.dataset.tab));
});

/* ─────────────────────────────────────────────────────────────────── */
/* TODAY panel                                                          */
/* ─────────────────────────────────────────────────────────────────── */
function renderToday(matches) {
  els.todayLoader.style.display = 'none';

  const live = matches.filter(m => m.status === 'live');
  els.liveBadge.style.display = live.length ? 'flex' : 'none';

  if (!matches.length) {
    els.todayMatches.innerHTML =
      `<div class="lw-empty"><span class="lw-empty__icon">🌙</span>No matches scheduled today.</div>`;
    return;
  }

  els.todayMatches.innerHTML = matches.map(m => matchCard(m)).join('');
}

function matchCard(m) {
  const isLive     = m.status === 'live';
  const isFinished = m.status === 'finished';
  const hasScore   = m.hs !== null && m.as !== null;

  const statusLabel = isLive
    ? `<span class="lw-match-card__status lw-match-card__status--live">${m.minute ? m.minute + "'" : 'LIVE'}</span>`
    : isFinished
      ? `<span class="lw-match-card__status">FT</span>`
      : `<span class="lw-match-card__status">${fmtTime(m.time)}</span>`;

  const scoreBlock = hasScore
    ? `<div class="lw-score ${isLive ? 'lw-score--live' : ''}">
         <span class="lw-score__num">${m.hs}</span>
         <span class="lw-score__sep">–</span>
         <span class="lw-score__num">${m.as}</span>
       </div>`
    : `<div class="lw-score lw-score--pending">
         <span class="lw-score__time-big">${fmtTime(m.time)}</span>
         <span class="lw-score__label">KO</span>
       </div>`;

  const cls = isLive ? 'lw-match-card--live' : isFinished ? 'lw-match-card--finished' : '';

  return `
    <div class="lw-match-card ${cls}">
      <div class="lw-match-card__meta">
        <span class="lw-match-card__group" style="border-color:${groupColor(m.group)}20;color:${groupColor(m.group)}">
          GRP ${m.group}
        </span>
        ${statusLabel}
      </div>
      <div class="lw-match-card__body">
        <div class="lw-team">
          <span class="lw-team__flag">${flag(m.home)}</span>
          <span class="lw-team__name">${m.home}</span>
        </div>
        ${scoreBlock}
        <div class="lw-team lw-team--away">
          <span class="lw-team__flag">${flag(m.away)}</span>
          <span class="lw-team__name">${m.away}</span>
        </div>
      </div>
      ${m.venue ? `<div class="lw-match-card__venue">📍 ${m.venue}</div>` : ''}
    </div>`;
}

/* ─────────────────────────────────────────────────────────────────── */
/* SCHEDULE panel                                                       */
/* ─────────────────────────────────────────────────────────────────── */
function buildScheduleFilter() {
  const groups = ['ALL', ...Object.keys(WC26_GROUPS)];
  els.scheduleFilter.innerHTML = groups.map(g =>
    `<button class="lw-group-btn ${g === state.scheduleGroup ? 'active' : ''}" data-g="${g}">${g}</button>`
  ).join('');

  els.scheduleFilter.querySelectorAll('.lw-group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.scheduleGroup = btn.dataset.g;
      els.scheduleFilter.querySelectorAll('.lw-group-btn')
        .forEach(b => b.classList.toggle('active', b.dataset.g === state.scheduleGroup));
      renderSchedule();
    });
  });
}

function renderSchedule() {
  const filtered = state.scheduleGroup === 'ALL'
    ? SCHEDULE
    : SCHEDULE.filter(m => m.group === state.scheduleGroup);

  if (!filtered.length) {
    els.scheduleList.innerHTML =
      `<div class="lw-empty"><span class="lw-empty__icon">📅</span>No fixtures in Group ${state.scheduleGroup}.</div>`;
    return;
  }

  // Group by date
  const byDate = {};
  filtered.forEach(m => {
    byDate[m.date] = byDate[m.date] || [];
    byDate[m.date].push(m);
  });

  els.scheduleList.innerHTML = Object.entries(byDate).map(([date, matches]) => `
    <div style="margin-bottom:6px">
      <div style="font-family:var(--font-mono);font-size:8px;color:var(--ink);
                  letter-spacing:1px;padding:3px 0 5px;border-bottom:1px solid var(--border);
                  margin-bottom:5px">${date.toUpperCase()}</div>
      ${matches.map(m => scheduleCard(m)).join('')}
    </div>
  `).join('');
}

function scheduleCard(m) {
  return `
    <div class="lw-match-card" style="margin-bottom:5px">
      <div class="lw-match-card__meta">
        <span class="lw-match-card__group" style="color:${groupColor(m.group)}">GRP ${m.group}</span>
        <span class="lw-match-card__status">${fmtTime(m.time)}</span>
      </div>
      <div class="lw-match-card__body">
        <div class="lw-team">
          <span class="lw-team__flag">${flag(m.home)}</span>
          <span class="lw-team__name">${m.home}</span>
        </div>
        <div class="lw-score lw-score--pending">
          <span class="lw-score__time-big">${fmtTime(m.time)}</span>
          <span class="lw-score__label">KO</span>
        </div>
        <div class="lw-team lw-team--away">
          <span class="lw-team__flag">${flag(m.away)}</span>
          <span class="lw-team__name">${m.away}</span>
        </div>
      </div>
      ${m.venue ? `<div class="lw-match-card__venue">📍 ${m.venue}</div>` : ''}
    </div>`;
}

/* ─────────────────────────────────────────────────────────────────── */
/* SQUADS panel                                                         */
/* ─────────────────────────────────────────────────────────────────── */
function renderTeamGrid(filter = '') {
  const lc = filter.toLowerCase();
  const allTeams = Object.entries(WC26_GROUPS).flatMap(([g, { teams }]) =>
    teams.map(t => ({ team: t, group: g }))
  ).sort((a, b) => a.team.localeCompare(b.team));

  const visible = allTeams.filter(({ team }) =>
    !filter || team.toLowerCase().includes(lc)
  );

  if (!visible.length) {
    els.teamGrid.innerHTML =
      `<div class="lw-empty" style="grid-column:1/-1"><span class="lw-empty__icon">🔍</span>No teams found.</div>`;
    return;
  }

  els.teamGrid.innerHTML = visible.map(({ team, group }) => `
    <div class="lw-team-tile" data-team="${team}" tabindex="0" role="button">
      <span class="lw-team-tile__flag">${flag(team)}</span>
      <span class="lw-team-tile__name">${team}</span>
      <span class="lw-team-tile__group">GRP ${group}</span>
    </div>
  `).join('');

  els.teamGrid.querySelectorAll('.lw-team-tile').forEach(tile => {
    const open = () => openSquad(tile.dataset.team);
    tile.addEventListener('click', open);
    tile.addEventListener('keydown', e => e.key === 'Enter' && open());
  });
}

function openSquad(teamName) {
  const squad = SQUADS[teamName] || [];
  const rating = TEAM_RATINGS[teamName] || 1500;
  const group  = teamInGroup(teamName);

  els.teamGrid.style.display = 'none';
  els.squadSearch.closest('.lw-squad-search').style.display = 'none';

  els.squadDetail.style.display = 'block';
  els.squadDetail.innerHTML = `
    <button class="lw-squad-back" id="backBtn">← Back to Teams</button>
    <div class="lw-squad-header">
      <span class="lw-squad-header__flag">${flag(teamName)}</span>
      <div>
        <div class="lw-squad-header__name">${teamName}</div>
        <div style="font-family:var(--font-mono);font-size:8px;color:var(--ink)">Group ${group}</div>
      </div>
      <div class="lw-squad-header__rating">ELO ${rating}</div>
    </div>
    <table class="lw-squad-table">
      <thead>
        <tr>
          <th>#</th><th>Player</th><th>POS</th><th>Club</th>
        </tr>
      </thead>
      <tbody>
        ${squad.map(p => `
          <tr>
            <td style="color:var(--ink);font-size:9px">${p.no}</td>
            <td style="font-weight:600;color:#c8d4e0">${p.name}</td>
            <td><span class="lw-pos lw-pos--${p.pos}">${p.pos}</span></td>
            <td style="color:var(--ink)">${p.club}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;

  $('backBtn').addEventListener('click', closeSquad);
}

function closeSquad() {
  els.squadDetail.style.display = 'none';
  els.teamGrid.style.display = 'grid';
  els.squadSearch.closest('.lw-squad-search').style.display = 'block';
}

els.squadSearch.addEventListener('input', e => renderTeamGrid(e.target.value));

/* ─────────────────────────────────────────────────────────────────── */
/* RESULTS panel                                                        */
/* ─────────────────────────────────────────────────────────────────── */
function buildStandingsSelector() {
  const groups = Object.keys(WC26_GROUPS);
  els.standingsGroup.innerHTML = groups.map(g =>
    `<button class="lw-group-btn ${g === state.standingsGroup ? 'active' : ''}" data-g="${g}">${g}</button>`
  ).join('');

  els.standingsGroup.querySelectorAll('.lw-group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.standingsGroup = btn.dataset.g;
      els.standingsGroup.querySelectorAll('.lw-group-btn')
        .forEach(b => b.classList.toggle('active', b.dataset.g === state.standingsGroup));
      renderStandings();
    });
  });
}

function renderStandings() {
  const grp   = state.standingsGroup;
  const table = state.standings[grp] || [];

  // Build all group divs (for instant switching)
  els.standingsTable.innerHTML = Object.keys(WC26_GROUPS).map(g => `
    <div class="lw-standings-group ${g === grp ? 'active' : ''}" id="sg-${g}">
      ${standingsTable(state.standings[g] || [])}
    </div>
  `).join('');
}

function standingsTable(rows) {
  if (!rows.length) return `<div class="lw-empty">No data yet.</div>`;
  return `
    <table class="lw-standings-table">
      <thead>
        <tr>
          <th>#</th><th>Team</th><th>MP</th><th>W</th><th>D</th><th>L</th>
          <th>GF</th><th>GA</th><th>GD</th><th>PTS</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><span class="lw-flag-sm">${flag(r.team)}</span>${r.team}</td>
            <td>${r.mp}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td>
            <td>${r.gf}</td><td>${r.ga}</td>
            <td style="color:${r.gd > 0 ? 'var(--green)' : r.gd < 0 ? 'var(--live-red)' : 'var(--ink)'}">
              ${r.gd > 0 ? '+' : ''}${r.gd}
            </td>
            <td class="lw-pts">${r.pts}</td>
          </tr>`).join('')}
      </tbody>
    </table>
  `;
}

function renderResults() {
  const sorted = [...PAST_RESULTS].reverse();
  els.resultsList.innerHTML = sorted.map(r => {
    const homeWin  = r.hs > r.as;
    const awayWin  = r.as > r.hs;
    return `
      <div class="lw-match-card lw-match-card--finished">
        <div class="lw-match-card__meta">
          <span class="lw-match-card__group" style="color:${groupColor(r.group)}">GRP ${r.group}</span>
          <span class="lw-match-card__status">${r.date} · FT</span>
        </div>
        <div class="lw-match-card__body">
          <div class="lw-team">
            <span class="lw-team__flag">${flag(r.home)}</span>
            <span class="lw-team__name" style="color:${homeWin ? '#e8f0f8' : 'inherit'}">${r.home}</span>
          </div>
          <div class="lw-score">
            <span class="lw-score__num" style="color:${homeWin ? 'var(--green)' : awayWin ? 'var(--live-red)' : 'var(--gold)'}">${r.hs}</span>
            <span class="lw-score__sep">–</span>
            <span class="lw-score__num" style="color:${awayWin ? 'var(--green)' : homeWin ? 'var(--live-red)' : 'var(--gold)'}">${r.as}</span>
          </div>
          <div class="lw-team lw-team--away">
            <span class="lw-team__flag">${flag(r.away)}</span>
            <span class="lw-team__name" style="color:${awayWin ? '#e8f0f8' : 'inherit'}">${r.away}</span>
          </div>
        </div>
        <div class="lw-match-card__venue">📍 ${r.venue}</div>
      </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────────────────────────── */
/* PREDICT panel                                                        */
/* ─────────────────────────────────────────────────────────────────── */
function populateTeamSelects() {
  const teams = Object.keys(TEAM_RATINGS).sort();
  const opts  = teams.map(t => `<option value="${t}">${flag(t)} ${t}</option>`).join('');
  els.predictHome.innerHTML = opts;
  els.predictAway.innerHTML = opts;
  // Default: Argentina vs France
  els.predictHome.value = 'Argentina';
  els.predictAway.value = 'France';
}

function renderPrediction() {
  const home = els.predictHome.value;
  const away = els.predictAway.value;
  if (home === away) {
    els.predictResult.innerHTML =
      `<div class="lw-empty">Pick two different teams.</div>`;
    return;
  }

  const r = predict(home, away);

  els.predictResult.innerHTML = `
    <div class="lw-predict-card">
      <div class="lw-predict-card__teams">
        <div class="lw-predict-card__team">
          <span class="lw-predict-card__team-flag">${flag(home)}</span>
          <span>${home}</span>
        </div>
        <div class="lw-predict-card__team-vs">VS</div>
        <div class="lw-predict-card__team">
          <span class="lw-predict-card__team-flag">${flag(away)}</span>
          <span>${away}</span>
        </div>
      </div>

      <div class="lw-win-bar">
        <div class="lw-win-bar__a" style="width:${r.winA}%"></div>
        <div class="lw-win-bar__d" style="width:${r.draw}%"></div>
        <div class="lw-win-bar__b" style="width:${r.winB}%"></div>
      </div>
      <div class="lw-win-bar-labels">
        <span>${r.winA}% WIN</span>
        <span>${r.draw}% DRAW</span>
        <span>${r.winB}% WIN</span>
      </div>

      <div class="lw-verdict">
        <div class="lw-verdict__score">${r.likelyScore}</div>
        <div class="lw-verdict__label">LIKELY SCORE</div>
        <div class="lw-verdict__winner">
          ${r.prediction === 'Draw' ? '⚖️ Draw likely' : `${flag(r.prediction)} ${r.prediction} favoured`}
        </div>
      </div>

      <div class="lw-predict-ratings">
        <span>ELO ${home}: <strong style="color:var(--green)">${r.ratingA}</strong></span>
        <span>Confidence: <strong style="color:var(--gold)">${r.confidence}%</strong></span>
        <span>ELO ${away}: <strong style="color:var(--live-red)">${r.ratingB}</strong></span>
      </div>
    </div>`;
}

function renderTournamentOdds() {
  const odds = tournamentOdds();
  const max  = odds[0].prob;
  els.tournamentOdds.innerHTML = odds.map((o, i) => `
    <div class="lw-odds-row">
      <span class="lw-odds-row__rank">${i + 1}</span>
      <span class="lw-odds-row__team">${flag(o.team)} ${o.team}</span>
      <span class="lw-odds-row__prob">${o.prob}%</span>
      <div class="lw-odds-row__bar-wrap">
        <div class="lw-odds-row__bar" style="width:${(o.prob / max * 100).toFixed(1)}%"></div>
      </div>
    </div>`).join('');
}

els.runPredict.addEventListener('click', renderPrediction);

/* ─────────────────────────────────────────────────────────────────── */
/* Init                                                                 */
/* ─────────────────────────────────────────────────────────────────── */
async function init() {
  if (!bindAPI()) {
    console.error('LW26: API or Predict modules not found');
    return;
  }

  // Header date
  const now = new Date();
  els.todayDate.textContent = now.toLocaleDateString('en-US',
    { weekday: 'short', month: 'short', day: 'numeric' });
  setUpdateTime();

  // TODAY — render fallback first, then try live
  renderToday(TODAY_MATCHES);
  
  fetchLiveMatches().then(matches => {
    state.liveMatches = matches;
    renderToday(matches);
  }).catch(() => {
    renderToday(TODAY_MATCHES);
  });

  // SCHEDULE
  buildScheduleFilter();
  renderSchedule();

  // SQUADS
  renderTeamGrid();

  // RESULTS + STANDINGS
  buildStandingsSelector();
  state.standings = generateStandings();
  renderStandings();
  renderResults();

  fetchGroupStandings().then(s => {
    state.standings = s;
    renderStandings();
  }).catch(() => {});

  // PREDICT
  populateTeamSelects();
  renderPrediction();
  renderTournamentOdds();

  // Auto-refresh today matches every 60 s when live games exist
  setInterval(async () => {
    try {
      const matches = await fetchLiveMatches();
      state.liveMatches = matches;
      renderToday(matches);
      setUpdateTime();
    } catch { /* silent */ }
  }, 60_000);
}

document.addEventListener('DOMContentLoaded', init);

})();
