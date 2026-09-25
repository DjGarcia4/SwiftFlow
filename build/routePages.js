// Build-time HTML for each route. The app sets titles from JavaScript,
// which link previews (WhatsApp, X, Discord...) and some crawlers never
// run -- so each route also gets a real HTML file with its own title,
// description and social card written in, and the landing a plain-text
// account of itself for anything that reads the page without JavaScript.
//
// Every route also comes in English, under /en: "/en/sobre" is written as
// "en/sobre.html", and opening it starts the app in English (see the
// router).
//
// Other routes are written as "sobre.html" rather than "sobre/index.html":
// hosts like Netlify serve /sobre from the first one as it is, but answer
// the second with a redirect to /sobre/.
//
// The site's address makes the image and page links absolute, which some
// previews (WhatsApp) insist on -- see vite.config.js for where it comes
// from.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Each route in both languages: the Spanish page where it's always been,
// the English one under /en ("/en/sobre"). The titles and descriptions are
// the app's own (shared.pages in src/shared/messages.js; a test keeps them
// the same).
const DEFAULT = {
  es: "Practicá mecanografía en español: tus teclas débiles, tus palabras difíciles y un entrenamiento hecho para vos.",
  en: "Practice touch typing: your weak keys, your hard words and training made for you.",
};

export const LANGUAGES = {
  es: {
    prefix: "",
    ogLocale: "es_AR",
    imageAlt: "SwiftFlow: escribí más rápido, entendé por qué te equivocás",
    image: "/og-image.png",
  },
  en: {
    prefix: "/en",
    ogLocale: "en_US",
    imageAlt: "SwiftFlow: type faster, understand why you slip",
    image: "/og-image-en.png",
  },
};

export const ROUTES = [
  {
    path: "/",
    es: {
      title: "SwiftFlow · Test de mecanografía en español e inglés",
      description: DEFAULT.es,
    },
    en: {
      title: "SwiftFlow · Typing test in English and Spanish",
      description: DEFAULT.en,
    },
  },
  {
    path: "/sobre",
    es: {
      title: "Qué es SwiftFlow · SwiftFlow",
      description:
        "Un test de mecanografía en español que te dice en qué fallás, por qué, y te arma la práctica para arreglarlo. Sin cuenta, todo en tu navegador.",
      summary: `
      <h1>SwiftFlow: escribí más rápido y entendé por qué te equivocás</h1>
      <p>Un test de mecanografía en español y en inglés que no solo te mide: te dice qué teclas, qué palabras y qué momentos te frenan, y te arma la práctica para arreglarlo. Sin cuenta, todo en tu navegador.</p>
      <h2>Modos</h2>
      <p>Tiempo, Palabras, Números, Cita, Clásicos, Dictado, Código, Zen, Entrenar, Mi texto y el reto Semanal, más un curso desde cero para aprender a escribir sin mirar. Los textos, en español o en inglés.</p>
      <h2>Mientras escribís</h2>
      <p>Combo, un coach que te avisa qué letra se te escapa, teclado en pantalla con colores por dedo, fantasma de tu récord, marcapasos y modo sin red.</p>
      <h2>Estadísticas</h2>
      <p>Teclas que más fallás y cómo vienen mejorando, qué apretás en su lugar, letras invertidas, teclas y combinaciones lentas, palabras que se te traban, consistencia dentro de cada partida y de un día al otro, tu mejor hora del día y un año de actividad.</p>
      <h2>Entrenamiento</h2>
      <p>Entrenamientos con tus teclas y palabras flojas, que te dicen cuándo parar y te las repasan a 1, 3, 7, 14 y 30 días.</p>
      <h2>Progreso</h2>
      <p>50 niveles en 8 rangos, recompensas, logros, retos diarios, meta semanal, reto semanal, racha y un resumen de cada mes y cada año.</p>
      <p><a href="/">Empezar a escribir</a></p>`,
    },
    en: {
      title: "What is SwiftFlow · SwiftFlow",
      description:
        "A typing test that tells you what you miss, why, and builds the practice to fix it. No account, all in your browser.",
      summary: `
      <h1>SwiftFlow: type faster and understand why you slip</h1>
      <p>A typing test in English and Spanish that doesn't just measure you: it tells you which keys, which words and which moments slow you down, and builds the practice to fix them. No account, all in your browser.</p>
      <h2>Modes</h2>
      <p>Time, Words, Numbers, Quote, Classics, Dictation, Code, Zen, Train, My text and the Weekly challenge, plus a course from scratch to learn to type without looking. The texts, in English or Spanish.</p>
      <h2>While you type</h2>
      <p>Combo, a coach that tells you which letter keeps slipping, an on-screen keyboard colored by finger, a ghost of your record, a pacer and a no-safety-net mode.</p>
      <h2>Stats</h2>
      <p>The keys you miss most and how they're improving, what you press instead, swapped letters, slow keys and pairs, the words you trip on, consistency within each run and from one day to the next, your best time of day and a year of activity.</p>
      <h2>Training</h2>
      <p>Training on your weak keys and words, that tells you when to stop and reviews them at 1, 3, 7, 14 and 30 days.</p>
      <h2>Progress</h2>
      <p>50 levels in 8 ranks, rewards, achievements, daily challenges, a weekly goal, a weekly challenge, streaks and a summary of every month and year.</p>
      <p><a href="/en">Start typing</a></p>`,
    },
  },
  {
    path: "/curso",
    es: {
      title: "Curso desde cero · SwiftFlow",
      description:
        "Aprendé a escribir sin mirar el teclado, en español: una fila por vez, con lecciones que se adaptan a tu teclado.",
    },
    en: {
      title: "Course from scratch · SwiftFlow",
      description:
        "Learn to type without looking at the keyboard: one row at a time, with lessons that fit your keyboard.",
    },
  },
  {
    path: "/resumen",
    es: {
      title: "Tu resumen · SwiftFlow",
      description:
        "Tu mes o tu año de práctica en SwiftFlow: cuánto, qué tan rápido, qué mejoraste.",
    },
    en: {
      title: "Your summary · SwiftFlow",
      description:
        "Your month or year of practice on SwiftFlow: how much, how fast, what got better.",
    },
  },
  {
    path: "/historial",
    es: {
      title: "Historial · SwiftFlow",
      description:
        "Tu progreso en SwiftFlow: velocidad, precisión, teclas débiles, logros y retos.",
    },
    en: {
      title: "History · SwiftFlow",
      description:
        "Your progress on SwiftFlow: speed, accuracy, weak keys, achievements and challenges.",
    },
  },
];

// Where a route lives in a language: "/sobre", "/en/sobre", "/en"
export const pathIn = (path, language) => {
  const { prefix } = LANGUAGES[language];
  return prefix && path === "/" ? prefix : `${prefix}${path}`;
};

// Every page to write: each route, in each language
export const PAGES = ROUTES.flatMap((route) =>
  Object.keys(LANGUAGES).map((language) => ({
    ...route[language],
    route: route.path,
    language,
    path: pathIn(route.path, language),
  }))
);

const escape = (text) =>
  String(text).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// The tags a link preview reads, and where the page is in the other
// language. page: one of PAGES (a bare { path, title, description } is
// taken as Spanish).
export const socialTags = (page, siteUrl = "") => {
  const base = siteUrl.replace(/\/$/, "");
  const language = page.language ?? "es";
  const { ogLocale, imageAlt, image } = LANGUAGES[language];
  const url = base ? `${base}${page.path}` : null;
  const others = Object.keys(LANGUAGES).filter((other) => other !== language);
  return [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="SwiftFlow" />`,
    `<meta property="og:locale" content="${ogLocale}" />`,
    ...others.map(
      (other) =>
        `<meta property="og:locale:alternate" content="${LANGUAGES[other].ogLocale}" />`
    ),
    `<meta property="og:title" content="${escape(page.title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    `<meta property="og:image" content="${base}${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escape(imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(page.title)}" />`,
    `<meta name="twitter:description" content="${escape(page.description)}" />`,
    `<meta name="twitter:image" content="${base}${image}" />`,
    ...(url
      ? [
          `<meta property="og:url" content="${url}" />`,
          `<link rel="canonical" href="${url}" />`,
        ]
      : []),
    // The same page in each language, for search engines; Spanish is
    // the one for anyone else
    ...(base && page.route
      ? [
          ...Object.keys(LANGUAGES).map(
            (each) =>
              `<link rel="alternate" hreflang="${each}" href="${base}${pathIn(page.route, each)}" />`
          ),
          `<link rel="alternate" hreflang="x-default" href="${base}${pathIn(page.route, "es")}" />`,
        ]
      : []),
  ].join("\n    ");
};

// The page's HTML for one route in one language, from the built index.html
export const pageFor = (html, route, siteUrl = "") => {
  let page = html
    .replace(/<html lang="[^"]*">/, `<html lang="${route.language ?? "es"}">`)
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
      for (const page of PAGES) {
        const target =
          page.path === "/" ? indexPath : join(outDir, `${page.path.slice(1)}.html`);
        mkdirSync(join(target, ".."), { recursive: true });
        writeFileSync(target, pageFor(built, page, siteUrl));
      }
    },
  };
};
