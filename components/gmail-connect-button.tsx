'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { createBrowserClient } from '@supabase/ssr';
import { saveGmailTokens, GmailTokens, getGmailTokens } from '@/lib/supabase-storage';
import { useRouter } from 'next/navigation';

interface GmailConnectButtonProps {
  onSuccess?: (tokens: GmailTokens) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

export function GmailConnectButton({
  onSuccess,
  variant = 'default',
  size = 'default',
  className = '',
  disabled = false
}: GmailConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Check if we're returning from the OAuth flow
    const checkSession = async () => {
      console.log('Checking session in GmailConnectButton');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session check result:', { session });
      
      if (session?.provider_token) {
        try {
          console.log('Provider token found, checking existing tokens');
          // Check if we already have tokens
          const existingTokens = await getGmailTokens();
          console.log('Existing tokens check result:', existingTokens);
          
          if (!existingTokens) {
            console.log('No existing tokens found, saving new tokens');
            // Only save tokens if we don't have them already
            const newTokens = {
              access_token: session.provider_token,
              refresh_token: session.provider_refresh_token || '',
              expiry_date: Date.now() + (session.expires_in || 3600) * 1000
            };
            
            await saveGmailTokens(newTokens);
            
            if (onSuccess) {
              onSuccess(newTokens);
            }
            
            console.log('Successfully saved new Gmail tokens');
          } else {
            console.log('Gmail tokens already exist');
            if (onSuccess) {
              onSuccess(existingTokens);
            }
          }
        } catch (error) {
          console.error('Error handling Gmail tokens:', error);
          toast.error('Failed to handle Gmail tokens. Please try again.');
        }
      } else {
        console.log('No provider token in session');
      }
    };

    checkSession();
  }, [supabase, onSuccess]);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      
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
          }
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
      disabled={disabled || isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Mail className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Mail className="mr-2 h-4 w-4" />
      )}
      Connect Gmail
    </Button>
  );
} 