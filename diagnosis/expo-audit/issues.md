# Medivana — Issues, Fixes & Ideal State

Each entry: **Issue** (what's wrong today) → **Fix** (smallest correct change) → **Ideal** (what good looks like). Ordered by priority. File references verified in source.

---

## P0 — breaks the app or leaks secrets

### 1. Tapping Search on Home crashes
- **Issue:** `components/home/Welcome.jsx:22` calls `navigation.navigate("Search")`, but `"Search"` is never registered in `SCREEN_LIST` (`App.js:30-67`) — React Navigation throws at runtime on the primary tab. Same pattern exists for dead targets `"ProductList"`, `"ProductDetails"`, `"Cart"`, `"EditProduct"`, `"AddBid"` in abandoned product-flow components.
- **Fix:** Register `Search` in `SCREEN_LIST` (`{ name: "Search", component: Screens.Search, options: { headerShown: false } }`) — the screen exists and works. Remove the dead navigate calls when deleting dead components (issue 12).
- **Ideal:** Every `navigate()` literal resolves to a registered screen; a contract test walks all navigate literals vs SCREEN_LIST so this can never regress.

### 2. `this.phoneInput` crashes the checkout country picker
- **Issue:** `Checkout.jsx:407` calls `this.phoneInput.hideModal()` inside a function component — `this` is undefined, so pressing CLOSE crashes. Same bug in dead `checkout2.jsx:295`.
- **Fix:** Use the existing ref properly (`useRef` → `ref.current.hideModal()`), matching how the picker is opened.
- **Ideal:** All third-party component handles go through refs, never `this`; an eslint `react` ruleset flags it.

### 3. axios 1.14.0 carries high-severity CVEs
- **Issue:** Installed `axios@1.14.0` is covered by 3 advisories (SSRF via NO_PROXY bypass, `validateStatus` prototype-pollution auth bypass, incomplete CVE-2025-62718 fix).
- **Fix:** `npm install axios@latest` — lockfile-only bump inside `^1`, zero code changes.
- **Ideal:** Runtime deps stay on patched versions; `npm audit` run in CI fails the build on direct-dependency CVEs.

### 4. OneSignal REST API key sits in the client `.env`
- **Issue:** `ONESIGNAL_REST_API_KEY` is exported from `.env` (visible via `expo-doctor`). It's currently unused (all OneSignal code commented out) so it's likely not bundled — but a server-side secret has no place in a client env file, and `react-native-dotenv` has no whitelist.
- **Fix:** Rotate the key, delete the var from `.env` and any EAS env profile.
- **Ideal:** `.env` contains only client-safe values; `react-native-dotenv` `whitelist` lists exactly those; nothing server-side can ever leak into the bundle.

### 5. Passwords, OTPs and order payloads logged to console
- **Issue:** `ResetPassword.jsx:52` logs `values.password`, `VerificationCode.jsx:59` logs the OTP, `checkout2.jsx:194` logs `BACKEND_PORT` + full order data. **228** `console.*` calls total, mostly unguarded.
- **Fix:** Delete the credential/PII logs outright; keep `__DEV__`-gated logs for genuine debugging.
- **Ideal:** `babel-plugin-transform-remove-console` strips all console calls in release builds; PII never reaches logs even in dev.

---

## P1 — security plumbing

### 6. JWT lives in plaintext AsyncStorage
- **Issue:** `AuthContext.js:61-63` persists the whole login response (JWT + email + phone + medical profile) in unencrypted AsyncStorage. Readable on rooted devices and unencrypted backups → account takeover.
- **Fix:** Install `expo-secure-store`; store only `TOKEN` there; keep the profile object in AsyncStorage.
- **Ideal:** Token in Keychain/Keystore via SecureStore, profile data unencrypted, one-time migration moves existing tokens or forces one re-login.

### 7. Raw card numbers sent to your own backend
- **Issue:** `Checkout.jsx:243-247` adds `orderData.cardInfo = { cardNumber, customer, nameOnCard }` POSTed to `/api/v1/appointment`. Dead `checkout2.jsx` also sends `cvv`. PAN through your server = PCI-DSS scope + breach blast radius, and it's redundant — Paystack's hosted page already handles cards.
- **Fix:** Remove `cardInfo` from `orderData` entirely; delete `checkout2.jsx`.
- **Ideal:** Card data only ever exists inside Paystack's hosted WebView; your API sees appointment data + payment reference, nothing else.

### 8. Logout leaves another user's data on the device
- **Issue:** `AuthContext.js:65-72` removes only `"id"` and `user{_id}`. Left behind: `profileCompletion`, `lastExpoPushToken`, `cachedFaqs`, doctor caches, `reset-email`, `skipped_version`, and every previous account's `user{oldId}` blob (stale tokens included). Cart/wishlist *are* cleared via `Profile.jsx:59-60` — but only through that one logout path.
- **Fix:** On logout, `multiRemove` the full app key list (or `AsyncStorage.clear()` — a commented-out line 52 suggests that was always the intent), and scope remaining keys per-user.
- **Ideal:** `logout()` leaves zero personal data; user B on a shared device sees nothing of user A; stale `userX` blobs are purged.

### 9. No central API client — no timeouts, no 401 handling
- **Issue:** 46 `axios.*` call sites hand-build URLs; auth rides on the mutable global `axios.defaults` header; axios default timeout is infinite; expired tokens just silently fail; 4+ raw `fetch()` calls bypass auth entirely; `axiosRetry(axios)` is registered in 7 files, stacking retry interceptors.
- **Fix:** One `api.js`: `axios.create({ baseURL: BACKEND_PORT, timeout: 15000 })`, request interceptor reading the token from SecureStore, response interceptor on 401 → logout, retry configured once.
- **Ideal:** Every request shares timeout/auth/retry/error mapping; screens call `api.get("/v1/appointment")` and never see URL construction.

### 10. `/upload` accepts anonymous uploads
- **Issue:** 4 screens POST `FormData` to `${BACKEND_PORT}/upload` with no Authorization header and no client-side type/size validation (`UserDetails.jsx:82-106`, `Help.jsx:179-195`, `ChatScreen.jsx:169-184`, `HelpAgentChatScreen.jsx:138-147`).
- **Fix:** Route uploads through the central client (auth attached); validate MIME and size before sending; verify the endpoint requires auth server-side.
- **Ideal:** Authenticated uploads only, type/size-enforced on both ends, server does real file sniffing.

### 11. Update prompt opens a server-controlled APK URL
- **Issue:** `UpdateCheck.jsx:64-70` `Linking.openURL`s whatever `downloadUrl` the API returns — fallback is `Promokings-v*.apk` (wrong project, copy-paste). Backend compromise → malware distribution. Also polls every 120 s forever, and `app.json` `updates.url` is a GitHub repo URL (invalid — `expo-updates` isn't even installed).
- **Fix:** Link only to the Play Store listing; check for updates once per launch/foreground instead of polling.
- **Ideal:** Either proper `expo-updates` OTA (correct `updates.url`, channels) or a store-deep-link update prompt — never a server-provided binary URL in a Play-distributed app.

### 12. Dead code ships in the bundle
- **Issue:** ~3,500 lines of dead screens (`checkout2.jsx`, `tests.jsx`, `SupplierRegister.jsx` — 1,123 lines, `UserProfileCompletion.jsx`, `Cart.jsx`, `Products.jsx`), three `*.stripe.backup` files, ~60 unused font files, a 5 MB `doctor2.png`, all swept into the binary by `assetBundlePatterns: ["**/*"]`.
- **Fix:** Delete the dead screens/backups, prune `screens/index.js`, remove unused assets, narrow `assetBundlePatterns`.
- **Ideal:** The bundle contains only reachable code and used assets; nothing stale can leak secrets or confuse the next refactor.

### 13. Receipt WebView renders unsanitized server data with JS enabled
- **Issue:** `ReceiptScreen.jsx:361-368` interpolates server fields (usernames, phones, booking IDs) into an HTML string inside a `javaScriptEnabled` + `originWhitelist:["*"]` WebView → stored-XSS exfiltration channel.
- **Fix:** HTML-escape every interpolated field, or render the receipt natively / via `expo-print` only; drop `originWhitelist:"*"` if JS isn't needed.
- **Ideal:** Untrusted strings never execute markup anywhere in the app; the receipt is a native view or sanitized document.

### 14. Firebase chat has no client auth
- **Issue:** RTDB reads/writes in `ChatScreen.jsx`, `Help.jsx` are unauthenticated — security depends entirely on RTDB rules, which can't be verified client-side (backend audit flagged this as P0).
- **Fix:** Audit/lock Firebase rules (`medivana/messages/*` scoped to participants), or move chat behind the authenticated backend.
- **Ideal:** Medical chat content requires auth to read/write; the shipped config alone grants nothing.

### 15. Client supplies payment amount
- **Issue:** `Checkout.jsx:285-291` sends `amount: estimatedAmount` to `/api/v6/payments/initialize`. Server-side verify exists (good) — but if the backend trusts that amount, users underpay.
- **Fix:** Drop `amount` from the request; confirm the backend prices `appointmentId` authoritatively.
- **Ideal:** The client can never influence price; backend computes amount from the appointment record.

---

## P2 — performance & architecture

### 16. Home screen list isn't virtualized
- **Issue:** `Home.jsx:149-190` puts `FlatList` inside `ScrollView` with `scrollEnabled={false}` — every doctor row renders at once, plus a hand-rolled `onScroll`+`loadMoreRef` pagination on top of `FlatList`'s own `onEndReached`.
- **Fix:** Make `DoctorsList`'s FlatList the outer scroller; move the header/hero into `ListHeaderComponent`; delete the manual pagination.
- **Ideal:** One scroller, real virtualization (`initialNumToRender`, `windowSize`, `getItemLayout` — all already configured in `DoctorsList`), memory stays flat as the list grows.

### 17. Dead native dependencies
- **Issue:** `@stripe/stripe-react-native`, `react-native-date-picker`, `react-native-keyboard-controller` are installed with **zero imports** — native code shipped for nothing (stripe alone is heavy).
- **Fix:** `npm uninstall` all three after the dead-code pass (issue 12) confirms no references.
- **Ideal:** package.json contains only what the bundle actually imports; dep audit is part of review.

### 18. All 37 screens load at startup
- **Issue:** `App.js:24` barrel-imports every screen — chat, receipt (expo-print), the 1,123-line supplier form — all evaluated before first paint.
- **Fix:** After dead-screen cleanup, split auth/app stacks and lazy-load heavy screens.
- **Ideal:** Cold start evaluates only the route the user lands on; heavy screens load on demand.

### 19. Version check polls forever + duplicate auth bootstrap
- **Issue:** `UpdateCheck` fetches on mount and every 120 s for the whole session; `useAuthLoader` and `AuthContext.checkExistingUser` both read AsyncStorage auth state at startup (and `useAuthLoader` treats the bare `_id` as a user object).
- **Fix:** Check once per launch/foreground; let `AuthProvider` own the single bootstrap and expose `authReady`.
- **Ideal:** Zero background polling; one auth source of truth; splash holds until fonts + auth are ready (no white flash at `App.js:87`).

### 20. Chat list amplifies work
- **Issue:** `ChatListScreen.jsx` fires an axios GET per search keystroke, mounts one Firebase `onValue` listener per contact, and calls `navigation.dispatch(reset)` **during render**.
- **Fix:** Debounce search ~300 ms, replace per-contact listeners with one unread-counts node, move dispatch into `useEffect`.
- **Ideal:** One request per settled query, O(1) listeners, navigation only in effects/handlers.

### 21. No request caching/dedup + stacked retry interceptors
- **Issue:** `useFetch` is the good hook (abort support) but only ~9 call sites use it; the rest refetch on every mount. `axiosRetry(axios)` at module scope in 7 files compounds retries.
- **Fix:** Central client (issue 9) with retry configured once; consolidate hooks to `useFetch` + `usePost2` + `useDelete2` (the working variants).
- **Ideal:** One client, one retry policy, predictable per-screen fetch behavior; tab switches don't re-hit the API.

### 22. No working lint/tests/typecheck
- **Issue:** `.eslintrc.js` extends `plugin:react/recommended` but `eslint` and `eslint-plugin-react` aren't installed and there's no lint script. No jest, no tests, no CI.
- **Fix:** Install `eslint` + `eslint-plugin-react`, add `"lint": "eslint ."`; later `jest-expo` smoke tests.
- **Ideal:** CI runs lint + a navigation-contract test + render smoke tests; the crash class in issues 1-2 is caught statically.

### 23. Housekeeping drags
- **Issue:** `moment` (~300 kB) for one screen's date labels; `fontFamily:"lufgaBold"` referenced but never loaded → silent fallback; 662 hardcoded hex colors vs theme; zero `accessibilityLabel` anywhere; barrel `index.js` exports components + has a stray `Appointments;` statement; `contexts/cartStorage.js` is a broken orphan importing a nonexistent path.
- **Fix:** Per-finding one-liners in `code-quality.md`/`performance.md`.
- **Ideal:** Theme tokens cover colors, font names match loaded fonts, icon buttons are labeled, the barrel exports screens only.

---

## P3 — strategic

### 24. Expo SDK 51 is end-of-life
- **Issue:** SDK 51 (May 2024) vs current ~54 — no OTA support path, aging native templates, most of the 105 `npm audit` findings are stale dev-tool transitive deps that only an SDK bump fixes.
- **Fix:** Dedicated upgrade project (51→54): rebuild dev client, review every native dep, adopt `expo-updates`.
- **Ideal:** Supported SDK, real OTA pipeline, patched toolchain, modern Hermes.

### 25. `BACKEND_PORT` scheme unknown — must be https
- **Issue:** `.env` is gitignored so the audit couldn't read the value. Dev sibling repos use `http://192.168.x.x`/`localhost`. If any build profile ships `http://`, JWTs + passwords + medical data go over cleartext → **Critical**.
- **Fix:** Verify `.env` and every EAS env profile uses `https://` in production builds.
- **Ideal:** Production builds physically can't reach an `http://` backend — assert the scheme at startup in `__DEV__`-only warnings or a build check.
