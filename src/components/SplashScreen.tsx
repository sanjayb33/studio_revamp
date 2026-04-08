import { useEffect, useState } from 'react';

// ─── Graph nodes — mirrors the two-ring KG layout ────────────────────────────

const CENTER  = { cx: 200, cy: 200, r: 18, color: '#0EA5E9', delay: 0 };

const INNER: { cx: number; cy: number; r: number; color: string; delay: number }[] = [
  { cx: 200, cy:  90, r: 13, color: '#DB2777', delay: 180 },  // identity
  { cx: 288, cy: 145, r: 13, color: '#7C3AED', delay: 300 },  // account
  { cx: 288, cy: 255, r: 13, color: '#DC2626', delay: 420 },  // vulnerability
  { cx: 200, cy: 310, r: 12, color: '#6360D8', delay: 540 },  // finding
  { cx: 112, cy: 255, r: 11, color: '#059669', delay: 660 },  // network
  { cx: 112, cy: 145, r: 11, color: '#0891B2', delay: 780 },  // person
];

const OUTER: { cx: number; cy: number; r: number; color: string; delay: number }[] = [
  { cx: 200, cy:  14, r:  9, color: '#D97706', delay: 950  },  // application
  { cx: 298, cy:  44, r:  9, color: '#B45309', delay: 1030 },  // assessment
  { cx: 358, cy: 138, r:  9, color: '#6D28D9', delay: 1110 },  // cloud-account
  { cx: 344, cy: 248, r:  9, color: '#A78BFA', delay: 1190 },  // cloud-container
  { cx: 265, cy: 338, r:  9, color: '#2563EB', delay: 1270 },  // cloud-cluster
  { cx: 135, cy: 338, r:  9, color: '#3B82F6', delay: 1350 },  // cloud-storage
  { cx:  56, cy: 248, r:  9, color: '#0D9488', delay: 1430 },  // Group
  { cx:  42, cy: 138, r:  9, color: '#65A30D', delay: 1510 },  // network-services
  { cx: 102, cy:  44, r:  9, color: '#EC4899', delay: 1590 },  // network-interface
];

// Edges from center to inner ring
const INNER_EDGES = INNER.map(n => ({ x1: CENTER.cx, y1: CENTER.cy, x2: n.cx, y2: n.cy, delay: n.delay - 60 }));
// Edges from inner ring to outer ring (nearest inner)
const OUTER_EDGES = OUTER.map((n, i) => {
  const inner = INNER[i % INNER.length];
  return { x1: inner.cx, y1: inner.cy, x2: n.cx, y2: n.cy, delay: n.delay - 60 };
});

const ALL_NODES  = [CENTER, ...INNER, ...OUTER];
const ALL_EDGES  = [...INNER_EDGES, ...OUTER_EDGES];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Start exit fade at 2.3 s, call onDone at 2.5 s
    const t1 = setTimeout(() => setExiting(true), 2300);
    const t2 = setTimeout(() => onDone(), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#ffffff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0,
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.25s ease',
        pointerEvents: exiting ? 'none' : 'all',
      }}
    >
      <style>{`
        @keyframes pai-node-pop {
          0%   { opacity: 0; transform: scale(0.3); }
          60%  { opacity: 1; transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes pai-edge-draw {
          from { stroke-dashoffset: 200; opacity: 0; }
          to   { stroke-dashoffset: 0;   opacity: 0.35; }
        }
        @keyframes pai-logo-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pai-pulse-ring {
          0%   { r: 20; opacity: 0.6; }
          100% { r: 44; opacity: 0; }
        }
        @keyframes pai-bar-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>

      {/* Animated graph SVG — decorative background, 10% opacity */}
      <svg
        viewBox="0 0 400 380"
        width={320}
        height={304}
        style={{ position: 'absolute', overflow: 'visible', opacity: 0.10 }}
      >
        {/* Edges */}
        {ALL_EDGES.map((e, i) => {
          const dx = e.x2 - e.x1, dy = e.y2 - e.y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          return (
            <line
              key={i}
              x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke="#C7C6F0"
              strokeWidth={1}
              strokeDasharray={len + 10}
              strokeDashoffset={len + 10}
              style={{
                animation: `pai-edge-draw 0.4s ease forwards`,
                animationDelay: `${e.delay}ms`,
                opacity: 0,
              }}
            />
          );
        })}

        {/* Nodes */}
        {ALL_NODES.map((n, i) => (
          <g key={i} style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}>
            {/* Pulse ring on center node */}
            {i === 0 && (
              <circle
                cx={n.cx} cy={n.cy} r={n.r + 4}
                fill="none"
                stroke={n.color}
                strokeWidth={1.5}
                style={{
                  animation: `pai-pulse-ring 1.4s ease-out infinite`,
                  animationDelay: `${n.delay + 300}ms`,
                  opacity: 0,
                }}
              />
            )}
            <circle
              cx={n.cx} cy={n.cy} r={n.r}
              fill={`${n.color}22`}
              stroke={n.color}
              strokeWidth={i === 0 ? 2 : 1.5}
              style={{
                animation: `pai-node-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards`,
                animationDelay: `${n.delay}ms`,
                opacity: 0,
                transformOrigin: `${n.cx}px ${n.cy}px`,
              }}
            />
          </g>
        ))}
      </svg>

      {/* Logo + wordmark */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          animation: `pai-logo-in 0.5s ease forwards`,
          animationDelay: `0ms`,
          opacity: 0,
          marginBottom: 6,
        }}
      >
        <img
          src={`${import.meta.env.BASE_URL}pai-logo.svg`}
          alt="Prevalent AI"
          style={{ height: 18, width: 'auto', filter: 'invert(1)' }}
        />
        <span style={{ width: 1, height: 16, background: 'rgba(0,0,0,0.15)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: '#6B7280', letterSpacing: '0.02em' }}>
          Data Studio
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: 140, height: 2, background: 'rgba(0,0,0,0.08)',
          borderRadius: 99, overflow: 'hidden',
          animation: `pai-logo-in 0.4s ease forwards`,
          animationDelay: `0ms`,
          opacity: 0,
          marginTop: 4,
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #6360D8, #0EA5E9)',
            borderRadius: 99,
            animation: `pai-bar-fill 2300ms linear forwards`,
            animationDelay: `0ms`,
            width: '0%',
          }}
        />
      </div>
    </div>
  );
}
