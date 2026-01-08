import HeroBanner from '@/components/home/HeroBanner';
import CategoryProductGrid from '@/components/home/CategoryProductGrid';
import { medusa, Product } from '@/lib/medusa';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import CategoryCarousel from '@/components/home/CategoryCarousel';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PopularProducts from '@/components/home/PopularProducts';

// Force dynamic rendering - don't pre-render at build time
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch all data in parallel on the server - single round trip
  let categories: any[] = [];
  let allProducts: Product[] = [];

  try {
    const [categoriesResult, productsResult] = await Promise.all([
      medusa.getCategories(),
      medusa.getProducts({ limit: 200 }),
    ]);

    categories = categoriesResult?.product_categories || [];
    allProducts = productsResult?.products || [];

    console.log('[Home] Categories:', categories.length);
    console.log('[Home] Products:', allProducts.length);
    console.log('[Home] Sample product categories:', allProducts[0]?.categories);
  } catch (error) {
    console.error('[Home] Failed to fetch data:', error);
    // Continue with empty data - page will still render
  }

  return (
    <>
      <HeroBanner />
      <CategoryCarousel categories={categories} products={allProducts} />
      <FeaturedProducts />

      {/* Dynamic Category Sections - pass filtered products */}
      {categories.map((category) => {
        const categoryProducts = allProducts.filter(p =>
          p.categories?.some(c => c.id === category.id)
        );
        return (
          <CategoryProductGrid
            key={category.id}
            category={category}
            products={categoryProducts}
          />
        );
      })}

      <PopularProducts />
    </>
  );
}
