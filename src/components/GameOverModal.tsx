import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Award, Flame, Sparkles } from 'lucide-react';
import { GameStats } from '../types/game';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameStats;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  isNewHighScore,
  onRestart,
}) => {
  useEffect(() => {
    if (isOpen) {
      if (isNewHighScore) {
        // Grand confetti burst
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
      } else {
        // Standard celebratory sparks
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.65 },
        });
      }
    }
  }, [isOpen, isNewHighScore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-center flex flex-col items-center">
        {/* Top Trophy Icon */}
        <div className="relative -mt-12 mb-3">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 p-1 shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center animate-bounce">
            <Trophy className="w-10 h-10 text-white drop-shadow" />
          </div>
          {isNewHighScore && (
            <div className="absolute -top-2 -right-3 bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-white/40">
              NEW!
            </div>
          )}
        </div>

        <h2 className="text-2xl font-game font-extrabold text-white mb-1">
          {isNewHighScore ? '최고 기록 달성!' : '타임 오버!'}
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          {isNewHighScore
            ? '대단해요! 새로운 최고 점수를 갱신했습니다!'
            : '보석 매치 대결이 끝났습니다. 멋진 플레이였습니다!'}
        </p>

        {/* Final Score Card */}
        <div className="w-full bg-slate-800/80 rounded-2xl p-4 border border-slate-700/70 mb-4 shadow-inner">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">최종 획득 점수</span>
          <div className="text-4xl font-game font-black text-amber-400 tracking-tight mt-1">
            {stats.score.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>역대 최고 점수: <b className="text-white">{stats.highScore.toLocaleString()}</b></span>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="w-full grid grid-cols-3 gap-2 mb-6 text-center">
          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/40">
            <div className="flex items-center justify-center gap-1 text-[10px] text-rose-400 mb-1">
              <Flame className="w-3 h-3" />
              <span>최대 콤보</span>
            </div>
            <div className="text-lg font-bold text-white">{stats.maxCombo}연타</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/40">
            <div className="flex items-center justify-center gap-1 text-[10px] text-cyan-400 mb-1">
              <Sparkles className="w-3 h-3" />
              <span>매치 횟수</span>
            </div>
            <div className="text-lg font-bold text-white">{stats.matchesCount}회</div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-2.5 border border-slate-700/40">
            <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 mb-1">
              <span>💎</span>
              <span>특수 보석</span>
            </div>
            <div className="text-lg font-bold text-white">{stats.specialGemsUsed}개</div>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-2xl font-game font-extrabold text-white text-base bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 active:scale-95 transition-all shadow-[0_8px_25px_rgba(244,63,94,0.4)] flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          다시 도전하기
        </button>
      </div>
    </div>
  );
};
