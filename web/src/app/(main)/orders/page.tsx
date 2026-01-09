'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Loader2,
  ShoppingBag,
  Sparkles,
  PartyPopper,
  CalendarDays,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { medusa, Order, formatPrice } from '@/lib/medusa';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

const statusConfig: Record<string, { labelKey: keyof typeof import('@/lib/translations').translations.en; color: string; bgColor: string; icon: React.ElementType }> = {
  'order_placed': { labelKey: 'orderPlaced', color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
  'order_confirmed': { labelKey: 'confirmed', color: 'text-[#b18b5e]', bgColor: 'bg-[#b18b5e]/10', icon: CheckCircle },
  'shipped': { labelKey: 'shipped', color: 'text-[#8c6b42]', bgColor: 'bg-[#8c6b42]/10', icon: Package },
  'out_for_delivery': { labelKey: 'outForDelivery', color: 'text-purple-700', bgColor: 'bg-purple-100', icon: Truck },
  'delivered': { labelKey: 'delivered', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
  'cancelled': { labelKey: 'cancelled', color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
  'completed': { labelKey: 'completed', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle },
};

const getOrderDisplayStatus = (order: Order): string => {
  const paymentStatus = order.payment_status;
  const fulfillmentStatus = order.fulfillment_status;
  const orderStatus = order.status;

  // Check explicit order status first (set by admin)
  if (orderStatus === 'cancelled' || orderStatus === 'canceled') {
    return 'cancelled';
  }

  if (orderStatus === 'completed' || fulfillmentStatus === 'delivered') {
    return 'delivered';
  }

  // Check for admin-set statuses
  if (orderStatus === 'confirmed') {
    return 'order_confirmed';
  }

  if (orderStatus === 'shipped' || orderStatus === 'processing') {
    return 'shipped';
  }

  if (orderStatus === 'out_for_delivery') {
    return 'out_for_delivery';
  }

  // Check fulfillment details
  if (order.fulfillments && order.fulfillments.length > 0) {
    const latestFulfillment = order.fulfillments[order.fulfillments.length - 1];

    if (latestFulfillment.delivered_at) {
      return 'delivered';
    }

    if (latestFulfillment.shipped_at) {
      return 'out_for_delivery';
    }

    return 'shipped';
  }

  if (fulfillmentStatus === 'fulfilled' || fulfillmentStatus === 'partially_fulfilled') {
    return 'shipped';
  }

  // Payment-based status
  if (paymentStatus === 'captured') {
    return 'order_confirmed';
  }

  return 'order_placed';
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async (showRefreshIndicator = false) => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }
      const { orders } = await medusa.getOrders();
      setOrders(orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [isAuthenticated, authLoading]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchOrders(false); // Silent refresh
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const activeOrders = orders.filter(o => {
    const displayStatus = getOrderDisplayStatus(o);
    return ['order_placed', 'order_confirmed', 'shipped', 'out_for_delivery'].includes(displayStatus);
  });
  const pastOrders = orders.filter(o => {
    const displayStatus = getOrderDisplayStatus(o);
    return ['delivered', 'completed', 'cancelled'].includes(displayStatus);
  });

  const OrderCard = ({ order }: { order: Order }) => {
    const displayStatus = getOrderDisplayStatus(order);
    const status = statusConfig[displayStatus] || statusConfig.order_placed;
    const StatusIcon = status.icon;

    return (
      <Link href={`/orders/${order.id}`}>
        <Card className="group overflow-hidden border-0 hover:bg-gray-50 transition-all duration-300">
          <CardContent className="p-0">
            {/* Status Header */}
            <div className={`${status.bgColor} px-4 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-4 w-4 ${status.color}`} />
                <span className={`font-semibold text-sm ${status.color}`}>{t(status.labelKey, language)}</span>
              </div>
              <Badge variant="secondary" className="bg-white/80 text-gray-700 text-xs">
                #{order.display_id || order.id.slice(0, 8)}
              </Badge>
            </div>

            <div className="p-4 space-y-4">
              {/* Items Preview */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <div
                      key={i}
                      className="relative h-14 w-14 rounded-xs border-2 border-white overflow-hidden bg-gradient-to-br from-[#b18b5e]/5 to-[#b18b5e]/10"
                    >
                      <Image
                        src={item.thumbnail || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100'}
                        alt={item.title}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ))}
                  {(order.items?.length || 0) > 3 && (
                    <div className="relative h-14 w-14 rounded-xl border-2 border-white bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-gray-600">+{(order.items?.length || 0) - 3}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {language === 'ta' && order.items?.[0]?.product?.subtitle
                      ? order.items[0].product.subtitle.replace(/\s*\([^)]*\)\s*/g, '').trim()
                      : order.items?.[0]?.title || 'Order Items'}

                    {(order.items?.length || 0) > 1 && ` +${(order.items?.length || 0) - 1} ${t('more', language)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('qty', language)}: {(order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) / 2)} kg
                  </p>
                </div>
              </div>

              {/* Order Info */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(order.created_at).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[#b18b5e]">{formatPrice(order.total || 0)}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-[#b18b5e] via-[#b18b5e]/95 to-[#8c6b42] text-white">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-9 w-32 mb-2 bg-white/20" />
            <Skeleton className="h-5 w-48 bg-white/20" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xs overflow-hidden">
                <Skeleton className="h-12" />
                <div className="p-4 space-y-4">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Success Message */}
      {isSuccess && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <PartyPopper className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">{t('orderPlacedSuccessfully', language)}</p>
                <p className="text-sm text-green-100">{t('deliverFreshFishSoon', language)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-[#b18b5e] via-[#b18b5e]/95 to-[#8c6b42] text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">{t('myOrders', language)}</h1>
              </div>
              <p className="text-primary-foreground/80">{t('trackAndManageOrders', language)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 bg-white/10 hover:bg-white/20 text-white"
              onClick={() => fetchOrders(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {!isAuthenticated ? (
          <div className="text-center py-16">
            <div className="h-24 w-24 mx-auto bg-[#b18b5e]/10 rounded-full flex items-center justify-center mb-6">
              <Package className="h-12 w-12 text-[#b18b5e]" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t('pleaseLoginToViewOrders', language)}</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              {t('signInToTrackOrders', language)}
            </p>
            <Link href="/login">
              <Button size="lg" className="h-12 px-8">{t('signIn', language)}</Button>
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="h-24 w-24 mx-auto bg-[#b18b5e]/10 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="h-12 w-12 text-[#b18b5e]" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t('noOrdersYet', language)}</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              {t('startShoppingToSeeOrders', language)}
            </p>
            <Link href="/products">
              <Button size="lg" className="h-12 px-8 gap-2">
                <Sparkles className="h-5 w-5" />
                {t('startShopping', language)}
              </Button>
            </Link>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full justify-start mb-6 p-1 h-auto bg-transparent">
              <TabsTrigger
                value="active"
                className="flex-1 sm:flex-none rounded-xs px-6 py-3 data-[state=active]:bg-[#b18b5e] data-[state=active]:text-white"
              >
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {t('active', language)}
                  {activeOrders.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 data-[state=active]:bg-white/20 data-[state=active]:text-white">
                      {activeOrders.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="past"
                className="flex-1 sm:flex-none rounded-xs px-6 py-3 data-[state=active]:bg-[#b18b5e] data-[state=active]:text-white"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {t('pastOrders', language)}
                  {pastOrders.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5">
                      {pastOrders.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xs">
                  <div className="h-16 w-16 mx-auto flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground">{t('noActiveOrders', language)}</p>
                  <Link href="/products" className="inline-block mt-4">
                    <Button variant="outline">{t('browseProducts', language)}</Button>
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {activeOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastOrders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xs">
                  <div className="h-16 w-16 mx-auto flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-muted-foreground">{t('noPastOrders', language)}</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pastOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-[#b18b5e] via-[#b18b5e]/95 to-[#8c6b42] text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="h-10 w-32 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#b18b5e]" />
          </div>
        </div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
