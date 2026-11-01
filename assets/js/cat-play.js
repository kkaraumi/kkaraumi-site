import { qs, prefersReducedMotion } from "./dom.js";

const LOOP = 6;
const BALL_HOME = 200;
const BALL_FAR = 262;
const BALL_RADIUS = 14;
const THREAD_END = 296;

const easings = {
  line: (x) => x,
  out: (x) => 1 - Math.pow(1 - x, 3),
  in: (x) => x * x * x,
  soft: (x) => x * x * (3 - 2 * x),
};

const ballTrack = [
  [0, BALL_HOME], [0.85, BALL_HOME], [1.7, BALL_FAR, "out"], [3.35, BALL_FAR], [3.8, BALL_HOME, "soft"],
  [4.8, BALL_HOME], [5.05, 216, "out"], [5.3, 216], [5.65, BALL_HOME, "soft"], [6, BALL_HOME],
];

const pawAngleTrack = [
  [0, 0], [0.5, 0], [0.72, -38, "soft"], [0.85, 6, "in"], [1.05, 0, "soft"],
  [4.55, 0], [4.72, -24, "soft"], [4.84, 4, "in"], [5, 0, "soft"], [6, 0],
];

const pawReachTrack = [
  [0, 0], [3.1, 0], [3.35, 50, "out"], [3.8, 0, "soft"],
  [5.1, 0], [5.3, 12, "out"], [5.65, 0, "soft"], [6, 0],
];

const leanTrack = [
  [0, 0], [2.2, 0], [2.45, -7, "soft"], [3.1, -7], [3.35, 12, "out"], [3.8, 0, "soft"],
  [5.1, 0], [5.3, 4, "out"], [5.65, 0, "soft"], [6, 0],
];

const blinkTrack = [
  [0, 1], [2.05, 1], [2.12, 0.1, "soft"], [2.2, 1, "soft"], [5.75, 1], [5.82, 0.1, "soft"], [5.9, 1, "soft"], [6, 1],
];

function valueAt(track, time) {
  for (let i = 1; i < track.length; i++) {
    const [endTime, endValue, ease = "line"] = track[i];
    const [startTime, startValue] = track[i - 1];
    if (time <= endTime) {
      const part = endTime === startTime ? 1 : (time - startTime) / (endTime - startTime);
      return startValue + (endValue - startValue) * easings[ease](part);
    }
  }
  return track[track.length - 1][1];
}

export function initCatPlay() {
  const scene = qs("#catPlay");
  if (!scene) return;
  const body = qs("#cpBody");
  const tail = qs("#cpTail");
  const paw = qs("#cpPaw");
  const head = qs("#cpHead");
  const eyes = qs("#cpEyes");
  const ball = qs("#cpBall");
  const spin = qs("#cpBallSpin");
  const ballShadow = qs("#cpBallShadow");
  const thread = qs("#cpThread");

  function drawFrame(time) {
    const t = time % LOOP;
    const ballX = valueAt(ballTrack, t);
    const look = (ballX - BALL_HOME) / (BALL_FAR - BALL_HOME);
    const crouching = t > 2.45 && t < 3.1;
    const wiggle = crouching ? Math.sin((t - 2.45) * Math.PI * 10) * 2.5 : 0;
    const lean = valueAt(leanTrack, t) + wiggle;

    body.setAttribute("transform", `translate(${lean} ${crouching ? 3 : 0})`);

    const tailSpeed = crouching ? 6 : 1.4;
    const tailSize = crouching ? 14 : 9;
    tail.setAttribute("transform", `rotate(${Math.sin((time / tailSpeed) * Math.PI * 2) * tailSize} 84 118)`);

    const reach = valueAt(pawReachTrack, t);
    paw.setAttribute("transform", `translate(${reach} 0) rotate(${valueAt(pawAngleTrack, t)} 138 110)`);

    const tilt = -4 + look * 8 + (crouching ? 4 : 0);
    head.setAttribute("transform", `rotate(${tilt} 148 100)`);

    const blink = valueAt(blinkTrack, t);
    eyes.setAttribute("transform", `translate(${look * 3} ${look}) translate(0 67) scale(1 ${blink}) translate(0 -67)`);

    const spinAngle = ((ballX - BALL_HOME) / BALL_RADIUS) * (180 / Math.PI);
    ball.setAttribute("transform", `translate(${ballX} 124)`);
    spin.setAttribute("transform", `rotate(${spinAngle})`);
    ballShadow.setAttribute("cx", ballX);

    const middle = (ballX + THREAD_END) / 2;
    thread.setAttribute("d", `M${ballX + 6} 131 Q ${middle} 142 ${THREAD_END} 134`);
  }

  if (prefersReducedMotion()) {
    drawFrame(0.3);
    return;
  }

  let visible = true;
  let running = false;
  const started = performance.now();

  function loop(now) {
    if (!visible) {
      running = false;
      return;
    }
    drawFrame((now - started) / 1000);
    requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
    });
    observer.observe(scene);
  }

  start();
}
