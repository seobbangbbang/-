import React, { useEffect, useRef } from 'react';
import { ActivePiece, TetrominoType, ThemeConfig, Particle, FloatingText } from '../types/tetris';
import { COLS, ROWS, BUFFER_ROWS, TOTAL_ROWS, getGhostPieceY } from '../utils/tetris';

interface TetrisCanvasProps {
  grid: (TetrominoType | null)[][];
  activePiece: ActivePiece | null;
  theme: ThemeConfig;
  particles: Particle[];
  floatingTexts: FloatingText[];
  clearingRows: number[];
  clearProgress: number; // 0 to 1
  shakeOffset: { x: number; y: number };
  colBounces: number[];
  isHardDropping: boolean;
}

export const TetrisCanvas: React.FC<TetrisCanvasProps> = ({
  grid,
  activePiece,
  theme,
  particles,
  floatingTexts,
  clearingRows,
  clearProgress,
  shakeOffset,
  colBounces,
  isHardDropping,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Render loop on requestAnimationFrame
    let animId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      // Allow 16px padding on top/bottom/sides so board border and shadow are never cut off
      const padX = 16;
      const padY = 16;
      const availW = width - padX * 2;
      const availH = height - padY * 2;
      const cellSize = Math.floor(Math.min(availW / COLS, availH / ROWS));
      const boardWidth = cellSize * COLS;
      const boardHeight = cellSize * ROWS;
      const startX = Math.floor((width - boardWidth) / 2);
      const startY = Math.floor((height - boardHeight) / 2);

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Apply screen shake
      ctx.translate(shakeOffset.x, shakeOffset.y);

      // Clear full canvas
      ctx.clearRect(-20, -20, width + 40, height + 40);

      // 1. Board Background with soft inner shadow & cute grid
      ctx.fillStyle = theme.gridBg;
      roundRect(ctx, startX, startY, boardWidth, boardHeight, 16);
      ctx.fill();

      // Board border
      ctx.lineWidth = 3;
      ctx.strokeStyle = theme.gridBorder;
      roundRect(ctx, startX, startY, boardWidth, boardHeight, 16);
      ctx.stroke();

      // Subtle cute grid dots/lines
      ctx.strokeStyle = theme.gridLine;
      ctx.lineWidth = 1;
      for (let c = 1; c < COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(startX + c * cellSize, startY);
        ctx.lineTo(startX + c * cellSize, startY + boardHeight);
        ctx.stroke();
      }
      for (let r = 1; r < ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(startX, startY + r * cellSize);
        ctx.lineTo(startX + boardWidth, startY + r * cellSize);
        ctx.stroke();
      }

      // 2. Draw Locked Grid Blocks
      const now = performance.now();
      const blinkPhase = Math.sin(now * 0.002);
      const isBlinking = blinkPhase > 0.95;

      for (let r = BUFFER_ROWS; r < TOTAL_ROWS; r++) {
        const visualRow = r - BUFFER_ROWS;
        const isRowClearing = clearingRows.includes(r);

        for (let c = 0; c < COLS; c++) {
          const type = grid[r][c];
          if (type) {
            const bounceY = colBounces[c] || 0;
            const x = startX + c * cellSize;
            const y = startY + visualRow * cellSize + bounceY;

            if (isRowClearing) {
              // Line clear flash / dissolve animation
              const alpha = Math.max(0, 1 - clearProgress);
              const scale = 1 + clearProgress * 0.3;
              ctx.save();
              ctx.globalAlpha = alpha;
              ctx.translate(x + cellSize / 2, y + cellSize / 2);
              ctx.scale(scale, scale);
              drawCuteBlock(
                ctx,
                -cellSize / 2,
                -cellSize / 2,
                cellSize,
                type,
                theme,
                'happy',
                isBlinking
              );
              // White flash glow overlay
              ctx.fillStyle = '#FFFFFF';
              ctx.globalAlpha = Math.min(1, clearProgress * 1.5);
              roundRect(ctx, -cellSize / 2, -cellSize / 2, cellSize, cellSize, 8);
              ctx.fill();
              ctx.restore();
            } else {
              drawCuteBlock(
                ctx,
                x,
                y,
                cellSize,
                type,
                theme,
                'calm',
                isBlinking
              );
            }
          }
        }
      }

      // 3. Draw Ghost Piece Preview (translucent outline)
      if (activePiece) {
        const ghostY = getGhostPieceY(activePiece, grid);
        if (ghostY !== activePiece.y) {
          const visualGhostY = ghostY - BUFFER_ROWS;
          for (let r = 0; r < activePiece.shape.length; r++) {
            for (let c = 0; c < activePiece.shape[r].length; c++) {
              if (activePiece.shape[r][c] !== 0) {
                const gx = activePiece.x + c;
                const gy = visualGhostY + r;
                if (gy >= 0 && gy < ROWS && gx >= 0 && gx < COLS) {
                  const x = startX + gx * cellSize;
                  const y = startY + gy * cellSize;
                  drawGhostBlock(ctx, x, y, cellSize, activePiece.type, theme);
                }
              }
            }
          }
        }

        // 4. Draw Active Falling Piece
        const visualPieceY = activePiece.y - BUFFER_ROWS;
        const faceMood = isHardDropping ? 'excited' : 'active';

        for (let r = 0; r < activePiece.shape.length; r++) {
          for (let c = 0; c < activePiece.shape[r].length; c++) {
            if (activePiece.shape[r][c] !== 0) {
              const px = activePiece.x + c;
              const py = visualPieceY + r;
              if (py >= 0 && py < ROWS && px >= 0 && px < COLS) {
                const x = startX + px * cellSize;
                const y = startY + py * cellSize;
                drawCuteBlock(
                  ctx,
                  x,
                  y,
                  cellSize,
                  activePiece.type,
                  theme,
                  faceMood,
                  isBlinking
                );
              }
            }
          }
        }
      }

      // 5. Draw Particles (stars, hearts, sparkles, candy drops)
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;

        if (p.shape === 'heart') {
          drawHeart(ctx, p.size);
        } else if (p.shape === 'star') {
          drawStar(ctx, p.size);
        } else if (p.shape === 'sparkle') {
          drawSparkle(ctx, p.size);
        } else {
          // Circle candy dot
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 6. Draw In-Canvas Floating Praise Texts
      for (const ft of floatingTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.translate(ft.x, ft.y);
        ctx.scale(ft.scale, ft.scale);

        // Text bubble badge
        ctx.font = 'bold 18px "Jua", sans-serif';
        const metrics = ctx.measureText(ft.text);
        const textW = metrics.width;
        const boxPadding = 12;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        roundRect(
          ctx,
          -textW / 2 - boxPadding,
          -22,
          textW + boxPadding * 2,
          36,
          18
        );
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = ft.color;
        ctx.lineWidth = 2.5;
        roundRect(
          ctx,
          -textW / 2 - boxPadding,
          -22,
          textW + boxPadding * 2,
          36,
          18
        );
        ctx.stroke();

        ctx.fillStyle = ft.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ft.text, 0, -4);

        if (ft.subtext) {
          ctx.font = '600 11px "Outfit", sans-serif';
          ctx.fillStyle = '#64748B';
          ctx.fillText(ft.subtext, 0, 24);
        }

        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    grid,
    activePiece,
    theme,
    particles,
    floatingTexts,
    clearingRows,
    clearProgress,
    shakeOffset,
    colBounces,
    isHardDropping,
  ]);

  return (
    <div className="relative flex items-center justify-center h-full max-h-full aspect-[10/20] select-none mx-auto min-h-0 min-w-0">
      <canvas
        ref={canvasRef}
        width={380 * (window.devicePixelRatio || 1)}
        height={760 * (window.devicePixelRatio || 1)}
        className="w-full h-full max-h-full object-contain filter drop-shadow-md"
      />
    </div>
  );
};

// Helper: draw cute jelly block with bevel, specular highlight & facial expressions
function drawCuteBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: TetrominoType,
  theme: ThemeConfig,
  mood: 'active' | 'excited' | 'calm' | 'happy',
  isBlinking: boolean
) {
  const pad = 1.5;
  const bx = x + pad;
  const by = y + pad;
  const bSize = size - pad * 2;
  const radius = Math.max(4, Math.floor(bSize * 0.28));
  const colors = theme.colors[type];

  // 1. Soft bottom shadow bevel
  ctx.fillStyle = colors.shadow;
  roundRect(ctx, bx, by + 2, bSize, bSize - 2, radius);
  ctx.fill();

  // 2. Base rounded body
  const grad = ctx.createLinearGradient(bx, by, bx, by + bSize);
  grad.addColorStop(0, colors.light);
  grad.addColorStop(0.35, colors.primary);
  grad.addColorStop(1, colors.dark);
  ctx.fillStyle = grad;
  roundRect(ctx, bx, by, bSize, bSize - 2, radius);
  ctx.fill();

  // 3. Specular jelly highlight pill on top-left
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  const hlW = bSize * 0.45;
  const hlH = bSize * 0.18;
  roundRect(ctx, bx + bSize * 0.15, by + bSize * 0.12, hlW, hlH, hlH / 2);
  ctx.fill();

  // 4. Facial Expressions!
  drawFace(ctx, bx + bSize / 2, by + bSize / 2 + 1, bSize, type, mood, isBlinking, colors.eyeColor);
}

// Helper: draw cute facial expressions based on mood & block type
function drawFace(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  type: TetrominoType,
  mood: 'active' | 'excited' | 'calm' | 'happy',
  isBlinking: boolean,
  eyeColor: string
) {
  const eyeDist = size * 0.22;
  const eyeY = cy - size * 0.05;
  const eyeR = size * 0.085;

  // Rosy cheeks
  ctx.fillStyle = 'rgba(251, 113, 133, 0.6)'; // Soft strawberry blush
  const blushDist = size * 0.3;
  const blushY = cy + size * 0.1;
  ctx.beginPath();
  ctx.arc(cx - blushDist, blushY, size * 0.08, 0, Math.PI * 2);
  ctx.arc(cx + blushDist, blushY, size * 0.08, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = eyeColor;
  ctx.strokeStyle = eyeColor;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';

  if (isBlinking && mood !== 'excited') {
    // Blinking cute sleepy curve lines ^  ^
    ctx.beginPath();
    ctx.arc(cx - eyeDist, eyeY, eyeR * 0.9, Math.PI, 0, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + eyeDist, eyeY, eyeR * 0.9, Math.PI, 0, false);
    ctx.stroke();

    // Smile
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.08, size * 0.09, 0, Math.PI, false);
    ctx.stroke();
    return;
  }

  if (mood === 'excited') {
    // Big wide excited eyes (⊙ o ⊙)
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(cx - eyeDist, eyeY, eyeR * 1.3, 0, Math.PI * 2);
    ctx.arc(cx + eyeDist, eyeY, eyeR * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle eye shine
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(cx - eyeDist - 1, eyeY - 1, eyeR * 0.5, 0, Math.PI * 2);
    ctx.arc(cx + eyeDist - 1, eyeY - 1, eyeR * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Surprised round open mouth 'o'
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.14, size * 0.09, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  if (mood === 'calm' && (type === 'O' || type === 'S')) {
    // Serene smiling eyes ^^
    ctx.beginPath();
    ctx.arc(cx - eyeDist, eyeY, eyeR * 1.1, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + eyeDist, eyeY, eyeR * 1.1, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.stroke();

    // Cute tiny smile
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.07, size * 0.08, 0.2, Math.PI - 0.2, false);
    ctx.stroke();
    return;
  }

  // Active Standard Anime Eyes with light reflection
  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(cx - eyeDist, eyeY, eyeR, 0, Math.PI * 2);
  ctx.arc(cx + eyeDist, eyeY, eyeR, 0, Math.PI * 2);
  ctx.fill();

  // White twinkle pupil reflection
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(cx - eyeDist - eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.45, 0, Math.PI * 2);
  ctx.arc(cx + eyeDist - eyeR * 0.3, eyeY - eyeR * 0.3, eyeR * 0.45, 0, Math.PI * 2);
  ctx.fill();

  // Tiny mouth smile
  ctx.beginPath();
  ctx.arc(cx, cy + size * 0.08, size * 0.08, 0.1, Math.PI - 0.1, false);
  ctx.stroke();

  // Cat whiskers for J piece!
  if (type === 'J') {
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = eyeColor;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.35, cy + size * 0.05);
    ctx.lineTo(cx - size * 0.22, cy + size * 0.06);
    ctx.moveTo(cx + size * 0.35, cy + size * 0.05);
    ctx.lineTo(cx + size * 0.22, cy + size * 0.06);
    ctx.stroke();
  }
}

// Draw translucent ghost block
function drawGhostBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  type: TetrominoType,
  theme: ThemeConfig
) {
  const pad = 2;
  const bx = x + pad;
  const by = y + pad;
  const bSize = size - pad * 2;
  const radius = Math.floor(bSize * 0.25);
  const colors = theme.colors[type];

  ctx.save();
  ctx.fillStyle = colors.light;
  ctx.globalAlpha = 0.22;
  roundRect(ctx, bx, by, bSize, bSize, radius);
  ctx.fill();

  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 1.8;
  ctx.setLineDash([3, 3]);
  ctx.globalAlpha = 0.6;
  roundRect(ctx, bx, by, bSize, bSize, radius);
  ctx.stroke();
  ctx.restore();
}

// Draw round rectangle helper
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Draw heart particle
function drawHeart(ctx: CanvasRenderingContext2D, size: number) {
  const s = size / 16;
  ctx.beginPath();
  ctx.moveTo(0, s * -4);
  ctx.bezierCurveTo(s * -5, s * -9, s * -10, s * -3, 0, s * 6);
  ctx.bezierCurveTo(s * 10, s * -3, s * 5, s * -9, 0, s * -4);
  ctx.fill();
}

// Draw star particle
function drawStar(ctx: CanvasRenderingContext2D, size: number) {
  const spikes = 5;
  const outer = size / 2;
  const inner = outer / 2.2;
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(0, -outer);
  for (let i = 0; i < spikes; i++) {
    let x = Math.cos(rot) * outer;
    let y = Math.sin(rot) * outer;
    ctx.lineTo(x, y);
    rot += step;

    x = Math.cos(rot) * inner;
    y = Math.sin(rot) * inner;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(0, -outer);
  ctx.closePath();
  ctx.fill();
}

// Draw 4-point sparkle particle
function drawSparkle(ctx: CanvasRenderingContext2D, size: number) {
  const r = size / 2;
  ctx.beginPath();
  ctx.moveTo(0, -r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.quadraticCurveTo(0, 0, 0, r);
  ctx.quadraticCurveTo(0, 0, -r, 0);
  ctx.quadraticCurveTo(0, 0, 0, -r);
  ctx.closePath();
  ctx.fill();
}
