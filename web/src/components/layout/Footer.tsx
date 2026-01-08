'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';
import { Fish, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

export default function Footer() {
  const { language } = useLanguage();

  const footerLinks = useMemo(() => ({
    shop: [
      { name: language === 'ta' ? 'அனைத்து பொருட்கள்' : 'All Products', href: '/products' },
      { name: language === 'ta' ? 'கடல் மீன்' : 'Sea Fish', href: '/products?category=sea-fish-premium' },
      { name: language === 'ta' ? 'இறால்' : 'Prawns', href: '/products?category=prawns' },
      { name: language === 'ta' ? 'நண்டு' : 'Crabs', href: '/products?category=crabs' },
      { name: language === 'ta' ? 'ஆற்று மீன்' : 'River Fish', href: '/products?category=river-fish' },
      { name: language === 'ta' ? 'சமையல் குறிப்புகள்' : 'Recipes', href: '/recipes' },
    ],
    account: [
      { name: language === 'ta' ? 'என் கணக்கு' : 'My Account', href: '/profile' },
      { name: language === 'ta' ? 'என் ஆர்டர்கள்' : 'My Orders', href: '/orders' },
      { name: language === 'ta' ? 'என் முகவரிகள்' : 'My Addresses', href: '/profile/addresses' },
      { name: language === 'ta' ? 'கூடை' : 'Cart', href: '/cart' },
    ],
    info: [
      { name: language === 'ta' ? 'டெலிவரி மண்டலங்கள்' : 'Delivery Zones', href: '/zone-demo' },
      { name: language === 'ta' ? 'ஆர்டர் டிராக்' : 'Track Order', href: '/orders' },
    ],
  }), [language]);
  return (
    <footer className="bg-black text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.png"
                alt="Meen Box"
                width={150}
                height={50}
                className="h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-sm mb-4 max-w-sm">
              {/* Bringing the freshest catch from the sea to your doorstep.
              Quality fish, delivered fresh every day across Tamil Nadu. */}
              {t('footerTagline', language)}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#b18b5e]" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#b18b5e]" />
                <span>support@freshcatch.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#b18b5e]" />
                {/* <span>Chennai, Tamil Nadu</span> */}
                <span>{t('locationCity', language)}</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('shop', language)}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-[#b18b5e] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{language === 'ta' ? 'என் கணக்கு' : 'My Account'}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.account.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-[#b18b5e] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('company', language)}</h3>
            <ul className="space-y-2 text-sm">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-[#b18b5e] transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex gap-4 mt-6">
              <a href="#" className="hover:text-[#b18b5e] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#b18b5e] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-[#b18b5e] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p>&copy; 2025 {t('brandName', language)}. {t('allRightsReserved', language)}</p>
            <p className="text-slate-500">{t('madeWithLove', language)}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
