"""Image helpers + Colab ControlNet synthesis + demo shield."""
import base64
import io
import os
from pathlib import Path
import re
import urllib.parse
import requests
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

CACHE_DIR = Path(__file__).resolve().parent.parent / "static" / "cache"

def b64_to_image(b64: str) -> Image.Image:
    raw = base64.b64decode(b64.split(",", 1)[-1])
    return Image.open(io.BytesIO(raw)).convert("RGB")

def image_to_b64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=92)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()

def _cached_fallback_b64() -> str | None:
    for ext in ("*.png", "*.jpg", "*.jpeg", "*.webp"):
        files = sorted(CACHE_DIR.glob(ext))
        if files:
            raw = files[0].read_bytes()
            mime = "png" if files[0].suffix.lower() == ".png" else "jpeg"
            return f"data:image/{mime};base64," + base64.b64encode(raw).decode()
    return None

def _format_refinement_prompt(prompt: str) -> str:
    """
    Applies lexical attention weights (item:1.3) to conversational additions/edits
    so new elements can compete against the strong latents of the base image.
    """
    lower = prompt.lower().strip()
    action_prefixes = [
        "add ", "please add ", "put ", "place ", "insert ",
        "include ", "change to ", "replace with "
    ]
    
    for prefix in action_prefixes:
        if lower.startswith(prefix):
            target_item = prompt[len(prefix):].strip()
            # If the prompt contains a trailing descriptor or comma, isolate the target
            parts = target_item.split(",", 1)
            emphasized_core = f"({parts[0].strip()}:1.3)"
            remaining = f", {parts[1].strip()}" if len(parts) > 1 else ""
            return f"{emphasized_core}{remaining}, architectural interior photography, highly detailed"
            
    # If no action prefix was used, append general interior photography context
    return prompt

def shielded_synthesize(
    prompt: str,
    previous_b64: str | None = None,
    is_refinement: bool = False,
    strength: float = 1.0,
    is_floor_plan: bool = False,
):
    colab_url = os.getenv("COLAB_BRIDGE_URL", "").strip().rstrip("/")

    # Tier 1: Try Colab ControlNet
    if colab_url and previous_b64:
        try:
            # Calibrate strength for object addition during refinement
            if is_refinement:
                # 0.40 allows new items (plants, lamps) to materialize without shifting walls
                effective_strength = strength if (strength < 1.0 and strength >= 0.35) else 0.40
                final_prompt = _format_refinement_prompt(prompt)
            else:
                effective_strength = strength
                final_prompt = prompt

            print(
                f"[Refine] Triggering Colab at {colab_url}/api/generate "
                f"(is_refinement={is_refinement}, strength={effective_strength}, is_floor_plan={is_floor_plan})..."
            )
            
            payload = {
                "image_base64": previous_b64,
                "prompt": final_prompt[:400],
                "is_refinement": is_refinement,
                "strength": effective_strength,
                "is_floor_plan": is_floor_plan,
            }
            headers = {
                "ngrok-skip-browser-warning": "true",
                "User-Agent": "SketchSpace-Backend"
            }
            res = requests.post(
                f"{colab_url}/api/generate",
                json=payload,
                headers=headers,
                timeout=90
            )
            if res.status_code == 200:
                data = res.json()
                img = data.get("image_url") or data.get("image_base64")
                if img:
                    print("[Refine] SUCCESS: Rendered via Google Colab ControlNet!")
                    return img, False
            else:
                print(f"[Refine] Colab error {res.status_code}: {res.text[:200]}")
        except Exception as e:
            print(f"[Refine] Colab failed ({e}); falling back to Pollinations...")

    # Tier 2: Resilient Safety Fallback: Pollinations.ai (Free Default Model)
    try:
        print("[Refine] Calling Pollinations fallback...")
        safe_prompt = re.sub(r'[^a-zA-Z0-9\s,]', ' ', prompt)
        safe_prompt = " ".join(safe_prompt.split())[:250].strip()
        encoded = urllib.parse.quote(safe_prompt)
        
        url = f"https://image.pollinations.ai/prompt/{encoded}?nologo=true"
        res = requests.get(url, timeout=35)
        if res.status_code == 200 and len(res.content) > 2000:
            b64_str = base64.b64encode(res.content).decode("utf-8")
            print("[Refine] Generated via Pollinations fallback.")
            return f"data:image/jpeg;base64,{b64_str}", True
        else:
            print(f"[Refine] Pollinations returned status: {res.status_code}")
    except Exception as e:
        print(f"[Refine] Pollinations failed ({e}); serving local fallback")

    # Tier 3: Local Cached or Echo Fallback
    cached = _cached_fallback_b64()
    if cached:
        print("[Refine] Serving cached fallback design.")
        return cached, True
    if previous_b64:
        print("[Refine] Echoing previous image as safe fallback.")
        return previous_b64, True

    raise RuntimeError("All image synthesis tiers failed.")