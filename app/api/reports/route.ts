import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Einheitlicher Pfad zur JSON-Datei im data-Ordner
const reportsFilePath = path.join(process.cwd(), 'data', 'reports.json');

function ensureDataFile() {
  const dirPath = path.dirname(reportsFilePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (!fs.existsSync(reportsFilePath)) {
    fs.writeFileSync(reportsFilePath, JSON.stringify([]), 'utf8');
  }
}

function getReports() {
  try {
    ensureDataFile();
    const fileData = fs.readFileSync(reportsFilePath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Fehler beim Lesen der Berichte:', error);
    return [];
  }
}

function saveReports(reports: any[]) {
  try {
    ensureDataFile();
    fs.writeFileSync(reportsFilePath, JSON.stringify(reports, null, 2), 'utf8');
  } catch (error) {
    console.error('Fehler beim Schreiben der Berichte:', error);
  }
}

export async function GET() {
  const reports = getReports();
  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  try {
    const newReport = await req.json();
    const reports = getReports();
    const updated = [newReport, ...reports];
    saveReports(updated);
    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
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
    let reports = getReports();
    reports = reports.filter((r: any) => r.id !== id);
    saveReports(reports);
    return NextResponse.json(reports); // Gibt direkt die aktualisierte Liste zurück
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
  }
}