import { isTrustedUpdateUrl } from "../urlSafety";

describe("isTrustedUpdateUrl", () => {
  it("accepts github.com and play.google.com over https", () => {
    expect(isTrustedUpdateUrl("https://github.com/vickkie/Medivana/releases/download/v2/app.apk")).toBe(true);
    expect(isTrustedUpdateUrl("https://play.google.com/store/apps/details?id=com.uzitrake.medivana")).toBe(true);
    expect(isTrustedUpdateUrl("https://objects.githubusercontent.com/file.apk")).toBe(false);
  });

  it("allows subdomains of trusted hosts", () => {
    expect(isTrustedUpdateUrl("https://releases.github.com/x.apk")).toBe(true);
  });

  it("rejects non-https and lookalike hosts", () => {
    expect(isTrustedUpdateUrl("http://github.com/x.apk")).toBe(false);
    expect(isTrustedUpdateUrl("https://evil-github.com/x.apk")).toBe(false);
    expect(isTrustedUpdateUrl("https://github.com.evil.com/x.apk")).toBe(false);
    expect(isTrustedUpdateUrl("ftp://github.com/x.apk")).toBe(false);
  });

  it("rejects empty and malformed urls", () => {
    expect(isTrustedUpdateUrl("")).toBe(false);
    expect(isTrustedUpdateUrl(null)).toBe(false);
    expect(isTrustedUpdateUrl("not a url")).toBe(false);
  });
});
