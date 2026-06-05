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

function Ring({ outer, inner, accent }: { outer: number; inner: number; accent: string }) {
  const cx = SIZE / 2;
  const outerR = (SIZE - THICK) / 2;
  const innerR = outerR - (THICK + GAP);
  const track = 'rgba(0,0,0,0.10)';

  return (
    <svg className="calc-ring" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
      <g transform={`rotate(-90 ${cx} ${cx})`}>
        <circle cx={cx} cy={cx} r={outerR} fill="none" stroke={track} strokeWidth={THICK} />
        <circle
          cx={cx} cy={cx} r={outerR} fill="none" stroke={accent} strokeWidth={THICK}
          strokeLinecap="round" className="calc-ring__arc" {...ringDash(outerR, outer)}
        />
        <circle cx={cx} cy={cx} r={innerR} fill="none" stroke={track} strokeWidth={THICK} />
        <circle
          cx={cx} cy={cx} r={innerR} fill="none" stroke="var(--green-primary)" strokeWidth={THICK}
          strokeLinecap="round" className="calc-ring__arc" {...ringDash(innerR, inner)}
        />
      </g>
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
