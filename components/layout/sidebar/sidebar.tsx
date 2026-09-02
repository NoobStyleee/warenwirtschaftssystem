'use client';

import React from 'react';
import { Package, Boxes, FileSpreadsheet, Settings } from 'lucide-react';
import styles from './sidebar.module.css';

interface SidebarProps {
  activeTab: 'inventory' | 'categories' | 'reports';
  setActiveTab: (tab: 'inventory' | 'categories' | 'reports') => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <button
          type="button"
          className={`${styles.link} ${activeTab === 'inventory' ? styles.linkActive : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Package className={styles.icon} />
          <span>Lagerbestand</span>
        </button>

        <button
          type="button"
          className={`${styles.link} ${activeTab === 'categories' ? styles.linkActive : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <Boxes className={styles.icon} />
          <span>Kategorien</span>
        </button>

        <button
          type="button"
          className={`${styles.link} ${activeTab === 'reports' ? styles.linkActive : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileSpreadsheet className={styles.icon} />
          <span>Berichte & Export</span>
        </button>

        <button
          type="button"
          className={styles.link}
          onClick={() => alert('Einstellungen werden in Kürze verfügbar sein.')}
        >
          <Settings className={styles.icon} />
          <span>Einstellungen</span>
        </button>
      </nav>
    </aside>
  );
}