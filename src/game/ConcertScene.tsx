import React, { useRef, useEffect, useCallback } from 'react';
import { Character, ConcertResult } from './types';
import { Venue } from './types';
import { drawPixelCharacter, drawCrowdPerson } from './pixelArt';

interface ConcertSceneProps {
  members: Character[];
  venue: Venue;
  result: ConcertResult;
  onFinish: () => void;
}

const PIXEL = 4;

const ConcertScene: React.FC<ConcertSceneProps> = ({ members, venue, result, onFinish }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrame = useRef<number>(0);
  const startTime = useRef(Date.now());
  const [phase, setPhase] = React.useState<'intro' | 'playing' | 'outro'>('intro');
  const [eventIndex, setEventIndex] = React.useState(0);

  const WIDTH = 800;
  const HEIGHT = 500;

  // Light colors cycle
  const getLightColor = useCallback((t: number, offset: number) => {
    const hue = ((t / 20) + offset * 60) % 360;
    return `hsl(${hue}, 80%, 50%)`;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const t = Date.now() - startTime.current;
    const progress = Math.min(1, t / 15000); // 15 sec concert

    // Background - dark venue
    const venueScale = venue.type === 'stadium' ? 1 : venue.type === 'arena' ? 0.8 : venue.type === 'theater' ? 0.6 : 0.4;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Stars / ceiling lights
    if (venue.type === 'stadium' || venue.type === 'arena') {
      for (let i = 0; i < 30; i++) {
        const sx = (i * 137 + 50) % WIDTH;
        const sy = (i * 89 + 10) % 80;
        ctx.fillStyle = `rgba(255,255,200,${0.3 + Math.sin(t / 500 + i) * 0.3})`;
        ctx.fillRect(sx, sy, 2, 2);
      }
    }

    // Stage floor
    const stageY = HEIGHT * 0.35;
    const stageH = HEIGHT * 0.15;
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(0, stageY, WIDTH, stageH);
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, stageY, WIDTH, 4);

    // Stage lights
    const lightCount = venue.type === 'bar' ? 2 : venue.type === 'club' ? 4 : venue.type === 'theater' ? 6 : 8;
    for (let i = 0; i < lightCount; i++) {
      const lx = (WIDTH / (lightCount + 1)) * (i + 1);
      const color = getLightColor(t, i);
      
      // Light beam (cone)
      ctx.save();
      ctx.globalAlpha = 0.15 + Math.sin(t / 300 + i * 2) * 0.1;
      ctx.beginPath();
      ctx.moveTo(lx - 5, 0);
      ctx.lineTo(lx + 5, 0);
      const beamWidth = 40 + Math.sin(t / 500 + i) * 20;
      ctx.lineTo(lx + beamWidth, stageY + stageH);
      ctx.lineTo(lx - beamWidth, stageY + stageH);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();

      // Light fixture
      ctx.fillStyle = '#444';
      ctx.fillRect(lx - 6, 0, 12, 8);
      ctx.fillStyle = color;
      ctx.fillRect(lx - 4, 6, 8, 4);
    }

    // Smoke/fog effect
    ctx.save();
    ctx.globalAlpha = 0.05;
    for (let i = 0; i < 5; i++) {
      const fogX = ((t / 10 + i * 200) % (WIDTH + 200)) - 100;
      const fogY = stageY - 20 + Math.sin(t / 1000 + i) * 10;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fogX, fogY, 60 + Math.sin(t / 500 + i) * 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Band members on stage
    const memberSpacing = WIDTH / (members.length + 1);
    members.forEach((member, i) => {
      const mx = memberSpacing * (i + 1) - 20;
      const my = stageY - 48 * (PIXEL / 4);
      const memberScale = 1;
      drawPixelCharacter(ctx, mx, my, member, memberScale, phase === 'playing');
    });

    // Monitor/speaker stacks
    if (venue.type !== 'bar') {
      ctx.fillStyle = '#222';
      ctx.fillRect(10, stageY - 20, 30, 20);
      ctx.fillRect(WIDTH - 40, stageY - 20, 30, 20);
      ctx.fillStyle = '#111';
      ctx.fillRect(15, stageY - 15, 8, 8);
      ctx.fillRect(WIDTH - 35, stageY - 15, 8, 8);
    }

    // Banner
    if (venue.type === 'arena' || venue.type === 'stadium') {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(WIDTH * 0.25, 15, WIDTH * 0.5, 30);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ LIVE ★', WIDTH / 2, 37);
    }

    // Crowd area
    const crowdY = stageY + stageH + 20;
    const crowdRows = venue.type === 'bar' ? 2 : venue.type === 'club' ? 3 : venue.type === 'theater' ? 4 : venue.type === 'arena' ? 5 : 7;
    const crowdDensity = venue.type === 'bar' ? 8 : venue.type === 'club' ? 12 : 18;

    for (let row = 0; row < crowdRows; row++) {
      const rowY = crowdY + row * 22;
      const count = crowdDensity + row * 2;
      for (let i = 0; i < count; i++) {
        const cx = (WIDTH / count) * i + Math.sin(i * 7 + row * 3) * 8;
        const seed = (i * 17 + row * 31) % 10000;
        const personExcitement = result.crowdMood + Math.sin(t / 200 + i + row) * 15;
        drawCrowdPerson(ctx, cx, rowY, seed, personExcitement, 0.8 - row * 0.05);
      }
    }

    // Camera flash effect
    if (result.crowdMood > 60 && Math.random() > 0.97) {
      ctx.save();
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ffffff';
      const flashX = Math.random() * WIDTH;
      const flashY = crowdY + Math.random() * (crowdRows * 22);
      ctx.beginPath();
      ctx.arc(flashX, flashY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Strobe effect for high energy
    if (result.crowdMood > 80 && Math.sin(t / 100) > 0.9) {
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.restore();
    }

    // Event text
    if (phase === 'playing' && result.events[eventIndex]) {
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      const textAlpha = Math.min(1, Math.sin(t / 500) * 0.5 + 0.5);
      ctx.globalAlpha = textAlpha;
      ctx.fillText(result.events[eventIndex], WIDTH / 2, HEIGHT - 30);
      ctx.globalAlpha = 1;
    }

    // Intro/outro overlays
    if (phase === 'intro') {
      const introAlpha = Math.max(0, 1 - t / 2000);
      ctx.save();
      ctx.globalAlpha = introAlpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.globalAlpha = Math.min(1, t / 1000);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(venue.name, WIDTH / 2, HEIGHT / 2 - 15);
      ctx.font = '16px monospace';
      ctx.fillStyle = '#ccc';
      ctx.fillText(`Вместимость: ${venue.capacity}`, WIDTH / 2, HEIGHT / 2 + 15);
      ctx.restore();
    }

    if (phase === 'outro') {
      const outroT = t - 13000;
      const outroAlpha = Math.min(0.8, outroT / 2000);
      ctx.save();
      ctx.globalAlpha = outroAlpha;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.restore();
    }

    // Phase transitions
    if (t > 2000 && phase === 'intro') setPhase('playing');
    if (t > 13000 && phase === 'playing') setPhase('outro');
    if (t > 15000) {
      onFinish();
      return;
    }

    animFrame.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const c = canvas.getContext('2d');
        if (c) draw(c);
      }
    });
  }, [members, venue, result, phase, eventIndex, onFinish, getLightColor]);

  useEffect(() => {
    startTime.current = Date.now();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    draw(ctx);

    // Cycle events
    const eventTimer = setInterval(() => {
      setEventIndex(prev => (prev + 1) % Math.max(1, result.events.length));
    }, 3000);

    return () => {
      cancelAnimationFrame(animFrame.current);
      clearInterval(eventTimer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        className="border-2 border-primary/30 rounded-lg"
        style={{ imageRendering: 'pixelated', maxWidth: '100%' }}
      />
      <button
        onClick={onFinish}
        className="px-6 py-2 bg-primary text-primary-foreground rounded font-mono hover:opacity-80 transition-opacity"
      >
        Пропустить →
      </button>
    </div>
  );
};

export default ConcertScene;
