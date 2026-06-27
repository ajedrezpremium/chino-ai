"""
Scraper for "Las Historias de Venom" YouTube channel.
Pipeline: video list -> transcripts -> AI processing -> SQL + facts export.

Usage:
    python scrape_venom_youtube.py                # Download + process
    python scrape_venom_youtube.py --skip-ai      # Skip OpenRouter processing
    python scrape_venom_youtube.py --limit 50     # Only first N videos
"""

import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent
SCRAPED_DIR = OUTPUT_DIR / "scraped_data"
TRANSCRIPT_DIR = OUTPUT_DIR / "venom_transcripts"

CHANNEL_URL = "https://youtube.com/@LasHistoriasDeVenom"
VIDEOS_FILE = SCRAPED_DIR / "venom_videos.json"
TRANSCRIPTS_FILE = SCRAPED_DIR / "venom_transcripts.json"
PROCESSED_FILE = SCRAPED_DIR / "venom_processed.json"
FACTS_FILE = SCRAPED_DIR / "venom_facts.json"
SQL_FILE = OUTPUT_DIR / "venom_anecdotas_supabase.sql"

REQUEST_DELAY = 1.0

CATEGORIAS = [
    "superacion", "curiosidad", "leyenda", "humor",
    "drama", "historico", "valores",
]

SUPABASE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS anecdotas (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  url_video TEXT NOT NULL,
  protagonista TEXT,
  equipo TEXT,
  a\u00f1o TEXT,
  categoria TEXT,
  valor_ensenanza TEXT,
  resumen TEXT,
  transcripcion TEXT,
  fecha_publicacion TIMESTAMPTZ,
  vistas BIGINT,
  likes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_anecdotas_protagonista ON anecdotas(protagonista);
CREATE INDEX IF NOT EXISTS idx_anecdotas_equipo ON anecdotas(equipo);
CREATE INDEX IF NOT EXISTS idx_anecdotas_categoria ON anecdotas(categoria);
CREATE INDEX IF NOT EXISTS idx_anecdotas_a\u00f1o ON anecdotas(a\u00f1o);
"""


def check_dependencies():
    """Warn if yt-dlp is not installed."""
    try:
        subprocess.run(
            ["yt-dlp", "--version"],
            capture_output=True, text=True, check=True,
        )
        return True
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("WARNING: yt-dlp is not installed or not in PATH.")
        print("  Install it: pip install yt-dlp")
        print("  or: https://github.com/yt-dlp/yt-dlp/releases")
        return False


def run_ytdlp(args: list[str]) -> str:
    """Run yt-dlp with given args and return stdout."""
    result = subprocess.run(
        ["yt-dlp"] + args,
        capture_output=True, text=True, check=False,
        encoding="utf-8",
    )
    if result.returncode != 0:
        print(f"  yt-dlp error (rc={result.returncode}): {result.stderr.strip()}")
        return ""
    return result.stdout.strip()


# ---------------------------------------------------------------------------
# Step 1: Fetch video list
# ---------------------------------------------------------------------------

def fetch_video_list() -> list[dict]:
    """Fetch all videos from the channel using yt-dlp."""
    print("Fetching video list from channel...")
    os.makedirs(SCRAPED_DIR, exist_ok=True)

    raw = run_ytdlp([
        "--flat-playlist",
        "--dump-json",
        "--ignore-errors",
        "--no-warnings",
        CHANNEL_URL,
    ])
    if not raw:
        print("ERROR: No output from yt-dlp. Check channel URL or network.")
        return []

    videos = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError:
            continue

        video = {
            "id": entry.get("id", ""),
            "title": entry.get("title", ""),
            "url": f"https://youtube.com/watch?v={entry.get('id', '')}",
            "duration": entry.get("duration"),
            "upload_date": entry.get("upload_date"),
            "view_count": entry.get("view_count"),
            "like_count": entry.get("like_count"),
        }
        videos.append(video)

    print(f"  Found {len(videos)} videos")
    return videos


def save_video_list(videos: list[dict]):
    """Save video list to JSON."""
    VIDEOS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(VIDEOS_FILE, "w", encoding="utf-8") as f:
        json.dump(videos, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {VIDEOS_FILE}")


# ---------------------------------------------------------------------------
# Step 2: Download transcripts
# ---------------------------------------------------------------------------

def fetch_transcripts(video_list: list[dict], limit: int | None = None) -> list[dict]:
    """Download auto-generated Spanish captions for each video."""
    print("\nDownloading transcripts...")
    TRANSCRIPT_DIR.mkdir(parents=True, exist_ok=True)

    videos = video_list[:limit] if limit else video_list
    results = []

    for i, video in enumerate(videos):
        vid_id = video["id"]
        title = video["title"]
        url = video["url"]
        print(f"  [{i+1}/{len(videos)}] {title[:60]}...")

        out_template = str(TRANSCRIPT_DIR / f"{vid_id}")
        run_ytdlp([
            "--write-auto-sub",
            "--sub-lang", "es",
            "--skip-download",
            "--convert-subs", "srt",
            "--output", out_template,
            "--no-warnings",
            url,
        ])

        transcript = parse_transcript_file(vid_id)
        results.append({
            "id": vid_id,
            "title": title,
            "url": url,
            "transcript": transcript,
        })

        if i < len(videos) - 1:
            time.sleep(REQUEST_DELAY)

    print(f"  Transcripts obtained: {sum(1 for r in results if r['transcript'])}/{len(results)}")
    return results


def parse_transcript_file(vid_id: str) -> str:
    """Parse an SRT transcript file into plain text."""
    # Try mkv, srt, vtt extensions
    for ext in [".es.srt", ".srt", ".es.vtt", ".vtt", ".en.srt"]:
        path = TRANSCRIPT_DIR / f"{vid_id}{ext}"
        if path.exists():
            break
        # yt-dlp may add format suffixes
        for f in TRANSCRIPT_DIR.glob(f"{vid_id}*{ext}"):
            path = f
            break
        else:
            continue
        break
    else:
        return ""

    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return ""

    # Remove SRT numbering and timing lines
    lines = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if re.match(r"^\d+$", stripped):
            continue
        if "-->" in stripped:
            continue
        if re.match(r"^\d{2}:\d{2}", stripped):
            continue
        # Remove HTML tags
        stripped = re.sub(r"<[^>]+>", "", stripped)
        lines.append(stripped)

    return " ".join(lines)


def save_transcripts(transcripts: list[dict]):
    """Save transcripts to JSON."""
    TRANSCRIPTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(TRANSCRIPTS_FILE, "w", encoding="utf-8") as f:
        json.dump(transcripts, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {TRANSCRIPTS_FILE}")


# ---------------------------------------------------------------------------
# Step 3: AI processing (optional, via OpenRouter)
# ---------------------------------------------------------------------------

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "gpt-4o-mini"

PROMPT_TEMPLATE = """Eres un experto en f\u00fatbol que analiza transcripciones del canal "Las Historias de Venom".

Extrae la siguiente informaci\u00f3n de la transcripci\u00f3n y del t\u00edtulo:

- protagonista: Nombre del jugador o persona principal
- equipo: Nombre del equipo o club involucrado
- a\u00f1o: A\u00f1o o \u00e9poca en la que ocurre la historia
- categoria: Una de: {categorias}
- valor_ensenanza: Una lecci\u00f3n de vida o valor que transmite la historia (si aplica, si no null)
- resumen: Resumen de la historia en 3 l\u00edneas en espa\u00f1ol

T\u00edtulo: {titulo}
Transcripci\u00f3n:
{transcripcion}

Responde \u00fanicamente con un objeto JSON v\u00e1lido con estas claves."""


def generate_summary(
    transcript: str,
    title: str,
    api_key: str,
    model: str = DEFAULT_MODEL,
) -> dict | None:
    """Send transcript to OpenRouter for structured extraction."""
    import requests

    prompt = PROMPT_TEMPLATE.format(
        categorias=", ".join(CATEGORIAS),
        titulo=title,
        transcripcion=transcript[:6000],
    )

    try:
        resp = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://github.com/your-project",
            },
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 500,
            },
            timeout=60,
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"]
        # Extract JSON from response
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            return json.loads(match.group())
    except Exception as e:
        print(f"    AI error: {e}")
    return None


def process_with_ai(
    transcripts: list[dict],
    api_key: str | None = None,
    limit: int | None = None,
) -> list[dict]:
    """Process all transcripts through OpenRouter."""
    if not api_key:
        print("\nSkipping AI processing (no OPENROUTER_API_KEY)")
        return []

    print("\nProcessing transcripts with AI...")
    items = transcripts[:limit] if limit else transcripts
    results = []

    for i, item in enumerate(items):
        title = item["title"]
        transcript = item["transcript"]
        if not transcript:
            print(f"  [{i+1}/{len(items)}] {title[:50]}... (no transcript)")
            results.append({
                "id": item["id"],
                "title": title,
                "url": item["url"],
                "error": "no_transcript",
            })
            continue

        print(f"  [{i+1}/{len(items)}] {title[:50]}...")
        parsed = generate_summary(transcript, title, api_key)
        if parsed:
            parsed["id"] = item["id"]
            parsed["title"] = title
            parsed["url"] = item["url"]
            parsed["transcript"] = transcript
            results.append(parsed)
        else:
            results.append({
                "id": item["id"],
                "title": title,
                "url": item["url"],
                "error": "processing_failed",
            })

        if i < len(items) - 1:
            time.sleep(REQUEST_DELAY)

    ok = sum(1 for r in results if "error" not in r)
    print(f"  Processed: {ok}/{len(results)}")
    return results


def save_processed(processed: list[dict]):
    """Save AI-processed data to JSON."""
    PROCESSED_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(PROCESSED_FILE, "w", encoding="utf-8") as f:
        json.dump(processed, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {PROCESSED_FILE}")


# ---------------------------------------------------------------------------
# Step 4: Generate SQL
# ---------------------------------------------------------------------------

def generate_sql(processed: list[dict]) -> str:
    """Generate CREATE TABLE + INSERT statements for Supabase."""
    lines = [SUPABASE_TABLE_SQL.strip(), "", ""]

    values = []
    for item in processed:
        if "error" in item:
            continue

        def esc(val):
            if val is None:
                return "NULL"
            s = str(val).replace("'", "''")
            return f"'{s}'"

        titulo = esc(item.get("title", ""))
        url = esc(item.get("url", ""))
        prota = esc(item.get("protagonista"))
        equipo = esc(item.get("equipo"))
        anno = esc(item.get("a\u00f1o"))
        cat = esc(item.get("categoria"))
        valor = esc(item.get("valor_ensenanza"))
        resumen = esc(item.get("resumen"))
        transc = esc(item.get("transcript", ""))
        fecha = esc(item.get("fecha_publicacion"))
        vistas = item.get("view_count") or item.get("vistas")
        likes = item.get("like_count") or item.get("likes")
        vistas_s = "NULL" if vistas is None else str(vistas)
        likes_s = "NULL" if likes is None else str(likes)

        row = f"({titulo},{url},{prota},{equipo},{anno},{cat},{valor},{resumen},{transc},{fecha},{vistas_s},{likes_s})"
        values.append(row)

    if values:
        insert = "INSERT INTO anecdotas (titulo,url_video,protagonista,equipo,a\u00f1o,categoria,valor_ensenanza,resumen,transcripcion,fecha_publicacion,vistas,likes) VALUES\n"
        insert += ",\n".join(values)
        insert += ";\n"
        lines.append(insert)

    return "\n".join(lines)


def save_sql(sql: str):
    """Write SQL file."""
    SQL_FILE.parent.mkdir(parents=True, exist_ok=True)
    SQL_FILE.write_text(sql, encoding="utf-8")
    print(f"  Saved: {SQL_FILE}")


# ---------------------------------------------------------------------------
# Step 5: Generate facts JSON
# ---------------------------------------------------------------------------

def generate_facts(processed: list[dict]) -> list[dict]:
    """Convert processed data into knowledge_facts_best.json format."""
    facts = []
    for item in processed:
        if "error" in item:
            continue
        resumen = item.get("resumen") or item.get("title", "")
        vid_id = item.get("id", "")
        cat = item.get("categoria", "curiosidad")
        facts.append({
            "fact_text": f"An\u00e9cdota: {resumen} (Fuente: Las Historias de Venom)",
            "category": cat,
            "verified": True,
            "source_url": f"https://youtube.com/watch?v={vid_id}",
            "source_name": "Las Historias de Venom",
        })
    return facts


def save_facts(facts: list[dict]):
    """Save facts JSON file."""
    FACTS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(FACTS_FILE, "w", encoding="utf-8") as f:
        json.dump(facts, f, ensure_ascii=False, indent=2)
    print(f"  Saved: {FACTS_FILE} ({len(facts)} facts)")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    import argparse

    parser = argparse.ArgumentParser(description="Scrape Las Historias de Venom channel")
    parser.add_argument("--limit", type=int, help="Only process first N videos")
    parser.add_argument(
        "--skip-ai", action="store_true",
        help="Skip OpenRouter AI processing step",
    )
    parser.add_argument(
        "--resume", action="store_true",
        help="Skip video list fetch, use existing venom_videos.json",
    )
    args = parser.parse_args()

    print("=" * 60)
    print(" Las Historias de Venom - Scraper")
    print("=" * 60)

    if not check_dependencies():
        return

    # Step 1: Video list
    if args.resume and VIDEOS_FILE.exists():
        print("\n[1] Loading existing video list...")
        with open(VIDEOS_FILE, "r", encoding="utf-8") as f:
            videos = json.load(f)
        print(f"  Loaded {len(videos)} videos from {VIDEOS_FILE}")
    else:
        print("\n[1/5] Fetching video list...")
        videos = fetch_video_list()
        if not videos:
            print("No videos found. Exiting.")
            return
        save_video_list(videos)

    if args.limit:
        videos = videos[:args.limit]
        print(f"  Limiting to {len(videos)} videos")

    # Step 2: Transcripts
    print("\n[2/5] Downloading transcripts...")
    if args.resume and TRANSCRIPTS_FILE.exists():
        with open(TRANSCRIPTS_FILE, "r", encoding="utf-8") as f:
            transcripts = json.load(f)
        print(f"  Loaded {len(transcripts)} transcripts from {TRANSCRIPTS_FILE}")
    else:
        transcripts = fetch_transcripts(videos, limit=args.limit)
        save_transcripts(transcripts)

    # Step 3: AI processing
    print("\n[3/5] AI processing...")
    api_key = os.environ.get("OPENROUTER_API_KEY")
    processed = None
    if args.skip_ai or not api_key:
        processed = process_with_ai([], api_key=None)
        if not api_key and not args.skip_ai:
            print("  (set OPENROUTER_API_KEY env var to enable)")
    else:
        processed = process_with_ai(transcripts, api_key, limit=args.limit)
        if processed:
            save_processed(processed)

    # Step 4: SQL
    print("\n[4/5] Generating SQL...")
    if processed:
        sql = generate_sql(processed)
        save_sql(sql)
    else:
        print("  Skipping SQL (no processed data)")

    # Step 5: Facts JSON
    print("\n[5/5] Generating facts JSON...")
    if processed:
        facts = generate_facts(processed)
        save_facts(facts)
    else:
        print("  Skipping facts (no processed data)")

    # Summary
    print("\n" + "=" * 60)
    print(" SUMMARY")
    print("=" * 60)
    print(f"  Videos found:      {len(videos)}")
    if transcripts:
        with_t = sum(1 for t in transcripts if t.get("transcript"))
        print(f"  Transcripts:       {with_t}/{len(transcripts)}")
    if processed:
        ok = sum(1 for p in processed if "error" not in p)
        print(f"  AI processed:      {ok}/{len(processed)}")
    print(f"  Output files in:   {OUTPUT_DIR.resolve()}")
    print("Done.")


if __name__ == "__main__":
    main()
