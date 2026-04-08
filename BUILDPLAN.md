# Data Studio — Build Plan & Continuation Guide

## What This Project Is

A cybersecurity-native **Data Studio** platform for the Prevalent AI product. It is NOT a generic ETL tool.
Its purpose: ingest data from security sources → parse → extract KG entities → resolve/disambiguate → publish to a Knowledge Graph → power downstream security solutions.

The full requirements document (PRD) exists — key points:
- Target users: SOC Admins, Security Engineers
- Core flow: Connector config (Admin) → Pipeline build (Engineer) → KG publish → Solutions
- Key differentiator: AI-assisted connector building, entity extraction, disambiguation, and observability at every stage
- Design system: Prevalent AI design system — CSS variables only, 4pt grid, 44px border-radius on buttons, 4px on cards

## Project Location

`/Users/ananthusunil/PAI Edits/studio`

Run locally: `npm run dev` → http://localhost:5173/studio_revamp/ (or next available port)

## Design System Rules (CRITICAL — never break these)

- CSS variables only — NEVER hardcode hex or px values
- Spacing: 4, 8, 12, 16, 20, 24, 32, 48px ONLY
- Buttons: `border-radius: 44px` ALWAYS
- Cards/tables: `border-radius: 4px` ONLY
- Topbar always `#131313` — PAI logo image only
- No page-level tabs unless explicitly requested
- Status/severity always visible in table column, never tooltip-only

## Tech Stack

- React 18 + TypeScript
- Vite 6
- React Router v7 (Hash-based)
- Radix UI (Checkbox, Dialog, Dropdown, Tooltip, Switch)
- Recharts (area charts)
- Tailwind CSS 4 + custom CSS variables in `src/index.css`

## Navigation Structure (current)

Sidebar sections:
- **Workspace**: Dashboard (`/`), Pipelines (`/pipelines`), Knowledge Graph (`/knowledge-graph`)
- **Data Sources**: Connectors (`/connectors`), Solutions (`/solutions`)
- **Platform**: Configuration (`/configuration`)
- **CTA**: "New Pipeline" → `/templates`

## Completed Stages

### ✅ Stage 1 — Foundation
**Files changed:**
- `src/types.ts` — Full domain type system (KGEntityType, PipelineStage, StageStatus, ConnectorCategory, CyberConnector, KGEntityStats, KGHealthSummary, PipelineTemplate, etc.)
- `src/data/mock.ts` — 6 cybersecurity pipelines (CrowdStrike, Tenable, MISP, Okta, AWS Security Hub, Splunk), KG entity stats, 25 cybersecurity connectors in 8 categories, 7 pipeline templates, cybersecurity-domain activity feed
- `src/components/Layout.tsx` — 6-item navigation with 3 sections, user avatar, notification dot
- `src/pages/Dashboard.tsx` — KG health alert banner, 5 KG-native KPIs, entity growth area chart (Alert/Asset/Vuln by day), entity freshness breakdown panel, security-domain activity feed, pipeline health summary
- `src/pages/Connectors.tsx` — Stub (replaced in Stage 2)
- `src/pages/KnowledgeGraph.tsx` — Entity health table with freshness, relationship types panel, action-required panel
- `src/pages/Solutions.tsx` — 5 downstream solutions with feeding pipeline links, freshness SLA, degraded state
- `src/pages/Configuration.tsx` — Structured placeholder for entity dictionaries, RBAC, global config
- `src/App.tsx` — All routes registered

### ✅ Stage 2 — Connectors (Full)
**Files created/changed:**
- `src/components/ConnectorDetailPanel.tsx` — Slide-in right panel: health badge, last auth time, linked pipelines (clickable), test connection animation, Use in Pipeline CTA
- `src/components/AIConnectorBuilderModal.tsx` — 4-step modal: source picker (URL/Paste/Upload/GitHub) → input → AI analysis steps animation → feed discovery with checkboxes → save. Try with URL "https://api.recordedfuture.com/swagger.json"
- `src/pages/Connectors.tsx` — Full rewrite: Library tab (25 connectors grouped by category, click → detail panel, hover → configure/use) + Credentials Vault tab (table with health, warnings, rotate/delete). Inline `ConfigureConnectorModal` with auth-type-specific fields.
- `src/data/mock.ts` — Credentials now have health, healthMessage, environment, createdBy, lastAuthAt (MISP=error, Okta=warning)

### ✅ Stage 3 — Template Library + Pipeline List Redesign
**Files created/changed:**
- `src/pages/Templates.tsx` — Primary "New Pipeline" entry: AI prompt bar at top, 7 template cards with entity badges + relationship expansion + setup time + trust signals, "Build Custom" secondary CTA
- `src/pages/PipelineList.tsx` — Full rewrite: stage health mini-bar (5×10px squares, hover tooltip), KG entity badges per row, template badge, success rate, stage health legend in filter bar
- `src/App.tsx` — Added `/templates` route
- `src/components/Layout.tsx`, `src/pages/Dashboard.tsx` — "New Pipeline" → `/templates`

## Remaining Stages (NOT YET BUILT)

### ✅ Stage 4 — Pipeline Builder (Stage Canvas)
**Files changed:**
- `src/pages/PipelineBuilder.tsx` — Full rewrite: horizontal 5-stage canvas (Ingest → Parse → Extract → Resolve → Publish). Left panel: name + schedule presets. Right panel: stage config slides in on card click. Stage-specific panels: Ingest (connector + feeds + load mode), Parse (parser type + AI-generate rules + field preview), Extract Entities (entity type checkbox grid + AI prediction toggle), Resolve (intra-dedup field + inter-source strategy + guided rule builder), Publish (KG target + validation checklist + dry-run toggle). Top bar: breadcrumb + Save Draft + Dry Run + Deploy. Config summary table below canvas. Template prefill from `?template=ID` URL param. Deploy confirmation modal.
- `src/pages/Templates.tsx` — "Start" buttons now pass `?template=${template.id}` to `/pipeline/new`

### ✅ Stage 5 — Pipeline View (Stage Observability)
**Files changed:**
- `src/pages/PipelineView.tsx` — Full rewrite. Header: back button, pipeline name + status + template badge, Edit/Re-run All/Pause/Run Now actions. KPI row: Total Records, Avg Duration, Success Rate, Next Run. Stage health strip: 5 clickable stage cards (status badge, records in→out, drop rate, error count, "Run stage" button with live running state). Expanded stage detail panel: 5 metrics tiles, error/warning message box, data preview table (5 sample records per stage). Resolve stage shows Disambiguation Backlog table (entity type, candidate pairs, sources, similarity bar, Merge/Skip actions). Throughput area chart kept. AI Diagnosis panel kept. Execution history table improved with "Completed Through" stage column. Removed field mappings section.

### ✅ Stage 6 — Knowledge Graph Page (Full)
**Files changed:**
- `src/pages/KnowledgeGraph.tsx` — Full rewrite. 5 KPI tiles (Total Entities, Relationships, Coverage Score, Disambig Backlog, Stale Types). Entity cards grid (4 cols, 2 rows): each card has color dot, count, today delta, 7-day SVG sparkline (polyline + gradient fill), freshness badge, last updated, pipeline count — clickable to open detail. Graph Navigator: SVG viewBox with 8 entity nodes (sized by count, colored by freshness), relationship edges with arrowheads and label text, selection ring, inline count labels — clicking a node syncs with the card selection. Entity detail panel (inline, full-width): sample records table, linked pipelines (clickable to PipelineView), relationship list. Collapsible Relationship Types section (10 types in 2-col grid). Coverage Gaps panel: stale/critical entity types with "Inspect" CTA. Disambiguation Backlog table: entity type, pending count, source pipeline, oldest record, strategy badge, "Review" link.

## Key Data Structures to Know

```typescript
// Core pipeline type
interface Pipeline {
  id, name, connector, connectorType, connectorCategory,
  target,             // always "Knowledge Graph"
  targetEntities,     // KGEntityType[]
  status,             // active | paused | failed | running
  stages,             // PipelineStage[] — 5 stages
  fromTemplate,       // template name if created from template
  ...
}

// Stage (5 per pipeline)
interface PipelineStage {
  name: 'ingest' | 'parse' | 'extract' | 'resolve' | 'publish';
  status: 'healthy' | 'warning' | 'error' | 'idle' | 'running';
  recordsIn, recordsOut, dropRate, errorMessage
}

// KG entity types
type KGEntityType = 'Asset' | 'Identity' | 'Vulnerability' | 'Alert' | 'ThreatActor' | 'IOC' | 'Incident' | 'Finding';
```

## How to Continue in a New Session

1. Open Claude Code in `/Users/ananthusunil/PAI Edits/studio`
2. Say: **"Read BUILDPLAN.md and continue from Stage 4"**
3. Claude will read this file and pick up exactly where we left off

## Color Reference (from CSS variables)

```
--shell-accent:  #6360D8  (purple — primary)
--shell-text:    #101010
--shell-text-muted: #6E6E6E
--shell-bg:      #F7F9FC
--shell-border:  #E6E6E6
--shell-active:  rgba(99,96,216,0.08)
--shell-hover:   rgba(0,0,0,0.04)
--card-bg:       #FFFFFF
--card-border:   #E6E6E6
--ctrl-bg:       #FFFFFF
--ctrl-border:   #CFCFCF
Status green:    #31A56D (bg #EFF7ED)
Status orange:   #D98B1D (bg #FEF3C7)
Status red:      #D12329 (bg #F9EEEE)
Topbar:          #131313 (fixed, never change)
```
