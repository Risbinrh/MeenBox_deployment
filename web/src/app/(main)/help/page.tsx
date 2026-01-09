import { Search, Package, RotateCcw, Truck, User, Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-[#00bcd4] text-white py-16 sm:py-20 text-center">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                        How can we help?
                    </h1>
                    <div className="max-w-xl mx-auto relative px-4 sm:px-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                className="w-full pl-10 h-12 bg-white text-gray-900 border rounded-xs placeholder:text-gray-400"
                                placeholder="Search for answers..."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Support Topics */}
            <section className="py-12 -mt-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {[
                            { icon: Package, label: 'Track Order', href: '/orders' },
                            { icon: RotateCcw, label: 'Returns', href: '/orders' },
                            { icon: Truck, label: 'Shipping Info', href: '#' },
                            { icon: User, label: 'My Account', href: '/profile' },
                        ].map((topic, index) => (
                            <Card key={index} className="border shadow-none rounded-xs cursor-pointer group hover:border-[#00bcd4] transition-colors">
                                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-[#00bcd4]/10 flex items-center justify-center group-hover:bg-[#00bcd4] transition-colors">
                                        <topic.icon className="h-6 w-6 text-[#00bcd4] group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base">{topic.label}</span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h2 className="text-2xl font-bold mb-8 text-center text-gray-900">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: "Where do you deliver?",
                                a: "We currently deliver to all areas within Chennai city limits. We plan to expand to other parts of Tamil Nadu soon."
                            },
                            {
                                q: "Is the fish fresh?",
                                a: "Absolutely! We source our fish directly from local fishermen every morning. It's delivered to you on the same day to ensure maximum freshness."
                            },
                            {
                                q: "What is your return policy?",
                                a: "We have a 100% satisfaction guarantee. If you are not satisfied with the quality of the fish, you can return it at the time of delivery or contact our support within 2 hours of delivery."
                            },
                            {
                                q: "How can I pay for my order?",
                                a: "We accept Cash on Delivery (COD), UPI (GPay, PhonePe), and all major Credit/Debit cards."
                            },
                            {
                                q: "To postpone or cancel my order?",
                                a: "You can cancel or reschedule your order before it is dispatched from our facility. Please visit the 'My Orders' section in your profile to manage your orders."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="bg-transparent p-6 rounded-xs border-b border-gray-100 last:border-0">
                                <h3 className="font-semibold text-lg mb-2 text-gray-900">{faq.q}</h3>
                                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
                    <p className="text-gray-600 mb-10">Our support team is available Mon-Sat from 9 AM to 6 PM</p>

                    <div className="grid sm:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xs bg-white border border-gray-100 flex flex-col items-center">
                            <Phone className="h-8 w-8 text-[#00bcd4] mb-4" />
                            <h3 className="font-semibold mb-2">Call Us</h3>
                            <p className="text-sm text-gray-600 mb-4">+91 98765 43210</p>
                            <Button variant="outline" className="w-full rounded-xs border-[#00bcd4] text-[#00bcd4] hover:bg-[#00bcd4] hover:text-white">
                                Call Now
                            </Button>
                        </div>

                        <div className="p-6 rounded-xs bg-white border border-gray-100 flex flex-col items-center">
                            <Mail className="h-8 w-8 text-[#00bcd4] mb-4" />
                            <h3 className="font-semibold mb-2">Email Us</h3>
                            <p className="text-sm text-gray-600 mb-4">support@meenbox.com</p>
                            <Button variant="outline" className="w-full rounded-xs border-[#00bcd4] text-[#00bcd4] hover:bg-[#00bcd4] hover:text-white">
                                Send Email
                            </Button>
                        </div>

                        <div className="p-6 rounded-xs bg-white border border-gray-100 flex flex-col items-center">
                            <MessageCircle className="h-8 w-8 text-[#00bcd4] mb-4" />
                            <h3 className="font-semibold mb-2">WhatsApp</h3>
                            <p className="text-sm text-gray-600 mb-4">Chat with Support</p>
                            <Button variant="outline" className="w-full rounded-xs border-[#00bcd4] text-[#00bcd4] hover:bg-[#00bcd4] hover:text-white">
                                Chat Now
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
