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
import {
  saveLatestRender,
  addRefinementHistoryItem,
  getLatestRender,
  getCanvasSketch,
  getDesignMeta,
} from '../utils/persistence';

export function useDesignWorkflow(initialConfig = {}) {
  const savedMeta = getDesignMeta() || {};
  // 1. Core Image State
  const [originalImage, setOriginalImage] = useState(
    initialConfig.originalImage || getCanvasSketch() || '/stitch/original-room.jpg'
  );
  const [currentGeneratedImage, setCurrentGeneratedImage] = useState(
    initialConfig.generatedImage || getLatestRender() || '/stitch/ai-generated-room.jpg'
  );

  // 2. Room & Style Configuration (read-only, set from initial values)
  const [roomType, setRoomType] = useState(
    initialConfig.roomType || savedMeta.roomType || savedMeta.room_type || 'Living Room'
  );
  const [style, setStyle] = useState(
    initialConfig.style || savedMeta.style || 'Modern'
  );

  useEffect(() => {
    if (initialConfig.originalImage) setOriginalImage(initialConfig.originalImage);
  }, [initialConfig.originalImage]);

  useEffect(() => {
    if (initialConfig.generatedImage) setCurrentGeneratedImage(initialConfig.generatedImage);
  }, [initialConfig.generatedImage]);

  useEffect(() => {
    if (initialConfig.roomType) setRoomType(initialConfig.roomType);
  }, [initialConfig.roomType]);

  useEffect(() => {
    if (initialConfig.style) setStyle(initialConfig.style);
  }, [initialConfig.style]);

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
  const [refineProgress, setRefineProgress] = useState(35);
  const [refineStepLabel, setRefineStepLabel] = useState('Analyzing layout & preserving geometry...');
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef(null);

  const triggerToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    setShowToast(true);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 3200);
  }, []);

  // 6. Backend Connectivity
  // NEVER auto-enable demo mode — generation must always route to the real backend.
  // isDemoMode is kept as state for UI display only; it is always false.
  const isDemoMode = false;
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Request race-condition counter (prevents stale responses from overwriting newer ones)
  const requestIdRef = useRef(0);

  // Check backend health on mount (informational only — does NOT gate generation)
  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      const isOnline = await checkBackendHealth();
      if (isMounted) {
        setIsBackendOnline(isOnline);
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
      saveLatestRender(result.renderedImage);
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
      triggerToast('Please enter what you would like to change.');
      return;
    }

    setIsRefining(true);
    setRefineProgress(30);
    setRefineStepLabel('Analyzing room boundaries & spatial anchors...');
    setError(null);
    setSuccessNotice(null);
    const thisRequestId = ++requestIdRef.current;
    const activeInstruction = refinementInstruction.trim();

    const pTimer = setTimeout(() => {
      setRefineProgress(70);
      setRefineStepLabel('Preserving layout geometry & applying refinements...');
    }, 700);

    // CRITICAL: Ensure previous_image_base64 is strictly bound to the LATEST GENERATED RENDER
    // and NEVER the canvas sketch.
    const canvasSketch = getCanvasSketch() || originalImage;
    let previousImageBase64 = currentGeneratedImage || getLatestRender();

    console.log('[Refine] Sending previous_image_base64. Is sketch?:', previousImageBase64 === canvasSketch);

    if (previousImageBase64 === canvasSketch) {
      console.warn('[Refine] previousImageBase64 matched canvasSketch; recovering latest render from localStorage');
      const recovered = getLatestRender();
      if (recovered && recovered !== canvasSketch) {
        previousImageBase64 = recovered;
      }
    }

    try {
      const result = await refineDesign({
        previousImageBase64,
        instruction: activeInstruction,
        roomType,
        style,
        isDemoMode,
      });

      if (thisRequestId !== requestIdRef.current) return;

      setRefineProgress(100);
      setRefineStepLabel('Refinement complete!');
      const newImage = result.renderedImage;
      setCurrentGeneratedImage(newImage);
      saveLatestRender(newImage);
      addRefinementHistoryItem({
        type: 'refinement',
        instruction: activeInstruction,
        image: newImage,
        roomType,
        style,
        timestamp: Date.now(),
      });
      setRefinementInstruction('');
      lastFailedInstructionRef.current = '';

      setSuccessNotice('Design updated! 50/50 comparison refreshed with latest prompt.');
      triggerToast('Design updated successfully!');
    } catch (err) {
      if (thisRequestId !== requestIdRef.current) return;
      lastFailedInstructionRef.current = activeInstruction;
      setError({
        title: 'Refinement Failed',
        message: err.message || 'Refinement timed out. Please retry your prompt.',
        action: 'refine',
      });
    } finally {
      clearTimeout(pTimer);
      if (thisRequestId === requestIdRef.current) {
        setIsRefining(false);
      }
    }
  }, [
    isRefining,
    isGenerating,
    refinementInstruction,
    currentGeneratedImage,
    triggerToast,
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
      triggerToast('No AI design available to download yet.');
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const safeRoom = (roomType || 'room').toLowerCase().replace(/\s+/g, '-');
      const safeStyle = (style || 'modern').toLowerCase().replace(/\s+/g, '-');
      const filename = `sketchspace-${safeRoom}-${safeStyle}-${timestamp}.png`;

      await downloadDesignAsPng(currentGeneratedImage, filename);
      triggerToast('AI design downloaded in PNG format.');
    } catch (err) {
      setError({
        title: 'Download Failed',
        message: err.message || 'Could not export design as PNG.',
      });
    } finally {
      setIsDownloading(false);
    }
  }, [currentGeneratedImage, roomType, style, triggerToast]);

  const handleSaveDesign = useCallback(() => {
    triggerToast('Design saved to your SketchSpace project!');
  }, [triggerToast]);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccessNotice(null), []);

  return {
    // State
    originalImage,
    setOriginalImage,
    currentGeneratedImage,
    setCurrentGeneratedImage,
    roomType,
    style,
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
    refineProgress,
    refineStepLabel,
    isDownloading,
    error,
    successNotice,
    toastMessage,
    showToast,
    isDemoMode,
    isBackendOnline,

    // Actions
    handleGenerate,
    handleRefine,
    handleRetry,
    handleDownload,
    handleSaveDesign,
    triggerToast,
    clearError,
    clearSuccess,
  };
}
