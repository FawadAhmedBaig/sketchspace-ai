# SketchSpace AI — Backend Server

FastAPI-powered core synthesis and spatial analysis engine for **SketchSpace AI**. It transforms hand-drawn architectural floor plans and room sketches into photorealistic interior renders while preserving layout boundaries.

---

## Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │             FastAPI Backend             │
                      │               (Port 8000)               │
                      └────────────────────┬────────────────────┘
                                           │
                  ┌────────────────────────┴────────────────────────┐
                  ▼                                                 ▼
      ┌───────────────────────┐                         ┌───────────────────────┐
      │  Gemini Vision 2.5    │                         │  3-Tier Synthesis     │
      │  Spatial Analysis     │                         │  Image Pipeline       │
      │  (Anchor Detection)   │                         └───────────┬───────────┘
      └───────────────────────┘                                     │
                                         ┌──────────────────────────┼──────────────────────────┐
                                         ▼                          ▼                          ▼
                                 ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
                                 │    Tier 1     │          │    Tier 2     │          │    Tier 3     │
                                 │ Colab Bridge  │          │ Pollinations  │          │ Local Cache / │
                                 │  ControlNet   │          │   Fallback    │          │  Echo Fallback│
                                 └───────────────┘          └───────────────┘          └───────────────┘
```

1. **Spatial Anchor Analysis (`gemini-2.5-flash`)**: Extracts wall placements, windows, doors, and furniture coordinates from sketch base64 to ensure architectural fidelity.
2. **Multi-Tier Synthesis Engine**:
   - **Tier 1 (Colab ControlNet GPU Bridge)**: Routes image generation to a dedicated Stable Diffusion + ControlNet pipeline via ngrok. Supports both initial generation and iterative img2img refinements.
   - **Tier 2 (Pollinations.ai Fallback)**: Resilient cloud generation fallback when the Colab tunnel is inactive or offline.
   - **Tier 3 (Local Cache / Echo)**: Failsafe local rendering to guarantee zero downtime during live demonstrations.
3. **Conversational Refinement**: Parses natural language requests (e.g. *"add a fiddle leaf fig in the corner"*) and applies lexical attention re-weighting `(item:1.3)` to modify specific elements without shifting existing architectural structures.

---

## Directory Structure

```
server/
├── routes/
│   ├── presets.py            # GET /api/presets — Starter room sketches & blueprint templates
│   └── refine.py             # POST /api/refine — Iterative image-to-image refinement
├── services/
│   ├── image_processor.py    # 3-tier synthesis failover, prompt weighting & PIL conversion
│   └── __init__.py
├── static/
│   ├── cache/                # Cached render fallbacks (optional)
│   └── presets/              # Preset sketch images (optional)
├── .env.example              # Environment variables template
├── main.py                   # FastAPI application entry point & /api/generate
├── Procfile                  # Production deployment configuration (Render/Heroku)
├── requirements.txt          # Python dependencies
└── test_controlnet.py        # ControlNet connection test script

# Linked GPU Engine:
# notebooks/sketchspace_engine.ipynb provides the dedicated ControlNet diffusion bridge.
```

---

## Setup & Installation

### 1. Prerequisites
- Python 3.10+ (tested up to Python 3.14)
- A Google Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 2. Environment Setup

```bash
# Navigate to the server directory
cd server

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (Command Prompt):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy the example `.env` file and populate your keys:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Required: Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Port (default: 8000)
PORT=8000

# Optional: Hugging Face token
HF_TOKEN=your_huggingface_token_optional

# Optional: Google Colab ControlNet GPU Bridge (via ngrok)
COLAB_BRIDGE_URL=https://your-ngrok-tunnel-url.ngrok-free.dev
```

---

## Running the Server

### Development Mode (with hot-reload):
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:
- **Root / API**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Alternative ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## API Reference

### 1. Health Check
`GET /api/health`

**Response (`200 OK`)**:
```json
{
  "status": "ok",
  "service": "SketchSpace Core Engine"
}
```

---

### 2. Generate Initial Design
`POST /api/generate`

Synthesizes a photorealistic interior render from a sketch data URL or base64 string.

**Request Body (`application/json`)**:
```json
{
  "image_base64": "data:image/png;base64,...",
  "room_type": "Living Room",
  "style": "Modern Japandi",
  "prompt": "large windows, warm sunlight, light oak flooring",
  "preserve_layout": true,
  "is_floor_plan": false
}
```

**Response (`200 OK`)**:
```json
{
  "status": "success",
  "detected_anchors": [
    "Sofa positioned against left wall",
    "Coffee table centered in front of sofa",
    "Floor-to-ceiling window on rear wall"
  ],
  "rendered_image_base64": "data:image/jpeg;base64,...",
  "generator_used": "colab_controlnet"
}
```

---

### 3. Refine Design (Conversational Edits)
`POST /api/refine`

Applies an iterative conversational change to an existing render using image-to-image synthesis.

**Request Body (`application/json`)**:
```json
{
  "previous_image_base64": "data:image/jpeg;base64,...",
  "prompt": "add a large fiddle leaf fig plant in the right corner",
  "room_type": "Living Room",
  "style": "Modern Japandi",
  "strength": 0.40,
  "is_floor_plan": false
}
```

**Response (`200 OK`)**:
```json
{
  "status": "success",
  "rendered_image_base64": "data:image/jpeg;base64,...",
  "is_mock": false
}
```

---

### 4. Room Presets
`GET /api/presets`

Returns starter room sketches (Japandi Bedroom, Nordic Living Room, Industrial Kitchen, Modern Studio Loft).

**Response (`200 OK`)**:
```json
{
  "status": "success",
  "presets": [
    {
      "id": "japandi-bedroom",
      "name": "Japandi Bedroom",
      "room_type": "Bedroom",
      "style": "Japandi",
      "default_prompt": "serene japandi bedroom, warm oak flooring, soft daylight, photorealistic",
      "sketch_base64": null
    }
  ]
}
```

---

## Google Colab GPU Bridge (`notebooks/sketchspace_engine.ipynb`)

Tier 1 photorealistic rendering is powered by the Google Colab notebook located at [`notebooks/sketchspace_engine.ipynb`](../notebooks/sketchspace_engine.ipynb).

### How to Connect:
1. Open [`notebooks/sketchspace_engine.ipynb`](../notebooks/sketchspace_engine.ipynb) in **Google Colab** with a **GPU runtime** (T4 or higher).
2. Insert your free **ngrok authtoken** in the notebook cell.
3. Run all cells: the notebook loads **Realistic Vision V5.1**, **ControlNet Scribble**, and **FT-MSE VAE**, then launches an asynchronous FastAPI service tunneled through ngrok.
4. Copy the output URL:
   ```
   🎯 PUBLIC BRIDGE URL: https://your-ngrok-tunnel-url.ngrok-free.dev
   ```
5. Paste it into `server/.env`:
   ```env
   COLAB_BRIDGE_URL=https://your-ngrok-tunnel-url.ngrok-free.dev
   ```
6. The backend server automatically routes generation and refinement requests to this GPU bridge. If the tunnel is offline or not configured, the server automatically fails over to Tier 2 (Pollinations.ai) and Tier 3 (local caching).

---

## Deployment

The server includes a `Procfile` configured for containerized or PaaS hosting (Render, Railway, Heroku):

```procfile
web: uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

Ensure the following environment variables are set on your hosting platform:
- `GEMINI_API_KEY`
- `PORT` (assigned automatically by most platforms)
- `COLAB_BRIDGE_URL` (optional)
