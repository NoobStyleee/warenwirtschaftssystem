'use client';

import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, FileText, PlusCircle, Printer, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { InventoryItem } from '../../types/inventory';
import { Button } from '../ui/button/button';
import styles from './reports-view.module.css';

interface ReportHistoryItem {
  id: string;
  name: string;
  type: string;
  supplierFilter: string;
  format: 'PDF' | 'CSV' | 'Excel';
  createdDate: string;
  rawItems: InventoryItem[];
}

interface ReportsViewProps {
  items: InventoryItem[];
}

const ITEMS_PER_PAGE = 10;

export function ReportsView({ items }: ReportsViewProps) {
  const [reportType, setReportType] = useState('inventory-status');
  const [selectedSupplier, setSelectedSupplier] = useState('ALL');
  const [format, setFormat] = useState<'PDF' | 'CSV' | 'Excel'>('Excel');
  const [history, setHistory] = useState<ReportHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const suppliers = Array.from(new Set(items.map((i) => i.supplier))).filter(Boolean) as string[];

  // 1. Berichte vom Server laden
  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setHistory(data);
          }
        }
      } catch (err) {
        console.warn('Fehler beim Laden der Berichte vom Server:', err);
      }
      setLoading(false);
    };

    loadReports();
  }, []);

  const getFilteredItems = (type: string, supplier: string) => {
    let filtered = [...items];
    if (supplier !== 'ALL') {
      filtered = filtered.filter((i) => (i.supplier || 'Kein Lieferant') === supplier);
    }
    if (type === 'low-stock') {
      filtered = filtered.filter((i) => i.stock <= i.minStock);
    }
    return filtered;
  };

  const createTableRows = (dataItems: InventoryItem[]) => {
    const totalStock = dataItems.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = dataItems.reduce((sum, item) => sum + item.stock * item.price, 0);

    const tableData = dataItems.map((item) => ({
      'SKU / Artikel-Nr.': item.sku,
      Name: item.name,
      Kategorie: item.category || 'Unkategorisiert',
      Lieferant: item.supplier || 'Kein Lieferant',
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
      Lieferant: '-',
      'Bestand (Stk.)': totalStock,
      Mindestbestand: 0,
      'Einzelpreis (€)': 0,
      'Gesamtwert (€)': totalValue,
      Lagerort: '-',
    });

    return tableData;
  };

  const standardCols = [
    { wch: 18 }, { wch: 25 }, { wch: 16 }, { wch: 16 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
  ];

  const generateExcel = (dataItems: InventoryItem[], fileName: string, supplierFilter: string) => {
    const workbook = XLSX.utils.book_new();

    if (supplierFilter === 'ALL') {
      const summaryData = createTableRows(items);
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      summarySheet['!cols'] = standardCols;
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Gesamtübersicht');

      suppliers.forEach((sup) => {
        const supItems = items.filter((i) => (i.supplier || 'Kein Lieferant') === sup);
        if (supItems.length > 0) {
          const supData = createTableRows(supItems);
          const supSheet = XLSX.utils.json_to_sheet(supData);
          supSheet['!cols'] = standardCols;
          const safeSheetName = sup.replace(/[:\\/?*\[\]]/g, '_').substring(0, 31);
          XLSX.utils.book_append_sheet(workbook, supSheet, safeSheetName);
        }
      });
    } else {
      const sheetData = createTableRows(dataItems);
      const worksheet = XLSX.utils.json_to_sheet(sheetData);
      worksheet['!cols'] = standardCols;
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Lieferantenbericht');
    }

    XLSX.writeFile(workbook, fileName);
  };

  const generateCSV = (dataItems: InventoryItem[], fileName: string) => {
    let csv = 'SKU;Name;Kategorie;Lieferant;Bestand;Mindestbestand;Einzelpreis Euro;Gesamtwert Euro;Lagerort\n';
    let totalStock = 0;
    let totalValue = 0;

    dataItems.forEach((item) => {
      const val = item.stock * item.price;
      totalStock += item.stock;
      totalValue += val;
      csv += `${item.sku};${item.name};${item.category || 'Unkategorisiert'};${item.supplier || 'Kein Lieferant'};${item.stock};${item.minStock};${item.price.toFixed(2).replace('.', ',')};${val.toFixed(2).replace('.', ',')};${item.location || '-'}\n`;
    });

    csv += `GESAMTSUMME;${dataItems.length} Artikel;-;-;${totalStock};-;${totalValue.toFixed(2).replace('.', ',')};-\n`;

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printPDF = (title: string, supplierName: string, dataItems: InventoryItem[]) => {
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
        <td>${item.category || '-'}</td>
        <td>${item.supplier || '-'}</td>
        <td style="text-align: right;">${item.stock}</td>
        <td style="text-align: right;">${item.minStock}</td>
        <td style="text-align: right;">${item.price.toFixed(2).replace('.', ',')} €</td>
        <td style="text-align: right;"><strong>${(item.stock * item.price).toFixed(2).replace('.', ',')} €</strong></td>
        <td>${item.location || '-'}</td>
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
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; }
            th { background-color: #f1f5f9; text-align: left; font-weight: 600; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .total-row { background-color: #e2e8f0 !important; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Warenwirtschaftssystem - ${title}</h1>
            <div class="meta">
              Lieferanten-Filter: <strong>${supplierName}</strong> | Erstellt am: ${new Date().toLocaleString('de-DE')}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Artikelname</th>
                <th>Kategorie</th>
                <th>Lieferant</th>
                <th style="text-align: right;">Bestand</th>
                <th style="text-align: right;">Mindestst.</th>
                <th style="text-align: right;">Einzelpreis</th>
                <th style="text-align: right;">Gesamtwert</th>
                <th>Lagerort</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="4">GESAMTSUMME (${dataItems.length} Artikel)</td>
                <td style="text-align: right;">${totalStock}</td>
                <td>-</td>
                <td>-</td>
                <td style="text-align: right;">${totalValue.toFixed(2).replace('.', ',')} €</td>
                <td>-</td>
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

  const handleGenerateReport = async () => {
    const selectedItems = getFilteredItems(reportType, selectedSupplier);
    const timestamp = new Date().toISOString().slice(0, 10);

    const typeLabel =
      reportType === 'inventory-status'
        ? 'Lagerbestand'
        : reportType === 'low-stock'
        ? 'Nachbestellungen'
        : 'Wertanalyse';

    const supLabel = selectedSupplier === 'ALL' ? 'Alle_Lieferanten' : selectedSupplier.replace(/\s+/g, '_');
    const ext = format === 'Excel' ? 'xlsx' : format === 'CSV' ? 'csv' : 'pdf';
    const fileName = `${typeLabel}_${supLabel}_${timestamp}.${ext}`;

    if (format === 'PDF') {
      printPDF(typeLabel, selectedSupplier === 'ALL' ? 'Alle Lieferanten' : selectedSupplier, selectedItems);
    } else if (format === 'Excel') {
      generateExcel(selectedItems, fileName, selectedSupplier);
    } else {
      generateCSV(selectedItems, fileName);
    }

    const newEntry: ReportHistoryItem = {
      id: Date.now().toString(),
      name: fileName,
      type: typeLabel,
      supplierFilter: selectedSupplier === 'ALL' ? 'Alle Lieferanten' : selectedSupplier,
      format,
      createdDate: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }),
      rawItems: selectedItems,
    };

    // An Server senden, damit es dort dauerhaft gespeichert wird
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      });
      if (res.ok) {
        const savedData = await res.json();
        setHistory(savedData); // Aktualisierte Liste vom Server holen
      } else {
        setHistory([newEntry, ...history]);
      }
    } catch (err) {
      console.warn('Speichern auf Server fehlgeschlagen:', err);
      setHistory([newEntry, ...history]);
    }
    setCurrentPage(1);
  };

  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/reports?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = await res.json();
        setHistory(updated);
      } else {
        setHistory(history.filter((item) => item.id !== id));
      }
    } catch (err) {
      setHistory(history.filter((item) => item.id !== id));
    }
  };

  const handleReDownload = (item: ReportHistoryItem) => {
    if (item.format === 'PDF') {
      printPDF(item.type, item.supplierFilter, item.rawItems);
    } else if (item.format === 'Excel') {
      generateExcel(item.rawItems, item.name, selectedSupplier);
    } else {
      generateCSV(item.rawItems, item.name);
    }
  };

  // Pagination Berechnungen
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = history.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Berichte & Export</h2>

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
            <label className={styles.label}>Lieferanten-Filter (für Auswahl)</label>
            <select className={styles.select} value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)}>
              <option value="ALL">Alle Lieferanten (Multi-Tab Excel)</option>
              {suppliers.map((sup) => (
                <option key={sup} value={sup}>
                  {sup}
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <h3 className={styles.title} style={{ fontSize: '1.125rem', margin: 0 }}>
          Generierte Berichte / Downloads ({history.length})
        </h3>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Dateiname</th>
              <th>Typ</th>
              <th>Lieferanten-Filter</th>
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
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText className="h-4 w-4 text-slate-400" />
                      {item.name}
                    </div>
                  </td>
                  <td>{item.type}</td>
                  <td>{item.supplierFilter}</td>
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button
            className={styles.downloadBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            <ChevronLeft className="h-4 w-4" /> Zurück
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Seite {currentPage} von {totalPages}
          </span>
          <button
            className={styles.downloadBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Weiter <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}