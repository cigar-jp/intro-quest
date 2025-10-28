import { useEffect, useRef } from 'react';
import { Position, NPC, Direction } from '../App';

interface GameMapProps {
  playerPos: Position;
  playerDirection: Direction;
  walkFrame: number;
  npcs: NPC[];
  obstacles: number[][];
}

export function GameMap({ playerPos, playerDirection, walkFrame, npcs, obstacles }: GameMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const TILE_SIZE = 32;
  const MAP_WIDTH = 16;
  const MAP_HEIGHT = 12;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 画像のスムージングを無効にしてドット絵風に
    ctx.imageSmoothingEnabled = false;

    // 背景を描画（草地のパターン）
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const isLight = (x + y) % 2 === 0;
        ctx.fillStyle = isLight ? '#6db33f' : '#5a9c32';
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // 草のドット（ランダムを固定値で）
        ctx.fillStyle = isLight ? '#7ec850' : '#6db33f';
        const seed = (x * 7 + y * 13) % 10;
        if (seed > 7) {
          ctx.fillRect(x * TILE_SIZE + 8, y * TILE_SIZE + 8, 2, 2);
          ctx.fillRect(x * TILE_SIZE + 20, y * TILE_SIZE + 16, 2, 2);
        }
      }
    }

    // 道を描画
    for (let x = 0; x < MAP_WIDTH; x++) {
      drawRoad(ctx, x, 6);
    }
    for (let y = 0; y < MAP_HEIGHT; y++) {
      drawRoad(ctx, 10, y);
    }

    // 障害物を描画
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        if (obstacles[y][x] === 1) {
          // 外周は柵、内側は建物や木
          if (y === 0 || y === MAP_HEIGHT - 1 || x === 0 || x === MAP_WIDTH - 1) {
            drawFence(ctx, x, y);
          } else if ((x === 3 || x === 4) && (y === 2 || y === 3)) {
            drawHouse(ctx, x, y);
          } else if ((x >= 11 && x <= 13) && (y === 2 || y === 3)) {
            drawHouse(ctx, x, y);
          } else if (x === 13 && y === 8) {
            drawTree(ctx, x, y);
          } else if (x === 6 && y === 9) {
            drawTree(ctx, x, y);
          } else if (x === 9 && y === 9) {
            drawRock(ctx, x, y);
          }
        }
      }
    }

    // NPCを描画
    npcs.forEach(npc => {
      drawCharacter(ctx, npc.position.x, npc.position.y, npc.color, npc.direction, 0);
      // NPC名前表示
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 3;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.strokeText(npc.name, npc.position.x * TILE_SIZE + TILE_SIZE / 2, npc.position.y * TILE_SIZE - 4);
      ctx.fillText(npc.name, npc.position.x * TILE_SIZE + TILE_SIZE / 2, npc.position.y * TILE_SIZE - 4);
    });

    // プレイヤー（女性勇者）を描画
    drawHero(ctx, playerPos.x, playerPos.y, playerDirection, walkFrame);

  }, [playerPos, playerDirection, walkFrame, npcs, obstacles]);

  const drawRoad = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#c9a87c';
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    
    // タイルの境界線
    ctx.strokeStyle = '#a0825c';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  };

  const drawFence = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;

    // 柵
    ctx.fillStyle = '#8b6f47';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(px + i * 8, py + 10, 4, 16);
      ctx.fillRect(px + i * 8, py + 8, 4, 2);
      ctx.fillRect(px + i * 8, py + 18, 4, 2);
    }
  };

  const drawHouse = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;

    // 壁
    ctx.fillStyle = '#d4a574';
    ctx.fillRect(px + 4, py + 12, 24, 16);

    // 屋根
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(px + 2, py + 8, 28, 4);
    ctx.fillRect(px + 4, py + 4, 24, 4);
    ctx.fillRect(px + 8, py + 2, 16, 2);

    // 窓
    ctx.fillStyle = '#4a9eff';
    ctx.fillRect(px + 10, py + 16, 4, 4);
    ctx.fillRect(px + 18, py + 16, 4, 4);

    // ドア
    ctx.fillStyle = '#654321';
    ctx.fillRect(px + 13, py + 22, 6, 6);
  };

  const drawTree = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;

    // 幹
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(px + 12, py + 16, 8, 12);

    // 葉
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(px + 6, py + 8, 20, 12);
    ctx.fillRect(px + 8, py + 4, 16, 8);
    
    // 明るい葉
    ctx.fillStyle = '#3d6e1f';
    ctx.fillRect(px + 8, py + 10, 6, 6);
    ctx.fillRect(px + 18, py + 12, 4, 4);
  };

  const drawRock = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;

    // 岩
    ctx.fillStyle = '#808080';
    ctx.fillRect(px + 8, py + 14, 16, 12);
    ctx.fillRect(px + 10, py + 12, 12, 2);
    
    // ハイライト
    ctx.fillStyle = '#a0a0a0';
    ctx.fillRect(px + 10, py + 14, 4, 4);
  };

  const drawCharacter = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    color: string, 
    direction: Direction,
    frame: number
  ) => {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const footOffset = frame === 1 ? 1 : 0;

    // 影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(px + 8, py + 28, 16, 3);

    // 体
    ctx.fillStyle = color;
    ctx.fillRect(px + 10, py + 14, 12, 12);

    // 頭
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(px + 11, py + 8, 10, 8);

    // 目（向きによって変更）
    ctx.fillStyle = '#000';
    if (direction === 'up') {
      // 後ろ向き - 目を見せない
    } else if (direction === 'left') {
      ctx.fillRect(px + 17, py + 11, 2, 2);
    } else if (direction === 'right') {
      ctx.fillRect(px + 13, py + 11, 2, 2);
    } else {
      ctx.fillRect(px + 13, py + 11, 2, 2);
      ctx.fillRect(px + 17, py + 11, 2, 2);
    }

    // 足（歩行アニメーション）
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(px + 11 + footOffset, py + 26, 4, 4);
    ctx.fillRect(px + 17 - footOffset, py + 26, 4, 4);
  };

  const drawHero = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    direction: Direction,
    frame: number
  ) => {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const footOffset = frame === 1 ? 1 : 0;

    // 影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(px + 8, py + 28, 16, 3);

    // 体（赤い鎧）
    ctx.fillStyle = '#e63946';
    ctx.fillRect(px + 10, py + 14, 12, 12);

    // 肩の鎧
    ctx.fillStyle = '#c1121f';
    ctx.fillRect(px + 9, py + 14, 3, 4);
    ctx.fillRect(px + 20, py + 14, 3, 4);

    // 頭
    ctx.fillStyle = '#ffdbac';
    ctx.fillRect(px + 11, py + 8, 10, 8);

    // 髪（茶色のロングヘア）
    ctx.fillStyle = '#8b4513';
    if (direction === 'up') {
      // 後ろ向き
      ctx.fillRect(px + 10, py + 6, 12, 4);
      ctx.fillRect(px + 9, py + 10, 2, 10);
      ctx.fillRect(px + 21, py + 10, 2, 10);
    } else {
      ctx.fillRect(px + 10, py + 6, 12, 4);
      ctx.fillRect(px + 9, py + 10, 2, 8);
      ctx.fillRect(px + 21, py + 10, 2, 8);
    }

    // 目（向きによって変更）
    ctx.fillStyle = '#000';
    if (direction === 'up') {
      // 後ろ向き - 目を見せない
    } else if (direction === 'left') {
      ctx.fillRect(px + 17, py + 11, 2, 2);
    } else if (direction === 'right') {
      ctx.fillRect(px + 13, py + 11, 2, 2);
    } else {
      ctx.fillRect(px + 13, py + 11, 2, 2);
      ctx.fillRect(px + 17, py + 11, 2, 2);
    }

    // 口（前向きのみ）
    if (direction === 'down') {
      ctx.fillStyle = '#ff6b9d';
      ctx.fillRect(px + 15, py + 14, 2, 1);
    }

    // 足（歩行アニメーション）
    ctx.fillStyle = '#8b6f47';
    ctx.fillRect(px + 11 + footOffset, py + 26, 4, 4);
    ctx.fillRect(px + 17 - footOffset, py + 26, 4, 4);

    // 剣（向きによって位置変更）
    ctx.fillStyle = '#c0c0c0';
    if (direction === 'left') {
      ctx.fillRect(px + 6, py + 18, 2, 8);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(px + 5, py + 17, 4, 2);
    } else {
      ctx.fillRect(px + 24, py + 18, 2, 8);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(px + 23, py + 17, 4, 2);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={MAP_WIDTH * TILE_SIZE}
      height={MAP_HEIGHT * TILE_SIZE}
      className="block"
    />
  );
}
