import base64
from pathlib import Path

from fastapi import APIRouter

router = APIRouter()

PRESETS_DIR = Path(__file__).resolve().parent.parent / "static" / "presets"

# Starter templates so judges can test without sketching.
PRESETS = [
    {
        "id": "japandi-bedroom",
        "name": "Japandi Bedroom",
        "room_type": "Bedroom",
        "style": "Japandi",
        "default_prompt": "serene japandi bedroom, warm oak flooring, soft daylight, photorealistic",
        "sketch_file": "japandi-bedroom.png",
    },
    {
        "id": "nordic-living-room",
        "name": "Nordic Living Room",
        "room_type": "Living Room",
        "style": "Nordic",
        "default_prompt": "bright nordic living room, minimal furniture, natural light, photorealistic",
        "sketch_file": "nordic-living-room.png",
    },
    {
        "id": "industrial-kitchen",
        "name": "Industrial Kitchen",
        "room_type": "Kitchen",
        "style": "Industrial",
        "default_prompt": "industrial kitchen, dark metal fixtures, warm Edison lighting, photorealistic",
        "sketch_file": "industrial-kitchen.png",
    },
    {
        "id": "modern-studio-loft",
        "name": "Modern Studio Loft",
        "room_type": "Studio",
        "style": "Modern",
        "default_prompt": "modern studio loft, open plan, floor-to-ceiling windows, photorealistic",
        "sketch_file": "modern-studio-loft.png",
    },
]


@router.get("/api/presets")
def list_presets():
    presets = []
    for p in PRESETS:
        sketch_b64 = None
        sketch_path = PRESETS_DIR / p["sketch_file"]
        if sketch_path.exists():
            sketch_b64 = "data:image/png;base64," + base64.b64encode(sketch_path.read_bytes()).decode()
        presets.append(
            {
                "id": p["id"],
                "name": p["name"],
                "room_type": p["room_type"],
                "style": p["style"],
                "default_prompt": p["default_prompt"],
                # null until the team drops sketch PNGs into server/static/presets/
                "sketch_base64": sketch_b64,
            }
        )
    return {"status": "success", "presets": presets}
