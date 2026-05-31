"""
Scrapea artículos históricos específicos de moiceleste.com
Identificados por su alto valor histórico para Chiño AI.
"""

import os
import sys
import json
import hashlib
sys.path.insert(0, os.path.dirname(__file__))
from moiceleste_scraper import scrape_article, format_as_system_prompt_section, format_as_knowledge_facts, OUTPUT_DIR

# Artículos de alto valor histórico encontrados
GOLD_ARTICLES = [
    # Fundación e historia temprana
    "http://www.moiceleste.com/2011/08/el-real-club-celta-cumple-88-anos.html",
    "http://www.moiceleste.com/2025/08/feliz-102-aniversario-celtistas.html",
    "http://www.moiceleste.com/2013/08/hoy-se-cumplen-69-anos-de-la-muerte-de.html",

    # Estadio Balaídos
    "http://www.moiceleste.com/2014/07/las-reformas-de-balaidos-lo-largo-de-la.html",

    # Ascensos históricos
    "http://www.moiceleste.com/2011/06/ascensos-del-celta-primer-ascenso-1935.html",

    # Leyendas y jugadores
    "http://www.moiceleste.com/2014/08/la-historia-de-los-13-serbios-que.html",
    "http://www.moiceleste.com/2025/08/el-dia-que-cambio-la-historia-del-celta.html",
    "http://www.moiceleste.com/2025/07/34-anos-de-vladismo.html",
    "http://www.moiceleste.com/2019/11/dorsales-historicos-del-celta-24-catanha.html",
    "http://www.moiceleste.com/2019/06/10-anos-de-la-primera-vez-que-aspas.html",
    "http://www.moiceleste.com/2019/04/celta-12-anos-con-jugadores-gallegos-en.html",

    # Cultura e himno
    "http://www.moiceleste.com/2024/07/el-aniversario-de-oliveira-dos-cen-anos.html",

    # Femenino
    "http://www.moiceleste.com/2025/05/as-celtas-una-historia-de-sangre-sudor.html",

    # Europa
    "http://www.moiceleste.com/2025/08/el-celta-celebra-los-25-anos-de-la.html",

    # Derbis
    "http://www.moiceleste.com/2017/12/recuerdos-del-derbi-la-lesion-de-manuel.html",

    # Celta femenino / museo
    "http://www.moiceleste.com/2025/06/el-celta-acerca-su-historia-los.html",
]

print("=" * 60)
print("  SCRAPING ORO — Artículos históricos de moiceleste")
print("=" * 60)

articles = []
for url in GOLD_ARTICLES:
    print(f"  Scrapeando: {url.split('/')[-1][:50]}...", end=" ")
    art, err = scrape_article(url)
    if art:
        print(f"OK - {art['title'][:60]}")
        articles.append(art)
    else:
        print(f"ERROR: {err}")

print(f"\n  Total: {len(articles)} artículos extraídos")

# Generar system prompt sections
prompt_section = format_as_system_prompt_section(articles)
prompt_path = os.path.join(OUTPUT_DIR, "system_prompt_oro.txt")
with open(prompt_path, "w", encoding="utf-8") as f:
    f.write(prompt_section)
print(f"\n  System prompt sections oro -> {prompt_path}")

# Generar knowledge facts
facts = format_as_knowledge_facts(articles)
facts_path = os.path.join(OUTPUT_DIR, "knowledge_facts_oro.json")
with open(facts_path, "w", encoding="utf-8") as f:
    json.dump(facts, f, ensure_ascii=False, indent=2)
print(f"  Knowledge facts oro -> {facts_path} ({len(facts)} facts)")

# Generar un archivo combinado único (solo los mejores facts)
best_facts = [f for f in facts if 200 < len(f["fact_text"]) < 1500]
best_path = os.path.join(OUTPUT_DIR, "knowledge_facts_best.json")
with open(best_path, "w", encoding="utf-8") as f:
    json.dump(best_facts, f, ensure_ascii=False, indent=2)
print(f"  Best facts (filtrados) -> {best_path} ({len(best_facts)} facts)")

print("\n" + "=" * 60)
print("  HECHO!")
print("=" * 60)
