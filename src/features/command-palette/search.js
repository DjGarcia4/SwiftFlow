// Finding a command from a few letters: "30" is the 30-second test, "pal 50"
// is 50 words, "oscuro" is the dark theme. Every word typed has to show up
// at the start of a word of the command (its group, its name or one of its
// keywords, in either language); accents and capitals don't matter.

// "Tipografía" -> "tipografia"
export const normalize = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const wordsOf = (text) =>
  normalize(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

// How well one typed word fits a command's words: a whole word beats the
// start of one, and a number only counts whole ("5" isn't "50" -- until
// nothing else fits, where it's still better than no answer)
const scoreToken = (token, { title, keywords }) => {
  const numeric = /^\d+$/.test(token);
  const inTitle = title.find((word) => word.startsWith(token));
  if (title.includes(token)) return 4;
  if (keywords.includes(token)) return 3;
  if (inTitle) return numeric ? 1 : 2;
  if (keywords.some((word) => word.startsWith(token))) return 1;
  return 0;
};

const indexOf = (command) => ({
  title: wordsOf(`${command.group ?? ""} ${command.label}`),
  keywords: (command.keywords ?? []).flatMap(wordsOf),
});

// The commands that fit the query, best first; ties keep their order in the
// list, which puts the common ones ahead. An empty query is every command.
export const searchCommands = (commands, query) => {
  const tokens = wordsOf(query);
  if (!tokens.length) return commands;

  return commands
    .map((command, order) => {
      const index = indexOf(command);
      let score = 0;
      for (const token of tokens) {
        const tokenScore = scoreToken(token, index);
        if (!tokenScore) return null;
        score += tokenScore;
      }
      return { command, score, order };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map((match) => match.command);
};

// The ones used last on top, most recent first, then the rest as they come
export const withRecentFirst = (commands, recentIds) => {
  const byId = new Map(commands.map((command) => [command.id, command]));
  const recent = recentIds.map((id) => byId.get(id)).filter(Boolean);
  const recentSet = new Set(recent);
  return [...recent, ...commands.filter((command) => !recentSet.has(command))];
};
