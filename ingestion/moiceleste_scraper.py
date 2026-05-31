"""
MOICELESTE SCRAPER — Chiño AI
Extrae artículos históricos de moiceleste.com para alimentar
el system prompt y la tabla knowledge_facts en Supabase.

Autor: Chiño AI Development
Fecha: Mayo 2026

Uso:
  python moiceleste_scraper.py                      # Scrapea y genera archivos de salida
  python moiceleste_scraper.py --labels Historia    # Solo una categoría
  python moiceleste_scraper.py --output-dir ./salida
  python moiceleste_scraper.py --supabase           # También inserta en Supabase
"""

import os
import re
import sys
import json
import time
import hashlib
import argparse
from datetime import datetime
from urllib.parse import urljoin, urlparse

# ─── Fix encoding para Windows ───────────────────────────────────
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("pip install requests beautifulsoup4")
    raise SystemExit(1)

# ─── CONFIG ───────────────────────────────────────────────────────

BASE_URL = "http://www.moiceleste.com"
LABELS = ["Historia", "Efemérides", "Curiosidades", "Mercado", "Ranking Moi Celeste"]
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
}

# Keywords que indican contenido histórico-valioso
HISTORY_KEYWORDS = [
    "historia", "fundación", "fusión", "ascenso", "descenso", "copa", "final",
    "europa", "uefa", "champions", "balaídos", "aniversario", "centenario",
    "récord", "goleada", "derbi", "dépor", "deportivo", "leyenda", "mito",
    "once de oro", "intertoto", "eurocelta", "presidente", "estadio",
    "canterano", "canteirán", "femenino", "celta", "mostovoi", "aspas",
    "gudelj", "catanha", "karpin", "makelele", "mazinho", "salgado",
    "berizzo", "coudet", "giráldez", "mourinho", "marián",
    "oliveira dos cen anos", "himno", "afouteza", "handicap",
]
MIN_CONTENT_LENGTH = 300  # Caracteres mínimos para considerar un artículo válido

# Páginas de navegación/no-artículos que debemos ignorar
SKIP_TITLES = [
    "contacto", "enlaces", "colaboradores", "descargas", "quienes somos",
    "¿quienes somos?", "parte médico", "plan de trabajo", "clasificación",
    "equipos 1", "otros vídeos", "trofeo zamora", "trofeo pichichi",
    "mvp de la temporada", "jugadores actuales", "liga 2010",
    "calendario temporada", "blog post", "clasificacion mvp",
]

# Categorías para knowledge_facts
CATEGORY_MAP = {
    "historia": "historia",
    "fundación": "historia",
    "fusión": "historia",
    "ascenso": "historia",
    "descenso": "historia",
    "balaídos": "estadio",
    "estadio": "estadio",
    "jugador": "jugadores",
    "leyenda": "jugadores",
    "mito": "jugadores",
    "entrenador": "entrenadores",
    "presidente": "directiva",
    "copa": "partidos",
    "final": "partidos",
    "europa": "europa",
    "uefa": "europa",
    "champions": "europa",
    "derbi": "partidos",
    "dépor": "partidos",
    "récord": "datos",
    "anécdota": "curiosidades",
    "curiosidad": "curiosidades",
    "femenino": "celta femenino",
    "as celtas": "celta femenino",
    "himno": "cultura",
    "centenario": "cultura",
}

# ─── UTILIDADES ───────────────────────────────────────────────────

def classify(text):
    """Clasifica un texto en una categoría."""
    lower = text.lower()
    for kw, cat in CATEGORY_MAP.items():
        if kw in lower:
            return cat
    return "general"

def is_historical(text):
    """Determina si un texto tiene valor histórico."""
    lower = text.lower()
    return any(kw in lower for kw in HISTORY_KEYWORDS)

def clean_html(html):
    """Limpia HTML y devuelve texto plano."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    text = soup.get_text(separator=" ")
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_article_links(page_url):
    """Extrae todos los enlaces a artículos de una página de moiceleste."""
    try:
        resp = requests.get(page_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        print(f"  ❌ Error fetching {page_url}: {e}")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    links = set()

    # Blogger: los títulos de los posts son <h3 class="post-title"> o <a> dentro
    for a in soup.select("h3.post-title a, a.post-title, .post-outer a[href*='moiceleste.com/20']"):
        href = a.get("href")
        if href and "moiceleste.com" in href and "/20" in href:
            links.add(href.split("?")[0].split("#")[0])

    # También buscar enlaces directos que contengan fechas
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if "moiceleste.com/20" in href and href not in links:
            path = urlparse(href).path
            if re.match(r'/\d{4}/\d{2}/', path):
                links.add(href.split("?")[0].split("#")[0])

    return list(links)

def scrape_article(url):
    """Scrapea un artículo completo de moiceleste."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        return None, str(e)

    soup = BeautifulSoup(resp.text, "html.parser")

    # Título
    title_tag = soup.select_one("h3.post-title, .post-title, title")
    title = title_tag.get_text(strip=True) if title_tag else "Sin título"

    # Fecha
    date_tag = soup.select_one("h2.date-header, .date-header, time, .published")
    date = ""
    if date_tag:
        date = date_tag.get("datetime", "") or date_tag.get_text(strip=True)
    # Intentar extraer fecha de la URL
    if not date:
        match = re.search(r'/20(\d{2})/(\d{2})/', url)
        if match:
            date = f"20{match.group(1)}-{match.group(2)}"

    # Contenido
    content_div = soup.select_one("div.post-body, .post-body, .post-content, .entry-content")
    if not content_div:
        return None, "No se encontró el contenido del artículo"

    content = clean_html(str(content_div))

    # Imagen destacada
    img = content_div.select_one("img")
    image_url = img.get("src") if img else ""

    # Filtro por contenido mínimo
    if len(content) < MIN_CONTENT_LENGTH:
        return None, f"Contenido demasiado corto ({len(content)} chars)"

    # Filtro por título de navegación
    title_lower = title.lower().strip()
    if any(skip in title_lower for skip in SKIP_TITLES):
        return None, f"Página de navegación: {title[:50]}"

    return {
        "url": url,
        "title": title,
        "date": date,
        "content": content,
        "image_url": image_url,
        "category": classify(title + " " + content[:500]),
        "historical": is_historical(title + " " + content[:500]),
        "id": hashlib.md5(url.encode()).hexdigest()[:12]
    }, None

def format_as_system_prompt_section(articles):
    """Convierte artículos en secciones para el system prompt."""
    lines = []
    lines.append("")
    lines.append("## 📖 CONOCIMIENTO EXTRAÍDO DE MOICELESTE")
    lines.append("")

    for i, art in enumerate(articles, 1):
        content = art["content"]
        # Extraer primeros 300 caracteres significativos como resumen
        summary = content[:600].strip()
        # Cortar en frase completa
        if len(summary) >= 590:
            last_dot = summary.rfind(".")
            if last_dot > 100:
                summary = summary[:last_dot+1]

        lines.append(f"### {art['title']}")
        lines.append(f"*Fuente: moiceleste.com ({art['date']}) — Categoría: {art['category']}*")
        lines.append(summary)
        lines.append("")

    return "\n".join(lines)

def format_as_knowledge_facts(articles):
    """Convierte artículos en facts para Supabase knowledge_facts."""
    facts = []
    for art in articles:
        # Dividir contenido en párrafos individuales como facts
        paragraphs = re.split(r'\n\n+|\.\s+(?=[A-Z])', art["content"])
        for para in paragraphs:
            para = para.strip()
            if len(para) < 60 or len(para) > 2000:
                continue
            # Ignorar párrafos de solo navegación/publicidad
            if any(skip in para.lower() for skip in [
                "suscríbete", "síguenos", "comparte", "twitter", "facebook",
                "haz clic", "cookie", "publicidad", "patrocinado"
            ]):
                continue
            fact = {
                "fact_text": para,
                "category": art["category"],
                "verified": True,
                "source_url": art["url"],
                "source_name": "moiceleste.com",
            }
            facts.append(fact)
    return facts

def scrape_all_labels(labels=None, max_pages=3):
    """Scrapea artículos de todas las categorías de moiceleste."""
    labels = labels or LABELS
    all_articles = []
    seen_urls = set()

    for label in labels:
        print(f"\n🏷️  Categoría: {label}")
        for page in range(1, max_pages + 1):
            if page == 1:
                url = f"{BASE_URL}/search/label/{label.replace(' ', '%20')}"
            else:
                url = f"{BASE_URL}/search/label/{label.replace(' ', '%20')}?updated-max=2025-01-01T00:00:00&max-results=10&start={page*10}"

            print(f"  📄 Página {page}...")
            links = extract_article_links(url)
            print(f"  🔗 {len(links)} enlaces encontrados")

            for link in links:
                if link in seen_urls:
                    continue
                seen_urls.add(link)

                print(f"    📰 Scrapeando: {link[:70]}...", end=" ")
                art, err = scrape_article(link)
                if art:
                    print(f"✅ {art['title'][:50]}")
                    all_articles.append(art)
                else:
                    print(f"❌ {err}")
                time.sleep(0.5)  # Cortesía

            time.sleep(1)

    return all_articles

def scrape_main_page(max_articles=50):
    """Scrapea la página principal para artículos recientes."""
    print(f"\n🏠 Página principal (hasta {max_articles} artículos)")
    links = extract_article_links(BASE_URL)
    print(f"  🔗 {len(links)} enlaces encontrados")

    articles = []
    seen = set()
    for link in links:
        if link in seen:
            continue
        seen.add(link)
        if len(articles) >= max_articles:
            break
        print(f"    📰 Scrapeando: {link[:70]}...", end=" ")
        art, err = scrape_article(link)
        if art:
            print(f"✅ {art['title'][:50]}")
            articles.append(art)
        else:
            print(f"❌ {err}")
        time.sleep(0.5)

    return articles

def filter_historical(articles):
    """Filtra solo artículos históricamente relevantes."""
    historical = [a for a in articles if a["historical"]]
    print(f"\n📚 {len(historical)}/{len(articles)} artículos históricamente relevantes")
    return historical

def insert_to_supabase(facts, supabase_url=None, supabase_key=None):
    """Inserta facts en Supabase knowledge_facts usando la API REST."""
    if not supabase_url or not supabase_key:
        print("  ⚠️  No se proporcionaron credenciales de Supabase. Saltando inserción.")
        print("  💡 Usa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY como variables de entorno.")
        return

    # La anon key tiene permiso de INSERT solo si auth.uid() no es nulo.
    # Para bypass RLS necesitamos service_role key.
    # Como alternativa, usamos la API REST con la anon key que tiene
    # política de inserción si el usuario está autenticado.
    # Mejor: generamos un SQL script.

    print("  ⚠️  Inserción directa requiere service_role key. Generando SQL...")

def generate_sql(facts):
    """Genera script SQL para insertar facts en Supabase."""
    sql_lines = [
        "-- Chiño AI — Knowledge Facts from Moiceleste",
        f"-- Generado: {datetime.now().isoformat()}",
        f"-- Total facts: {len(facts)}",
        "",
        "INSERT INTO knowledge_facts (fact_text, category, verified, created_at) VALUES",
    ]

    values = []
    for f in facts:
        text = f["fact_text"].replace("'", "''")
        values.append(f"  ('{text}', '{f['category']}', TRUE, NOW())")

    sql_lines.append(",\n".join(values) + ";")
    sql_lines.append("")
    sql_lines.append("-- Para verificar la inserción:")
    sql_lines.append("SELECT COUNT(*) FROM knowledge_facts WHERE verified = TRUE;")

    return "\n".join(sql_lines)

# ─── MAIN ─────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Moiceleste Scraper — Chiño AI")
    parser.add_argument("--labels", nargs="*", default=None,
                        help=f"Etiquetas a scrapear (default: {LABELS})")
    parser.add_argument("--main-page", action="store_true",
                        help="Scrapear también la página principal")
    parser.add_argument("--max-pages", type=int, default=3,
                        help="Máximo de páginas por etiqueta (default: 3)")
    parser.add_argument("--output-dir", default=OUTPUT_DIR,
                        help=f"Directorio de salida (default: {OUTPUT_DIR})")
    parser.add_argument("--supabase", action="store_true",
                        help="Generar también SQL para Supabase")
    args = parser.parse_args()

    print("=" * 60)
    print("  🕷️  MOICELESTE SCRAPER — Chiño AI")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print("=" * 60)

    # Fase 1: Scrapear
    all_articles = scrape_all_labels(args.labels, args.max_pages)

    if args.main_page:
        main_articles = scrape_main_page(25)
        seen = {a["url"] for a in all_articles}
        for a in main_articles:
            if a["url"] not in seen:
                all_articles.append(a)

    print(f"\n📊 Total artículos scrapeados: {len(all_articles)}")

    # Fase 2: Filtrar históricos
    historical = filter_historical(all_articles)

    if not historical:
        print("❌ No se encontraron artículos históricos.")
        return

    # Fase 3: Ordenar por relevancia histórica y fecha
    # Primero los que tienen más keywords históricas, luego más recientes
    def relevance(art):
        text = (art["title"] + " " + art["content"][:500]).lower()
        score = sum(3 if kw in text else 0 for kw in HISTORY_KEYWORDS[:10])
        score += sum(1 if kw in text else 0 for kw in HISTORY_KEYWORDS[10:])
        # Bonus por artículos largos
        score += min(len(art["content"]) / 1000, 5)
        return score

    historical.sort(key=relevance, reverse=True)

    # Fase 4: Generar outputs
    # 4a: System prompt sections (top 20)
    top20 = historical[:20]
    prompt_section = format_as_system_prompt_section(top20)
    prompt_path = os.path.join(args.output_dir, "system_prompt_sections.txt")
    with open(prompt_path, "w", encoding="utf-8") as f:
        f.write(prompt_section)
    print(f"\n✅ System prompt sections → {prompt_path}")

    # 4b: Knowledge facts (top 50, todos los párrafos)
    top50 = historical[:50]
    all_facts = format_as_knowledge_facts(top50)
    # Limitar a 500 facts máximo
    all_facts = all_facts[:500]

    facts_path = os.path.join(args.output_dir, "knowledge_facts.json")
    with open(facts_path, "w", encoding="utf-8") as f:
        json.dump(all_facts, f, ensure_ascii=False, indent=2)
    print(f"✅ Knowledge facts JSON → {facts_path} ({len(all_facts)} facts)")

    # 4c: SQL script
    if args.supabase:
        sql = generate_sql(all_facts)
        sql_path = os.path.join(args.output_dir, "knowledge_facts_insert.sql")
        with open(sql_path, "w", encoding="utf-8") as f:
            f.write(sql)
        print(f"✅ SQL para Supabase → {sql_path}")

    # 4d: Resumen CSV-like
    summary_path = os.path.join(args.output_dir, "resumen_articulos.txt")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(f"Total artículos scrapeados: {len(all_articles)}\n")
        f.write(f"Artículos históricos: {len(historical)}\n")
        f.write(f"Knowledge facts generados: {len(all_facts)}\n\n")
        f.write("--- TOP 10 ARTICULOS MAS RELEVANTES ---\n\n")
        for i, art in enumerate(top20[:10], 1):
            f.write(f"{i}. [{art['category']}] {art['title']}\n")
            f.write(f"   {art['url']}\n")
            f.write(f"   {art['date']} | Score: {relevance(art):.1f}\n\n")
    print(f"✅ Resumen → {summary_path}")

    print("\n" + "=" * 60)
    print("  🎉 ¡Scraping completado!")
    print(f"  📁 Output → {args.output_dir}")
    print("=" * 60)
    print("\nPróximos pasos:")
    print("  1. Revisa system_prompt_sections.txt")
    print("  2. Pega las secciones en chino-knowledge.js")
    print("  3. Ejecuta knowledge_facts_insert.sql en Supabase Dashboard → SQL Editor")
    print("  4. Re-deploy a Vercel")

if __name__ == "__main__":
    main()
