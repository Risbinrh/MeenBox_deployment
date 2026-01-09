'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Package,
  ShoppingBag,
  Loader2,
  XCircle,
  AlertTriangle,
  Receipt,
  CreditCard,
  Copy,
  Check,
  HelpCircle,
  MessageCircle,
  Sparkles,
  CalendarDays,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/context/AuthContext';
import { medusa, Order, formatPrice } from '@/lib/medusa';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

const statusConfig: Record<string, { labelKey: keyof typeof import('@/lib/translations').translations.en; color: string; bgColor: string; textColor: string; icon: React.ElementType }> = {
  'order_placed': { labelKey: 'orderPlaced', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: Clock },
  'order_confirmed': { labelKey: 'confirmed', color: 'bg-[#00bcd4]', bgColor: 'bg-[#00bcd4]/10', textColor: 'text-[#00bcd4]', icon: CheckCircle },
  'shipped': { labelKey: 'shipped', color: 'bg-[#0097a7]', bgColor: 'bg-[#0097a7]/10', textColor: 'text-[#0097a7]', icon: Package },
  'out_for_delivery': { labelKey: 'outForDelivery', color: 'bg-amber-500', bgColor: 'bg-amber-50', textColor: 'text-amber-700', icon: Truck },
  'delivered': { labelKey: 'delivered', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle },
  'cancelled': { labelKey: 'cancelled', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700', icon: XCircle },
  'completed': { labelKey: 'completed', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700', icon: CheckCircle },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await medusa.getOrder(orderId);
        if (result?.order) {
          console.log('[Order] Fetched order:', {
            id: result.order.id,
            status: result.order.status,
            fulfillment_status: result.order.fulfillment_status,
            payment_status: result.order.payment_status,
            raw: result.order,
          });
          setOrder(result.order);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchOrder();
    }
  }, [orderId, isAuthenticated, authLoading]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const result = await medusa.cancelOrder(orderId);
      if (result?.order) {
        setOrder(result.order);
        setShowCancelDialog(false);
      } else {
        alert('Failed to cancel order. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert('Failed to cancel order. Please try again or contact support.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order?.display_id?.toString() || orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const canCancelOrder = (order: Order): boolean => {
    const status = getDisplayStatus(order);
    return ['order_placed', 'order_confirmed'].includes(status);
  };

  const getDisplayStatus = (order: Order): string => {
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

  const buildTimeline = (order: Order, lang: typeof language) => {
    const displayStatus = getDisplayStatus(order);
    const createdAt = new Date(order.created_at);

    const statusOrder = ['order_placed', 'order_confirmed', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIndex = statusOrder.indexOf(displayStatus);

    const timeline = [
      {
        status: 'order_placed',
        time: createdAt.toLocaleTimeString(lang === 'ta' ? 'ta-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' }),
        date: createdAt.toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short' }),
        label: t('orderPlaced', lang),
        description: t('orderReceived', lang),
        completed: currentIndex >= 0,
        current: currentIndex === 0
      },
      {
        status: 'order_confirmed',
        time: '',
        date: '',
        label: t('confirmed', lang),
        description: t('paymentVerified', lang),
        completed: currentIndex >= 1,
        current: currentIndex === 1
      },
      {
        status: 'shipped',
        time: '',
        date: '',
        label: t('shipped', lang),
        description: t('orderDispatchedFromWarehouse', lang),
        completed: currentIndex >= 2,
        current: currentIndex === 2
      },
      {
        status: 'out_for_delivery',
        time: '',
        date: '',
        label: t('outForDelivery', lang),
        description: t('onWayToLocation', lang),
        completed: currentIndex >= 3,
        current: currentIndex === 3
      },
      {
        status: 'delivered',
        time: '',
        date: '',
        label: t('delivered', lang),
        description: t('orderDeliveredSuccess', lang),
        completed: currentIndex >= 4,
        current: currentIndex === 4
      },
    ];

    return timeline;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90">
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-5 w-28 mb-4 bg-white/20" />
            <Skeleton className="h-8 w-48 mb-2 bg-white/20" />
            <Skeleton className="h-5 w-64 bg-white/20" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-64 rounded-xs" />
          <Skeleton className="h-48 rounded-xs" />
          <Skeleton className="h-32 rounded-xs" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="h-20 w-20 mx-auto bg-primary/10 rounded-xs flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('pleaseLogin', language)}</h2>
            <p className="text-muted-foreground mb-8">{t('signInToViewOrderDetails', language)}</p>
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 rounded-xs">{t('signIn', language)}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="h-20 w-20 mx-auto bg-red-100 rounded-xs flex items-center justify-center mb-6">
              <Package className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('orderNotFound', language)}</h2>
            <p className="text-muted-foreground mb-8">{t('orderDoesNotExist', language)}</p>
            <Link href="/orders">
              <Button size="lg" className="h-12 px-8 rounded-xs">{t('backToOrders', language)}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const orderStatus = getDisplayStatus(order);
  const status = statusConfig[orderStatus] || statusConfig.order_placed;
  const StatusIcon = status.icon;
  const timeline = buildTimeline(order, language);

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-primary/95 to-primary/90 text-white">
        <div className="container mx-auto px-4 py-6">
          <Link href="/profile?tab=orders" className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            {t('backToOrders', language)}
          </Link >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold">{t('order', language)} #{order.display_id || orderId.slice(0, 8)}</h1>
                <button
                  onClick={handleCopyOrderId}
                  className="p-1.5 hover:bg-white/10 rounded-xs transition-colors"
                  title="Copy order ID"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-300" />
                  ) : (
                    <Copy className="h-4 w-4 text-white/70" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CalendarDays className="h-4 w-4" />
                <span className="text-sm">
                  {new Date(order.created_at).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canCancelOrder(order) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white gap-1.5 shrink-0 hidden sm:flex backdrop-blur-sm"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="h-4 w-4" />
                  {t('cancelOrder', language)}
                </Button>
              )}
              <Badge className={`${status.color} text-white px-3 py-1.5 text-sm font-medium shrink-0 rounded-xs`}>
                <StatusIcon className="h-4 w-4 mr-1.5" />
                {t(status.labelKey, language)}
              </Badge>
            </div>
          </div >
        </div >
      </div >

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Order Timeline */}
        <Card className="border-b">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {t('orderTimeline', language)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative pl-2">
              {timeline.map((step, index) => (
                <div key={step.status} className="flex gap-4 pb-6 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div className={`h-10 w-10 rounded-xs flex items-center justify-center transition-all ${step.completed
                      ? 'bg-gradient-to-br from-green-400 to-green-500 text-white'
                      : step.current
                        ? 'bg-gradient-to-br from-[#00bcd4] to-[#0097a7] text-white ring-4 ring-[#00bcd4]/20'
                        : 'bg-gray-100 text-gray-400'
                      }`}>
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : step.current ? (
                        <CircleDot className="h-5 w-5 animate-pulse" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    {index < timeline.length - 1 && (
                      <div className={`w-0.5 h-16 mt-2 rounded-full transition-colors ${timeline[index + 1].completed || timeline[index + 1].current ? 'bg-green-400' : 'bg-gray-200'
                        }`} />
                    )}
                  </div>
                  <div className="pt-1.5 flex-1">
                    <p className={`font-semibold ${step.completed || step.current ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    <p className={`text-sm ${step.completed || step.current ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                      {step.description}
                    </p>
                    {step.time && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {step.date} at {step.time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="border-b">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              {t('orderItems', language)} ({order.items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xs">
                <div className="relative h-20 w-20 rounded-xs overflow-hidden shrink-0 bg-white">
                  <Image
                    src={item.thumbnail || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200'}
                    alt={item.title}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm line-clamp-2">
                    {language === 'ta' && item.product_subtitle
                      ? item.product_subtitle.replace(/\s*\([^)]*\)\s*/g, '').trim()
                      : language === 'ta' && item.product?.subtitle
                        ? item.product.subtitle.replace(/\s*\([^)]*\)\s*/g, '').trim()
                        : item.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t('qty', language)}: {item.quantity / 2} kg
                  </p>
                  <p className="font-bold text-primary mt-1">{formatPrice(item.total || item.unit_price * item.quantity * 2)}</p>
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('subtotal', language)}</span>
                <span className="font-medium">{formatPrice(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('delivery', language)}</span>
                <span className={`font-medium ${order.shipping_total === 0 ? 'text-green-600' : ''}`}>
                  {order.shipping_total === 0 ? t('free', language).toUpperCase() : formatPrice(order.shipping_total || 0)}
                </span>
              </div>
              {order.tax_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('tax', language)}</span>
                  <span className="font-medium">{formatPrice(order.tax_total || 0)}</span>
                </div>
              )}
              {order.discount_total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('discount', language)}</span>
                  <span className="text-green-600 font-medium">-{formatPrice(order.discount_total)}</span>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">{t('total', language)}</span>
              <span className="font-bold text-xl text-primary">{formatPrice(order.total || 0)}</span>
            </div>

            {/* Payment Badge */}
            <div className={`flex items-center gap-3 p-3 rounded-xs mt-4 ${order.payment_status === 'captured'
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
              }`}>
              <CreditCard className={`h-5 w-5 ${order.payment_status === 'captured' ? 'text-green-600' : 'text-amber-600'
                }`} />
              <span className={`text-sm font-medium ${order.payment_status === 'captured' ? 'text-green-700' : 'text-amber-700'}
                }`}>
                {order.payment_status === 'captured' ? t('paymentSuccessful', language) : t('paymentPending', language)}
              </span >
            </div >
          </CardContent >
        </Card >

        {/* Delivery Address */}
        {
          order.shipping_address && (
            <Card className="border-b">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {t('deliveryAddress', language)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xs">
                  <div className="h-12 w-12 bg-primary/10 rounded-xs flex items-center justify-center shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {order.shipping_address.first_name} {order.shipping_address.last_name}
                    </p>
                    {order.shipping_address.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-3.5 w-3.5" />
                        {order.shipping_address.phone}
                      </p>
                    )}
                    <p className="text-sm mt-2">{order.shipping_address.address_1}</p>
                    {order.shipping_address.address_2 && (
                      <p className="text-sm">{order.shipping_address.address_2}</p>
                    )}
                    <p className="text-sm">
                      {order.shipping_address.city}
                      {order.shipping_address.province && `, ${order.shipping_address.province}`}
                      {order.shipping_address.postal_code && ` - ${order.shipping_address.postal_code}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        }

        {/* Help Section */}
        <Card className="border-b bg-gradient-to-br from-[#00bcd4]/10 to-[#0097a7]/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-white rounded-xs flex items-center justify-center shrink-0">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{t('needHelpWithOrder', language)}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {t('supportAvailable24x7', language)}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button variant="outline" size="sm" className="bg-white gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    {t('chatWithUs', language)}
                  </Button>
                  <Button variant="outline" size="sm" className="bg-white gap-1.5">
                    <Phone className="h-4 w-4" />
                    {t('callSupport', language)}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Desktop Actions */}
        <div className="hidden lg:flex gap-4">
          {canCancelOrder(order) && (
            <Button
              variant="outline"
              className="flex-1 h-12 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50 hover:border-red-300 gap-2"
              onClick={() => setShowCancelDialog(true)}
            >
              <XCircle className="h-5 w-5" />
              {t('cancelOrder', language)}
            </Button>
          )}
          <Link href="/products" className="flex-1">
            <Button className="w-full h-12 gap-2 bg-gradient-to-r from-[#00bcd4] to-[#0097a7] hover:from-[#00bcd4]/90 hover:to-[#0097a7]/90 rounded-xs">
              <Sparkles className="h-5 w-5" />
              {t('shopAgain', language)}
            </Button>
          </Link>
        </div>
      </div >

      {/* Mobile Fixed Bottom Bar */}
      < div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50" >
        <div className="flex gap-3">
          {canCancelOrder(order) ? (
            <>
              <Button
                variant="outline"
                className="flex-1 h-12 text-red-600 border-red-200 hover:text-red-700 hover:bg-red-50"
                onClick={() => setShowCancelDialog(true)}
              >
                <XCircle className="h-5 w-5 mr-2" />
                {t('cancel', language)}
              </Button>
              <Link href="/products" className="flex-1">
                <Button className="w-full h-12 gap-2 bg-gradient-to-r from-[#00bcd4] to-[#0097a7] rounded-xs">
                  <Sparkles className="h-5 w-5" />
                  {t('shopAgain', language)}
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/products" className="flex-1">
              <Button className="w-full h-12 gap-2 bg-gradient-to-r from-[#00bcd4] to-[#0097a7] rounded-xs">
                <Sparkles className="h-5 w-5" />
                {t('shopAgain', language)}
              </Button>
            </Link>
          )}
        </div>
      </div >

      {/* Cancel Order Confirmation Dialog */}
      < AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog} >
        <AlertDialogContent className="rounded-xs">
          <AlertDialogHeader>
            <div className="h-16 w-16 mx-auto bg-red-100 rounded-xs flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <AlertDialogTitle className="text-center text-xl">
              {t('cancelOrderQuestion', language)}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('cancelOrderConfirmation', language)}
              {order.payment_status === 'captured' && (
                <span className="block mt-3 p-3 bg-[#00bcd4]/10 rounded-xs text-[#0097a7] text-sm">
                  {t('paymentRefundInfo', language)}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-row gap-3 mt-4">
            <AlertDialogCancel disabled={isCancelling} className="flex-1 h-12 rounded-xs">
              {t('keepOrder', language)}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="flex-1 h-12 bg-red-500 text-white hover:bg-red-600 rounded-xs"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {t('cancelling', language)}
                </>
              ) : (
                t('yesCancelOrder', language)
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog >
    </div >
  );
}
