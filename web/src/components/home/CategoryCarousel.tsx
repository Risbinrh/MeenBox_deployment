'use client';

import { memo, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import { Product, ProductCategory } from '@/lib/medusa';

interface CategoryCarouselProps {
  categories: ProductCategory[];
  products: Product[];
}

function CategoryCarousel({ categories, products }: CategoryCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

  // Build category images map from products prop
  const categoryImages = useMemo(() => {
    const imageMap: Record<string, string> = {};
    categories.forEach((category) => {
      const categoryProduct = products.find(p =>
        p.categories?.some(c => c.id === category.id)
      );
      if (categoryProduct?.thumbnail) {
        imageMap[category.handle] = categoryProduct.thumbnail;
      }
    });
    return imageMap;
  }, [categories, products]);

  const getCategoryImage = (handle: string) => {
    if (categoryImages[handle]) {
      return categoryImages[handle];
    }

    // Fallback dictionary for immediate display
    const defaultImages: Record<string, string> = {
      'sea-fish-premium': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop',
      'sea-fish-regular': 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=200&h=200&fit=crop',
      'prawns': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=200&h=200&fit=crop',
      'crabs': 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=200&h=200&fit=crop',
      'squid': 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=200&h=200&fit=crop',
      'river-fish': 'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=200&h=200&fit=crop',
      'dried-fish': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&h=200&fit=crop',
    };

    return defaultImages[handle] || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop';
  };

  if (categories.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#b18b5e] mb-1">{t('shopByCategory', language)}</h2>
            <p className="text-sm text-muted-foreground">{t('freshCatchFromEveryCategory', language)}</p>
          </div>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 justify-items-center">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.handle}`}
              className="group block"
            >
              <div className="w-32 sm:w-40 group cursor-pointer">
                <div className="relative aspect-square rounded-full overflow-hidden mb-4 transition-all duration-300 group-hover:-translate-y-1" style={{ backgroundColor: '#F5F2E8' }}>
                  <div className="absolute inset-0 p-3">
                    <div className="relative w-full h-full">
                      <Image
                        src={getCategoryImage(category.handle)}
                        alt={category.name}
                        fill
                        className="object-contain transition-transform duration-500 group-hover:scale-120"
                      />
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-[#b18b5e] transition-colors">
                    {language === 'ta' && typeof category.metadata?.tamil_name === 'string'
                      ? category.metadata.tamil_name
                      : category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default memo(CategoryCarousel);
