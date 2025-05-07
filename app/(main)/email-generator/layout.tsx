import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email Generator - SlideIn',
  description: 'Generate and send emails with AI assistance',
};

export default function EmailGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">{children}</main>
    </div>
  );
} 