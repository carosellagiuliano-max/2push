'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { CartButton } from '@/features/shop'
import type { ProductCategory } from '@/features/shop'

interface CategoryFilterProps {
  categories: ProductCategory[]
  currentCategory?: string
}

export function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
  return (
    <section className="py-8 bg-white border-b sticky top-16 z-40">
      <div className="container-wide">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = currentCategory === category.slug || (!currentCategory && category.slug === 'all')
              return (
                <Link
                  key={category.id}
                  href={category.slug === 'all' ? '/shop' : `/shop?category=${category.slug}`}
                >
                  <Badge
                    variant={isActive ? 'default' : 'outline'}
                    className="cursor-pointer px-4 py-2 text-sm hover:bg-brand-50"
                  >
                    {category.name}
                  </Badge>
                </Link>
              )
            })}
          </div>
          <CartButton />
        </div>
      </div>
    </section>
  )
}
