import React from 'react';
import { GameStats } from '../types/tetris';
import { getMzRank } from '../utils/tetris';
import { RotateCcw, Home, Sparkles, Trophy } from 'lucide-react';

interface GameOverModalProps {
  stats: GameStats;
  isNewRecord: boolean;
  onRestart: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isNewRecord,
  onRestart,
  onGoHome,
}) => {
  const rank = getMzRank(stats.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm select-none">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Animated Sad Crying Jelly Mascot (T_T) */}
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-300 shadow-md flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1 left-2 w-5 h-1.5 rounded-full bg-white/60 pointer-events-none" />
            
            {/* Crying eyes with tears */}
            <div className="flex items-center gap-3 relative">
              <span className="text-xl font-black text-rose-950">T</span>
              <span className="text-xl font-black text-rose-950">T</span>
            </div>

            {/* Falling animated tears */}
            <div className="absolute bottom-2 left-5 w-1.5 h-3 rounded-full bg-sky-200 animate-bounce [animation-duration:1s]" />
            <div className="absolute bottom-2 right-5 w-1.5 h-3 rounded-full bg-sky-200 animate-bounce [animation-duration:1.2s]" />
          </div>
        </div>

        {/* New record shoutout if achieved */}
        {isNewRecord && (
          <div className="flex items-center gap-1.5 text-xs font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full mb-2 animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            <span>최고 기록 갱신 성공!</span>
          </div>
        )}

        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          게임 오버!
        </h2>

        {/* MZ Rank Badge */}
        <div className="mt-2 mb-4 p-2.5 bg-slate-50 border border-slate-100 rounded-2xl w-full">
          <div className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase">
            {rank.badge}
          </div>
          <div className="text-base font-extrabold text-slate-800">
            {rank.title}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {rank.desc}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
          <div className="bg-slate-50 p-2.5 rounded-xl text-left border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold">최종 점수</div>
            <div className="text-lg font-black text-slate-800 font-mono tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl text-left border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold">제거한 줄</div>
            <div className="text-lg font-black text-slate-800 font-mono tabular-nums">
              {stats.lines}줄
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl text-left border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold">최대 콤보</div>
            <div className="text-lg font-black text-pink-600 font-mono tabular-nums">
              {stats.maxCombo > 0 ? `${stats.maxCombo}연속` : '0'}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl text-left border border-slate-100">
            <div className="text-[10px] text-slate-400 font-semibold">도달 레벨</div>
            <div className="text-lg font-black text-indigo-600 font-mono tabular-nums">
              Lv. {stats.level}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onRestart}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 도전하기 (Space / Enter)</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-500 hover:text-slate-800 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>메인 타이틀로</span>
          </button>
        </div>
      </div>
    </div>
  );
};
