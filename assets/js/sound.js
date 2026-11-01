import { qs } from "./dom.js";
import { readValue, writeValue } from "./storage.js";

let enabled = false;
let audio = null;

function updateToggle(button, label, texts) {
  button.setAttribute("aria-pressed", String(enabled));
  button.setAttribute("aria-label", enabled ? texts.soundOnAria : texts.soundOffAria);
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

function getContext() {
  if (!enabled) return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  try {
    if (!audio) audio = new AudioCtx();
    if (audio.state === "suspended") audio.resume();
    return audio;
  } catch (error) {
    return null;
  }
}

function createNoise(ctx, seconds, fade) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const volume = fade ? Math.pow(1 - i / length, 2) : 1;
    data[i] = (Math.random() * 2 - 1) * volume;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  return source;
}

export function playBoom() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const noise = createNoise(ctx, 2, true);
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
}

export function playMeow() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const pitch = 0.85 + Math.random() * 0.4;
  const length = 0.55 + Math.random() * 0.25;

  const voice = ctx.createOscillator();
  voice.type = "sawtooth";
  voice.frequency.setValueAtTime(420 * pitch, now);
  voice.frequency.linearRampToValueAtTime(780 * pitch, now + length * 0.3);
  voice.frequency.linearRampToValueAtTime(520 * pitch, now + length * 0.75);
  voice.frequency.linearRampToValueAtTime(380 * pitch, now + length);

  const mouth = ctx.createBiquadFilter();
  mouth.type = "lowpass";
  mouth.Q.value = 6;
  mouth.frequency.setValueAtTime(700, now);
  mouth.frequency.linearRampToValueAtTime(2600, now + length * 0.3);
  mouth.frequency.linearRampToValueAtTime(900, now + length);

  const volume = ctx.createGain();
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
  volume.gain.setValueAtTime(0.25, now + length * 0.7);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + length);

  voice.connect(mouth);
  mouth.connect(volume);
  volume.connect(ctx.destination);
  voice.start(now);
  voice.stop(now + length + 0.05);
}

export function playPurr() {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const length = 1.4;

  const noise = createNoise(ctx, length, false);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 320;

  const rumble = ctx.createGain();
  rumble.gain.value = 0.5;
  const flutter = ctx.createOscillator();
  flutter.type = "sine";
  flutter.frequency.value = 24;
  const flutterDepth = ctx.createGain();
  flutterDepth.gain.value = 0.5;
  flutter.connect(flutterDepth);
  flutterDepth.connect(rumble.gain);

  const volume = ctx.createGain();
  volume.gain.setValueAtTime(0.0001, now);
  volume.gain.exponentialRampToValueAtTime(0.9, now + 0.2);
  volume.gain.setValueAtTime(0.9, now + length - 0.35);
  volume.gain.exponentialRampToValueAtTime(0.0001, now + length);

  noise.connect(filter);
  filter.connect(rumble);
  rumble.connect(volume);
  volume.connect(ctx.destination);
  noise.start(now);
  flutter.start(now);
  flutter.stop(now + length);
}
