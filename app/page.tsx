'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '../components/layout/header/header';
import { Sidebar } from '../components/layout/sidebar/sidebar';
import { StatsCards } from '../components/inventory/stats-cards/stats-cards';
import { InventoryTable } from '../components/inventory/inventory-table/inventory-table';
import { CategoryView } from '../components/inventory/category-view/category-view';
import { ReportsView } from '../components/reports/reports-view';
import { ItemModal } from '../components/inventory/item-modal/item-modal';
import { RestockModal } from '../components/inventory/restock-modal/restock-modal';
import { InventoryItem } from '../types/inventory';

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'categories' | 'reports'>('inventory');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showRestockModal, setShowRestockModal] = useState(false);

  const criticalItems = items.filter((item: any) => item.stock <= item.minStock);
  const existingCategories = Array.from(
    new Set(items.map((item: any) => item.category).filter(Boolean))
  ) as string[];
  const existingSuppliers = Array.from(
    new Set(items.map((item: any) => item.supplier).filter(Boolean))
  ) as string[];


  
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (err) {
      console.error('Fehler beim Laden', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // OPTIMISTISCHES UPDATE: Ändert den Bestand sofort lokal, speichert im Hintergrund
  const handleUpdateStock = async (id: string, newStock: number) => {
    // 1. Lokalen State sofort aktualisieren (0 Millisekunden Wartezeit)
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, stock: newStock } : item))
    );

    try {
      // 2. Im Hintergrund an die Datenbank schicken
      await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stock: newStock }),
      });
    } catch (err) {
      console.error('Fehler beim Aktualisieren', err);
      // Falls es fehlschlägt, holen wir zur Sicherheit die echten Daten zurück
      fetchItems();
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Artikel wirklich löschen?')) return;
    
    // Auch hier direkt lokal entfernen für ein flüssiges Gefühl
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));

    try {
      await fetch(`/api/inventory?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Fehler beim Löschen', err);
      fetchItems();
    }
  };

  const handleSaveItem = async (itemData: any) => {
    try {
      const isEditing = Boolean(itemData.id);
      await fetch('/api/inventory', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      fetchItems();
    }  catch (err) {
      console.error('Fehler beim Speichern', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, width: '100%' }}>
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => setActiveTab(tab as any)} />
        <main style={{ flex: 1, padding: '1.5rem', backgroundColor: 'var(--bg-app)', overflowX: 'auto' }}>
          {activeTab === 'inventory' && (
            <>
              <StatsCards 
                items={items} 
                onRestockClick={() => setShowRestockModal(true)} 
              />
              <InventoryTable
                items={items}
                onUpdateStock={handleUpdateStock}
                onDeleteItem={handleDeleteItem}
                onEditItem={(item) => {
                  setSelectedItem(item);
                  setIsModalOpen(true);
                }}
                onOpenAddModal={() => {
                  setSelectedItem(null);
                  setIsModalOpen(true);
                }}
              />
            </>
          )}

          {activeTab === 'categories' && (
            <CategoryView
              items={items}
              onUpdateStock={handleUpdateStock}
              onDeleteItem={handleDeleteItem}
              onEditItem={(item) => {
                setSelectedItem(item);
                setIsModalOpen(true);
              }}
              onOpenAddModal={() => {
                setSelectedItem(null);
                setIsModalOpen(true);
              }}
            />
          )}

          {activeTab === 'reports' && <ReportsView items={items} />}
        </main>
      </div>

      {/* Artikel Bearbeiten / Hinzufügen Modal */}
      <ItemModal
        isOpen={isModalOpen}
        initialData={selectedItem}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        existingCategories={existingCategories}
        existingSuppliers={existingSuppliers}
      />

      {/* Sauberes Restock Modal als eigenständige Komponente */}
      <RestockModal 
        isOpen={showRestockModal}
        onClose={() => setShowRestockModal(false)}
        criticalItems={criticalItems}
      />
    </div>
  );
}