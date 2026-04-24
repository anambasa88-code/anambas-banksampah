import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Bank Sampah Digital Anambas",
  description: "Sistem Manajemen Bank Sampah Digital Kepulauan Anambas",

  // PWA Manifest
  manifest: "/manifest.json",

  // SEO Basic
  keywords: ["bank sampah", "anambas", "daur ulang", "sampah digital"],
  authors: [{ name: "Bank Sampah Anambas" }],

  // Supaya tidak diindex Google (karena ini app internal)
  robots: {
    index: false,
    follow: false,
  },

  // Icon
  icons: {
    icon: "/favicon-96x96.png",
    apple: "/apple-touch-icon.png",
  },

  // Open Graph (kalau dishare di WhatsApp/sosmed keliatan rapi)
  openGraph: {
    title: "Bank Sampah Digital Anambas",
    description: "Sistem Manajemen Bank Sampah Digital Kepulauan Anambas",
    type: "website",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Theme color — warna status bar HP saat PWA diinstall */}
        <meta name="theme-color" content="#16a34a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BankSampah" />
      </head>
      <body>
        {children}
        <Toaster richColors position="top-right" closeButton expand={false} />
      </body>
    </html>
  );
}