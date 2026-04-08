import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, CheckCircle2, XCircle, AlertTriangle, RefreshCw,
  GitBranch, Key, Clock, ChevronRight, Loader2, Shield,
} from 'lucide-react';
import type { CyberConnector, Credential } from '@/types';
import { CONNECTOR_CATEGORY_LABELS } from '@/types';
import { mockPipelines, mockCredentials } from '@/data/mock';

interface Props {
  connector: CyberConnector;
  onClose: () => void;
  onUseInPipeline: () => void;
}

const HEALTH_CONFIG = {
  healthy: { label: 'Connected',  bg: '#EFF7ED', color: '#31A56D', icon: <CheckCircle2 size={13} /> },
  warning: { label: 'Warning',    bg: '#FEF3C7', color: '#D98B1D', icon: <AlertTriangle size={13} /> },
  error:   { label: 'Error',      bg: '#F9EEEE', color: '#D12329', icon: <XCircle size={13} /> },
};

export default function ConnectorDetailPanel({ connector, onClose, onUseInPipeline }: Props) {
  const navigate = useNavigate();
  const [testState, setTestState] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');

  const credential = mockCredentials.find(c => c.connectorId === connector.id) as Credential | undefined;
  const linkedPipelines = mockPipelines.filter(p => p.connectorType === connector.id);
  const health = credential ? HEALTH_CONFIG[credential.health] : null;

  function handleTest() {
    setTestState('testing');
    setTimeout(() => {
      setTestState(credential?.health === 'error' ? 'fail' : 'success');
      setTimeout(() => setTestState('idle'), 3000);
    }, 2200);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.18)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-hidden"
        style={{
          width: 360,
          background: 'var(--card-bg)',
          borderLeft: '1px solid var(--card-border)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between flex-shrink-0"
          style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}
        >
          <div>
            <p className="text-[14px] font-semibold" style={{ color: 'var(--shell-text)' }}>
              {connector.name}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
              {connector.vendor} · {CONNECTOR_CATEGORY_LABELS[connector.category]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-[4px] transition-colors hover:bg-[var(--shell-hover)]"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '16px 20px' }}>

          {/* Connection status */}
          {credential && health && (
            <div
              className="rounded-[4px] p-3 mb-4"
              style={{ background: health.bg, border: `1px solid ${health.color}30` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span style={{ color: health.color }}>{health.icon}</span>
                <span className="text-[12px] font-semibold" style={{ color: health.color }}>
                  {health.label}
                </span>
              </div>
              {credential.healthMessage ? (
                <p className="text-[11px]" style={{ color: health.color }}>{credential.healthMessage}</p>
              ) : (
                <p className="text-[11px]" style={{ color: health.color }}>
                  Last authenticated {credential.lastAuthAt}
                </p>
              )}
            </div>
          )}

          {!connector.configured && (
            <div
              className="rounded-[4px] p-3 mb-4"
              style={{ background: 'var(--shell-raised)', border: '1px solid var(--ctrl-border)' }}
            >
              <p className="text-[12px] font-medium mb-1" style={{ color: 'var(--shell-text)' }}>
                Not yet configured
              </p>
              <p className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
                Add credentials to enable this connector for pipelines.
              </p>
            </div>
          )}

          {/* Description */}
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase mb-1.5"
              style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
              About
            </p>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--shell-text)' }}>
              {connector.description}
            </p>
          </div>

          {/* Details grid */}
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase mb-2"
              style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
              Details
            </p>
            <div className="flex flex-col" style={{ gap: 0 }}>
              {[
                { icon: <Shield size={12} />,    label: 'Auth Type',    value: connector.authType === 'api-key' ? 'API Key' : connector.authType === 'oauth' ? 'OAuth 2.0' : connector.authType === 'credentials' ? 'Username / Password' : connector.authType === 'connection-string' ? 'Connection String' : 'Certificate' },
                { icon: <GitBranch size={12} />, label: 'Category',     value: CONNECTOR_CATEGORY_LABELS[connector.category] },
                { icon: <GitBranch size={12} />, label: 'Pipelines',    value: linkedPipelines.length ? `${linkedPipelines.length} connected` : 'None' },
                ...(credential ? [
                  { icon: <Key size={12} />,   label: 'Credential',   value: credential.name },
                  { icon: <Clock size={12} />, label: 'Last Used',    value: credential.lastUsed },
                  { icon: <Shield size={12} />, label: 'Environment', value: credential.environment.charAt(0).toUpperCase() + credential.environment.slice(1) },
                ] : []),
              ].map(row => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 py-2"
                  style={{ borderBottom: '1px solid var(--shell-border)' }}
                >
                  <span style={{ color: 'var(--shell-text-muted)', flexShrink: 0 }}>{row.icon}</span>
                  <span className="text-[11px] flex-1" style={{ color: 'var(--shell-text-muted)' }}>
                    {row.label}
                  </span>
                  <span className="text-[12px] font-medium" style={{ color: 'var(--shell-text)' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Linked pipelines */}
          {linkedPipelines.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase mb-2"
                style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
                Linked Pipelines
              </p>
              <div className="flex flex-col gap-1">
                {linkedPipelines.map(p => {
                  const statusColors = {
                    active: '#31A56D', paused: '#D98B1D', failed: '#D12329', running: '#6360D8',
                  };
                  return (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/pipeline/${p.id}`)}
                      className="flex items-center gap-2 rounded-[4px] text-left transition-colors group"
                      style={{
                        padding: '8px 10px',
                        background: 'var(--shell-raised)',
                        border: '1px solid var(--ctrl-border)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--shell-active)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--shell-raised)')}
                    >
                      <span
                        className="rounded-full flex-shrink-0"
                        style={{ width: 6, height: 6, background: statusColors[p.status] }}
                      />
                      <span className="text-[12px] flex-1 truncate" style={{ color: 'var(--shell-text)' }}>
                        {p.name}
                      </span>
                      <ChevronRight size={11} style={{ color: 'var(--shell-text-muted)', flexShrink: 0 }} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {connector.tags && connector.tags.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] font-semibold uppercase mb-2"
                style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
                Capabilities
              </p>
              <div className="flex flex-wrap gap-1.5">
                {connector.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded-[3px]"
                    style={{ background: 'var(--shell-active)', color: 'var(--shell-accent)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Test connection result */}
          {testState === 'success' && (
            <div
              className="flex items-center gap-2 rounded-[4px] p-3 mb-4"
              style={{ background: '#EFF7ED', border: '1px solid rgba(49,165,109,0.3)' }}
            >
              <CheckCircle2 size={13} style={{ color: '#31A56D' }} />
              <p className="text-[12px]" style={{ color: '#31A56D' }}>
                Connection successful — API responded in 142ms
              </p>
            </div>
          )}
          {testState === 'fail' && (
            <div
              className="flex items-center gap-2 rounded-[4px] p-3 mb-4"
              style={{ background: '#F9EEEE', border: '1px solid rgba(209,35,41,0.3)' }}
            >
              <XCircle size={13} style={{ color: '#D12329' }} />
              <p className="text-[12px]" style={{ color: '#D12329' }}>
                Connection failed — {credential?.healthMessage ?? 'Unable to reach endpoint'}
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="flex flex-col gap-2 flex-shrink-0"
          style={{ padding: '12px 20px', borderTop: '1px solid var(--card-border)' }}
        >
          {connector.configured ? (
            <>
              {credential?.health === 'error' ? (
                <div>
                  <button
                    disabled
                    className="w-full text-[12px] font-medium rounded-[44px]"
                    style={{
                      padding: '8px',
                      background: 'var(--ctrl-border)',
                      color: 'var(--shell-text-muted)',
                      border: 'none',
                      cursor: 'not-allowed',
                    }}
                  >
                    Use in Pipeline
                  </button>
                  <p className="text-[11px] mt-2 text-center" style={{ color: '#D12329' }}>
                    Fix credential error before using in a pipeline
                  </p>
                </div>
              ) : (
              <button
                onClick={onUseInPipeline}
                className="w-full text-[12px] font-medium rounded-[44px] transition-colors"
                style={{
                  padding: '8px',
                  background: 'var(--shell-accent)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-dark)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--shell-accent)')}
              >
                Use in Pipeline
              </button>
              )}
              <button
                onClick={handleTest}
                disabled={testState === 'testing'}
                className="w-full flex items-center justify-center gap-2 text-[12px] font-medium rounded-[44px] transition-colors"
                style={{
                  padding: '8px',
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
                  : <><RefreshCw size={13} /> Test Connection</>
                }
              </button>
            </>
          ) : (
            <button
              onClick={onUseInPipeline}
              className="w-full text-[12px] font-medium rounded-[44px]"
              style={{
                padding: '8px',
                background: 'var(--shell-accent)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Configure Connector
            </button>
          )}
        </div>
      </div>
    </>
  );
}
