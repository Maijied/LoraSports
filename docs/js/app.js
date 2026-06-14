const APP = {
  init() {
    this.loadMatches();
    this.setupEventListeners();
    this.startLiveRefresh();
    this.populateTeamSelects();
  },

  async loadMatches() {
    const data = await API.fetchMatches();
    if (data.events) {
      const matches = data.events.map(e => API.parseMatch(e));
      this.renderMatches(matches);
      this.updateStats(matches);
    }
  },

  renderMatches(matches) {
    const todayContainer = document.getElementById('todayMatches');
    const scheduleContainer = document.getElementById('scheduleMatches');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayMatches = matches.filter(m => {
      const matchDate = new Date(m.startDate.getFullYear(), m.startDate.getMonth(), m.startDate.getDate());
      return matchDate.getTime() === today.getTime();
    });
    const upcomingMatches = matches.filter(m => m.startDate > now).slice(0, 20);
    todayContainer.innerHTML = todayMatches.length === 0 ? '<p style="padding: 2rem; text-align: center; color: var(--text-tertiary);">No matches today</p>' : todayMatches.map(m => this.createMatchCard(m)).join('');
    scheduleContainer.innerHTML = upcomingMatches.map(m => this.createMatchCard(m)).join('');
  },

  createMatchCard(match) {
    const status = match.isLive ? 'LIVE' : match.isFinished ? 'FT' : 'Upcoming';
    const liveClass = match.isLive ? 'match-card--live' : '';
    const team1 = AppData.TEAMS[match.homeTeam];
    const team2 = AppData.TEAMS[match.awayTeam];
    return `<div class="match-card ${liveClass}" onclick="UI.openMatchModal('${match.id}')">
      <div class="match-card__meta">
        <span class="match-card__group">Group ${team1?.group || 'N/A'}</span>
        <span class="match-card__status ${match.isLive ? 'match-card__status--live' : ''}">${status}</span>
      </div>
      <div class="match-card__body">
        <div class="team">
          <span class="team__flag">${team1?.flag || '🏴'}</span>
          <span class="team__name">${match.homeTeam}</span>
        </div>
        <div class="score">
          <span class="score__num">${match.homeScore}</span>
          <span class="score__sep">−</span>
          <span class="score__num">${match.awayScore}</span>
        </div>
        <div class="team team--away">
          <span class="team__flag">${team2?.flag || '🏴'}</span>
          <span class="team__name">${match.awayTeam}</span>
        </div>
      </div>
    </div>`;
  },

  updateStats(matches) {
    document.getElementById('totalMatches').textContent = matches.length;
    document.getElementById('matchCounter').textContent = matches.filter(m => !m.isFinished).length + ' upcoming';
    document.getElementById('userPoints').textContent = AppData.userProfile.totalPoints;
    document.getElementById('userPredictions').textContent = AppData.userProfile.totalPredictions;
  },

  setupEventListeners() {
    document.getElementById('calculateBtn')?.addEventListener('click', () => this.calculatePrediction());
  },

  populateTeamSelects() {
    const homeSelect = document.getElementById('homeTeam');
    const awaySelect = document.getElementById('awayTeam');
    const teams = Object.keys(AppData.TEAMS).sort();
    const options = teams.map(team => `<option value="${team}">${team}</option>`).join('');
    if (homeSelect) homeSelect.innerHTML = '<option value="">Select home team</option>' + options;
    if (awaySelect) awaySelect.innerHTML = '<option value="">Select away team</option>' + options;
  },

  calculatePrediction() {
    const home = document.getElementById('homeTeam').value;
    const away = document.getElementById('awayTeam').value;
    if (!home || !away) return;
    const pred = PREDICTIONS.predict(home, away);
    const result = document.getElementById('predictionResult');
    result.innerHTML = `<div class="glass-card" style="padding: 1.5rem; border: 1px solid var(--green); margin-top: 1rem;">
      <div style="text-align: center;">
        <div style="display: flex; justify-content: space-around; align-items: center; margin: 1rem 0;">
          <div>
            <span style="font-size: 24px;">${AppData.TEAMS[home]?.flag}</span>
            <div style="font-weight: 600; margin-top: 0.5rem;">${home}</div>
          </div>
          <div style="font-size: 28px; font-weight: 700; color: var(--gold);">${pred.predictedScore}</div>
          <div>
            <span style="font-size: 24px;">${AppData.TEAMS[away]?.flag}</span>
            <div style="font-weight: 600; margin-top: 0.5rem;">${away}</div>
          </div>
        </div>
        <div style="margin-top: 1.5rem;">
          <div style="font-size: 14px; margin-bottom: 1rem;">
            <span style="color: var(--green); font-weight: 700;">${pred.winA}%</span> | 
            <span style="color: var(--gold); font-weight: 700;">${pred.draw}%</span> | 
            <span style="color: var(--red); font-weight: 700;">${pred.winB}%</span>
          </div>
          <div style="color: var(--text-secondary); font-size: 13px;">Confidence: ${pred.confidence}%</div>
          <div style="color: var(--cyan); font-weight: 700; margin-top: 1rem; font-size: 16px;">Prediction: ${pred.prediction}</div>
        </div>
      </div>
    </div>`;
  },

  startLiveRefresh() {
    setInterval(() => this.loadMatches(), 60000);
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => APP.init());
} else {
  APP.init();
}

window.APP = APP;