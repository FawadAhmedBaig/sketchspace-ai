# 🚀 SketchSpace AI — Colab GPU ControlNet Engine

This directory contains the Google Colab GPU notebook (`sketchspace_engine.ipynb`) that powers the **Tier 1 photorealistic diffusion and ControlNet synthesis engine** for SketchSpace AI.

---

## 📌 Overview

The notebook runs a high-performance **ControlNet + Realistic Vision V5.1** pipeline on a free or paid Google Colab GPU (e.g. T4 or A100), and tunnels an asynchronous FastAPI microservice to the public internet using **ngrok**. 

The main backend server (`server/`) connects to this bridge via the `COLAB_BRIDGE_URL` environment variable.

```
┌───────────────────────┐         HTTP (ngrok)         ┌─────────────────────────────────────┐
│  SketchSpace Backend  │ ───────────────────────────> │        Google Colab GPU Engine      │
│     (server/main.py)  │ <─────────────────────────── │     (sketchspace_engine.ipynb)      │
└───────────────────────┘                              └──────────────────┬──────────────────┘
                                                                          │
                                       ┌──────────────────────────────────┴──────────────────────────────────┐
                                       ▼                                                                     ▼
                        ┌──────────────────────────────┐                                      ┌──────────────────────────────┐
                        │   Path 1: Fresh Synthesis    │                                      │   Path 2: Img2Img Refine     │
                        │ • ControlNet Scribble        │                                      │ • Shared-Weight Img2Img      │
                        │ • Realistic Vision V5.1      │                                      │ • Strict strength calibration│
                        │ • Conditioning scale: 0.88   │                                      │   (0.35 - 0.48) to keep walls│
                        │ • Isometric & interior models│                                      │ • Spatial attention weights  │
                        └──────────────────────────────┘                                      └──────────────────────────────┘
```

---

## 🧠 Model Pipeline & Stack

The notebook loads and caches the following specialized weights in GPU memory (`cuda` with `float16` precision):

1. **Precision VAE (`stabilityai/sd-vae-ft-mse`)**: Eliminates grayish haze and enhances lighting, contrast, and color fidelity.
2. **ControlNet Scribble (`lllyasviel/sd-controlnet-scribble`)**: Interprets 2D floor plan outlines and sketches into strict structural boundary constraints (conditioning scale `0.88`).
3. **Diffusion Checkpoint (`SG161222/Realistic_Vision_V5.1_noVAE`)**: Tuned for high-end photorealistic interior architecture and 3D axonometric cutaway renders.
4. **Shared-Weight Img2Img Pipeline**: Reuses loaded UNet and VAE weights to enable rapid iterative refinements without layout shifts.
5. **Scheduler**: `UniPCMultistepScheduler` for high-quality convergence in 25 inference steps.

---

## 🛠️ Step-by-Step Setup Guide

### 1. Upload to Google Colab
1. Navigate to [Google Colab](https://colab.research.google.com/).
2. Select **Upload** and upload `notebooks/sketchspace_engine.ipynb` (or open it directly from GitHub).
3. In Colab, navigate to **Runtime** → **Change runtime type** and select **T4 GPU** (or any available GPU accelerator).

### 2. Configure ngrok Authentication
1. Sign up for a free account at [ngrok.com](https://ngrok.com/).
2. Copy your **ngrok authtoken** from your ngrok dashboard.
3. In Cell 2 of the notebook, replace:
   ```python
   NGROK_AUTH_TOKEN = os.getenv("NGROK_AUTH_TOKEN", "YOUR_NGROK_AUTH_TOKEN_HERE")
   ```
   with your token, or set it via Colab Secrets (`NGROK_AUTH_TOKEN`).

### 3. Run the Notebook
- Run **Cell 1**: Installs dependencies (`pyngrok`, `diffusers`, `transformers`, `accelerate`, `fastapi`, `uvicorn`, `pydantic`, `pillow`).
- Run **Cell 2**: Downloads the models, starts the FastAPI server on port 8000, and opens an ngrok public tunnel.
- Look for the console banner:
  ```
  ==========================================
  🎯 PUBLIC BRIDGE URL: https://xxxx-xx-xx.ngrok-free.dev
  ==========================================
  ```

### 4. Link with the SketchSpace Backend
1. Copy the printed `https://xxxx-xx-xx.ngrok-free.dev` URL.
2. In your local `server/.env`, set:
   ```env
   COLAB_BRIDGE_URL=https://xxxx-xx-xx.ngrok-free.dev
   ```
3. Restart or hot-reload your local FastAPI server (`uvicorn main:app --reload --port 8000`).
4. Requests from the web client will now generate high-fidelity photorealistic renders through your Colab GPU!

---

## 🔄 Automatic Failover

If the Colab runtime disconnects, runs out of compute units, or the bridge URL is not configured:
- The backend seamlessly falls back to **Tier 2 (Pollinations.ai)** or **Tier 3 (Local Caching)**.
- The web application continues to function without crashes or interruption.

---

## 📡 Bridge API Contract

### Health Check
`GET /api/health`
- **Response**: `{"status": "ok", "gpu": true}`

### Generation & Refinement Endpoint
`POST /api/generate`
- **Payload**:
  ```json
  {
    "image_base64": "data:image/png;base64,...",
    "prompt": "modern luxury bedroom, wooden flooring, clean architecture",
    "negative_prompt": "ugly, distorted, blurry, low quality",
    "guidance_scale": 6.5,
    "num_inference_steps": 25,
    "strength": 0.40,
    "is_refinement": false
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "image_base64": "data:image/jpeg;base64,...",
    "image_url": "data:image/jpeg;base64,..."
  }
  ```
