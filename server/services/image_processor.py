"""Image helpers + Pollinations re-synthesis + demo shield (Shahbaz's endpoints)."""
import base64
import io
import urllib.parse
from pathlib import Path

import requests
from PIL import Image

POLLINATIONS_URL = "https://image.pollinations.ai/prompt/{p}?width=1024&height=768&model=flux&nologo=true"
CACHE_DIR = Path(__file__).resolve().parent.parent / "static" / "cache"


def b64_to_image(b64: str) -> Image.Image:
    raw = base64.b64decode(b64.split(",", 1)[-1])  # tolerate data-URL prefix
    return Image.open(io.BytesIO(raw)).convert("RGB")


def image_to_b64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()


def pollinations_synthesize(prompt: str) -> str:
    """Re-synthesize a room image via the team's Pollinations/Flux helper.

    Returns a data-URL base64 JPEG (same format as Fawad's /api/generate).
    """
    url = POLLINATIONS_URL.format(p=urllib.parse.quote(prompt[:1000]))
    res = requests.get(url, timeout=60)
    if res.status_code != 200:
        raise RuntimeError(f"Pollinations returned {res.status_code}")
    return "data:image/jpeg;base64," + base64.b64encode(res.content).decode()


def _cached_fallback_b64() -> str | None:
    for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp"):
        files = sorted(CACHE_DIR.glob(ext))
        if files:
            raw = files[0].read_bytes()
            mime = "png" if files[0].suffix.lower() == ".png" else "jpeg"
            return f"data:image/{mime};base64," + base64.b64encode(raw).decode()
    return None


def shielded_synthesize(prompt: str, previous_b64: str | None = None):
    """Try Pollinations; on ANY failure serve a fallback instead of 500ing.

    Returns (image_data_url, used_fallback: bool).
    Fallback order: cached render in static/cache/ -> echo of previous image.
    """
    try:
        return pollinations_synthesize(prompt), False
    except Exception as exc:  # noqa: BLE001 - the shield must never fail
        print(f"[demo-shield] Pollinations failed ({exc}); serving fallback")
        cached = _cached_fallback_b64()
        if cached:
            return cached, True
        if previous_b64:
            prev = previous_b64 if previous_b64.startswith("data:") else "data:image/png;base64," + previous_b64
            return prev, True
        raise RuntimeError("refine failed and no fallback available")
