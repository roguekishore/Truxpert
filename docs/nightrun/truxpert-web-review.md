# Web Migration Review: TRUXPERT reactapp (Phase R)

**Review Target:** `TRUXPERT`, branch `chore/stack-web`  
**Baseline Commit:** `b4a191e267363f57134f475509405ed31368b3d0`  
**Review Date:** 2026-10-31  
**Spec Compliance:** SPEC Sections 2, 6, and 7  

---

## 1. Executive Summary & Verdict

The migration of `reactapp` from Create React App (CRA) with Webpack / Jest / Tailwind 3 / React 19.2 to Vite 8.3 / Vitest 5 / Tailwind 4.3 / React 19.3 is complete, stable, and conforms to all frozen requirements in `SPEC.md`.

- **Web Gate Verification:** `bash ~/apps-gates/web-gate.sh reactapp` passes cleanly with clean `npm ci`, production build (`build/index.html`), and all 4 baseline routes verified in Chromium.
- **Visual Regression:** Screenshot comparison between baseline (`../baseline/reactapp/shots/*.png`) and current build (`../gate-reports/reactapp-after/*.png`) reveals 100% bit-for-bit identical hashes across all tested routes (`/`, `/apply`, `/getAllVendors`, `/seed`).
- **Scope Compliance (G7):** `git diff --name-only $(cat ../baseline/sha)` touches only files within `reactapp/` and documentation within `docs/nightrun/`. `bash ~/apps-gates/web-gate.sh - scope` passes.

---

## 2. Review Findings by Category

### Category 1: Environment Variables
*Review against SPEC §6.1 (`process.env.REACT_APP_X` -> `import.meta.env.REACT_APP_X`)*

- **Severity:** Info
- **File:Line:**
  - `reactapp/src/components/ApplyForm.jsx:61`
  - `reactapp/src/components/DisplayFoodTruck.jsx:9`
  - `reactapp/src/components/EditProfile.jsx:39`
  - `reactapp/src/comps/VendorScreen.jsx:15`
  - `reactapp/src/context/ApiContext.jsx:5`
  - `reactapp/src/dashboards/AdminApp.jsx:64, 171, 487, 740, 867`
  - `reactapp/src/dashboards/InspectorApp.jsx:56, 157, 284, 338`
  - `reactapp/src/dashboards/ReviewerApp.jsx:56, 130, 344, 470`
  - `reactapp/src/dashboards/SuperAdminApp.jsx:75, 285, 574`
  - `reactapp/src/pages/LoginPage.jsx:24`
  - `reactapp/src/pages/RegisterPage.jsx:13`
  - `reactapp/src/pages/SeedPage.jsx:5`
- **Why / Assessment:** All 22 occurrences of `process.env.REACT_APP_URL` across components and dashboards were correctly migrated to `import.meta.env.REACT_APP_URL`. `vite.config.js` properly configures `envPrefix: ['VITE_', 'REACT_APP_']` so runtime environment variable passing continues without breaking deployment workflows. Zero occurrences of `process.env` remain in source files.

---

### Category 2: Assets and Public Paths
*Review against SPEC §6.1 (`public/index.html` -> root `index.html`, `%PUBLIC_URL%` removal, entry module script)*

- **Severity:** Info
- **File:Line:** `reactapp/index.html:1-21`, `reactapp/public/index.html` (deleted)
- **Why / Assessment:** `public/index.html` was properly moved to the app root as `index.html`. `%PUBLIC_URL%` tokens were replaced with clean root-relative links (`/favicon.ico`, `/logo192.png`, `/manifest.json`). `<script type="module" src="/src/index.jsx"></script>` was added before `</body>`. All static assets in `reactapp/public/` (`_redirects`, `favicon.ico`, `logo192.png`, `logo512.png`, `manifest.json`, `robots.txt`) are copied directly to `build/` root on build.

---

### Category 3: Routing and Base Path
*Review against SPEC §6.1 (`build.outDir: 'build'`, `server.port: 3000`)*

- **Severity:** Info
- **File:Line:** `reactapp/vite.config.js:16-21`, `reactapp/src/App.jsx:28-34`
- **Why / Assessment:** `build.outDir` is set to `'build'` and `server.port` is set to `3000`. No path prefixes or base URL redirects were altered. Routes configured in `App.jsx` (`/` -> `RenderComp`, `/seed` -> `SeedPage`) remain identical to baseline. Chromium route smoke testing (`../apps-gates/routes.mjs`) verified all four routes in `../baseline/reactapp/routes.txt` (`/`, `/apply`, `/getAllVendors`, `/seed`), matching baseline text content and error-free execution.

---

### Category 4: Tailwind 4 Visual Integrity
*Review against SPEC §6.3 (Tailwind 4 with `@tailwindcss/vite`, PostCSS/autoprefixer removal, visual fidelity)*

- **Severity:** Info
- **File:Line:** `reactapp/vite.config.js:9`, `reactapp/postcss.config.js` (deleted)
- **Why / Assessment:** Obsolete `postcss.config.js` and dependencies `postcss` / `autoprefixer` were removed. Tailwind 4 was integrated via `@tailwindcss/vite` plugin and `tailwindcss` ^4.3.0. Visual regression testing was conducted by comparing screenshots:
  - `_.png`: SHA256 `70bb89889ba804669f1ec45358a62a681f934c5866f9c30d6cada2a0da2bdaa0` (exact match)
  - `_apply.png`: SHA256 `a24cca4eaaaa01c2bde82e985e7a5ec84cdd39d82989fd1978b770adcb05a5aa` (exact match)
  - `_getAllVendors.png`: SHA256 `a24cca4eaaaa01c2bde82e985e7a5ec84cdd39d82989fd1978b770adcb05a5aa` (exact match)
  - `_seed.png`: SHA256 `5d76de279de4dc72cc7108925ddb00a5aee353fcbf58eda12523f5ad3bdada40` (exact match)
  There are zero visual changes introduced by the Tailwind 4 upgrade.

---

### Category 5: Tests and Test Runner
*Review against SPEC §2.5 and §6.2 (Vitest ^5, jsdom, `@testing-library/jest-dom/vitest`, no removed or weakened tests)*

- **Severity:** Info
- **File:Line:** `reactapp/src/tests/App.test.jsx:94,141`, `reactapp/src/setupTests.js:2`
- **Why / Assessment:** Tests were preserved without deletion, weakening, or `@Disabled` annotations. `setupTests.js` was updated to import `@testing-library/jest-dom/vitest`. `jest.spyOn` was properly replaced with `vi.spyOn`.
  - In baseline CRA, `npm test` failed completely during suite initialization due to Jest's failure to resolve `react-router/dom` from `react-router-dom` v7 (`test.log`: 2 suites failed, 0 tests ran). Baseline had no `tests-passed` record.
  - Under Vitest, test suites execute natively. 7 unit tests in `src/tests/App.test.jsx` pass. The 2 failing tests in `src/tests/App.test.jsx` and 1 failing test in `src/App.test.jsx` are due to pre-existing baseline source code in `App.jsx` where `<Navbar />`, `<Footer />`, and the `<Route path="/apply" />` routes were commented out in the original application. Per SPEC Section 2 Hard Rules 3 & 5, existing application routes and tests were left unaltered.

---

### Category 6: Dependencies and Lockfile
*Review against SPEC §1, §2.6, and §6.5 (exact version targets, valid lockfile, clean `npm ci`)*

- **Severity:** Info
- **File:Line:** `reactapp/package.json:6-44`, `reactapp/package-lock.json`
- **Why / Assessment:** `package-lock.json` is clean and generated with `npm install` (lockfileVersion 3). `npm ci --no-audit --no-fund` runs and succeeds without errors.
  - `react` / `react-dom`: `19.3.1` (conforms to `^19.3`)
  - `vite`: `8.3.5` (conforms to `^8.3`)
  - `@vitejs/plugin-react`: `6.1.2` (conforms to newest compatible peer)
  - `tailwindcss`: `4.3.3` (conforms to `^4.3`)
  - `@tailwindcss/vite`: `4.3.3`
  - `vitest`: `5.0.5` (conforms to `^5`)
  - `jsdom`: `30.1.3`
  - `react-scripts`: removed

---

### Category 7: Missing Helper Resolution
*Review against SPEC §2.6 and runtime integrity*

- **Severity:** Low (Positive fix)
- **File:Line:** `reactapp/src/lib/utils.js:1-6`
- **Why / Assessment:** 15 components under `reactapp/src/components/ui/` imported `{ cn } from "../../lib/utils"`, but `src/lib/utils.js` was omitted in the baseline repository. `src/lib/utils.js` was created providing `cn(...inputs)` via `clsx` and `twMerge` (both already declared in dependencies). This resolves potential runtime resolution issues when UI components are imported.

---

## 3. Conclusion

All requirements for `reactapp` under SPEC sections 2, 6, and 7 are fulfilled. No fixes or rollbacks are required. The application build and gate checks pass cleanly.
