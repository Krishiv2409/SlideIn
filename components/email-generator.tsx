"use client"

import { useState } from "react"
import { Loader2, Send, Sparkles } from "lucide-react"
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
      alert("Please enter a recipient email address");
      return;
    }
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmail,
          from: senderEmail,
          subject,
          html: emailBody.replace(/\n/g, '<br>'),
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Extract the error message from the response
        const errorMessage = responseData.error && typeof responseData.error === 'string' 
          ? responseData.error 
          : responseData.error?.message || 'Failed to send email';
        
        throw new Error(errorMessage);
      }

      alert("Email sent successfully! 🎉");
    } catch (error) {
      console.error('Error sending email:', error);
      // Show a more informative error message
      alert(error instanceof Error ? error.message : "Failed to send email. Please try again.");
    }
  }


  return (
    <div className="space-y-6">
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

                  <Button onClick={handleSend} className="w-full bg-pink-500 text-white hover:bg-pink-600" size="lg">
                    <Send className="mr-2 h-4 w-4" />
                    Send Now
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
    </div>
  )
}
