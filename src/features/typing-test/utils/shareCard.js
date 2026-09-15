import { getShareCardTheme } from "@/features/typing-test/utils/shareCardTheme";

// Square, works for both a story and a feed post.
export const CARD_SIZE = 1080;

const CONFETTI_COLORS = ["#fde68a", "#fca5a5", "#fdba74", "#fef08a", "#ffffff"];

const roundRectPath = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

// Draws the result card onto `canvas` (resizing it to CARD_SIZE) and
// returns it. Not unit tested — canvas rendering isn't something jsdom
// implements, same tradeoff as the caret/scroll DOM code elsewhere in this
// feature; getShareCardTheme carries the part of this that's actually
// worth testing.
export const drawShareCard = (
  canvas,
  { wpm, accuracy, errors, modeLabel, streak, isRecord }
) => {
  const size = CARD_SIZE;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const theme = getShareCardTheme(isRecord);

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, theme.gradientFrom);
  gradient.addColorStop(1, theme.gradientTo);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  if (theme.confetti) {
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 4 + Math.random() * 8;
      ctx.globalAlpha = 0.5 + Math.random() * 0.4;
      ctx.fillStyle = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  ctx.textAlign = "center";

  // Wordmark
  ctx.font = "bold 40px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText("⚡ SwiftFlow", size / 2, 100);

  // Record banner (pill)
  if (theme.bannerText) {
    const text = `🏆 ${theme.bannerText}`;
    ctx.font = "bold 44px system-ui, sans-serif";
    const bannerY = 190;
    const metrics = ctx.measureText(text);
    const paddingX = 40;
    const bw = metrics.width + paddingX * 2;
    const bh = 80;
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    roundRectPath(ctx, size / 2 - bw / 2, bannerY - bh / 2, bw, bh, bh / 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, size / 2, bannerY + 16);
  }

  // Big WPM number — a smaller size for 3-digit results so it still fits.
  const wpmFontSize = String(wpm).length >= 3 ? 260 : 340;
  ctx.font = `900 ${wpmFontSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(String(wpm), size / 2, 620);

  ctx.font = "bold 42px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText("PALABRAS POR MINUTO", size / 2, 690);

  // Secondary stats
  ctx.font = "bold 46px system-ui, sans-serif";
  ctx.fillStyle = "#ffffff";
  const statsY = 820;
  ctx.fillText(`${accuracy}% precisión · ${errors} errores`, size / 2, statsY);

  ctx.font = "bold 36px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.fillText(modeLabel, size / 2, statsY + 60);

  if (streak > 0) {
    ctx.font = "bold 34px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.fillText(`🔥 racha de ${streak} días`, size / 2, size - 80);
  }

  return canvas;
};

export const canvasToBlob = (canvas) =>
  new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
