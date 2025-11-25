'use server'

import type { Product, ProductCategory } from '../types'

// Mock product data - replace with DB queries when tables exist
const mockProducts: Product[] = [
  {
    id: '1',
    salon_id: 'salon-1',
    name: 'Repair Shampoo',
    slug: 'repair-shampoo',
    description: 'Intensiv reparierendes Shampoo für strapaziertes Haar. Enthält Keratin und Arganöl für tiefe Pflege und Glanz.',
    brand: 'Kérastase',
    category: 'pflege',
    price: 32,
    compare_at_price: null,
    stock_quantity: 15,
    sku: 'KER-REP-001',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    salon_id: 'salon-1',
    name: 'Haaröl Luxe',
    slug: 'haaroel-luxe',
    description: 'Pflegendes Haaröl für Glanz und Geschmeidigkeit. Schützt vor Hitze und verleiht seidigen Glanz.',
    brand: 'Olaplex',
    category: 'pflege',
    price: 45,
    compare_at_price: 52,
    stock_quantity: 8,
    sku: 'OLA-OIL-001',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    salon_id: 'salon-1',
    name: 'Styling Paste',
    slug: 'styling-paste',
    description: 'Flexible Styling-Paste mit mattem Finish. Für natürliche Looks mit starkem Halt.',
    brand: 'Kevin Murphy',
    category: 'styling',
    price: 38,
    compare_at_price: null,
    stock_quantity: 12,
    sku: 'KM-PASTE-001',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    salon_id: 'salon-1',
    name: 'Color Protect Spray',
    slug: 'color-protect-spray',
    description: 'Schützt coloriertes Haar vor dem Ausbleichen. Mit UV-Filter und Antioxidantien.',
    brand: 'Aveda',
    category: 'color',
    price: 28,
    compare_at_price: null,
    stock_quantity: 20,
    sku: 'AVE-COL-001',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    salon_id: 'salon-1',
    name: 'Deep Conditioner',
    slug: 'deep-conditioner',
    description: 'Tiefenpflege-Maske für intensives Repair. Ideal für trockenes und strapaziertes Haar.',
    brand: 'Kérastase',
    category: 'pflege',
    price: 42,
    compare_at_price: 48,
    stock_quantity: 10,
    sku: 'KER-COND-001',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    salon_id: 'salon-1',
    name: 'Volume Mousse',
    slug: 'volume-mousse',
    description: 'Leichter Schaum für voluminöses Styling. Beschwert nicht und gibt Fülle.',
    brand: 'Kevin Murphy',
    category: 'styling',
    price: 29,
    compare_at_price: null,
    stock_quantity: 18,
    sku: 'KM-MOUSSE-001',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    salon_id: 'salon-1',
    name: 'Silber Shampoo',
    slug: 'silber-shampoo',
    description: 'Anti-Gelbstich Shampoo für blondes und graues Haar. Neutralisiert unerwünschte Gelbtöne.',
    brand: 'Fanola',
    category: 'color',
    price: 18,
    compare_at_price: null,
    stock_quantity: 25,
    sku: 'FAN-SIL-001',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    salon_id: 'salon-1',
    name: 'Hitzeschutz Spray',
    slug: 'hitzeschutz-spray',
    description: 'Schützt das Haar vor Hitze bis 230°C. Für Föhn, Glätteisen und Lockenstab.',
    brand: 'ghd',
    category: 'styling',
    price: 24,
    compare_at_price: null,
    stock_quantity: 22,
    sku: 'GHD-HEAT-001',
    image_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockCategories: ProductCategory[] = [
  { id: 'all', name: 'Alle Produkte', slug: 'all' },
  { id: 'pflege', name: 'Haarpflege', slug: 'pflege' },
  { id: 'styling', name: 'Styling', slug: 'styling' },
  { id: 'color', name: 'Colorschutz', slug: 'color' },
]

export async function getProducts(options?: {
  category?: string
  search?: string
  limit?: number
}): Promise<Product[]> {
  // Simulate DB query
  let products = mockProducts.filter((p) => p.is_active)

  if (options?.category && options.category !== 'all') {
    products = products.filter((p) => p.category === options.category)
  }

  if (options?.search) {
    const searchLower = options.search.toLowerCase()
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.brand?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
    )
  }

  if (options?.limit) {
    products = products.slice(0, options.limit)
  }

  return products
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = mockProducts.find((p) => p.slug === slug && p.is_active)
  return product || null
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = mockProducts.find((p) => p.id === id && p.is_active)
  return product || null
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  return mockCategories
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  return mockProducts.filter((p) => p.is_active).slice(0, limit)
}
