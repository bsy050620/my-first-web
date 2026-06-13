import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "내 블로그",
  description: "웹 개발 블로그",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <Header />

            <main className="max-w-4xl mx-auto p-6 flex-1">{children}</main>

            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

