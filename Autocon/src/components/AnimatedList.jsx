import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, slideUp } from '../animations/variants';

export default function AnimatedList({ children, className = '' }) {
    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className={className}
        >
            {React.Children.map(children, (child) => (
                <motion.div variants={slideUp}>
                    {child}
                </motion.div>
            ))}
        </motion.div>
    );
}
