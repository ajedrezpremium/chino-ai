# ✅ QA PLAN · Chiño AI — Demo ante Dirección General

## 20 tests para garantizar 0 fallos

Cada test tiene: pregunta, respuesta esperada, fuente, estado ✅/❌

---

## 🧠 CONOCIMIENTO (8 tests)

| # | Pregunta | Respuesta esperada | Fuente | Estado |
|---|---|---|---|---|
| 1 | ¿Cuándo se fundó el RC Celta? | 23 de agosto de 1923 | chino-knowledge.js:2 | ✅ |
| 2 | ¿Quién fue el primer presidente? | Manuel Bárcena de Andrés, Conde de Torrecedeira | chino-knowledge.js:99 | ✅ |
| 3 | ¿Qué jugador es el máximo goleador del Celta en una temporada en Primera? | Catanha, 25 goles (2000-01) | chino-knowledge.js:83 | ✅ |
| 4 | ¿Quién es el entrenador actual del Celta (2026)? | Claudio Giráldez | chino-knowledge.js:96 | ✅ |
| 5 | ¿Cuántos partidos jugó Patxi Salinas con el Celta? | 180 partidos (1988-1993) | chino-knowledge.js:81 | ✅ |
| 6 | ¿Quién fue Pichi Lucas y qué logró en 1981-82? | Delantero, Pichichi de Segunda con 26 goles, ascendió a Primera | chino-knowledge.js:110,204-206 | ✅ |
| 7 | ¿Quién es la primera mujer presidenta del Celta? | Marián Mouriño Terrazo (2025-actualidad) | chino-knowledge.js:102 | ✅ |
| 8 | ¿Qué portero del Celta fue al Mundial 82? | No hay portero del Celta en Mundial 82 (Balaídos fue sede) | chino-knowledge.js:389 | ✅ |

---

## 🌐 IDIOMAS (3 tests)

| # | Pregunta | Respuesta esperada | Fuente | Estado |
|---|---|---|---|---|
| 9 | Preguntar en galego: "Quen é o máximo goleador do Celta?" | Responde en galego. Iago Aspas | chino-knowledge.js:4-9 (regla idioma) | ✅ |
| 10 | Preguntar en inglés: "Who is the current captain of Celta?" | Responde en inglés. Iago Aspas (o capitán actual) | chino-knowledge.js:4-9 | ✅ |
| 11 | Preguntar en español: "¿Qué año ascendió el Celta a Primera por primera vez?" | Responde en español. 1935-36 | chino-knowledge.js:105 | ✅ |

---

## 🏆 CHIÑO GAMER (4 tests)

| # | Pregunta | Respuesta esperada | Fuente | Estado |
|---|---|---|---|---|
| 12 | ¿Cuál es el máximo goleador del Celta en una temporada de Primera? (Pregunta del juego) | Catanha (25 goles) | ChinoGamer.jsx:370 | ✅ |
| 13 | Pregunta sobre Patxi Salinas en el trivial | Su apodo es "A Roca vasca" | ChinoGamer.jsx:360 | ✅ |
| 14 | Pregunta sobre el primer partido del Celta en Primeira | 1940 (temporada 1939-40, debut real tras la Guerra Civil). ❌ Estaba en 1929 (BUG corregido) | ChinoGamer.jsx:375 → cambiado B→D | ✅ Corregido |
| 15 | Pregunta sobre el EuroCelta | Semifinales UEFA 2001, 2002, 2003 | chino-knowledge.js:111 | ✅ |

---

## 📊 RANKINGS (3 tests)

| # | Pregunta | Respuesta esperada | Fuente | Estado |
|---|---|---|---|---|
| 16 | ¿Quién es el defensa mejor valorado del Celta en los 90? | Patxi Salinas (7º, 7800 pts, 180 partidos) | RankingsView.jsx:13 | ✅ |
| 17 | ¿Qué entrenador tiene más puntos en el ranking? | Víctor Fernández (9500 pts, 3 semifinales europeas) | RankingsView.jsx:35 | ✅ |
| 18 | ¿Aparecen los rankings de aficionados con datos reales? | Sí, desde Supabase + fallback local (13 fans fake) | App.jsx + RankingsView.jsx | ✅ |

---

## 🔗 SECCIONES / ENLACES (2 tests)

| # | Pregunta | Respuesta esperada | Fuente | Estado |
|---|---|---|---|---|
| 19 | ¿Funciona el enlace a la tienda oficial? | https://shop.rccelta.es | SectionsView.jsx:19 | ✅ |
| 20 | ¿Los precios y nombres cambian según el idioma? | Es: "Primera equipación" / Gl: "Primeira equipación" / En: "First Kit" | es.json, gl.json, en.json | ✅ |

---

## 🚨 RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| El LLM alucina un jugador que no existe | Media | Prompt tiene regla "NUNCA inventes" + knowledge_facts |
| Error de tipeo en preguntas del Gamer | Baja | Revisar manualmente las 130+ preguntas |
| Enlace roto en Secciones | Baja | Probar cada enlace antes de la demo |
| Voz femenina en Chiño (ya corregido) | Resuelta | pickVoice regex actualizado + matchGender en selectedVoiceURI |
| Modal de auth no cierra (ya corregido) | Resuelta | backdrop onClick + stopPropagation |

---

## 📋 CHECKLIST PRE-DEMO

- [ ] Abrir app en móvil y ordenador
- [ ] Verificar Chiño habla con voz **masculina**
- [ ] Tocar avatar → cambiar a Chiña → verificar voz **femenina**
- [ ] Preguntar en galego "Quen es ti?"
- [ ] Preguntar en español "¿Quién fundó el Celta?"
- [ ] Preguntar en inglés "Tell me about EuroCelta"
- [ ] Jugar 1 partida completa del Chiño Gamer
- [ ] Verificar Rankings de jugadores
- [ ] Verificar Rankings de aficionados
- [ ] Abrir Secciones → verificar Tienda, Abonos, Tour
- [ ] Cambiar idioma → verificar Secciones cambian
- [ ] Cerrar sesión → abrir modal → registrarse con Magic Link
- [ ] Verificar Business View (admin mode)
- [ ] Probar TTS: tocar altavoz en burbuja del chat
