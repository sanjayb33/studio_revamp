import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Check,
  Search,
  Filter,
  Play,
  Pause,
  Trash2,
  Eye,
  Edit,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  MoreHorizontal,
} from 'lucide-react';
import { mockPipelines } from '@/data/mock';
import type { Pipeline, PipelineStatus } from '@/types';

type SortKey = 'name' | 'status' | 'lastRun' | 'records' | 'connector';
type SortDir = 'asc' | 'desc';

const STATUS_BADGE: Record<PipelineStatus, { bg: string; color: string; label: string }> = {
  active: { bg: '#EFF7ED', color: '#31A56D', label: 'Active' },
  paused: { bg: '#FEF3C7', color: '#D98B1D', label: 'Paused' },
  failed: { bg: '#F9EEEE', color: '#D12329', label: 'Failed' },
  running: { bg: '#f0f0fc', color: '#6360D8', label: 'Running' },
};

const PAGE_SIZE = 10;

export default function PipelineList() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PipelineStatus | 'all'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Pipeline | null>(null);

  // Filter + sort
  const filtered = mockPipelines
    .filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.connector.toLowerCase().includes(search.toLowerCase()) ||
        p.target.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      return a[sortKey] > b[sortKey] ? dir : -dir;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allSelected = paginated.length > 0 && paginated.every((p) => selected.has(p.id));
  const someSelected = selected.size > 0;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => { const s = new Set(prev); paginated.forEach((p) => s.delete(p.id)); return s; });
    } else {
      setSelected((prev) => { const s = new Set(prev); paginated.forEach((p) => s.add(p.id)); return s; });
    }
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
    ) : null;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Sub-header */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--shell-text)' }}>Pipelines</div>
        <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>
          Data Ingestion Studio / <span style={{ color: 'var(--shell-accent)' }}>All Pipelines</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 flex-1 max-w-sm rounded-[8px] px-3 py-2"
          style={{ background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)' }}
        >
          <Search size={13} style={{ color: 'var(--ctrl-placeholder)', flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search pipelines…"
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: 'var(--shell-text)', width: '100%' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)', padding: 0 }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Status filter */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex items-center gap-2 rounded-[44px] px-3 py-1.5"
              style={{
                fontSize: 12,
                background: statusFilter !== 'all' ? '#e0dff7' : 'transparent',
                color: statusFilter !== 'all' ? '#504bb8' : 'var(--shell-text)',
                border: '1px solid var(--ctrl-border)',
                cursor: 'pointer',
              }}
            >
              <Filter size={12} />
              {statusFilter === 'all' ? 'Status' : STATUS_BADGE[statusFilter as PipelineStatus].label}
              <ChevronDown size={12} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            className="rounded-[8px] overflow-hidden z-50"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', minWidth: 140, padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            {(['all', 'active', 'paused', 'failed'] as const).map((s) => (
              <DropdownMenu.Item
                key={s}
                onSelect={() => { setStatusFilter(s); setPage(1); }}
                className="flex items-center gap-2 px-3 py-2 rounded-[4px] cursor-pointer outline-none"
                style={{ fontSize: 12, color: 'var(--shell-text)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--shell-hover)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                {s === 'all' ? 'All Statuses' : STATUS_BADGE[s as PipelineStatus].label}
                {statusFilter === s && <Check size={12} style={{ color: 'var(--shell-accent)' }} />}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <div className="flex-1" />

        <button
          onClick={() => navigate('/pipeline/new')}
          className="flex items-center gap-2 rounded-[44px] px-4 py-2"
          style={{ background: 'var(--shell-accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-dark)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--shell-accent)'; }}
        >
          <Plus size={14} />
          New Pipeline
        </button>
      </div>

      {/* Bulk toolbar */}
      {someSelected && (
        <div
          className="flex items-center gap-3 rounded-[4px] px-4 py-2"
          style={{ background: 'var(--shell-active)', border: '1px solid var(--shell-accent)' }}
        >
          <span style={{ fontSize: 12, color: 'var(--shell-text)', fontWeight: 500 }}>
            {selected.size} selected
          </span>
          <div className="flex-1" />
          <button
            className="flex items-center gap-1.5 rounded-[44px] px-3 py-1.5"
            style={{ fontSize: 12, background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}
          >
            <Play size={12} /> Run Selected
          </button>
          <button
            className="flex items-center gap-1.5 rounded-[44px] px-3 py-1.5"
            style={{ fontSize: 12, background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}
          >
            <Pause size={12} /> Pause Selected
          </button>
          <button
            className="flex items-center gap-1.5 rounded-[44px] px-3 py-1.5"
            style={{ fontSize: 12, background: '#F9EEEE', border: '1px solid #D12329', cursor: 'pointer', color: '#D12329' }}
            onClick={() => setSelected(new Set())}
          >
            <X size={12} /> Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-[4px] overflow-hidden" style={{ border: '1px solid var(--table-border)' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--table-th-bg)' }}>
              <th style={{ width: 40, padding: '8px 12px', textAlign: 'center', borderBottom: '1px solid var(--table-border)' }}>
                <Checkbox.Root
                  checked={allSelected}
                  onCheckedChange={toggleAll}
                  className="flex items-center justify-center rounded-[2px]"
                  style={{ width: 16, height: 16, background: allSelected ? 'var(--shell-accent)' : 'var(--ctrl-bg)', border: `1px solid ${allSelected ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`, cursor: 'pointer' }}
                >
                  <Checkbox.Indicator>
                    <Check size={10} color="#fff" />
                  </Checkbox.Indicator>
                </Checkbox.Root>
              </th>
              {([
                { key: 'name', label: 'Pipeline Name' },
                { key: 'connector', label: 'Connector' },
                { key: 'lastRun', label: 'Last Run' },
                { key: 'records', label: 'Records' },
                { key: 'status', label: 'Status' },
              ] as { key: SortKey; label: string }[]).map((col) => (
                <th
                  key={col.key}
                  className="cursor-pointer select-none"
                  style={{ padding: '8px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--shell-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--table-border)', whiteSpace: 'nowrap' }}
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label} <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
              <th style={{ width: 48, padding: '8px 16px', borderBottom: '1px solid var(--table-border)' }} />
            </tr>
          </thead>
          <tbody>
            {paginated.map((p) => {
              const cfg = STATUS_BADGE[p.status];
              return (
                <tr
                  key={p.id}
                  className="group"
                  style={{ borderBottom: '1px solid var(--table-border)', cursor: 'default' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--shell-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'; }}
                >
                  {/* Checkbox */}
                  <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                    <Checkbox.Root
                      checked={selected.has(p.id)}
                      onCheckedChange={() => toggleRow(p.id)}
                      className="flex items-center justify-center rounded-[2px]"
                      style={{ width: 16, height: 16, background: selected.has(p.id) ? 'var(--shell-accent)' : 'var(--ctrl-bg)', border: `1px solid ${selected.has(p.id) ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`, cursor: 'pointer' }}
                    >
                      <Checkbox.Indicator>
                        <Check size={10} color="#fff" />
                      </Checkbox.Indicator>
                    </Checkbox.Root>
                  </td>
                  {/* Name */}
                  <td style={{ padding: '8px 16px' }}>
                    <button
                      onClick={() => navigate(`/pipeline/${p.id}`)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--shell-accent)', padding: 0 }}
                    >
                      {p.name}
                    </button>
                    <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>{p.schedule}</div>
                  </td>
                  {/* Connector */}
                  <td style={{ padding: '8px 16px', fontSize: 12, color: 'var(--shell-text)' }}>
                    {p.connector} → {p.target}
                  </td>
                  {/* Last Run */}
                  <td style={{ padding: '8px 16px', fontSize: 12, color: 'var(--shell-text)' }}>
                    <div>{p.lastRun}</div>
                    <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>{p.duration}</div>
                  </td>
                  {/* Records */}
                  <td style={{ padding: '8px 16px', fontSize: 12, color: 'var(--shell-text)', fontVariantNumeric: 'tabular-nums' }}>
                    {p.records}
                  </td>
                  {/* Status */}
                  <td style={{ padding: '8px 16px' }}>
                    <span
                      className="rounded-[4px] px-2 py-0.5"
                      style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600 }}
                    >
                      {cfg.label}
                    </span>
                  </td>
                  {/* Actions */}
                  <td style={{ padding: '8px 12px', width: 48 }}>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button
                            className="flex items-center justify-center rounded-full"
                            style={{ width: 24, height: 24, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content
                          className="rounded-[8px] overflow-hidden z-50"
                          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', minWidth: 140, padding: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          align="end"
                        >
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 rounded-[4px] cursor-pointer outline-none"
                            style={{ fontSize: 12, color: 'var(--shell-text)' }}
                            onSelect={() => navigate(`/pipeline/${p.id}`)}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--shell-hover)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                          >
                            <Eye size={13} /> View
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 rounded-[4px] cursor-pointer outline-none"
                            style={{ fontSize: 12, color: 'var(--shell-text)' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--shell-hover)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                          >
                            <Edit size={13} /> Edit
                          </DropdownMenu.Item>
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 rounded-[4px] cursor-pointer outline-none"
                            style={{ fontSize: 12, color: p.status === 'active' ? 'var(--shell-text)' : 'var(--shell-text)' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--shell-hover)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                          >
                            {p.status === 'active' ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Run</>}
                          </DropdownMenu.Item>
                          <DropdownMenu.Separator style={{ height: 1, background: 'var(--shell-border)', margin: '4px 0' }} />
                          <DropdownMenu.Item
                            className="flex items-center gap-2 px-3 py-2 rounded-[4px] cursor-pointer outline-none"
                            style={{ fontSize: 12, color: '#D12329' }}
                            onSelect={() => setDeleteTarget(p)}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#F9EEEE'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
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
          <div className="flex flex-col items-center justify-center py-12">
            <div style={{ fontSize: 28, marginBottom: 12 }}>🚦</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)', marginBottom: 8 }}>No Data… For Now!</div>
            <div style={{ fontSize: 12, color: 'var(--shell-text-muted)' }}>No records match your current filters. Try adjusting your search.</div>
          </div>
        )}

        {/* Pagination */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: '1px solid var(--table-border)' }}
        >
          <span style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className="flex items-center justify-center rounded-[4px]"
                style={{
                  width: 28,
                  height: 28,
                  fontSize: 12,
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

      {/* Delete confirmation modal */}
      <Dialog.Root open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.45)' }}
          />
          <Dialog.Content
            className="fixed z-50 rounded-[12px] p-0 overflow-hidden"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 440,
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
            }}
          >
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--shell-border)' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>
                Delete "{deleteTarget?.name}"?
              </span>
              <Dialog.Close asChild>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)' }}>
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
            <div className="px-6 py-4" style={{ fontSize: 12, color: 'var(--shell-text)', lineHeight: 1.6 }}>
              This will permanently delete the pipeline and all associated execution history, field mappings, and configuration. This action cannot be undone.
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4" style={{ borderTop: '1px solid var(--shell-border)' }}>
              <Dialog.Close asChild>
                <button
                  className="rounded-[44px] px-4 py-2"
                  style={{ fontSize: 12, background: 'transparent', border: '1px solid var(--ctrl-border)', color: 'var(--shell-text)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                className="rounded-[44px] px-4 py-2"
                style={{ fontSize: 12, background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                onClick={() => setDeleteTarget(null)}
              >
                Delete Pipeline
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
