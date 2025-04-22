'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { GmailConnectButton } from './gmail-connect-button';
import { getGmailTokens, updateGmailTokens, saveGmailTokens } from '@/lib/supabase-storage';
import { supabase } from '@/lib/supabase';
import axios from 'axios';

export function GmailTest() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Test Email from SlideIn');
  const [content, setContent] = useState('<p>This is a test email sent using Gmail API!</p>');
  const [isSending, setIsSending] = useState(false);
  const [isGmailReady, setIsGmailReady] = useState(false);
  
  useEffect(() => {
    const checkGmailConnection = async () => {
      try {
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }

        if (session?.provider_token) {
          // Save the tokens to our storage
          await saveGmailTokens({
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token || '',
            expiry_date: Date.now() + (session.expires_in || 3600) * 1000
          });
          setIsGmailReady(true);
        } else {
          // Try to get tokens from our storage
          const tokens = await getGmailTokens();
          if (tokens) {
            setIsGmailReady(true);
          }
        }
      } catch (error) {
        console.error('Error checking Gmail connection:', error);
      }
    };
    
    checkGmailConnection();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.provider_token) {
        saveGmailTokens({
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token || '',
          expiry_date: Date.now() + (session.expires_in || 3600) * 1000
        }).then(() => setIsGmailReady(true));
      } else if (event === 'SIGNED_OUT') {
        setIsGmailReady(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const handleSendTestEmail = async () => {
    if (!to) {
      toast.error('Please enter a recipient email address');
      return;
    }
    
    const gmailTokens = await getGmailTokens();
    if (!gmailTokens) {
      toast.error('Gmail is not connected. Please connect your Gmail account first.');
      return;
    }
    
    setIsSending(true);
    
    try {
      const response = await axios.post('/api/send-email', {
        to,
        subject,
        html: content,
        gmailTokens
      });
      
      if (response.data.success) {
        toast.success('Email sent successfully!');
      } else {
        // Check if token was refreshed
        if (response.data.refreshedTokens) {
          await updateGmailTokens(response.data.refreshedTokens);
          toast.error('Token refreshed. Please try again.');
        } else {
          toast.error(response.data.error || 'Failed to send email');
        }
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="space-y-6 p-4 bg-card rounded-lg border">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gmail API Test</h2>
        <p className="text-muted-foreground">Test sending emails using Gmail API</p>
      </div>
      
      <div>
        {!isGmailReady ? (
          <div className="flex flex-col gap-4 items-center justify-center p-8 border rounded-lg">
            <p className="text-center text-muted-foreground">Connect your Gmail account to send emails</p>
            <GmailConnectButton />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="content">Content (HTML)</Label>
              <Textarea
                id="content"
                placeholder="<p>Your email content here</p>"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
              />
            </div>
            
            <Button
              onClick={handleSendTestEmail}
              disabled={isSending || !to}
              className="w-full"
            >
              {isSending ? 'Sending...' : 'Send Test Email'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 