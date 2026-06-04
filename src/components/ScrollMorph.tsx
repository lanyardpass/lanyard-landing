import { useEffect, useRef, useState } from 'react';
import { ACTS } from '@/data/acts';
import './ScrollMorph.css';

/**
 * Act 1 (hook) + Act 2 (pitch): the C→A scroll-morph.
 *
 * A pinned stage holds the phone as a constant anchor while the oversized
 * hero headline settles (C→A) and the three feature beats cross-fade. Caption
 * and phone live in separate grid tracks, so the big headline can never
 * overlap the phone (overlap-prevention by layout, not by math).
 *
 * Respects prefers-reduced-motion: those users get a static stacked version
 * with no scroll-jacking.
 */

function Phone({ screens, activeIndex }: { screens: typeof ACTS; activeIndex: number }) {
  return (
    <div className="morph__phone" aria-hidden="true">
      <div className="morph__screen">
        {screens.map((act, i) => (
          <img
            key={act.id}
            className={i === activeIndex ? 'on' : ''}
            src={act.screen}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
      </div>
      <img className="morph__plate" src="/assets/hand_frame.png" alt="" />
    </div>
  );
}

export default function ScrollMorph() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  // Detect reduced-motion preference (client only).
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  // Scroll-driven morph (skipped entirely when reduced-motion is on).
  useEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    if (!track) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      const scrolled = Math.max(-track.getBoundingClientRect().top, 0);
      // Hero morph C→A across the first ~0.85 viewport.
      const p = Math.min(scrolled / (vh * 0.85), 1);
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
  }, [reduced]);

  // ---- Reduced-motion: static stacked beats, no scroll-jack ----
  if (reduced) {
    return (
      <section className="morph--static" aria-label="What Lanyard does">
        {ACTS.map((act) => (
          <div className="morph__row" key={act.id}>
            <div className="morph__caption">
              <div className="kicker">{act.kicker}</div>
              <h2 className="display morph__headline">{act.headline}</h2>
              <p className="morph__body">{act.body}</p>
            </div>
            <div className="morph__phone">
              <div className="morph__screen">
                <img className="on" src={act.screen} alt={act.screenAlt} loading="lazy" decoding="async" />
              </div>
              <img className="morph__plate" src="/assets/hand_frame.png" alt="" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  // ---- Animated: pinned stage with C→A morph + cross-fade ----
  const act = ACTS[active];
  return (
    <div className="morph" ref={trackRef} style={{ ['--p' as string]: 0 }}>
      <div className="morph__stage">
        <div className="morph__grid">
          <div className="morph__caption">
            <div className="kicker">{act.kicker}</div>
            <h1 className="display morph__headline">{act.headline}</h1>
            <p className="morph__body">{act.body}</p>
          </div>
          <Phone screens={ACTS} activeIndex={active} />
        </div>
        <div className="morph__hint">Scroll ↓</div>
      </div>
      {/* Live region keeps the cross-fade accessible to screen readers. */}
      <p className="sr-only" aria-live="polite">
        {act.kicker}: {act.headline} {act.body}
      </p>
    </div>
  );
}
