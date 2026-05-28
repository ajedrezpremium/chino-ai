import requests
import psycopg2
from datetime import datetime
import time

# Configuración de la Base de Datos
DB_CONFIG = {
    "dbname": "chino_ai_db",
    "user": "param",  # Tu usuario
    "password": "tu_password_seguro",
    "host": "localhost",
    "port": "5432"
}

class ChinoDataIngestor:
    def __init__(self):
        self.conn = None
        self.cur = None

    def connect_db(self):
        try:
            self.conn = psycopg2.connect(**DB_CONFIG)
            self.cur = self.conn.cursor()
            print("✅ Conectado a la base de datos de Chiño AI")
        except Exception as e:
            print(f"❌ Error de conexión: {e}")

    def insert_player(self, name, lastname, position, debut_year, goals=0, matches=0):
        """Inserta un jugador histórico clave"""
        try:
            query = """
            INSERT INTO players (first_name, last_name, position, debut_date, total_goals, total_matches)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING;
            """
            # Asumimos debut el 1 de enero del año para simplificar histórico
            debut_date = f"{debut_year}-01-01"
            self.cur.execute(query, (name, lastname, position, debut_date, goals, matches))
            self.conn.commit()
            print(f"⚽ Jugador añadido: {name} {lastname}")
        except Exception as e:
            self.conn.rollback()
            print(f"⚠️ Error insertando jugador {name}: {e}")

    def insert_staff(self, name, role, start_year, end_year=None, notes=""):
        """Inserta miembros del staff/directiva"""
        try:
            start_date = f"{start_year}-01-01"
            end_date = f"{end_year}-12-31" if end_year else None
            query = """
            INSERT INTO staff_history (name, role, start_date, end_date, notes)
            VALUES (%s, %s, %s, %s, %s)
            """
            self.cur.execute(query, (name, role, start_date, end_date, notes))
            self.conn.commit()
            print(f"👔 Staff añadido: {name} ({role})")
        except Exception as e:
            self.conn.rollback()
            print(f"⚠️ Error insertando staff {name}: {e}")

    def load_historical_legends(self):
        """Carga inicial de leyendas del Celta (Datos de ejemplo para empezar)"""
        print("📜 Cargando leyendas históricas del Celta...")
        
        legends = [
            ("Iago", "Aspas", "Delantero", 2011, 200, 400), # Datos aprox actuales 2026
            ("Alejandro", "Mostovoi", "Centrocampista", 1996, 65, 150),
            ("Míchel", "Salgado", "Defensa", 1999, 12, 200),
            ("Gustavo", "López", "Centrocampista", 1996, 40, 120),
            ("Patxi", "Salinas", "Delantero", 1988, 50, 110),
            ("Fernando", "Veloso", "Centrocampista", 1970, 30, 2