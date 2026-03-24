import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ParallaxScroll({ children, offset = [-100, 100], className = '' }) {
  const ref = useRef(null);
  
  // Track scroll progress within element's viewport boundaries
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Map standard 0-1 progress to the offset array for Y-axis dynamic translation
  const y = useTransform(scrollYProgress, [0, 1], offset);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
