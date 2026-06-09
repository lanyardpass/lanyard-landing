import { useEffect, useRef, useState } from 'react';
import { ACTS } from '@/data/acts';
import './ScrollMorph.css';

/**
 * Act 1 (hook) + Act 2 (pitch).
 *
 * Two layouts ship in the DOM; CSS media queries show exactly one (no JS
 * detection, so no hydration flash and it's correct on first paint):
 *
 *  - Desktop (>860px, motion ok): the pinned C→A scroll-morph. The phone is a
 *    constant anchor while the oversized headline settles and the three feature
 *    beats cross-fade. Caption and phone live in separate grid tracks, so the
 *    big headline can never overlap the phone.
 *
 *  - Mobile (≤860px) OR prefers-reduced-motion (any width): clean stacked
 *    sections, one beat each, normal scrolling — no scroll-jack. This is the
 *    primary experience for an iPhone app's audience, who are mostly on phones.
 *
 * The scroll listener only does work while the morph is the visible layout.
 */

const REDUCED = '(prefers-reduced-motion: reduce)';

export default function ScrollMorph() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const mqReduced = window.matchMedia(REDUCED);

    let ticking = false;
    const update = () => {
      ticking = false;
      // The morph runs at every width now; only reduced-motion users get the
      // stacked fallback (which doesn't need the scroll listener).
      if (mqReduced.matches) return;
      const vh = window.innerHeight;
      const scrolled = Math.max(-track.getBoundingClientRect().top, 0);
      // Hero morph C→A across the first ~0.6 viewport (lower = title settles
      // to its small size in less scroll; was 0.85).
      const p = Math.min(scrolled / (vh * 0.6), 1);
      track.style.setProperty('--p', p.toFixed(3));
      // Act dwell windows.
      const idx = scrolled < vh * 1.4 ? 0 : scrolled < vh * 2.5 ? 1 : 2;
      setActive((cur) => (cur === idx ? cur : idx));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const act = ACTS[active];

  return (
    <>
      {/* Desktop pinned morph (CSS-hidden on mobile / reduced-motion). */}
      <div className="morph" ref={trackRef} style={{ ['--p' as string]: 0 }}>
        <div className="morph__stage">
          <div className="morph__grid">
            <div className="morph__caption">
              <div className="kicker">{act.kicker}</div>
              <h1 className="display morph__headline">{act.headline}</h1>
              <p className="morph__body">{act.body}</p>
            </div>
            <div className="morph__phone" aria-hidden="true">
              <div className="morph__screen">
                {ACTS.map((a, i) => (
                  <img
                    key={a.id}
                    className={i === active ? 'on' : ''}
                    src={a.screen}
                    alt=""
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                ))}
              </div>
              <img className="morph__plate" src="/assets/hand_frame.png" alt="" />
            </div>
          </div>
          <div className="morph__hint">Scroll ↓</div>
        </div>
        <p className="sr-only" aria-live="polite">
          {act.kicker}: {act.headline} {act.body}
        </p>
      </div>

      {/* Mobile / reduced-motion stacked beats (CSS-hidden on desktop). */}
      <section className="morph--static" aria-label="What Lanyard does">
        {ACTS.map((a, i) => (
          <div className="morph__row" key={a.id}>
            <div className="morph__caption">
              <div className="kicker">{a.kicker}</div>
              <h2 className="display morph__headline">{a.headline}</h2>
              <p className="morph__body">{a.body}</p>
            </div>
            <div className="morph__phone">
              <div className="morph__screen">
                <img src={a.screen} alt={a.screenAlt} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
              </div>
              <img className="morph__plate" src="/assets/hand_frame.png" alt="" />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
