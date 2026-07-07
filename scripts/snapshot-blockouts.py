#!/usr/bin/env python3
"""Snapshot blockout calendars from the canonical operator JSON into the site.

Same pattern as the calculator's build-time snapshot (src/data/calculator.ts):
the site never reads data.lanyardpass.com (header-gated, and static ranks/loads
faster). Run from the landing repo root on a machine with the lanyard-docs
workspace checked out alongside:

    python3 scripts/snapshot-blockouts.py

Reads  ../data_schema/{universal_orlando,disney_world,united_parks}.json
Writes src/data/blockouts.json  (snapshot_date = the day you ran this)

Re-run whenever the canonical blockout data changes (the hours/events runbook
cadence), then rebuild the site.
"""

import json
import datetime
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCHEMA = ROOT.parent / "data_schema"
OUT = ROOT / "src" / "data" / "blockouts.json"

# Site-facing operator presentation (slugs are the public URLs — don't churn).
OPERATORS = [
    {
        "id": "disney_world",
        "slug": "disney-world",
        "name": "Walt Disney World",
        "passName": "Annual Pass",
    },
    {
        "id": "universal_orlando",
        "slug": "universal-orlando",
        "name": "Universal Orlando",
        "passName": "Annual Pass",
    },
    {
        "id": "united_parks",
        "slug": "seaworld-busch-gardens",
        "name": "SeaWorld & Busch Gardens (Florida)",
        "passName": "Annual Pass",
    },
]


def main() -> None:
    today = datetime.date.today().isoformat()
    out = {"snapshot_date": today, "operators": []}

    for meta in OPERATORS:
        src = SCHEMA / f"{meta['id']}.json"
        data = json.loads(src.read_text())

        parks = {
            p["park_id"]: {
                "name": p.get("display_name", p["park_id"]),
                "short": p.get("display_name_short") or p.get("display_name", p["park_id"]),
            }
            for p in data.get("parks", [])
        }

        tiers = []
        for t in data.get("program", {}).get("tiers", []):
            ranges = []
            for r in t.get("blockout_date_ranges", []):
                # Site shows the road ahead: drop ranges fully in the past.
                if r["end"] < today:
                    continue
                ranges.append(
                    {
                        "start": r["start"],
                        "end": r["end"],
                        "label": r.get("label") or "",
                        "parks": [parks.get(pid, {"short": pid})["short"] for pid in r.get("park_ids", [])],
                        "notes": r.get("notes") or "",
                    }
                )
            ranges.sort(key=lambda r: r["start"])
            tiers.append(
                {
                    "id": t["tier_id"],
                    "name": t.get("display_name", t["tier_id"]),
                    "rank": t.get("rank", 0),
                    "ranges": ranges,
                }
            )
        tiers.sort(key=lambda t: t["rank"])

        out["operators"].append(
            {
                **meta,
                "lastVerified": data.get("data_last_verified", ""),
                "parkNames": sorted({v["short"] for v in parks.values()}),
                "tiers": tiers,
            }
        )

    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    n = sum(len(t["ranges"]) for o in out["operators"] for t in o["tiers"])
    print(f"wrote {OUT.relative_to(ROOT)} — {n} upcoming ranges across "
          f"{len(out['operators'])} operators (snapshot {today})")


if __name__ == "__main__":
    sys.exit(main())
