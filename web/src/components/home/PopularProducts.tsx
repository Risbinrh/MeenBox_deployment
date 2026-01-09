'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import FreshCatchCard from '@/components/product/FreshCatchCard';
import { medusa, Product } from '@/lib/medusa';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

export default function PopularProducts() {
  const { language } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products with offset to get different products than FeaturedProducts
        const { products } = await medusa.getProducts({ limit: 4, offset: 4 });
        setProducts(products);
      } catch {
        // Error handled silently
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] rounded-xs" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0097a7]">{t('popularThisWeek', language)}</h2>
            <p className="text-sm text-muted-foreground">{t('mostOrderedByCustomers', language)}</p>
          </div>
          <Link
            href="/products?sort=popular"
            className="flex items-center gap-1 text-sm font-bold text-[#00bcd4]"
          >
            {t('viewAll', language)}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <FreshCatchCard key={product.id} product={product} variant="centered" />
          ))}
        </div>
      </div>
    </section>
  );
}
