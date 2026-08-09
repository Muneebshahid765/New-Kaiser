// components/home/CartToast.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { CartToastProps } from '@/types';

export const CartToast: React.FC<CartToastProps> = ({ cartNotification, onViewCart }) => {
  if (!cartNotification) return null;

  return (
    <motion.div
      className="fixed top-4 right-4 z-50 bg-white rounded-xl shadow-2xl border border-stone-200 p-4 flex items-center gap-3 max-w-sm"
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <motion.span
        className="text-xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
      >
        ✅
      </motion.span>
      <span className="text-sm text-stone-700 flex-1">
        "{cartNotification.name}" was added to your cart.
      </span>
      <motion.button
        onClick={onViewCart}
        className="text-amber-700 font-semibold text-sm hover:underline"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        View cart
      </motion.button>
    </motion.div>
  );
};