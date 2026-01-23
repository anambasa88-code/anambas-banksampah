// src/app/layout.js
import { Toaster } from 'sonner';
import './globals.css';

export const metadata = {
  title: 'Bank Sampah Digital Anambas',
  description: 'Sistem Manajemen Bank Sampah Digital',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster 
          richColors 
          position="top-right" 
          closeButton
          expand={false}
        />
      </body>
    </html>
  );
}