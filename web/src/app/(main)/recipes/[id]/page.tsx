'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  Clock,
  Users,
  Flame,
  Share2,
  Heart,
  PlayCircle,
  ShoppingCart,
  ChefHat,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Dummy recipe data
const recipeData = {
  id: '1',
  title: 'Vanjaram Fish Fry',
  tamilTitle: 'வஞ்சிரம் வறுவல்',
  description: 'A classic South Indian fish fry recipe featuring the prized Seer Fish (Vanjaram). Crispy on the outside, tender and flavorful on the inside. Perfect as a starter or with rice.',
  image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=1200&h=600&fit=crop',
  videoUrl: 'https://youtube.com/watch?v=example',
  duration: 30,
  prepTime: 15,
  cookTime: 15,
  servings: 4,
  difficulty: 'Easy',
  spiceLevel: 'Medium',
  cuisine: 'South Indian',
  calories: 280,
  fish: {
    name: 'Seer Fish',
    tamilName: 'வஞ்சிரம்',
    quantity: '500g',
    handle: 'seer-fish',
  },
  ingredients: [
    { item: 'Seer Fish steaks', quantity: '500g', note: '4 medium pieces' },
    { item: 'Red Chilli Powder', quantity: '2 tsp', note: 'Kashmiri for color' },
    { item: 'Turmeric Powder', quantity: '1/2 tsp', note: '' },
    { item: 'Coriander Powder', quantity: '1 tsp', note: '' },
    { item: 'Cumin Powder', quantity: '1/2 tsp', note: '' },
    { item: 'Ginger Garlic Paste', quantity: '1 tbsp', note: 'freshly ground' },
    { item: 'Lemon Juice', quantity: '2 tbsp', note: '' },
    { item: 'Salt', quantity: 'to taste', note: '' },
    { item: 'Oil', quantity: 'for frying', note: 'coconut or vegetable' },
    { item: 'Curry Leaves', quantity: '1 sprig', note: 'for garnish' },
  ],
  instructions: [
    'Clean the fish steaks and pat dry with a kitchen towel.',
    'Mix all the dry spices - red chilli powder, turmeric, coriander powder, cumin powder in a bowl.',
    'Add ginger garlic paste, lemon juice, and salt to make a thick marinade.',
    'Apply the marinade evenly on both sides of the fish steaks.',
    'Let it marinate for at least 30 minutes (or overnight in the fridge for best results).',
    'Heat oil in a pan on medium-high heat.',
    'Gently place the marinated fish in the hot oil.',
    'Fry for 4-5 minutes on each side until golden brown and crispy.',
    'Drain on paper towels and garnish with curry leaves.',
    'Serve hot with rice or as a starter with onion rings and lemon wedges.',
  ],
  tips: [
    'Use fresh fish for the best taste and texture.',
    'Don\'t overcrowd the pan - fry in batches if needed.',
    'The oil should be hot enough (test by dropping a small piece of marinade - it should sizzle).',
    'Marinating overnight gives the best flavor.',
  ],
  nutrition: {
    calories: 280,
    protein: '32g',
    carbs: '5g',
    fat: '15g',
    omega3: '1.2g',
  },
};

export default function RecipeDetailPage() {
  const params = useParams();
  const [isSaved, setIsSaved] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (index: number) => {
    setCompletedSteps(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-6">
      {/* Hero Image */}
      <div className="relative h-64 md:h-96">
        <Image
          src={recipeData.image}
          alt={recipeData.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />

        {/* Back Button */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link href="/recipes">
            <Button variant="secondary" size="sm" className="gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" onClick={() => setIsSaved(!isSaved)}>
              <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="secondary" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Video Play Button */}
        {recipeData.videoUrl && (
          <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 rounded-full p-4 hover:bg-white transition-colors">
            <PlayCircle className="h-12 w-12 text-primary" />
          </button>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <Badge className="bg-green-500 text-white mb-2">{recipeData.difficulty}</Badge>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{recipeData.title}</h1>
          <p className="text-white/80">{recipeData.tamilTitle}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Quick Info */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-muted rounded-xs">
            <Clock className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{recipeData.duration}</p>
            <p className="text-xs text-muted-foreground">minutes</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-xs">
            <Users className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{recipeData.servings}</p>
            <p className="text-xs text-muted-foreground">servings</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-xs">
            <Flame className="h-5 w-5 mx-auto text-orange-500 mb-1" />
            <p className="text-lg font-bold">{recipeData.spiceLevel}</p>
            <p className="text-xs text-muted-foreground">spice</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-xs">
            <ChefHat className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{recipeData.calories}</p>
            <p className="text-xs text-muted-foreground">calories</p>
          </div>
        </div>

        {/* Buy Fish Card */}
        <Card className="mb-6 border-primary/30 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Main Ingredient</p>
                <p className="font-semibold">{recipeData.fish.name}</p>
                <p className="text-sm text-muted-foreground">{recipeData.fish.tamilName} • {recipeData.fish.quantity}</p>
              </div>
              <Link href={`/products/${recipeData.fish.handle}`}>
                <Button className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Buy Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <p className="text-muted-foreground mb-6">{recipeData.description}</p>

        {/* Tabs */}
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="ingredients" className="flex-1 sm:flex-none">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions" className="flex-1 sm:flex-none">Instructions</TabsTrigger>
            <TabsTrigger value="tips" className="flex-1 sm:flex-none">Tips</TabsTrigger>
            <TabsTrigger value="nutrition" className="flex-1 sm:flex-none">Nutrition</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {recipeData.ingredients.map((ing, index) => (
                    <div key={index} className="flex items-start gap-3 py-2 border-b last:border-b-0">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{ing.item}</p>
                        <p className="text-sm text-muted-foreground">{ing.quantity}</p>
                      </div>
                      {ing.note && (
                        <p className="text-sm text-muted-foreground italic">{ing.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {recipeData.instructions.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => toggleStep(index)}
                      className="flex items-start gap-3 w-full text-left py-2 border-b last:border-b-0"
                    >
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${completedSteps.includes(index)
                        ? 'bg-green-500 text-white'
                        : 'bg-primary/10 text-primary'
                        }`}>
                        {completedSteps.includes(index) ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <p className={`flex-1 ${completedSteps.includes(index) ? 'line-through text-muted-foreground' : ''}`}>
                        {step}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    {completedSteps.length} of {recipeData.instructions.length} steps completed
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips">
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {recipeData.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                        💡
                      </div>
                      <p>{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-4">Per serving</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-muted rounded-xs">
                    <p className="text-2xl font-bold text-primary">{recipeData.nutrition.calories}</p>
                    <p className="text-sm text-muted-foreground">Calories</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-xs">
                    <p className="text-2xl font-bold text-primary">{recipeData.nutrition.protein}</p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-xs">
                    <p className="text-2xl font-bold text-primary">{recipeData.nutrition.carbs}</p>
                    <p className="text-sm text-muted-foreground">Carbs</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-xs">
                    <p className="text-2xl font-bold text-primary">{recipeData.nutrition.fat}</p>
                    <p className="text-sm text-muted-foreground">Fat</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-xs col-span-2 sm:col-span-1">
                    <p className="text-2xl font-bold text-primary">{recipeData.nutrition.omega3}</p>
                    <p className="text-sm text-muted-foreground">Omega-3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
