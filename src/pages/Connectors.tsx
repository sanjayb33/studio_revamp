import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
  Plus, Search, CheckCircle2, AlertCircle, AlertTriangle,
  XCircle, Key, RotateCcw, Trash2, Eye, EyeOff, X, Loader2,
} from 'lucide-react';
import { mockCyberConnectors, mockCredentials } from '@/data/mock';
import type { CyberConnector, Credential, ConnectorCategory } from '@/types';
import { CONNECTOR_CATEGORY_LABELS } from '@/types';
import ConnectorDetailPanel from '@/components/ConnectorDetailPanel';
import AIConnectorBuilderModal from '@/components/AIConnectorBuilderModal';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_ORDER: ConnectorCategory[] = [
  'edr-xdr', 'siem', 'threat-intel', 'vulnerability',
  'cloud-security', 'identity', 'network', 'itsm-cmdb',
];

const HEALTH_CONFIG = {
  healthy: { label: 'Healthy', bg: '#EFF7ED', color: '#31A56D', icon: <CheckCircle2 size={12} /> },
  warning: { label: 'Warning', bg: '#FEF3C7', color: '#D98B1D', icon: <AlertTriangle size={12} /> },
  error:   { label: 'Error',   bg: '#F9EEEE', color: '#D12329', icon: <XCircle size={12} /> },
};

const AUTH_FIELDS: Record<string, { label: string; type: string; placeholder: string }[]> = {
  'oauth': [
    { label: 'Client ID',     type: 'text',     placeholder: 'Enter OAuth Client ID' },
    { label: 'Client Secret', type: 'password', placeholder: 'Enter OAuth Client Secret' },
    { label: 'Scopes',        type: 'text',     placeholder: 'e.g. read:alerts write:none' },
    { label: 'Auth URL',      type: 'text',     placeholder: 'https://login.example.com/oauth/authorize' },
    { label: 'Token URL',     type: 'text',     placeholder: 'https://login.example.com/oauth/token' },
  ],
  'api-key': [
    { label: 'API Key',       type: 'password', placeholder: 'Enter API key' },
    { label: 'Base URL',      type: 'text',     placeholder: 'https://api.example.com/v2' },
    { label: 'Header Name',   type: 'text',     placeholder: 'X-Api-Key (or Authorization)' },
  ],
  'credentials': [
    { label: 'Username',      type: 'text',     placeholder: 'Enter username' },
    { label: 'Password',      type: 'password', placeholder: 'Enter password' },
    { label: 'Host / URL',    type: 'text',     placeholder: 'https://your-instance.example.com' },
  ],
  'connection-string': [
    { label: 'Connection String', type: 'password', placeholder: 'jdbc:postgresql://host:5432/db?user=x&password=y' },
  ],
  'certificate': [
    { label: 'Certificate',   type: 'text',     placeholder: 'Paste PEM certificate or upload' },
    { label: 'Private Key',   type: 'password', placeholder: 'Paste private key or upload' },
    { label: 'Host / URL',    type: 'text',     placeholder: 'https://your-instance.example.com' },
  ],
};

// ─── Configure Modal ──────────────────────────────────────────────────────────

function ConfigureConnectorModal({
  connector,
  onClose,
  onSave,
}: {
  connector: CyberConnector;
  onClose: () => void;
  onSave: () => void;
}) {
  const [credentialName, setCredentialName] = useState(`${connector.name} — Prod`);
  const [environment, setEnvironment] = useState<'production' | 'staging'>('production');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [saving, setSaving] = useState(false);

  const fields = AUTH_FIELDS[connector.authType] ?? AUTH_FIELDS['api-key'];

  function handleTest() {
    setTestState('testing');
    setTimeout(() => {
      setTestState('success');
    }, 1800);
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave();
    }, 1200);
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
      />
      <div
        className="fixed z-50 flex flex-col"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 480,
          maxHeight: '88vh',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 8,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between flex-shrink-0"
          style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}
        >
          <div>
            <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>
              Configure {connector.name}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
              Credentials stored securely — not visible to pipeline builders
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-[4px] hover:bg-[var(--shell-hover)] transition-colors"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>

          {/* Credential name + environment */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="text-[11px] font-semibold uppercase block mb-1.5" style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
                Credential Name *
              </label>
              <input
                type="text"
                value={credentialName}
                onChange={e => setCredentialName(e.target.value)}
                className="w-full text-[12px] rounded-[4px]"
                style={{ padding: '8px 10px', background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--shell-text)', outline: 'none' }}
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase block mb-1.5" style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
                Environment
              </label>
              <select
                value={environment}
                onChange={e => setEnvironment(e.target.value as 'production' | 'staging')}
                className="w-full text-[12px] rounded-[4px]"
                style={{ padding: '8px 10px', background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--shell-text)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
          </div>

          {/* Auth type label */}
          <div className="flex items-center gap-2 mb-3">
            <Key size={13} style={{ color: 'var(--shell-text-muted)' }} />
            <p className="text-[11px] font-semibold uppercase" style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
              {connector.authType === 'oauth' ? 'OAuth 2.0 Credentials'
                : connector.authType === 'api-key' ? 'API Key'
                : connector.authType === 'credentials' ? 'Username & Password'
                : connector.authType === 'connection-string' ? 'Connection String'
                : 'Certificate'}
            </p>
          </div>

          {/* Dynamic auth fields */}
          <div className="flex flex-col gap-3 mb-5">
            {fields.map(field => (
              <div key={field.label}>
                <label className="text-[11px] font-medium block mb-1" style={{ color: 'var(--shell-text)' }}>
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={field.type === 'password' && !showValues[field.label] ? 'password' : 'text'}
                    value={formValues[field.label] ?? ''}
                    onChange={e => setFormValues(prev => ({ ...prev, [field.label]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full text-[12px] rounded-[4px]"
                    style={{
                      padding: field.type === 'password' ? '8px 36px 8px 10px' : '8px 10px',
                      background: 'var(--ctrl-bg)',
                      border: '1px solid var(--ctrl-border)',
                      color: 'var(--shell-text)',
                      outline: 'none',
                    }}
                  />
                  {field.type === 'password' && (
                    <button
                      type="button"
                      onClick={() => setShowValues(prev => ({ ...prev, [field.label]: !prev[field.label] }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
                    >
                      {showValues[field.label] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Test result */}
          {testState === 'success' && (
            <div
              className="flex items-center gap-2 rounded-[4px] p-2.5 mb-4"
              style={{ background: '#EFF7ED', border: '1px solid rgba(49,165,109,0.3)' }}
            >
              <CheckCircle2 size={13} style={{ color: '#31A56D' }} />
              <p className="text-[12px]" style={{ color: '#31A56D' }}>
                Connection successful — API responded in 128ms
              </p>
            </div>
          )}
          {testState === 'fail' && (
            <div
              className="flex items-center gap-2 rounded-[4px] p-2.5 mb-4"
              style={{ background: '#F9EEEE', border: '1px solid rgba(209,35,41,0.3)' }}
            >
              <XCircle size={13} style={{ color: '#D12329' }} />
              <p className="text-[12px]" style={{ color: '#D12329' }}>
                Connection failed — check credentials and try again
              </p>
            </div>
          )}

          {/* Security note */}
          <div
            className="flex items-start gap-2 rounded-[4px] p-2.5"
            style={{ background: 'var(--shell-raised)', border: '1px solid var(--ctrl-border)' }}
          >
            <AlertCircle size={13} style={{ color: 'var(--shell-text-muted)', flexShrink: 0, marginTop: 1 }} />
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--shell-text-muted)' }}>
              Credentials are stored encrypted and are only accessible to Admins.
              Security Engineers will reference this credential by name — they cannot view raw values.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 flex-shrink-0"
          style={{ padding: '12px 20px', borderTop: '1px solid var(--card-border)' }}
        >
          <button
            onClick={handleTest}
            disabled={testState === 'testing'}
            className="flex items-center gap-2 text-[12px] font-medium rounded-[44px] transition-colors"
            style={{
              padding: '7px 14px',
              background: 'var(--card-bg)',
              color: 'var(--shell-text)',
              border: '1px solid var(--ctrl-border)',
              cursor: testState === 'testing' ? 'not-allowed' : 'pointer',
              opacity: testState === 'testing' ? 0.7 : 1,
            }}
            onMouseEnter={e => { if (testState !== 'testing') (e.currentTarget as HTMLElement).style.background = 'var(--shell-raised)'; }}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--card-bg)')}
          >
            {testState === 'testing'
              ? <><Loader2 size={13} className="animate-spin" /> Testing…</>
              : 'Test Connection'
            }
          </button>
          <div className="flex items-center gap-2">
            <button onClick={onClose} style={{ fontSize: 12, color: 'var(--shell-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !credentialName.trim()}
              className="flex items-center gap-2 text-[12px] font-medium rounded-[44px]"
              style={{
                padding: '7px 18px',
                background: saving || !credentialName.trim() ? 'var(--ctrl-border)' : 'var(--shell-accent)',
                color: '#fff',
                border: 'none',
                cursor: saving || !credentialName.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save Credentials'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Connectors() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'library' | 'credentials'>('library');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<ConnectorCategory | 'all'>('all');
  const [selectedConnector, setSelectedConnector] = useState<CyberConnector | null>(null);
  const [configureConnector, setConfigureConnector] = useState<CyberConnector | null>(null);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [credentials] = useState<Credential[]>(mockCredentials);
  const { setPageActions } = useOutletContext<{ setPageActions: (n: React.ReactNode) => void }>();

  useEffect(() => {
    setPageActions(
      <>
        <button
          onClick={() => setShowAIBuilder(true)}
          className="flex items-center gap-2 text-[12px] font-medium transition-colors"
          style={{ padding: '6px 14px', background: 'var(--card-bg)', color: 'var(--shell-text)', border: '1px solid var(--ctrl-border)', borderRadius: 44, cursor: 'pointer' }}
        >
          ✦ Build from OpenAPI / Swagger
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className="flex items-center gap-2 text-[12px] font-medium"
          style={{ padding: '6px 14px', background: 'var(--shell-accent)', color: '#fff', border: 'none', borderRadius: 44, cursor: 'pointer' }}
        >
          <Plus size={13} /> Add Credentials
        </button>
      </>
    );
    return () => setPageActions(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const filtered = mockCyberConnectors.filter(c => {
    const matchSearch = !search
      || c.name.toLowerCase().includes(search.toLowerCase())
      || c.vendor.toLowerCase().includes(search.toLowerCase())
      || c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'all' || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    label: CONNECTOR_CATEGORY_LABELS[cat],
    connectors: filtered.filter(c => c.category === cat),
  })).filter(g => g.connectors.length > 0);

  function handleConfigureSave() {
    setSaveSuccess(configureConnector?.name ?? '');
    setConfigureConnector(null);
    setTimeout(() => setSaveSuccess(null), 3000);
  }

  return (
    <div style={{ padding: '24px 28px' }}>

      {/* Save success toast */}
      {saveSuccess && (
        <div
          className="flex items-center gap-2 rounded-[4px] mb-4"
          style={{ background: '#EFF7ED', border: '1px solid rgba(49,165,109,0.3)', padding: '10px 14px' }}
        >
          <CheckCircle2 size={14} style={{ color: '#31A56D' }} />
          <span className="text-[12px]" style={{ color: '#31A56D' }}>
            <strong>{saveSuccess}</strong> credentials saved successfully.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-0 mb-5" style={{ borderBottom: '1px solid var(--shell-border)' }}>
        {[
          { id: 'library',     label: `Connector Library (${mockCyberConnectors.length})` },
          { id: 'credentials', label: `Credentials Vault (${credentials.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'library' | 'credentials')}
            className="text-[12px] font-medium pb-2.5 mr-6 transition-colors"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--shell-accent)' : 'var(--shell-text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--shell-accent)' : '2px solid transparent',
              marginBottom: -1,
              padding: '0 0 10px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── LIBRARY TAB ── */}
      {activeTab === 'library' && (
        <>
          {/* Search + category filter */}
          <div className="flex items-center gap-3 mb-5" style={{ flexWrap: 'wrap' }}>
            <div className="relative" style={{ width: 260 }}>
              <Search size={13} className="absolute" style={{ left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--shell-text-muted)' }} />
              <input
                type="text"
                placeholder="Search connectors…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full text-[12px] rounded-[4px]"
                style={{ padding: '7px 10px 7px 30px', background: 'var(--ctrl-bg)', border: '1px solid var(--ctrl-border)', color: 'var(--shell-text)', outline: 'none' }}
              />
            </div>
            <div className="flex items-center gap-1" style={{ flexWrap: 'wrap' }}>
              {(['all', ...CATEGORY_ORDER] as const).map(cat => (
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
                  {cat === 'all' ? 'All' : CONNECTOR_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Groups */}
          <div className="flex flex-col gap-5">
            {grouped.map(group => (
              <div key={group.category}>
                <p className="text-[11px] font-semibold uppercase mb-2" style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
                  {group.label}
                </p>
                <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(272px, 1fr))' }}>
                  {group.connectors.map(connector => (
                    <div
                      key={connector.id}
                      className="rounded-[4px] transition-shadow cursor-pointer group"
                      style={{
                        background: 'var(--card-bg)',
                        border: connector.configured
                          ? '1px solid rgba(49,165,109,0.35)'
                          : '1px solid var(--card-border)',
                        padding: '14px 16px',
                      }}
                      onClick={() => setSelectedConnector(connector)}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold truncate" style={{ color: 'var(--shell-text)' }}>
                              {connector.name}
                            </span>
                            {connector.configured && (
                              <CheckCircle2 size={12} style={{ color: '#31A56D', flexShrink: 0 }} />
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
                            {connector.vendor}
                          </p>
                        </div>
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-[3px] flex-shrink-0"
                          style={{ background: 'var(--shell-raised)', color: 'var(--shell-text-muted)', border: '1px solid var(--ctrl-border)' }}
                        >
                          {connector.authType === 'connection-string' ? 'Conn. String'
                            : connector.authType === 'api-key' ? 'API Key'
                            : connector.authType === 'oauth' ? 'OAuth 2.0'
                            : connector.authType === 'credentials' ? 'Credentials' : 'Certificate'}
                        </span>
                      </div>

                      <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--shell-text-muted)' }}>
                        {connector.description}
                      </p>

                      {/* Tags */}
                      {connector.tags && connector.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {connector.tags.map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-[3px]" style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      {connector.configured ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px]" style={{ color: '#31A56D' }}>{connector.configuredAs}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
                              {connector.connectedPipelines} pipeline{connector.connectedPipelines !== 1 ? 's' : ''} connected
                            </p>
                          </div>
                          <button
                            className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity rounded-[44px]"
                            style={{ color: 'var(--shell-accent)', background: 'var(--shell-active)', border: '1px solid var(--shell-accent)', cursor: 'pointer', padding: '3px 10px' }}
                            onClick={e => { e.stopPropagation(); navigate('/pipeline/new'); }}
                          >
                            Use in Pipeline
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
                            <AlertCircle size={11} /> Not configured
                          </span>
                          <button
                            className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity rounded-[44px]"
                            style={{ color: 'var(--shell-accent)', background: 'var(--shell-active)', border: '1px solid var(--shell-accent)', cursor: 'pointer', padding: '3px 10px' }}
                            onClick={e => { e.stopPropagation(); setConfigureConnector(connector); }}
                          >
                            Configure
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* AI builder callout */}
          <div
            className="flex items-center gap-4 rounded-[4px] mt-6"
            style={{ background: 'var(--shell-active)', border: '1px solid rgba(99,96,216,0.2)', padding: '14px 18px' }}
          >
            <div className="flex-1">
              <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-accent)' }}>Don't see your tool?</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
                Use the AI Connector Builder to auto-generate a production-ready connector from an OpenAPI spec, Swagger file, Postman collection, or GitHub repository.
              </p>
            </div>
            <button
              onClick={() => setShowAIBuilder(true)}
              className="flex items-center gap-2 text-[12px] font-medium flex-shrink-0"
              style={{ padding: '7px 14px', background: 'var(--shell-accent)', color: '#fff', border: 'none', borderRadius: 44, cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dark)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--shell-accent)')}
            >
              ✦ Build from Spec
            </button>
          </div>
        </>
      )}

      {/* ── CREDENTIALS TAB ── */}
      {activeTab === 'credentials' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[12px]" style={{ color: 'var(--shell-text-muted)' }}>
              Credentials are managed by Admins and are never exposed to pipeline builders.
            </p>
            <button
              className="flex items-center gap-2 text-[12px] font-medium"
              style={{ padding: '6px 14px', background: 'var(--shell-accent)', color: '#fff', border: 'none', borderRadius: 44, cursor: 'pointer' }}
            >
              <Plus size={13} /> Add Credential
            </button>
          </div>

          <div className="rounded-[4px] overflow-hidden" style={{ border: '1px solid var(--table-border)', background: 'var(--card-bg)' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--table-th-bg)' }}>
                  {['Credential Name', 'Connector', 'Type', 'Environment', 'Pipelines', 'Health', 'Last Used', ''].map(h => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-semibold uppercase"
                      style={{ padding: '9px 14px', color: 'var(--shell-text-muted)', letterSpacing: '0.06em', borderBottom: '1px solid var(--table-border)', whiteSpace: 'nowrap' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {credentials.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px 16px', textAlign: 'center' }}>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--shell-text)' }}>No credentials stored</p>
                      <p className="text-[12px] mt-1" style={{ color: 'var(--shell-text-muted)' }}>Configure a connector to add credentials to the vault</p>
                    </td>
                  </tr>
                )}
                {credentials.map((cred, i) => {
                  const h = HEALTH_CONFIG[cred.health];
                  return (
                    <tr
                      key={cred.id}
                      className="group"
                      style={{ borderBottom: i < credentials.length - 1 ? '1px solid var(--table-border)' : 'none' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--shell-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {/* Name */}
                      <td style={{ padding: '10px 14px' }}>
                        <div className="flex items-center gap-2">
                          <Key size={12} style={{ color: 'var(--shell-text-muted)', flexShrink: 0 }} />
                          <span className="text-[12px] font-medium" style={{ color: 'var(--shell-text)' }}>
                            {cred.name}
                          </span>
                        </div>
                        <p className="text-[10px] mt-0.5 ml-5" style={{ color: 'var(--shell-text-muted)' }}>
                          Added by {cred.createdBy} on {cred.createdAt}
                        </p>
                      </td>
                      {/* Connector */}
                      <td style={{ padding: '10px 14px' }}>
                        <span className="text-[12px]" style={{ color: 'var(--shell-text)' }}>{cred.connectorName}</span>
                      </td>
                      {/* Type */}
                      <td style={{ padding: '10px 14px' }}>
                        <span
                          className="text-[11px] px-1.5 py-0.5 rounded-[3px]"
                          style={{ background: 'var(--shell-raised)', color: 'var(--shell-text-muted)', border: '1px solid var(--ctrl-border)' }}
                        >
                          {cred.type}
                        </span>
                      </td>
                      {/* Environment */}
                      <td style={{ padding: '10px 14px' }}>
                        <span className="text-[12px]" style={{ color: 'var(--shell-text-muted)' }}>
                          {cred.environment.charAt(0).toUpperCase() + cred.environment.slice(1)}
                        </span>
                      </td>
                      {/* Pipelines */}
                      <td style={{ padding: '10px 14px' }}>
                        <span className="text-[12px] tabular-nums" style={{ color: 'var(--shell-text)' }}>
                          {cred.connectedPipelines}
                        </span>
                      </td>
                      {/* Health */}
                      <td style={{ padding: '10px 14px' }}>
                        <div>
                          <span
                            className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-[44px] w-fit"
                            style={{ background: h.bg, color: h.color }}
                          >
                            {h.icon} {h.label}
                          </span>
                          {cred.healthMessage && (
                            <p className="text-[10px] mt-0.5 max-w-[200px] leading-tight" style={{ color: cred.health === 'error' ? '#D12329' : '#D98B1D' }}>
                              {cred.healthMessage.split('—')[0].trim()}
                            </p>
                          )}
                        </div>
                      </td>
                      {/* Last used */}
                      <td style={{ padding: '10px 14px' }}>
                        <span className="text-[12px]" style={{ color: 'var(--shell-text-muted)' }}>{cred.lastUsed}</span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '10px 14px' }}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="flex items-center justify-center w-7 h-7 rounded-[4px] transition-colors hover:bg-[var(--shell-hover)]"
                            title="Rotate credential"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
                          >
                            <RotateCcw size={13} />
                          </button>
                          <button
                            className="flex items-center justify-center w-7 h-7 rounded-[4px] transition-colors hover:bg-[#F9EEEE]"
                            title="Delete credential"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D12329' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vault info note */}
          <div
            className="flex items-center gap-3 mt-4 rounded-[4px]"
            style={{ background: 'var(--shell-raised)', border: '1px solid var(--ctrl-border)', padding: '10px 14px' }}
          >
            <Key size={13} style={{ color: 'var(--shell-text-muted)', flexShrink: 0 }} />
            <p className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
              All credentials are AES-256 encrypted at rest. Raw values are never logged or exposed to non-Admin roles.
              Security Engineers see only the credential name when building pipelines.
            </p>
          </div>
        </div>
      )}

      {/* ── Connector detail panel ── */}
      {selectedConnector && (
        <ConnectorDetailPanel
          connector={selectedConnector}
          onClose={() => setSelectedConnector(null)}
          onUseInPipeline={() => {
            setSelectedConnector(null);
            if (!selectedConnector.configured) {
              setConfigureConnector(selectedConnector);
            } else {
              navigate('/pipeline/new');
            }
          }}
        />
      )}

      {/* ── Configure modal ── */}
      {configureConnector && (
        <ConfigureConnectorModal
          connector={configureConnector}
          onClose={() => setConfigureConnector(null)}
          onSave={handleConfigureSave}
        />
      )}

      {/* ── AI builder modal ── */}
      {showAIBuilder && (
        <AIConnectorBuilderModal
          onClose={() => setShowAIBuilder(false)}
          onSave={() => {
            setShowAIBuilder(false);
            setSaveSuccess('Recorded Future Intelligence');
            setTimeout(() => setSaveSuccess(null), 4000);
          }}
        />
      )}
    </div>
  );
}
