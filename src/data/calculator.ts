// =============================================================================
// Calculator data + math — build-time snapshot of the app's operator pricing.
//
// This is a SNAPSHOT of the canonical operator JSON (data_schema/*.json) +
// parking perks (data_schema/perks.json) bundled into the static site at build,
// NOT a live read of data.lanyardpass.com (which is header-gated, and a static
// page ranks + loads faster — see marketing/calculator_build_brief.md). When
// tier prices or parking values change in the JSON, refresh the numbers below.
//
// The math mirrors product/payback_math.md exactly so the web result equals what
// the app computes for the same inputs. The one deliberate modelling choice: the
// web tool takes a *count* of visits, so each visit is valued as a single-park
// day at the operator's gate floor (`onePark`) — identical to how the app values
// historical visits (payback_math.md §2.4, `historicalVisitCount × onePark`).
//
// Parking is the big tier differentiator and is modelled per tier, per option,
// straight from perks.json (e.g. Universal Premier: free Regular $35 / Prime $50
// / Valet $76; Power gets only half-price ~$18; Seasonal gets nothing).
// =============================================================================

export type OperatorId = 'universal_orlando' | 'disney_world' | 'united_parks';

export type Residency = 'florida_resident' | 'out_of_state';

/** A parking benefit the user can pick per visit. `value` = per-visit savings. */
export interface ParkingOption {
  id: string;
  label: string;
  value: number;
}

export interface Tier {
  id: string;
  /** display_name, e.g. "Premier Pass" */
  name: string;
  rank: number;
  /** card_color_hex (3-park / standard) */
  cardColor: string;
  /** card_color_hex_two_park — Universal only */
  cardColorTwoPark?: string;
  /** card_text_color_hex — Disney (dark text on gold) */
  cardTextColor?: string;
  /** Eligibility footnote shown under the tier (Disney FL-resident tiers). */
  eligibilityNote?: string;
  /** Free/discounted parking options for this tier (perks.json). Empty = none. */
  parking: ParkingOption[];
  /** Opaque pricing payload, resolved by resolvePrice(). */
  pricing: Record<string, unknown>;
}

export interface UnitedPark {
  id: string;
  name: string;
}

export interface Operator {
  id: OperatorId;
  /** App-style operator label on the card, e.g. "Universal Orlando". */
  name: string;
  /** Operator-choice button label. */
  pickerName: string;
  /** gate_price_basis.one_park — the single-day gate floor. */
  onePark: number;
  /** gate_price_basis.additional_park (informational; see header note). */
  additionalPark: number | null;
  watermark: 'universal' | 'disney' | 'seaworld';
  /** Which conditional question set this operator needs. */
  flow: 'universal' | 'disney' | 'united';
  tiers: Tier[];
  /** UP home-park options (non-platinum). */
  unitedParks?: UnitedPark[];
}

// -----------------------------------------------------------------------------
// Universal Orlando — pricing by residency × park count. Parking is the headline
// tier differentiator: Seasonal none, Power half-price, Preferred free Regular,
// Premier free Regular/Prime/Valet (perks.json).
// -----------------------------------------------------------------------------
const UNIVERSAL: Operator = {
  id: 'universal_orlando',
  name: 'Universal Orlando',
  pickerName: 'Universal Orlando',
  onePark: 119,
  additionalPark: 55,
  watermark: 'universal',
  flow: 'universal',
  tiers: [
    {
      id: 'seasonal', name: 'Seasonal Pass', rank: 1,
      cardColor: '#009A4E', cardColorTwoPark: '#72BF44',
      parking: [],
      pricing: { out_of_state: { two: 424.99, three: 524.99 }, florida_resident: { two: 324.99, three: 424.99 } },
    },
    {
      id: 'power', name: 'Power Pass', rank: 2,
      cardColor: '#C63D95', cardColorTwoPark: '#87499C',
      parking: [{ id: 'self', label: 'Half-price self-parking', value: 18 }],
      pricing: { out_of_state: { two: 474.99, three: 584.99 }, florida_resident: { two: 374.99, three: 484.99 } },
    },
    {
      id: 'preferred', name: 'Preferred Pass', rank: 3,
      cardColor: '#0463AE', cardColorTwoPark: '#1CA7C0',
      parking: [{ id: 'self', label: 'Free self-parking', value: 35 }],
      pricing: { out_of_state: { two: 629.99, three: 739.99 }, florida_resident: { two: 529.99, three: 639.99 } },
    },
    {
      id: 'premier', name: 'Premier Pass', rank: 4,
      cardColor: '#F37021', cardColorTwoPark: '#FCAE17',
      parking: [
        { id: 'self', label: 'Self-parking', value: 35 },
        { id: 'prime', label: 'Prime', value: 50 },
        { id: 'valet', label: 'Valet', value: 76 },
      ],
      pricing: { out_of_state: { two: 904.99, three: 1094.99 }, florida_resident: { two: 789.99, three: 979.99 } },
    },
  ],
};

// -----------------------------------------------------------------------------
// Walt Disney World — single `new` price per tier. All tiers share Disney's gold
// with near-black text. All AP tiers include free standard theme-park parking.
// -----------------------------------------------------------------------------
// WDW standard theme-park parking (car or motorcycle) is $35/day, included on
// every AP tier — perks.json's disney_standard_theme_park_parking value.
const DISNEY_PARKING: ParkingOption[] = [{ id: 'self', label: 'Free standard parking', value: 35 }];
const DISNEY: Operator = {
  id: 'disney_world',
  name: 'Walt Disney World',
  pickerName: 'Walt Disney World',
  onePark: 119,
  additionalPark: 80,
  watermark: 'disney',
  flow: 'disney',
  tiers: [
    {
      id: 'pixie_dust', name: 'Pixie Dust Pass', rank: 1,
      cardColor: '#FFC123', cardTextColor: '#1A1A1A',
      eligibilityNote: 'Florida residents only', parking: DISNEY_PARKING,
      pricing: { new: 489 },
    },
    {
      id: 'pirate', name: 'Pirate Pass', rank: 2,
      cardColor: '#FFC123', cardTextColor: '#1A1A1A',
      eligibilityNote: 'Florida residents only', parking: DISNEY_PARKING,
      pricing: { new: 869 },
    },
    {
      id: 'sorcerer', name: 'Sorcerer Pass', rank: 3,
      cardColor: '#FFC123', cardTextColor: '#1A1A1A',
      eligibilityNote: 'Florida residents & DVC members', parking: DISNEY_PARKING,
      pricing: { new: 1099 },
    },
    {
      id: 'incredi_pass', name: 'Incredi-Pass', rank: 4,
      cardColor: '#FFC123', cardTextColor: '#1A1A1A', parking: DISNEY_PARKING,
      pricing: { new: 1629 },
    },
  ],
};

// -----------------------------------------------------------------------------
// United Parks (SeaWorld / Busch Gardens) — Bronze/Silver/Gold price by home
// park; Platinum is region-wide (Florida MSRP). Parking: Bronze none, Silver
// free general ($25), Gold/Platinum free preferred ($35) (perks.json).
// -----------------------------------------------------------------------------
const UNITED: Operator = {
  id: 'united_parks',
  name: 'SeaWorld Orlando',
  pickerName: 'SeaWorld / Busch Gardens',
  onePark: 89,
  additionalPark: null,
  watermark: 'seaworld',
  flow: 'united',
  unitedParks: [
    { id: 'swo', name: 'SeaWorld Orlando' },
    { id: 'bgt', name: 'Busch Gardens Tampa Bay' },
    { id: 'aq_orlando', name: 'Aquatica Orlando' },
    { id: 'ai_tampa', name: 'Adventure Island' },
  ],
  tiers: [
    {
      id: 'bronze', name: 'Bronze Pass', rank: 1, cardColor: '#534125', parking: [],
      pricing: { one_park: { swo: 198, bgt: 192, aq_orlando: 174, ai_tampa: 141 } },
    },
    {
      id: 'silver', name: 'Silver Pass', rank: 2, cardColor: '#808080',
      parking: [{ id: 'general', label: 'Free general parking', value: 25 }],
      pricing: { one_park: { swo: 279, bgt: 279, aq_orlando: 234, ai_tampa: 195 } },
    },
    {
      id: 'gold', name: 'Gold Pass', rank: 3, cardColor: '#BB9A4A',
      parking: [{ id: 'preferred', label: 'Free preferred parking', value: 35 }],
      pricing: { one_park: { swo: 315, bgt: 315, aq_orlando: 279, ai_tampa: 225 } },
    },
    {
      id: 'platinum', name: 'Platinum Pass', rank: 4, cardColor: '#5F7084',
      parking: [{ id: 'preferred', label: 'Free preferred parking', value: 35 }],
      pricing: { by_region: { florida: 549 } },
    },
  ],
};

export const OPERATORS: Operator[] = [UNIVERSAL, DISNEY, UNITED];

export function operatorById(id: OperatorId | null): Operator | undefined {
  return OPERATORS.find((o) => o.id === id);
}

export function tierById(op: Operator, tierId: string | null): Tier | undefined {
  return op.tiers.find((t) => t.id === tierId);
}

// -----------------------------------------------------------------------------
// Price resolution — auto-fill the real MSRP for the selected pass. Always
// user-overridable in the UI; this just seeds the field. Returns null when the
// context isn't complete enough to pick a price.
// -----------------------------------------------------------------------------
export interface PriceContext {
  residency: Residency;
  parkCount: 2 | 3;
  unitedHomePark: string | null;
}

export function resolvePrice(op: Operator, tier: Tier, ctx: PriceContext): number | null {
  if (op.flow === 'universal') {
    const byRes = tier.pricing[ctx.residency] as { two: number; three: number } | undefined;
    if (!byRes) return null;
    return ctx.parkCount === 3 ? byRes.three : byRes.two;
  }
  if (op.flow === 'disney') {
    return (tier.pricing.new as number) ?? null;
  }
  // United Parks
  if (tier.id === 'platinum') {
    const region = tier.pricing.by_region as { florida: number } | undefined;
    return region?.florida ?? null;
  }
  const onePark = tier.pricing.one_park as Record<string, number> | undefined;
  if (!onePark) return null;
  const park = ctx.unitedHomePark ?? 'swo';
  return onePark[park] ?? null;
}

// =============================================================================
// Payback math — mirrors product/payback_math.md.
// =============================================================================

export interface PaybackInputs {
  totalPaid: number;
  visits: number;
  onePark: number;
  /** Per-visit parking value from the selected option, or 0 if not used. */
  parkingPerVisit: number;
  /** Variable lump of other savings (dining, merch discounts, etc.). */
  otherSavings: number;
}

export interface PaybackResult {
  /** totalVisitValue = visits × onePark (single-park-day valuation). */
  totalVisitValue: number;
  totalPerkSavings: number;
  /** totalRecovered = totalVisitValue + totalPerkSavings (the WORTH number). */
  totalRecovered: number;
  /** Outer ring: totalRecovered / totalPaid. */
  valueRatio: number;
  /** Inner ring: totalVisitValue / totalPaid. */
  breakEvenRatio: number;
  /** Whole-percent label (can exceed 100). */
  valuePct: number;
  /** totalPaid / visits, whole dollars; null with no visits. */
  costPerVisit: number | null;
  /** Visits needed to cover the pass via attendance + parking; null if no rate. */
  breakEvenVisits: number | null;
  /** Dollars recovered beyond the price (0 until paid back). */
  surplus: number;
}

export function computePayback(i: PaybackInputs): PaybackResult {
  const visits = Math.max(0, Math.floor(i.visits || 0));
  const totalVisitValue = visits * i.onePark;
  const parkingSavings = visits * i.parkingPerVisit;
  const totalPerkSavings = parkingSavings + Math.max(0, i.otherSavings || 0);
  const totalRecovered = totalVisitValue + totalPerkSavings;

  const paid = Math.max(0, i.totalPaid || 0);
  const valueRatio = paid > 0 ? totalRecovered / paid : 0;
  const breakEvenRatio = paid > 0 ? totalVisitValue / paid : 0;
  const valuePct = Math.round(valueRatio * 100);
  const costPerVisit = visits > 0 ? Math.round(paid / visits) : null;

  // Break-even is expressed in visits: each visit recovers onePark gate value
  // plus the per-visit parking perk (the lump "other savings" isn't per-visit,
  // so it's excluded from the visit count — it still counts toward WORTH).
  const perVisitRate = i.onePark + i.parkingPerVisit;
  const breakEvenVisits = paid > 0 && perVisitRate > 0 ? Math.ceil(paid / perVisitRate) : null;

  const surplus = Math.max(0, totalRecovered - paid);

  return {
    totalVisitValue,
    totalPerkSavings,
    totalRecovered,
    valueRatio,
    breakEvenRatio,
    valuePct,
    costPerVisit,
    breakEvenVisits,
    surplus,
  };
}

/** Whole-dollar currency, matching the app's formatCurrencyWhole (halfUp, $). */
export function money(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}
