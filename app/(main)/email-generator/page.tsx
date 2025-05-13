import { Suspense } from 'react';
import { EmailGeneratorClient } from '@/components/email-generator-client';
import { ContentWrapper } from '@/components/content-wrapper';

export default function EmailGeneratorPage() {
  return (
    <ContentWrapper className="h-full">
      <Suspense fallback={<div>Loading...</div>}>
        <EmailGeneratorClient />
      </Suspense>
    </ContentWrapper>
  );
}