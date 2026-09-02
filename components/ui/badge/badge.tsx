import React from 'react';
import styles from './badge.module.css';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning';
  children: React.ReactNode;
}

export function Badge({ variant = 'success', children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {children}
    </span>
  );
}