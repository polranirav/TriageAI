# Compatibility shim — the canonical model is TriageSessionModel in triage_session.py
# This file should not be imported directly; use app.models.triage_session instead.
from app.models.triage_session import TriageSessionModel as CallSession

__all__ = ["CallSession"]
