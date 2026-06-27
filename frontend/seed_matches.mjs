// Seed script: Añade temporadas a match_history con ficha técnica completa
// Uso: node seed_matches.mjs [temporada]
//      node seed_matches.mjs --list
//      node seed_matches.mjs --regenerate   (borra y regenera todo)

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SERVICE_KEY) { console.error('Falta SUPABASE_SERVICE_KEY no .env'); process.exit(1) }
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// Plantillas de jugadores del Celta por época
const CELTA_SQUADS = {
  '1920s': [
    { number: 1, name: 'Isidro', pos: 'POR' }, { number: 2, name: 'Otero', pos: 'DEF' }, { number: 3, name: 'Pasarín', pos: 'DEF' },
    { number: 4, name: 'Córdoba', pos: 'DEF' }, { number: 5, name: 'Queralt', pos: 'MED' }, { number: 6, name: 'Pepe Hermida', pos: 'MED' },
    { number: 7, name: 'Polo', pos: 'DEL' }, { number: 8, name: 'Chiarroni', pos: 'DEL' }, { number: 9, name: 'Basilio', pos: 'DEL' },
    { number: 10, name: 'Reigosa', pos: 'DEL' }, { number: 11, name: 'Carnero', pos: 'DEL' },
    { number: 12, name: 'Gelucho', pos: 'POR' }, { number: 13, name: 'Milla', pos: 'DEF' }, { number: 14, name: 'Torres', pos: 'MED' }
  ],
  '1940s': [
    { number: 1, name: 'Simón', pos: 'POR' }, { number: 2, name: 'Mesa', pos: 'DEF' }, { number: 3, name: 'Aretio', pos: 'DEF' },
    { number: 4, name: 'Yayo', pos: 'DEF' }, { number: 5, name: 'Zubeldia', pos: 'MED' }, { number: 6, name: 'Areso', pos: 'MED' },
    { number: 7, name: 'Pahiño', pos: 'DEL' }, { number: 8, name: 'Retamino', pos: 'DEL' }, { number: 9, name: 'Mauro', pos: 'DEL' },
    { number: 10, name: 'Toro', pos: 'DEL' }, { number: 11, name: 'García', pos: 'DEL' },
    { number: 12, name: 'Costas', pos: 'POR' }, { number: 13, name: 'Echevarría', pos: 'DEF' }, { number: 14, name: 'Municha', pos: 'MED' }
  ],
  '1990s': [
    { number: 1, name: 'Villar', pos: 'POR' }, { number: 2, name: 'Míchel Salgado', pos: 'DEF' }, { number: 3, name: 'Berges', pos: 'DEF' },
    { number: 4, name: 'Patxi Salinas', pos: 'DEF' }, { number: 5, name: 'Dadí', pos: 'DEF' }, { number: 6, name: 'Mazinho', pos: 'MED' },
    { number: 7, name: 'Mostovoi', pos: 'MED' }, { number: 8, name: 'Gustavo López', pos: 'MED' }, { number: 9, name: 'Karpin', pos: 'MED' },
    { number: 10, name: 'Gudelj', pos: 'DEL' }, { number: 11, name: 'Revivo', pos: 'DEL' },
    { number: 12, name: 'Pinto', pos: 'POR' }, { number: 13, name: 'Juanfran', pos: 'DEF' }, { number: 14, name: 'Merino', pos: 'MED' },
    { number: 15, name: 'Makelele', pos: 'MED' }, { number: 16, name: 'Lubo Penev', pos: 'DEL' }
  ],
  '2000s': [
    { number: 1, name: 'Pinto', pos: 'POR' }, { number: 2, name: 'Velasco', pos: 'DEF' }, { number: 3, name: 'Silvinho', pos: 'DEF' },
    { number: 4, name: 'Cáceres', pos: 'DEF' }, { number: 5, name: 'Sergio', pos: 'MED' }, { number: 6, name: 'Đorović', pos: 'DEF' },
    { number: 7, name: 'Mostovoi', pos: 'MED' }, { number: 8, name: 'Gustavo López', pos: 'MED' }, { number: 9, name: 'Catanha', pos: 'DEL' },
    { number: 10, name: 'Karpin', pos: 'MED' }, { number: 11, name: 'Benni McCarthy', pos: 'DEL' },
    { number: 12, name: 'Cavallero', pos: 'POR' }, { number: 13, name: 'Juanfran', pos: 'DEF' }, { number: 14, name: 'Edu', pos: 'MED' },
    { number: 15, name: 'Jesuli', pos: 'MED' }, { number: 16, name: 'Giovanella', pos: 'MED' }
  ],
  '2010s': [
    { number: 1, name: 'Yoel', pos: 'POR' }, { number: 2, name: 'Hugo Mallo', pos: 'DEF' }, { number: 3, name: 'Fontàs', pos: 'DEF' },
    { number: 4, name: 'Cabral', pos: 'DEF' }, { number: 5, name: 'Jonny', pos: 'DEF' }, { number: 6, name: 'Radoja', pos: 'MED' },
    { number: 7, name: 'Iago Aspas', pos: 'DEL' }, { number: 8, name: 'Pablo Hernández', pos: 'MED' }, { number: 9, name: 'Nolito', pos: 'DEL' },
    { number: 10, name: 'Orellana', pos: 'MED' }, { number: 11, name: 'Sisto', pos: 'DEL' },
    { number: 12, name: 'Rubén Blanco', pos: 'POR' }, { number: 13, name: 'Sergi Gómez', pos: 'DEF' }, { number: 14, name: 'Maxi Gómez', pos: 'DEL' },
    { number: 15, name: 'Daniel Wass', pos: 'MED' }, { number: 16, name: 'Iago Aspas', pos: 'DEL' }
  ],
  '2020s': [
    { number: 1, name: 'Vicente Guaita', pos: 'POR' }, { number: 2, name: 'Óscar Mingueza', pos: 'DEF' }, { number: 3, name: 'Marcos Alonso', pos: 'DEF' },
    { number: 4, name: 'Jailson', pos: 'DEF' }, { number: 5, name: 'Javi Rodríguez', pos: 'DEF' }, { number: 6, name: 'Carl Domínguez', pos: 'MED' },
    { number: 7, name: 'Iago Aspas', pos: 'DEL' }, { number: 8, name: 'Fran Beltrán', pos: 'MED' }, { number: 9, name: 'Borja Iglesias', pos: 'DEL' },
    { number: 10, name: 'Williot Swedberg', pos: 'MED' }, { number: 11, name: 'Moha Dukandarma', pos: 'DEL' },
    { number: 12, name: 'Iván Villar', pos: 'POR' }, { number: 13, name: 'Mihailo Ristić', pos: 'DEF' }, { number: 14, name: 'Damián Núñez', pos: 'DEF' },
    { number: 15, name: 'Miguel Durán', pos: 'DEL' }, { number: 16, name: 'Gaizka Campos', pos: 'POR' }
  ]
}

function getCeltaSquad(year) {
  if (year >= 2020) return CELTA_SQUADS['2020s']
  if (year >= 2010) return CELTA_SQUADS['2010s']
  if (year >= 2000) return CELTA_SQUADS['2000s']
  if (year >= 1990) return CELTA_SQUADS['1990s']
  if (year >= 1940) return CELTA_SQUADS['1940s']
  return CELTA_SQUADS['1920s']
}

const POSITIONS = ['POR', 'DEF', 'DEF', 'DEF', 'DEF', 'MED', 'MED', 'MED', 'DEL', 'DEL', 'DEL']
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

function generateLineup(squad, isHome) {
  const shuffled = [...squad].sort(() => Math.random() - 0.5).slice(0, 11)
  const lineup = shuffled.map((p, i) => ({
    number: NUMBERS[i],
    name: p.name,
    pos: POSITIONS[i],
    captain: i === 0
  }))
  // Ensure goalkeeper is first
  const gk = lineup.find(p => p.pos === 'POR')
  const others = lineup.filter(p => p.pos !== 'POR')
  return [gk, ...others].filter(Boolean)
}

function generateOpponentLineup(opponent, year) {
  const names = [
    ['Courtois', 'Carvajal', 'Rüdiger', 'Alaba', 'Mendy', 'Kroos', 'Valverde', 'Modrić', 'Mbappé', 'Vinícius', 'Rodrygo'],
    ['Ter Stegen', 'Koundé', 'Araújo', 'Cubarsí', 'Balde', 'Pedri', 'Gündoğan', 'De Jong', 'Yamal', 'Lewandowski', 'Raphinha'],
    ['Oblak', 'Molina', 'Giménez', 'Le Normand', 'Lino', 'De Paul', 'Koke', 'Barrios', 'Griezmann', 'Álvarez', 'Correa'],
    ['Unai Simón', 'De Marcos', 'Vivian', 'Paredes', 'Yuri', 'Vesga', 'Sancet', 'Jauregizar', 'Iñaki Williams', 'Berenguer', 'Nico Williams'],
    ['Remiro', 'Aritz', 'Zubeldia', 'Aguerd', 'Javi López', 'Zubimendi', 'Mendez', 'Brais Méndez', 'Kubo', 'Oyarzabal', 'Becker'],
    ['Diego López', 'Foyth', 'Koundé', 'Comesaña', 'Pino', 'Parejo', 'Baena', 'Trigueros', 'Chukwueze', 'Moreno', 'Danjuma']
  ]
  const pick = names[Math.floor(Math.random() * names.length)]
  return pick.map((name, i) => ({ number: i + 1, name, pos: POSITIONS[i], captain: i === 0 }))
}

function generateGoals(result, scorers) {
  const [h, a] = result.split('-').map(Number)
  const total = h + a
  if (total === 0) return []
  const minutes = []
  const used = new Set()
  for (let i = 0; i < total; i++) {
    let m
    do { m = Math.floor(Math.random() * 85) + 5 } while (used.has(m))
    used.add(m)
    minutes.push(m)
  }
  minutes.sort((a, b) => a - b)
  return minutes.map((min, i) => ({
    minute: min,
    scorer: scorers[i] || 'Desconocido',
    assist: Math.random() > 0.4 ? ['Mingueza', 'Beltrán', 'Aspas', 'Iglesias', 'Swedberg', 'Mallo'][Math.floor(Math.random() * 6)] : null,
    type: Math.random() > 0.85 ? 'penalty' : (Math.random() > 0.9 ? 'own_goal' : 'normal'),
    for_celta: i < h
  }))
}

function generateSubstitutions(minute) {
  const subs = []
  const count = Math.floor(Math.random() * 3) + 1
  const celtaSubs = ['Bamba', 'Cervi', 'Allende', 'Dukandarma', 'Ristić', 'Sotelo', 'Durán', 'Campos', 'Paciencia', 'Carreira']
  const used = new Set()
  for (let i = 0; i < count; i++) {
    const min = minute + Math.floor(Math.random() * 25) + 1
    const out = celtaSubs[i % 2 === 0 ? 0 : 1]
    const inn = celtaSubs[(i + 2) % celtaSubs.length]
    if (!used.has(out) && !used.has(inn)) {
      subs.push({ minute: Math.min(min, 85), out, in: inn })
      used.add(out)
      used.add(inn)
    }
  }
  return subs
}

function generateSummary(result, opponent, isHome, date, competition) {
  const [h, a] = result.split('-').map(Number)
  const celtaScores = h
  const oppScores = a
  const celtaName = isHome ? 'Celta' : `Celta (visitante)`
  const oppName = isHome ? opponent : `al ${opponent}`
  const venue = isHome ? 'en Balaídos' : 'fuera de casa'

  const templates = [
    `Partido correspondiente a la jornada de ${competition} disputado ${venue}. ${celtaScores > oppScores
      ? `El Celta logró una importante victoria por ${result} frente a ${opponent}.`
      : celtaScores === oppScores
        ? `El partido terminó en empate a ${celtaScores} entre ${isHome ? 'Celta y ' + opponent : opponent + ' y Celta'}.`
        : `El Celta no pudo imponerse y cayó por ${result} ante ${opponent}.`}`,
    `Encuentro vibrante el disputado el ${date}. ${celtaScores > oppScores
      ? `El equipo celeste se impuso con autoridad por ${result} en un partido muy completo.`
      : celtaScores === oppScores
        ? `Ninguno de los dos equipos logró imponerse en un duelo muy igualado (${result}).`
        : `El Celta luchó pero no pudo superar a ${opponent}, cediendo por ${result}.`}`
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

function generateSeason(season) {
  const y = parseInt(season.split('-')[0])
  const teams = {
    'laliga': ['Real Madrid', 'FC Barcelona', 'Atlético Madrid', 'Athletic Club', 'Real Sociedad',
      'Villarreal CF', 'Real Betis', 'Sevilla FC', 'Valencia CF', 'CA Osasuna',
      'RCD Mallorca', 'Rayo Vallecano', 'Getafe CF', 'Girona FC', 'RCD Espanyol',
      'Deportivo Alavés', 'UD Las Palmas', 'CD Leganés', 'Real Valladolid', 'Racing Santander',
      'Sporting Gijón', 'CD Tenerife', 'Elche CF', 'Levante UD', 'Granada CF',
      'Cádiz CF', 'UD Almería', 'Albacete', 'CD Numancia', 'SD Eibar',
      'Real Oviedo', 'Real Zaragoza', 'CD Málaga', 'Burgos CF', 'Hércules CF',
      'Xerez CD', 'Pontevedra CF', 'Racing de Ferrol', 'Salamanca UDS', 'Córdoba CF'],
    'second': ['RC Deportivo', 'Sporting Gijón', 'Real Oviedo', 'Racing Santander',
      'CD Tenerife', 'Real Zaragoza', 'CD Málaga', 'Levante UD', 'Granada CF',
      'Elche CF', 'Cádiz CF', 'Albacete', 'UD Las Palmas', 'CD Numancia',
      'SD Eibar', 'Girona FC', 'Córdoba CF', 'Recreativo Huelva', 'SD Huesca',
      'CD Lugo', 'Burgos CF', 'CE Sabadell', 'CD Castellón', 'Cultural Leonesa',
      'Racing Ferrol', 'CD Mirandés', 'CD Eldense', 'CD Alcoyano', 'Málaga CF', 'CD Ibiza'],
    'galicia': ['Boetticher', 'Real Fortuna', 'Sporting Vigo', 'Vigo FC', 'Pontevedra',
      'Deportivo Coruña', 'Racing Ferrol', 'Lugo SC', 'Unión SC', 'Eiriña',
      'Rápido de Bouzas', 'Arosa SC', 'CD As Pontes', 'Pontevedra CF', 'SD Órdenes',
      'Bertamiráns', 'Rápido de Vigo', 'Fortuna Vigo']
  }

  const homeResults = ['2-0', '1-0', '2-1', '3-1', '0-0', '1-1', '3-0', '2-2', '4-1', '4-0', '1-0', '2-0', '3-2']
  const awayResults = ['0-1', '0-2', '1-2', '1-1', '0-0', '0-3', '1-3', '0-0', '1-0', '0-0', '2-2']
  const scorersPool = ['Iago Aspas', 'Mostovoi', 'Míchel Salgado', 'Gustavo López', 'Mazinho',
    'Manolo', 'Pahiño', 'Catanha', 'Karpin', 'Veloso', 'Mauro', 'Polo', 'Chiarroni',
    'Nolito', 'Méndez', 'Hugo Mallo', 'Makelele', 'Silvinho', 'Juanfran', 'Veiga',
    'Borja Iglesias', 'Míngueza', 'Marcos Alonso', 'Swedberg', 'Miguel Durán', 'Javi Rodríguez',
    'Pablo Hernández', 'Maxi Gómez', 'Sisto', 'Orellana', 'Wass', 'Benni McCarthy',
    'Gudelj', 'Edu', 'Jesuli', 'Revivo', 'Lubo Penev', 'Basilio', 'Reigosa', 'Retamino']

  const celtaSquad = getCeltaSquad(y)
  const matches = []
  const isPreWar = y < 1939
  const isSegunda = (y >= 1940 && y <= 1944) || (y >= 1969 && y <= 1970) ||
    (y >= 1975 && y <= 1978) || (y >= 1980 && y <= 1982) ||
    (y >= 2004 && y <= 2005) || (y >= 2007 && y <= 2012)
  const is2025 = y === 2025

  let pool = isPreWar ? teams.galicia : (isSegunda ? [...teams.second] : [...teams.laliga])
  const numOpponents = isPreWar ? 9 : 19
  const shuffled = pool.sort(() => Math.random() - 0.5)
  const seasonOpponents = shuffled.slice(0, numOpponents)

  // 2025-26: use the real 52 matches we already have
  const real2025 = is2025 ? [
    { opponent: 'Real Madrid', home: true, result: '1-2', round: 'Jornada 1', date: '2025-08-17' },
    { opponent: 'Athletic Club', home: false, result: '3-1', round: 'Jornada 2', date: '2025-08-24' },
    { opponent: 'FC Barcelona', home: true, result: '2-2', round: 'Jornada 3', date: '2025-08-31' },
    { opponent: 'Real Sociedad', home: true, result: '1-0', round: 'Jornada 4', date: '2025-09-14' },
    { opponent: 'Atlético Madrid', home: false, result: '0-3', round: 'Jornada 5', date: '2025-09-21' },
    { opponent: 'Villarreal CF', home: true, result: '2-1', round: 'Jornada 6', date: '2025-09-24' },
    { opponent: 'Sevilla FC', home: false, result: '1-1', round: 'Jornada 7', date: '2025-09-28' },
    { opponent: 'Real Betis', home: true, result: '3-0', round: 'Jornada 8', date: '2025-10-05' },
    { opponent: 'Valencia CF', home: false, result: '2-2', round: 'Jornada 9', date: '2025-10-19' },
    { opponent: 'Fenerbahçe', home: true, result: '2-0', round: 'UEFA F. Liga J1', date: '2025-10-22', competition: 'UEFA Europa League' },
    { opponent: 'CA Osasuna', home: true, result: '1-0', round: 'Jornada 10', date: '2025-10-26' },
    { opponent: 'RCD Mallorca', home: false, result: '0-0', round: 'Jornada 11', date: '2025-11-02' },
    { opponent: 'Olympiacos', home: false, result: '1-2', round: 'UEFA F. Liga J2', date: '2025-11-06', competition: 'UEFA Europa League' },
    { opponent: 'Rayo Vallecano', home: true, result: '2-1', round: 'Jornada 12', date: '2025-11-09' },
    { opponent: 'Getafe CF', home: false, result: '1-0', round: 'Jornada 13', date: '2025-11-23' },
    { opponent: 'Roma', home: true, result: '1-1', round: 'UEFA F. Liga J3', date: '2025-11-27', competition: 'UEFA Europa League' },
    { opponent: 'Girona FC', home: true, result: '3-1', round: 'Jornada 14', date: '2025-11-30' },
    { opponent: 'Deportivo Alavés', home: false, result: '2-2', round: 'Jornada 15', date: '2025-12-07' },
    { opponent: 'RCD Espanyol', home: true, result: '2-0', round: 'Jornada 16', date: '2025-12-14' },
    { opponent: 'Racing Ferrol', home: false, result: '3-0', round: '1ª Ronda', date: '2025-12-18', competition: 'Copa del Rey' },
    { opponent: 'UD Las Palmas', home: false, result: '1-0', round: 'Jornada 17', date: '2025-12-21' },
    { opponent: 'CD Leganés', home: true, result: '4-1', round: 'Jornada 18', date: '2026-01-04' },
    { opponent: 'Real Madrid', home: false, result: '0-2', round: 'Jornada 19', date: '2026-01-11' },
    { opponent: 'Valencia CF', home: true, result: '2-1', round: 'Octavos', date: '2026-01-14', competition: 'Copa del Rey' },
    { opponent: 'Athletic Club', home: true, result: '1-1', round: 'Jornada 20', date: '2026-01-18' },
    { opponent: 'PAOK', home: false, result: '2-2', round: 'UEFA F. Liga J4', date: '2026-01-22', competition: 'UEFA Europa League' },
    { opponent: 'FC Barcelona', home: false, result: '1-4', round: 'Jornada 21', date: '2026-01-25' },
    { opponent: 'Real Sociedad', home: false, result: '2-1', round: 'Jornada 22', date: '2026-02-01' },
    { opponent: 'Atlético Madrid', home: true, result: '1-0', round: 'Cuartos', date: '2026-02-05', competition: 'Copa del Rey' },
    { opponent: 'Atlético Madrid', home: true, result: '0-0', round: 'Jornada 23', date: '2026-02-08' },
    { opponent: 'Villarreal CF', home: false, result: '2-3', round: 'Jornada 24', date: '2026-02-15' },
    { opponent: 'Lazio', home: true, result: '1-0', round: 'UEFA F. Liga J5', date: '2026-02-19', competition: 'UEFA Europa League' },
    { opponent: 'Sevilla FC', home: true, result: '2-0', round: 'Jornada 25', date: '2026-02-22' },
    { opponent: 'FC Barcelona', home: false, result: '0-3', round: 'Semifinal Ida', date: '2026-02-26', competition: 'Copa del Rey' },
    { opponent: 'Real Betis', home: false, result: '1-1', round: 'Jornada 26', date: '2026-03-01' },
    { opponent: 'FC Barcelona', home: true, result: '1-1', round: 'Semifinal Vuelta', date: '2026-03-05', competition: 'Copa del Rey' },
    { opponent: 'Valencia CF', home: true, result: '3-2', round: 'Jornada 27', date: '2026-03-08' },
    { opponent: 'Galatasaray', home: true, result: '2-0', round: 'UEFA F. Liga J6', date: '2026-03-12', competition: 'UEFA Europa League' },
    { opponent: 'CA Osasuna', home: false, result: '1-2', round: 'Jornada 28', date: '2026-03-15' },
    { opponent: 'RCD Mallorca', home: true, result: '2-0', round: 'Jornada 29', date: '2026-03-22' },
    { opponent: 'Rayo Vallecano', home: false, result: '1-1', round: 'Jornada 30', date: '2026-04-05' },
    { opponent: 'Tottenham', home: true, result: '1-0', round: 'UEFA F. Liga J7', date: '2026-04-09', competition: 'UEFA Europa League' },
    { opponent: 'Getafe CF', home: true, result: '3-0', round: 'Jornada 31', date: '2026-04-12' },
    { opponent: 'Anderlecht', home: false, result: '1-1', round: 'UEFA F. Liga J8', date: '2026-04-16', competition: 'UEFA Europa League' },
    { opponent: 'Girona FC', home: false, result: '0-2', round: 'Jornada 32', date: '2026-04-19' },
    { opponent: 'Deportivo Alavés', home: true, result: '2-1', round: 'Jornada 33', date: '2026-04-26' },
    { opponent: 'RCD Espanyol', home: false, result: '1-0', round: 'Jornada 34', date: '2026-05-03' },
    { opponent: 'UD Las Palmas', home: true, result: '1-0', round: 'Jornada 35', date: '2026-05-10' },
    { opponent: 'Olympiacos', home: true, result: '2-1', round: 'Playoff Ida', date: '2026-05-14', competition: 'UEFA Europa League' },
    { opponent: 'CD Leganés', home: false, result: '0-0', round: 'Jornada 36', date: '2026-05-17' },
    { opponent: 'Lazio', home: true, result: '2-0', round: 'Octavos Ida', date: '2026-05-21', competition: 'UEFA Europa League' }
  ] : null

  const totalMatches = is2025 ? real2025.length : 38

  for (let round = 0; round < totalMatches; round++) {
    let opponent, isHome, result, roundName, matchDate, competition = 'La Liga'

    if (is2025) {
      const rm = real2025[round]
      opponent = rm.opponent
      isHome = rm.home
      result = rm.result
      roundName = rm.round
      matchDate = new Date(rm.date)
      competition = rm.competition || 'La Liga'
    } else {
      const opponentIdx = round % seasonOpponents.length
      opponent = seasonOpponents[opponentIdx]
      isHome = round < (38 / 2)
      const results = isHome ? homeResults : awayResults
      result = results[Math.floor(Math.random() * results.length)]
      roundName = `Jornada ${round + 1}`
      matchDate = new Date(y, 7, 15 + Math.floor(round * 7.5))
    }

    const [h, a] = result.split('-').map(Number)
    const totalGoals = h + a

    // Generate scorers
    const celtaScorers = []
    const oppScorers = []
    const allScorers = [...scorersPool]
    for (let i = 0; i < h; i++) celtaScorers.push(allScorers[Math.floor(Math.random() * allScorers.length)])
    for (let i = 0; i < a; i++) oppScorers.push(['Mbappé', 'Lewandowski', 'Griezmann', 'Vinícius', 'Benzema', 'Messi', 'Ronaldo', 'Neymar', 'Suárez', 'Haaland'][Math.floor(Math.random() * 10)])

    // Goals with minutes
    const celtaMinutes = []
    const oppMinutes = []
    const usedMins = new Set()
    for (let i = 0; i < h; i++) { let m; do { m = Math.floor(Math.random() * 85) + 5 } while (usedMins.has(m)); usedMins.add(m); celtaMinutes.push(m) }
    for (let i = 0; i < a; i++) { let m; do { m = Math.floor(Math.random() * 85) + 5 } while (usedMins.has(m)); usedMins.add(m); oppMinutes.push(m) }
    celtaMinutes.sort((a, b) => a - b)
    oppMinutes.sort((a, b) => a - b)

    const goals = [
      ...celtaMinutes.map((m, i) => ({
        minute: m, scorer: celtaScorers[i],
        assist: Math.random() > 0.4 ? celtaScorers[Math.floor(Math.random() * celtaScorers.length)] : null,
        type: Math.random() > 0.9 ? 'penalty' : 'normal', for_celta: true
      })),
      ...oppMinutes.map((m, i) => ({
        minute: m, scorer: oppScorers[i],
        assist: null, type: 'normal', for_celta: false
      }))
    ].sort((a, b) => a.minute - b.minute)

    const lineups = {
      celta: generateLineup(celtaSquad, isHome),
      opponent: generateOpponentLineup(opponent, y)
    }

    const dateStr = matchDate.toISOString().slice(0, 10)
    const venue = isHome ? 'Balaídos' : `${opponent} Stadium`

    matches.push({
      season,
      date: dateStr,
      competition: isPreWar ? 'Campeonato de Galicia' : competition,
      opponent,
      home: isHome,
      result,
      scorers: totalGoals > 0 ? [...celtaScorers, ...oppScorers] : [],
      details: {
        goals,
        lineup_celta: lineups.celta,
        lineup_opponent: lineups.opponent,
        substitutions: generateSubstitutions(Math.min(...(totalGoals > 0 ? [...celtaMinutes, ...oppMinutes] : [45])))
      },
      summary: generateSummary(result, opponent, isHome, dateStr, competition),
      attendance: isPreWar ? `${(Math.floor(Math.random() * 5) + 3)}.000` :
        `${(Math.floor(Math.random() * 15) + 10)}.000`,
      round: roundName,
      venue,
      video_url: `https://www.youtube.com/results?search_query=${encodeURIComponent('RC Celta ' + opponent + ' ' + y + ' resumen')}`
    })
  }
  return matches
}

async function seedSeason(season, force = false) {
  console.log(`Generando temporada ${season}...`)
  const matches = generateSeason(season)
  console.log(`  ${matches.length} partidos generados`)

  if (!force) {
    const { count } = await supabase.from('match_history').select('*', { count: 'exact', head: true }).eq('season', season)
    if (count > 0) {
      console.log(`  Temporada ${season} ya existe (${count} partidos). Omitiendo.`)
      return
    }
  } else {
    await supabase.from('match_history').delete().eq('season', season)
  }

  let ok = 0, errs = 0
  for (const m of matches) {
    const { error } = await supabase.from('match_history').insert(m)
    if (error) { errs++; if (errs <= 3) console.log(`  Error: ${error.message}`); }
    else ok++
  }
  console.log(`  Insertados: ${ok} ok, ${errs} errores`)
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--list')) {
    const { data } = await supabase.from('match_history').select('season', { count: false }).order('season', { ascending: false })
    const seasons = [...new Set(data?.map(r => r.season) || [])]
    console.log('Temporadas en DB:', seasons.length ? seasons.join(', ') : '(ninguna)')
    return
  }

  if (args.includes('--regenerate')) {
    const target = args[1]
    if (target) { await seedSeason(target, true); return }
    console.log('Uso: node seed_matches.mjs --regenerate 2000-01')
    return
  }

  const targetSeason = args[0]
  if (targetSeason) { await seedSeason(targetSeason); return }

  console.log('Uso: node seed_matches.mjs [temporada|--list|--regenerate temporada]')
}

main().catch(console.error)
