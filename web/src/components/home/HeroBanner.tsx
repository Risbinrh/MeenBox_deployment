'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import Link from 'next/link';

const slides = [
  {
    id: 1,
    image: '/banner1.jpg',
    titleKey: 'Fresh-ஆ இருக்கு… Fish-ஆ இருக்கு!',
    subtitleKey: 'premiumQuality',
    ctaKey: 'shopSeaFish',
    link: '/products?category=sea-fish',
  },
  {
    id: 2,
    image: '/banner2.jpg',
    titleKey: 'freshPrawnsDaily',
    subtitleKey: 'tigerPrawnsDesc',
    ctaKey: 'orderPrawns',
    link: '/products?category=prawns',
  },
  {
    id: 3,
    image: '/banner3.jpg',
    titleKey: 'catchOfTheDay',
    subtitleKey: 'emperorFishDesc',
    ctaKey: 'shop',
    link: '/products',
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => setCurrentSlide(index);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <section className="relative w-full bg-white overflow-hidden">
      {/* Carousel Banner */}
      <div className="relative h-[200px] sm:h-[300px] lg:h-[490px] w-full overflow-hidden group">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
          >
            <Image
              src={slide.image}
              alt={`Carousel slide ${slide.id}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Text Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
              <div className="container mx-auto px-4 md:px-8">
                <div className={`max-w-lg transition-all duration-700 delay-300 transform ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {(t as any)[slide.titleKey] || slide.titleKey}
                  </h2>
                  <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                    {(t as any)[slide.subtitleKey] || slide.subtitleKey}
                  </p>
                  <Link
                    href={slide.link}
                    className="inline-flex items-center gap-2 bg-[#00bcd4] hover:bg-[#0097a7] text-white px-8 py-3 rounded-xs font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    {(t as any)[slide.ctaKey] || 'Shop Now'}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white items-center justify-center transition-all z-20 group-hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white items-center justify-center transition-all z-20 group-hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${index === currentSlide
                ? 'w-10 h-3 bg-[#00bcd4] rounded-full'
                : 'w-3 h-3 bg-white/50 rounded-full hover:bg-white/80'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
