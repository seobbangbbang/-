import React from 'react';
import { TetrominoType, ThemeConfig, GameStats } from '../types/tetris';
import { MiniPiecePreview } from './MiniPiecePreview';
import { Volume2, VolumeX, Music, Music2, Pause } from 'lucide-react';

interface GameHUDProps {
  stats: GameStats;
  holdPiece: TetrominoType | null;
  canHold: boolean;
  nextQueue: TetrominoType[];
  theme: ThemeConfig;
  isMuted: boolean;
  isBgmMuted: boolean;
  onToggleMute: () => void;
  onToggleBgmMute: () => void;
  onPause: () => void;
  onTriggerHold: () => void;
}

// 1. Mobile Compact Top Bar (strictly <= 46px height, zero overflow)
export const MobileHUD: React.FC<GameHUDProps> = ({
  stats,
  holdPiece,
  canHold,
  nextQueue,
  theme,
  isMuted,
  isBgmMuted,
  onToggleMute,
  onToggleBgmMute,
  onPause,
  onTriggerHold,
}) => {
  return (
    <div className="md:hidden w-full max-w-md mx-auto px-3 py-1 flex items-center justify-between gap-2 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-sm shrink-0 select-none">
      {/* HOLD Mini Button */}
      <button
        onClick={onTriggerHold}
        disabled={!canHold}
        className={`flex items-center gap-1 px-2 py-1 rounded-xl border border-slate-200/60 bg-slate-50/80 transition-all ${
          canHold ? 'active:scale-95 cursor-pointer' : 'opacity-40 cursor-not-allowed'
        }`}
        title="홀드 (C / Shift)"
      >
        <span className="text-[10px] font-black text-slate-400">HOLD</span>
        <div className="scale-75 origin-center">
          <MiniPiecePreview type={holdPiece} theme={theme} size={11} disabled={!canHold} />
        </div>
      </button>

      {/* Center Score & Level */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-md">
            Lv.{stats.level}
          </span>
          <span className="text-base font-black text-slate-800 font-mono tabular-nums leading-none">
            {stats.score.toLocaleString()}
          </span>
        </div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
          {stats.lines}줄 {stats.combo > 1 ? `· 🔥${stats.combo}콤보` : ''}
        </div>
      </div>

      {/* NEXT Mini & Sound Controls */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 px-2 py-1 rounded-xl border border-slate-200/60 bg-slate-50/80">
          <span className="text-[10px] font-black text-slate-400">NEXT</span>
          <div className="scale-75 origin-center">
            <MiniPiecePreview type={nextQueue[0]} theme={theme} size={11} />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onToggleBgmMute}
            className={`p-1.5 rounded-lg border border-slate-200/60 transition-colors ${
              isBgmMuted ? 'text-slate-400' : 'text-violet-600 bg-violet-50'
            }`}
            title="BGM 토글"
          >
            {isBgmMuted ? <Music className="w-3.5 h-3.5 opacity-50" /> : <Music2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border border-slate-200/60 transition-colors ${
              isMuted ? 'text-slate-400' : 'text-pink-600 bg-pink-50'
            }`}
            title="효과음 토글"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 opacity-50" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onPause}
            className="p-1.5 rounded-lg border border-slate-200/60 text-slate-600 hover:bg-slate-100 transition-colors"
            title="일시 정지"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Desktop Left Wing (Hold + Level & Lines + Sound)
export const DesktopLeftHUD: React.FC<GameHUDProps> = ({
  stats,
  holdPiece,
  canHold,
  theme,
  isMuted,
  isBgmMuted,
  onToggleMute,
  onToggleBgmMute,
  onPause,
  onTriggerHold,
}) => {
  return (
    <div className="hidden md:flex flex-col items-end gap-3 w-40 lg:w-44 shrink-0 select-none">
      {/* HOLD Card */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-3 shadow-sm w-full flex flex-col items-center text-center">
        <div className="flex items-center justify-between w-full px-1 mb-1">
          <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            HOLD
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            [C / Shift]
          </span>
        </div>

        <button
          onClick={onTriggerHold}
          disabled={!canHold}
          className={`w-full min-h-[64px] flex items-center justify-center rounded-xl transition-all ${
            canHold
              ? 'cursor-pointer hover:bg-slate-50 active:scale-95'
              : 'cursor-not-allowed opacity-50'
          }`}
          title="클릭하거나 C 키를 눌러 홀드"
        >
          <MiniPiecePreview
            type={holdPiece}
            theme={theme}
            size={18}
            disabled={!canHold}
          />
        </button>
      </div>

      {/* Level & Lines Box */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-3 shadow-sm w-full flex flex-col gap-2">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            LEVEL
          </div>
          <div className="text-2xl font-black text-slate-800 font-mono tabular-nums leading-none mt-1">
            {stats.level}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">제거한 줄</span>
          <span className="text-sm font-bold text-slate-700 font-mono tabular-nums">
            {stats.lines}
          </span>
        </div>
      </div>

      {/* Quick Utility Toolbar (Sound & Pause) */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-xl shadow-sm w-full">
        <button
          onClick={onToggleBgmMute}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isBgmMuted
              ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              : 'text-violet-600 bg-violet-50 hover:bg-violet-100'
          }`}
          title={isBgmMuted ? '배경음악 켜기' : '배경음악 끄기'}
        >
          {isBgmMuted ? <Music className="w-4 h-4 opacity-50" /> : <Music2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onToggleMute}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isMuted
              ? 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              : 'text-pink-600 bg-pink-50 hover:bg-pink-100'
          }`}
          title={isMuted ? '효과음 켜기' : '효과음 끄기'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 opacity-50" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <button
          onClick={onPause}
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="일시 정지 (Esc)"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// 3. Desktop Right Wing (Score + Next Queue + Combo)
export const DesktopRightHUD: React.FC<GameHUDProps> = ({
  stats,
  nextQueue,
  theme,
}) => {
  return (
    <div className="hidden md:flex flex-col items-start gap-3 w-40 lg:w-44 shrink-0 select-none">
      {/* SCORE Card */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-3 shadow-sm w-full">
        <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          SCORE
        </div>
        <div className="text-2xl font-black text-slate-900 font-mono tabular-nums leading-none mt-1">
          {stats.score.toLocaleString()}
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>최고 기록</span>
          <span className="font-mono font-semibold tabular-nums text-amber-600">
            {stats.highScore.toLocaleString()}
          </span>
        </div>

        {stats.combo > 1 && (
          <div className="mt-2 py-1 px-2 rounded-lg bg-pink-50 text-pink-700 text-xs font-bold text-center animate-bounce">
            🔥 {stats.combo}연속 콤보!
          </div>
        )}
      </div>

      {/* NEXT 3 Queue Card */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-3 shadow-sm w-full flex flex-col items-center">
        <div className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 w-full text-left px-1">
          NEXT
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          {nextQueue.slice(0, 3).map((type, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center p-1 rounded-xl bg-slate-50/70 border border-slate-100"
            >
              <MiniPiecePreview
                type={type}
                theme={theme}
                size={idx === 0 ? 17 : 13}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
