import re, json

with open('frontend/src/ChinoGamer.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the fallbackQuestions array using regex
match = re.search(r'const fallbackQuestions = \[(.*?)\]', content, re.DOTALL)
if not match:
    print("ERROR: Could not find fallbackQuestions")
    exit(1)

array_body = match.group(1)

# Parse each object using regex
pattern = r"\{(.*?)\}"
obj_matches = re.findall(pattern, array_body, re.DOTALL)

gl_questions = []
for obj_str in obj_matches:
    obj = {}
    # Find key-value pairs
    pairs = re.findall(r"(\w+):\s*'((?:[^'\\]|\\.)*)'", obj_str)
    for key, val in pairs:
        # Unescape JS string
        val = val.replace("\\'", "'").replace('\\"', '"').replace('\\\\', '\\')
        obj[key] = val
    if obj:
        gl_questions.append(obj)

print(f"Parsed {len(gl_questions)} questions")

# Translation mappings (only question_text, options that have GL-specific words)
gl2es_text = {
    'En que ano se fundou o Celta?': '¿En qué año se fundó el Celta?',
    'Quen é o máximo goleador histórico?': '¿Quién es el máximo goleador histórico?',
    'Como se chama o estadio do Celta?': '¿Cómo se llama el estadio del Celta?',
    'Que xogador era O Zar?': '¿Qué jugador era "El Zar"?',
    'Primeiro presidente do Celta?': '¿Primer presidente del Celta?',
    'Cantas Copas do Rey gañou o Celta?': '¿Cuántas Copas del Rey ha ganado el Celta?',
    'Cal é a mellor clasificación do Celta en LaLiga?': '¿Cuál es la mejor clasificación del Celta en LaLiga?',
    'En que ano chegou o Celta a semifinais da Europa League?': '¿En qué año llegó el Celta a semifinales de la Europa League?',
    'A que equipo eliminou o Celta en Anfield?': '¿A qué equipo eliminó el Celta en Anfield?',
    'Cal é a capacidade actual de Balaídos?': '¿Cuál es la capacidad actual de Balaídos?',
    'Quen é o xogador con máis partidos na historia do Celta?': '¿Quién es el jugador con más partidos en la historia del Celta?',
    'De que dúas fusións naceu o Celta en 1923?': '¿De qué dos fusiones nació el Celta en 1923?',
    'Que xogador do Celta gañou un Mundial?': '¿Qué jugador del Celta ganó un Mundial?',
    'En que ano inaugurouse Balaídos?': '¿En qué año se inauguró Balaídos?',
    'Cal é o alcume de Iago Aspas?': '¿Cuál es el apodo de Iago Aspas?',
    'Que adestrador levou ao Celta ás semifinais de 2017?': '¿Qué entrenador llevó al Celta a las semifinales de 2017?',
    'Cal é o máximo asistente histórico do Celta?': '¿Cuál es el máximo asistente histórico del Celta?',
    'Que xogador do Celta foi ao Mundial 2018 con España?': '¿Qué jugador del Celta fue al Mundial 2018 con España?',
    'A que equipo lle gañou o Celta 4-0 en UEFA en Balaídos?': '¿A qué equipo le ganó el Celta 4-0 en UEFA en Balaídos?',
    'Que dorsal leva Iago Aspas?': '¿Qué dorsal lleva Iago Aspas?',
    'En que ano descendeu o Celta a Segunda por última vez?': '¿En qué año descendió el Celta a Segunda por última vez?',
    'Quen era "O Muro" do Celta nos 90?': '¿Quién era "El Muro" del Celta en los 90?',
    'Que xogador ruso foi icona do EuroCelta?': '¿Qué jugador ruso fue icono del EuroCelta?',
    'Que canteirán foi traspasado por 40M€ ao Al-Ahli?': '¿Qué canterano fue traspasado por 40M€ al Al-Ahli?',
    'Cal é o maior rival do Celta?': '¿Cuál es el mayor rival del Celta?',
    'En que ano se fundou o RC Celta?': '¿En qué año se fundó el RC Celta?',
    'Cal foi o resultado do Celta vs Juventus en UEFA 1999-00?': '¿Cuál fue el resultado del Celta vs Juventus en UEFA 1999-00?',
    'Que porteiro xogou 250 partidos co Celta?': '¿Qué portero jugó 250 partidos con el Celta?',
    'Quen é o máximo goleador estranxeiro do Celta?': '¿Quién es el máximo goleador extranjero del Celta?',
    'Cantos goles levaba Aspas ao final da 25-26?': '¿Cuántos goles llevaba Aspas al final de la 25-26?',
    'Que adestrador actual dirixe o Celta?': '¿Qué entrenador actual dirige el Celta?',
    'A que equipo lle marcou Aspas o gol do centenario?': '¿A qué equipo le marcó Aspas el gol del centenario?',
    'En que ano foi subcampeón de Copa o Celta?': '¿En qué año fue subcampeón de Copa el Celta?',
    'Que xogador africano xogou no Celta 99-02?': '¿Qué jugador africano jugó en el Celta 99-02?',
    'Cal é a cor principal do Celta?': '¿Cuál es el color principal del Celta?',
    'En que cidade está Vigo?': '¿En qué provincia está Vigo?',
    'Que patrocinador principal leva o Celta?': '¿Qué patrocinador principal lleva el Celta?',
    'Cal é o alcume do Celta?': '¿Cuál es el apodo del Celta?',
    'Que defensa xogou 350 partidos co Celta?': '¿Qué defensa jugó 350 partidos con el Celta?',
    'Quen marcou o gol ao Liverpool en Anfield?': '¿Quién marcó el gol al Liverpool en Anfield?',
    'Cal era o alcume de Gustavo López?': '¿Cuál era el apodo de Gustavo López?',
    'En que ano subiu o Celta con Paco Herrera?': '¿En qué año ascendió el Celta con Paco Herrera?',
    'Que xogador do Celta foi Balón de Ouro?': '¿Qué jugador del Celta ganó el Balón de Oro?',
    'Cal foi a maior goleada do Celta ao Dépor?': '¿Cuál fue la mayor goleada del Celta al Dépor?',
    'Que xogador brasileiro estivo no Celta e no Dépor?': '¿Qué jugador brasileño estuvo en el Celta y en el Dépor?',
    'Cantos partidos oficiais xogou Manolo Rodríguez?': '¿Cuántos partidos oficiales jugó Manolo Rodríguez?',
    'Que adestrador gañou o ascenso de 1998?': '¿Qué entrenador logró el ascenso de 1998?',
    'Cal é o récord de puntos do Celta en LaLiga?': '¿Cuál es el récord de puntos del Celta en LaLiga?',
    'En que ano xogou o Celta Champions League?': '¿En qué año jugó el Celta la Champions League?',
    'Quen foi o máximo goleador do Celta nos anos 40?': '¿Quién fue el máximo goleador del Celta en los años 40?',
    'Que medio inglés marcou un hat-trick co Celta?': '¿Qué centrocampista inglés marcó un hat-trick con el Celta?',
    'Que xogador galego é o capitán actual?': '¿Qué jugador gallego es el capitán actual?',
    'En que ano naceu Iago Aspas?': '¿En qué año nació Iago Aspas?',
    'Cantos goles ten Mostovoi co Celta?': '¿Cuántos goles tiene Mostovoi con el Celta?',
    'Que selección nacional defendeu Makelele?': '¿Qué selección nacional defendió Makelele?',
    'Que compañeira de rede social ten o Celta?': '¿Qué redes sociales tiene el Celta?',
    'Quen fabrica a camiseta do Celta?': '¿Quién fabrica la camiseta del Celta?',
    'Cantos filiais ten o Celta?': '¿Cuántos filiales tiene el Celta?',
    'Que presidente recolleu o legado de Horacio Gómez?': '¿Qué presidenta recogió el legado de Horacio Gómez?',
    'En que ano morreu Mostovoi futbolisticamente para o Celta?': '¿En qué año murió futbolísticamente Mostovoi para el Celta?',
    'Que equipo inglés eliminou ao Celta en 2017?': '¿Qué equipo inglés eliminó al Celta en 2017?',
    'Cal foi o marcador en Old Trafford 2017?': '¿Cuál fue el marcador en Old Trafford 2017?',
    'Cantos partidos sen perder en casa tivo o Celta en 2015-16?': '¿Cuántos partidos sin perder en casa tuvo el Celta en 2015-16?',
    'Que xogador marcou o gol do ascenso 2012?': '¿Qué jugador marcó el gol del ascenso 2012?',
    'Cal é a porcentaxe de acerto de pase de Aspas?': '¿Cuál es el porcentaje de acierto de pase de Aspas?',
    'Que deportista ten unha rúa en Vigo?': '¿Qué deportista tiene una calle en Vigo?',
    'Cal é o himno do Celta?': '¿Cuál es el himno del Celta?',
    'En que ano se estreou o himno actual?': '¿En qué año se estrenó el himno actual?',
    'Que equipo vasco eliminou ao Celta en Copa 94?': '¿Qué equipo vasco eliminó al Celta en Copa 94?',
    'Que xogador do Celta xogou no Real Madrid?': '¿Qué jugador del Celta jugó en el Real Madrid?',
    'Cal era o alcume de Patxi Salinas?': '¿Cuál era el apodo de Patxi Salinas?',
    'Que xogador uruguaio xogou no Celta de Berizzo?': '¿Qué jugador uruguayo jugó en el Celta de Berizzo?',
    'Cantos goles marcou Maxi Gómez co Celta?': '¿Cuántos goles marcó Maxi Gómez con el Celta?',
    'Que xogador do Celta foi internacional con Portugal?': '¿Qué jugador del Celta fue internacional con Portugal?',
    'En que ano debutou Aspas co primeiro equipo?': '¿En qué año debutó Aspas con el primer equipo?',
    'Que empresario galego preside o Celta?': '¿Qué empresaria gallega preside el Celta?',
    'Cantos goles lle marcou o Celta ao Milan?': '¿Cuántos goles le marcó el Celta al Milan?',
    'En que ano se chamou por primeira vez "O noso Celta"?': '¿En qué año se llamó por primera vez "Nuestro Celta"?',
    'Que ten de especial o 23 de agosto?': '¿Qué tiene de especial el 23 de agosto?',
    'Cantos ascensos ten o Celta?': '¿Cuántos ascensos tiene el Celta?',
    'Cal foi o máximo goleador do Celta nos anos 90?': '¿Cuál fue el máximo goleador del Celta en los años 90?',
    'Que país visitou o Celta na súa primeira xira?': '¿Qué país visitó el Celta en su primera gira?',
    'Cal era o alcume de Vladimir Gudelj?': '¿Cuál era el apodo de Vladimir Gudelj?',
    'Que xogador do Celta xogou 4 Mundiais?': '¿Qué jugador del Celta jugó 4 Mundiales?',
    'En que ano se retirou Míchel Salgado?': '¿En qué año se retiró Míchel Salgado?',
    'Cal foi o primeiro partido do Celta en Primeira?': '¿Cuál fue el primer partido del Celta en Primera?',
    'Cantos goles precisa Aspas para chegar a 250?': '¿Cuántos goles necesita Aspas para llegar a 250?',
    'Que adestrador do Celta gañou unha Champions?': '¿Qué entrenador del Celta ganó una Champions?',
    'Cal é a posición natural de Míngueza?': '¿Cuál es la posición natural de Míngueza?',
    'Que di o lema do Celta?': '¿Qué dice el lema del Celta?',
    'Cal é a web oficial do Celta?': '¿Cuál es la web oficial del Celta?',
    'En que ano morreu Pahiño?': '¿En qué año murió Pahiño?',
    'Que xogador xogou no Celta e no Barcelona?': '¿Qué jugador jugó en el Celta y en el Barcelona?',
    'Cantos Balóns de Ouro ten un xogador do Celta?': '¿Cuántos Balones de Oro tiene un jugador del Celta?',
    'Cal é o alcume de Balaídos?': '¿Cuál es el apodo de Balaídos?',
    'Que adestrador galego dirixe o Celta 2026?': '¿Qué entrenador gallego dirige el Celta 2026?',
    'Cantos goles fixo Borja Iglesias na 25-26?': '¿Cuántos goles hizo Borja Iglesias en la 25-26?',
    'Que xogador é coñecido como "O Panda"?': '¿Qué jugador es conocido como "El Panda"?',
    'Que xogador noruegués xoga no Celta 2026?': '¿Qué jugador noruego juega en el Celta 2026?',
    'En que ano xogou o Celta a Copa Intertoto?': '¿En qué año jugó el Celta la Copa Intertoto?',
    'Contra quen debutou o Celta en 1923?': '¿Contra quién debutó el Celta en 1923?',
    'Cantos goles marcou Catanha co Celta?': '¿Cuántos goles marcó Catanha con el Celta?',
    'Que lateral esquerdo xogou no Celta e Arsenal?': '¿Qué lateral izquierdo jugó en el Celta y Arsenal?',
    'Que centrocampista galego xogou no Celta e Valencia?': '¿Qué centrocampista gallego jugó en el Celta y Valencia?',
    'Que popular xogador de México xogou no Celta?': '¿Qué popular jugador de México jugó en el Celta?',
    'Que equipo andaluz eliminou ao Celta en Copa 2001?': '¿Qué equipo andaluz eliminó al Celta en Copa 2001?',
    'Cantos goles marcou Lubo Penev co Celta?': '¿Cuántos goles marcó Lubo Penev con el Celta?',
    'Que xogador do Celta foi campión do Mundo 1994?': '¿Qué jugador del Celta fue campeón del Mundo en 1994?',
    'Cal foi o resultado Celta 7-0 Real Unión en que ano?': '¿Cuál fue el resultado Celta 7-0 Real Unión y en qué año?',
    'Cal foi o récord de asistencia en Balaídos?': '¿Cuál fue el récord de asistencia en Balaídos?',
    'Contra que equipo foi o 45.000 de Balaídos 1941?': '¿Contra qué equipo fueron los 45.000 de Balaídos en 1941?',
    'Que selección galega de fútbol existe?': '¿Qué selección gallega de fútbol existe?',
    'Quen canta o himno Celtiña?': '¿Quién canta el himno Celtiña?',
    'En que ano se fundou a Federación Galega de Fútbol?': '¿En qué año se fundó la Federación Gallega de Fútbol?',
    'Que presidente construíu Balaídos?': '¿Qué presidente construyó Balaídos?',
    'Cal foi o primeiro partido do Celta en competición oficial?': '¿Cuál fue el primer partido del Celta en competición oficial?',
    'Que porteiro ten máis clean sheets na historia do Celta?': '¿Qué portero tiene más clean sheets en la historia del Celta?',
    'Cantos partidos xogou Mostovoi co Celta?': '¿Cuántos partidos jugó Mostovoi con el Celta?',
    'Quen é o máximo goleador do Celta en competicións europeas?': '¿Quién es el máximo goleador del Celta en competiciones europeas?',
    'En que ano gañou o Celta a Copa Intertoto?': '¿En qué año ganó el Celta la Copa Intertoto?',
    'Que xogador do Celta xogou no Barça e no Madrid?': '¿Qué jugador del Celta jugó en el Barça y en el Madrid?',
    'Cal era o alcume de Fernando Cáceres?': '¿Cuál era el apodo de Fernando Cáceres?',
    'Cantos goles marcou Pahiño en 1947-48?': '¿Cuántos goles marcó Pahiño en 1947-48?',
    'Que xogador do Celta foi campión de Europa 1998?': '¿Qué jugador del Celta fue campeón de Europa en 1998?',
    'Cal é a derrota máis dura do Celta en UEFA?': '¿Cuál es la derrota más dura del Celta en UEFA?',
    'Que adestrador dirixiu máis partidos ao Celta en Primeira?': '¿Qué entrenador dirigió más partidos al Celta en Primera?',
    'Cantos goles lle marcou o Celta ao Barcelona en 2017?': '¿Cuántos goles le marcó el Celta al Barcelona en 2017?',
    'Que xogador do Celta foi máximo asistente de LaLiga en 2023?': '¿Qué jugador del Celta fue máximo asistente de LaLiga en 2023?',
    'En que ano rematou o Celta 4º en LaLiga?': '¿En qué año terminó el Celta 4º en LaLiga?',
    'Que di o artigo 1 dos estatutos do Celta?': '¿Qué dice el artículo 1 de los estatutos del Celta?',
    'Que xogador do Celta marcou 15 goles nunha tempada de Segunda?': '¿Qué jugador del Celta marcó 15 goles en una temporada de Segunda?',
    'Cantos partidos oficiais ten Iago Aspas co Celta?': '¿Cuántos partidos oficiales tiene Iago Aspas con el Celta?',
    'Que xogador do Celta foi subcampión do Mundo 2006?': '¿Qué jugador del Celta fue subcampeón del Mundo en 2006?',
    'Cal era o alcume de Manolo Rodríguez?': '¿Cuál era el apodo de Manolo Rodríguez?',
    'En que ano se creou o Celta B?': '¿En qué año se creó el Celta B?',
    'Que xogador do Celta se chamaba O\'Donell?': '¿Qué jugador del Celta se llamaba O\'Donell?',
    'Cantos goles marcou Nolete na 39-40?': '¿Cuántos goles marcó Nolete en la 39-40?',
    'Que xogador do Celta é coñecido como "Panda"?': '¿Qué jugador del Celta es conocido como "Panda"?',
    'Cal foi o resultado Celta 4-0 Juventus en 1999?': '¿Cuál fue el resultado Celta 4-0 Juventus en 1999?',
    'Que xogador marcou o 4-0 ao Juventus?': '¿Qué jugador marcó el 4-0 a la Juventus?',
    'En que ano ascendeu o Celta por primeira vez?': '¿En qué año ascendió el Celta por primera vez?',
    'Que adestrador levou ao Celta ao 4º posto en 1948?': '¿Qué entrenador llevó al Celta al 4º puesto en 1948?',
    'Cal é o segundo goleador histórico do Celta?': '¿Cuál es el segundo goleador histórico del Celta?',
    'Que xogador do Celta gañou 5 Ligas con outro club?': '¿Qué jugador del Celta ganó 5 Ligas con otro club?',
    'En que ano se puxo céspede en Balaídos?': '¿En qué año se puso césped en Balaídos?',
    'Que empresa puxo o céspede artificial en 1982?': '¿Qué empresa puso el césped artificial en 1982?',
    'Quen é o xogador máis novo en debutar co Celta?': '¿Quién es el jugador más joven en debutar con el Celta?',
    'Cal foi o primeiro xogador do Celta en ir a un Mundial?': '¿Cuál fue el primer jugador del Celta en ir a un Mundial?',
}

gl2en_text = {
    'En que ano se fundou o Celta?': 'In which year was Celta founded?',
    'Quen é o máximo goleador histórico?': 'Who is the all-time top scorer?',
    'Como se chama o estadio do Celta?': "What is the name of Celta's stadium?",
    'Que xogador era O Zar?': 'Which player was known as "The Tsar"?',
    'Primeiro presidente do Celta?': 'First president of Celta?',
    'Cantas Copas do Rey gañou o Celta?': 'How many Copas del Rey has Celta won?',
    'Cal é a mellor clasificación do Celta en LaLiga?': "What is Celta's best LaLiga finish?",
    'En que ano chegou o Celta a semifinais da Europa League?': 'In which year did Celta reach the Europa League semifinals?',
    'A que equipo eliminou o Celta en Anfield?': 'Which team did Celta eliminate at Anfield?',
    'Cal é a capacidade actual de Balaídos?': 'What is the current capacity of Balaidos?',
    'Quen é o xogador con máis partidos na historia do Celta?': 'Who has the most appearances in Celta history?',
    'De que dúas fusións naceu o Celta en 1923?': 'From which two mergers was Celta born in 1923?',
    'Que xogador do Celta gañou un Mundial?': 'Which Celta player won a World Cup?',
    'En que ano inaugurouse Balaídos?': 'In which year was Balaidos inaugurated?',
    'Cal é o alcume de Iago Aspas?': "What is Iago Aspas' nickname?",
    'Que adestrador levou ao Celta ás semifinais de 2017?': 'Which coach led Celta to the 2017 semifinals?',
    'Cal é o máximo asistente histórico do Celta?': "Who is Celta's all-time top assister?",
    'Que xogador do Celta foi ao Mundial 2018 con España?': 'Which Celta player went to the 2018 World Cup with Spain?',
    'A que equipo lle gañou o Celta 4-0 en UEFA en Balaídos?': 'Which team did Celta beat 4-0 at home in UEFA?',
    'Que dorsal leva Iago Aspas?': 'What shirt number does Iago Aspas wear?',
    'En que ano descendeu o Celta a Segunda por última vez?': "When was Celta's last relegation to Segunda?",
    'Quen era "O Muro" do Celta nos 90?': 'Who was the "Wall" of Celta in the 90s?',
    'Que xogador ruso foi icona do EuroCelta?': 'Which Russian player was an icon of EuroCelta?',
    'Que canteirán foi traspasado por 40M€ ao Al-Ahli?': 'Which academy player was sold for 40M to Al-Ahli?',
    'Cal é o maior rival do Celta?': "Who is Celta's biggest rival?",
    'En que ano se fundou o RC Celta?': 'In which year was RC Celta founded?',
    'Cal foi o resultado do Celta vs Juventus en UEFA 1999-00?': 'What was the result of Celta vs Juventus in 1999-00 UEFA?',
    'Que porteiro xogou 250 partidos co Celta?': 'Which goalkeeper played 250 matches for Celta?',
    'Quen é o máximo goleador estranxeiro do Celta?': "Who is Celta's top foreign scorer?",
    'Cantos goles levaba Aspas ao final da 25-26?': 'How many goals did Aspas have by the end of 25-26?',
    'Que adestrador actual dirixe o Celta?': "Who is Celta's current coach?",
    'A que equipo lle marcou Aspas o gol do centenario?': 'Which team did Aspas score the centenary goal against?',
    'En que ano foi subcampeón de Copa o Celta?': 'In which year was Celta Copa del Rey runner-up?',
    'Que xogador africano xogou no Celta 99-02?': 'Which African player played for Celta 99-02?',
    'Cal é a cor principal do Celta?': "What is Celta's main color?",
    'En que cidade está Vigo?': 'In which province is Vigo located?',
    'Que patrocinador principal leva o Celta?': "Who is Celta's main sponsor?",
    'Cal é o alcume do Celta?': "What is Celta's nickname?",
    'Que defensa xogou 350 partidos co Celta?': 'Which defender played 350 games for Celta?',
    'Quen marcou o gol ao Liverpool en Anfield?': 'Who scored the goal against Liverpool at Anfield?',
    'Cal era o alcume de Gustavo López?': "What was Gustavo Lopez's nickname?",
    'En que ano subiu o Celta con Paco Herrera?': 'In which year did Celta promote with Paco Herrera?',
    'Que xogador do Celta foi Balón de Ouro?': "Which Celta player won a Ballon d'Or?",
    'Cal foi a maior goleada do Celta ao Dépor?': "What was Celta's biggest win against Deportivo?",
    'Que xogador brasileiro estivo no Celta e no Dépor?': 'Which Brazilian played for both Celta and Deportivo?',
    'Cantos partidos oficiais xogou Manolo Rodríguez?': 'How many official matches did Manolo Rodriguez play?',
    'Que adestrador gañou o ascenso de 1998?': 'Which coach led the 1998 promotion?',
    'Cal é o récord de puntos do Celta en LaLiga?': "What is Celta's points record in LaLiga?",
    'En que ano xogou o Celta Champions League?': 'In which year did Celta play in the Champions League?',
    'Quen foi o máximo goleador do Celta nos anos 40?': "Who was Celta's top scorer in the 40s?",
    'Que medio inglés marcou un hat-trick co Celta?': 'Which English midfielder scored a hat-trick for Celta?',
    'Que xogador galego é o capitán actual?': 'Which Galician player is the current captain?',
    'En que ano naceu Iago Aspas?': 'When was Iago Aspas born?',
    'Cantos goles ten Mostovoi co Celta?': 'How many goals did Mostovoi score for Celta?',
    'Que selección nacional defendeu Makelele?': 'Which country did Makelele play for?',
    'Que compañeira de rede social ten o Celta?': 'Which social media does Celta have?',
    'Quen fabrica a camiseta do Celta?': "Who makes Celta's shirts?",
    'Cantos filiais ten o Celta?': 'How many reserve teams does Celta have?',
    'Que presidente recolleu o legado de Horacio Gómez?': 'Which president took over from Horacio Gomez?',
    'En que ano morreu Mostovoi futbolisticamente para o Celta?': 'When did Mostovoi play his last game for Celta?',
    'Que equipo inglés eliminou ao Celta en 2017?': 'Which English team eliminated Celta in 2017?',
    'Cal foi o marcador en Old Trafford 2017?': 'What was the score at Old Trafford in 2017?',
    'Cantos partidos sen perder en casa tivo o Celta en 2015-16?': 'How many home games unbeaten did Celta have in 2015-16?',
    'Que xogador marcou o gol do ascenso 2012?': 'Who scored the promotion goal in 2012?',
    'Cal é a porcentaxe de acerto de pase de Aspas?': "What is Aspas's pass accuracy percentage?",
    'Que deportista ten unha rúa en Vigo?': 'Which athlete has a street named after them in Vigo?',
    'Cal é o himno do Celta?': "What is Celta's anthem?",
    'En que ano se estreou o himno actual?': 'When was the current anthem released?',
    'Que equipo vasco eliminou ao Celta en Copa 94?': 'Which Basque team eliminated Celta from the 94 Copa?',
    'Que xogador do Celta xogou no Real Madrid?': 'Which Celta player also played for Real Madrid?',
    'Cal era o alcume de Patxi Salinas?': "What was Patxi Salinas's nickname?",
    'Que xogador uruguaio xogou no Celta de Berizzo?': "Which Uruguayan player played for Berizzo's Celta?",
    'Cantos goles marcou Maxi Gómez co Celta?': 'How many goals did Maxi Gomez score for Celta?',
    'Que xogador do Celta foi internacional con Portugal?': 'Which Celta player was a Portugal international?',
    'En que ano debutou Aspas co primeiro equipo?': 'When did Aspas debut for the first team?',
    'Que empresario galego preside o Celta?': 'Which Galician businesswoman presides over Celta?',
    'Cantos goles lle marcou o Celta ao Milan?': 'How many goals did Celta score against Milan?',
    'En que ano se chamou por primeira vez "O noso Celta"?': 'When was it first called "Our Celta"?',
    'Que ten de especial o 23 de agosto?': 'What is special about August 23rd?',
    'Cantos ascensos ten o Celta?': 'How many promotions has Celta had?',
    'Cal foi o máximo goleador do Celta nos anos 90?': "Who was Celta's top scorer in the 90s?",
    'Que país visitou o Celta na súa primeira xira?': 'Which country did Celta first tour?',
    'Cal era o alcume de Vladimir Gudelj?': "What was Vladimir Gudelj's nickname?",
    'Que xogador do Celta xogou 4 Mundiais?': 'Which Celta player played in 4 World Cups?',
    'En que ano se retirou Míchel Salgado?': 'When did Michel Salgado retire?',
    'Cal foi o primeiro partido do Celta en Primeira?': "What was Celta's first match in Primera?",
    'Cantos goles precisa Aspas para chegar a 250?': 'How many goals does Aspas need to reach 250?',
    'Que adestrador do Celta gañou unha Champions?': 'Which Celta coach won a Champions League?',
    'Cal é a posición natural de Míngueza?': "What is Mingueza's natural position?",
    'Que di o lema do Celta?': "What is Celta's motto?",
    'Cal é a web oficial do Celta?': 'What is the official Celta website?',
    'En que ano morreu Pahiño?': 'When did Pahino die?',
    'Que xogador xogou no Celta e no Barcelona?': 'Which player played for both Celta and Barcelona?',
    "Cantos Balóns de Ouro ten un xogador do Celta?": "How many Ballon d'Or winners has Celta had?",
    'Cal é o alcume de Balaídos?': "What is Balaidos's nickname?",
    'Que adestrador galego dirixe o Celta 2026?': 'Which Galician coach manages Celta in 2026?',
    'Cantos goles fixo Borja Iglesias na 25-26?': 'How many goals did Borja Iglesias score in 25-26?',
    'Que xogador é coñecido como "O Panda"?': 'Which player is known as "The Panda"?',
    'Que xogador noruegués xoga no Celta 2026?': 'Which Norwegian player is at Celta in 2026?',
    'En que ano xogou o Celta a Copa Intertoto?': 'When did Celta play the Intertoto Cup?',
    'Contra quen debutou o Celta en 1923?': 'Who did Celta debut against in 1923?',
    'Cantos goles marcou Catanha co Celta?': 'How many goals did Catanha score for Celta?',
    'Que lateral esquerdo xogou no Celta e Arsenal?': 'Which left back played for Celta and Arsenal?',
    'Que centrocampista galego xogou no Celta e Valencia?': 'Which Galician midfielder played for Celta and Valencia?',
    'Que popular xogador de México xogou no Celta?': 'Which popular Mexican played for Celta?',
    'Que equipo andaluz eliminou ao Celta en Copa 2001?': 'Which Andalusian team eliminated Celta in the 2001 Copa?',
    'Cantos goles marcou Lubo Penev co Celta?': 'How many goals did Lubo Penev score for Celta?',
    'Que xogador do Celta foi campión do Mundo 1994?': 'Which Celta player was a 1994 World Champion?',
    'Cal foi o resultado Celta 7-0 Real Unión en que ano?': 'Celta 7-0 Real Union - what year?',
    'Cal foi o récord de asistencia en Balaídos?': 'What is the attendance record at Balaidos?',
    'Contra que equipo foi o 45.000 de Balaídos 1941?': 'Which match drew 45,000 to Balaidos in 1941?',
    'Que selección galega de fútbol existe?': 'Does a Galician national team exist?',
    'Quen canta o himno Celtiña?': 'Who sings the Celtina anthem?',
    'En que ano se fundou a Federación Galega de Fútbol?': 'When was the Galician Football Federation founded?',
    'Que presidente construíu Balaídos?': 'Which president built Balaidos?',
    'Cal foi o primeiro partido do Celta en competición oficial?': "What was Celta's first official match?",
    'Que porteiro ten máis clean sheets na historia do Celta?': 'Which goalkeeper has the most clean sheets for Celta?',
    'Cantos partidos xogou Mostovoi co Celta?': 'How many matches did Mostovoi play for Celta?',
    'Quen é o máximo goleador do Celta en competicións europeas?': "Who is Celta's top scorer in Europe?",
    'En que ano gañou o Celta a Copa Intertoto?': 'When did Celta win the Intertoto Cup?',
    'Que xogador do Celta xogou no Barça e no Madrid?': 'Which Celta player played for both Barca and Madrid?',
    'Cal era o alcume de Fernando Cáceres?': "What was Fernando Caceres's nickname?",
    'Cantos goles marcou Pahiño en 1947-48?': 'How many goals did Pahino score in 1947-48?',
    'Que xogador do Celta foi campión de Europa 1998?': 'Which Celta player was European Champion in 1998?',
    'Cal é a derrota máis dura do Celta en UEFA?': "What is Celta's worst defeat in UEFA?",
    'Que adestrador dirixiu máis partidos ao Celta en Primeira?': 'Which coach managed the most Celta games in Primera?',
    'Cantos goles lle marcou o Celta ao Barcelona en 2017?': 'How many goals did Celta score vs Barcelona in 2017?',
    'Que xogador do Celta foi máximo asistente de LaLiga en 2023?': "Which Celta player was LaLiga's top assister in 2023?",
    'En que ano rematou o Celta 4º en LaLiga?': 'When did Celta finish 4th in LaLiga?',
    'Que di o artigo 1 dos estatutos do Celta?': "What does article 1 of Celta's statutes say?",
    'Que xogador do Celta marcou 15 goles nunha tempada de Segunda?': 'Which Celta player scored 15 goals in Segunda?',
    'Cantos partidos oficiais ten Iago Aspas co Celta?': 'How many official games has Aspas played for Celta?',
    'Que xogador do Celta foi subcampión do Mundo 2006?': 'Which Celta player was 2006 World Cup runner-up?',
    'Cal era o alcume de Manolo Rodríguez?': "What was Manolo Rodriguez's nickname?",
    'En que ano se creou o Celta B?': 'When was Celta B created?',
    "Que xogador do Celta se chamaba O'Donell?": "Which Celta player was named O'Donell?",
    'Cantos goles marcou Nolete na 39-40?': 'How many goals did Nolete score in 39-40?',
    'Que xogador do Celta é coñecido como "Panda"?': 'Which Celta player is known as "Panda"?',
    'Cal foi o resultado Celta 4-0 Juventus en 1999?': 'Celta 4-0 Juventus - what competition was it?',
    'Que xogador marcou o 4-0 ao Juventus?': 'Who scored the 4-0 against Juventus?',
    'En que ano ascendeu o Celta por primeira vez?': 'When was Celta first promoted?',
    'Que adestrador levou ao Celta ao 4º posto en 1948?': 'Which coach led Celta to 4th place in 1948?',
    'Cal é o segundo goleador histórico do Celta?': "Who is Celta's second top scorer?",
    'Que xogador do Celta gañou 5 Ligas con outro club?': 'Which Celta player won 5 leagues with another club?',
    'En que ano se puxo céspede en Balaídos?': 'When was grass installed at Balaidos?',
    'Que empresa puxo o céspede artificial en 1982?': 'Which company installed artificial turf in 1982?',
    'Quen é o xogador máis novo en debutar co Celta?': 'Who is the youngest player to debut for Celta?',
    'Cal foi o primeiro xogador do Celta en ir a un Mundial?': "Who was Celta's first World Cup player?",
}

# Option word translations
opt_map = {
    'O Molinón': ('El Molinón', 'El Molinon'),
    'Real Fortuna e Sporting': ('Real Fortuna y Sporting', 'Real Fortuna and Sporting'),
    'O Zar': ('El Zar', 'The Tsar'),
    'O Príncipe das Bateas': ('El Príncipe de las Bateas', 'The Prince of the Bateas'),
    'O Mago': ('El Mago', 'The Magician'),
    'A Lenda': ('La Leyenda', 'The Legend'),
    'O Muro': ('El Muro', 'The Wall'),
    'O Loco': ('El Loco', 'The Madman'),
    'O Mestre': ('El Maestro', 'The Master'),
    'Ningún': ('Ninguno', 'None'),
    'O Equipo Celeste': ('El Equipo Celeste', 'The Celeste Team'),
    'A Tormenta': ('La Tormenta', 'The Storm'),
    'O Marea': ('La Marea', 'The Tide'),
    'O Fortín': ('El Fortín', 'The Fortress'),
    'O Xigante': ('El Gigante', 'The Giant'),
    'O Tanque': ('El Tanque', 'The Tank'),
    'O Canón': ('El Cañón', 'The Cannon'),
    'A Torre': ('La Torre', 'The Tower'),
    'O Capitán': ('El Capitán', 'The Captain'),
    'O Galego': ('El Gallego', 'The Galician'),
    'O León': ('El León', 'The Lion'),
    'A Roca vasca': ('La Roca vasca', 'The Basque Rock'),
    'O Toro': ('El Toro', 'The Bull'),
    'O Templo': ('El Templo', 'The Temple'),
    'A Catedral': ('La Catedral', 'The Cathedral'),
    'O Coliseo': ('El Coliseo', 'The Coliseum'),
    'Ambas': ('Ambos', 'Both'),
    'Todas': ('Todas', 'All of them'),
    'Todas as anteriores': ('Todas las anteriores', 'All of the above'),
    'Todos': ('Todos', 'All'),
    'Non a gañou': ('No la ganó', 'Did not win it'),
    'Aínda non': ('Aún no', 'Not yet'),
    'Si': ('Sí', 'Yes'),
    'Non': ('No', 'No'),
    'Extinta': ('Extinta', 'Extinct'),
    'Un porteiro': ('Un portero', 'A goalkeeper'),
    'Un dianteiro': ('Un delantero', 'A forward'),
    'Un defensa': ('Un defensa', 'A defender'),
    'Un medio': ('Un centrocampista', 'A midfielder'),
    'Branco': ('Blanco', 'White'),
    'O Panda': ('El Panda', 'The Panda'),
}

def translate_one(q, lang):
    r = dict(q)
    tmap = gl2es_text if lang == 'es' else gl2en_text
    if q['question_text'] in tmap:
        r['question_text'] = tmap[q['question_text']]
    for k in ['option_a','option_b','option_c','option_d']:
        v = q[k]
        if v in opt_map:
            r[k] = opt_map[v][0 if lang == 'es' else 1]
    return r

es = [translate_one(q, 'es') for q in gl_questions]
en = [translate_one(q, 'en') for q in gl_questions]

# Use JSON for safe encoding
def to_json(arr):
    return json.dumps(arr, ensure_ascii=False, indent=2)

# Build the JS file
new_arrays = f"""
const fbGL = {to_json(gl_questions)};

const fbES = {to_json(es)};

const fbEN = {to_json(en)};
"""

# Replace in file: find and replace the fallbackQuestions block
old_block = f'const fallbackQuestions = {match.group(0)[len("const fallbackQuestions = "):]}'
# Actually just replace the const fallbackQuestions with the new named arrays
new_content = content.replace(match.group(0), 'const fbGL = ' + json.dumps(gl_questions, ensure_ascii=False) + ';\n\nconst fbES = ' + json.dumps(es, ensure_ascii=False) + ';\n\nconst fbEN = ' + json.dumps(en, ensure_ascii=False))

# Also update references from fallbackQuestions to the appropriate lang-based lookup
# The fetchQuestions already uses 'fb' variable based on lang (we need to check if it's already updated)
# Let's update all references
new_content = new_content.replace('pool = fallbackQuestions.filter', 'pool = fb.filter')
new_content = new_content.replace('pool = fallbackQuestions;', 'pool = fb;')
new_content = new_content.replace("_qid: `fb_${fallbackQuestions.indexOf(q)}`", "_qid: `fb_${fb.indexOf(q)}`")

with open('frontend/src/ChinoGamer.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Done! ChinoGamer.jsx updated with fbGL, fbES, fbEN")
