import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SearchModal from "@/components/SearchModal";
import { ProgressProvider } from "@/components/ProgressProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ML from Scratch — Interactive Course",
    template: "%s · ML from Scratch",
  },
  description:
    "A one-stop-shop interactive course for learning machine learning from scratch: regression, SVMs, PyTorch, MLPs, CNNs, and Transformers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}
      >
        <ProgressProvider>
          <Sidebar />
          <SearchModal />
          <main className="lg:pl-64 xl:pr-64">
            <div className="mx-auto max-w-3xl px-5 py-10 lg:px-10 lg:py-14">
              {children}
            </div>
          </main>
        </ProgressProvider>
      </body>
    </html>
  );
}
