import { describe, it, expect } from "vitest";
import { getShareCardTheme } from "./shareCardTheme";

describe("getShareCardTheme", () => {
  it("returns a festive gold/red theme with a banner and confetti for a record", () => {
    const theme = getShareCardTheme(true);
    expect(theme.bannerText).toBe("¡NUEVO RÉCORD!");
    expect(theme.confetti).toBe(true);
    expect(theme.gradientFrom).not.toBe(theme.gradientTo);
  });

  it("returns the plain dark theme with no banner/confetti otherwise", () => {
    const theme = getShareCardTheme(false);
    expect(theme.bannerText).toBeNull();
    expect(theme.confetti).toBe(false);
  });
});
