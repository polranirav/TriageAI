"""
Twilio ↔ OpenAI Realtime API bidirectional audio bridge.

Call flow:
  POST /v1/voice creates the DB session record and returns TwiML.
  Twilio opens WS /v1/media-stream → handle_media_stream() runs.
  Two concurrent asyncio tasks:
    _receive_from_twilio  — Twilio audio → OpenAI
    _receive_from_openai  — OpenAI audio/events → Twilio
  On call end: DB session updated with CTAS outcome, both WS connections closed.
"""

import asyncio
import base64
import json
from datetime import UTC, datetime
from typing import Any

import structlog
import websockets
from fastapi import WebSocket

from app.config import settings
from app.database import async_session_factory
from app.escalation.transfer import warm_transfer
from app.exceptions import OPENAI_CONNECTION_FAILED, TriageAIError
from app.logging.session_logger import complete_session
from app.triage.classifier import classify_ctas, get_routing_action, should_escalate_early
from app.triage.prompts import SUBMIT_TRIAGE_FUNCTION, build_system_prompt
from app.triage.state_machine import TriageSession
from app.voice.audio_utils import (
    decode_twilio_audio,
    encode_for_twilio,
    pcm16_to_ulaw,
    ulaw_to_pcm16,
)

_OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview"

logger = structlog.get_logger()


async def handle_media_stream(twilio_ws: WebSocket) -> None:
    """
    Accept the Twilio WebSocket, connect to OpenAI Realtime, and run
    the bidirectional audio bridge for the duration of the call.
    """
    await twilio_ws.accept()
    log = logger.bind(handler="media_bridge")

    # Mutable state shared between the two concurrent tasks.
    # triage_outcome is populated by _handle_triage_submission.
    shared: dict[str, Any] = {
        "session": None,          # TriageSession (in-memory state machine)
        "stream_sid": None,       # Twilio stream identifier
        "triage_outcome": None,   # dict set when GPT-4o calls submit_triage
        "call_start_time": None,  # datetime set on Twilio start event
    }

    openai_ws = None
    try:
        openai_ws = await _connect_to_openai(log)
        await _configure_openai_session(openai_ws)
        log.info("bridge_ready")

        twilio_task = asyncio.create_task(
            _receive_from_twilio(twilio_ws, openai_ws, shared, log)
        )
        openai_task = asyncio.create_task(
            _receive_from_openai(openai_ws, twilio_ws, shared, log)
        )

        # Run until either side closes, then cancel the other
        done, pending = await asyncio.wait(
            {twilio_task, openai_task},
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass

        for task in done:
            exc = task.exception()
            if exc:
                log.error("bridge_task_failed", error=str(exc))

    except TriageAIError:
        raise
    except Exception:
        log.exception("bridge_unexpected_error")
    finally:
        if openai_ws:
            await openai_ws.close()
        await _finalize_session(shared, log)


# ── OpenAI connection ────────────────────────────────────────────────────────


async def _connect_to_openai(log: Any) -> Any:
    try:
        ws = await websockets.connect(  # noqa: S310
            _OPENAI_REALTIME_URL,
            extra_headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "OpenAI-Beta": "realtime=v1",
            },
        )
        log.info("openai_connected")
        return ws
    except Exception as exc:
        log.error("openai_connect_failed", error=str(exc))
        raise TriageAIError(
            code=OPENAI_CONNECTION_FAILED,
            message="Failed to connect to OpenAI Realtime API",
            status=503,
        ) from exc


async def _configure_openai_session(openai_ws: Any) -> None:
    """Send session.update to configure voice, prompt, and triage function tool."""
    await openai_ws.send(
        json.dumps({
            "type": "session.update",
            "session": {
                "modalities": ["audio", "text"],
                "voice": "alloy",
                "instructions": build_system_prompt(),
                "input_audio_format": "pcm16",
                "output_audio_format": "pcm16",
                "turn_detection": {
                    "type": "server_vad",
                    "threshold": 0.5,
                    "prefix_padding_ms": 500,
                    "silence_duration_ms": 800,
                },
                "tools": [SUBMIT_TRIAGE_FUNCTION],
                "tool_choice": "auto",
                "temperature": 0.6,
                "max_response_output_tokens": 150,
            },
        })
    )


async def _trigger_initial_greeting(openai_ws: Any) -> None:
    """Send a response.create to make the AI speak its opening greeting immediately."""
    await openai_ws.send(
        json.dumps({
            "type": "response.create",
            "response": {
                "modalities": ["audio", "text"],
                "instructions": (  # noqa: E501
                    "Greet the caller with the opening line from your instructions. "
                    "Say it exactly as written, then wait for the caller to respond."
                ),
            },
        })
    )


# ── Twilio → OpenAI ──────────────────────────────────────────────────────────


async def _receive_from_twilio(
    twilio_ws: WebSocket,
    openai_ws: Any,
    shared: dict,
    log: Any,
) -> None:
    """
    Read Twilio Media Stream events and forward audio to OpenAI.

    Event types:
      start — extract call_sid / stream_sid, initialise TriageSession
      media — decode μ-law, upsample to PCM16 16kHz, forward to OpenAI
      stop  — call ended, exit loop
    """
    async for raw in twilio_ws.iter_text():
        data: dict = json.loads(raw)
        event = data.get("event")

        if event == "start":
            call_sid: str = data["start"]["callSid"]
            stream_sid: str = data["start"]["streamSid"]
            shared["session"] = TriageSession(call_sid)
            shared["stream_sid"] = stream_sid
            shared["call_start_time"] = datetime.now(UTC)
            log.info("call_started", call_sid=call_sid, stream_sid=stream_sid)

        elif event == "media":
            ulaw_bytes = decode_twilio_audio(data["media"]["payload"])
            pcm16_bytes = ulaw_to_pcm16(ulaw_bytes)
            if pcm16_bytes:
                await openai_ws.send(
                    json.dumps({
                        "type": "input_audio_buffer.append",
                        "audio": base64.b64encode(pcm16_bytes).decode(),
                    })
                )

        elif event == "stop":
            session: TriageSession | None = shared.get("session")
            log.info("call_stopped", call_sid=session.call_sid if session else None)
            if session and not session.is_complete():
                session.mark_incomplete()
            break


# ── OpenAI → Twilio ──────────────────────────────────────────────────────────


async def _receive_from_openai(
    openai_ws: Any,
    twilio_ws: WebSocket,
    shared: dict,
    log: Any,
) -> None:
    """
    Read OpenAI Realtime events and forward audio back to Twilio.
    Uses explicit recv() instead of async iteration for websockets v12 compat.
    """
    audio_chunks_sent = 0
    log.info("openai_listener_started")
    try:
        while True:
            try:
                raw = await openai_ws.recv()
            except websockets.exceptions.ConnectionClosed:
                log.info("openai_ws_closed")
                break

            if isinstance(raw, bytes):
                continue

            data: dict = json.loads(raw)
            event_type: str = data.get("type", "")

            # Debug: log non-audio event types
            skip_events = (
                "response.audio.delta", "input_audio_buffer.speech_started",
                "input_audio_buffer.speech_stopped", "input_audio_buffer.committed",
            )
            if event_type not in skip_events:
                log.info("openai_event", event_type=event_type)

            if event_type == "response.audio.delta":
                delta = data.get("delta", "")
                if delta:
                    pcm16_bytes = base64.b64decode(delta)
                    ulaw_bytes = pcm16_to_ulaw(pcm16_bytes)
                    stream_sid = shared.get("stream_sid", "")
                    await twilio_ws.send_text(
                        json.dumps({
                            "event": "media",
                            "streamSid": stream_sid,
                            "media": {"payload": encode_for_twilio(ulaw_bytes)},
                        })
                    )
                    audio_chunks_sent += 1
                    if audio_chunks_sent == 1:
                        log.info("first_audio_chunk_sent_to_twilio")
                    elif audio_chunks_sent % 100 == 0:
                        log.info("audio_chunks_sent", count=audio_chunks_sent)

            elif event_type == "response.audio_transcript.delta":
                transcript = data.get("delta", "")
                if transcript:
                    log.info("ai_speaking", text=transcript[:80])

            elif event_type == "response.function_call_arguments.done":
                await _process_triage_submission(data, shared, log)

            elif event_type == "session.created":
                session_id = data.get("session", {}).get("id")
                log.info("openai_session_created", openai_session_id=session_id)

            elif event_type == "session.updated":
                log.info("openai_session_updated")
                # NOW trigger the greeting — session is fully configured
                await _trigger_initial_greeting(openai_ws)
                log.info("greeting_triggered")

            elif event_type == "response.created":
                log.info("openai_response_created")

            elif event_type == "response.done":
                log.info("openai_response_done", audio_chunks_total=audio_chunks_sent)

            elif event_type == "error":
                err = data.get("error", {})
                log.warning("openai_error", error_type=err.get("type"), message=err.get("message"))

    except Exception:
        log.exception("openai_listener_error")


# ── Triage classification ─────────────────────────────────────────────────────


async def _process_triage_submission(data: dict, shared: dict, log: Any) -> None:
    """
    Run classify_ctas() on the answers GPT-4o collected, store the outcome
    in shared["triage_outcome"] for the DB write in _finalize_session().
    """
    try:
        args: dict = json.loads(data.get("arguments", "{}"))
        session: TriageSession | None = shared.get("session")

        if not session:
            log.warning("triage_submitted_without_session")
            return

        early: bool = bool(args.get("early_escalation", False))

        # Deterministic classifier — no LLM
        ctas = classify_ctas(args)
        action = get_routing_action(ctas.value)

        # Safety net: re-check for early escalation independently
        if not early and should_escalate_early(args):
            early = True

        if early:
            session.mark_escalated()
        else:
            session.advance_state()

        shared["triage_outcome"] = {
            "ctas_level": ctas.value,
            "routing_action": action.value,
            "early_escalation": early,
        }

        # L1/L2: initiate warm transfer to nurse line immediately
        if ctas.value <= 2:
            try:
                await warm_transfer(session.call_sid)
                log.info("warm_transfer_initiated", call_sid=session.call_sid)
            except Exception:
                # Never re-raise — DB outcome still written in _finalize_session
                log.exception("warm_transfer_failed", call_sid=session.call_sid)

        # Structured log — chief_complaint NOT logged (PII-adjacent)
        log.info(
            "triage_classified",
            call_sid=session.call_sid,
            ctas_level=ctas.value,
            routing_action=action.value,
            questions_completed=session.questions_completed,
            early_escalation=early,
        )

    except Exception:
        log.exception("triage_classification_error")


# ── Session finalisation ──────────────────────────────────────────────────────


async def _finalize_session(shared: dict, log: Any) -> None:
    """
    Write the final triage outcome to the DB and log the session_ended event.
    Called unconditionally in handle_media_stream's finally block.
    """
    session: TriageSession | None = shared.get("session")
    if not session:
        return  # Call ended before Twilio sent the "start" event

    outcome: dict | None = shared.get("triage_outcome")

    start_time = shared.get("call_start_time")
    duration_sec = int((datetime.now(UTC) - start_time).total_seconds()) if start_time else None

    try:
        async with async_session_factory() as db:
            await complete_session(
                call_sid=session.call_sid,
                ctas_level=outcome["ctas_level"] if outcome else None,
                routing_action=outcome["routing_action"] if outcome else "incomplete",
                escalated=outcome["early_escalation"] if outcome else False,
                questions_completed=session.questions_completed,
                duration_sec=duration_sec,
                db=db,
            )
    except Exception:
        log.exception("session_finalize_error", call_sid=session.call_sid)

    log.info(
        "session_ended",
        call_sid=session.call_sid,
        final_state=session.state.value,
        questions_completed=session.questions_completed,
    )
