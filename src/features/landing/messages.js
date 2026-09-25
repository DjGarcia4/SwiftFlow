// The landing page, in both languages: one file per part of the page
import intro from "./messages/intro";
import features from "./messages/features";
import showcase from "./messages/showcase";
import news from "./messages/news";

const PARTS = { intro, features, showcase, news };

const inLanguage = (id) =>
  Object.fromEntries(Object.entries(PARTS).map(([name, part]) => [name, part[id]]));

export default { es: inLanguage("es"), en: inLanguage("en") };
