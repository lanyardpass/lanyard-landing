// PassCardPreview — CSS/SVG recreation of the app's PassCard (PassCard.swift +
// docs/CARD_IDENTITY.md). Chrome: 1.65:1 aspect, 12px radius, 16px padding,
// operator eyebrow + tier hero + bottom-right identity slot, offset drop shadow,
// operator watermark bleeding off the bottom-right, optional 3-PARK edge stripe.
// Surface: matte → brushed → metallic → glass, layered gradients matching the
// Swift material surfaces. This is the "whoa, it's the app" moment in the browser.

export type Material = 'matte' | 'brushed' | 'metallic' | 'glass';
export type Watermark = 'universal' | 'disney' | 'seaworld';

export interface PassCardPreviewProps {
  operatorName: string;
  tierName: string;
  accentColor: string;
  textColor?: string;
  material: Material;
  watermark: Watermark;
  showThreeParkStripe?: boolean;
}

/** Tier rank → material, matching CARD_IDENTITY's four-step progression. */
export function materialForRank(rank: number, total: number): Material {
  if (total <= 1) return 'metallic';
  const pos = (rank - 1) / (total - 1);
  if (rank === total) return 'glass'; // flagship gets the bespoke-glass nod
  if (pos < 0.34) return 'matte';
  if (pos < 0.67) return 'brushed';
  return 'metallic';
}

const layer: React.CSSProperties = { position: 'absolute', inset: 0, borderRadius: 12 };

function MaterialSurface({ material, accent }: { material: Material; accent: string }) {
  if (material === 'matte') {
    return (
      <>
        <div style={{ ...layer, background: accent }} />
        <div style={{ ...layer, background: 'linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, transparent 35%, rgba(0,0,0,0.20) 100%)' }} />
      </>
    );
  }
  if (material === 'brushed') {
    return (
      <>
        <div style={{ ...layer, background: accent }} />
        <div style={{ ...layer, background: 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.10) 12%, rgba(255,255,255,0.20) 30%, rgba(255,255,255,0.05) 45%, rgba(255,255,255,0.18) 62%, rgba(255,255,255,0.08) 78%, rgba(255,255,255,0) 100%)' }} />
        <div style={{ ...layer, background: 'linear-gradient(to bottom, rgba(255,255,255,0.10) 0%, transparent 35%, rgba(0,0,0,0.18) 100%)' }} />
      </>
    );
  }
  if (material === 'metallic') {
    return (
      <>
        <div style={{ ...layer, background: accent }} />
        <div style={{ ...layer, background: 'linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)' }} />
        <div style={{ ...layer, background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.18) 8%, rgba(255,255,255,0.06) 20%, transparent 38%)' }} />
      </>
    );
  }
  // glass — darkened tinted field, diagonal sheen, luminous inset border.
  return (
    <>
      <div style={{ ...layer, background: accent }} />
      <div style={{ ...layer, background: 'linear-gradient(160deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.50) 60%, rgba(0,0,0,0.62) 100%)' }} />
      <div style={{ ...layer, background: 'linear-gradient(125deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 18%, transparent 40%)' }} />
      <div style={{ ...layer, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.22), inset 0 1px 14px rgba(255,255,255,0.10)' }} />
    </>
  );
}

function WatermarkArt({ kind, color }: { kind: Watermark; color: string }) {
  // Low-opacity operator silhouette bleeding off the bottom-right corner —
  // same role as the app's potrace watermarks (UniversalOrlandoShape, etc.).
  const common: React.CSSProperties = {
    position: 'absolute',
    right: -28,
    bottom: -30,
    width: 190,
    height: 190,
    opacity: 0.13,
    pointerEvents: 'none',
    color,
  };
  if (kind === 'universal') {
    return (
      <svg viewBox="0 0 100 100" style={common} fill="none" stroke="currentColor" strokeWidth={3} aria-hidden="true">
        <circle cx="50" cy="50" r="26" />
        <ellipse cx="50" cy="50" rx="26" ry="10" />
        <ellipse cx="50" cy="50" rx="11" ry="26" />
        <ellipse cx="50" cy="50" rx="44" ry="15" transform="rotate(-28 50 50)" strokeWidth={4} />
      </svg>
    );
  }
  if (kind === 'disney') {
    return (
      <svg viewBox="0 0 100 100" style={common} fill="currentColor" aria-hidden="true">
        <path d="M48 14l3 9 3-9 3 13h-12l3-13zM30 44c0-7 4-11 4-18l4 6 4-10 4 10 4-6c0 7 4 11 4 18v40H30V44zM18 56c0-5 3-8 3-13l3 5 3-7v43H18V56zM76 56c0-5-3-8-3-13l-3 5-3-7v43h9V56z" />
      </svg>
    );
  }
  // seaworld — orca arcing over a wave
  return (
    <svg viewBox="0 0 100 100" style={common} fill="currentColor" aria-hidden="true">
      <path d="M14 70c10-34 34-52 60-52-6 6-9 12-10 19 8 2 14 7 18 15-12-6-22-5-30 1-9 7-14 17-16 28-8-3-15-9-22-18l-4 8-2-12 6 4-4-6z" />
      <path d="M6 80c10 6 20 6 30 0 10 6 20 6 30 0 10 6 20 6 30 0v8c-10 6-20 6-30 0-10 6-20 6-30 0-10 6-20 6-30 0v-8z" opacity={0.7} />
    </svg>
  );
}

export default function PassCardPreview({
  operatorName,
  tierName,
  accentColor,
  textColor = '#FFFFFF',
  material,
  watermark,
  showThreeParkStripe = false,
}: PassCardPreviewProps) {
  return (
    <div className="calc-card" style={{ color: textColor }}>
      {/* offset drop shadow */}
      <div className="calc-card__shadow" />
      <div className="calc-card__chrome">
        <MaterialSurface material={material} accent={accentColor} />
        <WatermarkArt kind={watermark} color={textColor} />

        {showThreeParkStripe && (
          <span className="calc-card__stripe" style={{ color: textColor }}>3-PARK</span>
        )}

        <div className="calc-card__content">
          <div>
            <div className="calc-card__operator">{operatorName}</div>
            <div className="calc-card__tier">{tierName}</div>
          </div>
          <div className="calc-card__foot">
            <span className="calc-card__foot-label">Annual Pass</span>
          </div>
        </div>
      </div>
    </div>
  );
}
