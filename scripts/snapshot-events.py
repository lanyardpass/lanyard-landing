#!/usr/bin/env python3
"""Snapshot the events corpus from canonical events.json into the site.

Same pattern as snapshot-blockouts.py: the site never reads
data.lanyardpass.com (header-gated, and static ranks/loads faster). Run from
the landing repo root on a machine with the lanyard-docs workspace checked
out alongside:

    python3 scripts/snapshot-events.py

Reads  ../data_schema/events.json
Writes src/data/events_snapshot.json  (snapshot_date = the day you ran this)

Feeds the /details/calendar "next ninety days" strip. The strip's window is
snapshot_date -> +90 days, so re-run whenever events.json changes (the events
runbook cadence), then rebuild the site.
"""

import json
import datetime
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SCHEMA = ROOT.parent / "data_schema"
OUT = ROOT / "src" / "data" / "events_snapshot.json"

WINDOW_DAYS = 90

# Site-facing operator presentation — keep in step with snapshot-blockouts.py.
OPERATORS = {
    "disney_world": "Walt Disney World",
    "universal_orlando": "Universal Orlando",
    "united_parks": "SeaWorld & Busch Gardens",
}


def main() -> None:
    today = datetime.date.today()
    horizon = today + datetime.timedelta(days=WINDOW_DAYS)

    data = json.loads((SCHEMA / "events.json").read_text())
    events = data["events"] if isinstance(data, dict) else data

    # Park short names per operator, for disambiguating same-named events
    # (the two Howl-O-Scream entries) at render time.
    park_short = {}
    for op_id in OPERATORS:
        op = json.loads((SCHEMA / f"{op_id}.json").read_text())
        for p in op.get("parks", []):
            park_short[p["park_id"]] = p.get("display_name_short") or p.get("display_name", p["park_id"])

    out_events = []
    for e in events:
        vf, vt = e.get("valid_from"), e.get("valid_to")
        if not vf or not vt:
            continue
        f = datetime.date.fromisoformat(vf)
        t = datetime.date.fromisoformat(vt)
        if t < today or f > horizon:
            continue
        out_events.append(
            {
                "id": e["id"],
                "name": e.get("name", ""),
                "short": e.get("name_short") or e.get("name", ""),
                "type": e.get("type", ""),
                "operator": e.get("operator_id", ""),
                "from": vf,
                "to": vt,
                "nights": len(e.get("select_dates") or []),
                "dates": e.get("select_dates") or [],
                "parks": [park_short.get(pid, pid) for pid in (e.get("park_ids") or [])],
                "description": e.get("description", ""),
            }
        )

    out_events.sort(key=lambda e: (e["from"], e["to"]))
    out = {
        "snapshot_date": today.isoformat(),
        "window_days": WINDOW_DAYS,
        "operators": OPERATORS,
        "events": out_events,
    }
    OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    print(f"wrote {OUT.relative_to(ROOT)} — {len(out_events)} events in the "
          f"{WINDOW_DAYS}-day window (snapshot {today.isoformat()})")


if __name__ == "__main__":
    sys.exit(main())
