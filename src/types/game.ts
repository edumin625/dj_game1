export type GemType = 'ruby' | 'sapphire' | 'emerald' | 'topaz' | 'amethyst' | 'amber';

export type SpecialType = 'none' | 'horizontal_line' | 'vertical_line' | 'bomb' | 'rainbow';

export interface Gem {
  id: string; // Unique id for React keys and motion animation tracking
  type: GemType;
  special: SpecialType;
  row: number;
  col: number;
  isMatched?: boolean;
  isHighlighted?: boolean;
  isNew?: boolean;
}

export type Board = (Gem | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface MatchGroup {
  type: GemType;
  positions: Position[];
  isHorizontal: boolean;
  isVertical: boolean;
  specialToCreate?: {
    position: Position;
    special: SpecialType;
  };
}

export interface FloatingTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  color?: string;
  fontSize?: string;
}

export interface ParticleItem {
  id: string;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  size: number;
  life: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  matchesCount: number;
  specialGemsUsed: number;
}

export type GameMode = 'time_attack' | 'classic';
