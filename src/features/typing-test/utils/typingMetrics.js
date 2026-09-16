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
export const diffKeystrokes = (prevInput, nextInput, referenceText) => {
  if (!referenceText || nextInput.length <= prevInput.length) return [];

  const keystrokes = [];
  for (let i = prevInput.length; i < nextInput.length; i++) {
    const expected = referenceText[i];
    if (expected === undefined) break;
    keystrokes.push({ expected, correct: nextInput[i] === expected });
  }
  return keystrokes;
};
