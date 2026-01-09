'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Fish,
  Mail,
  Lock,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  Truck,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { language } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setError('Please enter your email');
      return;
    }
    if (!formData.password) {
      setError('Please enter your password');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login(formData.email.trim(), formData.password.trim());
      setStep('success');
      await new Promise(resolve => setTimeout(resolve, 1500));
      router.push(redirectTo);
    } catch (err: unknown) {
      console.error('Login failed:', err);
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md text-center border-0 shadow-none bg-transparent">
          <CardContent className="py-12">
            <div className="relative inline-block mb-6">
              <div className="h-24 w-24 mx-auto bg-[#00bcd4] rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 text-3xl animate-bounce">
                <span>🎉</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t('welcomeBackExclamation', language)}</h2>
            <p className="text-muted-foreground mb-6">{t('youAreNowLoggedIn', language)}</p>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">{t('redirectingToDestination', language)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Banner Image (Desktop) */}
      <div
        className="hidden lg:flex lg:w-3/4 flex-col  lg:p-24 p-8 bg-cover bg-center relative"
        style={{ backgroundImage: "url('/login.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/80" /> {/* Darker overlay */}

        {/* Logo */}
        <div className="z-10">
          {/* <Link href="/" className="inline-block">
            <div className="">
              <Image
                src="/Logo.png"
                alt="Meen Box"
                width={180}
                height={60}
                className="h-32 w-auto object-contain"
                priority
              />
            </div>
          </Link> */}
        </div>

        {/* Slogan */}
        <div className="z-10 mt-32">
          <h2 className="text-6xl font-bold text-white text-left drop-shadow-md leading-tight">
            Fresh each day, the <br />Meenbox way
          </h2>
          <h3 className="text-5xl font-bold text-white text-left drop-shadow-md leading-tight mt-6">புது மீன் – தினம் தினம்</h3>
          <p className="text-white text-left font-bold leading-tight mt-2">தரமான தேர்வு, சுத்தமான செயலாக்கம், உச்ச தரமான புதிய மீன்கள்</p>
        </div>

        {/* Spacer for bottom */}
        <div className="z-10 h-12"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <Link href="/" className="lg:hidden inline-flex items-center justify-center gap-2 mb-8">
              <Image
                src="/Logo.png"
                alt="Meen Box"
                width={120}
                height={40}
                className="h-12 w-auto object-contain"
                priority
              />
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {t('welcomeBack', language)}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {language === 'en' ? `Sign in to your ${t('brandName', language)} account` : `உங்கள் ${t('brandName', language)} கணக்கில் உள்நுழையவும்`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xs bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{t('emailAddress', language)}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 h-11 rounded-xs border-gray-300 focus:border-[#00bcd4] focus:ring-[#00bcd4] bg-gray-50/50"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">{t('password', language)}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder={t('passwordPlaceholder', language)}
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 h-11  rounded-xs border-gray-300 focus:border-[#00bcd4] focus:ring-[#00bcd4] bg-gray-50/50"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute  right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xs text-base font-medium bg-[#00bcd4] hover:bg-[#0097a7] text-white  shadow-md transition-all active:scale-[0.98]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  {t('signingIn', language)}
                </>
              ) : (
                t('signIn', language)
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                {language === 'en' ? `New to ${t('brandName', language)}?` : `${t('brandName', language)}-க்கு புதியவரா?`}
              </span>
            </div>
          </div>

          <Link href="/register" className="block">
            <Button variant="outline" className="w-full h-11 rounded-xs text-base font-medium  border-2 border-gray-200 hover:border-[#00bcd4] hover:bg-[#00bcd4]/5 text-gray-700 hover:text-[#00bcd4] transition-all">
              {t('createAccount', language)}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#00bcd4]/5 via-[#e0f7fa] to-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00bcd4]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
