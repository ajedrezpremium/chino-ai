import json
import re

with open('output/knowledge_facts_best.json','r',encoding='utf-8') as f:
    best = json.load(f)

existing_texts = {f['fact_text'] for f in best}

with open('frontend/src/chino-knowledge.js','r',encoding='utf-8') as f:
    content = f.read()

# Extract lines 32+ (data section) - split by lines
lines = content.split('\n')
data_lines = lines[31:]  # Skip behavior rules

new_facts = []
current_section = 'general'

for line in data_lines:
    stripped = line.strip()
    
    if stripped.startswith('### '):
        current_section = stripped.replace('### ', '').lower().strip()
        continue
    
    if not stripped or stripped.startswith('#') or stripped.startswith('```'):
        continue
    
    # Skip instructions section headers like ## BARRA DE BAR
    if stripped.startswith('## '):
        current_section = stripped.replace('## ', '').lower().strip()
        continue
    
    # Extract bullet points and other data
    if stripped.startswith('- ') or stripped.startswith('* '):
        text = stripped[2:].strip()
        if text and len(text) > 15 and text not in existing_texts:
            # Determine category from section
            cat = 'general'
            if any(k in current_section for k in ['fundación', 'fundacao', 'hito', 'histórico']):
                cat = 'historia'
            elif any(k in current_section for k in ['xogador', 'jugador', 'porteiro', 'once de oro', 'leyenda']):
                cat = 'jugadores'
            elif any(k in current_section for k in ['estadio', 'balaídos', 'balaidos']):
                cat = 'estadio'
            elif any(k in current_section for k in ['económ', 'econo']):
                cat = 'economia'
            elif any(k in current_section for k in ['adestrador', 'entrenador']):
                cat = 'adestradores'
            elif any(k in current_section for k in ['presidente']):
                cat = 'presidentes'
            elif any(k in current_section for k in ['plantilla']):
                cat = 'plantilla'
            elif any(k in current_section for k in ['patrocinador']):
                cat = 'plantilla'
            elif any(k in current_section for k in ['europa', 'uefa', 'champions']):
                cat = 'europa'
            elif any(k in current_section for k in ['criterio', 'ranking', 'barra de bar']):
                cat = 'general'
            
            # Clean up: remove ❌ and other icons
            text = text.replace('❌', '').strip()
            if text and len(text) > 15:
                new_facts.append({'fact_text': text, 'category': cat, 'source_name': 'chino-knowledge.js', 'verified': True})
                existing_texts.add(text)
    
    # Also capture "ZONA PROHIBIDA" lines and other non-bullet data
    elif stripped.startswith('POR:') or stripped.startswith('Isidro') or stripped.startswith('Vega') or stripped.startswith('Simón') or stripped.startswith('Gost') or stripped.startswith('PORTEIROS:') or stripped.startswith('DEFENSAS:') or stripped.startswith('CENTROCAMPISTAS:') or stripped.startswith('DIANTEIROS:'):
        if stripped not in existing_texts:
            cat = 'jugadores' if 'POR:' not in stripped else 'plantilla'
            new_facts.append({'fact_text': stripped, 'category': cat, 'source_name': 'chino-knowledge.js', 'verified': True})
            existing_texts.add(stripped)

# Also capture coach names, president names from the structured sections
for section_pattern, cat in [('Carlos Aimar', 'adestradores'), ('Manuel Bárcena', 'presidentes')]:
    for line in data_lines:
        if line.strip().startswith('- ') and section_pattern[:5] in line and line.strip() not in existing_texts:
            text = line.strip()[2:]
            new_facts.append({'fact_text': text, 'category': cat, 'source_name': 'chino-knowledge.js', 'verified': True})
            existing_texts.add(text)

# Merge and save
all_facts = best + new_facts
print(f"Total facts: {len(all_facts)} (added {len(new_facts)} from chino-knowledge.js)")

cats = {}
for f in all_facts:
    cats[f['category']] = cats.get(f['category'], 0) + 1
for k,v in sorted(cats.items()):
    print(f"  {k}: {v}")

with open('output/knowledge_facts_best.json','w',encoding='utf-8') as f:
    json.dump(all_facts, f, ensure_ascii=False, indent=2)
print("knowledge_facts_best.json actualizado")

# Generate 100 SQL
sql = "-- 100 verified facts for Supabase knowledge_facts table\n"
sql += "INSERT INTO knowledge_facts (fact_text, category, verified, created_at) VALUES\n"
vals = []
for fact in all_facts[:100]:
    text = fact['fact_text'].replace("'", "''")
    cat = fact.get('category', 'general').replace("'", "''")
    vals.append(f"('{text}', '{cat}', TRUE, NOW())")
sql += ",\n".join(vals) + ";\n"
with open('output/100_facts_supabase.sql','w',encoding='utf-8') as f:
    f.write(sql)
print("100_facts_supabase.sql rexenerado")
