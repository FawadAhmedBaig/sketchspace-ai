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
    strength: Optional[float] = 0.40
    is_floor_plan: Optional[bool] = False


def _build_refine_prompt(instruction: str, room_type: str, style: str, is_floor_plan: bool) -> str:
    # Wrap new item with lexical weight to ensure it synthesizes
    emphasized_instruction = f"({instruction.strip()}:1.3)"

    if is_floor_plan:
        return (
            f"3D top-down isometric architectural floor plan render of a {style} {room_type}. "
            f"Add or modify: {emphasized_instruction}. "
            f"Keep exact room perimeter, floor layout and architectural structure. "
            f"Furnished axonometric cutaway, natural lighting, high fidelity, 8k resolution."
        )

    return (
        f"Ultra-photorealistic 8k architectural photograph of a high-end {style} {room_type}. "
        f"Add or modify: {emphasized_instruction}. "
        f"Keep the same camera angle, room layout, and existing furniture geometry. "
        f"Interior photography, natural sunlight, crisp surfaces, magazine quality."
    )


@router.post("/api/refine")
def refine(req: RefineRequest):
    print(f"[Refine Route] Received previous image. Length: {len(req.previous_image_base64)}")
    print(f"[Refine Route] Received instruction: {req.instruction[:100]} | is_floor_plan: {req.is_floor_plan}")

    # Build the weighted refinement prompt
    prompt = _build_refine_prompt(
        instruction=req.instruction,
        room_type=req.room_type or "Bedroom",
        style=req.style or "Modern",
        is_floor_plan=req.is_floor_plan or False,
    )

    img, used_fallback = shielded_synthesize(
        prompt=prompt,
        previous_b64=req.previous_image_base64,
        is_refinement=True,
        strength=req.strength or 0.40,
        is_floor_plan=req.is_floor_plan or False,
    )

    return {
        "status": "success",
        "rendered_image_base64": img,
        "is_mock": used_fallback,
    }