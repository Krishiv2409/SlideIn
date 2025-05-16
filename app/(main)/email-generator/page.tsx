import { Suspense } from 'react';
import { EmailGeneratorClient } from '@/components/email-generator-client';
import { ContentWrapper } from '@/components/content-wrapper';
import EmailGeneratorSkeleton from '@/components/ui/email-generator-skeleton';

// Simple loading state that won't conflict with component's internal loading
function SimpleLoader() {
  return <div className="w-full h-12"></div>; // Just empty space, no visual element
}

export default function EmailGeneratorPage() {
  return (
    <ContentWrapper className="h-full">
      <Suspense fallback={<EmailGeneratorSkeleton />} key="email-generator-suspense">
        <EmailGeneratorClient />
      </Suspense>
    </ContentWrapper>
  );
}