import { qsa, el, restartClass } from "./dom.js";

const DRAG_THRESHOLD = 5;
const BUBBLE_LIFETIME = 1000;

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function sayMeow(sticker, meows) {
  const bubble = el("span", { className: "meow", text: randomItem(meows), attrs: { "aria-hidden": "true" } });
  sticker.append(bubble);
  restartClass(sticker, "wiggle");
  setTimeout(() => bubble.remove(), BUBBLE_LIFETIME);
}

function makeDraggable(sticker, meows) {
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let dragging = false;
  let moved = false;

  sticker.addEventListener("pointerdown", (event) => {
    dragging = true;
    moved = false;
    startX = event.clientX;
    startY = event.clientY;
    sticker.setPointerCapture(event.pointerId);
    sticker.classList.add("grab");
  });

  sticker.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) moved = true;
    if (moved) sticker.style.translate = `${offsetX + dx}px ${offsetY + dy}px`;
  });

  sticker.addEventListener("pointerup", (event) => {
    if (!dragging) return;
    dragging = false;
    sticker.classList.remove("grab");
    if (moved) {
      offsetX += event.clientX - startX;
      offsetY += event.clientY - startY;
    } else {
      sayMeow(sticker, meows);
    }
  });

  sticker.addEventListener("pointercancel", () => {
    dragging = false;
    sticker.classList.remove("grab");
  });

  sticker.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      sayMeow(sticker, meows);
    }
  });
}

export function initStickers(meows) {
  qsa(".sticker").forEach((sticker) => makeDraggable(sticker, meows));
}
