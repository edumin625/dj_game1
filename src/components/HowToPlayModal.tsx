import React from 'react';
import { X, Sparkles, Zap, Flame, Bomb } from 'lucide-react';
import { GemGraphic } from './Gems';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-5 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">게임 규칙 & 팁</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-4 py-3 text-sm text-slate-300 pr-1">
          {/* Basic Controls */}
          <div>
            <h3 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
              🎮 조작 방법 (PC & 모바일 완벽 대응)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              • 보석을 터치(클릭)한 후 인접한 보석을 터치하여 위치를 바꿉니다.
              <br />• 또는 원하는 보석을 상·하·좌·우로 <b>드래그 / 스와이프</b>하여 즉시 교환할 수 있습니다.
            </p>
          </div>

          {/* Time Attack */}
          <div>
            <h3 className="font-bold text-cyan-400 mb-1 flex items-center gap-1.5">
              ⏱️ 타임 어택 모드
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              • 주어진 <b>60초</b> 동안 최대한 높은 점수를 달성하세요!
              <br />• 특수 보석을 터뜨리거나 연속 콤보를 달성하면 추가 보너스 점수가 가산됩니다.
            </p>
          </div>

          {/* Special Jewels */}
          <div>
            <h3 className="font-bold text-rose-400 mb-2 flex items-center gap-1.5">
              ✨ 특수 보석 조합
            </h3>
            <div className="space-y-2">
              {/* Line Blaster */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-10 h-10 flex-shrink-0">
                  <GemGraphic type="sapphire" special="horizontal_line" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    라인 블래스터 (4개 일렬 매치)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    가로 또는 세로 한 줄 전체를 시원하게 일괄 파괴합니다.
                  </div>
                </div>
              </div>

              {/* Bomb */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-10 h-10 flex-shrink-0">
                  <GemGraphic type="ruby" special="bomb" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1">
                    <Bomb className="w-3.5 h-3.5 text-amber-400" />
                    보석 폭탄 (T자 / L자 매치)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    주변 3x3 범위와 십자 방향 보석들을 일제히 폭파합니다.
                  </div>
                </div>
              </div>

              {/* Rainbow Hypercube */}
              <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <div className="w-10 h-10 flex-shrink-0">
                  <GemGraphic type="amber" special="rainbow" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-pink-400" />
                    무지개 큐브 (5개 일렬 매치)
                  </div>
                  <div className="text-[11px] text-slate-400">
                    바꿔친 색상의 모든 보석을 화면 전체에서 소멸시킵니다!
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Korean Combo Feedback */}
          <div>
            <h3 className="font-bold text-emerald-400 mb-1">
              🔥 연속 콤보 칭찬 멘트
            </h3>
            <p className="text-xs text-slate-400">
              2연타: <span className="text-cyan-300 font-semibold">멋져요!</span> · 3연타: <span className="text-amber-300 font-semibold">대박!</span> · 4연타: <span className="text-pink-300 font-semibold">환상적이에요!</span> · 5연타+: <span className="text-purple-300 font-semibold">놀라워요! 전설적인 연타!</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
          >
            확인하고 게임하기
          </button>
        </div>
      </div>
    </div>
  );
};
