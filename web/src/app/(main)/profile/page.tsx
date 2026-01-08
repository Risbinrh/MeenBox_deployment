'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  MapPin,
  Package,
  Gift,
  Wallet,
  Globe,
  Bell,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit,
  Copy,
  Check,
  Loader2,
  Mail,
  Phone,
  Settings,
  Shield,
  Star,
  Crown,
  Sparkles,
  Heart,
  FileText,
  MessageCircle,
  MoreVertical,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import { medusa, Product } from '@/lib/medusa';
import FreshCatchCard from '@/components/product/FreshCatchCard';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';


export default function ProfilePage() {
  const router = useRouter();
  const { language } = useLanguage();
  const { customer, isAuthenticated, isLoading, logout, updateProfile, refreshCustomer } = useAuth();

  const [copied, setCopied] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string | null>(searchParams.get('tab') || 'profile');

  // Update URL when section changes
  useEffect(() => {
    if (activeSection) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeSection);
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeSection]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const { wishlistItems } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showAddAddressDialog, setShowAddAddressDialog] = useState(false);
  const [addressForm, setAddressForm] = useState({
    first_name: '',
    last_name: '',
    address_1: '',
    address_2: '',
    city: '',
    postal_code: '',
    province: '',
    phone: '',
  });
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [editError, setEditError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (isAuthenticated) {
        try {
          const { orders: fetchedOrders } = await medusa.getOrders();
          // Sort orders by date descending
          const sortedOrders = (fetchedOrders || []).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          setOrders(sortedOrders);
          setOrderCount(sortedOrders.length);
        } catch (error) {
          console.error('Failed to fetch orders:', error);
        }
      }
    };
    fetchOrderCount();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (activeSection === 'wishlist' && wishlistItems.length > 0) {
        setIsLoadingWishlist(true);
        try {
          const { products } = await medusa.getProducts({
            id: wishlistItems,
            limit: 100,
          });
          setWishlistProducts(products);
        } catch (error) {
          console.error('Failed to fetch wishlist products:', error);
        } finally {
          setIsLoadingWishlist(false);
        }
      } else if (activeSection === 'wishlist' && wishlistItems.length === 0) {
        setWishlistProducts([]);
      }
    };
    fetchWishlistProducts();
  }, [activeSection, wishlistItems]);

  useEffect(() => {
    if (customer) {
      setEditForm({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone: customer.phone || '',
      });
    }
  }, [customer]);

  // Reset error when dialog opens/closes
  useEffect(() => {
    if (!showAddAddressDialog) {
      setAddressError('');
    }
  }, [showAddAddressDialog]);

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditForm({
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      phone: customer?.phone || '',
    });
    setEditError('');
    setShowEditDialog(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
    setEditError('');
  };

  const handleSaveProfile = async () => {
    if (!editForm.first_name.trim()) {
      setEditError(t('firstNameRequired', language));
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        phone: editForm.phone.trim() || undefined,
      });
      setShowEditDialog(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setEditError(t('failedToUpdateProfile', language));
    } finally {
      setIsSaving(false);
    }
  };

  const referralCode = customer?.email?.split('@')[0]?.toUpperCase().slice(0, 8) + '50' || 'FRESH50';

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validate Phone: Only numbers, max 10 digits
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setAddressForm(prev => ({ ...prev, [name]: numericValue }));
    }
    // Validate Postal Code: Only numbers, max 6 digits
    else if (name === 'postal_code') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setAddressForm(prev => ({ ...prev, [name]: numericValue }));
    }
    // Default handler
    else {
      setAddressForm(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user types
    if (addressError) setAddressError('');
  };

  const handleEditAddress = (addr: any) => {
    setAddressForm({
      first_name: addr.first_name || '',
      last_name: addr.last_name || '',
      address_1: addr.address_1 || '',
      address_2: addr.address_2 || '',
      city: addr.city || '',
      postal_code: addr.postal_code || '',
      province: addr.province || '',
      phone: addr.phone || '',
    });
    setEditingAddressId(addr.id);
    setShowAddAddressDialog(true);
    setActiveDropdownId(null);
  };

  const handleSaveAddress = async () => {
    // Validate required fields
    if (!addressForm.first_name || !addressForm.address_1 || !addressForm.city || !addressForm.postal_code || !addressForm.phone) {
      setAddressError('Please fill in all required fields');
      return;
    }

    // Validate Postal Code length
    if (addressForm.postal_code.length !== 6) {
      setAddressError('Postal code must be exactly 6 digits');
      return;
    }

    // Validate Phone length if provided
    if (addressForm.phone && addressForm.phone.length !== 10) {
      setAddressError('Phone number must be exactly 10 digits');
      return;
    }

    try {
      setIsSaving(true);
      setAddressError(''); // Clear any previous errors

      // Add/Update address via Medusa API
      if (editingAddressId) {
        await medusa.updateAddress(editingAddressId, addressForm);
      } else {
        await medusa.addAddress(addressForm);
      }

      // Refresh customer data to show new address without reload
      await refreshCustomer();

      // Reset form and close dialog
      setAddressForm({
        first_name: '',
        last_name: '',
        address_1: '',
        address_2: '',
        city: '',
        postal_code: '',
        province: '',
        phone: '',
      });
      setEditingAddressId(null);
      setShowAddAddressDialog(false);
    } catch (error) {
      console.error('Failed to save address:', error);
      setAddressError('Failed to save address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      setIsSaving(true);
      // Delete address via Medusa API
      await medusa.deleteAddress(addressId);

      // Refresh customer data to show updated addresses without reload
      await refreshCustomer();

      // Close dialog
      setShowDeleteDialog(false);
      setAddressToDelete(null);
    } catch (error) {
      console.error('Failed to delete address:', error);
      alert('Failed to delete address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setIsSaving(true);
      // Set address as default via Medusa API
      await medusa.setDefaultAddress(addressId);

      // Refresh customer data to show updated addresses without reload
      await refreshCustomer();
    } catch (error) {
      console.error('Failed to set default address:', error);
      alert('Failed to set default address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white pb-24 lg:pb-8">
        <div className="bg-gradient-to-r from-[#b18b5e] via-[#b18b5e]/95 to-[#b18b5e]/90">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full bg-white/20" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-40 bg-white/20" />
                <Skeleton className="h-4 w-48 bg-white/20" />
                <Skeleton className="h-4 w-32 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-3 gap-4 -mt-10">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 rounded-xs" />
            ))}
          </div>
          <Skeleton className="h-28 rounded-xs" />
          <Skeleton className="h-48 rounded-xs" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="h-20 w-20 mx-auto bg-[#b18b5e]/10 rounded-full flex items-center justify-center mb-6">
              <User className="h-10 w-10 text-[#b18b5e]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('pleaseLogin', language)}</h2>
            <p className="text-muted-foreground mb-8">{t('signInToViewOrderDetails', language)}</p>
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 rounded-xl">{t('signIn', language)}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = customer
    ? `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`.toUpperCase() || 'U'
    : 'U';

  // const menuItems = useMemo(() => [
  //   { icon: Package, label: td('myOrders', language), href: '/orders', badge: orderCount > 0 ? `${orderCount}` : undefined, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  //   { icon: MapPin, label: t('savedAddresses', language), href: '/profile/addresses', color: 'text-green-600', bgColor: 'bg-green-100' },
  //   { icon: Heart, label: t('wishlist', language), href: '/wishlist', color: 'text-red-500', bgColor: 'bg-red-100' },
  //   { icon: Gift, label: t('referralProgram', language), href: '/profile/referrals', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  //   { icon: Bell, label: t('notifications', language), href: '/profile/notifications', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  // ], [language, orderCount]);
  const menuItems = [
    { id: 'profile', icon: User, label: t('myAccount', language), href: '/profile', color: 'text-[#b18b5e]', bgColor: 'bg-[#b18b5e]/10' },
    { id: 'orders', icon: Package, label: t('myOrders', language), href: '/orders', badge: orderCount > 0 ? `${orderCount}` : undefined, color: 'text-[#b18b5e]', bgColor: 'bg-[#b18b5e]/10' },
    { id: 'address', icon: MapPin, label: t('savedAddresses', language), href: '/profile/addresses', color: 'text-[#b18b5e]', bgColor: 'bg-[#b18b5e]/10' },
    { id: 'wishlist', icon: Heart, label: t('wishlist', language), href: '/wishlist', color: 'text-[#b18b5e]', bgColor: 'bg-[#b18b5e]/10' },
    { id: 'logout', icon: LogOut, label: t('logout', language), href: '#', color: 'text-[#b18b5e]', bgColor: 'bg-[#b18b5e]/10' },
  ];

  // const settingsItems = useMemo(() => [
  //   { icon: Globe, label: language === 'ta' ? 'மொழி' : 'Language', href: '/profile/language', badge: language === 'ta' ? 'தமிழ்' : 'English' },
  //   { icon: Shield, label: language === 'ta' ? 'தனியுரிமை & பாதுகாப்பு' : 'Privacy & Security', href: '/profile/privacy' },
  //   { icon: FileText, label: language === 'ta' ? 'விதிமுறைகள் & நிபந்தனைகள்' : 'Terms & Conditions', href: '/terms' },
  //   { icon: HelpCircle, label: language === 'ta' ? 'உதவி & ஆதரவு' : 'Help & Support', href: '/help' },
  //   { icon: MessageCircle, label: language === 'ta' ? 'எங்களை தொடர்பு கொள்ளுங்கள்' : 'Contact Us', href: '/contact' },
  // ], [language]);

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#b18b5e] via-[#b18b5e]/95 to-[#8c6b42] text-white">
        <div className="container mx-auto px-4 py-8 pb-16">
          <h1 className="text-2xl sm:text-4xl font-bold">
            {t('welcome', language)}, {customer?.first_name || 'User'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        {/* Two Column Layout: Sidebar + Content */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Left Sidebar - Navigation Cards */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="p-0">
              <h3 className="text-lg font-bold p-6 pb-2 flex items-center gap-2 text-[#3d2b1f]">
                <User className="h-5 w-5 text-[#b18b5e]" />
                {t('myAccount', language)}
              </h3>

              {/* Circular Navigation Cards - Vertical Stack */}
              <div className="space-y-3">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <div
                      key={item.label}
                      onClick={() => {
                        if (item.id === 'logout') {
                          handleLogout();
                        } else {
                          setActiveSection(item.id);
                        }
                      }}
                      className={`group flex items-center gap-4 p-4 rounded-xs transition-all hover:bg-[#b18b5e]/5 cursor-pointer ${isActive ? 'bg-[#b18b5e]/10' : ''}`}
                    >
                      {/* Circular Icon */}
                      <div className={`relative h-12 w-12 ${item.bgColor} rounded-xs flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className={`h-6 w-6 ${item.color}`} />
                        {item.badge && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-[#b18b5e] rounded-xs flex items-center justify-center text-white text-xs font-bold">
                            {item.badge}
                          </div>
                        )}
                      </div>
                      {/* Label */}
                      <div className="flex-1">
                        <span className={`font-semibold text-sm ${isActive ? 'text-[#b18b5e]' : 'text-gray-900'} group-hover:text-[#b18b5e] transition-colors`}>
                          {item.label}
                        </span>
                      </div>
                      <ChevronRight className={`h-5 w-5 ${isActive ? 'text-[#b18b5e]' : 'text-gray-400'} group-hover:text-[#b18b5e] transition-colors`} />
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Content Area */}
          <div className="space-y-6">
            {!activeSection ? (
              /* Empty State */
              <Card className="">
                <CardContent className="py-24 text-center">
                  <div className="h-20 w-20 mx-auto bg-[#b18b5e]/10 rounded-xs flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-[#b18b5e]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to Your Account</h3>
                  <p className="text-muted-foreground">
                    Select an option from the menu to get started
                  </p>
                </CardContent>
              </Card>
            ) : activeSection === 'profile' ? (
              /* Profile Section */
              <Card className="">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {t('myAccount', language)}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowEditDialog(true)}
                    >
                      <Edit className="h-4 w-4" />
                      {t('editProfile', language)}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Avatar */}
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-[#b18b5e]/10">
                      <AvatarFallback className="bg-[#b18b5e] text-white text-3xl font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {customer?.first_name} {customer?.last_name}
                      </h3>
                      <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {customer?.email}
                      </p>
                      {customer?.phone && (
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                          <Phone className="h-4 w-4" />
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Account Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">{t('firstNameLabel', language)}</label>
                        <p className="text-base text-gray-900 mt-1">{customer?.first_name || t('default', language)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">{t('emailAddress', language)}</label>
                        <p className="text-base text-gray-900 mt-1">{customer?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">{t('lastNameLabel', language)}</label>
                        <p className="text-base text-gray-900 mt-1">{customer?.last_name || t('default', language)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">{t('phoneNumberLabel', language)}</label>
                        <p className="text-base text-gray-900 mt-1">{customer?.phone || t('default', language)}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Account Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-[#b18b5e]/10 rounded-xs">
                      <Package className="h-8 w-8 text-[#b18b5e] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{orderCount}</p>
                      <p className="text-sm text-muted-foreground">{t('orders', language)}</p>
                    </div>
                    <div className="text-center p-4 bg-[#b18b5e]/10 rounded-xs">
                      <MapPin className="h-8 w-8 text-[#b18b5e] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {(customer?.addresses?.length || customer?.shipping_addresses?.length || 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">{t('addresses', language)}</p>
                    </div>
                    <div className="text-center p-4 bg-[#b18b5e]/10 rounded-xs">
                      <Crown className="h-8 w-8 text-[#b18b5e] mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{t('member', language)}</p>
                      <p className="text-sm text-muted-foreground">{t('default', language)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : activeSection === 'orders' ? (
              /* My Orders Section */
              <Card className="border-b">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#b18b5e]" />
                    {t('myOrders', language)} ({orderCount})
                  </CardTitle >
                </CardHeader >
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="p-4 border-b border-gray-200 transition-colors cursor-pointer hover:bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {t('order', language)} #{order.display_id || order.id.slice(-8)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <Badge
                              className={`${order.fulfillment_status === 'fulfilled'
                                ? 'bg-green-100 text-green-700'
                                : order.fulfillment_status === 'shipped'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-orange-100 text-orange-700'
                                } border-0 rounded-xs`}
                            >
                              {order.fulfillment_status === 'fulfilled'
                                ? t('delivered', language)
                                : order.fulfillment_status === 'shipped'
                                  ? t('shipped', language)
                                  : order.fulfillment_status === 'not_fulfilled'
                                    ? t('confirmed', language)
                                    : t('confirmed', language)}
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-3">
                            {order.items?.slice(0, 2).map((item: any) => (
                              <div key={item.id} className="flex items-center gap-3 text-sm">
                                <div className="h-10 w-10 bg-gray-100 rounded-xs flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    {language === 'ta' && item.product_subtitle
                                      ? item.product_subtitle.replace(/\s*\([^)]*\)\s*/g, '').trim()
                                      : item.title}
                                  </p>
                                  <p className="text-muted-foreground">{t('qty', language)}: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                            {order.items?.length > 2 && (
                              <p className="text-sm text-muted-foreground pl-13">
                                +{order.items.length - 2} {t('more', language)} {t('items', language)}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="text-sm font-semibold text-gray-900">{t('total', language)}</span>
                            <span className="text-lg font-bold text-primary">
                              ₹{((order.total || 0) / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Package className="h-8 w-8 text-amber-600" />
                      </div>
                      <p className="text-lg font-semibold mb-2">{t('noOrdersYet', language)}</p>
                      <p className="text-muted-foreground mb-4">{t('startShoppingToSeeOrders', language)}</p>
                      <Link href="/products">
                        <Button>{t('browseProducts', language)}</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card >
            ) : activeSection === 'address' ? (
              /* Saved Addresses Section */
              <Card className="border-b">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-[#b18b5e]" />
                      {t('savedAddresses', language)}
                    </CardTitle >
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setShowAddAddressDialog(true)}
                    >
                      <MapPin className="h-4 w-4" />
                      {t('addNew', language)}
                    </Button>
                  </div >
                </CardHeader >
                <CardContent>
                  {(() => {
                    const rawAddresses = customer?.addresses || customer?.shipping_addresses || [];
                    const defaultId = customer?.shipping_address_id;
                    // Sort addresses: Default first, then others
                    const customerAddresses = [...rawAddresses].sort((a, b) => {
                      if (a.id === defaultId) return -1;
                      if (b.id === defaultId) return 1;
                      return 0;
                    });

                    return customerAddresses.length > 0 ? (
                      <div className="space-y-3">
                        {customerAddresses.map((addr, index) => (
                          <div key={addr.id || index} className="p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 bg-[#b18b5e]/10 rounded-xs flex items-center justify-center shrink-0">
                                <MapPin className="h-6 w-6 text-[#b18b5e]" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">
                                    {addr.first_name} {addr.last_name}
                                  </span>
                                  {index === 0 && (
                                    <Badge className="bg-green-100 text-green-700 text-xs border-0">{t('default', language)}</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{addr.address_1}</p>
                                {addr.address_2 && (
                                  <p className="text-sm text-muted-foreground">{addr.address_2}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                  {addr.city}, {addr.province} {addr.postal_code}
                                </p>
                                {addr.phone && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {t('phoneNumber', language)}: {addr.phone}
                                  </p>
                                )}
                              </div>

                              {/* Three-dot menu button */}
                              <div className="relative">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const id = addr.id || String(index);
                                    // Use setTimeout to avoid conflict with document click listener
                                    setTimeout(() => {
                                      setActiveDropdownId(activeDropdownId === id ? null : id);
                                    }, 0);
                                  }}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>

                                {/* Dropdown menu */}
                                {activeDropdownId === (addr.id || String(index)) && (
                                  <div
                                    className="absolute right-0 top-10 z-50 w-48 bg-white rounded-xs border border-gray-200 py-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {index !== 0 && (
                                      <button
                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                        onClick={() => {
                                          setActiveDropdownId(null);
                                          handleSetDefaultAddress(addr.id);
                                        }}
                                      >
                                        <Star className="h-4 w-4" />
                                        {language === 'ta' ? 'இயல்புநிலையாக அமை' : 'Set as Default'}
                                      </button>
                                    )}
                                    <button
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-blue-600"
                                      onClick={() => handleEditAddress(addr)}
                                    >
                                      <Edit className="h-4 w-4" />
                                      {language === 'ta' ? 'திருத்து' : 'Edit'}
                                    </button>
                                    <button
                                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                      onClick={() => {
                                        setActiveDropdownId(null);
                                        setAddressToDelete(addr.id);
                                        setShowDeleteDialog(true);
                                      }}
                                    >
                                      <Trash className="h-4 w-4" />
                                      {language === 'ta' ? 'நீக்கு' : 'Delete'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="h-16 w-16 mx-auto bg-[#b18b5e]/10 rounded-full flex items-center justify-center mb-4">
                          <MapPin className="h-8 w-8 text-[#b18b5e]" />
                        </div>
                        <p className="text-lg font-semibold mb-2">{t('noSavedAddresses', language)}</p>
                        <p className="text-muted-foreground mb-4">{t('addYourFirstAddress', language)}</p>
                        <Button
                          className="gap-2"
                          onClick={() => setShowAddAddressDialog(true)}
                        >
                          <MapPin className="h-4 w-4" />
                          {t('addNew', language)}
                        </Button>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card >
            ) : activeSection === 'wishlist' ? (
              /* Wishlist Section */
              <Card className="border-b">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-[#b18b5e] fill-current" />
                    {t('wishlist', language)} ({wishlistProducts.length})
                  </CardTitle >
                </CardHeader >
                <CardContent>
                  {isLoadingWishlist ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="aspect-[4/5] rounded-xs" />
                      ))}
                    </div>
                  ) : wishlistProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {wishlistProducts.map((product) => (
                        <div key={product.id} className="relative group">
                          <FreshCatchCard product={product} variant="centered" />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              // Use context directly if needed, but FreshCatchCard handles its own wishlist button state usually.
                              // However, refreshing the list in profile page might be needed.
                              // Actually, useWishlist context changes will trigger re-render of this page?
                              // Yes, because we consume useWishlist.
                            }}
                            className="hidden" // Hidden for now as FreshCatchCard has the button
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-16 w-16 mx-auto bg-[#b18b5e]/10 rounded-full flex items-center justify-center mb-4">
                        <Heart className="h-8 w-8 text-[#b18b5e]" />
                      </div>
                      <p className="text-lg font-semibold mb-2">{language === 'ta' ? 'உங்கள் விருப்ப பட்டியல் காலியாக உள்ளது' : 'Your wishlist is empty'}</p>
                      <p className="text-muted-foreground mb-4">{language === 'ta' ? 'நீங்கள் விரும்பும் பொருட்களை இங்கே சேமிக்கவும்' : 'Save items you love here for later'}</p>
                      <Link href="/products">
                        <Button className="gap-2">
                          {t('browseProducts', language)}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card >
            ) : null
            }
          </div >
        </div >
      </div >

      {/* Add/Edit Address Dialog */}
      <Dialog
        open={showAddAddressDialog}
        onOpenChange={(open) => {
          setShowAddAddressDialog(open);
          if (!open) setEditingAddressId(null);
        }}
      >
        <DialogContent className="sm:max-w-md rounded-xs">
          <DialogHeader>
            <div className="h-14 w-14 mx-auto bg-primary/10 rounded-xs flex items-center justify-center mb-2">
              <MapPin className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">
              {editingAddressId
                ? (language === 'ta' ? 'முகவரியை திருத்து' : 'Edit Address')
                : t('newDeliveryAddress', language)
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {addressError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2">
                <div className="h-1 w-1 bg-red-600 rounded-full" />
                {addressError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('firstNameLabel', language)} <span className="text-red-500">*</span></label>
                <Input
                  name="first_name"
                  value={addressForm.first_name}
                  onChange={handleAddressFormChange}
                  placeholder="First Name"
                  className="h-11 rounded-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('lastNameLabel', language)}</label>
                <Input
                  name="last_name"
                  value={addressForm.last_name}
                  onChange={handleAddressFormChange}
                  placeholder="Last Name"
                  className="h-11 rounded-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fullAddress', language)} <span className="text-red-500">*</span></label>
              <Input
                name="address_1"
                value={addressForm.address_1}
                onChange={handleAddressFormChange}
                placeholder="Address"
                className="h-11 rounded-xs"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('fullAddress', language)} 2 (Optional)</label>
              <Input
                name="address_2"
                value={addressForm.address_2}
                onChange={handleAddressFormChange}
                placeholder="Address Line 2"
                className="h-11 rounded-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('city', language)} <span className="text-red-500">*</span></label>
                <Input
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressFormChange}
                  placeholder="City"
                  className="h-11 rounded-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('pincode', language)} <span className="text-red-500">*</span></label>
                <Input
                  name="postal_code"
                  value={addressForm.postal_code}
                  onChange={handleAddressFormChange}
                  placeholder="Postal Code"
                  className="h-11 rounded-xs"
                  type="number"
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">State/Province</label>
                <Input
                  name="province"
                  value={addressForm.province}
                  onChange={handleAddressFormChange}
                  placeholder="State/Province"
                  className="h-11 rounded-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('phoneNumber', language)} <span className="text-red-500">*</span></label>
                <Input
                  name="phone"
                  value={addressForm.phone}
                  onChange={handleAddressFormChange}
                  placeholder="Phone Number"
                  className="h-11 rounded-xs"
                  type="number"
                  maxLength={10}
                  pattern="[0-9]{10}"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddAddressDialog(false)}
              className="flex-1 h-11 rounded-xs"
              disabled={isSaving}
            >
              {t('cancel', language)}
            </Button>
            <Button
              onClick={handleSaveAddress}
              className="flex-1 h-11 rounded-xs"
              disabled={isSaving}
            >
              {isSaving ? t('saving', language) : (editingAddressId ? (language === 'ta' ? 'புதுப்பி' : 'Update') : t('addNew', language))}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >



      {/* Delete Confirmation Dialog */}
      < Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog} >
        <DialogContent className="sm:max-w-md rounded-xs">
          <DialogHeader>
            <div className="h-14 w-14 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
              <Trash className="h-7 w-7 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl">{t('cancel', language)}?</DialogTitle>
          </DialogHeader>
          <div className="text-center py-2 px-4">
            <p className="text-gray-500">
              {t('cancelOrderConfirmation', language)}
            </p>
          </div>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="h-11 px-8 rounded-xs"
              disabled={isSaving}
            >
              {t('cancel', language)}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (addressToDelete) {
                  handleDeleteAddress(addressToDelete);
                }
              }}
              className="h-11 px-8 rounded-xs bg-red-600 hover:bg-red-700"
              disabled={isSaving}
            >
              {isSaving ? (language === 'ta' ? 'நீக்குகிறது...' : 'Deleting...') : (language === 'ta' ? 'நீக்கு' : 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Edit Profile Dialog */}
      < Dialog open={showEditDialog} onOpenChange={setShowEditDialog} >
        <DialogContent className="sm:max-w-md rounded-xs">
          <DialogHeader>
            <div className="h-14 w-14 mx-auto bg-primary/10 rounded-xs flex items-center justify-center mb-2">
              <User className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center text-xl">{t('editProfile', language)}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {editError && (
              <div className="p-4 rounded-xs bg-red-50 border border-red-200 text-red-700 text-sm">
                {editError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-2 block">{t('firstNameLabel', language)} *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="first_name"
                    placeholder="First Name"
                    value={editForm.first_name}
                    onChange={handleEditChange}
                    className="pl-11 h-11 rounded-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">{t('lastNameLabel', language)}</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="last_name"
                    placeholder="Last Name"
                    value={editForm.last_name}
                    onChange={handleEditChange}
                    className="pl-11 h-11 rounded-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">{t('email', language)}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={customer?.email || ''}
                  disabled
                  className="pl-11 h-11 rounded-xs bg-gray-50"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{t('emailCannotBeChanged', language)}</p>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">{t('phoneNumberLabel', language)}</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="phone"
                  placeholder="Phone Number"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="pl-11 h-11 rounded-xs"
                  maxLength={10}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1 h-11 rounded-xs">
              {t('cancel', language)}
            </Button>
            <Button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 h-11 rounded-xs bg-gradient-to-r from-[#b18b5e] to-[#8c6b42]">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('saving', language)}
                </>
              ) : (
                t('saveChanges', language)
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  );
}
