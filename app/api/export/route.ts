import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { InventoryItem } from '../../../types/inventory';
import * as XLSX from 'xlsx';

export async function GET() {
  try {
    const items = await db.item.findMany();

    // Daten für Excel aufbereiten
    const excelData = items.map((item: InventoryItem) => ({
      'Artikel-Nr. (SKU)': item.sku,
      Name: item.name,
      Kategorie: item.category,
      Bestand: item.stock,
      Mindestbestand: item.minStock,
      'Einzelpreis (€)': item.price,
      'Gesamtwert (€)': item.stock * item.price,
      Lagerort: item.location || '-',
      Status: item.stock <= item.minStock ? 'KRITISCH / NACHBESTELLEN' : 'OK',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lagerbestand');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Lagerbestand_Export.xlsx"',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Exportieren' }, { status: 500 });
  }
}