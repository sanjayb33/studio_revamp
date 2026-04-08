import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import type { ChatMessage } from '@/types';

const PAGE_PROMPTS: Record<string, string[]> = {
  '/': [
    'Show pipeline health summary',
    'Which pipelines have failed recently?',
    'Recommend new pipeline from Salesforce to Snowflake',
  ],
  '/pipeline/new': [
    'Describe your data source in plain English',
    'What connectors support incremental load?',
    'Help me configure Salesforce OAuth',
  ],
  '/pipelines': [
    'Which pipelines need attention?',
    'Show me pipelines running behind schedule',
    'Bulk pause all non-critical pipelines',
  ],
  '/settings': [
    'How do I rotate credentials securely?',
    'Add a new team member as editor',
    'Set up Slack alerts for failed runs',
  ],
};

const DEFAULT_PROMPTS = [
  'Create a pipeline from Salesforce to Snowflake',
  'Debug my last failed run',
  'Auto-map these fields',
];

// Simulated streaming response — replace with real Anthropic SDK call when backend proxy is available
async function streamAIResponse(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  onDone: () => void,
) {
  const lastMsg = messages[messages.length - 1]?.content ?? '';

  const responses: Record<string, string> = {
    salesforce: 'I can help you set up a **Salesforce → Snowflake** pipeline. Here\'s a quick plan:\n\n1. Select **Salesforce** as source connector\n2. Authenticate via OAuth 2.0\n3. Choose objects (Accounts, Contacts, Opportunities)\n4. Map fields with AI Auto-map\n5. Schedule every 15 minutes\n\nWould you like me to start the wizard?',
    failed: 'Looking at your recent runs… The **REST API → S3** pipeline failed 30 min ago with:\n\n```\nConnection timeout after 3 retries\n```\n\n**Root cause:** The target endpoint returned `403 Forbidden` — likely an expired API token. Rotate the credential in Settings → Credential Vault, then trigger a manual re-run.',
    'auto-map': 'I analyzed your source schema and suggested **8 field mappings** with an average confidence of **96%**. The only uncertain mapping is `AnnualRevenue → annual_revenue_usd` (92%) — you may want to verify the currency conversion transform.',
    default: 'I\'m your **Data Ingestion AI Assistant**. I can help you:\n\n- **Design** new pipelines with natural language\n- **Debug** errors and diagnose root causes\n- **Auto-map** source ↔ target fields\n- **Optimize** schedules and batch sizes\n\nWhat would you like to do?',
  };

  const lower = lastMsg.toLowerCase();
  let reply = responses.default;
  if (lower.includes('salesforce') || lower.includes('snowflake') || lower.includes('pipeline')) reply = responses.salesforce;
  else if (lower.includes('fail') || lower.includes('debug') || lower.includes('error')) reply = responses.failed;
  else if (lower.includes('map') || lower.includes('field')) reply = responses['auto-map'];

  // Simulate token streaming
  const words = reply.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 20));
    onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
  }
  onDone();
}

function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--shell-raised);padding:1px 4px;border-radius:3px;font-size:11px">$1</code>')
    .replace(/```([\s\S]+?)```/g, '<pre style="background:var(--shell-raised);padding:8px;border-radius:4px;font-size:11px;overflow-x:auto;margin:4px 0">$1</pre>')
    .replace(/\n/g, '<br/>');
}

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const location = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);

  const prompts = PAGE_PROMPTS[location.pathname] ?? DEFAULT_PROMPTS;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const assistantMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setStreaming(true);

    await streamAIResponse(
      [...messages, userMsg],
      (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: m.content + chunk } : m,
          ),
        );
      },
      () => setStreaming(false),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col rounded-[12px] overflow-hidden"
          style={{
            bottom: 80,
            right: 24,
            width: 360,
            height: 500,
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--shell-border)', background: 'var(--shell-raised)' }}
          >
            <div
              className="flex items-center justify-center rounded-full"
              style={{ width: 28, height: 28, background: 'var(--shell-accent)' }}
            >
              <Bot size={14} color="#fff" />
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--shell-text)' }}>AI Assistant</div>
              <div style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>claude-sonnet-4-20250514</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--shell-text-muted)', padding: 4 }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <div className="flex flex-col gap-2">
                <p style={{ fontSize: 12, color: 'var(--shell-text-muted)', marginBottom: 8 }}>
                  Suggested for this page:
                </p>
                {prompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="text-left px-3 py-2 rounded-[8px] transition-colors"
                    style={{
                      fontSize: 12,
                      color: 'var(--shell-accent)',
                      background: 'var(--shell-active)',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="rounded-[8px] px-3 py-2 max-w-[85%]"
                  style={{
                    fontSize: 12,
                    lineHeight: '1.5',
                    background: msg.role === 'user' ? 'var(--shell-accent)' : 'var(--shell-raised)',
                    color: msg.role === 'user' ? '#fff' : 'var(--shell-text)',
                  }}
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                />
              </div>
            ))}

            {streaming && messages[messages.length - 1]?.content === '' && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-1 rounded-[8px] px-3 py-2"
                  style={{ background: 'var(--shell-raised)' }}
                >
                  <Loader2 size={12} className="animate-spin" style={{ color: 'var(--shell-text-muted)' }} />
                  <span style={{ fontSize: 11, color: 'var(--shell-text-muted)' }}>Thinking…</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            className="flex items-end gap-2 p-3 flex-shrink-0"
            style={{ borderTop: '1px solid var(--shell-border)' }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI anything…"
              rows={1}
              className="flex-1 resize-none rounded-[8px] px-3 py-2 outline-none"
              style={{
                fontSize: 12,
                background: 'var(--ctrl-bg)',
                border: '1px solid var(--ctrl-border)',
                color: 'var(--shell-text)',
                maxHeight: 100,
                lineHeight: '1.4',
              }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${el.scrollHeight}px`;
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="flex items-center justify-center flex-shrink-0 rounded-[44px] transition-colors"
              style={{
                width: 32,
                height: 32,
                background: !input.trim() || streaming ? 'var(--ctrl-border)' : 'var(--shell-accent)',
                border: 'none',
                cursor: !input.trim() || streaming ? 'not-allowed' : 'pointer',
                color: '#fff',
              }}
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Bubble toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed z-50 flex items-center justify-center rounded-full transition-all"
        style={{
          bottom: 24,
          right: 24,
          width: 48,
          height: 48,
          background: 'var(--shell-accent)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(99,96,216,0.4)',
          color: '#fff',
        }}
      >
        {open ? <X size={20} /> : <Bot size={20} />}
      </button>
    </>
  );
}
