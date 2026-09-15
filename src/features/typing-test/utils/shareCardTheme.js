// Pure: which visual treatment the share card gets. Kept separate from the
// actual canvas-drawing code (shareCard.js) so this part — the thing that
// actually varies in a testable way — has a unit test, even though canvas
// rendering itself can't be meaningfully tested under jsdom.
export const getShareCardTheme = (isRecord) => {
  if (isRecord) {
    return {
      gradientFrom: "#f97316",
      gradientTo: "#dc2626",
      bannerText: "¡NUEVO RÉCORD!",
      confetti: true,
    };
  }

  return {
    gradientFrom: "#0f172a",
    gradientTo: "#1e293b",
    bannerText: null,
    confetti: false,
  };
};
