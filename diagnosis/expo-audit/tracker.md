# Issue tracker — Medivana Expo audit

Status legend: `confirmed` (verified in source/tooling) · `suspected` (strong evidence, needs runtime) · `untestable` (needs env/device we don't have). Every fix gets a verification method. Nothing was changed in this audit.

## P0 — crashes and immediate hygiene (small, independent)

| # | Finding | Sev | Evidence | Fix sketch | Verify by | Status |
|---|---|---|---|---|---|---|
| 1 | "Search" nav target unregistered → crash from Home Welcome | High | `Welcome.jsx:22` vs `App.js:30-67` | Register `Search` in SCREEN_LIST | Tap search box on Home in dev client | **fixed** (`70b54e4`) |
| 2 | `this.phoneInput` in function component → crash on CLOSE | High | `Checkout.jsx:407` | `useRef` phone input | Open country picker in Checkout, press CLOSE | **fixed** (`e1d6c80`) |
| 3 | `axios@1.14.0` high CVEs (direct dep) | High | `npm audit` | `npm install axios@^1.15` (or latest 1.x) — lockfile only | `npm audit` axios clean; app boots | **fixed** (`980c7e3`, axios 1.20.0) |
| 4 | `ONESIGNAL_REST_API_KEY` in client `.env` | High | `expo-doctor` env export list | Rotate key; delete var from `.env` + EAS env | `expo-doctor` no longer exports it; bundle grep absent | **owner action required** |
| 5 | Password/OTP/orderData console logs | High | `ResetPassword.jsx:52`, `VerificationCode.jsx:59`, `checkout2.jsx:194` + 228 total `console.*` | Delete credential/PII logs; babel `transform-remove-console` in prod | `grep "console\."` of credential vars = 0; release bundle grep | **fixed** (main offenders `40dd075`-`4b42e9c`; prod console-strip still open) |

## P1 — security plumbing

| # | Finding | Sev | Evidence | Fix sketch | Verify by | Status |
|---|---|---|---|---|---|---|
| 6 | JWT in plaintext AsyncStorage | High | `AuthContext.js:42,59,61-63` | `expo-secure-store` for token; AsyncStorage keeps profile | Relaunch → still authed; storage dump shows no TOKEN | **fixed** (`1c4c6f5` + `4c13dc8`) |
| 7 | `cardInfo` (PAN) sent to own API | High | `Checkout.jsx:243-247` | Remove field from `orderData`; CVV only lives in dead checkout2 (delete file) | Network capture on checkout shows no card fields | **fixed** live path (`5628cc6`); dead checkout2 CVV pending P2 deletion |
| 8 | Logout leaves per-user caches | Medium | `AuthContext.js:65-72` (keys list in security.md SEC-08) | `multiRemove` all app keys incl. `user{*}` | Logout → login as other user → no stale cart/wish/profile | **fixed** (`1c4c6f5`, `f239253`, `453fffc`) |
| 9 | No axios timeouts / 401 handling / central instance | Medium | 46 call sites, `AuthContext.js:42` | `api.js`: baseURL + `timeout:15000` + auth interceptor (SecureStore) + 401→logout | Kill backend mid-flow → no hang; expired token → login redirect | **fixed** (`77b75ba` + hook migrations) |
| 10 | `/upload` unauthenticated, no validation | Medium | `UserDetails.jsx:82-106`, `ChatScreen.jsx:169-184` | Attach auth header; client MIME/size check; enforce server-side | 401 on unauth upload; reject >5MB/non-image | **fixed** client-side (`f67a7dc`,`7c13b2f`,`d6e028f`); server-side enforcement still needed |
| 11 | UpdateCheck opens server-provided APK URL | Medium | `UpdateCheck.jsx:64-70` | Link only to Play Store listing; drop `downloadUrl` trust | Inspect link target; force-update still works | **fixed** (`84857a0` — https + github.com/play.google.com host allowlist) |
| 12 | Receipt WebView stored-XSS surface | Medium | `ReceiptScreen.jsx:361-368` | HTML-escape interpolations or native render; drop `originWhitelist:*` | Inject `<img onerror>` name server-side → no execution | **fixed** (`30c7888` — `esc()` on all server fields + `javaScriptEnabled={false}`) |
| 13 | Firebase RTDB unauthenticated client | Medium | `firebase.js`, chat screens | RTDB rules audit (server-side); or move chat to backend | Rules file review; unauthed read fails | unverifiable client-side |
| 14 | `BACKEND_PORT` scheme unknown | Potential Critical | `.env` gitignored | Confirm `https://` in all profiles | Read `.env` (owner-only), check each EAS env | **untested — owner action** |
| 15 | Client-supplied `amount` to payments/initialize | Medium | `Checkout.jsx:285-291` | Remove `amount`; confirm server prices `appointmentId` | Tamper amount → server rejects/ignores | **closed — backend already derives amount from `doctor.consultationFee` and logs mismatches (`paymentController.js:57-74`); client `amount` is only a required fallback when no fee is set. Keep it.** |

## P2 — performance & dead code

| # | Finding | Sev | Evidence | Fix sketch | Verify by | Status |
|---|---|---|---|---|---|---|
| 16 | FlatList inside ScrollView on Home | High | `Home.jsx:149-190` | `ListHeaderComponent` restructure | Scroll long doctors list; no nested-list warning; pagination still works | **fixed** (`e3844b5`) |
| 17 | Dead deps: stripe, date-picker, keyboard-controller | High | `package.json:22,54,61`, zero imports | `npm uninstall` after dead-code pass | `expo-doctor` pass; app boots; keyboard behavior unchanged | **fixed** (`f0f4893`; keyboard-controller remains via gifted-chat peer) |
| 18 | Dead screens/files ~3,500 lines + `.backup` files | Medium | code-quality.md CQ-04/05 | Delete checkout2, tests, SupplierRegister, UserProfileCompletion, Cart, Products, backups; prune index.js | `grep` imports clean; build succeeds | **fixed** (`be8d7a0`, `c39473f`) — 32 files, incl. CVV-sending checkout2 |
| 19 | Dead nav targets in product flow | Medium | CQ-01 list | Remove navigations with the dead screens | No `navigate` literals to unregistered names | **mostly fixed** — Search registered; `CategoryCardView` still targets dead `ProductList` (dead-endpoint tab, unreachable in practice) |
| 20 | UpdateCheck 120-s polling | Medium | `UpdateCheck.jsx:22-26` | Check on launch/foreground only | Interval gone; update prompt still appears | **fixed** (`a7630ca`) |
| 21 | Barrel import of all 37 screens | Medium | `App.js:24` | Prune dead screens first, then lazy/split stacks | Cold start improved (Flipper trace) | **partially fixed** — dead screens pruned; lazy/split still open |
| 22 | `moment` for one screen | Medium | `HelpListScreen.jsx:12` | `Intl`/native Date formatting | Same date labels render | **fixed** (`5405ec8`, dep removed) |
| 23 | `axiosRetry(axios)` stacked ×7 | Medium | 7 files at module scope | Central instance, configure once | Only one retry interceptor registered | **fixed** (`e952b31`) |
| 24 | Asset bloat: 19 MB, `assetBundlePatterns:"**/*"` | Medium | `du`, `app.json:13` | Delete unused fonts/lotties/PNGs; narrow patterns | APK/IPA size before/after | **fixed** — 138 files removed, 19MB→6.6MB (in `e3844b5`) |
| 25 | ChatListScreen: per-keystroke fetch, N listeners, dispatch-in-render | Medium | `ChatListScreen.jsx:27-38,65-101` | Debounce; single unread listener; effect-based dispatch | Type in search → 1 request; no warning | **partially fixed** (`ea91471` debounce + effect dispatch; N-listener consolidation still open) |
| 26 | No expo-image caching | Medium | ~150 RN `Image` | Adopt `expo-image` for remote URIs | Cached avatars (Flipper/network) | **open** |
| 27 | Misc fixes | Low | performance.md/code-quality.md | As listed | Each: render/network/console check | **mostly fixed** — PERF-11/12/13/14/16, CQ-10 done; PERF-04 useAuthLoader dedupe open |

## P3 — dependency/platform upgrades (evaluate each)

| # | Item | Risk | Notes |
|---|---|---|---|
| 28 | Firebase 10→12 | M | Pulls fixed protobufjs; test chat paths |
| 29 | React Navigation 6→7 | L-M | With screen-tree cleanup |
| 30 | `react-native-intl-phone-input` → `libphonenumber-js`-based input | S | Already have libphonenumber-js |
| 31 | **Expo SDK 51→54** | **H** | Dedicated project: rebuild dev client, review all native deps, adopt `expo-updates`, kills most transitive dev CVEs |

## P4 — testing & tooling

| # | Item | Effort | Notes |
|---|---|---|---|
| 32 | Install `eslint` + `eslint-plugin-react`, add `lint` script | XS | Config exists; enables `unused-imports` auto-fix (CQ-19) |
| 33 | `jest-expo` + RTL smoke tests (App mount, auth flow, nav-contract test) | M | Catches CQ-01 class permanently |
| 34 | Central `api.js` axios client (see #9) | M | Also kills CQ-15 + axiosRetry duplication |
| 35 | Sentry/Crashlytics or EAS insights | S | Medical app needs crash visibility |
| 36 | Commit sanitized `eas.json`; document env setup | XS | Reproducible builds |
| 37 | Accessibility pass (labels on icon buttons) | M | Store + medical-app obligation |

## Effort/Risk scale

XS <1h trivial · S hours, low risk · M a day-ish, needs device check · L multi-day refactor · **H** planned project.

## Proposed landing order

1. **Batch A (P0, ~half day):** items 1-5 — each independently testable in dev client.
2. **Batch B (P1, ~1-2 days):** items 6-11 — SecureStore + api.js + logout purge + cardInfo removal land together logically; verify with network capture.
3. **Batch C (P2a):** items 18-19 dead code — delete before perf work so it isn't wasted.
4. **Batch D (P2b):** items 16-17, 20-27.
5. **Batch E (P4 tooling):** items 32-34 so remaining work has a safety net.
6. **P3 last**, SDK 54 as its own project.

Regressions to watch: font-name alignment (CQ-10) must not change visual output unexpectedly; dead-screen deletion must update every `navigate` literal + `screens/index.js` export; SecureStore migration needs a one-time AsyncStorage→SecureStore token move or forced re-login.
