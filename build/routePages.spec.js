import { describe, it, expect } from "vitest";
import { ROUTES, PAGES, pageFor, socialTags, pathIn } from "./routePages";
import shared from "@/shared/messages";

const INDEX = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta name="description" content="genérica" />
    <title>SwiftFlow</title>
  </head>
  <body>
    <div id="app" class="relative z-10"></div>
  </body>
</html>`;

const landing = PAGES.find((page) => page.path === "/sobre");
const englishLanding = PAGES.find((page) => page.path === "/en/sobre");

describe("pageFor", () => {
  it("writes the route's own title and description into the page", () => {
    const page = pageFor(INDEX, landing);
    expect(page).toContain("<title>Qué es SwiftFlow · SwiftFlow</title>");
    expect(page).toContain(
      `<meta name="description" content="${landing.description}" />`
    );
    expect(page).not.toContain("genérica");
  });

  it("adds the tags link previews read", () => {
    const page = pageFor(INDEX, landing);
    expect(page).toContain(
      '<meta property="og:title" content="Qué es SwiftFlow · SwiftFlow" />'
    );
    expect(page).toContain('<meta name="twitter:card" content="summary_large_image" />');
    expect(page).toContain('<meta property="og:image" content="/og-image.png" />');
  });

  it("gives the landing a plain-text account for anything without JavaScript", () => {
    const page = pageFor(INDEX, landing);
    expect(page).toMatch(/<div id="app"[^>]*><noscript><main>\s*<h1>SwiftFlow/);
  });

  it("leaves the app's mount point empty on pages without a summary", () => {
    const home = PAGES.find((page) => page.path === "/");
    expect(pageFor(INDEX, home)).toContain('<div id="app" class="relative z-10"></div>');
  });
});

describe("socialTags", () => {
  it("makes links absolute when the site's address is known", () => {
    const tags = socialTags(landing, "https://swiftflow.app/");
    expect(tags).toContain('content="https://swiftflow.app/og-image.png"');
    expect(tags).toContain('<link rel="canonical" href="https://swiftflow.app/sobre" />');
  });

  it("escapes what goes into attributes", () => {
    expect(
      socialTags({ path: "/", title: 'Un "título" <raro>', description: "x" })
    ).toContain('content="Un &quot;título&quot; &lt;raro>"');
  });
});

describe("the pages in English", () => {
  it("puts every route under /en too", () => {
    expect(PAGES.map((page) => page.path)).toEqual(
      ROUTES.flatMap((route) => [route.path, pathIn(route.path, "en")])
    );
    expect(pathIn("/", "en")).toBe("/en");
    expect(pathIn("/curso", "en")).toBe("/en/curso");
  });

  it("writes them in English, with the English picture", () => {
    const page = pageFor(INDEX, englishLanding, "https://swiftflow.app");
    expect(page).toContain('<html lang="en">');
    expect(page).toContain("<title>What is SwiftFlow · SwiftFlow</title>");
    expect(page).toContain('<meta property="og:locale" content="en_US" />');
    expect(page).toContain('<meta property="og:locale:alternate" content="es_AR" />');
    expect(page).toContain('content="https://swiftflow.app/og-image-en.png"');
    expect(page).toMatch(/<noscript><main>\s*<h1>SwiftFlow: type faster/);
    expect(pageFor(INDEX, landing)).toContain('<html lang="es">');
  });

  it("points each page at itself in the other language", () => {
    const tags = socialTags(landing, "https://swiftflow.app");
    expect(tags).toContain(
      '<link rel="alternate" hreflang="en" href="https://swiftflow.app/en/sobre" />'
    );
    expect(tags).toContain(
      '<link rel="alternate" hreflang="x-default" href="https://swiftflow.app/sobre" />'
    );
  });

  it("names each page the way the app does once it's running", () => {
    const APP_PAGES = {
      "/sobre": "about",
      "/curso": "course",
      "/resumen": "summary",
      "/historial": "history",
    };
    for (const [path, id] of Object.entries(APP_PAGES)) {
      const route = ROUTES.find((each) => each.path === path);
      for (const language of ["es", "en"]) {
        const names = shared[language].pages[id];
        expect(route[language].title).toBe(`${names.title} · SwiftFlow`);
        expect(route[language].description).toBe(names.description);
      }
    }
  });
});
