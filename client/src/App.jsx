import { useRef, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import SketchWorkspace from './components/SketchWorkspace';
import DesignAndRefineScreen from './components/design/DesignAndRefineScreen';

export default function App() {
  const workspaceRef = useRef(null);
  const [currentView, setCurrentView] = useState('workspace'); // 'workspace' | 'design-refine'
  const [sketchImage, setSketchImage] = useState(null);

  const handleProceedToDesign = (getImage) => {
    try {
      const imageData = getImage ? getImage() : null;
      if (imageData) {
        setSketchImage(imageData);
      }
    } catch (err) {
      console.warn('Could not extract image from canvas, proceeding with fallback:', err);
    }
    setCurrentView('design-refine');
  };

  if (currentView === 'design-refine') {
    return (
      <DesignAndRefineScreen
        initialSketchImage={sketchImage}
        onBackToWorkspace={() => setCurrentView('workspace')}
      />
    );
  }

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
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={!canExport}
              onClick={() => handleProceedToDesign(getImage)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0F6B63] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0b544e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Design & Refine</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </SketchWorkspace>
    </div>
  );
}