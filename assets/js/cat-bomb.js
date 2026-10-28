import { qs, restartClass, prefersReducedMotion, pluralRu } from "./dom.js";
import { readValue, writeValue } from "./storage.js";
import { playBoom } from "./sound.js";

const TREMBLE_TIME = 900;
const BURN_TIME = 1150;
const REVEAL_TIME = 2700;

export function initCatBomb(texts) {
  const button = qs("#pawBtn");
  const label = qs("#pawLabel");
  const stage = qs("#stage");
  const cat = qs("#bombCat");
  const status = qs("#catStatus");
  const list = qs("#contactList");
  const flash = qs("#flash");
  const main = qs("#main");
  if (!button || !stage || !cat || !list) return;

  let booms = Number(readValue("booms", 0)) || 0;

  function statusText() {
    if (booms <= 1) return texts.firstStatus;
    return texts.repeatStatus.replace("{count}", booms).replace("{word}", pluralRu(booms, texts.boomWords));
  }

  function openContacts() {
    list.classList.remove("locked");
    list.removeAttribute("inert");
    restartClass(list, "open");
    label.textContent = texts.againLabel;
    button.setAttribute("aria-label", texts.againAria);
    status.textContent = statusText();
    button.disabled = false;
  }

  function burnCat() {
    cat.classList.add("burnt");
    stage.classList.add("charred");
  }

  function explode() {
    const box = stage.getBoundingClientRect();
    flash.style.setProperty("--x", `${box.left + box.width / 2}px`);
    flash.style.setProperty("--y", `${box.top + box.height / 2}px`);
    cat.classList.remove("tremble");
    stage.classList.remove("alert");
    playBoom();
    restartClass(stage, "boom");
    restartClass(flash, "on");
    restartClass(main, "shake");
  }

  button.addEventListener("click", () => {
    button.disabled = true;
    booms += 1;
    writeValue("booms", booms);
    cat.classList.remove("burnt");
    stage.classList.remove("boom", "charred", "alert");
    status.textContent = "";

    if (prefersReducedMotion()) {
      playBoom();
      burnCat();
      openContacts();
      return;
    }

    cat.classList.add("tremble");
    restartClass(stage, "alert");
    label.textContent = texts.waitLabel;
    setTimeout(explode, TREMBLE_TIME);
    setTimeout(burnCat, BURN_TIME);
    setTimeout(openContacts, REVEAL_TIME);
  });
}
