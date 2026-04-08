import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronRight, Clock, Users, ArrowRight,
  Sparkles, Wrench,
} from 'lucide-react';
import { mockPipelineTemplates } from '@/data/mock';
import type { ConnectorCategory, KGEntityType } from '@/types';
import { CONNECTOR_CATEGORY_LABELS } from '@/types';

// ─── Entity badge colours (matches KG page) ────────────────────────────────

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

const CATEGORY_ORDER: ConnectorCategory[] = [
  'edr-xdr', 'siem', 'threat-intel', 'vulnerability',
  'cloud-security', 'identity', 'itsm-cmdb',
];

export default function Templates() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ConnectorCategory | 'all'>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [expandedRelations, setExpandedRelations] = useState<string | null>(null);

  const filtered = mockPipelineTemplates.filter(t => {
    const matchSearch = !search
      || t.name.toLowerCase().includes(search.toLowerCase())
      || t.description.toLowerCase().includes(search.toLowerCase())
      || t.connectorName.toLowerCase().includes(search.toLowerCase())
      || t.targetEntities.some(e => e.toLowerCase().includes(search.toLowerCase()));
    const matchCat = activeCategory === 'all' || t.connectorCategory === activeCategory;
    return matchSearch && matchCat;
  });

  function handleAIGenerate() {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      navigate('/pipeline/new');
    }, 2000);
  }

  return (
    <div style={{ padding: '24px 28px' }}>

      {/* AI prompt bar */}
      <div
        className="flex items-center gap-3 rounded-[6px]"
        style={{ background: 'var(--shell-active)', border: '1px solid rgba(99,96,216,0.25)', padding: '12px 16px' }}
      >
        <Sparkles size={16} style={{ color: 'var(--shell-accent)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder={'Describe your pipeline in plain English — e.g. "Ingest CrowdStrike alerts, map to MITRE ATT&CK, push to Knowledge Graph every 15 minutes"'}
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAIGenerate()}
          className="flex-1 text-[12px]"
          style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--shell-text)' }}
        />
        <button
          onClick={handleAIGenerate}
          disabled={!aiPrompt.trim() || aiGenerating}
          className="flex items-center gap-2 text-[12px] font-medium flex-shrink-0 rounded-[44px]"
          style={{
            padding: '6px 14px',
            background: (!aiPrompt.trim() || aiGenerating) ? 'rgba(99,96,216,0.3)' : 'var(--shell-accent)',
            color: '#fff',
            border: 'none',
            cursor: (!aiPrompt.trim() || aiGenerating) ? 'not-allowed' : 'pointer',
          }}
        >
          {aiGenerating
            ? <><span className="animate-spin inline-block" style={{ display: 'inline-block', width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} /> Generating…</>
            : <><Sparkles size={13} /> Generate with AI</>
          }
        </button>
      </div>

      {/* Build Custom — right below AI bar */}
      <button
        onClick={() => navigate('/pipeline/new')}
        className="flex items-center gap-2 w-full rounded-[6px] text-[12px] font-medium mb-7"
        style={{
          padding: '10px 16px',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
          color: 'var(--shell-text-muted)',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--shell-text)'; e.currentTarget.style.background = 'var(--shell-raised)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--shell-text-muted)'; e.currentTarget.style.background = 'var(--card-bg)'; }}
      >
        <Wrench size={13} style={{ flexShrink: 0 }} />
        Or build a custom pipeline from scratch
        <ChevronRight size={12} style={{ marginLeft: 'auto' }} />
      </button>

      {/* Section heading */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>
            Start from Template
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
            {mockPipelineTemplates.length} pre-built patterns — select one to pre-fill your pipeline configuration
          </p>
        </div>

        {/* Search */}
        <div className="relative" style={{ width: 220 }}>
          <Search size={12} className="absolute" style={{ left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--shell-text-muted)' }} />
          <input
            type="text"
            placeholder="Search templates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-[12px] rounded-[4px]"
            style={{ padding: '6px 9px 6px 27px', background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--shell-text)', outline: 'none' }}
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-1 mb-5" style={{ flexWrap: 'wrap' }}>
        {(['all', ...CATEGORY_ORDER] as const).map(cat => {
          const count = cat === 'all'
            ? mockPipelineTemplates.length
            : mockPipelineTemplates.filter(t => t.connectorCategory === cat).length;
          if (count === 0) return null;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="text-[11px] font-medium rounded-[4px] transition-colors"
              style={{
                padding: '5px 10px',
                background: activeCategory === cat ? 'var(--shell-active)' : 'transparent',
                color: activeCategory === cat ? 'var(--shell-accent)' : 'var(--shell-text-muted)',
                border: activeCategory === cat ? '1px solid rgba(99,96,216,0.2)' : '1px solid transparent',
                cursor: 'pointer',
              }}
            >
              {cat === 'all' ? `All (${count})` : `${CONNECTOR_CATEGORY_LABELS[cat]} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Template grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16" style={{ color: 'var(--shell-text-muted)' }}>
          <p className="text-[13px] font-medium">No templates match "{search}"</p>
          <p className="text-[12px] mt-1">Try the AI generator above to create a custom pipeline</p>
        </div>
      ) : (
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {filtered.map(template => (
            <div
              key={template.id}
              className="rounded-[4px] flex flex-col"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              {/* Card body */}
              <div style={{ padding: '18px 18px 14px', flex: 1 }}>

                {/* Category badge + trust signal */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-[3px]"
                    style={{ background: 'var(--shell-raised)', color: 'var(--shell-text-muted)', border: '1px solid var(--ctrl-border)', letterSpacing: '0.05em' }}
                  >
                    {CONNECTOR_CATEGORY_LABELS[template.connectorCategory]}
                  </span>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
                    <Users size={11} />
                    {template.usedByCount} teams
                  </span>
                </div>

                {/* Name + description */}
                <p className="text-[14px] font-semibold mb-1.5" style={{ color: 'var(--shell-text)' }}>
                  {template.name}
                </p>
                <p className="text-[12px] leading-relaxed mb-3" style={{ color: 'var(--shell-text-muted)' }}>
                  {template.description}
                </p>

                {/* Source systems */}
                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase mb-1.5" style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
                    Compatible Sources
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--shell-text)' }}>
                    {template.connectorName}
                  </p>
                </div>

                {/* Target entities */}
                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase mb-1.5" style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
                    Populates KG Entities
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.targetEntities.map(e => {
                      const ec = ENTITY_COLORS[e] ?? { bg: 'var(--shell-raised)', color: 'var(--shell-text-muted)' };
                      return (
                        <span
                          key={e}
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded-[3px]"
                          style={{ background: ec.bg, color: ec.color }}
                        >
                          {e}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Relationships (expandable) */}
                <div>
                  <button
                    onClick={() => setExpandedRelations(expandedRelations === template.id ? null : template.id)}
                    className="flex items-center gap-1 text-[11px] transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)', padding: 0 }}
                  >
                    <ChevronRight
                      size={11}
                      style={{
                        transform: expandedRelations === template.id ? 'rotate(90deg)' : 'none',
                        transition: 'transform 0.15s',
                      }}
                    />
                    {template.relationships.length} relationship{template.relationships.length !== 1 ? 's' : ''} created
                  </button>
                  {expandedRelations === template.id && (
                    <div className="mt-1.5 flex flex-col gap-1">
                      {template.relationships.map(rel => (
                        <div
                          key={rel}
                          className="flex items-center gap-1.5 text-[11px] rounded-[3px] px-2 py-1"
                          style={{ background: 'var(--shell-raised)', color: 'var(--shell-text-muted)' }}
                        >
                          <ArrowRight size={10} style={{ flexShrink: 0 }} />
                          {rel}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card footer */}
              <div
                className="flex items-center justify-between"
                style={{ padding: '12px 18px', borderTop: '1px solid var(--card-border)' }}
              >
                {/* Meta */}
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
                    <Clock size={11} /> ~{template.estimatedSetupMins} min setup
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
                    {template.requiredCredentialType}
                  </span>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate(`/pipeline/new?template=${template.id}`)}
                  className="flex items-center gap-1.5 text-[12px] font-medium rounded-[44px] transition-colors"
                  style={{
                    padding: '6px 14px',
                    background: 'var(--shell-accent)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dark)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--shell-accent)')}
                >
                  Start <ChevronRight size={12} />
                </button>
              </div>

              {/* Tags row */}
              {template.tags.length > 0 && (
                <div
                  className="flex flex-wrap gap-1 px-4 pb-3"
                  style={{ marginTop: -6 }}
                >
                  {template.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] px-1.5 py-0.5 rounded-[3px]"
                      style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
