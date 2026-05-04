import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export function AnimatedDashboardCard({
  title,
  mainValue,
  leftLabel,
  leftValue,
  leftSub,
  rightLabel,
  rightValue,
  rightSub,
  accentColor = "#ff6b00",
  enableAnimations = true,
  delayOffset = 0,
}) {
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimate = enableAnimations && !shouldReduceMotion;

  // Convert hex to rgb for glow shadows
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '255, 107, 0';
  };
  const rgbAccent = hexToRgb(accentColor);

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
        className="bg-[#0a0a0a]/80 border rounded-xl overflow-hidden relative backdrop-blur-xl h-full flex flex-col"
        style={{ 
          borderColor: `rgba(${rgbAccent}, 0.2)`,
          boxShadow: `0 15px 35px -10px rgba(${rgbAccent}, 0.05), inset 0 1px 0 rgba(255,255,255,0.05)` 
        }}
      >
        {/* Background glow for professional look */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] rounded-full blur-[70px] pointer-events-none" 
          style={{ backgroundColor: `rgba(${rgbAccent}, 0.12)` }}
        />

        {/* Top / Middle Section - Main Value */}
        <div className="relative px-6 pt-6 pb-2 flex flex-col items-center justify-center flex-1 z-20">
            <motion.div 
              className="text-[10px] font-semibold tracking-[0.2em] mb-1.5 uppercase text-center"
              style={{ color: accentColor }}
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

        {/* Bottom Section (Natural flow, not absolute) */}
        {hasLowerThird && (
          <div className="relative px-5 pb-5 pt-4 flex justify-between w-full z-20 mt-4 border-t border-white/5 bg-[#050505]/30">
            {/* Left Section */}
            {leftLabel && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className="w-1 h-2.5 rounded-full"
                    style={{ backgroundColor: accentColor }}
                    initial={shouldAnimate ? { opacity: 0, scaleY: 0 } : {}}
                    animate={shouldAnimate ? { opacity: 1, scaleY: 1 } : {}}
                    transition={{ delay: delayOffset + 0.3 }}
                  />
                  <motion.div
                    className="text-[9px] font-medium text-gray-400 uppercase tracking-widest whitespace-nowrap"
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
                    style={{ color: accentColor }}
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
                    className="text-[9px] font-medium text-gray-400 uppercase tracking-widest whitespace-nowrap"
                    initial={shouldAnimate ? { opacity: 0, x: 5 } : {}}
                    animate={shouldAnimate ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: delayOffset + 0.4 }}
                  >
                    {rightLabel}
                  </motion.div>
                  <motion.div
                    className="w-1 h-2.5 rounded-full"
                    style={{ backgroundColor: accentColor }}
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
                    style={{ color: accentColor }}
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
