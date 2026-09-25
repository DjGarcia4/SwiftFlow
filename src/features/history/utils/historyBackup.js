// Turning the stored history into a file and back. Everything here treats
// the incoming file as hostile — it's the one place data arrives from
// outside the app — so nothing throws and anything unrecognizable is
// dropped rather than trusted.

import { t } from "@/shared/i18n";

const APP_TAG = "swiftflow";
const BACKUP_VERSION = 1;

export const buildBackup = (results) => ({
  app: APP_TAG,
  version: BACKUP_VERSION,
  exportedAt: new Date().toISOString(),
  results,
});

// A session is worth keeping if it can be identified, dated and shown. The
// rest of the fields are already optional everywhere downstream (old
// sessions predate half of them), so they're left exactly as they came.
const isUsableResult = (result) =>
  Boolean(result) &&
  typeof result === "object" &&
  typeof result.id === "string" &&
  typeof result.date === "string" &&
  !Number.isNaN(Date.parse(result.date)) &&
  Number.isFinite(result.wpm);

export const parseBackup = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: t("history.backup.notJson") };
  }

  if (!parsed || parsed.app !== APP_TAG) {
    return { ok: false, error: t("history.backup.notOurs") };
  }
  if (!Array.isArray(parsed.results)) {
    return { ok: false, error: t("history.backup.empty") };
  }

  const results = parsed.results.filter(isUsableResult);
  if (!results.length) {
    return { ok: false, error: t("history.backup.unreadable") };
  }

  return { ok: true, results, skipped: parsed.results.length - results.length };
};

// Merge rather than replace: importing from another machine shouldn't wipe
// what was done on this one. Sessions already here win over the imported
// copy of themselves, since this device's is the one that's been kept up to
// date (the timing trimming, for one).
export const mergeResults = (existing, incoming) => {
  const byId = new Map();
  for (const result of [...incoming, ...existing]) byId.set(result.id, result);

  return [...byId.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
};

export const backupFilename = (now = new Date()) => {
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return `swiftflow-${stamp}.json`;
};
