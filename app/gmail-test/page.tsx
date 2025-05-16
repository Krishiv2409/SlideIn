import { GmailTest } from '@/components/gmail-test';
import { Suspense } from 'react';
import TailwindSpinner from '@/components/ui/tailwind-spinner';

export default function GmailTestPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gmail API Integration</h1>
        <p className="text-muted-foreground">
          Test the Gmail API integration by connecting your Gmail account and sending a test email.
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Suspense 
          fallback={<TailwindSpinner />}
          key="gmail-test-suspense"
        >
          <GmailTest />
        </Suspense>
      </div>
    </div>
  );
} 