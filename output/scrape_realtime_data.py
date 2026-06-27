"""
Real-time RC Celta scraper — La Liga standings, matches, squad + facts.
Outputs structured JSON to output/scraped_data/.
"""

import json
import os
import re
import time
from datetime import date

import requests
from bs4 import BeautifulSoup, Tag

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraped_data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-GB,en;q=0.9,es;q=0.8,gl;q=0.7",
}
REQUEST_DELAY = 1.0


def fetch_soup(url: str) -> BeautifulSoup | None:
    """Fetch URL, return BeautifulSoup. Rate-limited."""
    print(f"  Fetching: {url}")
    time.sleep(REQUEST_DELAY)
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        resp.encoding = "utf-8"
        return BeautifulSoup(resp.text, "html.parser")
    except requests.RequestException as e:
        print(f"  ERROR fetching {url}: {e}")
        return None


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


# ─── HELPERS ─────────────────────────────────────────────────────

def extract_next_data(soup: BeautifulSoup) -> dict | None:
    """Extract JSON from __NEXT_DATA__ script tag (Next.js sites)."""
    script = soup.find("script", id="__NEXT_DATA__")
    if not script or not script.string:
        return None
    try:
        return json.loads(script.string)
    except (json.JSONDecodeError, TypeError):
        return None


def deep_find_list(obj, keys: set, max_depth: int = 5) -> list | None:
    """Recursively search a dict/list tree for an array of dicts with certain keys."""
    if max_depth < 0:
        return None
    if isinstance(obj, dict):
        if keys.issubset(obj.keys()):
            return [obj]
        for v in obj.values():
            result = deep_find_list(v, keys, max_depth - 1)
            if result:
                return result
        for key in ("standings", "classification", "table", "ranking", "rows",
                     "data", "matches", "games", "fixtures", "results", "schedule", "calendar"):
            if key in obj and isinstance(obj[key], list) and obj[key] and isinstance(obj[key][0], dict):
                return obj[key]
    elif isinstance(obj, list):
        for item in obj:
            result = deep_find_list(item, keys, max_depth - 1)
            if result:
                return result
    return None


# ─── 1. STANDINGS ───────────────────────────────────────────────

LALIGA_STANDINGS_URL = "https://www.laliga.com/en-GB/laliga-easports/classification"


def scrape_standings() -> list[dict]:
    """Scrape La Liga 2025-26 standings."""
    print("\n[1/3] Scraping La Liga standings...")

    soup = fetch_soup(LALIGA_STANDINGS_URL)
    if not soup:
        return []

    # Try Next.js __NEXT_DATA__
    data = extract_next_data(soup)
    if data:
        rows = deep_find_list(data, {"position", "points"})
        if not rows:
            rows = deep_find_list(data, {"rank", "pts"})
        if rows:
            result = [map_standings_row(r) for r in rows if isinstance(r, dict)]
            result = [r for r in result if r]
            if result:
                print(f"  \u2713 Extracted {len(result)} teams")
                return result

    # Fallback: HTML table
    result = parse_standings_html(soup)
    if result:
        print(f"  \u2713 Extracted {len(result)} teams from HTML")
        return result

    print("  \u26a0 Could not parse standings.")
    return []


def map_standings_row(row: dict) -> dict | None:
    team = (
        row.get("team") or row.get("name") or row.get("teamName")
        or row.get("club") or row.get("clubName") or ""
    )
    if isinstance(team, dict):
        team = team.get("name") or team.get("nickname") or ""
    if not team:
        return None
    try:
        return {
            "position": int(row.get("position", row.get("rank", 0))),
            "team": clean(str(team)),
            "points": int(row.get("points", row.get("pts", 0))),
            "played": int(row.get("played", row.get("matches", row.get("pj", 0)))),
            "won": int(row.get("won", row.get("wins", row.get("g", 0)))),
            "drawn": int(row.get("drawn", row.get("draws", row.get("e", 0)))),
            "lost": int(row.get("lost", row.get("losses", row.get("p", 0)))),
            "goals_for": int(row.get("goalsFor", row.get("goals_for", row.get("gf", 0)))),
            "goals_against": int(row.get("goalsAgainst", row.get("goals_against", row.get("ga", 0)))),
        }
    except (ValueError, TypeError):
        return None


def parse_standings_html(soup: BeautifulSoup) -> list[dict]:
    for table in soup.find_all("table"):
        rows = table.find_all("tr")
        if len(rows) < 3:
            continue
        header = rows[0].get_text().lower()
        if not any(kw in header for kw in ("pos", "team", "club", "points", "pts", "pj")):
            continue
        result = []
        for row in rows[1:]:
            cells = row.find_all(["td", "th"])
            if len(cells) < 5:
                continue
            entry = _parse_standings_cells(cells)
            if entry:
                result.append(entry)
        if result:
            return result

    # Div-based layout fallback
    for cls_pattern in (r"team.?row", r"table.?row", r"standing.?row",
                        r"classification.?row", r"TeamRow", r"TableRow"):
        containers = soup.find_all("div", class_=re.compile(cls_pattern))
        for container in containers:
            cells = container.find_all("div", class_=re.compile(r"(cell|col|td|item)"))
            if len(cells) >= 5:
                entry = _parse_standings_cells(cells)
                if entry:
                    result.append(entry)
        if result:
            return result

    return []


def _parse_standings_cells(cells: list) -> dict | None:
    texts = [clean(c.get_text()) for c in cells if c.get_text(strip=True)]
    nums = []
    for t in texts:
        try:
            nums.append(int(t))
        except ValueError:
            pass
    if len(nums) < 5:
        return None
    pos = nums[0]
    if not (1 <= pos <= 30):
        return None
    team = texts[1] if len(texts) > 1 else ""
    return {
        "position": pos,
        "team": team,
        "points": nums[1] if len(nums) > 1 else 0,
        "played": nums[2] if len(nums) > 2 else 0,
        "won": nums[3] if len(nums) > 3 else 0,
        "drawn": nums[4] if len(nums) > 4 else 0,
        "lost": nums[5] if len(nums) > 5 else 0,
        "goals_for": nums[6] if len(nums) > 6 else 0,
        "goals_against": nums[7] if len(nums) > 7 else 0,
    }


# ─── 2. MATCHES ──────────────────────────────────────────────────

LALIGA_MATCHES_URL = "https://www.laliga.com/en-GB/laliga-easports/clubs/rc-celta-de-vigo/matches"


def scrape_matches() -> list[dict]:
    """Scrape recent and upcoming RC Celta matches."""
    print("\n[2/3] Scraping Celta matches...")

    soup = fetch_soup(LALIGA_MATCHES_URL)
    if not soup:
        return []

    data = extract_next_data(soup)
    if data:
        rows = deep_find_list(data, {"date", "competition"})
        if not rows:
            rows = deep_find_list(data, {"matchDate", "localTeam"})
        if rows:
            result = [map_match(m) for m in rows if isinstance(m, dict)]
            result = [r for r in result if r]
            if result:
                print(f"  \u2713 Extracted {len(result)} matches")
                return result

    result = parse_matches_html(soup)
    if result:
        print(f"  \u2713 Extracted {len(result)} matches from HTML")
        return result

    print("  \u26a0 Could not parse matches.")
    return []


def map_match(m: dict) -> dict | None:
    try:
        raw_date = m.get("date") or m.get("matchDate") or m.get("dateTime") or ""
        if isinstance(raw_date, (int, float)):
            raw_date = time.strftime("%Y-%m-%d", time.gmtime(raw_date / 1000))
        elif "T" in str(raw_date):
            raw_date = str(raw_date)[:10]

        competition = m.get("competition") or m.get("tournament") or m.get("league") or ""
        if isinstance(competition, dict):
            competition = competition.get("name") or competition.get("tournamentName") or ""

        local = m.get("localTeam") or m.get("homeTeam") or m.get("home") or {}
        visitor = m.get("visitorTeam") or m.get("awayTeam") or m.get("away") or {}
        if isinstance(local, str):
            local_name = local
        else:
            local_name = (local.get("name") or local.get("team") or local.get("club") or "")
        if isinstance(visitor, str):
            visitor_name = visitor
        else:
            visitor_name = (visitor.get("name") or visitor.get("team") or visitor.get("club") or "")

        is_home = "celta" in local_name.lower()
        opponent = visitor_name if is_home else local_name
        home_away = "home" if is_home else "away"

        ls = m.get("localScore") or m.get("homeScore") or m.get("goalsLocal") or m.get("homeGoals")
        vs = m.get("visitorScore") or m.get("awayScore") or m.get("goalsVisitor") or m.get("awayGoals")
        score = None
        result = None
        if ls is not None and vs is not None:
            try:
                ls_i, vs_i = int(ls), int(vs)
                score = f"{ls_i}-{vs_i}" if is_home else f"{vs_i}-{ls_i}"
                result = "W" if (is_home and ls_i > vs_i) or (not is_home and vs_i > ls_i) else \
                         "D" if ls_i == vs_i else "L"
            except (ValueError, TypeError):
                pass

        return {
            "date": str(raw_date) if raw_date else "",
            "competition": clean(str(competition)) if competition else "",
            "opponent": clean(opponent) if opponent else "",
            "home_away": home_away,
            "result": result or "?",
            "score": score or "?",
        }
    except Exception:
        return None


def parse_matches_html(soup: BeautifulSoup) -> list[dict]:
    matches = []
    for container in soup.find_all(["div", "li"], class_=re.compile(
        r"(match|game|fixture|result|event|partido)", re.I
    )):
        entry = _parse_match_container(container)
        if entry:
            matches.append(entry)
    return matches


def _parse_match_container(el: Tag) -> dict | None:
    text = el.get_text()
    date_m = re.search(r"(\d{4}-\d{2}-\d{2})", text)
    score_m = re.search(r"(\d+)\s*[-:]\s*(\d+)", text)
    return {
        "date": date_m.group(1) if date_m else "",
        "competition": "La Liga" if re.search(r"(laliga|liga)", text, re.I) else "",
        "opponent": "",
        "home_away": "",
        "result": "",
        "score": score_m.group(0) if score_m else "",
    }


# ─── 3. SQUAD ────────────────────────────────────────────────────

TRANSFERMARKT_URL = "https://www.transfermarkt.com/celta-vigo/startseite/verein/940"


def scrape_squad() -> list[dict]:
    """Scrape current RC Celta squad from Transfermarkt."""
    print("\n[3/3] Scraping Celta squad from Transfermarkt...")

    soup = fetch_soup(TRANSFERMARKT_URL)
    if not soup:
        return []

    table = soup.find("table", class_=re.compile(r"(items|responsive.?table|squad| squad)", re.I))
    if not table:
        for t in soup.find_all("table"):
            if len(t.find_all("tr")) > 5:
                table = t
                break
    if not table:
        print("  \u26a0 Could not find squad table.")
        return []

    rows = table.find_all("tr")
    squad = []
    for row in rows[1:]:
        cells = row.find_all("td")
        if len(cells) < 4:
            continue
        entry = _parse_squad_row(cells)
        if entry:
            squad.append(entry)

    if squad:
        print(f"  \u2713 Extracted {len(squad)} squad members")
    else:
        print("  \u26a0 Could not parse squad rows.")
    return squad


def _parse_squad_row(cells: list) -> dict | None:
    try:
        name = ""
        pos_text = ""
        nationality = ""
        age = 0
        market_value = ""

        for cell in cells:
            text = clean(cell.get_text())

            if text in ("GK", "Goalkeeper", "Portero", "Defender", "Defensa",
                         "Midfielder", "Centrocampista", "Forward", "Delantero",
                         "Attacking Midfield", "Central Midfield", "Defensive Midfield",
                         "Centre-Back", "Left-Back", "Right-Back", "Centre-Forward",
                         "Left Winger", "Right Winger", "Second Striker",
                         "Right Midfield", "Left Midfield", "Central Midfield",
                         "Defensive Midfield", "Attacking Midfield"):
                pos_text = text

            a = cell.find("a", class_=re.compile(r"(spieler|player|name)", re.I))
            if a:
                name = clean(a.get_text())

            img = cell.find("img", alt=re.compile(r"^[A-Z]{2,3}$"))
            if img:
                nationality = img["alt"]

            try:
                a_val = int(text)
                if 15 <= a_val <= 50:
                    age = a_val
            except ValueError:
                m = re.search(r"\b([1-4]\d)\b", text)
                if m:
                    a_val = int(m.group(1))
                    if 15 <= a_val <= 50:
                        age = a_val

            if "\u20ac" in text:
                market_value = text

        if not name:
            for cell in cells:
                strong = cell.find(["strong", "b"])
                if strong and len(strong.get_text(strip=True)) > 2:
                    name = clean(strong.get_text())
                    break

        if not name:
            for cell in cells:
                a = cell.find("a")
                if a and len(a.get_text(strip=True)) > 3:
                    name = clean(a.get_text())
                    break

        if not name:
            return None

        return {
            "name": name,
            "position": _categorize_position(pos_text),
            "nationality": nationality,
            "age": age,
            "market_value": market_value,
        }
    except Exception:
        return None


def _categorize_position(pos: str) -> str:
    pl = pos.lower()
    if any(k in pl for k in ("goalkeeper", "gk", "portero", "guardameta", "torwart")):
        return "Portero"
    if any(k in pl for k in ("defender", "defensa", "back", "verteidiger")):
        return "Defensa"
    if any(k in pl for k in ("midfield", "centrocampista", "mittelfeld")):
        return "Centrocampista"
    if any(k in pl for k in ("forward", "delantero", "striker", "winger",
                               "wing", "extrem", "sturm", "angreifer")):
        return "Delantero"
    return pos


# ─── 4. FACTS GENERATION ────────────────────────────────────────

def generate_facts(standings: list, matches: list, squad: list) -> list[dict]:
    """Convert scraped data into knowledge_facts format."""
    print("\n--- Generating realtime_facts.json ---")
    facts = []

    # Standings facts
    for s in standings:
        t = s.get("team", "")
        pos = s.get("position", 0)
        pts = s.get("points", 0)
        pj = s.get("played", 0)
        if t and pos:
            facts.append({
                "fact_text": (
                    f"En La Liga 2025-26, {t} ocupa el puesto {pos} con {pts} puntos "
                    f"tras {pj} partidos ({s.get('won')}V {s.get('drawn')}E {s.get('lost')}D, "
                    f"goles {s.get('goals_for')}-{s.get('goals_against')})."
                ),
                "category": "actualidad",
                "verified": True,
                "source_url": LALIGA_STANDINGS_URL,
                "source_name": "LaLiga",
            })

    celta_st = [s for s in standings if "celta" in s.get("team", "").lower()]
    if celta_st:
        cs = celta_st[0]
        facts.append({
            "fact_text": (
                f"El RC Celta de Vigo ocupa actualmente el puesto {cs['position']} en "
                f"La Liga 2025-26 con {cs['points']} puntos."
            ),
            "category": "actualidad",
            "verified": True,
            "source_url": LALIGA_STANDINGS_URL,
            "source_name": "LaLiga",
        })

    # Match facts
    for m in matches:
        opp = m.get("opponent", "")
        if not opp:
            continue
        loc = "en casa" if m.get("home_away") == "home" else "fuera de casa"
        parts = []
        if m.get("date"):
            parts.append(f"El {m['date']}")
        parts.append(f"el RC Celta juega {loc} contra {opp}")
        if m.get("competition"):
            parts.append(f"en {m['competition']}")
        if m.get("score") and m.get("score") != "?":
            label = {"W": "victoria", "D": "empate", "L": "derrota"}.get(m["result"], "resultado")
            parts.append(f"({label} {m['score']})")

        facts.append({
            "fact_text": " ".join(parts) + ".",
            "category": "actualidad",
            "verified": True,
            "source_url": LALIGA_MATCHES_URL,
            "source_name": "LaLiga",
        })

    # Squad facts
    for p in squad:
        name = p.get("name", "")
        if not name:
            continue
        parts = [name]
        pos = p.get("position", "")
        nat = p.get("nationality", "")
        if pos:
            detail = pos
            if nat:
                detail += f", {nat}"
            parts.append(f"({detail})")
        if p.get("age"):
            parts.append(f"{p['age']} años")
        if p.get("market_value"):
            parts.append(f"valor: {p['market_value']}")

        facts.append({
            "fact_text": " ".join(parts) + " forma parte de la plantilla del RC Celta.",
            "category": "actualidad",
            "verified": True,
            "source_url": TRANSFERMARKT_URL,
            "source_name": "Transfermarkt",
        })

    print(f"  Generated {len(facts)} facts")
    return facts


# ─── 5. SAVE ─────────────────────────────────────────────────────

def save_json(data: list | dict, filename: str):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    size = os.path.getsize(path)
    print(f"  Written {path} ({size} bytes)")


def scrape_all() -> tuple[list, list, list]:
    """Run all scrapers and save outputs."""
    standings = scrape_standings()
    save_json(standings, "realtime_standings.json")

    matches = scrape_matches()
    save_json(matches, "realtime_matches.json")

    squad = scrape_squad()
    save_json(squad, "realtime_squad.json")

    facts = generate_facts(standings, matches, squad)
    save_json(facts, "realtime_facts.json")

    return standings, matches, squad


# ─── 6. SUPABASE UPLOAD ─────────────────────────────────────────

def update_realtime_facts(supabase_url: str, supabase_key: str):
    """Upload realtime facts to Supabase knowledge_facts table via REST API.

    Args:
        supabase_url: Your Supabase project URL (e.g. https://xyz.supabase.co)
        supabase_key: service_role key (bypasses RLS) or anon key with INSERT policy.
    """
    facts_path = os.path.join(OUTPUT_DIR, "realtime_facts.json")
    if not os.path.exists(facts_path):
        print(f"  \u26a0 {facts_path} not found. Run scrape_all() first.")
        return

    with open(facts_path, "r", encoding="utf-8") as f:
        facts = json.load(f)

    if not facts:
        print("  \u26a0 No facts to upload.")
        return

    url = supabase_url.rstrip("/")
    endpoint = f"{url}/rest/v1/knowledge_facts"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }

    print(f"\nUploading {len(facts)} facts to Supabase knowledge_facts...")

    success = 0
    for i, fact in enumerate(facts):
        payload = {
            "fact_text": fact["fact_text"],
            "category": fact.get("category", "actualidad"),
            "verified": fact.get("verified", True),
        }
        try:
            resp = requests.post(endpoint, json=payload, headers=headers, timeout=15)
            if resp.status_code in (200, 201, 204):
                success += 1
            else:
                print(f"  \u2717 Fact {i}: HTTP {resp.status_code} - {resp.text[:150]}")
        except requests.RequestException as e:
            print(f"  \u2717 Fact {i}: network error - {e}")
        time.sleep(0.1)

    print(f"  Uploaded {success}/{len(facts)} facts.")
    if success < len(facts):
        print("  \u26a0 Some facts failed. Check errors above.")


# ─── MAIN ────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("RC Celta Real-Time Data Scraper")
    print("=" * 60)

    scrape_all()

    print("\n" + "=" * 60)
    print(f"Done. All data saved to: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
