import os
import base64
import urllib.parse
from io import BytesIO
from typing import List, Optional
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
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

# ----------------- Models ----------------- #

class GenerateRequest(BaseModel):
    image_base64: str
    room_type: str = "Bedroom"
    style: str = "Modern Japandi"
    prompt: Optional[str] = ""
    preserve_layout: bool = True

class GenerateResponse(BaseModel):
    status: str
    detected_anchors: List[str]
    rendered_image_base64: str

# ----------------- Helpers ----------------- #

def clean_base64(raw_b64: str) -> bytes:
    """Strips metadata prefix (data:image/png;base64,) and decodes."""
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",")[1]
    return base64.b64decode(raw_b64)

def analyze_layout_with_gemini(image_bytes: bytes) -> List[str]:
    """Vision pass using Gemini 3.8 Flash to extract spatial room anchors."""
    prompt = """
    You are an architectural analysis engine. Analyze this rough room layout sketch.
    Identify the relative spatial locations of key elements:
    - Walls, doors, windows
    - Core furniture (bed, desk, couch, wardrobe, etc.)
    
    Return a concise, bulleted list of detected items and their spatial positions
    (e.g., 'Bed along left wall', 'Window on center back wall', 'Door in bottom right').
    Provide ONLY the bullet points, no commentary.
    """
    try:
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=[
                types.Part.from_bytes(data=image_bytes, mime_type="image/png"),
                prompt
            ]
        )
        text = response.text or ""
        lines = [line.strip().lstrip("-*• ").strip() for line in text.split("\n") if line.strip()]
        return lines if lines else ["Layout detected: Standard perspective room"]
    except Exception as e:
        print(f"Vision analysis fallback error: {e}")
        return ["Layout detected: Standard spatial constraints applied"]

def compile_spatial_prompt(room_type: str, style: str, user_prompt: str, anchors: List[str], preserve_layout: bool) -> str:
    spatial_rules = ""
    if preserve_layout and anchors:
        rules_list = ", ".join(anchors)
        spatial_rules = f"Architectural layout constraints: {rules_list}. "

    details = user_prompt if user_prompt else "balanced natural ambient lighting, organic materials"
    return (
        f"Ultra-photorealistic 8k architectural photograph of a high-end {style} {room_type}. "
        f"{spatial_rules}"
        f"Details: {details}. "
        f"Interior design photography, daylight streaming in, sharp focus, magazine quality. "
        f"No drawing, no sketch lines, no blueprints."
    )

def generate_photorealistic_interior(prompt: str) -> str:
    """Free instant diffusion generator for hackathon velocity."""
    encoded_prompt = urllib.parse.quote(prompt[:1000])
    # Flux model with photorealistic seed and 4:3 ratio
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=768&model=flux&nologo=true"
    
    res = requests.get(url, timeout=30)
    if res.status_code != 200:
        raise HTTPException(status_code=500, detail="Failed to synthesize render")
        
    b64_str = base64.b64encode(res.content).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_str}"

# ----------------- Routes ----------------- #

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SketchSpace Core Engine"}

@app.post("/api/generate", response_model=GenerateResponse)
async def generate_interior(req: GenerateRequest):
    try:
        if not req.image_base64:
            raise HTTPException(status_code=400, detail="Image data is required")

        sketch_bytes = clean_base64(req.image_base64)

        # 1. Vision extraction pass via Gemini Flash
        detected_anchors = []
        if req.preserve_layout:
            detected_anchors = analyze_layout_with_gemini(sketch_bytes)

        # 2. Compile spatial constraint prompt
        final_prompt = compile_spatial_prompt(
            room_type=req.room_type,
            style=req.style,
            user_prompt=req.prompt,
            anchors=detected_anchors,
            preserve_layout=req.preserve_layout
        )

        # 3. Generate photorealistic render using Pollinations Flux engine
        img_b64 = generate_photorealistic_interior(final_prompt)

        return GenerateResponse(
            status="success",
            detected_anchors=detected_anchors,
            rendered_image_base64=img_b64
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))