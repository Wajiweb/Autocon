/**
 * useScrollAnimation.js
 * Returns Framer Motion `controls` that trigger when the element enters viewport.
 * Usage:
 *   const { ref, controls } = useScrollAnimation();
 *   <motion.div ref={ref} animate={controls} variants={fadeUp} initial="hidden" />
 */
import { useEffect, useRef } from 'react';
import { useAnimation, useInView } from 'framer-motion';

/**
 * @param {number} amount - Fraction of element visible before triggering (0–1)
 * @param {boolean} once  - Only trigger once (default: true)
 */
export function useScrollAnimation({ amount = 0.18, once = true } = {}) {
  const ref      = useRef(null);
  const controls = useAnimation();
  const inView   = useInView(ref, { amount, once });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [inView, controls, once]);

  return { ref, controls, inView };
}
