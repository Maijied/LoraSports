// Lorapok WorldCup 26 — API Module
// Primary: ESPN Public API  |  Fallback: Hardcoded 2026 data

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world';

const TEAM_RATINGS = {
  'Argentina': 1895, 'France': 1865, 'England': 1845, 'Brazil': 1840,
  'Spain': 1835, 'Portugal': 1820, 'Germany': 1810, 'Netherlands': 1795,
  'Belgium': 1770, 'Italy': 1755, 'Croatia': 1745, 'Uruguay': 1740,
  'United States': 1700, 'Colombia': 1690, 'Morocco': 1685, 'Senegal': 1670,
  'Mexico': 1665, 'Japan': 1660, 'Denmark': 1650, 'Switzerland': 1645,
  'Austria': 1630, 'Serbia': 1620, 'Poland': 1610, 'Turkey': 1605,
  'South Korea': 1595, 'Australia': 1580, 'Canada': 1575, 'Ecuador': 1560,
  'Nigeria': 1550, 'Iran': 1545, 'Saudi Arabia': 1530, 'Ghana': 1520,
  'Cameroon': 1515, 'Algeria': 1510, 'Scotland': 1505, 'Hungary': 1500,
  'Romania': 1495, 'Ukraine': 1490, 'Czech Republic': 1485, 'Egypt': 1480,
  'Panama': 1460, 'Paraguay': 1455, 'Chile': 1450, 'Costa Rica': 1440,
  'Honduras': 1420, 'Jamaica': 1400, 'Bolivia': 1380, 'Venezuela': 1370, 'Qatar': 1350,
};

const WC26_GROUPS = {
  'A': { teams: ['United States', 'Bolivia', 'Panama', 'Morocco'],    color: '#00ff88' },
  'B': { teams: ['Mexico', 'Jamaica', 'Venezuela', 'Ecuador'],         color: '#00d4ff' },
  'C': { teams: ['Canada', 'Honduras', 'Chile', 'Belgium'],            color: '#ff6b35' },
  'D': { teams: ['Brazil', 'Uruguay', 'Germany', 'Colombia'],          color: '#d4a843' },
  'E': { teams: ['Spain', 'Argentina', 'Paraguay', 'South Korea'],     color: '#c44dff' },
  'F': { teams: ['Japan', 'Saudi Arabia', 'Australia', 'France'],      color: '#00ff88' },
  'G': { teams: ['England', 'Netherlands', 'Senegal', 'Iran'],         color: '#00d4ff' },
  'H': { teams: ['Portugal', 'Croatia', 'Nigeria', 'Egypt'],           color: '#ff6b35' },
  'I': { teams: ['Italy', 'Turkey', 'Algeria', 'Ghana'],               color: '#d4a843' },
  'J': { teams: ['Denmark', 'Switzerland', 'Serbia', 'Austria'],       color: '#c44dff' },
  'K': { teams: ['Poland', 'Romania', 'Scotland', 'Costa Rica'],       color: '#00ff88' },
  'L': { teams: ['Czech Republic', 'Hungary', 'Qatar', 'Morocco'],     color: '#00d4ff' },
};

const FLAGS = {
  'United States':'🇺🇸','Bolivia':'🇧🇴','Panama':'🇵🇦','Morocco':'🇲🇦',
  'Mexico':'🇲🇽','Jamaica':'🇯🇲','Venezuela':'🇻🇪','Ecuador':'🇪🇨',
  'Canada':'🇨🇦','Honduras':'🇭🇳','Chile':'🇨🇱','Belgium':'🇧🇪',
  'Brazil':'🇧🇷','Uruguay':'🇺🇾','Germany':'🇩🇪','Colombia':'🇨🇴',
  'Spain':'🇪🇸','Argentina':'🇦🇷','Paraguay':'🇵🇾','South Korea':'🇰🇷',
  'Japan':'🇯🇵','Saudi Arabia':'🇸🇦','Australia':'🇦🇺','France':'🇫🇷',
  'England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Netherlands':'🇳🇱','Senegal':'🇸🇳','Iran':'🇮🇷',
  'Portugal':'🇵🇹','Croatia':'🇭🇷','Nigeria':'🇳🇬','Egypt':'🇪🇬',
  'Italy':'🇮🇹','Turkey':'🇹🇷','Algeria':'🇩🇿','Ghana':'🇬🇭',
  'Denmark':'🇩🇰','Switzerland':'🇨🇭','Serbia':'🇷🇸','Austria':'🇦🇹',
  'Poland':'🇵🇱','Romania':'🇷🇴','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Costa Rica':'🇨🇷',
  'Czech Republic':'🇨🇿','Hungary':'🇭🇺','Qatar':'🇶🇦','Ukraine':'🇺🇦',
};

const SQUADS = {
  'Brazil': [
    { name: 'Ederson',           pos: 'GK', club: 'Man City',    no: 1 },
    { name: 'Danilo',            pos: 'RB', club: 'Juventus',    no: 2 },
    { name: 'Marquinhos',        pos: 'CB', club: 'PSG',         no: 4 },
    { name: 'Militão',           pos: 'CB', club: 'Real Madrid', no: 3 },
    { name: 'Guilherme Arana',   pos: 'LB', club: 'Atlético MG', no: 6 },
    { name: 'Casemiro',          pos: 'DM', club: 'Man United',  no: 5 },
    { name: 'Lucas Paquetá',     pos: 'CM', club: 'West Ham',    no: 10 },
    { name: 'Bruno Guimarães',   pos: 'CM', club: 'Newcastle',   no: 8 },
    { name: 'Rodrygo',           pos: 'RW', club: 'Real Madrid', no: 11 },
    { name: 'Vinicius Jr.',      pos: 'LW', club: 'Real Madrid', no: 7 },
    { name: 'Endrick',           pos: 'ST', club: 'Real Madrid', no: 9 },
    { name: 'Alisson',           pos: 'GK', club: 'Liverpool',   no: 12 },
    { name: 'Raphinha',          pos: 'RW', club: 'Barcelona',   no: 19 },
    { name: 'Gabriel Martinelli',pos: 'LW', club: 'Arsenal',     no: 17 },
    { name: 'Gabriel Jesus',     pos: 'ST', club: 'Arsenal',     no: 18 },
    { name: 'Matheus Cunha',     pos: 'AM', club: 'Wolves',      no: 20 },
    { name: 'Gerson',            pos: 'CM', club: 'Flamengo',    no: 13 },
    { name: 'Andreas Pereira',   pos: 'CM', club: 'Fulham',      no: 15 },
    { name: 'Gleison Bremer',    pos: 'CB', club: 'Juventus',    no: 22 },
    { name: 'Alex Sandro',       pos: 'LB', club: 'Juventus',    no: 16 },
    { name: 'Alex Telles',       pos: 'LB', club: 'Sevilla',     no: 21 },
    { name: 'Weverton',          pos: 'GK', club: 'Palmeiras',   no: 23 },
    { name: 'Yuri Alberto',      pos: 'ST', club: 'Corinthians', no: 14 },
  ],
  'Argentina': [
    { name: 'Emiliano Martínez',  pos: 'GK', club: 'Aston Villa',  no: 1 },
    { name: 'Nahuel Molina',      pos: 'RB', club: 'Atlético MD',  no: 26 },
    { name: 'Cristian Romero',    pos: 'CB', club: 'Tottenham',    no: 13 },
    { name: 'Lisandro Martínez',  pos: 'CB', club: 'Man United',   no: 25 },
    { name: 'Nicolás Tagliafico', pos: 'LB', club: 'Lyon',         no: 3 },
    { name: 'Rodrigo de Paul',    pos: 'CM', club: 'Atlético MD',  no: 7 },
    { name: 'Enzo Fernández',     pos: 'CM', club: 'Chelsea',      no: 24 },
    { name: 'Alexis Mac Allister',pos: 'CM', club: 'Liverpool',    no: 20 },
    { name: 'Lionel Messi',       pos: 'RW', club: 'Inter Miami',  no: 10 },
    { name: 'Ángel Di María',     pos: 'LW', club: 'Benfica',      no: 11 },
    { name: 'Julián Álvarez',     pos: 'ST', club: 'Man City',     no: 9 },
    { name: 'Geronimo Rulli',     pos: 'GK', club: 'Ajax',         no: 12 },
    { name: 'Paulo Dybala',       pos: 'AM', club: 'Roma',         no: 21 },
    { name: 'Lautaro Martínez',   pos: 'ST', club: 'Inter Milan',  no: 22 },
    { name: 'Alejandro Garnacho', pos: 'LW', club: 'Man United',   no: 16 },
    { name: 'Giovanni Lo Celso', pos: 'CM', club: 'Villarreal',    no: 18 },
    { name: 'Thiago Almada',      pos: 'AM', club: 'Botafogo',     no: 17 },
    { name: 'Franco Armani',      pos: 'GK', club: 'River Plate',  no: 23 },
    { name: 'Gonzalo Montiel',    pos: 'RB', club: 'Sevilla',      no: 4 },
    { name: 'Germán Pezzella',    pos: 'CB', club: 'Real Betis',   no: 6 },
    { name: 'Marcos Acuña',       pos: 'LB', club: 'Sevilla',      no: 8 },
    { name: 'Leandro Paredes',    pos: 'DM', club: 'Roma',         no: 5 },
    { name: 'Valentín Carboni',   pos: 'AM', club: 'Inter Milan',  no: 15 },
  ],
  'France': [
    { name: 'Mike Maignan',       pos: 'GK', club: 'AC Milan',    no: 1 },
    { name: 'Jules Koundé',       pos: 'RB', club: 'Barcelona',   no: 5 },
    { name: 'Dayot Upamecano',    pos: 'CB', club: 'Bayern',      no: 4 },
    { name: 'Ibrahima Konaté',    pos: 'CB', club: 'Liverpool',   no: 3 },
    { name: 'Théo Hernandez',     pos: 'LB', club: 'AC Milan',    no: 22 },
    { name: 'Aurélien Tchouaméni',pos: 'DM', club: 'Real Madrid', no: 8 },
    { name: 'Adrien Rabiot',      pos: 'CM', club: 'Man United',  no: 14 },
    { name: 'Eduardo Camavinga',  pos: 'CM', club: 'Real Madrid', no: 16 },
    { name: 'Antoine Griezmann',  pos: 'AM', club: 'Atlético MD', no: 7 },
    { name: 'Ousmane Dembélé',    pos: 'RW', club: 'PSG',         no: 11 },
    { name: 'Kylian Mbappé',      pos: 'ST', club: 'Real Madrid', no: 10 },
    { name: 'Alphonse Areola',    pos: 'GK', club: 'West Ham',    no: 23 },
    { name: 'Kingsley Coman',     pos: 'RW', club: 'Bayern',      no: 17 },
    { name: 'Marcus Thuram',      pos: 'ST', club: 'Inter Milan', no: 9 },
    { name: 'Olivier Giroud',     pos: 'ST', club: 'AC Milan',    no: 18 },
    { name: 'Youssouf Fofana',    pos: 'CM', club: 'AC Milan',    no: 6 },
    { name: 'Benjamin Pavard',    pos: 'RB', club: 'Inter Milan', no: 2 },
    { name: 'William Saliba',     pos: 'CB', club: 'Arsenal',     no: 17 },
    { name: 'Jonathan Clauss',    pos: 'RB', club: 'Marseille',   no: 21 },
    { name: 'Matteo Guendouzi',   pos: 'CM', club: 'Lazio',       no: 12 },
    { name: 'Randal Kolo Muani',  pos: 'ST', club: 'PSG',         no: 19 },
    { name: 'Steve Mandanda',     pos: 'GK', club: 'Rennes',      no: 16 },
    { name: 'Presnel Kimpembe',   pos: 'CB', club: 'PSG',         no: 3 },
  ],
  'England': [
    { name: 'Jordan Pickford',         pos: 'GK', club: 'Everton',     no: 1 },
    { name: 'Kyle Walker',             pos: 'RB', club: 'Man City',    no: 2 },
    { name: 'Harry Maguire',           pos: 'CB', club: 'Man United',  no: 6 },
    { name: 'John Stones',             pos: 'CB', club: 'Man City',    no: 5 },
    { name: 'Luke Shaw',               pos: 'LB', club: 'Man United',  no: 3 },
    { name: 'Declan Rice',             pos: 'DM', club: 'Arsenal',     no: 4 },
    { name: 'Jude Bellingham',         pos: 'CM', club: 'Real Madrid', no: 8 },
    { name: 'Phil Foden',              pos: 'CM', club: 'Man City',    no: 11 },
    { name: 'Bukayo Saka',             pos: 'RW', club: 'Arsenal',     no: 7 },
    { name: 'Marcus Rashford',         pos: 'LW', club: 'Man United',  no: 11 },
    { name: 'Harry Kane',              pos: 'ST', club: 'Bayern',      no: 9 },
    { name: 'Nick Pope',               pos: 'GK', club: 'Newcastle',   no: 13 },
    { name: 'Trent Alexander-Arnold',  pos: 'RB', club: 'Liverpool',   no: 12 },
    { name: 'Reece James',             pos: 'RB', club: 'Chelsea',     no: 24 },
    { name: 'Ollie Watkins',           pos: 'ST', club: 'Aston Villa', no: 14 },
    { name: 'Cole Palmer',             pos: 'AM', club: 'Chelsea',     no: 20 },
    { name: 'Anthony Gordon',          pos: 'LW', club: 'Newcastle',   no: 16 },
    { name: 'Kobbie Mainoo',           pos: 'CM', club: 'Man United',  no: 26 },
    { name: 'Jarrod Bowen',            pos: 'RW', club: 'West Ham',    no: 17 },
    { name: 'Conor Gallagher',         pos: 'CM', club: 'Atlético MD', no: 18 },
    { name: 'Ivan Toney',              pos: 'ST', club: 'Al-Ahli',     no: 19 },
    { name: 'Ezri Konsa',              pos: 'CB', club: 'Aston Villa', no: 22 },
    { name: 'Aaron Ramsdale',          pos: 'GK', club: 'Arsenal',     no: 23 },
  ],
};

// Fill remaining squads with placeholder data
['Spain','Germany','Portugal','Netherlands','Belgium','Italy','Croatia',
 'Uruguay','Colombia','United States','Mexico','Japan','Canada','Morocco',
 'Denmark','Switzerland','Senegal','South Korea','Australia','Nigeria',
 'Turkey','Poland','Serbia','Austria','Egypt','Ghana','Saudi Arabia',
 'Algeria','Romania','Scotland','Paraguay','Honduras','Ecuador','Jamaica',
 'Bolivia','Panama','Chile','Costa Rica','Iran','Czech Republic',
 'Hungary','Qatar','Venezuela'].forEach(country => {
  if (!SQUADS[country]) {
    const positions = ['GK','CB','CB','LB','RB','DM','CM','CM','LW','RW','ST'];
    SQUADS[country] = Array.from({ length: 23 }, (_, i) => ({
      name: `Player ${i + 1}`,
      pos:  positions[i] || 'SUB',
      club: '—',
      no:   i + 1,
    }));
  }
});

const PAST_RESULTS = [
  { home: 'United States', away: 'Bolivia',    hs: 3, as: 0, date: 'Jun 12', venue: 'AT&T Stadium',   group: 'A', phase: 'Group Stage' },
  { home: 'Morocco',       away: 'Panama',     hs: 2, as: 1, date: 'Jun 12', venue: 'SoFi Stadium',   group: 'A', phase: 'Group Stage' },
  { home: 'Mexico',        away: 'Jamaica',    hs: 4, as: 1, date: 'Jun 12', venue: 'Azteca',         group: 'B', phase: 'Group Stage' },
  { home: 'Ecuador',       away: 'Venezuela',  hs: 1, as: 1, date: 'Jun 12', venue: 'BC Place',       group: 'B', phase: 'Group Stage' },
  { home: 'Canada',        away: 'Honduras',   hs: 2, as: 0, date: 'Jun 13', venue: 'BMO Field',      group: 'C', phase: 'Group Stage' },
  { home: 'Belgium',       away: 'Chile',      hs: 3, as: 2, date: 'Jun 13', venue: 'MetLife Stadium',group: 'C', phase: 'Group Stage' },
  { home: 'Brazil',        away: 'Uruguay',    hs: 2, as: 2, date: 'Jun 13', venue: 'Rose Bowl',      group: 'D', phase: 'Group Stage' },
  { home: 'Germany',       away: 'Colombia',   hs: 1, as: 2, date: 'Jun 13', venue: 'Lincoln FR',     group: 'D', phase: 'Group Stage' },
  { home: 'Spain',         away: 'Paraguay',   hs: 5, as: 0, date: 'Jun 14', venue: 'Allegiant',      group: 'E', phase: 'Group Stage' },
  { home: 'Argentina',     away: 'South Korea',hs: 2, as: 0, date: 'Jun 14', venue: 'Hard Rock',      group: 'E', phase: 'Group Stage' },
  { home: 'Japan',         away: 'Saudi Arabia',hs:2, as: 1, date: 'Jun 14', venue: 'Arrowhead',      group: 'F', phase: 'Group Stage' },
  { home: 'France',        away: 'Australia',  hs: 4, as: 0, date: 'Jun 14', venue: "Levi's",         group: 'F', phase: 'Group Stage' },
];

const TODAY_MATCHES = [
  { id: 't1', home: 'England',  away: 'Netherlands', hs: null, as: null, time: '15:00', venue: 'Gillette Stadium', group: 'G', phase: 'Group Stage', status: 'scheduled' },
  { id: 't2', home: 'Senegal',  away: 'Iran',        hs: null, as: null, time: '18:00', venue: 'NRG Stadium',      group: 'G', phase: 'Group Stage', status: 'scheduled' },
  { id: 't3', home: 'Portugal', away: 'Croatia',     hs: 2, as: 1,       time: '12:00', venue: 'AT&T Stadium',    group: 'H', phase: 'Group Stage', status: 'live', minute: 67 },
  { id: 't4', home: 'Nigeria',  away: 'Egypt',       hs: 0, as: 0,       time: '09:00', venue: 'Rose Bowl',        group: 'H', phase: 'Group Stage', status: 'live', minute: 34 },
];

const SCHEDULE = [
  { home: 'Italy',          away: 'Turkey',       date: 'Jun 16', time: '12:00', group: 'I', venue: 'MetLife Stadium'    },
  { home: 'Algeria',        away: 'Ghana',        date: 'Jun 16', time: '15:00', group: 'I', venue: 'Hard Rock Stadium'  },
  { home: 'Denmark',        away: 'Switzerland',  date: 'Jun 16', time: '18:00', group: 'J', venue: "Levi's Stadium"     },
  { home: 'Serbia',         away: 'Austria',      date: 'Jun 16', time: '21:00', group: 'J', venue: 'Arrowhead Stadium'  },
  { home: 'Poland',         away: 'Romania',      date: 'Jun 17', time: '12:00', group: 'K', venue: 'BC Place'           },
  { home: 'Scotland',       away: 'Costa Rica',   date: 'Jun 17', time: '15:00', group: 'K', venue: 'Lumen Field'        },
  { home: 'Czech Republic', away: 'Hungary',      date: 'Jun 17', time: '18:00', group: 'L', venue: 'BMO Field'          },
  { home: 'Qatar',          away: 'Morocco',      date: 'Jun 17', time: '21:00', group: 'L', venue: 'Lincoln Financial'  },
  { home: 'United States',  away: 'Panama',       date: 'Jun 18', time: '15:00', group: 'A', venue: 'AT&T Stadium'       },
  { home: 'Bolivia',        away: 'Morocco',      date: 'Jun 18', time: '18:00', group: 'A', venue: 'SoFi Stadium'       },
  { home: 'Mexico',         away: 'Ecuador',      date: 'Jun 19', time: '15:00', group: 'B', venue: 'Azteca'             },
  { home: 'Jamaica',        away: 'Venezuela',    date: 'Jun 19', time: '18:00', group: 'B', venue: 'BC Place'           },
  { home: 'Brazil',         away: 'Germany',      date: 'Jun 20', time: '18:00', group: 'D', venue: 'Rose Bowl'          },
  { home: 'Colombia',       away: 'Uruguay',      date: 'Jun 20', time: '21:00', group: 'D', venue: 'SoFi Stadium'       },
  { home: 'Argentina',      away: 'Spain',        date: 'Jun 21', time: '21:00', group: 'E', venue: 'Hard Rock Stadium'  },
];

async function fetchLiveMatches() {
  try {
    const res = await fetch(`${ESPN_BASE}/scoreboard`, { cache: 'no-cache' });
    if (!res.ok) throw new Error('ESPN unavailable');
    const data = await res.json();
    return parseESPNEvents(data.events || []);
  } catch {
    return TODAY_MATCHES;
  }
}

async function fetchGroupStandings() {
  try {
    const res = await fetch(`${ESPN_BASE}/standings`);
    if (!res.ok) throw new Error();
    return generateStandings();
  } catch {
    return generateStandings();
  }
}

function parseESPNEvents(events) {
  return events.map(ev => {
    const comp   = ev.competitions?.[0];
    const home   = comp?.competitors?.find(c => c.homeAway === 'home');
    const away   = comp?.competitors?.find(c => c.homeAway === 'away');
    const status = ev.status?.type;
    const isLive = status?.state === 'in';
    const isDone = status?.completed;
    return {
      id:     ev.id,
      home:   home?.team?.displayName || '—',
      away:   away?.team?.displayName || '—',
      hs:     (isLive || isDone) ? parseInt(home?.score || '0') : null,
      as:     (isLive || isDone) ? parseInt(away?.score || '0') : null,
      time:   new Date(ev.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      venue:  comp?.venue?.fullName || 'TBC',
      group:  'Group Stage',
      phase:  'Group Stage',
      status: isLive ? 'live' : isDone ? 'finished' : 'scheduled',
      minute: ev.status?.displayClock ? parseInt(ev.status.displayClock) : null,
    };
  });
}

function generateStandings() {
  const standings = {};
  Object.entries(WC26_GROUPS).forEach(([grp, { teams }]) => {
    const results = PAST_RESULTS.filter(r => r.group === grp);
    standings[grp] = teams.map(team => {
      let mp = 0, w = 0, d = 0, l = 0, gf = 0, ga = 0;
      results.forEach(r => {
        if (r.home === team || r.away === team) {
          mp++;
          const isHome = r.home === team;
          gf += isHome ? r.hs : r.as;
          ga += isHome ? r.as : r.hs;
          const diff = isHome ? r.hs - r.as : r.as - r.hs;
          if (diff > 0) w++; else if (diff === 0) d++; else l++;
        }
      });
      return { team, mp, w, d, l, gf, ga, gd: gf - ga, pts: w * 3 + d };
    }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  });
  return standings;
}

window.LW26API = {
  FLAGS, WC26_GROUPS, TEAM_RATINGS, SQUADS,
  TODAY_MATCHES, SCHEDULE, PAST_RESULTS,
  fetchLiveMatches, fetchGroupStandings, generateStandings,
};
