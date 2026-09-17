// Which keys the training mode is aiming at right now. Both the toolbar (to
// show them) and the test itself (to build the text) need the answer, and
// they must never disagree about it.
import {
  computeKeyErrorStats,
  RECENT_INSIGHT_SESSIONS,
} from "@/features/history/utils/historyStats";
import { selectWeakKeys } from "@/features/history/utils/improvementTips";

// The same keys the history panel recommends practicing -- one definition,
// so the advice and the drill can't drift apart. Empty until there's enough
// history to say anything.
export const suggestedDrillKeys = (results) =>
  selectWeakKeys(computeKeyErrorStats(results.slice(0, RECENT_INSIGHT_SESSIONS))).map(
    (stat) => stat.key
  );

// A hand-picked list wins; otherwise fall back to what the history suggests.
export const resolveDrillKeys = (chosen, results) =>
  chosen.length ? chosen : suggestedDrillKeys(results);
