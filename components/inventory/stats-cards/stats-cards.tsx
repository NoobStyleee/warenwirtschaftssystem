'use client';

import React from 'react';
import { Package, AlertTriangle, Euro } from 'lucide-react';
import { InventoryItem } from '../../../types/inventory';
import { formatCurrency } from '../../../lib/utils';
import styles from './stats-cards.module.css';

interface StatsCardsProps {
  items: InventoryItem[];
  onRestockClick?: () => void;
}

export function StatsCards({ items, onRestockClick }: StatsCardsProps) {
  const totalItems = items.length;
  const lowStockCount = items.filter((item) => item.stock <= item.minStock).length;
  const totalValue = items.reduce((sum, item) => sum + item.stock * item.price, 0);

  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Gesamtartikel</span>
          <Package className="h-5 w-5 text-blue-600" />
        </div>
        <div className={styles.cardValue}>{totalItems}</div>
      </div>

      {/* Klickbare Karte für kritische Artikel */}
      <div 
        className={`${styles.card} transition hover:border-amber-500`}
        style={{ cursor: 'pointer' }}
        onClick={onRestockClick}
      >
        <div className={styles.cardHeader} style={{ cursor: 'pointer' }}>
          <span className={styles.cardTitle} style={{ cursor: 'pointer' }}>Nachbestellen (Kritisch)</span>
          <AlertTriangle className="h-5 w-5 text-amber-500" style={{ cursor: 'pointer' }} />
        </div>
        <div className="flex items-center justify-between mt-2" style={{ cursor: 'pointer' }}>
          <div className={lowStockCount > 0 ? styles.cardValueCritical : styles.cardValue} style={{ cursor: 'pointer' }}>
            {lowStockCount}
          </div>
          <span className="text-xs text-amber-500 font-semibold underline" style={{ cursor: 'pointer' }}>
            Anzeigen →
          </span>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Gesamtwert Lager</span>
          <Euro className="h-5 w-5 text-emerald-600" />
        </div>
        <div className={styles.cardValue}>{formatCurrency(totalValue)}</div>
      </div>
    </div>
  );
}