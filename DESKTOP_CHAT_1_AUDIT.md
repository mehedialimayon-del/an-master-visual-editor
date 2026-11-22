# AN Visual Editor — Five-Chat Desktop Implementation Audit (Chat 1/5)
Date: 2026-11-22
Reference: user's final desktop screenshot in conversation. Screenshot is visual target, not proof of implemented behavior.
Baseline main SHA inspected: 057adfe0abbea4c5f1818eae7bb1095dc542af22

## Confirmed
- Repo: mehedialimayon-del/an-master-visual-editor; default branch main.
- Single-file HTML/CSS/JS editor in index.html (~177 KB); manifest.webmanifest, demo-site, assets.
- Existing AI_HANDOFF.md and README.md; tests/editor.spec.cjs, tests/website-manager.spec.cjs, tests/source-syntax.cjs.
- GitHub Actions Website Manager Browser QA run 45002995154 was in_progress at audit time. Do not claim PASS until conclusion is checked.
- README says seven built-in website entries are a link registry, NOT live source synchronization; additional entries may exist only in browser localStorage.
- README says Publish is a manual guide and Export downloads standalone HTML; no verified automatic deployment.
- Preserve localStorage keys an-mve-v1 and an-mve-components-v1, plus all other current persisted keys.
- Connected Supabase project 'ai-work-agent' (ref ztedjqdilkealvnjwivd) contains separate an_mve schema: projects and form_submissions; both RLS enabled, both currently report 0 rows. This is not a dedicated Supabase project.
- an_mve.projects: id, owner_id, title, document, created_at, updated_at; owner_id references auth.users.
- an_mve.form_submissions: id, owner_id, project_id, form_id, payload, created_at; project_id references projects. Four migrations listed: 20261120235126, 20261120235140, 20261120235157, 20261120235231.
- No Supabase data or live website files were modified during this audit.

## Current gaps / requirements
1. Pixel-accurate laptop layout from screenshot: compact header, single device toolbar, maximum central canvas, collapsible left/right panels, Edit Mode OFF canvas expansion, no browser horizontal overflow or nested editor scroll traps.
2. Secondary Quick Actions/View Mode/Layers/Effects controls should open on demand rather than occupy permanent canvas space.
3. Actual site integration: verify each of seven registry entries' repository, domain, source access and deployment permissions. Never treat iframe or external URL as automatically editable.
4. Draft Save, Preview and Publish must be distinct. Publishing requires explicit authorization, destination isolation, backend credentials and deployment verification.
5. Preserve mobile layout, all existing editor features and existing data. No visual-only fake actions.
6. Run browser regressions and inspect workflow conclusion before any PASS. Physical device QA is separately pending.

## Five-chat handoff
Chat 1: audit/foundation (this document; implementation not yet completed).
Chat 2: screenshot-driven laptop layout and Edit Mode ON/OFF.
Chat 3: contextual editing, effects, animation, undo/redo.
Chat 4: seven website source adapters and secure save/preview/publish.
Chat 5: complete QA, CI, deployment verification, rollback.

## Next implementation prerequisites
- Read current main index.html, AI_HANDOFF.md, README.md, workflows and tests before modifying UI.
- Inventory actual seven site entries from current source and confirm their repositories independently.
- Capture computed CSS and desktop browser screenshot against reference; do not infer pixel-perfectness from code.
- Update AI_HANDOFF.md after verified implementation and record actual CI run IDs and SHAs.
