-- Rankings tables for RC Celta Chiño AI

CREATE TABLE IF NOT EXISTS rankings_players (
  id SERIAL PRIMARY KEY,
  pos INTEGER NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  era TEXT NOT NULL,
  stats TEXT NOT NULL,
  score INTEGER NOT NULL,
  badge TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rankings_coaches (
  id SERIAL PRIMARY KEY,
  pos INTEGER NOT NULL,
  name TEXT NOT NULL,
  era TEXT NOT NULL,
  logros TEXT NOT NULL,
  score INTEGER NOT NULL
);

INSERT INTO rankings_players (pos, name, role, era, stats, score, badge) VALUES
(1, 'Iago Aspas', 'Dianteiro', '2008-', '210 goles · 450 partidos · 85 asistencias', 9850, 'Lenda'),
(2, 'Alejandro Mostovoi', 'Centrocampista', '1996-2004', '72 goles · 235 partidos · 45 asistencias', 9200, 'O Zar'),
(3, 'Míchel Salgado', 'Defensa', '1995-1999', '18 goles · 290 partidos · 22 asistencias', 8800, 'Muro'),
(4, 'Gustavo López', 'Centrocampista', '1996-2002', '45 goles · 250 partidos · 60 asistencias', 8500, 'Máxico'),
(5, 'Mazinho', 'Centrocampista', '1991-1995', '25 goles · 180 partidos · 30 asistencias', 8100, 'Campión 94'),
(6, 'Manolo Rodríguez', 'Defensa', '1960-1975', '12 goles · 512 partidos · 28 asistencias', 8000, '512 partidos'),
(7, 'Patxi Salinas', 'Defensa', '1988-1993', '8 goles · 180 partidos · 10 asistencias', 7800, 'Roca vasca'),
(8, 'Fernando Veloso', 'Centrocampista', '1970-1978', '38 goles · 240 partidos · 15 asistencias', 7600, 'Elegancia'),
(9, 'Valery Karpin', 'Centrocampista', '1997-2002', '30 goles · 180 partidos · 40 asistencias', 7400, 'Zar ruso'),
(10, 'Nolito', 'Extremo', '2013-2016', '39 goles · 103 partidos · 19 asistencias', 7300, 'Internacional'),
(11, 'Hugo Mallo', 'Defensa', '2012-2023', '10 goles · 350 partidos · 30 asistencias', 7100, 'Canteirán'),
(12, 'Claude Makelele', 'Centrocampista', '1998-2000', '4 goles · 70 partidos · 5 asistencias', 7000, 'Lenda mundial'),
(13, 'Silvinho', 'Defensa', '1999-2001', '5 goles · 80 partidos · 15 asistencias', 6900, 'Lateral fino'),
(14, 'Catanha', 'Dianteiro', '1999-2002', '45 goles · 120 partidos · 18 asistencias', 6800, 'Goleador'),
(15, 'Pahiño', 'Dianteiro', '1943-1949', '80 goles · 150 partidos · 12 asistencias', 6700, 'Lenda 40s'),
(16, 'Benni McCarthy', 'Dianteiro', '1999-2002', '40 goles · 95 partidos · 20 asistencias', 6600, 'Potencia'),
(17, 'Borja Iglesias', 'Dianteiro', '2025-', '14 goles · 36 partidos · 2 asistencias', 6500, '14 goles'),
(18, 'Juanfran', 'Defensa', '1998-2005', '5 goles · 200 partidos · 18 asistencias', 6400, 'Consistencia'),
(19, 'Brais Méndez', 'Centrocampista', '2018-2022', '20 goles · 160 partidos · 25 asistencias', 6300, 'Canteira'),
(20, 'Gabriel Veiga', 'Centrocampista', '2022-2023', '11 goles · 50 partidos · 4 asistencias', 6200, '40M€'),
(21, 'Sergio Álvarez', 'Portero', '2008-2019', '0 goles · 250 partidos · 80 clean sheets', 6100, 'Seguridade'),
(22, 'Rubén Blanco', 'Portero', '2015-2023', '0 goles · 120 partidos · 35 clean sheets', 6000, 'Canteirán'),
(23, 'Óscar Mingueza', 'Defensa', '2024-', '3 goles · 36 partidos · 4 asistencias', 5900, '18M€'),
(24, 'Mauro Rodríguez', 'Dianteiro', '1950-1960', '55 goles · 180 partidos · 10 asistencias', 5800, 'Clásico'),
(25, 'Lubo Penev', 'Dianteiro', '1994-1995', '20 goles · 50 partidos · 5 asistencias', 5700, 'Búlgaro');

INSERT INTO rankings_coaches (pos, name, era, logros, score) VALUES
(1, 'Víctor Fernández', '1998-2002', '3 semifinais europeas · Era dourada', 9500),
(2, 'Eduardo Berizzo', '2014-2017', 'Semifinais Europa League 2017 · 6º Liga', 8900),
(3, 'Claudio Giráldez', '2024-', 'Cuartos UEFA · 6º LaLiga 2026 · Canteira', 8500),
(4, 'Carlos Aimar', '1993-1994', 'Final de Copa 1994 · Subcampeón', 8200),
(5, 'Luis Enrique', '2013-2014', 'Clasificación Champions · Europa League', 7900),
(6, 'Roque Olsen', '1959-1970', '11 anos · Ascenso · Estilo ofensivo', 7700),
(7, 'Miguel Muñoz', '1968-1969', 'Lenda do banquiño celeste', 7500),
(8, 'Eduardo Coudet', '2020-2022', 'Salvación · Fútbol intenso · 8º Liga', 7300),
(9, 'José Ramón Fernández', '2002-2004', 'UEFA · Estilo ofensivo · 5º Liga', 7100),
(10, 'Paco Herrera', '2011-2013', 'Ascenso a Primeira 2012', 6900),
(11, 'Juan Carlos Unzué', '2017-2018', 'Europa League · 13º Liga', 6700),
(12, 'Fernando Vázquez', '2005-2007', 'Permanencia · Canteira · Salto', 6500),
(13, 'Rafa Benítez', '2023-2024', 'Experiencia · 14º Liga', 6400),
(14, 'Luis Cid "Carriega"', '1974-1975', 'Ascenso · Lendario', 6200),
(15, 'Pepe Villar', '1997-1998', 'Ascenso a Primeira 1998', 6100),
(16, 'Fran Escribá', '2019-2020', 'Salvación · 17º Liga', 6000),
(17, 'Juan Ramón López Caro', '2006-2007', 'Clasificación Intertoto', 5900),
(18, 'Eusebio Sacristán', '2015-2016', '6º Liga · Europa League', 5800),
(19, 'Abel Resino', '2012-2013', 'Salvación · Última xornada', 5700),
(20, 'Óscar García', '2014-2015', 'Estilo combinativo · Canteira', 5600),
(21, 'Juan Arza', '1972-1974', 'Mantemento en Primeira', 5500),
(22, 'Laureano Ruiz', '1971-1972', 'Lenda dos 70', 5400),
(23, 'Antonio Mohamed', '2018-2019', '10º Liga · Europa League', 5300),
(24, 'Hristo Stoichkov', '2008-2009', 'Balón de Ouro · Experimental', 5200),
(25, 'Juan Carlos Valerón', '2016-2017', 'Lenda · Segundo adestrador', 5100);
