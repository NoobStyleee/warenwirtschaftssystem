'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { InventoryItem } from '../../../types/inventory';
import { Button } from '../../ui/button/button';
import { formatCurrency } from '../../../lib/utils';
import { useToast } from '../../ui/toast-context/toast-context';
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
  const [searchTerm, setSearchTerm] = useState('');
  const { showToast } = useToast();

  // Artikel anhand von Name, SKU, Lagerort oder Kategorie filtern
  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(term);
    const skuMatch = item.sku?.toLowerCase().includes(term);
    const locationMatch = item.location?.toLowerCase().includes(term);
    const categoryMatch = item.category?.toLowerCase().includes(term);

    return nameMatch || skuMatch || locationMatch || categoryMatch;
  });

  const handleStockChange = (id: string, newStock: number, itemName: string) => {
    onUpdateStock(id, newStock);
    showToast(`Bestand für "${itemName}" auf ${newStock} Stk. aktualisiert.`, 'success');
  };

  const handleDelete = (id: string, itemName: string) => {
    onDeleteItem(id);
    showToast(`Artikel "${itemName}" wurde gelöscht.`, 'error');
  };

  const handleOpenAdd = () => {
    onOpenAddModal();
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Name, SKU, Lagerort oder Kategorie suchen..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="primary" onClick={handleOpenAdd}>
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
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.sku}</td>
                <td>
                  <button
                    onClick={() => {
                      onEditItem(item);
                      showToast(`Bearbeite Artikel: ${item.name}`, 'info');
                    }}
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
                      onClick={() => handleStockChange(item.id, Math.max(0, item.stock - 1), item.name)}
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
                        const newStock = isNaN(val) ? 0 : Math.max(0, val);
                        onUpdateStock(item.id, newStock);
                      }}
                      onBlur={(e) => {
                        const val = parseInt(e.target.value, 10);
                        const newStock = isNaN(val) ? 0 : Math.max(0, val);
                        showToast(`Bestand für "${item.name}" gespeichert (${newStock} Stk.).`, 'success');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                    />
                    <button
                      className={styles.stockBtn}
                      onClick={() => handleStockChange(item.id, item.stock + 1, item.name)}
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
                      onClick={() => {
                        onEditItem(item);
                        showToast(`Bearbeite Artikel: ${item.name}`, 'info');
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569' }}
                      title="Bearbeiten"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                Keine Artikel gefunden.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}