"""
CHIÑO AI — Data Ingestor
Real Club Celta de Vigo · Fundado en 1923
Versión: 1.0 · Mayo 2026

Uso:
  1. pip install -r requirements.txt
  2. Configura DB_CONFIG abajo o variables de entorno
  3. python chino_ingestor.py --seed          # Carga datos semilla
     python chino_ingestor.py --scrape-wiki   # Scrapea Wikipedia (experimental)
"""

import os
import sys
import json
import time
import argparse
from datetime import datetime, date
from typing import Optional

try:
    import psycopg2
    from psycopg2.extras import execute_values
except ImportError:
    print("❌ Ejecuta: pip install psycopg2-binary")
    sys.exit(1)

try:
    import requests
except ImportError:
    requests = None
    print("⚠️  requests no instalado. El scraping no funcionará.")

# ─── Configuración ───────────────────────────────────────────────

DB_CONFIG = {
    "dbname": os.getenv("CHINO_DB_NAME", "chino_ai_db"),
    "user": os.getenv("CHINO_DB_USER", "param"),
    "password": os.getenv("CHINO_DB_PASSWORD", "tu_password_seguro"),
    "host": os.getenv("CHINO_DB_HOST", "localhost"),
    "port": os.getenv("CHINO_DB_PORT", "5432"),
}

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# ─── Datos históricos embebidos ──────────────────────────────────

LEGENDS_DATA = [
    ("Iago Aspas", "Capitán Eterno", "Máximo goleador histórico. O rei de Balaídos. Máis de 200 goles.", None),
    ("Alejandro Mostovoi", "O Zar", "Magia pura nos 90. Liderou ao Celta cara a Europa.", None),
    ("Míchel Salgado", "Muro Blanco", "Defensa lendario. 290 partidos de coraxe e raza.", None),
    ("Gustavo López", "Mago Arxentino", "Talento infinito. Gol ao Liverpool en Anfield (2001).", None),
    ("Mazinho", "Corazón Brasileiro", "Campión do Mundo 1994. Alma de balón en Balaídos.", None),
    ("Patxi Salinas", "Torre de Vigo", "Dianteiro letal nos 80 e 90. 65 goles de celeste.", None),
    ("Fernando Veloso", "Mestre do Centro do Campo", "Lenda dos 70. 240 partidos de elegancia pura.", None),
]

PLAYERS_DATA = [
    ("Iago", "Aspas", "1987-08-01", "España", "Delantero", 2008, 450, 210, 85, True),
    ("Alejandro", "Mostovoi", "1968-08-22", "Rusia", "Centrocampista", 1996, 235, 72, 45, True),
    ("Míchel", "Salgado", "1975-10-22", "España", "Defensa", 1995, 290, 18, 22, True),
    ("Gustavo", "López", "1973-04-19", "Argentina", "Centrocampista", 1996, 250, 45, 60, True),
    ("Mazinho", "Oliveira", "1965-12-26", "Brasil", "Centrocampista", 1991, 180, 25, 30, True),
    ("Patxi", "Salinas", "1963-07-17", "España", "Delantero", 1988, 180, 65, 20, True),
    ("Fernando", "Veloso", "1952-03-15", "España", "Centrocampista", 1970, 240, 38, 15, True),
    ("Hicham", "Bouchama", "1999-04-22", "España", "Centrocampista", 2018, 80, 12, 8, False),
    ("Javier", "Aspas", "1983-06-18", "España", "Delantero", 2005, 120, 25, 15, False),
    ("Pablo", "Hernández", "1985-04-11", "Argentina", "Centrocampista", 2008, 120, 20, 25, False),
]

STAFF_DATA = [
    ("Manuel Bárcena de Andrés", "Presidente", 1923, 1927, "Primeiro presidente. Liderou a fusión Real Fortuna + Sporting."),
    ("Carlos Mouriño", "Presidente", 2006, None, "Propietario e presidente actual. Maior accionista."),
    ("Miguel Muñoz", "Entrenador", 1968, 1969, "Lenda do fútbol español."),
    ("Carlos Aimar", "Entrenador", 1993, 1994, "Final de Copa 1994."),
    ("Víctor Fernández", "Entrenador", 1998, 2002, "Era dourada europea. UEFA 2000 e 2001."),
    ("Eduardo Berizzo", "Entrenador", 2014, 2017, "Semifinais Europa League 2017. Estilo valente."),
    ("Luis Enrique", "Entrenador", 2013, 2014, "Clasificación Champions. Despois selección española."),
    ("Pablo Cavallero", "Entrenador de Porteiros", 1998, 2002, "Gigante arxentino baixo paus."),
]

QUESTIONS_DATA = [
    ("En que ano se fundou o Real Club Celta de Vigo?", "1906", "1923", "1931", "1945", "B", 1, "Historia"),
    ("Quen é o máximo goleador histórico do Celta?", "Mostovoi", "Míchel Salgado", "Iago Aspas", "Gustavo López", "C", 1, "Jugadores"),
    ("Como se chama o estadio do Celta?", "Riazor", "San Mamés", "Balaídos", "El Molinón", "C", 1, "Estadio"),
    ("Que xogador era coñecido como O Zar?", "Mazinho", "Mostovoi", "Veloso", "Salinas", "B", 2, "Jugadores"),
    ("Quen marcou o gol da vitoria contra o Liverpool en Anfield (2001)?", "Mostovoi", "Salgado", "Gustavo López", "Aspas", "C", 2, "Historia"),
    ("Cantas veces gañou o Celta a Copa do Rei?", "0", "1", "2", "3", "A", 2, "Historia"),
    ("Que xogador do Celta foi campión do Mundo en 1994?", "Mostovoi", "Salinas", "Mazinho", "Veloso", "C", 2, "Jugadores"),
    ("Cal é a capacidade de Balaídos?", "15.000", "20.000", "29.000", "35.000", "C", 1, "Estadio"),
    ("Quen foi o primeiro presidente do Celta?", "Carlos Mouriño", "Bárcena", "Miguel Muñoz", "Víctor Fernández", "B", 2, "Historia"),
    ("Como se chamaban os clubs que se fusionaron?", "Real Fortuna e Sporting", "Vigo FC e Olímpico", "Atlántida e Fortuna", "Real Vigo e Deportivo", "A", 3, "Historia"),
    ("Que adestrador levou ao Celta ás semifinais da Europa League 2017?", "Víctor Fernández", "Berizzo", "Carlos Aimar", "Luis Enrique", "B", 2, "Historia"),
    ("Cal destes xogadores NON xogou no Celta?", "Mostovoi", "Rivaldo", "Mazinho", "Gustavo López", "B", 1, "Curiosidades"),
    ("En que ano debutou o Celta en Europa?", "1970", "1985", "1996", "2000", "C", 3, "Historia"),
    ("Que número levaba Iago Aspas no seu debut?", "7", "9", "10", "24", "D", 2, "Jugadores"),
    ("Cal é a vitoria máis famosa en Europa?", "4-0 Benfica", "3-2 Liverpool", "2-1 Barcelona", "5-1 Madrid", "B", 1, "Curiosidades"),
    ("Que xogador do Celta foi subcampión do Mundo 2018?", "Aspas", "Méndez", "Lobotka", "Gomez", "A", 2, "Jugadores"),
    ("Onde está a cidade deportiva do Celta?", "Vigo", "A Madroa", "Pontevedra", "Mos", "B", 1, "Estadio"),
    ("Cantos abonados ten o Celta en 2026?", "15.000", "18.000", "22.000", "28.000", "C", 1, "Actualidad"),
    ("Quen é o máximo asistente histórico?", "Aspas", "Mostovoi", "Gustavo López", "Mazinho", "C", 2, "Jugadores"),
    ("En que ano ascendeu o Celta a Primeira División?", "1936", "1939", "1945", "1950", "B", 3, "Historia"),
]

# ─── Ingestor ────────────────────────────────────────────────────

class ChinoDataIngestor:
    def __init__(self, db_config: Optional[dict] = None):
        self.db_config = db_config or DB_CONFIG
        self.conn = None
        self.cur = None

    def connect_db(self) -> bool:
        try:
            self.conn = psycopg2.connect(**self.db_config)
            self.cur = self.conn.cursor()
            print("✅ Conectado a PostgreSQL")
            return True
        except Exception as e:
            print(f"❌ Error de conexión: {e}")
            return False

    def close(self):
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()
            print("🔒 Conexión cerrada")

    def _insert_batch(self, table: str, columns: list, rows: list):
        if not rows:
            return
        cols = ", ".join(columns)
        placeholders = ", ".join(["%s"] * len(columns))
        query = f"INSERT INTO {table} ({cols}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"
        try:
            for row in rows:
                self.cur.execute(query, row)
            self.conn.commit()
            print(f"  ✅ {len(rows)} filas → {table}")
        except Exception as e:
            self.conn.rollback()
            print(f"  ❌ Error en {table}: {e}")

    def seed_legends(self):
        print("📜 Cargando leyendas...")
        self._insert_batch("legends", ["name", "role", "fact", "image_url"], LEGENDS_DATA)

    def seed_players(self):
        print("⚽ Cargando jugadores históricos...")
        rows = [(n, a, b, na, p, f"{d}-01-01", g, a_, as_, l)
                for n, a, b, na, p, d, g, a_, as_, l in PLAYERS_DATA]
        self._insert_batch("players",
            ["first_name","last_name","birth_date","nationality","position",
             "debut_date","total_matches","total_goals","total_assists","is_legend"],
            rows)

    def seed_staff(self):
        print("👔 Cargando staff...")
        rows = []
        for n, r, sy, ey, notes in STAFF_DATA:
            sd = f"{sy}-01-01"
            ed = f"{ey}-12-31" if ey else None
            rows.append((n, r, sd, ed, notes))
        self._insert_batch("staff_history", ["name","role","start_date","end_date","notes"], rows)

    def seed_questions(self):
        print("❓ Cargando preguntas del trivial...")
        self._insert_batch("game_questions",
            ["question_text","option_a","option_b","option_c","option_d",
             "correct_option","difficulty","category"],
            QUESTIONS_DATA)

    def seed_all(self):
        if not self.connect_db():
            return
        self.seed_legends()
        self.seed_players()
        self.seed_staff()
        self.seed_questions()
        self.close()
        print("\n🎉 ¡Datos semilla cargados correctamente!")

    # ─── Scraping Wikipedia (experimental) ──────────────────────

    def scrape_wikipedia_players(self):
        if requests is None:
            print("❌ requests no disponible. pip install requests")
            return
        print("🌐 Scrapeando Wikipedia (Celta de Vigo players)...")
        url = "https://en.wikipedia.org/api/rest_v1/page/summary/RC_Celta_de_Vigo"
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                print(f"  📄 {data.get('title', 'N/A')}: {len(data.get('extract', ''))} chars")
            else:
                print(f"  ⚠️  HTTP {resp.status_code}")
        except Exception as e:
            print(f"  ❌ Error: {e}")

    # ─── Exportar a JSON (para backup / migración) ──────────────

    def export_to_json(self, output_dir: str = "."):
        if not self.connect_db():
            return
        tables = ["players", "matches", "staff_history", "legends", "game_questions"]
        for table in tables:
            try:
                self.cur.execute(f"SELECT * FROM {table}")
                rows = self.cur.fetchall()
                cols = [desc[0] for desc in self.cur.description]
                data = [dict(zip(cols, row)) for row in rows]
                for r in data:
                    for k, v in r.items():
                        if isinstance(v, (datetime, date)):
                            r[k] = v.isoformat()
                path = os.path.join(output_dir, f"{table}.json")
                with open(path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                print(f"  📦 {len(data)} registros → {path}")
            except Exception as e:
                print(f"  ❌ Error exportando {table}: {e}")
        self.close()

# ─── CLI ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Chiño AI — Data Ingestor")
    parser.add_argument("--seed", action="store_true", help="Cargar datos semilla")
    parser.add_argument("--scrape-wiki", action="store_true", help="Scrapear Wikipedia")
    parser.add_argument("--export-json", metavar="DIR", help="Exportar BD a JSON")
    args = parser.parse_args()

    ingestor = ChinoDataIngestor()

    if args.seed:
        ingestor.seed_all()
    elif args.scrape_wiki:
        ingestor.scrape_wikipedia_players()
    elif args.export_json:
        ingestor.export_to_json(args.export_json)
    else:
        print("ℹ️  Usa --seed para cargar datos semilla")
        print("   Usa --scrape-wiki para scrapear Wikipedia")
        print("   Usa --export-json ./backups para exportar BD")
