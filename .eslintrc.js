module.exports = {
  extends: ["expo", "prettier"],
  env: { jest: true, browser: true },
  rules: {
    "import/no-unresolved": ["error", { ignore: ["^@env$"] }],
  },
  overrides: [{ files: ["scripts/**/*.js"], env: { node: true } }],
};
