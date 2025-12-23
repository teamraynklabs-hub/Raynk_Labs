import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AlertProvider from "@/components/cards/AlertProvider";

export const metadata: Metadata = {
  title: 'RaYnk Labs — Learn • Earn • Grow • Innovate',
  description: 'A student-led innovation lab building tools, education, and opportunities for youth.',
  keywords: 'student innovation, tech education, career guidance, web development, AI tools',
  icons: {
    icon: "/images/logos.png",
  },
  authors: [{ name: 'RaYnk Labs Team' }],
  openGraph: {
    title: 'RaYnk Labs — Learn • Earn • Grow • Innovate',
    description: 'A student-led innovation lab building tools, education, and opportunities for youth.',
    type: 'website',
  },
}

/* ---------- Viewport (FIXED) ---------- */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/* ---------- Layout ---------- */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AlertProvider>
          <ThemeProvider>
            <Navbar />
            {children}
            <Footer />
          </ThemeProvider>
        </AlertProvider>
      </body>
    </html>
  );
}
