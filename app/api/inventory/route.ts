import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

// GET: Alle Artikel abrufen (alphabetisch nach Name sortiert)
export async function GET() {
  try {
    const items = await db.item.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/inventory Error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Artikel' }, { status: 500 });
  }
}

// POST: Neuen Artikel anlegen
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.sku || !body.name) {
      return NextResponse.json({ error: 'SKU und Name sind erforderlich' }, { status: 400 });
    }

    const newItem = await db.item.create({
      data: {
        sku: String(body.sku),
        name: String(body.name),
        category: String(body.category || 'Allgemein'),
        supplier: body.supplier ? String(body.supplier) : null,
        stock: Number(body.stock) || 0,
        minStock: Number(body.minStock) || 0,
        price: parseFloat(body.price) || 0,
        location: body.location ? String(body.location) : null,
        text: body.text ? String(body.text) : null,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('POST /api/inventory Error:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des Artikels' }, { status: 500 });
  }
}

// PUT: Artikel aktualisieren (Inklusive Supplier & Text-Feld)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID erforderlich' }, { status: 400 });
    }

    const updateData: Record<string, any> = {};

    if (data.sku !== undefined) updateData.sku = String(data.sku);
    if (data.name !== undefined) updateData.name = String(data.name);
    if (data.category !== undefined) updateData.category = String(data.category);
    if (data.supplier !== undefined) {
      updateData.supplier = data.supplier ? String(data.supplier) : null;
    }
    if (data.stock !== undefined) updateData.stock = Number(data.stock);
    if (data.minStock !== undefined) updateData.minStock = Number(data.minStock);
    if (data.price !== undefined) updateData.price = parseFloat(data.price);
    if (data.location !== undefined) updateData.location = data.location ? String(data.location) : null;  
    
    if (data.text !== undefined) {
      updateData.text = data.text ? String(data.text) : null;
    }

    const updatedItem = await db.item.update({
      where: { id: String(id) },
      data: updateData,
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('PUT /api/inventory Error:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Artikels' }, { status: 500 });
  }
}

// DELETE: Artikel löschen
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID erforderlich' }, { status: 400 });
    }
    
    await db.item.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/inventory Error:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen des Artikels' }, { status: 500 });
  }
}