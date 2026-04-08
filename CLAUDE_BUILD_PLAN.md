# Studio Revamp — Domain Analyst Configuration Build Plan

> **For new Claude Code sessions:** Read this file first. It contains the complete project context,
> all completed work, and the full prioritised feature roadmap with technical specs.
> Pick up at the first unchecked `⬜` item in the current phase.
> Update the checkbox to `✅` when a feature is complete.

---

## 1. Quick Start for New Sessions

```
Working directory : /Users/ananthusunil/PAI Edits/studio_revamp
Active git branch : work/session-20260408
Base branch       : main
Run dev server    : npm run dev   (Vite, http://localhost:5173)
Type check        : npx tsc --noEmit
Known pre-existing TS error: Dashboard.tsx Recharts ResponsiveContainer `minHeight` — ignore it
```

**What this project is:** A React/Vite/TypeScript admin dashboard for a cybersecurity data-ingestion
platform ("PAI Studio"). It builds a Knowledge Graph (KG) by ingesting data from security connectors
(CrowdStrike, Tenable, Okta, Splunk, etc.) through configurable 5-stage pipelines
(Ingest → Parse → Extract → Resolve → Publish). All data is currently mocked.

**Tech stack:**
- React 18 + Vite + TypeScript strict
- Tailwind CSS 4 (via Vite plugin, use inline `style={}` for dynamic values, `className` for static)
- Radix UI (checkbox, dialog, dropdown, select, radio, switch, tooltip)
- Lucide React icons
- Recharts (AreaChart on Dashboard)
- React Router v7 (HashRouter — `#` in URLs)
- No backend — all data in `src/data/mock.ts`

**CSS variables to use everywhere (never hardcode these colours):**
```
--shell-bg          page background
--shell-text        primary text
--shell-text-muted  secondary text
--shell-accent      #6360D8 (purple — primary brand)
--shell-active      rgba(99,96,216,0.08) (accent tinted bg)
--shell-border      divider lines
--shell-raised      slightly elevated bg
--card-bg           white card background
--card-border       card border
--ctrl-bg           input/button background
--ctrl-border       input/button border
```

**UI conventions (match everywhere):**
- Page padding: `style={{ padding: '24px 28px' }}`
- Cards: `className="rounded-[4px]"` + `style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}`
- Pill buttons: `className="rounded-[44px]"`
- Square buttons: `className="rounded-[4px]"`
- Font sizes: 13px headings, 12px body, 11px secondary, 10px labels/badges
- All icons from `lucide-react`

---

## 2. Key File Map

```
src/
├── App.tsx                  — routing (HashRouter)
├── types.ts                 — all TypeScript interfaces
├── index.css                — CSS variables + Tailwind
├── data/
│   └── mock.ts              — ALL mock data (no backend)
├── pages/
│   ├── Dashboard.tsx        — KPI cards, KG growth chart, entity table, activity feed
│   ├── PipelineList.tsx     — pipeline table + onboarding empty state
│   ├── PipelineBuilder.tsx  — 5-stage wizard (Ingest/Parse/Extract/Resolve/Publish)
│   ├── PipelineView.tsx     — single pipeline detail + execution history
│   ├── KnowledgeGraph.tsx   — SVG radial graph + entity stats + detail panel
│   ├── Connectors.tsx       — connector catalog + credential management
│   ├── Templates.tsx        — pipeline template browser
│   ├── Solutions.tsx        — solution cards (KG View, Controls, Attack Surface, Exposure)
│   ├── Configuration.tsx    — config section cards (Schema, Resolution, Enrichment, Rules…)
│   └── Settings.tsx         — redirects to Configuration
└── components/
    ├── Layout.tsx           — sidebar nav + top bar + breadcrumbs
    ├── AIChatWidget.tsx     — AI assistant chat
    ├── AIConnectorBuilderModal.tsx
    ├── ConnectorDetailPanel.tsx
    └── SplashScreen.tsx
```

**Routes currently in App.tsx:**
```
/                   → Dashboard
/pipelines          → PipelineList
/templates          → Templates
/pipeline/new       → PipelineBuilder
/pipeline/:id       → PipelineView
/connectors         → Connectors
/knowledge-graph    → KnowledgeGraph
/solutions          → Solutions
/configuration      → Configuration
```

**Routes to add (see Phase 5 nav changes):**
```
/configuration/schema            → SchemaEditor (new page)
/configuration/resolution        → ResolutionStudio (new page)
/configuration/enrichment        → EnrichmentConfig (new page)
/configuration/rules             → RulesEngine (new page)
/configuration/disambiguation    → DisambiguationQueue (new page)
/configuration/sla               → SLAManagement (new page)
```

---

## 3. Completed Work ✅

All items below are already implemented on branch `work/session-20260408`.

### P1 — Buyer Confidence
- ✅ **Configuration page** — removed all "Stage 6" badges; cards now show real status with
  toggle indicators, green checkmarks, Manage buttons. File: `src/pages/Configuration.tsx`
- ✅ **Cross-entity insight callout** on Dashboard — purple banner "247 identities linked to 38
  critical CVEs". File: `src/pages/Dashboard.tsx` ~line 261
- ✅ **KG search input** on Dashboard — form with Search icon, navigates to /knowledge-graph.
  File: `src/pages/Dashboard.tsx` ~line 280

### P2 — Operational Credibility
- ✅ **Onboarding empty state** in PipelineList — rich 3-step guide (Connect → Configure → Publish)
  with icons and two CTAs, shown when no pipelines exist and no search active.
  File: `src/pages/PipelineList.tsx` ~line 556
- ✅ **Fix Pipeline wired** to specific broken pipeline — Solutions.tsx "Fix pipeline" button now
  navigates to `/pipeline/2` (Tenable, id:'2') not generic `/pipelines`.
  File: `src/pages/Solutions.tsx` line 159
- ✅ **Dry run preview** in PipelineBuilder Publish stage — `DryRunPreview` component shows
  syntax-highlighted sample entity JSON when Dry Run toggle is on.
  File: `src/pages/PipelineBuilder.tsx` ~line 858

### P3 — Completeness
- ✅ **Freshness SLA inline editing** on Dashboard Entities in Graph card — click `Xh` to edit
  per-entity SLA in-place. State: `slaHours`, `editingSla`, `slaInput`.
  File: `src/pages/Dashboard.tsx` ~line 453
- ✅ **30/60/90-day trend toggle** on Dashboard KG Growth chart — segmented button group
  (7d/30d/60d/90d), mock data added for each range.
  Files: `src/data/mock.ts` (new exports), `src/pages/Dashboard.tsx` ~line 330
- ✅ **Scroll zoom disabled** on KG graph — removed wheel event listener from KnowledgeGraph.tsx;
  only button zoom (+ ⊙ −) works now. Hint text updated.
  File: `src/pages/KnowledgeGraph.tsx`

---

## 4. The Domain Analyst Build Roadmap

The goal: give a domain analyst (security professional, not a developer) the ability to fully
configure how security data flows into, is processed within, and is enriched inside the KG —
without writing code.

### Configuration Stack (layers build on each other — implement in order):
```
Layer 5: Domain Rules Engine    (tagging, risk scoring, criticality)
Layer 4: Enrichment Config      (NVD, GeoIP, VirusTotal, custom HTTP)
Layer 3: Inter-Loader Config    (entity resolution, source trust, relationship inference)
Layer 2: Intra-Loader Config    (field mapping, filters, per-pipeline extraction rules)
Layer 1: Entity Schema          (what entities are — attributes, types, relationships)
```

---

## Phase 1 — Intra-Loader Configuration

> Expands the existing 5-stage PipelineBuilder. No new pages — enhancements to existing stage panels.
> These unlock the most immediate value: analyst can express how one source's data maps to the KG.

---

### ⬜ 1.1 — Field Mapping Studio (Parse Stage expansion)

**What:** Replace the current minimal Parse panel (just parser type + AI rules toggle + static field
preview) with a full visual two-column field mapper.

**File to modify:** `src/pages/PipelineBuilder.tsx` — replace `ParsePanel` component (currently ~line 400)

**New types to add to `src/types.ts`:**
```typescript
interface FieldMapping {
  id: string;
  sourceField: string;          // e.g. "device.hostname"
  targetEntity: KGEntityType;
  targetAttribute: string;      // e.g. "hostname"
  transform?: FieldTransform;
  confidence?: number;          // 0-100, from AI suggestion
  aiSuggested?: boolean;
  nullable: 'drop_record' | 'use_default' | 'mark_unknown';
  defaultValue?: string;
}

interface FieldTransform {
  type: 'none' | 'lowercase' | 'uppercase' | 'regex_extract' | 'map_value' |
        'epoch_to_iso' | 'ip_normalize' | 'concat' | 'split' | 'conditional' |
        'cvss_to_severity' | 'mitre_lookup';
  params?: Record<string, string>;  // e.g. { pattern: "\\d+\\.\\d+\\.\\d+\\.\\d+" }
}

interface RecordFilter {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' |
            'ends_with' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' |
            'is_one_of' | 'is_not_one_of';
  value: string;
  values?: string[];   // for is_one_of / is_not_one_of
}

interface RecordFilterGroup {
  logic: 'AND' | 'OR';
  conditions: (RecordFilter | RecordFilterGroup)[];
}
```

**Mock data to add to `src/data/mock.ts`:**
The file already has `mockFieldMappings`. Expand it to 15–20 entries covering CrowdStrike,
Tenable, MISP, Okta feeds. Add a `SAMPLE_SOURCE_FIELDS` map:
```typescript
export const SAMPLE_SOURCE_FIELDS: Record<ConnectorType, { field: string; sample: string; type: string }[]> = {
  crowdstrike: [
    { field: 'device_id',      sample: 'abc-123-def',  type: 'string' },
    { field: 'hostname',       sample: 'PROD-WEB-01',  type: 'string' },
    { field: 'local_ip',       sample: '10.0.1.42',    type: 'string' },
    { field: 'os_version',     sample: 'Windows 11',   type: 'string' },
    { field: 'event_severity', sample: 'HIGH',          type: 'string' },
    { field: 'timestamp',      sample: '1712500000000', type: 'epoch_ms' },
    { field: 'technique_id',   sample: 'T1078',         type: 'string' },
    { field: 'tags',           sample: '["prod","web"]', type: 'array' },
  ],
  tenable: [ /* similar */ ],
  okta:    [ /* similar */ ],
  misp:    [ /* similar */ ],
  // add remaining connectors
};
```

**ParsePanel UI (replace current implementation):**

Left column (40% width): "Source Fields" — scrollable list of source fields fetched from
`SAMPLE_SOURCE_FIELDS[connectorId]`. Each row: field name, sample value chip, type badge.
Clicking a source field selects it for mapping.

Right column (40% width): "KG Schema" — list of target attributes for the selected entity types
(from `ExtractConfig.entityTypes`). Each attribute shows: name, type, required badge,
"mapped" / "unmapped" status.

Centre (20%): mapping lines + transform controls. When a source field is dragged to a target,
a mapping is created. Each mapping row shows:
- Source field → [transform fn dropdown] → target attribute
- A delete (×) icon
- A confidence chip if AI-suggested

Below the mapper: Record Filter Builder (collapsible section):
- List of active filter conditions with AND/OR selector
- Each condition: [field dropdown] [operator dropdown] [value input] [× remove]
- "+ Add condition" button
- Preview line: "X of Y sample records match" (computed from SAMPLE_SOURCE_FIELDS sample values)

Bottom: "Test with sample" button — runs all mappings + filters against sample data, shows a
before/after diff for the first 3 records.

**Transform fn picker (appears as inline dropdown on each mapping):**
- none (pass through)
- lowercase / uppercase
- regex_extract → shows a pattern input
- map_value → shows a mini key→value table editor
- epoch_to_iso
- ip_normalize
- concat → shows field list + separator
- split → shows separator + index
- conditional → shows simple if/then/else builder
- cvss_to_severity (built-in — no params)
- mitre_lookup (built-in — no params)

**State changes in `ParseConfig` interface (add to `src/types.ts` or keep in PipelineBuilder):**
```typescript
interface ParseConfig {
  parserType?: 'json' | 'cef' | 'syslog' | 'csv' | 'xml' | 'auto';
  aiRules: boolean;
  fieldMappings: FieldMapping[];        // NEW
  recordFilters: RecordFilterGroup;     // NEW
}
```

---

### ⬜ 1.2 — Ingest Stage Advanced Panel

**What:** Expand the Ingest stage with a collapsible "Advanced" panel below current connector +
feed + load mode controls.

**File to modify:** `src/pages/PipelineBuilder.tsx` — expand `IngestPanel` component

**New fields in `IngestConfig`:**
```typescript
interface IngestConfig {
  connectorId?: ConnectorType;
  feeds: string[];
  loadMode: 'incremental' | 'full';
  // NEW:
  watermarkField?: string;
  watermarkFormat?: 'epoch_ms' | 'iso8601' | 'relative';
  overlapWindowMinutes: number;          // default 5
  maxLookbackDays: number;               // default 30 (first run only)
  apiRateLimitPerMin?: number;
  errorHandling: 'skip_and_log' | 'fail_pipeline' | 'quarantine';
  sourcePreFilter?: string;              // raw query/filter string for the API level
}
```

**UI — "Advanced Settings" collapsible accordion (closed by default):**
- Watermark field: text input (placeholder "e.g. event_timestamp")
- Watermark format: radio group (epoch_ms / ISO 8601 / relative)
- Overlap window: number input + "minutes" label
- Max lookback on first run: number input + "days" label
- API rate limit: number input + "requests / min" label (optional)
- On error: radio group (Skip and log / Fail pipeline / Quarantine)
- Source-level filter: text input with placeholder (SPL for Splunk, query for REST, etc.)

**Fetch Preview button (always visible, not in Advanced):**
Shows a drawer/panel with 3–5 raw mock records for the selected connector.
Use `SAMPLE_SOURCE_FIELDS[connectorId]` as the data source — render as formatted JSON.
Label: "Live preview — showing 5 records from [connector name]"

---

### ⬜ 1.3 — Entity Extraction Config (Extract Stage expansion)

**What:** Expand Extract stage so the analyst configures, per entity type, the primary key and
conditional extraction rules. Currently just a multi-select of entity types.

**File to modify:** `src/pages/PipelineBuilder.tsx` — expand `ExtractPanel`

**New types:**
```typescript
interface EntityExtractionRule {
  entityType: KGEntityType;
  primaryKeyFields: string[];           // source fields that form the entity ID
  primaryKeyStrategy: 'single' | 'composite' | 'hash_composite';
  extractionCondition?: RecordFilterGroup;  // only create entity when condition is true
  confidenceThreshold: number;          // 0-100, for AI extraction (default 0 = always)
}

// Extend ExtractConfig:
interface ExtractConfig {
  entityTypes: KGEntityType[];
  aiPrediction: boolean;
  extractionRules: EntityExtractionRule[];   // NEW — one per selected entity type
}
```

**UI — after the entity type multi-select grid, for each selected entity type, an expandable row:**
```
► host  [Configured ✓]  [▼ expand]
  Primary key:   [hostname] [+] [× ip_address]    Strategy: [Composite ▼]
  Extract when:  [Always]  OR  [Add condition +]
  Min confidence: [0]%
```

When expanded, the row shows the primary key builder and optional condition builder.
Primary key builder: a token input — analyst types or selects from the source fields
(from `SAMPLE_SOURCE_FIELDS[connectorId]`).

---

### ⬜ 1.4 — Resolve Stage Expansion (Intra-dedup)

**What:** Expand current Resolve stage from a single dedup field + strategy to a full
intra-deduplication config. Keep the existing UI but add an "Intra-dedup" tab alongside a new
"Inter-dedup" tab (inter-dedup config lives in Phase 2 / Resolution Studio).

**File to modify:** `src/pages/PipelineBuilder.tsx` — expand `ResolvePanel`

**New types:**
```typescript
interface IntraDedupConfig {
  dedupKeyFields: string[];             // which fields form the dedup key
  dedupKeyStrategy: 'exact' | 'normalized' | 'fuzzy';
  fuzzyMaxEditDistance?: number;        // for fuzzy strategy
  window: 'session' | 'rolling_24h' | 'cumulative';
  onDuplicate: 'keep_latest' | 'keep_first' | 'merge' | 'review';
  mergePolicy: 'latest_wins' | 'highest_confidence' | 'source_priority';
}

// Extend ResolveConfig:
interface ResolveConfig {
  // existing fields kept:
  intraDedupField: string;
  interStrategy: 'exact' | 'fuzzy' | 'ml';
  ruleField: string;
  ruleOp: string;
  ruleValue: string;
  // NEW:
  intraDedup: IntraDedupConfig;
}
```

**UI — two tabs at top of Resolve panel: "Intra-dedup" (active) | "Inter-dedup (global →)"**

Intra-dedup tab:
- Dedup key fields: token-input, same source fields as field mapper
- Key matching: radio (Exact / Normalized / Fuzzy); if Fuzzy: max edit distance stepper
- Dedup window: radio (This run only / Rolling 24h / All time)
- On duplicate: radio (Keep latest / Keep first / Merge / Send to review)
- If Merge: merge policy radio (Latest value wins / Highest confidence / Source priority)

Inter-dedup tab shows: "Inter-source deduplication is managed globally in Configuration →
Resolution Studio. Click to open →" with a button linking to `/configuration/resolution`.

---

## Phase 2 — Inter-Loader Configuration

> New pages within the Configuration section. These govern how data from *different* pipelines
> is reconciled into a unified KG. The biggest analytical value unlock.

---

### ⬜ 2.1 — Navigation Changes for Configuration Sub-pages

**File to modify:** `src/components/Layout.tsx`

Change the Configuration nav entry from a leaf to a parent with children:
```typescript
{
  kind: 'parent',
  id: 'configuration',
  label: 'Configuration',
  icon: Settings2,
  matchPaths: ['/configuration'],
  children: [
    { label: 'Overview',        to: '/configuration',                    icon: Settings2  },
    { label: 'Schema',          to: '/configuration/schema',             icon: BookOpen   },
    { label: 'Resolution',      to: '/configuration/resolution',         icon: GitMerge   },
    { label: 'Enrichment',      to: '/configuration/enrichment',         icon: Sparkles   },
    { label: 'Rules Engine',    to: '/configuration/rules',              icon: Zap        },
    { label: 'Disambiguation',  to: '/configuration/disambiguation',     icon: AlertTriangle },
    { label: 'SLA Management',  to: '/configuration/sla',               icon: Clock      },
  ],
}
```

**File to modify:** `src/App.tsx` — add routes:
```typescript
<Route path="configuration" element={<Configuration />} />
<Route path="configuration/schema" element={<SchemaEditor />} />
<Route path="configuration/resolution" element={<ResolutionStudio />} />
<Route path="configuration/enrichment" element={<EnrichmentConfig />} />
<Route path="configuration/rules" element={<RulesEngine />} />
<Route path="configuration/disambiguation" element={<DisambiguationQueue />} />
<Route path="configuration/sla" element={<SLAManagement />} />
```

Also update `Configuration.tsx` overview page to show the 6 sub-section cards with links
(replace current 4 cards with 6 cards, each navigating to its sub-page).

---

### ⬜ 2.2 — Resolution Studio (`/configuration/resolution`)

**What:** A new page where the analyst configures, per entity type, how entities from different
pipelines/sources are matched and merged. The most important page in the whole platform.

**New file:** `src/pages/config/ResolutionStudio.tsx`

**New types to add to `src/types.ts`:**
```typescript
type MatchAlgorithm = 'exact' | 'normalized' | 'fuzzy' | 'ip_subnet' | 'email_normalized' | 'ml';

interface MatchKeyRule {
  id: string;
  attribute: string;              // KG entity attribute name
  algorithm: MatchAlgorithm;
  weight: number;                 // contribution to composite confidence score
  normalizeSteps?: string[];      // e.g. ['lowercase', 'strip_domain']
  fuzzyMaxDistance?: number;
}

interface MatchThresholds {
  autoMerge: number;              // confidence >= this → auto merge (default 90)
  reviewQueue: number;            // confidence >= this → review queue (default 60)
  // below reviewQueue → auto separate
}

interface EntityResolutionConfig {
  entityType: KGEntityType;
  enabled: boolean;
  primaryKeys: MatchKeyRule[];     // ALL must match for auto-merge candidate
  secondaryKeys: MatchKeyRule[];   // boost confidence score
  blockingKey?: string;            // attribute to use as blocking key
  thresholds: MatchThresholds;
  ambiguousAction: 'review_queue' | 'auto_merge' | 'create_separate';
}

interface SourceTrustConfig {
  entityType: KGEntityType;
  // Source priority order (index 0 = highest trust)
  sourcePriority: string[];        // pipeline names or connector IDs
  // Attribute-level exceptions
  attributeExceptions: {
    attribute: string;
    authorativeSource: string;     // overrides priority for this attribute
  }[];
  latestWinsAttributes: string[];  // for these attributes, newest value always wins
  mergeArrayAttributes: string[];  // for array attrs, union all sources vs. authoritative only
}
```

**Mock data to add to `src/data/mock.ts`:**
```typescript
export const mockResolutionConfigs: EntityResolutionConfig[] = [
  {
    entityType: 'host',
    enabled: true,
    primaryKeys: [
      { id: 'pk1', attribute: 'hostname', algorithm: 'normalized', weight: 60,
        normalizeSteps: ['lowercase', 'strip_fqdn_suffix'] },
      { id: 'pk2', attribute: 'primary_ip', algorithm: 'exact', weight: 40 },
    ],
    secondaryKeys: [
      { id: 'sk1', attribute: 'mac_address', algorithm: 'exact', weight: 30 },
      { id: 'sk2', attribute: 'os_platform', algorithm: 'exact', weight: 10 },
    ],
    blockingKey: 'network_segment',
    thresholds: { autoMerge: 90, reviewQueue: 60 },
    ambiguousAction: 'review_queue',
  },
  {
    entityType: 'identity',
    enabled: true,
    primaryKeys: [
      { id: 'pk1', attribute: 'email', algorithm: 'email_normalized', weight: 100 },
    ],
    secondaryKeys: [
      { id: 'sk1', attribute: 'display_name', algorithm: 'fuzzy', weight: 20, fuzzyMaxDistance: 2 },
    ],
    thresholds: { autoMerge: 95, reviewQueue: 70 },
    ambiguousAction: 'review_queue',
  },
  // vulnerability: match on cve_id + affected_host_id (exact)
  // finding: no auto-merge (each finding unique per source)
];

export const mockSourceTrustConfigs: SourceTrustConfig[] = [
  {
    entityType: 'host',
    sourcePriority: ['ServiceNow CMDB', 'CrowdStrike Falcon', 'Tenable.io Vulnerability', 'AWS Security Hub'],
    attributeExceptions: [
      { attribute: 'risk_score', authorativeSource: 'CrowdStrike Falcon' },
      { attribute: 'owner', authorativeSource: 'ServiceNow CMDB' },
      { attribute: 'vulnerability_count', authorativeSource: 'Tenable.io Vulnerability' },
    ],
    latestWinsAttributes: ['last_seen', 'last_modified'],
    mergeArrayAttributes: ['tags', 'labels'],
  },
];
```

**ResolutionStudio UI layout:**

Two-column layout: left sidebar (220px) lists entity types with a health chip per type
(green = clean, amber = some ambiguous, red = many unmatched). Right panel shows the config
for the selected entity type.

Right panel has three tabs: **Match Rules** | **Source Trust** | **Preview**

**Match Rules tab:**
- "Primary Match Keys" section: a table of match key rows. Each row:
  `[attribute dropdown] [algorithm dropdown] [weight input] [normalize steps chips] [× delete]`
  "+ Add primary key" button.
- "Secondary Keys" section: same structure but with weight contributing to confidence bonus.
- "Blocking Key" dropdown: optional, narrows comparison space.
- "Match Thresholds" row: two number sliders: Auto-merge ≥ [90]% | Review queue ≥ [60]%
- "On ambiguous match" radio: Review queue / Auto-merge / Create separate

**Source Trust tab:**
- Draggable source priority list (sources that feed this entity type, ordered by trust)
- "Exceptions" table: attribute + authoritative source (override priority for specific attrs)
- "Latest wins for" token input: attributes where newest value always wins
- "Merge arrays from" token input: array-type attributes to union across all sources

**Preview tab:**
Show a simulated merge of two sample entities (hardcode plausible examples per entity type).
Side-by-side table: Source A values | Source B values | Golden Record (with "why" annotations).

---

### ⬜ 2.3 — Disambiguation Queue (`/configuration/disambiguation`)

**What:** The "342 pending" backlog needs a proper review UI. Currently only shown as a number.

**New file:** `src/pages/config/DisambiguationQueue.tsx`

**New types:**
```typescript
interface DisambiguationCandidate {
  id: string;
  entityType: KGEntityType;
  confidence: number;              // 0-100
  sourceA: { pipelineName: string; attributes: Record<string, string> };
  sourceB: { pipelineName: string; attributes: Record<string, string> };
  matchedOn: string[];             // which keys matched
  unmatchedKeys: string[];         // which keys were missing/different
  createdAt: string;
  status: 'pending' | 'merged' | 'rejected' | 'deferred';
}
```

**Mock data to add (`mockDisambiguationCandidates`):** ~15 candidates across host, identity,
vulnerability entity types with varying confidence levels (50–89%).

**DisambiguationQueue UI:**

Top bar: filters (Entity Type ▾ | Source ▾ | Confidence ▾) + bulk action buttons
(Merge Selected | Reject Selected | Export).

Count chips: "342 pending  ·  12 new today  ·  87 merged this week"

List of candidate cards. Each card:
```
HOST  ·  78% confidence                              [Merge ✓] [Reject ✗] [Defer →]

  Entity A (CrowdStrike Falcon)   Entity B (Tenable.io)
  hostname:   PROD-WEB-01         hostname:  prod-web-01.acme.com      ← normalized match
  ip_address: 10.0.1.42           ip_address: 10.0.1.42               ← exact match ✓
  os:         Windows 11 21H2     os:         Windows 11               ← similar
  owner:      —                   owner:      Platform Team

  Matched on: hostname (normalized) ✓   ip_address ✓
  Unmatched:  mac_address (missing in both)
```

On Merge: show a "Golden record preview" confirmation modal before committing.
On Reject: log the rejection and suppress future match attempts between these two.
A "Create auto-rule" button per card: "I keep seeing this pattern — turn it into an auto-merge rule."

---

### ⬜ 2.4 — Relationship Inference Rules (within Resolution Studio)

**What:** A fourth tab in ResolutionStudio (or a section below the entity type config) where the
analyst defines cross-source relationship creation rules.

**File to modify:** `src/pages/config/ResolutionStudio.tsx` (add tab or section)

**New types:**
```typescript
interface RelationshipInferenceRule {
  id: string;
  name: string;
  enabled: boolean;
  sourceEntityType: KGEntityType;
  targetEntityType: KGEntityType;
  relationshipType: string;          // e.g. 'DETECTED_ON', 'EXPOSED_TO'
  conditions: {
    sourceAttribute: string;
    matchType: 'equals' | 'references_via' | 'contains' | 'present_in';
    targetAttribute: string;
    viaRelationship?: string;        // for 'references_via' — intermediate relationship
  }[];
  additionalConditions?: RecordFilterGroup;
  relationshipAttributes?: Record<string, string>;  // static attrs on created relationship
  schedule: 'realtime' | 'batch' | 'manual';
  estimatedCount?: number;           // preview: how many relationships would be created
}
```

**Mock data:** 5–8 pre-configured inference rules matching the currently hardcoded KG edges:
- finding → host via DETECTED_ON (when finding.host_id = host.id)
- vulnerability → host via AFFECTS (when vulnerability.host_id = host.id)
- identity → account via BELONGS_TO (when identity.account_id = account.id)
- identity → host via HAS_ACCESS_TO (when identity.id in host.access_list)
- plus 2–3 cross-source "advanced" rules

**UI — "Inference Rules" tab in ResolutionStudio:**

Table of rules with columns: Name | Source → Relationship → Target | Schedule | Est. Count | Enabled toggle | Edit.

"+ Add rule" opens a drawer with the rule builder:
- Source entity type → dropdown
- Target entity type → dropdown
- Relationship type → dropdown (from Relationship Catalog or free text)
- Conditions: structured builder (source attribute + match type + target attribute)
- Schedule: radio
- "Preview" button → shows estimated count from mock data

---

## Phase 3 — Enrichment Configuration

---

### ⬜ 3.1 — Enrichment Source Registry & Rules (`/configuration/enrichment`)

**What:** New page where analyst manages external enrichment sources and defines per-entity rules.

**New file:** `src/pages/config/EnrichmentConfig.tsx`

**New types:**
```typescript
interface EnrichmentSource {
  id: string;
  name: string;
  type: 'nvd' | 'virustotal' | 'geoip' | 'shodan' | 'hibp' | 'cve_trends' | 'custom_http';
  credentialId?: string;
  rateLimitPerMin: number;
  cacheTtlHours: number;
  enabled: boolean;
  failureBehaviour: 'skip_silently' | 'mark_pending' | 'alert';
  status: 'connected' | 'error' | 'unconfigured';
  lastUsed?: string;
}

interface EnrichmentRule {
  id: string;
  entityType: KGEntityType;
  sourceId: string;
  condition?: RecordFilterGroup;      // only enrich when this is true
  fieldsToPopulate: string[];         // which entity attributes to fill
  cacheTtlHours: number;
  schedule: 'realtime' | 'batch' | 'on_demand';
  priority: number;
  enabled: boolean;
}
```

**Mock data:**
```typescript
export const mockEnrichmentSources: EnrichmentSource[] = [
  { id: 'nvd',         name: 'NVD (NIST)',        type: 'nvd',         rateLimitPerMin: 60,
    cacheTtlHours: 24,  enabled: true,  failureBehaviour: 'mark_pending',  status: 'connected' },
  { id: 'geoip',       name: 'MaxMind GeoIP',     type: 'geoip',       rateLimitPerMin: 1000,
    cacheTtlHours: 168, enabled: true,  failureBehaviour: 'skip_silently', status: 'connected' },
  { id: 'virustotal',  name: 'VirusTotal',         type: 'virustotal',  rateLimitPerMin: 4,
    cacheTtlHours: 48,  enabled: false, failureBehaviour: 'skip_silently', status: 'unconfigured' },
  { id: 'shodan',      name: 'Shodan',             type: 'shodan',      rateLimitPerMin: 60,
    cacheTtlHours: 24,  enabled: false, failureBehaviour: 'skip_silently', status: 'unconfigured' },
];

export const mockEnrichmentRules: EnrichmentRule[] = [
  { id: 'er1', entityType: 'vulnerability', sourceId: 'nvd',
    condition: { logic: 'AND', conditions: [{ id:'c1', field:'cve_id', operator:'starts_with', value:'CVE-' }] },
    fieldsToPopulate: ['cvss_score', 'cvss_vector', 'affected_products', 'patch_available'],
    cacheTtlHours: 24, schedule: 'batch', priority: 1, enabled: true },
  { id: 'er2', entityType: 'host', sourceId: 'geoip',
    condition: { logic: 'AND', conditions: [{ id:'c1', field:'internet_facing', operator:'equals', value:'true' }] },
    fieldsToPopulate: ['geo_country', 'geo_city', 'geo_asn'],
    cacheTtlHours: 168, schedule: 'batch', priority: 2, enabled: true },
];
```

**EnrichmentConfig UI:**

Two sections side by side: Sources (left, 380px) and Rules (right, flex-1).

Sources section: a card per source with: logo/icon, name, status badge (connected / error /
unconfigured), rate limit, cache TTL, enabled toggle, "Configure" button.
"+ Add custom HTTP source" opens a drawer.

Rules section: a table of enrichment rules with columns:
Entity Type | Source | Condition | Fields | Schedule | Enabled toggle | Edit (pencil).
"+ Add rule" opens a drawer with the full rule builder.

Bottom strip: enrichment statistics — "X entities enriched today · Y pending · Z failed · Cache hit rate: 84%"

---

## Phase 4 — Domain Rules Engine

---

### ⬜ 4.1 — Tagging Rules (`/configuration/rules`)

**What:** Analyst defines rules that auto-tag entities based on conditions. The most direct way
for an analyst to encode domain knowledge.

**New file:** `src/pages/config/RulesEngine.tsx`

**New types:**
```typescript
type RuleAction =
  | { type: 'apply_tag';        tag: string }
  | { type: 'set_attribute';    attribute: string; value: string }
  | { type: 'set_priority';     level: 'critical' | 'high' | 'medium' | 'low' }
  | { type: 'propagate_tag';    tag: string; viaRelationship: string; depth: number }
  | { type: 'create_finding';   severity: string; title: string }
  | { type: 'notify';           channel: string };

interface DomainRule {
  id: string;
  name: string;
  description: string;
  entityType: KGEntityType;
  conditions: RecordFilterGroup;     // re-uses filter type from Phase 1
  actions: RuleAction[];
  schedule: 'realtime' | 'hourly' | 'daily' | 'manual';
  enabled: boolean;
  lastRun?: string;
  matchCount?: number;
  createdAt: string;
}

interface TagDefinition {
  name: string;          // e.g. "critical-exposure"
  label: string;         // display label
  color: string;         // hex
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
}
```

**Mock data:**
```typescript
export const mockTagDefinitions: TagDefinition[] = [
  { name: 'critical-exposure',  label: 'Critical Exposure',  color: '#D12329', severity: 'critical',
    description: 'Internet-facing host with unpatched critical CVE' },
  { name: 'high-risk-identity', label: 'High Risk Identity',  color: '#D98B1D', severity: 'high',
    description: 'Identity with admin access and MFA disabled' },
  { name: 'pci-scope',          label: 'PCI Scope',           color: '#6360D8', severity: 'info',
    description: 'Asset in PCI DSS cardholder data environment' },
  { name: 'eol-software',       label: 'EOL Software',        color: '#D98B1D', severity: 'medium',
    description: 'Host running end-of-life OS or software' },
];

export const mockDomainRules: DomainRule[] = [
  {
    id: 'r1', name: 'Flag internet-facing hosts with critical CVEs',
    entityType: 'host',
    conditions: { logic: 'AND', conditions: [
      { id:'c1', field:'internet_facing', operator:'equals', value:'true' },
      { id:'c2', field:'vulnerability_count_critical', operator:'greater_than', value:'0' },
    ]},
    actions: [
      { type: 'apply_tag', tag: 'critical-exposure' },
      { type: 'set_priority', level: 'critical' },
    ],
    schedule: 'hourly', enabled: true, matchCount: 14, createdAt: '2026-01-15',
  },
  {
    id: 'r2', name: 'Flag admin identities without MFA',
    entityType: 'identity',
    conditions: { logic: 'AND', conditions: [
      { id:'c1', field:'mfa_enabled', operator:'equals', value:'false' },
      { id:'c2', field:'privilege_level', operator:'equals', value:'admin' },
    ]},
    actions: [{ type: 'apply_tag', tag: 'high-risk-identity' }],
    schedule: 'realtime', enabled: true, matchCount: 6, createdAt: '2026-02-01',
  },
];
```

**RulesEngine UI:**

Left sidebar: tabs for "Tagging Rules" | "Risk Scoring" | "Criticality" | "Tag Library"

Tagging Rules tab (default):
- Table of rules: Name | Entity Type | Conditions summary | Actions summary | Schedule | Match count | Enabled | Edit
- "Run now" button per row (triggers manual execution)
- "+ Add rule" → drawer with full rule builder:
  - Name + description
  - Entity type selector
  - Condition builder (same component as Record Filter Builder from Phase 1)
  - Actions builder: "+ Add action" dropdown (Apply tag / Set attribute / Set priority / Notify)
  - Schedule radio
  - "Test rule" → shows count of entities that would match today

Tag Library tab: grid of TagDefinition cards. "+ Create tag" form (name, label, color picker,
severity, description).

---

### ⬜ 4.2 — Risk Scoring Model (within RulesEngine)

**What:** Visual risk score builder per entity type. Analyst defines contributing factors and weights.

**File to modify:** `src/pages/config/RulesEngine.tsx` — "Risk Scoring" tab

**New types:**
```typescript
interface RiskFactor {
  id: string;
  condition: RecordFilterGroup;
  scoreDelta: number;              // positive = adds risk, negative = reduces risk
  label: string;                   // e.g. "Internet-facing host"
}

interface RiskScoringModel {
  entityType: KGEntityType;
  factors: RiskFactor[];
  clampMin: number;                // default 0
  clampMax: number;                // default 100
  decayPerDayWithNoFindings: number;  // reduce score by this per day if no new activity
  rollupRule?: {
    fromRelationship: string;
    fromEntityType: KGEntityType;
    weight: number;                // how much child entity scores influence parent
  };
}
```

**UI — Risk Scoring tab:**
Entity type selector at top. Below: a list of scoring factors (same structure as domain rules).
Each factor: condition builder (collapsed) → score delta (+/- stepper) → label.
Clamp range sliders. Decay field. Roll-up section.

Preview: sample entity shown with score breakdown — which factors triggered, what score each added.

---

### ⬜ 4.3 — Criticality Classification (within RulesEngine)

**What:** Analyst marks entities as business-critical via criteria or manual override.

**File to modify:** `src/pages/config/RulesEngine.tsx` — "Criticality" tab

**Types:**
```typescript
interface CriticalityRule {
  id: string;
  entityType: KGEntityType;
  condition: RecordFilterGroup;
  level: 'mission_critical' | 'business_critical' | 'important' | 'standard';
  propagate?: { viaRelationship: string; toEntityType: KGEntityType; depth: number };
}
```

**UI — Criticality tab:** Same table structure as Tagging Rules but actions are simpler (just level assignment + optional propagation config).

---

## Phase 5 — Entity Schema Editor

---

### ⬜ 5.1 — Schema Editor (`/configuration/schema`)

**What:** Analyst can view and extend entity type schemas — add custom attributes, define new
entity types, manage the relationship catalog.

**New file:** `src/pages/config/SchemaEditor.tsx`

**New types:**
```typescript
type AttributeType =
  'string' | 'integer' | 'float' | 'boolean' | 'timestamp' |
  'ip_address' | 'email' | 'hash' | 'url' | 'enum' | 'array_string' | 'cve_id';

interface EntityAttribute {
  name: string;
  displayLabel: string;
  type: AttributeType;
  required: boolean;
  pii: boolean;              // mask from Viewer role
  indexed: boolean;          // affects KG search
  validationPattern?: string;
  enumValues?: string[];     // if type === 'enum'
  defaultValue?: string;
  source: 'system' | 'custom';   // system attrs are read-only
  sourceHints?: string[];        // which connectors typically populate this
}

interface EntityTypeDefinition {
  type: KGEntityType | string;
  displayName: string;
  description: string;
  icon: string;              // lucide icon name
  color: string;
  attributes: EntityAttribute[];
  source: 'system' | 'custom';
}

interface RelationshipTypeDefinition {
  name: string;              // e.g. 'DETECTED_ON'
  label: string;             // e.g. 'Detected On'
  sourceEntityTypes: (KGEntityType | string)[];
  targetEntityTypes: (KGEntityType | string)[];
  cardinality: '1:1' | '1:many' | 'many:1' | 'many:many';
  directed: boolean;
  temporal: boolean;         // has valid_from / valid_to
  attributes: EntityAttribute[];
  source: 'system' | 'custom';
}
```

**UI:**
Three tabs: **Entity Types** | **Attributes** | **Relationship Catalog**

Entity Types tab: grid of entity type cards (system + custom). System cards are read-only but
show attributes. Custom cards have edit/delete. "+ Create entity type" form.

Attributes tab: entity type selector at top → shows all attributes for that type in a table:
Name | Type | Required | PII | Indexed | Source | Actions.
System attributes: read-only (grayed). Custom attributes: edit/delete.
"+ Add attribute" form: name, label, type, required toggle, PII toggle, validation pattern.

Relationship Catalog tab: table of relationship types with columns: Name | Source Types | Target Types |
Cardinality | Temporal | Source | Actions. "+ Add relationship type" form.

---

## Phase 6 — Governance & SLA Management

---

### ⬜ 6.1 — SLA Management Page (`/configuration/sla`)

**What:** Extend the per-entity SLA (currently inline-edited on Dashboard) into a dedicated
management page with cascade modeling and alert routing.

**New file:** `src/pages/config/SLAManagement.tsx`

**New types:**
```typescript
interface EntitySLAConfig {
  entityType: KGEntityType;
  freshnessThresholdHours: number;     // data older than this = stale
  criticalThresholdHours: number;      // data older than this = critical/no-data
  alertOnBreach: boolean;
  alertChannels: string[];
  cascadesTo?: string[];               // solution names that depend on this entity type
}

interface PipelineSLAConfig {
  pipelineId: string;
  maxRunDurationMinutes: number;
  maxDelayFromScheduleMinutes: number;
  alertOnBreach: boolean;
}
```

**UI:** Two sections: Entity Freshness SLA (table of all 16 entity types with threshold inputs
and cascade info) and Pipeline SLA (table of pipelines with duration + delay thresholds).
A "Cascade map" viz: entity type → affected solutions — shows what goes stale when a source is delayed.

---

### ⬜ 6.2 — Data Quality Rules

**What:** Analyst defines completeness and validity rules per entity type. Entities that don't
meet quality thresholds are flagged in the KG.

**Add to `src/pages/config/RulesEngine.tsx`** as a fifth tab: "Data Quality"

**Types:**
```typescript
interface DataQualityRule {
  id: string;
  entityType: KGEntityType;
  ruleType: 'completeness' | 'validity' | 'consistency';
  attribute?: string;              // for validity/completeness rules
  threshold?: number;              // for completeness: % of entities that must have this attr
  validationPattern?: string;      // for validity: regex
  crossSourceCheck?: {
    attribute: string;
    sourceA: string;
    sourceB: string;
    tolerance: number;             // acceptable difference for numeric attrs
  };
  action: 'flag' | 'quarantine' | 'alert';
  severity: 'critical' | 'high' | 'medium' | 'low';
}
```

**UI:** Data Quality tab in Rules Engine. Table of rules + quality score per entity type (% of
entities passing all rules). Clicking an entity type shows which entities are currently failing.

---

## 6. Shared Components to Build

These components will be used across multiple phases. Build them once, reuse everywhere.

### ⬜ `src/components/config/ConditionBuilder.tsx`
The core rule-building UI used in: Record Filter Builder (Phase 1), Extraction Conditions (Phase 1),
Disambiguation rules (Phase 2), Enrichment conditions (Phase 3), Domain Rules (Phase 4),
Data Quality (Phase 6).

Props:
```typescript
interface ConditionBuilderProps {
  value: RecordFilterGroup;
  onChange: (v: RecordFilterGroup) => void;
  availableFields: { name: string; type: AttributeType; label: string }[];
  maxDepth?: number;          // max nesting (default 2)
}
```

UI: Renders a group with AND/OR toggle + list of conditions/sub-groups. Each condition:
field dropdown → operator dropdown → value input (adapts by field type). "+ Add condition" and
"+ Add group" buttons. Recursive for sub-groups (up to maxDepth).

### ⬜ `src/components/config/RuleDrawer.tsx`
A full-width right drawer (like a panel) used for creating/editing rules across all pages.
Standard layout: header with rule name input + close button, scrollable body, sticky footer with
Save/Cancel. Used in all "Edit" and "+ Add" actions.

### ⬜ `src/components/config/SourceFieldPicker.tsx`
A searchable dropdown/picker for source fields. Shows field name, type badge, sample value.
Used in: Field Mapping Studio, Entity Extraction Config, Resolution Studio match key builder.

---

## 7. Implementation Notes

**State management:** Keep all config state local (useState) within each page. No global store
needed — each config page is self-contained. If page gets complex, split into sub-components
with prop drilling or useContext.

**Mock data pattern:** All config data lives in `src/data/mock.ts`. For new config pages, add
`mockX` exports. Pages import from `@/data/mock`. No API calls.

**Routing pattern:** New config sub-pages follow the same pattern:
```typescript
// App.tsx:
import ResolutionStudio from '@/pages/config/ResolutionStudio';
<Route path="configuration/resolution" element={<ResolutionStudio />} />
```
Create new directory `src/pages/config/` for all configuration sub-pages.

**Breadcrumb update:** Layout.tsx reads the path for breadcrumbs. The `configuration/resolution`
path will automatically show "Configuration > Resolution" if the breadcrumb logic uses
`pathname.split('/').filter(Boolean)`.

**Do not touch:**
- `src/pages/KnowledgeGraph.tsx` is 54KB and complex — avoid unless task specifically requires it
- `src/components/AIChatWidget.tsx` — not in scope
- Git: stay on branch `work/session-20260408`, do not push or merge to main

---

## 8. Phase Summary & Status

| Phase | Description | Status |
|-------|-------------|--------|
| P1 Buyer Confidence | Config page cleanup, insight callout, KG search | ✅ Complete |
| P2 Operational Credibility | Onboarding, Fix Pipeline, Dry Run preview | ✅ Complete |
| P3 Completeness | SLA editing, trend chart, scroll zoom | ✅ Complete |
| Phase 1 | Intra-loader: Field Mapper, Filters, Extraction, Resolve | ⬜ Not started |
| Phase 2 | Inter-loader: Resolution Studio, Disambiguation Queue, Inference | ⬜ Not started |
| Phase 3 | Enrichment: Source Registry, Rules, Dashboard | ⬜ Not started |
| Phase 4 | Domain Rules Engine: Tagging, Risk Scoring, Criticality | ⬜ Not started |
| Phase 5 | Schema Editor: Entity Types, Attributes, Relationship Catalog | ⬜ Not started |
| Phase 6 | Governance: SLA Page, Data Quality Rules | ⬜ Not started |

**Recommended implementation order:**
1. Phase 2 nav changes (2.1) first — unlocks routing for all new pages
2. Phase 1 features — highest immediate value, builds on existing PipelineBuilder
3. Phase 2 Resolution Studio — highest strategic value
4. Phase 2 Disambiguation Queue — unblocks the 342-item backlog in the dashboard
5. Phase 3 Enrichment — adds depth to the KG
6. Phase 4 Rules Engine — the analyst's "power tool"
7. Phase 5 Schema Editor — needed for long-term extensibility
8. Phase 6 Governance — polish and enterprise readiness

---

*Last updated: 2026-04-08 on branch work/session-20260408*
*This file is the source of truth for all planned features. Keep it updated as features complete.*
