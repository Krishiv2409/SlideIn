"use client"

import { useEffect, useState } from "react"
import { Inbox, Flame, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

export function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEmails: 0,
    openRate: 0,
    recentOpens: 0,
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Authentication error:', authError)
        toast.error('You need to be logged in to view your analytics data')
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

      setStats({
        totalEmails,
        openRate,
        recentOpens,
      })
    } catch (error) {
      console.error('Error fetching email events:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <div className="analytics-dashboard-container w-full">
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Modern Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Emails</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900 font-display">{stats.totalEmails}</h3>
                    <p className="mt-1 text-xs text-gray-500">Track your outreach volume</p>
                  </div>
                  <div className="bg-pink-50 p-3 rounded-full">
                    <Inbox className="h-6 w-6 text-pink-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Open Rate</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900 font-display">{stats.openRate}%</h3>
                    <p className="mt-1 text-xs text-gray-500">Industry avg: 21.5%</p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-full">
                    <Flame className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
                <div className="mt-5 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${Math.min(100, stats.openRate)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Recent Opens</p>
                    <h3 className="mt-2 text-3xl font-bold text-gray-900 font-display">{stats.recentOpens}</h3>
                    <p className="mt-1 text-xs text-gray-500">Emails opened recently</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-full">
                    <Eye className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-5 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full" 
                    style={{ width: `${Math.min(100, stats.recentOpens / (stats.totalEmails || 1) * 100)}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Placeholder for additional analytics that will be implemented later */}
          <Card className="border border-gray-100 shadow-sm bg-white rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <h3 className="text-xl font-semibold text-gray-900 font-display mb-2">More Analytics Coming Soon</h3>
                <p className="text-gray-500 max-w-md">
                  Additional analytics and visualizations will be added here in future updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 