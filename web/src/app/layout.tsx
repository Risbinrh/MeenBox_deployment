import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "FreshCatch - Fresh Fish Delivery | Chennai",
  description: "Order fresh fish, prawns, crabs and seafood online. Same-day delivery in Chennai and Tamil Nadu. Quality guaranteed!",
  keywords: "fresh fish, seafood, prawns, crabs, fish delivery, Chennai, Tamil Nadu, online fish market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
