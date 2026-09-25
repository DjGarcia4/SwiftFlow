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

// Focus mode: just the word being typed and the one after it, out of
// groupIntoWords' groups. Sitting on the space right after a word still
// counts as being on that word -- the space is its last key. Anything
// further along (a code line's indentation) is typed as part of what's
// coming.
export const focusWindow = (groups, position) => {
  const at = groups.findIndex((group) =>
    group.type === "word"
      ? position >= group.chars[0].index && position <= group.chars.at(-1).index
      : group.index === position
  );
  if (at === -1) return [];

  const trailingSpace = groups[at].type === "space" && groups[at - 1]?.type === "word";
  const start = trailingSpace ? at - 1 : at;
  const current = groups.findIndex((group, i) => i >= start && group.type === "word");
  const next =
    current === -1
      ? -1
      : groups.findIndex(
          (group, i) => i > Math.max(current, at) && group.type === "word"
        );
  const end = next !== -1 ? next : groups.length - 1;
  return groups.slice(start, end + 1);
};
