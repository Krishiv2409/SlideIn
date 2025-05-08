"use client"

import { useState, useEffect } from "react"
import { Loader2, Send, Sparkles, Mail, Check, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { 
  getGmailTokens, 
  updateGmailTokens, 
  isGmailConnected, 
  reconnectGmailAccount,
  syncGmailTokensFromEmailAccounts
} from '@/lib/supabase-storage'
import { GmailConnectButton } from './gmail-connect-button'
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

const tones = [
  {
    id: "polite",
    label: "📚 Polite Genius",
    description: "Formal and respectful",
  },
  {
    id: "professional",
    label: "💼 Professional Hustler",
    description: "Confident and business-like",
  },
  {
    id: "chill",
    label: "💌 Chill & Curious",
    description: "Casual and inquisitive",
  },
  {
    id: "bold",
    label: "🔥 Bold + Direct",
    description: "Straight to the point",
  },
]

const goals = [
  { value: "internship", label: "Internship" },
  { value: "research", label: "Research position" },
  { value: "partnership", label: "Business partnership" },
  { value: "networking", label: "Networking" },
  { value: "other", label: "Other" },
]

interface EmailAccount {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook';
  isConnected: boolean;
  displayName?: string;
  isDefault: boolean;
}

export function EmailGenerator() {
  const [url, setUrl] = useState("")
  const [userName, setUserName] = useState("")
  const [goal, setGoal] = useState("")
  const [tone, setTone] = useState("professional")
  const [customGoal, setCustomGoal] = useState("")
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [subject, setSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [warmth, setWarmth] = useState([50])
  const [recipientEmail, setRecipientEmail] = useState("")
  const [extractedEmails, setExtractedEmails] = useState<string[]>([])
  const [showEmailDropdown, setShowEmailDropdown] = useState(false)
  const [senderEmail, setSenderEmail] = useState("personal@example.com")
  const [isGmailReady, setIsGmailReady] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [isGmailConnecting, setIsGmailConnecting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([])
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  // New code - Add useSearchParams to detect when returning from OAuth flow
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const successParam = searchParams.get('success');

  // Function to load email accounts - extracted for reusability
  const loadEmailAccounts = async () => {
    if (!supabase) {
      console.error('DEBUG: Supabase client not initialized');
      setIsLoadingAccounts(false);
      setIsGmailReady(false);
      return;
    }
    
    console.log('DEBUG: Loading email accounts...');
    try {
      // Get current session with more detailed error handling
      let sessionResult;
      try {
        sessionResult = await supabase.auth.getSession();
        console.log('DEBUG: Session fetch result:', 
          sessionResult.data?.session ? 'Session exists' : 'No session',
          'Error:', sessionResult.error ? sessionResult.error.message : 'None'
        );
      } catch (sessionError) {
        console.error('DEBUG: Exception fetching session:', sessionError);
        throw sessionError;
      }

      const { data: { session }, error: sessionError } = sessionResult;
      
      if (sessionError) {
        console.error('DEBUG: Session error', sessionError);
        throw sessionError;
      }
      
      if (!session?.user?.id) {
        console.log('DEBUG: No active session or user ID');
        setEmailAccounts([]);
        setIsLoadingAccounts(false);
        setIsGmailReady(false);
        return;
      }
      
      console.log('DEBUG: Session found, user ID:', session.user.id);
      // Get accounts from Supabase for this user
      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!accounts || accounts.length === 0) {
        console.log('DEBUG: No email accounts found');
        setEmailAccounts([]);
        setIsLoadingAccounts(false);
        setIsGmailReady(false);
        return;
      }

      // Only use Supabase data for the account list
      const formattedAccounts = accounts.map(acc => ({
        id: acc.id,
        email: acc.email,
        provider: acc.provider as 'gmail' | 'outlook',
        isConnected: !!(acc.access_token && acc.refresh_token && acc.refresh_token !== 'EMPTY' && acc.refresh_token !== ''),
        displayName: acc.display_name,
        isDefault: acc.is_default
      }));
      console.log('DEBUG: Raw accounts from DB:', accounts);
      console.log('DEBUG: Formatted accounts:', formattedAccounts);
      // Only set isGmailReady to true if there is at least one Gmail account with valid tokens
      const hasValidGmail = formattedAccounts.some(
        acc => acc.provider === 'gmail' && acc.isConnected
      );
      console.log('DEBUG: Has valid Gmail:', hasValidGmail);
      setEmailAccounts(formattedAccounts);
      setIsGmailReady(hasValidGmail);
      // Set default account
      const defaultAccount = formattedAccounts.find(acc => acc.isDefault);
      if (defaultAccount) {
        setSelectedAccount(defaultAccount.id);
      }
    } catch (error) {
      console.error('Error loading email accounts:', error instanceof Error ? error.message : 'Unknown error');
      toast.error('Failed to load email accounts. Please try refreshing the page.');
      setIsGmailReady(false);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  // Initial load with session recovery attempt
  useEffect(() => {
    const initializeWithSessionRecovery = async () => {
      console.log('DEBUG: Initializing component with session recovery');
      // Try to refresh the session first
      try {
        await refreshSession();
      } catch (error) {
        console.error('DEBUG: Error during initial session refresh:', error);
      }
      
      // Attempt to sync Gmail tokens between tables
      try {
        const syncResult = await syncGmailTokensFromEmailAccounts();
        console.log('DEBUG: Gmail token sync result:', syncResult);
      } catch (error) {
        console.error('DEBUG: Error syncing Gmail tokens:', error);
      }
      
      // Load accounts regardless of session refresh outcome
      await loadEmailAccounts();
    };
    
    initializeWithSessionRecovery();
  }, []);

  // Added new effect to handle successful Gmail connection
  useEffect(() => {
    if (successParam === 'gmail_connected') {
      console.log('DEBUG: Detected successful Gmail connection, reloading accounts');
      // Clear the URL parameter without page refresh
      if (typeof window !== 'undefined') {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
      // Reload email accounts after successful connection
      loadEmailAccounts();
      toast.success('Gmail connected successfully!');
    }
  }, [successParam]);

  // Set up auth state change listener
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('DEBUG: Auth state changed to SIGNED_IN, reloading accounts');
        loadEmailAccounts();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  // Added debug button function to manually refresh accounts
  const handleDebugRefresh = async () => {
    console.log('DEBUG: Manual refresh triggered');
    setIsLoadingAccounts(true);
    await loadEmailAccounts();
    toast.success('Email accounts refreshed');
  };

  // Add function to attempt session recovery
  const refreshSession = async () => {
    try {
      console.log('DEBUG: Attempting session recovery...');
      const { data, error } = await supabase.auth.refreshSession();
      
      console.log('DEBUG: Session refresh result:', 
        data.session ? 'Session refreshed' : 'No session after refresh',
        'Error:', error ? error.message : 'None'
      );
      
      if (error) {
        console.error('DEBUG: Session refresh error', error);
        return false;
      }
      
      if (data.session) {
        console.log('DEBUG: Session successfully refreshed');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('DEBUG: Exception during session refresh:', error);
      return false;
    }
  };

  // Enhanced debug button with session refresh
  const handleDebugSessionRefresh = async () => {
    console.log('DEBUG: Manual session refresh triggered');
    const success = await refreshSession();
    if (success) {
      setIsLoadingAccounts(true);
      await loadEmailAccounts();
      toast.success('Session refreshed and accounts reloaded');
    } else {
      toast.error('Session refresh failed');
    }
  };

  // Sender email options
  const senderOptions = [
    { value: "personal@example.com", label: "personal@example.com" },
    { value: "work@company.com", label: "work@company.com" }
  ]

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (!url) {
        toast.error("Please enter a URL");
        return;
      }

      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urlContent: url,
          goal: goal === 'other' ? customGoal : goal,
          tone: tone,
          userName: userName || 'User',
          recipientEmail: recipientEmail,
          url: url
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate email');
      }

      setSubject(data.subject);
      setEmailBody(data.body);
      
      // Handle extracted emails
      if (data.extractedEmails && data.extractedEmails.length > 0) {
        setExtractedEmails(data.extractedEmails);
        
        // Auto-set the first email if none is already set
        if (!recipientEmail && data.recipientEmail) {
          setRecipientEmail(data.recipientEmail);
        }
        
        // Show the dropdown if we have multiple emails
        if (data.extractedEmails.length > 1) {
          setShowEmailDropdown(true);
        }
      }
      
      setGenerated(true);
    } catch (error) {
      console.error('Error generating email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!recipientEmail) {
      toast.error("Please enter a recipient email address");
      return;
    }
    
    // Get Gmail tokens from Supabase storage
    try {
      const gmailTokens = await getGmailTokens();
      if (!gmailTokens) {
        toast.error("Please connect your Gmail account first. Click the 'Connect Gmail' button in the top right corner.");
        return;
      }
      
      setIsSending(true);
      setSendStatus('idle');
      
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: recipientEmail,
            subject,
            html: emailBody.replace(/\n/g, '<br>'),
            gmailTokens
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          // Check if token was refreshed
          if (responseData.refreshedTokens) {
            await updateGmailTokens(responseData.refreshedTokens);
            toast.error('Token refreshed. Please try sending again.');
            setSendStatus('error');
            return;
          }
          
          // Extract the error message from the response
          const errorMessage = responseData.error && typeof responseData.error === 'string' 
            ? responseData.error 
            : responseData.error?.message || 'Failed to send email';
          
          throw new Error(errorMessage);
        }

        setSendStatus('success');
        toast.success("Email sent successfully! 🎉");
        
        // Reset the send status after 2 seconds
        setTimeout(() => {
          setSendStatus('idle');
        }, 2000);
      } catch (error) {
        console.error('Error sending email:', error);
        setSendStatus('error');
        toast.error(error instanceof Error ? error.message : "Failed to send email. Please try again.");
        
        // Reset error status after 3 seconds
        setTimeout(() => {
          setSendStatus('idle');
        }, 3000);
      } finally {
        setIsSending(false);
      }
    } catch (error) {
      console.error('Error getting Gmail tokens:', error);
      
      // Handle the specific reconnection error
      if (error instanceof Error && error.message.includes('Gmail reconnection required')) {
        toast.error("Your Gmail connection needs to be refreshed. Please reconnect your Gmail account.");
        // Use the new helper function instead of just handleGmailConnect
        reconnectGmailAccount();
        return;
      }
      
      toast.error("Failed to access your Gmail account. Please try reconnecting.");
    }
  }

  const handleGmailConnect = () => {
    window.location.href = '/api/gmail-oauth/start';
  };

  return (
    <div className="w-full h-full px-4 py-8">
      <div className="w-full h-full flex items-center justify-center bg-white rounded-2xl p-4 md:p-8 min-h-[400px]">
        {isLoadingAccounts ? (
          <Card className="shadow-none border-none">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-4 p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading email accounts...</p>
              </div>
            </CardContent>
          </Card>
        ) : !isGmailReady ? (
          <Card className="shadow-none border-none">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-6 p-8 animate-fadein">
                {/* Provider logo placeholder - replace with actual logo SVG as needed */}
                <div className="mb-2">
                  {/* TODO: Replace this SVG with the actual provider logo (Google/Outlook) as needed */}
                  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto">
                    <rect width="56" height="56" rx="16" fill="#F3F4F6" />
                    <text x="50%" y="54%" textAnchor="middle" fill="#888" fontSize="24" fontFamily="Inter, sans-serif" dy=".3em">@</text>
                  </svg>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">Connect Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a provider to connect and send emails securely.
                  </p>
                </div>
                <div className="flex flex-col gap-4 w-full max-w-sm mx-auto animate-fadein delay-100">
                  {/* Gmail Button */}
                  <button
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white rounded-xl shadow-none transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pink-400 text-gray-900 font-medium border border-gray-200"
                    onClick={handleGmailConnect}
                    aria-label="Connect with Gmail"
                    disabled={isGmailConnecting}
                  >
                    {/* Gmail logo SVG, left of the button text */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="52 42 88 66" width="20" height="20" className="shrink-0">
                      <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"/>
                      <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"/>
                      <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"/>
                      <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92"/>
                      <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"/>
                    </svg>
                    <span>{isGmailConnecting ? 'Connecting...' : 'Connect with Gmail'}</span>
                  </button>
                  {/* Outlook Button */}
                  <button
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white rounded-xl shadow-none transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 font-medium border border-gray-200"
                    // TODO: Replace onClick with actual Outlook connect logic
                    onClick={() => {/* Connect Outlook logic here */}}
                    aria-label="Connect with Outlook"
                  >
                    {/* Outlook logo SVG, left of the button text */}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1831.085 1703.335" width="20" height="20" className="shrink-0">
                      <path fill="#0A2767" d="M1831.083,894.25c0.1-14.318-7.298-27.644-19.503-35.131h-0.213l-0.767-0.426l-634.492-375.585  c-2.74-1.851-5.583-3.543-8.517-5.067c-24.498-12.639-53.599-12.639-78.098,0c-2.934,1.525-5.777,3.216-8.517,5.067L446.486,858.693  l-0.766,0.426c-19.392,12.059-25.337,37.556-13.278,56.948c3.553,5.714,8.447,10.474,14.257,13.868l634.492,375.585  c2.749,1.835,5.592,3.527,8.517,5.068c24.498,12.639,53.599,12.639,78.098,0c2.925-1.541,5.767-3.232,8.517-5.068l634.492-375.585  C1823.49,922.545,1831.228,908.923,1831.083,894.25z"/>
                      <path fill="#0364B8" d="M520.453,643.477h416.38v381.674h-416.38V643.477z M1745.917,255.5V80.908  c1-43.652-33.552-79.862-77.203-80.908H588.204C544.552,1.046,510,37.256,511,80.908V255.5l638.75,170.333L1745.917,255.5z"/>
                      <path fill="#0078D4" d="M511,255.5h425.833v383.25H511V255.5z"/>
                      <path fill="#28A8EA" d="M1362.667,255.5H936.833v383.25L1362.667,1022h383.25V638.75L1362.667,255.5z"/>
                      <path fill="#0078D4" d="M936.833,638.75h425.833V1022H936.833V638.75z"/>
                      <path fill="#0364B8" d="M936.833,1022h425.833v383.25H936.833V1022z"/>
                      <path fill="#14447D" d="M520.453,1025.151h416.38v346.969h-416.38V1025.151z"/>
                      <path fill="#0078D4" d="M1362.667,1022h383.25v383.25h-383.25V1022z"/>
                      <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="1128.4584" y1="811.0833" x2="1128.4584" y2="1.9982" gradientTransform="matrix(1 0 0 -1 0 1705.3334)"><stop offset="0" style={{ stopColor: '#35B8F1' }}/><stop offset="1" style={{ stopColor: '#28A8EA' }}/></linearGradient>
                      <path fill="url(#SVGID_1_)" d="M1811.58,927.593l-0.809,0.426l-634.492,356.848c-2.768,1.703-5.578,3.321-8.517,4.769  c-10.777,5.132-22.481,8.029-34.407,8.517l-34.663-20.27c-2.929-1.47-5.773-3.105-8.517-4.897L447.167,906.003h-0.298  l-21.036-11.753v722.384c0.328,48.196,39.653,87.006,87.849,86.7h1230.914c0.724,0,1.363-0.341,2.129-0.341  c10.18-0.651,20.216-2.745,29.808-6.217c4.145-1.756,8.146-3.835,11.966-6.217c2.853-1.618,7.75-5.152,7.75-5.152  c21.814-16.142,34.726-41.635,34.833-68.772V894.25C1831.068,908.067,1823.616,920.807,1811.58,927.593z"/>
                      <path opacity="0.5" fill="#0A2767" enableBackground="new    " d="M1797.017,891.397v44.287l-663.448,456.791L446.699,906.301  c0-0.235-0.191-0.426-0.426-0.426l0,0l-63.023-37.899v-31.938l25.976-0.426l54.932,31.512l1.277,0.426l4.684,2.981  c0,0,645.563,368.346,647.267,369.197l24.698,14.478c2.129-0.852,4.258-1.703,6.813-2.555  c1.278-0.852,640.879-360.681,640.879-360.681L1797.017,891.397z"/>
                      <path fill="#1490DF" d="M1811.58,927.593l-0.809,0.468l-634.492,356.848c-2.768,1.703-5.578,3.321-8.517,4.769  c-24.641,12.038-53.457,12.038-78.098,0c-2.918-1.445-5.76-3.037-8.517-4.769L446.657,928.061l-0.766-0.468  c-12.25-6.642-19.93-19.409-20.057-33.343v722.384c0.305,48.188,39.616,87.004,87.803,86.7c0.001,0,0.002,0,0.004,0h1229.636  c48.188,0.307,87.5-38.509,87.807-86.696c0-0.001,0-0.002,0-0.004V894.25C1831.068,908.067,1823.616,920.807,1811.58,927.593z"/>
                      <path opacity="0.1" enableBackground="new    " d="M1185.52,1279.629l-9.496,5.323c-2.752,1.752-5.595,3.359-8.517,4.812  c-10.462,5.135-21.838,8.146-33.47,8.857l241.405,285.479l421.107,101.476c11.539-8.716,20.717-20.178,26.7-33.343L1185.52,1279.629  z"/>
                      <path opacity="0.05" enableBackground="new    " d="M1228.529,1255.442l-52.505,29.51c-2.752,1.752-5.595,3.359-8.517,4.812  c-10.462,5.135-21.838,8.146-33.47,8.857l113.101,311.838l549.538,74.989c21.649-16.254,34.394-41.743,34.407-68.815v-9.326  L1228.529,1255.442z"/>
                      <path fill="#28A8EA" d="M514.833,1703.333h1228.316c18.901,0.096,37.335-5.874,52.59-17.033l-697.089-408.331  c-2.929-1.47-5.773-3.105-8.517-4.897L447.125,906.088h-0.298l-20.993-11.838v719.914  C425.786,1663.364,465.632,1703.286,514.833,1703.333C514.832,1703.333,514.832,1703.333,514.833,1703.333z"/>
                      <path opacity="0.1" enableBackground="new    " d="M1022,418.722v908.303c-0.076,31.846-19.44,60.471-48.971,72.392  c-9.148,3.931-19,5.96-28.957,5.962H425.833V383.25H511v-42.583h433.073C987.092,340.83,1021.907,375.702,1022,418.722z"/>
                      <path opacity="0.2" enableBackground="new    " d="M979.417,461.305v908.302c0.107,10.287-2.074,20.469-6.388,29.808  c-11.826,29.149-40.083,48.273-71.54,48.417H425.833V383.25h475.656c12.356-0.124,24.533,2.958,35.344,8.943  C962.937,405.344,979.407,432.076,979.417,461.305z"/>
                      <path opacity="0.2" enableBackground="new    " d="M979.417,461.305v823.136c-0.208,43-34.928,77.853-77.927,78.225H425.833V383.25  h475.656c12.356-0.124,24.533,2.958,35.344,8.943C962.937,405.344,979.407,432.076,979.417,461.305z"/>
                      <path opacity="0.2" enableBackground="new    " d="M936.833,461.305v823.136c-0.046,43.067-34.861,78.015-77.927,78.225H425.833  V383.25h433.072c43.062,0.023,77.951,34.951,77.927,78.013C936.833,461.277,936.833,461.291,936.833,461.305z"/>
                      <linearGradient id="SVGID_2_" gradientUnits="userSpaceOnUse" x1="162.7469" y1="1383.0741" x2="774.0864" y2="324.2592" gradientTransform="matrix(1 0 0 -1 0 1705.3334)"><stop offset="0" style={{ stopColor: '#1784D9' }}/><stop offset="0.5" style={{ stopColor: '#107AD5' }}/><stop offset="1" style={{ stopColor: '#0A63C9' }}/></linearGradient>
                      <path fill="url(#SVGID_2_)" d="M78.055,383.25h780.723c43.109,0,78.055,34.947,78.055,78.055v780.723  c0,43.109-34.946,78.055-78.055,78.055H78.055c-43.109,0-78.055-34.947-78.055-78.055V461.305  C0,418.197,34.947,383.25,78.055,383.25z"/>
                      <path fill="#FFFFFF" d="M243.96,710.631c19.238-40.988,50.29-75.289,89.17-98.495c43.057-24.651,92.081-36.94,141.675-35.515  c45.965-0.997,91.321,10.655,131.114,33.683c37.414,22.312,67.547,55.004,86.742,94.109c20.904,43.09,31.322,90.512,30.405,138.396  c1.013,50.043-9.706,99.628-31.299,144.783c-19.652,40.503-50.741,74.36-89.425,97.388c-41.327,23.734-88.367,35.692-136.011,34.578  c-46.947,1.133-93.303-10.651-134.01-34.067c-37.738-22.341-68.249-55.07-87.892-94.28c-21.028-42.467-31.57-89.355-30.745-136.735  C212.808,804.859,223.158,755.686,243.96,710.631z M339.006,941.858c10.257,25.912,27.651,48.385,50.163,64.812  c22.93,16.026,50.387,24.294,78.353,23.591c29.783,1.178,59.14-7.372,83.634-24.358c22.227-16.375,39.164-38.909,48.715-64.812  c10.677-28.928,15.946-59.572,15.543-90.404c0.33-31.127-4.623-62.084-14.649-91.554c-8.855-26.607-25.246-50.069-47.182-67.537  c-23.88-17.79-53.158-26.813-82.91-25.55c-28.572-0.74-56.644,7.593-80.184,23.804c-22.893,16.496-40.617,39.168-51.1,65.365  c-23.255,60.049-23.376,126.595-0.341,186.728L339.006,941.858z"/>
                      <path fill="#50D9FF" d="M1362.667,255.5h383.25v383.25h-383.25V255.5z"/>
                    </svg>
                    <span>Connect with Outlook</span>
                  </button>
                </div>
                {/* Debug buttons for troubleshooting */}
                <div className="flex flex-col items-center mt-4 gap-2">
                  <button 
                    onClick={handleDebugRefresh}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Refresh accounts
                  </button>
                  <button 
                    onClick={handleDebugSessionRefresh}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Refresh session
                  </button>
                </div>
              </div>
              <style jsx>{`
                .animate-fadein {
                  animation: fadein 0.7s cubic-bezier(0.4,0,0.2,1);
                }
                .animate-fadein.delay-100 {
                  animation-delay: 0.1s;
                }
                @keyframes fadein {
                  from { opacity: 0; transform: translateY(16px); }
                  to { opacity: 1; transform: none; }
                }
              `}</style>
            </CardContent>
          </Card>
        ) : !generated ? (
          <Card className="shadow-none border-none">
            <CardContent className="pt-6 px-0">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url">Paste a URL (job post, professor page, etc.)</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com/job-posting"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">What's your goal?</Label>
                  <Select value={goal} onValueChange={setGoal}>
                    <SelectTrigger id="goal">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goals.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {goal === "other" && (
                    <Textarea
                      placeholder="Describe your goal..."
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Email Tone</Label>
                    <span className="text-sm text-muted-foreground">Warmth Level</span>
                  </div>
                  <Slider value={warmth} onValueChange={setWarmth} max={100} step={1} className="mb-6" />
                  <RadioGroup value={tone} onValueChange={setTone} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {tones.map((t) => (
                      <div key={t.id}>
                        <RadioGroupItem value={t.id} id={t.id} className="peer sr-only" />
                        <Label
                          htmlFor={t.id}
                          className={cn(
                            "flex cursor-pointer flex-col justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-pink-500 [&:has([data-state=checked])]:border-pink-500",
                            tone === t.id && "border-pink-500",
                          )}
                        >
                          <div className="flex flex-col space-y-1">
                            <span className="text-base">{t.label}</span>
                            <span className="text-sm font-normal text-muted-foreground">{t.description}</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <Button
                  onClick={handleGenerate}
                  className="w-full bg-pink-500 text-white hover:bg-pink-600"
                  size="lg"
                  disabled={loading || !url || !goal}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Email
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1 shadow-none border-none">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body">Email Body</Label>
                    <Textarea
                      id="body"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="min-h-[300px]"
                    />
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setGenerated(false)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => {
                        setSubject("")
                        setEmailBody("")
                        setGenerated(false)
                        setUrl("")
                        setGoal("")
                      }}
                      variant="ghost"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-1 shadow-none border-none">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Ready to send 🚀</h3>
                    <p className="text-sm text-muted-foreground">
                      Your email is ready to be sent. You can edit it on the left before sending.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sender" className="text-sm font-medium text-gray-700">Send from</Label>
                      <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger 
                          className="w-full border border-gray-200 shadow-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:border-pink-500 transition-all duration-200"
                        >
                          <SelectValue placeholder="Select sender account">
                            {selectedAccount && emailAccounts.find(acc => acc.id === selectedAccount)?.email}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {emailAccounts.map((account) => (
                            <SelectItem 
                              key={account.id} 
                              value={account.id}
                              className="flex items-center"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{account.email}</span>
                                {account.isDefault && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 ml-1">Default</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="recipient" className="text-sm font-medium text-gray-700">Send to</Label>
                      <div className="relative">
                        <Input 
                          id="recipient" 
                          placeholder="recipient@example.com"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          onFocus={() => extractedEmails.length > 0 && setShowEmailDropdown(true)}
                          className="w-full border border-gray-200 shadow-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 focus:border-pink-500 transition-all duration-200"
                        />
                        {showEmailDropdown && extractedEmails.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
                            <ul className="py-1 max-h-56 overflow-auto">
                              {extractedEmails.map((email, index) => (
                                <li 
                                  key={index} 
                                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm transition-colors duration-150"
                                  onClick={() => {
                                    setRecipientEmail(email);
                                    setShowEmailDropdown(false);
                                  }}
                                >
                                  {email}
                                </li>
                              ))}
                            </ul>
                            <div className="py-1 border-t border-gray-200">
                              <div 
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-500 text-center transition-colors duration-150"
                                onClick={() => setShowEmailDropdown(false)}
                              >
                                Close
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      {extractedEmails.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {extractedEmails.length} email{extractedEmails.length !== 1 ? 's' : ''} found on webpage
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Tracking Options</Label>
                      <Tabs defaultValue="basic">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="basic">Basic</TabsTrigger>
                          <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        </TabsList>
                        <TabsContent value="basic" className="space-y-4 pt-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="track-opens"
                              defaultChecked
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="track-opens" className="text-sm">
                              Track opens
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="track-clicks"
                              defaultChecked
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="track-clicks" className="text-sm">
                              Track link clicks
                            </Label>
                          </div>
                        </TabsContent>
                        <TabsContent value="advanced" className="space-y-4 pt-4">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="auto-follow" className="h-4 w-4 rounded border-gray-300" />
                            <Label htmlFor="auto-follow" className="text-sm">
                              Auto follow-up in 3 days
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="schedule" className="h-4 w-4 rounded border-gray-300" />
                            <Label htmlFor="schedule" className="text-sm">
                              Schedule for optimal time
                            </Label>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    <Button 
                      onClick={handleSend} 
                      className={cn(
                        "w-full shadow-sm font-medium flex items-center justify-center transition-all duration-300",
                        isSending ? 
                          "bg-pink-400 text-white hover:bg-pink-500" : 
                          sendStatus === 'success' ? 
                            "bg-emerald-500 text-white hover:bg-emerald-600" : 
                            sendStatus === 'error' ? 
                              "bg-red-500 text-white hover:bg-red-600" :
                              "bg-pink-500 text-white hover:bg-pink-600"
                      )}
                      size="lg"
                      disabled={isSending}
                    >
                      <div className="flex items-center justify-center gap-2 py-1">
                        {isSending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : sendStatus === 'success' ? (
                          <>
                            <Check className="h-5 w-5 animate-fadeIn" />
                            <span className="animate-fadeIn">Sent!</span>
                          </>
                        ) : sendStatus === 'error' ? (
                          <>
                            <X className="h-4 w-4" />
                            <span>Failed</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            <span>Send Now</span>
                          </>
                        )}
                      </div>
                    </Button>
                    <style jsx global>{`
                      @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-3px); }
                        to { opacity: 1; transform: translateY(0); }
                      }
                      .animate-fadeIn {
                        animation: fadeIn 0.3s ease-out forwards;
                      }
                    `}</style>
                    
                    <div className="rounded-md bg-muted p-3 mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Sparkles className="h-4 w-4 text-pink-500 flex-shrink-0" />
                        <span className="text-gray-600">
                          <span className="font-medium">Pro tip:</span> Emails sent between 9-11am have 32% higher
                          response rates
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}