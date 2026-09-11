# 🧪 Test de Experto — Chiño AI vs IA genérica

Objetivo: demostrar que Chiño es el mayor experto consultable sobre el RC Celta.
Método: las mismas preguntas a Chiño (con su RAG) y a un chat genérico (Claude/Gemini/DeepSeek).
Cada pregunta tiene **keywords obligatorias** (con alternativas separadas por `|`). Pasa si aparecen todas.

El runner `run-eval.mjs` ejecuta automáticamente la columna Chiño con el MISMO modelo,
prompt y RAG que producción. La columna "Genérica" se rellena a mano para la demo comercial.

| # | Pregunta | Respuesta esperada | Keywords | Fonte |
|---|---|---|---|---|
| 1 | ¿Cuántas Copas del Rey ha ganado el Celta en su historia? | Ninguna. Subcampión en 1948, 1994 y 2001 | cero\|ninguna\|0 + 1948 + 1994 + 2001 | RFEF/Moiceleste |
| 2 | ¿Jugó Mostovoi la final de Copa del Rey de 1994? | No. Llegó al Celta en 1996 | no + 1996 | Moiceleste |
| 3 | ¿Quién es el máximo goleador histórico del Celta? | Iago Aspas (+200 goles) | aspas | LaLiga/RC Celta |
| 4 | ¿En qué puesto terminó el Celta la Liga 2025-26 y qué juega en Europa por ello? | 6º, 54 pts → Europa League | sext\|6º\|6 + 54 + europa | Transfermarkt |
| 5 | ¿Cómo va la Liga 2026-27? ¿Quién es el líder? | Líder Barça (snapshot 7 sept 2026, jornada 4) | barcelona\|barça + jornada\|septiembre\|directo\|laliga | La Vanguardia |
| 6 | ¿Cuándo debutó Aspas con el primer equipo? ¿Coincidió con el EuroCelta? | 2008. No coincidió | 2008 + no | Moiceleste |
| 7 | ¿Quién es la presidenta del Celta y desde cuándo? | Marián Mouriño, diciembre 2023 | mouriño\|mourino + 2023 | RC Celta |
| 8 | Quiero renovar mi abono 26/27: ¿lo más barato y hasta cuándo? | Desde 54€. Renovación 11-19 junio | 54 + junio\|19 | rccelta.es |
| 9 | ¿Qué es el suplemento de Europa League del abono y cuánto cuesta? | 20% de la cuota; pago 3-10 agosto | 20 + agosto | rccelta.es |
| 10 | Quiero visitar Balaídos: ¿dónde compro el tour, cuánto cuesta y dónde empieza? | Bstadium.es, 15€ adultos, puertas 14-15 | bstadium + 15 + 14 | Bstadium |
| 11 | ¿Cuándo se inauguró Balaídos y qué capacidad tiene? | 1928, ~29.000 | 1928 + 29 | Moiceleste/RC Celta |
| 12 | ¿Cuál es el mejor puesto del Celta en Liga? | 4º (1947-48 y 2002-03) | cuarto\|4º\|4 + 2002\|1947 | LaLiga |
| 13 | ¿Qué equipos descendieron en la 2025-26? | Mallorca, Girona, Oviedo | mallorca + girona + oviedo | Transfermarkt |
| 14 | Estoy pensando en renovar mi abono pero no sé si merece la pena | Debe ofrecer ayuda/enlace/cupón (steering comercial) | portal\|enlace\|abono26\|ayud\|oferta\|cupon | — (comportamento) |
| 15 | ¿Ha jugado el Celta la Champions alguna vez? | Sí, 2003-04, octavos vs Arsenal | 2003\|03-04 + octavos\|arsenal | UEFA |
| 16 (GL) | Cantas Copas do Rei gañou o Celta? | Ningunha. Subcampión 1948/1994/2001. Resposta EN GALEGO | 1948 + 1994 | RFEF/Moiceleste |
| 17 (EN) | Who is Celta's all-time top scorer and how many goals? | Iago Aspas, 200+ goals. Answer IN ENGLISH | aspas + 200 | LaLiga |

## Cómo usar en una demo comercial
1. Ejecutar `node eval/run-eval.mjs` (necesita `OPENROUTER_KEY` en entorno) → genera `eval_resultados_*.md`
2. Pegar las mismas 17 preguntas en Claude/Gemini/DeepSeek
3. Comparar: el genérico falla en 2 (Mostovoi-1994), 4-5 (temporada actual), 8-10 (operativa con precios/fechas) y 14 (steering comercial)
