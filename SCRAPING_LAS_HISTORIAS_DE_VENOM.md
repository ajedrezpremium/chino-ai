# 🕷️ Las Historias de Venom · Scraping Plan

## Canal YouTube → Fuente de anécdotas para Chiño AI

| Dato | Valor |
|---|---|
| **Canal** | Las Historias de Venom |
| **Suscriptores** | ~154.000 |
| **Videos** | ~800 |
| **Vistas totales** | ~33M |
| **Inicio** | 19/08/2021 |
| **Temática** | Anécdotas, curiosidades e historias de fútbol |
| **Idioma** | Español |
| **URL** | `https://youtube.com/@LasHistoriasDeVenom` |

---

## ¿Por qué es una mina de oro?

El canal tiene **800+ videos** de historias cortas de fútbol. Cada video es una anécdota narrativa perfecta para:

- **Alimentar al Profesor Chess IA** — Historias de superación, valores, constancia
- **Base de datos de anécdotas** — Consultable por Chiño cuando un usuario pregunta
- **Contenido diario** — "Historia del día" automatizada
- **Seed de preguntas** — Para Chiño Gamer (trivial)

---

## Pipeline de scraping (Python, futuro)

```
1. YouTube Data API v3 → lista de videos del canal
   - GET /search?channelId=...&order=date&maxResults=50
   - Paginar hasta obtener todos los ~800 videos

2. Por cada video:
   - Título + Descripción + Tags
   - Transcripción del audio (YouTube captions / Whisper)
   - Duración, fecha, vistas, likes

3. Procesamiento:
   - Extraer: protagonista(s), equipo, año, valor/lección
   - Clasificar por categorías (superación, curiosidad, histórico, etc.)
   - Generar resumen en 3 líneas
   - Detectar entidades (jugadores, clubes, años)

4. Ingesta en Supabase:
   - Tabla `anecdotas` con campos: titulo, protagonista, equipo, año,
     categoria, valor_ensenanza, resumen, transcripcion, url_video,
     fecha_publicacion, vistas, likes
   - Indexada por protagonista, equipo, año, categoria
```

---

## Categorías de historias detectadas

| Categoría | Ejemplos | Para qué sirve |
|---|---|---|
| 🏆 **Superación** | Jugadores que salieron de la pobreza | Profesor Chess IA |
| 📚 **Curiosidades** | Datos sorprendentes, récords absurdos | Chiño Base + Gamer |
| ⚽ **Leyendas** | Carreras de grandes jugadores | Chiño Base |
| 😂 **Humor** | Anécdotas divertidas de vestuarios | Chiño personalidad |
| 💔 **Drama** | Tragedias, lesiones, injusticias | Contenido emocional |
| 🕰️ **Histórico** | Partidos, torneos, épocas pasadas | Chiño Base |
| 👨‍👩‍👧 **Valores** | Lecciones de vida, familia, esfuerzo | Profesor Chess IA |

---

## Volumen estimado

| Mes | Nuevas historias |
|---|---|
| Canal sube ~2-3 videos/semana | ~10-12 nuevas/mes |
| Backlog inicial | ~800 videos |
| **Total disponible** | **~800+ anécdotas** |
| **Crecimiento mensual** | **~10-12** |

---

## Integración con Chiño AI

### Fase 1 — Scraping inicial (batch)
```python
# Pseudocódigo
venom_channel_id = "UC..."
videos = youtube.search().list(channelId=venom_channel_id, ...)
for video in videos:
    captions = youtube.captions().list(videoId=video.id, ...)
    anecdata = extract_entities(video.title + captions)
    supabase.table("anecdotas").upsert(anecdata)
```

### Fase 2 — Procesamiento con IA
Cada transcripción se pasa por GPT-4o-mini para extraer:
- Personaje principal
- Equipo(s) involucrado(s)  
- Año o época
- Valor/lección (si aplica)
- Resumen de 3 líneas
- Categoría

### Fase 3 — Exposición en Chiño
- **Chat**: Usuario dice "cuéntame una historia" → Chiño busca en `anecdotas` random
- **Profesor Chess**: Selecciona historias con `categoria = 'valores'` o con `valor_ensenanza != null`
- **Gamer**: Genera preguntas tipo "¿Qué jugador...?" a partir de las historias
- **Diaria**: "Historia del día" automática rotando las 800+

---

## Consideraciones técnicas

- **YouTube Data API**: 10.000 unidades/día gratis (cada video cuesta 1-3 unidades)
- **800 videos → ~2.400 unidades** → se puede hacer en 1 día
- **Transcripciones**: YouTube genera captions automáticos para español
  - Alternativa: descargar audio y usar Whisper (más preciso, sin API key)
- **Rate limiting**: 1 request/second max
- **Licencia**: Las historias son contenido público, las usamos como base de conocimiento referenciada

---

## Próximos pasos (cuando toque implementar)

1. Obtener `channel_id` del canal Las Historias de Venom
2. Crear tabla `anecdotas` en Supabase (schema listo arriba)
3. Escribir scraper Python con YouTube Data API
4. Batch inicial: procesar 800+ videos con GPT-4o-mini
5. Integrar búsqueda en el prompt del sistema de Chiño
6. Programar scraper semanal (GitHub Actions + cron)
