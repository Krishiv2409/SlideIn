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
    // Use absolute positioning to ensure we take full width
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'calc(100vw - 16rem)',
        left: '16rem',
        overflow: 'auto'
      }}
    >
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </div>
  );
} 