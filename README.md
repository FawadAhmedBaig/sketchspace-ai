# 🎨 SketchSpace AI

> **AI-Powered Interior Designer** — Transform rough room sketches and architectural floor plans into photorealistic interior renders while strictly preserving spatial layout and structural boundaries. Built for **BananaHacks**.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![ControlNet](https://img.shields.io/badge/ControlNet-Stable_Diffusion-FFA500?logo=stabilityai&logoColor=white)](https://github.com/lllyasviel/ControlNet)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🌟 Overview

Architects and interior designers spend hours converting rough floor plans and client sketches into 3D renders. Generic generative AI tools frequently ignore room dimensions, hallucinatory walls appear, and key furniture placements are lost.

**SketchSpace AI** solves this problem by combining **spatial layout analysis** with **depth and boundary-guided image synthesis**:
1. **Draw or Upload**: Sketch a room in the zero-dependency HTML5 canvas or upload a blueprint (PNG, JPEG, WebP).
2. **Spatial Layout Analysis**: Google Gemini Vision parses the sketch to extract structural anchors (walls, doors, windows, furniture placement).
3. **Photorealistic Synthesis**: The prompt and structural conditions are rendered into a magazine-quality interior photograph via ControlNet running on a Google Colab GPU bridge (with automated failover to Pollinations.ai and local cache).
4. **Compare & Refine**: Inspect layout fidelity side-by-side using an interactive Before/After comparison slider, then refine details conversationally (*"change the wall color to warm greige"*, *"add an olive tree in the corner"*).

---

## 🏗️ System Architecture

```
                                      ┌─────────────────────────────────┐
                                      │        React 18 Frontend        │
                                      │           (Vite + CSS)          │
                                      └────────────────┬────────────────┘
                                                       │
                                                       │ HTTP / JSON
                                                       ▼
                                      ┌─────────────────────────────────┐
                                      │         FastAPI Backend         │
                                      │           (Port 8000)           │
                                      └───────┬─────────────────┬───────┘
                                              │                 │
                         ┌────────────────────┘                 └──────────────────┐
                         ▼                                                         ▼
         ┌───────────────────────────────┐                         ┌───────────────────────────────┐
         │     Google Gemini Vision      │                         │       3-Tier Synthesis        │
         │       (gemini-2.5-flash)      │                         │            Pipeline           │
         │  Detects architectural walls, │                         └───────────────┬───────────────┘
         │  windows, doors & core anchors│                                         │
         └───────────────────────────────┘                   ┌─────────────────────┼─────────────────────┐
                                                             ▼                     ▼                     ▼
                                                     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
                                                     │    Tier 1     │     │    Tier 2     │     │    Tier 3     │
                                                     │ Colab Bridge  │     │ Pollinations  │     │  Local Cache  │
                                                     │ (ControlNet)  │     │  Failover     │     │  & Echo Fall  │
                                                     └───────────────┘     └───────────────┘     └───────────────┘
```

---

## ✨ Key Features

- **🖌️ Freehand Drawing Workspace**: Zero-dependency HTML5 canvas with variable brush thickness, eraser, multi-step undo, and touch/stylus support.
- **📐 Architectural Preset Blueprints**: One-click starter layouts (Japandi Bedroom, Nordic Living Room, Industrial Kitchen, Modern Studio Loft).
- **📂 Blueprint File Upload**: Drag-and-drop support for existing 2D layouts and architectural drawings.
- **👁️ Spatial Anchor Detection**: Powered by `gemini-2.5-flash` to extract precise room geometry and prevent layout hallucination.
- **🔄 Interactive Before / After Split Slider**: Smooth, responsive comparison slider with touch and mouse dragging to visually verify structural fidelity.
- **💬 Conversational Iterative Refinement**: Natural-language feedback loop with automated attention prompt re-weighting (`(item:1.3)`) to modify decor without altering structural walls.
- **💾 State Persistence**: Automatically preserves active sketches, renders, and refinement history in `localStorage` across page reloads.
- **🛡️ Bulletproof Failover Pipeline**: Colab ControlNet GPU bridge automatically falls back to Pollinations.ai and local cached assets to guarantee zero demo downtime.

---

## 📁 Repository Structure

```
sketchspace-ai/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── components/         # Canvas, Toolbar, Uploader, Presets, Slider, Refine Dock
│   │   ├── hooks/              # Workflow and generation hooks
│   │   ├── lib/                # API client and export utilities
│   │   ├── utils/              # Persistence and image formatting
│   │   ├── App.jsx             # Route definitions (/ and /refine)
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md               # Detailed frontend documentation
│
├── server/                     # Backend FastAPI application
│   ├── routes/
│   │   ├── presets.py          # GET /api/presets
│   │   └── refine.py           # POST /api/refine
│   ├── services/
│   │   └── image_processor.py  # ControlNet bridge, prompt re-weighting & failover
│   ├── .env.example
│   ├── main.py                 # FastAPI app entry point & /api/generate
│   ├── requirements.txt
│   └── README.md               # Detailed backend documentation
│
└── README.md                   # Project overview and quick start guide
```

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/FawadAhmedBaig/sketchspace-ai.git
cd sketchspace-ai
```

---

### 2. Backend Setup (`/server`)

1. Open a terminal and navigate to `server/`:
   ```bash
   cd server
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=8000
   ```
5. Start the backend:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The backend will be running at [http://localhost:8000](http://localhost:8000).

---

### 3. Frontend Setup (`/client`)

1. Open a second terminal and navigate to `client/`:
   ```bash
   cd client
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Configure your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Ensure it points to your local backend:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint returning backend status |
| `POST` | `/api/generate` | Analyzes sketch with Gemini & generates interior render |
| `POST` | `/api/refine` | Iterative img2img refinement with prompt weighting |
| `GET` | `/api/presets` | Starter blueprint and sketch layout templates |

Interactive API documentation is accessible at [http://localhost:8000/docs](http://localhost:8000/docs) when the server is running.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide React, HTML5 Canvas API
- **Backend**: FastAPI, Uvicorn, Pydantic v2, Google GenAI SDK (`google-genai`), Pillow, Requests
- **AI Models & Pipeline**:
  - `gemini-2.5-flash` for multimodal spatial layout reasoning
  - Stable Diffusion + ControlNet for depth/edge-conditioned synthesis
  - Pollinations.ai for zero-config fallback generation
- **Deployment**: Render / Railway (Backend) & Vercel / Netlify (Frontend)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
