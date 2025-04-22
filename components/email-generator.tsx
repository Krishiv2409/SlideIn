"use client"

import { useState, useEffect } from "react"
import { Loader2, Send, Sparkles, Mail, Check, X } from "lucide-react"
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
import { getGmailTokens, updateGmailTokens, isGmailConnected } from '@/lib/supabase-storage'
import { GmailConnectButton } from './gmail-connect-button'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
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

export function EmailGenerator() {
  const [url, setUrl] = useState("")
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

  useEffect(() => {
    const checkGmailConnection = async () => {
      try {
        console.log('Checking Gmail connection...');
        const supabase = createClientComponentClient();
        
        // First check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('Session check:', { session, error: sessionError });
        
        if (sessionError || !session?.user) {
          console.log('No valid session found');
          setIsGmailReady(false);
          setIsCheckingAuth(false);
          return;
        }

        // Check if we have stored tokens
        const tokens = await getGmailTokens();
        console.log('Stored tokens check:', tokens);
        
        if (!tokens) {
          console.log('No stored Gmail tokens found');
          setIsGmailReady(false);
          setIsCheckingAuth(false);
          return;
        }

        // Validate token data
        if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
          console.log('Invalid token data found');
          setIsGmailReady(false);
          setIsCheckingAuth(false);
          return;
        }

        // Check if token is expired (with 5 minutes buffer)
        const currentTime = Date.now();
        if (tokens.expiry_date < currentTime + 5 * 60 * 1000) {
          console.log('Gmail token is expired or about to expire');
          setIsGmailReady(false);
          setIsCheckingAuth(false);
          return;
        }

        console.log('Gmail is connected');
        setIsGmailReady(true);
      } catch (error) {
        console.error('Error checking Gmail connection:', error);
        setIsGmailReady(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkGmailConnection();
  }, []);

  // Sender email options
  const senderOptions = [
    { value: "krishivkhatri2409@gmail.com", label: "krishivkhatri2409@gmail.com" },
    { value: "personal@example.com", label: "personal@example.com" },
    { value: "work@company.com", label: "work@company.com" }
  ]

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urlContent: url,
          goal: goal === 'other' ? customGoal : goal,
          tone: tone,
          userName: 'Alex Johnson', // TODO: Get from user profile
          recipientEmail: recipientEmail
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate email');
      }

      const data = await response.json();
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
      alert('Failed to generate email. Please try again.');
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
    } catch (error) {
      console.error('Error sending email:', error);
      setSendStatus('error');
      toast.error(error instanceof Error ? error.message : "Failed to send email. Please try again.");
    } finally {
      setIsSending(false);
    }
  }


  return (
    <div className="space-y-6">
      {isCheckingAuth ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Checking authentication...</p>
            </div>
          </CardContent>
        </Card>
      ) : !isGmailReady ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <Mail className="h-12 w-12 text-muted-foreground" />
              <div className="text-center space-y-2">
                <h3 className="text-lg font-medium">Connect Gmail</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your Gmail account to send emails
                </p>
              </div>
              <GmailConnectButton 
                onSuccess={() => setIsGmailReady(true)}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {!generated ? (
            <Card>
              <CardContent className="pt-6">
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
              <Card className="md:col-span-1">
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
              <Card className="md:col-span-1">
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
                        <Label htmlFor="sender">Send from</Label>
                        <Select value={senderEmail} onValueChange={setSenderEmail}>
                          <SelectTrigger id="sender">
                            <SelectValue placeholder="Select email account" />
                          </SelectTrigger>
                          <SelectContent>
                            {senderOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Send to</Label>
                        <div className="relative">
                          <Input 
                            id="recipient" 
                            placeholder="recipient@example.com"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            onFocus={() => extractedEmails.length > 0 && setShowEmailDropdown(true)}
                          />
                          {showEmailDropdown && extractedEmails.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                              <ul className="py-1 max-h-56 overflow-auto">
                                {extractedEmails.map((email, index) => (
                                  <li 
                                    key={index} 
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
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
                                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-500"
                                  onClick={() => setShowEmailDropdown(false)}
                                >
                                  Close
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        {extractedEmails.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
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
                          "w-full text-white hover:bg-pink-600 transition-all duration-200",
                          isSending ? "bg-pink-400" : "bg-pink-500",
                          sendStatus === 'success' && "bg-green-500 hover:bg-green-600",
                          sendStatus === 'error' && "bg-red-500 hover:bg-red-600"
                        )} 
                        size="lg"
                        disabled={isSending}
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : sendStatus === 'success' ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Sent!
                          </>
                        ) : sendStatus === 'error' ? (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Failed
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Now
                          </>
                        )}
                      </Button>

                      <div className="rounded-md bg-muted p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-pink-500" />
                          <span>
                            <span className="font-medium">Pro tip:</span> Emails sent between 9-11am have 32% higher
                            response rates 🚀
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
