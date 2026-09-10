// Chiño AI — Datos verificados de LaLiga (fonte: Transfermarkt / ESPN / Eurosport / Marca / laliga.com)
// Temporada 2025-26: táboa FINAL oficial. Temporada 2026-27: snapshot xornada 4 (7 set 2026).

export const LIGA_TEAMS_2526 = [
  { pos: 1, team: 'FC Barcelona', p: 38, w: 31, d: 1, l: 6, gf: 95, ga: 36, gd: 59, pts: 94, zone: 'champions' },
  { pos: 2, team: 'Real Madrid', p: 38, w: 27, d: 5, l: 6, gf: 77, ga: 35, gd: 42, pts: 86, zone: 'champions' },
  { pos: 3, team: 'Villarreal', p: 38, w: 22, d: 6, l: 10, gf: 72, ga: 46, gd: 26, pts: 72, zone: 'champions' },
  { pos: 4, team: 'Atlético de Madrid', p: 38, w: 21, d: 6, l: 11, gf: 62, ga: 44, gd: 18, pts: 69, zone: 'champions' },
  { pos: 5, team: 'Real Betis', p: 38, w: 15, d: 15, l: 8, gf: 59, ga: 48, gd: 11, pts: 60, zone: 'champions' },
  { pos: 6, team: 'RC Celta', p: 38, w: 14, d: 12, l: 12, gf: 53, ga: 48, gd: 5, pts: 54, zone: 'europa' },
  { pos: 7, team: 'Getafe', p: 38, w: 15, d: 6, l: 17, gf: 32, ga: 38, gd: -6, pts: 51, zone: 'conference' },
  { pos: 8, team: 'Rayo Vallecano', p: 38, w: 12, d: 14, l: 12, gf: 41, ga: 44, gd: -3, pts: 50, zone: null },
  { pos: 9, team: 'Valencia', p: 38, w: 13, d: 10, l: 15, gf: 46, ga: 55, gd: -9, pts: 49, zone: null },
  { pos: 10, team: 'Real Sociedad', p: 38, w: 11, d: 13, l: 14, gf: 59, ga: 61, gd: -2, pts: 46, zone: 'europa' },
  { pos: 11, team: 'Espanyol', p: 38, w: 12, d: 10, l: 16, gf: 43, ga: 55, gd: -12, pts: 46, zone: null },
  { pos: 12, team: 'Athletic Club', p: 38, w: 13, d: 6, l: 19, gf: 43, ga: 58, gd: -15, pts: 45, zone: null },
  { pos: 13, team: 'Sevilla', p: 38, w: 12, d: 7, l: 19, gf: 46, ga: 60, gd: -14, pts: 43, zone: null },
  { pos: 14, team: 'Alavés', p: 38, w: 11, d: 10, l: 17, gf: 44, ga: 56, gd: -12, pts: 43, zone: null },
  { pos: 15, team: 'Elche', p: 38, w: 10, d: 13, l: 15, gf: 49, ga: 57, gd: -8, pts: 43, zone: null },
  { pos: 16, team: 'Levante', p: 38, w: 11, d: 9, l: 18, gf: 47, ga: 61, gd: -14, pts: 42, zone: null },
  { pos: 17, team: 'Osasuna', p: 38, w: 11, d: 9, l: 18, gf: 44, ga: 50, gd: -6, pts: 42, zone: null },
  { pos: 18, team: 'Mallorca', p: 38, w: 11, d: 9, l: 18, gf: 47, ga: 57, gd: -10, pts: 42, zone: 'relegation' },
  { pos: 19, team: 'Girona', p: 38, w: 9, d: 14, l: 15, gf: 39, ga: 55, gd: -16, pts: 41, zone: 'relegation' },
  { pos: 20, team: 'Real Oviedo', p: 38, w: 6, d: 11, l: 21, gf: 26, ga: 60, gd: -34, pts: 29, zone: 'relegation' },
]

export const LIGA_2526_NOTES = {
  champion: 'FC Barcelona (94 pts)',
  championsLeague: ['FC Barcelona', 'Real Madrid', 'Villarreal', 'Atlético de Madrid', 'Real Betis'],
  europaLeague: ['RC Celta (6º, 54 pts)', 'Real Sociedad (campioa de Copa)'],
  conference: ['Getafe'],
  relegated: ['Mallorca', 'Girona', 'Real Oviedo'],
  promoted: ['Racing de Santander', 'Deportivo de La Coruña', 'Málaga'],
  celta: 'O Celta rematou 6º con 54 puntos (14V 12E 12D, 53:48) e clasificouse para a Europa League 2026-27. Fonte: Transfermarkt / ESPN.',
}

// Snapshot verificado da 2026-27 a 7 de setembro de 2026 (xornada 4). Fonte: La Vanguardia / laliga.com / AS.
export const LIGA_2627_SNAPSHOT = {
  updated: '7 de setembro de 2026 (xornada 4)',
  leader: 'FC Barcelona',
  championsZone: ['FC Barcelona', 'Alavés', 'Real Madrid', 'Real Betis'],
  europaZone: ['Deportivo de La Coruña'],
  conferenceZone: ['Atlético de Madrid'],
  relegationZone: ['Málaga', 'Elche', 'Valencia'],
  teams: ['Alavés', 'Athletic Club', 'Atlético de Madrid', 'FC Barcelona', 'Real Betis', 'RC Celta', 'Deportivo de La Coruña', 'Elche', 'Espanyol', 'Getafe', 'Levante', 'Málaga', 'Osasuna', 'Racing de Santander', 'Rayo Vallecano', 'Real Madrid', 'Real Sociedad', 'Sevilla', 'Valencia', 'Villarreal'],
  note: 'Temporada en curso. O Celta xoga a Europa League 2026-27 como 6º da 2025-26. Para a táboa ao segundo, ver ligazóns oficiais.',
}

export const LIGA_LIVE_LINKS = [
  { label: 'laliga.com (oficial)', url: 'https://www.laliga.com/laliga-easports/clasificacion' },
  { label: 'Marca', url: 'https://www.marca.com/futbol/primera-division/clasificacion.html' },
  { label: 'AS', url: 'https://as.com/resultados/futbol/primera/2026_2027/clasificacion/' },
]

// Texto inxectado ao axente para que responda "como vai hoxe" sen alucinar.
export const LIGA_AGENT_SNAPSHOT = `DATOS DE LALIGA (verificados, non inventar outros):
- Final 2025-26: campión FC Barcelona (94 pts). Champions: Barça, Real Madrid (86), Villarreal (72), Atlético (69), Betis (60). Europa League: RC CELTA 6º con 54 pts (14V-12E-12D, 53:48) e Real Sociedad (campioa de Copa). Conference: Getafe (7º, 51). Descenderon: Mallorca (18º), Girona (19º), Oviedo (20º). Ascenderon: Racing, Deportivo de La Coruña e Málaga.
- 2026-27 EN CURSO (snapshot 7 setembro 2026, xornada 4): líder FC Barcelona. Zona Champions: Barça, Alavés, Real Madrid, Betis. Europa League: Deportivo. Conference: Atlético. Descenso: Málaga, Elche, Valencia. O Celta xoga Europa League 2026-27.
- Se preguntan pola posición exacta de hoxe ou xornada posterior ao snapshot, di a data do snapshot e remite á clasificación en directo de laliga.com.`
