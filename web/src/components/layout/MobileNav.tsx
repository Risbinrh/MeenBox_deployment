'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, ClipboardList, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function MobileNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Search', href: '/products', icon: Search },
    { name: 'Cart', href: '/cart', icon: ShoppingCart, badge: itemCount },
    { name: 'Orders', href: '/orders', icon: ClipboardList },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors relative',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-[10px] bg-accent text-accent-foreground">
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
