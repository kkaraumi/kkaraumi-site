import { qs, el, prefersReducedMotion } from "./dom.js";

const FIRST_LINE_DELAY = 0.4;
const LINE_STEP = 0.18;

function renderLine(tokens, index, isLast) {
  const line = el("span", { className: "ln" });
  if (tokens.length === 0) line.textContent = " ";
  tokens.forEach(([type, text]) => {
    if (type === "t") {
      line.append(document.createTextNode(text));
    } else {
      line.append(el("i", { className: type, text }));
    }
  });
  if (isLast) line.append(el("b", { className: "caret", attrs: { "aria-hidden": "true" } }));
  if (!prefersReducedMotion()) line.style.animationDelay = `${FIRST_LINE_DELAY + index * LINE_STEP}s`;
  return line;
}

export function initCodeWindow(code) {
  const body = qs("#codeBody");
  if (!body) return;
  body.setAttribute("aria-hidden", "true");
  code.lines.forEach((tokens, index) => {
    body.append(renderLine(tokens, index, index === code.lines.length - 1));
  });
}
