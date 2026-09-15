// Normalizes reference text when the "punctuation" content type is
// deselected: lowercase, strip accents, and strip punctuation/symbols.
export const formatReferenceText = (text) => {
  let formattedText = text.toLowerCase();

  formattedText = formattedText.normalize("NFD");

  formattedText = formattedText.replace(/[̀-ͯ]/g, "");

  formattedText = formattedText.replace(/[.,?!;:\-—"“”‘’'()[\]{}/&*@#$%^+=_~`<>]/g, "");

  formattedText = formattedText.trim();

  return formattedText;
};
