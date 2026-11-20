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


## 2026-11-21 Multi-element template implementation
- Starting baseline: 18/18 browser QA passed at 35fb0833c9bb5c8ce05053e0e4ba809bebc73077, with Pages deployment success.
- Added Save Page Template action to persist all elements from the current page as one reusable template in existing an-mve-components-v1 storage. Existing single-element entries remain readable and insertable.
- Inserting a template clones all elements with new IDs and an offset, and records one Undo snapshot for the whole insertion.
- Exposed action in mobile Pages > Components contextual sheet. Commits: 8164131b55d107f5e92361ddcde040d674bc2ffa and db6090e5b403b4dd819a9762af3cbbc7fbe7f8d6.
- Added Playwright regression for save/reload/insert/undo of two-element templates at b94d0817d0a8eaf58e386cef00827834b3065432.
- New browser QA and Pages deployment MUST be checked before claiming PASS. Advanced animation timeline, independent responsive breakpoint editor and physical Samsung device QA remain pending.


## 2026-11-21 Animation timeline + custom viewport phase
- Baseline: 19/19 Playwright tests and Pages deployment #81 passed at 7ba94b9df73f2c3f71047c4f17fcd208ea5fdfcd.
- Added selected-element timeline scrub, play, pause controls reusing effect/speed/delay. This is a simple animation preview scrub, NOT a multi-track keyframe timeline. Commit 87b3a893a037f93ddb530d282aac09fd2c6a9e1e; regression commit 984a1b395996f1c2644799fa8f2eb7bc9fdbf2cd.
- Added custom responsive viewport width/height in Screen panel (240–1920 by 320–2160) and persisted custom device option after save/reload/undo. Commits 899285af62234bf991060a580cf66dd359885658 and 8fa4e14990af2e3acd6f3f1f537f555975ffb24f. This is a viewport dimension editor, NOT independent per-breakpoint element overrides.
- Added Playwright viewport persistence regression at 57d5c9d26358c6f6f2cbc3c8d1ad7ea31230fb0a. Check latest GitHub Actions logs for 21/21 PASS before claiming success. Physical Samsung device QA remains blocked.

## 2026-11-21 Custom viewport restore fix
- Browser QA run 44822884714: 20 passed, 1 failed. The failed test was custom responsive viewport persistence after reload; device selector received empty value instead of 412x915.
- Root cause: ensureDeviceOption used a double-escaped digit regex literal and rejected valid custom dimensions. Fixed in index.html commit 48b54b171d1e943929d6f3220adee68d0d3aaa0d. Existing Playwright regression at tests/editor.spec.cjs checks 412x915 after reload.
- Check subsequent Browser QA and Pages deployment before claiming 21/21 PASS. Physical Samsung QA and full keyframe/per-breakpoint overrides remain pending.

## 2026-11-21 Two-point keyframe animation phase
- Baseline: 21/21 browser QA and Pages deployment passed at 4f1ce3b813765df42d0fd220cd92aeb9a768622e.
- Added optional per-element two-point opacity/translateY keyframes, edited in the existing Animation sheet, with Web Animations API playback and timeline scrub/pause/play integration. New values are stored on the element in the existing an-mve-v1 document; undo captures applying/removing keyframes. Code commit e652549aae143c6075562e12951a9cf8d4361e92.
- Added Playwright regression for animation, save/reload and clearing at b40325dd64817b6e93fff21eee72e12e69621a20.
- This is a two-point animation preview, not a complete multi-track keyframe editor. Independent per-breakpoint element position/style overrides and exported HTML keyframe parity are NOT implemented. Verify the newest QA and Pages deployment before claiming PASS; physical Samsung QA is blocked.

## 2026-11-21 Export keyframes and saved breakpoint layouts
- Baseline: 22/22 Playwright browser QA and Pages deployment passed for commit 07aed78821f1b504744e946ec69101f4cda6534a.
- Added CSS @keyframes generation for exported HTML text and button elements using their existing two-point keyframes; sanitized opacity and vertical translation numeric ranges, with reduced-motion override. Commits accfb70ec46346953756ae2f8b6573130a6eb613, f6cd8212c09546d4ae87e89c23e60a20ee6c5726.
- Added explicit Save This Breakpoint Layout action and a breakpointLayouts map keyed by device dimension, persisted inside existing an-mve-v1 JSON and undo snapshots. When switching to a saved device layout, restore its element snapshots; otherwise preserve legacy proportional scaling. Commit 3d52272fd3cc9937b8a61bd774eba158139117e4.
- Added export CSS and breakpoint save/reload Playwright regressions in commit 4635e8c52d66737f3d2b2151ed39c2a9906018a2. Check newest CI logs and Pages deployment before claiming 24/24 PASS.
- LIMITATIONS: breakpoint layouts are explicit snapshots, not automatic per-property responsive rules. Switching devices without saving may still scale current layout. Keyframe export parity for complex effects, all devices, and physical Samsung QA remain unverified.

## 2026-11-21 Deep regression: breakpoint Undo fix
- Browser QA run 44824519359 failed: 25/26 passed. Breakpoint switch 390x640 to 768x1024 then Undo retained 768x1024 in device dropdown. Exported standalone keyframe playback test passed.
- Root cause: snapshot() read the already-changed device select value during onchange, rather than the previous canvas W/H dimensions. Fixed snapshot device capture to W+'x'+H in commit 6a81556b6ca59256e1fdbf2fceeac104eacb440d.
- Strengthened regression to compare original element position after Undo, not a self-referential computed CSS assertion; test commit 9bffb21da4e409a04fd5bf24f7f1df42f18e6afa.
- Latest CI and Pages deployment must be checked before claiming 26/26 PASS. Physical Samsung QA remains blocked.

## 2026-11-21 Mobile deep QA and Node.js runtime warning
- Baseline: 26/26 Playwright browser QA and Pages deployment successful at 15cbf1e7cf5ef679cb34a99a9dedb3fa1c088214.
- Inspected .github/workflows/browser-qa.yml: Node.js application environment was already 22, but actions/checkout@v4 and actions/setup-node@v4 used Node.js 20 action runtime. Upgraded both actions to v5 (Node.js 24 runtime) while retaining node-version: 22. Commit d8449df30cf2d70e6ee499c5667743bb2c5d4853. Confirm warning resolution from new GitHub Actions logs before claiming fixed.
- Added two simulated touch/mobile Playwright regressions for Samsung S23 Ultra (384x824) and A07 (360x800): keyboard text entry, contextual sheet navigation, save/reload persistence, dock geometry, and horizontal overflow. Commit d80d09909caea94795e4bd89a7df8ade6cebd1ac.
- Expect 28 total browser tests, pending CI verification. Physical Samsung device testing, actual Android soft-keyboard behavior, and cross-browser QA are NOT verified. Preserve an-mve-v1 and an-mve-components-v1 storage and black/orange/white theme.
