# macrogen-es.com

Static HTML site for Macrogen Iberoamérica (Madrid: ES + PT; Santiago: CL + PE). No build step, no framework. Deployed by Vercel from GitHub.

## Map
- Root `*.html`, `servicios/`, `recursos/`, `blog/`: public pages. Everything committed outside `_private/` is served at its literal URL.
- `assets/css/main.css`, `assets/js/main.js`, `assets/js/i18n.js`: the shared design system and behaviour.
- `i18n/{es,en,pt,ko}.json`: rewrite every `[data-i18n]` element on EVERY load, Spanish included. Change tagged copy in the JSON too, or it silently reverts.
- `assets/toolkit/` + `recursos/primer-designer.html`: Primer Designer, the live source of truth. Own CSS, main.css NOT loaded (class collisions). Tests live in the sibling sandbox `../macrogen-primer-toolkit` (`node test/run-tests.mjs`).
- `assets/calc-lecturas/` + `recursos/calculadora-de-lecturas.html`: Calculadora de lecturas (Gb ↔ reads between NGS configurations). Loads next to main.css, so every class and id is prefixed `rc-`. It carries its own ES/EN/PT/KO dictionaries in `calc.js`, follows the site language switcher (`i18n:applied`) and is marked `translate="no"`.
- `assets/docs/`: sample-report bundles (≈550 MB, vendored libs and big JSON). Do not read or grep inside them unless the task is about a report. Never bump `?v=` in `assets/docs/**/report.html`.
- `_nav.html`, `_footer.html`: source-of-truth header and footer. The header is identical on every page; edit it by script across all pages plus `_nav.html`, with latin1 byte-preserving I/O (privacidad/terminos look binary to grep).
- `_private/`: internal, vercel-ignored. `_private/local-only/` is also gitignored (campaigns, bots, data). Never put internal files at the repo root.
- `outputs/`, `emails/`, `reports_EN/`: legacy internal folders, vercel-ignored.

## Rules for changes
- Cache busting: when HTML depends on a CSS/JS change, bump `?v=` for that file in every page in the same commit.
- Header nav is at its width budget (9 links since 2026-11-24). The header is wider than the content (`--mc-header-max: 1370px` vs 1200 px). After any nav or label change, sweep widths 1100–1600 px in ES/EN/PT/KO. Region tag hides ≤1429 px, the calculator link shows its short label ("Calc. lecturas", from the link's `data-short`) ≤1309 px and hides ≤1244 px, hamburger ≤1135 px (full label again). Keep those rules as cascading `max-width` queries: `min/max` ranges leave gaps at fractional (zoomed) widths.
- Brand tokens: keep legacy `--mc-*` names defined. Use the `*-ink` tokens (`--mc-teal-ink`, `--mc-green-ink`) for text, never the teal/green fills.
- CI palette (CI Manual 2.0, copy in `_private/local-only/ci-manual.pdf`): navy #001E62 dominates, teal #00BFB2, green #84BD00, red #E0004D (regional designator next to the logo). Keep the user-chosen motion: right-drifting partner marquee, hero typing effect, blue scrollbar.
- New blog posts: centre figures (max 600 px, caption centred) and justify body paragraphs, using the scoped `<style>` block in `blog/como-leer-reporte-ensamblaje-de-novo-microbiano.html`.
- Blog publishing runs from `_private/local-only/blog-queue/publish-next.cjs` (weekly scheduled task). Do not hand-publish queued posts.
- Before publishing any report bundle: check Office docProps, external CSS/JS URLs and download links for real client or staff data.
- Copy must follow the canonical facts in the `site-consistency-oct-2026` memory (entity name, TATs, shipping thresholds, no "24/7").

## Git and deploy
- Vercel production branch is `reestructuracion-seo`, not `main`. Publish = `git fetch`, make sure `origin/reestructuracion-seo` is an ancestor of `main` (merge if not), then fast-forward push both: `git push origin main` and `git push origin main:reestructuracion-seo`. Never force-push from a stale `main`; other sessions publish from worktrees.
- GitHub "success" can mean the Preview build only. Verify on https://www.macrogen-es.com.
- The user sometimes switches branches in GitHub Desktop while Claude runs git: check `git branch --show-current` in the same command as any commit.
- Commit only when asked. Commit messages are in Spanish.

## Local tooling
- Preview: `.claude/launch.json` → `macrogen-static` (`npx serve` on 8123, clean URLs). If 8123 is taken, read the real port from the server logs.
- Git Bash has no GNU `find` on this PC. Use `git ls-files`, Glob/Grep or Python. Never search drive-wide (`C:\Users\Chingu`, `D:\`): it trips the antivirus.
- In heredocs and the Write tool, `\uXXXX` stays literal. Use real characters or `chr()`.
- Keep email or client text out of command lines; pass file paths.
