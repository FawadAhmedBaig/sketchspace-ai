/**
 * useDesignWorkflow.js
 * 
 * Custom React Hook that encapsulates state management and asynchronous operations
 * for SketchSpace AI's Design & Refine workflow.
 * 
 * Flutter Developer Note:
 * In Flutter, this is analogous to a ChangeNotifier, Cubit, or StateNotifier.
 * In React, custom hooks (`use...`) encapsulate state (`useState`), side effects (`useEffect`),
 * and callback handlers into a reusable function that returns state and actions to components.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  generateDesign,
  refineDesign,
  checkBackendHealth,
} from '../services/designApi';
import { downloadDesignAsPng } from '../utils/imageUtils';

export function useDesignWorkflow(initialConfig = {}) {
  // 1. Core Image State
  const [originalImage, setOriginalImage] = useState(
    initialConfig.originalImage || '/demo/sketch-sample.png'
  );
  const [currentGeneratedImage, setCurrentGeneratedImage] = useState(
    initialConfig.generatedImage || '/demo/rendered-sample.png'
  );

  // 2. Room & Style Configuration
  const [roomType, setRoomType] = useState(initialConfig.roomType || 'Living Room');
  const [style, setStyle] = useState(initialConfig.style || 'Scandinavian Japandi');
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [designPrompt, setDesignPrompt] = useState('');

  // 3. Refinement State
  const [refinementInstruction, setRefinementInstruction] = useState('');
  const lastFailedInstructionRef = useRef('');

  // 4. Comparison Slider Position (0 to 100%, defaults to 50%)
  const [comparisonPosition, setComparisonPosition] = useState(50);

  // 5. Async Loading & Feedback State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  // 6. Backend Connectivity & Demo Mode
  // If backend is unreachable or user toggles it, fallback to demo mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Request race-condition counter (prevents stale responses from overwriting newer ones)
  const requestIdRef = useRef(0);

  // Check backend health on mount and periodically
  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      const isOnline = await checkBackendHealth();
      if (isMounted) {
        setIsBackendOnline(isOnline);
        // If live backend is not available on initial boot, auto-enable Demo Mode so the app works immediately
        if (!isOnline) {
          setIsDemoMode(true);
        }
      }
    }

    checkHealth();
    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Action: Initial Design Generation
   * Calls POST /api/generate
   */
  const handleGenerate = useCallback(async () => {
    if (isGenerating || isRefining) return;

    setIsGenerating(true);
    setError(null);
    setSuccessNotice(null);
    const thisRequestId = ++requestIdRef.current;

    try {
      const result = await generateDesign({
        imageBase64: originalImage,
        roomType,
        style,
        prompt: designPrompt,
        preserveLayout,
        isDemoMode,
      });

      // Guard against race conditions
      if (thisRequestId !== requestIdRef.current) return;

      setCurrentGeneratedImage(result.renderedImage);
      setSuccessNotice(
        result.isMock
          ? 'Demo design generated! (Running in isolated Demo Mode)'
          : 'Initial interior design generated successfully!'
      );
    } catch (err) {
      if (thisRequestId !== requestIdRef.current) return;
      setError({
        title: 'Design Generation Failed',
        message: err.message || 'Unable to generate design. Check your backend connection.',
        action: 'generate',
      });
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setIsGenerating(false);
      }
    }
  }, [
    isGenerating,
    isRefining,
    originalImage,
    roomType,
    style,
    designPrompt,
    preserveLayout,
    isDemoMode,
  ]);

  /**
   * Action: Refine Design
   * Calls POST /api/refine
   * Passes latest generated image and user instruction.
   * Keeps original image unchanged.
   */
  const handleRefine = useCallback(async () => {
    if (isRefining || isGenerating) return;
    if (!refinementInstruction.trim()) {
      setError({
        title: 'Instruction Required',
        message: 'Please type an instruction or select a suggestion chip.',
      });
      return;
    }

    setIsRefining(true);
    setError(null);
    setSuccessNotice(null);
    const thisRequestId = ++requestIdRef.current;
    const activeInstruction = refinementInstruction.trim();

    try {
      const result = await refineDesign({
        previousImageBase64: currentGeneratedImage,
        instruction: activeInstruction,
        isDemoMode,
      });

      if (thisRequestId !== requestIdRef.current) return;

      // Update generated image while preserving original image & slider position!
      setCurrentGeneratedImage(result.renderedImage);
      // Clear input on success
      setRefinementInstruction('');
      lastFailedInstructionRef.current = '';

      setSuccessNotice(
        result.isMock
          ? `Refined: "${activeInstruction}" (Demo Mode)`
          : `Successfully applied: "${activeInstruction}"`
      );
    } catch (err) {
      if (thisRequestId !== requestIdRef.current) return;
      lastFailedInstructionRef.current = activeInstruction;
      setError({
        title: 'Refinement Failed',
        message: err.message || 'Failed to apply refinement to the current design.',
        action: 'refine',
      });
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setIsRefining(false);
      }
    }
  }, [
    isRefining,
    isGenerating,
    refinementInstruction,
    currentGeneratedImage,
    isDemoMode,
  ]);

  /**
   * Action: Retry last failed operation
   */
  const handleRetry = useCallback(() => {
    if (error?.action === 'refine') {
      if (lastFailedInstructionRef.current) {
        setRefinementInstruction(lastFailedInstructionRef.current);
      }
      handleRefine();
    } else if (error?.action === 'generate') {
      handleGenerate();
    } else {
      setError(null);
    }
  }, [error, handleRefine, handleGenerate]);

  /**
   * Action: Download Design as PNG
   * Mandatory feature: downloads current AI generated render as genuine PNG.
   */
  const handleDownload = useCallback(async () => {
    if (!currentGeneratedImage) {
      setError({
        title: 'Download Unavailable',
        message: 'There is no generated design available to download yet.',
      });
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filename = `sketchspace-${roomType.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.png`;

      await downloadDesignAsPng(currentGeneratedImage, filename);
      setSuccessNotice(`Design downloaded as "${filename}".`);
    } catch (err) {
      setError({
        title: 'Download Failed',
        message: err.message || 'Could not export design as PNG. Please check image permissions.',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [currentGeneratedImage, roomType]);

  const handleToggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => !prev);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccessNotice(null), []);

  return {
    // State
    originalImage,
    setOriginalImage,
    currentGeneratedImage,
    setCurrentGeneratedImage,
    roomType,
    setRoomType,
    style,
    setStyle,
    preserveLayout,
    setPreserveLayout,
    designPrompt,
    setDesignPrompt,
    refinementInstruction,
    setRefinementInstruction,
    comparisonPosition,
    setComparisonPosition,
    isGenerating,
    isRefining,
    isDownloading,
    error,
    successNotice,
    isDemoMode,
    isBackendOnline,

    // Actions
    handleGenerate,
    handleRefine,
    handleRetry,
    handleDownload,
    handleToggleDemoMode,
    clearError,
    clearSuccess,
  };
}
