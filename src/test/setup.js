// Every unit test starts in Spanish, the app's own language, with every
// feature's messages registered -- as main.js does for the app
import "@/shared/i18n/catalog";
import { setLocale } from "@/shared/i18n";

setLocale("es");
