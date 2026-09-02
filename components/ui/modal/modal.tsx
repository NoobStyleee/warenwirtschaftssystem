import React, { useRef } from 'react';
import styles from './modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const mouseDownTargetRef = useRef<EventTarget | null>(null);

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      mouseDownTargetRef.current === e.currentTarget &&
      e.target === e.currentTarget
    ) {
      onClose();
    }
    mouseDownTargetRef.current = null;
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className={styles.content} onMouseDown={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}