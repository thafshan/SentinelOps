from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.models.incident import Incident
from app.models.security_event import SecurityEvent
from app.models.user import User
from app.models.vulnerability import Vulnerability


VULNERABILITY_POINTS = {
    "critical": 20,
    "high": 15,
    "medium": 8,
    "low": 3,
}

SECURITY_EVENT_POINTS = {
    "critical": 15,
    "high": 10,
    "medium": 5,
    "low": 2,
}

INCIDENT_SEVERITY_POINTS = {
    "critical": 15,
    "high": 10,
    "medium": 5,
    "low": 2,
}

INCIDENT_PRIORITY_POINTS = {
    "critical": 15,
    "high": 10,
    "medium": 5,
    "low": 2,
}


def get_risk_level(risk_score: int) -> str:
    if risk_score >= 75:
        return "critical"

    if risk_score >= 50:
        return "high"

    if risk_score >= 25:
        return "medium"

    return "low"


def calculate_asset_risk(
    db: Session,
    asset_id: int,
) -> dict:
    asset = (
        db.query(Asset)
        .filter(Asset.id == asset_id)
        .first()
    )

    if not asset:
        return {
            "asset_id": asset_id,
            "risk_score": 0,
            "risk_level": "low",
            "vulnerability_score": 0,
            "security_event_score": 0,
            "incident_score": 0,
        }

    vulnerabilities = (
        db.query(Vulnerability)
        .filter(Vulnerability.asset_id == asset_id)
        .all()
    )

    security_events = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.asset_id == asset_id)
        .all()
    )

    incidents = (
        db.query(Incident)
        .filter(Incident.asset_id == asset_id)
        .all()
    )

    vulnerability_score = 0

    for vulnerability in vulnerabilities:
        if vulnerability.status.lower() == "resolved":
            continue

        severity_points = VULNERABILITY_POINTS.get(
            vulnerability.severity.lower(),
            0,
        )

        cvss_bonus = 0

        if vulnerability.cvss_score is not None:
            cvss_bonus = round(vulnerability.cvss_score / 10)

        vulnerability_score += severity_points + cvss_bonus

    vulnerability_score = min(vulnerability_score, 40)

    security_event_score = 0

    for event in security_events:
        if event.status.lower() == "resolved":
            continue

        security_event_score += SECURITY_EVENT_POINTS.get(
            event.severity.lower(),
            0,
        )

    security_event_score = min(security_event_score, 30)

    incident_score = 0

    for incident in incidents:
        if incident.status.lower() == "resolved":
            continue

        severity_points = INCIDENT_SEVERITY_POINTS.get(
            incident.severity.lower(),
            0,
        )

        priority_points = INCIDENT_PRIORITY_POINTS.get(
            incident.priority.lower(),
            0,
        )

        incident_score += severity_points + priority_points

    incident_score = min(incident_score, 30)

    risk_score = (
        vulnerability_score
        + security_event_score
        + incident_score
    )

    risk_score = min(risk_score, 100)

    return {
        "asset_id": asset.id,
        "risk_score": risk_score,
        "risk_level": get_risk_level(risk_score),
        "vulnerability_score": vulnerability_score,
        "security_event_score": security_event_score,
        "incident_score": incident_score,
    }


def calculate_risk_overview(db: Session) -> dict:
    assets = db.query(Asset).all()

    total_assets = len(assets)
    critical_assets = 0
    total_risk_score = 0

    open_vulnerabilities = 0
    active_security_events = 0
    open_incidents = 0

    for asset in assets:
        asset_risk = calculate_asset_risk(
            db=db,
            asset_id=asset.id,
        )

        total_risk_score += asset_risk["risk_score"]

        if asset_risk["risk_level"] == "critical":
            critical_assets += 1

    vulnerabilities = db.query(Vulnerability).all()

    for vulnerability in vulnerabilities:
        if vulnerability.status.lower() != "resolved":
            open_vulnerabilities += 1

    security_events = db.query(SecurityEvent).all()

    for event in security_events:
        if event.status.lower() != "resolved":
            active_security_events += 1

    incidents = db.query(Incident).all()

    for incident in incidents:
        if incident.status.lower() != "resolved":
            open_incidents += 1

    if total_assets > 0:
        overall_risk_score = round(
            total_risk_score / total_assets
        )
    else:
        overall_risk_score = 0

    return {
        "overall_risk_score": overall_risk_score,
        "risk_level": get_risk_level(overall_risk_score),
        "total_assets": total_assets,
        "critical_assets": critical_assets,
        "open_vulnerabilities": open_vulnerabilities,
        "active_security_events": active_security_events,
        "open_incidents": open_incidents,
    }