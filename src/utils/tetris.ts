import { TetrominoType, ActivePiece, ThemeConfig, ThemeId } from '../types/tetris';

export const COLS = 10;
export const ROWS = 20;
export const BUFFER_ROWS = 2; // Hidden rows on top
export const TOTAL_ROWS = ROWS + BUFFER_ROWS;

// Standard Tetromino shapes
export const TETROMINOES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

// 3 Curated Pastel / MZ Aesthetic Themes
export const THEMES: Record<ThemeId, ThemeConfig> = {
  candy: {
    id: 'candy',
    name: '말랑 마카롱',
    tagline: '달콤 포근한 파스텔 젤리 캔디',
    badge: '🍬 Sweet',
    colors: {
      I: { primary: '#38BDF8', light: '#BAE6FD', dark: '#0284C7', shadow: '#0369A1', eyeColor: '#0C4A6E' }, // Sky Cyan
      O: { primary: '#FBBF24', light: '#FEF08A', dark: '#D97706', shadow: '#B45309', eyeColor: '#78350F' }, // Butter Yellow
      T: { primary: '#C084FC', light: '#F3E8FF', dark: '#9333EA', shadow: '#7E22CE', eyeColor: '#581C87' }, // Lavender Violet
      S: { primary: '#4ADE80', light: '#BBF7D0', dark: '#16A34A', shadow: '#15803D', eyeColor: '#14532D' }, // Mint Soda
      Z: { primary: '#FB7185', light: '#FFE4E6', dark: '#E11D48', shadow: '#BE123C', eyeColor: '#881337' }, // Strawberry Pink
      J: { primary: '#818CF8', light: '#E0E7FF', dark: '#4F46E5', shadow: '#4338CA', eyeColor: '#312E81' }, // Blueberry Indigo
      L: { primary: '#FB923C', light: '#FFEDD5', dark: '#EA580C', shadow: '#C2410C', eyeColor: '#7C2D12' }, // Peach Tangerine
    },
    gridBg: '#FFFDF9',
    gridBorder: '#F3E8DF',
    gridLine: 'rgba(230, 218, 206, 0.45)',
    bgGradient: 'from-[#FFF7ED] via-[#FDF2F8] to-[#F0FDF4]',
  },
  kitty: {
    id: 'kitty',
    name: '젤리 냥이 카페',
    tagline: '포근한 고양이 발바닥과 젤리 빔',
    badge: '🐾 Kawaii',
    colors: {
      I: { primary: '#67E8F9', light: '#CFFAFE', dark: '#0891B2', shadow: '#0E7490', eyeColor: '#164E63' },
      O: { primary: '#FCD34D', light: '#FEF3C7', dark: '#F59E0B', shadow: '#D97706', eyeColor: '#78350F' },
      T: { primary: '#E879F9', light: '#FAE8FF', dark: '#C026D3', shadow: '#A21CAF', eyeColor: '#701A75' },
      S: { primary: '#86EFAC', light: '#DCFCE7', dark: '#22C55E', shadow: '#16A34A', eyeColor: '#14532D' },
      Z: { primary: '#F472B6', light: '#FCE7F3', dark: '#DB2777', shadow: '#BE185D', eyeColor: '#831843' },
      J: { primary: '#A5B4FC', light: '#EEF2FF', dark: '#6366F1', shadow: '#4F46E5', eyeColor: '#312E81' },
      L: { primary: '#FDBA74', light: '#FFEDD5', dark: '#F97316', shadow: '#EA580C', eyeColor: '#7C2D12' },
    },
    gridBg: '#FFFDF5',
    gridBorder: '#F5E6D3',
    gridLine: 'rgba(235, 215, 195, 0.45)',
    bgGradient: 'from-[#FFF1F2] via-[#FAF5FF] to-[#EFF6FF]',
  },
  y2k: {
    id: 'y2k',
    name: '사이버 팝 Y2K',
    tagline: '힙하고 짜릿한 네온 파스텔 바이브',
    badge: '⚡ Y2K Pop',
    colors: {
      I: { primary: '#22D3EE', light: '#A5F3FC', dark: '#06B6D4', shadow: '#0891B2', eyeColor: '#155E75' },
      O: { primary: '#FACC15', light: '#FEF08A', dark: '#EAB308', shadow: '#CA8A04', eyeColor: '#713F12' },
      T: { primary: '#D946EF', light: '#F5D0FE', dark: '#C026D3', shadow: '#A21CAF', eyeColor: '#581C87' },
      S: { primary: '#2DD4BF', light: '#99F6E4', dark: '#0D9488', shadow: '#0F766E', eyeColor: '#134E4A' },
      Z: { primary: '#F43F5E', light: '#FECDD3', dark: '#E11D48', shadow: '#BE123C', eyeColor: '#881337' },
      J: { primary: '#6366F1', light: '#C7D2FE', dark: '#4F46E5', shadow: '#3730A3', eyeColor: '#1E1B4B' },
      L: { primary: '#FB923C', light: '#FFEDD5', dark: '#F97316', shadow: '#C2410C', eyeColor: '#7C2D12' },
    },
    gridBg: '#F8FAFC',
    gridBorder: '#E2E8F0',
    gridLine: 'rgba(203, 213, 225, 0.5)',
    bgGradient: 'from-[#EEF2FF] via-[#FDF4FF] to-[#ECFEFF]',
  },
};

// 7-Bag Randomizer generator
export class BagRandomizer {
  private bag: TetrominoType[] = [];

  private refill() {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    // Fisher-Yates shuffle
    for (let i = types.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [types[i], types[j]] = [types[j], types[i]];
    }
    this.bag = types;
  }

  public next(): TetrominoType {
    if (this.bag.length === 0) {
      this.refill();
    }
    return this.bag.pop()!;
  }

  public peek(count: number): TetrominoType[] {
    while (this.bag.length < count) {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }
      this.bag = [...types, ...this.bag];
    }
    return this.bag.slice(-count).reverse();
  }
}

// Matrix rotation clockwise
export function rotateMatrix(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

// Matrix rotation counter-clockwise
export function rotateMatrixCCW(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[n - 1 - c][r] = matrix[r][c];
    }
  }
  return result;
}

// Create an empty board grid
export function createEmptyGrid(): (TetrominoType | null)[][] {
  return Array.from({ length: TOTAL_ROWS }, () => Array(COLS).fill(null));
}

// Check collision
export function checkCollision(
  grid: (TetrominoType | null)[][],
  shape: number[][],
  posX: number,
  posY: number
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const x = posX + c;
        const y = posY + r;

        // Check horizontal bounds
        if (x < 0 || x >= COLS) return true;
        // Check vertical floor
        if (y >= TOTAL_ROWS) return true;
        // Check grid occupancy (ignore above roof)
        if (y >= 0 && grid[y][x] !== null) return true;
      }
    }
  }
  return false;
}

// SRS wall kick tests for rotation
export function tryRotate(
  piece: ActivePiece,
  grid: (TetrominoType | null)[][],
  clockwise: boolean = true
): ActivePiece | null {
  const newShape = clockwise ? rotateMatrix(piece.shape) : rotateMatrixCCW(piece.shape);
  const newRotation = (piece.rotation + (clockwise ? 1 : 3)) % 4;

  // Standard kick offsets to try: (0,0), (-1,0), (1,0), (0,-1), (-1,-1), (1,-1), (-2,0), (2,0)
  const kicks = [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -2, y: 0 },
    { x: 2, y: 0 },
  ];

  for (const kick of kicks) {
    const testX = piece.x + kick.x;
    const testY = piece.y + kick.y;
    if (!checkCollision(grid, newShape, testX, testY)) {
      return {
        ...piece,
        shape: newShape,
        rotation: newRotation,
        x: testX,
        y: testY,
      };
    }
  }

  return null; // Rotation failed
}

// Calculate ghost piece (landing shadow)
export function getGhostPieceY(
  piece: ActivePiece,
  grid: (TetrominoType | null)[][]
): number {
  let ghostY = piece.y;
  while (!checkCollision(grid, piece.shape, piece.x, ghostY + 1)) {
    ghostY++;
  }
  return ghostY;
}

// Merge active piece into grid
export function mergePieceToGrid(
  grid: (TetrominoType | null)[][],
  piece: ActivePiece
): (TetrominoType | null)[][] {
  const newGrid = grid.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c] !== 0) {
        const x = piece.x + c;
        const y = piece.y + r;
        if (y >= 0 && y < TOTAL_ROWS && x >= 0 && x < COLS) {
          newGrid[y][x] = piece.type;
        }
      }
    }
  }
  return newGrid;
}

// Check and clear full lines
export function clearFullLines(grid: (TetrominoType | null)[][]): {
  newGrid: (TetrominoType | null)[][];
  clearedRows: number[];
} {
  const clearedRows: number[] = [];
  const remainingRows: (TetrominoType | null)[][] = [];

  for (let r = 0; r < TOTAL_ROWS; r++) {
    const isFull = grid[r].every((cell) => cell !== null);
    if (isFull) {
      clearedRows.push(r);
    } else {
      remainingRows.push(grid[r]);
    }
  }

  if (clearedRows.length === 0) {
    return { newGrid: grid, clearedRows: [] };
  }

  // Create new empty rows on top
  const emptyRowsNeeded = clearedRows.length;
  const newTopRows: (TetrominoType | null)[][] = Array.from(
    { length: emptyRowsNeeded },
    () => Array(COLS).fill(null)
  );

  return {
    newGrid: [...newTopRows, ...remainingRows],
    clearedRows,
  };
}

// Spawn new piece at center top
export function spawnPiece(type: TetrominoType): ActivePiece {
  const shape = TETROMINOES[type].map((row) => [...row]);
  const width = shape[0].length;
  const startX = Math.floor((COLS - width) / 2);
  const startY = 0; // In buffer area

  return {
    type,
    x: startX,
    y: startY,
    rotation: 0,
    shape,
  };
}

// MZ Generation Compliments & Cheer text
export function getMzReaction(lines: number, combo: number): { title: string; subtitle: string; color: string } {
  if (lines >= 4) {
    const luckyTitles = [
      '완전 럭키비키잔앙! 🍀✨',
      '갓벽 그 자체! 🌟💫',
      '레전드 4줄 삭제쇼! 👑',
      '폼 미쳐 날뛰는 중! 🚀',
    ];
    const pick = luckyTitles[Math.floor(Math.random() * luckyTitles.length)];
    return {
      title: pick,
      subtitle: '+800 PT · 테트리스 클리어!',
      color: '#A855F7',
    };
  }

  if (lines === 3) {
    const titles = ['초고수 폼 대박! 🔥', '찢었다 진짜 💥', '이게 바로 갓생! 🔮'];
    return {
      title: titles[Math.floor(Math.random() * titles.length)],
      subtitle: '+500 PT · 트리플!',
      color: '#EC4899',
    };
  }

  if (lines === 2) {
    const titles = ['손맛 쫀득쫀득! 🍬', '나이스 더블! 💖', '센스 만점 플레이 ✨'];
    return {
      title: titles[Math.floor(Math.random() * titles.length)],
      subtitle: '+300 PT · 더블!',
      color: '#3B82F6',
    };
  }

  // 1 line
  if (combo > 1) {
    return {
      title: `${combo}연속 콤보 폭주! ⚡`,
      subtitle: `+${50 * combo} 콤보 보너스!`,
      color: '#10B981',
    };
  }

  const titles = ['나이스 샷! ✨', '폼 좋은데? 🫧', '귀여워 주금 🐹', '말랑쫀득 한 줄! 🌸'];
  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    subtitle: '+100 PT',
    color: '#06B6D4',
  };
}

// Calculate drop speed based on level
export function getDropInterval(level: number): number {
  // Level 1: 800ms, decreases smoothly, minimum 110ms
  return Math.max(110, Math.round(800 * Math.pow(0.85, level - 1)));
}

// Calculate MZ Player Rank based on Score
export function getMzRank(score: number): { title: string; badge: string; desc: string } {
  if (score >= 25000) {
    return {
      title: '범우주급 럭키비키 갓생러',
      badge: '👑 LEGEND',
      desc: '테트리스 신계에 도달했습니다! 당신의 폼은 그야말로 갓벽!',
    };
  }
  if (score >= 15000) {
    return {
      title: '폼 미친 젤리 마스터',
      badge: '🌟 MASTER',
      desc: '말랑쫀득한 블록들을 자유자재로 조련하는 테트리스 장인!',
    };
  }
  if (score >= 8000) {
    return {
      title: '짜릿한 손맛 탐험가',
      badge: '🔥 EXPERT',
      desc: '콤보와 라인 삭제를 즐길 줄 아는 트렌디한 MZ 게이머!',
    };
  }
  if (score >= 3000) {
    return {
      title: '귀염뽀짝 테트리스 꿈나무',
      badge: '🌱 RISING',
      desc: '블록들과 점차 친해지는 중! 조금만 더 하면 레전드 달성!',
    };
  }
  return {
    title: '말랑말랑 뉴비 젤리',
    badge: '🍬 BABY',
    desc: '귀여운 블록들과의 첫 만남! 천천히 쫀득하게 즐겨보세요!',
  };
}
