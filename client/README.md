# SketchSpace AI — Frontend (Canvas & Workspace + backend integration)

React 18 + Vite 5 + Tailwind 3 + lucide-react. Plain HTML5 Canvas, no drawing library.
In the shared repo this whole folder lives at **`/client`**.

## Setup
```bash
cp .env.example .env     # .env is gitignored in the shared repo; .env.example is committed
npm ci                   # uses package-lock.json
npm run dev              # http://localhost:5173
npm run build            # production build into dist/
```
`.env` (no secrets):
```
VITE_API_URL=https://sketchspace-ai.onrender.com
```
Vite bakes this in **at build time**: set `VITE_API_URL` in the hosting provider's build environment too, and restart `npm run dev` after editing `.env`. To use a local backend: `VITE_API_URL=http://localhost:8000`.

## Files
| Path | Purpose |
|---|---|
| `src/components/SketchWorkspace.jsx` | Workspace entry point: layout, Draw/Upload tabs, `getImage()` ref API, children slot |
| `src/components/DrawingCanvas.jsx`, `CanvasToolbar.jsx`, `ImageUploader.jsx`, `PresetPicker.jsx` | Canvas engine, tools, upload, presets (unchanged) |
| `src/lib/exportImage.js` | The single place that decides the `image_base64` format + `buildGeneratePayload` |
| `src/lib/api.js` | **New.** `checkHealth()`, `generateDesign()`, `ApiError`, reads `VITE_API_URL` |
| `src/hooks/useGenerateDesign.js` | **New.** `useGenerateDesign()` (loading / duplicate guard / errors / cancel) and `useBackendStatus()` |
| `src/demo/DemoGeneratePanel.jsx` | **New, throwaway.** Stand-in for Tayyab's selectors + results. Delete when his panel is ready |
| `src/App.jsx` | Demo parent (now renders the stand-in panel) |
| `.env`, `.env.example` | **New.** `VITE_API_URL` |

## Backend contract (confirmed from `server/main.py` on `feat/ai-core-pipeline`)
`GET /api/health` → `{ "status": "ok", "service": "SketchSpace Core Engine" }`

`POST /api/generate` (JSON)
```json
{ "image_base64": "data:image/png;base64,...", "room_type": "Bedroom", "style": "Modern Japandi",
  "prompt": "", "preserve_layout": true }
```
Success `200`:
```json
{ "status": "success", "detected_anchors": ["Bed along top wall", "..."],
  "rendered_image_base64": "data:image/jpeg;base64,..." }
```
Errors: `{ "detail": "<string>" }` (400/500) or `{ "detail": [{ "loc": [...], "msg": "...", "type": "..." }] }` (422). CORS is `allow_origins=["*"]`.

- `image_base64`: backend strips everything up to the first comma, so **both** a full data URL and raw Base64 work. We send the full data URL (one constant in `exportImage.js`).
- `room_type` / `style` are free text pasted into the prompt, so send readable labels ("Living Room", "Scandinavian"), not `living_room`. Backend defaults: `Bedroom` / `Modern Japandi`.
- The result is a full JPEG data URL and can be used directly as `<img src>`.

## Integration guide
**Tayyab** (controls/results): keep the hook, replace the markup.
```jsx
import { useGenerateDesign } from './hooks/useGenerateDesign';

const { status, result, error, isLoading, generate, cancel } = useGenerateDesign();

<SketchWorkspace ref={ref}>
  {({ canExport, getImage }) => (
    <button disabled={!canExport || isLoading}
            onClick={() => generate(getImage, { room_type, style, prompt, preserve_layout })}>
      Generate
    </button>
    // result.imageDataUrl -> <img src>, result.anchors -> string[], error.message -> show to the user
  )}
</SketchWorkspace>
```
`generate()` validates the image (empty canvas / no upload) and the required fields, ignores duplicate clicks while a request is in flight, aborts on unmount, and returns friendly error messages. A request can take up to ~60 s (Gemini + Pollinations) and Render may cold-start, so the client timeout is 120 s. Delete `src/demo/` and the import in `App.jsx` when done. Don't call `fetch` yourself: use `lib/api.js`.

**Fawad** (backend), things the frontend relies on or noticed:
1. Keep the response shape above; the client rejects anything without a non-empty `rendered_image_base64`.
2. Keep `/api/health` returning `{"status":"ok"}` (used for the status chip and to wake a sleeping Render instance).
3. `analyze_layout_with_gemini` always sends `mime_type="image/png"`, but uploaded JPEGs arrive as JPEG. Untested whether Gemini tolerates this; failures are swallowed and silently fall back to generic anchors, which weakens layout preservation. Consider detecting the format with PIL.
4. `generate_interior` is `async def` but makes blocking `requests`/Gemini calls, so one slow request blocks other requests. A plain `def` route (threadpool) avoids this.
5. Render free tier sleeps; the first call after idle may take ~50 s.

## Test status
See the hand-off notes: UI + client logic verified against Fawad's real `main.py` run locally with Gemini/Pollinations stubbed. **The live Render deployment was not reachable from the build sandbox and has not been tested.**

## Manual checklist (canvas, unchanged)
- [ ] Empty canvas: chip says "Draw or load a preset"; Generate disabled
- [ ] Brush, eraser, size slider, undo, clear-with-confirm all work; touch/stylus works on a real device
- [ ] Studio / Square Bedroom / Corner Office presets load instantly and are undoable
- [ ] Upload: PNG/JPEG/WebP accepted; GIF/PDF/>10 MB/corrupt rejected with a message; preview/replace/remove work
- [ ] Resize to ~390 px: layout stacks, strokes intact
- [ ] **Live:** server chip turns "Server online"; Generate returns an image; offline backend shows a readable error
