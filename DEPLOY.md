# 🚀 CHIÑO AI — GUÍA DE DESPLIEGUE EXPRESS
## Stack: Git + Supabase + Vercel + OpenAI

---

## 1. GIT — Inicializar repositorio

```bash
cd "C:\Users\param\Documents\FOOTBALL IA PROJECTS\R.C.CELTA"
git init
git add .
git commit -m "feat: MVP Chiño AI — agente virtual RC Celta"
```

Crear repo en GitHub (público/gratuito) y subir:
```bash
git remote add origin https://github.com/tu-usuario/chino-ai.git
git branch -M main
git push -u origin main
```

---

## 2. SUPABASE — Base de datos + Auth

1. Ve a https://supabase.com → New Project → `chino-mvp`
2. En **SQL Editor**, pega el contenido de `supabase-schema.sql` y ejecuta
3. Luego pega `supabase-seed.sql` para datos de demostración
4. Ve a **Project Settings > API** y copia:
   - `Project URL` → será tu `VITE_SUPABASE_URL`
   - `anon public key` → será tu `VITE_SUPABASE_ANON_KEY`

---

## 3. OPENAI — API Key

1. Ve a https://platform.openai.com/api-keys
2. Crea una key para `gpt-4o-mini`
3. Esa será tu `VITE_OPENAI_API_KEY`

---

## 4. VERCEL — Frontend

```bash
cd frontend
npm install
npm run build    # debe compilar sin errores
```

1. Ve a https://vercel.com → Importar repositorio
2. Añade variables de entorno (Project Settings → Environment Variables):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_OPENAI_API_KEY`
3. Deploy → Obtendrás URL tipo `https://chino-ai-mvp.vercel.app`

---

## 5. VARIABLES DE ENTORNO LOCALES

Copia `.env.example` a `.env` en la carpeta `frontend/`:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
VITE_OPENAI_API_KEY=sk-tu-clave-openai
```

---

## 6. INGESTA DE DATOS (Python, opcional)

```bash
cd ingestion
pip install -r requirements.txt
python chino_ingestor.py --seed
```

Para exportar datos a JSON:
```bash
python chino_ingestor.py --export-json ./backups
```

---

## 7. VERIFICACIÓN

- [ ] `npm run build` compila sin errores
- [ ] Supabase SQL Editor ejecutó schema + seed
- [ ] Variables de entorno configuradas en Vercel
- [ ] App responde preguntas en chat
- [ ] Chiño Gamer carga preguntas y permite jugar
- [ ] Voz funciona (Chrome desktop/Android)

---

## 8. GRABAR EL VIDEO

Sigue el guion en `GUION_VIDEO_FINAL.md`
Graba con el móvil mostrando la app en el ordenador o directamente en el móvil.
