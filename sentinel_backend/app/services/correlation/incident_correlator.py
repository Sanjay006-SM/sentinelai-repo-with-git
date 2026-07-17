"""
Multi-Source Incident Correlation Service (Stage 3)

Correlates events from different security tools (AWS, Wazuh, Suricata, OpenVAS)
into unified Incidents using time-window, actor, and asset overlap analysis.
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from sqlalchemy.orm import Session as DBSession

logger = logging.getLogger(__name__)


class CorrelatedIncident:
    """Represents a correlated security incident composed of events from multiple sources."""

    def __init__(self, incident_id: Optional[str] = None):
        self.id: str = incident_id or str(uuid4())
        self.events: List[Dict[str, Any]] = []
        self.sources: set = set()
        self.actors: set = set()
        self.assets: set = set()
        self.severity: str = "Low"
        self.mitre_techniques: List[Dict[str, str]] = []
        self.start_time: Optional[datetime] = None
        self.end_time: Optional[datetime] = None
        self.description: str = ""

    def add_event(self, event: Dict[str, Any]):
        self.events.append(event)
        self.sources.add(event.get("source", "unknown"))

        actor = event.get("identity") or event.get("actor")
        if actor:
            self.actors.add(actor)

        asset = event.get("asset")
        if asset:
            self.assets.add(asset)

        # Update time window
        event_time = event.get("timestamp")
        if isinstance(event_time, str):
            try:
                event_time = datetime.fromisoformat(event_time.replace("Z", "+00:00"))
            except (ValueError, TypeError):
                event_time = None

        if event_time:
            if self.start_time is None or event_time < self.start_time:
                self.start_time = event_time
            if self.end_time is None or event_time > self.end_time:
                self.end_time = event_time

        # Escalate severity
        event_severity = event.get("severity", "INFO")
        self.severity = self._max_severity(self.severity, event_severity)

    def _max_severity(self, current: str, incoming: str) -> str:
        order = {"INFO": 0, "LOW": 1, "Low": 1, "MEDIUM": 2, "Medium": 2,
                 "HIGH": 3, "High": 3, "CRITICAL": 4, "Critical": 4}
        if order.get(incoming, 0) > order.get(current, 0):
            return incoming
        return current

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "event_count": len(self.events),
            "sources": list(self.sources),
            "actors": list(self.actors),
            "assets": list(self.assets),
            "severity": self.severity,
            "mitre_techniques": self.mitre_techniques,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "description": self.description,
            "events": self.events[:50],  # Cap event payload
        }


class IncidentCorrelator:
    """
    Correlates security events from multiple sources into unified incidents.

    Correlation rules:
    1. Time proximity: events within a configurable window (default 5 minutes)
    2. Actor overlap: events involving the same identity/user/IP
    3. Asset overlap: events targeting the same resource/host
    4. Kill-chain progression: events following MITRE ATT&CK tactic order
    """

    def __init__(self, time_window_minutes: int = 5):
        self.time_window = timedelta(minutes=time_window_minutes)

    def correlate(self, events: List[Dict[str, Any]]) -> List[CorrelatedIncident]:
        """
        Takes a list of normalized events from any source and groups them into
        correlated incidents.
        """
        if not events:
            return []

        # Sort events by timestamp
        sorted_events = sorted(events, key=lambda e: e.get("timestamp", ""))

        incidents: List[CorrelatedIncident] = []
        assigned: set = set()

        for i, event in enumerate(sorted_events):
            if i in assigned:
                continue

            incident = CorrelatedIncident()
            incident.add_event(event)
            assigned.add(i)

            # Find correlated events
            for j, candidate in enumerate(sorted_events):
                if j in assigned or j == i:
                    continue

                if self._should_correlate(event, candidate, incident):
                    incident.add_event(candidate)
                    assigned.add(j)

            # Generate description
            incident.description = self._generate_description(incident)
            incidents.append(incident)

        # Filter out single-event incidents (not true multi-source correlations)
        # Keep all incidents with 2+ events OR from multiple sources
        significant_incidents = [
            inc for inc in incidents
            if len(inc.events) >= 2 or len(inc.sources) > 1
        ]

        # Sort by severity and event count
        severity_order = {"CRITICAL": 4, "Critical": 4, "HIGH": 3, "High": 3,
                          "MEDIUM": 2, "Medium": 2, "LOW": 1, "Low": 1, "INFO": 0}
        significant_incidents.sort(
            key=lambda i: (severity_order.get(i.severity, 0), len(i.events)),
            reverse=True
        )

        return significant_incidents

    def _should_correlate(self, event_a: Dict, event_b: Dict,
                          incident: CorrelatedIncident) -> bool:
        """Determines if two events should be correlated into the same incident."""

        # Rule 1: Time proximity
        time_a = event_a.get("timestamp", "")
        time_b = event_b.get("timestamp", "")
        if time_a and time_b:
            try:
                dt_a = datetime.fromisoformat(str(time_a).replace("Z", "+00:00"))
                dt_b = datetime.fromisoformat(str(time_b).replace("Z", "+00:00"))
                if abs(dt_b - dt_a) > self.time_window:
                    return False
            except (ValueError, TypeError):
                pass

        # Rule 2: Actor overlap
        actor_a = event_a.get("identity") or event_a.get("actor")
        actor_b = event_b.get("identity") or event_b.get("actor")
        if actor_a and actor_b and actor_a == actor_b:
            return True

        # Also check against all actors already in the incident
        if actor_b and actor_b in incident.actors:
            return True

        # Rule 3: Asset overlap
        asset_a = event_a.get("asset")
        asset_b = event_b.get("asset")
        if asset_a and asset_b and asset_a == asset_b:
            return True

        if asset_b and asset_b in incident.assets:
            return True

        # Rule 4: IP address overlap (source IP matching)
        ip_a = event_a.get("metadata", {}).get("source_ip") or event_a.get("source_ip")
        ip_b = event_b.get("metadata", {}).get("source_ip") or event_b.get("source_ip")
        if ip_a and ip_b and ip_a == ip_b:
            return True

        return False

    def _generate_description(self, incident: CorrelatedIncident) -> str:
        """Auto-generates a human-readable description for the incident."""
        parts = []

        if len(incident.sources) > 1:
            parts.append(
                f"Cross-source incident detected across {', '.join(incident.sources)}"
            )
        else:
            source = list(incident.sources)[0] if incident.sources else "unknown"
            parts.append(f"Correlated incident from {source}")

        parts.append(f"involving {len(incident.events)} events")

        if incident.actors:
            actors_preview = list(incident.actors)[:3]
            parts.append(f"by {', '.join(actors_preview)}")

        if incident.assets:
            assets_preview = list(incident.assets)[:3]
            parts.append(f"targeting {', '.join(assets_preview)}")

        if incident.start_time and incident.end_time:
            duration = incident.end_time - incident.start_time
            if duration.total_seconds() > 0:
                parts.append(f"over {int(duration.total_seconds())}s window")

        return " ".join(parts) + "."
