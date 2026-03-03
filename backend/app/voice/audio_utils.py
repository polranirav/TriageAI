"""
Audio format conversion utilities for the Twilio ↔ OpenAI bridge.

Twilio Media Streams:  μ-law  8 kHz, base64-encoded
OpenAI Realtime API:   PCM16 16 kHz input / PCM16 24 kHz output

Pure Python ITU-T G.711 μ-law codec — no audioop dependency.
audioop was deprecated in Python 3.11 and removed in Python 3.13.
"""

import base64
import struct

# ── ITU-T G.711 μ-law constants ───────────────────────────────────────────────

_MULAW_BIAS = 0x84  # 132
_MULAW_CLIP = 32635

# Exponent lookup table for μ-law encoding (indexes by sample >> 7, masked to 8 bits)
_EXP_LUT: list[int] = [
    0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3,
    4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
    6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
    7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
]


def _decode_ulaw_byte(byte: int) -> int:
    """Decode a single μ-law byte to a signed 16-bit PCM sample (ITU-T G.711)."""
    byte = ~byte & 0xFF
    t = ((byte & 0x0F) << 3) + _MULAW_BIAS
    t <<= (byte & 0x70) >> 4
    return -(t - _MULAW_BIAS) if (byte & 0x80) else (t - _MULAW_BIAS)


def _encode_ulaw_byte(sample: int) -> int:
    """Encode a signed 16-bit PCM sample to a μ-law byte (ITU-T G.711)."""
    sign = 0x80 if sample < 0 else 0
    if sample < 0:
        sample = -sample
    if sample > _MULAW_CLIP:
        sample = _MULAW_CLIP
    sample += _MULAW_BIAS
    exponent = _EXP_LUT[(sample >> 7) & 0xFF]
    mantissa = (sample >> (exponent + 3)) & 0x0F
    return (~(sign | (exponent << 4) | mantissa)) & 0xFF


# ── Public API ────────────────────────────────────────────────────────────────


def ulaw_to_pcm16(ulaw_frame: bytes) -> bytes:
    """
    Convert Twilio μ-law 8 kHz audio to PCM16 16 kHz for OpenAI.

    Steps:
      1. μ-law 8 kHz  → PCM16 8 kHz  (ITU-T G.711 decode)
      2. PCM16 8 kHz  → PCM16 16 kHz (2× linear interpolation upsample)
    """
    if not ulaw_frame:
        return b""

    # Decode each μ-law byte to a 16-bit signed PCM sample
    samples_8k = [_decode_ulaw_byte(b) for b in ulaw_frame]

    # Upsample 8kHz → 16kHz: linear interpolate a midpoint between each pair
    upsampled: list[int] = []
    n = len(samples_8k)
    for i, s in enumerate(samples_8k):
        upsampled.append(s)
        next_s = samples_8k[i + 1] if i + 1 < n else s
        upsampled.append((s + next_s) >> 1)

    return struct.pack(f"<{len(upsampled)}h", *upsampled)


def pcm16_to_ulaw(pcm_frame: bytes) -> bytes:
    """
    Convert OpenAI PCM16 24 kHz audio to μ-law 8 kHz for Twilio.

    Steps:
      1. PCM16 24 kHz → PCM16 8 kHz (3× downsample by averaging every 3 samples)
      2. PCM16 8 kHz  → μ-law 8 kHz (ITU-T G.711 encode)
    """
    if not pcm_frame:
        return b""

    n = len(pcm_frame) // 2
    samples_24k = struct.unpack(f"<{n}h", pcm_frame[: n * 2])

    # Downsample 24kHz → 8kHz: average every group of 3 samples
    downsampled: list[int] = []
    for i in range(0, n - 2, 3):
        avg = (samples_24k[i] + samples_24k[i + 1] + samples_24k[i + 2]) // 3
        downsampled.append(avg)

    return bytes(_encode_ulaw_byte(s) for s in downsampled)


def decode_twilio_audio(payload: str) -> bytes:
    """Decode a Twilio base64 audio payload to raw μ-law bytes."""
    return base64.b64decode(payload)


def encode_for_twilio(ulaw_frame: bytes) -> str:
    """Encode μ-law bytes to a base64 string for Twilio media event payload."""
    return base64.b64encode(ulaw_frame).decode("utf-8")
