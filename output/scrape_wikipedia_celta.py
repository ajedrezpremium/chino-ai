"""
Scraper for RC Celta de Vigo Wikipedia pages.
Extracts structured data and saves as JSON + facts format.
"""

import json
import os
import re
import time
from datetime import datetime

import requests
from bs4 import BeautifulSoup, Tag

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scraped_data")
os.makedirs(OUTPUT_DIR, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}
REQUEST_DELAY = 1.0  # seconds


def fetch_soup(url: str) -> BeautifulSoup | None:
    """Fetch a URL and return a BeautifulSoup object. Rate-limited."""
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
    """Remove footnote references, extra whitespace, normalize spaces."""
    text = re.sub(r"\[\d+\]", "", text)
    text = re.sub(r"\[citation needed\]", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def text_or_none(el) -> str | None:
    if el is None:
        return None
    t = clean(el.get_text())
    return t if t else None


def parse_infobox(soup: BeautifulSoup) -> dict:
    """Extract key-value pairs from the Wikipedia infobox."""
    info = {}
    table = soup.find("table", class_="infobox")
    if not table:
        return info
    for row in table.find_all("tr"):
        th = row.find("th")
        td = row.find("td")
        if th and td:
            key = clean(th.get_text()).rstrip(":")
            val = clean(td.get_text())
            if key and val:
                info[key] = val
    return info


def extract_club_page() -> dict:
    """Scrape the main RC Celta de Vigo page."""
    url = "https://en.wikipedia.org/wiki/RC_Celta_de_Vigo"
    soup = fetch_soup(url)
    if not soup:
        return {"error": "Failed to fetch page", "url": url}

    print("  Parsing club infobox...")
    infobox = parse_infobox(soup)

    print("  Extracting honours...")
    honours = extract_honours(soup)

    print("  Extracting records...")
    records = extract_records(soup)

    print("  Extracting stadium info...")
    stadium = extract_stadium(soup)

    print("  Extracting European competition history...")
    europe = extract_europe(soup)

    print("  Extracting history summary...")
    history = extract_history_summary(soup)

    data = {
        "url": url,
        "title": text_or_none(soup.find("h1", id="firstHeading")),
        "infobox": infobox,
        "honours": honours,
        "records": records,
        "stadium": stadium,
        "european_competitions": europe,
        "history_summary": history,
    }
    return data


def extract_honours(soup: BeautifulSoup) -> list[dict]:
    """Extract the honours/honours section."""
    honours = []
    heading = soup.find("span", id=re.compile(r"(Honours|honours|Honors|honors|Trophies|trophies)"))
    if not heading:
        return honours
    section = heading.find_parent(["h2", "h3"])
    if not section:
        return honours
    # Walk siblings until next h2
    for el in section.find_next_siblings():
        if el.name and el.name.startswith("h"):
            break
        if el.name in ("ul", "ol"):
            for li in el.find_all("li", recursive=False):
                text = clean(li.get_text())
                if text:
                    honours.append({"text": text})
        if el.name == "table" and "wikitable" in el.get("class", []):
            rows = el.find_all("tr")
            for row in rows[1:]:
                cells = row.find_all(["th", "td"])
                if len(cells) >= 2:
                    comp = clean(cells[0].get_text())
                    count = clean(cells[-1].get_text())
                    honours.append({"competition": comp, "count": count})
    return honours


def extract_records(soup: BeautifulSoup) -> dict:
    """Extract club records."""
    records = {}
    heading = soup.find("span", id=re.compile(r"(Records|records|Club records)"))
    if not heading:
        return records
    section = heading.find_parent(["h2", "h3"])
    if not section:
        return records
    for el in section.find_next_siblings():
        if el.name and el.name.startswith("h"):
            break
        if el.name in ("ul", "ol"):
            for li in el.find_all("li", recursive=False):
                text = clean(li.get_text())
                if ":" in text:
                    k, v = text.split(":", 1)
                    records[clean(k)] = clean(v)
                else:
                    records.setdefault("other", []).append(text)
    return records


def extract_stadium(soup: BeautifulSoup) -> dict:
    """Extract stadium information."""
    info = {}
    # Try to find stadium from infobox
    table = soup.find("table", class_="infobox")
    if table:
        rows = table.find_all("tr")
        for i, row in enumerate(rows):
            th = row.find("th")
            if th and "ground" in th.get_text().lower():
                td = row.find("td")
                if td:
                    info["ground"] = clean(td.get_text())
            if th and "capacity" in th.get_text().lower():
                td = row.find("td")
                if td:
                    info["capacity"] = clean(td.get_text())

    # Try stadium section
    heading = soup.find("span", id=re.compile(r"(Stadium|stadium|Balaídos|Balaidos)"))
    if heading:
        section = heading.find_parent(["h2", "h3"])
        if section:
            paragraphs = []
            for el in section.find_next_siblings():
                if el.name and el.name.startswith("h"):
                    break
                if el.name == "p":
                    paragraphs.append(clean(el.get_text()))
            if paragraphs:
                info["description"] = " ".join(paragraphs)
    return info


def extract_europe(soup: BeautifulSoup) -> list[dict]:
    """Extract European competition history."""
    competitions = []
    heading = soup.find("span", id=re.compile(r"(Europe|europe|European|european|UEFA|uefa)"))
    if not heading:
        return competitions
    section = heading.find_parent(["h2", "h3"])
    if not section:
        return competitions

    for el in section.find_next_siblings():
        if el.name and el.name.startswith("h"):
            break
        if el.name == "table" and "wikitable" in el.get("class", []):
            rows = el.find_all("tr")
            headers = [clean(th.get_text()) for th in rows[0].find_all("th")]
            for row in rows[1:]:
                cells = row.find_all(["th", "td"])
                entry = {}
                for idx, cell in enumerate(cells):
                    if idx < len(headers):
                        entry[headers[idx]] = clean(cell.get_text())
                    else:
                        entry[f"col_{idx}"] = clean(cell.get_text())
                if entry:
                    competitions.append(entry)
        elif el.name in ("ul", "ol"):
            for li in el.find_all("li", recursive=False):
                text = clean(li.get_text())
                if text:
                    competitions.append({"text": text})
    return competitions


def extract_history_summary(soup: BeautifulSoup) -> str:
    """Extract the first few paragraphs from the History section."""
    heading = soup.find("span", id=re.compile(r"(History|history)"))
    if not heading:
        return ""
    section = heading.find_parent(["h2", "h3"])
    if not section:
        return ""
    paragraphs = []
    for el in section.find_next_siblings():
        if el.name and el.name.startswith("h"):
            break
        if el.name == "p":
            paragraphs.append(clean(el.get_text()))
    return " ".join(paragraphs)


# ---------------------------------------------------------------------------
# Seasons page
# ---------------------------------------------------------------------------

def extract_seasons_page() -> dict:
    """Scrape season-by-season results."""
    url = "https://en.wikipedia.org/wiki/List_of_RC_Celta_de_Vigo_seasons"
    soup = fetch_soup(url)
    if not soup:
        return {"error": "Failed to fetch page", "url": url}

    print("  Parsing season tables...")
    seasons = parse_season_tables(soup)

    data = {
        "url": url,
        "title": text_or_none(soup.find("h1", id="firstHeading")),
        "seasons": seasons,
        "total_seasons": len(seasons),
    }
    return data


def parse_season_tables(soup: BeautifulSoup) -> list[dict]:
    """Parse all wikitable season tables."""
    seasons = []
    tables = soup.find_all("table", class_="wikitable")
    for table in tables:
        rows = table.find_all("tr")
        if not rows:
            continue
        header_cells = rows[0].find_all("th")
        # Try to detect season table by typical header keywords
        header_texts = [clean(h.get_text()).lower() for h in header_cells]
        if not any(kw in " ".join(header_texts) for kw in ["season", "year", "division", "pos", "top scorer"]):
            continue

        for row in rows[1:]:
            cells = row.find_all(["th", "td"])
            if len(cells) < 3:
                continue
            entry = {}
            for idx, cell in enumerate(cells):
                if idx < len(header_texts):
                    key = header_texts[idx]
                    val = clean(cell.get_text())
                    # Normalize key names
                    if "season" in key or "year" in key or "temporada" in key:
                        entry["season"] = val
                    elif "division" in key or "div" in key or "tier" in key or "level" in key:
                        entry["division"] = val
                    elif "pos" in key or "position" in key or "rank" in key or "puesto" in key:
                        entry["position"] = val
                    elif "scorer" in key or "goleador" in key or "goals" in key:
                        entry["top_scorer"] = val
                    elif "manager" in key or "coach" in key or "entrenador" in key:
                        entry["manager"] = val
                    else:
                        entry[f"col_{idx}"] = val
            if entry:
                seasons.append(entry)
    return seasons


# ---------------------------------------------------------------------------
# Category pages (players, managers)
# ---------------------------------------------------------------------------

def extract_category_page(url: str, label: str) -> dict:
    """Scrape a Wikipedia category page listing members."""
    soup = fetch_soup(url)
    if not soup:
        return {"error": "Failed to fetch page", "url": url, "label": label}

    print(f"  Extracting {label} list...")
    members = []
    # Main content div
    mw_pages = soup.find("div", id="mw-pages")
    if mw_pages:
        for li in mw_pages.find_all("li"):
            a = li.find("a")
            if a and a.get("href") and a.get("title"):
                member_url = "https://en.wikipedia.org" + a["href"]
                members.append({
                    "name": a.get("title"),
                    "page_url": member_url,
                })
    else:
        # Fallback: all links in the content area
        content = soup.find("div", id="mw-content-text")
        if content:
            for li in content.find_all("li"):
                a = li.find("a")
                if a and a.get("title") and a.get("href"):
                    href = a["href"]
                    if href.startswith("/wiki/"):
                        members.append({
                            "name": a.get("title"),
                            "page_url": "https://en.wikipedia.org" + href,
                        })

    data = {
        "url": url,
        "label": label,
        "count": len(members),
        "members": members,
    }
    return data


# ---------------------------------------------------------------------------
# Facts generation
# ---------------------------------------------------------------------------

CATEGORY_MAP = {
    "historia": ["history", "founded", "foundation", "1923", "fusion"],
    "jugadores": ["player", "footballer", "forward", "midfielder", "defender", "goalkeeper"],
    "adestradores": ["manager", "coach", "entrenador"],
    "estadio": ["stadium", "balaídos", "balaidos", "capacity", "ground", "abanca"],
    "europa": ["uefa", "europa", "europe", "champions", "cup winners", "intertoto"],
    "curiosidades": [],
}


def classify_fact(text: str) -> str:
    """Classify fact text into a category."""
    lower = text.lower()
    for cat, keywords in CATEGORY_MAP.items():
        for kw in keywords:
            if kw in lower:
                return cat
    return "curiosidades"


def build_fact(text: str, url: str) -> dict:
    return {
        "fact_text": text,
        "category": classify_fact(text),
        "verified": True,
        "source_url": url,
        "source_name": "Wikipedia",
    }


def generate_facts(
    club: dict, seasons: dict, players: dict, managers: dict
) -> list[dict]:
    """Convert all scraped data into the knowledge_facts_best.json format."""
    facts = []

    club_url = club.get("url", "")
    seasons_url = seasons.get("url", "")
    players_url = players.get("url", "")
    managers_url = managers.get("url", "")

    # ---- Club facts ----
    infobox = club.get("infobox", {})
    if infobox.get("Full name"):
        facts.append(build_fact(
            f"The full name of the club is {infobox['Full name']}.", club_url
        ))
    if infobox.get("Founded"):
        facts.append(build_fact(
            f"RC Celta de Vigo was founded on {infobox['Founded']}.", club_url
        ))
    if infobox.get("Ground"):
        facts.append(build_fact(
            f"RC Celta de Vigo plays its home matches at {infobox['Ground']}.", club_url
        ))
    if infobox.get("Capacity"):
        facts.append(build_fact(
            f"The capacity of the stadium is {infobox['Capacity']}.", club_url
        ))
    if infobox.get("League"):
        facts.append(build_fact(
            f"RC Celta de Vigo currently competes in {infobox['League']}.", club_url
        ))
    if infobox.get("Owner"):
        facts.append(build_fact(
            f"The owner of RC Celta de Vigo is {infobox['Owner']}.", club_url
        ))
    if infobox.get("President") or infobox.get("Chairman"):
        prez = infobox.get("President") or infobox.get("Chairman")
        facts.append(build_fact(
            f"The president of RC Celta de Vigo is {prez}.", club_url
        ))
    if infobox.get("Manager") or infobox.get("Head coach"):
        mgr = infobox.get("Manager") or infobox.get("Head coach")
        facts.append(build_fact(
            f"The manager of RC Celta de Vigo is {mgr}.", club_url
        ))

    # Stadium description
    stadium = club.get("stadium", {})
    if stadium.get("description"):
        facts.append(build_fact(stadium["description"], club_url))

    # History summary
    hist = club.get("history_summary", "")
    if hist:
        # Split into sentence-level facts
        for sent in re.split(r"(?<=[.!?])\s+", hist):
            sent = sent.strip()
            if len(sent) > 30:
                facts.append(build_fact(sent, club_url))

    # Honours
    for h in club.get("honours", []):
        text = h.get("text") or ""
        comp = h.get("competition") or ""
        cnt = h.get("count") or ""
        if text:
            facts.append(build_fact(
                f"RC Celta de Vigo honours: {text}", club_url
            ))
        if comp and cnt:
            facts.append(build_fact(
                f"RC Celta de Vigo has won {comp} {cnt} times.", club_url
            ))

    # Records
    for k, v in club.get("records", {}).items():
        if k == "other":
            for item in v:
                facts.append(build_fact(item, club_url))
        else:
            facts.append(build_fact(f"{k}: {v}", club_url))

    # European competitions
    for comp in club.get("european_competitions", []):
        text = comp.get("text") or " | ".join(
            f"{k}: {v}" for k, v in comp.items() if k != "text"
        )
        if text:
            facts.append(build_fact(
                f"European competition: {text}", club_url
            ))

    # ---- Season facts ----
    for s in seasons.get("seasons", []):
        season_str = s.get("season", "")
        division = s.get("division", "")
        position = s.get("position", "")
        scorer = s.get("top_scorer", "")
        parts = []
        if season_str:
            parts.append(f"In the {season_str} season")
        if division:
            parts.append(f"playing in {division}")
        if position:
            parts.append(f"finished in position {position}")
        if scorer:
            parts.append(f"with top scorer {scorer}")
        if parts:
            facts.append(build_fact(
                "RC Celta de Vigo " + ", ".join(parts) + ".", seasons_url
            ))

    # ---- Player facts ----
    for p in players.get("members", []):
        name = p.get("name", "")
        if name:
            # Determine likely decade from page URL or name pattern
            facts.append(build_fact(
                f"{name} played for RC Celta de Vigo.", players_url
            ))

    # ---- Manager facts ----
    for m in managers.get("members", []):
        name = m.get("name", "")
        if name:
            facts.append(build_fact(
                f"{name} was a manager of RC Celta de Vigo.", managers_url
            ))

    return facts


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("RC Celta de Vigo Wikipedia Scraper")
    print("=" * 60)

    print("\n[1/4] Scraping main club page...")
    club_data = extract_club_page()

    print("\n[2/4] Scraping seasons page...")
    seasons_data = extract_seasons_page()

    print("\n[3/4] Scraping players category page...")
    players_data = extract_category_page(
        "https://en.wikipedia.org/wiki/Category:RC_Celta_de_Vigo_players",
        "players",
    )

    print("\n[4/4] Scraping managers category page...")
    managers_data = extract_category_page(
        "https://en.wikipedia.org/wiki/Category:RC_Celta_de_Vigo_managers",
        "managers",
    )

    # Write individual JSON files
    print("\n--- Writing JSON files ---")

    files = {
        "wikipedia_club.json": club_data,
        "wikipedia_seasons.json": seasons_data,
        "wikipedia_players.json": players_data,
        "wikipedia_managers.json": managers_data,
    }

    for fname, data in files.items():
        path = os.path.join(OUTPUT_DIR, fname)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  Written {path} ({len(json.dumps(data, ensure_ascii=False))} bytes)")

    # Generate combined facts file
    print("\n--- Generating wikipedia_facts.json ---")
    facts = generate_facts(club_data, seasons_data, players_data, managers_data)
    facts_path = os.path.join(OUTPUT_DIR, "wikipedia_facts.json")
    with open(facts_path, "w", encoding="utf-8") as f:
        json.dump(facts, f, ensure_ascii=False, indent=2)
    print(f"  Written {facts_path} ({len(facts)} facts)")

    print("\nDone.")


if __name__ == "__main__":
    main()
