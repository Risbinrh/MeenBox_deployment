import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";
import ScrollToTop from "@/components/ui/ScrollToTop";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <ScrollToTop />
    </>
  );
}
