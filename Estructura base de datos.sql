-- Tabla de Jugadores (Histórico y Actual)
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    birth_date DATE,
    nationality VARCHAR(100),
    position VARCHAR(50), -- 'Delantero', 'Centrocampista', etc.
    debut_date DATE,
    last_match_date DATE,
    total_matches INT DEFAULT 0,
    total_goals INT DEFAULT 0,
    total_assists INT DEFAULT 0,
    is_legend BOOLEAN DEFAULT FALSE, -- Para destacar a los Top 50
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de Partidos (Para calcular resultados y alineaciones)
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    match_date DATE,
    competition VARCHAR(100), -- 'La Liga', 'Copa del Rey', 'UEFA'
    home_team VARCHAR(100) DEFAULT 'RC Celta',
    away_team VARCHAR(100),
    home_score INT,
    away_score INT,
    stadium VARCHAR(100) DEFAULT 'Balaídos',
    attendance INT,
    season VARCHAR(9) -- '1923-1924'
);

-- Tabla de Estadísticas Detalladas por Jugador por Partido (Para los 25 criterios avanzados)
CREATE TABLE player_match_stats (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id),
    player_id INT REFERENCES players(id),
    minutes_played INT,
    goals INT,
    assists INT,
    yellow_cards INT,
    red_cards INT,
    rating DECIMAL(3,2), -- Nota media del partido si disponible
    xg DECIMAL(4,2), -- Expected Goals (era moderna)
    xa DECIMAL(4,2)  -- Expected Assists (era moderna)
);

-- Tabla de Staff y Directiva (Histórico)
CREATE TABLE staff_history (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    role VARCHAR(100), -- 'Presidente', 'Entrenador', 'Médico Jefe'
    start_date DATE,
    end_date DATE,
    notes TEXT -- Hitos conseguidos en ese periodo
);