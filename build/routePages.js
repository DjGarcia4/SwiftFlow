// Build-time HTML for each route. The app sets titles from JavaScript,
// which link previews (WhatsApp, X, Discord...) and some crawlers never
// run -- so each route also gets a real HTML file with its own title,
// description and social card written in, and the landing a plain-text
// account of itself for anything that reads the page without JavaScript.
//
// SITE_URL (e.g. SITE_URL=https://swiftflow.app npm run build) makes the
// image and page links absolute, which some previews insist on.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const DEFAULT_DESCRIPTION =
  "Practicá mecanografía en español: tus teclas débiles, tus palabras difíciles y un entrenamiento hecho para vos.";

export const ROUTES = [
  {
    path: "/",
    title: "SwiftFlow · Test de mecanografía en español",
    description: DEFAULT_DESCRIPTION,
  },
  {
    path: "/sobre",
    title: "Qué es SwiftFlow · SwiftFlow",
    description:
      "Un test de mecanografía en español que te dice en qué fallás, por qué, y te arma la práctica para arreglarlo. Sin cuenta, todo en tu navegador.",
    summary: `
      <h1>SwiftFlow: escribí más rápido y entendé por qué te equivocás</h1>
      <p>Un test de mecanografía en español que no solo te mide: te dice qué teclas, qué palabras y qué momentos te frenan, y te arma la práctica para arreglarlo. Sin cuenta, todo en tu navegador.</p>
      <h2>Modos</h2>
      <p>Tiempo, Palabras, Números, Cita, Código, Zen, Entrenar, Mi texto y el reto Semanal.</p>
      <h2>Mientras escribís</h2>
      <p>Combo, un coach que te avisa qué letra se te escapa, teclado en pantalla con colores por dedo, fantasma de tu récord, marcapasos y modo sin red.</p>
      <h2>Estadísticas</h2>
      <p>Teclas que más fallás, qué apretás en su lugar, letras invertidas, teclas y combinaciones lentas, palabras que se te traban, consistencia, tu mejor hora del día y un año de actividad.</p>
      <h2>Entrenamiento</h2>
      <p>Entrenamientos con tus teclas y palabras flojas, que te dicen cuándo parar y te las repasan a 1, 3, 7, 14 y 30 días.</p>
      <h2>Progreso</h2>
      <p>50 niveles en 8 rangos, recompensas, logros, retos diarios, meta semanal, reto semanal y racha.</p>
      <p><a href="/">Empezar a escribir</a></p>`,
  },
  {
    path: "/historial",
    title: "Historial · SwiftFlow",
    description: DEFAULT_DESCRIPTION,
  },
];

const escape = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// The tags a link preview reads
export const socialTags = (route, siteUrl = "") => {
  const base = siteUrl.replace(/\/$/, "");
  const url = base ? `${base}${route.path}` : null;
  return [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="SwiftFlow" />`,
    `<meta property="og:locale" content="es_AR" />`,
    `<meta property="og:title" content="${escape(route.title)}" />`,
    `<meta property="og:description" content="${escape(route.description)}" />`,
    `<meta property="og:image" content="${base}/og-image.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="SwiftFlow: escribí más rápido, entendé por qué te equivocás" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(route.title)}" />`,
    `<meta name="twitter:description" content="${escape(route.description)}" />`,
    `<meta name="twitter:image" content="${base}/og-image.png" />`,
    ...(url
      ? [
          `<meta property="og:url" content="${url}" />`,
          `<link rel="canonical" href="${url}" />`,
        ]
      : []),
  ].join("\n    ");
};

// The page's HTML for one route, from the built index.html
export const pageFor = (html, route, siteUrl = "") => {
  let page = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(route.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${escape(route.description)}" />`
    )
    .replace("</head>", `    ${socialTags(route, siteUrl)}\n  </head>`);
  // For whatever reads the page without running it; the app replaces it
  // as soon as it starts, so nobody with JavaScript sees it
  if (route.summary) {
    page = page.replace(
      '<div id="app" class="relative z-10"></div>',
      `<div id="app" class="relative z-10"><noscript><main>${route.summary}\n    </main></noscript></div>`
    );
  }
  return page;
};

export const routePages = ({ siteUrl = "" } = {}) => {
  let outDir = "dist";
  return {
    name: "swiftflow-route-pages",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    // Once the bundle is written: the root page gets its tags in place,
    // and every other route its own file next to it
    closeBundle() {
      const indexPath = join(outDir, "index.html");
      const built = readFileSync(indexPath, "utf8");
      for (const route of ROUTES) {
        const target =
          route.path === "/"
            ? indexPath
            : join(outDir, route.path.slice(1), "index.html");
        mkdirSync(join(target, ".."), { recursive: true });
        writeFileSync(target, pageFor(built, route, siteUrl));
      }
    },
  };
};
