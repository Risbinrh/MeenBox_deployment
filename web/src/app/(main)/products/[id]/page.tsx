'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Star,
  Clock,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  Fish,
  Check,
  ChevronRight,
  Zap,
  Award,
  Leaf,
  ThermometerSnowflake,
  PlayCircle,
  ChefHat,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { medusa, Product, ProductVariant, formatPrice, getVariantPrice } from '@/lib/medusa';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import FreshCatchCard from '@/components/product/FreshCatchCard';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

// Fish handle to recipe mapping
const fishRecipeMap: Record<string, { id: string; title: string; tamilTitle: string; image: string; videoId: string; duration: number; }[]> = {
  'seer-fish': [
    { id: '1', title: 'Vanjaram Fish Fry', tamilTitle: 'வஞ்சிரம் வறுவல்', image: 'https://img.youtube.com/vi/o8lDCY2_jyw/maxresdefault.jpg', videoId: 'o8lDCY2_jyw', duration: 30 },
  ],
  'mackerel': [
    { id: '2', title: 'Meen Kuzhambu', tamilTitle: 'மீன் குழம்பு', image: 'https://img.youtube.com/vi/-kPEvUSZkEM/maxresdefault.jpg', videoId: '-kPEvUSZkEM', duration: 40 },
  ],
  'tiger-prawns': [
    { id: '3', title: 'Prawn Biryani', tamilTitle: 'இறால் பிரியாணி', image: 'https://img.youtube.com/vi/OYo9kHRxeH0/maxresdefault.jpg', videoId: 'OYo9kHRxeH0', duration: 60 },
  ],
  'prawns': [
    { id: '3', title: 'Prawn Biryani', tamilTitle: 'இறால் பிரியாணி', image: 'https://img.youtube.com/vi/OYo9kHRxeH0/maxresdefault.jpg', videoId: 'OYo9kHRxeH0', duration: 60 },
  ],
  'blue-crab': [
    { id: '4', title: 'Crab Masala', tamilTitle: 'நண்டு மசாலா', image: 'https://img.youtube.com/vi/2BSVhda6tWs/maxresdefault.jpg', videoId: '2BSVhda6tWs', duration: 50 },
  ],
  'crab': [
    { id: '4', title: 'Crab Masala', tamilTitle: 'நண்டு மசாலா', image: 'https://img.youtube.com/vi/2BSVhda6tWs/maxresdefault.jpg', videoId: '2BSVhda6tWs', duration: 50 },
  ],
  'pomfret': [
    { id: '5', title: 'Kerala Fish Molee', tamilTitle: 'கேரளா மீன் மொலி', image: 'https://img.youtube.com/vi/9qXZ_aous-Y/maxresdefault.jpg', videoId: '9qXZ_aous-Y', duration: 35 },
  ],
  'pomfret-white': [
    { id: '8', title: 'White Pomfret Fry', tamilTitle: 'வெள்ளை வாவல் வறுவல்', image: 'https://img.youtube.com/vi/H88X5b2lx9w/maxresdefault.jpg', videoId: 'H88X5b2lx9w', duration: 30 },
  ],
  'pomfret-black': [
    { id: '9', title: 'Black Pomfret Masala', tamilTitle: 'கருப்பு வாவல் மசாலா', image: 'https://img.youtube.com/vi/-TH4QuqJnUM/hqdefault.jpg', videoId: '-TH4QuqJnUM', duration: 40 },
  ],
  'squid': [
    { id: '6', title: 'Squid Roast', tamilTitle: 'கணவாய் வறுவல்', image: 'https://img.youtube.com/vi/7y0kgjyhHZ8/maxresdefault.jpg', videoId: '7y0kgjyhHZ8', duration: 30 },
  ],
  'baby-squid': [
    { id: '14', title: 'Baby Squid Fry', tamilTitle: 'குட்டி கணவாய் வறுவல்', image: 'https://img.youtube.com/vi/edCbLvpLVEI/maxresdefault.jpg', videoId: 'edCbLvpLVEI', duration: 20 },
  ],
  'king-fish': [
    { id: '7', title: 'King Fish Fry', tamilTitle: 'நெய்மீன் வறுவல்', image: 'https://img.youtube.com/vi/x0h_sDFZn6w/maxresdefault.jpg', videoId: 'x0h_sDFZn6w', duration: 35 },
  ],
  'red-snapper': [
    { id: '10', title: 'Red Snapper Curry', tamilTitle: 'சங்கரா மீன் குழம்பு', image: 'https://img.youtube.com/vi/BacKM_-N2q8/maxresdefault.jpg', videoId: 'BacKM_-N2q8', duration: 45 },
  ],
  'barramundi': [
    { id: '11', title: 'Barramundi Fry', tamilTitle: 'கொடுவா வறுவல்', image: 'https://img.youtube.com/vi/NlL2htQNWoo/hqdefault.jpg', videoId: 'NlL2htQNWoo', duration: 35 },
  ],
  'sea-bass': [
    { id: '11', title: 'Barramundi Fry', tamilTitle: 'கொடுவா வறுவல்', image: 'https://img.youtube.com/vi/NlL2htQNWoo/hqdefault.jpg', videoId: 'NlL2htQNWoo', duration: 35 },
  ],
  'indian-salmon': [
    { id: '12', title: 'Indian Salmon Curry', tamilTitle: 'காலா மீன் குழம்பு', image: 'https://img.youtube.com/vi/SbN8AILtKTQ/maxresdefault.jpg', videoId: 'SbN8AILtKTQ', duration: 45 },
  ],
  'sardine': [
    { id: '13', title: 'Sardine Fry', tamilTitle: 'மத்தி வறுவல்', image: 'https://img.youtube.com/vi/T-CDURLMH6s/maxresdefault.jpg', videoId: 'T-CDURLMH6s', duration: 25 },
  ],
  'dried-sardine': [
    { id: '15', title: 'Dried Sardine Fry', tamilTitle: 'மத்தி கருவாடு வறுவல்', image: 'https://img.youtube.com/vi/NeDBEQtT3EE/hqdefault.jpg', videoId: 'NeDBEQtT3EE', duration: 25 },
  ],
  'dried-prawns': [
    { id: '16', title: 'Dried Prawn Curry', tamilTitle: 'இறால் கருவாடு குழம்பு', image: 'https://img.youtube.com/vi/YQFa018AL5o/maxresdefault.jpg', videoId: 'YQFa018AL5o', duration: 40 },
  ],
  'dried-anchovy': [
    { id: '17', title: 'Dried Anchovy Fry', tamilTitle: 'நெத்திலி கருவாடு வறுவல்', image: 'https://img.youtube.com/vi/62HGi9-qKDI/maxresdefault.jpg', videoId: '62HGi9-qKDI', duration: 20 },
  ],
  'anchovy': [
    { id: '17', title: 'Dried Anchovy Fry', tamilTitle: 'நெத்திலி கருவாடு வறுவல்', image: 'https://img.youtube.com/vi/62HGi9-qKDI/maxresdefault.jpg', videoId: '62HGi9-qKDI', duration: 20 },
  ],
};

export default function ProductDetailPage() {
  const params = useParams();
  const handle = params.id as string;
  const router = useRouter();

  const { addToCart, isLoading: cartLoading } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const [videoModal, setVideoModal] = useState<{ isOpen: boolean; videoId: string; title: string }>({ isOpen: false, videoId: '', title: '' });
  const { language } = useLanguage();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const { products } = await medusa.getProductByHandle(handle);
        if (products && products.length > 0) {
          const prod = products[0];
          setProduct(prod);
          setSelectedVariant(prod.variants?.[0] || null);

          if (prod.categories && prod.categories.length > 0) {
            const { products: related } = await medusa.getProducts({
              category_id: [prod.categories[0].id],
              limit: 5,
            });
            setRelatedProducts(related.filter(p => p.id !== prod.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [handle]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    try {
      setIsAdding(true);
      await addToCart(selectedVariant.id, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;

    try {
      setIsBuying(true);
      // Add to cart first
      await addToCart(selectedVariant.id, quantity);
      // Then redirect to cart page
      router.push('/cart');
    } catch (error) {
      console.error('Failed to buy now:', error);
    } finally {
      setIsBuying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-10">
            <Skeleton className="aspect-square rounded-xs" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-12 w-1/3" />
              <Skeleton className="h-32 w-full rounded-xs" />
              <Skeleton className="h-14 w-full rounded-xs" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-24 w-24 mx-auto bg-gray-100 rounded-xs flex items-center justify-center mb-6">
            <Fish className="h-12 w-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t('noProductsFound', language)}</h1>
          <p className="text-muted-foreground mb-6">{t('adjustSearchFilter', language)}</p>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              {t('products', language)}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tamilName = product.subtitle || (product.metadata?.tamil_name as string) || '';
  const tamilDescription = (product.metadata?.tamil_description as string) || product.description || '';
  const tamilFreshness = (product.metadata?.tamil_freshness as string) || '';

  // Default freshness text with translation
  const defaultFreshness = language === 'ta' ? 'இன்றைய புதிய பிடி' : 'Fresh catch of the day';
  const freshness = (product.metadata?.freshness as string) || defaultFreshness;
  const rating = (product.metadata?.rating as number) || 4.5;
  const reviewCount = (product.metadata?.review_count as number) || Math.floor(Math.random() * 100 + 50);
  const bestFor = (product.metadata?.best_for as string[]) || ['Fry', 'Curry', 'Grill', 'Steam'];
  const tamilBestFor = (product.metadata?.tamil_best_for as string[]) || [];

  // Cooking method translation mapping
  const cookingMethodTranslations: Record<string, string> = {
    'Fry': 'வறுக்கவும்',
    'Curry': 'குழம்பு',
    'Grill': 'கிரில்',
    'Steam': 'ஆவியில் வேகவைக்கவும்',
    'Bake': 'பேக்',
    'Roast': 'வறுக்கவும்',
  };
  const nutritionalInfo = (product.metadata?.nutritional_info as Record<string, string>) || {
    calories: '100 kcal',
    protein: '20g',
    fat: '2g',
    omega3: '0.5g',
  };

  const images = product.thumbnail
    ? [product.thumbnail, ...(product.images?.filter(img => img.url !== product.thumbnail).map(img => img.url) || [])]
    : product.images?.length > 0
      ? product.images.map(img => img.url)
      : ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'];

  const variantPrice = selectedVariant ? getVariantPrice(selectedVariant) : 0;
  const currentPrice = variantPrice * 2; // Convert 500g price to per-kg price
  const originalPrice = product.metadata?.original_price as number;
  const discountPercent = originalPrice && currentPrice < originalPrice
    ? Math.round((1 - currentPrice / originalPrice) * 100)
    : 0;
  const totalPrice = currentPrice * quantity;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              {t('home', language)}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
              {t('products', language)}
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-primary truncate max-w-[200px]">
              {language === 'ta' && tamilName ? tamilName : product.title}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Back Button - Mobile */}
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 lg:hidden">
          <ChevronLeft className="h-4 w-4" />
          {t('products', language)}
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] rounded-xs overflow-hidden bg-gradient-to-br from-[#b18b5e]/5 via-[#f3e9dc]/20 to-[#8c6b42]/5">
              <Image
                src={images[selectedImage]}
                alt={product.title}
                fill
                className="object-contain p-6"
              />

              {/* Discount Badge */}
              {discountPercent > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-xs">
                  {discountPercent}% {t('off', language)}
                </Badge>
              )}

              {/* Wishlist & Share */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => product && toggleWishlist(product.id)}
                  className={`h-11 w-11 rounded-xs flex items-center justify-center transition-all duration-300 ${isWishlisted
                    ? 'bg-red-500 text-white'
                    : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                    }`}
                >
                  <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button className="h-11 w-11 rounded-xs bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                  <Share2 className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Stock Badge */}
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xs text-sm font-medium bg-green-100 text-green-700">
                  <div className="h-2 w-2 rounded-xs bg-green-500" />
                  {t('inStock', language)}
                </div>
              </div>
            </div>

          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Freshness Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xs bg-green-100 text-green-700 text-sm font-medium">
              <Clock className="h-4 w-4" />
              {language === 'ta' && tamilFreshness ? tamilFreshness : freshness}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {language === 'ta' && tamilName ? tamilName : product.title}
              </h1>
              {language === 'en' && tamilName && (
                <p className="text-xl text-muted-foreground mt-1">{tamilName}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xs">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-amber-700 text-sm">{rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {reviewCount} {language === 'ta' ? 'விமர்சனங்கள்' : 'reviews'}
              </span>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-sm text-green-600 font-medium">500+ {language === 'ta' ? 'விற்பனை' : 'sold'}</span>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-primary/10 to-transparent rounded-xs p-3">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-primary">{formatPrice(currentPrice)}</span>
                <span className="text-sm text-muted-foreground">{t('perKgSlash', language)}</span>
                {originalPrice && currentPrice < originalPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              {discountPercent > 0 && (
                <p className="text-xs text-green-600 font-medium mt-1">
                  {language === 'ta'
                    ? `நீங்கள் ${formatPrice(originalPrice - currentPrice)} சேமிக்கிறீர்கள் (${discountPercent}% தள்ளுபடி)`
                    : `You save ${formatPrice(originalPrice - currentPrice)} (${discountPercent}% off)`
                  }
                </p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-bold text-lg mb-3">{language === 'ta' ? 'அளவு' : 'Quantity'}</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-xs p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xs hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setQuantity(Math.max(.5, quantity - .5))}
                    disabled={quantity <= .5}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-14 text-center font-bold text-lg">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xs hover:bg-primary hover:text-primary-foreground"
                    onClick={() => setQuantity(quantity + 0.5)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-muted-foreground text-sm">
                  ({quantity} {language === 'ta' ? 'கிலோ' : 'kg'})
                </span>
              </div>
            </div>

            {/* Total and Buttons */}
            <div className="bg-white rounded-xs p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t('total', language)}</p>
                  <p className="text-3xl font-bold text-primary">{formatPrice(totalPrice)}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 text-sm rounded-xs">
                  <Truck className="h-4 w-4 mr-1" />
                  {t('freeDelivery', language)}
                </Badge>
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1 h-11 gap-2 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  onClick={handleAddToCart}
                  disabled={isAdding || cartLoading || !selectedVariant}
                >
                  {isAdding ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {language === 'ta' ? 'சேர்க்கிறது...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      {t('addToCart', language)}
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-11 text-base font-semibold text-primary hover:bg-primary hover:text-white"
                  onClick={handleBuyNow}
                  disabled={isBuying || cartLoading || !selectedVariant}
                >
                  {isBuying ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {language === 'ta' ? 'செயலாக்கம்...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      {t('buyNow', language)}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-3 bg-white rounded-xs ">
                <div className="h-10 w-10 mx-auto bg-[#b18b5e]/10 rounded-xs flex items-center justify-center mb-2">
                  <Truck className="h-5 w-5 text-[#b18b5e]" />
                </div>
                <p className="text-xs font-semibold">{t('freeDelivery', language)}</p>
                <p className="text-xs text-muted-foreground">{t('onOrdersAbove', language)}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xs ">
                <div className="h-10 w-10 mx-auto bg-green-100 rounded-xs flex items-center justify-center mb-2">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-xs font-semibold">{language === 'ta' ? 'புதிய உத்தரவாதம்' : 'Fresh Guarantee'}</p>
                <p className="text-xs text-muted-foreground">{language === 'ta' ? '100% தரம்' : '100% Quality'}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xs ">
                <div className="h-10 w-10 mx-auto bg-amber-100 rounded-xs flex items-center justify-center mb-2">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-xs font-semibold">{language === 'ta' ? 'பிரீமியம் தரம்' : 'Premium Quality'}</p>
                <p className="text-xs text-muted-foreground">{language === 'ta' ? 'கையால் தேர்ந்தெடுக்கப்பட்டது' : 'Handpicked'}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xs ">
                <div className="h-10 w-10 mx-auto bg-[#b18b5e]/10 rounded-xs flex items-center justify-center mb-2">
                  <RotateCcw className="h-5 w-5 text-[#b18b5e]" />
                </div>
                <p className="text-xs font-semibold">{language === 'ta' ? 'எளிய திரும்பி அனுப்புதல்' : 'Easy Returns'}</p>
                <p className="text-xs text-muted-foreground">{language === 'ta' ? 'திருப்தி இல்லாவிட்டால்' : 'If not satisfied'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start bg-white rounded-xs p-1 h-auto flex-wrap">
              <TabsTrigger value="description" className="rounded-xs px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
                {language === 'ta' ? 'விளக்கம்' : 'Description'}
              </TabsTrigger>
              <TabsTrigger value="nutrition" className="rounded-xs px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
                {language === 'ta' ? 'சத்து தகவல்' : 'Nutrition Facts'}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-xs px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white">
                {language === 'ta' ? 'விமர்சனங்கள்' : 'Reviews'} ({reviewCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-6">
              <Card className="border-b">
                <CardContent className="px-0 py-6 md:py-8">
                  <div className="prose max-w-none">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {language === 'ta' && tamilDescription ? tamilDescription : product.description}
                    </p>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      {language === 'ta' ? 'சிறந்த சமையல் முறைகள்' : 'Best Cooking Methods'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {bestFor.map((method) => (
                        <Badge key={method} className="px-4 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 rounded-xs">
                          {language === 'ta' ? (cookingMethodTranslations[method] || method) : method}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-4 bg-[#b18b5e]/10 rounded-xs">
                      <ThermometerSnowflake className="h-8 w-8 text-[#b18b5e]" />
                      <div>
                        <p className="font-semibold">{language === 'ta' ? 'சேமிப்பு' : 'Storage'}</p>
                        <p className="text-sm text-muted-foreground">{language === 'ta' ? '0-4°C இல் குளிரூட்டி வைக்கவும்' : 'Keep refrigerated at 0-4°C'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xs">
                      <Clock className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-semibold">{language === 'ta' ? 'நீடித்து நிலைத்திருத்தல்' : 'Shelf Life'}</p>
                        <p className="text-sm text-muted-foreground">{language === 'ta' ? '2-3 நாட்களுக்குள் பயன்படுத்தவும்' : 'Best consumed within 2-3 days'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="nutrition" className="mt-6">
              <Card className="border-b">
                <CardContent className="p-6 md:p-8">
                  <h4 className="font-bold text-xl mb-6">
                    {language === 'ta' ? 'சத்துக்கள் தகவல் (100 கிராம்க்கு)' : 'Nutritional Information (per 100g)'}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xs">
                      <p className="text-3xl font-bold text-red-600">
                        {nutritionalInfo.calories}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{language === 'ta' ? 'கலோரிகள்' : 'Calories'}</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-[#b18b5e]/5 to-[#8c6b42]/10 rounded-xs">
                      <p className="text-3xl font-bold text-[#b18b5e]">
                        {nutritionalInfo.protein}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{language === 'ta' ? 'புரதம்' : 'Protein'}</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xs">
                      <p className="text-3xl font-bold text-amber-600">
                        {nutritionalInfo.fat}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{language === 'ta' ? 'கொழுப்பு' : 'Fat'}</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xs">
                      <p className="text-3xl font-bold text-green-600">
                        {nutritionalInfo.omega3}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{language === 'ta' ? 'ஒமேகா-3' : 'Omega-3'}</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-[#b18b5e]/10 rounded-xs">
                    <p className="text-sm text-[#3d2b1f]">
                      <strong>{language === 'ta' ? 'ஆரோக்கிய நன்மைகள்:' : 'Health Benefits:'}</strong> {language === 'ta' ? 'உயர்தர புரதம், ஒமேகா-3 கொழுப்பு அமிலங்கள் மற்றும் அத்தியாவசிய வைட்டமின்கள் நிறைந்தது. இதய ஆரோக்கியம், மூளை செயல்பாடு மற்றும் ஒட்டுமொத்த நல்வாழ்வை ஆதரிக்கிறது.' : 'Rich in high-quality protein, omega-3 fatty acids, and essential vitamins. Supports heart health, brain function, and overall wellness.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <Card className="border-b">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                    <div className="text-center p-6 bg-amber-50 rounded-xs">
                      <p className="text-5xl font-bold text-amber-600">{rating}</p>
                      <div className="flex gap-1 justify-center my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${star <= Math.round(rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ta'
                          ? `${reviewCount} விமர்சனங்களின் அடிப்படையில்`
                          : `Based on ${reviewCount} reviews`
                        }
                      </p>
                    </div>

                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm w-3">{stars}</span>
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${stars === 5 ? 70 : stars === 4 ? 20 : stars === 3 ? 7 : 3}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-10">
                            {stars === 5 ? '70%' : stars === 4 ? '20%' : stars === 3 ? '7%' : '3%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      {language === 'ta'
                        ? 'இந்த பொருளை விமர்சிக்கும் முதல் நபர் ஆகுங்கள்!'
                        : 'Be the first to review this product!'
                      }
                    </p>
                    <Button variant="outline" className="gap-2">
                      <Star className="h-4 w-4" />
                      {language === 'ta' ? 'விமர்சனம் எழுதுங்கள்' : 'Write a Review'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Recipe Section */}
        {fishRecipeMap[handle] && fishRecipeMap[handle].length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/10 rounded-xs flex items-center justify-center">
                  <ChefHat className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">
                    {language === 'ta'
                      ? `${language === 'ta' && tamilName ? tamilName : product.title} க்கான சமையல் குறிப்பு`
                      : `Recipe for ${product.title}`
                    }
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {language === 'ta'
                      ? 'இந்த சுவையான மீனை சமைக்க கற்றுக்கொள்ளுங்கள்'
                      : 'Learn how to cook this delicious fish'
                    }
                  </p>
                </div>
              </div>
              <Link href="/recipes">
                <Button variant="ghost" className="gap-1">
                  {language === 'ta' ? 'அனைத்து சமையல் குறிப்புகள்' : 'All Recipes'}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fishRecipeMap[handle].map((recipe) => (
                <Card
                  key={recipe.id}
                  className="overflow-hidden hover:bg-gray-50 transition-all duration-300 group border-b cursor-pointer"
                  onClick={() => setVideoModal({ isOpen: true, videoId: recipe.videoId, title: recipe.title })}
                >
                  <div className="relative aspect-video">
                    <Image
                      src={recipe.image}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 rounded-xs bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <PlayCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <Badge className="absolute top-3 right-3 bg-red-600 text-white">
                      {language === 'ta' ? 'வீடியோ சமையல் குறிப்பு' : 'Video Recipe'}
                    </Badge>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-white font-bold text-lg">{language === 'ta' ? recipe.tamilTitle : recipe.title}</h3>
                      {language === 'en' && <p className="text-white/80 text-sm">{recipe.tamilTitle}</p>}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">{recipe.duration} {language === 'ta' ? 'நிமிடங்கள்' : 'mins'}</span>
                      </div>
                      <Button size="sm" variant="outline" className="gap-1">
                        {language === 'ta' ? 'இப்போது பார்க்கவும்' : 'Watch Now'}
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold">{language === 'ta' ? 'நீங்கள் விரும்பலாம்' : 'You May Also Like'}</h2>
              <Link href="/products">
                <Button variant="ghost" className="gap-1">
                  {t('viewAll', language)}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <FreshCatchCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {
        videoModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl mx-4">
              <button
                onClick={() => setVideoModal({ isOpen: false, videoId: '', title: '' })}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
              <div className="bg-black rounded-xs overflow-hidden shadow-2xl">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoModal.videoId}?autoplay=1`}
                    title={videoModal.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 bg-gray-900">
                  <h3 className="text-white font-bold text-lg">{videoModal.title}</h3>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
