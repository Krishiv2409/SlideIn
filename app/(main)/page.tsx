import { Suspense } from 'react';
import { EmailGeneratorClient } from '@/components/email-generator-client';
import { ContentWrapper } from '@/components/content-wrapper';

// Simple loading state that won't conflict with component's internal loading
function SimpleLoader() {
  return <div className="w-full h-12"></div>; // Just empty space, no visual element
}

export default function Home() {
  return (
    <ContentWrapper className="h-full">
      <Suspense fallback={<SimpleLoader />} key="home-page-suspense">
        <EmailGeneratorClient />
      </Suspense>
    </ContentWrapper>
  );
} 