import os
import base64
import re
from io import BytesIO
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is not set in environment or .env file")

client = genai.Client(api_key=api_key)

app = FastAPI(title="SketchSpace AI Engine", version="1.0.0")

# Enable CORS for local dev and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# ----------------- Helper Functions ----------------- #

def clean_base64(raw_b64: str) -> bytes:
    """Strip metadata header (data:image/png;base64,) and decode."""
    if "," in raw_b64:
        raw_b64 = raw_b64.split(",")[1]
    return base64.b64decode(raw_b64)

def analyze_layout_with_gemini(image_bytes: bytes) -> List[str]:
    """Vision pass to extract spatial coordinates from sketch."""
    pil_img = Image.open(BytesIO(image_bytes))
    
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
            model="gemini-2.5-flash",
            contents=[pil_img, prompt]
        )
        text = response.text or ""
        lines = [line.strip().lstrip("-*• ").strip() for line in text.split("\n") if line.strip()]
        return lines if lines else ["Layout detected: Standard perspective room"]
    except Exception as e:
        print(f"Vision analysis fallback: {e}")
        return ["Layout detected: Standard spatial constraints applied"]

def compile_spatial_prompt(room_type: str, style: str, user_prompt: str, anchors: List[str], preserve_layout: bool) -> str:
    spatial_rules = ""
    if preserve_layout and anchors:
        rules_list = "\n".join([f"- {a}" for a in anchors])
        spatial_rules = f"""
        CRITICAL ARCHITECTURAL CONSTRAINTS (PRESERVE EXACT POSITIONS):
        {rules_list}
        Do NOT mirror or reposition these elements. Respect the spatial boundaries from the sketch.
        """

    return f"""
    Create an ultra-photorealistic, high-end {style} {room_type} interior design photograph.
    {spatial_rules}
    Additional design details: {user_prompt if user_prompt else 'Balanced ambient lighting, natural materials, clean aesthetics'}.
    Styling: Architectural Digest style photography, 8k resolution, realistic daylight through windows, soft shadows.
    Strictly NO sketches, pencil strokes, blueprints, or split screens in the final output. Only the finished room.
    """.strip()

# ----------------- Endpoints ----------------- #

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SketchSpace Core Engine"}

@app.post("/api/generate", response_model=GenerateResponse)
async def generate_interior(req: GenerateRequest):
    try:
        if not req.image_base64:
            raise HTTPException(status_code=400, detail="Image data is required")

        # 1. Decode incoming sketch
        sketch_bytes = clean_base64(req.image_base64)

        # 2. Extract spatial anchors (Vision pass)
        detected_anchors = []
        if req.preserve_layout:
            detected_anchors = analyze_layout_with_gemini(sketch_bytes)

        # 3. Compile prompt
        final_prompt = compile_spatial_prompt(
            room_type=req.room_type,
            style=req.style,
            user_prompt=req.prompt,
            anchors=detected_anchors,
            preserve_layout=req.preserve_layout
        )

        # 4. Generate image using Gemini Image generation
        result = client.models.generate_images(
            model='gemini-2.5-flash-image',
            prompt=final_prompt,
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="4:3"
            )
        )

        output_bytes = result.generated_images[0].image.image_bytes
        output_b64 = base64.b64encode(output_bytes).decode("utf-8")

        return GenerateResponse(
            status="success",
            detected_anchors=detected_anchors,
            rendered_image_base64=f"data:image/png;base64,{output_b64}"
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in generate pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))