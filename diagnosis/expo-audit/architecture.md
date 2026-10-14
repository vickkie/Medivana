# Architecture — Medivana Expo app

## Actual stack (verified from package.json + installed tree)

| Layer | Version / choice |
|---|---|
| Expo SDK | 51 (`expo@^51.0.0`) — **EOL**; current stable is ~SDK 54 (Oct 2026) |
| React Native | 0.74.5 |
| React | 18.2.0 |
| Language | JavaScript only (`.js`/`.jsx`), no TypeScript, no tsconfig |
| Navigation | React Navigation v6 (`@react-navigation/native@^6.1.18`, `native-stack@^6.11.0`, `bottom-tabs@^6.6.1`) |
| Network | `axios@^1.13.2` (installed **1.14.0**) + `axios-retry@^4.5.0`; raw `fetch()` in 4+ places |
| State | React Context only — AuthContext, CartContext, WishContext, ProfileCompletionContext |
| Persistence | `@react-native-async-storage/async-storage` — **no expo-secure-store, no MMKV** |
| Chat | Firebase Realtime DB (`firebase@^10.14.1`, `app`+`database` modules only) + `react-native-gifted-chat` |
| Payments | Paystack via WebView + server verify; `@stripe/stripe-react-native@0.37.2` installed but **zero imports** |
| Push | `expo-notifications` (OneSignal code fully commented out) |
| Env | `react-native-dotenv` (`@env`), `.env` gitignored |
| Validation | formik + yup, libphonenumber-js, react-native-intl-phone-input |
| Lint/format | `.eslintrc.js` exists but eslint **not installed**; no prettier |
| Tests | None (no jest, no scripts) |
| Node | v25.9.0 / npm 11.12.1 used for audit |

## Entry flow (`App.js`)

```
AppEntry.js → App()
  ├─ useFonts: 8 Urbanist weights          (fontsLoaded never gates render)
  ├─ useAuthLoader(): AsyncStorage "id"    (duplicate bootstrap — see below)
  ├─ SplashScreen.hideAsync() on !authLoading
  └─ ErrorBoundary2
       └─ GestureHandlerRootView
            ├─ UpdateCheck                 (fetch + setInterval 120 s)
            └─ BottomSheetModalProvider
                 └─ AuthProvider           (2nd AsyncStorage bootstrap)
                      └─ ProfileCompletionProvider (fetch on userData change)
                           └─ CartProvider         (AsyncStorage "cart")
                                └─ WishProvider     (AsyncStorage "wishlist")
                                     └─ NavigationContainer
                                          ├─ PushNotification (expo-notifications)
                                          ├─ Stack.Navigator (37 screens, all eager)
                                          └─ Toast
```

**Provider depth: 8** (9 counting NavigationContainer). Only `CartProvider`/`WishProvider`/`ProfileCompletionProvider` are real state providers; AuthProvider duplicates `useAuthLoader`'s storage read.

## Navigation map

- One `createNativeStackNavigator`; `SCREEN_LIST` (App.js:30-67) registers **37 screens** via `import * as Screens from "./screens"` barrel — nothing is lazy.
- `BottomTabNavigation` (4 tabs: Home, Categories, Orders→Appointments, Profile) is a nested navigator with a custom `BlurView` tab bar.
- `screens/index.js` is the barrel: exports screens **and** components (`BackBtn`, `CustomButton`, `LatestProducts`), contains commented imports and a stray `Appointments;` no-op (index.js:41). Aliases `Orders → Appointments`, `OrderDetails → AppointmentDetails` hide real file names.
- `Helpers/NavigationService.jsx` exports a `navigationRef` that is **never attached** to `NavigationContainer` — dead navigation service.

## Data layer reality

- **No shared axios instance.** 46 `axios.*` call sites across ~15 screens hand-build `${BACKEND_PORT}/api/...` or `${BACKEND_PORT}/auth/...`. Auth header comes from the mutable global `axios.defaults.headers.common.Authorization` set in `AuthContext`.
- Custom hooks exist (`useFetch`, `usePost`, `usePost2`, `useDelete`, `useDelete2`, `useUpdate`) but are used at only ~9 call sites; `usePost`/`useDelete`/`useUpdate` are effectively dead or buggy duplicates.
- `axiosRetry(axios, {retries:3})` is invoked at module scope in **7 files** — each import stacks another retry interceptor on the global instance → compounding retry amplification.
- `utils/storage.js` thin AsyncStorage wrappers (fine); `contexts/cartStorage.js` is a broken orphan (imports `./utils/storage` — path doesn't exist from `contexts/` — and a non-existent `storage` export).

## App origin

The codebase is a fork of the "Promokings" e-commerce app (same author): dead cart/products/supplier/inventory flows, `Promokings-v*.apk` fallback URL in `UpdateCheck.jsx:67`, historical `eas.json` pointed `BACKEND_PORT` at `promokings-backend.vercel.app`. The doctor-booking flow was grafted on top — explains the dual naming (Orders/Appointments, Favourites of "doctors") and large dead regions.
