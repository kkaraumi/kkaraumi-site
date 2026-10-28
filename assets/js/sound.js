import { qs } from "./dom.js";
import { readValue, writeValue } from "./storage.js";

let enabled = false;

function updateToggle(button, label, texts) {
  button.setAttribute("aria-pressed", String(enabled));
  button.classList.toggle("is-on", enabled);
  label.textContent = enabled ? texts.soundOn : texts.soundOff;
}

export function initSound(texts) {
  const button = qs("#soundToggle");
  const label = qs("#soundLabel");
  if (!button || !label) return;
  enabled = readValue("sound", false) === true;
  updateToggle(button, label, texts);
  button.addEventListener("click", () => {
    enabled = !enabled;
    writeValue("sound", enabled);
    updateToggle(button, label, texts);
  });
}

function createNoise(ctx, seconds) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

export function playBoom() {
  if (!enabled) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  try {
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const noise = createNoise(ctx, 2);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(60, now + 1.8);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    const thump = ctx.createOscillator();
    thump.type = "sine";
    thump.frequency.setValueAtTime(90, now);
    thump.frequency.exponentialRampToValueAtTime(30, now + 0.8);
    const thumpGain = ctx.createGain();
    thumpGain.gain.setValueAtTime(0.7, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 1);
    thump.connect(thumpGain);
    thumpGain.connect(ctx.destination);

    noise.start(now);
    thump.start(now);
    thump.stop(now + 1);
    setTimeout(() => ctx.close(), 2500);
  } catch (error) {
    enabled = false;
  }
}
