export type SoundName =
  | 'hop' | 'bounce' | 'slide' | 'crumble' | 'fall'
  | 'combo' | 'win' | 'lose' | 'rule';

const MUTE_KEY = 'floorisaliar-muted';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;
let musicTimer: number | null = null;
let nextStepTime = 0;
let step = 0;

function readMuted(): boolean {
  try { return localStorage.getItem(MUTE_KEY) === '1'; } catch { return false; }
}
let muted = readMuted();

export function isMuted(): boolean { return muted; }

export function setMuted(m: boolean): void {
  muted = m;
  try { localStorage.setItem(MUTE_KEY, m ? '1' : '0'); } catch { /* ignore */ }
  if (ctx && master) master.gain.setTargetAtTime(m ? 0 : 0.7, ctx.currentTime, 0.02);
}

/** Call from a user click (Play). Safe to call repeatedly. */
export function initAudio(): void {
  if (!ctx) {
    const AC: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.7;
    master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') void ctx.resume();
}

function tone(t0: number, freq: number, dur: number, type: OscillatorType, vol: number, endFreq?: number): void {
  if (!ctx || !master) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise(t0: number, dur: number, vol: number, type: BiquadFilterType, f0: number, f1?: number): void {
  if (!ctx || !master || !noiseBuf) return;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const filt = ctx.createBiquadFilter();
  filt.type = type;
  filt.frequency.setValueAtTime(f0, t0);
  if (f1) filt.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filt);
  filt.connect(g);
  g.connect(master);
  src.start(t0);
  src.stop(t0 + Math.min(dur, 0.95) + 0.02);
}

export function play(name: SoundName): void {
  if (muted || !ctx) return;
  const t = ctx.currentTime;
  switch (name) {
    case 'hop':
      tone(t, 380, 0.09, 'square', 0.1, 620);
      break;
    case 'bounce':
      tone(t, 220, 0.35, 'sine', 0.3, 900);
      tone(t + 0.05, 440, 0.25, 'triangle', 0.1, 1200);
      break;
    case 'slide':
      noise(t, 0.5, 0.25, 'bandpass', 600, 2400);
      break;
    case 'crumble':
      noise(t, 0.6, 0.4, 'lowpass', 1200, 150);
      tone(t, 120, 0.3, 'sawtooth', 0.12, 50);
      break;
    case 'fall':
      tone(t, 700, 0.9, 'sawtooth', 0.15, 60);
      break;
    case 'combo':
      [523, 659, 784].forEach((f, i) => tone(t + i * 0.07, f, 0.14, 'square', 0.09));
      break;
    case 'win':
      [523, 659, 784, 1047, 1319].forEach((f, i) => tone(t + i * 0.09, f, 0.25, 'triangle', 0.18));
      [523, 659, 784, 1047].forEach((f) => tone(t + 0.5, f, 0.9, 'sine', 0.1));
      break;
    case 'lose':
      [392, 330, 262, 196].forEach((f, i) => tone(t + i * 0.18, f, 0.3, 'sawtooth', 0.12));
      break;
    case 'rule':
      tone(t, 880, 0.25, 'sine', 0.2);
      tone(t + 0.25, 660, 0.4, 'sine', 0.2);
      break;
  }
}

// --- Disco beat: 118 BPM, 16th-note scheduler ---
const STEP_SECONDS = 60 / 118 / 4;
const BASS = [110, 0, 220, 110, 0, 220, 110, 0, 131, 0, 262, 131, 0, 262, 131, 0];

function schedule(): void {
  if (!ctx) return;
  while (nextStepTime < ctx.currentTime + 0.25) {
    const s = step % 16;
    if (!muted) {
      if (s % 4 === 0) tone(nextStepTime, 150, 0.18, 'sine', 0.3, 45);              // kick
      if (s % 4 === 2) noise(nextStepTime, 0.08, 0.06, 'highpass', 7000);           // off-beat hat
      if (s % 8 === 4) noise(nextStepTime, 0.12, 0.08, 'bandpass', 1800);           // clap
      if (BASS[s]) tone(nextStepTime, BASS[s], STEP_SECONDS * 1.6, 'triangle', 0.12); // bass
    }
    nextStepTime += STEP_SECONDS;
    step++;
  }
}

export function startMusic(): void {
  if (!ctx || musicTimer !== null) return;
  step = 0;
  nextStepTime = ctx.currentTime + 0.1;
  musicTimer = window.setInterval(schedule, 80);
}

export function stopMusic(): void {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
}