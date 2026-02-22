import React from 'react';
import { Character, CharacterStats } from './types';
import { getCharacterColors } from './pixelArt';

interface PixelAvatarProps {
  character: Character;
  size?: number;
}

// SVG-based pixel avatar for UI (not canvas)
const PixelAvatar: React.FC<PixelAvatarProps> = ({ character, size = 48 }) => {
  const colors = getCharacterColors(character.avatarSeed);
  const px = size / 8;

  const SPRITE = [
    '  HHHH  ',
    ' HHHHHH ',
    ' HSSHSS ',
    ' SSSSSS ',
    '  SMMS  ',
    '  SSSS  ',
    '  TTTT  ',
    ' TTTTTT ',
  ];

  const pixels: { x: number; y: number; color: string }[] = [];
  SPRITE.forEach((row, ry) => {
    for (let rx = 0; rx < row.length; rx++) {
      const c = row[rx];
      let color = '';
      switch (c) {
        case 'H': color = colors.hair; break;
        case 'S': color = colors.skin; break;
        case 'M': color = colors.skin; break;
        case 'T': color = colors.shirt; break;
        default: continue;
      }
      pixels.push({ x: rx, y: ry, color });
      if (c === 'S' && ry === 2 && (rx === 2 || rx === 5)) {
        pixels.push({ x: rx, y: ry, color: '#000' });
      }
    }
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${8 * px} ${8 * px}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map((p, i) => (
        <rect key={i} x={p.x * px} y={p.y * px} width={px} height={px} fill={p.color} />
      ))}
    </svg>
  );
};

export default PixelAvatar;

// Stat bar component
export const StatBar: React.FC<{ label: string; value: number; max?: number; color?: string }> = ({
  label, value, max = 100, color = 'hsl(var(--primary))'
}) => (
  <div className="flex items-center gap-2 text-xs font-mono">
    <span className="w-20 text-muted-foreground">{label}</span>
    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${(value / max) * 100}%`, backgroundColor: color }}
      />
    </div>
    <span className="w-8 text-right">{value}</span>
  </div>
);

// Character card
export const CharacterCard: React.FC<{
  character: Character;
  actions?: React.ReactNode;
}> = ({ character, actions }) => {
  const instrumentEmoji: Record<string, string> = {
    guitar: '🎸', bass: '🎸', drums: '🥁', vocals: '🎤', keyboard: '🎹'
  };
  const instrumentName: Record<string, string> = {
    guitar: 'Гитара', bass: 'Бас', drums: 'Ударные', vocals: 'Вокал', keyboard: 'Клавиши'
  };

  return (
    <div className="border border-border rounded-lg p-3 bg-card">
      <div className="flex items-start gap-3">
        <PixelAvatar character={character} size={56} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-card-foreground">{character.name}</span>
            <span className="text-sm">{instrumentEmoji[character.instrument]}</span>
          </div>
          <span className="text-xs text-muted-foreground">{instrumentName[character.instrument]}</span>
          {!character.isPlayer && (
            <span className="text-xs text-muted-foreground ml-2">${character.salary}/нед</span>
          )}
          <div className="mt-2 space-y-1">
            <StatBar label="Навык" value={character.stats.skill} color="#4ade80" />
            <StatBar label="Харизма" value={character.stats.charisma} color="#f472b6" />
            <StatBar label="Креатив" value={character.stats.creativity} color="#a78bfa" />
            <StatBar label="Выносл." value={character.stats.stamina} color="#facc15" />
          </div>
        </div>
      </div>
      {actions && <div className="mt-2 flex gap-2">{actions}</div>}
    </div>
  );
};
