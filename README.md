# Vue Multiplatform Template

A pnpm monorepo where one set of **Vue 3 + TypeScript** components runs as:

| App           | Shell                      | Path           |
| ------------- | -------------------------- | -------------- |
| PWA (web)     | Vite + `vite-plugin-pwa`   | `apps/web`     |
| iOS / Android | Vite + Capacitor 8         | `apps/mobile`  |
| Desktop       | Electron + `electron-vite` | `apps/desktop` |

```
packages/
  platform/   @app/platform  – Platform interface + Vue plugin (`usePlatform()`)
  ui/         @app/ui        – views, router, Pinia stores, styles
apps/
  web/        PWA shell        → implements Platform with browser APIs
  mobile/     Capacitor shell  → implements Platform with Capacitor plugins
  desktop/    Electron shell   → implements Platform via preload + IPC
```

## Tested platforms

Last checked 2026-10-29 on Ubuntu 26.04 (x86_64), Node 24, pnpm 11.

| Target                    | Builds | Runs | Notes                                                                                                                |
| ------------------------- | :----: | :--: | -------------------------------------------------------------------------------------------------------------------- |
| PWA (web)                 |   ✅   |  ⏳  | Build and manifest checked; not yet opened or installed in a browser                                                 |
| Mobile app in browser     |   ✅   |  ✅  | `pnpm dev:mobile`; platform shows `web`                                                                              |
| Android (Capacitor)       |   ✅   |  ✅  | `pnpm dev:android` on an Android 17 emulator: native version and Preferences storage, app loaded from the dev server |
| iOS (Capacitor)           |   ❌   |  ❌  | Needs macOS + Xcode; not possible on Linux                                                                           |
| Electron on Linux (dev)   |   ✅   |  ✅  | Router, Pinia store and storage over IPC checked                                                                     |
| Electron Linux packages   |   ✅   |  ✅  | AppImage, .deb, .tar.gz (x64 + arm64); the unpacked x64 app was launched                                             |
| Electron Windows packages |   ❌   |  ⏳  | Building on Linux needs Wine (not installed)                                                                         |
| Electron macOS package    |   ⏳   |  ⏳  | Must be built on macOS                                                                                               |

✅ works · ❌ fails or not possible on this machine · ⏳ not tested yet

## How sharing works

Everything app-level lives in `@app/ui`: components (`src/components`), views, Vue Router routes
(`src/router`) and Pinia stores (`src/stores`). Each shell only supplies its
`Platform` implementation and a router history mode:

```ts
createSharedApp({ platform: webPlatform, historyMode: 'web' }).mount('#app')
```

| Shell   | History | Why                                                  |
| ------- | ------- | ---------------------------------------------------- |
| web     | `web`   | Clean URLs; the PWA service worker serves index.html |
| mobile  | `hash`  | Works with the relative `base: './'` Capacitor needs |
| desktop | `hash`  | The production build loads from `file://`            |

If you host the PWA, configure your server to fall back to `index.html` for
unknown paths.

Shared UI never touches `window.desktop`, Capacitor, or the service worker
directly. Components and Pinia setup stores call `usePlatform()` to get the
current shell's implementation (see `src/stores/counter.ts`).

To add a native capability (camera, file picker, notifications…):

1. Add the method to `Platform` in `packages/platform/src/index.ts`.
2. Implement it in each app's `platform.ts` (TypeScript will flag any you miss).
3. Use it from `@app/ui` via `usePlatform()`.

Workspace packages ship TypeScript/`.vue` source (no build step); each app's
Vite compiles them.

## Adding pages

Pages live in `packages/ui/src/views/`, routes in `packages/ui/src/router/index.ts`.
Every app picks up a new route automatically.

1. Create `packages/ui/src/views/SettingsView.vue`.
2. Add it under the layout's `children`:
   ```ts
   { path: 'settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
   ```
3. Link to it: `<RouterLink :to="{ name: 'settings' }">Settings</RouterLink>`, or
   navigate in code with `useRouter().push({ name: 'settings' })`.

`App.vue` only renders `<RouterView />`. The route tree decides the layout:
children of the `DefaultLayout` route render inside its `<RouterView />`. For a
page without the layout (login, splash), add it as a top-level route next to
the layout route; for a second layout, add another layout route with its own
children.

## Getting started

Requires Node 22+ and pnpm 11 (`corepack enable`).

```bash
pnpm install

pnpm dev:web        # PWA at http://localhost:5173
pnpm dev:desktop    # Electron with HMR
pnpm dev:mobile     # mobile shell in the browser (Capacitor plugins use web fallbacks)
```

### Mobile (Capacitor)

The native projects are committed in `apps/mobile/android` and `apps/mobile/ios`.
Edit them like any Android Studio / Xcode project (permissions, icons, signing).

```bash
pnpm cap:android       # build web, sync, open Android Studio (needs Android Studio + JDK 21)
pnpm cap:ios           # build web, sync, open Xcode (macOS only)
pnpm cap:sync          # build web + copy into both native projects
pnpm cap:open:android  # open without rebuilding
pnpm cap:open:ios
```

#### Android setup

1. Install Android Studio and run its setup wizard (installs the SDK in `~/Android/Sdk`).
2. In **Settings → Languages & Frameworks → Android SDK → SDK Platforms**, install
   **Android 16.0 (API 36)**, the version Capacitor 8 builds against, and create an emulator in
   **Device Manager**.
3. Install **JDK 21** (`sudo apt install openjdk-21-jdk-headless` on Ubuntu). Android Studio's
   bundled Java may be newer than the project's Gradle supports.
4. Add to `~/.bashrc` (SDK tools first, so an older system `adb` doesn't shadow them):
   ```bash
   export ANDROID_HOME="$HOME/Android/Sdk"
   export JAVA_HOME="/usr/lib/jvm/java-21-openjdk-amd64"
   export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
   ```

If a build fails with `Cannot query the value of this provider` or mentions a missing
`android.jar`, the API 36 platform install is incomplete: reinstall it from the SDK Manager.

The app version shown on Android/iOS comes from the native projects (`versionName` in
`android/app/build.gradle`, `MARKETING_VERSION` in Xcode), not from `package.json`.

#### Developing on a device or emulator

```bash
pnpm dev:android   # live reload on an Android emulator/device
pnpm dev:ios       # live reload on an iOS simulator/device (macOS only)
pnpm dev:mobile    # same app in a desktop browser (platform shows "web")
```

`dev:android` / `dev:ios` start Vite on your network, then run `cap run` with
live reload pointed at it, so edits reload on the device with real native
plugins. Capacitor asks which device to use; skip the prompt with
`pnpm dev:android --target <id>` (list ids with `pnpm exec cap run android --list`
in `apps/mobile`). The device must reach your computer over the network. Press
Ctrl+C to stop; that also restores the native project's config.

Run `pnpm cap:sync` after changing web code or adding a Capacitor plugin.
`cap sync` also rewrites the plugin paths in `android/capacitor.settings.gradle`
and `ios/App/CapApp-SPM/Package.swift`, so commit those changes after upgrading
dependencies. To generate app icons and splash screens for
both platforms, use [`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets).

### Desktop (Electron)

```bash
pnpm dist:linux     # AppImage + .deb (x64, arm64) and .tar.gz (x64)
pnpm dist:win       # NSIS installer (x64, arm64) + portable .exe (x64)
pnpm dist:mac       # .dmg (must run on macOS)
pnpm dist:desktop   # targets for the current OS
```

Output goes to `apps/desktop/release/`. Targets live in
`apps/desktop/electron-builder.yml`; the icon is `apps/desktop/build/icon.png`
(512×512, converted per platform). Before shipping, replace the placeholder
`maintainer`, `author` and `homepage`.

- **Windows builds on Linux/macOS need [Wine](https://www.winehq.org/)**
  (`sudo apt install wine`). Without it, build on a Windows machine or a
  `windows-latest` CI runner.
- Code signing isn't configured. Unsigned Windows installers trigger a
  SmartScreen warning, and macOS builds need signing + notarization to open
  without a warning.
- Everything in the desktop app is a `devDependency`: Vite bundles the
  renderer, main and preload into `out/`, so electron-builder ships no
  `node_modules`. Only add a runtime `dependency` if the main process needs a
  package that can't be bundled (e.g. a native module).

The renderer runs with `contextIsolation` and `sandbox` on; it can only reach
the main process through the typed API in `src/preload` (contract in
`src/shared/api.ts`).

On some Linux distros, `pnpm dev:desktop` aborts with a `chrome-sandbox`
error. Fix it once with
`sudo chown root:root node_modules/.pnpm/electron@*/node_modules/electron/dist/chrome-sandbox && sudo chmod 4755 …/chrome-sandbox`.

### PWA

The web app manifest is `apps/web/manifest.json`. `vite-plugin-pwa` turns it
into `manifest.webmanifest` at build time and adds the `<link rel="manifest">`
tag, so don't add one to `index.html` yourself.

- **Name, colors, start URL:** edit them in `manifest.json`. Keep `theme_color`
  in sync with `<meta name="theme-color">` in `apps/web/index.html`.
- **Icons:** `apps/web/public/icons/` has 192px and 512px icons, a 512px
  maskable icon (logo inside the center 80% so Android can crop it to any
  shape) and a 180px `apple-touch-icon` for iOS. Replace the PNGs, keeping the
  names and sizes, or regenerate all of them with
  [`@vite-pwa/assets-generator`](https://vite-pwa-org.netlify.app/assets-generator/).
- **Shortcuts:** the long-press / right-click menu of the installed app.
  Shortcut URLs must match routes in `packages/ui/src/router/index.ts`.
- **Screenshots:** add entries to `screenshots` (with `form_factor: "wide"`
  for desktop) for Chrome's richer install dialog.
- **`id`:** identifies the installed app. Don't change it after release, or
  browsers treat the app as a new one.

## Scripts

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `pnpm dev:android`  | Live reload on an Android device/emulator     |
| `pnpm dev:ios`      | Live reload on an iOS device/simulator        |
| `pnpm build`        | Typecheck + build all three apps              |
| `pnpm typecheck`    | `vue-tsc` across every package                |
| `pnpm lint`         | ESLint (flat config, Vue + typescript-eslint) |
| `pnpm lint:fix`     | ESLint with autofix                           |
| `pnpm format`       | Format everything with Prettier               |
| `pnpm format:check` | Check formatting (for CI)                     |

## Renaming

Search-replace `com.example.vuemultiplatform` (Capacitor + electron-builder app
ID), `Vue Multiplatform` (display name), and the `@app/` package scope.
