"""
Audio conversion utility tests.

Validates that μ-law ↔ PCM16 conversion produces correct byte shapes
and does not error on edge-case inputs.
"""

from app.voice.audio_utils import (
    decode_twilio_audio,
    encode_for_twilio,
    pcm16_to_ulaw,
    ulaw_to_pcm16,
)


class TestUlawToPcm16:
    def test_empty_input_returns_empty(self) -> None:
        assert ulaw_to_pcm16(b"") == b""

    def test_output_is_bytes(self) -> None:
        result = ulaw_to_pcm16(b"\xff")
        assert isinstance(result, bytes)

    def test_output_is_larger_than_input(self) -> None:
        """PCM16 16kHz from μ-law 8kHz should expand (2 bytes/sample × 2× resample = 4× min)."""
        ulaw_frame = b"\xff" * 160  # 20ms at 8kHz
        result = ulaw_to_pcm16(ulaw_frame)
        assert len(result) > len(ulaw_frame)

    def test_output_length_is_even(self) -> None:
        """PCM16 samples are 2 bytes — output must always be even-length."""
        result = ulaw_to_pcm16(b"\xff" * 80)
        assert len(result) % 2 == 0

    def test_silence_byte_does_not_error(self) -> None:
        """0xFF is μ-law silence — must not raise."""
        result = ulaw_to_pcm16(b"\xff" * 320)
        assert result  # non-empty


class TestPcm16ToUlaw:
    def test_empty_input_returns_empty(self) -> None:
        assert pcm16_to_ulaw(b"") == b""

    def test_output_is_bytes(self) -> None:
        silent_pcm16 = b"\x00\x00" * 480  # 20ms at 24kHz
        result = pcm16_to_ulaw(silent_pcm16)
        assert isinstance(result, bytes)

    def test_output_is_smaller_than_input(self) -> None:
        """μ-law 8kHz from PCM16 24kHz: 3× fewer samples, 2× fewer bytes/sample = 6× smaller."""
        pcm16_frame = b"\x00\x00" * 480
        result = pcm16_to_ulaw(pcm16_frame)
        assert len(result) < len(pcm16_frame)

    def test_zero_pcm_does_not_error(self) -> None:
        """All-zero PCM (silence) must convert cleanly."""
        result = pcm16_to_ulaw(b"\x00\x00" * 960)
        assert result


class TestBase64Helpers:
    def test_decode_then_encode_roundtrip(self) -> None:
        import base64

        original_ulaw = b"\xff\xab\x12\xcd" * 40
        encoded = base64.b64encode(original_ulaw).decode()
        decoded = decode_twilio_audio(encoded)
        assert decoded == original_ulaw

    def test_encode_for_twilio_returns_str(self) -> None:
        result = encode_for_twilio(b"\xff" * 10)
        assert isinstance(result, str)

    def test_encode_for_twilio_is_valid_base64(self) -> None:
        import base64

        ulaw = b"\xff\x00" * 20
        encoded = encode_for_twilio(ulaw)
        decoded = base64.b64decode(encoded)
        assert decoded == ulaw


class TestFullPipelineRoundtrip:
    def test_silence_roundtrip_does_not_error(self) -> None:
        """
        μ-law silence → PCM16 16kHz → PCM16 8kHz → μ-law 8kHz.
        Not bit-exact due to resampling, but must not raise.
        """
        original = b"\xff" * 160
        pcm16 = ulaw_to_pcm16(original)
        assert pcm16
        back = pcm16_to_ulaw(pcm16)
        assert back
