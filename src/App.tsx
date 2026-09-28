import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Board, Position, FloatingTextItem, GameStats, SpecialType, GemType } from './types/game';
import {
  BOARD_SIZE,
  createInitialBoard,
  findMatches,
  expandSpecialEffects,
  handleRainbowSwap,
  applyGravityAndRefill,
  hasPossibleMoves,
  findHintMove,
  shuffleBoard,
  getComboKoreanMessage,
} from './utils/gameLogic';
import { soundManager } from './utils/sound';
import { GameBoard } from './components/GameBoard';
import { GameHeader } from './components/GameHeader';
import { ParticleLayer, ParticleEffect } from './components/ParticleLayer';
import { FloatingTextLayer } from './components/FloatingTextLayer';
import { HowToPlayModal } from './components/HowToPlayModal';
import { GameOverModal } from './components/GameOverModal';

const GAME_DURATION = 60; // 60 seconds Time Attack

export default function App() {
  const [board, setBoard] = useState<Board>(() => createInitialBoard());
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('jewel_blast_high_score');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [combo, setCombo] = useState<number>(1);
  const [maxCombo, setMaxCombo] = useState<number>(1);
  const [matchesCount, setMatchesCount] = useState<number>(0);
  const [specialGemsUsed, setSpecialGemsUsed] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [hintPositions, setHintPositions] = useState<[Position, Position] | null>(null);
  const [hintCooldown, setHintCooldown] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // FX States
  const [particleTrigger, setParticleTrigger] = useState<ParticleEffect | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<FloatingTextItem[]>([]);
  const [activeLineBlast, setActiveLineBlast] = useState<{ row?: number; col?: number; color: string } | null>(null);
  const [activeBombBlast, setActiveBombBlast] = useState<{ row: number; col: number } | null>(null);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [shuffleNotice, setShuffleNotice] = useState<boolean>(false);

  // UI Modal States
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => soundManager.enabled);

  // Ref tracking current board in async cascades
  const boardRef = useRef<Board>(board);
  boardRef.current = board;

  const isProcessingRef = useRef<boolean>(false);
  isProcessingRef.current = isProcessing;

  // Add floating text
  const addFloatingText = (text: string, x: number, y: number, color?: string, fontSize?: string) => {
    const id = `float-${Date.now()}-${Math.random()}`;
    setFloatingTexts(prev => [...prev, { id, text, x, y, color, fontSize }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(item => item.id !== id));
    }, 850);
  };

  // Trigger brief screen shake
  const triggerScreenShake = () => {
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 350);
  };

  // Timer countdown hook
  useEffect(() => {
    if (isPaused || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameOver();
          return 0;
        }
        if (prev <= 6) {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isGameOver, score, highScore]);

  // Handle Game Over
  const handleGameOver = () => {
    setIsGameOver(true);
    soundManager.playGameOver();

    if (score > highScore) {
      setHighScore(score);
      setIsNewHighScore(true);
      localStorage.setItem('jewel_blast_high_score', String(score));
    } else {
      setIsNewHighScore(false);
    }
  };

  // Sound toggle
  const handleToggleSound = () => {
    const newState = soundManager.toggleSound();
    setSoundEnabled(newState);
  };

  // Request Hint
  const handleHint = () => {
    if (isProcessing || hintCooldown || isPaused || isGameOver) return;
    const hint = findHintMove(board);
    if (hint) {
      setHintPositions(hint);
      setHintCooldown(true);
      soundManager.playSelect();

      // Clear hint after 3 seconds
      setTimeout(() => {
        setHintPositions(null);
      }, 3000);

      // Re-enable hint button after 5 seconds cooldown
      setTimeout(() => {
        setHintCooldown(false);
      }, 5000);
    }
  };

  // Restart Game
  const handleRestart = () => {
    const newBoard = createInitialBoard();
    setBoard(newBoard);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCombo(1);
    setMaxCombo(1);
    setMatchesCount(0);
    setSpecialGemsUsed(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsNewHighScore(false);
    setSelectedPos(null);
    setHintPositions(null);
    setIsProcessing(false);
  };

  // Deep cascade loop: clears matches, spawns specials, applies gravity, and repeats
  const processCascades = useCallback(
    async (
      currentBoard: Board,
      currentCombo: number,
      lastMovedPos?: Position | null
    ) => {
      setIsProcessing(true);

      const matchResult = findMatches(currentBoard, lastMovedPos);

      // No matches found -> finish cascade
      if (matchResult.matchedPositions.length === 0) {
        setIsProcessing(false);
        setCombo(1);

        // Check if any possible moves remain
        if (!hasPossibleMoves(currentBoard)) {
          setShuffleNotice(true);
          setTimeout(() => {
            const shuffled = shuffleBoard(currentBoard);
            setBoard(shuffled);
            setShuffleNotice(false);
          }, 1200);
        }
        return;
      }

      // Expand matches with special gem abilities
      const { allCleared, clearedSpecialCount } = expandSpecialEffects(
        currentBoard,
        matchResult.matchedPositions
      );

      // Update statistics
      setMatchesCount(prev => prev + 1);
      if (clearedSpecialCount > 0) {
        setSpecialGemsUsed(prev => prev + clearedSpecialCount);
      }

      const matchCount = allCleared.length;
      const basePoints = matchCount * 100;
      const comboMultiplier = currentCombo;
      const pointsGained = basePoints * comboMultiplier;

      setScore(prev => {
        const nextScore = prev + pointsGained;
        if (nextScore > highScore) {
          setHighScore(nextScore);
          localStorage.setItem('jewel_blast_high_score', String(nextScore));
        }
        return nextScore;
      });

      // Sound & Screen Shake
      if (clearedSpecialCount > 0 || matchCount >= 5) {
        soundManager.playExplode();
        triggerScreenShake();
      } else {
        soundManager.playMatch(currentCombo);
      }

      // Audio for creating new special gems
      if (matchResult.specialsToCreate.length > 0) {
        soundManager.playSpecialCreate();
      }

      // Line / Bomb blast visual animations
      allCleared.forEach(pos => {
        const g = currentBoard[pos.row][pos.col];
        if (g?.special === 'horizontal_line') {
          setActiveLineBlast({ row: pos.row, color: '#38bdf8' });
        } else if (g?.special === 'vertical_line') {
          setActiveLineBlast({ col: pos.col, color: '#38bdf8' });
        } else if (g?.special === 'bomb') {
          setActiveBombBlast({ row: pos.row, col: pos.col });
        }
      });

      setTimeout(() => {
        setActiveLineBlast(null);
        setActiveBombBlast(null);
      }, 350);

      // Particle sparkles at cleared cells
      if (allCleared.length > 0) {
        const samplePos = allCleared[Math.floor(allCleared.length / 2)];
        const sampleGem = currentBoard[samplePos.row][samplePos.col];
        const colorMap: Record<GemType, string> = {
          ruby: '#ff4d6d',
          sapphire: '#00b4d8',
          emerald: '#10b981',
          topaz: '#fbbf24',
          amethyst: '#c084fc',
          amber: '#f97316',
        };
        const gemColor = sampleGem ? colorMap[sampleGem.type] : '#fef08a';

        // Spawn particles (scaled to board coordinate)
        const cellPercentX = (samplePos.col + 0.5) / BOARD_SIZE;
        const cellPercentY = (samplePos.row + 0.5) / BOARD_SIZE;
        setParticleTrigger({
          x: cellPercentX * 450,
          y: cellPercentY * 450,
          color: gemColor,
          count: Math.min(30, allCleared.length * 4),
        });

        // Floating score display
        addFloatingText(
          `+${pointsGained.toLocaleString()}`,
          cellPercentX * 360 + 50,
          cellPercentY * 360 + 50,
          '#fef08a',
          currentCombo > 2 ? '1.75rem' : '1.35rem'
        );
      }

      // Korean combo celebration banner
      const comboMessage = getComboKoreanMessage(currentCombo);
      if (comboMessage) {
        addFloatingText(
          `${currentCombo}연타! ${comboMessage.text}`,
          250,
          180,
          comboMessage.color,
          '1.9rem'
        );
      }

      // Gravity and refill
      const { newBoard } = applyGravityAndRefill(
        currentBoard,
        allCleared,
        matchResult.specialsToCreate
      );

      setBoard(newBoard);

      // Update max combo reached
      setMaxCombo(prev => Math.max(prev, currentCombo));
      setCombo(currentCombo + 1);

      // Cascade pause for drop animation
      await new Promise(res => setTimeout(res, 280));

      // Recursive cascade check with dropped gems
      await processCascades(newBoard, currentCombo + 1, null);
    },
    [highScore]
  );

  // Handle Gem Swap
  const handleSwap = async (pos1: Position, pos2: Position) => {
    if (isProcessingRef.current || isPaused || isGameOver) return;

    setHintPositions(null); // Clear any active hint

    const gem1 = board[pos1.row][pos1.col];
    const gem2 = board[pos2.row][pos2.col];
    if (!gem1 || !gem2) return;

    soundManager.playSwap();

    // Check Rainbow Swap (Activation)
    if (gem1.special === 'rainbow' || gem2.special === 'rainbow') {
      setIsProcessing(true);
      soundManager.playRainbowLaser();
      triggerScreenShake();

      const rainbowPos = gem1.special === 'rainbow' ? pos1 : pos2;
      const targetPos = gem1.special === 'rainbow' ? pos2 : pos1;
      const { clearedPositions, isDoubleRainbow } = handleRainbowSwap(
        board,
        rainbowPos,
        targetPos
      );

      const pointsGained = clearedPositions.length * 200;
      setScore(prev => prev + pointsGained);
      setSpecialGemsUsed(prev => prev + (isDoubleRainbow ? 2 : 1));

      addFloatingText(
        isDoubleRainbow ? '🌟 전체 대폭발! +10,000' : `무지개 폭발! +${pointsGained}`,
        250,
        220,
        '#ec4899',
        '1.8rem'
      );

      // Gravity and cascade
      const { newBoard } = applyGravityAndRefill(board, clearedPositions, []);
      setBoard(newBoard);

      await new Promise(res => setTimeout(res, 300));
      await processCascades(newBoard, 1, null);
      return;
    }

    // Regular Gem Swap: Test if creates a match
    const tempBoard = board.map(row => [...row]);
    tempBoard[pos1.row][pos1.col] = { ...gem2, row: pos1.row, col: pos1.col };
    tempBoard[pos2.row][pos2.col] = { ...gem1, row: pos2.row, col: pos2.col };

    const matches = findMatches(tempBoard, pos2);

    if (matches.matchedPositions.length > 0) {
      // Valid move! Apply swap and trigger cascade
      setBoard(tempBoard);
      setCombo(1);
      await processCascades(tempBoard, 1, pos2);
    } else {
      // Invalid move -> show quick feedback & bounce back
      soundManager.playInvalid();
      // Brief visual swap shake
      setBoard(tempBoard);
      setTimeout(() => {
        setBoard(boardRef.current);
      }, 180);
    }
  };

  const gameStats: GameStats = {
    score,
    highScore,
    combo,
    maxCombo,
    matchesCount,
    specialGemsUsed,
  };

  return (
    <main
      className={`min-h-screen w-full flex flex-col justify-between items-center bg-[#0d0907] text-slate-100 overflow-hidden relative select-none pb-4 ${
        screenShake ? 'animate-shake' : ''
      }`}
    >
      {/* Ambient jewel background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-amber-600/10 via-rose-600/10 to-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header and Controls */}
      <div className="w-full z-10 flex flex-col items-center">
        <GameHeader
          score={score}
          highScore={highScore}
          timeLeft={timeLeft}
          maxTime={GAME_DURATION}
          combo={combo}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onHint={handleHint}
          onRestart={handleRestart}
          onOpenHelp={() => setIsHelpOpen(true)}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(p => !p)}
          hintCooldown={hintCooldown}
        />
      </div>

      {/* Center Game Board Container */}
      <div className="relative w-full max-w-[500px] px-2 py-1 flex items-center justify-center z-10">
        <GameBoard
          board={board}
          onSwap={handleSwap}
          selectedPos={selectedPos}
          onSelect={setSelectedPos}
          hintPositions={hintPositions}
          isProcessing={isProcessing || isPaused || isGameOver}
          activeLineBlast={activeLineBlast}
          activeBombBlast={activeBombBlast}
        />

        {/* Particles Effect Layer */}
        <ParticleLayer trigger={particleTrigger} />

        {/* Floating Text Scores & Korean Combo Shouts */}
        <FloatingTextLayer items={floatingTexts} />

        {/* Shuffle Alert Banner */}
        {shuffleNotice && (
          <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
            <div className="px-6 py-3 rounded-2xl bg-amber-500/90 text-slate-950 font-game font-extrabold text-lg shadow-[0_0_30px_#f59e0b] border-2 border-white animate-bounce">
              🔄 움직일 수 있는 보석이 없어 보드를 섞습니다!
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-2 z-40 rounded-2xl bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-game font-extrabold text-white mb-2">일시 정지</div>
            <p className="text-xs text-slate-400 mb-6">잠시 휴식 중입니다.</p>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all active:scale-95"
            >
              게임 계속하기
            </button>
          </div>
        )}
      </div>

      {/* Footer Info & Quick Tips */}
      <footer className="w-full max-w-[500px] px-4 text-center text-xs text-slate-400 z-10 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          PC 드래그 & 모바일 터치 스와이프 지원
        </span>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="text-amber-400 hover:underline font-semibold"
        >
          특수 조합 안내 ↗
        </button>
      </footer>

      {/* Modals */}
      <HowToPlayModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <GameOverModal
        isOpen={isGameOver}
        stats={gameStats}
        isNewHighScore={isNewHighScore}
        onRestart={handleRestart}
      />
    </main>
  );
}
