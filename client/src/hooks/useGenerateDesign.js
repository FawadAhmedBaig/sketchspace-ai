import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError, checkHealth, generateDesign } from '../lib/api';
import { buildGeneratePayload } from '../lib/exportImage';

/**
 * Generation flow state machine.
 *
 *   const { status, result, error, generate, cancel } = useGenerateDesign();
 *   generate(() => workspaceRef.current.getImage(), { room_type, style, prompt, preserve_layout });
 *
 * - status: 'idle' | 'loading' | 'success' | 'error'
 * - result: { anchors, imageDataUrl } from the last successful run (kept while a new run is loading)
 * - error:  { kind, message } (ApiError kinds + 'validation')
 * Duplicate calls while a request is in flight are ignored.
 */
export function useGenerateDesign() {
  const [state, setState] = useState({ status: 'idle', result: null, error: null });
  const inFlight = useRef(false);
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const fail = (kind, message) => setState((s) => ({ ...s, status: 'error', error: { kind, message } }));

  const generate = useCallback(async (getImage, fields) => {
    if (inFlight.current) return null;

    const image = getImage();
    if (!image?.ok) return fail('validation', image?.error || 'Add a sketch or upload an image first.');
    if (!fields?.room_type?.trim() || !fields?.style?.trim()) return fail('validation', 'Choose a room type and a style first.');

    inFlight.current = true;
    const controller = new AbortController();
    controllerRef.current = controller;
    setState((s) => ({ status: 'loading', result: s.result, error: null }));
    try {
      const payload = buildGeneratePayload(image, fields);
      const result = await generateDesign(payload, { signal: controller.signal });
      setState({ status: 'success', result, error: null });
      return result;
    } catch (err) {
      if (err instanceof ApiError && err.kind === 'aborted') setState((s) => ({ ...s, status: 'idle', error: null }));
      else fail(err.kind || 'network', err.message || 'Something went wrong. Please try again.');
      return null;
    } finally {
      inFlight.current = false;
      controllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => controllerRef.current?.abort(), []);

  return { ...state, isLoading: state.status === 'loading', generate, cancel };
}

/** Pings GET /api/health on mount (also wakes a sleeping Render instance). status: 'checking' | 'online' | 'offline' */
export function useBackendStatus() {
  const [status, setStatus] = useState('checking');
  const controllerRef = useRef(null);

  const recheck = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus('checking');
    checkHealth({ signal: controller.signal })
      .then((ok) => !controller.signal.aborted && setStatus(ok ? 'online' : 'offline'))
      .catch(() => !controller.signal.aborted && setStatus('offline'));
  }, []);

  useEffect(() => {
    recheck();
    return () => controllerRef.current?.abort();
  }, [recheck]);

  return { status, recheck };
}
