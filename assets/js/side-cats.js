import { qs, prefersReducedMotion } from "./dom.js";

const TOP_GAP = 90;
const BOTTOM_GAP = 150;
const MAX_SHIFT = 34;
const MIN_SHIFT = 6;

function scrollProgress() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / maxScroll));
}

export function initSideCats() {
  const yarnCat = qs("#yarnCat");
  const thread = qs("#yarnThread");
  const body = qs("#yarnBody");
  if (!yarnCat || !thread || !body) return;

  let lastScroll = window.scrollY;
  let speed = 0;
  let swing = 0;
  let threadLength = TOP_GAP;
  let maxShift = MIN_SHIFT;

  function measureGutter() {
    const main = qs("main");
    const contentLeft = main.getBoundingClientRect().left + parseFloat(getComputedStyle(main).paddingLeft);
    const catRight = yarnCat.getBoundingClientRect().left + yarnCat.offsetWidth;
    maxShift = Math.max(MIN_SHIFT, Math.min(MAX_SHIFT, contentLeft - catRight - 20));
  }

  function place(time) {
    const range = window.innerHeight - TOP_GAP - BOTTOM_GAP;
    const progress = scrollProgress();
    const delta = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    speed = speed * 0.85 + delta * 0.15;

    const targetLength = TOP_GAP + progress * range;
    threadLength += (targetLength - threadLength) * 0.12;
    const maxAngle = (Math.atan(maxShift / threadLength) * 180) / Math.PI;
    const idleSwing = Math.sin(time / 900) * maxAngle * 0.35;
    const targetSwing = Math.max(-maxAngle, Math.min(maxAngle, -speed * 0.6 + idleSwing));
    swing += (targetSwing - swing) * 0.1;

    thread.style.height = `${threadLength}px`;
    body.style.transform = `translateY(${threadLength}px)`;
    yarnCat.style.transform = `rotate(${swing}deg)`;

    requestAnimationFrame(place);
  }

  if (prefersReducedMotion()) {
    const range = window.innerHeight - TOP_GAP - BOTTOM_GAP;
    thread.style.height = `${TOP_GAP + range / 2}px`;
    body.style.transform = `translateY(${TOP_GAP + range / 2}px)`;
    return;
  }

  yarnCat.style.transform = "none";
  measureGutter();
  window.addEventListener("resize", measureGutter);
  requestAnimationFrame(place);
}
