"use client"

import { useEffect, useState } from "react"
import { Archive, Edit, Filter, MoreHorizontal, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createBrowserClient } from "@supabase/ssr"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

interface EmailEvent {
  id: string
  email_id: string
  recipient_email: string
  subject: string
  status: 'Sent' | 'Opened'
  opens: number
  last_opened: string | null
  sent_at: string
}

const statusMap = {
  "Sent": { label: "Sent 💌", color: "default" },
  "Opened": { label: "Opened 🔥", color: "warning" },
}

export function InboxTracker() {
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [emails, setEmails] = useState<EmailEvent[]>([])
  const [stats, setStats] = useState({
    totalEmails: 0,
    openRate: 0,
    recentOpens: 0,
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchEmails = async () => {
    setIsLoading(true)
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication error:', authError)
        toast.error('You need to be logged in to view your email tracking data')
        setEmails([])
        setStats({
          totalEmails: 0,
          openRate: 0,
          recentOpens: 0,
        })
        setIsLoading(false)
        return
      }
      
      // Fetch emails from email_events table - RLS will automatically filter by user_id
      const { data: emailEvents, error } = await supabase
        .from('email_events')
        .select('*')
        .order('sent_at', { ascending: false })

      if (error) {
        throw error
      }

      // Calculate stats
      const totalEmails = emailEvents?.length || 0
      const openedEmails = emailEvents?.filter(email => email.status === 'Opened').length || 0
      const openRate = totalEmails > 0 ? Math.round((openedEmails / totalEmails) * 100) : 0
      const recentOpens = emailEvents?.filter(email => email.last_opened).length || 0

      setEmails(emailEvents || [])
      setStats({
        totalEmails,
        openRate,
        recentOpens,
      })
    } catch (error) {
      console.error('Error fetching email events:', error)
      toast.error('Failed to load email tracking data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  const filteredEmails = emails.filter((email) => {
    if (activeTab === "all") return true
    if (activeTab === "opened") return email.status === "Opened"
    if (activeTab === "not-opened") return email.status === "Sent"
    return true
  })

  const formatSentDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return 'Invalid date'
    }
  }

  return (
    <div className="inbox-tracker-container space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📧</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmails}</div>
            <p className="text-xs text-muted-foreground">Track your outreach volume</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🔥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate}%</div>
            <p className="text-xs text-muted-foreground">Average industry rate: 21.5%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Opens</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentOpens}</div>
            <p className="text-xs text-muted-foreground">Emails opened recently</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Email Tracking</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchEmails}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          <Tabs defaultValue="all" className="mt-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="opened">Opened</TabsTrigger>
              <TabsTrigger value="not-opened">Not Opened</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>To</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Opens</TableHead>
                  <TableHead>Last Opened</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmails.length > 0 ? (
                  filteredEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">{email.recipient_email}</TableCell>
                      <TableCell>{email.subject}</TableCell>
                      <TableCell>
                        <Badge variant={statusMap[email.status]?.color as any || "default"}>
                          {statusMap[email.status]?.label || email.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{email.opens}</TableCell>
                      <TableCell>{email.last_opened ? formatSentDate(email.last_opened) : 'Not opened'}</TableCell>
                      <TableCell className="text-muted-foreground">{formatSentDate(email.sent_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <RefreshCcw className="mr-2 h-4 w-4" />
                              Follow-Up
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="text-3xl">📭</div>
                        <h3 className="mt-4 text-lg font-semibold">No emails found</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground">
                          {activeTab !== "all" 
                            ? "No emails match your current filter." 
                            : "You haven't sent any tracked emails yet."}
                        </p>
                        {activeTab !== "all" && (
                          <Button onClick={() => setActiveTab("all")} variant="outline" size="sm">
                            View all emails
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
