// Pixel art character rendering on canvas
import { Character } from './types';

const PIXEL = 4; // scale factor

// Color palettes for characters based on seed
const SKIN_COLORS = ['#f5c6a0', '#e8a87c', '#c68642', '#8d5524'];
const HAIR_COLORS = ['#2c1b0e', '#6b3a2a', '#c4872e', '#f0e68c', '#ff4444', '#4444ff', '#44ff44', '#ff44ff'];
const SHIRT_COLORS = ['#333', '#222', '#551111', '#115511', '#111155', '#553311', '#ff6600', '#9900ff'];

export function getCharacterColors(seed: number) {
  return {
    skin: SKIN_COLORS[seed % SKIN_COLORS.length],
    hair: HAIR_COLORS[(seed * 3 + 7) % HAIR_COLORS.length],
    shirt: SHIRT_COLORS[(seed * 5 + 2) % SHIRT_COLORS.length],
  };
}

// 8x12 pixel character sprite
const CHAR_SPRITE = [
  '  HHHH  ',
  ' HHHHHH ',
  ' HSSHSS ',
  ' SSSSSS ',
  '  SMMS  ',
  '  SSSS  ',
  '  TTTT  ',
  ' TTTTTT ',
  ' TTTTTT ',
  '  TTTT  ',
  '  L  L  ',
  '  L  L  ',
];

export function drawPixelCharacter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  char: Character,
  scale = 1,
  playing = false
) {
  const colors = getCharacterColors(char.avatarSeed);
  const px = PIXEL * scale;
  const bounce = playing ? Math.sin(Date.now() / 200 + char.avatarSeed) * 2 * scale : 0;

  CHAR_SPRITE.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const c = row[rx];
      let color = '';
      switch (c) {
        case 'H': color = colors.hair; break;
        case 'S': color = colors.skin; break;
        case 'M': color = colors.skin; break; // mouth
        case 'T': color = colors.shirt; break;
        case 'L': color = '#333366'; break; // legs/jeans
        default: continue;
      }
      ctx.fillStyle = color;
      ctx.fillRect(x + rx * px, y + ry * px + bounce, px, px);
      
      // Eyes
      if (c === 'S' && ry === 2 && (rx === 2 || rx === 5)) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x + rx * px + px * 0.25, y + ry * px + bounce + px * 0.25, px * 0.5, px * 0.5);
      }
    }
  });

  // Draw instrument indicator
  if (playing) {
    ctx.fillStyle = '#ffd700';
    const instrX = x + 8 * px;
    const instrY = y + 6 * px + bounce;
    switch (char.instrument) {
      case 'guitar':
        ctx.fillRect(instrX, instrY, px * 3, px);
        ctx.fillRect(instrX + px * 3, instrY - px, px, px * 3);
        break;
      case 'bass':
        ctx.fillRect(instrX, instrY, px * 4, px);
        ctx.fillRect(instrX + px * 4, instrY - px, px, px * 3);
        break;
      case 'drums':
        ctx.fillStyle = '#888';
        ctx.fillRect(x - px * 2, y + 8 * px, px * 3, px * 2);
        ctx.fillRect(x + 6 * px, y + 8 * px, px * 3, px * 2);
        ctx.fillStyle = '#cc9933';
        ctx.fillRect(x - px, y + 6 * px, px, px * 3);
        break;
      case 'vocals':
        ctx.fillStyle = '#aaa';
        ctx.fillRect(instrX - px, instrY - px * 3, px, px * 4);
        ctx.fillRect(instrX - px * 2, instrY - px * 4, px * 3, px);
        break;
      case 'keyboard':
        ctx.fillStyle = '#eee';
        ctx.fillRect(x - px, y + 7 * px, px * 10, px);
        ctx.fillStyle = '#333';
        for (let k = 0; k < 5; k++) {
          ctx.fillRect(x + k * px * 2, y + 7 * px, px, px);
        }
        break;
    }
  }
}

// Draw a crowd person (simpler, 4x6)
export function drawCrowdPerson(ctx: CanvasRenderingContext2D, x: number, y: number, seed: number, excitement: number, scale = 1) {
  const px = PIXEL * scale * 0.5;
  const colors = getCharacterColors(seed);
  const jump = excitement > 70 ? Math.abs(Math.sin(Date.now() / 150 + seed)) * 4 * scale : 0;
  const handsUp = excitement > 50 && (seed % 3 === 0);

  // Head
  ctx.fillStyle = colors.skin;
  ctx.fillRect(x + px, y - jump, px * 2, px * 2);

  // Hair
  ctx.fillStyle = colors.hair;
  ctx.fillRect(x + px, y - jump, px * 2, px);

  // Body
  ctx.fillStyle = colors.shirt;
  ctx.fillRect(x, y + px * 2 - jump, px * 4, px * 3);

  // Arms up
  if (handsUp) {
    ctx.fillRect(x - px, y + px - jump, px, px * 2);
    ctx.fillRect(x + px * 4, y + px - jump, px, px * 2);
  }
}
