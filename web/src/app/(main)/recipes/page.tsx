'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Clock,
  Users,
  ChefHat,
  PlayCircle,
  Filter,
  Flame,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

const recipes = [
  {
    id: '1',
    title: 'Vanjaram Fish Fry',
    tamilTitle: 'வஞ்சிரம் வறுவல்',
    image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=600&h=400&fit=crop',
    duration: 30,
    servings: 4,
    difficulty: 'Easy',
    category: 'Main Course',
    isVideo: true,
    fish: 'Seer Fish',
    spiceLevel: 'Medium',
  },
  {
    id: '2',
    title: 'Prawn Biryani',
    tamilTitle: 'இறால் பிரியாணி',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=400&fit=crop',
    duration: 60,
    servings: 6,
    difficulty: 'Medium',
    category: 'Main Course',
    isVideo: false,
    fish: 'Tiger Prawns',
    spiceLevel: 'Spicy',
  },
  {
    id: '3',
    title: 'Fish Curry - Kerala Style',
    tamilTitle: 'மீன் குழம்பு',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=400&fit=crop',
    duration: 45,
    servings: 4,
    difficulty: 'Medium',
    category: 'Curry',
    isVideo: true,
    fish: 'Red Snapper',
    spiceLevel: 'Spicy',
  },
  {
    id: '4',
    title: 'Crab Rasam',
    tamilTitle: 'நண்டு ரசம்',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop',
    duration: 40,
    servings: 4,
    difficulty: 'Medium',
    category: 'Soup',
    isVideo: false,
    fish: 'Mud Crab',
    spiceLevel: 'Medium',
  },
  {
    id: '5',
    title: 'Masala Pomfret',
    tamilTitle: 'மசாலா வாவல்',
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop',
    duration: 35,
    servings: 2,
    difficulty: 'Easy',
    category: 'Main Course',
    isVideo: true,
    fish: 'White Pomfret',
    spiceLevel: 'Spicy',
  },
  {
    id: '6',
    title: 'Nethili Fry',
    tamilTitle: 'நெத்திலி வறுவல்',
    image: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&h=400&fit=crop',
    duration: 20,
    servings: 4,
    difficulty: 'Easy',
    category: 'Starter',
    isVideo: false,
    fish: 'Anchovy',
    spiceLevel: 'Medium',
  },
  {
    id: '7',
    title: 'Squid Pepper Fry',
    tamilTitle: 'கணவாய் மிளகு வறுவல்',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop',
    duration: 25,
    servings: 4,
    difficulty: 'Medium',
    category: 'Starter',
    isVideo: true,
    fish: 'Squid',
    spiceLevel: 'Hot',
  },
  {
    id: '8',
    title: 'Fish Head Curry',
    tamilTitle: 'மீன் தலை குழம்பு',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&h=400&fit=crop',
    duration: 50,
    servings: 4,
    difficulty: 'Hard',
    category: 'Curry',
    isVideo: false,
    fish: 'King Fish',
    spiceLevel: 'Spicy',
  },
];

const categories = ['All', 'Main Course', 'Curry', 'Starter', 'Soup'];
const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

const difficultyColors: Record<string, string> = {
  'Easy': 'bg-green-500',
  'Medium': 'bg-yellow-500',
  'Hard': 'bg-red-500',
};

const spiceColors: Record<string, string> = {
  'Mild': 'text-green-600',
  'Medium': 'text-yellow-600',
  'Spicy': 'text-orange-600',
  'Hot': 'text-red-600',
};

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const { language } = useLanguage();

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tamilTitle.includes(searchQuery) ||
      recipe.fish.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || recipe.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="h-8 w-8" />
            <h1 className="text-2xl font-bold">{t('fishRecipes', language)}</h1>
          </div>
          <p className="text-white/80">
            {t('discoverDelicious', language)}
          </p>

          {/* Search */}
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={t('searchRecipesPlaceholder', language)}
              className="pl-10 bg-white text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{t('category', language)}</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'All' ? t('all', language) : cat === 'Main Course' ? t('mainCourse', language) : cat === 'Curry' ? t('curry', language) : cat === 'Starter' ? t('starter', language) : t('soup', language)}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">{t('difficulty', language)}</p>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((diff) => (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDifficulty(diff)}
                >
                  {diff === 'All' ? t('all', language) : diff === 'Easy' ? t('recipeEasy', language) : diff === 'Medium' ? t('recipeMedium', language) : t('recipeHard', language)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          {filteredRecipes.length} {filteredRecipes.length !== 1 ? t('recipesFound', language) : t('recipeFound', language)}
        </p>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
              <Card className="overflow-hidden hover:bg-gray-50 transition-colors h-full">
                <div className="relative aspect-video">
                  <Image
                    src={recipe.image}
                    alt={recipe.title}
                    fill
                    className="object-cover"
                  />
                  {recipe.isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <PlayCircle className="h-12 w-12 text-white opacity-80" />
                    </div>
                  )}
                  <Badge className={`absolute top-2 left-2 ${difficultyColors[recipe.difficulty]} text-white`}>
                    {recipe.difficulty === 'Easy' ? t('recipeEasy', language) : recipe.difficulty === 'Medium' ? t('recipeMedium', language) : t('recipeHard', language)}
                  </Badge>
                  {recipe.isVideo && (
                    <Badge className="absolute top-2 right-2 bg-red-600 text-white">
                      {t('video', language)}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">{language === 'ta' ? recipe.tamilTitle : recipe.title}</h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.duration} {t('min', language)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{recipe.servings} {t('recipeServings', language)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{recipe.fish}</Badge>
                    <div className={`flex items-center gap-1 text-sm ${spiceColors[recipe.spiceLevel]}`}>
                      <Flame className="h-4 w-4" />
                      <span>{recipe.spiceLevel === 'Mild' ? t('mild', language) : recipe.spiceLevel === 'Medium' ? t('recipeMedium', language) : recipe.spiceLevel === 'Spicy' ? t('spicy', language) : t('hot', language)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('noRecipesFound', language)}</h2>
            <p className="text-muted-foreground mb-4">
              {t('adjustFilters', language)}
            </p>
            <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedDifficulty('All'); }}>
              {t('clearFilters', language)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
