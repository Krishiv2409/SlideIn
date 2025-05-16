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
    <div className="w-full h-full flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[1280px] mx-auto">
        {children}
      </div>
    </div>
  );
} 