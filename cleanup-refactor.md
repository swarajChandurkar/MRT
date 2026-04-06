# Project Cleanup & Refactor Plan

## Phase 1: Directory Cleanup
- [ ] Delete legacy backup files (`old_*`).
- [ ] Delete bulk text dumps (`codebase.txt`).
- [ ] Delete unused template files (`src/counter.js`).

## Phase 2: Refactoring Core Logic
- [ ] Review `src/main.js` and remove spaghetti code, unify fetch patterns, and clarify the logic.
- [ ] Review `src/admin.js` to ensure secure API interactions and clean DOM manipulations.
- [ ] Apply modularization if files exceed manageable sizes (e.g., separate API handlers, UI updaters).

## Phase 3: Tooling Setup
- [ ] Install `prettier` as a devDependency in `package.json`.
- [ ] Add formatting scripts to `package.json` (`npm run format`).
- [ ] Run formatter across all HTML, CSS, and JS files.

## Phase 4: Final Validation
- [ ] Verify that `npm run dev` and `npm run build` still function correctly.
- [ ] Run basic sanity tests on the UI to ensure no visual regressions.
