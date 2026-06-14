// Lorapok WorldCup 26 — Background Service
// Caches match data every 5 minutes

const CACHE_KEY = 'lw26_cache';
const ESPN_URL  = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

browser.alarms.create('refreshData', { periodInMinutes: 5 });

browser.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'refreshData') fetchAndCache();
});

browser.runtime.onInstalled.addListener(() => {
  fetchAndCache();
});

async function fetchAndCache() {
  try {
    const res = await fetch(ESPN_URL);
    if (!res.ok) throw new Error('ESPN API error');
    const data = await res.json();
    await browser.storage.local.set({ [CACHE_KEY]: { data, ts: Date.now() } });
  } catch (e) {
    console.warn('[Lorapok WC26] Background fetch failed:', e.message);
  }
}
