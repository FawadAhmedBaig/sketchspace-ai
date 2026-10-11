import { useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import SketchWorkspace from './components/SketchWorkspace';
import DemoGeneratePanel from './demo/DemoGeneratePanel';
import DesignAndRefineScreen from './components/design/DesignAndRefineScreen';

/**
 * Sketch page – the drawing / upload workspace with controls.
 * After generation, navigates to /refine with the result data.
 */
function SketchPage() {
  const workspaceRef = useRef(null);
  const navigate = useNavigate();

  const handleGenerationComplete = (result, { sketchDataUrl, room_type, style }) => {
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

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-teal text-white">
          <Sparkles size={20} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold leading-tight">SketchSpace AI</h1>
          <p className="text-sm text-stone-500">Sketch a room. Let AI design it.</p>
        </div>
      </header>

      <SketchWorkspace ref={workspaceRef}>
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
 * Receives generated image data via route state.
 */
function RefinePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // If no state (direct navigation), redirect back to workspace
  if (!state.generatedImage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-cream">
        <div className="text-center space-y-4 p-8">
          <p className="text-lg font-semibold text-brand-charcoal">No design to refine yet.</p>
          <p className="text-sm text-stone-500">Generate a design from your sketch first.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-teal px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-teal-dark transition-all"
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
      initialOriginalImage={state.originalImage}
      initialGeneratedImage={state.generatedImage}
      initialRoomType={state.roomType}
      initialStyle={state.style}
      onBackToWorkspace={() => navigate('/')}
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
