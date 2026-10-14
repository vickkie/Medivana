// Server supplies downloadUrl - only ever open trusted hosts.
export const ALLOWED_UPDATE_HOSTS = ["github.com", "play.google.com"];

export const isTrustedUpdateUrl = (url) => {
  const m = /^https:\/\/([^/?#]+)/i.exec(url || "");
  if (!m) return false;
  const host = m[1].toLowerCase();
  return ALLOWED_UPDATE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
};
