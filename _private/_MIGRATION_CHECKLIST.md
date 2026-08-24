# Cowork → New Claude Account · Migration Checklist

**Date:** 2026-07-14
**Project:** Macrogen Chile / Iberoamérica
**Workspace folder:** `C:\Users\Chingu\Documents\Claude\Projects\Macrogen-es`

---

## What stays automatically (nothing to do)

Everything in these folders is on your local hard drive — Claude account changes do NOT touch them:

- `C:\Users\Chingu\Documents\Claude\Projects\Macrogen-es\` (main workspace — 40+ HTML pages, emails, signatures, reports, blog posts, sample reports)
- `C:\Users\Chingu\Documents\Claude\Projects\` (parent folder, if you use it)

The git repo, Vercel deploys, and GitHub connection are also independent — they live on GitHub/Vercel, not in your Claude account.

---

## What is tied to the OLD account (needs manual re-setup in new account)

1. **This chat conversation history** — will not transfer. Screenshot or export any critical threads before switching.
2. **Project instructions** — the text you set: *"As VP Marketing, IT, and Sales of Macrogen — Follow these instructions when working in this project."*
3. **Installed plugins/skills** — currently installed: `anthropic-skills` bundle (docx, pdf, pptx, xlsx, schedule, skill-creator, setup-cowork). Also `skills-plugin` for base skills.
4. **Connected MCPs** — extensions Claude uses for external services:
   - claude-in-chrome (browser automation)
   - computer-use (desktop control)
   - cowork (file presentation, artifacts)
   - cowork-onboarding
   - mcp-registry (search connectors)
   - plugins (list/install plugins)
   - scheduled-tasks
   - session_info
   - skills
   - visualize
   - workspace (bash + web fetch)
5. **Scheduled tasks** — none currently set up (checked and confirmed).
6. **GA4 / Clarity / Search Console access** — these are Google/Microsoft accounts, independent of Claude. But if you set them up under an email tied to the old Claude account, verify you still have access.

---

## Step-by-step migration

### 1 · Before switching accounts

- Save this file (you're reading it, so ✓)
- Screenshot any chat threads worth keeping (open Cowork → thread history → screenshot key exchanges)
- Confirm your workspace folder is fully synced to disk (git status, or check File Explorer)
- Optional: `git status` inside `Macrogen-es` and `git commit -am "pre-account-switch checkpoint"` + `git push` if you want an extra safety net

### 2 · Sign out of old account

- Open Claude Desktop app
- Bottom-left profile icon → **Sign out**
- Close the app

### 3 · Sign in with new account

- Reopen Claude Desktop
- Sign in with the new email
- Complete any onboarding prompts

### 4 · Reconnect Cowork to the same folder

- In Cowork mode, go to **Settings → Connected folders** (or the folder icon in the sidebar)
- Click **Connect folder** → navigate to `C:\Users\Chingu\Documents\Claude\Projects\Macrogen-es`
- Grant permission when prompted
- All 40+ files will appear immediately — nothing was actually moved, just re-linked

### 5 · Re-add project instructions

- Cowork Settings → Project instructions (or wherever the setting lives in the sidebar)
- Paste back: *"As VP Marketing, IT, and Sales of Macrogen — Follow these instructions when working in this project."*

### 6 · Reinstall plugins/skills

- Settings → Plugins/Skills → search for `anthropic-skills`
- Install the bundle (this gives you docx, pdf, pptx, xlsx skills)
- If you had `setup-cowork` guide skill, it's included in the bundle

### 7 · Reconnect MCPs (if you had any custom ones)

- Settings → Connectors / MCP Servers
- If you had specific ones (Slack, Notion, Google Drive, etc.), re-authenticate them
- The built-in MCPs (Chrome, computer, workspace) auto-load with Cowork

### 8 · Sanity test

Ask Claude something like: *"Can you list the files in `Macrogen-es\emails\campaigns-brevo-safe\`?"*

If it lists the 4 Brevo campaign files (NGS_Explorador_Chile.html + the 3 v1/v2/v3), the folder mount is working and you're good to continue.

---

## What was recently worked on (context for the new account)

If you want to give the new Claude context about where things stand, paste this into the first message:

> **Recent work in this Cowork project (last 14 tasks):**
>
> - Cross-matched 1,554 unpaid overseas clients (June 30 AR) with emails from May file + Chile assignee info → `reports\Unpaid_Clients_June2026_Merged.xlsx` (5 sheets, includes Chile+Peru hub tab with 253 clients)
> - Built Brevo-safe versions of 3 NGS Explorador campaigns (v1_tree, v2_funnel, v3_examples) → `emails\campaigns-brevo-safe\` — SVGs replaced with HTML tables, dual Madrid+Santiago footer cards
> - Adapted NGS Explorador Spain email → Chile version (CI 2.0 navy, HUB LOCAL badge, WhatsApp click-to-chat) → `emails\campaigns-brevo-safe\NGS_Explorador_Chile.html`
> - Designed launch banner "Nueva web. Misma ciencia. · NUEVO10" for Gmail signature → `signature\` (PPTX editable + PNG at 400/600/800/1200px)
> - Instagram carousel + story for NGS Explorador launch → `outputs\instagram-ngs-explorador.html`

---

## Key project facts (for the new Claude to know)

- **Company:** Macrogen Iberoamérica (joint venture Macrogen Spain S.L. + Macrogen Inc. Agencia en Chile)
- **Website:** macrogen-es.com (Vercel, auto-deploy from GitHub)
- **DNS:** GoDaddy Domain Connect
- **Analytics:** GA4 `G-9W3JGVHY2D` + Microsoft Clarity `x8wd9440bz`
- **Logo image:** `assets\img\logo.png` (real Macrogen logo, 1820×690, embed in campaigns via `https://www.macrogen-es.com/assets/img/logo.png`)
- **Hubs:** 🇪🇸 Madrid (Martínez Villergas 52, cubre España+Portugal) · 🇨🇱 Santiago (Magdalena 140 Of.401, cubre Chile+Perú)
- **Emails:** info-spain@macrogen.com · info-chile@macrogen.com
- **WhatsApp Chile:** +56 9 5845 1395
- **CI 2.0 palette:** navy #0A1F4F · red #E0004D · teal #00BFB2 · lime #84BD00
- **Active promo:** NUEVO10 (10% OFF) valid until 2026-08-31
