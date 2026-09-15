// Groups a reference text's characters into words so the browser wraps at
// word boundaries, while keeping per-character index tracking (needed for
// the index-based correctness coloring). Spaces and newlines become their
// own single-character "space" groups (a literal "\n" renders as an actual
// line break, since the typing container uses white-space: pre-wrap for
// code mode).
export const groupIntoWords = (text) => {
  const groups = [];
  let currentWord = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === " " || ch === "\n") {
      if (currentWord.length) {
        groups.push({ type: "word", chars: currentWord });
        currentWord = [];
      }
      groups.push({ type: "space", index: i, char: ch });
    } else {
      currentWord.push({ char: ch, index: i });
    }
  }

  if (currentWord.length) {
    groups.push({ type: "word", chars: currentWord });
  }

  return groups;
};
