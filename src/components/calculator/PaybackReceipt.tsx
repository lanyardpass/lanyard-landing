// PaybackReceipt — CSS/SVG recreation of the app's PassPaybackCard
// (PassPaybackCard.swift). Paper-white surface, tier accent stripe on the top
// edge, a dual concentric ring with corner registration ticks, and the
// WORTH / FROM VISITS / VISITS / PER VISIT stat stack. WORTH (accent) maps to
// the outer ring (totalRecovered); FROM VISITS (brand green) maps to the inner
// ring (totalVisitValue); the gap between them is the perk savings. Reads as a
// receipt, not a dashboard — the result the user gets to "save" by getting the app.

import { useEffect, useState } from 'react';
import type { PaybackResult } from '@/data/calculator';
import { money } from '@/data/calculator';

interface Props {
  operatorLabel: string;
  tierLabel: string;
  accentColor: string;
  result: PaybackResult;
  visits: number;
}

const SIZE = 116;
const THICK = 14;
const GAP = 5;
const TICK = 9;

function ringDash(radius: number, progress: number) {
  const c = 2 * Math.PI * radius;
  const p = Math.max(0, Math.min(1, progress));
  return { strokeDasharray: c, strokeDashoffset: c * (1 - p) };
}

/** Ring-color mixed toward white — the bright end of the head gradient. */
function lighten(hex: string, amt = 0.3): string {
  const n = hex.replace('#', '');
  const mix = (c: number) => Math.round(c + (255 - c) * amt);
  const ch = (i: number) => mix(parseInt(n.slice(i, i + 2), 16)).toString(16).padStart(2, '0');
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

// Past 100% the ring LAPS the way the app's MKRingProgressView laps (ported
// from the details season replay, where the treatment was tuned against the
// in-app card): the base ring reads full in its own color, and the arc's HEAD
// — a short segment whose gradient brightens toward a rounded tip — rides over
// it, casting a dark shadow crescent only AHEAD of the tip that fades out
// along its own length. No tinted lap arc (hard seam at 12 o'clock), no
// symmetric halo (reads as a floating dot, not a head).
//
// Head geometry is authored at 12 o'clock in viewBox coords (center 58;
// outer r=51, inner r=32; segment spans -30°→0°, shadow -2°→9°) and rotated
// to the lap angle. If SIZE/THICK/GAP change, recompute these literals.
function HeadDefs({ accent }: { accent: string }) {
  const tip = lighten(accent);
  return (
    <defs>
      <linearGradient id="calc-headgrad-o" gradientUnits="userSpaceOnUse" x1="32.5" y1="13.83" x2="58" y2="7">
        <stop offset="0" stopColor={accent} />
        <stop offset="0.35" stopColor={accent} />
        <stop offset="1" stopColor={tip} />
      </linearGradient>
      <linearGradient id="calc-headgrad-i" gradientUnits="userSpaceOnUse" x1="42" y1="30.29" x2="58" y2="26">
        <stop offset="0" stopColor="#2D6A4F" />
        <stop offset="0.35" stopColor="#2D6A4F" />
        <stop offset="1" stopColor="#4A8F6D" />
      </linearGradient>
      <linearGradient id="calc-headshadow-o" gradientUnits="userSpaceOnUse" x1="56.22" y1="7.03" x2="65.98" y2="7.63">
        <stop offset="0" stopColor="#1B2330" stopOpacity="0.72" />
        <stop offset="0.55" stopColor="#1B2330" stopOpacity="0.45" />
        <stop offset="1" stopColor="#1B2330" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="calc-headshadow-i" gradientUnits="userSpaceOnUse" x1="56.88" y1="26.02" x2="63.01" y2="26.39">
        <stop offset="0" stopColor="#1B2330" stopOpacity="0.72" />
        <stop offset="0.55" stopColor="#1B2330" stopOpacity="0.45" />
        <stop offset="1" stopColor="#1B2330" stopOpacity="0" />
      </linearGradient>
      <filter id="calc-headblur" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="1.3" />
      </filter>
    </defs>
  );
}

function Head({ extra, shadowPath, headPath, gradId, shadId }: {
  extra: number; shadowPath: string; headPath: string; gradId: string; shadId: string;
}) {
  // Sub-1% laps would render a stray sliver at 12 o'clock — stay tipless.
  const on = extra > 0.01;
  return (
    <g
      className="calc-ring__tip"
      style={{ opacity: on ? 1 : 0, transform: `rotate(${on ? extra * 360 : 0}deg)` }}
    >
      <path d={shadowPath} fill="none" stroke={`url(#${shadId})`} strokeWidth={THICK} filter="url(#calc-headblur)" />
      <path d={headPath} fill="none" stroke={`url(#${gradId})`} strokeWidth={THICK} strokeLinecap="round" />
    </g>
  );
}

function Ring({ outer, inner, accent }: { outer: number; inner: number; accent: string }) {
  const cx = SIZE / 2;
  const outerR = (SIZE - THICK) / 2;
  const innerR = outerR - (THICK + GAP);
  const track = 'rgba(0,0,0,0.10)';

  return (
    <svg className="calc-ring" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
      <HeadDefs accent={accent} />
      <g transform={`rotate(-90 ${cx} ${cx})`}>
        <circle cx={cx} cy={cx} r={outerR} fill="none" stroke={track} strokeWidth={THICK} />
        <circle
          cx={cx} cy={cx} r={outerR} fill="none" stroke={accent} strokeWidth={THICK}
          strokeLinecap="round" className="calc-ring__arc" {...ringDash(outerR, outer)}
          style={{ opacity: outer > 0.001 ? 1 : 0 }}
        />
        <circle cx={cx} cy={cx} r={innerR} fill="none" stroke={track} strokeWidth={THICK} />
        <circle
          cx={cx} cy={cx} r={innerR} fill="none" stroke="var(--green-primary)" strokeWidth={THICK}
          strokeLinecap="round" className="calc-ring__arc" {...ringDash(innerR, inner)}
          style={{ opacity: inner > 0.001 ? 1 : 0 }}
        />
      </g>
      <Head
        extra={outer - 1} gradId="calc-headgrad-o" shadId="calc-headshadow-o"
        shadowPath="M 56.22 7.03 A 51 51 0 0 1 65.98 7.63"
        headPath="M 32.5 13.83 A 51 51 0 0 1 58 7"
      />
      <Head
        extra={inner - 1} gradId="calc-headgrad-i" shadId="calc-headshadow-i"
        shadowPath="M 56.88 26.02 A 32 32 0 0 1 63.01 26.39"
        headPath="M 42 30.29 A 32 32 0 0 1 58 26"
      />
      {/* corner registration ticks */}
      <g stroke="rgba(0,0,0,0.30)" strokeWidth={1}>
        <path d={`M0 0 V${TICK} M0 0 H${TICK}`} />
        <path d={`M${SIZE} 0 V${TICK} M${SIZE - TICK} 0 H${SIZE}`} />
        <path d={`M0 ${SIZE - TICK} V${SIZE} M0 ${SIZE} H${TICK}`} />
        <path d={`M${SIZE} ${SIZE - TICK} V${SIZE} M${SIZE - TICK} ${SIZE} H${SIZE}`} />
      </g>
    </svg>
  );
}

function StatLine({ label, value, color, big }: { label: string; value: string; color?: string; big?: boolean }) {
  return (
    <div className={`calc-stat${big ? ' calc-stat--big' : ''}`}>
      <div className="calc-stat__row">
        <span className="calc-stat__label">{label}</span>
        <span className="calc-stat__value" style={color ? { color } : undefined}>{value}</span>
      </div>
      <div className="calc-stat__rule" />
    </div>
  );
}

export default function PaybackReceipt({ operatorLabel, tierLabel, accentColor, result, visits }: Props) {
  const header = [operatorLabel.toUpperCase(), tierLabel.toUpperCase()].join('  ·  ');
  // Rings sweep up from 0 on mount, then ease to each new value as inputs change
  // (the CSS transition on the arc handles the in-betweening).
  const [shown, setShown] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(id); }, []);

  return (
    <div className="calc-receipt">
      <div className="calc-receipt__stripe" style={{ background: accentColor }} />
      <div className="calc-receipt__body">
        <div className="calc-receipt__header">{header}</div>
        <div className="calc-receipt__sub">{result.valuePct}% PAID BACK</div>

        <div className="calc-receipt__main">
          <Ring outer={shown ? result.valueRatio : 0} inner={shown ? result.breakEvenRatio : 0} accent={accentColor} />
          <div className="calc-receipt__stats">
            <StatLine label="WORTH" value={money(result.totalRecovered)} color={accentColor} big />
            <StatLine label="FROM VISITS" value={money(result.totalVisitValue)} color="var(--green-primary)" />
            <StatLine label="VISITS" value={`${visits}`} />
            <StatLine label="PER VISIT" value={result.costPerVisit != null ? money(result.costPerVisit) : '—'} />
          </div>
        </div>
      </div>
    </div>
  );
}
