import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { drawPreset } from '../lib/presets';

/**
 * Drawing surface with a FIXED internal resolution (1200×800).
 * CSS scales it to the container, and pointer coordinates are mapped back to the
 * internal space, so resizing never loses or distorts strokes.
 */
export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 800;
const INK = '#1F2937';
const ERASER_MULTIPLIER = 2.5;
const MAX_HISTORY = 12;

const DrawingCanvas = forwardRef(function DrawingCanvas({ tool, brushSize, onChange, onHistoryChange }, ref) {
  const canvasRef = useRef(null);
  const stroke = useRef(null);
  const history = useRef([]);

  const ctx2d = () => canvasRef.current.getContext('2d');

  const paintWhite = () => {
    const ctx = ctx2d();
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  };

  const isBlank = () => {
    const { data } = ctx2d().getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const px = new Uint32Array(data.buffer);
    for (let i = 0; i < px.length; i++) if (px[i] !== 0xffffffff) return false;
    return true;
  };

  const notify = () => onChange?.({ hasContent: !isBlank() });

  const pushHistory = () => {
    history.current.push(ctx2d().getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT));
    if (history.current.length > MAX_HISTORY) history.current.shift();
    onHistoryChange?.(true);
  };

  useEffect(() => {
    paintWhite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    isBlank,
    toDataURL: () => canvasRef.current.toDataURL('image/png'),
    undo() {
      const snap = history.current.pop();
      if (!snap) return;
      stroke.current = null;
      ctx2d().putImageData(snap, 0, 0);
      onHistoryChange?.(history.current.length > 0);
      notify();
    },
    clear() {
      stroke.current = null;
      pushHistory();
      paintWhite();
      notify();
    },
    loadPreset(id) {
      stroke.current = null; // abandon any in-flight stroke
      pushHistory();
      paintWhite();
      drawPreset(ctx2d(), id);
      notify();
    },
  }));

  const toCanvasPoint = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * CANVAS_WIDTH) / r.width,
      y: ((e.clientY - r.top) * CANVAS_HEIGHT) / r.height,
    };
  };

  const applyStyle = (ctx) => {
    const erasing = tool === 'eraser';
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = ctx.fillStyle = erasing ? '#ffffff' : INK;
    ctx.lineWidth = erasing ? brushSize * ERASER_MULTIPLIER : brushSize;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.setLineDash([]);
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    canvasRef.current.setPointerCapture(e.pointerId);
    pushHistory();
    const ctx = ctx2d();
    const p = toCanvasPoint(e);
    applyStyle(ctx);
    ctx.beginPath();
    ctx.arc(p.x, p.y, ctx.lineWidth / 2, 0, Math.PI * 2); // a tap leaves a dot
    ctx.fill();
    stroke.current = { id: e.pointerId, last: p, mid: p };
  };

  const onPointerMove = (e) => {
    const s = stroke.current;
    if (!s || s.id !== e.pointerId) return;
    const ctx = ctx2d();
    const events = e.nativeEvent.getCoalescedEvents?.() || [];
    (events.length ? events : [e.nativeEvent]).forEach((ev) => {
      const p = toCanvasPoint(ev);
      const mid = { x: (s.last.x + p.x) / 2, y: (s.last.y + p.y) / 2 };
      ctx.beginPath(); // midpoint quadratic curves = smooth lines
      ctx.moveTo(s.mid.x, s.mid.y);
      ctx.quadraticCurveTo(s.last.x, s.last.y, mid.x, mid.y);
      ctx.stroke();
      s.last = p;
      s.mid = mid;
    });
  };

  const endStroke = (e) => {
    const s = stroke.current;
    if (!s || s.id !== e.pointerId) return;
    const ctx = ctx2d();
    ctx.beginPath();
    ctx.moveTo(s.mid.x, s.mid.y);
    ctx.lineTo(s.last.x, s.last.y);
    ctx.stroke();
    stroke.current = null;
    notify();
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      role="img"
      aria-label="Drawing canvas. Draw a floor-plan sketch with a pointer or touch."
      className="block h-auto w-full touch-none cursor-crosshair select-none bg-white"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
});

export default DrawingCanvas;
