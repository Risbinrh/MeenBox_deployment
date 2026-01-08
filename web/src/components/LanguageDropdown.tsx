'use client';

import { Languages } from 'lucide-react';
import { useLanguage, Language } from '@/context/LanguageContext';
import { t } from '@/lib/translations';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const languages = [
    { code: 'en' as Language, name: 'English', nativeName: 'English' },
    { code: 'ta' as Language, name: 'Tamil', nativeName: 'தமிழ்' },
];

export default function LanguageDropdown() {
    const { language, setLanguage } = useLanguage();

    const currentLanguage = languages.find(lang => lang.code === language);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-0 px-2 hover:text-white text-muted-foreground hover:bg-[#b18b5e] rounded-xs"
                >
                    <Languages className="h-3.5 w-3.5 mr-1" />
                    <span className="text-sm font-medium">
                        {currentLanguage?.code.toUpperCase()}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="min-w-[110px] rounded-xs">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`cursor-pointer focus:bg-[#b18b5e] focus:text-white rounded-xs ${language === lang.code ? 'bg-[#b18b5e] text-white' : ''
                            }`}
                    >
                        <span className="flex items-center justify-between w-full">
                            <span>{lang.nativeName}</span>
                            {language === lang.code && (
                                <span className="text-green-500">✓</span>
                            )}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
