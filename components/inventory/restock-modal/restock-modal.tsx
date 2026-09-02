// components/inventory/restock-modal/restock-modal.tsx
'use client';

import React from 'react';
import { InventoryItem } from '../../../types/inventory';
import styles from './restock-modal.module.css';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  criticalItems: InventoryItem[];
}

export function RestockModal({ isOpen, onClose, criticalItems }: RestockModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>
            🚨 Nachbestellung erforderlich ({criticalItems.length})
          </h3>
          <button onClick={onClose} className={styles.closeButton}>
            ✕
          </button>
        </div>

        {/* Body / Tabelle */}
        <div className={styles.body}>
          {criticalItems.length === 0 ? (
            <p className={styles.emptyText}>Alles super! Keine Artikel im kritischen Bereich. 🎉</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th>SKU / Name</th>
                  <th>Kategorie</th>
                  <th style={{ textAlign: 'center' }}>Bestand</th>
                  <th style={{ textAlign: 'center' }}>Mindestbestand</th>
                </tr>
              </thead>
              <tbody>
                {criticalItems.map((item: any) => (
                  <tr key={item.id} className={styles.tableRow}>
                    <td>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemSku}>{item.sku}</div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{item.category}</td>
                    <td className={styles.stockCritical}>{item.stock}</td>
                    <td className={styles.stockNormal}>{item.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button onClick={onClose} className={styles.actionButton}>
            Schließen
          </button>
        </div>

      </div>
    </div>
  );
}