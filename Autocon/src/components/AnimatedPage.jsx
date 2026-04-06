import React from 'react';
import { motion } from 'framer-motion';

// eslint-disable-next-line react-refresh/only-export-components
export const slideUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.3, 
      ease: [0.25, 0.1, 0.25, 1] 
    }
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    transition: { duration: 0.2, ease: 'easeIn' } 
  }
};

export default function AnimatedPage({ children, className = '' }) {
    return (
        <motion.div
            variants={slideUpVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={className}
        >
            {children}
        </motion.div>
    );
}
