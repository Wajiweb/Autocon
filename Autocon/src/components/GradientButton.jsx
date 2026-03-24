import React from 'react';
import { motion } from 'framer-motion';

export default function GradientButton({ children, onClick, className = '' }) {
    return (
        <motion.button 
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`bg-[image:var(--image-primary-gradient)] text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] ${className}`}
        >
            {children}
        </motion.button>
    );
}
