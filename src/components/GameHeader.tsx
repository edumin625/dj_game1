import React from 'react';
import { Volume2, VolumeX, Sparkles, RotateCcw, HelpCircle, Pause, Play, Trophy, Flame } from 'lucide-react';

interface GameHeaderProps {
  score: number;
  highScore: number;
  timeLeft: number;
  maxTime: number;
  combo: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onHint: () => void;
  onRestart: () => void;
  onOpenHelp: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  hintCooldown: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  score,
  highScore,
  timeLeft,
  maxTime,
  combo,
  soundEnabled,
  onToggleSound,
  onHint,
  onRestart,
  onOpenHelp,
  isPaused,
  onTogglePause,
  hintCooldown,
}) => {
  const timePercent = Math.max(0, Math.min(100, (timeLeft / maxTime) * 100));
  const isUrgent = timeLeft <= 10 && timeLeft > 0;

  return (
    <header className="w-full max-w-[500px] mx-auto flex flex-col gap-2 pt-2 px-2 select-none">
      {/* Top Bar: Title & Utility Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 p-0.5 shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center justify-center">
            <span className="text-lg">💎</span>
          </div>
          <div>
            <h1 className="text-xl font-game font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 bg-clip-text text-transparent">
              쥬얼 블래스트
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onHint}
            disabled={hintCooldown || isPaused}
            title="힌트 보기"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700/60 text-amber-300 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            <Sparkles className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleSound}
            title={soundEnabled ? '음소거' : '소리 켜기'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700/60 text-slate-200 transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          <button
            onClick={onTogglePause}
            title={isPaused ? '계속하기' : '일시정지'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700/60 text-slate-200 transition-all"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={onRestart}
            title="다시 시작"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700/60 text-slate-200 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenHelp}
            title="게임 방법"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-slate-700/60 text-slate-300 transition-all"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Score & Combo Dashboard */}
      <div className="grid grid-cols-3 gap-2 py-1">
        {/* Current Score */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/80 shadow-inner flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">점수</span>
          <span className="text-xl sm:text-2xl font-game font-extrabold text-amber-400 tracking-tight">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Combo Multiplier */}
        <div className={`rounded-xl p-2 border shadow-inner flex flex-col items-center justify-center transition-all ${
          combo > 1
            ? 'bg-rose-950/60 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse'
            : 'bg-slate-900/80 border-slate-800/80'
        }`}>
          <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {combo > 1 && <Flame className="w-3 h-3 text-rose-500 animate-bounce" />}
            <span>연타 콤보</span>
          </div>
          <span className={`text-xl sm:text-2xl font-game font-extrabold tracking-tight ${
            combo > 1 ? 'text-rose-400' : 'text-slate-500'
          }`}>
            {combo > 1 ? `${combo}x` : '-'}
          </span>
        </div>

        {/* High Score */}
        <div className="bg-slate-900/80 rounded-xl p-2 border border-slate-800/80 shadow-inner flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-semibold uppercase tracking-wider">
            <Trophy className="w-3 h-3" />
            <span>최고 기록</span>
          </div>
          <span className="text-xl sm:text-2xl font-game font-extrabold text-slate-200 tracking-tight">
            {highScore.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Time Attack Progress Bar */}
      <div className="relative w-full bg-slate-950 rounded-full h-4 p-0.5 border border-slate-800 shadow-inner overflow-hidden flex items-center">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isUrgent
              ? 'bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse shadow-[0_0_10px_#ef4444]'
              : 'bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
          }`}
          style={{ width: `${timePercent}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
          {timeLeft > 0 ? `남은 시간: ${timeLeft}초` : '시간 종료!'}
        </div>
      </div>
    </header>
  );
};
