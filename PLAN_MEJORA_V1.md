# PLAN DE MEJORA · Chiño AI v1.0

## 📋 Diagnóstico actual

| Aspecto | Estado | Prioridad |
|---|---|---|
| Chat + IA | ✅ Funcional (OpenRouter, TTS, voz) | — |
| Landing con fotos | ✅ Funcional | — |
| Chiño Gamer (trivial) | ✅ Funcional (5 preguntas, timer, puntuación) | — |
| Rankings (xogadores/adestradores) | ⚠️ Datos hardcodeados | Media |
| Rankings (siareiros) | ⚠️ Sen usuarios reais (sen auth) | Alta |
| Business View | ⚠️ Estática, sen datos reais | Media |
| Demo Tour | 🟡 Orfa (non se renderiza) | Baixa |
| Autenticación | ❌ Non existe | Crítica |
| Persistencia de chat | ❌ Pérdese ao recargar | Alta |
| Preguntas ilimitadas Gamer | ❌ Só 20 en Supabase | Alta |
| Sonido/feedback Gamer | ❌ Non ten | Media |
| Imaxes en legend cards | ❌ Iniciais en vez de fotos | Media |
| Test | ❌ Non existen | Baixa |
| .env.example | ❌ Non existe | Baixa |

---

## 🏗️ FASE 1 — CORE (urxente, antes de presentar)

### 1.1 Autenticación con Supabase Auth
**Email:** "captación de abonados", "atención personalizada para socios"

**Implementación:**
- Engadir Supabase Auth con magic link (email sen contrasinal) e opción de Google OAuth
- Crear `AuthModal.jsx` — ventá emerxente para login/rexistro
- Gardar perfil en `user_profiles` con: `id`, `email`, `display_name`, `avatar_url`, `is_socios` (booleano), `socio_number`
- O header mostra avatar + nome si está logueado, senón botón "Entrar"
- O admin mode real verifica rol en `user_profiles.role = 'admin'`

**Ficheiros:** `src/AuthModal.jsx`, modificar `App.jsx`
**Dependencias:** `@supabase/supabase-js` (xa incluído)

### 1.2 Persistencia de chat en Supabase
**Email:** "comunicación oficial directa 24/7"

**Implementación:**
- Gardar cada mensaxe en `chat_history` (user_id, role, text, created_at)
- Ao cargar Chat, recuperar últimas N mensaxes do usuario
- Engadir botón "Borrar historial" nas opcións

**Ficheiros:** modificar `App.jsx` (efecto `useEffect` en mensaxes)

### 1.3 Ampliar preguntas do Gamer + sistema de puntuación
**Email:** "trivials e retos diarios para aumentar a interacción"

**Implementación:**
- Engadir 100+ preguntas en Supabase (categorías: historia, xogadores, curiosidades, actualidade)
- Sistema de "reto diario": 5 preguntas novas cada día (rotación por `created_at` + dia)
- Raia (streak) diario: puntos extra por días consecutivos xogando
- Evitar repeticións: rexistrar `last_played` en `user_profiles` e non repetir preguntas das últimas 48h
- Sonido de acerto/fallo con Web Audio API (beep curto, sen ficheiros)

**Ficheiros:** modificar `ChinoGamer.jsx`, engadir seed de preguntas en SQL
**Datos:** `game_questions` table

### 1.4 Ranking de siareiros con usuarios reais
**Email:** "gamificación e rankings de aficionados"

**Implementación:**
- Unha vez con auth, o ranking de siareiros mostra `display_name` en vez de `user_id` anónimo
- Engadir puntos de fidelidade: +10 por cada partida, +50 por raia de 7 días
- Top 10 semanal con premio simbólico (badge no perfil)

**Ficheiros:** modificar `RankingsView.jsx`, `ChinoGamer.jsx`

---

## 🚀 FASE 2 — EXPERIENCIA (enriquece a demo)

### 2.1 Minifotos nas legend cards
**Email:** (requirimento visual)

**Implementación:**
- Engadir columna `image_url` na táboa `legends`
- Se existe, amosa `<img>`; se non, mostra a inicial como fallback
- Para o MVP, usar imaxes de xogadores de dominio público ou as que xa teñas

**Ficheiros:** modificar `LandingView.jsx`

### 2.2 Business View con datos reais
**Email:** "análise financeiro, patrocinio, ticketing e negocio"

**Implementación:**
- Conectar KPIs a consultas Supabase: nº total de usuarios, partidas xogadas, mensaxes enviadas
- Gráfico de engagement semanal (últimos 7 días)
- Mapa de calor de horas de uso
- Sección de "Patrocinios" con logos e impacto (Estrella Galicia, Abanca, etc.)

**Ficheiros:** modificar `BusinessView.jsx`

### 2.3 Optimizar voces TTS
**Email:** "asistente conversacional trilingüe"

**Implementación:**
- Engadir selector manual de voz (lista despregable coas voces detectadas)
- Gardar preferencia en `user_profiles` (con auth)
- Para o idioma galego, detectar se hai voces galegas (`gl`), senón usar español con acento

**Ficheiros:** modificar `App.jsx` (función `speak`)

### 2.4 Mellorar hero da landing
**Email:** "imaxe de marca do RC Celta como club innovador"

**Implementación:**
- Animación parallax sutil ó facer scroll (si hai contido)
- Texto de benvida superposto tipo "O primeiro axente de IA do fútbol mundial"
- Efecto de partículas (Celtiñas) con CSS/Canvas

**Ficheiros:** modificar `LandingView.jsx`

---

## 🔧 FASE 3 — INFRAESTRUTURA (deuda técnica)

### 3.1 Variables de entorno documentadas
- Crear `.env.example` con tódalas claves necesarias

### 3.2 Manexo de erros
- Envolver tódalas chamadas Supabase en try/catch
- Mostrar toast/notificación de erro amigable
- Estado de carga mentres se fetch

### 3.3 Mobile responsive
- Probar en móbil e axustar paddings, tamaños de fonte
- Botón de voz en móbil
- Gardar estado de chat en `localStorage` mentres non hai auth

### 3.4 Demo Tour operativo
- Importar `<DemoTour />` en `App.jsx`
- Engadir botón "🎬 Ver demo" no header

---

## 🧩 ARQUITECTURA PROXECTADA (para a "familia de agentes")

```
chino-ai/
├── frontend/                    # React + Vite (este)
├── agentes/                     # (futuro) Servizos autónomos
│   ├── economico/               # Análise financeira
│   ├── deportivo/               # Scouting + táctica
│   ├── social/                  # Redes + afición
│   ├── institucional/           # Atención corporativa
│   └── cantera/                 # A Madroa · talento
├── ingestion/                   # Scripts Python (xa existe)
└── supabase/                    # Esquemas + migracións
```

Cada "agente" da familia será un **prompt especializado + endpoint OpenRouter** coa súa base de coñecemento, accesible desde o chat principal con frases como:
- *"Pregúntalle ao Agente Económico sobre os ingresos do último partido"*
- *"Que di o Agente Deportivo sobre o próximo rival?"*

---

## 📊 ESTIMACIÓN DE ESFORZO

| Fase | Puntos de esforzo | Impacto |
|---|---|---|
| FASE 1 · Core | 8 puntos | 🔴 Crítico para presentar |
| FASE 2 · Experiencia | 5 puntos | 🟠 Melloras visibles |
| FASE 3 · Infraestrutura | 3 puntos | 🟡 Estabilidade |

**Total v1.0:** ~16 puntos (horas de desenvolvemento)

---

## ✅ CHECKLIST DE PRESENTACIÓN

- [ ] Auth con magic link funcional
- [ ] Chat persistente con historial
- [ ] Gamer con 100+ preguntas sen repetición
- [ ] Ranking con nomes reais de usuarios
- [ ] Business View con datos de uso reais
- [ ] Voces TTS con selector manual
- [ ] .env.example documentado
- [ ] Erros manexados (sen crashes)
- [ ] Funciona en móbil
