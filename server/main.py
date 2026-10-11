import os
import base64
import re
import urllib.parse
from io import BytesIO
from typing import List, Optional
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai
from google.genai import types
from routes.presets import router as presets_router
from routes.refine import router as refine_router

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set in environment or .env file")
client = genai.Client(api_key=api_key)

app = FastAPI(title="SketchSpace AI Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(presets_router)
app.include_router(refine_router)

class GenerateRequest(BaseModel):
    image_base64: str
    room_type: str = "Bedroom"
    style: str = "Modern Japandi"
    prompt: Optional[str] = ""
    preserve_layout: bool = True
    is_floor_plan: bool = False  # Flag for preset blueprint / 2D map layouts

class GenerateResponse(BaseModel):
    status: str
    detected_anchors: List[str]
    rendered_image_base64: str
    generator_used: str

def clean_base64(raw_b64: str) -> bytes:
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",")[1]
    return base64.b64decode(raw_b64)

def analyze_layout_with_gemini(image_bytes: bytes) -> List[str]:
    prompt = """
    You are an architectural analysis engine. Analyze this room layout sketch or floor plan.
    Identify the relative spatial locations of key elements:
    - Walls, doors, windows
    - Core furniture (bed, desk, couch, wardrobe, kitchen fixtures, etc.)
    Return concise bullet points only.
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[types.Part.from_bytes(data=image_bytes, mime_type="image/png"), prompt]
        )
        text = response.text or ""
        lines = [line.strip().lstrip("-*• ").strip() for line in text.split("\n") if line.strip()]
        return lines if lines else ["Layout detected: Standard perspective room"]
    except Exception as e:
        print(f"Gemini Vision warning: {e}")
        return ["Layout detected: Standard spatial constraints applied"]

def compile_spatial_prompt(room_type: str, style: str, user_prompt: str, anchors: List[str], preserve_layout: bool, is_floor_plan: bool = False) -> str:
    spatial_rules = ""
    if preserve_layout and anchors:
        spatial_rules = f"Arrangement: {', '.join(anchors)}. "
    details = user_prompt if user_prompt else "ambient natural sunlight, organic textures"

    if is_floor_plan:
        return (
            f"3D top-down isometric cutaway floor plan render of a {style} {room_type}. "
            f"{spatial_rules}Details: {details}. "
            f"Miniature model look, clean wooden parquet floors, soft room shadows, 8k resolution."
        )

    return (
        f"Photorealistic 8k architectural photography of a {style} {room_type}. "
        f"{spatial_rules}Details: {details}. "
        f"Sharp focus, magazine quality, clean interior lighting."
    )

def generate_photorealistic_interior(prompt: str, sketch_b64: str, is_floor_plan: bool = False) -> tuple[str, str]:
    colab_url = os.getenv("COLAB_BRIDGE_URL", "").strip().rstrip("/")
    
    # 1. Primary: Google Colab ControlNet
    if colab_url:
        try:
            print(f"[Engine] Triggering Colab ControlNet at: {colab_url}/api/generate (is_floor_plan={is_floor_plan})")
            payload = {
                "image_base64": sketch_b64,
                "prompt": prompt[:400],
                "is_refinement": False,
                "strength": 1.0,
                "is_floor_plan": is_floor_plan,  # Sent to trigger Path A on Colab
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
                    print("[Engine] SUCCESS: Generated via Google Colab ControlNet!")
                    return img, "colab_controlnet"
            else:
                print(f"[Engine] Colab rejected with {res.status_code}: {res.text[:200]}")
        except Exception as e:
            print(f"[Engine] Colab call exception ({e}). Falling back to Pollinations...")

    # 2. Resilient Safety Fallback: Pollinations.ai (Free Default Model)
    try:
        print("[Engine] Calling Pollinations fallback...")
        safe_prompt = re.sub(r'[^a-zA-Z0-9\s,]', ' ', prompt)
        safe_prompt = " ".join(safe_prompt.split())[:250].strip()
        encoded = urllib.parse.quote(safe_prompt)
        
        # Free default endpoint: no model query param, no seed
        url = f"https://image.pollinations.ai/prompt/{encoded}?nologo=true"
        
        res = requests.get(url, timeout=35)
        if res.status_code == 200 and len(res.content) > 2000:
            b64_str = base64.b64encode(res.content).decode("utf-8")
            print("[Engine] Generated via Pollinations fallback.")
            return f"data:image/jpeg;base64,{b64_str}", "pollinations_default"
        else:
            print(f"[Engine] Pollinations returned status: {res.status_code}")
    except Exception as e:
        print(f"[Engine] Pollinations fallback error: {e}")

    raise HTTPException(status_code=500, detail="Failed to synthesize render from both engines. Please try again.")

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SketchSpace Core Engine"}

@app.post("/api/generate", response_model=GenerateResponse)
async def generate_interior(req: GenerateRequest):
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="Image data is required")

    sketch_bytes = clean_base64(req.image_base64)

    detected_anchors = []
    if req.preserve_layout:
        detected_anchors = analyze_layout_with_gemini(sketch_bytes)

    final_prompt = compile_spatial_prompt(
        room_type=req.room_type,
        style=req.style,
        user_prompt=req.prompt,
        anchors=detected_anchors,
        preserve_layout=req.preserve_layout,
        is_floor_plan=req.is_floor_plan,
    )

    img_b64, engine_used = generate_photorealistic_interior(
        prompt=final_prompt,
        sketch_b64=req.image_base64,
        is_floor_plan=req.is_floor_plan,
    )

    return GenerateResponse(
        status="success",
        detected_anchors=detected_anchors,
        rendered_image_base64=img_b64,
        generator_used=engine_used
    )