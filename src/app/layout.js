import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Inter } from 'next/font/google';
import { Navigation } from '../../components'; // Adjust the path based on your folder structureconst 
const inter = Inter({ subsets: ['latin'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'AccessibleAI - Transform Content for Every Mind',
  description: 'AI-powered platform that makes content accessible for everyone',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head><script src="https://cdn.tailwindcss.com"></script> </head>
      <body
className={`${inter.className} ${geistSans.variable} ${geistMono.variable} antialiased`}>
         <Navigation />
         <main className="min-h-screen bg-gray-50">{children}</main>
      </body>
    </html>
  );
}
