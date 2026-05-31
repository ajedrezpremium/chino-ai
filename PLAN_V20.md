# 🚀 CHIÑO AI · PLAN V2.0
## Real Club Celta de Vigo — El Primer Agente IA del Fútbol Mundial

---

## 🔴 DIAGNÓSTICO ACTUAL (V1.0)

| Aspecto | Estado | Prioridad V2.0 |
|---|---|---|
| Chat + IA con OpenRouter (gpt-4o-mini) | ✅ | Mejora continua |
| Chiño Gamer (trivial, 130+ preguntas, streak, sonidos) | ✅ | Expandir |
| Rankings (jugadores, entrenadores, aficionados) | ✅ | Datos reales |
| Autenticación (email, Google, Magic Link) | ✅ | — |
| Business View (KPIs reales de Supabase) | ✅ | Profundizar |
| Landing + Secciones monetización | ✅ | — |
| Selector de voz TTS + 3 idiomas | ✅ | — |
| Sistema de correcciones + knowledge_facts | ✅ | Moderar + revisar |
| **SQL migration sin ejecutar** | ❌ | **Crítica** |
| **Pruebas unitarias / E2E** | ❌ | Necesario |
| **500+ preguntas en Gamer** | ❌ | Alta |

---

## 🏗️ FASE 1 — CORAZÓN DEL NEGOCIO (para el Director General)

### 1.1 Business Intelligence en vivo
**Qué:** Dashboard ejecutivo con datos de uso reales del asistente.
**KPIs concretos:**
- Usuarios activos diarios / semanales / mensuales
- Partidas jugadas en Gamer
- Mensajes enviados en Chat
- Tasa de retención D1, D7, D30
- Ingresos estimados por conversiones (entradas, tienda, abonos)
- Horas pico de uso (calor semanal)
**Tecnología:** Supabase queries + gráficos Chart.js / Recharts
**Valor para el DG:** "Esto ya genera datos de negocio, no es un juguete."

### 1.2 Chat transaccional — Venta desde el asistente
**Qué:** El usuario puede comprar entradas, merchandising o abonos sin salir del chat.
**Flujo:**
1. Usuario: "Quiero dos entradas para el próximo partido"
2. Chiño: "¿Fondo o Tribuna? ¿Socios o no socios?"
3. Integración con API de ticketing (si existe) o carrito simulado → redirige a tienda
**Valor para el DG:** "Cada conversación puede generar ingresos."

### 1.3 Campañas automatizadas
**Qué:** Chiño envía mensajes proactivos a los usuarios.
**Ejemplos:**
- "Bo día, siareiro! Maior xoga o Celta en Balaídos. Últimas entradas aquí → [link]"
- "Esta semana no Chiño Gamer: premio especial para o top 10"
- "O Celta acaba de gañar! Reacción de Chiño + resumen del partido"
**Tecnología:** Supabase Edge Functions + cron triggers
**Valor para el DG:** "Engagement automatizado 24/7 sin coste humano."

---

## 🚀 FASE 2 — EXPERIENCIA Y COMUNIDAD

### 2.1 Familia de Agentes (el "más" diferencial)
**Qué:** 6 agentes especializados, cada uno con prompt + contexto propio.

| Agente | Función | Prompt base |
|---|---|---|
| 🤖 **Chiño Base** | Historia, cultura, trivia general | Actual (mejorado) |
| 💰 **Agente Económico** | Ingresos, ticketing, abonos, patrocinios | Datos financieros + tendencias |
| ⚽ **Agente Deportivo** | Plantilla, tácticas, scouting, rivales | Datos estadísticos + alineaciones |
| 🌱 **Agente Canteira** | A Madroa, juveniles, promesas | Datos de cantera + informes |
| 🏛️ **Agente Institucional** | Preguntas corporativas, socios, historia oficial | Documentos oficiales + FAQ |
| 🎓 **Profesor Chess IA** | Fútbol y educación en valores | Historias vitales + lecciones |

**Valor para el DG:** "No es un chat, es una plataforma de agentes. Escalable a cualquier área del club."

### 2.2 Profesor Chess IA — Fútbol y Educación en Valores (NUEVO)

**Qué:** Un agente narrativo que cuenta historias reales de futbolistas que rompieron barreras gracias al esfuerzo, la constancia y el talento. Cada historia lleva una enseñanza vital.

**Ejemplos de historias:**
- **Hakimi y Mbappé** — Dos hijos de inmigrantes, criados en barrios humildes, que llegaron a ser campeones de Europa. Sus padres no tenían dinero, pero tenían un sueño. La constancia y el talento rompieron todas las barreras.
- **Iago Aspas** — El niño de Moaña que soñaba con Balaídos. Nadie creía en él, pero su abuelo le enseñó que "querer es poder". Hoy es leyenda del Celta y de LaLiga.
- **Luis Suárez (Vallecas)** — Creció sin agua caliente en casa. El fútbol fue su única salida. Llegó a ser Balón de Oro. Su lema: "Nunca dejes de creer."

**Formato:**
- Cada semana, "El Profe Chess" aparece con una historia nueva en el chat
- La historia se cuenta en formato interactivo: el usuario puede elegir cómo avanza la narración
- Al final, una "pregunta reflexión" invita al usuario a compartir su propia historia o aprendizaje
- Las historias se pueden compartir en redes sociales con una tarjeta visual personalizada

**Valor diferencial:**
- Conecta emocionalmente con las familias y los más jóvenes
- Refuerza la marca Celta como club comprometido con la educación y los valores
- Contenido viral compartible: "La historia de superación de [Jugador] contada por IA"
- Diferenciación frente a cualquier otro club: ningún equipo tiene un "profesor de valores" con IA
- Posible partnership con colegios, fundaciones y obras sociales
- Sinergia con la Fundación Celta y su programa de valores

**Valor para el DG:** "Esto no lo tiene ningún club del mundo. Educa, emociona y genera marca. Los patrocinadores querrán estar asociados a esto."

### 2.3 Chiño Gamer — Expansión
- **500+ preguntas** en Supabase (categorizadas: historia, jugadores, actualidad, estadísticas, curiosidades)
- **Reto semanal** con premio real (descuento en tienda, abono gratis, experiencia VIP)
- **Tabla de líderes semanal** con badges (Bronce, Plata, Oro, Celeste Legend)
- **Compartir resultado** en redes sociales

### 2.4 Noticias automáticas del Celta
- Scraping cada 6h de moiceleste.com + farodevigo.es
- Resumen automático generado por Chiño
- Sección "Últimas novas" en el chat
- Sin RAG complejo — solo prompt + texto scrapeado

---

## 🔧 FASE 3 — INFRAESTRUCTURA Y CALIDAD

### 3.1 SQL Migration (¡URGENTE!)
Ejecutar `supabase-migration-v1.sql` en el dashboard de Supabase para activar:
- RLS policies para rankings públicos
- Tabla `knowledge_facts` + `corrections`
- 30 preguntas extra para Gamer
- Perfiles públicos con `display_name`

### 3.2 Tests
- Tests unitarios con Vitest para funciones críticas (detectLang, cálculos de puntuación)
- Tests de componentes con React Testing Library (AuthModal, ChinoGamer)
- Tests E2E con Playwright (flujo completo: landing → chat → gamer → rankings)

### 3.3 Despliegue y monitorización
- Logs de errores con Sentry (gratuito para proyectos pequeños)
- Healthcheck semanal del endpoint OpenRouter
- Backup semanal de Supabase (se puede exportar manualmente)

---

## 📊 ESTIMACIÓN DE ESFUERZO

| Fase | Puntos | Impacto | Dependencias |
|---|---|---|---|
| FASE 1 · Negocio | 13 puntos | 🔴 Crítico | API ticketing, Edge Functions |
| FASE 2 · Experiencia | 10 puntos | 🟠 Alto | Scraping, Edge Functions, Profesor Chess |
| FASE 3 · Infraestructura | 5 puntos | 🟡 Medio | Ninguna |
| **TOTAL V2.0** | **28 puntos** | — | — |

---

## ✅ CHECKLIST PARA EL LUNES (presentación al DG)

- [ ] Ejecutar `supabase-migration-v1.sql` en Supabase Dashboard
- [ ] Ver demo de Chiño Gamer con streak + sonidos + rankings reales
- [ ] Mostrar Business View con KPIs reales
- [ ] Demostrar cambio de idioma (galego → español → inglés)
- [ ] Demostrar Magic Link (login sin contraseña en 30 segundos)
- [ ] Tener .env con claves listas para cualquier desarrollador
- [ ] Mostrar las 6 secciones de monetización impresas o en pantalla

---

## 🧠 ARGUMENTOS CLAVE PARA EL DIRECTOR GENERAL

**"¿Por qué esto y no otra cosa?"**
> "Chiño AI es la primera plataforma de agentes IA de un club de fútbol. No es un chatbot genérico: entiende de fútbol, habla gallego, conoce la historia del club y puede escalar a ventas, atención al socio, scouting y análisis financiero. Cada área del club puede tener su propio agente."

**"¿Qué aporta a los abonados?"**
> "Información 24/7, gamificación, comunidad, ofertas personalizadas y una experiencia diferencial que ningún otro club ofrece."

**"¿Cuánto cuesta mantenerlo?"**
> "OpenRouter (gpt-4o-mini): ~$0.15 por cada 1.000 mensajes. Supabase: plan gratis (500MB DB, 2GB ancho de banda). Vercel: plan gratis (100GB ancho de banda). Coste total estimado: **$0-20/mes** para los primeros 1.000 usuarios activos."

**"¿Qué necesitamos para V2.0?"**
> "Acceso a API de ticketing, datos financieros del club, y un desarrollador frontend/Supabase a tiempo parcial. El resto es tecnología gratuita."

---

*Chiño AI © 2026 — Real Club Celta de Vigo • Feito en Vigo • Para o mundo celeste*
