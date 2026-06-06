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

// Per-operator placement of the watermark bleeding off the bottom-right corner,
// matching the app's watermark conventions (CARD_IDENTITY.md). Sizes are in % of
// the card width so the silhouette scales with the card.
const WM_PLACEMENT: Record<Watermark, { size: number; right: number; bottom: number; rotate: number }> = {
  universal: { size: 62, right: -12, bottom: -16, rotate: 0 },   // globe + orbital ring
  disney:    { size: 58, right: -2, bottom: -8, rotate: 0 },     // castle + fireworks
  seaworld:  { size: 64, right: -8, bottom: -12, rotate: -16 },  // orca + waves
};

/** App watermark opacity by material; bumped for dark text (reads softer). */
function watermarkOpacity(material: Material, darkText: boolean): number {
  const base = { matte: 0.08, brushed: 0.11, metallic: 0.15, glass: 0.24 }[material];
  return base * (darkText ? 1.3 : 1);
}

function luminanceIsDark(hex: string): boolean {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b < 0.5;
}

function WatermarkArt({ kind, color, material }: { kind: Watermark; color: string; material: Material }) {
  // The real app silhouette (potrace SVG in /watermarks) used as a tintable
  // mask — `background: color` shows through only where the silhouette is, so
  // the watermark travels with the card's text color (white, or Disney's dark).
  const p = WM_PLACEMENT[kind];
  const url = `url(/watermarks/${kind}.svg)`;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        right: `${p.right}%`,
        bottom: `${p.bottom}%`,
        width: `${p.size}%`,
        aspectRatio: '1 / 1',
        background: color,
        opacity: watermarkOpacity(material, luminanceIsDark(color)),
        transform: p.rotate ? `rotate(${p.rotate}deg)` : undefined,
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        pointerEvents: 'none',
      }}
    />
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
        <WatermarkArt kind={watermark} color={textColor} material={material} />

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
