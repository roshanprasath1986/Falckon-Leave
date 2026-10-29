---
name: Executive Leave Operations
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#00174b'
  on-tertiary-container: '#497cff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 2.5rem
    fontWeight: '600'
    lineHeight: 3rem
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Geist
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 1.625rem
    fontWeight: '600'
    lineHeight: 2.125rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Geist
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  title-md:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: 1.625rem
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.625rem
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
  stat-counter:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies an authoritative, modern corporate aesthetic engineered specifically for high-velocity enterprise workforce operations and leave administration. It serves HR directors, global people managers, and enterprise personnel who need immediate clarity, uncompromised legibility, and effortless task execution.

The aesthetic fuses **Corporate / Modern** precision with architectural **Minimalism**:
- **Trust & Permanence:** Deep slate navy establishes structural gravity, assuring employees and leadership that policy calculations and statutory balances are accurate and secure.
- **Vitality & Restoration:** A refined emerald-teal accent balances clinical enterprise data with human-centered empathy, representing time off, personal wellbeing, and accrued rest.
- **Clarity over Clutter:** Surfaces prioritize information density without visual fatigue. Functional elements are bounded by crisp, low-contrast structural rules and generous whitespace margins.
- **Accessible Decisiveness:** Every status indicator, numerical balance counter, and actionable control maintains strict contrast ratios (WCAG AAA for critical data; AA for peripheral context) to eliminate ambiguity in requests and approvals.

## Colors

The palette balances administrative formality with restorative accents across light and dark modes:

- **Primary (`#0F172A` - Slate Navy):** The structural anchor. Governs primary navigation shells, active menu states, high-priority buttons, and dominant headers. In dark mode, this inverts to `#F8FAFC` for high-tier typography, resting on a `#0B0F19` canvas.
- **Secondary (`#0D9488` - Calming Teal/Emerald):** Highlights positive leave balances, available allocations, accrued vacation days, and approved request workflows.
- **Tertiary (`#2563EB` - Cobalt Accent):** Reserved for technical enterprise functions: system-level alerts, calendar sync links, filters, and active tab indicators.
- **Neutral (`#64748B` - Slate Core):** Manages muted textual hierarchies, baseline card strokes, dividers, and empty states.
- **Surface Roles:**
  - *Light Mode:* Canvas `#F8FAFC`, Surface Container `#FFFFFF`, Surface Muted `#F1F5F9`, Border Low-Contrast `#E2E8F0`.
  - *Dark Mode:* Canvas `#0B0F19`, Surface Container `#111827`, Surface Elevated `#1E293B`, Border Low-Contrast `#334155`.
- **Status Pills & Semantic States:**
  - *Approved / Active:* Background `#ECFDF5`, Text `#065F46` (Dark: BG `#064E3B`/40, Text `#6EE7B7`).
  - *Pending / In Review:* Background `#FFFBEB`, Text `#92400E` (Dark: BG `#78350F`/40, Text `#FCD34D`).
  - *Rejected / Expired:* Background `#FEF2F2`, Text `#991B1B` (Dark: BG `#7F1D1D`/40, Text `#FCA5A5`).

## Typography

The typography architecture uses a disciplined duo: **Geist** for headlines, labels, numerical balance metrics, and navigation elements, paired with **Inter** for readable paragraphs, policy breakdowns, and tabular content.

- **Tabular Figures:** All numerical balance metrics, leave day counters, dates, and timestamp strings must enforce `font-variant-numeric: tabular-nums` to maintain vertical alignment across ledger columns.
- **Negative Tracking on Scales:** Headlines above `1.25rem` utilize tight negative tracking (`-0.015em` to `-0.03em`) to impart an authoritative architectural finish.
- **Hierarchy Rules:**
  - Leave metric values feature `stat-counter` styling to establish focal dominance on dashboards.
  - Table headers, status capsules, and small category markers utilize uppercase or medium-weighted `label-sm` and `label-md` with expanded tracking (`0.02em` to `0.04em`).

## Layout & Spacing

The layout model is anchored by an adaptable 12-column fluid grid system with structural maximum constraints on extra-wide monitors:

- **Desktop (≥ 1280px):** 12 columns, `gutter: 1.5rem`, `margin: 2rem`, max content wrapper of `1440px`. Fixed sidebar navigation (256px) with fluid main content and responsive balance metric cards.
- **Tablet (768px - 1279px):** 8 columns, `gutter: 1.25rem`, `margin: 1.5rem`. Collapsible sidebar icon rail (64px) or top bar. Data tables collapse auxiliary columns (e.g., approver notes, submission timestamps) into expandable rows.
- **Mobile (< 768px):** 4 columns, `gutter-mobile: 1rem`, `margin-mobile: 1rem`. Bottom navigation or off-canvas drawer. Stat metrics convert into a 2x2 grid or horizontal swipe carousel.
- **Spacing Rhythm:** Based on an uncompromising 4px/8px modular scale. Component interiors enforce `space-sm` (8px) between micro-elements, `space-md` (16px) for standard container padding, and `space-xl` (40px) between major operational modules.

## Elevation & Depth

Visual depth is achieved through **tonal surface layering combined with low-contrast structural outlines and ambient diffusion**, rather than harsh drop shadows:

- **Level 0 (Canvas Base):** Ground level (`#F8FAFC` light / `#0B0F19` dark). No elevation. Contains background grids and layout margins.
- **Level 1 (Structural Cards & Tables):** Elevated surface (`#FFFFFF` light / `#111827` dark). Enclosed by a 1px solid low-contrast border (`#E2E8F0` light / `#1E293B` dark) paired with an ambient soft shadow: `0px 1px 3px rgba(15, 23, 42, 0.04), 0px 4px 12px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Popovers, Filter Menus, Datepickers):** Floating interaction surfaces (`#FFFFFF` light / `#1E293B` dark) with a refined border and diffused shadow: `0px 4px 6px -1px rgba(15, 23, 42, 0.06), 0px 10px 24px -3px rgba(15, 23, 42, 0.08)`.
- **Level 3 (Modal Dialogs & Critical Approvals):** Centered overlay structures accompanied by a deep slate backdrop blur (`rgba(15, 23, 42, 0.45)` with `backdrop-filter: blur(4px)`): `0px 20px 25px -5px rgba(15, 23, 42, 0.12), 0px 8px 10px -6px rgba(15, 23, 42, 0.08)`.
- **Contrast Philosophy:** Dark mode relies on border brightness adjustments and elevated surface tints rather than dark shadows.

## Shapes

The geometric framework uses a **Soft (Level 1)** philosophy to maintain an architectural, enterprise-grade feel:

- **Base Radius (0.25rem / 4px):** Applied to compact data controls: table checkboxes, tooltips, tags, small inputs, and dense pagination buttons.
- **Rounded-LG (0.5rem / 8px):** The default radius for standard buttons, input containers, filter chips, dropdown menus, and standard card containers.
- **Rounded-XL (0.75rem / 12px):** Reserved for large dashboard metric panels, detailed balance overview cards, and application-level modal containers.
- **Pill Exception (9999px):** Status badges (e.g., "Approved", "Pending", "Annual Leave") utilize a fully rounded pill shape to visually distinguish metadata badges from interactive buttons and inputs.

## Components

### Buttons
- **Primary:** Background Slate Navy (`#0F172A`), text `#FFFFFF`, height 40px, padding horizontal 16px, border radius 8px (`rounded-lg`). Hover: `#1E293B`. Active: `#020617`. Focus: 2px offset ring in `#2563EB`.
- **Secondary / Action:** Emerald-Teal (`#0D9488`), text `#FFFFFF`. Hover: `#0F766E`. Used exclusively for positive transactional submissions (e.g., "Request Time Off").
- **Outline / Ghost:** Border 1px `#E2E8F0`, background `#FFFFFF`, text `#0F172A`. Hover: `#F1F5F9`.

### Chips & Status Pills
- **Status Capsules:** Compact height (24px), font `label-sm`, full pill radius (`9999px`), padding horizontal 10px. Uses high-contrast semantic background fills with deeply saturated text matching their respective state (e.g., Paid Leave, Sick Leave, FMLA).
- **Interactive Filter Chips:** Radius 8px, background `#F1F5F9`, border 1px solid `#E2E8F0`, containing an optional count badge. Active state: background `#0F172A`, text `#FFFFFF`.

### Form Inputs & Datepickers
- **Text Inputs & Selects:** Height 40px, background `#FFFFFF` (Dark: `#111827`), border 1px solid `#CBD5E1`. Padding horizontal 12px. Placeholder text `#94A3B8`. Focus state: border `#0D9488` with a 2px teal focus ring (`rgba(13, 148, 136, 0.2)`).
- **Date Range Picker:** Two-field connected container with integrated calendar icon, highlighting selected vacation spans with a subtle teal gradient fill (`#CCFBF1` light / `#134E4A` dark).

### Checkboxes & Radios
- **Checkboxes:** 16x16px, border radius 4px, border 1.5px solid `#94A3B8`. Checked state: background `#0F172A`, border `#0F172A`, check icon in `#FFFFFF`.

### Tabular Data Layout (Enterprise Ledger)
- **Header:** Height 44px, background `#F8FAFC` (Dark: `#0F172A`), uppercase `label-sm` in `#64748B`, bottom border 1px solid `#E2E8F0`.
- **Rows:** Height 52px, alternating zebra or clean white with bottom divider `#F1F5F9`. Hover state: `#F8FAFC`.
- **Cell Content:** Strict vertical center alignment. Numbers formatted with tabular figures. Right-aligned for leave day balances, left-aligned for employee and leave type identifiers.

### Metric Cards (Leave Balances)
- **Structure:** Level 1 elevation, radius 12px (`rounded-xl`), padding 20px (`space-lg`), 1px structural border.
- **Content Flow:** Category header in `label-md` (`#64748B`), balance value in `stat-counter` (`#0F172A` or `#0D9488`), and bottom contextual progress track showing used vs. total accrual.