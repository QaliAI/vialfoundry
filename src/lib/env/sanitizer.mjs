export function sanitizeEnvValue(val) {
  if (val === undefined || val === null) {
    return undefined;
  }
  let cleaned = String(val).replace(/^\uFEFF/, "").trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned === "" ? undefined : cleaned;
}

export function getSanitizedEnv(key) {
  return sanitizeEnvValue(process.env[key]);
}
