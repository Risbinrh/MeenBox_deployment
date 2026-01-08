'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, MapPin, Menu, Fish } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import LanguageDropdown from '@/components/LanguageDropdown';



export default function Header() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { isAuthenticated, customer } = useAuth();
  const { language } = useLanguage();

  const navigation = [
    { name: t('home', language), href: '/' },
    { name: t('products', language), href: '/products' },
    { name: t('about', language), href: '/about' },
  ];
  const [location] = useState('Chennai, Tamil Nadu');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear the search input after navigation
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* Top bar - Location */}
      <div className="border-b bg-white/5">
        <div className="container mx-auto px-4 py-1.5">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{t('deliveringTo', language)} </span>
              <button className="font-medium text-[#b18b5e] hover:underline">
                {t('locationCity', language)}
              </button>
            </div>
            <div className="hidden md:flex items-center gap-4 text-muted-foreground">
              <Link href="/orders" className="hover:text-[#b18b5e]">{t('trackOrder', language)}</Link>
              <Link href="/help" className="hover:text-[#b18b5e]">{t('help', language)}</Link>
              <LanguageDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-6">
        <div className="flex h-24 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Meen Box"
              width={160}
              height={60}
              className="h-20 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder={t('searchPlaceholder', language)}
                className="w-full h-11 pl-6 pr-12 rounded-xs border-gray-200 bg-gray-50 focus-visible:ring-[#b18b5e]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-11 w-11 rounded-xs bg-[#b18b5e] hover:bg-[#8c6b42] flex items-center justify-center transition-colors"
              >
                <Search className="h-4 w-4 text-white" />
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-[#b18b5e] transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Mobile */}
            <Button variant="ghost" size="icon" className="md:hidden rounded-xs">
              <Search className="h-5 w-5" />
            </Button>

            {/* User */}
            <Link href={isAuthenticated ? '/profile' : '/login'}>
              <Button variant="ghost" size="icon" className="relative rounded-xs hover:bg-[#b18b5e]">
                <User className="h-5 w-5" />
                {isAuthenticated && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-xs bg-green-500" />
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative rounded-xs hover:bg-[#b18b5e]">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center rounded-xs justify-center p-0 text-xs bg-[#b18b5e] text-white">
                    {itemCount > 99 ? '99+' : itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col gap-6 mt-6">
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="search"
                      placeholder={t('search', language)}
                      className="w-full h-11 pl-6 pr-12 rounded-full border-gray-200 bg-gray-50 focus-visible:ring-[#b18b5e]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-1 top-1 h-9 w-9 rounded-full bg-[#b18b5e] hover:bg-[#8c6b42] flex items-center justify-center transition-colors"
                    >
                      <Search className="h-4 w-4 text-white" />
                    </button>
                  </form>
                  <nav className="flex flex-col gap-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-lg font-medium hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="border-t pt-4">
                    {isAuthenticated ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          {t('welcome', language)}, {customer?.first_name || 'User'}!
                        </p>
                        <Link href="/profile">
                          <Button variant="outline" className="w-full">{t('myAccount', language)}</Button>
                        </Link>
                        <Link href="/orders">
                          <Button variant="outline" className="w-full">{t('myOrders', language)}</Button>
                        </Link>
                      </div>
                    ) : (
                      <Link href="/login">
                        <Button className="w-full">{t('loginRegister', language)}</Button>
                      </Link>
                    )}
                    <div className="mt-4 pt-4 border-t">
                      <LanguageDropdown />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
