'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick,
}) => {
  return (
    <motion.div
      whileHover={theme.animations.cardHover}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}; 