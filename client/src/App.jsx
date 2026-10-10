import { useRef, useState } from 'react';
import { Sparkles, SlidersHorizontal } from 'lucide-react';
import SketchWorkspace from './components/SketchWorkspace';
import { DesignAndRefineScreen, RefinedGeneratePanel } from './components/refinement';

export default function App() {
  const workspaceRef = useRef(null);
  const [view, setView] = useState('workspace'); // 'workspace' | 'refine'
  const [refineContext, setRefineContext] = useState(null);

  const openRefine = (ctx = {}) => {
    setRefineContext(ctx);
    setView('refine');
  };

  if (view === 'refine') {
    return (
      <DesignAndRefineScreen
        onBack={() => setView('workspace')}
        initialBeforeImage={refineContext?.beforeImage}
        initialAfterImage={refineContext?.afterImage}
        initialRoomType={refineContext?.roomType || 'Living Room'}
        initialStyle={refineContext?.style || 'Modern'}
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-teal text-white">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-tight">SketchSpace AI</h1>
            <p className="text-sm text-stone-500">Sketch a room. Let AI design it.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openRefine()}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-brand-charcoal transition hover:border-brand-teal hover:text-brand-teal shadow-xs"
        >
          <SlidersHorizontal size={14} className="text-brand-teal" />
          <span>Design &amp; Refine Studio</span>
        </button>
      </header>

      <SketchWorkspace ref={workspaceRef}>
        {({ canExport, getImage }) => (
          <RefinedGeneratePanel
            canExport={canExport}
            getImage={getImage}
            onOpenFullRefine={openRefine}
          />
        )}
      </SketchWorkspace>
    </div>
  );
}
