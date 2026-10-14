# Dependency & platform audit

## Toolchain baseline (verified)

- Node v25.9.0, npm 11.12.1; fresh `npm install` succeeded (1,425 packages, no `npm ls` problems).
- `npx expo-doctor` → **17/17 checks passed**.
- `npx expo install --check` → **all dependencies up to date** for SDK 51.

## Platform versions

| Item | State | Note |
|---|---|---|
| Expo SDK | **51** | End-of-life (released May 2024; current ~54). No OTA update support, aging native templates. |
| React Native | 0.74.5 | Matches SDK 51. Old arch only. |
| React | 18.2.0 | Correct for RN 0.74. |
| React Navigation | v6 (`native 6.1.18`, `native-stack 6.11.0`, `bottom-tabs 6.6.1`) | v7 exists; v6 still maintained-ish. |
| targetSdkVersion | **35** (via `expo-build-properties`) | Meets Play Store Aug-2025 requirement — recent fix verified. |
| versionCode | 10 / version 2.3.0 | app.json + package.json in sync. |
| TypeScript | absent | No tsconfig, no types. |
| Package manager | npm + package-lock committed | Good. |

## npm audit — 105 vulnerabilities (4 critical / 57 high / 42 moderate / 2 low)

**Runtime-relevant:**

| Package | Sev | Installed | Advisory summary | Fix |
|---|---|---|---|---|
| `axios` | **High (direct)** | 1.14.0 | NO_PROXY hostname bypass→SSRF; auth bypass via `validateStatus` prototype pollution; incomplete CVE-2025-62718 fix | `npm install axios@latest` within `^1` range — lockfile-only change, zero code risk |
| `protobufjs` | Critical (transitive via `firebase`) | ≤7.6.4 | RCE / code injection / DoS advisories | Firebase v10 bundles it for Firestore — app imports only `app`+`database`, so the vulnerable path is likely **not in the bundle**; still upgrade firebase to a release with fixed protobufjs |
| `send`, `braces`, `tar`, `shell-quote`, `websocket-driver`, `fast-xml-parser`, `@xmldom/xmldom`, `node-forge`, etc. | Critical→Low | — | All **dev/build-tool transitive** (expo cli, @react-native-community/cli, metro, babel) — not shipped in the app bundle | Fix only via SDK/RN upgrade or `overrides` — do NOT `npm audit fix --force` (it proposes `expo@44`!) |

`npm audit fix --force` would regress `expo` to 44.0.6 — **never run it**.

## Unused / dead dependencies (zero imports — verified)

| Package | Weight | Action |
|---|---|---|
| `@stripe/stripe-react-native` | Large native module | Remove (Stripe replaced by Paystack; `.backup` files document the old flow) |
| `react-native-date-picker` | Native | Remove |
| `react-native-keyboard-controller` | Native | Remove or mount `KeyboardProvider` (pinned 1.12.3 for a since-fixed GiftedChat crash; currently zero imports) |
| `moment` | ~300 kB JS | Remove after replacing `HelpListScreen` usage |
| `react-native-intl-phone-input` | unmaintained (last release years old) | Replace with `libphonenumber-js` (already a dep) + custom input |
| `metro-react-native-babel-preset` | devDep | Redundant with `babel-preset-expo` — remove |

## Deprecated / risk flags

- `react-native-dotenv` + `babel-preset-expo` env: SDK 51 supports `EXPO_PUBLIC_*` natively — modern replacement for dotenv if env handling is revisited.
- `react-native-app-intro-slider` — old but functional; used only in Onboarding.
- `@gorhom/bottom-sheet@4.6.4` — v5 exists (minor API changes); fine as-is.
- `firebase@10.14.1` — two majors behind (12.x); upgrade brings fixed protobufjs/undici but check RN compat.
- `react-native-gifted-chat@2.6.5` — active maintenance recently resumed; keep.

## Config-plugin / native state

- `expo-build-properties` sets only `targetSdkVersion: 35`.
- `expo-notifications` plugin: notification icon + `androidCollapsedTitle`, no sounds.
- `googleServicesFile: ./google-services.json` — gitignored; generated at build by `eas-build-pre-install` script decoding `GOOGLE_SERVICES_JSON` env. Sound pattern; ensure the script never runs in a way that commits the output.
- **No `expo-updates`** — yet `app.json` has `updates.url` (invalid value: GitHub repo URL). Dead config.
- No `development-client` issues; `expo-dev-client` present, `start` uses `--dev-client`.
- Expo Go: app uses native modules (dev-client required) — consistent with scripts.

## Upgrade posture

| Change | Breaking risk | Recommendation |
|---|---|---|
| `axios` patch bump | None | **Do first** (P0, lockfile-only) |
| Remove dead deps (stripe, date-picker, keyboard-controller, moment, intl-phone-input, metro-babel-preset) | Low | After dead-code cleanup confirms zero runtime paths |
| `firebase` 10→12 | Medium (auth/db API renames unlikely for app+db only) | Test chat end-to-end |
| React Navigation 6→7 | Low-medium | Optional; combine with screen-tree cleanup |
| **Expo SDK 51→54** | **High** — rebuild dev client, review every native dep, Hermes/RN 0.77 changes | Plan as a dedicated project; unlocks maintained SDK, `expo-updates`, fixes transitive dev-tool CVEs |
