import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Check, X, Move, Sparkles } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  aspectRatio: 'portrait' | 'logo';
  title?: string;
  onConfirm: (croppedBase64: string) => void;
  onCancel: () => void;
}

export function ImageCropperModal({
  imageSrc,
  aspectRatio,
  title = 'Crop & Adjust Image',
  onConfirm,
  onCancel,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // in degrees: 0, 90, 180, 270
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Define target frame dimensions
  const isPortrait = aspectRatio === 'portrait';
  const frameWidth = isPortrait ? 270 : 250;
  const frameHeight = isPortrait ? 420 : 250;

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      // Auto-fit initial zoom
      const scaleX = frameWidth / img.naturalWidth;
      const scaleY = frameHeight / img.naturalHeight;
      const initialFit = Math.max(scaleX, scaleY);
      setZoom(Math.max(1, initialFit * 1.1));
      setOffset({ x: 0, y: 0 });
      setRotation(0);
      drawPreview();
    };
  }, [imageSrc, frameWidth, frameHeight]);

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = frameWidth * 2; // high-DPI
    canvas.height = frameHeight * 2;
    ctx.scale(2, 2);

    // Clear
    ctx.clearRect(0, 0, frameWidth, frameHeight);

    // Background checkerboard for transparency
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, frameWidth, frameHeight);

    ctx.save();
    // Center origin
    ctx.translate(frameWidth / 2 + offset.x, frameHeight / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    ctx.drawImage(img, -nw / 2, -nh / 2, nw, nh);
    ctx.restore();
  }, [frameWidth, frameHeight, offset, rotation, zoom]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  // Pointer drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Perform Final High-Res Crop to Base64
  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;

    const outCanvas = document.createElement('canvas');
    // Final export size: 360x560 for portrait (9:14), 300x300 for logo
    const outWidth = isPortrait ? 360 : 300;
    const outHeight = isPortrait ? 560 : 300;

    outCanvas.width = outWidth;
    outCanvas.height = outHeight;
    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return;

    const scaleFactor = outWidth / frameWidth;

    outCtx.fillStyle = '#18181b';
    outCtx.fillRect(0, 0, outWidth, outHeight);

    outCtx.save();
    outCtx.translate(outWidth / 2 + offset.x * scaleFactor, outHeight / 2 + offset.y * scaleFactor);
    outCtx.rotate((rotation * Math.PI) / 180);
    outCtx.scale(zoom * scaleFactor, zoom * scaleFactor);

    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    outCtx.drawImage(img, -nw / 2, -nh / 2, nw, nh);
    outCtx.restore();

    // Export high-quality Base64 JPEG/WebP
    const croppedDataUrl = outCanvas.toDataURL('image/jpeg', 0.92);
    onConfirm(croppedDataUrl);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg themed-modal border rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col items-center"
      >
        <div className="w-full flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-pink-500" />
            <h3 className="font-bold text-base sm:text-lg themed-text">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-full themed-btn border border-transparent hover:border-inherit transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cropping Viewport */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="relative overflow-hidden rounded-2xl border-2 border-pink-500/60 shadow-2xl cursor-grab active:cursor-grabbing bg-black select-none touch-none"
          style={{ width: `${frameWidth}px`, height: `${frameHeight}px` }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: `${frameWidth}px`, height: `${frameHeight}px` }}
            className="block pointer-events-none"
          />

          {/* Alignment Guides / Corner Marks */}
          <div className="absolute inset-0 border border-white/20 pointer-events-none rounded-2xl" />
          <div className="absolute inset-x-0 top-1/3 border-b border-white/10 border-dashed pointer-events-none" />
          <div className="absolute inset-x-0 top-2/3 border-b border-white/10 border-dashed pointer-events-none" />
          <div className="absolute inset-y-0 left-1/3 border-r border-white/10 border-dashed pointer-events-none" />
          <div className="absolute inset-y-0 left-2/3 border-r border-white/10 border-dashed pointer-events-none" />

          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/70 text-[10px] font-mono text-zinc-300 flex items-center gap-1 backdrop-blur-md pointer-events-none">
            <Move size={10} /> Drag to pan
          </div>
        </div>

        {/* Zoom & Rotation Controls */}
        <div className="w-full mt-5 space-y-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
              className="p-2 rounded-xl themed-btn border border-inherit active:scale-95 transition-all"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between text-[11px] themed-modal-muted font-mono">
                <span>Scale / Zoom</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/20 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(3.5, z + 0.15))}
              className="p-2 rounded-xl themed-btn border border-inherit active:scale-95 transition-all"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Rotate & Reset Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl themed-btn border border-inherit active:scale-95 text-xs font-semibold transition-all"
              >
                <RotateCcw size={14} /> -90°
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl themed-btn border border-inherit active:scale-95 text-xs font-semibold transition-all"
              >
                <RotateCw size={14} /> +90°
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setOffset({ x: 0, y: 0 });
                setRotation(0);
                setZoom(1);
              }}
              className="text-xs themed-modal-muted hover:opacity-100 transition-opacity"
            >
              Reset Alignment
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex items-center gap-3 mt-6 pt-4 border-t border-inherit">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-2xl themed-btn border border-inherit active:scale-95 text-xs sm:text-sm font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-95 active:scale-95 text-xs sm:text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Check size={16} strokeWidth={2.5} /> Save Cropped Image
          </button>
        </div>
      </motion.div>
    </div>
  );
}
