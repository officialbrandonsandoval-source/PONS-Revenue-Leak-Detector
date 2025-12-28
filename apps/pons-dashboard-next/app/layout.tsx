import './globals.css';
import { validateEnv } from '../lib/env';

export const metadata = {
  title: 'PONS Revenue Leak Dashboard',
  description: 'Executive view of revenue leak analysis and recovery metrics.',
};

validateEnv();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
