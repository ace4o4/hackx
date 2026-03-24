/**
 * Procedural Web Audio API sound engine
 * No external files — all sounds are synthesized on-the-fly
 */

let audioCtx: AudioContext | null = null;

const getCtx = (): AudioContext => {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
};

/** Soft click — short sine blip */
export const playClick = () => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) { /* empty */ }
};

/** Whoosh — filtered noise sweep */
export const playWhoosh = () => {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.5;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.12);
    filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.25);
    filter.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.06);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.28);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + 0.3);
  } catch (e) { /* empty */ }
};

/** Particle pop — high sparkle */
export const playPop = () => {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) { /* empty */ }
};

/** Success chime — two-note arpeggio */
export const playSuccess = () => {
  try {
    const ctx = getCtx();
    [523.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.07, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch (e) { /* empty */ }
};

/** Ambient hum — low drone, returns stop function */
export const startAmbientHum = (): (() => void) => {
  try {
    const ctx = getCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc1.type = "sine";
    osc1.frequency.value = 80;
    osc2.type = "sine";
    osc2.frequency.value = 120;
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 2);
    
    // Subtle LFO for movement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 5;
    lfo.connect(lfoGain).connect(osc1.frequency);
    lfo.start();
    
    osc1.connect(gain).connect(ctx.destination);
    osc2.connect(gain);
    osc1.start();
    osc2.start();
    
    return () => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => {
        try { osc1.stop(); osc2.stop(); lfo.stop(); } catch (e) { /* empty */ }
      }, 1100);
    };
  } catch {
    return () => {};
  }
};

/** Haptic feedback (if supported) */
export const haptic = (style: "light" | "medium" | "heavy" = "light") => {
  try {
    const ms = style === "light" ? 10 : style === "medium" ? 25 : 50;
    navigator.vibrate?.(ms);
  } catch (e) { /* empty */ }
};
