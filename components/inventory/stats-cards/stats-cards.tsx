'use client';

import React from 'react';
import { Package, AlertTriangle, CircleDollarSign, Euro } from 'lucide-react';
import { InventoryItem } from '../../../types/inventory';
import { formatCurrency } from '../../../lib/utils';
import styles from './stats-cards.module.css';

interface StatsCardsProps {
  items: InventoryItem[];
}

export function StatsCards({ items }: StatsCardsProps) {
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

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Nachbestellen (Kritisch)</span>
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div className={lowStockCount > 0 ? styles.cardValueCritical : styles.cardValue}>
          {lowStockCount}
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