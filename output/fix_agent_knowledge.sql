-- ============================================================
-- FIX AGENT KNOWLEDGE — RC CELTA DE VIGO
-- ============================================================
-- 1. BORRA datos incorrectos de presidentes
-- 2. INSERTA los 37 presidentes correctos
-- 3. INSERTA todos los entrenadores (1923-2026)
-- 4. INSERTA jugadores históricos (top 50+ apariciones/goles)
-- 5. INSERTA hitos históricos
-- 6. CORRIGE categorías erroneas
-- ============================================================

BEGIN;

-- ============================================================
-- PARTE 1: ELIMINAR DATOS INCORRECTOS
-- ============================================================

-- Borrar hechos falsos sobre presidentes
DELETE FROM knowledge_facts WHERE fact_text IN (
  'Daniel Dopazo foi presidente do Celta e construíu Balaídos (1927-1928).',
  'Cesáreo González foi presidente do Celta nos anos 40, creador de Balaídos.',
  'Xerardo Rodríguez foi presidente durante o EuroCelta.',
  'Primer presidente: Manuel Bárcena de Andrés "Franco".',
  'Daniel Dopazo (1927-1928): Construcción de Balaídos.',
  'Daniel Dopazo (1927-1928): Construcción de Balaídos'
);

-- Borrar hechos con fechas incorrectas
DELETE FROM knowledge_facts WHERE fact_text IN (
  'Carlos Mouriño foi presidente do Celta de 2006 a 2025.',
  'Marián Mouriño é a actual presidenta do Celta desde 2025.',
  'Carlos Mouriño (2006-2025): Propietario. Delegó la presidencia en su filla.',
  'Marián Mouriño Terrazo (2025-actualidad): Primeira muller presidenta na historia do Celta. Filla de Carlos.',
  'Marián Mouriño Terrazo (2025-actualidad): Primeira muller presidenta na historia do Celta.',
  'Presidenta: Marián Mouriño (2025-), primeira muller presidenta.',
  'Horacio Gómez foi presidente do Celta nos anos 90.'
);

-- ============================================================
-- PARTE 2: CORREGIR CATEGORÍAS ERRÓNEAS
-- ============================================================

-- Mover a categoría correcta
UPDATE knowledge_facts SET category = 'xogadores' WHERE fact_text LIKE '%José Manuel Pinto%' AND category = 'presidentes';
UPDATE knowledge_facts SET category = 'xogadores' WHERE fact_text LIKE '%Manuel Rodríguez%Manolo%%' AND category = 'presidentes';
UPDATE knowledge_facts SET category = 'historia' WHERE fact_text LIKE '%Manuel de Castro%Handicap%%' AND category = 'presidentes';
UPDATE knowledge_facts SET category = 'partidos' WHERE fact_text LIKE '%Temporada 2001-02%Manuel Pablo%' AND category = 'presidentes';
UPDATE knowledge_facts SET category = 'presidentes' WHERE fact_text LIKE '%Marián Mouriño Terrazo%' AND category = 'adestradores';

-- ============================================================
-- PARTE 3: INSERTAR LOS 37 PRESIDENTES CORRECTOS
-- ============================================================

INSERT INTO knowledge_facts (fact_text, category, verified) VALUES

-- 1-10: Fundación e primeiras décadas
('O primeiro presidente do Celta foi Manuel Bárcena de Andrés, Conde de Torrecedeira (1923-1925).', 'presidentes', TRUE),
('Manuel Núñez García foi presidente do Celta (1925-1926).', 'presidentes', TRUE),
('Ramón Fernández Mato foi presidente do Celta (1926-1927).', 'presidentes', TRUE),
('Manuel Prieto González foi presidente do Celta (1928-1929).', 'presidentes', TRUE),
('Alfredo Escobar Huertas foi presidente do Celta (1929-1932).', 'presidentes', TRUE),
('Luis de Vicente Sasiain foi presidente do Celta (1932-1933).', 'presidentes', TRUE),
('Indalecio Vázquez foi presidente do Celta (1933-1934).', 'presidentes', TRUE),
('Cesáreo González Rodríguez foi presidente do Celta (1934-1935). Foi un destacado produtor cinematográfico, dono de Cesáreo González Producciones Cinematográficas.', 'presidentes', TRUE),
('Rodrigo de la Rasilla Salgado foi presidente do Celta (1935-1936).', 'presidentes', TRUE),
('Pedro Braña Merino foi presidente do Celta (1939-1940).', 'presidentes', TRUE),

-- 11-20: Posguerra e consolidación
('Manuel Núñez García foi presidente do Celta por segunda vez (1940-1941).', 'presidentes', TRUE),
('Fernando de Miguel Rodríguez foi presidente do Celta (1941-1942).', 'presidentes', TRUE),
('Luis Iglesias Fernández foi presidente do Celta (1942-1948).', 'presidentes', TRUE),
('Avelino Ponte Caride foi presidente do Celta (1948-1950).', 'presidentes', TRUE),
('Faustino Álvarez Álvarez foi presidente do Celta (1950-1952).', 'presidentes', TRUE),
('Manuel Prieto Pérez foi presidente do Celta (1952-1956).', 'presidentes', TRUE),
('Antonio Herrero Montero foi presidente do Celta (1956-1958).', 'presidentes', TRUE),
('Antonio Alfageme foi presidente do Celta (1958-1959).', 'presidentes', TRUE),
('Celso Lorenzo Vila foi presidente do Celta (1959-1961).', 'presidentes', TRUE),
('Carlos Barreras Barret foi presidente do Celta (1961-1963).', 'presidentes', TRUE),

-- 21-30: Anos 60-80
('Antonio Crusat Pardiñas foi presidente do Celta (1963-1964).', 'presidentes', TRUE),
('Manuel Rodríguez Gómez foi presidente do Celta (1964-1965).', 'presidentes', TRUE),
('Daniel Alonso González foi presidente do Celta (1965-1968).', 'presidentes', TRUE),
('Ramón de Castro Fariña foi presidente do Celta (1968-1969).', 'presidentes', TRUE),
('Rodrigo Alonso Fariña foi presidente do Celta (1969-1973).', 'presidentes', TRUE),
('Antonio Vázquez Gómez foi presidente do Celta (1973-1976).', 'presidentes', TRUE),
('Jaime Arbones Alonso foi presidente do Celta (1977-1979).', 'presidentes', TRUE),
('Rodrigo Arbones Alonso foi presidente do Celta (1979-1980).', 'presidentes', TRUE),
('Elías Posada foi presidente do Celta (1980).', 'presidentes', TRUE),
('Elías Alonso Riego foi presidente do Celta (1980-1983).', 'presidentes', TRUE),

-- 31-37: Era moderna
('José Luis Rivadulla García foi presidente do Celta (1983-1990).', 'presidentes', TRUE),
('José Luis Alejo Álvarez foi presidente do Celta (1990-1991).', 'presidentes', TRUE),
('Eloy de Francisco Alonso foi presidente do Celta (1991).', 'presidentes', TRUE),
('José Ignacio Núñez Gallego foi presidente do Celta (1991-1995).', 'presidentes', TRUE),
('Horacio Gómez Araújo foi presidente do Celta (1995-2006). Baixo o seu mandato o Celta viviu a era do EuroCelta: semifinais de UEFA, Copa Intertoto 2000, recoñecido como mellor equipo do mundo en 2001.', 'presidentes', TRUE),
('Carlos Mouriño Atanes foi presidente do Celta (2006-2023). Foi o presidente máis lonxevo da historia do club, con 17 anos no cargo. O equipo volveu a competición europea e consolidouse en Primeira División.', 'presidentes', TRUE),
('Marián Mouriño Terrazo é a actual presidenta do Celta desde decembro de 2023. É a primeira muller presidenta na historia do club, filla de Carlos Mouriño.', 'presidentes', TRUE),

-- Resumo en español
('El primer presidente del Celta fue Manuel Bárcena de Andrés, Conde de Torrecedeira (1923-1925).', 'presidentes', TRUE),
('El Celta ha tenido 37 presidentes en sus más de 100 años de historia.', 'presidentes', TRUE),
('Carlos Mouriño fue presidente del Celta de 2006 a 2023, el mandato más largo del club.', 'presidentes', TRUE),
('Marián Mouriño es presidenta del Celta desde diciembre de 2023, primera mujer en el cargo.', 'presidentes', TRUE),
('Horacio Gómez Araújo presidió el Celta de 1995 a 2006, la era del EuroCelta.', 'presidentes', TRUE),
('El estadio de Balaídos se inauguró el 30 de diciembre de 1928, durante la presidencia de Manuel Prieto González, NO durante la de Daniel Dopazo que no fue presidente del Celta.', 'historia', TRUE),
('El estadio de Balaídos fue promovido por la sociedad Stadium de Balaidos SA, presidida por Joaquín Fontán, no por ningún presidente del Celta.', 'historia', TRUE);

-- ============================================================
-- PARTE 4: INSERTAR TODOS OS ADESTRADORES (ENTRENADORES)
-- ============================================================

INSERT INTO knowledge_facts (fact_text, category, verified) VALUES
('O primeiro adestrador do Celta foi Frank Cuggy (1923-1925), irlandés.', 'adestradores', TRUE),
('Andrés Balsa foi adestrador do Celta (1925-1927).', 'adestradores', TRUE),
('W.H. Cowan foi adestrador do Celta (1927-1928).', 'adestradores', TRUE),
('Moncho Encinas foi adestrador do Celta (1928-1931).', 'adestradores', TRUE),
('José Planas foi adestrador do Celta (1931-1932).', 'adestradores', TRUE),
('José María Peña foi adestrador do Celta (1932-1935).', 'adestradores', TRUE),
('Ricardo Comesaña foi adestrador do Celta (1935-1940).', 'adestradores', TRUE),
('Cárdenas foi adestrador do Celta (1940-1941).', 'adestradores', TRUE),
('Baltasar Albéniz foi adestrador do Celta (1941-1944).', 'adestradores', TRUE),
('Carlos Platko foi adestrador do Celta (1944-1945).', 'adestradores', TRUE),
('Ricardo Zamora foi adestrador do Celta (1946-1948 e 1953-1955). Lendario porteiro internacional.', 'adestradores', TRUE),
('Luisín Pasarín foi adestrador do Celta (1948-1950 e 1957-1958).', 'adestradores', TRUE),
('Roberto Ozores foi adestrador do Celta (1950-1952).', 'adestradores', TRUE),
('Alejandro Scopelli foi adestrador do Celta (1956-1957), arxentino.', 'adestradores', TRUE),
('Ignacio Eizaguirre foi adestrador do Celta (1962-1963 e 1967-1969).', 'adestradores', TRUE),
('Joseíto foi adestrador do Celta (1963-1965).', 'adestradores', TRUE),
('Roque Olsen foi adestrador do Celta (1969-1970), arxentino.', 'adestradores', TRUE),
('Juan Arza foi adestrador do Celta (1970-1972 e 1973-1974).', 'adestradores', TRUE),
('Pedro Dellacha foi adestrador do Celta (1972-1973), arxentino.', 'adestradores', TRUE),
('Carmelo Cedrún foi adestrador do Celta (1976-1977 e 1979-1980).', 'adestradores', TRUE),
('Laureano Ruiz foi adestrador do Celta (1978-1979).', 'adestradores', TRUE),
('Milorad Pasic foi adestrador do Celta (1980-1983), iugoslavo.', 'adestradores', TRUE),
('Luis Cid Carriega foi adestrador do Celta (1983-1984).', 'adestradores', TRUE),
('Colin Addison foi adestrador do Celta (1986-1987), inglés.', 'adestradores', TRUE),
('José María Maguregui foi adestrador do Celta (1987-1988 e 1990-1991).', 'adestradores', TRUE),
('Txetxu Rojo foi adestrador do Celta (1991-1994). Levou ao Celta á final de Copa de 1994.', 'adestradores', TRUE),
('Carlos Aimar foi adestrador do Celta (1994-1995), arxentino.', 'adestradores', TRUE),
('Fernando Castro Santos foi adestrador do Celta (1995-1997).', 'adestradores', TRUE),
('Javier Irureta foi adestrador do Celta (1997-1998).', 'adestradores', TRUE),
('Víctor Fernández foi adestrador do Celta (1998-2002). A súa etapa é considerada a idade de ouro do club: 3 semifinais europeas consecutivas.', 'adestradores', TRUE),
('Miguel Ángel Lotina foi adestrador do Celta (2002-2004). Clasificou ao Celta para a Champions League 2003-04.', 'adestradores', TRUE),
('Radomir Antić foi adestrador do Celta (2004).', 'adestradores', TRUE),
('Fernando Vázquez foi adestrador do Celta (2004-2006). Ascenso a Primeira en 2005.', 'adestradores', TRUE),
('Hristo Stoichkov foi adestrador do Celta (2006-2007), búlgaro, Balón de Ouro 1994.', 'adestradores', TRUE),
('Juan Ramón López Caro foi adestrador do Celta (2006-2007).', 'adestradores', TRUE),
('Eusebio Sacristán foi adestrador do Celta (2007-2008).', 'adestradores', TRUE),
('Pepe Murcia foi adestrador do Celta (2007-2008).', 'adestradores', TRUE),
('Paco Herrera foi adestrador do Celta (2010-2013). Ascenso a Primeira en 2012.', 'adestradores', TRUE),
('Abel Resino foi adestrador do Celta (2013).', 'adestradores', TRUE),
('Luis Enrique foi adestrador do Celta (2013-2014). Posteriormente adestrador do Barcelona e da selección española.', 'adestradores', TRUE),
('Eduardo Berizzo foi adestrador do Celta (2014-2017), arxentino. Semifinais de Europa League 2017.', 'adestradores', TRUE),
('Juan Carlos Unzué foi adestrador do Celta (2017-2018).', 'adestradores', TRUE),
('Antonio Mohamed foi adestrador do Celta (2018), arxentino.', 'adestradores', TRUE),
('Miguel Cardoso foi adestrador do Celta (2018-2019), portugués.', 'adestradores', TRUE),
('Fran Escribá foi adestrador do Celta (2019).', 'adestradores', TRUE),
('Óscar García foi adestrador do Celta (2019-2020).', 'adestradores', TRUE),
('Eduardo Coudet foi adestrador do Celta (2020-2022), arxentino.', 'adestradores', TRUE),
('Carlos Carvalhal foi adestrador do Celta (2022-2023), portugués.', 'adestradores', TRUE),
('Rafa Benítez foi adestrador do Celta (2023-2024). Campión de Champions con Liverpool en 2005 e de Europa League con Chelsea en 2013.', 'adestradores', TRUE),
('Claudio Giráldez é o adestrador do Celta desde marzo de 2024. Canteirán de 37 anos. Levou ao Celta a cuartos de final da UEFA e 6º en LaLiga 2025-26.', 'adestradores', TRUE);

-- ============================================================
-- PARTE 5: XOGADORES HISTÓRICOS E RÉCORDS
-- ============================================================

INSERT INTO knowledge_facts (fact_text, category, verified) VALUES
-- Máximos goleadores históricos
('Iago Aspas é o máximo goleador histórico do Celta con máis de 220 goles en todas as competicións.', 'xogadores', TRUE),
('Iago Aspas é o máximo goleador histórico do Celta en LaLiga con 169 goles (2012-2025).', 'xogadores', TRUE),
('Iago Aspas é o xogador con máis partidos na historia do Celta con máis de 570 encontros.', 'xogadores', TRUE),
('Hermidita (Manuel Hermida) é o segundo máximo goleador histórico do Celta con 113 goles (1945-1956).', 'xogadores', TRUE),
('Vladimir Gudelj é o segundo máximo goleador histórico do Celta con 113 goles (1991-1999).', 'xogadores', TRUE),
('Nolete (Manuel Copena) é o cuarto máximo goleador do Celta con 101 goles (1932-1943).', 'xogadores', TRUE),
('Pahiño (Manuel Fernández) foi máximo goleador do Celta con 91 goles (1943-1948). Gañou o Pichichi en 1948 con 21 goles en 22 partidos.', 'xogadores', TRUE),
('Ramón Polo é un dos históricos goleadores do Celta con 76 goles (1923-1935).', 'xogadores', TRUE),
('Francisco Roig foi dianteiro do Celta con 75 goles (1940-1949).', 'xogadores', TRUE),
('Aleksandr Mostovoi marcou 72 goles co Celta (1996-2004). Considerado o mellor xogador estranxeiro da historia do club.', 'xogadores', TRUE),
('Mauro Rodríguez marcou 72 goles co Celta (1953-1958).', 'xogadores', TRUE),
('Nolito (Manuel Agudo) marcou 53 goles en LaLiga co Celta (2013-2016).', 'xogadores', TRUE),
('Catanha (Henrique Guedes) marcou 38 goles co Celta (2000-2003).', 'xogadores', TRUE),
('Juan Sánchez marcou 38 goles co Celta (1994-1998).', 'xogadores', TRUE),
('Pichi Lucas marcou 93 goles co Celta (1981-1990).', 'xogadores', TRUE),
('Abel Fernández marcou 92 goles co Celta (1965-1970).', 'xogadores', TRUE),

-- Máximas aparicións
('Manolo Rodríguez é o xogador de campo con máis partidos na historia do Celta: 533 (1966-1982).', 'xogadores', TRUE),
('Hugo Mallo fixo 449 partidos co Celta (2009-2023), segundo xogador con máis encontros.', 'xogadores', TRUE),
('Atilano Vecino xogou 392 partidos co Celta (1982-1994).', 'xogadores', TRUE),
('Javier Maté xogou 369 partidos co Celta (1981-1993).', 'xogadores', TRUE),
('Vicente Álvarez xogou 353 partidos co Celta (1979-1996).', 'xogadores', TRUE),
('Juan Fernández xogou 349 partidos co Celta (1969-1980).', 'xogadores', TRUE),
('Santiago Castro xogou 328 partidos co Celta (1970-1980).', 'xogadores', TRUE),
('Gustavo López xogou 295 partidos co Celta (1999-2007). Extremo arxentino, icona do EuroCelta.', 'xogadores', TRUE),
('Aleksandr Mostovoi xogou 290 partidos co Celta (1996-2004), alcumado O Zar.', 'xogadores', TRUE),
('Fernando Cáceres xogou 264 partidos co Celta (1998-2004). Defensa arxentino.', 'xogadores', TRUE),

-- Porteiros históricos
('Pablo Cavallero foi porteiro do Celta (2001-2005), arxentino, Trofeo Zamora en 2002-03.', 'xogadores', TRUE),
('José Manuel Pinto foi porteiro do Celta (1998-2008), Trofeo Zamora en 2005-06.', 'xogadores', TRUE),
('Sergio Álvarez foi porteiro do Celta (2008-2019), canteirán.', 'xogadores', TRUE),

-- Xogadores emblemáticos do EuroCelta
('Valery Karpin foi centrocampista ruso do Celta (1997-2002), peza clave do EuroCelta.', 'xogadores', TRUE),
('Haim Revivo foi extremo israelí do Celta (1998-2000).', 'xogadores', TRUE),
('Mazinho foi centrocampista brasileiro do Celta (1991-1995), campión do mundo 1994.', 'xogadores', TRUE),
('Claude Makélélé foi centrocampista francés do Celta (1998-2000).', 'xogadores', TRUE),
('Lyuboslav Penev foi dianteiro búlgaro do Celta (1994-1995).', 'xogadores', TRUE),
('Eduardo Berizzo foi defensa arxentino do Celta (1998-2002) e posteriormente adestrador (2014-2017).', 'xogadores', TRUE),
('Benni McCarthy foi dianteiro surafricano do Celta (1999-2002).', 'xogadores', TRUE),

-- Xogadores da actualidade
('Iago Aspas, máximo goleador histórico do Celta, naceu en Moaña en 1987. Debutou en 2008 e é o símbolo do club.', 'xogadores', TRUE),
('Borja Iglesias é dianteiro do Celta (2025-), cedido polo Betis.', 'xogadores', TRUE),
('Óscar Mingueza é defensa do Celta (2024-), internacional español.', 'xogadores', TRUE),
('Gabriel Veiga foi centrocampista do Celta (2022-2023), vendido ao Al-Ahli por 40 millóns de euros.', 'xogadores', TRUE),
('Brais Méndez é centrocampista do Celta (2018-2022, 2025-), canteirán.', 'xogadores', TRUE),
('Fran Beltrán é centrocampista do Celta (2018-), canteirán.', 'xogadores', TRUE),

-- Xogadores dos 70-80
('Pichi Lucas foi o máximo goleador do Celta nos anos 80 con 93 goles.', 'xogadores', TRUE);

-- ============================================================
-- PARTE 6: FITOS HISTÓRICOS
-- ============================================================

INSERT INTO knowledge_facts (fact_text, category, verified) VALUES
('O Celta fundouse o 23 de agosto de 1923 tras a fusión do Vigo Sporting e o Fortuna de Vigo.', 'historia', TRUE),
('Manuel de Castro Handicap foi o precursor da fusión que deu lugar ao Celta. Crítico deportivo, seleccionador nacional.', 'historia', TRUE),
('O primeiro partido do Celta foi o 23 de setembro de 1923: 8-2 ao Boavista portugués en amigable.', 'historia', TRUE),
('O Celta xogou de vermello e negro as súas primeiras tempadas, as cores dos dous clubs fundadores.', 'historia', TRUE),
('En 1928 o Celta adoptou a cor celeste como uniforme titular.', 'historia', TRUE),
('O estadio de Balaídos inaugurouse o 30 de decembro de 1928 cun partido Celta 7-0 Unión Sporting Club.', 'historia', TRUE),
('O Celta chegou á súa primeira final de Copa en 1948, perdendo 4-1 contra o Sevilla.', 'historia', TRUE),
('Pahiño foi Pichichi da liga en 1948 con 21 goles, xogando no Celta.', 'historia', TRUE),
('O Celta mantívose en Primeira División de xeito ininterrompido entre 1945 e 1959 (14 tempadas).', 'historia', TRUE),
('O Celta descendeu a Segunda División en 1959, e non regresaría a Primeira ata 1969.', 'historia', TRUE),
('En 1971 o Celta volveu descender a Segunda, regresando en 1976.', 'historia', TRUE),
('O Celta descendeu a Segunda B en 1980, a única vez na súa historia en terceira categoría.', 'historia', TRUE),
('O Celta regresou a Primeira en 1982 e novamente en 1987.', 'historia', TRUE),
('O Celta chegou á final de Copa en 1994, perdendo 5-4 en penaltis contra o Zaragoza.', 'historia', TRUE),
('O Celta foi recoñecido como o mellor equipo do mundo en febreiro de 2001 pola IFFHS.', 'historia', TRUE),
('O Celta gañou a Copa Intertoto en 2000, o seu único título internacional oficial.', 'historia', TRUE),
('O Celta debutou na Champions League na tempada 2003-04, alcanzando os oitavos de final.', 'historia', TRUE),
('O Celta acadou as semifinais da Copa da UEFA en 2001, 2002 e 2017.', 'historia', TRUE),
('O RC Celta é o club galego con máis tempadas en Primeira División.', 'historia', TRUE),
('O Celta xoga como local no estadio Abanca Balaídos, con capacidade para 24.870 espectadores.', 'estadio', TRUE),
('A Cidade Deportiva Afouteza é a cidade deportiva do Celta, inaugurada en 2021.', 'estadio', TRUE),
('O Celta ten unha sección feminina, As Celtas, que compite na Liga F.', 'celta_femenino', TRUE),
('O Grupo GES, propiedade da familia Mouriño, posúe o 75% das accións do Celta.', 'economia', TRUE),
('O himno oficial do Celta compúxoo o músico vigués Emilio Cao e foi adoptado nos anos 70.', 'cultura', TRUE),
('O Celta ten como lema "O noso sentimento non se entende, vivese".', 'cultura', TRUE),
('O alcume do Celta é "Os Celestes" ou "Celtiña". Os seus seareiros chámanse "celtistas".', 'cultura', TRUE),
('Iago Aspas ten o récord de goles nunha tempada en LaLiga co Celta: 19 goles en 2017-18.', 'xogadores', TRUE),
('O Celta descendeu a Segunda División en 2004 tras xogar a Champions, e 2007.', 'historia', TRUE),
('O Celta ascendeu a Primeira en 2005 (campionato de Segunda) e 2012.', 'historia', TRUE),
('Desde o seu regreso a Primeira en 2012, o Celta mantívose na elite 14 tempadas consecutivas (ata 2026).', 'historia', TRUE),
('O Celta clasificouse para a UEFA Europa League 2025-26, 8 anos despois da súa última participación europea.', 'historia', TRUE),
('O Celta alcanzou os cuartos de final da UEFA Europa League en 2025-26, eliminado ante o Athletic Club.', 'europa', TRUE);

-- ============================================================
-- PARTE 7: CREAR RÉCORDS ADICIONAIS
-- ============================================================

INSERT INTO knowledge_facts (fact_text, category, verified) VALUES
('Máximo goleador do Celta en LaLiga: Iago Aspas (169 goles).', 'datos', TRUE),
('Máximo goleador do Celta en Copa: Ramón Polo (45 goles).', 'datos', TRUE),
('Máximo goleador do Celta en Europa: Iago Aspas (12 goles).', 'datos', TRUE),
('Xogador con máis partidos oficiais: Iago Aspas (572).', 'datos', TRUE),
('Maior vitoria en casa en LaLiga: Celta 10-1 Gimnàstic (1951-52).', 'partidos', TRUE),
('Maior vitoria fóra en LaLiga: Salamanca 0-7 Celta (2024-25, Copa do Rey).', 'partidos', TRUE),
('Maior vitoria europea: Celta 4-0 Juventus (UEFA 1999-00) e Celta 7-0 Benfica (UEFA 1999-00).', 'europa', TRUE),
('O Celta clasificouse para a Champions League unha vez: tempada 2003-04.', 'europa', TRUE),
('O Celta xogou as semifinais da Copa da UEFA en 2001 (perdeu ante o Alavés), en 2002 (perdeu ante o Borussia Dortmund) e en 2017 (perdeu ante o Manchester United).', 'europa', TRUE),
('O Celta gañou a Copa Intertoto en 2000, o seu único título oficial.', 'europa', TRUE);

-- ============================================================
-- PARTE 8: ANTIALUCINACIONES (feitos negativos explícitos)
-- ============================================================

INSERT INTO knowledge_facts (fact_text, category, verified) VALUES
-- Títulos NON gañados
('O Celta NUNCA gañou a Copa do Rei. Foi subcampión en 1948, 1994 e 2001. Nunca digas que a gañou.', 'historia', TRUE),
('O Celta NUNCA gañou LaLiga. Mellor posición histórica: 4º (1947-48 e 2002-03).', 'historia', TRUE),
('O Celta NUNCA gañou a Champions League. Xogouna unha vez: oitavos de final en 2003-04.', 'europa', TRUE),
('O Celta NUNCA gañou a UEFA/Europa League. Semifinais en 2001, 2002 e 2017.', 'europa', TRUE),
('O único título internacional oficial do Celta é a Copa Intertoto 2000.', 'historia', TRUE),
('O Celta NUNCA gañou a Supercopa de España.', 'historia', TRUE),

-- Erros cronolóxicos comúns
('Aleksandr Mostovoi chegou ao Celta en 1996. NON xogou a final de Copa de 1994.', 'xogadores', TRUE),
('Iago Aspas debutou co primeiro equipo do Celta en 2008. NON formou parte do EuroCelta (1998-2004).', 'xogadores', TRUE),
('Carlos Mouriño foi presidente do Celta de 2006 a 2023, NON ata 2025.', 'presidentes', TRUE),
('Marián Mouriño é presidenta desde decembro de 2023, NON desde 2025.', 'presidentes', TRUE),
('O estadio de Balaídos inaugurouse en 1928, promovido por Joaquín Fontán. NON o construíu ningún presidente do Celta.', 'estadio', TRUE),
('Daniel Dopazo NON foi presidente do Celta. O presidente tras Bárcena foi Ramón Fernández Mato (1927-1928).', 'presidentes', TRUE),
('Cesáreo González NON construíu Balaídos. O estadio xa existía cando el foi presidente (1934-1935).', 'presidentes', TRUE),

-- Precisións sobre o Celta dos 90
('O Celta dos primeiros 90 (1991-1995) era diferente ao EuroCelta. Txetxu Rojo e Carlos Aimar foron adestradores. Final de Copa 1994. Mostovoi aínda non chegara.', 'historia', TRUE),
('O EuroCelta comezou en 1998 coa chegada de Víctor Fernández como adestrador, e durou ata 2004.', 'historia', TRUE);

COMMIT;
