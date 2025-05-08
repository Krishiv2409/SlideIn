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
import { Loader2, Mail, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

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
  }, [])

  useEffect(() => {
    if (!mounted) return;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session error:', error)
          throw error
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
  }, [mounted, supabase, router])

  const loadEmailAccounts = async (userId: string) => {
    if (!supabase) {
      console.error('Supabase client not initialized');
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
      toast.error('Failed to load email accounts. Please try refreshing the page.');
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
      toast.error('Database connection not available');
      return;
    }

    try {
      if (accountId.startsWith('gmail-')) {
        const email = accountId.replace('gmail-', '');
        
        // Remove from Supabase
        const { error } = await supabase
          .from('email_accounts')
          .delete()
          .match({ email });
        
        if (error) throw error;
        
        // Update state
        setEmailAccounts(accounts => {
          const remainingAccounts = accounts.filter(acc => acc.id !== accountId);
          
          // If we removed the default account and have other accounts, set a new default
          if (remainingAccounts.length > 0 && !remainingAccounts.some(acc => acc.isDefault)) {
            // Update default in Supabase
            supabase
              .from('email_accounts')
              .update({ is_default: true })
              .match({ email: remainingAccounts[0].email });
            
            return remainingAccounts.map((acc, index) => ({
              ...acc,
              isDefault: index === 0
            }));
          }
          
          return remainingAccounts;
        });
        
        toast.success('Gmail account removed successfully');
      }
      // Add Outlook removal logic here when implemented
    } catch (error) {
      console.error('Error removing account:', error);
      toast.error('Failed to remove account');
    }
  };

  const handleSetDefault = async (accountId: string) => {
    if (!supabase) {
      toast.error('Database connection not available');
      return;
    }

    try {
      const email = accountId.split('-')[1];
      
      // Update in Supabase
      const { error } = await supabase
        .from('email_accounts')
        .update({ is_default: false })
        .neq('email', email);
      
      if (error) throw error;
      
      const { error: setDefaultError } = await supabase
        .from('email_accounts')
        .update({ is_default: true })
        .match({ email });
      
      if (setDefaultError) throw setDefaultError;
      
      // Update state
      setEmailAccounts(accounts => accounts.map(acc => ({
        ...acc,
        isDefault: acc.id === accountId
      })));
      
      toast.success('Default email account updated');
    } catch (error) {
      console.error('Error setting default account:', error);
      toast.error('Failed to update default account');
    }
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="account" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
        <TabsTrigger value="account">Email Accounts</TabsTrigger>
        <TabsTrigger value="preferences">Preferences</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="account" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Accounts</CardTitle>
            <CardDescription>Connect your email accounts to send emails from SlideIn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                <div key={account.id} className="rounded-md border p-4">
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
                    <div className="flex items-center gap-2">
                      {!account.isDefault && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetDefault(account.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive"
                        onClick={() => handleRemoveAccount(account.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => { window.location.href = '/api/gmail-oauth/start'; }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Connect Gmail
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                disabled
              >
                <Mail className="mr-2 h-4 w-4" />
                Connect Outlook
                <span className="ml-2 text-xs text-muted-foreground">(Coming soon)</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SMTP Settings</CardTitle>
            <CardDescription>Configure custom SMTP server for sending emails</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input id="smtp-host" placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input id="smtp-port" placeholder="587" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-user">Username</Label>
                <Input id="smtp-user" placeholder="username" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-pass">Password</Label>
                <Input id="smtp-pass" type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="smtp-ssl" />
              <Label htmlFor="smtp-ssl">Use SSL/TLS</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save SMTP Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="preferences" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Preferences</CardTitle>
            <CardDescription>Customize your email sending preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
          <CardFooter>
            <Button>Save Preferences</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure how you want to be notified</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
          <CardFooter>
            <Button>Save Notification Settings</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
