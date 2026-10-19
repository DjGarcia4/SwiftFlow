// Draws the "Ritmo" stage on a canvas, once a frame: the finger lanes, the
// line the letters land on, the letters falling toward it and everything
// a press sets off. The notes move on the song's clock (`now`, handed in
// each frame); the effects they leave -- bursts, labels, the milestones,
// the confetti -- run on the page's own clock, so they keep playing after
// the song stops and in the demo on the start screen.
//
// It paints with the app's own tokens (paper, charcoal, the accent the
// level unlocked, success and danger), read from the page, so the stage
// looks like the rest of SwiftFlow in light, dark and high contrast.
//
// Not unit tested: jsdom has no canvas, the same tradeoff as the share card.

import { fingerRgb } from "@/features/typing-test/utils/keyboardMap";

// The eight fingers that type letters, left to right: one lane each
export const LANES = [
  "left-pinky",
  "left-ring",
  "left-middle",
  "left-index",
  "right-index",
  "right-middle",
  "right-ring",
  "right-pinky",
];

export const laneOf = (finger) => {
  const lane = LANES.indexOf(finger);
  return lane === -1 ? 3 : lane;
};

const BURST_MS = 650;
const LABEL_MS = 700;
const FLASH_MS = 180;
const MISS_FADE_MS = 600;
const SHAKE_MS = 220;
const MILESTONE_MS = 1100;
const APPROACH_RING_MS = 520;
const COUNTDOWN_BEATS = 4;
const EQ_BARS = 28;
const AMBIENT_DOTS = 26;
const GRAVITY = 0.0009; // px per ms², for the particles
const LETTER_FONT = '"JetBrains Mono", ui-monospace, monospace';
const LABEL_FONT = '"Nunito", ui-sans-serif, system-ui, sans-serif';

const TOKENS = {
  paper: "--color-paper-white",
  ink: "--color-charcoal",
  muted: "--color-pencil-gray",
  line: "--color-faded-gray",
  primary: "--color-primary",
  tint: "--color-primary-tint",
  success: "--color-success",
  danger: "--color-danger",
};

// "#f97316" or "rgb(…)" to [r, g, b]
const toRgb = (value) => {
  const text = value.trim();
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(text);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join("") : hex[1];
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16));
  }
  const numbers = text.match(/\d+(\.\d+)?/g);
  return numbers?.length >= 3 ? numbers.slice(0, 3).map(Number) : [100, 116, 139];
};

const readPalette = () => {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Object.entries(TOKENS).map(([name, token]) => [
      name,
      toRgb(style.getPropertyValue(token) || "#64748b"),
    ])
  );
};

const rgba = ([r, g, b], alpha = 1) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

const mix = (a, b, t) => a.map((value, i) => Math.round(value + (b[i] - value) * t));

// A stable pseudo-random number in [0, 1) for a pair of integers: the
// equalizer and the floating dots look random but don't flicker
const noise = (a, b = 0) => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const easeOutBack = (t) => {
  const c = 1.70158;
  return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2;
};

const gradeRgb = (palette, grade) =>
  ({
    perfect: palette.primary,
    good: palette.success,
    early: palette.muted,
    late: palette.muted,
    miss: palette.danger,
    held: palette.success,
    dropped: palette.muted,
  })[grade] ?? palette.primary;

const NO_STAGE = {
  resize() {},
  draw() {},
  flash() {},
  judged() {},
  milestone() {},
  celebrate() {},
  clear() {},
  busy: () => false,
  destroy() {},
};

export const createStage = (canvas) => {
  const ctx = canvas?.getContext?.("2d");
  // No canvas to draw on (jsdom): the game still runs, unseen
  if (!ctx) return NO_STAGE;
  let width = 0;
  let height = 0;
  let effects = [];
  let particles = [];
  const flashes = new Map(); // lane -> when it was pressed
  let shakeAt = -Infinity;
  let missAt = -Infinity;
  let palette = readPalette();
  const clock = () => performance.now();

  // The theme or the accent changing re-reads the colors
  const observer = new MutationObserver(() => {
    palette = readPalette();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme", "data-accent", "data-contrast", "class"],
  });
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  const onScheme = () => {
    palette = readPalette();
  };
  media?.addEventListener?.("change", onScheme);

  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const geometry = () => {
    const pad = Math.max(12, width * 0.03);
    const laneWidth = (width - pad * 2) / LANES.length;
    return {
      laneX: (lane) => pad + laneWidth * (lane + 0.5),
      // Room under the line for the words
      hitY: height - Math.min(112, height * 0.28),
      topY: 12,
      radius: Math.max(11, Math.min(19, laneWidth * 0.3)),
      laneWidth,
      pad,
    };
  };

  const spray = ({ x, y, rgb, count, speed, spread = Math.PI * 2, angle = 0, life }) => {
    for (let i = 0; i < count; i++) {
      const direction = angle + (Math.random() - 0.5) * spread;
      const velocity = speed * (0.45 + Math.random() * 0.75);
      particles.push({
        x,
        y,
        vx: Math.cos(direction) * velocity,
        vy: Math.sin(direction) * velocity,
        size: 1.6 + Math.random() * 2.6,
        rgb,
        start: clock(),
        life: life * (0.7 + Math.random() * 0.6),
        spin: Math.random() * Math.PI,
        square: Math.random() < 0.35,
      });
    }
  };

  // A press in a lane, lit for a moment
  const flash = (lane) => flashes.set(lane, clock());

  // What a judged note leaves: a burst where it landed, its grade and the
  // points it made
  const judged = ({ lane, grade, points = 0, reducedMotion }) => {
    const { laneX, hitY } = geometry();
    const x = laneX(lane);
    const at = clock();
    effects.push({ kind: "label", grade, x, y: hitY - 36, start: at, points });
    if (grade === "miss") {
      missAt = at;
      if (!reducedMotion) shakeAt = at;
      return;
    }
    if (grade === "dropped" || reducedMotion) return;
    const rgb = mix(gradeRgb(palette, grade), fingerRgb(LANES[lane]), 0.35);
    effects.push({
      kind: "shockwave",
      x,
      y: hitY,
      start: at,
      rgb,
      big: grade === "perfect",
    });
    spray({
      x,
      y: hitY,
      rgb,
      count: grade === "perfect" ? 18 : grade === "held" ? 14 : 10,
      speed: grade === "perfect" ? 0.42 : 0.3,
      angle: -Math.PI / 2,
      spread: Math.PI * 1.3,
      life: 700,
    });
    if (grade === "perfect" || grade === "held") {
      effects.push({ kind: "sparkle", x, y: hitY, start: at, rgb: palette.primary });
    }
  };

  // A big word across the middle: the multiplier going up, the star mode
  const milestone = ({ text, kind = "multiplier", reducedMotion }) => {
    effects.push({ kind: "milestone", text, start: clock(), star: kind === "star" });
    if (reducedMotion || kind !== "star") return;
    const { laneX, hitY } = geometry();
    for (let lane = 0; lane < LANES.length; lane++) {
      spray({
        x: laneX(lane),
        y: hitY,
        rgb: lane % 2 ? palette.primary : fingerRgb(LANES[lane]),
        count: 10,
        speed: 0.5,
        angle: -Math.PI / 2,
        spread: Math.PI * 0.6,
        life: 1100,
      });
    }
  };

  // Confetti from the top, for a great run
  const celebrate = ({ reducedMotion } = {}) => {
    if (reducedMotion) return;
    const at = clock();
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * width,
        y: -10 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 0.12,
        vy: 0.05 + Math.random() * 0.15,
        size: 3 + Math.random() * 3,
        rgb: i % 3 === 0 ? palette.primary : fingerRgb(LANES[i % LANES.length]),
        start: at + Math.random() * 500,
        life: 2600,
        spin: Math.random() * Math.PI,
        square: true,
        confetti: true,
      });
    }
  };

  // Whether something is still moving with the song stopped
  const busy = () => particles.length > 0 || effects.length > 0;

  // frame: {
  //   now (the song's ms, or -Infinity before it), beatMs, approachMs,
  //   playStartMs, star, combo, notes: the chart's, laneOf(note),
  //   judgmentOf(note), labels: grade -> word, countdown: four words (3, 2,
  //   1, go), reducedMotion
  // }
  const draw = (frame) => {
    const { now, beatMs, approachMs, star, combo, notes, labels } = frame;
    const { laneX, hitY, topY, radius, laneWidth, pad } = geometry();
    const { paper, ink, muted, line, primary } = palette;
    const motion = !frame.reducedMotion;
    const at = clock();
    const playing = Number.isFinite(now);
    const beat = playing && now >= 0 ? now / beatMs : at / 600;
    const phase = beat - Math.floor(beat);
    const kick = (1 - phase) ** 3;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // A miss shakes the stage a little
    const shake = motion ? Math.max(0, 1 - (at - shakeAt) / SHAKE_MS) : 0;
    if (shake > 0) {
      ctx.translate((Math.random() - 0.5) * 7 * shake, (Math.random() - 0.5) * 4 * shake);
    }

    // The floor warms up on every beat, in the accent (stronger in star mode)
    const pulse = motion ? 0.05 + 0.16 * kick : 0.08;
    const glow = ctx.createLinearGradient(0, hitY - height * 0.5, 0, height);
    glow.addColorStop(0, rgba(primary, 0));
    glow.addColorStop(1, rgba(primary, star ? pulse * 2.2 : pulse));
    ctx.fillStyle = glow;
    ctx.fillRect(-10, -10, width + 20, height + 20);

    // Dots floating up, slowly, in the fingers' colors
    if (motion) {
      for (let i = 0; i < AMBIENT_DOTS; i++) {
        const speed = 0.012 + noise(i, 1) * 0.025;
        const travel = (at * speed + noise(i, 2) * height) % (height + 20);
        const x = noise(i, 3) * width + Math.sin(at / 1400 + i) * 8;
        const y = height + 10 - travel;
        const rgb = star ? primary : fingerRgb(LANES[i % LANES.length]);
        ctx.fillStyle = rgba(rgb, 0.1 + 0.12 * noise(i, 4) + (star ? 0.15 : 0));
        ctx.beginPath();
        ctx.arc(x, y, 1.2 + noise(i, 5) * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // An equalizer under the line, jumping with the beat
    const barWidth = width / EQ_BARS;
    for (let i = 0; i < EQ_BARS; i++) {
      const level = playing
        ? 0.25 + 0.75 * noise(i, Math.floor(beat * 2)) * (0.35 + 0.65 * kick)
        : 0.2 + 0.25 * (0.5 + 0.5 * Math.sin(at / 500 + i * 0.7));
      const barHeight = (height - hitY) * 0.9 * (motion ? level : 0.3);
      const rgb = mix(primary, fingerRgb(LANES[Math.floor((i / EQ_BARS) * 8)]), 0.4);
      ctx.fillStyle = rgba(rgb, star ? 0.22 : 0.11);
      const x = i * barWidth + barWidth * 0.18;
      ctx.beginPath();
      if (ctx.roundRect)
        ctx.roundRect(x, height - barHeight, barWidth * 0.64, barHeight, 3);
      else ctx.rect(x, height - barHeight, barWidth * 0.64, barHeight);
      ctx.fill();
    }

    // The lanes, faintly, with the gap between the hands a touch stronger
    ctx.lineWidth = 1;
    for (let lane = 0; lane <= LANES.length; lane++) {
      const x = pad + laneWidth * lane;
      ctx.strokeStyle = rgba(line, lane === 4 ? 0.9 : 0.45);
      ctx.setLineDash(lane === 4 ? [] : [3, 6]);
      ctx.lineDashOffset = motion && playing ? -now / 40 : 0;
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, hitY);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // The letters on their way, gathered first: the beams and the rings
    // under them need to know where they are
    const span = hitY - topY - radius;
    const yAt = (time) => hitY - ((time - now) / approachMs) * span;
    const visible = [];
    const nextInLane = new Map();
    for (const note of playing ? notes : []) {
      if (note.time - now > approachMs) break;
      const end = note.time + (note.hold ?? 0);
      if (now - end > MISS_FADE_MS) continue;
      const judgment = frame.judgmentOf(note);
      const hold = judgment?.hold;
      const missed = judgment?.grade === "miss";
      // Hit and done with: nothing left to draw
      if (
        judgment &&
        !missed &&
        hold !== "holding" &&
        !(hold === "dropped" && now < end)
      ) {
        continue;
      }
      const lane = frame.laneOf(note);
      if (!judgment && !nextInLane.has(lane)) nextInLane.set(lane, note);
      visible.push({
        note,
        lane,
        missed,
        hold,
        x: laneX(lane),
        // Held down, the head stays on the line while the tail runs through
        y: hold === "holding" ? hitY : yAt(note.time),
        tailY: note.hold ? Math.max(topY, yAt(end)) : null,
      });
    }

    // A soft beam down the lane of each letter coming next
    for (const [lane, note] of nextInLane) {
      const closeness = Math.max(0, 1 - (note.time - now) / approachMs);
      const x = laneX(lane);
      const beam = ctx.createLinearGradient(0, topY, 0, hitY);
      const rgb = fingerRgb(LANES[lane]);
      beam.addColorStop(0, rgba(rgb, 0));
      beam.addColorStop(1, rgba(rgb, 0.04 + 0.14 * closeness ** 2));
      ctx.fillStyle = beam;
      ctx.fillRect(x - laneWidth / 2 + 1, topY, laneWidth - 2, hitY - topY);
    }

    // The combo, big and faint behind everything, beating
    if (combo >= 5) {
      const size = Math.min(120, height * 0.3) * (1 + (motion ? 0.05 * kick : 0));
      ctx.fillStyle = rgba(primary, star ? 0.16 : 0.1);
      ctx.font = `900 ${size}px ${LABEL_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(combo), width / 2, hitY * 0.5);
    }

    // The countdown, on the last beats before the first letter lands
    if (playing && frame.playStartMs && frame.countdown) {
      const beatsLeft = (frame.playStartMs - now) / beatMs;
      if (beatsLeft > -0.9 && beatsLeft <= COUNTDOWN_BEATS - 1) {
        const index = Math.min(3, Math.max(0, 3 - Math.ceil(beatsLeft)));
        const t = 1 - (beatsLeft - Math.floor(beatsLeft));
        const scale = motion ? 0.6 + 0.6 * easeOutBack(Math.min(1, t * 2.2)) : 1;
        ctx.globalAlpha = Math.min(1, (1 - t) * 2.5);
        ctx.fillStyle = rgba(index === 3 ? primary : ink, 0.9);
        ctx.font = `900 ${Math.round(Math.min(84, height * 0.2) * scale)}px ${LABEL_FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(frame.countdown[index], width / 2, hitY * 0.45);
        ctx.globalAlpha = 1;
      }
    }

    // The line, shimmering in star mode, and a slot on it for each finger
    const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
    if (star && motion) {
      const shift = (at / 900) % 1;
      const stops = [0, 0.25, 0.5, 0.75]
        .map((stop) => (stop + shift) % 1)
        .sort((a, b) => a - b);
      stops.forEach((stop, i) =>
        lineGradient.addColorStop(stop, rgba(i % 2 ? palette.success : primary))
      );
    } else {
      lineGradient.addColorStop(0, rgba(primary, 0.15));
      lineGradient.addColorStop(0.5, rgba(primary, 0.85));
      lineGradient.addColorStop(1, rgba(primary, 0.15));
    }
    ctx.strokeStyle = lineGradient;
    ctx.lineWidth = 3 + (motion ? 1.5 * kick : 0);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pad / 2, hitY);
    ctx.lineTo(width - pad / 2, hitY);
    ctx.stroke();
    for (const [lane, finger] of LANES.entries()) {
      const x = laneX(lane);
      const pressedAt = flashes.get(lane);
      const lit =
        pressedAt !== undefined ? Math.max(0, 1 - (at - pressedAt) / FLASH_MS) : 0;
      const rgb = fingerRgb(finger);
      const slot = radius + 3 + (motion ? 4 * lit + 1.2 * kick : 0);
      if (lit > 0) {
        ctx.fillStyle = rgba(rgb, 0.18 * lit);
        ctx.beginPath();
        ctx.arc(x, hitY, slot + 10 * lit, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = rgba(paper);
      ctx.beginPath();
      ctx.arc(x, hitY, slot, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba(rgb, 0.12 + 0.5 * lit);
      ctx.fill();
      ctx.strokeStyle = rgba(rgb, 0.55 + 0.45 * lit);
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Rings closing in on the slot as its letter gets there: when they
    // meet the slot, it's time
    for (const [lane, note] of nextInLane) {
      const left = note.time - now;
      if (left > APPROACH_RING_MS || left < -60) continue;
      const t = Math.max(0, left / APPROACH_RING_MS);
      ctx.strokeStyle = rgba(fingerRgb(LANES[lane]), 0.75 * (1 - t) + 0.1);
      ctx.lineWidth = 2 + 2 * (1 - t);
      ctx.beginPath();
      ctx.arc(laneX(lane), hitY, radius + 3 + t * 30, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Each word's letters joined by a line
    ctx.lineWidth = 2;
    for (let i = 1; i < visible.length; i++) {
      const a = visible[i - 1];
      const b = visible[i];
      if (a.note.word !== b.note.word || a.missed || b.missed || a.hold || b.hold)
        continue;
      ctx.strokeStyle = rgba(line, 1);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // The tails of the held letters
    ctx.lineCap = "round";
    for (const { note, lane, missed, hold, x, y, tailY } of visible) {
      if (tailY === null || tailY >= y) continue;
      const rgb = missed || hold === "dropped" ? muted : fingerRgb(LANES[lane]);
      const enter = Math.min(1, (approachMs - (note.time - now)) / 250);
      const fade = missed ? Math.max(0, 1 - (now - note.time) / MISS_FADE_MS) : 1;
      ctx.globalAlpha = Math.max(0, enter) * fade;
      const pressing = hold === "holding";
      if (pressing && motion) {
        ctx.strokeStyle = rgba(rgb, 0.18 + 0.15 * kick);
        ctx.lineWidth = radius * 1.7;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, tailY);
        ctx.stroke();
      }
      ctx.strokeStyle = rgba(rgb, pressing ? 0.9 : hold === "dropped" ? 0.25 : 0.42);
      ctx.lineWidth = radius * (pressing ? 0.9 : 0.75);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, tailY);
      ctx.stroke();
      // Held down, sparks fly off the head
      if (pressing && motion && Math.random() < 0.35) {
        spray({
          x,
          y,
          rgb,
          count: 1,
          speed: 0.22,
          angle: -Math.PI / 2,
          spread: 1.6,
          life: 450,
        });
      }
      ctx.globalAlpha = 1;
    }

    // The letters themselves, growing a touch as they come down
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const { note, lane, missed, hold, x, y } of visible) {
      // A dropped hold is just its tail running out
      if (hold === "dropped") continue;
      const pressing = hold === "holding";
      const rgb = missed ? palette.danger : fingerRgb(LANES[lane]);
      const fade = missed ? Math.max(0, 1 - (now - note.time) / MISS_FADE_MS) : 1;
      // Entering from the top, fading and scaling in
      const enter = Math.min(1, (approachMs - (note.time - now)) / 250);
      const closeness = Math.max(0, Math.min(1, 1 - (note.time - now) / approachMs));
      const r =
        radius * (motion ? 0.82 + 0.18 * closeness + (pressing ? 0.08 * kick : 0) : 1);
      const drop = missed && motion ? ((now - note.time) / MISS_FADE_MS) * 18 : 0;
      ctx.globalAlpha = fade * Math.max(0, enter);
      if (pressing && motion) {
        // Held down: a ring that breathes with the beat
        ctx.strokeStyle = rgba(rgb, 0.35 + 0.4 * kick);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, r + 6 + 4 * kick, 0, Math.PI * 2);
        ctx.stroke();
      }
      if (motion && !missed) {
        ctx.shadowColor = rgba(rgb, 0.55);
        ctx.shadowBlur = 8 + 10 * closeness;
      }
      ctx.fillStyle = rgba(paper);
      ctx.beginPath();
      ctx.arc(x, y + drop, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = rgba(
        rgb,
        pressing ? 0.45 : missed ? 0.12 : 0.16 + 0.12 * closeness
      );
      ctx.fill();
      ctx.strokeStyle = rgba(rgb);
      ctx.lineWidth = note.hold ? 3.5 : 2.5;
      ctx.stroke();
      ctx.fillStyle = rgba(missed ? palette.danger : ink);
      ctx.font = `800 ${Math.round(r * 0.95)}px ${LETTER_FONT}`;
      ctx.fillText(note.char, x, y + drop + 1);
      ctx.globalAlpha = 1;
    }

    // What the presses left
    effects = effects.filter((effect) => {
      const age = at - effect.start;
      if (age < 0) return true;
      const rgb = effect.rgb ?? gradeRgb(palette, effect.grade);
      if (effect.kind === "shockwave") {
        const life = effect.big ? BURST_MS : BURST_MS * 0.8;
        if (age > life) return false;
        const t = age / life;
        const eased = 1 - (1 - t) ** 3;
        ctx.strokeStyle = rgba(rgb, 0.85 * (1 - t));
        ctx.lineWidth = (effect.big ? 4 : 3) * (1 - t) + 0.5;
        ctx.beginPath();
        ctx.arc(
          effect.x,
          effect.y,
          radius + eased * (effect.big ? 38 : 26),
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.fillStyle = rgba(rgb, 0.25 * (1 - t));
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, radius + eased * 10, 0, Math.PI * 2);
        ctx.fill();
        return true;
      }
      if (effect.kind === "sparkle") {
        if (age > BURST_MS) return false;
        const t = age / BURST_MS;
        const size = 22 * Math.sin(Math.PI * Math.min(1, t * 1.4));
        ctx.save();
        ctx.translate(effect.x, effect.y);
        ctx.rotate(t * 1.2);
        ctx.fillStyle = rgba(rgb, 0.9 * (1 - t));
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const length = i % 2 ? size * 0.22 : size;
          const angle = (i / 8) * Math.PI * 2;
          ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        return true;
      }
      if (effect.kind === "milestone") {
        if (age > MILESTONE_MS) return false;
        const t = age / MILESTONE_MS;
        const grow = motion ? easeOutBack(Math.min(1, t * 3)) : 1;
        const size = (effect.star ? 34 : 54) * (0.5 + 0.5 * grow);
        const y = hitY * 0.32 - t * 14;
        ctx.globalAlpha = t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
        ctx.font = `900 ${Math.round(size)}px ${LABEL_FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 6;
        ctx.lineJoin = "round";
        ctx.strokeStyle = rgba(paper, 0.9);
        ctx.strokeText(effect.text, width / 2, y);
        ctx.fillStyle = rgba(primary);
        ctx.fillText(effect.text, width / 2, y);
        ctx.globalAlpha = 1;
        return true;
      }
      if (age > LABEL_MS) return false;
      const t = age / LABEL_MS;
      const pop = motion ? easeOutBack(Math.min(1, t * 4)) : 1;
      ctx.globalAlpha = 1 - t * t;
      ctx.fillStyle = rgba(
        effect.grade === "early" || effect.grade === "late" ? muted : rgb
      );
      ctx.font = `900 ${Math.max(1, Math.round(12 * pop))}px ${LABEL_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labels[effect.grade] ?? "", effect.x, effect.y - t * 18);
      if (effect.points > 0) {
        ctx.fillStyle = rgba(ink, 0.7);
        ctx.font = `800 ${Math.max(1, Math.round(10 * pop))}px ${LABEL_FONT}`;
        ctx.fillText(`+${effect.points}`, effect.x, effect.y - 14 - t * 26);
      }
      ctx.globalAlpha = 1;
      return true;
    });

    // The particles, falling
    particles = particles.filter((p) => {
      const age = at - p.start;
      if (age < 0) return true;
      if (age > p.life) return false;
      const t = age / p.life;
      const sway = p.confetti ? Math.sin(age / 220 + p.spin) * 12 : 0;
      const x = p.x + p.vx * age + sway;
      const y = p.y + p.vy * age + 0.5 * GRAVITY * (p.confetti ? 0.3 : 1) * age * age;
      if (y > height + 20) return false;
      ctx.globalAlpha = p.confetti ? Math.min(1, (1 - t) * 3) : 1 - t;
      ctx.fillStyle = rgba(p.rgb);
      if (p.square) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.spin + age / 180);
        const squash = p.confetti ? Math.abs(Math.cos(age / 160 + p.spin)) : 1;
        ctx.fillRect(-p.size / 2, (-p.size / 2) * squash, p.size, p.size * squash);
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, p.size * (1 - t * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      return true;
    });

    // A miss reddens the edges for a moment
    const missGlow = Math.max(0, 1 - (at - missAt) / 320);
    if (missGlow > 0) {
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.35,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      vignette.addColorStop(0, rgba(palette.danger, 0));
      vignette.addColorStop(1, rgba(palette.danger, 0.22 * missGlow));
      ctx.fillStyle = vignette;
      ctx.fillRect(-10, -10, width + 20, height + 20);
    }

    ctx.restore();
  };

  const clear = () => {
    effects = [];
    particles = [];
    flashes.clear();
    shakeAt = -Infinity;
    missAt = -Infinity;
  };

  const destroy = () => {
    observer.disconnect();
    media?.removeEventListener?.("change", onScheme);
  };

  return { resize, draw, flash, judged, milestone, celebrate, clear, busy, destroy };
};
