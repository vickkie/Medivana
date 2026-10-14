# Medivana (Expo React Native) — Production-Readiness Audit

Read-only audit of `vickkie/Medivana` at commit `4bf5270` (app version 2.3.0, `versionCode` 10). No application code was modified, no builds were published, no credentials were read or exposed. The audit was performed on the local clone under `/home/quinzel/projects/Medivana` on 2026-10-11.

This report covers the **patient-facing Expo app only**. The backend/admin/doctor apps are covered separately by `../medivana-audit/` (or `/home/quinzel/projects/medivana-audit/`).

## Overall status

| Area | Score (1-10) | Summary |
|---|---|---|
| Security | 3 | JWT in plaintext AsyncStorage, password/OTP/card data logged, raw PAN sent to own API, unauthenticated uploads, server-controlled APK update URL. |
| Performance | 5 | FlatList-inside-ScrollView on Home, eager loading of all 37 screens, 2-min version polling, moment for one screen, unused native deps; contexts/memoization/listeners are otherwise decent. |
| Dependencies | 4 | expo-doctor clean and `expo install --check` clean, but Expo SDK 51 is EOL, axios 1.14.0 has 3 high CVEs, and ~3 native deps ship unused. |
| Code quality | 3 | ~6 guaranteed-crash navigation targets, 9 dead files (~3,500 lines), `this.` calls in function components, duplicated hooks, dead eslint config, no tests. |
| Reliability | 3 | ErrorBoundary exists but no crash reporting, no 401 handling, no timeouts, no request dedup. |
| Testing | 0 | Zero test infrastructure; eslint is configured but eslint itself is not installed. |
| Release readiness | 4 | Builds via EAS, targetSdk 35 done, minimal permissions; but `updates.url` points at a GitHub repo (expo-updates not even installed), `assetBundlePatterns: "**/*"` ships dead files, store data-safety story unknown. |
| **Overall** | **3/10** | Functional but not production-hardened. |

## Baseline results (verified)

- `npx expo-doctor` — **17/17 checks passed**.
- `npx expo install --check` — **all dependencies up to date** for SDK 51.
- `npm audit` — **105 vulnerabilities** (4 critical, 57 high, 42 moderate, 2 low); nearly all transitive dev-tooling issues except `axios` (direct, high) and `protobufjs` (Firebase transitive, critical-rated but likely not bundled — see `dependencies.md`).
- `npm ls --depth=0` — 0 problems (no missing/invalid deps).
- Lint — **cannot run**: eslint is not installed (only `eslint-plugin-unused-imports` is; `plugin:react/recommended` requires missing `eslint-plugin-react`).
- Tests — **none exist**; no jest config, no test script.
- Bundle audit — not performed (requires `expo export` build; not run in read-only phase).

## Highest-priority findings

1. **CRASH-01 (High)** — `components/home/Welcome.jsx:22` navigates to `"Search"` which is **not registered** in the stack → guaranteed runtime error on the live Home screen. 5 more dead nav targets in abandoned product flows. See `code-quality.md` CQ-01.
2. **SEC-01 (High)** — JWT + full user profile persisted in unencrypted AsyncStorage (`AuthContext.js:61-63`); `expo-secure-store` not installed.
3. **SEC-02 (High)** — plaintext password (`ResetPassword.jsx:52`), OTP (`VerificationCode.jsx:59`), and full order payload incl. backend URL (`checkout2.jsx:194`) written to console; **228** `console.*` calls, most unguarded.
4. **SEC-03 (High)** — `orderData.cardInfo = { cardNumber, ... }` POSTed to own backend (`Checkout.jsx:243-247`); CVV transmitted in dead `checkout2.jsx`. PCI scope on your API; also conflicts with the Paystack-hosted-card flow.
5. **SEC-ENV (High)** — `ONESIGNAL_REST_API_KEY` lives in the client `.env` (confirmed exported by `expo-doctor`). It is not imported in code so it is likely **not bundled**, but a server secret has no business in a client env file — rotate and remove.
6. **PERF-01 (High)** — `Home.jsx:149-190`: `FlatList` inside `ScrollView` with `scrollEnabled={false}` → virtualization disabled, all rows render, nested-list warning, manual re-pagination on top.
7. **CQ-02 (High)** — `this.phoneInput.hideModal()` inside a function component (`Checkout.jsx:407`) → crash when the country-picker CLOSE button is pressed (verified).
8. **DEP-01 (High)** — `axios@1.14.0` direct dependency is vulnerable (3 advisories incl. CVE-2025-62718 incomplete fix). Fix available within range — bump lockfile only, no code change needed.
9. **REL-01 (Medium)** — `app.json` `updates.url` = GitHub repo URL and `expo-updates` is not installed → OTA updates silently broken; `UpdateCheck` polls every 120 s forever and `Linking.openURL`s whatever `downloadUrl` the API returns.
10. **CQ-08 (Medium)** — no lint, no tests, no typecheck, no CI; eslint config references uninstalled plugins.

## What is already good

- Context values memoized correctly (Cart, Wish, Auth); debounced persistence with cleanup.
- All Firebase `onValue` listeners unsubscribe; expo-notification listeners cleaned; `useFetch` has proper AbortController cancellation.
- Payment verification is server-side (`/api/v6/payments/verify|status`); Paystack WebView intercepts the callback rather than trusting client state.
- Minimal Android permissions; `.env`, `eas.json`, `google-services.json` never committed (verified in git history).
- Firebase SDK imports are modular (`firebase/app` + `firebase/database` only).

## Files in this audit

| File | Contents |
|---|---|
| `architecture.md` | Stack, entry flow, providers, navigation map, data layer |
| `performance.md` | PERF-01..18 findings with evidence |
| `security.md` | SEC-01..15 findings with severity and remediation |
| `dependencies.md` | Versions, vulnerabilities, deprecated/unused deps, upgrade risks |
| `code-quality.md` | CQ-01..20: dead code, crash bugs, duplication, naming |
| `testing.md` | Test/lint/type baseline — everything currently missing |
| `release-readiness.md` | Build config, store readiness, OTA, privacy |
| `tracker.md` | Consolidated issue tracker with status + verification method |

## Remediation posture

Phase order proposed in `tracker.md`: **P0 crash + secret hygiene → P1 security plumbing (SecureStore, axios instance, logout purge, console strip) → P2 performance + dead-code removal → P3 dependency upgrades → P4 testing/tooling**. No code was changed during this audit; nothing here should ship without the verification column being exercised on a device.
