export const metadata = {
  title: 'Campus Support AI',
  description: 'AI support assistant for campus needs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
