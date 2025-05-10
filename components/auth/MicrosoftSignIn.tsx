"use client"

import { useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Loader2 } from 'lucide-react';

export function MicrosoftSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

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
      className="w-full"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.microsoft className="mr-2 h-4 w-4" />
      )}
      Sign in with Microsoft
    </Button>
  );
} 