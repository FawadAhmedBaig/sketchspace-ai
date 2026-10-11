# SketchSpace AI — Frontend Web Application

The interactive client interface for **SketchSpace AI**, built with **React 18**, **Vite 5**, **Tailwind CSS**, and **Lucide Icons**. It provides a real-time sketching canvas, blueprint upload suite, before/after comparison slider, and an interactive refinement studio.

---

## Features

- **Interactive Drawing Canvas**: Custom zero-dependency HTML5 canvas supporting freehand drawing, dynamic stroke sizing, eraser, multi-level undo, and touch/stylus inputs.
- **Architectural Presets**: Instant starter templates (Japandi Bedroom, Nordic Living Room, Industrial Kitchen, Modern Studio Loft) for quick demonstrations.
- **Blueprint & Sketch Upload**: File dropzone supporting PNG, JPEG, and WebP floor plans with validation and preview.
- **Interactive Before/After Slider**: Split-screen comparative viewer with mouse and touch dragging to visually inspect how the AI maintained structural boundaries.
- **Conversational Refinement Dock**: Iteratively refine designs through natural language commands (e.g. *"add a floor lamp beside the sofa"*, *"switch to walnut wood floors"*).
- **Session Persistence**: Stores canvas sketches, rendered outputs, and refinement history in `localStorage` so work is preserved across browser refreshes.

---

## Directory & File Overview

```
client/
├── src/
│   ├── components/
│   │   ├── comparison/
│   │   │   └── BeforeAfterSlider.jsx       # Interactive split-screen comparative slider
│   │   ├── design/
│   │   │   ├── DesignAndRefineScreen.jsx   # Primary view for /refine screen
│   │   │   └── DesignControls.jsx          # Room type and style badge chips
│   │   ├── feedback/
│   │   │   ├── ErrorMessage.jsx            # Formatted error banner with retry
│   │   │   └── LoadingIndicator.jsx        # Animated generation status spinner
│   │   ├── layout/
│   │   │   └── AppHeader.jsx               # Top navigation bar with back/new actions
│   │   ├── refinement/
│   │   │   └── RefinementPanel.jsx         # Chat dock for iterative prompt edits
│   │   ├── CanvasToolbar.jsx               # Brush/eraser mode and stroke thickness
│   │   ├── DrawingCanvas.jsx               # HTML5 2D canvas drawing engine
│   │   ├── ImageUploader.jsx               # Blueprint/sketch file upload dropzone
│   │   ├── PresetPicker.jsx                # One-click architectural layout presets
│   │   └── SketchWorkspace.jsx             # Tabs wrapper combining Canvas & Uploader
│   ├── demo/
│   │   └── DemoGeneratePanel.jsx           # Generation controls panel on the main workspace
│   ├── hooks/
│   │   ├── useDesignWorkflow.js            # Combined workflow hook for generation + refinement
│   │   └── useGenerateDesign.js            # Single generation lifecycle hook
│   ├── lib/
│   │   ├── api.js                          # Base API client and health checker
│   │   ├── designApi.js                    # Endpoints for generate, refine, and presets
│   │   ├── exportImage.js                  # Canvas data URL compilation & resizing
│   │   ├── presets.js                      # Client-side preset definitions
│   │   └── upload.js                       # Image file validation & base64 conversion
│   ├── services/
│   │   └── designApi.js                    # Alternate service wrapper
│   ├── utils/
│   │   ├── imageUtils.js                   # Client-side image formatting utilities
│   │   └── persistence.js                  # LocalStorage state management
│   ├── App.jsx                             # Application router (/ and /refine)
│   ├── index.css                           # Global Tailwind styles & font imports
│   └── main.jsx                            # React root mount
├── .env.example                            # Frontend environment configuration template
├── package.json                            # Scripts & dependencies
├── tailwind.config.js                      # Tailwind styling configuration
└── vite.config.js                          # Vite bundler configuration
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation

```bash
# Navigate to the client directory
cd client

# Install dependencies
npm install
```

### 3. Configure Environment

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

Set the backend API URL in `.env`:
```env
# For local FastAPI backend:
VITE_API_URL=http://localhost:8000

# For deployed cloud backend (e.g., Render):
# VITE_API_URL=https://sketchspace-ai.onrender.com
```

> **Note**: Vite injects `VITE_API_URL` at build/bundle time. If you modify `.env`, restart the development server.

### 4. Running the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts Vite dev server with Hot Module Replacement (HMR) at port 5173 |
| `npm run build` | Builds optimized production bundle into the `dist/` directory |
| `npm run preview` | Locally serves the production build for testing |

---

## Application Routes

- **`/` (Workspace Page)**:
  - Freehand sketch canvas or file uploader.
  - Room type selection (`Bedroom`, `Living Room`, `Kitchen`, `Bathroom`, `Studio`, `Dining Room`, `Office`).
  - Style selection (`Modern Japandi`, `Minimalist Scandinavian`, `Industrial Modern`, `Contemporary Luxury`, `Mid-Century Modern`, `Bohemian Chic`, `Warm Minimalist`, `Biophilic Modern`).
  - Layout preservation toggle.
  - "Generate Interior" action that navigates to the refinement suite upon completion.

- **`/refine` (Refinement Studio)**:
  - Interactive Before & After comparison slider with persistent original sketch and AI render.
  - Visual display of Gemini-detected spatial anchors.
  - Conversational refinement chat interface with prompt suggestion pills.
  - Full-resolution image download and "New Project" reset button.
