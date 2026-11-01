import { qsa, el, restartClass } from "./dom.js";
import { playMeow, playPurr } from "./sound.js";

const BUBBLE_LIFETIME = 1000;

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function talk(sticker, meows) {
  const phrase = randomItem(meows);
  sticker.querySelector(".meow")?.remove();
  const bubble = el("span", { className: "meow", text: phrase.text, attrs: { "aria-hidden": "true" } });
  sticker.append(bubble);
  restartClass(sticker, "wiggle");
  setTimeout(() => bubble.remove(), BUBBLE_LIFETIME);
  if (phrase.sound === "purr") {
    playPurr();
  } else {
    playMeow();
  }
}

export function initStickers(meows) {
  qsa(".sticker").forEach((sticker) => {
    sticker.addEventListener("click", () => talk(sticker, meows));
    sticker.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        talk(sticker, meows);
      }
    });
  });
}
