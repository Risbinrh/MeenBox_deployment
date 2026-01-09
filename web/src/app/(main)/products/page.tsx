'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Grid3X3,
  LayoutList,
  Fish,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowUpDown,
  X,
  ChevronRight,
  Filter,
  Loader2,
  Waves,
  Shell,
  Anchor,
  Droplets,
  Sun,
  LayoutGrid,
  Shrimp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import FreshCatchCard from '@/components/product/FreshCatchCard';
import { medusa, Product, ProductCategory } from '@/lib/medusa';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { language } = useLanguage();
  const [filterOpen, setFilterOpen] = useState(false);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    router.push('/products');
  };

  const clearSearch = () => {
    clearAllFilters(); // Clear both search and category filters
  };

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { product_categories } = await medusa.getCategories();
        setCategories(product_categories);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    // Wait for categories to load before filtering by category
    if (selectedCategory !== 'all' && categories.length === 0) {
      return; // Will re-run when categories load
    }

    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        // Find category id from handle
        let categoryIds: string[] | undefined;
        if (selectedCategory !== 'all') {
          const category = categories.find(c => c.handle === selectedCategory);
          if (category) {
            categoryIds = [category.id];
          }
        }

        const { products } = await medusa.getProducts({
          limit: 50,
          category_id: categoryIds,
          q: searchQuery || undefined,
        });
        setProducts(products);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, categories, searchQuery]);

  // Update selected category when URL param changes
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Sort products client-side
  // Helper to get product price (supports both Medusa v1 and v2)
  const getProductPrice = (product: Product): number => {
    const variant = product.variants?.[0];
    if (!variant) return 0;
    // Medusa v2: calculated_price
    if (variant.calculated_price?.calculated_amount) {
      return variant.calculated_price.calculated_amount;
    }
    // Medusa v1 fallback: prices array
    return variant.prices?.[0]?.amount || 0;
  };

  const sortedProducts = [...products].sort((a, b) => {
    const priceA = getProductPrice(a);
    const priceB = getProductPrice(b);

    switch (sortBy) {
      case 'price-low':
        return priceA - priceB;
      case 'price-high':
        return priceB - priceA;
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'popular':
      default:
        return 0;
    }
  });

  const ProductSkeleton = () => (
    <div className="bg-white rounded-xs overflow-hidden">
      <Skeleton className="aspect-square" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-11 w-full rounded-xs" />
      </div>
    </div>
  );

  const handleCategorySelect = (handle: string) => {
    setSelectedCategory(handle);
    setFilterOpen(false); // Close mobile filter sheet
  };

  const getCategoryIcon = (name: string | null) => {
    if (!name) return <LayoutGrid className="h-4 w-4" />;

    const lowerName = name.toLowerCase();

    if (lowerName.includes('premium')) return <Sparkles className="h-4 w-4" />;
    if (lowerName.includes('sea fish')) return <Waves className="h-4 w-4" />;
    if (lowerName.includes('prawns') || lowerName.includes('shrimp')) return <Shrimp className="h-4 w-4" />;
    if (lowerName.includes('crab')) return <Shell className="h-4 w-4" />;
    if (lowerName.includes('squid')) return <Anchor className="h-4 w-4" />;
    if (lowerName.includes('river')) return <Droplets className="h-4 w-4" />;
    if (lowerName.includes('dried')) return <Sun className="h-4 w-4" />;

    return <Fish className="h-4 w-4" />;
  };

  const CategoryButton = ({ category, isMobile = false }: { category: ProductCategory | null; isMobile?: boolean }) => {
    const isAll = category === null;
    const isSelected = isAll ? selectedCategory === 'all' : selectedCategory === category?.handle;

    return (
      <button
        onClick={() => handleCategorySelect(isAll ? 'all' : category!.handle)}
        className={`w-full text-left px-4 py-3 rounded-xs text-sm font-medium transition-all duration-200 flex items-center justify-between group ${isSelected
          ? 'bg-gradient-to-r from-[#00bcd4] to-[#0097a7] text-white shadow-md'
          : 'hover:bg-[#00bcd4]/5 text-gray-700'
          }`}
      >
        <span className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-xs flex items-center justify-center transition-colors ${isSelected ? 'bg-white/20' : 'bg-[#00bcd4]/10 group-hover:bg-[#00bcd4]/20'
            }`}>
            <div className={isSelected ? 'text-white' : 'text-[#00bcd4]'}>
              {getCategoryIcon(isAll ? null : category.name)}
            </div>
          </div>
          {isAll ? t('allCategories', language) : (language === 'ta' && typeof category?.metadata?.tamil_name === 'string' ? category.metadata.tamil_name : category?.name)}
        </span>
        <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'text-white' : 'text-gray-400 group-hover:translate-x-1'
          }`} />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Categories Card */}
              <div className="bg-white">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xs bg-[#00bcd4]/10 flex items-center justify-center">
                    <Fish className="h-4 w-4 text-[#00bcd4]" />
                  </div>
                  {t('categories', language)}
                </h3>
                <div className="space-y-2">
                  <CategoryButton category={null} />
                  {categories.map((cat) => (
                    <CategoryButton key={cat.id} category={cat} />
                  ))}
                </div>
              </div>

              {/* Promo Banner */}
              <div className="bg-gradient-to-br from-[#00bcd4] to-[#0097a7] rounded-xs p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">{t('freshDaily', language)}</span>
                </div>
                <p className="text-sm text-white/90 mb-3">
                  {t('fishArrivesDaily', language)}
                </p>
                <div className="text-xs bg-white/20 rounded-xs px-3 py-2 text-center font-medium">
                  {t('orderBefore10pm', language)}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar: Filters, Sort, View Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              {/* Left: Results count & active filters */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Mobile Filter Button */}
                <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                      {selectedCategory !== 'all' && (
                        <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-[#00bcd4] text-white">1</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Categories</h3>
                      <CategoryButton category={null} isMobile />
                      {categories.map((cat) => (
                        <CategoryButton key={cat.id} category={cat} isMobile />
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground">
                  {t('showing', language)} <span className="font-semibold text-foreground">{sortedProducts.length}</span> {t('productsText', language)}
                </p>
                {selectedCategory !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 px-2 py-1 bg-[#00bcd4]/10 text-[#00bcd4] hover:bg-[#00bcd4]/20 cursor-pointer text-xs rounded-xs"
                    onClick={() => setSelectedCategory('all')}
                  >
                    {language === 'ta' && categories.find((c) => c.handle === selectedCategory)?.metadata?.tamil_name
                      ? String(categories.find((c) => c.handle === selectedCategory)?.metadata?.tamil_name)
                      : categories.find((c) => c.handle === selectedCategory)?.name}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {searchQuery && (
                  <Badge
                    variant="secondary"
                    className="gap-1.5 px-2 py-1 bg-[#00bcd4]/10 text-[#00bcd4] hover:bg-[#00bcd4]/20 cursor-pointer text-xs rounded-xs"
                    onClick={clearSearch}
                  >
                    "{searchQuery}"
                    <X className="h-3 w-3" />
                  </Badge>
                )}
              </div>

              {/* Right: Sort & View Toggle */}
              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="min-w-[200px] sm:min-w-[220px] h-9 text-sm rounded-xs bg-white">
                    <div className="flex items-center gap-2">
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Sort" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {t('mostPopular', language)}
                      </div>
                    </SelectItem>
                    <SelectItem value="price-low">{t('priceLowToHigh', language)}</SelectItem>
                    <SelectItem value="price-high">{t('priceHighToLow', language)}</SelectItem>
                    <SelectItem value="newest">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        {t('newestFirst', language)}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-xs p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-xs transition-colors ${viewMode === 'grid' ? 'bg-[#00bcd4] text-white shadow-md hover:bg-[#0097a7]' : 'hover:bg-[#00bcd4]/10 text-muted-foreground'}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 rounded-xs transition-colors ${viewMode === 'list' ? 'bg-[#00bcd4] text-white shadow-md hover:bg-[#0097a7]' : 'hover:bg-[#00bcd4]/10 text-muted-foreground'}`}
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                    : 'flex flex-col gap-4'
                }
              >
                {sortedProducts.map((product) => (
                  <FreshCatchCard key={product.id} product={product} view={viewMode} variant="centered" />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="h-24 w-24 mx-auto bg-gray-100 rounded-xs flex items-center justify-center mb-6">
                  <Fish className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('noProductsFound', language)}</h3>
                <p className="text-muted-foreground mb-6">
                  {t('adjustSearchFilter', language)}
                  {/* Try selecting a different category */}
                </p>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  {t('clearFilters', language)}
                  {/* Clear filters */}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
