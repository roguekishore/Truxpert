# TRUXPERT Web Migration Handoff Report

**Run:** `truxpert-web`  
**Repository:** `TRUXPERT`  
**Branch:** `chore/stack-web`  
**Baseline Commit:** `b4a191e267363f57134f475509405ed31368b3d0`  
**Report Date:** 2026-10-31  

---

## 1. Migration Phases Completed

According to `../PROGRESS.md`, all migration phases passed successfully:

| Phase | Description | Status | Commit |
|---|---|---|---|
| **W1** | reactapp: CRA to Vite 8, Tailwind 4, React 19.3 | done | `b38a8b4ea5` |
| **R** | Review and fix | done | `730ef80e53` |
| **H** | Handoff report | done | *(this phase)* |

---

## 2. Gate Results

Web gate execution (`bash ~/apps-gates/web-gate.sh reactapp` and `bash ~/apps-gates/web-gate.sh - scope`):

- **Package Installation (`npm ci`):** PASSED. Clean installation using lockfileVersion 3 without warnings or audit issues.
- **Production Build (`npm run build`):** PASSED. Vite v8.3.5 built production bundle in 560ms producing `reactapp/build/index.html` and bundled assets (`build/assets/*`).
- **Route Smoke Testing & Visual Checks (`routes.mjs`):** PASSED.
  - Headless Chromium validated all 4 baseline routes from `../baseline/reactapp/routes.txt`: `/`, `/apply`, `/getAllVendors`, `/seed`.
  - Route error count: 0 across all routes.
  - Visual regression comparison: 100% bit-for-bit identical screenshot hashes between baseline (`../baseline/reactapp/shots/`) and migrated build (`../gate-reports/reactapp-after/`).
- **Scope Check (G7):** PASSED. No files modified outside `reactapp/**` and `docs/nightrun/**`.

---

## 3. Files Changed

Changes relative to baseline (`git diff --stat $(cat ../baseline/sha)`):

```
 docs/nightrun/truxpert-web-review.md               |  114 +
 reactapp/index.html                                |   21 +
 reactapp/package-lock.json                         | 3972 ++++++++++++++++++++
 reactapp/package.json                              |   54 +-
 reactapp/postcss.config.js                         |    0
 reactapp/public/index.html                         |   43 -
 reactapp/src/{App.js => App.jsx}                   |    0
 reactapp/src/{App.test.js => App.test.jsx}         |    0
 reactapp/src/components/ApplyForm.jsx              |    2 +-
 reactapp/src/components/DisplayFoodTruck.jsx       |    2 +-
 reactapp/src/components/EditProfile.jsx            |    2 +-
 reactapp/src/comps/VendorScreen.jsx                |    2 +-
 .../src/context/{ApiContext.js => ApiContext.jsx}  |    2 +-
 reactapp/src/dashboards/AdminApp.jsx               |   10 +-
 reactapp/src/dashboards/InspectorApp.jsx           |    8 +-
 reactapp/src/dashboards/ReviewerApp.jsx            |    8 +-
 reactapp/src/dashboards/SuperAdminApp.jsx          |    6 +-
 reactapp/src/{index.js => index.jsx}               |    0
 reactapp/src/lib/utils.js                          |    6 +
 reactapp/src/pages/LoginPage.jsx                   |    2 +-
 reactapp/src/pages/RegisterPage.jsx                |    2 +-
 reactapp/src/pages/SeedPage.jsx                    |    2 +-
 reactapp/src/setupTests.js                         |    7 +-
 reactapp/src/tests/{App.test.js => App.test.jsx}   |    4 +-
 reactapp/vite.config.js                            |   28 +
 25 files changed, 4189 insertions(+), 108 deletions(-)
```

---

## 4. Dependencies Added or Removed

### Added
- `vite`: `^8.3.0` (installed `8.3.5`) - Build tool and development server replacing CRA/Webpack.
- `@vitejs/plugin-react`: `^6.1.2` (installed `6.1.2`) - React Fast Refresh and JSX transformation.
- `@tailwindcss/vite`: `^4.3.0` (installed `4.3.3`) - Official Tailwind CSS 4 Vite plugin.
- `vitest`: `^5.0.0` (installed `5.0.5`) - Test runner replacing Jest.
- `jsdom`: `^30.1.3` (installed `30.1.3`) - DOM environment for Vitest.

### Upgraded
- `react`: `^19.2.0` -> `^19.3.0` (installed `19.3.1`)
- `react-dom`: `^19.2.0` -> `^19.3.0` (installed `19.3.1`)
- `tailwindcss`: `^3.4.19` -> `^4.3.0` (installed `4.3.3`)

### Relocated to devDependencies
- `@testing-library/dom`: `^10.4.1`
- `@testing-library/jest-dom`: `^6.9.1`
- `@testing-library/react`: `^16.3.0`
- `@testing-library/user-event`: `^13.5.0`

### Removed
- `react-scripts`: `5.0.1` (CRA tooling)
- `postcss`: `^8.5.6` (superseded by `@tailwindcss/vite`)
- `autoprefixer`: `^10.4.23` (built into Tailwind 4 engine)
- CRA configuration sections (`eslintConfig`, `browserslist`) in `package.json`

---

## 5. Environment Variable and Build Output Decisions

- **Environment Variables:**
  - Migrated all 22 references from `process.env.REACT_APP_URL` to `import.meta.env.REACT_APP_URL`.
  - Configured `envPrefix: ['VITE_', 'REACT_APP_']` in `reactapp/vite.config.js`. This preserves backward compatibility with deployment environments injecting `REACT_APP_` variables without requiring hosting configuration updates.
- **Build Output Directory:**
  - Configured `build.outDir: 'build'` in `reactapp/vite.config.js` to ensure the production output matches CRA's `build/` directory rather than Vite's default `dist/`. Existing deployment pipelines, Dockerfiles, and web gate assertions depend on `build/index.html`.
- **Development Server:**
  - Configured `server.port: 3000` in `reactapp/vite.config.js` to keep local development on port 3000.

---

## 6. Left Items (`truxpert-web-left.md`)

- No `docs/nightrun/truxpert-web-left.md` file exists. All tasks and requirements were completed without blocking issues.
- **Note on Unit Tests:** In baseline CRA, `npm test` failed completely during initialisation due to Jest's incompatibility with `react-router-dom` v7 (`react-router/dom` export resolution). Under Vitest, 7 unit tests in `src/tests/App.test.jsx` pass. The remaining 3 test failures reflect pre-existing baseline source code where `<Navbar />`, `<Footer />`, and `<Route path="/apply" />` were commented out in `App.jsx`. In accordance with SPEC Section 2 Hard Rules 3 & 5, existing application routes and tests were left unchanged.

---

## 7. Owner Action Items

Before deploying to production, the repository owner should:
1. **Review Gate Screenshots:** Inspect captured screenshots in `../gate-reports/reactapp-after/` (`_.png`, `_apply.png`, `_getAllVendors.png`, `_seed.png`) to verify visual equivalence with baseline screenshots in `../baseline/reactapp/shots/`.
2. **Review Environment Variables in Hosting:** Verify that hosting providers / CI deployment runners have `REACT_APP_URL` (or `VITE_` prefixed variables) configured. Note that no renaming is necessary due to `envPrefix: ['VITE_', 'REACT_APP_']`.
3. **Merge Branch:** Merge branch `chore/stack-web` into the target main/production branch.
4. **Deploy Application:** Trigger normal CI/CD build (`npm ci && npm run build`), serving the output from the `build/` folder.
