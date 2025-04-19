"use client"

import { useState } from "react"
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

// Sample data
const emails = [
  {
    id: 1,
    to: "sarah@company.com",
    subject: "Partnership opportunity for AI project",
    status: "opened",
    openCount: 3,
    replyStatus: "replied",
    date: "2 hours ago",
  },
  {
    id: 2,
    to: "john@university.edu",
    subject: "Research collaboration inquiry",
    status: "sent",
    openCount: 0,
    replyStatus: "pending",
    date: "5 hours ago",
  },
  {
    id: 3,
    to: "mike@startup.co",
    subject: "Following up on our conversation",
    status: "opened",
    openCount: 2,
    replyStatus: "pending",
    date: "1 day ago",
  },
  {
    id: 4,
    to: "lisa@tech.org",
    subject: "Interested in your AI research",
    status: "opened",
    openCount: 1,
    replyStatus: "ghosted",
    date: "3 days ago",
  },
  {
    id: 5,
    to: "david@institute.org",
    subject: "Potential internship opportunity",
    status: "sent",
    openCount: 0,
    replyStatus: "pending",
    date: "4 days ago",
  },
]

const statusMap = {
  sent: { label: "Sent 💌", color: "default" },
  opened: { label: "Opened 🔥", color: "warning" },
  replied: { label: "Replied ✅", color: "success" },
  ghosted: { label: "Ghosted 👻", color: "destructive" },
  pending: { label: "Pending ⏳", color: "secondary" },
}

export function InboxTracker() {
  const [activeTab, setActiveTab] = useState("all")

  const filteredEmails = emails.filter((email) => {
    if (activeTab === "all") return true
    if (activeTab === "opened") return email.status === "opened"
    if (activeTab === "replied") return email.replyStatus === "replied"
    if (activeTab === "not-opened") return email.status === "sent"
    return true
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">📧</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.length}</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">🔥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60%</div>
            <p className="text-xs text-muted-foreground">+5% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reply Rate</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">✅</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">20%</div>
            <p className="text-xs text-muted-foreground">Industry avg: 8%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Emails</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          <Tabs defaultValue="all" className="mt-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="opened">Opened</TabsTrigger>
              <TabsTrigger value="replied">Replied</TabsTrigger>
              <TabsTrigger value="not-opened">Not Opened</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>To</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Opens</TableHead>
                <TableHead>Reply</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="font-medium">{email.to}</TableCell>
                  <TableCell>{email.subject}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[email.status].color as any}>{statusMap[email.status].label}</Badge>
                  </TableCell>
                  <TableCell>{email.openCount}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[email.replyStatus].color as any}>
                      {statusMap[email.replyStatus].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{email.date}</TableCell>
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
                          Edit
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
              ))}
            </TableBody>
          </Table>
          {filteredEmails.length === 0 && (
            <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
              <div className="text-3xl">📭</div>
              <h3 className="mt-4 text-lg font-semibold">No emails found</h3>
              <p className="mb-4 mt-2 text-sm text-muted-foreground">No emails match your current filter.</p>
              <Button onClick={() => setActiveTab("all")} variant="outline" size="sm">
                View all emails
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
