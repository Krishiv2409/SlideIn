'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import { saveGmailTokens, GmailTokens, getGmailTokens, isGmailConnected } from '@/lib/supabase-storage';
import { useRouter, useSearchParams } from 'next/navigation';

interface GmailConnectButtonProps {
  onSuccess?: (tokens: GmailTokens) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  redirectAfterSuccess?: boolean;
}

export function GmailConnectButton({
  onSuccess,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false,
  redirectAfterSuccess = true
}: GmailConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleAuthStateChange = useCallback(async (event: string, session: any) => {
    if (event === 'SIGNED_IN' && session?.provider_token) {
      try {
        const newTokens = {
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token || '',
          expiry_date: Date.now() + (session.expires_in || 3600) * 1000
        };
        
        await saveGmailTokens(newTokens);
        setIsConnected(true);
        
        if (onSuccess) {
          onSuccess(newTokens);
        }

        // Check if we're coming from a successful OAuth callback
        const success = searchParams.get('success');
        if (success === 'true' && redirectAfterSuccess) {
          router.push('/email-generator');
        }
      } catch (error) {
        console.error('Error handling Gmail tokens:', error);
        toast.error('Failed to save Gmail connection. Please try again.');
      }
    } else if (event === 'SIGNED_OUT') {
      setIsConnected(false);
      router.push('/sign-in');
    }
  }, [onSuccess, redirectAfterSuccess, router, searchParams]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          router.push('/sign-in');
          return;
        }

        const connected = await isGmailConnected();
        setIsConnected(connected);
      } catch (error) {
        console.error('Error checking Gmail connection:', error);
        setIsConnected(false);
      }
    };

    checkConnection();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, handleAuthStateChange, router]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/sign-in');
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            scope: [
              'email',
              'profile',
              'https://www.googleapis.com/auth/gmail.send',
              'https://www.googleapis.com/auth/gmail.compose',
              'https://www.googleapis.com/auth/gmail.modify'
            ].join(' ')
          },
          skipBrowserRedirect: false,
          redirectTo: `${window.location.origin}/api/gmail-auth/callback`
        }
      });

      if (error) {
        console.error('Error connecting Gmail:', error);
        toast.error(`Failed to connect Gmail: ${error.message}`);
        return;
      }
      
      // The actual success handling will happen in the auth state change listener
    } catch (error) {
      console.error('Error connecting Gmail:', error);
      toast.error('Failed to connect Gmail. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={disabled || isLoading || isConnected}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Mail className="mr-2 h-4 w-4 animate-spin" />
      ) : isConnected ? (
        <Mail className="mr-2 h-4 w-4 text-green-500" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      )}
      {isConnected ? 'Gmail Connected' : 'Connect Gmail'}
    </Button>
  );
} 