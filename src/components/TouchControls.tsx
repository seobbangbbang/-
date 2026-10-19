import React, { useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, Zap, Repeat } from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onRotate: () => void;
  onHold: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onSoftDrop,
  onHardDrop,
  onRotate,
  onHold,
}) => {
  const repeatTimer = useRef<number | null>(null);

  // Helper for holding down a directional button with continuous repeat
  const handleHoldStart = (action: () => void) => {
    action();
    if (repeatTimer.current) clearInterval(repeatTimer.current);
    // Initial delay 160ms, then repeat every 60ms
    const timeout = window.setTimeout(() => {
      repeatTimer.current = window.setInterval(action, 65);
    }, 160);
    repeatTimer.current = timeout;
  };

  const handleHoldEnd = () => {
    if (repeatTimer.current) {
      clearTimeout(repeatTimer.current);
      clearInterval(repeatTimer.current);
      repeatTimer.current = null;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto px-2 py-1 flex items-center justify-between gap-2 select-none touch-none shrink-0">
      {/* Direction Pad (Left, Down, Right) */}
      <div className="flex items-center gap-1.5">
        <button
          onPointerDown={() => handleHoldStart(onMoveLeft)}
          onPointerUp={handleHoldEnd}
          onPointerLeave={handleHoldEnd}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm active:scale-90 active:bg-slate-100 flex items-center justify-center text-slate-700 transition-transform"
          aria-label="왼쪽 이동"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onPointerDown={() => handleHoldStart(onSoftDrop)}
          onPointerUp={handleHoldEnd}
          onPointerLeave={handleHoldEnd}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm active:scale-90 active:bg-slate-100 flex items-center justify-center text-slate-700 transition-transform"
          aria-label="소프트 드롭"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        <button
          onPointerDown={() => handleHoldStart(onMoveRight)}
          onPointerUp={handleHoldEnd}
          onPointerLeave={handleHoldEnd}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/95 border border-slate-200/90 shadow-sm active:scale-90 active:bg-slate-100 flex items-center justify-center text-slate-700 transition-transform"
          aria-label="오른쪽 이동"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Action Buttons (Hold, Rotate, Hard Drop) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onHold}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-50/95 border border-indigo-200/80 shadow-sm active:scale-90 active:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-transform"
          aria-label="홀드"
          title="홀드"
        >
          <Repeat className="w-4 h-4" />
        </button>

        <button
          onClick={onRotate}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-pink-50/95 border border-pink-200/80 shadow-sm active:scale-90 active:bg-pink-100 flex items-center justify-center text-pink-600 transition-transform font-bold"
          aria-label="회전"
          title="회전"
        >
          <RotateCw className="w-5 h-5" />
        </button>

        <button
          onClick={onHardDrop}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-300 text-amber-950 font-black shadow-md active:scale-90 active:shadow-sm flex items-center justify-center transition-transform"
          aria-label="하드 드롭 즉시 낙하"
          title="하드 드롭 즉시 낙하"
        >
          <Zap className="w-5 h-5 fill-amber-950" />
        </button>
      </div>
    </div>
  );
};
