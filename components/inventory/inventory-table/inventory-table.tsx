'use client';

import React from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { InventoryItem } from '../../../types/inventory';
import { Button } from '../../ui/button/button';
import { formatCurrency } from '../../../lib/utils';
import styles from './inventory-table.module.css';

interface InventoryTableProps {
  items: InventoryItem[];
  onUpdateStock: (id: string, newStock: number) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: InventoryItem) => void;
  onOpenAddModal: () => void;
}

export function InventoryTable({
  items,
  onUpdateStock,
  onDeleteItem,
  onEditItem,
  onOpenAddModal,
}: InventoryTableProps) {
  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Name, SKU oder Lagerort suchen..."
            className={styles.searchInput}
          />
        </div>
        <Button variant="primary" onClick={onOpenAddModal}>
          <Plus className="h-4 w-4 mr-2" /> Artikel Hinzufügen
        </Button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>SKU / Artikel-Nr.</th>
            <th>Name</th>
            <th>Kategorie</th>
            <th>Bestand</th>
            <th>Mindestbestand</th>
            <th>Preis (€)</th>
            <th>Lagerort</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={{ fontWeight: 600 }}>{item.sku}</td>
              <td>
                <button
                  onClick={() => onEditItem(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563eb',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                  title="Klicken zum Bearbeiten"
                >
                  {item.name}
                </button>
              </td>
              <td>{item.category}</td>
              <td>
                <div className={styles.stockControl}>
                  <button
                    className={styles.stockBtn}
                    onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    className={styles.stockInput}
                    value={item.stock}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateStock(item.id, isNaN(val) ? 0 : Math.max(0, val));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                  />
                  <button
                    className={styles.stockBtn}
                    onClick={() => onUpdateStock(item.id, item.stock + 1)}
                  >
                    +
                  </button>
                </div>
              </td>
              <td>{item.minStock}</td>
              <td>{formatCurrency(item.price)}</td>
              <td>{item.location || '-'}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => onEditItem(item)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
                    title="Bearbeiten"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                    title="Löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}