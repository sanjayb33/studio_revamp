Fetch ALL of these URLs fully before doing anything:
1. https://anthu211.github.io/design-system-2.0/ds/rules.json
2. https://anthu211.github.io/design-system-2.0/ds/tokens/colors.json
3. https://anthu211.github.io/design-system-2.0/ds/tokens/spacing.json
4. https://anthu211.github.io/design-system-2.0/ds/tokens/typography.json
5. https://anthu211.github.io/design-system-2.0/ds/components/buttons.json
6. https://anthu211.github.io/design-system-2.0/ds/components/tables.json
7. https://anthu211.github.io/design-system-2.0/ds/components/badges.json
8. https://anthu211.github.io/design-system-2.0/ds/components/modals.json
9. https://anthu211.github.io/design-system-2.0/ds-core.txt

Do not proceed until every URL above is fully fetched and read.

---

Review this screen against the Prevalent AI design system and UX laws:

$ARGUMENTS

---

Return a `✅ PASS` / `❌ FAIL` checklist using the fetched files as the source of truth. For every FAIL, give the exact fix referencing the specific rule or token.

## Shell & Structure
- [ ] Topbar `#131313` with PAI logo image — no "Prevalent AI" text
- [ ] Nav header shows workspace name, not "Prevalent AI"
- [ ] Left nav + sticky sub-header + content body present
- [ ] Sub-header title 12px/500 (not `<h1>` or 18px), breadcrumb 11px below

## Tokens & Styling
- [ ] Accent `#6360D8` · Filter CTA `#504bb8`
- [ ] All CTA/text buttons `border-radius:44px`
- [ ] Cards, table wrappers `border-radius:4px` only
- [ ] Inter font · `<html class="theme-light">`
- [ ] Spacing 4px scale only for margin, padding, gap — flag off-scale values there only. border-radius is NOT spacing and is not restricted to the 4pt grid.

## Tables
- [ ] Column order: checkbox → data → status → actions (empty `<th>`)
- [ ] Row actions in own `col-actions` cell — NOT mixed with status badge
- [ ] Row actions CSS-hidden by default — no `style="display:flex"` inline
- [ ] Status/severity visible in column — not tooltip-only
- [ ] Pagination footer present

## Components
- [ ] KPI cards ≤ 5, no icons, no colored borders, correct delta classes
- [ ] Table columns ≤ 7
- [ ] Destructive actions have confirmation modal (item name + consequence + red confirm)
- [ ] No page-level tabs unless explicitly requested
- [ ] Error/empty states present where needed

## UX Laws
- [ ] Hick's: 1 primary CTA per section
- [ ] Fitts's: row actions on hover, min 32px height on controls
- [ ] Miller's: ≤5 KPIs · ≤7 table columns
- [ ] Jakob's: checkboxes leftmost · Cancel left of Confirm

## Persona
- [ ] Layout matches primary persona (state which one)
- [ ] No frustration triggers for that persona

## Accessibility
- [ ] All interactive elements have visible focus states (outline, not just color change)
- [ ] Color contrast AA minimum: body text 4.5:1, large text/UI components 3:1
- [ ] No color as sole conveyor of meaning (status badges have text/icon, not color only)
- [ ] All images/icons have `alt` text or `aria-label`; decorative icons use `aria-hidden="true"`
- [ ] Form inputs have associated `<label>` or `aria-labelledby` — no placeholder-only labels
- [ ] Modal traps focus and restores it on close; `role="dialog"` + `aria-modal="true"` present

## Motion & Feedback
- [ ] Loading states present for every async action (skeleton or spinner — not blank)
- [ ] Inline success/error feedback on form submission — no silent failures
- [ ] Destructive / irreversible actions have visible undo or a 3–5s delay toast
- [ ] Transitions ≤ 200ms for micro-interactions; no animation on data tables or large repaints
- [ ] `prefers-reduced-motion` respected — animations disabled or simplified when set

## Content & Copywriting
- [ ] All empty states have a headline + 1-line explanation + primary action (no naked "No data")
- [ ] CTA labels are verb-first and specific ("Export Report" not "Submit" or "Click here")
- [ ] Truncated text has full value accessible via tooltip (`title` attr or `aria-describedby`)
- [ ] Error messages state what went wrong + how to fix it — no raw API errors exposed
- [ ] Confirmation modal copy names the item being acted on (not "Are you sure?")

## Responsive & Density
- [ ] Layout tested at 1280px, 1440px, 1920px — no overflow or orphaned elements
- [ ] Table has horizontal scroll container on viewports < 1024px — no column collapse
- [ ] Touch targets ≥ 44×44px on any component that appears in a mobile/tablet view
- [ ] Dense mode (if applicable) uses tighter padding from the 4px scale — no custom one-offs

## Information Architecture
- [ ] Page has exactly one `<h1>`; heading hierarchy is sequential (no skipped levels)
- [ ] Active nav item is visually indicated (not just bold — use accent or indicator bar)
- [ ] Breadcrumb reflects actual drill-down path — last crumb is current page, non-linked
- [ ] Filters/search state is reflected in URL params or persists on back-navigation

## Data Integrity & Edge Cases
- [ ] Tables handle 0 rows, 1 row, and 1000+ rows without layout breakage
- [ ] Long string values (names, URLs) don't break cell layout — truncate with ellipsis
- [ ] KPI delta shows "—" or "N/A" when prior period data is unavailable — not 0% or blank
- [ ] Pagination controls disabled (not hidden) when on first/last page

## Governance & Handoff
- [ ] Every new component maps to a named token — no hardcoded hex outside the token sheet
- [ ] No `!important` in component styles — specificity handled by class structure
- [ ] Z-index values use defined scale (e.g. 100/200/300 tier) — no arbitrary numbers like `z-index: 9999`
- [ ] Component variants are named to match the design file (e.g. `btn--primary` not `btn-blue`)

---

**Summary**: X PASS · X FAIL · most critical fix
