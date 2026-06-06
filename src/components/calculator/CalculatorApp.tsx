// CalculatorApp — the interactive island for /calculator.
//
// Mirrors the app's Add-a-Pass flow (Operator → Tier → conditionals → details)
// with the same segmented progress pills, renders the live PassCard as the user
// builds their pass, then produces the app's payback receipt card from price +
// visits. Coach voice throughout (product_decisions.md → "Brand voice"): the
// result celebrates value earned, it never judges the purchase.

import { useEffect, useMemo, useState } from 'react';
import {
  OPERATORS, operatorById, tierById, resolvePrice, computePayback, money,
  type OperatorId, type Residency, type PriceContext,
} from '@/data/calculator';
import PassCardPreview, { materialForRank } from './PassCardPreview';
import PaybackReceipt from './PaybackReceipt';

type Step = 'operator' | 'tier' | 'options' | 'details';

export default function CalculatorApp() {
  const [operatorId, setOperatorId] = useState<OperatorId | null>(null);
  const [tierId, setTierId] = useState<string | null>(null);
  const [residency, setResidency] = useState<Residency>('out_of_state');
  const [parkCount, setParkCount] = useState<2 | 3>(3);
  const [unitedHomePark, setUnitedHomePark] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('operator');

  const [priceInput, setPriceInput] = useState('');
  const [priceTouched, setPriceTouched] = useState(false);
  // Start at zero visits on purpose — watching the rings fill as you add visits
  // is half the fun, so let the user drive it from empty rather than pre-filling.
  const [visits, setVisits] = useState(0);
  const [useParking, setUseParking] = useState(true);
  const [parkingOptId, setParkingOptId] = useState<string | null>(null);
  const [otherSavings, setOtherSavings] = useState('');

  const op = operatorById(operatorId);
  const tier = op ? tierById(op, tierId) : undefined;

  // Parking is tier- and option-specific (perks.json): e.g. Premier picks
  // Regular/Prime/Valet, Power only gets half-price, Seasonal gets nothing.
  const parkingOptions = tier?.parking ?? [];
  const selectedParking = parkingOptions.find((o) => o.id === parkingOptId) ?? parkingOptions[0];
  // Reset the chosen parking option whenever the tier changes.
  useEffect(() => { setParkingOptId(tier?.parking[0]?.id ?? null); }, [tierId, operatorId]);

  const ctx: PriceContext = { residency, parkCount, unitedHomePark };
  const resolvedPrice = op && tier ? resolvePrice(op, tier, ctx) : null;

  // The conditional step exists for Universal (park count + residency) and for
  // United non-Platinum (home park). Disney and UP Platinum skip straight to
  // details. Drives both the pills and the flow transitions.
  const steps: Step[] = useMemo(() => {
    if (!op) return ['operator', 'tier'];
    const hasOptions = op.flow === 'universal' || (op.flow === 'united' && tierId !== 'platinum');
    return hasOptions ? ['operator', 'tier', 'options', 'details'] : ['operator', 'tier', 'details'];
  }, [op, tierId]);

  // Seed the price field from MSRP whenever the resolved price changes, unless
  // the user has typed their own number (override wins, per the brief).
  useEffect(() => {
    if (!priceTouched && resolvedPrice != null) setPriceInput(String(resolvedPrice));
  }, [resolvedPrice, priceTouched]);

  function reset() {
    setOperatorId(null); setTierId(null); setUnitedHomePark(null);
    setResidency('out_of_state'); setParkCount(3);
    setPriceTouched(false); setPriceInput(''); setStep('operator');
    // Clear everything the user entered too — "start over" means a clean slate,
    // not the previous pass's visits/parking/savings carried onto a new one.
    setVisits(0); setUseParking(true); setParkingOptId(null); setOtherSavings('');
  }

  function pickOperator(id: OperatorId) {
    setOperatorId(id); setTierId(null); setUnitedHomePark(null); setStep('tier');
  }

  function pickTier(id: string) {
    setTierId(id);
    const o = operatorById(operatorId);
    if (!o) return;
    const hasOptions = o.flow === 'universal' || (o.flow === 'united' && id !== 'platinum');
    setStep(hasOptions ? 'options' : 'details');
  }

  // ---- Live card props ------------------------------------------------------
  const card = (() => {
    if (!op || !tier) return null;
    let operatorName = op.name;
    if (op.flow === 'united' && tier.id !== 'platinum' && unitedHomePark) {
      operatorName = op.unitedParks?.find((p) => p.id === unitedHomePark)?.name ?? op.name;
    }
    const isUni3 = op.flow === 'universal' && parkCount === 3;
    const tierName = isUni3 ? `3-Park ${tier.name}` : tier.name;
    const accent = op.flow === 'universal'
      ? (parkCount === 3 ? tier.cardColor : tier.cardColorTwoPark!) : tier.cardColor;
    return {
      operatorName,
      tierName,
      accentColor: accent,
      textColor: tier.cardTextColor ?? '#FFFFFF',
      material: materialForRank(tier.rank, op.tiers.length),
      watermark: op.watermark,
      showThreeParkStripe: isUni3,
    };
  })();

  // ---- Math -----------------------------------------------------------------
  const totalPaid = Number(priceInput) || 0;
  const parkingPerVisit = useParking && selectedParking ? selectedParking.value : 0;
  const result = op && tier
    ? computePayback({
        totalPaid, visits, onePark: op.onePark, parkingPerVisit,
        otherSavings: Number(otherSavings) || 0,
      })
    : null;

  // ---- Coach copy -----------------------------------------------------------
  const coach = (() => {
    if (!result || !tier) return null;
    if (totalPaid <= 0) return { title: 'Almost there.', body: 'Enter what you paid to see how it pays off.' };
    if (visits <= 0) return { title: "Let's make this pass pay off.", body: 'Add the visits you have planned and watch the value stack up.' };
    const be = result.breakEvenVisits;
    if (result.totalRecovered >= totalPaid) {
      const ahead = result.surplus;
      return {
        title: ahead > 0 ? `Paid back, and ${money(ahead)} ahead.` : 'Paid back.',
        body: `Worth ${money(result.totalRecovered)} across ${visits} visit${visits === 1 ? '' : 's'}.${be ? ` It paid for itself at visit ${be}.` : ''} Every trip from here is pure upside.`,
      };
    }
    const remaining = be != null ? Math.max(0, be - visits) : null;
    return {
      title: `${result.valuePct}% paid back.`,
      body: remaining != null
        ? `${remaining} more visit${remaining === 1 ? '' : 's'} and your ${tier.name} pays for itself.`
        : `You are recovering ${money(result.totalRecovered)} of value so far.`,
    };
  })();

  // Carry ?src= through to /beta for attribution (source.ts reads it).
  const betaHref = (() => {
    if (typeof window === 'undefined') return '/beta';
    const qs = new URLSearchParams(window.location.search);
    const src = qs.get('src') || qs.get('utm_source') || qs.get('ref');
    return src ? `/beta?src=${encodeURIComponent(src)}` : '/beta';
  })();

  const stepIdx = steps.indexOf(step);

  return (
    <div className="calc">
      {/* Progress pills — segmented, no labels (matches Add-a-Pass). */}
      <div className="calc-pills" role="presentation">
        {steps.map((s, i) => (
          <span key={s} className={`calc-pill${i <= stepIdx ? ' on' : ''}`} />
        ))}
      </div>

      {/* Live pass card — appears as soon as a tier is chosen and updates live.
          On the details step it moves into the left column (see below), so it's
          only rendered here for the selection steps. */}
      {card && step !== 'details' && (
        <div className="calc-card-wrap">
          <PassCardPreview {...card} />
        </div>
      )}

      {/* ---- Step: operator ---- */}
      {step === 'operator' && (
        <div className="calc-step">
          <p className="calc-q">Which pass do you hold?</p>
          <div className="calc-choices">
            {OPERATORS.map((o) => (
              <button key={o.id} type="button" className="calc-choice" onClick={() => pickOperator(o.id)}>
                {o.pickerName}<span className="calc-arrow">→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- Step: tier ---- */}
      {step === 'tier' && op && (
        <div className="calc-step">
          <p className="calc-q">{op.pickerName} — which tier?</p>
          <div className="calc-choices">
            {op.tiers.map((t) => (
              <button key={t.id} type="button" className="calc-choice" onClick={() => pickTier(t.id)}>
                <span>
                  {t.name}
                  {t.eligibilityNote && <span className="calc-choice__note">{t.eligibilityNote}</span>}
                </span>
                <span className="calc-arrow">→</span>
              </button>
            ))}
          </div>
          <div className="calc-nav"><button type="button" className="calc-ghost" onClick={() => setStep('operator')}>← Back</button></div>
        </div>
      )}

      {/* ---- Step: options ---- */}
      {step === 'options' && op && (
        <div className="calc-step">
          {op.flow === 'universal' && (
            <>
              <p className="calc-q">How many parks on your pass?</p>
              <div className="calc-seg">
                {([2, 3] as const).map((n) => (
                  <button key={n} type="button" className={`calc-choice calc-seg__btn${parkCount === n ? ' sel' : ''}`} onClick={() => setParkCount(n)}>
                    {n} parks
                  </button>
                ))}
              </div>
              <p className="calc-q calc-q--mt">Are you a Florida resident?</p>
              <div className="calc-seg">
                <button type="button" className={`calc-choice calc-seg__btn${residency === 'florida_resident' ? ' sel' : ''}`} onClick={() => setResidency('florida_resident')}>Yes</button>
                <button type="button" className={`calc-choice calc-seg__btn${residency === 'out_of_state' ? ' sel' : ''}`} onClick={() => setResidency('out_of_state')}>No</button>
              </div>
              <div className="calc-nav">
                <button type="button" className="calc-ghost" onClick={() => setStep('tier')}>← Back</button>
                <button type="button" className="calc-continue" onClick={() => setStep('details')}>See the math →</button>
              </div>
            </>
          )}
          {op.flow === 'united' && (
            <>
              <p className="calc-q">Which is your home park?</p>
              <div className="calc-choices">
                {op.unitedParks?.map((p) => (
                  <button key={p.id} type="button" className="calc-choice" onClick={() => { setUnitedHomePark(p.id); setStep('details'); }}>
                    {p.name}<span className="calc-arrow">→</span>
                  </button>
                ))}
              </div>
              <div className="calc-nav"><button type="button" className="calc-ghost" onClick={() => setStep('tier')}>← Back</button></div>
            </>
          )}
        </div>
      )}

      {/* ---- Step: details + result ---- */}
      {step === 'details' && op && tier && result && (
        <div className="calc-result">
          <div className="calc-details">
            {/* Column 1 — your pass + the inputs */}
            <div className="calc-details__inputs">
              {card && (
                <div className="calc-card-wrap">
                  <PassCardPreview {...card} />
                </div>
              )}
              <div className="calc-fields">
            <div className="calc-field">
              <label htmlFor="calc-price">What you paid</label>
              <div className="calc-money-input">
                <span>$</span>
                <input
                  id="calc-price" type="number" inputMode="decimal" min={0}
                  value={priceInput}
                  onChange={(e) => { setPriceInput(e.target.value); setPriceTouched(true); }}
                />
              </div>
              {resolvedPrice != null && (
                <p className="calc-hint">
                  {priceTouched && Number(priceInput) !== resolvedPrice ? (
                    <button type="button" className="calc-link" onClick={() => { setPriceTouched(false); setPriceInput(String(resolvedPrice)); }}>
                      Reset to {money(resolvedPrice)} MSRP
                    </button>
                  ) : (
                    <>Auto-filled from the {money(resolvedPrice)} list price. Paid less on a deal? Change it.</>
                  )}
                </p>
              )}
            </div>

            <div className="calc-field">
              <label htmlFor="calc-visits">Visits {visits >= 40 ? '(40+)' : ''}</label>
              <div className="calc-visits">
                <input
                  id="calc-visits" type="range" min={0} max={40} value={Math.min(visits, 40)}
                  onChange={(e) => setVisits(Number(e.target.value))}
                />
                <input
                  type="number" className="calc-visits__num" min={0} value={visits}
                  onChange={(e) => setVisits(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
                />
              </div>
              <p className="calc-hint">Trips so far, or what you have planned this year.</p>
            </div>

            <div className="calc-toggles">
              {parkingOptions.length > 0 ? (
                <div className="calc-parking">
                  <label className="calc-toggle">
                    <input type="checkbox" checked={useParking} onChange={(e) => setUseParking(e.target.checked)} />
                    <span>
                      {parkingOptions.length > 1
                        ? 'I use my free parking each visit'
                        : `I use my parking perk (${parkingOptions[0].label}, ${money(parkingOptions[0].value)}/visit)`}
                    </span>
                  </label>
                  {parkingOptions.length > 1 && useParking && (
                    <div className="calc-parking__opts">
                      {parkingOptions.map((o) => (
                        <button
                          key={o.id} type="button"
                          className={`calc-park-opt${selectedParking?.id === o.id ? ' sel' : ''}`}
                          onClick={() => setParkingOptId(o.id)}
                        >
                          <span className="calc-park-opt__label">{o.label}</span>
                          <span className="calc-park-opt__val">{money(o.value)}/visit</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="calc-hint calc-parking__none">
                  {tier.name} doesn’t include free parking — that’s a perk of the higher tiers.
                </p>
              )}

              <div className="calc-field calc-field--inline">
                <label htmlFor="calc-other">Other savings (dining, merch, events)</label>
                <div className="calc-money-input calc-money-input--sm">
                  <span>$</span>
                  <input id="calc-other" type="number" inputMode="decimal" min={0} placeholder="0"
                    value={otherSavings} onChange={(e) => setOtherSavings(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
            </div>

            {/* Column 2 — the payback receipt + handoff */}
            <div className="calc-details__result">
              <PaybackReceipt
                operatorLabel={card!.operatorName}
                tierLabel={tier.name}
                accentColor={card!.accentColor}
                result={result}
                visits={visits}
              />

              {coach && (
                <div className="calc-coach">
                  <p className="calc-coach__title">{coach.title}</p>
                  <p className="calc-coach__body">{coach.body}</p>
                </div>
              )}

              {/* Handoff — lead magnet → app */}
              <div className="calc-cta">
                <p className="calc-cta__lead">Want this tracked automatically, with your blockouts and perks logged for you?</p>
                <a className="calc-cta__btn" href={betaHref}>Get Lanyard →</a>
                <button type="button" className="calc-link calc-cta__edit" onClick={reset}>Start over with a different pass</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
