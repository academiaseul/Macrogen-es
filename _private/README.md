# _private/ — internal work files

Nothing in this folder deploys to macrogen-es.com (`.vercelignore` excludes `_private/`).

**The one rule:** every internal file (reports, drafts, plans, exports, previews)
lives under `_private/` — never in the repo root. Anything committed outside this
folder is publicly served at its literal URL by Vercel.

## Layout

- `_private/` — internal docs and assets, tracked in git (versioned, but never deployed):
  changelogs, guides, system design, signature assets, one-pagers, old prototypes (`archive/`).
- `_private/local-only/` — **not in git at all** (`.gitignore`): client financial data,
  lead exports, quotes, emails naming real people. Exists only on this machine —
  **back these files up somewhere safe (they are no longer in GitHub)**:
  - `local-only/reports/` (incl. Unpaid_Clients_June2026_Merged.xlsx, Formspree export, tender docs, Ads plans)
  - `local-only/Cotizacion_Sample_NGS_Macrogen.xlsx`, `Email_Performance_Q1_2026.xlsx`
  - `local-only/Academia-Seul_Email_*.md`

## Why this exists (2026-08-23)

Internal files in the repo root — including a spreadsheet with ~1,554 clients'
unpaid-invoice data — were publicly downloadable from the live site, because the
repo auto-deploys and `.vercelignore` didn't cover them. Files moved here on
2026-08-23. Note: they remain in old git commits until history is purged, and the
GitHub repo was public at that date — repo visibility should be Private.

Legacy internal folders `emails/`, `outputs/`, `reports_EN/` stayed at the repo
root (old references point there) and are equally excluded from deploys.
