# TriageAI — Coding Conventions & Standards

## Python (Backend)

### Naming

| Element | Style | Example |
|:--------|:------|:--------|
| Functions / variables | `snake_case` | `classify_ctas()`, `call_sid` |
| Classes / Pydantic models | `PascalCase` | `TriageSession`, `CTASLevel` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_QUESTIONS`, `CTAS_LEVELS` |
| Database tables | `snake_case_plural` | `triage_sessions`, `system_events` |
| Files | `snake_case` | `state_machine.py`, `audio_utils.py` |

### File Structure

```python
# 1. Standard library imports
import asyncio
from datetime import datetime

# 2. Third-party imports
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

# 3. Local imports
from app.config import settings
from app.database import get_session
from app.models.triage_session import TriageSession
```

**Rules:**
- One router per module. Business logic in non-router files.
- Routers only call services — **no logic in routers**.
- Use absolute imports only (`from app.triage.classifier import classify_ctas`).

### Comments

```python
# ✅ Comment WHY, not WHAT
# Conservative default: incomplete triage assumes urgent (L2) to avoid
# missing a real emergency — false alarm is better than missed alarm
if answers.get("severity") is None:
    return CTASLevel.L2

# ❌ Don't explain what the code does
# Set the level to 2
level = 2

# ✅ Exception: CTAS clinical rules MUST cite source
# Source: CTAS 2022 standard — chest pain with age ≥65 = Level 1
if "chest pain" in complaint and age >= 65:
    return CTASLevel.L1
```

### Error Handling

```python
# All errors use TriageAIError from app/exceptions.py
class TriageAIError(Exception):
    def __init__(self, code: str, message: str, status: int, details: dict = {}):
        self.code = code
        self.message = message
        self.status = status
        self.details = details

# Standard error response shape:
{
    "error": {
        "code": "TRIAGE_SESSION_NOT_FOUND",
        "message": "No session found for call_sid: CA3f7a2b...",
        "status": 404,
        "details": {}
    }
}
```

**12 Error Codes:**

| Code | Status | When |
|:-----|:-------|:-----|
| `INVALID_TWILIO_SIGNATURE` | 403 | Webhook signature fails |
| `TRIAGE_SESSION_NOT_FOUND` | 404 | call_sid not in DB |
| `TRIAGE_SESSION_ALREADY_COMPLETE` | 409 | Duplicate routing trigger |
| `ESCALATION_FAILED` | 503 | Twilio Participants API error |
| `OPENAI_CONNECTION_FAILED` | 503 | Realtime WebSocket fails |
| `AUDIO_CONVERSION_ERROR` | 500 | audioop conversion error |
| `DATABASE_WRITE_FAILED` | 500 | SQLAlchemy write fails |
| `INVALID_CTAS_LEVEL` | 422 | Classifier returns out-of-range |
| `RATE_LIMIT_EXCEEDED` | 429 | slowapi blocks request |
| `UNAUTHORIZED` | 401 | Missing/invalid JWT |
| `FORBIDDEN` | 403 | Wrong clinic scope |
| `INTERNAL_SERVER_ERROR` | 500 | Uncaught exception |

### Logging

```python
import structlog
logger = structlog.get_logger()

# ✅ Structured, no PII
logger.info("triage_session_created", call_sid=call_sid, started_at=ts)
logger.error("escalation_failed", call_sid=call_sid, twilio_error=str(e))

# ❌ NEVER log
# - Phone numbers
# - Caller health responses
# - Auth tokens
# - Personally identifiable information
```

---

## TypeScript (Frontend)

### Naming

| Element | Style | Example |
|:--------|:------|:--------|
| Components / types | `PascalCase` | `CTASBadge`, `SessionDetail` |
| Functions / variables | `camelCase` | `useSessions`, `formatDuration` |
| Component files | `kebab-case` | `ctas-badge.tsx`, `session-detail.tsx` |

### Component Structure

```tsx
// 1. Imports
import { useState } from 'react'
import { Card } from '@/components/ui/card'

// 2. Types/interfaces
interface StatCardProps {
  label: string
  value: number
  trend?: number
}

// 3. Component function
export function StatCard({ label, value, trend }: StatCardProps) {
  // hooks first
  const [isHovered, setIsHovered] = useState(false)

  // render
  return (
    <Card>...</Card>
  )
}
```

**Rules:**
- **No `any` type** — use explicit types or `unknown` with type guards
- Export named components (not default exports)
- Keep components focused and reusable

---

## Git Workflow

### Commit Format (Conventional Commits)

```
feat: add CTAS level classifier with 5-question mapping
fix: resolve μ-law audio conversion byte order issue
refactor: extract routing messages to triage_config.json
test: add 10 unit tests for classify_ctas() edge cases
docs: update README with local setup instructions
chore: upgrade openai SDK to 1.12.0
style: apply ruff formatting to voice/ module
```

### Branch Naming

```
feature/F1-T02-audio-bridge
fix/F4-T01-escalate-timeout
chore/F0-T03-ci-pipeline
```

### Merge Rules

- Branch per task → PR per task → squash merge → delete branch
- **Never commit directly to `main`**
- Green CI required before merge (branch protection)

### PR Description Template

```markdown
## What
[One sentence — what this PR does]

## Why
Task: [Task ID] — [Task title]

## How
[2-3 sentences on approach]

## Testing Done
- [ ] Unit tests passing
- [ ] Manual test completed
- [ ] Edge cases tested

## Screenshots / Logs
[If applicable]
```

---

## Linting & Formatting

### Python (ruff)

```toml
# pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py311"
select = ["E", "F", "I", "N", "UP", "S", "B", "A"]
ignore = ["S101"]  # allow assert in tests

[tool.ruff.per-file-ignores]
"tests/*" = ["S", "B"]

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

### Self-Review Checklist (Before Every Push)

```
□ 1. Does this satisfy ALL acceptance criteria for this task?
□ 2. Did I test happy path AND at least 2 edge cases?
□ 3. Any hardcoded value that should be in .env?
□ 4. Did I add a test for any new business logic?
□ 5. Would I understand this in 3 months with no context?
□ 6. Any print(), console.log(), or TODO hacks left?
□ 7. Could this break anything that was working before?
□ 8. Is anything being logged that could contain PII?
```
