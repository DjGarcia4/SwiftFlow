// Normalizes reference text when the "punctuation" content type is
// deselected: lowercase, strip accents, and strip punctuation/symbols.
//
// The ñ is not an accented n -- it's its own letter, and "año" and "ano"
// are different words. NFD decomposes it into n + a combining tilde, which
// the accent-stripping below would then happily eat, so it's pulled out of
// harm's way first and put back afterwards.
const N_TILDE = "\u0001";

export const formatReferenceText = (text) => {
  let formattedText = text.toLowerCase();

  formattedText = formattedText.replaceAll("ñ", N_TILDE);

  formattedText = formattedText.normalize("NFD");

  formattedText = formattedText.replace(/[̀-ͯ]/g, "");

  // Spanish opens questions and exclamations too: ¿ and ¡ go with ? and !
  formattedText = formattedText.replace(
    /[.,?!¿¡;:\-—–…«»"“”‘’'()[\]{}/&*@#$%^+=_~`<>]/g,
    ""
  );

  formattedText = formattedText.replaceAll(N_TILDE, "ñ");

  formattedText = formattedText.trim();

  return formattedText;
};
