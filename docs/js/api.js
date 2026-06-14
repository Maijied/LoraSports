const API = {
  ESPN_URL: 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard',
  CACHE_KEY: 'wc26_match_cache',
  CACHE_TTL: 5 * 60 * 1000,

  async fetchMatches() {
    try {
      const cached = this.getCached();
      if (cached) return cached;
      const response = await fetch(this.ESPN_URL);
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      this.setCached(data);
      return data;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return this.getCached() || { events: [] };
    }
  },

  getCached() {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > this.CACHE_TTL) {
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    }
    return data;
  },

  setCached(data) {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
  },

  parseMatch(event) {
    const comp = event.competitions?.[0] || {};
    const home = comp.competitors?.[0] || {};
    const away = comp.competitors?.[1] || {};
    return {
      id: event.id,
      homeTeam: home.team?.displayName || 'TBD',
      awayTeam: away.team?.displayName || 'TBD',
      homeScore: parseInt(home.score) || 0,
      awayScore: parseInt(away.score) || 0,
      status: event.status?.type?.name || 'SCHEDULED',
      startDate: new Date(event.date),
      isLive: event.status?.type?.name === 'IN_PROGRESS',
      isFinished: event.status?.type?.name === 'FINAL',
    };
  },
};

window.API = API;