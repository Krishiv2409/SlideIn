"use client"

import { useState } from "react"
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Loader2 } from 'lucide-react';

export function MicrosoftSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleMicrosoftSignIn = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: [
            'email',
            'profile',
            'offline_access',
            'https://graph.microsoft.com/User.Read',
            'https://graph.microsoft.com/Mail.Send',
            'https://graph.microsoft.com/Mail.ReadWrite'
          ].join(' '),
          redirectTo: `${window.location.origin}/api/microsoft-auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error signing in with Microsoft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleMicrosoftSignIn}
      className="w-full flex items-center justify-center gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Icons.microsoft className="h-5 w-5" />
      )}
      Sign in with Microsoft
    </Button>
  );
} 