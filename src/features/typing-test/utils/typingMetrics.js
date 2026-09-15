// Pure typing-session metric calculators, extracted from the store's
// computed properties so they can be unit tested without Pinia/Vue reactivity.

export const computeWpm = (userInput, timeElapsedSeconds) => {
  if (!timeElapsedSeconds) return 0;
  const words = userInput.trim().split(/\s+/).length;
  const minutes = timeElapsedSeconds / 60;
  return Math.round(words / minutes);
};

export const computeAccuracy = (userInput, referenceText) => {
  if (userInput.length === 0) return 100;
  if (!referenceText) return 100;
  let correctChars = 0;
  for (let i = 0; i < userInput.length; i++) {
    if (userInput[i] === referenceText[i]) {
      correctChars++;
    }
  }
  return Math.round((correctChars / userInput.length) * 100);
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
