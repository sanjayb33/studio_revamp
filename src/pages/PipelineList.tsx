import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Check, Search, Filter, Play, Pause, Trash2, Eye,
  ChevronDown, ChevronUp, Plus, X, MoreHorizontal, Layers,
  Database, Network, Upload, Zap, ArrowRight,
} from 'lucide-react';
import { mockPipelines } from '@/data/mock';
import type { Pipeline, PipelineStatus, KGEntityType, StageStatus } from '@/types';

// ─── Configs ─────────────────────────────────────────────────────────────────

type SortKey = 'name' | 'status' | 'lastRun' | 'records' | 'connector';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 10;

const STATUS_BADGE: Record<PipelineStatus, { bg: string; color: string; label: string }> = {
  active:  { bg: '#EFF7ED', color: '#31A56D', label: 'Active' },
  paused:  { bg: '#FEF3C7', color: '#D98B1D', label: 'Paused' },
  failed:  { bg: '#F9EEEE', color: '#D12329', label: 'Failed' },
  running: { bg: '#f0f0fc', color: '#6360D8', label: 'Running' },
};

const ENTITY_COLORS: Record<KGEntityType, { bg: string; color: string }> = {
  host:              { bg: 'rgba(14,165,233,0.1)',   color: '#0EA5E9' },
  identity:          { bg: 'rgba(219,39,119,0.1)',   color: '#DB2777' },
  vulnerability:     { bg: 'rgba(220,38,38,0.1)',    color: '#DC2626' },
  finding:           { bg: 'rgba(99,96,216,0.1)',    color: '#6360D8' },
  account:           { bg: 'rgba(124,58,237,0.1)',   color: '#7C3AED' },
  person:            { bg: 'rgba(8,145,178,0.1)',    color: '#0891B2' },
  application:       { bg: 'rgba(217,119,6,0.1)',    color: '#D97706' },
  network:           { bg: 'rgba(5,150,105,0.1)',    color: '#059669' },
  'network-interface': { bg: 'rgba(236,72,153,0.1)', color: '#EC4899' },
  'network-services':  { bg: 'rgba(101,163,13,0.1)', color: '#65A30D' },
  'cloud-account':   { bg: 'rgba(109,40,217,0.1)',   color: '#6D28D9' },
  'cloud-container': { bg: 'rgba(167,139,250,0.1)',  color: '#A78BFA' },
  'cloud-cluster':   { bg: 'rgba(37,99,235,0.1)',    color: '#2563EB' },
  'cloud-storage':   { bg: 'rgba(59,130,246,0.1)',   color: '#3B82F6' },
  assessment:        { bg: 'rgba(180,83,9,0.1)',     color: '#B45309' },
  Group:             { bg: 'rgba(13,148,136,0.1)',   color: '#0D9488' },
};

const STAGE_COLORS: Record<StageStatus, string> = {
  healthy: '#31A56D',
  warning: '#D98B1D',
  error:   '#D12329',
  idle:    '#CFCFCF',
  running: '#6360D8',
};

const STAGE_LABELS = ['Ingest', 'Parse', 'Extract', 'Resolve', 'Publish'];

// ─── Stage health mini-bar ────────────────────────────────────────────────────

function StageHealthBar({ pipeline }: { pipeline: Pipeline }) {
  if (!pipeline.stages || pipeline.stages.length === 0) {
    // Show all grey if no stage data
    return (
      <div className="flex items-center gap-0.5">
        {STAGE_LABELS.map(l => (
          <div key={l} className="rounded-[2px]" style={{ width: 10, height: 10, background: '#CFCFCF' }} />
        ))}
      </div>
    );
  }

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="flex items-center gap-0.5">
        {pipeline.stages.map((stage, i) => (
          <Tooltip.Root key={stage.name}>
            <Tooltip.Trigger asChild>
              <div
                className="rounded-[2px] cursor-default"
                style={{
                  width: 10,
                  height: 10,
                  background: STAGE_COLORS[stage.status],
                  opacity: stage.status === 'idle' ? 0.4 : 1,
                  transition: 'transform 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.3)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
            </Tooltip.Trigger>
            <Tooltip.Content
              side="top"
              className="rounded-[4px] text-[11px] font-medium px-2 py-1 z-50"
              style={{
                background: '#1a1a2e',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                maxWidth: 200,
              }}
            >
              <p>{STAGE_LABELS[i]}: <span style={{ color: STAGE_COLORS[stage.status] }}>{stage.status}</span></p>
              {stage.errorMessage && (
                <p className="mt-0.5 opacity-80 text-[10px]">
                  {stage.errorMessage.substring(0, 80)}{stage.errorMessage.length > 80 ? '…' : ''}
                </p>
              )}
              {stage.recordsIn !== undefined && (
                <p className="mt-0.5 opacity-70 text-[10px]">
                  {stage.recordsIn.toLocaleString()} in → {stage.recordsOut?.toLocaleString()} out
                </p>
              )}
              <Tooltip.Arrow style={{ fill: '#1a1a2e' }} />
            </Tooltip.Content>
          </Tooltip.Root>
        ))}
      </div>
    </Tooltip.Provider>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────

function DeleteModal({
  pipeline,
  onConfirm,
  onCancel,
}: {
  pipeline: Pipeline;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog.Root open>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        />
        <Dialog.Content
          className="fixed z-50 rounded-[6px] flex flex-col"
          style={{
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 420,
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            padding: '24px',
          }}
        >
          <Dialog.Title
            className="text-[14px] font-semibold mb-2"
            style={{ color: 'var(--shell-text)' }}
          >
            Delete Pipeline
          </Dialog.Title>
          <Dialog.Description className="text-[12px] leading-relaxed mb-4" style={{ color: 'var(--shell-text-muted)' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--shell-text)' }}>{pipeline.name}</strong>?
            This will permanently remove all pipeline configuration, stage settings, and execution history.
            KG entities already ingested will not be removed.
          </Dialog.Description>
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onCancel}
              style={{ fontSize: 12, color: 'var(--shell-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '7px 12px' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="text-[12px] font-medium rounded-[44px]"
              style={{ padding: '7px 16px', background: '#D12329', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              Delete Pipeline
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PipelineList() {
  const navigate = useNavigate();
  const { setPageActions } = useOutletContext<{ setPageActions: (n: React.ReactNode) => void }>();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Pipeline | null>(null);
  const [pipelines, setPipelines] = useState(mockPipelines);

  useEffect(() => {
    setPageActions(
      <button
        onClick={() => navigate('/templates')}
        className="flex items-center gap-2 text-[12px] font-medium"
        style={{ padding: '6px 14px', background: 'var(--shell-accent)', color: '#fff', border: 'none', borderRadius: 44, cursor: 'pointer' }}
      >
        <Plus size={13} /> New Pipeline
      </button>
    );
    return () => setPageActions(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = pipelines
    .filter(p => {
      const matchSearch = !search
        || p.name.toLowerCase().includes(search.toLowerCase())
        || p.connector.toLowerCase().includes(search.toLowerCase())
        || p.targetEntities?.some(e => e.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      return a[sortKey] > b[sortKey] ? dir : -dir;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected = paginated.length > 0 && paginated.every(p => selected.has(p.id));
  const someSelected = selected.size > 0;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleAll = () => {
    if (allSelected) setSelected(prev => { const s = new Set(prev); paginated.forEach(p => s.delete(p.id)); return s; });
    else setSelected(prev => { const s = new Set(prev); paginated.forEach(p => s.add(p.id)); return s; });
  };

  const toggleRow = (id: string) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : null;


  return (
    <div style={{ padding: '24px 28px' }}>

      {/* Header */}
      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1" style={{ maxWidth: 300 }}>
          <Search size={13} className="absolute" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ctrl-placeholder)' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, connector, entity type…"
            className="w-full text-[12px] rounded-[4px]"
            style={{ padding: '7px 10px 7px 30px', background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--shell-text)', outline: 'none' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <DropdownMenu.Root modal={false}>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex items-center gap-2 rounded-[44px] px-3 py-1.5 text-[12px]"
              style={{
                background: statusFilter !== 'all' ? '#e0dff7' : 'transparent',
                color: statusFilter !== 'all' ? '#504bb8' : 'var(--shell-text)',
                border: '1px solid var(--ctrl-border)',
                cursor: 'pointer',
              }}
            >
              <Filter size={12} />
              {statusFilter === 'all' ? 'All Statuses' : STATUS_BADGE[statusFilter as PipelineStatus].label}
              <ChevronDown size={12} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            className="rounded-[6px] overflow-hidden z-50"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', minWidth: 150, padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {(['all', 'active', 'paused', 'failed'] as const).map(s => (
              <DropdownMenu.Item
                key={s}
                onSelect={() => { setStatusFilter(s); setPage(1); }}
                className="flex items-center gap-2 px-3 py-2 rounded-[4px] cursor-pointer outline-none text-[12px]"
                style={{ color: 'var(--shell-text)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--shell-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {s === 'all' ? 'All Statuses' : STATUS_BADGE[s as PipelineStatus].label}
                {statusFilter === s && <Check size={12} style={{ color: 'var(--shell-accent)', marginLeft: 'auto' }} />}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>


        {/* Stage legend */}
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>Stage health:</span>
          {(['healthy', 'warning', 'error', 'idle'] as StageStatus[]).map(s => (
            <span key={s} className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
              <span className="rounded-[2px]" style={{ width: 8, height: 8, display: 'inline-block', background: STAGE_COLORS[s], opacity: s === 'idle' ? 0.4 : 1 }} />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          ))}
        </div>
      </div>

      {/* Bulk action toolbar */}
      {someSelected && (
        <div
          className="flex items-center gap-3 rounded-[4px] px-4 py-2 mb-3"
          style={{ background: 'var(--shell-active)', border: '1px solid rgba(99,96,216,0.3)' }}
        >
          <span className="text-[12px] font-medium" style={{ color: 'var(--shell-text)' }}>
            {selected.size} selected
          </span>
          <div className="flex-1" />
          <button className="flex items-center gap-1.5 rounded-[44px] px-3 py-1.5 text-[12px]"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}>
            <Play size={12} /> Run Selected
          </button>
          <button className="flex items-center gap-1.5 rounded-[44px] px-3 py-1.5 text-[12px]"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}>
            <Pause size={12} /> Pause Selected
          </button>
          <button className="flex items-center gap-1.5 rounded-[44px] px-3 py-1.5 text-[12px]"
            style={{ background: '#F9EEEE', border: '1px solid #D12329', cursor: 'pointer', color: '#D12329' }}
            onClick={() => setSelected(new Set())}>
            <X size={12} /> Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[4px] overflow-hidden" style={{ border: '1px solid var(--table-border)', background: 'var(--card-bg)' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--table-th-bg)' }}>
              {/* Checkbox */}
              <th style={{ width: 40, padding: '9px 12px', textAlign: 'center', borderBottom: '1px solid var(--table-border)' }}>
                <Checkbox.Root
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  className="flex items-center justify-center rounded-[3px]"
                  style={{ width: 15, height: 15, background: allSelected ? 'var(--shell-accent)' : 'var(--ctrl-bg)', border: `1px solid ${allSelected ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`, cursor: 'pointer' }}
                >
                  <Checkbox.Indicator><Check size={9} color="#fff" /></Checkbox.Indicator>
                </Checkbox.Root>
              </th>
              {([
                { key: 'name',      label: 'Pipeline' },
                { key: null,        label: 'KG Entities' },
                { key: null,        label: 'Stage Health' },
                { key: 'lastRun',   label: 'Last Run' },
                { key: 'records',   label: 'Records in KG' },
                { key: 'status',    label: 'Status' },
              ] as { key: SortKey | null; label: string }[]).map(col => (
                <th
                  key={col.label}
                  className={col.key ? 'cursor-pointer select-none' : ''}
                  style={{ padding: '9px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--shell-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--table-border)', whiteSpace: 'nowrap' }}
                  onClick={() => col.key && toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.key && <SortIcon col={col.key} />}
                  </span>
                </th>
              ))}
              <th style={{ width: 48, padding: '9px 14px', borderBottom: '1px solid var(--table-border)' }} />
            </tr>
          </thead>
          <tbody>
            {paginated.map((p, i) => {
              const cfg = STATUS_BADGE[p.status];
              const isLast = i === paginated.length - 1;
              return (
                <tr
                  key={p.id}
                  className="group"
                  style={{
                    borderBottom: isLast ? 'none' : '1px solid var(--table-border)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--shell-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Checkbox */}
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                    <Checkbox.Root
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggleRow(p.id)}
                      className="flex items-center justify-center rounded-[3px]"
                      style={{ width: 15, height: 15, background: selected.has(p.id) ? 'var(--shell-accent)' : 'var(--ctrl-bg)', border: `1px solid ${selected.has(p.id) ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`, cursor: 'pointer' }}
                    >
                      <Checkbox.Indicator><Check size={9} color="#fff" /></Checkbox.Indicator>
                    </Checkbox.Root>
                  </td>

                  {/* Pipeline name */}
                  <td style={{ padding: '10px 14px', maxWidth: 220 }}>
                    <button
                      onClick={() => navigate(`/pipeline/${p.id}`)}
                      className="text-left"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[12px] font-medium hover:underline" style={{ color: 'var(--shell-accent)' }}>
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {p.fromTemplate && (
                          <span
                            className="flex items-center gap-0.5 text-[10px] px-1 py-0 rounded-[3px]"
                            style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)', border: '1px solid rgba(99,96,216,0.2)' }}
                          >
                            <Layers size={9} /> {p.fromTemplate}
                          </span>
                        )}
                        <span className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>
                          {p.connector}
                        </span>
                      </div>
                    </button>
                  </td>

                  {/* Entity badges */}
                  <td style={{ padding: '10px 14px' }}>
                    <div className="flex flex-wrap gap-1">
                      {(p.targetEntities ?? []).map(e => {
                        const ec = ENTITY_COLORS[e] ?? { bg: 'var(--shell-raised)', color: 'var(--shell-text-muted)' };
                        return (
                          <span
                            key={e}
                            className="text-[10px] font-medium px-1.5 py-0.5 rounded-[3px]"
                            style={{ background: ec.bg, color: ec.color }}
                          >
                            {e}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Stage health */}
                  <td style={{ padding: '10px 14px' }}>
                    <div className="flex flex-col gap-1">
                      <StageHealthBar pipeline={p} />
                      <span className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>
                        {STAGE_LABELS.join(' › ')}
                      </span>
                    </div>
                  </td>

                  {/* Last run */}
                  <td style={{ padding: '10px 14px' }}>
                    <div className="text-[12px]" style={{ color: 'var(--shell-text)' }}>{p.lastRun}</div>
                    <div className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>{p.duration}</div>
                  </td>

                  {/* Records */}
                  <td style={{ padding: '10px 14px' }}>
                    <div className="text-[12px] font-medium tabular-nums" style={{ color: 'var(--shell-text)' }}>
                      {p.records}
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
                      {p.successRate}% success
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '10px 14px' }}>
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-[44px] w-fit"
                        style={{ background: cfg.bg, color: cfg.color }}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--shell-text-muted)' }}>
                        {p.status === 'active' || p.status === 'running' ? p.nextRun : p.status === 'failed' ? 'retry in 5 min' : 'paused'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '10px 12px' }}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <DropdownMenu.Root modal={false}>
                        <DropdownMenu.Trigger asChild>
                          <button
                            className="flex items-center justify-center rounded-full"
                            style={{ width: 26, height: 26, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content
                          className="rounded-[6px] overflow-hidden z-50"
                          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', minWidth: 150, padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          align="end"
                        >
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 rounded-[4px] cursor-pointer outline-none text-[12px]"
                            style={{ color: 'var(--shell-text)' }}
                            onSelect={() => navigate(`/pipeline/${p.id}`)}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--shell-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <Eye size={13} /> View Details
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 rounded-[4px] cursor-pointer outline-none text-[12px]"
                            style={{ color: 'var(--shell-text)' }}
                            onMouseEnter={e => (e.currentTarget.style.background = 'var(--shell-hover)')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            {p.status === 'active' ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Run Now</>}
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator style={{ height: 1, background: 'var(--shell-border)', margin: '4px 0' }} />
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 rounded-[4px] cursor-pointer outline-none text-[12px]"
                            style={{ color: '#D12329' }}
                            onSelect={() => setDeleteTarget(p)}
                            onMouseEnter={e => (e.currentTarget.style.background = '#F9EEEE')}
                            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                          >
                            <Trash2 size={13} /> Delete
                          </DropdownMenu.Item>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Empty state */}
        {paginated.length === 0 && (
          search ? (
            <div className="flex flex-col items-center justify-center py-14">
              <div className="text-[28px] mb-3">🔍</div>
              <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--shell-text)' }}>No pipelines found</p>
              <p className="text-[12px]" style={{ color: 'var(--shell-text-muted)' }}>
                No results for &ldquo;{search}&rdquo;. Try adjusting your search.
              </p>
            </div>
          ) : (
            /* First-run onboarding */
            <div className="flex flex-col items-center px-8 py-12" style={{ maxWidth: 680, margin: '0 auto' }}>
              {/* Icon + headline */}
              <div
                className="flex items-center justify-center rounded-[12px] mb-4"
                style={{ width: 52, height: 52, background: 'rgba(99,96,216,0.08)' }}
              >
                <Zap size={24} style={{ color: '#6360D8' }} />
              </div>
              <p className="text-[15px] font-bold mb-1 text-center" style={{ color: 'var(--shell-text)' }}>
                Build your first pipeline
              </p>
              <p className="text-[12px] text-center mb-8" style={{ color: 'var(--shell-text-muted)', maxWidth: 420 }}>
                Connect a data source, configure entity extraction, and publish enriched security data to your Knowledge Graph in minutes.
              </p>

              {/* 3-step guide */}
              <div className="grid gap-3 w-full mb-8" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                {[
                  {
                    num: 1, icon: Database, color: '#6360D8', bg: 'rgba(99,96,216,0.08)',
                    title: 'Connect a source',
                    body: 'Pick from 40+ connectors — EDR, SIEM, threat intel, cloud security, identity, and more.',
                  },
                  {
                    num: 2, icon: Network, color: '#31A56D', bg: 'rgba(49,165,109,0.08)',
                    title: 'Configure stages',
                    body: 'Define how raw events are parsed, what entities to extract, and how duplicates are resolved.',
                  },
                  {
                    num: 3, icon: Upload, color: '#0EA5E9', bg: 'rgba(14,165,233,0.08)',
                    title: 'Publish to KG',
                    body: 'Run a dry-run preview, then deploy. Your entities and relationships appear in the graph instantly.',
                  },
                ].map(step => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.num}
                      className="rounded-[6px] flex flex-col"
                      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', padding: '16px' }}
                    >
                      <div className="flex items-center gap-2.5 mb-3">
                        <div
                          className="rounded-[6px] flex items-center justify-center flex-shrink-0"
                          style={{ width: 30, height: 30, background: step.bg }}
                        >
                          <Icon size={14} style={{ color: step.color }} />
                        </div>
                        <span
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: step.bg, color: step.color }}
                        >
                          Step {step.num}
                        </span>
                      </div>
                      <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--shell-text)' }}>{step.title}</p>
                      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--shell-text-muted)' }}>{step.body}</p>
                    </div>
                  );
                })}
              </div>

              {/* CTAs */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/templates')}
                  className="flex items-center gap-2 text-[13px] font-semibold rounded-[44px]"
                  style={{ padding: '9px 20px', background: 'var(--shell-accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  <Layers size={13} /> Start with a template
                </button>
                <button
                  onClick={() => navigate('/pipeline/new')}
                  className="flex items-center gap-1.5 text-[12px] font-medium rounded-[44px]"
                  style={{ padding: '9px 16px', background: 'none', color: 'var(--shell-text-muted)', border: '1px solid var(--ctrl-border)', cursor: 'pointer' }}
                >
                  Build from scratch <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )
        )}

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: filtered.length > 0 ? '1px solid var(--table-border)' : 'none' }}
        >
          <span style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>
            {filtered.length === 0 ? 'No results' : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className="flex items-center justify-center rounded-[4px]"
                style={{
                  width: 28, height: 28, fontSize: 12,
                  border: n === page ? '1px solid var(--shell-accent)' : '1px solid var(--ctrl-border)',
                  background: n === page ? 'var(--shell-active)' : 'transparent',
                  color: n === page ? 'var(--shell-accent)' : 'var(--shell-text)',
                  cursor: 'pointer',
                  fontWeight: n === page ? 600 : 400,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteModal
          pipeline={deleteTarget}
          onConfirm={() => {
            setPipelines(prev => prev.filter(p => p.id !== deleteTarget.id));
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
