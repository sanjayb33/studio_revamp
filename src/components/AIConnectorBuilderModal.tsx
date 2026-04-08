import { useState } from 'react';
import {
  X, Link2, FileCode2, Upload, Github, ChevronRight,
  Loader2, CheckCircle2, Sparkles, ChevronDown, ChevronUp,
} from 'lucide-react';
import type { AIBuilderSourceType, AIBuilderResult, AIBuilderDiscoveredFeed } from '@/types';

interface Props {
  onClose: () => void;
  onSave: (result: AIBuilderResult) => void;
}

type Step = 'source' | 'input' | 'analyzing' | 'preview' | 'done';

const SOURCE_OPTIONS: { id: AIBuilderSourceType; label: string; description: string; icon: React.ReactNode; placeholder: string }[] = [
  { id: 'url',    label: 'OpenAPI / Swagger URL',    description: 'Paste a URL to a publicly hosted OpenAPI or Swagger spec',  icon: <Link2 size={18} />,    placeholder: 'https://api.example.com/openapi.json' },
  { id: 'paste',  label: 'Paste Spec',               description: 'Paste raw OpenAPI JSON, YAML, or Postman collection JSON',   icon: <FileCode2 size={18} />, placeholder: 'Paste OpenAPI JSON or YAML here…' },
  { id: 'upload', label: 'Upload File',               description: 'Upload .json, .yaml, .yml, or .postman_collection file',     icon: <Upload size={18} />,   placeholder: '' },
  { id: 'github', label: 'GitHub Repository',         description: 'Point to a GitHub repo — AI will locate API specs automatically', icon: <Github size={18} />,  placeholder: 'https://github.com/org/repo' },
];

// Simulated AI analysis result for "Recorded Future" URL
const MOCK_RESULT: AIBuilderResult = {
  connectorName:  'Recorded Future Intelligence',
  vendor:         'Recorded Future',
  category:       'threat-intel',
  authType:       'api-key',
  baseUrl:        'https://api.recordedfuture.com/v2',
  confidence:     94,
  endpoints:      38,
  feedsDiscovered: [
    {
      id: 'f1', selected: true,
      name: 'Threat Actor Intelligence',
      endpoint: '/entity/threatactor',
      description: 'Threat actor profiles, attribution data, and TTPs mapped to MITRE ATT&CK',
      entityTypes: ['account'],
    },
    {
      id: 'f2', selected: true,
      name: 'IOC / Indicator Feed',
      endpoint: '/entity/ip, /entity/domain, /entity/hash',
      description: 'IP addresses, domains, URLs, and file hashes with risk scores and context',
      entityTypes: ['finding'],
    },
    {
      id: 'f3', selected: true,
      name: 'CVE Intelligence',
      endpoint: '/entity/vulnerability',
      description: 'Vulnerability data enriched with exploitation likelihood and affected products',
      entityTypes: ['vulnerability'],
    },
    {
      id: 'f4', selected: false,
      name: 'Dark Web Monitoring',
      endpoint: '/entity/malware',
      description: 'Malware families, ransomware groups, and dark web chatter references',
      entityTypes: ['account', 'finding'],
    },
    {
      id: 'f5', selected: false,
      name: 'Identity Exposure',
      endpoint: '/entity/identity',
      description: 'Leaked credentials and identity exposure events tied to your domains',
      entityTypes: ['identity'],
    },
  ],
};

const ANALYSIS_STEPS = [
  { label: 'Fetching API specification…',         ms: 600 },
  { label: 'Parsing endpoints and schemas…',      ms: 500 },
  { label: 'Identifying authentication method…', ms: 400 },
  { label: 'Discovering data feeds…',             ms: 700 },
  { label: 'Mapping to KG entity types…',         ms: 600 },
  { label: 'Generating connector configuration…', ms: 500 },
];

export default function AIConnectorBuilderModal({ onClose, onSave }: Props) {
  const [step, setStep] = useState<Step>('source');
  const [sourceType, setSourceType] = useState<AIBuilderSourceType>('url');
  const [inputValue, setInputValue] = useState('');
  const [analysisStep, setAnalysisStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [result, setResult] = useState<AIBuilderResult | null>(null);
  const [feeds, setFeeds] = useState<AIBuilderDiscoveredFeed[]>([]);
  const [connectorName, setConnectorName] = useState('');
  const [expandedFeed, setExpandedFeed] = useState<string | null>(null);

  function startAnalysis() {
    setStep('analyzing');
    setAnalysisStep(0);
    setCompletedSteps([]);

    let current = 0;
    const runStep = () => {
      if (current < ANALYSIS_STEPS.length) {
        setAnalysisStep(current);
        setTimeout(() => {
          setCompletedSteps(prev => [...prev, current]);
          current++;
          runStep();
        }, ANALYSIS_STEPS[current].ms);
      } else {
        const r = { ...MOCK_RESULT };
        setResult(r);
        setFeeds(r.feedsDiscovered.map(f => ({ ...f })));
        setConnectorName(r.connectorName);
        setTimeout(() => setStep('preview'), 300);
      }
    };
    runStep();
  }

  function toggleFeed(id: string) {
    setFeeds(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
  }

  function handleSave() {
    if (!result) return;
    onSave({ ...result, connectorName, feedsDiscovered: feeds });
    setStep('done');
  }

  const selectedFeeds = feeds.filter(f => f.selected);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.35)' }}
        onClick={step !== 'analyzing' ? onClose : undefined}
      />

      {/* Modal */}
      <div
        className="fixed z-50 flex flex-col"
        style={{
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 560,
          maxHeight: '88vh',
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 8,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 flex-shrink-0"
          style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}
        >
          <div
            className="flex items-center justify-center rounded-[6px]"
            style={{ width: 32, height: 32, background: 'var(--shell-active)', flexShrink: 0 }}
          >
            <Sparkles size={16} style={{ color: 'var(--shell-accent)' }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold" style={{ color: 'var(--shell-text)' }}>
              AI Connector Builder
            </p>
            <p className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
              Generate a production-ready connector from any API specification
            </p>
          </div>
          {step !== 'analyzing' && (
            <button
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-[4px] hover:bg-[var(--shell-hover)] transition-colors"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div
            className="flex items-center gap-0 flex-shrink-0"
            style={{ padding: '10px 20px', borderBottom: '1px solid var(--card-border)', background: 'var(--shell-raised)' }}
          >
            {(['source', 'input', 'analyzing', 'preview'] as Step[]).map((s, i) => {
              const labels: Record<Step, string> = {
                source: '1. Source', input: '2. Input', analyzing: '3. Analyzing', preview: '4. Review', done: '',
              };
              const steps: Step[] = ['source', 'input', 'analyzing', 'preview'];
              const idx = steps.indexOf(step);
              const sIdx = steps.indexOf(s);
              const done = sIdx < idx;
              const active = s === step;
              return (
                <div key={s} className="flex items-center">
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-[3px]"
                    style={{
                      color: done ? '#31A56D' : active ? 'var(--shell-accent)' : 'var(--shell-text-muted)',
                      background: active ? 'var(--shell-active)' : 'transparent',
                    }}
                  >
                    {done ? <CheckCircle2 size={11} className="inline mr-1" /> : null}
                    {labels[s]}
                  </span>
                  {i < 3 && <ChevronRight size={12} style={{ color: 'var(--shell-text-muted)', margin: '0 2px' }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>

          {/* ── Step 1: Source ── */}
          {step === 'source' && (
            <div>
              <p className="text-[12px] mb-4" style={{ color: 'var(--shell-text-muted)' }}>
                Choose how to provide the API specification for the connector you want to build.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {SOURCE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSourceType(opt.id)}
                    className="flex flex-col items-start gap-2 rounded-[6px] text-left transition-colors"
                    style={{
                      padding: '14px',
                      background: sourceType === opt.id ? 'var(--shell-active)' : 'var(--shell-raised)',
                      border: sourceType === opt.id
                        ? '2px solid var(--shell-accent)'
                        : '2px solid transparent',
                      cursor: 'pointer',
                      outline: 'none',
                    }}
                  >
                    <span style={{ color: sourceType === opt.id ? 'var(--shell-accent)' : 'var(--shell-text-muted)' }}>
                      {opt.icon}
                    </span>
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: 'var(--shell-text)' }}>
                        {opt.label}
                      </p>
                      <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--shell-text-muted)' }}>
                        {opt.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Input ── */}
          {step === 'input' && (
            <div>
              <p className="text-[13px] font-semibold mb-1" style={{ color: 'var(--shell-text)' }}>
                {SOURCE_OPTIONS.find(s => s.id === sourceType)?.label}
              </p>
              <p className="text-[12px] mb-4" style={{ color: 'var(--shell-text-muted)' }}>
                {SOURCE_OPTIONS.find(s => s.id === sourceType)?.description}
              </p>

              {sourceType === 'upload' ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-[6px]"
                  style={{
                    padding: '40px 20px',
                    border: '2px dashed var(--ctrl-border)',
                    background: 'var(--shell-raised)',
                    cursor: 'pointer',
                  }}
                >
                  <Upload size={24} style={{ color: 'var(--shell-text-muted)' }} />
                  <div className="text-center">
                    <p className="text-[12px] font-medium" style={{ color: 'var(--shell-text)' }}>
                      Drop file here or click to browse
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
                      .json, .yaml, .yml, .postman_collection
                    </p>
                  </div>
                  <button
                    className="text-[12px] font-medium px-4 py-2 rounded-[44px]"
                    style={{ background: 'var(--card-bg)', border: '1px solid var(--ctrl-border)', cursor: 'pointer', color: 'var(--shell-text)' }}
                    onClick={() => setInputValue('uploaded-file.json')}
                  >
                    Browse Files
                  </button>
                </div>
              ) : sourceType === 'paste' ? (
                <textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={SOURCE_OPTIONS.find(s => s.id === sourceType)?.placeholder}
                  className="w-full text-[11px] rounded-[4px] font-mono resize-none"
                  style={{
                    height: 200,
                    padding: '10px 12px',
                    background: '#1a1a2e',
                    color: '#e2e8f0',
                    border: '1px solid var(--ctrl-border)',
                    outline: 'none',
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder={SOURCE_OPTIONS.find(s => s.id === sourceType)?.placeholder}
                  className="w-full text-[12px] rounded-[4px]"
                  style={{
                    padding: '10px 12px',
                    background: 'var(--ctrl-bg)',
                    border: '1px solid var(--ctrl-border)',
                    color: 'var(--shell-text)',
                    outline: 'none',
                  }}
                />
              )}

              {/* Example hint */}
              <p className="text-[11px] mt-2" style={{ color: 'var(--shell-text-muted)' }}>
                Example: try{' '}
                <button
                  className="underline"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-accent)', padding: 0, fontSize: 11 }}
                  onClick={() => setInputValue('https://api.recordedfuture.com/swagger.json')}
                >
                  https://api.recordedfuture.com/swagger.json
                </button>
              </p>
            </div>
          )}

          {/* ── Step 3: Analyzing ── */}
          {step === 'analyzing' && (
            <div className="flex flex-col items-center" style={{ padding: '20px 0' }}>
              <div
                className="flex items-center justify-center rounded-full mb-5"
                style={{ width: 56, height: 56, background: 'var(--shell-active)' }}
              >
                <Sparkles size={24} style={{ color: 'var(--shell-accent)' }} />
              </div>
              <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--shell-text)' }}>
                Analyzing Specification…
              </p>
              <p className="text-[12px] mb-6" style={{ color: 'var(--shell-text-muted)' }}>
                AI is discovering endpoints and mapping to KG entity types
              </p>

              <div className="w-full flex flex-col gap-2">
                {ANALYSIS_STEPS.map((s, i) => {
                  const done = completedSteps.includes(i);
                  const active = analysisStep === i && !done;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-[4px] transition-all"
                      style={{
                        padding: '9px 12px',
                        background: done ? '#EFF7ED' : active ? 'var(--shell-active)' : 'var(--shell-raised)',
                        border: done ? '1px solid rgba(49,165,109,0.3)' : active ? '1px solid rgba(99,96,216,0.3)' : '1px solid transparent',
                      }}
                    >
                      {done
                        ? <CheckCircle2 size={14} style={{ color: '#31A56D', flexShrink: 0 }} />
                        : active
                        ? <Loader2 size={14} className="animate-spin flex-shrink-0" style={{ color: 'var(--shell-accent)' }} />
                        : <span className="rounded-full flex-shrink-0" style={{ width: 14, height: 14, border: '2px solid var(--ctrl-border)' }} />
                      }
                      <span
                        className="text-[12px]"
                        style={{ color: done ? '#31A56D' : active ? 'var(--shell-accent)' : 'var(--shell-text-muted)' }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Step 4: Preview ── */}
          {step === 'preview' && result && (
            <div>
              {/* Confidence badge */}
              <div
                className="flex items-center gap-3 rounded-[4px] mb-4 p-3"
                style={{ background: 'var(--shell-active)', border: '1px solid rgba(99,96,216,0.2)' }}
              >
                <Sparkles size={14} style={{ color: 'var(--shell-accent)' }} />
                <div>
                  <p className="text-[12px] font-semibold" style={{ color: 'var(--shell-accent)' }}>
                    AI Confidence: {result.confidence}%
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
                    {result.endpoints} endpoints analyzed · {result.feedsDiscovered.length} feeds discovered
                  </p>
                </div>
              </div>

              {/* Connector name (editable) */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold uppercase block mb-1.5" style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
                  Connector Name
                </label>
                <input
                  type="text"
                  value={connectorName}
                  onChange={e => setConnectorName(e.target.value)}
                  className="w-full text-[12px] rounded-[4px]"
                  style={{
                    padding: '8px 12px',
                    background: 'var(--ctrl-bg)',
                    border: '1px solid var(--ctrl-border)',
                    color: 'var(--shell-text)',
                    outline: 'none',
                    fontWeight: 500,
                  }}
                />
              </div>

              {/* Detected properties */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: 'Vendor',    value: result.vendor },
                  { label: 'Auth',      value: result.authType === 'api-key' ? 'API Key' : result.authType },
                  { label: 'Base URL',  value: result.baseUrl },
                ].map(item => (
                  <div key={item.label} className="rounded-[4px] p-2.5" style={{ background: 'var(--shell-raised)', border: '1px solid var(--ctrl-border)' }}>
                    <p className="text-[10px] font-semibold uppercase mb-1" style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>{item.label}</p>
                    <p className="text-[11px] font-medium truncate" style={{ color: 'var(--shell-text)' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Feeds */}
              <div>
                <p className="text-[11px] font-semibold uppercase mb-2" style={{ color: 'var(--shell-text-muted)', letterSpacing: '0.06em' }}>
                  Discovered Feeds ({selectedFeeds.length} of {feeds.length} selected)
                </p>
                <div className="flex flex-col gap-2">
                  {feeds.map(feed => (
                    <div
                      key={feed.id}
                      className="rounded-[4px]"
                      style={{
                        background: feed.selected ? 'var(--shell-active)' : 'var(--shell-raised)',
                        border: feed.selected ? '1px solid rgba(99,96,216,0.3)' : '1px solid var(--ctrl-border)',
                      }}
                    >
                      <div
                        className="flex items-start gap-3 p-3 cursor-pointer"
                        onClick={() => toggleFeed(feed.id)}
                      >
                        {/* Checkbox */}
                        <div
                          className="flex items-center justify-center rounded-[3px] flex-shrink-0 mt-0.5"
                          style={{
                            width: 16, height: 16,
                            background: feed.selected ? 'var(--shell-accent)' : 'var(--ctrl-bg)',
                            border: `1.5px solid ${feed.selected ? 'var(--shell-accent)' : 'var(--ctrl-border)'}`,
                          }}
                        >
                          {feed.selected && <CheckCircle2 size={10} color="#fff" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold" style={{ color: 'var(--shell-text)' }}>
                            {feed.name}
                          </p>
                          <p className="text-[11px] mt-0.5" style={{ color: 'var(--shell-text-muted)' }}>
                            {feed.entityTypes.join(', ')} entities
                          </p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setExpandedFeed(expandedFeed === feed.id ? null : feed.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)', flexShrink: 0 }}
                        >
                          {expandedFeed === feed.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>
                      </div>
                      {expandedFeed === feed.id && (
                        <div
                          style={{ padding: '0 12px 10px 35px', borderTop: '1px solid var(--shell-border)' }}
                        >
                          <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--shell-text-muted)' }}>
                            {feed.description}
                          </p>
                          <p className="text-[10px] mt-1 font-mono" style={{ color: 'var(--shell-text-muted)' }}>
                            {feed.endpoint}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center text-center" style={{ padding: '32px 0' }}>
              <div
                className="flex items-center justify-center rounded-full mb-4"
                style={{ width: 56, height: 56, background: '#EFF7ED' }}
              >
                <CheckCircle2 size={28} style={{ color: '#31A56D' }} />
              </div>
              <p className="text-[14px] font-semibold mb-1" style={{ color: 'var(--shell-text)' }}>
                Connector Created
              </p>
              <p className="text-[12px]" style={{ color: 'var(--shell-text-muted)' }}>
                <strong>{connectorName}</strong> is now available in your connector library.
                Add credentials to start using it in pipelines.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between gap-3 flex-shrink-0"
          style={{ padding: '12px 20px', borderTop: '1px solid var(--card-border)', background: 'var(--shell-raised)' }}
        >
          {step === 'source' && (
            <>
              <button onClick={onClose} style={{ fontSize: 12, color: 'var(--shell-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={() => setStep('input')}
                className="flex items-center gap-2 text-[12px] font-medium rounded-[44px]"
                style={{ padding: '7px 18px', background: 'var(--shell-accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Continue <ChevronRight size={13} />
              </button>
            </>
          )}
          {step === 'input' && (
            <>
              <button
                onClick={() => setStep('source')}
                style={{ fontSize: 12, color: 'var(--shell-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                ← Back
              </button>
              <button
                onClick={startAnalysis}
                disabled={sourceType !== 'upload' && !inputValue.trim()}
                className="flex items-center gap-2 text-[12px] font-medium rounded-[44px]"
                style={{
                  padding: '7px 18px',
                  background: (sourceType !== 'upload' && !inputValue.trim()) ? 'var(--ctrl-border)' : 'var(--shell-accent)',
                  color: '#fff',
                  border: 'none',
                  cursor: (sourceType !== 'upload' && !inputValue.trim()) ? 'not-allowed' : 'pointer',
                }}
              >
                <Sparkles size={13} /> Analyze with AI
              </button>
            </>
          )}
          {step === 'preview' && (
            <>
              <div className="text-[11px]" style={{ color: 'var(--shell-text-muted)' }}>
                {selectedFeeds.length} feed{selectedFeeds.length !== 1 ? 's' : ''} selected
              </div>
              <button
                onClick={handleSave}
                disabled={selectedFeeds.length === 0 || !connectorName.trim()}
                className="flex items-center gap-2 text-[12px] font-medium rounded-[44px]"
                style={{
                  padding: '7px 18px',
                  background: (selectedFeeds.length === 0 || !connectorName.trim()) ? 'var(--ctrl-border)' : 'var(--shell-accent)',
                  color: '#fff',
                  border: 'none',
                  cursor: (selectedFeeds.length === 0 || !connectorName.trim()) ? 'not-allowed' : 'pointer',
                }}
              >
                <CheckCircle2 size={13} /> Save Connector
              </button>
            </>
          )}
          {step === 'done' && (
            <div className="flex w-full justify-end gap-2">
              <button
                onClick={onClose}
                className="text-[12px] font-medium rounded-[44px]"
                style={{ padding: '7px 18px', background: 'var(--shell-accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
