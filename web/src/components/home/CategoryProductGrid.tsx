'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import FreshCatchCard from '@/components/product/FreshCatchCard';
import { Product, ProductCategory } from '@/lib/medusa';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

interface CategoryProductGridProps {
    category: ProductCategory;
    products: Product[];
}

function CategoryProductGrid({ category, products }: CategoryProductGridProps) {
    if (products.length === 0) return null;
    const { language } = useLanguage();

    return (
        <section className="bg-white">
            <div className="container mx-auto px-4">
                <div className="py-12 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-[#0097a7]">
                                {language === 'ta' && typeof category.metadata?.tamil_name === 'string'
                                    ? category.metadata.tamil_name
                                    : category.name}
                            </h2>
                            {category.description && (
                                <p className="text-base text-muted-foreground mt-1 font-medium">{category.description}</p>
                            )}
                        </div>
                        <Link
                            href={`/products?category=${category.handle}`}
                            className="flex items-center gap-1 text-sm font-bold text-[#00bcd4]"
                        >
                            {t('viewAll', language)}
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <FreshCatchCard
                                key={product.id}
                                product={product}
                                variant="centered"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default memo(CategoryProductGrid);
