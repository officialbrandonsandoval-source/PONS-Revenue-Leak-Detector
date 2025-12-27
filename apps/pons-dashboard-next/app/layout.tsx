import './globals.css';

export const metadata = {
  title: 'PONS Revenue Leak Dashboard',
  description: 'Executive view of revenue leak analysis and recovery metrics.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
