# AI_HANDOFF.md — AN Master Visual Editor
Updated: 2026-11-21. Read this document and inspect the current GitHub main branch BEFORE making any changes.

## User's immediate instruction
The user wants actual GitHub website changes, NOT generated pictures. The supplied Android screenshot showed a giant, crowded Image Editing bottom sheet, black navigation, and limited canvas visibility. Requested: vivid deep-orange fixed top AND bottom navigation, black contrasting buttons, Canva/Microsoft Word-style categorized editing controls with every option discoverable, large canvas, and no damage to existing data/features. The user is moving to a NEW CHAT and expects the assistant to continue independently using this file.

## Repository and deployment
- GitHub: https://github.com/mehedialimayon-del/an-master-visual-editor
- Live GitHub Pages: https://mehedialimayon-del.github.io/an-master-visual-editor/
- Branch: main. Primary source: index.html (single-file HTML/CSS/JS).
- README.md includes the 10-stage roadmap. Browser QA workflow: .github/workflows/browser-qa.yml; tests: tests/editor.spec.cjs.
- Latest UI fix at writing: 42ea815b392773f3292ca50d1d86935864783ce5 (CANVAS v3). Always FETCH main to get latest SHA, never assume it stays unchanged.
- The app is NOT confirmed to use Supabase; do not invent a schema or modify any database without evidence.

## Current UI / architecture
- Header includes Undo, Redo, Save, Preview and mobile menu; mobile-dock has Text, Image, Button, Screen, Page.
- Mobile Canvas-First CSS, contextual .tools bottom sheet and sheet-tabs categories were added.
- Latest CSS makes header and dock deep orange (#ed5b00), buttons black with white text; editor sheet has Content/Style/Animation/Layout category tabs. Existing controls are filtered into groups, not deleted.
- JavaScript uses panelFields, openPanel(), buildSheetActions(), setupSheetTabs(), showSheetTab(), closePanel().
- On mobile, selecting an element opens its contextual panel. Screen/Page controls can be mirrored from hidden desktop header.
- Existing localStorage key MUST remain 'an-mve-v1'; reusable components use 'an-mve-components-v1'. Preserve user data.
- Existing features include text/image/button/scrollbox, multiple pages, page rename/duplicate/delete, themes, device presets, word-specific styling/typing, effects, save/reload, HTML export, undo/redo and components.
- Existing exported site is generated via $('export').onclick. Check whether every page, animation, link and style actually survives export.
- Avoid creating images or replacing website with a mockup.

## Screenshot-driven UI acceptance
1. On Android mobile: top bar orange and compact; bottom dock orange with black buttons.
2. Canvas uses most available screen height; bottom editing sheet starts compact (around 48dvh) and shows only relevant category controls.
3. Image panel categories Image / Effects / Layout. Text panel Content / Typography / Animation / Layout. Button panel Content / Style / Animation / Layout. Screen and Page have their own categories.
4. Every existing editor control must remain discoverable. Upload/Replace Image and page actions must work in bottom sheet.
5. Editing sheet must be scrollable without scrolling the entire screen; close via Done; selected element must remain visible.
6. No layout overflow on Samsung S23 Ultra or Samsung A07. Keyboard must not hide essential controls.
7. Verify drag, resize, save/reload, undo/redo, all toolbar and panel actions, image upload, scrollbox, page switching, HTML export and animations.

## Critical QA / known limitations
- Only JavaScript syntax checks have been verified in recent sessions. GitHub Actions browser tests were added but their passing run has NOT been confirmed. Do not report Browser or Android QA PASS without actual evidence.
- No real Android device QA was performed by the assistant. User screenshots are the strongest evidence of actual Android UI behavior.
- Responsive breakpoint overrides, full animation timeline, reusable multi-element templates, comprehensive undo history and export QA remain incomplete.
- Potential bug: the contextual tab filter and dynamic sheetActions may hide needed controls or show a mismatched action tab; verify all categories in a browser and fix.
- The original layout has conflicting CSS declarations; check computed styles and mobile viewport rather than assuming the last rule is sufficient.
- The exported HTML page navigation and saved state must be tested.
- Playwright tests in tests/editor.spec.cjs may need corrections. CI workflow is in .github/workflows/browser-qa.yml; inspect actual run status and logs.
- GitHub Pages deployment/cache can lag commits; use unique query strings and verify the deployed HTML before claiming live success.
- No APK is requested; Android QA means Android browser/WebView rendering and interactions, not building a new APK.

## 10-stage roadmap
1. Visual Editor Foundation
2. Advanced Design & Style Engine
3. Animation & Interaction Studio
4. Responsive Layout Builder
5. Website Pages & Components
6. Media & Asset Manager
7. AI Website Design Assistant
8. Database, Forms & Integrations (only with user authorization)
9. Publishing, SEO & Export
10. Professional QA & Release

User wants Steps 1–5 done together, with real verified code commits, before proceeding. Do not claim them complete until tests pass. Keep theme premium black, deep orange, pure white.

## Next-chat operating instructions
1. Read this AI_HANDOFF.md, README.md and latest index.html from GitHub main, inspect tests/workflows and current commit.
2. Diagnose current mobile UI against the screenshot and inspect every contextual tab.
3. Fix actual bugs and incomplete responsive interactions, preserving all current functions and localStorage.
4. Run syntax plus browser automated tests, inspect GitHub Actions logs; perform Android QA only if a real Android browser/device is available, otherwise clearly mark blocked.
5. Commit verified changes and give commit SHA, tested flows, failed/blocked items, and live link. Do not claim all PASS from syntax alone.
6. Do not ask user to restate this history or create images.

## 2026-11-21 follow-up: user reports changes not appearing
- Latest screenshot/user feedback: no visible change despite previous commits. New mobile CSS FINAL OVERRIDE was committed to index.html at 42ea815b392773f3292ca50d1d86935864783ce5. It targets viewport <=900px and forces orange header and bottom dock, black buttons, canvas-first layout and contextual sheet visibility. UI version label changed to CANVAS v3.
- **DO NOT claim live deployment is verified.** Next chat MUST inspect GitHub Pages deployment/served HTML and run real browser QA. A commit alone does not prove live rendering. Check CSS specificity, mobile computed styles, browser cache, and Pages workflow. If CANVAS v3 is not visible, investigate deployment before additional redesign.
- User explicitly wants changes in GitHub, not images, and a new-chat prompt to resume without reexplaining.


## 2026-11-21 QA continuation — property edit history
- Confirmed Browser QA #35, commit 8b11b60d139b6beea597454295b861912541ed1b: 16/16 Playwright tests passed; GitHub Pages deployment succeeded.
- Found an existing limitation: editing many element properties did not push pre-edit snapshots to undo history.
- Added capture-phase input/change history recording in index.html for selected element property controls, preserving existing localStorage keys, styling and feature handlers. Commit 7e39fbfe0912a82e16ef66fafd235edfe350c567.
- Added Playwright color property undo/redo regression; commit 66618417fdbeedca3a39b061e24ab893b64b406a.
- IMPORTANT: check the newest GitHub Actions Browser QA run and logs before declaring 17/17 PASS. Real Samsung touch/keyboard testing, comprehensive breakpoint-specific overrides and full animation timeline remain pending.
