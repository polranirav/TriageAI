from enum import Enum


class TriageState(Enum):
    GREETING = "greeting"
    Q1 = "chief_complaint"
    Q2 = "duration"
    Q3 = "severity"
    Q4 = "age"
    Q5 = "conditions"
    COMPLETE = "complete"
    ESCALATED = "escalated"
    INCOMPLETE = "incomplete"


_TRANSITIONS: dict[TriageState, TriageState] = {
    TriageState.GREETING: TriageState.Q1,
    TriageState.Q1: TriageState.Q2,
    TriageState.Q2: TriageState.Q3,
    TriageState.Q3: TriageState.Q4,
    TriageState.Q4: TriageState.Q5,
    TriageState.Q5: TriageState.COMPLETE,
}


class TriageSession:
    """
    In-memory state tracker for one triage call.

    Stores only structural metadata (state, question count).
    Zero PII — no answers, no transcripts, no caller identity.
    """

    def __init__(self, call_sid: str) -> None:
        self.call_sid = call_sid
        self.state: TriageState = TriageState.GREETING
        self.questions_completed: int = 0

    def advance_state(self) -> TriageState:
        """Move to the next question. No-op if already terminal."""
        next_state = _TRANSITIONS.get(self.state)
        if next_state:
            self.state = next_state
            self.questions_completed += 1
        return self.state

    def is_complete(self) -> bool:
        return self.state == TriageState.COMPLETE

    def mark_incomplete(self) -> None:
        """Caller hung up before all 5 questions were answered."""
        self.state = TriageState.INCOMPLETE

    def mark_escalated(self) -> None:
        """Early escalation — L1/L2 detected mid-triage."""
        self.state = TriageState.ESCALATED
