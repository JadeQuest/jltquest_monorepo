'use client';

import React from 'react';

/* ─────────────────────────────────────────────────────────────
   Interface — unchanged public API
   ───────────────────────────────────────────────────────────── */
interface JLTLoaderProps {
  variant?: 'page' | 'card' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/* ─────────────────────────────────────────────────────────────
   SVG / orbit constants
   ─────────────────────────────────────────────────────────────
   Circumference = 2π × r  (rounded to integer for dasharray math)

   PAGE:  SVG canvas 280 px, orb 176 px (11 rem)
     outer orbit  r = 112  →  C = 704
     mid   orbit  r =  92  →  C = 578

   CARD:  SVG canvas 140 px, orb 80 px (5 rem)
     outer orbit  r =  56  →  C = 352
     mid   orbit  r =  46  →  C = 289
   ───────────────────────────────────────────────────────────── */
const PG_SVG = 280;
const PG_CX  = 140;
const PG_ORB = 176;
const PG_OR  = 112;   // outer orbit radius
const PG_MR  =  92;   // mid   orbit radius
// Note: circumference values are baked directly into keyframe strings below.

const CD_SVG = 140;
const CD_CX  =  70;
const CD_ORB =  80;
const CD_OR  =  56;
const CD_MR  =  46;

/* ─────────────────────────────────────────────────────────────
   All CSS keyframes (self-contained, no external deps)

   Head + trail technique:
     Each orbit has 3 overlapping SVG circles (dim trail → mid trail → bright head).
     They share the SAME animation speed but different keyframe start offsets,
     so they maintain a fixed spatial gap → comet-trail effect.

   Positive dashoffset → CCW movement
   Negative dashoffset → CW  movement
   ───────────────────────────────────────────────────────────── */
const STYLES = `
  @media (prefers-reduced-motion: reduce) {
    .jlt-loader * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
    }
  }

  /* ── Logo breathing ── */
  @keyframes jlt-breathe {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.06); }
  }
  @keyframes jlt-glow-breathe {
    0%, 100% {
      filter: drop-shadow(0 0 6px  rgba(0,240,255,0.45))
              drop-shadow(0 0 3px  rgba(123,44,191,0.35));
    }
    50% {
      filter: drop-shadow(0 0 20px rgba(0,240,255,0.9))
              drop-shadow(0 0 10px rgba(123,44,191,0.7))
              drop-shadow(0 0 4px  rgba(255,162,141,0.45));
    }
  }

  /* ── Page outer orbit · CW · Cyan · C = 704 ── */
  @keyframes jlt-o-head   { from { stroke-dashoffset:  0;  } to { stroke-dashoffset: -704; } }
  @keyframes jlt-o-trail1 { from { stroke-dashoffset:  35; } to { stroke-dashoffset: -669; } }
  @keyframes jlt-o-trail2 { from { stroke-dashoffset:  70; } to { stroke-dashoffset: -634; } }

  /* ── Page mid orbit  · CCW · Magenta · C = 578 ── */
  @keyframes jlt-m-head   { from { stroke-dashoffset:   0; } to { stroke-dashoffset:  578; } }
  @keyframes jlt-m-trail1 { from { stroke-dashoffset: -32; } to { stroke-dashoffset:  546; } }
  @keyframes jlt-m-trail2 { from { stroke-dashoffset: -62; } to { stroke-dashoffset:  516; } }

  /* ── Card outer orbit · CW · Cyan · C = 352 ── */
  @keyframes jlt-co-head   { from { stroke-dashoffset:  0;  } to { stroke-dashoffset: -352; } }
  @keyframes jlt-co-trail1 { from { stroke-dashoffset:  18; } to { stroke-dashoffset: -334; } }
  @keyframes jlt-co-trail2 { from { stroke-dashoffset:  36; } to { stroke-dashoffset: -316; } }

  /* ── Card mid orbit  · CCW · Magenta · C = 289 ── */
  @keyframes jlt-cm-head   { from { stroke-dashoffset:   0; } to { stroke-dashoffset:  289; } }
  @keyframes jlt-cm-trail1 { from { stroke-dashoffset: -16; } to { stroke-dashoffset:  273; } }

  /* ── Ripple / market-pulse rings ── */
  @keyframes jlt-ripple {
    0%   { transform: scale(1);   opacity: 0.5; }
    100% { transform: scale(2.8); opacity: 0;   }
  }

  /* ── Page particles (each unique orbit radius embedded in translateX) ── */
  @keyframes jlt-p1 { from { transform: rotate(0deg)   translateX(118px); } to { transform: rotate(360deg)  translateX(118px); } }
  @keyframes jlt-p2 { from { transform: rotate(72deg)  translateX(98px);  } to { transform: rotate(432deg)  translateX(98px);  } }
  @keyframes jlt-p3 { from { transform: rotate(144deg) translateX(130px); } to { transform: rotate(504deg)  translateX(130px); } }
  @keyframes jlt-p4 { from { transform: rotate(216deg) translateX(104px); } to { transform: rotate(576deg)  translateX(104px); } }
  @keyframes jlt-p5 { from { transform: rotate(288deg) translateX(88px);  } to { transform: rotate(648deg)  translateX(88px);  } }

  /* ── Card particles ── */
  @keyframes jlt-cp1 { from { transform: rotate(0deg)   translateX(62px); } to { transform: rotate(360deg)  translateX(62px); } }
  @keyframes jlt-cp2 { from { transform: rotate(120deg) translateX(52px); } to { transform: rotate(480deg)  translateX(52px); } }
  @keyframes jlt-cp3 { from { transform: rotate(240deg) translateX(68px); } to { transform: rotate(600deg)  translateX(68px); } }

  /* ── Particle brightness flicker ── */
  @keyframes jlt-pf {
    0%, 100% { opacity: 0.2; }
    50%      { opacity: 1;   }
  }

  /* ── Orb core ambient glow ── */
  @keyframes jlt-core {
    0%, 100% { opacity: 0.25; transform: scale(1);    }
    50%      { opacity: 0.55; transform: scale(1.25); }
  }

  /* ── Full-screen background radial breathe ── */
  @keyframes jlt-bg {
    0%, 100% { opacity: 0.55; }
    50%      { opacity: 0.9;  }
  }

  /* ── Loading text ── */
  @keyframes jlt-text {
    0%, 100% { opacity: 0.6; letter-spacing: 0.10em; }
    50%      { opacity: 1;   letter-spacing: 0.16em; }
  }

  /* ── Inline ring ── */
  @keyframes jlt-inline-cw { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -126; } }
`;

/* ─────────────────────────────────────────────────────────────
   Shared SVG glow filter defs (page & card share different IDs
   to avoid cross-variant conflicts when both mount at once)
   ───────────────────────────────────────────────────────────── */
const PageSvgDefs = () => (
  <defs>
    <filter id="jlt-pg-gc" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00F0FF" floodOpacity="0.95" />
    </filter>
    <filter id="jlt-pg-gm" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#FF007F" floodOpacity="0.95" />
    </filter>
  </defs>
);

const CardSvgDefs = () => (
  <defs>
    <filter id="jlt-cd-gc" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00F0FF" floodOpacity="0.95" />
    </filter>
    <filter id="jlt-cd-gm" x="-60%" y="-60%" width="220%" height="220%">
      <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#FF007F" floodOpacity="0.95" />
    </filter>
  </defs>
);

/* ─────────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────────── */
export const JLTLoader: React.FC<JLTLoaderProps> = ({
  variant = 'page',
  size    = 'md',
  text,
  className = '',
}) => {

  /* ════════════════════════════════════════════════════════════
     INLINE VARIANT
     Works inside buttons, forms, table cells, small UI elements
     ════════════════════════════════════════════════════════════ */
  if (variant === 'inline') {
    const sizeMap = { sm: { ring: 20, logo: 11 }, md: { ring: 24, logo: 13 }, lg: { ring: 32, logo: 17 } };
    const { ring, logo } = sizeMap[size];
    const half            = ring / 2;

    return (
      <>
        <style>{STYLES}</style>
        <div className={`jlt-loader inline-flex items-center gap-2 ${className}`}>
          {/* Mini energy ring */}
          <div className="relative shrink-0" style={{ width: ring, height: ring }}>
            <svg
              width={ring}
              height={ring}
              viewBox={`0 0 ${ring} ${ring}`}
              className="absolute inset-0"
              aria-hidden="true"
            >
              <defs>
                <filter id="jlt-il-gc" x="-60%" y="-60%" width="220%" height="220%">
                  <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#00F0FF" floodOpacity="0.9" />
                </filter>
              </defs>
              {/* Track */}
              <circle
                cx={half} cy={half} r={half - 2}
                fill="none"
                stroke="rgba(255,255,255,0.07)"
                strokeWidth="1.5"
                transform={`rotate(-90 ${half} ${half})`}
              />
              {/* Trail */}
              <circle
                cx={half} cy={half} r={half - 2}
                fill="none"
                stroke="rgba(0,240,255,0.28)"
                strokeWidth="1.5"
                strokeDasharray="18 95"
                transform={`rotate(-90 ${half} ${half})`}
                style={{ animation: 'jlt-inline-cw 1.4s linear infinite', strokeDashoffset: 10 }}
              />
              {/* Head */}
              <circle
                cx={half} cy={half} r={half - 2}
                fill="none"
                stroke="#00F0FF"
                strokeWidth="1.5"
                strokeDasharray="7 106"
                strokeLinecap="round"
                transform={`rotate(-90 ${half} ${half})`}
                filter="url(#jlt-il-gc)"
                style={{ animation: 'jlt-inline-cw 1.4s linear infinite' }}
              />
            </svg>

            {/* JLT logo — centered, stable */}
            <div className="absolute inset-0 flex items-center justify-center">
              <img
                src="/jltcolor.svg"
                alt="JLT"
                width={logo}
                height={logo}
                style={{ animation: 'jlt-breathe 2s ease-in-out infinite, jlt-glow-breathe 2s ease-in-out infinite' }}
              />
            </div>
          </div>

          {text && (
            <span className="font-gilroyMedium text-sm text-purple-200 tracking-wide">
              {text}
            </span>
          )}
        </div>
      </>
    );
  }

  /* ════════════════════════════════════════════════════════════
     CARD VARIANT
     Compact — for dashboard cards, tables, API loading states
     ════════════════════════════════════════════════════════════ */
  if (variant === 'card') {
    const orbOffset = (CD_SVG - CD_ORB) / 2; // = 30

    // Particle config
    const cardParticles = [
      { anim: 'jlt-cp1', dur: '6s',   color: '#00F0FF', delay: '0s'    },
      { anim: 'jlt-cp2', dur: '9s',   color: '#FF007F', delay: '-3s'   },
      { anim: 'jlt-cp3', dur: '7.5s', color: '#FFA28D', delay: '-1.8s' },
    ];

    return (
      <>
        <style>{STYLES}</style>
        <div className={`jlt-loader w-full py-8 flex flex-col items-center justify-center gap-3 ${className}`}>
          <div className="relative" style={{ width: CD_SVG, height: CD_SVG }}>

            {/* ── SVG orbit rings ── */}
            <svg
              width={CD_SVG}
              height={CD_SVG}
              viewBox={`0 0 ${CD_SVG} ${CD_SVG}`}
              className="absolute inset-0"
              aria-hidden="true"
            >
              <CardSvgDefs />

              {/* Outer orbit track */}
              <circle cx={CD_CX} cy={CD_CX} r={CD_OR} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" transform={`rotate(-90 ${CD_CX} ${CD_CX})`} />
              {/* Outer dim trail */}
              <circle cx={CD_CX} cy={CD_CX} r={CD_OR} fill="none" stroke="rgba(0,240,255,0.1)" strokeWidth="1.5"
                strokeDasharray="42 310"
                transform={`rotate(-90 ${CD_CX} ${CD_CX})`}
                style={{ animation: 'jlt-co-trail2 2.5s linear infinite' }} />
              {/* Outer mid trail */}
              <circle cx={CD_CX} cy={CD_CX} r={CD_OR} fill="none" stroke="rgba(0,240,255,0.32)" strokeWidth="2"
                strokeDasharray="24 328"
                transform={`rotate(-90 ${CD_CX} ${CD_CX})`}
                style={{ animation: 'jlt-co-trail1 2.5s linear infinite' }} />
              {/* Outer head */}
              <circle cx={CD_CX} cy={CD_CX} r={CD_OR} fill="none" stroke="#00F0FF" strokeWidth="2.5"
                strokeDasharray="10 342"
                strokeLinecap="round"
                transform={`rotate(-90 ${CD_CX} ${CD_CX})`}
                filter="url(#jlt-cd-gc)"
                style={{ animation: 'jlt-co-head 2.5s linear infinite' }} />

              {/* Mid orbit track */}
              <circle cx={CD_CX} cy={CD_CX} r={CD_MR} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" transform={`rotate(-90 ${CD_CX} ${CD_CX})`} />
              {/* Mid trail */}
              <circle cx={CD_CX} cy={CD_CX} r={CD_MR} fill="none" stroke="rgba(255,0,127,0.2)" strokeWidth="1.5"
                strokeDasharray="20 269"
                transform={`rotate(-90 ${CD_CX} ${CD_CX})`}
                style={{ animation: 'jlt-cm-trail1 3.6s linear infinite' }} />
              {/* Mid head (CCW) */}
              <circle cx={CD_CX} cy={CD_CX} r={CD_MR} fill="none" stroke="#FF007F" strokeWidth="2"
                strokeDasharray="8 281"
                strokeLinecap="round"
                transform={`rotate(-90 ${CD_CX} ${CD_CX})`}
                filter="url(#jlt-cd-gm)"
                style={{ animation: 'jlt-cm-head 3.6s linear infinite' }} />
            </svg>

            {/* Ripple ring */}
            <div
              className="absolute rounded-full border pointer-events-none"
              style={{
                width: CD_ORB, height: CD_ORB,
                top: orbOffset, left: orbOffset,
                borderColor: 'rgba(0,240,255,0.25)',
                animation: 'jlt-ripple 2.8s ease-out infinite',
              }}
            />

            {/* ── Central Orb ── */}
            <div
              className="absolute rounded-full flex items-center justify-center"
              style={{
                width: CD_ORB, height: CD_ORB,
                top: orbOffset, left: orbOffset,
                background: 'linear-gradient(135deg, rgba(18,4,42,0.96) 0%, rgba(8,2,22,0.99) 100%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: [
                  '0 0 0 1px rgba(0,240,255,0.06)',
                  '0 0 28px rgba(123,44,191,0.4)',
                  '0 0 56px rgba(0,240,255,0.07)',
                  'inset 0 0 24px rgba(123,44,191,0.1)',
                  'inset 0 1px 0 rgba(255,255,255,0.05)',
                ].join(', '),
              }}
            >
              {/* Core ambient glow */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  inset: 10,
                  background: 'radial-gradient(circle at 40% 38%, rgba(0,240,255,0.2) 0%, rgba(123,44,191,0.18) 45%, transparent 100%)',
                  filter: 'blur(7px)',
                  animation: 'jlt-core 2.8s ease-in-out infinite',
                }}
              />
              {/* Logo — stable */}
              <img
                src="/jltcolor.svg"
                alt="JLT Logo"
                width={34}
                height={34}
                style={{
                  position: 'relative',
                  zIndex: 10,
                  animation: 'jlt-breathe 3s ease-in-out infinite, jlt-glow-breathe 3s ease-in-out infinite',
                }}
              />
            </div>

            {/* ── Particles ── */}
            {cardParticles.map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: 3, height: 3,
                  top: '50%', left: '50%',
                  marginTop: -1.5, marginLeft: -1.5,
                  backgroundColor: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                  animation: `${p.anim} ${p.dur} linear ${p.delay} infinite, jlt-pf ${parseFloat(p.dur) * 0.45}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>

          {text && (
            <p
              className="text-purple-200 font-gilroyMedium text-xs font-semibold"
              style={{ animation: 'jlt-text 2.5s ease-in-out infinite' }}
            >
              {text}
            </p>
          )}
        </div>
      </>
    );
  }

  /* ════════════════════════════════════════════════════════════
     PAGE VARIANT (default)
     Full-screen premium loading experience
     ════════════════════════════════════════════════════════════ */
  const orbOffset = (PG_SVG - PG_ORB) / 2; // = 52

  // Particle config: orbit anim, duration, color, brightness-delay, size
  const pageParticles = [
    { anim: 'jlt-p1', dur: '7s',   color: '#00F0FF', bDel: '0s',     sz: 3.5 },
    { anim: 'jlt-p2', dur: '10s',  color: '#FF007F', bDel: '-1.5s',  sz: 2.5 },
    { anim: 'jlt-p3', dur: '6s',   color: '#FFA28D', bDel: '-0.8s',  sz: 3   },
    { anim: 'jlt-p4', dur: '12s',  color: '#7B2CBF', bDel: '-2.2s',  sz: 2.5 },
    { anim: 'jlt-p5', dur: '8.5s', color: '#00F0FF', bDel: '-1.2s',  sz: 2   },
  ];

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Full-screen overlay ── */}
      <div
        className={`jlt-loader fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 select-none overflow-hidden ${className}`}
        style={{ background: 'rgba(6,2,18,0.82)', backdropFilter: 'blur(14px)' }}
      >
        {/* Ambient background radial glow — breathes slowly */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 52% 52% at 50% 50%, rgba(123,44,191,0.28) 0%, rgba(0,240,255,0.07) 55%, transparent 78%)',
            animation: 'jlt-bg 3.5s ease-in-out infinite',
          }}
        />

        {/* ── Loader stage — 280×280 px, everything relative to center ── */}
        <div className="relative" style={{ width: PG_SVG, height: PG_SVG }}>

          {/* ── SVG orbit rings (rendered behind orb via natural stacking) ── */}
          <svg
            width={PG_SVG}
            height={PG_SVG}
            viewBox={`0 0 ${PG_SVG} ${PG_SVG}`}
            className="absolute inset-0"
            aria-hidden="true"
          >
            <PageSvgDefs />

            {/* ══ Outer orbit — CW — Electric Cyan — r=112, C=704 ══ */}
            {/* Track */}
            <circle
              cx={PG_CX} cy={PG_CX} r={PG_OR}
              fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"
              transform={`rotate(-90 ${PG_CX} ${PG_CX})`}
            />
            {/* Dim trail */}
            <circle
              cx={PG_CX} cy={PG_CX} r={PG_OR}
              fill="none" stroke="rgba(0,240,255,0.1)" strokeWidth="2.5"
              strokeDasharray="70 634"
              transform={`rotate(-90 ${PG_CX} ${PG_CX})`}
              style={{ animation: 'jlt-o-trail2 3s linear infinite' }}
            />
            {/* Mid trail */}
            <circle
              cx={PG_CX} cy={PG_CX} r={PG_OR}
              fill="none" stroke="rgba(0,240,255,0.35)" strokeWidth="3"
              strokeDasharray="38 666"
              transform={`rotate(-90 ${PG_CX} ${PG_CX})`}
              style={{ animation: 'jlt-o-trail1 3s linear infinite' }}
            />
            {/* Bright head */}
            <circle
              cx={PG_CX} cy={PG_CX} r={PG_OR}
              fill="none" stroke="#00F0FF" strokeWidth="3.5"
              strokeDasharray="16 688"
              strokeLinecap="round"
              transform={`rotate(-90 ${PG_CX} ${PG_CX})`}
              filter="url(#jlt-pg-gc)"
              style={{ animation: 'jlt-o-head 3s linear infinite' }}
            />

            {/* ══ Mid orbit — CCW — Magenta — r=92, C=578 ══ */}
            {/* Track */}
            <circle
              cx={PG_CX} cy={PG_CX} r={PG_MR}
              fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"
              transform={`rotate(-90 ${PG_CX} ${PG_CX})`}
            />
            {/* Dim trail */}
            <circle
              cx={PG_CX} cy={PG_CX} r={PG_MR}
              fill="none" stroke="rgba(255,0,127,0.1)" strokeWidth="2"
              strokeDasharray="60 518"
              transform={`rotate(-90 ${PG_CX} ${PG_CX})`}
              style={{ animation: 'jlt-m-trail2 4.5s linear infinite' }}
            />
            {/* Mid trail */}
            <circle
              cx={PG_CX} cy={PG_CX} r={PG_MR}
              fill="none" stroke="rgba(255,0,127,0.35)" strokeWidth="2.5"
              strokeDasharray="32 546"
              transform={`rotate(-90 ${PG_CX} ${PG_CX})`}
              style={{ animation: 'jlt-m-trail1 4.5s linear infinite' }}
            />
            {/* Bright head (CCW) */}
            <circle
              cx={PG_CX} cy={PG_CX} r={PG_MR}
              fill="none" stroke="#FF007F" strokeWidth="3"
              strokeDasharray="13 565"
              strokeLinecap="round"
              transform={`rotate(-90 ${PG_CX} ${PG_CX})`}
              filter="url(#jlt-pg-gm)"
              style={{ animation: 'jlt-m-head 4.5s linear infinite' }}
            />
          </svg>

          {/* ── Ripple rings (market-pulse / blockchain network effect) ── */}
          <div
            className="absolute rounded-full border pointer-events-none"
            style={{
              width: PG_ORB, height: PG_ORB,
              top: orbOffset, left: orbOffset,
              borderColor: 'rgba(0,240,255,0.28)',
              animation: 'jlt-ripple 3s ease-out infinite',
            }}
          />
          <div
            className="absolute rounded-full border pointer-events-none"
            style={{
              width: PG_ORB, height: PG_ORB,
              top: orbOffset, left: orbOffset,
              borderColor: 'rgba(123,44,191,0.22)',
              animation: 'jlt-ripple 3s ease-out -1.5s infinite',
            }}
          />

          {/* ── Central Orb — glassmorphism ── */}
          <div
            className="absolute rounded-full flex items-center justify-center"
            style={{
              width: PG_ORB, height: PG_ORB,
              top: orbOffset, left: orbOffset,
              background: 'linear-gradient(148deg, rgba(22,5,50,0.97) 0%, rgba(8,2,22,0.99) 100%)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: [
                '0 0 0 1px rgba(0,240,255,0.07)',
                '0 0 60px rgba(123,44,191,0.38)',
                '0 0 120px rgba(0,240,255,0.08)',
                'inset 0 0 55px rgba(123,44,191,0.12)',
                'inset 0 1px 0 rgba(255,255,255,0.06)',
              ].join(', '),
            }}
          >
            {/* Core ambient radial glow — breathing */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                inset: 18,
                background: 'radial-gradient(circle at 42% 36%, rgba(0,240,255,0.18) 0%, rgba(123,44,191,0.22) 45%, transparent 100%)',
                filter: 'blur(12px)',
                animation: 'jlt-core 3.2s ease-in-out infinite',
              }}
            />

            {/* JLT Logo — stable, readable, just breathes */}
            <img
              src="/jltcolor.svg"
              alt="JLT"
              width={80}
              height={80}
              style={{
                position: 'relative',
                zIndex: 10,
                animation: 'jlt-breathe 3.2s ease-in-out infinite, jlt-glow-breathe 3.2s ease-in-out infinite',
              }}
            />
          </div>

          {/* ── Ambient particles orbiting at different radii ── */}
          {pageParticles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.sz,
                height: p.sz,
                top: '50%',
                left: '50%',
                marginTop: -(p.sz / 2),
                marginLeft: -(p.sz / 2),
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}, 0 0 4px ${p.color}`,
                animation: `${p.anim} ${p.dur} linear infinite, jlt-pf ${parseFloat(p.dur) * 0.4}s ease-in-out ${p.bDel} infinite`,
              }}
            />
          ))}
        </div>

        {/* Loading text — subtle breathing letter-spacing */}
        {text && (
          <p
            className="text-purple-200 font-gilroyMedium text-sm font-semibold"
            style={{ animation: 'jlt-text 2.8s ease-in-out infinite' }}
          >
            {text}
          </p>
        )}
      </div>
    </>
  );
};
