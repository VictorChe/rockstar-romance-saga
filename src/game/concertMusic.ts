// Procedural rock music generator using Web Audio API

type MusicGenreStyle = 'rock' | 'punk' | 'metal' | 'indie' | 'grunge' | 'alternative';

interface MusicConfig {
  bpm: number;
  distortion: number;
  reverbMix: number;
  notePattern: number[];
  bassPattern: number[];
  drumPattern: boolean[];
  hihatPattern: boolean[];
}

const GENRE_CONFIGS: Record<MusicGenreStyle, MusicConfig> = {
  rock: {
    bpm: 130,
    distortion: 20,
    reverbMix: 0.3,
    notePattern: [0, 0, 5, 5, 7, 7, 5, 3],
    bassPattern: [0, 0, 5, 5, 7, 7, 5, 3],
    drumPattern: [true, false, true, false, true, false, true, false],
    hihatPattern: [true, true, true, true, true, true, true, true],
  },
  punk: {
    bpm: 170,
    distortion: 40,
    reverbMix: 0.1,
    notePattern: [0, 0, 3, 3, 5, 5, 3, 0],
    bassPattern: [0, 0, 3, 3, 5, 5, 3, 0],
    drumPattern: [true, true, true, true, true, true, true, true],
    hihatPattern: [true, true, true, true, true, true, true, true],
  },
  metal: {
    bpm: 150,
    distortion: 60,
    reverbMix: 0.2,
    notePattern: [0, 1, 0, 3, 5, 3, 0, -2],
    bassPattern: [0, 0, 0, 3, 5, 3, 0, 0],
    drumPattern: [true, true, true, false, true, true, true, false],
    hihatPattern: [true, true, true, true, true, true, true, true],
  },
  indie: {
    bpm: 120,
    distortion: 8,
    reverbMix: 0.5,
    notePattern: [0, 4, 7, 4, 5, 9, 7, 4],
    bassPattern: [0, 0, 7, 7, 5, 5, 4, 4],
    drumPattern: [true, false, false, true, true, false, false, true],
    hihatPattern: [false, true, false, true, false, true, false, true],
  },
  grunge: {
    bpm: 115,
    distortion: 35,
    reverbMix: 0.4,
    notePattern: [0, 0, 5, 5, 3, 3, 0, -2],
    bassPattern: [0, 0, 5, 5, 3, 3, 0, 0],
    drumPattern: [true, false, true, false, true, false, true, true],
    hihatPattern: [true, false, true, true, true, false, true, true],
  },
  alternative: {
    bpm: 125,
    distortion: 15,
    reverbMix: 0.45,
    notePattern: [0, 3, 7, 10, 7, 3, 5, 0],
    bassPattern: [0, 0, 7, 7, 5, 5, 3, 0],
    drumPattern: [true, false, true, false, true, false, false, true],
    hihatPattern: [true, true, false, true, true, true, false, true],
  },
};

const ROOT_NOTE = 82.41; // E2 frequency

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let schedulerId: number | null = null;
let nextNoteTime = 0;
let currentStep = 0;

function getOrCreateContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function createDistortion(ctx: AudioContext, amount: number): WaveShaperNode {
  const ws = ctx.createWaveShaper();
  const samples = 44100;
  const curve = new Float32Array(samples);
  const k = amount;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
  }
  ws.curve = curve;
  ws.oversample = '4x';
  return ws;
}

function playGuitarNote(ctx: AudioContext, dest: AudioNode, freq: number, time: number, duration: number, distAmount: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const dist = createDistortion(ctx, distAmount);

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, time);
  
  gain.gain.setValueAtTime(0.12, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration * 0.9);

  osc.connect(dist);
  dist.connect(gain);
  gain.connect(dest);
  
  osc.start(time);
  osc.stop(time + duration);
}

function playBassNote(ctx: AudioContext, dest: AudioNode, freq: number, time: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);

  gain.gain.setValueAtTime(0.15, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + duration * 0.8);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + duration);
}

function playKick(ctx: AudioContext, dest: AudioNode, time: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, time);
  osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);

  gain.gain.setValueAtTime(0.4, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

  osc.connect(gain);
  gain.connect(dest);

  osc.start(time);
  osc.stop(time + 0.2);
}

function playSnare(ctx: AudioContext, dest: AudioNode, time: number) {
  // Noise burst for snare
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.2, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(dest);

  noise.start(time);
  noise.stop(time + 0.15);
}

function playHihat(ctx: AudioContext, dest: AudioNode, time: number) {
  const bufferSize = ctx.sampleRate * 0.03;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.06, time);
  gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 6000;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(dest);

  noise.start(time);
  noise.stop(time + 0.05);
}

function semitonesToFreq(base: number, semitones: number): number {
  return base * Math.pow(2, semitones / 12);
}

export function startConcertMusic(genre: MusicGenreStyle = 'rock', energy: number = 50) {
  if (isPlaying) stopConcertMusic();
  
  const ctx = getOrCreateContext();
  if (ctx.state === 'suspended') ctx.resume();

  const config = GENRE_CONFIGS[genre] || GENRE_CONFIGS.rock;
  
  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 1); // fade in
  masterGain.connect(ctx.destination);

  isPlaying = true;
  currentStep = 0;
  nextNoteTime = ctx.currentTime + 0.1;

  const stepDuration = 60 / config.bpm / 2; // eighth notes
  const energyMult = 0.5 + (energy / 100) * 0.8;

  function schedule() {
    while (nextNoteTime < ctx.currentTime + 0.2) {
      const step = currentStep % 8;

      // Guitar
      const guitarNote = config.notePattern[step];
      const guitarFreq = semitonesToFreq(ROOT_NOTE * 2, guitarNote);
      playGuitarNote(ctx, masterGain!, guitarFreq, nextNoteTime, stepDuration * 0.9, config.distortion * energyMult);

      // Bass (every other step)
      if (step % 2 === 0) {
        const bassNote = config.bassPattern[step];
        const bassFreq = semitonesToFreq(ROOT_NOTE, bassNote);
        playBassNote(ctx, masterGain!, bassFreq, nextNoteTime, stepDuration * 1.8);
      }

      // Kick on steps 0 and 4
      if (config.drumPattern[step]) {
        if (step % 4 === 0) {
          playKick(ctx, masterGain!, nextNoteTime);
        } else if (step % 4 === 2) {
          playSnare(ctx, masterGain!, nextNoteTime);
        }
      }

      // Hihat
      if (config.hihatPattern[step]) {
        playHihat(ctx, masterGain!, nextNoteTime);
      }

      nextNoteTime += stepDuration;
      currentStep++;
    }
    
    if (isPlaying) {
      schedulerId = window.setTimeout(schedule, 50);
    }
  }

  schedule();
}

export function stopConcertMusic() {
  if (!isPlaying) return;
  isPlaying = false;
  
  if (schedulerId !== null) {
    clearTimeout(schedulerId);
    schedulerId = null;
  }

  if (masterGain && audioCtx) {
    masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    setTimeout(() => {
      masterGain?.disconnect();
      masterGain = null;
    }, 600);
  }
}
