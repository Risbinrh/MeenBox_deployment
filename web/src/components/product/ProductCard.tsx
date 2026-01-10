'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Plus, Clock, Loader2, ShoppingCart, Heart, Eye } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product, formatPrice, getVariantPrice } from '@/lib/medusa';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isLoading: cartLoading } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const { language } = useLanguage();
  const isWishlisted = isInWishlist(product.id);

  // Get first variant for default price display
  const defaultVariant = product.variants?.[0];
  const variantPrice = defaultVariant ? getVariantPrice(defaultVariant) : 0;
  // Variant is 500g, display per-kg price (× 2)
  const price = variantPrice * 2;

  // Get Tamil name from subtitle or metadata
  const rawTamilName = product.subtitle || (product.metadata?.tamil_name as string) || '';

  // Extract only Tamil name (remove English in parentheses) when in Tamil mode
  const tamilName = language === 'ta' && rawTamilName
    ? rawTamilName.replace(/\s*\([^)]*\)\s*/g, '').trim()
    : rawTamilName;

  // Get freshness from metadata
  const freshness = (product.metadata?.freshness as string) || t('caughtFreshThisMorning', language);

  // Get rating from metadata
  const rating = (product.metadata?.rating as number) || 4.5;
  const reviewCount = (product.metadata?.review_count as number) || Math.floor(Math.random() * 100 + 20);

  // Check availability
  const isInStock = defaultVariant?.inventory_quantity !== 0;
  const isLimited = (defaultVariant?.inventory_quantity || 0) < 10 && isInStock;

  // Get original price from metadata
  const originalPriceVariant = product.metadata?.original_price as number;
  // If original price exists, also × 2 for per-kg
  const originalPrice = originalPriceVariant ? originalPriceVariant * 2 : 0;
  const discountPercent = originalPrice && price < originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!defaultVariant) return;

    try {
      setIsAdding(true);
      await addToCart(defaultVariant.id, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300">
      <Link href={`/products/${product.handle}`}>
        <div className="relative aspect-square overflow-hidden bg-[#effafb]">
          {/* Product Image */}
          <Image
            src={product.thumbnail || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=400&fit=crop'}
            alt={product.title}
            fill
            className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discountPercent > 0 && (
              <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs font-bold px-2 py-1 shadow-lg">
                {discountPercent}% {t('off', language)}
              </Badge>
            )}
            {product.tags?.some(t => t.value === 'bestseller') && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold px-2 py-1 shadow-lg">
                {t('bestSeller', language)}
              </Badge>
            )}
            {isLimited && (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-xs font-medium">
                {t('onlyFewLeft', language)}
              </Badge>
            )}
          </div>

          {/* Top Right Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={handleWishlist}
              className={`h-9 w-9 rounded-xs flex items-center justify-center transition-all duration-300 shadow-md ${isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <div className="h-9 w-9 rounded-full bg-white/90 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Eye className="h-4 w-4 text-gray-600" />
            </div>
          </div>

          {/* Stock Indicator */}
          <div className="absolute bottom-3 left-3">
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-xs text-xs font-medium ${!isInStock
              ? 'bg-red-100 text-red-700'
              : isLimited
                ? 'bg-amber-100 text-amber-700'
                : 'bg-green-100 text-green-700'
              }`}>
              <div className={`h-2 w-2 rounded-xs ${!isInStock ? 'bg-red-500' : isLimited ? 'bg-amber-500' : 'bg-green-500'
                }`} />
              {!isInStock ? t('outOfStock', language) : isLimited ? t('onlyFewLeft', language) : t('inStock', language)}
            </div>
          </div>
        </div>
      </Link>

      <CardContent className="p-4 bg-[#effafb]">
        <Link href={`/products/${product.handle}`}>
          {/* Category/Freshness */}
          <div className="flex items-center gap-1.5 text-xs text-primary font-medium mb-1.5">
            <Clock className="h-3 w-3" />
            <span>{freshness}</span>
          </div>

          {/* Name - Bilingual Display */}
          {language === 'en' ? (
            <div className="mb-0.5">
              <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                {product.title}
              </h3>
              {tamilName && (
                <p className="text-xs text-gray-500 leading-tight line-clamp-1">
                  {tamilName}
                </p>
              )}
            </div>
          ) : (
            <div className="mb-0.5">
              <h3 className="font-bold text-base leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                {tamilName || product.title}
              </h3>
              <p className="text-xs text-gray-500 leading-tight line-clamp-1">
                {product.title}
              </p>
            </div>
          )}


          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.floor(rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                    }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-600">
              {rating} <span className="text-gray-400">({reviewCount})</span>
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-xl font-bold text-gray-900">
              {formatPrice(price)}
            </span>
            <span className="text-sm text-muted-foreground">{t('perKgSlash', language)}</span>
            {originalPrice && price < originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </Link>

        {/* Add to Cart Button */}
        <Button
          className={`w-full h-11 gap-2 font-semibold text-sm transition-all duration-300 ${isInStock
            ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg'
            : 'bg-gray-200 text-gray-500'
            }`}
          disabled={!isInStock || isAdding || cartLoading}
          onClick={handleAddToCart}
        >
          {isAdding ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === 'ta' ? 'சேர்க்கிறது...' : 'Adding...'}
            </>
          ) : !isInStock ? (
            t('outOfStock', language)
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              {t('addToCart', language)}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
