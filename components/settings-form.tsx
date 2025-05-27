"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { showToast } from "@/components/ui/toast-config"

interface EmailAccount {
  id: string
  email: string
  provider: 'gmail' | 'outlook'
  isConnected: boolean
  displayName?: string
  isDefault?: boolean
}

interface GmailTokens {
  access_token: string
  refresh_token: string
  expiry_date: number
}

interface StoredGmailAccount {
  email: string
  tokens: GmailTokens
  displayName?: string
}

export function SettingsForm() {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const router = useRouter()
  
  useEffect(() => {
    setMounted(true)
    
    // Immediately check auth rather than waiting for mounted to be true
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          router.push('/sign-in')
          return
        }

        if (session) {
          setIsAuthenticated(true)
          loadEmailAccounts(session.user.id)
        } else {
          console.log('No session found')
          router.push('/sign-in')
        }
      } catch (error) {
        console.error('Auth error:', error)
        router.push('/sign-in')
      } finally {
        // Ensure loading state is turned off even if there's an error
        setIsLoading(false)
      }
    }

    checkAuth()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true)
        loadEmailAccounts(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setEmailAccounts([])
        router.push('/sign-in')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router]) // Remove mounted dependency

  const loadEmailAccounts = async (userId: string) => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      showToast.error({ message: 'Database connection not available' });
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Loading email accounts for userId:', userId);
      // Get accounts from Supabase for this user
      const { data: accounts, error } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: true });

      console.log('Supabase accounts result:', accounts);
      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!accounts || accounts.length === 0) {
        console.log('No accounts found for userId:', userId);
        setEmailAccounts([]);
        setIsLoading(false);
        return;
      }

      // Only use Supabase data for the account list
      const formattedAccounts = accounts.map(acc => ({
        id: acc.id,
        email: acc.email,
        provider: acc.provider as 'gmail' | 'outlook',
        isConnected: true,
        displayName: acc.display_name,
        isDefault: acc.is_default
      }));
      console.log('Formatted accounts for display:', formattedAccounts);
      setEmailAccounts(formattedAccounts);
    } catch (error) {
      console.error('Error loading email accounts:', error instanceof Error ? error.message : 'Unknown error');
      showToast.error({ 
        message: 'Failed to load email accounts', 
        description: 'Please try refreshing the page' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectGmail = async () => {
    if (!supabase) {
      toast.error('Database connection not available');
      return;
    }
    setIsConnecting(true);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication error. Please try signing in again.');
        setIsConnecting(false);
        return;
      }

      // If we have a session, proceed with Gmail connection
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
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
        console.error('Gmail OAuth error:', error);
        toast.error(`Failed to connect Gmail: ${error.message}`);
        setIsConnecting(false);
        return;
      }

      // The actual account addition will happen in the callback
    } catch (error) {
      console.error('Error during Gmail connect:', error);
      toast.error('Failed to connect Gmail. Please try again.');
      setIsConnecting(false);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    if (!supabase) {
      showToast.error({ message: 'Database connection not available' });
      return;
    }

    try {
      // Get current session for user ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user?.id) {
        console.error('Session error during account removal:', sessionError);
        showToast.error({ 
          message: 'Authentication error', 
          description: 'Please try signing in again' 
        });
        return;
      }
      
      // Check if this is a default account
      const accountToRemove = emailAccounts.find(acc => acc.id === accountId);
      if (!accountToRemove) {
        throw new Error('Account not found');
      }

      const isDefaultAccount = accountToRemove.isDefault;
      
      // Show loading toast
      showToast.info({ message: 'Removing email account...' });
      
      // Remove account from database using the database ID
      const { error } = await supabase
        .from('email_accounts')
        .delete()
        .eq('id', accountId);
      
      if (error) {
        console.error('Error deleting account from database:', error);
        throw error;
      }
      
      // If we removed the default account and have other accounts, set a new default
      if (isDefaultAccount) {
        // Get remaining accounts
        const { data: remainingAccounts, error: fetchError } = await supabase
          .from('email_accounts')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);
          
        if (!fetchError && remainingAccounts && remainingAccounts.length > 0) {
          // Set the first remaining account as default
          const { error: updateError } = await supabase
            .from('email_accounts')
            .update({ is_default: true })
            .eq('id', remainingAccounts[0].id);
            
          if (updateError) {
            console.error('Error setting new default account:', updateError);
            // Continue despite this error, as the account was still removed
          }
        }
      }
      
      // Reload the accounts list to reflect changes
      await loadEmailAccounts(session.user.id);
      
      showToast.success({ 
        message: 'Email account removed successfully' 
      });
    } catch (error) {
      console.error('Error removing account:', error);
      showToast.error({ 
        message: 'Failed to remove account', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  const handleSetDefault = async (accountId: string) => {
    if (!supabase) {
      showToast.error({ message: 'Database connection not available' });
      return;
    }

    try {
      // Get current session for user ID
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user?.id) {
        console.error('Session error during default setting:', sessionError);
        showToast.error({ 
          message: 'Authentication error', 
          description: 'Please try signing in again' 
        });
        return;
      }

      // Show loading toast
      showToast.info({ message: 'Setting default email account...' });
      
      // First, unset all defaults for this user
      const { error: clearError } = await supabase
        .from('email_accounts')
        .update({ is_default: false })
        .eq('user_id', session.user.id);
      
      if (clearError) {
        console.error('Error clearing default flags:', clearError);
        throw clearError;
      }
      
      // Set the specified account as default
      const { error: setDefaultError } = await supabase
        .from('email_accounts')
        .update({ is_default: true })
        .eq('id', accountId);
      
      if (setDefaultError) {
        console.error('Error setting default account:', setDefaultError);
        throw setDefaultError;
      }
      
      // Reload the accounts list to reflect changes
      await loadEmailAccounts(session.user.id);
      
      showToast.success({ message: 'Default email account updated' });
    } catch (error) {
      console.error('Error setting default account:', error);
      showToast.error({ 
        message: 'Failed to update default account', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Tabs defaultValue="account" className="w-full h-full">
        <div className="sticky top-0 z-10 pt-4 pb-3 backdrop-blur-sm bg-background/95 border-b">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto rounded-xl p-1 gap-1 bg-muted/30">
              <TabsTrigger value="account" className="rounded-lg py-2.5 text-sm font-medium">
                Email Accounts
              </TabsTrigger>
              <TabsTrigger value="preferences" className="rounded-lg py-2.5 text-sm font-medium">
                Preferences
              </TabsTrigger>
              <TabsTrigger value="notifications" className="rounded-lg py-2.5 text-sm font-medium">
                Notifications
              </TabsTrigger>
            </TabsList>
          </div>
        </div>
        
        <TabsContent value="account" className="w-full h-[calc(100vh-120px)] overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto px-4 py-6">
            <Card className="shadow-sm overflow-hidden border rounded-xl w-full">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Email Accounts</CardTitle>
                    <CardDescription>Connect your email accounts to send emails from SlideIn</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      setIsLoading(true);
                      try {
                        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                        if (sessionError || !session?.user?.id) {
                          throw new Error('Authentication error');
                        }
                        await loadEmailAccounts(session.user.id);
                        showToast.success({ message: "Accounts refreshed" });
                      } catch (error) {
                        console.error('Error refreshing accounts:', error);
                        showToast.error({ message: 'Failed to refresh accounts' });
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Refresh"
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : emailAccounts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No email accounts connected
                  </div>
                ) : (
                  emailAccounts.map((account) => (
                    <div key={account.id} className="rounded-lg border p-4 transition-all hover:bg-slate-50">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center",
                              account.provider === 'gmail' ? "bg-pink-100" : "bg-blue-100"
                            )}>
                              <span className={cn(
                                "text-sm font-medium",
                                account.provider === 'gmail' ? "text-pink-500" : "text-blue-500"
                              )}>
                                {account.provider === 'gmail' ? 'G' : 'O'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{account.email}</p>
                                {account.isDefault && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground capitalize">{account.provider}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!account.isDefault && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                showToast.info({ 
                                  message: "Setting default email account",
                                  description: "Are you sure you want to change your default email?"
                                });
                                handleSetDefault(account.id);
                              }}
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive"
                            onClick={() => {
                              showToast.warning({ 
                                message: "Removing email account",
                                description: "Are you sure you want to remove this email account?"
                              });
                              handleRemoveAccount(account.id);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Button
                    className="w-full bg-white hover:bg-slate-50 text-black border"
                    variant="outline"
                    onClick={() => { window.location.href = '/api/gmail-oauth/start'; }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="52 42 88 66" width="20" height="20" className="shrink-0">
                        <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"/>
                        <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"/>
                        <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"/>
                        <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92"/>
                        <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"/>
                      </svg>
                      Connect Gmail
                    </div>
                  </Button>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={async () => {
                      try {
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
                        console.error('Error connecting Outlook:', error);
                        toast.error('Failed to connect Outlook. Please try again.');
                      }
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Connect Outlook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="w-full h-[calc(100vh-120px)] overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto px-4 py-6">
            <Card className="shadow-sm overflow-hidden border rounded-xl w-full">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Email Preferences</CardTitle>
                    <CardDescription>Customize your email sending preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Default Signature</h3>
                  <div className="rounded-md border">
                    <textarea
                      className="min-h-[120px] w-full resize-none rounded-md border-0 p-3 text-sm"
                      placeholder="Enter your default signature..."
                      defaultValue="Best regards,&#10;Your Name&#10;Your Position | Your Company&#10;your@email.com | (123) 456-7890"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Follow-up Settings</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto follow-up</Label>
                        <p className="text-sm text-muted-foreground">Automatically send follow-up emails</p>
                      </div>
                      <Switch />
                    </div>

                    <div className="space-y-2">
                      <Label>Follow-up delay</Label>
                      <Select defaultValue="3">
                        <SelectTrigger>
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 days</SelectItem>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="5">5 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Maximum follow-ups</Label>
                      <Select defaultValue="2">
                        <SelectTrigger>
                          <SelectValue placeholder="Select number" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 follow-up</SelectItem>
                          <SelectItem value="2">2 follow-ups</SelectItem>
                          <SelectItem value="3">3 follow-ups</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Email Tracking</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch id="track-opens" defaultChecked />
                      <Label htmlFor="track-opens">Track email opens</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="track-clicks" defaultChecked />
                      <Label htmlFor="track-clicks">Track link clicks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="track-replies" defaultChecked />
                      <Label htmlFor="track-replies">Track replies</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-slate-50 py-4">
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="w-full h-[calc(100vh-120px)] overflow-y-auto">
          <div className="w-full max-w-3xl mx-auto px-4 py-6">
            <Card className="shadow-sm overflow-hidden border rounded-xl w-full">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white pb-6 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>Configure how you want to be notified</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Email Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-opens">When someone opens your email</Label>
                      <Switch id="notify-opens" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-replies">When someone replies to your email</Label>
                      <Switch id="notify-replies" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notify-clicks">When someone clicks a link</Label>
                      <Switch id="notify-clicks" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Daily Digest</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Daily email summary</Label>
                        <p className="text-sm text-muted-foreground">Receive a daily summary of all activity</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred time</Label>
                      <Select defaultValue="morning">
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (9 AM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (2 PM)</SelectItem>
                          <SelectItem value="evening">Evening (6 PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Browser Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="browser-notify">Enable browser notifications</Label>
                      <Switch id="browser-notify" defaultChecked />
                    </div>
                    <Button variant="outline" size="sm">
                      Test Browser Notification
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t bg-slate-50 py-4">
                <Button>Save Notification Settings</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
