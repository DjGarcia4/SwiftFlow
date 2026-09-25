// Reading text out loud with the browser's own voices (speechSynthesis).
// Nothing is sent anywhere: the voices are the system's.

export const isSpeechSupported = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

// The Spanish voice closest to how you speak: your own variant if there's
// one (es-AR for es-AR), else another from Latin America or the US for a
// Latin American variant, else Spain's, else any Spanish at all. Local
// voices win ties: they don't need a connection.
const LATIN_AMERICA =
  /^es-(419|AR|BO|CL|CO|CR|CU|DO|EC|GT|HN|MX|NI|PA|PE|PR|PY|SV|US|UY|VE)$/i;

export const pickSpanishVoice = (voices, languages = []) => {
  const spanish = voices.filter((voice) => /^es([-_]|$)/i.test(voice.lang));
  if (!spanish.length) return null;
  const normalize = (lang) => lang.replace("_", "-").toLowerCase();
  const wanted = normalize(languages.find((lang) => /^es/i.test(lang)) ?? "es-419");
  const wantsLatinAmerica = wanted === "es" || LATIN_AMERICA.test(wanted);

  const score = (voice) => {
    const lang = normalize(voice.lang);
    let points = 0;
    if (lang === wanted) points += 100;
    else if (wantsLatinAmerica && LATIN_AMERICA.test(lang)) points += 50;
    else if (!wantsLatinAmerica && lang === "es-es") points += 50;
    else if (lang === "es-es") points += 20;
    if (voice.localService) points += 5;
    if (voice.default) points += 1;
    return points;
  };
  return [...spanish].sort((a, b) => score(b) - score(a))[0];
};

// The English voice closest to how you speak: your own variant if you
// speak English (en-GB for en-GB), else the US one, else Britain's, else
// any English at all
export const pickEnglishVoice = (voices, languages = []) => {
  const english = voices.filter((voice) => /^en([-_]|$)/i.test(voice.lang));
  if (!english.length) return null;
  const normalize = (lang) => lang.replace("_", "-").toLowerCase();
  const wanted = normalize(languages.find((lang) => /^en-/i.test(lang)) ?? "en-us");

  const score = (voice) => {
    const lang = normalize(voice.lang);
    let points = 0;
    if (lang === wanted) points += 100;
    else if (lang === "en-us") points += 50;
    else if (lang === "en-gb") points += 20;
    if (voice.localService) points += 5;
    if (voice.default) points += 1;
    return points;
  };
  return [...english].sort((a, b) => score(b) - score(a))[0];
};

// The voice for a language being practiced ("es" or "en")
export const pickVoice = (language, voices, languages = []) =>
  language === "en"
    ? pickEnglishVoice(voices, languages)
    : pickSpanishVoice(voices, languages);

// The voices can arrive a moment after the page loads
export const loadVoices = () =>
  new Promise((resolve) => {
    if (!isSpeechSupported()) return resolve([]);
    const now = window.speechSynthesis.getVoices();
    if (now.length) return resolve(now);
    const done = () => resolve(window.speechSynthesis.getVoices());
    window.speechSynthesis.addEventListener("voiceschanged", done, { once: true });
    // Some browsers never fire it when there are none
    setTimeout(done, 1500);
  });

// Says `text`, cutting off whatever was being said
export const speak = (text, { voice = null, rate = 1 } = {}) => {
  if (!isSpeechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new window.SpeechSynthesisUtterance(text);
  utterance.lang = voice?.lang ?? "es-ES";
  if (voice) utterance.voice = voice;
  utterance.rate = rate;
  synth.speak(utterance);
};

export const stopSpeaking = () => {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
};
