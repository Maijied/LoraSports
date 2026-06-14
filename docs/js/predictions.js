const PREDICTIONS = {
  expected(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  },

  predict(teamA, teamB) {
    const teams = AppData.TEAMS;
    const ratingA = teams[teamA]?.rating || 1500;
    const ratingB = teams[teamB]?.rating || 1500;
    const expA = this.expected(ratingA, ratingB);
    const expB = this.expected(ratingB, ratingA);
    const drawProbability = 0.22 + 0.06 * (1 - Math.abs(ratingA - ratingB) / 600);
    const winA = expA * (1 - drawProbability);
    const winB = expB * (1 - drawProbability);
    const draw = drawProbability;
    const baseGoals = 1.1;
    const offA = (ratingA / 1700) * baseGoals;
    const offB = (ratingB / 1700) * baseGoals;
    const goalsA = Math.round(offA);
    const goalsB = Math.round(offB);
    const prediction = (winA > winB + 0.05) ? teamA : (winB > winA + 0.05) ? teamB : 'Draw';
    return {
      teamA, teamB,
      winA: Math.round(winA * 100),
      draw: Math.round(draw * 100),
      winB: Math.round(winB * 100),
      predictedScore: `${goalsA}–${goalsB}`,
      prediction,
      confidence: Math.round(Math.max(winA, winB, draw) * 100),
      ratingA, ratingB,
    };
  },
};

window.PREDICTIONS = PREDICTIONS;