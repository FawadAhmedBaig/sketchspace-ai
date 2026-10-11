import { useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, RotateCcw } from 'lucide-react';
import SketchWorkspace from './components/SketchWorkspace';
import DemoGeneratePanel from './demo/DemoGeneratePanel';
import DesignAndRefineScreen from './components/design/DesignAndRefineScreen';
import {
  getCanvasSketch,
  getLatestRender,
  getDesignMeta,
  saveCanvasSketch,
  saveLatestRender,
  saveDesignMeta,
  saveRefinementHistory,
  clearSketchSpaceStorage,
} from './utils/persistence';

/**
 * Sketch page – the drawing / upload workspace with controls.
 * After generation, navigates to /refine with the result data.
 */
function SketchPage() {
  const workspaceRef = useRef(null);
  const navigate = useNavigate();

  const handleGenerationComplete = (result, { sketchDataUrl, room_type, style, prompt }) => {
    // Persist all generated and input assets to localStorage
    if (sketchDataUrl) saveCanvasSketch(sketchDataUrl);
    if (result.imageDataUrl) saveLatestRender(result.imageDataUrl);
    saveDesignMeta({
      roomType: room_type,
      room_type,
      style,
      prompt,
      anchors: result.anchors,
    });
    saveRefinementHistory([
      {
        type: 'initial',
        instruction: 'Initial design generated from sketch',
        image: result.imageDataUrl,
        timestamp: Date.now(),
      },
    ]);

    navigate('/refine', {
      state: {
        generatedImage: result.imageDataUrl,
        originalImage: sketchDataUrl,
        anchors: result.anchors,
        roomType: room_type,
        style,
      },
    });
  };

  const handleResetCanvas = () => {
    if (workspaceRef.current?.clearCanvas) {
      workspaceRef.current.clearCanvas();
    } else {
      clearSketchSpaceStorage();
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-teal text-white shadow-sm">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-tight">SketchSpace AI</h1>
            <p className="text-sm text-stone-500">Sketch a room. Let AI design it.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetCanvas}
          className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50/50 transition shadow-xs cursor-pointer"
          title="Clear canvas and reset project"
        >
          <RotateCcw size={14} aria-hidden="true" />
          <span>Reset Canvas</span>
        </button>
      </header>

      <SketchWorkspace ref={workspaceRef} onReset={() => clearSketchSpaceStorage()}>
        {({ canExport, getImage }) => (
          <DemoGeneratePanel
            canExport={canExport}
            getImage={getImage}
            onGenerationComplete={handleGenerationComplete}
          />
        )}
      </SketchWorkspace>
    </div>
  );
}

/**
 * Refine page – wraps DesignAndRefineScreen.
 * Receives generated image data via route state or restores from localStorage.
 */
function RefinePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // Check route state first; fallback to persistent localStorage
  const savedRender = getLatestRender();
  const savedSketch = getCanvasSketch();
  const savedMeta = getDesignMeta() || {};

  // Prioritize latest generated render from localStorage over initial route state
  const generatedImage = savedRender || state.generatedImage;
  const originalImage = savedSketch || state.originalImage;
  const roomType = state.roomType || savedMeta.roomType || savedMeta.room_type || 'Bedroom';
  const style = state.style || savedMeta.style || 'Modern Japandi';

  // If no generated image in state or localStorage, show placeholder
  if (!generatedImage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="text-center space-y-4 p-8">
          <p className="text-lg font-semibold text-brand-charcoal">No design to refine yet.</p>
          <p className="text-sm text-stone-500">Generate a design from your sketch first.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-teal-dark transition-all cursor-pointer"
          >
            <Sparkles size={16} aria-hidden="true" />
            Back to Workspace
          </button>
        </div>
      </div>
    );
  }

  return (
    <DesignAndRefineScreen
      initialOriginalImage={originalImage}
      initialGeneratedImage={generatedImage}
      initialRoomType={roomType}
      initialStyle={style}
      onBackToWorkspace={() => navigate('/')}
      onNewProject={() => {
        clearSketchSpaceStorage();
        navigate('/');
      }}
    />
  );
}

/**
 * App root — sets up BrowserRouter with two routes.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SketchPage />} />
        <Route path="/refine" element={<RefinePage />} />
      </Routes>
    </BrowserRouter>
  );
}
