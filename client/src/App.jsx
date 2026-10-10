import { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import SketchWorkspace from './components/SketchWorkspace';
import DemoGeneratePanel from './demo/DemoGeneratePanel';

/**
 * Demo parent. Tayyab replaces <DemoGeneratePanel/> with the real controls/results,
 * keeping the useGenerateDesign() call (see README "Integration guide").
 */
export default function App() {
  const workspaceRef = useRef(null);

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
        {({ canExport, getImage }) => <DemoGeneratePanel canExport={canExport} getImage={getImage} />}
      </SketchWorkspace>
    </div>
  );
}
