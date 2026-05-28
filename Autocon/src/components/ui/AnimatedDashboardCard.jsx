import React from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * AnimatedDashboardCard
 *
 * Phase 2 refactor — design-spells + simplify-code + frontend-design:
 *  - Replaced raw `accentColor` hex prop with semantic `variant` prop.
 *  - Eliminated `hexToRgb()` dead-code utility (only needed for hex → shadow).
 *  - Replaced Tailwind arbitrary hex values (bg-[#0a0a0a]) with CSS token refs.
 *  - All colours now sourced from the unified design system (index.css :root).
 *
 * Design-spells rules respected:
 *  - spring animations preserved (60fps, GPU-accelerated via framer-motion)
 *  - background glow micro-interaction preserved
 *  - `useReducedMotion` prefers-reduced-motion respected
 */

// Maps variant → CSS custom properties from the design system (index.css)
const VARIANT_MAP = {
  primary: {
    color:       'var(--primary)',                         // hsl(25 100% 50%) — orange
    borderAlpha: 'color-mix(in srgb, var(--primary) 20%, transparent)',
    glowBg:      'color-mix(in srgb, var(--primary) 12%, transparent)',
    shadowGlow:  'var(--shadow-glow)',                     // pre-defined in :root
  },
  blue: {
    color:       'var(--ai-accent)',                       // #60a5fa
    borderAlpha: 'color-mix(in srgb, var(--ai-accent) 20%, transparent)',
    glowBg:      'color-mix(in srgb, var(--ai-accent) 12%, transparent)',
    shadowGlow:  '0 15px 35px -10px color-mix(in srgb, var(--ai-accent) 15%, transparent)',
  },
  green: {
    color:       'var(--success)',                         // #34d399
    borderAlpha: 'color-mix(in srgb, var(--success) 20%, transparent)',
    glowBg:      'color-mix(in srgb, var(--success) 12%, transparent)',
    shadowGlow:  '0 15px 35px -10px color-mix(in srgb, var(--success) 15%, transparent)',
  },
};

export function AnimatedDashboardCard({
  title,
  mainValue,
  leftLabel,
  leftValue,
  leftSub,
  rightLabel,
  rightValue,
  rightSub,
  /** Semantic variant — replaces raw `accentColor` hex prop. */
  variant = "primary",
  enableAnimations = true,
  delayOffset = 0,
}) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  // Resolve variant tokens (fall back to 'primary' for unknown values)
  const tokens = VARIANT_MAP[variant] ?? VARIANT_MAP.primary;

  const containerVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.08, delayChildren: delayOffset } 
    }
  };

  const hasLowerThird = leftLabel || rightLabel;

  return (
    <motion.div
      className="w-full"
      initial={shouldAnimate ? "hidden" : "visible"}
      animate="visible"
      variants={shouldAnimate ? containerVariants : {}}
    >
      <motion.div
        className="border rounded-xl overflow-hidden relative backdrop-blur-xl h-full flex flex-col"
        style={{ 
          background: 'var(--surface-low)',
          borderColor: tokens.borderAlpha,
          boxShadow: `${tokens.shadowGlow}, inset 0 1px 0 rgba(255,255,255,0.05)` 
        }}
      >
        {/* Background glow — design-spells: GPU-accelerated blur micro-interaction */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full blur-[70px] pointer-events-none" 
          style={{ backgroundColor: tokens.glowBg }}
        />

        {/* Top / Middle Section - Main Value */}
        <div className="relative px-6 pt-6 pb-2 flex flex-col items-center justify-center flex-1 z-20">
            <motion.div 
              className="text-[10px] font-semibold tracking-[0.2em] mb-1.5 uppercase text-center"
              style={{ color: tokens.color }}
              initial={shouldAnimate ? { opacity: 0, y: -5 } : {}}
              animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: delayOffset + 0.2, type: "spring" }}
            >
              {title}
            </motion.div>
            <motion.div 
              className="text-4xl font-bold text-white tracking-tighter"
              initial={shouldAnimate ? { opacity: 0, scale: 0.9 } : {}}
              animate={shouldAnimate ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: delayOffset + 0.3, type: "spring" }}
            >
              {mainValue}
            </motion.div>
        </div>

        {/* Bottom Section */}
        {hasLowerThird && (
          <div
            className="relative px-5 pb-5 pt-4 flex justify-between w-full z-20 mt-4 border-t"
            style={{ background: 'var(--bg)', borderColor: 'var(--outline-subtle)' }}
          >
            {/* Left Section */}
            {leftLabel && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className="w-1 h-2.5 rounded-full"
                    style={{ backgroundColor: tokens.color }}
                    initial={shouldAnimate ? { opacity: 0, scaleY: 0 } : {}}
                    animate={shouldAnimate ? { opacity: 1, scaleY: 1 } : {}}
                    transition={{ delay: delayOffset + 0.3 }}
                  />
                  <motion.div
                    className="text-[9px] font-medium uppercase tracking-widest whitespace-nowrap"
                    style={{ color: 'var(--on-surface-variant)' }}
                    initial={shouldAnimate ? { opacity: 0, x: -5 } : {}}
                    animate={shouldAnimate ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: delayOffset + 0.4 }}
                  >
                    {leftLabel}
                  </motion.div>
                </div>
                <div className="pl-2.5 mt-0.5">
                  <motion.div
                    className="text-sm font-semibold text-white tracking-tight leading-none"
                    style={{ fontFamily: 'var(--db-mono)' }}
                    initial={shouldAnimate ? { opacity: 0, y: 5 } : {}}
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: delayOffset + 0.5 }}
                  >
                    {leftValue}
                  </motion.div>
                  <motion.div
                    className="text-[9px] font-medium mt-1 uppercase tracking-wider leading-none"
                    style={{ color: tokens.color }}
                    initial={shouldAnimate ? { opacity: 0 } : {}}
                    animate={shouldAnimate ? { opacity: 1 } : {}}
                    transition={{ delay: delayOffset + 0.6 }}
                  >
                    {leftSub}
                  </motion.div>
                </div>
              </div>
            )}

            {/* Right Section */}
            {rightLabel && (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className="text-[9px] font-medium uppercase tracking-widest whitespace-nowrap"
                    style={{ color: 'var(--on-surface-variant)' }}
                    initial={shouldAnimate ? { opacity: 0, x: 5 } : {}}
                    animate={shouldAnimate ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: delayOffset + 0.4 }}
                  >
                    {rightLabel}
                  </motion.div>
                  <motion.div
                    className="w-1 h-2.5 rounded-full"
                    style={{ backgroundColor: tokens.color }}
                    initial={shouldAnimate ? { opacity: 0, scaleY: 0 } : {}}
                    animate={shouldAnimate ? { opacity: 1, scaleY: 1 } : {}}
                    transition={{ delay: delayOffset + 0.3 }}
                  />
                </div>
                <div className="pr-2.5 mt-0.5 text-right">
                  <motion.div
                    className="text-sm font-semibold text-white tracking-tight leading-none"
                    style={{ fontFamily: 'var(--db-mono)' }}
                    initial={shouldAnimate ? { opacity: 0, y: 5 } : {}}
                    animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: delayOffset + 0.5 }}
                  >
                    {rightValue}
                  </motion.div>
                  <motion.div
                    className="text-[9px] font-medium mt-1 uppercase tracking-wider leading-none"
                    style={{ color: tokens.color }}
                    initial={shouldAnimate ? { opacity: 0 } : {}}
                    animate={shouldAnimate ? { opacity: 1 } : {}}
                    transition={{ delay: delayOffset + 0.6 }}
                  >
                    {rightSub}
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        )}

      </motion.div>
    </motion.div>
  );
}
