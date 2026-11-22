# AN Master Visual Editor

A single-file visual website editor hosted on GitHub Pages.

## Features currently implemented in code
- Text, buttons, images, scroll boxes; drag and resize.
- Mobile, tall mobile, tablet, and laptop device presets.
- Theme presets and multi-page editing, rename, duplicate, delete.
- Text styling, per-word color/bold/glow and rotating typing.
- Element font, bold, border, radius, button background, animation duration/delay.
- Local save/reload, bounded undo/redo for element creation and page operations.
- Image upload optimization, fixed/scroll layout and multi-page HTML export with navigation.

## QA status and release limitations (2026-11-22)
- GitHub main `388462628de56d9ae89eee9842fe00134b76000e`: Visual Editor Browser QA **45/45 passed**, Website Manager Browser QA **42/42 passed** (on the preceding UI commit), GitHub Pages deployment passed and Android APK ZIP build passed.
- Subsequent final-release test commit `3be6ec7dae396e575cbadf8ec3408ccc40cc3ef5` adds seven-website registry isolation and publishing-guide regression coverage. Refer to its GitHub Actions for the final result; never infer a PASS from the test source alone.
- The seven built-in website entries are a registry of links. The editor does **not** synchronize or modify those external repositories. Additional website records and editor documents are saved in separate browser localStorage keys; those browser-specific records cannot be audited from GitHub alone.
- Cloud editor project functions use the separate `an_mve` Supabase schema and authenticated user ownership checks. The browser uses a publishable key, not a service-role key.
- **Publish is a manual guide**, not automatic deployment to a selected website. Export downloads standalone HTML; users must deploy it to the destination repository themselves.
- Playwright mobile viewport and pointer simulations are not physical Samsung S23 Ultra or Android WebView functional certification. APK build success verifies compilation and archive integrity, not installed-device interactions.
- Undo/redo and responsive behavior are covered by automated regression tests, but device-specific visual acceptance and production cloud account end-to-end tests require real devices and credentials.

## Planned stages
1. Visual Editor Foundation
2. Advanced Design & Style Engine
3. Animation & Interaction Studio
4. Responsive Layout Builder
5. Website Pages & Components
6. Media & Asset Manager
7. AI Website Design Assistant
8. Database, Forms & Integrations
9. Publishing, SEO & Export
10. Professional QA & Release

Preserve existing localStorage key `an-mve-v1` and backward compatibility.
