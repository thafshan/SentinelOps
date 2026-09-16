from app.core.database import SessionLocal
from app.services.risk import calculate_asset_risk, get_risk_level


def test_risk_level_low():
    assert get_risk_level(10) == "low"


def test_risk_level_medium():
    assert get_risk_level(30) == "medium"


def test_risk_level_high():
    assert get_risk_level(60) == "high"


def test_risk_level_critical():
    assert get_risk_level(80) == "critical"


def test_risk_level_boundaries():
    assert get_risk_level(24) == "low"
    assert get_risk_level(25) == "medium"
    assert get_risk_level(49) == "medium"
    assert get_risk_level(50) == "high"
    assert get_risk_level(74) == "high"
    assert get_risk_level(75) == "critical"


def test_calculate_asset_risk():
    db = SessionLocal()

    try:
        result = calculate_asset_risk(
            db=db,
            asset_id=2,
        )

        assert result["asset_id"] == 2
        assert 0 <= result["risk_score"] <= 100
        assert result["risk_level"] in {
            "low",
            "medium",
            "high",
            "critical",
        }
        assert 0 <= result["vulnerability_score"] <= 40
        assert 0 <= result["security_event_score"] <= 30
        assert 0 <= result["incident_score"] <= 30

    finally:
        db.close()

from app.services.risk import calculate_risk_overview


def test_calculate_risk_overview():
    db = SessionLocal()

    try:
        result = calculate_risk_overview(db=db)

        assert 0 <= result["overall_risk_score"] <= 100
        assert result["risk_level"] in {
            "low",
            "medium",
            "high",
            "critical",
        }
        assert result["total_assets"] >= 0
        assert result["critical_assets"] >= 0
        assert result["open_vulnerabilities"] >= 0
        assert result["active_security_events"] >= 0
        assert result["open_incidents"] >= 0

    finally:
        db.close()        