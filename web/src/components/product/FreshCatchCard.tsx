'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBasket, Loader2, Star, Clock, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Product, formatPrice, getVariantPrice } from '@/lib/medusa';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import { useWishlist } from '@/context/WishlistContext';

interface FreshCatchCardProps {
    product: Product;
    view?: 'grid' | 'list';
    variant?: 'default' | 'centered' | 'split';
}

export default function FreshCatchCard({ product, view = 'grid', variant = 'default' }: FreshCatchCardProps) {
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

    // Get data from metadata or fallback
    const originalPriceVariant = product.metadata?.original_price as number;
    // If original price exists, also × 2 for per-kg
    const originalPrice = originalPriceVariant ? originalPriceVariant * 2 : 0;
    const discount = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;

    // Missing contents integration
    const rawTamilName = product.subtitle || (product.metadata?.tamil_name as string) || '';

    // Extract only Tamil name (remove English in parentheses) when in Tamil mode
    const tamilName = language === 'ta' && rawTamilName
        ? rawTamilName.replace(/\s*\([^)]*\)\s*/g, '').trim()
        : rawTamilName;

    const freshness = (product.metadata?.freshness as string) || t('caughtFresh', language);
    const rating = (product.metadata?.rating as number) || 4.5;
    const reviewCount = (product.metadata?.review_count as number) || 0;

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!defaultVariant) return;

        try {
            setIsAdding(true);
            await addToCart(defaultVariant.id, 1);
        } catch {
            // Error handled by cart context
        } finally {
            setIsAdding(false);
        }
    };

    if (view === 'list') {
        return (
            <div className="group overflow-hidden transition-all py-0 border-b border-gray-200 bg-white">
                <div className="flex flex-col sm:flex-row items-stretch">
                    {/* Image Section */}
                    <Link href={`/products/${product.handle}`} className="relative w-full sm:w-[300px] shrink-0 overflow-hidden">
                        <div className="relative w-full h-full min-h-[200px] sm:min-h-0">
                            <Image
                                src={product.thumbnail || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'}
                                alt={product.title}
                                fill
                                className=" group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        {discount > 0 && (
                            <div className="absolute top-2 left-2">
                                <Badge variant="destructive" className="bg-[#8B1D1D] text-white rounded-none px-1.5 py-0.5 text-[10px] font-bold uppercase">
                                    {discount}% {t('off', language)}
                                </Badge>
                            </div>
                        )}
                    </Link>

                    {/* Content Section */}
                    <div className="flex-1 p-5 lg:p-6 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <Link href={`/products/${product.handle}`}>
                                    {language === 'en' ? (
                                        <div>
                                            <h3 className="font-bold text-lg sm:text-xl text-[#333333] group-hover:text-[#00bcd4] transition-colors leading-tight">
                                                {product.title}
                                            </h3>
                                            {tamilName && (
                                                <p className="text-xs text-gray-500 leading-tight">
                                                    {tamilName}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="font-bold text-lg sm:text-xl text-[#333333] group-hover:text-[#00bcd4] transition-colors leading-tight">
                                                {tamilName || product.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 leading-tight">
                                                {product.title}
                                            </p>
                                        </div>
                                    )}
                                </Link>
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs font-semibold uppercase tracking-wide">{freshness}</span>
                                    <span className="text-xs text-muted-foreground/60">({reviewCount} reviews)</span>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-[#333333]">
                                        {formatPrice(price)}
                                    </span>
                                    {originalPrice > price && (
                                        <span className="text-sm text-muted-foreground line-through font-medium">
                                            {formatPrice(originalPrice)}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t('perKg', language)}</span>
                            </div>
                        </div>

                        {/* Action Section */}
                        <div className="flex sm:flex-col items-center justify-between sm:justify-between sm:items-end w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-slate-50 pt-2 sm:pt-0 sm:pl-2">
                            <div className="flex items-center gap-1.5 bg-yellow-400/10 px-2 py-1 rounded-lg">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-bold text-[#333333]">{rating}</span>
                            </div>

                            <Button
                                className="bg-[#00bcd4] hover:bg-[#0097a7] text-white rounded-xs px-8 h-10 gap-2 font-black shadow-md active:scale-95 transition-all w-full sm:w-auto cursor-pointer"
                                disabled={isAdding || cartLoading}
                                onClick={handleAddToCart}
                            >
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <>
                                        <ShoppingBasket className="h-4 w-4 stroke-[2.5px]" />
                                        <span className="text-xs uppercase tracking-widest">{t('addToCart', language)}</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Centered Card Variant (for Today's Fresh Catch) - Minimalist Design
    if (variant === 'centered') {
        return (
            <Card className="group overflow-hidden rounded-none border-none shadow-none transition-all flex gap-4 flex-col py-0 bg-white">
                {/* Image and Buttons Container */}
                <div className="relative min-h-80 pb-16 bg-[#effafb]">
                    <Link href={`/products/${product.handle}`}>
                        <div className="relative aspect-square overflow-hidden p-5">
                            <div className="relative w-full h-full">
                                <Image
                                    src={(product.thumbnail || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop').replace(/^"+|"+$/g, '')}
                                    alt={product.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                                    className="object-contain group-hover:scale-110 transition-transform duration-500"
                                    priority={false}
                                />
                            </div>
                        </div>
                    </Link>

                    {/* Action Buttons - Absolutely Positioned Over Image */}
                    <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-2">
                        {/* Add to Cart Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(e);
                            }}
                            disabled={isAdding || cartLoading}
                            className="h-12 w-12 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: '#00bcd4' }}
                            title="Add to Cart"
                        >
                            {isAdding ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <ShoppingBasket className="h-5 w-5" />
                            )}
                        </button>

                        {/* Quick View Button */}
                        <Link
                            href={`/products/${product.handle}`}
                            onClick={(e) => e.stopPropagation()}
                            className="h-12 w-12 rounded-full text-white flex items-center justify-center" style={{ backgroundColor: '#00bcd4' }}
                            title="Quick View"
                        >
                            <Eye className="h-5 w-5" />
                        </Link>

                        {/* Wishlist Button */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(product.id);
                            }}
                            className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: isWishlisted ? '#ef4444' : '#00bcd4' }}
                            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Text Area - Card Background */}
                <CardContent className="pb-4 px-0 flex flex-col gap-3">
                    <div>
                        <Link href={`/products/${product.handle}`}>
                            {language === 'en' ? (
                                <div>
                                    <h3 className="font-semibold text-lg text-black transition-colors leading-tight group-hover:text-[#00bcd4]">
                                        {product.title}
                                    </h3>
                                    {tamilName && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {tamilName}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <h3 className="font-semibold text-lg text-black transition-colors leading-tight group-hover:text-[#00bcd4]">
                                        {tamilName || product.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {product.title}
                                    </p>
                                </div>
                            )}
                        </Link>
                    </div>

                    {/* 5 Outlined Stars */}
                    <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className="h-4 w-4 text-amber-400 stroke-amber-400 stroke-2"
                                fill="none"
                            />
                        ))}
                    </div>

                    {/* Price */}
                    <div className="text-sm text-gray-600 font-medium">
                        {formatPrice(price)}
                    </div>
                </CardContent>
            </Card>
        );
    }


    // Grid View (Default)
    return (
        <Card className="group overflow-hidden rounded-2xl border-none flex flex-col py-0 bg-white">
            <Link href={`/products/${product.handle}`}>
                <div className="relative aspect-[16/8] sm:aspect-[16/7] overflow-hidden py-0">
                    <Image
                        src={product.thumbnail || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop'}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discount > 0 && (
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
                            <Badge variant="destructive" className="bg-[#8B1D1D] text-white rounded-none px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase">
                                {discount}% {t('off', language)}
                            </Badge>
                        </div>
                    )}
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                        }}
                        className={`absolute top-2 left-2 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${isWishlisted
                            ? 'bg-red-500 text-white'
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
                            }`}
                    >
                        <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </Link>

            <CardContent className="p-2.5 sm:p-3.5 pt-1.5 flex flex-col">
                <Link href={`/products/${product.handle}`} className="flex flex-col">
                    {/* Main Title - Bilingual Display */}
                    {language === 'en' ? (
                        <div className="mb-1.5">
                            <h3 className="font-bold text-sm sm:text-base leading-tight text-[#333333] group-hover:text-primary transition-colors line-clamp-1">
                                {product.title}
                            </h3>
                            {tamilName && (
                                <p className="text-xs text-gray-500 leading-tight line-clamp-1">
                                    {tamilName}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="mb-1.5">
                            <h3 className="font-bold text-sm sm:text-base leading-tight text-[#333333] group-hover:text-primary transition-colors line-clamp-1">
                                {tamilName || product.title}
                            </h3>
                            <p className="text-xs text-gray-500 leading-tight line-clamp-1">
                                {product.title}
                            </p>
                        </div>
                    )}

                    {/* Meta Row - Combined Rating & Freshness */}
                    <div className="flex gap-3 mb-3">
                        <div className="flex gap-0.5">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-bold text-[#333333]">{rating}</span>
                            <span className="text-[10px] text-muted-foreground opacity-70">({reviewCount})</span>
                        </div>
                        <div className="flex gap-1 text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" />
                            <span className="text-[10px] font-medium">{freshness}</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-sm sm:text-base font-black text-[#333333]">
                                    {formatPrice(price)}
                                </span>
                                {originalPrice > price && (
                                    <span className="text-[10px] text-muted-foreground line-through decoration-muted-foreground/40 font-medium">
                                        {formatPrice(originalPrice)}
                                    </span>
                                )}
                            </div>
                            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-tight -mt-0.5">{t('perKg', language)}</span>
                        </div>

                        <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 h-7 sm:h-8 gap-1.5 font-black shadow-sm active:scale-95 transition-all cursor-pointer"
                            disabled={isAdding || cartLoading}
                            onClick={handleAddToCart}
                        >
                            {isAdding ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <>
                                    <ShoppingBasket className="h-3.5 w-3.5 stroke-[2.5px]" />
                                    <span className="text-[10px] uppercase tracking-wider">{t('add', language)}</span>
                                </>
                            )}
                        </Button>
                    </div>
                </Link>
            </CardContent>
        </Card>
    );
};
