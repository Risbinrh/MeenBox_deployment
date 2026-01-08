'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Clock, Users, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

const recipes = [
  {
    id: '1',
    title: 'Crispy Fish Fry',
    tamilTitle: 'மீன் வறுவல்',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=250&fit=crop',
    duration: '30 min',
    servings: 4,
    difficulty: 'Easy',
    fish: 'Seer Fish',
    tamilFish: 'சுரா மீன்',
    isVideo: true,
  },
  {
    id: '2',
    title: 'Prawn Masala',
    tamilTitle: 'இறால் மசாலா',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=250&fit=crop',
    duration: '45 min',
    servings: 4,
    difficulty: 'Medium',
    fish: 'Tiger Prawns',
    tamilFish: 'புலி இறால்',
    isVideo: true,
  },
  {
    id: '3',
    title: 'Fish Curry',
    tamilTitle: 'மீன் குழம்பு',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop',
    duration: '40 min',
    servings: 4,
    difficulty: 'Easy',
    fish: 'Red Snapper',
    tamilFish: 'சிவப்பு மீன்',
    isVideo: false,
  },
];

export default function RecipeSuggestions() {
  const { language } = useLanguage();
  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{t('recipeIdeas', language)}</h2>
            <p className="text-sm text-muted-foreground">{t('cookLikePro', language)}</p>
          </div>
          <Link
            href="/recipes"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t('viewAll', language)}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {recipe.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <PlayCircle className="h-12 w-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-primary">
                    {t(recipe.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard', language)}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                    {language === 'ta' ? recipe.tamilTitle : recipe.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{recipe.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{recipe.servings} {t('servings', language)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs">{t('bestWith', language)} <span className="font-medium text-primary">{language === 'ta' ? recipe.tamilFish : recipe.fish}</span></span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
