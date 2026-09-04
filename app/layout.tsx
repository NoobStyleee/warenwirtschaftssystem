import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '../components/ui/toast-context/toast-context';

export const metadata: Metadata = {
  title: 'Warenwirtschaftssystem',
  description: 'Lokale Lagerverwaltung',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}