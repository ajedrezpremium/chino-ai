-- =============================================================
-- DATOS SEMILLA PARA LA DEMO DEL MVP
-- =============================================================

-- LEYENDAS (para la UI principal)
INSERT INTO legends (name, role, fact, image_url) VALUES
('Iago Aspas', 'Capitán Eterno', 'Máximo goleador histórico. O rei de Balaídos. Máis de 200 goles coa celeste.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Iago_Aspas_2018.jpg/800px-Iago_Aspas_2018.jpg'),
('Alejandro Mostovoi', 'O Zar', 'Magia pura nos 90. Llevó al Celta a Europa co seu talento único.', 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Aleksandr_Mostovoi.jpg'),
('Míchel Salgado', 'Muro Blanco', 'Defensa legendario. Corazón e raza galega. 200+ partidos de gloria.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Michel_Salgado_2008.jpg/640px-Michel_Salgado_2008.jpg'),
('Gustavo López', 'Mago Argentino', 'Talento puro na banda. Gol ao Liverpool en Anfield (2001). Inesquecible.', NULL),
('Mazinho', 'Corazón Brasileiro', 'Campeón do Mundo 94. Deixou alma en Balaídos. Referente internacional.', NULL);

-- JUGADORES HISTÓRICOS
INSERT INTO players (first_name, last_name, birth_date, nationality, position, debut_date, total_matches, total_goals, total_assists, is_legend) VALUES
('Iago', 'Aspas', '1987-08-01', 'España', 'Delantero', '2008-01-01', 450, 210, 85, TRUE),
('Alejandro', 'Mostovoi', '1968-08-22', 'Rusia', 'Centrocampista', '1996-01-01', 235, 72, 45, TRUE),
('Míchel', 'Salgado', '1975-10-22', 'España', 'Defensa', '1995-01-01', 290, 18, 22, TRUE),
('Gustavo', 'López', '1973-04-19', 'Argentina', 'Centrocampista', '1996-01-01', 250, 45, 60, TRUE),
('Mazinho', 'Oliveira', '1965-12-26', 'Brasil', 'Centrocampista', '1991-01-01', 180, 25, 30, TRUE),
('Patxi', 'Salinas', '1963-07-17', 'España', 'Delantero', '1988-01-01', 180, 65, 20, TRUE),
('Fernando', 'Veloso', '1952-03-15', 'España', 'Centrocampista', '1970-01-01', 240, 38, 15, TRUE),
('Hicham', 'Bouchama', '1999-04-22', 'España', 'Centrocampista', '2018-01-01', 80, 12, 8, FALSE),
('Javier', 'Aspas', '1983-06-18', 'España', 'Delantero', '2005-01-01', 120, 25, 15, FALSE),
('Pablo', 'Hernández', '1985-04-11', 'Argentina', 'Centrocampista', '2008-01-01', 120, 20, 25, FALSE);

-- STAFF HISTÓRICO
INSERT INTO staff_history (name, role, start_date, end_date, notes) VALUES
('Manuel Bárcena de Andrés', 'Presidente', '1923-08-23', '1927-01-01', 'Primer presidente na historia do club. Liderou a fusión.'),
('Carlos Mouriño', 'Presidente', '2006-06-01', '2025-06-01', 'Propietario. Delegou a presidencia na súa filla.'),
('Marián Mouriño Terrazo', 'Presidenta', '2025-06-01', NULL, 'Primeira muller presidenta do Celta. Filla de Carlos.'),
('Miguel Muñoz', 'Entrenador', '1968-07-01', '1969-06-30', 'Lenda do fútbol español. Adestrou ao Celta nunha época dourada.'),
('Carlos Aimar', 'Entrenador', '1993-07-01', '1994-06-30', 'Levou ao Celta á final de Copa en 1994.'),
('Víctor Fernández', 'Entrenador', '1998-07-01', '2002-06-30', 'Era dourada europea. UEFA 2000 e 2001.'),
('Eduardo Berizzo', 'Entrenador', '2014-07-01', '2017-06-30', 'Semifinais Europa League 2017. Estilo valente.');

-- PREGUNTAS PARA CHIÑO GAMER
INSERT INTO game_questions (question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, category) VALUES
('En que ano se fundou o Real Club Celta de Vigo?', '1906', '1923', '1931', '1945', 'B', 1, 'Historia'),
('Quen é o máximo goleador histórico do Celta?', 'Mostovoi', 'Míchel Salgado', 'Iago Aspas', 'Gustavo López', 'C', 1, 'Jugadores'),
('Como se chama o estadio do Celta?', 'Riazor', 'San Mamés', 'Balaídos', 'El Molinón', 'C', 1, 'Estadio'),
('Que xogador era coñecido como O Zar?', 'Mazinho', 'Mostovoi', 'Veloso', 'Salinas', 'B', 2, 'Jugadores'),
('Quen marcou o gol da vitoria contra o Liverpool en Anfield (2001)?', 'Mostovoi', 'Míchel Salgado', 'Gustavo López', 'Iago Aspas', 'C', 2, 'Historia'),
('Cantas veces gañou o Celta a Copa do Rei?', '0', '1', '2', '3', 'A', 2, 'Historia'),
('Que xogador do Celta foi campión do Mundo en 1994?', 'Mostovoi', 'Salinas', 'Mazinho', 'Veloso', 'C', 2, 'Jugadores'),
('Cal é a capacidade actual de Balaídos?', '15.000', '20.000', '29.000', '35.000', 'C', 1, 'Estadio'),
('Quen foi o primeiro presidente do Celta?', 'Carlos Mouriño', 'Manuel Bárcena', 'Miguel Muñoz', 'Víctor Fernández', 'B', 2, 'Historia'),
('En que tempada debutou Iago Aspas co primeiro equipo?', '2006-2007', '2007-2008', '2008-2009', '2010-2011', 'C', 2, 'Jugadores'),
('Como se chamaban os dous clubs que se fusionaron para crear o Celta?', 'Real Fortuna e Sporting', 'Atlántida e Olímpico', 'Vigo FC e Fortuna', 'Real Vigo Deportivo e Sporting', 'A', 3, 'Historia'),
('Que adestrador levou ao Celta ás semifinais da Europa League en 2017?', 'Víctor Fernández', 'Berizzo', 'Carlos Aimar', 'Miguel Muñoz', 'B', 2, 'Historia'),
('Cal destes xogadores NON xogou no Celta?', 'Mostovoi', 'Rivaldo', 'Mazinho', 'Gustavo López', 'B', 1, 'Curiosidades'),
('En que ano debutou o Celta en competición europea?', '1970', '1985', '1996', '2000', 'C', 3, 'Historia'),
('Que número levaba Iago Aspas na súa primeira etapa no Celta?', '7', '9', '10', '24', 'D', 2, 'Jugadores'),
('Cal é a vitoria máis famosa do Celta en Europa?', '4-0 ao Benfica', '3-2 ao Liverpool', '2-1 ao Barcelona', '5-1 ao Real Madrid', 'B', 1, 'Curiosidades'),
('Que xogador do Celta foi subcampión do Mundo en 2018?', 'Aspas', 'Méndez', 'Lobotka', 'Gomez', 'A', 2, 'Jugadores'),
('Onde está situada a cidade deportiva do Celta?', 'Vigo', 'A Madroa', 'Pontevedra', 'Mos', 'B', 1, 'Estadio'),
('Quen adestra ao Celta na tempada 2025-2026?', 'Berizzo', 'Giráldez', 'Coudet', 'Benítez', 'B', 2, 'Actualidad'),
('Cantos abonados ten o Celta en 2026?', '15.000', '18.000', '22.000', '28.000', 'C', 1, 'Actualidad');

-- PATROCINADORES
INSERT INTO sponsors (name, type, since_year, is_active) VALUES
('Estrella Galicia', 'Principal', 2016, TRUE),
('Abanca', 'Oficial', 2019, TRUE),
('Adidas', 'Técnico', 2024, TRUE),
('Air Europa', 'Oficial', 2020, TRUE),
('Coca-Cola', 'Colaborador', 2015, TRUE);
