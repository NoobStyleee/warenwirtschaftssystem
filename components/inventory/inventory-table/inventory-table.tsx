'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
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

const ITEMS_PER_PAGE = 10;

export function InventoryTable({
  items,
  onUpdateStock,
  onDeleteItem,
  onEditItem,
  onOpenAddModal,
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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

  // Pagination Berechnungen
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Bei Suche immer auf Seite 1 zurücksetzen
  };

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
            onChange={handleSearchChange}
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
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <tr key={item.id}>
                <td className={styles.skuCell}>{item.sku}</td>
                <td>
                  <button
                    onClick={() => {
                      onEditItem(item);
                      showToast(`Bearbeite Artikel: ${item.name}`, 'info');
                    }}
                    className={styles.itemNameButton}
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
                  <div className={styles.actionCell}>
                    <button
                      onClick={() => {
                        onEditItem(item);
                        showToast(`Bearbeite Artikel: ${item.name}`, 'info');
                      }}
                      className={styles.actionEditBtn}
                      title="Bearbeiten"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className={styles.actionDeleteBtn}
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
              <td colSpan={8} className={styles.emptyRow}>
                Keine Artikel gefunden.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className={styles.paginationContainer}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className={`${styles.paginationBtn} ${currentPage === 1 ? styles.disabled : ''}`}
          >
            <ChevronLeft className="h-4 w-4" /> Zurück
          </button>
          <span className={styles.paginationInfo}>
            Seite {currentPage} von {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className={`${styles.paginationBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
          >
            Weiter <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}