export interface InventoryItem {
  id?: string;
  sku: string;          // z. B. "MOT-001" oder "GEW-M8"
  name: string;         // z. B. "Gewindestange M8"
  category: string;     // z. B. "Befestigung", "Motoren", "Bänder", "Röllchen"
  stock: number;        // Aktueller Bestand
  minStock: number;     // Mindestbestand (Lagerwarnung wenn stock <= minStock)
  price: number;        // Einzelpreis in Euro
  location?: string;    // Optional: z. B. "Regal A2"
  supplier?: string;
  text?: string;        // Optional: Zusätzliche Beschreibung oder Text
  createdAt: Date;
  updatedAt: Date;
}

export type CreateItemInput = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateItemInput = Partial<CreateItemInput>;