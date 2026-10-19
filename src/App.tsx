/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameState,
  TetrominoType,
  ActivePiece,
  ThemeConfig,
  ThemeId,
  GameStats,
  StoredRecord,
  Particle,
  FloatingText,
} from './types/tetris';
import {
  COLS,
  TOTAL_ROWS,
  BUFFER_ROWS,
  THEMES,
  BagRandomizer,
  createEmptyGrid,
  checkCollision,
  tryRotate,
  getGhostPieceY,
  mergePieceToGrid,
  clearFullLines,
  spawnPiece,
  getDropInterval,
  getMzReaction,
} from './utils/tetris';
import { sound } from './utils/audio';
import { TitleScreen } from './components/TitleScreen';
import { TetrisCanvas } from './components/TetrisCanvas';
import { MobileHUD, DesktopLeftHUD, DesktopRightHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';

const STORAGE_KEY = 'malang_tetris_record_v1';

export default function App() {
  // Game State Machine
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [theme, setTheme] = useState<ThemeConfig>(THEMES.candy);

  // Playfield & Pieces
  const [grid, setGrid] = useState<(TetrominoType | null)[][]>(() => createEmptyGrid());
  const [activePiece, setActivePiece] = useState<ActivePiece | null>(null);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);

  // Statistics
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    lines: 0,
    level: 1,
    combo: 0,
    maxCombo: 0,
    singleCount: 0,
    doubleCount: 0,
    tripleCount: 0,
    tetrisCount: 0,
  });

  const [record, setRecord] = useState<StoredRecord>({
    highScore: 0,
    totalGames: 0,
    maxCombo: 0,
    maxLines: 0,
  });

  // Sound States
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBgmMuted, setIsBgmMuted] = useState<boolean>(false);

  // Visual Effects & Game Feel
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [clearingRows, setClearingRows] = useState<number[]>([]);
  const [clearProgress, setClearProgress] = useState<number>(0);
  const [shakeOffset, setShakeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [colBounces, setColBounces] = useState<number[]>(() => Array(COLS).fill(0));
  const [isHardDropping, setIsHardDropping] = useState<boolean>(false);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Refs for loop & input timing
  const bagRef = useRef<BagRandomizer>(new BagRandomizer());
  const gridRef = useRef(grid);
  gridRef.current = grid;
  const activePieceRef = useRef(activePiece);
  activePieceRef.current = activePiece;
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const recordRef = useRef(record);
  recordRef.current = record;
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const canHoldRef = useRef(canHold);
  canHoldRef.current = canHold;
  const holdPieceRef = useRef(holdPiece);
  holdPieceRef.current = holdPiece;

  const lastDropTimeRef = useRef<number>(0);
  const lockTimerRef = useRef<number | null>(null);
  const lockResetsRef = useRef<number>(0);
  const shakeIntensityRef = useRef<number>(0);

  // Load high scores from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: StoredRecord = JSON.parse(saved);
        setRecord(parsed);
        setStats((prev) => ({ ...prev, highScore: parsed.highScore || 0 }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Save record helper
  const saveRecords = (finalScore: number, finalLines: number, maxCombo: number) => {
    const prev = recordRef.current;
    const isNewBest = finalScore > prev.highScore;
    setIsNewRecord(isNewBest);

    const updated: StoredRecord = {
      highScore: Math.max(prev.highScore, finalScore),
      totalGames: prev.totalGames + 1,
      maxCombo: Math.max(prev.maxCombo, maxCombo),
      maxLines: Math.max(prev.maxLines, finalLines),
    };

    setRecord(updated);
    setStats((s) => ({ ...s, highScore: updated.highScore }));

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Sound Toggles
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  const handleToggleBgmMute = () => {
    const next = !isBgmMuted;
    setIsBgmMuted(next);
    sound.setBgmMuted(next);
  };

  // Screen shake trigger
  const triggerShake = (intensity: number) => {
    shakeIntensityRef.current = intensity;
  };

  // Column bounce squash & stretch trigger
  const triggerColumnBounce = (colsToBounce: number[], amount: number = 8) => {
    setColBounces((prev) => {
      const next = [...prev];
      for (const col of colsToBounce) {
        if (col >= 0 && col < COLS) {
          next[col] = amount;
        }
      }
      return next;
    });
  };

  // Spawn Burst Particles
  const spawnParticles = (x: number, y: number, count: number = 24) => {
    const colors = ['#F472B6', '#38BDF8', '#FBBF24', '#C084FC', '#4ADE80', '#FB7185', '#FFF'];
    const shapes: ('star' | 'heart' | 'sparkle' | 'circle')[] = ['star', 'heart', 'sparkle', 'circle'];
    const newParticles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5.5;
      newParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 8 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: 0.02 + Math.random() * 0.025,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);
  };

  // Spawn Floating Praise Text
  const spawnFloatingText = (text: string, subtext: string, color: string) => {
    const id = `${Date.now()}_${Math.random()}`;
    const newText: FloatingText = {
      id,
      text,
      subtext,
      x: 190, // Center of canvas
      y: 280,
      color,
      scale: 0.7,
      alpha: 1,
      createdAt: performance.now(),
    };
    setFloatingTexts((prev) => [...prev, newText]);
  };

  // Lock Active Piece and Process Clears
  const lockPiece = useCallback((pieceToLock: ActivePiece) => {
    sound.playSoftDrop();

    // Trigger bounce on affected columns
    const pieceCols: number[] = [];
    for (let r = 0; r < pieceToLock.shape.length; r++) {
      for (let c = 0; c < pieceToLock.shape[r].length; c++) {
        if (pieceToLock.shape[r][c] !== 0) {
          const col = pieceToLock.x + c;
          if (!pieceCols.includes(col)) pieceCols.push(col);
        }
      }
    }
    triggerColumnBounce(pieceCols, 6);

    const merged = mergePieceToGrid(gridRef.current, pieceToLock);
    const { newGrid, clearedRows } = clearFullLines(merged);

    // If lines cleared!
    if (clearedRows.length > 0) {
      const linesCleared = clearedRows.length;
      const curStats = statsRef.current;
      const nextCombo = curStats.combo + 1;
      const nextMaxCombo = Math.max(curStats.maxCombo, nextCombo);
      const totalLines = curStats.lines + linesCleared;
      const newLevel = Math.floor(totalLines / 10) + 1;

      // Base line points
      const basePoints =
        linesCleared === 4 ? 800 : linesCleared === 3 ? 500 : linesCleared === 2 ? 300 : 100;
      const comboBonus = nextCombo > 1 ? 50 * nextCombo * curStats.level : 0;
      const earnedScore = (basePoints * curStats.level) + comboBonus;
      const newScore = curStats.score + earnedScore;

      // Sound & FX
      if (linesCleared >= 4) {
        sound.playTetris();
        triggerShake(10);
      } else {
        sound.playLineClear(linesCleared, nextCombo);
        triggerShake(linesCleared * 2.2);
      }

      if (newLevel > curStats.level) {
        sound.playLevelUp();
      }

      // Compliment shoutout
      const reaction = getMzReaction(linesCleared, nextCombo);
      spawnFloatingText(reaction.title, reaction.subtitle, reaction.color);

      // Particle explosion at line clearing locations
      const burstY = ((clearedRows[0] - BUFFER_ROWS) * 35) + 60;
      spawnParticles(190, burstY, linesCleared * 12 + 10);

      // Trigger line clear visual flash
      setClearingRows(clearedRows);
      setClearProgress(0);

      setStats((s) => ({
        ...s,
        score: newScore,
        lines: totalLines,
        level: newLevel,
        combo: nextCombo,
        maxCombo: nextMaxCombo,
        singleCount: s.singleCount + (linesCleared === 1 ? 1 : 0),
        doubleCount: s.doubleCount + (linesCleared === 2 ? 1 : 0),
        tripleCount: s.tripleCount + (linesCleared === 3 ? 1 : 0),
        tetrisCount: s.tetrisCount + (linesCleared === 4 ? 1 : 0),
      }));

      // Update grid after quick dissolve delay
      setTimeout(() => {
        setGrid(newGrid);
        setClearingRows([]);
        setClearProgress(0);
      }, 160);
    } else {
      // No lines cleared, reset combo
      setStats((s) => ({ ...s, combo: 0 }));
      setGrid(merged);
    }

    // Spawn Next Piece from Queue
    const nextType = bagRef.current.next();
    setNextQueue(bagRef.current.peek(4));
    setCanHold(true);
    canHoldRef.current = true;

    const newPiece = spawnPiece(nextType);

    // Check Immediate Collision -> GAME OVER!
    if (checkCollision(newGrid, newPiece.shape, newPiece.x, newPiece.y)) {
      sound.playGameOver();
      setGameState('GAME_OVER');
      saveRecords(statsRef.current.score, statsRef.current.lines, statsRef.current.maxCombo);
      setActivePiece(null);
      return;
    }

    setActivePiece(newPiece);
    lastDropTimeRef.current = performance.now();
    lockResetsRef.current = 0;
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
  }, []);

  // Movement: Move Left / Right
  const moveHorizontally = useCallback((dir: -1 | 1) => {
    const piece = activePieceRef.current;
    if (!piece || gameStateRef.current !== 'PLAYING') return;

    const targetX = piece.x + dir;
    if (!checkCollision(gridRef.current, piece.shape, targetX, piece.y)) {
      setActivePiece({ ...piece, x: targetX });
      sound.playMove();

      // Reset lock timer if on ground
      if (checkCollision(gridRef.current, piece.shape, targetX, piece.y + 1)) {
        if (lockResetsRef.current < 15) {
          lockResetsRef.current++;
          lastDropTimeRef.current = performance.now();
        }
      }
    }
  }, []);

  // Soft Drop: Move 1 cell down
  const moveDown = useCallback(() => {
    const piece = activePieceRef.current;
    if (!piece || gameStateRef.current !== 'PLAYING') return;

    const targetY = piece.y + 1;
    if (!checkCollision(gridRef.current, piece.shape, piece.x, targetY)) {
      setActivePiece({ ...piece, y: targetY });
      setStats((s) => ({ ...s, score: s.score + 1 }));
      lastDropTimeRef.current = performance.now();
    } else {
      // Touch ground: lock piece
      lockPiece(piece);
    }
  }, [lockPiece]);

  // Hard Drop: Slam all the way to floor instantly!
  const hardDrop = useCallback(() => {
    const piece = activePieceRef.current;
    if (!piece || gameStateRef.current !== 'PLAYING') return;

    const ghostY = getGhostPieceY(piece, gridRef.current);
    const dropDistance = ghostY - piece.y;

    sound.playHardDrop();
    triggerShake(8);
    setIsHardDropping(true);
    setTimeout(() => setIsHardDropping(false), 200);

    const slammedPiece: ActivePiece = {
      ...piece,
      y: ghostY,
    };

    setStats((s) => ({ ...s, score: s.score + dropDistance * 2 }));
    lockPiece(slammedPiece);
  }, [lockPiece]);

  // Rotate Piece
  const rotateActivePiece = useCallback((clockwise: boolean = true) => {
    const piece = activePieceRef.current;
    if (!piece || gameStateRef.current !== 'PLAYING') return;

    const rotated = tryRotate(piece, gridRef.current, clockwise);
    if (rotated) {
      setActivePiece(rotated);
      sound.playRotate();

      if (lockResetsRef.current < 15) {
        lockResetsRef.current++;
        lastDropTimeRef.current = performance.now();
      }
    }
  }, []);

  // Hold Piece
  const handleHold = useCallback(() => {
    const piece = activePieceRef.current;
    if (!piece || !canHoldRef.current || gameStateRef.current !== 'PLAYING') return;

    sound.playHold();
    setCanHold(false);
    canHoldRef.current = false;

    const currentType = piece.type;
    const currentHeld = holdPieceRef.current;

    setHoldPiece(currentType);
    holdPieceRef.current = currentType;

    if (currentHeld) {
      const swappedPiece = spawnPiece(currentHeld);
      setActivePiece(swappedPiece);
    } else {
      const nextType = bagRef.current.next();
      setNextQueue(bagRef.current.peek(4));
      const newPiece = spawnPiece(nextType);
      setActivePiece(newPiece);
    }

    lastDropTimeRef.current = performance.now();
    lockResetsRef.current = 0;
  }, []);

  // Start New Game
  const startNewGame = useCallback(() => {
    sound.enableAudio();
    sound.startBgm();

    bagRef.current = new BagRandomizer();
    const firstType = bagRef.current.next();
    const queue = bagRef.current.peek(4);

    setGrid(createEmptyGrid());
    setActivePiece(spawnPiece(firstType));
    setNextQueue(queue);
    setHoldPiece(null);
    holdPieceRef.current = null;
    setCanHold(true);
    canHoldRef.current = true;
    setParticles([]);
    setFloatingTexts([]);
    setIsNewRecord(false);

    setStats({
      score: 0,
      highScore: recordRef.current.highScore,
      lines: 0,
      level: 1,
      combo: 0,
      maxCombo: 0,
      singleCount: 0,
      doubleCount: 0,
      tripleCount: 0,
      tetrisCount: 0,
    });

    setGameState('PLAYING');
    lastDropTimeRef.current = performance.now();
  }, []);

  // Pause & Resume
  const togglePause = useCallback(() => {
    if (gameStateRef.current === 'PLAYING') {
      setGameState('PAUSED');
      sound.stopBgm();
    } else if (gameStateRef.current === 'PAUSED') {
      setGameState('PLAYING');
      sound.startBgm();
      lastDropTimeRef.current = performance.now();
    }
  }, []);

  // Return to Title Menu
  const goHome = useCallback(() => {
    setGameState('TITLE_MENU');
    sound.stopBgm();
    setActivePiece(null);
  }, []);

  // Global Keyboard Listener with continuous held input for Left/Right/Down
  useEffect(() => {
    const keysDown = new Map<string, number>();
    const dasTimers = new Map<string, number>();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default page scroll on arrows / space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Title Screen Start
      if (gameStateRef.current === 'TITLE_MENU') {
        if (e.key === ' ' || e.key === 'Enter') {
          startNewGame();
        }
        return;
      }

      // Game Over Screen Restart
      if (gameStateRef.current === 'GAME_OVER') {
        if (e.key === ' ' || e.key === 'Enter') {
          startNewGame();
        }
        return;
      }

      // Pause toggle
      if (e.key === 'Escape') {
        togglePause();
        return;
      }

      // In-game quick actions
      if (gameStateRef.current === 'PLAYING') {
        if (e.key === 'r' || e.key === 'R') {
          startNewGame();
          return;
        }

        // Just-pressed single triggers
        if (e.key === 'ArrowUp' || e.key === 'x' || e.key === 'X') {
          if (!keysDown.has(e.key)) {
            rotateActivePiece(true);
          }
        } else if (e.key === 'z' || e.key === 'Z') {
          if (!keysDown.has(e.key)) {
            rotateActivePiece(false);
          }
        } else if (e.key === ' ') {
          if (!keysDown.has(e.key)) {
            hardDrop();
          }
        } else if (e.key === 'c' || e.key === 'C' || e.key === 'Shift') {
          if (!keysDown.has(e.key)) {
            handleHold();
          }
        } else if (e.key === 'ArrowLeft') {
          if (!keysDown.has('ArrowLeft')) {
            moveHorizontally(-1);
            keysDown.set('ArrowLeft', performance.now());
            // DAS: Delayed Auto Shift
            const timer = window.setTimeout(() => {
              const repeat = window.setInterval(() => {
                if (keysDown.has('ArrowLeft')) {
                  moveHorizontally(-1);
                }
              }, 48);
              dasTimers.set('ArrowLeft', repeat);
            }, 160);
            dasTimers.set('ArrowLeft_timeout', timer);
          }
        } else if (e.key === 'ArrowRight') {
          if (!keysDown.has('ArrowRight')) {
            moveHorizontally(1);
            keysDown.set('ArrowRight', performance.now());
            const timer = window.setTimeout(() => {
              const repeat = window.setInterval(() => {
                if (keysDown.has('ArrowRight')) {
                  moveHorizontally(1);
                }
              }, 48);
              dasTimers.set('ArrowRight', repeat);
            }, 160);
            dasTimers.set('ArrowRight_timeout', timer);
          }
        } else if (e.key === 'ArrowDown') {
          if (!keysDown.has('ArrowDown')) {
            moveDown();
            keysDown.set('ArrowDown', performance.now());
            const timer = window.setTimeout(() => {
              const repeat = window.setInterval(() => {
                if (keysDown.has('ArrowDown')) {
                  moveDown();
                }
              }, 48);
              dasTimers.set('ArrowDown', repeat);
            }, 120);
            dasTimers.set('ArrowDown_timeout', timer);
          }
        }

        keysDown.set(e.key, performance.now());
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.delete(e.key);

      if (e.key === 'ArrowLeft') {
        clearTimeout(dasTimers.get('ArrowLeft_timeout'));
        clearInterval(dasTimers.get('ArrowLeft'));
        dasTimers.delete('ArrowLeft_timeout');
        dasTimers.delete('ArrowLeft');
      } else if (e.key === 'ArrowRight') {
        clearTimeout(dasTimers.get('ArrowRight_timeout'));
        clearInterval(dasTimers.get('ArrowRight'));
        dasTimers.delete('ArrowRight_timeout');
        dasTimers.delete('ArrowRight');
      } else if (e.key === 'ArrowDown') {
        clearTimeout(dasTimers.get('ArrowDown_timeout'));
        clearInterval(dasTimers.get('ArrowDown'));
        dasTimers.delete('ArrowDown_timeout');
        dasTimers.delete('ArrowDown');
      }
    };

    // Clean held keys on window blur as mandated
    const handleBlur = () => {
      keysDown.clear();
      dasTimers.forEach((timer) => {
        clearTimeout(timer);
        clearInterval(timer);
      });
      dasTimers.clear();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      dasTimers.forEach((timer) => {
        clearTimeout(timer);
        clearInterval(timer);
      });
    };
  }, [
    startNewGame,
    togglePause,
    moveHorizontally,
    moveDown,
    hardDrop,
    rotateActivePiece,
    handleHold,
  ]);

  // Main 60fps Game Simulation Loop
  useEffect(() => {
    let animId: number;
    let lastFrameTime = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastFrameTime) / 1000;
      const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent simulation explosion
      lastFrameTime = currentTime;

      // Update Screen Shake decay
      if (shakeIntensityRef.current > 0) {
        shakeIntensityRef.current = Math.max(0, shakeIntensityRef.current - dt * 25);
        const intensity = shakeIntensityRef.current;
        setShakeOffset({
          x: (Math.random() - 0.5) * intensity * 2,
          y: (Math.random() - 0.5) * intensity * 2,
        });
      } else {
        setShakeOffset({ x: 0, y: 0 });
      }

      // Update Column Bounces (spring damping)
      setColBounces((prev) => {
        let hasActive = false;
        const next = prev.map((val) => {
          if (Math.abs(val) > 0.1) {
            hasActive = true;
            return val * 0.78; // Fast spring settling
          }
          return 0;
        });
        return hasActive ? next : prev;
      });

      // Update Particles
      setParticles((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.18, // Gravity
            alpha: p.alpha - p.decay,
            rotation: p.rotation + p.vRot,
          }))
          .filter((p) => p.alpha > 0);
      });

      // Update Floating Texts
      setFloatingTexts((prev) => {
        if (prev.length === 0) return prev;
        return prev
          .map((ft) => ({
            ...ft,
            y: ft.y - dt * 45, // Float up smoothly
            scale: Math.min(1.15, ft.scale + dt * 2.5),
            alpha: ft.alpha - dt * 0.65,
          }))
          .filter((ft) => ft.alpha > 0);
      });

      // Update Line Clear progress
      setClearingRows((rows) => {
        if (rows.length > 0) {
          setClearProgress((cp) => Math.min(1, cp + dt * 6));
        }
        return rows;
      });

      // Gravity Drop & Lock Logic
      if (gameStateRef.current === 'PLAYING') {
        const piece = activePieceRef.current;
        if (piece) {
          const dropInterval = getDropInterval(statsRef.current.level);
          const timeSinceDrop = currentTime - lastDropTimeRef.current;

          if (timeSinceDrop >= dropInterval) {
            const nextY = piece.y + 1;
            if (!checkCollision(gridRef.current, piece.shape, piece.x, nextY)) {
              setActivePiece({ ...piece, y: nextY });
              lastDropTimeRef.current = currentTime;
            } else {
              // On ground: start lock delay (500ms)
              if (currentTime - lastDropTimeRef.current > 480) {
                lockPiece(piece);
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [lockPiece]);

  return (
    <div
      className={`relative w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between bg-gradient-to-br ${theme.bgGradient} transition-colors duration-500`}
    >
      {/* 1. TITLE SCREEN */}
      {gameState === 'TITLE_MENU' && (
        <TitleScreen
          onStartGame={startNewGame}
          currentTheme={theme}
          onSelectTheme={(id) => setTheme(THEMES[id])}
          record={record}
          isMuted={isMuted}
          isBgmMuted={isBgmMuted}
          onToggleMute={handleToggleMute}
          onToggleBgmMute={handleToggleBgmMute}
        />
      )}

      {/* 2. PLAYING / PAUSED / GAME OVER ACTIVE VIEW */}
      {gameState !== 'TITLE_MENU' && (
        <div className="relative w-full h-full max-h-screen flex flex-col items-center justify-between p-1.5 sm:p-2 md:p-3 select-none overflow-hidden min-h-0">
          {/* Mobile Top HUD (visible on mobile only, height <= 44px) */}
          <MobileHUD
            stats={stats}
            holdPiece={holdPiece}
            canHold={canHold}
            nextQueue={nextQueue}
            theme={theme}
            isMuted={isMuted}
            isBgmMuted={isBgmMuted}
            onToggleMute={handleToggleMute}
            onToggleBgmMute={handleToggleBgmMute}
            onPause={togglePause}
            onTriggerHold={handleHold}
          />

          {/* Main Play Arena: Desktop Left Wing + Center Canvas + Desktop Right Wing */}
          <div className="flex-1 w-full max-w-5xl flex items-center justify-center gap-3 lg:gap-8 min-h-0 my-auto py-1 overflow-hidden">
            {/* Desktop Left HUD (HOLD & Level) */}
            <DesktopLeftHUD
              stats={stats}
              holdPiece={holdPiece}
              canHold={canHold}
              nextQueue={nextQueue}
              theme={theme}
              isMuted={isMuted}
              isBgmMuted={isBgmMuted}
              onToggleMute={handleToggleMute}
              onToggleBgmMute={handleToggleBgmMute}
              onPause={togglePause}
              onTriggerHold={handleHold}
            />

            {/* Central Board Canvas (strictly constrained by height and aspect ratio) */}
            <div className="h-full flex items-center justify-center min-h-0 min-w-0 pointer-events-none">
              <TetrisCanvas
                grid={grid}
                activePiece={activePiece}
                theme={theme}
                particles={particles}
                floatingTexts={floatingTexts}
                clearingRows={clearingRows}
                clearProgress={clearProgress}
                shakeOffset={shakeOffset}
                colBounces={colBounces}
                isHardDropping={isHardDropping}
              />
            </div>

            {/* Desktop Right HUD (Score & NEXT) */}
            <DesktopRightHUD
              stats={stats}
              holdPiece={holdPiece}
              canHold={canHold}
              nextQueue={nextQueue}
              theme={theme}
              isMuted={isMuted}
              isBgmMuted={isBgmMuted}
              onToggleMute={handleToggleMute}
              onToggleBgmMute={handleToggleBgmMute}
              onPause={togglePause}
              onTriggerHold={handleHold}
            />
          </div>

          {/* Bottom Area: Compact Touch Controls on mobile, control-hint on desktop */}
          <div className="w-full shrink-0 z-20">
            {/* Mobile Touch Controls */}
            <div className="block md:hidden">
              <TouchControls
                onMoveLeft={() => moveHorizontally(-1)}
                onMoveRight={() => moveHorizontally(1)}
                onSoftDrop={moveDown}
                onHardDrop={hardDrop}
                onRotate={() => rotateActivePiece(true)}
                onHold={handleHold}
              />
            </div>

            {/* Desktop Minimal Hint Line */}
            <div className="hidden md:flex items-center justify-center py-1 text-xs text-slate-400 font-mono tracking-tight">
              ← → 이동 · ↓ 소프트드롭 · Space 즉시낙하 · ↑/Z 회전 · C 홀드 · Esc 일시정지
            </div>
          </div>

          {/* PAUSE MODAL OVERLAY */}
          {gameState === 'PAUSED' && (
            <PauseModal
              onResume={togglePause}
              onRestart={startNewGame}
              onGoHome={goHome}
            />
          )}

          {/* GAME OVER MODAL OVERLAY */}
          {gameState === 'GAME_OVER' && (
            <GameOverModal
              stats={stats}
              isNewRecord={isNewRecord}
              onRestart={startNewGame}
              onGoHome={goHome}
            />
          )}
        </div>
      )}
    </div>
  );
}
