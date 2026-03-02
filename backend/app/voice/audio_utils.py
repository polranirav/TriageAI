"""
Audio format conversion utilities for the Twilio ↔ OpenAI bridge.

Twilio Media Streams:  μ-law  8 kHz, base64-encoded
OpenAI Realtime API:   PCM16 16 kHz input / PCM16 24 kHz output

audioop is available in Python 3.11 (deprecated in 3.11, removed in 3.13).
"""

import audioop
import base64


def ulaw_to_pcm16(ulaw_frame: bytes) -> bytes:
    """
    Convert Twilio μ-law 8 kHz audio to PCM16 16 kHz for OpenAI.

    Steps:
      1. μ-law 8 kHz  → PCM16 8 kHz  (audioop.ulaw2lin, sample width 2)
      2. PCM16 8 kHz  → PCM16 16 kHz (audioop.ratecv 2× upsample)
    """
    if not ulaw_frame:
        return b""
    pcm_8k = audioop.ulaw2lin(ulaw_frame, 2)
    pcm_16k, _ = audioop.ratecv(pcm_8k, 2, 1, 8000, 16000, None)
    return pcm_16k


def pcm16_to_ulaw(pcm_frame: bytes) -> bytes:
    """
    Convert OpenAI PCM16 24 kHz audio to μ-law 8 kHz for Twilio.

    Steps:
      1. PCM16 24 kHz → PCM16 8 kHz (audioop.ratecv 3× downsample)
      2. PCM16 8 kHz  → μ-law 8 kHz (audioop.lin2ulaw, sample width 2)
    """
    if not pcm_frame:
        return b""
    pcm_8k, _ = audioop.ratecv(pcm_frame, 2, 1, 24000, 8000, None)
    return audioop.lin2ulaw(pcm_8k, 2)


def decode_twilio_audio(payload: str) -> bytes:
    """Decode a Twilio base64 audio payload to raw μ-law bytes."""
    return base64.b64decode(payload)


def encode_for_twilio(ulaw_frame: bytes) -> str:
    """Encode μ-law bytes to a base64 string for Twilio media event payload."""
    return base64.b64encode(ulaw_frame).decode("utf-8")
