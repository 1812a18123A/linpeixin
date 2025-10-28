from datetime import datetime, timezone
from typing import List, Dict

from fastapi import FastAPI

REPORTS_DATA: List[Dict[str, object]] = [
    {"id": 1, "status": "ready"},
]

app = FastAPI()


def _serialize_report(report: Dict[str, object]) -> Dict[str, object]:
    """Return a report payload enriched with a creation timestamp."""
    return {
        "id": report["id"],
        "status": report["status"],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/reports")
def list_reports() -> List[Dict[str, object]]:
    """Return a JSON list of reports."""
    return [_serialize_report(report) for report in REPORTS_DATA]
