# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-file, self-contained HTML/JS quiz — an **AI Maturity Assessment** built for Columbia Road's *AI in B2B Sales and Marketing* event (Stockholm, September 1 2026). There is no build system, no package manager, no server.

To run: open `ai-maturity-quiz.html` directly in a browser.

## Architecture

Everything lives in `ai-maturity-quiz.html`:

- **CSS** — inline `<style>` block using CSS custom properties. Mobile-first layout capped at 480px, `--navy`/`--forest`/`--burgundy`/`--yellow`/`--cream` colour palette.
- **HTML** — a single `<div class="app">` shell. All content is injected by JS into `<div id="box">`.
- **JS** — one `<script>` block. No frameworks, no imports.

### JS state model

| Variable | Purpose |
|---|---|
| `A` | Global answers object. Keys are question IDs (e.g. `'A1'`, `'P2'`); multi-select stores an array; open text uses `'<id>_open'`; follow-up text uses `'<id>_d'`; rating grid rows use `'<id>_r<rowIndex>'`. |
| `S` | Array of section objects built by `build()`. Rebuilt whenever role changes (question `P1`). |
| `cur` | Current section index (`-1` = gate screen). |
| `GATE_NAME`, `GATE_EMAIL` | Captured from the email gate before the quiz starts. |
| `QUIZ_RESULT` | Flattened snapshot sent to the webhook on results render. |

### Quiz flow

```
Gate (name + email) → S[0] Profile → S[1] Business Snapshot (role-adaptive) → S[2] AI Maturity (scored) → S[3] Opportunities → Results
```

`build()` assembles `S` based on `role()` (derived from `A['P1']`). Navigation via `go(±1)`. The results screen is triggered when `go(1)` is called past the last section.

### Question types

| `m` value | Rendered as |
|---|---|
| `'single'` | Radio list (`.opt` + `.dot`) |
| `'multi'` | Checkbox list with `mx` cap |
| `'rating'` | Grid: rows × columns (`.rg`) |
| `'scale'` | Horizontal 4-segment bar (`.scale-seg`) with optional N/A row |
| `'tooltip'` | Vertical scale list with expandable `i` info bubbles (`.tip-opt`) |
| `'open'` | Freetext `<textarea>` |

Scored questions (Part 3, `scored:true`) drive the maturity calculation in `results()`.

### Scoring

`results()` computes `tot` and `mx` from Part 3 questions only. Tooltip questions are normalised to a 0–3 range; single/scale questions use their raw option count. Four named categories map subsets of question IDs:

- **Adoption & Tooling** — A1, A2, A3  
- **Data Readiness** — B1  
- **Governance** — C1  
- **Team Readiness** — D1

Stage thresholds: ≤10 → Stage 1, ≤15 → Stage 1–2, ≤20 → Stage 2, >20 → Stage 3.

### ROI model

Built inside `results()` from sales/marketing inputs (deal size, close rate, admin time, lead volume). Conservative assumptions: +15% relative close-rate lift, 25% admin-hour recovery, +20% lead-to-conversation lift. Missing inputs are silently skipped.

### Integrations (require configuration)

Two constants at the bottom of the `<script>` block must be set before deploying:

```js
const N8N_WEBHOOK_URL = 'https://YOUR_N8N_INSTANCE/webhook/ai-maturity-quiz';
const MEET_URL = 'https://calendar.google.com/calendar/appointments/YOUR_LINK_HERE';
```

The webhook fires automatically on results render via `fetch(POST)` with the full `QUIZ_RESULT` payload plus `name`, `email`, and `submitted_at`.

## Context file

`cr-event-context.md` — event brief used as grounding context for AI-assisted content changes (audience, content pillars, tone). Not loaded by the quiz itself.
