import React, { useRef, useEffect, useCallback } from 'react';
import { Character, ConcertResult } from './types';
import { Venue } from './types';
import { drawPixelCharacter, drawCrowdPerson } from './pixelArt';
import { startConcertMusic, stopConcertMusic } from './concertMusic';

interface ConcertSceneProps {
  members: Character[];
  venue: Venue;
  result: ConcertResult;
  genre?: string;
  onFinish: () => void;
}

const PIXEL = 4;

const ConcertScene: React.FC<ConcertSceneProps> = ({ members, venue, result, genre = 'rock', onFinish }) => {
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

    // Background - venue-specific
    const stageY = HEIGHT * 0.35;
    const stageH = HEIGHT * 0.15;

    if (venue.type === 'bar') {
      // Dark brick wall background
      ctx.fillStyle = '#1a0e08';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      // Brick pattern
      for (let by = 0; by < stageY; by += 12) {
        for (let bx = 0; bx < WIDTH; bx += 28) {
          const offset = (Math.floor(by / 12) % 2) * 14;
          ctx.fillStyle = `hsl(15, 40%, ${8 + ((bx + by) * 7) % 4}%)`;
          ctx.fillRect(bx + offset, by, 26, 10);
        }
      }
      // Warm lamp glow
      ctx.save();
      ctx.globalAlpha = 0.08;
      const lampGrad = ctx.createRadialGradient(WIDTH / 2, stageY * 0.3, 10, WIDTH / 2, stageY * 0.3, 200);
      lampGrad.addColorStop(0, '#ffaa44');
      lampGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = lampGrad;
      ctx.fillRect(0, 0, WIDTH, stageY);
      ctx.restore();
      // Wooden stage
      ctx.fillStyle = '#3d2510';
      ctx.fillRect(0, stageY, WIDTH, stageH);
      ctx.fillStyle = '#4a2e15';
      ctx.fillRect(0, stageY, WIDTH, 4);
      // Wood grain lines
      for (let i = 0; i < 6; i++) {
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(0, stageY + 4 + i * (stageH / 6), WIDTH, 1);
      }
    } else if (venue.type === 'club') {
      // Neon-tinted dark club
      ctx.fillStyle = '#0a0515';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      // Neon accent strips on walls
      const neonHue = (t / 30) % 360;
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = `hsl(${neonHue}, 100%, 50%)`;
      ctx.fillRect(0, 0, 4, stageY);
      ctx.fillRect(WIDTH - 4, 0, 4, stageY);
      ctx.fillRect(0, 10, WIDTH, 3);
      ctx.restore();
      // Dark metallic stage
      ctx.fillStyle = '#1a1a2a';
      ctx.fillRect(0, stageY, WIDTH, stageH);
      ctx.fillStyle = '#2a2a3a';
      ctx.fillRect(0, stageY, WIDTH, 4);
    } else if (venue.type === 'theater') {
      // Elegant dark red / curtain feel
      ctx.fillStyle = '#12080a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      // Side curtains
      ctx.fillStyle = '#3a0a0a';
      ctx.fillRect(0, 0, 40, stageY + stageH);
      ctx.fillRect(WIDTH - 40, 0, 40, stageY + stageH);
      // Curtain folds
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = `rgba(80,10,10,${0.3 + i * 0.1})`;
        ctx.fillRect(i * 10, 0, 4, stageY + stageH);
        ctx.fillRect(WIDTH - i * 10 - 4, 0, 4, stageY + stageH);
      }
      // Top valance
      ctx.fillStyle = '#4a1010';
      ctx.fillRect(0, 0, WIDTH, 18);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(0, 16, WIDTH, 2);
      // Polished stage
      ctx.fillStyle = '#2a1808';
      ctx.fillRect(40, stageY, WIDTH - 80, stageH);
      ctx.fillStyle = '#3a2818';
      ctx.fillRect(40, stageY, WIDTH - 80, 4);
    } else if (venue.type === 'arena') {
      // Large dark arena with structural beams
      ctx.fillStyle = '#08081a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      // Ceiling structure
      ctx.fillStyle = '#151530';
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(i * (WIDTH / 4) - 2, 0, 4, stageY * 0.5);
      }
      ctx.fillRect(0, 0, WIDTH, 6);
      // Ceiling lights
      for (let i = 0; i < 20; i++) {
        const sx = (i * 137 + 50) % WIDTH;
        const sy = (i * 89 + 10) % 50;
        ctx.fillStyle = `rgba(200,200,255,${0.3 + Math.sin(t / 500 + i) * 0.3})`;
        ctx.fillRect(sx, sy, 3, 3);
      }
      // Wide stage with LED edge
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, stageY, WIDTH, stageH);
      const edgeHue = (t / 20) % 360;
      ctx.fillStyle = `hsl(${edgeHue}, 80%, 40%)`;
      ctx.fillRect(0, stageY, WIDTH, 3);
    } else {
      // Stadium - open air, night sky
      // Gradient sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, stageY * 0.6);
      skyGrad.addColorStop(0, '#020118');
      skyGrad.addColorStop(1, '#0a0a2a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      // Stars
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137 + 50) % WIDTH;
        const sy = (i * 89 + 5) % (stageY * 0.4);
        const twinkle = 0.3 + Math.sin(t / 600 + i * 1.7) * 0.4;
        ctx.fillStyle = `rgba(255,255,230,${twinkle})`;
        const sz = (i % 3 === 0) ? 3 : 2;
        ctx.fillRect(sx, sy, sz, sz);
      }
      // Stadium structure silhouette
      ctx.fillStyle = '#111122';
      ctx.fillRect(0, stageY * 0.4, WIDTH, stageY * 0.6);
      // Giant screens on sides
      ctx.fillStyle = '#0a0a20';
      ctx.fillRect(20, stageY * 0.45, 80, 50);
      ctx.fillRect(WIDTH - 100, stageY * 0.45, 80, 50);
      ctx.fillStyle = `hsl(${(t / 15) % 360}, 60%, 30%)`;
      ctx.fillRect(22, stageY * 0.45 + 2, 76, 46);
      ctx.fillRect(WIDTH - 98, stageY * 0.45 + 2, 76, 46);
      // Massive stage
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, stageY, WIDTH, stageH);
      // LED strip
      for (let i = 0; i < WIDTH; i += 8) {
        ctx.fillStyle = `hsl(${(t / 10 + i) % 360}, 90%, 50%)`;
        ctx.fillRect(i, stageY, 6, 3);
      }
    }

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

    // Start music
    startConcertMusic(genre as any, result.crowdMood);

    // Cycle events
    const eventTimer = setInterval(() => {
      setEventIndex(prev => (prev + 1) % Math.max(1, result.events.length));
    }, 3000);

    return () => {
      cancelAnimationFrame(animFrame.current);
      clearInterval(eventTimer);
      stopConcertMusic();
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
