import React from 'react';
import { motion } from 'framer-motion';
import { slideUp } from '../animations/variants';

export default function GlassCard({ children, className = '' }) {
    return (
        <motion.div 
            variants={slideUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className={`backdrop-blur-md bg-[#161d2b]/80 border border-white/10 rounded-2xl shadow-lg ${className}`}
        >
            {children}
        </motion.div>
    );
}
