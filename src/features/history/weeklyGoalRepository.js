// The weekly goal setting and the weeks it was met. Completed weeks are
// written down when they happen rather than worked out from the history:
// changing the goal later shouldn't rewrite which past weeks counted.
const STORAGE_KEY = "swiftflow_weekly_goal";

const DEFAULTS = { goal: null, completedWeeks: [] }; // goal null = "Auto"

export const loadWeeklyGoal = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULTS };

  try {
    const parsed = JSON.parse(raw);
    return {
      goal: Number.isFinite(parsed?.goal) && parsed.goal > 0 ? parsed.goal : null,
      completedWeeks: Array.isArray(parsed?.completedWeeks)
        ? parsed.completedWeeks.filter((key) => typeof key === "string")
        : [],
    };
  } catch {
    return { ...DEFAULTS };
  }
};

export const saveWeeklyGoal = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: it still holds for this session.
  }
};
