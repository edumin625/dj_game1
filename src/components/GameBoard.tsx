import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Board, Position, Gem } from '../types/game';
import { BOARD_SIZE } from '../utils/gameLogic';
import { GemGraphic } from './Gems';

interface GameBoardProps {
  board: Board;
  onSwap: (pos1: Position, pos2: Position) => void;
  selectedPos: Position | null;
  onSelect: (pos: Position | null) => void;
  hintPositions: [Position, Position] | null;
  isProcessing: boolean;
  activeLineBlast: { row?: number; col?: number; color: string } | null;
  activeBombBlast: { row: number; col: number } | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onSwap,
  selectedPos,
  onSelect,
  hintPositions,
  isProcessing,
  activeLineBlast,
  activeBombBlast,
}) => {
  const boardRef = useRef<HTMLDivElement | null>(null);

  // Touch / Drag tracking
  const dragStartRef = useRef<{ x: number; y: number; pos: Position } | null>(null);

  // Check if position is highlighted by hint
  const isPosHinted = (r: number, c: number) => {
    if (!hintPositions) return false;
    const [p1, p2] = hintPositions;
    return (p1.row === r && p1.col === c) || (p2.row === r && p2.col === c);
  };

  // Convert client coordinate to board position
  const getCellFromEvent = (clientX: number, clientY: number): Position | null => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;

    const cellSize = rect.width / BOARD_SIZE;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
      return { row, col };
    }
    return null;
  };

  // Handle cell click / tap
  const handleCellClick = (r: number, c: number) => {
    if (isProcessing) return;

    if (!selectedPos) {
      onSelect({ row: r, col: c });
      return;
    }

    // If clicking same cell, deselect
    if (selectedPos.row === r && selectedPos.col === c) {
      onSelect(null);
      return;
    }

    // Check adjacency
    const rowDiff = Math.abs(selectedPos.row - r);
    const colDiff = Math.abs(selectedPos.col - c);

    if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
      onSwap(selectedPos, { row: r, col: c });
      onSelect(null);
    } else {
      // Select new cell instead
      onSelect({ row: r, col: c });
    }
  };

  // Unified Pointer events for mobile swipe & mouse drag
  const handlePointerDown = (e: React.PointerEvent, r: number, c: number) => {
    if (isProcessing) return;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      pos: { row: r, col: c },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isProcessing || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const threshold = 22; // Drag sensitivity in pixels

    if (Math.hypot(dx, dy) >= threshold) {
      const { pos } = dragStartRef.current;
      dragStartRef.current = null; // Consume drag

      let targetPos: Position | null = null;
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0 && pos.col < BOARD_SIZE - 1) {
          targetPos = { row: pos.row, col: pos.col + 1 };
        } else if (dx < 0 && pos.col > 0) {
          targetPos = { row: pos.row, col: pos.col - 1 };
        }
      } else {
        // Vertical swipe
        if (dy > 0 && pos.row < BOARD_SIZE - 1) {
          targetPos = { row: pos.row + 1, col: pos.col };
        } else if (dy < 0 && pos.row > 0) {
          targetPos = { row: pos.row - 1, col: pos.col };
        }
      }

      if (targetPos) {
        onSwap(pos, targetPos);
        onSelect(null);
      }
    }
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
  };

  return (
    <div className="relative w-full max-w-[500px] mx-auto aspect-square select-none p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-[#2a1b12] via-[#1a110a] to-[#0d0805] shadow-[0_12px_40px_rgba(0,0,0,0.85)] border-4 border-[#78532c]">
      {/* Board golden inner frame */}
      <div className="absolute inset-1 rounded-xl border border-[#b8860b]/40 pointer-events-none" />

      {/* Grid cells container */}
      <div
        ref={boardRef}
        className="game-grid grid grid-cols-8 grid-rows-8 w-full h-full relative rounded-lg overflow-hidden bg-[#24170d]"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Render Cells */}
        {board.map((row, r) =>
          row.map((gem, c) => {
            const isSelected = selectedPos?.row === r && selectedPos?.col === c;
            const isHinted = isPosHinted(r, c);
            const isAlt = (r + c) % 2 === 1;

            return (
              <div
                key={`cell-${r}-${c}`}
                className={`relative flex items-center justify-center p-1 cursor-pointer transition-colors duration-150 border-[0.5px] border-[#442c16]/70 ${
                  isAlt ? 'bg-[#2b1c10]/80' : 'bg-[#362314]/90'
                } hover:bg-[#4a311b]/80`}
                onClick={() => handleCellClick(r, c)}
                onPointerDown={e => handlePointerDown(e, r, c)}
              >
                {/* Cell inner glow & bevel effect matching user reference image */}
                <div className="absolute inset-[1px] rounded bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                {gem && (
                  <div
                    className={`w-full h-full flex items-center justify-center transform transition-transform duration-200 ${
                      gem.isNew ? 'scale-100 animate-in fade-in duration-300' : ''
                    }`}
                  >
                    <GemGraphic
                      type={gem.type}
                      special={gem.special}
                      isSelected={isSelected}
                      isHinted={isHinted}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Visual Line Blast Effect */}
        {activeLineBlast && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {activeLineBlast.row !== undefined && (
              <div
                className="absolute left-0 right-0 h-[12.5%] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_25px_#22d3ee] animate-pulse opacity-90 transition-all duration-300"
                style={{ top: `${(activeLineBlast.row / BOARD_SIZE) * 100}%` }}
              />
            )}
            {activeLineBlast.col !== undefined && (
              <div
                className="absolute top-0 bottom-0 w-[12.5%] bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_25px_#22d3ee] animate-pulse opacity-90 transition-all duration-300"
                style={{ left: `${(activeLineBlast.col / BOARD_SIZE) * 100}%` }}
              />
            )}
          </div>
        )}

        {/* Visual Bomb Blast Effect */}
        {activeBombBlast && (
          <div
            className="absolute rounded-full pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 border-4 border-amber-400 bg-amber-500/30 shadow-[0_0_35px_#f59e0b] animate-ping"
            style={{
              left: `${((activeBombBlast.col + 0.5) / BOARD_SIZE) * 100}%`,
              top: `${((activeBombBlast.row + 0.5) / BOARD_SIZE) * 100}%`,
              width: '37.5%',
              height: '37.5%',
            }}
          />
        )}
      </div>
    </div>
  );
};
