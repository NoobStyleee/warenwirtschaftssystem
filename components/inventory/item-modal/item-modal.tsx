'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/button/button';
import { InventoryItem } from '../../../types/inventory';
import styles from './item-modal.module.css';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: InventoryItem | null;
  onSave: (item: any) => void;
}

export function ItemModal({ isOpen, onClose, initialData, onSave }: ItemModalProps) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'Motoren',
    stock: 0,
    minStock: 5,
    price: 0,
    location: '',
    text: '',
  });

  // Refs
  const mouseDownTargetRef = useRef<EventTarget | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Formular-Daten bei Öffnen oder initialData-Änderung füllen
  useEffect(() => {
    if (initialData) {
      setFormData({
        sku: initialData.sku || '',
        name: initialData.name || '',
        category: initialData.category || 'Motoren',
        stock: initialData.stock || 0,
        minStock: initialData.minStock || 5,
        price: initialData.price || 0,
        location: initialData.location || '',
        text: initialData.text || '',
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        category: 'Motoren',
        stock: 0,
        minStock: 5,
        price: 0,
        location: '',
        text: '',
      });
    }
  }, [initialData, isOpen]);

  // Schließen bei ESC-Taste
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Funktion zum automatischen Anpassen der Texthöhe
  const adjustHeight = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  // Höhe initial / bei Textänderung anpassen
  useEffect(() => {
    adjustHeight(textareaRef.current);
  }, [formData.text, isOpen]);

  // WICHTIG: Alle Hooks müssen VOR diesem Return stehen!
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(initialData ? { ...formData, id: initialData.id } : formData);
    onClose();
  };

  // Overlay-Klick-Logik (Mousedown & Mouseup)
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseDownTargetRef.current = e.target;
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      mouseDownTargetRef.current === e.currentTarget &&
      e.target === e.currentTarget
    ) {
      onClose();
    }
    mouseDownTargetRef.current = null;
  };

  return (
    <div
      className={styles.overlay}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {initialData ? 'Artikel bearbeiten' : 'Neuen Artikel anlegen'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>SKU / Artikel-Nr.</label>
              <input
                required
                type="text"
                className={styles.input}
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Kategorie</label>
              <input
                required
                type="text"
                className={styles.input}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Artikelbezeichnung</label>
            <input
              required
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Bestand</label>
              <input
                required
                type="number"
                min="0"
                className={styles.input}
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Mindestbestand</label>
              <input
                required
                type="number"
                min="0"
                className={styles.input}
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>Einzelpreis (€)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className={styles.input}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Lagerort</label>
              <input
                type="text"
                className={styles.input}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          {/* Zusätzliches Textfeld für Notizen */}
          <div className={styles.field}>
            <label className={styles.label}>Zusätzlicher Text / Notizen</label>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              rows={1}
              value={formData.text}
              onChange={(e) => {
                setFormData({ ...formData, text: e.target.value });
                adjustHeight(e.target);
              }}
              placeholder="Hier kannst du beliebigen Text eingeben..."
            />
          </div>

          <div className={styles.actions}>
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" variant="primary">
              Speichern
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}