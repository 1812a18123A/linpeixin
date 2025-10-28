from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI
from pydantic import BaseModel

reports = [
    {"id": 1, "status": "ready"},
]


class Report(BaseModel):
    id: int
    status: str
    created_at: str


app = FastAPI()


def _build_report_payload(raw_report: dict) -> Report:
    """Return a report payload enriched with an ISO 8601 timestamp."""

    return Report(
        id=raw_report["id"],
        status=raw_report["status"],
        created_at=datetime.now(timezone.utc).isoformat(),
    )


@app.get("/reports", response_model=List[Report])
def list_reports() -> List[Report]:
    """Return all reports in JSON format."""

    return [_build_report_payload(report) for report in reports]
