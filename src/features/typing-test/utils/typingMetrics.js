// Pure typing-session metric calculators, extracted from the store's
// computed properties so they can be unit tested without Pinia/Vue reactivity.

// Standard typing-test convention: a "word" is 5 characters, so the result
// doesn't depend on how long the words in the text happen to be.
const CHARS_PER_WORD = 5;

// The clock starts on the first keystroke, so that one takes no time: n
// characters really span n - 1 intervals. Dropping one keeps short texts
// from getting a free character's worth of speed.
const perMinute = (chars, elapsedMs) => {
  if (!elapsedMs || elapsedMs <= 0) return 0;
  return Math.round(Math.max(0, chars - 1) / CHARS_PER_WORD / (elapsedMs / 60000));
};

// Net wpm: only words typed out completely and correctly count (plus the
// whitespace right after them). A word with any mistake — or one that's
// still half-typed — adds nothing, same as Monkeytype.
export const computeWpm = (userInput, referenceText, elapsedMs) => {
  if (!referenceText) return 0;

  let countedChars = 0;
  let previousWordCorrect = true;

  for (const match of referenceText.matchAll(/\S+|\s+/g)) {
    const start = match.index;
    const end = start + match[0].length;
    if (start >= userInput.length) break;

    if (/\S/.test(match[0])) {
      previousWordCorrect =
        userInput.length >= end && userInput.slice(start, end) === match[0];
      if (previousWordCorrect) countedChars += end - start;
    } else if (previousWordCorrect) {
      for (let i = start; i < Math.min(end, userInput.length); i++) {
        if (userInput[i] === referenceText[i]) countedChars++;
      }
    }
  }

  return perMinute(countedChars, elapsedMs);
};

// Raw wpm: every key pressed, right or wrong — including ones later erased.
// The gap between this and net wpm is what mistakes cost.
export const computeRawWpm = (keystrokes, elapsedMs) => perMinute(keystrokes, elapsedMs);

// Share of all keys pressed that were correct. Mistakes fixed with backspace
// still count against it, so correcting everything doesn't read as 100%.
export const computeAccuracy = (keystrokes, errorKeystrokes) => {
  if (!keystrokes) return 100;
  return Math.round(((keystrokes - errorKeystrokes) / keystrokes) * 100);
};

export const computeErrors = (userInput, referenceText) => {
  if (!referenceText) return 0;
  let errorCount = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] !== referenceText[i]) {
      errorCount++;
    }
  }
  return errorCount;
};

// Length of the unbroken run of correct characters ending at the current
// typing position (resets to 0 as soon as a mismatch is found going backwards).
export const computeStreak = (userInput, referenceText) => {
  if (!referenceText || userInput.length === 0) return 0;
  let streak = 0;
  for (let i = userInput.length - 1; i >= 0; i--) {
    if (userInput[i] === referenceText[i]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

// The characters newly typed between two snapshots of the input, each paired
// with the character it was supposed to be. Only growth counts: backspaces
// (or a reset back to "") produce no keystrokes.
//
// `typed` and `index` are what turn a mistake into a diagnosis: which key was
// actually pressed, and where it landed. Without them all a mistake says is
// "not this one".
export const diffKeystrokes = (prevInput, nextInput, referenceText) => {
  if (!referenceText || nextInput.length <= prevInput.length) return [];

  const keystrokes = [];
  for (let i = prevInput.length; i < nextInput.length; i++) {
    const expected = referenceText[i];
    if (expected === undefined) break;
    keystrokes.push({
      index: i,
      expected,
      typed: nextInput[i],
      correct: nextInput[i] === expected,
    });
  }
  return keystrokes;
};

// Below this, two characters landed in the same breath: key repeat, a
// double event, or something pasted a character at a time. Above it, the
// gap stopped being about the key. The ceiling has to sit under the 3s
// inactivity pause (which the active clock already removes) to do any work
// at all, and above genuine hesitation -- hunting for the Ñ takes about a
// second, and that's exactly the signal worth catching.
export const MIN_INTERVAL_MS = 15;
export const MAX_INTERVAL_MS = 2000;

// Out-of-range gaps are dropped, never clamped: pinning them to the ceiling
// would drag every slow key's average toward 2000ms and manufacture the very
// result the advice reports.
export const isUsableInterval = (ms) =>
  Number.isFinite(ms) && ms >= MIN_INTERVAL_MS && ms <= MAX_INTERVAL_MS;

// Two consecutive mistakes that are each other's characters: the classic
// "qeu" for "que". Needs both halves of the swap, which is why it can't live
// inside diffKeystrokes.
//
// The looser test -- "the key you pressed is the one that comes next" -- fires
// on any slip that lands on the following letter, and in Spanish that letter
// is a vowel most of the time. Demanding the confirmed swap keeps the tip's
// claim ("escribis 'qeu' por 'que'") honest.
export const isTransposition = (previous, current) =>
  Boolean(previous) &&
  current.index === previous.index + 1 &&
  !previous.correct &&
  !current.correct &&
  previous.typed === current.expected &&
  current.typed === previous.expected;
