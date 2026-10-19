export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface Point {
  x: number;
  y: number;
}

export interface ActivePiece {
  type: TetrominoType;
  x: number;
  y: number;
  rotation: number; // 0, 1, 2, 3
  shape: number[][];
}

export type ThemeId = 'candy' | 'kitty' | 'y2k';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  badge: string;
  colors: Record<TetrominoType, {
    primary: string;
    light: string;
    dark: string;
    shadow: string;
    eyeColor: string;
  }>;
  gridBg: string;
  gridBorder: string;
  gridLine: string;
  bgGradient: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  shape: 'circle' | 'star' | 'heart' | 'sparkle';
}

export interface FloatingText {
  id: string;
  text: string;
  subtext?: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  alpha: number;
  createdAt: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  lines: number;
  level: number;
  combo: number;
  maxCombo: number;
  singleCount: number;
  doubleCount: number;
  tripleCount: number;
  tetrisCount: number;
}

export interface StoredRecord {
  highScore: number;
  totalGames: number;
  maxCombo: number;
  maxLines: number;
}
