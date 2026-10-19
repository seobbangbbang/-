import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onGoHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onGoHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm select-none">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl mb-4 shadow-sm">
          ☕
        </div>

        <h2 className="text-xl font-black text-slate-800 mb-1">
          잠시 쉬어가는 중
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          숨을 고르고 다시 갓생 테트리스를 이어가 볼까요?
        </p>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-indigo-500 shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>게임 계속하기 (Esc)</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>처음부터 다시하기</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-2.5 px-4 rounded-xl font-medium text-slate-400 hover:text-slate-600 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>메인 타이틀로 나가기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
