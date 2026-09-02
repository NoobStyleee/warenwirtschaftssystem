'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, FileText, PlusCircle, Printer, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { InventoryItem } from '../../types/inventory';
import { Button } from '../ui/button/button';
import styles from './reports-view.module.css';

interface ReportHistoryItem {
  id: string;
  name: string;
  type: string;
  categoryFilter: string;
  format: 'PDF' | 'CSV' | 'Excel';
  createdDate: string;
  rawItems: InventoryItem[];
}

interface ReportsViewProps {
  items: InventoryItem[];
}

const LOCAL_STORAGE_KEY = 'inventory_generated_reports_v1';

export function ReportsView({ items }: ReportsViewProps) {
  const [reportType, setReportType] = useState('inventory-status');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [format, setFormat] = useState<'PDF' | 'CSV' | 'Excel'>('Excel');
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Kategorien aus Artikeln extrahieren
  const categories = Array.from(new Set(items.map((i) => i.category))).filter(Boolean);

  // 1. Berichte beim Start laden (erst API, Fallback auf LocalStorage)
  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetch('/api/reports');
        const contentType = res.headers.get('content-type');

        // Sicherstellen, dass die Antwort echtes JSON ist
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setHistory(data);
            // Backup in localStorage aktualisieren
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('API /api/reports nicht erreichbar, nutze LocalStorage Backup:', err);
      }

      // Fallback: Aus LocalStorage laden
      const savedLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedLocal) {
        try {
          setHistory(JSON.parse(savedLocal));
        } catch (e) {
          console.error('Fehler beim Lesen aus LocalStorage:', e);
        }
      }
      setLoading(false);
    };

    loadReports();
  }, []);

  // Filtern der Artikel
  const getFilteredItems = (type: string, category: string) => {
    let filtered = [...items];

    if (category !== 'ALL') {
      filtered = filtered.filter((i) => i.category === category);
    }

    if (type === 'low-stock') {
      filtered = filtered.filter((i) => i.stock <= i.minStock);
    }

    return filtered;
  };

  // Excel Generierung (.xlsx)
  const generateExcel = (dataItems: InventoryItem[], fileName: string) => {
    const totalStock = dataItems.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = dataItems.reduce((sum, item) => sum + item.stock * item.price, 0);

    const tableData = dataItems.map((item) => ({
      'SKU / Artikel-Nr.': item.sku,
      Name: item.name,
      Kategorie: item.category,
      'Bestand (Stk.)': item.stock,
      Mindestbestand: item.minStock,
      'Einzelpreis (€)': item.price,
      'Gesamtwert (€)': item.stock * item.price,
      Lagerort: item.location || '-',
    }));

    tableData.push({
      'SKU / Artikel-Nr.': 'GESAMTSUMME',
      Name: `${dataItems.length} Artikel`,
      Kategorie: '-',
      'Bestand (Stk.)': totalStock,
      Mindestbestand: 0,
      'Einzelpreis (€)': 0,
      'Gesamtwert (€)': totalValue,
      Lagerort: '-',
    });

    const worksheet = XLSX.utils.json_to_sheet(tableData);
    worksheet['!cols'] = [
      { wch: 18 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lagerbericht');
    XLSX.writeFile(workbook, fileName);
  };

  // CSV Generierung (.csv)
  const generateCSV = (dataItems: InventoryItem[], fileName: string) => {
    let csv = 'SKU;Name;Kategorie;Bestand;Mindestbestand;Einzelpreis Euro;Gesamtwert Euro;Lagerort\n';
    let totalStock = 0;
    let totalValue = 0;

    dataItems.forEach((item) => {
      const val = item.stock * item.price;
      totalStock += item.stock;
      totalValue += val;

      const priceStr = item.price.toFixed(2).replace('.', ',');
      const valStr = val.toFixed(2).replace('.', ',');

      csv += `${item.sku};${item.name};${item.category};${item.stock};${item.minStock};${priceStr};${valStr};${item.location || '-'}\n`;
    });

    csv += `GESAMTSUMME;${dataItems.length} Artikel;-;${totalStock};-;${totalValue.toFixed(2).replace('.', ',')};-\n`;

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Generierung
  const printPDF = (title: string, categoryName: string, dataItems: InventoryItem[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalStock = dataItems.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = dataItems.reduce((sum, item) => sum + item.stock * item.price, 0);

    const rowsHtml = dataItems
      .map(
        (item) => `
      <tr>
        <td><strong>${item.sku}</strong></td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td style="text-align: right;">${item.stock}</td>
        <td style="text-align: right;">${item.minStock}</td>
        <td style="text-align: right;">${item.price.toFixed(2).replace('.', ',')} €</td>
        <td style="text-align: right;"><strong>${(item.stock * item.price).toFixed(2).replace('.', ',')} €</strong></td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #0f172a; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; }
            h1 { font-size: 22px; margin: 0; color: #1e293b; }
            .meta { font-size: 13px; color: #64748b; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px; }
            th { background-color: #f1f5f9; text-align: left; font-weight: 600; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .total-row { background-color: #e2e8f0 !important; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Warenwirtschaftssystem - ${title}</h1>
            <div class="meta">
              Kategorie: <strong>${categoryName}</strong> | Erstellt am: ${new Date().toLocaleString('de-DE')}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Artikelname</th>
                <th>Kategorie</th>
                <th style="text-align: right;">Bestand</th>
                <th style="text-align: right;">Mindestst.</th>
                <th style="text-align: right;">Einzelpreis</th>
                <th style="text-align: right;">Gesamtwert</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="3">GESAMTSUMME (${dataItems.length} Artikel)</td>
                <td style="text-align: right;">${totalStock}</td>
                <td>-</td>
                <td>-</td>
                <td style="text-align: right;">${totalValue.toFixed(2).replace('.', ',')} €</td>
              </tr>
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Bericht erstellen und speichern
  const handleGenerateReport = async () => {
    const selectedItems = getFilteredItems(reportType, selectedCategory);
    const timestamp = new Date().toISOString().slice(0, 10);

    const typeLabel =
      reportType === 'inventory-status'
        ? 'Lagerbestand'
        : reportType === 'low-stock'
        ? 'Nachbestellungen'
        : 'Wertanalyse';

    const catLabel = selectedCategory === 'ALL' ? 'Alle_Kategorien' : selectedCategory.replace(/\s+/g, '_');
    const ext = format === 'Excel' ? 'xlsx' : format === 'CSV' ? 'csv' : 'pdf';
    const fileName = `${typeLabel}_${catLabel}_${timestamp}.${ext}`;

    // Datei herunterladen/öffnen
    if (format === 'PDF') {
      printPDF(typeLabel, selectedCategory === 'ALL' ? 'Alle Kategorien' : selectedCategory, selectedItems);
    } else if (format === 'Excel') {
      generateExcel(selectedItems, fileName);
    } else {
      generateCSV(selectedItems, fileName);
    }

    const newEntry: ReportHistoryItem = {
      id: Date.now().toString(),
      name: fileName,
      type: typeLabel,
      categoryFilter: selectedCategory === 'ALL' ? 'Alle Kategorien' : selectedCategory,
      format,
      createdDate: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }),
      rawItems: selectedItems,
    };

    // Im State und LocalStorage speichern
    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));

    // Versuchen im Backend zu speichern
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
    } catch (err) {
      console.warn('Hintergrund-Speicherung im Backend fehlgeschlagen (im LocalStorage gesichert):', err);
    }
  };

  // Löschen
  const handleDeleteReport = async (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistory));

    try {
      await fetch(`/api/reports?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend-Löschung fehlgeschlagen:', err);
    }
  };

  const handleReDownload = (item: ReportHistoryItem) => {
    if (item.format === 'PDF') {
      printPDF(item.type, item.categoryFilter, item.rawItems);
    } else if (item.format === 'Excel') {
      generateExcel(item.rawItems, item.name);
    } else {
      generateCSV(item.rawItems, item.name);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Berichte & Export</h2>

      {/* Formular */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <FileSpreadsheet className="h-6 w-6 text-blue-600" />
          <h3 className={styles.cardTitle}>Neuen Bericht Erstellen</h3>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>Berichtstyp</label>
            <select className={styles.select} value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="inventory-status">Gesamter Lagerbestand</option>
              <option value="low-stock">Kritischer Bestand / Nachbestellungen</option>
              <option value="value-analysis">Lagerwert-Analyse</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Kategorie-Filter</label>
            <select className={styles.select} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="ALL">Alle Kategorien</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Exportformat</label>
            <select className={styles.select} value={format} onChange={(e) => setFormat(e.target.value as any)}>
              <option value="Excel">Excel Arbeitsmappe (.xlsx)</option>
              <option value="CSV">CSV Datei (.csv)</option>
              <option value="PDF">PDF Druckansicht (.pdf)</option>
            </select>
          </div>
        </div>

        <Button variant="primary" onClick={handleGenerateReport}>
          {format === 'PDF' ? (
            <>
              <Printer className="h-4 w-4 mr-2" /> PDF Öffnen & Drucken
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" /> Bericht Generieren & Herunterladen
            </>
          )}
        </Button>
      </div>

      {/* Historie */}
      <h3 className={styles.title} style={{ fontSize: '1.125rem', marginTop: '1rem' }}>
        Generierte Berichte / Downloads
      </h3>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Dateiname</th>
              <th>Typ</th>
              <th>Kategorie</th>
              <th>Format</th>
              <th>Erstellt am</th>
              <th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                  Lade Historie...
                </td>
              </tr>
            ) : history.length > 0 ? (
              history.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText className="h-4 w-4 text-slate-400" />
                      {item.name}
                    </div>
                  </td>
                  <td>{item.type}</td>
                  <td>{item.categoryFilter}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        item.format === 'PDF'
                          ? styles.badgePdf
                          : item.format === 'CSV'
                          ? styles.badgeCsv
                          : styles.badgeExcel
                      }`}
                    >
                      {item.format}
                    </span>
                  </td>
                  <td>{item.createdDate}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className={styles.downloadBtn} onClick={() => handleReDownload(item)}>
                        {item.format === 'PDF' ? (
                          <>
                            <Printer className="h-4 w-4" /> Drucken
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" /> Download
                          </>
                        )}
                      </button>
                      <button
                        className={styles.downloadBtn}
                        style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => handleDeleteReport(item.id)}
                        title="Bericht aus Historie löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Noch keine Berichte generiert. Wähle oben Einstellungen aus und klicke auf Generieren.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}