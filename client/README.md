# SketchSpace AI — Design & Refine Frontend

Interactive interior design refinement studio for **SketchSpace AI**, built with React 19, Vite, and Tailwind CSS.

---

## 🎨 Brand Identity

* **Deep Teal** (`#0F6B63`): Primary buttons, active navigation, key controls
* **Soft Aqua** (`#4FD1C5`): Accents, highlights, active glow, chip focus
* **Cream** (`#FAF9F6`): Main page background and canvas framing
* **Charcoal** (`#1F2937`): Primary typography and high-contrast labels

---

## 🏗️ Architecture & Component Hierarchy

```text
sketchspace-ai/
├── public/
│   └── demo/                     # High-res sample sketch & renders for local testing
│       ├── sketch-sample.png     # Architectural room sketch (isometric layout)
│       ├── rendered-sample.png   # Initial AI interior render (Japandi style)
│       └── refined-sample.png    # Refined AI render (warm lighting + extra plants)
├── src/
│   ├── components/
│   │   ├── comparison/
│   │   │   └── BeforeAfterSlider.jsx    # Visual centerpiece: draggable split-view
│   │   ├── design/
│   │   │   ├── DesignAndRefineScreen.jsx # Primary feature screen container
│   │   │   └── DesignControls.jsx       # Room type, style, layout lock & presets
│   │   ├── feedback/
│   │   │   ├── ErrorMessage.jsx         # Non-destructive error banner with Retry
│   │   │   └── LoadingIndicator.jsx     # Brand-themed pulsing spinner & progress
│   │   ├── layout/
│   │   │   └── AppHeader.jsx            # Brand header, mode toggle & Download button
│   │   └── refinement/
│   │       └── RefinementPanel.jsx      # Multiline prompt & 5 quick suggestion chips
│   ├── hooks/
│   │   └── useDesignWorkflow.js         # Centralized state management & async actions
│   ├── services/
│   │   └── designApi.js                 # FastAPI endpoints (generate, refine, export)
│   ├── utils/
│   │   └── imageUtils.js                # Base64 normalization & HTML5 Canvas PNG exporter
│   ├── App.jsx                          # Root component with mock workspace transition
│   ├── index.css                        # Tailwind CSS v4 tokens & Plus Jakarta Sans
│   └── main.jsx                         # React 19 DOM root mount
├── .env                                 # Local configuration (VITE_API_BASE_URL)
├── .env.example                         # Environment configuration template
└── package.json
```

---

## 🚀 Running the Project

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🔌 Backend Integration Contract (Fawad & Shahbaz)

The app connects to the FastAPI backend configured in `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_FORCE_DEMO_MODE=false
```

### 1. Generate Design (`POST /api/generate`)
* **Request:**
  ```json
  {
    "image_base64": "<base64>",
    "room_type": "Living Room",
    "style": "Modern",
    "prompt": "Add warm lighting",
    "preserve_layout": true
  }
  ```
* **Response:**
  ```json
  {
    "status": "success",
    "detected_anchors": [],
    "rendered_image_base64": "<base64>"
  }
  ```

### 2. Refine Design (`POST /api/refine`)
* **Request:**
  ```json
  {
    "previous_image_base64": "<base64>",
    "instruction": "Make the rug cream"
  }
  ```
* **Response:**
  ```json
  {
    "status": "success",
    "rendered_image_base64": "<base64>"
  }
  ```

### 3. Export Comparison (`POST /api/export`)
* **Request:**
  ```json
  {
    "sketch_image_base64": "<base64>",
    "rendered_image_base64": "<base64>"
  }
  ```
* **Response:**
  ```json
  {
    "status": "success",
    "export_card_base64": "<base64>"
  }
  ```

---

## 🤝 Teammate Integration: Rahma's Canvas

To integrate this screen into Rahma's workspace, simply import and render `DesignAndRefineScreen`:

```jsx
import DesignAndRefineScreen from './components/design/DesignAndRefineScreen';

function MainApp() {
  // Pass canvas sketch data URL directly
  return (
    <DesignAndRefineScreen
      initialOriginalImage={canvasDataUrl}
      onBackToWorkspace={() => setView('canvas')}
    />
  );
}
```
