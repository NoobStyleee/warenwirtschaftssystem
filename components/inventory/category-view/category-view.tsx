'use client';

import React, { useState } from 'react';
import { Boxes, ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { InventoryItem } from '../../../types/inventory';
import { formatCurrency } from '../../../lib/utils';
import { Button } from '../../ui/button/button';
import tableStyles from '../inventory-table/inventory-table.module.css';
import styles from './category-view.module.css';

interface CategoryViewProps {
  items: InventoryItem[];
  onUpdateStock: (id: string, newStock: number) => void;
  onDeleteItem: (id: string) => void;
  onEditItem: (item: InventoryItem) => void;
  onOpenAddModal: () => void;
}

export function CategoryView({
  items,
  onUpdateStock,
  onDeleteItem,
  onEditItem,
  onOpenAddModal,
}: CategoryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // 1. Kategorien aggregieren
  const categoriesMap = items.reduce((acc, item) => {
    const cat = item.category || 'Unkategorisiert';
    if (!acc[cat]) {
      acc[cat] = { count: 0, totalValue: 0 };
    }
    acc[cat].count += 1;
    acc[cat].totalValue += item.stock * item.price;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number }>);

  // 2. Kategorien filtern basierend auf der Kategorien-Suche
  const filteredCategories = Object.entries(categoriesMap).filter(([catName]) =>
    catName.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  // 3. Artikel der ausgewählten Kategorie filtern + Artikel-Suche anwenden
  const categoryItems = selectedCategory
    ? items.filter((item) => {
        const matchesCategory = item.category === selectedCategory;
        const q = itemSearchQuery.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          (item.location && item.location.toLowerCase().includes(q));

        return matchesCategory && matchesSearch;
      })
    : [];

  // --- ANSICHT 1: ARTIKEL EINER KATEGORIE ANZEIGEN ---
  if (selectedCategory) {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <div className={styles.titleArea}>
            <button
              className={styles.backBtn}
              onClick={() => {
                setSelectedCategory(null);
                setItemSearchQuery('');
              }}
            >
              <ArrowLeft className="h-4 w-4" /> Zurück zu Kategorien
            </button>
            <h2 className={styles.title}>Kategorie: {selectedCategory}</h2>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className={styles.searchGroup}>
              <input
                type="text"
                placeholder={`In "${selectedCategory}" suchen...`}
                className={styles.searchInput}
                value={itemSearchQuery}
                onChange={(e) => setItemSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="primary" onClick={onOpenAddModal}>
              <Plus className="h-4 w-4 mr-2" /> Artikel Hinzufügen
            </Button>
          </div>
        </div>

        <div className={tableStyles.container}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>SKU / Artikel-Nr.</th>
                <th>Name</th>
                <th>Bestand</th>
                <th>Mindestbestand</th>
                <th>Preis (€)</th>
                <th>Lagerort</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {categoryItems.length > 0 ? (
                categoryItems.map((item) => (
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
                      >
                        {item.name}
                      </button>
                    </td>
                    <td>
                      <div className={tableStyles.stockControl}>
                        <button
                          className={tableStyles.stockBtn}
                          onClick={() => onUpdateStock(item.id, Math.max(0, item.stock - 1))}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          className={tableStyles.stockInput}
                          value={item.stock}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            onUpdateStock(item.id, isNaN(val) ? 0 : Math.max(0, val));
                          }}
                        />
                        <button
                          className={tableStyles.stockBtn}
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
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Keine Artikel in dieser Kategorie gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- ANSICHT 2: KATEGORIEN-ÜBERSICHT (KACHELN) ---
  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <h2 className={styles.title}>Kategorien-Übersicht</h2>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Kategorie suchen..."
            className={styles.searchInput}
            value={categorySearchQuery}
            onChange={(e) => setCategorySearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredCategories.length > 0 ? (
        <div className={styles.grid}>
          {filteredCategories.map(([categoryName, data]) => (
            <div
              key={categoryName}
              className={styles.card}
              onClick={() => setSelectedCategory(categoryName)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.categoryName}>{categoryName}</span>
                <div className={styles.iconWrapper}>
                  <Boxes className="h-5 w-5" />
                </div>
              </div>

              <div className={styles.stats}>
                <div>
                  <span>Artikel: </span>
                  <span className={styles.statValue}>{data.count}</span>
                </div>
                <div>
                  <span>Wert: </span>
                  <span className={styles.statValue}>{formatCurrency(data.totalValue)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          Keine Kategorie mit dem Namen &quot;{categorySearchQuery}&quot; gefunden.
        </div>
      )}
    </div>
  );
}