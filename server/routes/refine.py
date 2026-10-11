from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel

from services.image_processor import shielded_synthesize

router = APIRouter()


class RefineRequest(BaseModel):
    previous_image_base64: str
    instruction: str
    room_type: Optional[str] = "Bedroom"
    style: Optional[str] = "Modern"


def _build_refine_prompt(instruction: str, room_type: str, style: str) -> str:
    return (
        f"Ultra-photorealistic 8k architectural photograph of a high-end {style} {room_type}. "
        f"Apply this change: {instruction}. "
        f"Keep the same camera angle, room layout and overall design; "
        f"change only what the instruction asks for. "
        f"Interior design photography, daylight streaming in, sharp focus, magazine quality. "
        f"No drawing, no sketch lines, no blueprints, no text."
    )


@router.post("/api/refine")
def refine(req: RefineRequest):
    print(f"[Refine] Received instruction: {req.instruction[:100]}")
    prompt = _build_refine_prompt(
        req.instruction,
        req.room_type or "Bedroom",
        req.style or "Modern",
    )
    img, used_fallback = shielded_synthesize(
        prompt=prompt, previous_b64=req.previous_image_base64
    )
    return {
        "status": "success",
        "rendered_image_base64": img,
        "is_mock": used_fallback,
    }

