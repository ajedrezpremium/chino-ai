"""Genera SQL para insertar best facts en Supabase."""
import json
from datetime import datetime

with open("../output/knowledge_facts_best.json", "r", encoding="utf-8") as f:
    facts = json.load(f)

sql_lines = [
    "-- Chiño AI — Best Knowledge Facts from Moiceleste (oro)",
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

with open("../output/knowledge_facts_best.sql", "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"SQL generado: {len(facts)} facts -> ../output/knowledge_facts_best.sql")
