import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as RadioGroup from '@radix-ui/react-radio-group';

import * as Switch from '@radix-ui/react-switch';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Bot,
  Loader2,
  ArrowRight,
  Zap,
  Search,

} from 'lucide-react';
import type { WizardStep, Connector } from '@/types';

const STEPS: { key: WizardStep; label: string }[] = [
  { key: 'connector', label: 'Connector' },
  { key: 'config', label: 'Connection Config' },
  { key: 'feed', label: 'Feed Selection' },
  { key: 'feed-config', label: 'Feed Config' },
  { key: 'mapping', label: 'Entity Mapping' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'review', label: 'Review & Deploy' },
];

const CONNECTORS: Connector[] = [
  { id: 'salesforce', name: 'Salesforce', category: 'source', description: 'CRM — Accounts, Contacts, Opportunities', icon: '☁️', authType: 'oauth' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'source', description: 'Open-source relational database', icon: '🐘', authType: 'connection-string' },
  { id: 'mysql', name: 'MySQL', category: 'source', description: 'Popular open-source RDBMS', icon: '🐬', authType: 'credentials' },
  { id: 'rest-api', name: 'REST API', category: 'source', description: 'Any HTTP/REST endpoint', icon: '🌐', authType: 'api-key' },
  { id: 's3', name: 'Amazon S3', category: 'both', description: 'Object storage — CSV, JSON, Parquet', icon: '🪣', authType: 'api-key' },
  { id: 'stripe', name: 'Stripe', category: 'source', description: 'Payments — Charges, Subscriptions', icon: '💳', authType: 'api-key' },
  { id: 'hubspot', name: 'HubSpot', category: 'source', description: 'Marketing CRM platform', icon: '🟠', authType: 'oauth' },
  { id: 'bigquery', name: 'BigQuery', category: 'both', description: 'Google serverless data warehouse', icon: '📊', authType: 'api-key' },
  { id: 'snowflake', name: 'Snowflake', category: 'both', description: 'Cloud data platform', icon: '❄️', authType: 'credentials' },
  { id: 'mongodb', name: 'MongoDB', category: 'source', description: 'Document-oriented NoSQL database', icon: '🍃', authType: 'connection-string' },
  { id: 'redshift', name: 'Redshift', category: 'both', description: 'AWS petabyte-scale data warehouse', icon: '🔴', authType: 'credentials' },
  { id: 'kafka', name: 'Kafka', category: 'source', description: 'Distributed event streaming', icon: '⚡', authType: 'credentials' },
];

const FIELD_SUGGESTIONS = [
  { source: 'Id', target: 'record_id', confidence: 100, aiSuggested: false },
  { source: 'Name', target: 'display_name', confidence: 97, aiSuggested: true },
  { source: 'Email', target: 'email_address', confidence: 98, aiSuggested: true },
  { source: 'CreatedDate', target: 'created_at', confidence: 99, aiSuggested: true },
  { source: 'AnnualRevenue', target: 'revenue_usd', confidence: 91, aiSuggested: true },
  { source: 'Industry', target: 'industry_code', confidence: 88, aiSuggested: true },
];

function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  background: done ? '#31A56D' : active ? 'var(--shell-accent)' : 'var(--shell-raised)',
                  border: done ? '2px solid #31A56D' : active ? '2px solid var(--shell-accent)' : '2px solid var(--ctrl-border)',
                  color: done || active ? '#fff' : 'var(--shell-text-muted)',
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {done ? <Check size={13} /> : idx + 1}
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: active ? 'var(--shell-accent)' : done ? '#31A56D' : 'var(--shell-text-muted)',
                  fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  width: 40,
                  height: 2,
                  margin: '0 8px',
                  marginBottom: 18,
                  background: done ? '#31A56D' : 'var(--ctrl-border)',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Step 1 — Connector Selection
function StepConnector({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = CONNECTORS.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>Select Source Connector</div>
      <div
        className="flex items-center gap-2 rounded-[8px] px-3 py-2 max-w-sm"
        style={{ background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)' }}
      >
        <Search size={13} style={{ color: 'var(--ctrl-placeholder)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search connectors…"
          style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: 'var(--shell-text)', width: '100%' }}
        />
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="text-left rounded-[4px] p-4 transition-all"
            style={{
              background: selected === c.id ? 'var(--shell-active)' : 'var(--card-bg)',
              border: `1px solid ${selected === c.id ? 'var(--shell-accent)' : 'var(--card-border)'}`,
              cursor: 'pointer',
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span style={{ fontSize: 24 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--shell-text)' }}>{c.name}</div>
                <span
                  className="rounded-[4px] px-1.5 py-0.5"
                  style={{ fontSize: 10, background: 'var(--shell-raised)', color: 'var(--shell-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}
                >
                  {c.authType}
                </span>
              </div>
              {selected === c.id && (
                <div className="ml-auto flex items-center justify-center rounded-full" style={{ width: 20, height: 20, background: 'var(--shell-accent)' }}>
                  <Check size={11} color="#fff" />
                </div>
              )}
            </div>
            <p style={{ fontSize: 11, color: 'var(--shell-text-muted)', margin: 0 }}>{c.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// Step 2 — Connection Config
function StepConfig({ connectorId }: { connectorId: string }) {
  const connector = CONNECTORS.find((c) => c.id === connectorId);
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>
        Configure {connector?.name ?? 'Connector'}
      </div>
      {connectorId === 'salesforce' || connectorId === 'hubspot' ? (
        <div className="flex flex-col gap-4">
          <div
            className="flex flex-col items-center gap-3 rounded-[4px] p-8"
            style={{ background: 'var(--shell-raised)', border: '1px dashed var(--ctrl-border)', textAlign: 'center' }}
          >
            <div style={{ fontSize: 24 }}>{connector?.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--shell-text)' }}>Connect via OAuth 2.0</div>
            <p style={{ fontSize: 12, color: 'var(--shell-text-muted)', margin: 0 }}>
              Click below to authorize {connector?.name} access. You'll be redirected to the provider's login page.
            </p>
            <button
              className="flex items-center gap-2 rounded-[44px] px-6 py-2"
              style={{ background: 'var(--shell-accent)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500, marginTop: 8 }}
            >
              Connect with {connector?.name}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {connectorId === 'postgresql' || connectorId === 'mysql' || connectorId === 'redshift' ? (
            <>
              <FormField label="Host" placeholder="db.example.com" required />
              <FormField label="Port" placeholder={connectorId === 'postgresql' ? '5432' : '3306'} required />
              <FormField label="Database Name" placeholder="analytics_db" required />
              <FormField label="Username" placeholder="db_user" required />
              <FormField label="Password" placeholder="••••••••" type="password" required />
              <div className="flex items-center gap-3">
                <Switch.Root
                  className="rounded-full flex-shrink-0"
                  style={{ width: 36, height: 20, background: 'var(--shell-accent)', border: 'none', cursor: 'pointer', position: 'relative' }}
                >
                  <Switch.Thumb
                    className="block rounded-full"
                    style={{ width: 16, height: 16, background: '#fff', position: 'absolute', top: 2, left: 2, transition: 'transform 0.15s', transform: 'translateX(0)' }}
                  />
                </Switch.Root>
                <span style={{ fontSize: 12, color: 'var(--shell-text)' }}>Enable SSL/TLS</span>
              </div>
            </>
          ) : (
            <>
              <FormField label="API Key" placeholder="sk-..." required />
              <FormField label="Base URL" placeholder="https://api.example.com/v1" />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  placeholder,
  type = 'text',
  required,
}: {
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--shell-text)' }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="rounded-[8px] px-3 py-2 outline-none"
        style={{
          fontSize: 12,
          background: 'var(--ctrl-bg)',
          border: '1px solid var(--ctrl-border)',
          color: 'var(--shell-text)',
        }}
        onFocus={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = '#6360D8'; (e.currentTarget as HTMLInputElement).style.boxShadow = '0 0 0 2px rgba(99,96,216,0.2)'; }}
        onBlur={(e) => { (e.currentTarget as HTMLInputElement).style.borderColor = 'var(--ctrl-border)'; (e.currentTarget as HTMLInputElement).style.boxShadow = 'none'; }}
      />
    </div>
  );
}

// Step 3 — Feed Selection
function StepFeed() {
  const [queryMode, setQueryMode] = useState<'table' | 'sql'>('table');
  const [sql, setSql] = useState('SELECT *\nFROM accounts\nWHERE created_date >= CURRENT_DATE - 30\nLIMIT 10000;');
  const [generating, setGenerating] = useState(false);

  const handleGenerateSQL = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSql("SELECT\n  a.Id,\n  a.Name,\n  a.Email,\n  a.AnnualRevenue,\n  a.Industry,\n  a.CreatedDate,\n  a.LastModifiedDate\nFROM Account a\nWHERE a.LastModifiedDate >= LAST_N_DAYS:7\nORDER BY a.LastModifiedDate DESC;");
    setGenerating(false);
  };

  const tables = ['Account', 'Contact', 'Lead', 'Opportunity', 'Case', 'Task', 'Event', 'Product2'];

  return (
    <div className="flex flex-col gap-6">
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>Select Data Feed</div>

      <RadioGroup.Root value={queryMode} onValueChange={(v) => setQueryMode(v as 'table' | 'sql')} className="flex gap-3">
        {[{ v: 'table', label: 'Select Tables' }, { v: 'sql', label: 'Custom SQL Query' }].map(({ v, label }) => (
          <RadioGroup.Item key={v} value={v} asChild>
            <button
              className="flex items-center gap-2 rounded-[44px] px-4 py-2"
              style={{
                fontSize: 12,
                background: queryMode === v ? 'var(--shell-active)' : 'transparent',
                border: `1px solid ${queryMode === v ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
                color: queryMode === v ? 'var(--shell-accent)' : 'var(--shell-text)',
                cursor: 'pointer',
                fontWeight: queryMode === v ? 600 : 400,
              }}
            >
              <RadioGroup.Indicator className="flex items-center justify-center">
                <div
                  className="rounded-full"
                  style={{ width: 8, height: 8, background: 'var(--shell-accent)' }}
                />
              </RadioGroup.Indicator>
              {label}
            </button>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>

      {queryMode === 'table' ? (
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {tables.map((t) => (
            <label
              key={t}
              className="flex items-center gap-2 rounded-[4px] px-3 py-2 cursor-pointer"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
            >
              <input type="checkbox" style={{ accentColor: 'var(--shell-accent)' }} defaultChecked={t === 'Account'} />
              <span style={{ fontSize: 12, color: 'var(--shell-text)' }}>{t}</span>
            </label>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--shell-text)' }}>SQL Query</label>
            <button
              onClick={handleGenerateSQL}
              disabled={generating}
              className="flex items-center gap-2 rounded-[44px] px-3 py-1.5"
              style={{ fontSize: 12, background: 'var(--shell-active)', color: 'var(--shell-accent)', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              {generating ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
              Generate with AI
            </button>
          </div>
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            rows={8}
            className="rounded-[8px] px-4 py-3 outline-none resize-y"
            style={{
              fontSize: 12,
              fontFamily: 'SF Mono, Fira Code, monospace',
              background: '#101010',
              color: '#e0dff7',
              border: '1px solid var(--ctrl-border)',
              lineHeight: 1.6,
            }}
          />
        </div>
      )}
    </div>
  );
}

// Step 4 — Feed Config
function StepFeedConfig() {
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>Feed Configuration</div>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--shell-text)' }}>Load Type</label>
          <div className="flex gap-3">
            {[{ v: 'incremental', label: 'Incremental', desc: 'Only new/modified records' }, { v: 'full', label: 'Full Load', desc: 'All records every run' }].map(({ v, label, desc }) => (
              <label
                key={v}
                className="flex items-start gap-3 rounded-[4px] p-3 cursor-pointer flex-1"
                style={{ background: v === 'incremental' ? 'var(--shell-active)' : 'var(--card-bg)', border: `1px solid ${v === 'incremental' ? 'var(--shell-accent)' : 'var(--card-border)'}` }}
              >
                <input type="radio" name="loadType" defaultChecked={v === 'incremental'} style={{ accentColor: 'var(--shell-accent)', marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--shell-text)' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>{desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        <FormField label="Watermark Column" placeholder="LastModifiedDate" required />
        <FormField label="Batch Size" placeholder="10000" />
        <FormField label="Parallelism" placeholder="4 (threads)" />
        <div className="flex flex-col gap-2">
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--shell-text)' }}>Filters</label>
          <textarea
            placeholder="e.g. Status = 'Active' AND Industry IS NOT NULL"
            rows={3}
            className="rounded-[8px] px-3 py-2 outline-none resize-none"
            style={{ fontSize: 12, background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--shell-text)' }}
          />
        </div>
      </div>
    </div>
  );
}

// Step 5 — Entity Mapping
function StepMapping() {
  const [autoMapping, setAutoMapping] = useState(false);
  const [mapped, setMapped] = useState(false);
  const [mappings] = useState(FIELD_SUGGESTIONS);

  const handleAutoMap = async () => {
    setAutoMapping(true);
    await new Promise((r) => setTimeout(r, 1500));
    setMapped(true);
    setAutoMapping(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>Entity Mapping</div>
        <button
          onClick={handleAutoMap}
          disabled={autoMapping}
          className="flex items-center gap-2 rounded-[44px] px-4 py-2"
          style={{ fontSize: 12, background: 'var(--shell-accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
        >
          {autoMapping ? <Loader2 size={13} className="animate-spin" /> : <Bot size={13} />}
          {autoMapping ? 'Auto-mapping…' : 'AI Auto-map'}
        </button>
      </div>

      {!mapped && !autoMapping && (
        <div
          className="flex flex-col items-center gap-3 rounded-[4px] p-8"
          style={{ background: 'var(--shell-raised)', border: '1px dashed var(--ctrl-border)', textAlign: 'center' }}
        >
          <Bot size={24} style={{ color: 'var(--shell-accent)' }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--shell-text)' }}>No mappings yet</div>
          <p style={{ fontSize: 12, color: 'var(--shell-text-muted)', margin: 0 }}>
            Use AI Auto-map to automatically suggest field mappings, or add them manually below.
          </p>
        </div>
      )}

      {autoMapping && (
        <div className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--shell-text-muted)' }}>
          <Loader2 size={14} className="animate-spin" style={{ color: 'var(--shell-accent)' }} />
          Analyzing source schema and target schema…
        </div>
      )}

      {mapped && (
        <>
          <div
            className="flex items-center gap-2 rounded-[4px] px-4 py-3"
            style={{ background: '#EFF7ED', border: '1px solid #31A56D', fontSize: 12, color: '#31A56D' }}
          >
            <Check size={14} />
            AI mapped {mappings.length} fields with avg confidence 96%
          </div>

          <div className="flex flex-col gap-0 rounded-[4px] overflow-hidden" style={{ border: '1px solid var(--table-border)' }}>
            <div
              className="grid"
              style={{ gridTemplateColumns: '1fr 120px 1fr', gap: 0, background: 'var(--table-th-bg)', padding: '8px 16px', borderBottom: '1px solid var(--table-border)', fontSize: 11, fontWeight: 600, color: 'var(--shell-text-muted)', textTransform: 'uppercase' }}
            >
              <span>Source Field</span>
              <span style={{ textAlign: 'center' }}>Match</span>
              <span>Target Field</span>
            </div>
            {mappings.map((m) => (
              <div
                key={m.source}
                className="grid items-center"
                style={{ gridTemplateColumns: '1fr 120px 1fr', borderBottom: '1px solid var(--table-border)', padding: '8px 16px' }}
              >
                <div
                  className="rounded-[4px] px-3 py-1.5 mr-4"
                  style={{ background: 'var(--shell-raised)', fontSize: 12, color: 'var(--shell-text)', fontWeight: 500 }}
                >
                  {m.source}
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <ArrowRight size={14} style={{ color: 'var(--shell-accent)' }} />
                  {m.aiSuggested && (
                    <span
                      className="rounded-[4px] px-1.5"
                      style={{ fontSize: 10, background: 'var(--shell-active)', color: 'var(--shell-accent)', fontWeight: 600 }}
                    >
                      AI {m.confidence}%
                    </span>
                  )}
                </div>
                <div
                  className="rounded-[4px] px-3 py-1.5 ml-4"
                  style={{ background: 'var(--shell-raised)', fontSize: 12, color: 'var(--shell-text)', fontWeight: 500 }}
                >
                  {m.target}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Step 6 — Schedule
function StepSchedule() {
  const [scheduleType, setScheduleType] = useState<'preset' | 'cron'>('preset');
  const [preset, setPreset] = useState('*/15 * * * *');

  const PRESETS = [
    { value: '*/5 * * * *', label: 'Every 5 minutes' },
    { value: '*/15 * * * *', label: 'Every 15 minutes' },
    { value: '*/30 * * * *', label: 'Every 30 minutes' },
    { value: '0 * * * *', label: 'Hourly' },
    { value: '0 */6 * * *', label: 'Every 6 hours' },
    { value: '0 0 * * *', label: 'Daily at midnight' },
    { value: '0 8 * * *', label: 'Daily at 8am' },
    { value: '0 0 * * 1', label: 'Weekly on Monday' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>Schedule Execution</div>

      <div className="flex gap-3">
        {[{ v: 'preset', label: 'Preset Schedule' }, { v: 'cron', label: 'Cron Expression' }].map(({ v, label }) => (
          <button
            key={v}
            onClick={() => setScheduleType(v as 'preset' | 'cron')}
            className="rounded-[44px] px-4 py-2"
            style={{
              fontSize: 12,
              background: scheduleType === v ? 'var(--shell-active)' : 'transparent',
              border: `1px solid ${scheduleType === v ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
              color: scheduleType === v ? 'var(--shell-accent)' : 'var(--shell-text)',
              cursor: 'pointer',
              fontWeight: scheduleType === v ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {scheduleType === 'preset' ? (
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPreset(p.value)}
              className="flex items-center justify-between rounded-[4px] px-4 py-3 text-left"
              style={{
                background: preset === p.value ? 'var(--shell-active)' : 'var(--card-bg)',
                border: `1px solid ${preset === p.value ? 'var(--shell-accent)' : 'var(--card-border)'}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 12, color: 'var(--shell-text)', fontWeight: preset === p.value ? 600 : 400 }}>
                {p.label}
              </span>
              {preset === p.value && <Check size={14} style={{ color: 'var(--shell-accent)' }} />}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <FormField label="Cron Expression" placeholder="*/15 * * * *" required />
          <div
            className="rounded-[4px] px-4 py-3"
            style={{ background: 'var(--shell-raised)', border: '1px solid var(--shell-border)', fontSize: 12, color: 'var(--shell-text-muted)' }}
          >
            <span style={{ fontFamily: 'SF Mono, Fira Code, monospace', color: 'var(--shell-accent)' }}>
              */15 * * * *
            </span>
            {' '}→ Every 15 minutes
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--shell-text)' }}>Timezone</label>
          <select
            className="rounded-[8px] px-3 py-2 outline-none"
            style={{ fontSize: 12, background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--shell-text)', cursor: 'pointer' }}
          >
            <option>UTC (Coordinated Universal Time)</option>
            <option>America/New_York (Eastern Time)</option>
            <option>America/Los_Angeles (Pacific Time)</option>
            <option>Europe/London (GMT)</option>
            <option>Asia/Tokyo (JST)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <Switch.Root
            defaultChecked
            className="rounded-full flex-shrink-0"
            style={{ width: 36, height: 20, background: 'var(--shell-accent)', border: 'none', cursor: 'pointer', position: 'relative' }}
          >
            <Switch.Thumb
              className="block rounded-full"
              style={{ width: 16, height: 16, background: '#fff', position: 'absolute', top: 2, left: 2, transition: 'transform 0.15s' }}
            />
          </Switch.Root>
          <span style={{ fontSize: 12, color: 'var(--shell-text)' }}>Enable automatic retry on failure (max 3 attempts)</span>
        </div>
      </div>
    </div>
  );
}

// Step 7 — Review & Deploy
function StepReview({ onDeploy }: { onDeploy: () => void }) {
  const checks = [
    { label: 'Source connector configured', done: true },
    { label: 'Connection credentials validated', done: true },
    { label: 'Feed selection complete', done: true },
    { label: 'Field mappings defined', done: true },
    { label: 'Schedule configured', done: true },
    { label: 'Target destination reachable', done: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>Review & Deploy</div>

      <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 280px' }}>
        {/* Config summary */}
        <div className="flex flex-col gap-4">
          {[
            { label: 'Pipeline Name', value: 'Salesforce → Snowflake (New)' },
            { label: 'Source', value: 'Salesforce (OAuth 2.0)' },
            { label: 'Target', value: 'Snowflake Data Warehouse' },
            { label: 'Feed', value: 'Account (Incremental, LastModifiedDate)' },
            { label: 'Batch Size', value: '10,000 records/batch' },
            { label: 'Mappings', value: '6 fields mapped (AI auto-mapped)' },
            { label: 'Schedule', value: 'Every 15 minutes (UTC)' },
            { label: 'Retry', value: 'Enabled, max 3 attempts' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--shell-border)' }}>
              <span style={{ fontSize: 12, color: 'var(--shell-text-muted)' }}>{label}</span>
              <span style={{ fontSize: 12, color: 'var(--shell-text)', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Validation checklist */}
        <div
          className="rounded-[4px] p-4 flex flex-col gap-3 h-fit"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--shell-text)', marginBottom: 4 }}>Validation Checklist</div>
          {checks.map((c) => (
            <div key={c.label} className="flex items-center gap-3">
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{ width: 20, height: 20, background: c.done ? '#EFF7ED' : 'var(--shell-raised)' }}
              >
                {c.done ? <Check size={11} style={{ color: '#31A56D' }} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ctrl-border)' }} />}
              </div>
              <span style={{ fontSize: 12, color: c.done ? 'var(--shell-text)' : 'var(--shell-text-muted)' }}>{c.label}</span>
            </div>
          ))}

          <div
            className="flex items-center gap-2 rounded-[4px] px-3 py-2 mt-2"
            style={{ background: '#EFF7ED', border: '1px solid #31A56D', fontSize: 12, color: '#31A56D' }}
          >
            <Check size={13} />
            All checks passed
          </div>
        </div>
      </div>

      <button
        onClick={onDeploy}
        className="flex items-center justify-center gap-2 rounded-[44px] px-8 py-3 self-start"
        style={{ fontSize: 13, background: 'var(--shell-accent)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-dark)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--shell-accent)'; }}
      >
        <Zap size={16} />
        Deploy Pipeline
      </button>
    </div>
  );
}

// Main PipelineBuilder component
export default function PipelineBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedConnector, setSelectedConnector] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);

  const canAdvance = currentStep === 0 ? !!selectedConnector : true;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    await new Promise((r) => setTimeout(r, 2000));
    setDeployed(true);
    setDeploying(false);
    setTimeout(() => navigate('/pipelines'), 1500);
  };

  if (deployed) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-12">
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 64, height: 64, background: '#EFF7ED' }}
        >
          <Check size={32} style={{ color: '#31A56D' }} />
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--shell-text)' }}>Pipeline Deployed!</div>
        <p style={{ fontSize: 12, color: 'var(--shell-text-muted)' }}>Redirecting to pipelines list…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Sub-header */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--shell-text)' }}>New Pipeline</div>
        <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>
          Data Ingestion Studio / <span style={{ color: 'var(--shell-accent)' }}>Pipeline Builder</span>
        </div>
      </div>

      {/* Stepper */}
      <div
        className="rounded-[4px] p-6 overflow-x-auto"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        <Stepper currentStep={currentStep} />
      </div>

      {/* Step content */}
      <div
        className="rounded-[4px] p-8"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', minHeight: 400 }}
      >
        {currentStep === 0 && (
          <StepConnector selected={selectedConnector} onSelect={setSelectedConnector} />
        )}
        {currentStep === 1 && <StepConfig connectorId={selectedConnector} />}
        {currentStep === 2 && <StepFeed />}
        {currentStep === 3 && <StepFeedConfig />}
        {currentStep === 4 && <StepMapping />}
        {currentStep === 5 && <StepSchedule />}
        {currentStep === 6 && <StepReview onDeploy={handleDeploy} />}
      </div>

      {/* Navigation */}
      {currentStep < 6 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 rounded-[44px] px-4 py-2"
            style={{
              fontSize: 12,
              background: 'transparent',
              border: '1px solid var(--ctrl-border)',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              color: currentStep === 0 ? 'var(--ctrl-placeholder)' : 'var(--shell-text)',
              opacity: currentStep === 0 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={14} />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className="flex items-center gap-2 rounded-[44px] px-6 py-2"
            style={{
              fontSize: 12,
              fontWeight: 500,
              background: canAdvance ? 'var(--shell-accent)' : 'var(--ctrl-border)',
              color: canAdvance ? '#fff' : 'var(--shell-text-muted)',
              border: 'none',
              cursor: canAdvance ? 'pointer' : 'not-allowed',
              opacity: canAdvance ? 1 : 0.6,
            }}
          >
            {currentStep === STEPS.length - 2 ? 'Review' : 'Next'}
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {deploying && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div
            className="flex flex-col items-center gap-4 rounded-[12px] p-8"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--shell-accent)' }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--shell-text)' }}>Deploying Pipeline…</div>
            <div style={{ fontSize: 12, color: 'var(--shell-text-muted)' }}>Validating credentials and configuring connectors</div>
          </div>
        </div>
      )}
    </div>
  );
}
