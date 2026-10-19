import React from 'react';
import { ThemeId, ThemeConfig, StoredRecord } from '../types/tetris';
import { THEMES } from '../utils/tetris';
import { Play, Sparkles, Volume2, VolumeX, Music, Trophy } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  currentTheme: ThemeConfig;
  onSelectTheme: (themeId: ThemeId) => void;
  record: StoredRecord;
  isMuted: boolean;
  isBgmMuted: boolean;
  onToggleMute: () => void;
  onToggleBgmMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  currentTheme,
  onSelectTheme,
  record,
  isMuted,
  isBgmMuted,
  onToggleMute,
  onToggleBgmMute,
}) => {
  return (
    <div className="relative w-full h-full max-h-screen flex flex-col items-center justify-between p-3 sm:p-5 md:p-8 select-none overflow-hidden">
      {/* Live Animated Background Floating Jelly Candies */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-pink-200/50 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-sky-200/50 blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 left-1/4 w-60 h-60 rounded-full bg-yellow-200/40 blur-3xl animate-pulse" />

        {/* Floating Jelly SVG Icons */}
        <div className="absolute top-20 left-[15%] animate-bounce [animation-duration:3.2s]">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect x="2" y="2" width="40" height="40" rx="12" fill="#F472B6" />
            <circle cx="16" cy="18" r="3" fill="#831843" />
            <circle cx="28" cy="18" r="3" fill="#831843" />
            <path d="M18 26C19.5 28 24.5 28 26 26" stroke="#831843" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="absolute top-36 right-[18%] animate-bounce [animation-duration:4.1s]">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="2" y="2" width="36" height="36" rx="10" fill="#38BDF8" />
            <circle cx="14" cy="16" r="2.8" fill="#0C4A6E" />
            <circle cx="26" cy="16" r="2.8" fill="#0C4A6E" />
            <path d="M16 23C17 25 23 25 24 23" stroke="#0C4A6E" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="absolute bottom-28 left-[22%] animate-bounce [animation-duration:3.6s]">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect x="2" y="2" width="44" height="44" rx="14" fill="#FBBF24" />
            <circle cx="18" cy="20" r="3" fill="#78350F" />
            <circle cx="30" cy="20" r="3" fill="#78350F" />
            <path d="M20 28C21.5 30 26.5 30 28 28" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <div className="absolute bottom-32 right-[20%] animate-bounce [animation-duration:4.5s]">
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
            <rect x="2" y="2" width="38" height="38" rx="12" fill="#C084FC" />
            <circle cx="15" cy="17" r="2.8" fill="#581C87" />
            <circle cx="27" cy="17" r="2.8" fill="#581C87" />
            <path d="M17 25C18.5 27 23.5 27 25 25" stroke="#581C87" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Top Sound Control Bar */}
      <div className="w-full max-w-3xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Sparkles className="w-4 h-4 text-pink-500 animate-spin [animation-duration:6s]" />
          <span>MZ 세대를 위한 힐링 테트리스</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleBgmMute}
            className={`p-2.5 rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-sm transition-all shadow-sm ${
              isBgmMuted ? 'text-slate-400' : 'text-violet-600 bg-violet-50'
            }`}
            title="BGM 토글"
          >
            <Music className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleMute}
            className={`p-2.5 rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-sm transition-all shadow-sm ${
              isMuted ? 'text-slate-400' : 'text-pink-600 bg-pink-50'
            }`}
            title="효과음 토글"
          >
            {isMuted ? <VolumeX className="w-4 h-4 opacity-50" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Centerpiece: Bespoke Title Lockup & Mascot */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-xl">
        {/* Bespoke Inline SVG Logo Lockup */}
        <div className="relative mb-3 flex flex-col items-center">
          <svg
            className="w-72 sm:w-88 h-auto drop-shadow-lg"
            viewBox="0 0 360 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#EC4899" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="60"
              textAnchor="middle"
              fill="url(#titleGrad)"
              fontFamily="Jua, Outfit, sans-serif"
              fontSize="48"
              fontWeight="900"
              letterSpacing="2"
            >
              말랑 젤리트리스
            </text>
            <text
              x="50%"
              y="85"
              textAnchor="middle"
              fill="#64748B"
              fontFamily="Outfit, sans-serif"
              fontSize="13"
              fontWeight="600"
              letterSpacing="4"
            >
              MALANG JELLY TRIS
            </text>
          </svg>

          {/* Interactive Bouncing Mascots Cluster */}
          <div className="flex items-center gap-2 mt-2">
            {['I', 'O', 'T', 'S', 'Z'].map((type, i) => {
              const c = currentTheme.colors[type as 'I' | 'O' | 'T' | 'S' | 'Z'];
              return (
                <div
                  key={type}
                  style={{
                    backgroundColor: c.primary,
                    boxShadow: `0 3px 0 ${c.shadow}`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center animate-bounce [animation-duration:2.5s] relative cursor-pointer hover:scale-110 transition-transform"
                >
                  <div className="absolute top-1 left-1.5 w-3 h-1 rounded-full bg-white/60 pointer-events-none" />
                  <div className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-slate-900/80 inline-block" />
                    <span className="w-1 h-1 rounded-full bg-slate-900/80 inline-block" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tagline */}
        <p className="text-slate-600 text-xs sm:text-sm md:text-base font-medium max-w-md mx-auto mb-3 sm:mb-4">
          말랑쫀득한 블록들과 즐기는 초밀착 감성 테트리스! <br className="hidden sm:inline" />
          오늘도 행운 가득 럭키비키하게 갓벽한 콤보를 터뜨려보세요 🍀
        </p>

        {/* Best Records Strip */}
        {record.highScore > 0 && (
          <div className="flex items-center justify-center gap-4 sm:gap-6 p-2 sm:p-3 px-4 sm:px-6 mb-3 sm:mb-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-sm backdrop-blur-sm text-xs">
            <div className="flex items-center gap-1.5 text-amber-600 font-bold">
              <Trophy className="w-4 h-4" />
              <span>최고 점수</span>
              <span className="font-mono tabular-nums text-slate-800 font-extrabold text-sm">
                {record.highScore.toLocaleString()}
              </span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="text-slate-500">
              최다 라인 <span className="font-mono font-bold text-slate-800">{record.maxLines}</span>
            </div>
            <span className="text-slate-300">·</span>
            <div className="text-slate-500">
              최대 콤보 <span className="font-mono font-bold text-pink-600">x{record.maxCombo}</span>
            </div>
          </div>
        )}

        {/* Theme Picker Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/70 mb-4 sm:mb-5">
          {(Object.keys(THEMES) as ThemeId[]).map((id) => {
            const t = THEMES[id];
            const isSelected = t.id === currentTheme.id;
            return (
              <button
                key={id}
                onClick={() => onSelectTheme(id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-sm scale-102'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.badge} {t.name}
              </button>
            );
          })}
        </div>

        {/* Primary Start CTA Button */}
        <button
          onClick={onStartGame}
          className="group relative px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-purple-500/30 active:scale-95 transition-all flex items-center justify-center gap-2.5 sm:gap-3 cursor-pointer"
        >
          <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white transition-transform group-hover:scale-110" />
          <span>게임 시작하기</span>
        </button>

        {/* Start hotkey hint */}
        <p className="mt-1.5 text-[11px] sm:text-xs text-slate-400 font-medium">
          [ Space ] 또는 [ Enter ] 키를 눌러 바로 시작
        </p>
      </div>

      {/* Single Flat Control-Hint Line Footer */}
      <div className="w-full max-w-2xl text-center py-1 sm:py-2 text-[11px] sm:text-xs text-slate-400 font-mono tracking-tight z-10 border-t border-slate-200/60">
        ← → 이동 · ↓ 소프트드롭 · Space 즉시낙하 · ↑/Z 회전 · C 홀드 · Esc 일시정지
      </div>
    </div>
  );
};
