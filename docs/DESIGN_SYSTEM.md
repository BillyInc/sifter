# Sifter frontend design system

This document is the operating contract for the Sifter web UI (Next.js 16, Tailwind 3).
It records the UX audit that started the design work, the tokens, the shared
primitives, and the rules for using them.

## 1. UX audit (November 2026)

| Severity | Finding | Impact | Fix |
|---|---|---|---|
| Critical | `bg-sifter-dark`, `bg-sifter-card`, `border-sifter-border`, `text-sifter-blue` etc. were used in 59 files (~1,000 occurrences) but never defined in `tailwind.config.ts`. Tailwind silently dropped them. | Cards had no fill, borders were transparent, the landing headline's gradient text was invisible and the primary CTA had no background. | Defined the `sifter` palette in `tailwind.config.ts`, mirrored as CSS variables in `globals.css`. Every existing usage now renders. |
| High | Auth forms used white inputs (`bg-white text-gray-900`) on a dark page; register page had `text-gray-600` helper text on `#141824` (contrast ~2.5:1) and an invalid `text-white-600` class. | Inconsistent, low-contrast forms on the first screen a new user sees. | Rebuilt login/register on the shared `Input`, `Button`, `Card`, `Alert` primitives. Inline validation for password length/mismatch. |
| High | No visible keyboard focus style across the app; `focus:outline-none` used widely without a replacement. | Keyboard users cannot see where they are. | Global `:focus-visible` ring in `globals.css`; primitives use `focus:ring`. |
| High | No `prefers-reduced-motion` handling. | Motion plays for users who opted out. | Global reduced-motion media query. |
| Medium | Landing page copy claimed "13 risk metrics" while `METRIC_WEIGHTS` holds 12; feature cards used emoji as icons. | Marketing copy diverged from product data. | Landing now renders `METRIC_WEIGHTS` directly and derives the count from it. |
| Medium | `src/components/SearchInput.tsx` was unused and shipped fabricated example projects (`@moonrocket_fi`, `t.me/safeeloninu`). | Dead code with invented data. | Removed. `SmartInputParser` is the live input. |
| Medium | Inter was loaded twice (Google Fonts `@import` in CSS and `next/font` in the layout). | Extra render-blocking request. | Removed the CSS import. |
| Medium | Account-type options were duplicated between register page and landing page copy. | Drift risk. | Single source: `src/data/accountModes.ts`. |
| Low | The logged-in header uses emoji (`↔️`/`↕️`) for the compact-mode toggle and five differently-coloured pill buttons. | Visual noise; not yet changed (lives in the 2.7k-line `src/app/page.tsx`). | Follow-up: migrate header to `Button variant="ghost"` + icons. |

### Data defects recorded, not changed

- `src/types/index.ts` and `src/data/scoring.ts` both export `METRIC_WEIGHTS`,
  `getVerdict` and `getRiskTier` with **different thresholds and verdict
  vocabularies** (`pass/flag/reject` at 40/70 vs `PROCEED/REJECT` at 75; five
  risk tiers vs four). `VerdictCard` imports from `data/scoring`, the rest of the
  app from `types`. The landing page uses `@/types` because that is what the
  verdict UI vocabulary (Pass/Flag/Reject) comes from. Pick one source.
- `README.md` describes 13 metrics in 6 categories; the code has 12 weights and
  no category grouping. The landing page no longer states a hard-coded count.

### Pre-existing tooling issue

`pnpm lint` (`eslint .`) crashes on the untouched tree with "Converting circular
structure to JSON" from `@eslint/eslintrc`. It is unrelated to these changes;
`tsc --noEmit` and `next build` are the working gates.

## 2. Tokens

Defined once in `tailwind.config.ts` (`theme.extend.colors.sifter`) and mirrored
as CSS variables in `src/app/globals.css`. Use the Tailwind classes; use the
variables only in plain CSS.

| Token | Class | Value | Use |
|---|---|---|---|
| dark | `bg-sifter-dark` | `#0A0E1A` | Page background, input background |
| card | `bg-sifter-card` | `#141824` | Default surface |
| elevated | `bg-sifter-elevated` | `#1A1F2E` | Nested / highlighted surface |
| hover | `bg-sifter-hover` | `#1F2433` | Hover state of surfaces |
| border | `border-sifter-border` | `#1F2937` | Default line |
| border-strong | `border-sifter-border-strong` | `#374151` | Hover / active line |
| text | `text-sifter-text` | `#F9FAFB` | Primary text |
| text-muted | `text-sifter-text-muted` | `#9CA3AF` | Secondary text (≥ 4.5:1 on card) |
| text-subtle | `text-sifter-text-subtle` | `#6B7280` | Captions, placeholders only |
| blue | `bg-sifter-blue` / `-hover` / `-active` | `#3B82F6` / `#2563EB` / `#1D4ED8` | Primary action |
| success / warning / danger / info | `text-sifter-success` … | `#10B981` / `#F59E0B` / `#EF4444` / `#60A5FA` | Semantic status |

Other tokens: `shadow-card`, `shadow-popover`, `duration-fast` (100 ms),
`duration-base` (200 ms), `animate-fade-up` (250 ms). The `nansen.*` palette and
`.nansen-*` classes remain for the compact data views; do not add new usages.

Rules:
- Never use `text-gray-600` or darker for readable text on a dark surface.
- Do not put light inputs (`bg-white`) on dark pages.
- Status colour alone never carries meaning; pair it with a label.

## 3. Primitives (`src/components/ui`)

| Component | Props | States |
|---|---|---|
| `Button` | `variant` primary/secondary/ghost/danger, `size` sm/md/lg, `loading`, `fullWidth`, `leadingIcon`, `trailingIcon` | default, hover, active (scale 0.98), focus-visible ring, disabled, loading (spinner + `aria-busy`) |
| `Input` | `label`, `hint`, `error`, `leadingIcon`, all native input props | default, hover, focus ring, disabled, error (`aria-invalid`, `role="alert"`, `aria-describedby`) |
| `Card` | `tone` default/elevated, `padding` none/sm/md/lg, `interactive` | default, hover (interactive only) |
| `Badge` | `tone` neutral/info/success/warning/danger/purple | static |
| `Alert` | `tone` danger/info/success | `role="alert"` for danger, `role="status"` otherwise |
| `Logo`, `LogoMark` | `size` sm/md/lg, `subtitle` | static |
| `cn()` | class joiner | — |

Prefer these over hand-written class strings in new or touched code. When a
pattern is used three or more times, promote it here.

## 4. Screen contracts

### Landing (`/`, unauthenticated) — `src/components/LandingPage.tsx`
- Data: `METRIC_WEIGHTS` from `@/types`, `ACCOUNT_MODES`, input kinds from
  `SmartInputParser.detectInputType`. No invented content.
- Actions: **Get started** → `onGetStarted` (opens mode modal in `page.tsx`);
  **Sign in** → `/login`; account cards → `/register?mode=<value>`; in-page
  anchors `#metrics`, `#how-it-works` (sticky header offset via `scroll-mt-20`).
- Responsive: 1 column < 640 px, 2 at `sm`, 3 at `lg`. Hero CTAs stack on mobile.

### Login (`/login`) and Register (`/register`)
- Fields: email, password (login); name, email, password, confirm, account type
  (register). Password min 8 characters; mismatch and length errors show inline
  as the user types and again on submit.
- Submit disabled while `isLoading`; the button shows a spinner. Server/auth
  errors render in `Alert` above the form. Entered values are preserved on
  failure.
- `?mode=` on register pre-selects a valid account type.

## 5. Motion and accessibility
- Page/section entrance: `animate-fade-up` (250 ms). Button press: 100 ms.
- All animation and transitions collapse under `prefers-reduced-motion`.
- Keyboard focus is always visible (`:focus-visible` outline).
- Radio groups use `fieldset`/`legend`; icon-only controls carry `aria-label`.
- Minimum touch target: 40 px (`Button size="md"` is 40 px, `lg` is 48 px).

## 6. Verification
- `npx tsc --noEmit` passes.
- `npx next build` passes (see commit for the run).
- Before/after screenshots captured at 1440 px and 390 px for `/`, `/login`,
  `/register`.

## 7. Follow-ups (not done here)
1. Migrate the logged-in header/footer in `src/app/page.tsx` to the primitives
   and replace emoji toggles with icons.
2. Resolve the duplicate scoring sources (`types` vs `data/scoring`).
3. Sweep the dashboards (`IndividualDashboard`, `ResearcherDashboard`,
   `EABatchDashboard`) for `text-gray-600`-on-dark contrast and white inputs.
4. Repair the ESLint configuration so `pnpm lint` runs.
