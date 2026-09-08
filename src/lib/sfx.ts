let ctx: AudioContext | null = null;
let muted = localStorage.getItem("hyperion_muted") === "1";

export const isMuted = () => muted;
export const toggleMute = () => {
  muted = !muted;
  localStorage.setItem("hyperion_muted", muted ? "1" : "0");
  return muted;
};

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.06, delay = 0) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const t = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur);
}

export const sfx = {
  click: () => tone(210 + Math.random() * 40, 0.07, "square", 0.035),
  crit: () => {
    tone(320, 0.08, "square", 0.05);
    tone(640, 0.12, "square", 0.05, 0.06);
  },
  buy: () => {
    tone(440, 0.09, "triangle", 0.06);
    tone(660, 0.14, "triangle", 0.06, 0.08);
  },
  rare: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, "triangle", 0.055, i * 0.07));
  },
  fail: () => tone(140, 0.2, "sawtooth", 0.04),
  splash: () => {
    tone(300, 0.1, "sine", 0.05);
    tone(180, 0.16, "sine", 0.04, 0.07);
  },
};
