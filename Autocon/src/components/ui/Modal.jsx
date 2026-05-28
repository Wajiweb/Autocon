import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';

const SIZE_MAP = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-4xl',
  full: 'max-w-full m-4',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  variant = 'center', // 'center' (traditional modal dialog) or 'drawer' (slides from right)
  className = '',
  ...rest
}) {
  const shouldReduceMotion = useReducedMotion();

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    center: {
      hidden: { opacity: 0, scale: 0.96, y: 10 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 350, damping: 30 },
      },
      exit: { opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.15 } },
    },
    drawer: {
      hidden: { x: '100%' },
      visible: {
        x: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      },
      exit: { x: '100%', transition: { duration: 0.2, ease: 'easeInOut' } },
    },
  };

  const currentVariants = modalVariants[variant] ?? modalVariants.center;
  const sizeClass = SIZE_MAP[size] ?? SIZE_MAP.md;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          {/* Overlay backdrop */}
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container */}
          {variant === 'drawer' ? (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={shouldReduceMotion ? {} : currentVariants}
              className={`fixed top-0 right-0 bottom-0 w-full max-w-[460px] surface-modal flex flex-col z-[1000] border-l border-white/10 ${className}`}
              role="dialog"
              aria-modal="true"
              {...rest}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                {title && <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-on-surface-muted hover:text-red-500 hover:border-red-500/30 transition-all bg-white/[0.02]"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={shouldReduceMotion ? {} : currentVariants}
              className={`relative w-full ${sizeClass} surface-modal border border-white/10 flex flex-col z-[1000] max-h-[85vh] overflow-hidden ${className}`}
              role="dialog"
              aria-modal="true"
              {...rest}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/5">
                {title && <h2 className="text-base font-bold text-white tracking-tight">{title}</h2>}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-on-surface-muted hover:text-red-500 hover:border-red-500/30 transition-all bg-white/[0.02]"
                  aria-label="Close modal"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {children}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
