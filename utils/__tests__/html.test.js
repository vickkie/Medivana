import { esc } from "../html";

describe("esc", () => {
  it("escapes all html-special characters", () => {
    expect(esc(`<script>alert("x")</script>`)).toBe("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
    expect(esc(`a&b 'c'`)).toBe("a&amp;b &#39;c&#39;");
    expect(esc(`" onmouseover="alert(1)`)).toBe("&quot; onmouseover=&quot;alert(1)");
  });

  it("handles nullish and non-string input", () => {
    expect(esc(null)).toBe("");
    expect(esc(undefined)).toBe("");
    expect(esc(42)).toBe("42");
  });
});
