/**
 * App.jsx
 * 
 * Root application component for SketchSpace AI.
 * Hosts the DesignAndRefineScreen and provides mock workspace navigation
 * so the feature can be tested standalone or integrated with Rahma's canvas.
 * 
 * Flutter Developer Note:
 * Analogous to MaterialApp(home: DesignAndRefineScreen()).
 */

import React, { useState } from 'react';
import DesignAndRefineScreen from './components/design/DesignAndRefineScreen';
import { Sparkles, ArrowRight, Paintbrush, Layers } from 'lucide-react';

export default function App() {
  // Navigation simulation for development:
  // Allows testing the "Back to Workspace" button and transitioning into Design & Refine
  const [currentView, setCurrentView] = useState('design-refine'); // 'workspace' | 'design-refine'

  if (currentView === 'workspace') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] text-[#1F2937] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#0F6B63] text-white flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Paintbrush className="w-7 h-7 text-[#4FD1C5]" />
          </div>

          <h2 className="text-xl font-bold text-[#1F2937]">
            Rahma&apos;s Workspace & Canvas
          </h2>
          <p className="text-xs text-[#4B5563] mt-2 mb-6 leading-relaxed">
            This placeholder represents Rahma&apos;s drawing canvas and upload area.
            When the user finishes sketching and clicks &quot;Generate Design&quot;, the app navigates to our Design &amp; Refine screen.
          </p>

          <button
            type="button"
            onClick={() => setCurrentView('design-refine')}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-[#0F6B63] hover:bg-[#0b544e] active:scale-98 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#4FD1C5]" />
            <span>Open Design &amp; Refine Screen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <DesignAndRefineScreen
      onBackToWorkspace={() => setCurrentView('workspace')}
    />
  );
}
