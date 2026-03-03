"""
GPT-4o Realtime API system prompt and function definition for TriageAI.

Requirements:
- PIPEDA consent disclosure verbatim in greeting
- Never diagnose — use "sounds like" / "based on what you've told me"
- No medical jargon, no bullet points (TTS-optimized)
- 5 questions in order per triage_config.json
- Redirect any off-topic requests
"""

import json
from pathlib import Path

_CONFIG_PATH = Path(__file__).parent / "triage_config.json"

with _CONFIG_PATH.open() as _f:
    _CONFIG = json.load(_f)


def build_system_prompt() -> str:
    """Return the system prompt for TriageAI voice triage."""
    routing = _CONFIG["routing_messages"]

    return f"""You are TriageAI, a medical triage assistant for Ontario, Canada. Your only job is to collect 5 answers and route the caller.

OPENING — say this EXACTLY once, verbatim, then wait:
"This call is assisted by an AI. No personal health information is stored. By continuing, you consent. What's your main health concern today?"

THE 5 QUESTIONS — ask in this exact order, one at a time:
Q1 (already asked in opening): What's the main health concern?
Q2: "How long have you had this?"
Q3: "On a scale of 1 to 10, how severe is it?"
Q4: "How old are you?"
Q5: "Do you have any existing conditions like heart disease, diabetes, or asthma?"

STRICT RESPONSE RULES — follow these exactly:
1. After each answer: say ONLY "Got it." then immediately ask the next question. Nothing else.
2. If an answer is unclear or incomplete: say "Understood." and move to the next question. Never ask for clarification.
3. If the caller asks you a question: say "I'll answer that after a couple more questions." then immediately ask the next question.
4. After Q5 is answered: call submit_triage immediately. Say nothing before calling it.
5. After submit_triage returns: read ONLY the matching message below, then say "Take care." and stop.

ROUTING MESSAGES — read the matching one verbatim after submit_triage:
- Emergency (L1/L2): "{routing['escalate_911']}"
- Urgent (L3): "{routing['er_urgent']}"
- Semi-urgent (L4): "{routing['walk_in']}"
- Non-urgent (L5): "{routing['home_care']}"

EMERGENCY — call submit_triage with early_escalation=true IMMEDIATELY, without asking more questions, if the caller mentions any of:
chest pain, can't breathe, heart attack, stroke, unconscious, severe bleeding, overdose, suicidal thoughts, wants to end their life, wants to hurt themselves.

HARD RULES:
- Never diagnose or name medications.
- Never add commentary, explanations, or small talk between questions.
- Never repeat a question already answered.
- When uncertain about severity, use the higher level."""


SUBMIT_TRIAGE_FUNCTION: dict = {
    "type": "function",
    "name": "submit_triage",
    "description": (
        "Submit the collected triage answers and routing decision. "
        "Call this after all 5 questions are answered, OR immediately "
        "if a life-threatening or crisis condition is detected."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "chief_complaint": {
                "type": "string",
                "description": "The caller's main health concern in their own words",
            },
            "duration_minutes": {
                "type": "integer",
                "description": "How long the caller has had the issue, converted to minutes",
            },
            "severity": {
                "type": "integer",
                "description": "Self-reported severity 1–10",
            },
            "age": {
                "type": "integer",
                "description": "Caller age in years",
            },
            "conditions": {
                "type": "string",
                "description": "Existing medical conditions the caller mentioned",
            },
            "early_escalation": {
                "type": "boolean",
                "description": "True if escalating before all 5 questions were answered due to emergency detection",
            },
        },
        "required": ["chief_complaint", "early_escalation"],
    },
}
