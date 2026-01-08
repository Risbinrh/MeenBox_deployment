'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  CreditCard,
  Wallet,
  Banknote,
  Check,
  Loader2,
  CheckCircle,
  Package,
  Truck,
  Plus,
  MapPin,
  Clock,
  ShieldCheck,
  User,
  Phone,
  Home,
  Building2,
  Navigation,
  Calendar,
  Sparkles,
  Gift,
  BadgePercent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { medusa, formatPrice } from '@/lib/medusa';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

const deliverySlots = [
  { id: 'sunrise', name: 'Sunrise Fresh', tamilName: 'சூரிய உதய புதியது', time: '6:00 AM - 8:00 AM', tamilTime: 'காலை 6:00 - 8:00', price: 0, icon: '🌅', popular: false },
  { id: 'morning', name: 'Morning Delivery', tamilName: 'காலை டெலிவரி', time: '8:00 AM - 12:00 PM', tamilTime: 'காலை 8:00 - மதியம் 12:00', price: 0, icon: '🌞', popular: true },
  { id: 'evening', name: 'Evening Delivery', tamilName: 'மாலை டெலிவரி', time: '4:00 PM - 7:00 PM', tamilTime: 'மாலை 4:00 - 7:00', price: 3000, icon: '🌆', popular: false },
];

const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', tamilName: 'பணம் டெலிவரியில்', descKey: 'payWhenReceive', icon: Banknote, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { id: 'upi', name: 'UPI Payment', tamilName: 'UPI கட்டணம்', descKey: 'upiDescription', icon: Wallet, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { id: 'card', name: 'Credit/Debit Card', tamilName: 'கிரெடிட்/டெபிட் கார்டு', descKey: 'cardDescription', icon: CreditCard, color: 'text-[#b18b5e]', bgColor: 'bg-[#b18b5e]/10' },
];

// Helper function to get product name in the correct language
const getProductName = (item: any, language: string) => {
  if (language !== 'ta') return item.title;
  console.log("item", item)
  // Try to get Tamil name from various sources
  const tamilName =
    item?.product?.subtitle ||
    item.variant?.product?.metadata?.tamil_name ||
    item.metadata?.tamil_name ||
    item.subtitle;

  if (tamilName) {
    // Remove English text in parentheses
    return (tamilName as string).replace(/\s*\([^)]*\)\s*/g, '').trim();
  }

  return item.title;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, refreshCart } = useCart();
  const { customer, isAuthenticated, isLoading: authLoading } = useAuth();
  const { processPayment, isLoading: paymentLoading } = useRazorpay();
  const { language } = useLanguage();

  const [step, setStep] = useState<'checkout' | 'processing' | 'success'>('checkout');
  const [selectedSlot, setSelectedSlot] = useState('morning');
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [address, setAddress] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address_1: '',
    city: 'Chennai',
    postal_code: '',
    country_code: 'in',
  });

  // Get saved addresses
  const savedAddresses = customer?.addresses || customer?.shipping_addresses || [];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated && step !== 'success') {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, isAuthenticated, router, step]);

  // Pre-fill name/phone from customer for new address form
  useEffect(() => {
    if (customer && !selectedAddressId) {
      setAddress(prev => ({
        ...prev,
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone: customer.phone || '',
      }));
    }
  }, [customer, selectedAddressId]);

  // Show new address form if no saved addresses
  useEffect(() => {
    if (savedAddresses.length === 0) {
      setShowNewAddressForm(true);
    }
  }, [savedAddresses.length]);

  // Handle address selection
  const handleSelectAddress = (addr: typeof savedAddresses[0]) => {
    setSelectedAddressId(addr.id);
    setShowNewAddressForm(false);
    setAddress({
      first_name: addr.first_name || '',
      last_name: addr.last_name || '',
      phone: addr.phone || '',
      address_1: addr.address_1 || '',
      city: addr.city || 'Chennai',
      postal_code: addr.postal_code || '',
      country_code: 'in',
    });
  };

  // Handle add new address button
  const handleAddNewAddress = () => {
    setSelectedAddressId(null);
    setShowNewAddressForm(true);
    setAddress({
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      phone: customer?.phone || '',
      address_1: '',
      city: 'Chennai',
      postal_code: '',
      country_code: 'in',
    });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 mx-auto rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Package className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-4 text-muted-foreground">{t('loadingCheckout', language)}</p>
        </div>
      </div>
    );
  }

  // Don't render checkout if not authenticated (will redirect)
  if (!isAuthenticated && step !== 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('redirectingToLogin', language)}</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    if (step === 'success') {
      // Show success page even if cart is empty (just completed order)
    } else {
      return (
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-24 w-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-6">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h1 className="text-2xl font-bold mb-2">{t('yourCartIsEmpty', language)}</h1>
              <p className="text-muted-foreground mb-6">{t('discoverMeenbox', language)}</p>
              <Link href="/products">
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  {t('exploreProducts', language)}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  const subtotal = cart?.subtotal || 0;
  const deliveryCharge = deliverySlots.find(s => s.id === selectedSlot)?.price || 0;
  const taxAmount = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + deliveryCharge + taxAmount;

  const validateForm = () => {
    if (!address.first_name || !address.phone || !address.address_1 || !address.postal_code) {
      setError('Please fill in all required fields (Name, Phone, Address, Pincode)');
      return false;
    }
    setError(null);
    return true;
  };

  const completeOrder = async (razorpayPaymentId?: string) => {
    // Save the total before clearing cart
    setOrderTotal(total);

    try {
      if (cart?.id) {
        const result = await medusa.completeCart(cart.id);
        if (result?.data) {
          setOrderId(result.data.display_id?.toString() || result.data.id.slice(-8).toUpperCase());
        } else {
          setOrderId('FC' + Date.now().toString().slice(-8));
        }
      } else {
        setOrderId('FC' + Date.now().toString().slice(-8));
      }

      if (razorpayPaymentId) {
        setPaymentId(razorpayPaymentId);
      }

      localStorage.removeItem('freshcatch_cart_id');
      await refreshCart();
      setStep('success');
    } catch (error) {
      console.error('Failed to complete order:', error);
      setOrderId('FC' + Date.now().toString().slice(-8));
      if (razorpayPaymentId) {
        setPaymentId(razorpayPaymentId);
      }
      localStorage.removeItem('freshcatch_cart_id');
      await refreshCart();
      setStep('success');
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    // Ensure customer is authenticated for first order
    if (!isAuthenticated || !customer?.email) {
      setError('Please log in to place an order');
      router.push('/login?redirect=/checkout');
      return;
    }

    setIsProcessing(true);

    try {
      if (cart) {
        const updateResult = await medusa.updateCart(cart.id, {
          email: customer.email,
        });

        if (!updateResult?.cart) {
          console.error('Failed to associate cart with customer');
          setError('Something went wrong with your session. Please try refreshing the page.');
          return;
        }

        // Update address separately to avoid failing the customer association
        await medusa.updateCart(cart.id, {
          shipping_address: address,
          billing_address: address,
        });

        try {
          const { shipping_options } = await medusa.getShippingOptions(cart.id);
          if (shipping_options && shipping_options.length > 0) {
            await medusa.addShippingMethod(cart.id, shipping_options[0].id);
          }
        } catch (shippingError) {
          console.warn('[Checkout] Failed to get shipping options:', shippingError);
        }

        try {
          const paymentCollection = await medusa.createPaymentCollection(cart.id);
          if (paymentCollection?.payment_collection?.id) {
            await medusa.initializePaymentSession(
              paymentCollection.payment_collection.id,
              'pp_system_default'
            );
          }
        } catch (paymentError) {
          console.warn('[Checkout] Failed to set up payment:', paymentError);
        }
      }

      if (selectedPayment === 'cod') {
        setStep('processing');
        await new Promise(resolve => setTimeout(resolve, 1500));
        await completeOrder();
      } else {
        setStep('processing');

        const result = await processPayment({
          amount: total,
          cartId: cart?.id,
          customerName: `${address.first_name} ${address.last_name}`,
          customerEmail: customer?.email,
          customerPhone: address.phone,
          description: `FreshCatch Order - ${cart?.items.length} items`,
        });

        if (result.success && result.razorpay_payment_id) {
          await completeOrder(result.razorpay_payment_id);
        } else {
          setError(result.error || 'Payment failed. Please try again.');
          setStep('checkout');
        }
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      setError('Failed to place order. Please try again.');
      setStep('checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  // Get delivery date text
  const getDeliveryDateText = () => {
    const today = new Date();
    const deliveryDate = selectedDate === 'today' ? today : new Date(today.setDate(today.getDate() + 1));
    return deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  // Processing Screen
  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="relative mb-8">
            <div className="h-32 w-32 mx-auto">
              <div className="absolute inset-0 rounded-xs border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-4 rounded-xs bg-primary/10 flex items-center justify-center">
                <Package className="h-12 w-12 text-primary animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('processingOrder', language)}</h2>
          <p className="text-muted-foreground mb-6">{t('pleaseWait', language)}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span>{t('secureCheckoutBy', language)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Success Screen
  if (step === 'success') {
    const selectedSlotInfo = deliverySlots.find(s => s.id === selectedSlot);

    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-lg mx-auto">
            {/* Success Animation */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="h-28 w-28 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-14 w-14 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <span className="text-3xl animate-bounce inline-block">🎉</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-green-700 mb-2">{t('orderConfirmed', language)}</h1>
              <p className="text-muted-foreground">
                {t('MeenboxPrepared', language)}
              </p>
            </div>

            {/* Order Details Card */}
            <Card className="mb-6 overflow-hidden border-green-200">
              <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">{t('orderId', language)}</p>
                    <p className="font-bold text-xl">#{orderId}</p>
                  </div>
                  <div className="h-12 w-12 bg-white/20 rounded-xs flex items-center justify-center">
                    <Package className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                {/* Delivery Info */}
                <div className="flex items-start gap-4 p-4 bg-[#b18b5e]/10 rounded-xs">
                  <div className="h-10 w-10 bg-[#b18b5e]/20 rounded-xs flex items-center justify-center shrink-0">
                    <Truck className="h-5 w-5 text-[#b18b5e]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#3d2b1f]">{t('deliveryScheduled', language)}</p>
                    <p className="text-[#8c6b42]">
                      {selectedDate === 'today' ? t('today', language) : t('tomorrow', language)}, {language === 'ta' ? selectedSlotInfo?.tamilTime : selectedSlotInfo?.time}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xl">{selectedSlotInfo?.icon}</span>
                      <span className="text-sm text-[#b18b5e]">{language === 'ta' ? selectedSlotInfo?.tamilName : selectedSlotInfo?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-xs flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{t('deliveryAddress', language)}</p>
                    <p className="text-muted-foreground text-sm">
                      {address.first_name} {address.last_name}
                    </p>
                    <p className="text-muted-foreground text-sm">{address.address_1}</p>
                    <p className="text-muted-foreground text-sm">{address.city} - {address.postal_code}</p>
                  </div>
                </div>

                {/* Payment */}
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-xs flex items-center justify-center shrink-0">
                    {selectedPayment === 'cod' ? (
                      <Banknote className="h-5 w-5 text-green-600" />
                    ) : (
                      <CreditCard className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{t('payment', language)}</p>
                    <p className="text-muted-foreground text-sm">
                      {language === 'ta'
                        ? paymentMethods.find(p => p.id === selectedPayment)?.tamilName
                        : paymentMethods.find(p => p.id === selectedPayment)?.name
                      }
                      {selectedPayment !== 'cod' && (
                        <Badge variant="secondary" className="ml-2 text-green-700 bg-green-100">{t('paid', language)}</Badge>
                      )}
                    </p>
                    {paymentId && (
                      <p className="text-xs text-muted-foreground mt-1">Txn: {paymentId}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center py-2">
                  <span className="text-lg font-semibold">{t('totalAmount', language)}</span>
                  <span className="text-2xl font-bold text-primary">{formatPrice(orderTotal)}</span>
                </div>
              </CardContent>
            </Card>

            {/* SMS Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-xs p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-100 rounded-xs flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">{t('smsConfirmation', language)}</p>
                  <p className="text-sm text-amber-700">{t('orderDetailsSent', language)} {address.phone}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/orders" className="flex-1">
                <Button variant="outline" className="w-full h-12 gap-2" size="lg">
                  <Package className="h-5 w-5" />
                  {t('trackOrder', language)}
                </Button>
              </Link>
              <Link href="/products" className="flex-1">
                <Button className="w-full h-12 gap-2" size="lg">
                  <Sparkles className="h-5 w-5" />
                  {t('continueShopping', language)}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Checkout Form
  return (
    <div className="min-h-screen bg-white pb-32 lg:pb-6">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">{t('backToCart', language)}</span>
            </Link>
            <h1 className="text-lg font-bold">{t('secureCheckout', language)}</h1>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">{t('secure', language)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-xs bg-primary text-white flex items-center justify-center text-xs font-medium">1</div>
              <span className="hidden sm:inline font-medium text-primary">{t('address', language)}</span>
            </div>
            <div className="w-8 h-0.5 bg-primary/30" />
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-xs bg-primary text-white flex items-center justify-center text-xs font-medium">2</div>
              <span className="hidden sm:inline font-medium text-primary">{t('deliveryTime', language)}</span>
            </div>
            <div className="w-8 h-0.5 bg-primary/30" />
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-xs bg-primary text-white flex items-center justify-center text-xs font-medium">3</div>
              <span className="hidden sm:inline font-medium text-primary">{t('payment', language)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xs bg-primary text-white flex items-center justify-center text-sm font-bold">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span>{t('deliveryAddress', language)}</span>
                  </CardTitle>
                  {savedAddresses.length > 0 && !showNewAddressForm && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddNewAddress}
                      className="gap-1.5 border-primary text-primary hover:bg-primary hover:text-white"
                    >
                      <Plus className="h-4 w-4" />
                      {t('addNew', language)}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {/* Saved Addresses */}
                {savedAddresses.length > 0 && !showNewAddressForm && (
                  <div className="grid gap-3">
                    {savedAddresses.map((addr, index) => (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr)}
                        className={`p-4 rounded-xs border-2 cursor-pointer transition-all duration-200 ${selectedAddressId === addr.id
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : 'border-gray-200 hover:border-primary/50 hover:shadow-sm'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'bg-primary text-white' : 'bg-gray-100'
                            }`}>
                            {index === 0 ? <Home className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">{addr.first_name} {addr.last_name}</p>
                              {index === 0 && (
                                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">{t('default', language)}</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{addr.address_1}</p>
                            <p className="text-sm text-muted-foreground">{addr.city} - {addr.postal_code}</p>
                            {addr.phone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" /> {addr.phone}
                              </p>
                            )}
                          </div>
                          <div className={`h-6 w-6 rounded-xs border-2 flex items-center justify-center transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-primary' : 'border-gray-300'
                            }`}>
                            {selectedAddressId === addr.id && <Check className="h-4 w-4 text-white" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Address Form */}
                {showNewAddressForm && (
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <div className="flex items-center justify-between pb-2 border-b">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-primary" />
                          <span className="font-medium">{t('newDeliveryAddress', language)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowNewAddressForm(false);
                            if (savedAddresses.length > 0) {
                              handleSelectAddress(savedAddresses[0]);
                            }
                          }}
                          className="text-muted-foreground"
                        >
                          {t('cancel', language)}
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          {t('firstName', language)} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={address.first_name}
                          onChange={(e) => setAddress({ ...address, first_name: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('lastName', language)}</label>
                        <Input
                          value={address.last_name}
                          onChange={(e) => setAddress({ ...address, last_name: e.target.value })}
                          className="h-11"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {t('phoneNumber', language)} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        className="h-11"
                        maxLength={10}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {t('fullAddress', language)} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={address.address_1}
                        onChange={(e) => setAddress({ ...address, address_1: e.target.value })}
                        className="h-11"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">{t('city', language)}</label>
                        <Input
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                          {t('pincode', language)} <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={address.postal_code}
                          onChange={(e) => setAddress({ ...address, postal_code: e.target.value })}
                          className="h-11"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* No address selected message */}
                {!selectedAddressId && !showNewAddressForm && savedAddresses.length > 0 && (
                  <div className="text-center py-6 bg-amber-50 rounded-xs">
                    <MapPin className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-amber-700 font-medium">{t('pleaseSelectAddress', language)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Delivery Time */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#b18b5e]/10 to-transparent pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xs bg-[#b18b5e] text-white flex items-center justify-center text-sm font-bold">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span>{t('deliveryTime', language)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Date Selection */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('selectDate', language)}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSelectedDate('today')}
                      className={`p-3 rounded-xs border-2 text-center transition-all ${selectedDate === 'today'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-200 hover:border-primary/50'
                        }`}
                    >
                      <p className="font-semibold">{t('today', language)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </button>
                    <button
                      onClick={() => setSelectedDate('tomorrow')}
                      className={`p-3 rounded-xs border-2 text-center transition-all ${selectedDate === 'tomorrow'
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-gray-200 hover:border-primary/50'
                        }`}
                    >
                      <p className="font-semibold">{t('tomorrow', language)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(Date.now() + 86400000).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </button>
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('selectTimeSlot', language)}
                  </p>
                  <div className="grid gap-3">
                    {deliverySlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.id)}
                        className={`p-4 rounded-xs border-2 text-left transition-all ${selectedSlot === slot.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-200 hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{slot.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{language === 'ta' ? slot.tamilName : slot.name}</p>
                                {slot.popular && (
                                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">{t('popular', language)}</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{language === 'ta' ? slot.tamilTime : slot.time}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {slot.price === 0 ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">FREE</Badge>
                            ) : (
                              <span className="font-semibold">{formatPrice(slot.price)}</span>
                            )}
                            <div className={`h-5 w-5 rounded-xs border-2 flex items-center justify-center ${selectedSlot === slot.id ? 'border-primary bg-primary' : 'border-gray-300'
                              }`}>
                              {selectedSlot === slot.id && <Check className="h-3 w-3 text-white" />}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 3: Payment Method */}
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xs bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span>{t('paymentMethod', language)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`p-4 rounded-xs border-2 text-left transition-all ${selectedPayment === method.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-gray-200 hover:border-primary/50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xs ${method.bgColor} flex items-center justify-center`}>
                              <Icon className={`h-6 w-6 ${method.color}`} />
                            </div>
                            <div>
                              <p className="font-semibold">{language === 'ta' ? method.tamilName : method.name}</p>
                              <p className="text-sm text-muted-foreground">{t(method.descKey as any, language)}</p>
                            </div>
                          </div>
                          <div className={`h-5 w-5 rounded-xs border-2 flex items-center justify-center ${selectedPayment === method.id ? 'border-primary bg-primary' : 'border-gray-300'
                            }`}>
                            {selectedPayment === method.id && <Check className="h-3 w-3 text-white" />}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Security Badge */}
                <div className="mt-4 p-3 bg-gray-50 rounded-xs flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span>{t('securePayments', language)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <Card className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {t('orderSummary', language)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {/* Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {cart?.items.map((item) => (
                      <div key={item.id} className="flex gap-3 p-2 rounded-xs hover:bg-gray-50 transition-colors">
                        <div className="relative h-16 w-16 rounded-xs overflow-hidden shrink-0 bg-gray-100">
                          <Image
                            src={item.thumbnail || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100'}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white rounded-xs text-xs flex items-center justify-center font-medium">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-2">
                            {getProductName(item, language)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {item.quantity} kg × {formatPrice((item.unit_price || 0) * 2)}/kg
                          </p>
                        </div>
                        <p className="font-semibold text-sm">{formatPrice(item.total || (item.unit_price || 0) * item.quantity * 2)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Coupon Section */}
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xs text-sm">
                    <Gift className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700">{t('haveCoupon', language)}</span>
                    <Button variant="link" className="p-0 h-auto text-amber-700 font-semibold">{t('apply', language)}</Button>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('subtotal', language)} ({cart?.items.length} {t('items', language)})</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === 'ta' ? 'டெலிவரி கட்டணம்' : 'Delivery Fee'}</span>
                      {deliveryCharge === 0 ? (
                        <span className="text-green-600 font-medium">{t('free', language).toUpperCase()}</span>
                      ) : (
                        <span className="font-medium">{formatPrice(deliveryCharge)}</span>
                      )}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{language === 'ta' ? 'வரி (5%)' : 'GST (5%)'}</span>
                      <span className="font-medium">{formatPrice(taxAmount)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-lg">{t('total', language)}</span>
                      <p className="text-xs text-muted-foreground">{t('inclusiveTaxes', language)}</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xs text-sm flex items-start gap-2 mb-4 animate-in fade-in slide-in-from-top-1">
                      <ShieldCheck className="h-4 w-4 shrink-0 rotate-180 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  )}

                  {/* Place Order Button */}
                  <Button
                    className={`w-full h-14 text-base font-semibold ${selectedPayment === 'cod'
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      }`}
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || paymentLoading || (!selectedAddressId && !showNewAddressForm)}
                  >
                    {isProcessing || paymentLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        {language === 'ta' ? 'செயலாக்குகிறது...' : 'Processing...'}
                      </>
                    ) : selectedPayment === 'cod' ? (
                      <>
                        <Banknote className="h-5 w-5 mr-2" />
                        {language === 'ta' ? 'ஆர்டர் செய்யவும் (COD)' : 'Place Order (COD)'}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-5 w-5 mr-2" />
                        {language === 'ta' ? `${formatPrice(total)} செலுத்தவும்` : `Pay ${formatPrice(total)}`}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    {language === 'ta'
                      ? <>இந்த ஆர்டரை செய்வதன் மூலம், எங்கள் <Link href="/terms" className="text-primary hover:underline">சேவை விதிமுறைகளை</Link> ஏற்றுக்கொள்கிறீர்கள்</>
                      : <>By placing this order, you agree to our <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link></>
                    }
                  </p>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-white rounded-xs border">
                  <Truck className="h-5 w-5 mx-auto text-primary mb-1" />
                  <p className="text-xs text-muted-foreground">{t('fastDelivery', language)}</p>
                </div>
                <div className="text-center p-2 bg-white rounded-xs border">
                  <ShieldCheck className="h-5 w-5 mx-auto text-green-600 mb-1" />
                  <p className="text-xs text-muted-foreground">{language === 'ta' ? 'பாதுகாப்பான பணம்' : 'Secure Pay'}</p>
                </div>
                <div className="text-center p-2 bg-white rounded-xs border">
                  <BadgePercent className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                  <p className="text-xs text-muted-foreground">{language === 'ta' ? 'சிறந்த விலை' : 'Best Price'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">{t('totalAmount', language)}</p>
            <p className="text-xl font-bold text-primary">{formatPrice(total)}</p>
          </div>
          <Button
            className={`h-12 px-6 text-base font-semibold ${selectedPayment === 'cod'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600'
              : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}
            onClick={handlePlaceOrder}
            disabled={isProcessing || paymentLoading || (!selectedAddressId && !showNewAddressForm)}
          >
            {isProcessing || paymentLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : selectedPayment === 'cod' ? (
              language === 'ta' ? 'ஆர்டர் செய்யவும்' : 'Place Order'
            ) : (
              language === 'ta' ? `${formatPrice(total)} செலுத்தவும்` : `Pay ${formatPrice(total)}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
