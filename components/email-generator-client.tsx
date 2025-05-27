'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { EmailGenerator } from '@/components/email-generator';

export function EmailGeneratorClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isInitializing, setIsInitializing] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          router.push('/sign-in');
          return;
        }

        if (!session) {
          console.log('No active session found');
          router.push('/sign-in');
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_OUT' || !session) {
            router.push('/sign-in');
          }
        });

        setIsInitializing(false);
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error checking session:', error);
        router.push('/sign-in');
      }
    };

    checkSession();
  }, [router, supabase]);

  // Directly render EmailGenerator, which will handle its own loading states
  return <EmailGenerator />;
} 