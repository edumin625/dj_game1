import { Board, Gem, GemType, MatchGroup, Position, SpecialType } from '../types/game';

export const BOARD_SIZE = 8;
export const GEM_TYPES: GemType[] = ['ruby', 'sapphire', 'emerald', 'topaz', 'amethyst', 'amber'];

let idCounter = 1;
export const generateId = () => `gem-${Date.now()}-${idCounter++}-${Math.random().toString(36).substr(2, 5)}`;

export const getRandomGemType = (): GemType => {
  const index = Math.floor(Math.random() * GEM_TYPES.length);
  return GEM_TYPES[index];
};

/**
 * Creates an 8x8 board with no initial matches
 */
export const createInitialBoard = (): Board => {
  const board: Board = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: (Gem | null)[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      let type: GemType;
      do {
        type = getRandomGemType();
      } while (
        (c >= 2 && row[c - 1]?.type === type && row[c - 2]?.type === type) ||
        (r >= 2 && board[r - 1][c]?.type === type && board[r - 2][c]?.type === type)
      );

      row.push({
        id: generateId(),
        type,
        special: 'none',
        row: r,
        col: c,
      });
    }
    board.push(row);
  }

  // Ensure at least one valid move exists on start
  if (!hasPossibleMoves(board)) {
    return createInitialBoard();
  }

  return board;
};

/**
 * Checks if two positions are adjacent horizontally or vertically
 */
export const isAdjacent = (pos1: Position, pos2: Position): boolean => {
  const rowDiff = Math.abs(pos1.row - pos2.row);
  const colDiff = Math.abs(pos1.col - pos2.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
};

/**
 * Scans board and detects all match groups (horizontal & vertical matches >= 3)
 */
export const findMatches = (
  board: Board,
  lastMovedPos?: Position | null
): {
  matchedPositions: Position[];
  specialsToCreate: { position: Position; special: SpecialType; type: GemType }[];
} => {
  const horizontalMatches: Position[][] = [];
  const verticalMatches: Position[][] = [];

  // 1. Check Horizontal Matches
  for (let r = 0; r < BOARD_SIZE; r++) {
    let matchLen = 1;
    for (let c = 0; c < BOARD_SIZE; c++) {
      const current = board[r][c];
      const next = c < BOARD_SIZE - 1 ? board[r][c + 1] : null;

      if (current && next && current.type === next.type) {
        matchLen++;
      } else {
        if (matchLen >= 3) {
          const group: Position[] = [];
          for (let i = 0; i < matchLen; i++) {
            group.push({ row: r, col: c - i });
          }
          horizontalMatches.push(group);
        }
        matchLen = 1;
      }
    }
  }

  // 2. Check Vertical Matches
  for (let c = 0; c < BOARD_SIZE; c++) {
    let matchLen = 1;
    for (let r = 0; r < BOARD_SIZE; r++) {
      const current = board[r][c];
      const next = r < BOARD_SIZE - 1 ? board[r + 1][c] : null;

      if (current && next && current.type === next.type) {
        matchLen++;
      } else {
        if (matchLen >= 3) {
          const group: Position[] = [];
          for (let i = 0; i < matchLen; i++) {
            group.push({ row: r - i, col: c });
          }
          verticalMatches.push(group);
        }
        matchLen = 1;
      }
    }
  }

  const allMatchedSet = new Set<string>();
  const specialsToCreate: { position: Position; special: SpecialType; type: GemType }[] = [];

  const posKey = (p: Position) => `${p.row},${p.col}`;

  // Helper to find intersection between horizontal and vertical (for L or T bomb creation)
  const allGroups = [...horizontalMatches, ...verticalMatches];

  // Check for 5-in-a-row straight (Rainbow)
  for (const group of horizontalMatches) {
    if (group.length >= 5) {
      const targetPos = (lastMovedPos && group.some(p => p.row === lastMovedPos.row && p.col === lastMovedPos.col))
        ? lastMovedPos
        : group[Math.floor(group.length / 2)];
      const gemType = board[targetPos.row][targetPos.col]?.type || 'ruby';
      specialsToCreate.push({ position: targetPos, special: 'rainbow', type: gemType });
    }
  }
  for (const group of verticalMatches) {
    if (group.length >= 5) {
      const targetPos = (lastMovedPos && group.some(p => p.row === lastMovedPos.row && p.col === lastMovedPos.col))
        ? lastMovedPos
        : group[Math.floor(group.length / 2)];
      const gemType = board[targetPos.row][targetPos.col]?.type || 'ruby';
      specialsToCreate.push({ position: targetPos, special: 'rainbow', type: gemType });
    }
  }

  // Check for T or L intersections (Bomb)
  for (const hGroup of horizontalMatches) {
    for (const vGroup of verticalMatches) {
      const intersection = hGroup.find(hp => vGroup.some(vp => vp.row === hp.row && vp.col === hp.col));
      if (intersection) {
        const gemType = board[intersection.row][intersection.col]?.type || 'ruby';
        // Avoid duplicate special at same position
        if (!specialsToCreate.some(s => s.position.row === intersection.row && s.position.col === intersection.col)) {
          specialsToCreate.push({ position: intersection, special: 'bomb', type: gemType });
        }
      }
    }
  }

  // Check for 4-in-a-row (Line Blasters)
  for (const group of horizontalMatches) {
    if (group.length === 4) {
      const targetPos = (lastMovedPos && group.some(p => p.row === lastMovedPos.row && p.col === lastMovedPos.col))
        ? lastMovedPos
        : group[1];
      const gemType = board[targetPos.row][targetPos.col]?.type || 'ruby';
      if (!specialsToCreate.some(s => s.position.row === targetPos.row && s.position.col === targetPos.col)) {
        specialsToCreate.push({ position: targetPos, special: 'vertical_line', type: gemType });
      }
    }
  }

  for (const group of verticalMatches) {
    if (group.length === 4) {
      const targetPos = (lastMovedPos && group.some(p => p.row === lastMovedPos.row && p.col === lastMovedPos.col))
        ? lastMovedPos
        : group[1];
      const gemType = board[targetPos.row][targetPos.col]?.type || 'ruby';
      if (!specialsToCreate.some(s => s.position.row === targetPos.row && s.position.col === targetPos.col)) {
        specialsToCreate.push({ position: targetPos, special: 'horizontal_line', type: gemType });
      }
    }
  }

  // Collect all unique matched positions
  allGroups.forEach(group => {
    group.forEach(pos => {
      allMatchedSet.add(posKey(pos));
    });
  });

  const matchedPositions: Position[] = Array.from(allMatchedSet).map(str => {
    const [row, col] = str.split(',').map(Number);
    return { row, col };
  });

  return {
    matchedPositions,
    specialsToCreate,
  };
};

/**
 * Expands cleared positions if any matched gem has a special ability
 */
export const expandSpecialEffects = (
  board: Board,
  initialCleared: Position[]
): {
  allCleared: Position[];
  clearedSpecialCount: number;
} => {
  const clearedSet = new Set<string>(initialCleared.map(p => `${p.row},${p.col}`));
  const toProcess: Position[] = [...initialCleared];
  let clearedSpecialCount = 0;

  while (toProcess.length > 0) {
    const pos = toProcess.pop()!;
    const gem = board[pos.row][pos.col];
    if (!gem || gem.special === 'none') continue;

    clearedSpecialCount++;

    // Horizontal line blast: clears entire row
    if (gem.special === 'horizontal_line') {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const key = `${pos.row},${c}`;
        if (!clearedSet.has(key)) {
          clearedSet.add(key);
          toProcess.push({ row: pos.row, col: c });
        }
      }
    }

    // Vertical line blast: clears entire column
    if (gem.special === 'vertical_line') {
      for (let r = 0; r < BOARD_SIZE; r++) {
        const key = `${r},${pos.col}`;
        if (!clearedSet.has(key)) {
          clearedSet.add(key);
          toProcess.push({ row: r, col: pos.col });
        }
      }
    }

    // Bomb blast: clears 3x3 surrounding + diagonals
    if (gem.special === 'bomb') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = pos.row + dr;
          const nc = pos.col + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            const key = `${nr},${nc}`;
            if (!clearedSet.has(key)) {
              clearedSet.add(key);
              toProcess.push({ row: nr, col: nc });
            }
          }
        }
      }
    }
  }

  const allCleared = Array.from(clearedSet).map(str => {
    const [row, col] = str.split(',').map(Number);
    return { row, col };
  });

  return { allCleared, clearedSpecialCount };
};

/**
 * Handle rainbow hypercube swap: clears all gems of the target color
 */
export const handleRainbowSwap = (
  board: Board,
  rainbowPos: Position,
  targetPos: Position
): {
  clearedPositions: Position[];
  isDoubleRainbow: boolean;
} => {
  const gem1 = board[rainbowPos.row][rainbowPos.col];
  const gem2 = board[targetPos.row][targetPos.col];

  // Double rainbow cleans whole board!
  if (gem1?.special === 'rainbow' && gem2?.special === 'rainbow') {
    const allPositions: Position[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        allPositions.push({ row: r, col: c });
      }
    }
    return { clearedPositions: allPositions, isDoubleRainbow: true };
  }

  const targetType = gem1?.special === 'rainbow' ? gem2?.type : gem1?.type;
  const cleared: Position[] = [rainbowPos, targetPos];

  if (targetType) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c]?.type === targetType) {
          cleared.push({ row: r, col: c });
        }
      }
    }
  }

  return { clearedPositions: cleared, isDoubleRainbow: false };
};

/**
 * Simulates gravity: gems fall downward into empty spaces, and new gems spawn from the top
 */
export const applyGravityAndRefill = (
  board: Board,
  clearedPositions: Position[],
  specialsToCreate: { position: Position; special: SpecialType; type: GemType }[]
): {
  newBoard: Board;
  newGemsSpawned: number;
} => {
  // Deep clone board
  const newBoard: Board = board.map(row => row.map(gem => (gem ? { ...gem } : null)));

  // Remove cleared gems
  clearedPositions.forEach(p => {
    newBoard[p.row][p.col] = null;
  });

  // Re-place special gems created by matches
  specialsToCreate.forEach(s => {
    newBoard[s.position.row][s.position.col] = {
      id: generateId(),
      type: s.type,
      special: s.special,
      row: s.position.row,
      col: s.position.col,
      isNew: true,
    };
  });

  let newGemsSpawned = 0;

  // For each column, drop existing gems down
  for (let c = 0; c < BOARD_SIZE; c++) {
    let emptyRow = BOARD_SIZE - 1;

    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (newBoard[r][c] !== null) {
        if (r !== emptyRow) {
          newBoard[emptyRow][c] = {
            ...newBoard[r][c]!,
            row: emptyRow,
            col: c,
          };
          newBoard[r][c] = null;
        }
        emptyRow--;
      }
    }

    // Fill top empty spaces with newly generated gems
    for (let r = emptyRow; r >= 0; r--) {
      newBoard[r][c] = {
        id: generateId(),
        type: getRandomGemType(),
        special: 'none',
        row: r,
        col: c,
        isNew: true,
      };
      newGemsSpawned++;
    }
  }

  return { newBoard, newGemsSpawned };
};

/**
 * Validates if any valid move exists on the current board
 */
export const hasPossibleMoves = (board: Board): boolean => {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const gem = board[r][c];
      if (!gem) continue;

      // Rainbow gem can always be swapped with any adjacent gem
      if (gem.special === 'rainbow') return true;

      // Try swapping with right neighbor
      if (c < BOARD_SIZE - 1) {
        if (testSwapCreatesMatch(board, { row: r, col: c }, { row: r, col: c + 1 })) {
          return true;
        }
      }

      // Try swapping with down neighbor
      if (r < BOARD_SIZE - 1) {
        if (testSwapCreatesMatch(board, { row: r, col: c }, { row: r + 1, col: c })) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 * Finds a valid move to provide a hint to the user
 */
export const findHintMove = (board: Board): [Position, Position] | null => {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const gem = board[r][c];
      if (!gem) continue;

      if (gem.special === 'rainbow' && c < BOARD_SIZE - 1) {
        return [{ row: r, col: c }, { row: r, col: c + 1 }];
      }

      if (c < BOARD_SIZE - 1) {
        if (testSwapCreatesMatch(board, { row: r, col: c }, { row: r, col: c + 1 })) {
          return [{ row: r, col: c }, { row: r, col: c + 1 }];
        }
      }

      if (r < BOARD_SIZE - 1) {
        if (testSwapCreatesMatch(board, { row: r, col: c }, { row: r + 1, col: c })) {
          return [{ row: r, col: c }, { row: r + 1, col: c }];
        }
      }
    }
  }
  return null;
};

const testSwapCreatesMatch = (board: Board, p1: Position, p2: Position): boolean => {
  const g1 = board[p1.row][p1.col];
  const g2 = board[p2.row][p2.col];
  if (!g1 || !g2) return false;

  if (g1.special === 'rainbow' || g2.special === 'rainbow') return true;

  // Virtual swap
  const tempBoard = board.map(row => [...row]);
  tempBoard[p1.row][p1.col] = { ...g2, row: p1.row, col: p1.col };
  tempBoard[p2.row][p2.col] = { ...g1, row: p2.row, col: p2.col };

  const matches = findMatches(tempBoard);
  return matches.matchedPositions.length > 0;
};

/**
 * Reshuffle board in place if no moves remain
 */
export const shuffleBoard = (board: Board): Board => {
  const flatGems = board.flat().filter(g => g !== null) as Gem[];

  // Fisher-Yates shuffle
  for (let i = flatGems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flatGems[i], flatGems[j]] = [flatGems[j], flatGems[i]];
  }

  const newBoard: Board = [];
  let index = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    const row: (Gem | null)[] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      const gem = flatGems[index++];
      row.push({
        ...gem,
        row: r,
        col: c,
      });
    }
    newBoard.push(row);
  }

  // If newly shuffled still has no moves or has matches, create fresh
  if (!hasPossibleMoves(newBoard) || findMatches(newBoard).matchedPositions.length > 0) {
    return createInitialBoard();
  }

  return newBoard;
};

/**
 * Korean feedback message for combo cascades based on user request!
 */
export const getComboKoreanMessage = (combo: number): { text: string; color: string } | null => {
  if (combo === 2) {
    return { text: '멋져요!', color: '#38bdf8' }; // Nice
  } else if (combo === 3) {
    return { text: '대박!', color: '#f59e0b' }; // Great
  } else if (combo === 4) {
    return { text: '환상적이에요!', color: '#ec4899' }; // Fantastic
  } else if (combo >= 5) {
    return { text: '놀라워요! 전설적인 연타!', color: '#a855f7' }; // Amazing / Legendary
  }
  return null;
};
