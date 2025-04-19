"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SettingsForm() {
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
            <div className="rounded-md border p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center">
                      <span className="text-pink-500 text-sm font-medium">G</span>
                    </div>
                    <div>
                      <p className="font-medium">personal@example.com</p>
                      <p className="text-sm text-muted-foreground">Gmail</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive">
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-500 text-sm font-medium">O</span>
                    </div>
                    <div>
                      <p className="font-medium">work@company.com</p>
                      <p className="text-sm text-muted-foreground">Outlook</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive">
                    Remove
                  </Button>
                </div>
              </div>
            </div>

            <Button className="w-full" variant="outline">
              + Add Email Account
            </Button>
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
