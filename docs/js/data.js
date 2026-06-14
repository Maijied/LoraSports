const TEAMS = {
  'Argentina': { flag: '🇦🇷', group: 'A', rating: 1702 },
  'Brazil': { flag: '🇧🇷', group: 'E', rating: 1728 },
  'France': { flag: '🇫🇷', group: 'B', rating: 1697 },
  'England': { flag: '🇬🇧', group: 'C', rating: 1663 },
  'Germany': { flag: '🇩🇪', group: 'D', rating: 1650 },
  'Spain': { flag: '🇪🇸', group: 'D', rating: 1672 },
  'Netherlands': { flag: '🇳🇱', group: 'B', rating: 1670 },
  'Belgium': { flag: '🇧🇪', group: 'F', rating: 1676 },
  'Mexico': { flag: '🇲🇽', group: 'F', rating: 1621 },
  'Japan': { flag: '🇯🇵', group: 'D', rating: 1622 },
  'Uruguay': { flag: '🇺🇾', group: 'B', rating: 1618 },
  'Poland': { flag: '🇵🇱', group: 'B', rating: 1610 },
  'Denmark': { flag: '🇩🇰', group: 'G', rating: 1628 },
  'USA': { flag: '🇺🇸', group: 'C', rating: 1621 },
  'Canada': { flag: '🇨🇦', group: 'A', rating: 1580 },
  'Australia': { flag: '🇦🇺', group: 'G', rating: 1605 },
};

window.AppData = {
  TEAMS,
  version: '2.0.0',
  lastUpdate: null,
  userProfile: {
    totalPoints: 0,
    correctPredictions: 0,
    totalPredictions: 0,
    achievements: [],
    predictions: [],
    rank: 0,
  }
};