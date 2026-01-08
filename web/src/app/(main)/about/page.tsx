'use client';

import { Fish, Truck, Shield, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { t } from '@/lib/translations';

export default function AboutPage() {
    const { language } = useLanguage();

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-[#b18b5e] text-white py-16 sm:py-20">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-center">
                        {language === 'ta' ? 'மீன் கடை பற்றி' : 'About Meen Box'}
                    </h1>
                    <p className="text-lg sm:text-xl text-center max-w-3xl mx-auto opacity-90">
                        {language === 'ta'
                            ? 'உங்கள் வீட்டு வாசலுக்கு நேரடியாக புதிய, உயர்தர மீன் மற்றும் கடல் உணவுகளை வழங்கும் உங்கள் நம்பகமான ஆதாரம்'
                            : 'Your trusted source for fresh, premium quality fish and seafood delivered straight to your doorstep'
                        }
                    </p>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
                            {language === 'ta' ? 'எங்கள் கதை' : 'Our Story'}
                        </h2>
                        <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                            <p>
                                {language === 'ta'
                                    ? 'மீன் கடை ஒரு எளிய நோக்கத்துடன் நிறுவப்பட்டது: கடலில் இருந்து புதிய கடல் உணவை உங்கள் மேசைக்கு கொண்டு வருவது. மீன் மற்றும் கடல் உணவு விஷயத்தில் தரம் முக்கியம் என்பதை நாங்கள் புரிந்துகொள்கிறோம், அதனால்தான் ஒவ்வொரு தயாரிப்பும் எங்கள் உயர் தரநிலைகளை பூர்த்தி செய்வதை உறுதி செய்ய உள்ளூர் மீனவர்களுடன் நேரடியாக வேலை செய்கிறோம்.'
                                    : 'Meen Box was founded with a simple mission: to bring the freshest seafood from the ocean to your table. We understand that quality matters when it comes to fish and seafood, which is why we work directly with local fishermen to ensure every product meets our high standards.'
                                }
                            </p>
                            <p>
                                {language === 'ta'
                                    ? 'எங்கள் பெயர் "மீன் கடை" என்பது தமிழில் "Fish Box" என்று மொழிபெயர்க்கப்படுகிறது, இது எங்கள் வேர்களையும் சமூகத்திற்கு உண்மையான, புதிய கடல் உணவை வழங்குவதற்கான எங்கள் அர்ப்பணிப்பையும் பிரதிபலிக்கிறது. கவனமாக தேர்ந்தெடுக்கப்பட்ட மற்றும் கவனத்துடன் வழங்கப்படும் பலவகையான மீன், இறால் மற்றும் பிற கடல் உணவு உணவுகளை வழங்குவதில் நாங்கள் பெருமிதம் கொள்கிறோம்.'
                                    : 'Our name "Meen Box" translates to "Fish Box" in Tamil, reflecting our roots and commitment to serving the community with authentic, fresh seafood. We take pride in offering a wide variety of fish, prawns, and other seafood delicacies that are carefully selected and delivered with care.'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-12 sm:py-16 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
                        {language === 'ta' ? 'ஏன் எங்களை தேர்வு செய்ய வேண்டும்' : 'Why Choose Us'}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Fresh Quality */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#b18b5e]/10 text-[#b18b5e] mb-4">
                                <Fish className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {language === 'ta' ? 'புதிய தரம்' : 'Fresh Quality'}
                            </h3>
                            <p className="text-gray-600">
                                {language === 'ta'
                                    ? 'நம்பகமான மீனவர்களிடமிருந்து தினமும் பெறப்படுகிறது, அதிகபட்ச புத்துணர்வு மற்றும் தரத்தை உறுதி செய்கிறது'
                                    : 'Sourced daily from trusted fishermen, ensuring maximum freshness and quality'
                                }
                            </p>
                        </div>

                        {/* Fast Delivery */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#b18b5e]/10 text-[#b18b5e] mb-4">
                                <Truck className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {language === 'ta' ? 'விரைவான டெலிவரி' : 'Fast Delivery'}
                            </h3>
                            <p className="text-gray-600">
                                {language === 'ta'
                                    ? 'புதிய கடல் உணவை உங்கள் வீட்டு வாசலுக்கு கொண்டு வர விரைவான மற்றும் நம்பகமான டெலிவரி சேவை'
                                    : 'Quick and reliable delivery service to bring fresh seafood right to your door'
                                }
                            </p>
                        </div>

                        {/* Quality Assurance */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#b18b5e]/10 text-[#b18b5e] mb-4">
                                <Shield className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {language === 'ta' ? 'தர உத்தரவாதம்' : 'Quality Assurance'}
                            </h3>
                            <p className="text-gray-600">
                                {language === 'ta'
                                    ? 'எங்கள் கண்டிப்பான தர தரநிலைகளை பூர்த்தி செய்ய ஒவ்வொரு தயாரிப்பும் கவனமாக ஆய்வு செய்யப்படுகிறது'
                                    : 'Every product is carefully inspected to meet our strict quality standards'
                                }
                            </p>
                        </div>

                        {/* Customer Care */}
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#b18b5e]/10 text-[#b18b5e] mb-4">
                                <Heart className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {language === 'ta' ? 'வாடிக்கையாளர் கவனிப்பு' : 'Customer Care'}
                            </h3>
                            <p className="text-gray-600">
                                {language === 'ta'
                                    ? 'உங்கள் கேள்விகள் அல்லது கவலைகளுக்கு உதவ தயாராக இருக்கும் அர்ப்பணிப்புள்ள ஆதரவு குழு'
                                    : 'Dedicated support team ready to assist you with any questions or concerns'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-12 sm:py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#b18b5e]/5 to-[#b18b5e]/10 rounded-xs p-8 sm:p-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 text-center">
                            {language === 'ta' ? 'எங்கள் இலக்கு' : 'Our Mission'}
                        </h2>
                        <p className="text-lg text-gray-700 text-center leading-relaxed">
                            {language === 'ta'
                                ? 'வாடிக்கையாளர்களை புதிய பிடியுடன் நேரடியாக இணைக்கும் வசதியான, நம்பகமான மற்றும் வெளிப்படையான தளத்தை வழங்குவதன் மூலம் மக்கள் கடல் உணவை வாங்கும் விதத்தில் புரட்சி செய்வது. நிலைத்தன்மை, தரம் மற்றும் வாடிக்கையாளர் திருப்திக்கு நாங்கள் செய்யும் ஒவ்வொரு காரியத்திலும் அர்ப்பணிப்புடன் இருக்கிறோம்.'
                                : 'To revolutionize the way people buy seafood by providing a convenient, reliable, and transparent platform that connects customers directly with the freshest catch. We are committed to sustainability, quality, and customer satisfaction in everything we do.'
                            }
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact CTA Section */}
            <section className="py-12 sm:py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        {language === 'ta' ? 'கேள்விகள் உள்ளதா?' : 'Have Questions?'}
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        {language === 'ta'
                            ? 'உங்களிடமிருந்து கேட்க விரும்புகிறோம்! எங்கள் தயாரிப்புகள் அல்லது சேவைகள் பற்றிய கேள்விகளுக்கு எங்களை தொடர்பு கொள்ளுங்கள்.'
                            : "We'd love to hear from you! Reach out to us for any inquiries about our products or services."
                        }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/products"
                            className="inline-flex items-center justify-center px-8 py-3 bg-[#b18b5e] text-white font-semibold rounded-xs hover:bg-[#8c6b42] transition-colors"
                        >
                            {t('browseProducts', language)}
                        </a>
                        <a
                            href="/"
                            className="inline-flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-900 font-semibold rounded-xs hover:bg-gray-200 transition-colors"
                        >
                            {language === 'ta' ? 'முகப்புக்கு திரும்பு' : 'Back to Home'}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
