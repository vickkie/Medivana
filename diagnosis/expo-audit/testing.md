# Testing & validation baseline

## Existing infrastructure

| Check | Configured? | Result |
|---|---|---|
| Expo compatibility | `npx expo-doctor` | ✅ **17/17 pass** |
| Dependency versions | `npx expo install --check` | ✅ all up to date (for SDK 51) |
| Vulnerability scan | `npm audit` | ⚠️ 105 vulns — see `dependencies.md` |
| Lint | `.eslintrc.js` exists | ✅ **now wired** — `eslint@8` + `eslint-config-expo` + `prettier`, `npm run lint` runs. Baseline: **38 errors / 288 warnings** (mostly react-hooks deps + conditional hooks — tracked as remaining debt) |
| Typecheck | none (JS project) | ❌ n/a — no tsconfig |
| Unit tests | jest-expo + react-test-renderer | ✅ **9/9 pass** — `utils/__tests__/` covers urlSafety, html esc, storage helpers; `screens/tests.jsx` deleted (dead chat screen) |
| E2E | none | ❌ no Detox/Maestro |
| CI | none | ❌ no `.github/` or CI config in repo |
| Crash reporting | `react-native-error-boundary` mounted | ⚠️ UI fallback only — no Sentry/Crashlytics |

## Baseline results recorded

- `npm install` clean (1,425 pkgs, 0 `npm ls` problems).
- `expo-doctor` 17/17. `expo install --check` clean.
- `npm audit` 105 (4 crit / 57 high) — overwhelmingly dev-tool transitive; `axios` direct/high is the only ship-relevant one.
- `npx eslint` → n/a (binary absent).
- No builds run (read-only phase; EAS credentials not exercised).

## What's untestable right now (honest gaps)

- **No platform was runtime-tested** — cannot claim iOS/Android parity.
- WebView payment flow, push registration, Firebase chat — need a dev-client + backend + Firebase project.
- `BACKEND_PORT` target environment unknown (gitignored `.env`; dev runs were observed against `localhost:3000`/LAN IP in sibling repos).

## Missing tests that matter most (recommend, ordered)

1. **Smoke render** — `jest-expo` + react-native-testing-library: App mounts, Onboarding → Login render. Would have caught CQ-01 (unregistered "Search").
2. **AuthContext** — login/logout persists & purges the right AsyncStorage keys (SEC-08 regression net).
3. **Checkout submit paths** — Paystack branch vs fallback; assert `cardInfo` never leaves the client (SEC-03).
4. **useFetch** — cancellation on unmount, error mapping (already the best-tested-by-design hook).
5. **Navigation contract test** — walk `SCREEN_LIST` names vs every `navigate("...")` literal in the repo; mechanical, catches CQ-01 class permanently.

## Validation required after remediation

- `npm run lint` clean (once installed), `npx tsc` if TS adopted later.
- Dev-client smoke: cold start → login → Home → doctor detail → appointment → Paystack sandbox → receipt; logout → verify keys purged.
- Re-run `expo-doctor` + `npm audit` after dep changes; diff against the baselines above.
