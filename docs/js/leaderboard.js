const LEADERBOARD = {
  STORAGE_KEY: 'wc26_leaderboard',
  PROFILE_KEY: 'wc26_user_profile',

  init() {
    this.loadProfile();
  },

  loadProfile() {
    const saved = localStorage.getItem(this.PROFILE_KEY);
    if (saved) AppData.userProfile = JSON.parse(saved);
  },

  saveProfile() {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(AppData.userProfile));
  },
};

window.LEADERBOARD = LEADERBOARD;
LEADERBOARD.init();