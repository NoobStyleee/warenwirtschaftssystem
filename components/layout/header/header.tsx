'use client';

import React, { useState, useEffect } from 'react';
import { Package, Sun, Moon } from 'lucide-react';
import styles from './header.module.css';

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialen Theme-Status beim Laden prüfen/setzen
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Theme umschalten
  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <Package className="h-6 w-6" />
        </div>
        <div>
          <h1 className={styles.title}>Warenwirtschaftssystem</h1>
          <p className={styles.subtitle}>Lokale Lagerverwaltung</p>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          title={isDarkMode ? 'Helles Design aktivieren' : 'Dunkles Design aktivieren'}
          type="button"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}