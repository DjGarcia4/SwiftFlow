import { describe, it, expect } from "vitest";
import { ROUTES, pageFor, socialTags } from "./routePages";

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

const landing = ROUTES.find((route) => route.path === "/sobre");

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
    const home = ROUTES.find((route) => route.path === "/");
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
