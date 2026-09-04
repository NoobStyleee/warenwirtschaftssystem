import { NextResponse } from 'next/server';
import { db } from '../../../lib/db'; // Achte darauf, dass dieser Importpfad zu deiner db.ts/prisma-Client-Datei passt

export async function GET() {
  try {
    const reports = await db.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Fehler beim Laden der Berichte:', error);
    return NextResponse.json({ error: 'Fehler beim Laden' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    await db.report.create({
      data: {
        id: body.id,
        name: body.name,
        type: body.type,
        supplierFilter: body.supplierFilter,
        format: body.format,
        createdDate: body.createdDate,
        rawItems: body.rawItems,
      },
    });

    const reports = await db.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reports, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    return NextResponse.json({ error: 'Fehler beim Speichern' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID fehlt' }, { status: 400 });
    }

    await db.report.delete({
      where: { id },
    });

    const reports = await db.report.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
  }
}