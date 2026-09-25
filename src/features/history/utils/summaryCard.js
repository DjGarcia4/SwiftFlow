// The share image for "Tu resumen": the period, and its headline numbers.
// Square, like the result card (shareCard.js), and drawn the same way; not
// unit tested for the same reason -- jsdom has no canvas.
import { CARD_SIZE } from "@/features/typing-test/utils/shareCard";
import { formatKeyLabel } from "./historyStats";

export const drawSummaryCard = (canvas, summary) => {
  const size = CARD_SIZE;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#0f172a");
  gradient.addColorStop(1, "#1e293b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // An orange band across the top, like a year-end wrap
  ctx.fillStyle = "#f97316";
  ctx.fillRect(0, 0, size, 14);

  ctx.textAlign = "center";
  ctx.font = "bold 40px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillText("⚡ SwiftFlow", size / 2, 100);

  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillStyle = "#fdba74";
  ctx.fillText(`Mi ${summary.label}`, size / 2, 190);

  // The big three
  const stats = [
    [summary.sessions, summary.sessions === 1 ? "partida" : "partidas"],
    [summary.minutes, "minutos"],
    [summary.daysPracticed, summary.daysPracticed === 1 ? "día" : "días"],
  ];
  stats.forEach(([value, label], i) => {
    const x = size / 6 + (i * size) / 3;
    ctx.font = "900 150px system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(String(value), x, 420);
    ctx.font = "bold 38px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillText(label, x, 480);
  });

  // The lines under them
  const lines = [];
  if (summary.best) {
    lines.push(
      `${summary.best.record ? "🏆 Récord: " : "Mejor: "}${summary.best.wpm} WPM · ${summary.best.label}`
    );
  }
  if (summary.averageWpm !== null) {
    const change =
      summary.wpmChange > 0
        ? ` (+${summary.wpmChange}%)`
        : summary.wpmChange < 0
          ? ` (${summary.wpmChange}%)`
          : "";
    lines.push(
      `Promedio: ${summary.averageWpm} WPM${change} · ${summary.averageAccuracy}% precisión`
    );
  }
  if (summary.tamedKey) {
    const pct = (rate) => `${Math.round(rate * 100)}%`;
    lines.push(
      `Tecla domada: ${formatKeyLabel(summary.tamedKey.key).toUpperCase()} ${pct(summary.tamedKey.before)} → ${pct(summary.tamedKey.after)}`
    );
  }
  if (summary.achievements.length) {
    lines.push(
      `${summary.achievements.length} ${summary.achievements.length === 1 ? "logro" : "logros"} nuevos`
    );
  }
  ctx.font = "bold 40px system-ui, sans-serif";
  ctx.fillStyle = "#ffffff";
  lines.slice(0, 4).forEach((line, i) => ctx.fillText(line, size / 2, 640 + i * 78));

  ctx.font = "bold 32px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.fillText("Tu resumen en SwiftFlow", size / 2, size - 70);

  return canvas;
};
