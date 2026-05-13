# Macrogen Iberoamérica · Website System Design

> **Audience:** internal teammates (technical and non-technical) who need to understand how `macrogen-es.com` is built, deployed, and maintained.
> **Owner:** VP Marketing, IT & Sales — Macrogen Chile
> **Last updated:** May 2026
> **Live URL:** https://macrogen-es.com

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [System architecture (high-level)](#2-system-architecture-high-level)
3. [Information architecture (sitemap)](#3-information-architecture-sitemap)
4. [Technology stack & rationale](#4-technology-stack--rationale)
5. [Folder & file structure](#5-folder--file-structure)
6. [Design system](#6-design-system)
7. [Form logic & smart country routing](#7-form-logic--smart-country-routing)
8. [Deployment pipeline (GitHub → Vercel → DNS → Live)](#8-deployment-pipeline)
9. [Day-to-day update workflow](#9-day-to-day-update-workflow)
10. [Hosting, domain & monthly costs](#10-hosting-domain--monthly-costs)
11. [Future roadmap & known limitations](#11-future-roadmap--known-limitations)
12. [Glossary](#12-glossary)

---

## 1. Executive summary

### What this is

`macrogen-es.com` is the public-facing website for **Macrogen Iberoamérica** — the joint operation of two official Macrogen Inc. branches:

- **Macrogen Spain** (Madrid, established 2016) — serves España and Portugal
- **Macrogen Chile** (Santiago, newest branch) — serves Chile and Perú

The site presents the regional unit as one brand under the umbrella of Macrogen Inc. (Seoul HQ) while preserving the local identity of both branches.

### Why we built it the way we did

The architectural goal was **maximum simplicity, maximum control, near-zero recurring cost**:

- **No CMS, no database, no backend** → no security patches, no server bills, no downtime risk
- **Static HTML, CSS, vanilla JS** → editable by anyone with a text editor, deployable anywhere, indestructible
- **Git-based content workflow** → every change is versioned and reviewable; rollback is instant
- **Free-tier hosting on Vercel** → global CDN, automatic HTTPS, ~$0/month forever for our traffic level

### Key numbers

| Metric | Value |
|---|---|
| Total pages | 20 HTML files |
| Service detail pages | 10 |
| Blog posts (placeholders) | 4 |
| Total file count (incl. assets) | ~25 |
| Repo size | <500 KB |
| Page load time | <500 ms (global CDN) |
| Annual cost | ~$15 (domain only) |
| Hosting cost | $0 (free Vercel tier) |

---

## 2. System architecture (high-level)

```
                                    ┌──────────────────────────────────┐
                                    │   👤 Visitor                       │
                                    │   (browser on any device)        │
                                    └──────────────┬───────────────────┘
                                                   │
                                                   │ types macrogen-es.com
                                                   ▼
                                    ┌──────────────────────────────────┐
                                    │   🌐 GoDaddy DNS                  │
                                    │   (we own the domain here)       │
                                    │   A record  @ → 76.76.21.21      │
                                    │   CNAME  www → cname.vercel-dns  │
                                    └──────────────┬───────────────────┘
                                                   │ resolves to
                                                   ▼
                                    ┌──────────────────────────────────┐
                                    │   ☁️  Vercel Edge Network          │
                                    │   (global CDN, 100+ locations)   │
                                    │   Free SSL/HTTPS automatic       │
                                    └──────────────┬───────────────────┘
                                                   │ serves static files from
                                                   ▼
                                    ┌──────────────────────────────────┐
                                    │   📦 GitHub Repo                  │
                                    │   academiaseul/Macrogen-es       │
                                    │   main branch                    │
                                    └──────────────┬───────────────────┘
                                                   │ deploys on every push
                                                   │
                                                   ▼
                                    ┌──────────────────────────────────┐
                                    │   💻 Local Folder (your computer) │
                                    │   Documents/Claude/Projects/     │
                                    │   Macrogen-es/                   │
                                    │   ↑ This is where edits start    │
                                    └──────────────────────────────────┘

                                    Edit locally → push to GitHub →
                                    Vercel auto-deploys in 30 seconds
```

### What's running where

| Component | Where it lives | What it does |
|---|---|---|
| Domain | GoDaddy | `macrogen-es.com` registered to us |
| DNS records | GoDaddy DNS panel | Tells the internet where to find us |
| Source code | GitHub (`academiaseul/Macrogen-es` repo) | Single source of truth for all content |
| Hosting | Vercel (free tier) | Serves the site globally with HTTPS |
| Local development | Your computer | Where edits happen before pushing |
| Email forwarding | Macrogen Inc. corporate (existing) | `info-spain@` and `info-chile@` already work |
| Analytics | (not yet enabled) | Optional: Vercel Analytics free tier |

---

## 3. Information architecture (sitemap)

### Top-level navigation

The header navigation is consistent across every page:

```
[Logo Macrogen | IBEROAMÉRICA chip]
                                       Inicio · Nosotros · Servicios · 🩷PEDIDOS↗ · Blog · Newsletter · Contacto · 🟢COTIZAR
```

- **PEDIDOS** → external link to `https://dna.macrogen.com` (Macrogen's official ordering portal). Pink/magenta to signal "purchase intent".
- **COTIZAR** → internal link to contact form. Green to signal "request a quote".

The two-color CTA system gives visitors an immediate understanding of the two paths: **order directly** vs **request a quote**.

### Full page tree

```
macrogen-es.com/
├── index.html                        Home page (hero, pillars, services preview, blog preview, CTAs)
├── nosotros.html                     About page (history, dual-hub model, regional partners, certifications)
├── servicios.html                    Services overview (catalog of all genomic services)
├── blog.html                         Blog index (4 posts)
├── newsletter.html                   Newsletter signup + past editions
├── contacto.html                     Contact form (with smart country routing) + Order Now
│
├── servicios/                        Service detail pages
│   ├── wgs.html                      Whole Genome Sequencing
│   ├── wes.html                      Whole Exome Sequencing
│   ├── rna-seq.html                  Transcriptome / RNA-Seq
│   ├── single-cell.html              Single Cell Sequencing (10x Genomics)
│   ├── metagenoma.html               Metagenomics (16S, shotgun)
│   ├── epigenoma.html                Epigenome (WGBS, RRBS, ChIP-seq)
│   ├── sanger.html                   Sanger / CES (Capillary Electrophoresis)
│   ├── oligo.html                    Oligonucleotide synthesis
│   ├── microarray.html               Microarrays (Affymetrix, Illumina)
│   └── bioinformatica.html           Bioinformatics solutions 360°
│
├── blog/                             Blog post pages
│   ├── lanzamiento-macrogen-chile.html    Macrogen Chile launch announcement
│   ├── que-es-ngs.html                    Tutorial: what is NGS?
│   ├── microbioma-chile.html              Case study: Chilean salmon microbiome
│   └── cobertura-secuenciacion.html       Bioinformatics: how much coverage do you need?
│
├── assets/
│   ├── css/
│   │   └── main.css                  Single shared stylesheet (~25 KB)
│   ├── js/
│   │   └── main.js                   Single shared JavaScript (mobile nav + form logic)
│   └── img/
│       ├── logo.png                  Corporate Macrogen logo (no country)
│       ├── logo-spain.png            Macrogen SPAIN regional lockup
│       └── logo-chile.png            Macrogen CHILE regional lockup
│
└── docs/
    └── SYSTEM_DESIGN.md              This document
```

### Page templates

We use **2 templates** repeated across files:

1. **Marketing page template** (Home, About, Services, Services detail, Newsletter, Contact)
   - Sticky header → hero section → content sections → CTA banner → footer

2. **Article template** (4 blog posts)
   - Sticky header → article header (breadcrumb, title, meta) → article body → related posts → footer

Both share the same header and footer so brand changes propagate site-wide via simple find-and-replace.

---

## 4. Technology stack & rationale

### Why static HTML + CSS + vanilla JS (not WordPress, Webflow, React, etc.)

| Decision | Rationale |
|---|---|
| **No framework (React, Vue, Svelte)** | Site is content-driven, not interactive app. Frameworks add complexity, build steps, and dependencies for zero functional benefit. |
| **No CMS (WordPress, Contentful)** | No database = no security patches, no $30/month hosting, no plugin breakage. Trade-off: editing requires touching files, not a GUI. |
| **No build tools (Webpack, Vite)** | Source = production. What you write is what ships. Easier debugging, easier onboarding. |
| **No CSS framework (Tailwind, Bootstrap)** | Custom CSS is ~25 KB and gives full design control. Tailwind would 5× that. |
| **Vanilla JS only** | Total JS is <100 lines. No need for jQuery or libraries. |

### Trade-offs we accepted

| Trade-off | Mitigation |
|---|---|
| Editing content requires touching HTML files (no WYSIWYG) | Markdown documentation explains the patterns; changes are usually find-and-replace |
| No native multi-language support (would need duplication) | Currently Spanish-only. If we add EN later, we'll discuss URL strategy (e.g., `/en/`) |
| No database for blog comments, user accounts | We don't need these. If we ever do, we'd add Disqus, Auth0, etc. as embedded widgets |
| Forms require external service to send | Solved with Formspree/Netlify Forms when we go beyond demo |

### Stack summary

```
Frontend    HTML5 (semantic) + CSS3 (custom, no framework) + Vanilla JS (ES6)
Fonts       Google Fonts (Inter family) — loaded from CDN
Icons       Unicode emoji (no icon library — keeps page weight low)
Hosting     Vercel (free tier, global edge CDN)
DNS         GoDaddy
Repository  GitHub (private)
Source ctrl Git (via GitHub Desktop GUI — no terminal needed)
Editor      Any (VS Code recommended for syntax highlighting)
```

---

## 5. Folder & file structure

### Detailed file inventory

| File | Purpose | When to edit |
|---|---|---|
| `index.html` | Home page | Hero copy, stats, services preview, blog preview |
| `nosotros.html` | About page | Company narrative, hub descriptions, certifications |
| `servicios.html` | Services overview | When adding/removing service categories |
| `blog.html` | Blog index | When publishing new posts (add a card) |
| `newsletter.html` | Newsletter signup | When publishing new editions |
| `contacto.html` | Contact form + offices | Office addresses, form fields, social links |
| `servicios/*.html` (×10) | Service detail pages | Specs, deliverables, sample requirements per service |
| `blog/*.html` (×4) | Blog post articles | Replace lorem ipsum with real content |
| `assets/css/main.css` | All styling | Brand colors, typography, components |
| `assets/js/main.js` | All interactivity | Mobile nav, form logic, country selector |
| `assets/img/logo.png` | Corporate logo (no country) | Used in header & footer of every page |
| `assets/img/logo-spain.png` | SPAIN regional lockup | About page partners section |
| `assets/img/logo-chile.png` | CHILE regional lockup | About page partners section |

### Why the file naming convention

- All filenames are **lowercase** with **hyphens** (no spaces, no underscores) — URL-friendly across all systems
- HTML files are at the level where the URL would be (e.g., `servicios.html` lives at root because URL is `/servicios.html`)
- Subfolder structure mirrors URL structure (e.g., `/servicios/wgs.html` → `macrogen-es.com/servicios/wgs.html`)

---

## 6. Design system

### Brand colors

Defined as CSS custom properties in `assets/css/main.css` — change once, update everywhere.

| Variable | Hex | Use |
|---|---|---|
| `--mc-navy` | `#001E62` | Primary brand blue (logo wordmark, headers, dark sections) |
| `--mc-teal` | `#00BFB2` | Accent science (eyebrows, hover states, links) |
| `--mc-green` | `#84BD00` | Quotation/contact CTAs (cotizar, enviar solicitud, WhatsApp) |
| `--mc-red` | `#E0004D` | **Order Now / Pedidos CTAs** (intentionally distinct from green) |
| `--mc-ink` | `#0F1B2D` | Body text |
| `--mc-mute` | `#5a6d80` | Secondary text |
| `--mc-bg` | `#f4f7f9` | Light section background |
| `--mc-line` | `#e5ebf1` | Borders |

### Color rule: green vs pink CTAs

We deliberately split CTAs into two color families:

- 🟢 **GREEN** = "Get a quote / talk to us"
- 🩷 **PINK** = "Order directly (skip the quote)"

This visual split helps visitors decide which path matches their intent without reading. Apply consistently — never use green for "Order Now" or pink for "Cotizar".

### Typography

- **Font family:** Inter (Google Fonts) — modern, scientific, excellent at small sizes
- **Weights used:** 300, 400, 500, 600, 700, 800, 900
- **Type scale (responsive):**
  - H1: `clamp(2.2rem, 4.5vw, 3.4rem)` — auto-scales based on screen width
  - H2: `clamp(1.6rem, 2.8vw, 2.2rem)`
  - H3: `1.3rem`
  - Body: `16px` line-height 1.6

### Component library (in `main.css`)

| Component | CSS class | What it does |
|---|---|---|
| Button (primary green) | `.btn .btn-primary` | Main CTA, used for cotizar/enviar |
| Button (Order Now pink) | `.btn .btn-order` | Order Now / dna.macrogen.com link |
| Button (navy fill) | `.btn .btn-navy` | Secondary action |
| Button (ghost outline) | `.btn .btn-ghost` | Tertiary action |
| Service card | `.service-card` | The cards in services overview |
| Pillar card | `.pillar-card` | Three-column value-prop blocks |
| Stat card | `.stat-card` | Animated number counters |
| Note bar | `.note-bar` | Horizontal info strip (e.g., facturación) |
| Spec table | `.spec-table` | Two-column technical specs |
| Pipeline step | `.pipeline-step` | Numbered workflow steps |
| Post card | `.post-card` | Blog post preview cards |
| CTA banner | `.cta-banner` | Full-width call-to-action sections |
| Form fields | `.field` | Label + input wrapper |
| Region tag | `.region-tag` | The "IBEROAMÉRICA" chip next to logo |

### Responsive breakpoints

```
≥920px    Desktop (full nav, two-col layouts, side-by-side IBEROAMÉRICA chip)
600-920px Tablet (stacked some grids, smaller chip)
380-600px Phone (hamburger nav, single column, smaller logo)
<380px    Tiny phone (max compression, hide subtitle)
```

---

## 7. Form logic & smart country routing

### The flow

```
1. Visitor lands on contacto.html
2. Sees a form. First field is a required country dropdown.
3. They select their country (🇪🇸 ES / 🇵🇹 PT / 🇨🇱 CL / 🇵🇪 PE / 🌎 Otro)
4. JavaScript runs and updates 3 things in real time:
   a. Email field placeholder → country-specific TLD (e.g., tu@laboratorio.cl)
   b. Phone field placeholder → country-specific code (e.g., +56 9 ...)
   c. Visible info box → shows which inbox will receive the request
5. Visitor fills the form, hits "Enviar Solicitud"
6. (Currently demo) Friendly thank-you message appears.
   (Future, with Formspree) Email is sent to info-spain@ or info-chile@ based on country.
```

### Routing matrix

| Country selected | Hub assigned | Email destination |
|---|---|---|
| 🇪🇸 España | Madrid | `info-spain@macrogen.com` |
| 🇵🇹 Portugal | Madrid | `info-spain@macrogen.com` |
| 🇨🇱 Chile | Santiago | `info-chile@macrogen.com` |
| 🇵🇪 Perú | Santiago | `info-chile@macrogen.com` |
| 🌎 Otro país | Madrid (default) | `info-spain@macrogen.com` |

### Why this matters

Visitors immediately see **where their request goes** before they hit submit. This:
- Builds trust (transparency)
- Sets expectations (they know who will reply)
- Reduces support load (no "did you receive my message?" follow-ups)

### Where the code lives

All routing logic is in **`assets/js/main.js`** in the `countryConfig` object. To add a new country:

```javascript
// Add a new entry to countryConfig:
'AR': {
  flag: '🇦🇷', label: 'Argentina',
  email: 'tu@laboratorio.com.ar',
  phone: '+54 9 ...',
  inbox: 'info-chile@macrogen.com',  // route to Santiago hub
  hub: 'Santiago'
}

// Then add the option to contacto.html:
<option value="AR">🇦🇷 Argentina</option>
```

### Form delivery (current state vs production state)

**Current state (demo):**
- Form has `data-demo` attribute
- On submit, JavaScript shows "thanks" message but doesn't send anywhere
- Good for previewing UX, not for capturing real leads

**Production state (next step):**
- Sign up at https://formspree.io (free up to 50 submissions/month)
- Get a unique form endpoint URL like `https://formspree.io/f/abc123xyz`
- Replace `<form data-demo data-country-form>` with `<form action="https://formspree.io/f/abc123xyz" method="POST" data-country-form>`
- Remove the `data-demo` attribute (so the JS doesn't intercept)
- Add a hidden field that includes the country so Formspree can route:
  ```html
  <input type="hidden" name="_replyto" value="">  <!-- Formspree captures this -->
  <input type="hidden" name="_subject" value="Nueva solicitud Macrogen Iberoamérica">
  <input type="hidden" name="_cc" value="info-spain@macrogen.com,info-chile@macrogen.com">
  ```
- Or use Formspree's "routing" feature based on the country dropdown value

---

## 8. Deployment pipeline

### The full chain (Edit → Live, ~1 minute)

```
Step 1: Edit on your computer
        ↓
        Open any .html or .css file in a text editor
        Make changes, save the file
        ↓
Step 2: Commit & push via GitHub Desktop
        ↓
        Open GitHub Desktop app
        See your changes listed in the left panel
        Type a commit message (e.g., "Updated home page hero")
        Click "Commit to main"
        Click "Push origin"
        (~5 seconds)
        ↓
Step 3: Vercel auto-deploys
        ↓
        Vercel sees the GitHub push within 5 seconds
        Builds the site (no actual build needed for static HTML — instant)
        Deploys to all CDN edge locations globally
        (~30 seconds total)
        ↓
Step 4: Live for visitors
        ↓
        macrogen-es.com now serves the new version
        Old version is preserved as an instant rollback option in Vercel dashboard
```

### Branching strategy

Currently using **single `main` branch** — every change goes live immediately. This is fine because:

- Site is content-only (no risky code)
- Rollbacks in Vercel are 1-click (instant revert to previous deployment)
- Preview deployments are auto-generated for every commit anyway

**If we ever want a staging/preview workflow:**

1. Create a `preview` branch on GitHub
2. Make changes there first
3. Vercel auto-deploys it to a preview URL like `macrogen-es-git-preview-academiaseul.vercel.app`
4. Review there
5. Merge `preview` → `main` to push to production

### Rollback procedure

If a change breaks something:

1. Go to https://vercel.com/dashboard → click `macrogen-es` project
2. Click "Deployments" tab
3. Find the last working deployment (status: "Ready")
4. Click the "⋯" menu → "Promote to Production"
5. Live within seconds

No need to revert in Git unless you want to permanently undo.

---

## 9. Day-to-day update workflow

### Common tasks

#### Update existing copy (text changes)

1. Open File Explorer → `Documents/Claude/Projects/Macrogen-es/`
2. Open the relevant `.html` file in a text editor (Notepad, VS Code, Sublime Text)
3. Use Find (Ctrl+F) to locate the text you want to change
4. Edit the text — keep HTML tags `<like-this>` intact, only change the text between them
5. Save the file (Ctrl+S)
6. Open GitHub Desktop → commit + push

#### Add a new blog post

1. Copy an existing blog file (e.g., `blog/que-es-ngs.html`) and rename to `blog/your-new-post.html`
2. Update the title, meta description, header content (h1, meta info)
3. Replace the article body content
4. Open `blog.html` and add a new card in the grid pointing to your new post
5. Commit + push

#### Update brand colors site-wide

1. Open `assets/css/main.css`
2. Find the `:root` block at the top (lines 13-30)
3. Change the hex values (e.g., `--mc-navy: #001E62;` → `--mc-navy: #002073;`)
4. Save → commit + push
5. Every page updates automatically

#### Add a new service page

1. Copy `servicios/wgs.html` and rename
2. Update content
3. Add a card to `servicios.html` linking to the new page
4. Add a footer link in `index.html` if you want it featured
5. Commit + push

#### Replace a logo

1. Save the new logo file as `logo.png` in `assets/img/` (overwriting the existing one)
2. Commit + push (the file change triggers redeploy)

### What NEVER to touch

- `.git/` folder (hidden, GitHub Desktop manages it)
- `node_modules/` if it ever appears (also hidden)
- The `<head>` section of HTML files (unless you know what `<meta>`, `<link>`, etc. mean)
- The `<script>` and `<style>` tags

### Editor recommendations

- **Easy:** Notepad (Windows built-in) — just works
- **Better:** [VS Code](https://code.visualstudio.com) — free, syntax highlighting, find-across-files
- **Live preview:** VS Code + "Live Server" extension — shows changes in browser as you save

---

## 10. Hosting, domain & monthly costs

### Current monthly cost: ~$1.50 amortized ($15-25/year)

| Service | Cost | What we get |
|---|---|---|
| **GoDaddy** (domain) | $15-25/year | `macrogen-es.com` ownership |
| **Vercel** (hosting) | $0 forever | Global CDN, HTTPS, auto-deploy, ~unlimited bandwidth for our scale |
| **GitHub** (repo) | $0 forever | Source control, version history (private repo on free tier) |
| **Email forwarding** (existing) | $0 | `info-spain@` and `info-chile@` already work via Macrogen Inc. corporate |

### When we'd start paying more

| Trigger | New service | Cost |
|---|---|---|
| Form submissions exceed 50/month | Formspree paid tier | $10/month |
| Want detailed visitor analytics | Vercel Analytics Pro | $10/month (or use free Plausible/Google Analytics) |
| Need custom email like `hello@macrogen-es.com` | Google Workspace or Microsoft 365 | $6-7/user/month |
| Site traffic exceeds 100 GB/month bandwidth | Vercel Pro | $20/month |

### Realistic 12-month budget

For a regional B2B site at the early-stage launch level:

```
Domain renewal             $20
Form service (Formspree)   $0  (under 50 submissions/month)
Email forwarding           $0  (existing)
Analytics                  $0  (Vercel free tier)
Hosting                    $0  (Vercel free tier)
─────────────────────────────────
TOTAL YEAR 1               $20
```

If we cross 50 form submissions/month or want analytics: ~$10-20/month additional.

---

## 11. Future roadmap & known limitations

### Known limitations (deliberate trade-offs)

| Limitation | Why we accepted it | When to revisit |
|---|---|---|
| Form is demo-only (doesn't send) | Wanted to ship the visual UX first; capturing leads requires Formspree or similar | When you have real visitor traffic and want leads in inbox |
| No multi-language (Spanish only) | Audience speaks Spanish; English would mean duplicating 20 pages | If we open ads to English-speaking institutions |
| Blog posts have lorem ipsum bodies | Wanted the structure first, real content can be filled later | Replace before announcing publicly to scientific community |
| No cookie consent banner | Currently no cookies set; analytics not active | Add when we enable Google Analytics or any tracking |
| No newsletter sending capability | Just signup form for now | Add Mailchimp / Buttondown integration when ready to send |

### Roadmap (suggested priority order)

**Priority 1 — Make the form functional**
- Wire to Formspree (~5 minutes setup, unlocks real lead capture)
- Smart routing to info-spain@ or info-chile@ based on country dropdown

**Priority 2 — Real content**
- Replace lorem ipsum in 4 blog posts with real first-draft content
- Add real team bios on About page (or new `/equipo.html` page)
- Add real client logos / testimonials section

**Priority 3 — Reinforce Chile presence**
- Reorder mentions to lead with Chile in joint copy
- Add a dedicated "Anclados en Santiago" section on home
- Position Macrogen Chile as the operational lead in the About narrative

**Priority 4 — SEO & analytics**
- Add Google Analytics or Plausible
- Submit sitemap.xml to Google Search Console
- Add Open Graph images for nice link previews on LinkedIn/WhatsApp
- Add JSON-LD structured data for organization info

**Priority 5 — Internationalization**
- Add English version at `/en/` (only if expanding outside Iberoamérica)
- Add Portuguese version (PT-PT) for Lisbon market

**Priority 6 — Advanced**
- Cookie consent banner (if we add tracking)
- Live chat widget (Intercom, Crisp) routed by country
- Blog post pagination (when we have >12 posts)
- Newsletter integration (Mailchimp signup)

### Things explicitly OUT of scope

- E-commerce checkout (we link to dna.macrogen.com instead — by design)
- User accounts / login (Macrogen has its own portal)
- Real-time order tracking (lives on dna.macrogen.com)
- Sample submission forms (live on dna.macrogen.com)

The site is **pre-purchase marketing only**. Anything transactional should redirect to `dna.macrogen.com`.

---

## 12. Glossary

For non-technical teammates.

| Term | Plain-language meaning |
|---|---|
| **HTML** | The language web pages are written in. `.html` files. |
| **CSS** | The language that makes web pages pretty (colors, fonts, layout). `.css` files. |
| **JavaScript / JS** | The language that adds interactivity (buttons doing things, forms validating). `.js` files. |
| **Repo / Repository** | A folder of code with full history of every change. Stored on GitHub. |
| **Commit** | A saved snapshot of your changes with a descriptive message. |
| **Push** | Uploading your commits from your computer to GitHub. |
| **Branch** | A parallel version of the code. We use one branch (`main`). |
| **Deploy** | Publishing the website so the internet can see the latest version. |
| **CDN** | "Content Delivery Network" — copies of the site stored globally for fast loading. |
| **DNS** | The internet's address book — translates `macrogen-es.com` into a computer's location. |
| **A record** | A type of DNS entry that points a domain to an IP address. |
| **CNAME** | Another type of DNS entry that points a subdomain (like `www`) to another domain. |
| **HTTPS / SSL** | The lock icon in the browser bar — means traffic is encrypted. Free and automatic on Vercel. |
| **Static site** | A website made of pre-written files (no database, no server-side processing). |
| **Vercel** | The company that hosts our site for free. |
| **GitHub** | The company that stores our code with version history. Owned by Microsoft. |
| **GoDaddy** | The company that sold us our domain name. |
| **Form action** | Where a form's submitted data goes. Currently nowhere (demo); will be Formspree. |
| **Favicon** | The small icon in the browser tab. We use the Macrogen logo. |
| **CTA** | "Call to action" — a button that asks the visitor to do something (cotizar, order). |
| **Hero** | The big top section of a page (usually navy with the headline). |
| **Eyebrow** | The small text label above a headline (e.g., "ONE TEAM · ONE MACROGEN"). |
| **Pillar** | A reusable card showing a value proposition (we have 3 on home: velocidad, precisión, conectividad). |
| **Lorem ipsum** | Placeholder Latin text used to mock up layouts before real content is written. |

---

## Quick reference card

**To see the live site:** https://macrogen-es.com
**To see the source code:** https://github.com/academiaseul/Macrogen-es
**To deploy a change:** Edit local file → GitHub Desktop → Commit → Push → wait 30 sec
**To rollback:** Vercel dashboard → Deployments → "Promote to Production" on previous deploy
**To preview without deploying:** Open the `.html` file directly in a browser (works offline)

**Brand colors at a glance:**
- Navy `#001E62` · Teal `#00BFB2` · Green `#84BD00` (Cotizar) · Pink `#E0004D` (Order Now)

**Email routing logic:**
- Spain / Portugal / Other → `info-spain@macrogen.com`
- Chile / Perú → `info-chile@macrogen.com`

**Two-CTA color rule:**
- 🟢 GREEN = "Talk to us / get a quote"
- 🩷 PINK = "Order directly via dna.macrogen.com"

---

*This document is part of the Macrogen Iberoamérica codebase. Update it whenever the architecture changes — keeping it accurate is everyone's job.*
