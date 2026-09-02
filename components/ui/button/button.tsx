import React from 'react';
import styles from './button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}