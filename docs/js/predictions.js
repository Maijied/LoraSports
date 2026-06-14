// Lorapok WorldCup 26 — Predictions Engine
// ELO-based win probability calculator

const PREDICTION_ENGINE = {

  expected(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  },

  predict(teamA, teamB) {
    const ratings = window.LW26API.TEAM_RATINGS;
    const ra = ratings[teamA] || 1500;
    const rb = ratings[teamB] || 1500;

    const winA    = this.expected(ra, rb);
    const winB    = this.expected(rb, ra);
    const drawFac = 0.22 + 0.06 * (1 - Math.abs(ra - rb) / 600);

    const adjWinA = winA * (1 - drawFac);
    const adjWinB = winB * (1 - drawFac);

    const baseGoals = 1.1;
    const offA  = (ra / 1700) * baseGoals;
    const offB  = (rb / 1700) * baseGoals;
    const sA    = Math.round(offA);
    const sB    = Math.round(offB);

    const likely = (adjWinA > adjWinB + 0.05) ? teamA
                 : (adjWinB > adjWinA + 0.05) ? teamB
                 : 'Draw';

    return {
      teamA, teamB,
      winA:       Math.round(adjWinA * 100),
      draw:       Math.round(drawFac * 100),
      winB:       Math.round(adjWinB * 100),
      likelyScore:`${sA}–${sB}`,
      prediction: likely,
      ratingA:    ra,
      ratingB:    rb,
      confidence: Math.round(Math.max(adjWinA, adjWinB, drawFac) * 100),
    };
  },

  tournamentOdds() {
    const ratings = window.LW26API.TEAM_RATINGS;
    const top = Object.entries(ratings)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16);
    const total = top.reduce((s, [, r]) => s + r, 0);
    return top.map(([team, rating]) => ({
      team,
      prob:   Math.round((rating / total) * 100 * 10) / 10,
      rating,
    }));
  },
};

window.LW26Predict = PREDICTION_ENGINE;
