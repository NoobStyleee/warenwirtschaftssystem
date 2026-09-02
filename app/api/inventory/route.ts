import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

// GET: Alle Artikel abrufen
export async function GET() {
  try {
    const items = await db.item.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Laden der Artikel' }, { status: 500 });
  }
}

// POST: Neuen Artikel anlegen
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newItem = await db.item.create({
      data: {
        sku: body.sku,
        name: body.name,
        category: body.category,
        stock: Number(body.stock),
        minStock: Number(body.minStock),
        price: parseFloat(body.price),
        location: body.location || null,
      },
    });
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Erstellen des Artikels' }, { status: 500 });
  }
}

// PUT: Artikel aktualisieren oder Bestand anpassen (+ / -)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updatedItem = await db.item.update({
      where: { id },
      data,
    });
    return NextResponse.json(updatedItem);
  } catch (error) {
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

    await db.item.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Löschen des Artikels' }, { status: 500 });
  }
}