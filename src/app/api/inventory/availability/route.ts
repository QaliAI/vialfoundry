import { NextResponse } from 'next/server';
import { createRouteClient } from '../../../../lib/supabase/route';
import { PRODUCTS } from '../../../../data/products';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface InventoryItemAvailability {
  inStock: boolean;
  stockCount: number;
  active: boolean;
}

export async function GET() {
  const inventory: Record<string, InventoryItemAvailability> = {};

  // Initialize with fallback static catalog values
  for (const product of PRODUCTS) {
    const isAvailable = product.inStock && product.stockCount > 0;
    const item: InventoryItemAvailability = {
      inStock: isAvailable,
      stockCount: product.stockCount,
      active: true,
    };
    inventory[product.id] = item;
    inventory[product.sku] = item;
  }

  try {
    const supabase = createRouteClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('id, sku, active, inventory_quantity');

      if (!error && Array.isArray(data) && data.length > 0) {
        for (const row of data) {
          const qty = typeof row.inventory_quantity === 'number' ? row.inventory_quantity : 0;
          const isActive = row.active !== false;
          const inStock = isActive && qty > 0;
          const availability: InventoryItemAvailability = {
            inStock,
            stockCount: qty,
            active: isActive,
          };
          if (row.id) inventory[row.id] = availability;
          if (row.sku) inventory[row.sku] = availability;
        }
      }
    }
  } catch (err) {
    console.error('[inventory/availability] error fetching live stock, using fallback:', err);
  }

  return NextResponse.json(
    {
      success: true,
      timestamp: Date.now(),
      inventory,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    }
  );
}
