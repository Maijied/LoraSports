const UI = {
  openMatchModal(matchId) {
    const modal = document.getElementById('matchModal');
    modal.classList.add('active');
  },

  closeMatchModal() {
    document.getElementById('matchModal').classList.remove('active');
  },

  openProfileModal() {
    const modal = document.getElementById('profileModal');
    this.updateProfileContent();
    modal.classList.add('active');
  },

  closeProfileModal() {
    document.getElementById('profileModal').classList.remove('active');
  },

  updateProfileContent() {
    const profile = AppData.userProfile;
    document.getElementById('profileTotalPoints').textContent = profile.totalPoints;
    document.getElementById('profileCorrect').textContent = profile.correctPredictions;
    const winRate = profile.totalPredictions ? Math.round((profile.correctPredictions / profile.totalPredictions) * 100) : 0;
    document.getElementById('profileWinRate').textContent = winRate + '%';
    document.getElementById('profileRank').textContent = '#' + (profile.rank || '-');
  },
};

document.getElementById('userProfile')?.addEventListener('click', () => UI.openProfileModal());

window.closeMatchModal = UI.closeMatchModal.bind(UI);
window.closeProfileModal = UI.closeProfileModal.bind(UI);
window.UI = UI;