from datetime import datetime

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_list_reports_returns_expected_payload():
    response = client.get("/reports")

    assert response.status_code == 200

    payload = response.json()
    assert isinstance(payload, list)
    assert payload, "Expected at least one report in the response"

    report = payload[0]
    assert report["id"] == 1
    assert report["status"] == "ready"
    assert "created_at" in report

    # Validate that the timestamp is ISO8601-compatible.
    datetime.fromisoformat(report["created_at"])
