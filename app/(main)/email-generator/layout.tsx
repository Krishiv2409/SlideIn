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
    <div className="w-full h-full flex justify-center px-4 py-8">
      <div className="max-w-4xl w-full">
        {children}
      </div>
    </div>
  );
} 