import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// In app/layout.tsx (Next.js 13+ with metadata)
export const metadata: Metadata = {
  title: "FortiTest – Trusted Exams for Modern Learners",
  description:
    "FortiTest is a quiz platform with high-end protection, perfect for universities and certification providers. Built using Next.js for performance and safety.",
  keywords: [
    "nextjs exam system",
    "quiz with anti-cheating",
    "exam app with user tracking",
    "fortitest quiz",
    "secure online assessment"
  ],
  openGraph: {
    title: "FortiTest – Trusted Exams for Modern Learners",
    description:
      "FortiTest ensures every online assessment is protected and fair. Built with Next.js and enhanced security features.",
    url: "https://yourdomain.com/fortitest",
    siteName: "FortiTest",
    images: [
      {
        url: "https://yourdomain.com/fortitest-preview.jpg",
        width: 1200,
        height: 630,
        alt: "FortiTest App UI",
      },
    ],
    type: "website",
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
