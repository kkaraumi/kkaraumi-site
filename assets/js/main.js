import { content } from "./content.js";
import { qs, qsa } from "./dom.js";
import { renderPage } from "./render.js";
import { initCodeWindow } from "./code-window.js";
import { initStickers } from "./stickers.js";
import { initSound } from "./sound.js";
import { initCatBomb } from "./cat-bomb.js";

const MOBILE_QUERY = window.matchMedia("(max-width: 980px)");

function initMenu() {
  const burger = qs("#burger");
  const header = qs(".top");
  if (!burger || !header) return;

  function setOpen(isOpen) {
    header.classList.toggle("menu-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    burger.setAttribute("aria-label", isOpen ? content.site.menuClose : content.site.menuOpen);
  }

  burger.addEventListener("click", () => {
    setOpen(!header.classList.contains("menu-open"));
  });

  qsa("#navList a").forEach((link) => {
    link.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("menu-open")) {
      setOpen(false);
      burger.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (header.classList.contains("menu-open") && !header.contains(event.target)) setOpen(false);
  });

  MOBILE_QUERY.addEventListener("change", () => setOpen(false));
}

function initActiveSection() {
  const links = qsa("#navList a, .nav-cta");
  const sections = qsa("main section[id]");
  if (!("IntersectionObserver" in window)) return;

  function highlight(id) {
    links.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) highlight(entry.target.id);
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

function initTabTitle() {
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? content.site.awayTitle : content.site.pageTitle;
  });
}

renderPage(content);
initCodeWindow(content.code);
initStickers(content.meows);
initSound(content.contact);
initCatBomb(content.contact);
initMenu();
initActiveSection();
initTabTitle();
