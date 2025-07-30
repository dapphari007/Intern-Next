"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Upload, 
  Save,
  Shield,
  Bell,
  Palette,
  Trash2,
  ExternalLink,
  Wallet,
  Loader2
} from "lucide-react"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [imageUploading, setImageUploading] = useState(false)
  
  // Form states
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    resumeGDriveLink: "",
    image: ""
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    taskReminders: true,
    mentorMessages: true,
    certificateUpdates: true,
    marketingEmails: false,
    pushNotifications: true
  })

  const [privacy, setPrivacy] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMentorContact: true,
    showOnlineStatus: true,
    allowDataCollection: true
  })

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return

      try {
        setPageLoading(true)
        
        // Fetch profile data
        const profileResponse = await fetch('/api/user/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          if (profileData.success && profileData.user) {
            setProfile({
              name: profileData.user.name || "",
              email: profileData.user.email || "",
              bio: profileData.user.bio || "",
              phone: profileData.user.phone || "",
              location: profileData.user.location || "",
              website: profileData.user.website || "",
              linkedin: profileData.user.linkedin || "",
              github: profileData.user.github || "",
              resumeGDriveLink: profileData.user.resumeGDriveLink || "",
              image: profileData.user.image || ""
            })
          }
        } else {
          toast({
            title: "Error",
            description: "Failed to load profile data",
            variant: "destructive"
          })
        }

        // Fetch notification preferences
        const preferencesResponse = await fetch('/api/user/preferences')
        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json()
          setNotifications({
            emailNotifications: preferencesData.emailNotifications ?? true,
            taskReminders: preferencesData.taskReminders ?? true,
            mentorMessages: preferencesData.mentorMessages ?? true,
            certificateUpdates: preferencesData.certificateUpdates ?? true,
            marketingEmails: preferencesData.marketingEmails ?? false,
            pushNotifications: preferencesData.pushNotifications ?? true
          })
        } else {
          toast({
            title: "Warning",
            description: "Failed to load notification preferences",
            variant: "destructive"
          })
        }

        // Fetch privacy preferences
        const privacyResponse = await fetch('/api/user/privacy')
        if (privacyResponse.ok) {
          const privacyData = await privacyResponse.json()
          setPrivacy({
            profileVisibility: privacyData.profileVisibility ?? "public",
            showEmail: privacyData.showEmail ?? false,
            showPhone: privacyData.showPhone ?? false,
            allowMentorContact: privacyData.allowMentorContact ?? true,
            showOnlineStatus: privacyData.showOnlineStatus ?? true,
            allowDataCollection: privacyData.allowDataCollection ?? true
          })
        } else {
          toast({
            title: "Warning",
            description: "Failed to load privacy preferences",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: "Error",
          description: "Failed to load user data. Please refresh the page.",
          variant: "destructive"
        })
      } finally {
        setPageLoading(false)
      }
    }

    fetchUserData()
  }, [session?.user?.id, toast])

  const handleProfileSave = async () => {
    setIsLoading(true)
    try {
      // Exclude email from the update payload since it shouldn't be updated
      const { email, ...profileData } = profile
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: "Profile updated successfully!",
        variant: "default"
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationsSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update preferences')
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: "Notification preferences updated successfully!",
        variant: "default"
      })
    } catch (error) {
      console.error('Error updating preferences:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update preferences. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrivacySave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(privacy)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update privacy settings')
      }

      const result = await response.json()
      toast({
        title: "Success",
        description: "Privacy settings updated successfully!",
        variant: "default"
      })
    } catch (error) {
      console.error('Error updating privacy settings:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update privacy settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive"
      })
      return
    }

    const maxSize = 2 * 1024 * 1024 // 2MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive"
      })
      return
    }

    setImageUploading(true)
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        
        try {
          const response = await fetch('/api/user/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: base64 })
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to upload image')
          }

          const result = await response.json()
          
          // Update the local profile state with the new image
          setProfile(prev => ({
            ...prev,
            image: result.imageUrl || base64
          }))
          
          // Update the session with the new image
          await update({ image: result.imageUrl || base64 })
          
          toast({
            title: "Success",
            description: "Profile image updated successfully!",
            variant: "default"
          })
        } catch (error) {
          console.error('Error uploading image:', error)
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
            variant: "destructive"
          })
        } finally {
          setImageUploading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error processing image:', error)
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive"
      })
      setImageUploading(false)
    }
  }

  // Show loading state while fetching data
  if (pageLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="space-y-6 pb-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your settings...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and profile details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage 
                    src={profile.image || session?.user?.image || ""} 
                  />
                  <AvatarFallback className="text-lg">
                    {profile.name?.charAt(0) || session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    disabled={imageUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {imageUploading ? 'Uploading...' : 'Upload Photo'}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    readOnly
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({...profile, location: e.target.value})}
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  rows={4}
                />
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      value={profile.website}
                      onChange={(e) => setProfile({...profile, website: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/username"
                      value={profile.linkedin}
                      onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <Input
                      id="github"
                      placeholder="https://github.com/username"
                      value={profile.github}
                      onChange={(e) => setProfile({...profile, github: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resumeGDriveLink">Resume Google Drive Link</Label>
                    <Input
                      id="resumeGDriveLink"
                      placeholder="https://drive.google.com/file/d/..."
                      value={profile.resumeGDriveLink}
                      onChange={(e) => setProfile({...profile, resumeGDriveLink: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleProfileSave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, emailNotifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming task deadlines
                    </p>
                  </div>
                  <Switch
                    checked={notifications.taskReminders}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, taskReminders: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mentor Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications for new messages from mentors
                    </p>
                  </div>
                  <Switch
                    checked={notifications.mentorMessages}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, mentorMessages: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Certificate Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Updates about your certificates and achievements
                    </p>
                  </div>
                  <Switch
                    checked={notifications.certificateUpdates}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, certificateUpdates: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Promotional emails and platform updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, marketingEmails: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications({...notifications, pushNotifications: checked})
                    }
                  />
                </div>
              </div>

              <Button onClick={handleNotificationsSave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email Address</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see your email address
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showEmail}
                    onCheckedChange={(checked) => 
                      setPrivacy({...privacy, showEmail: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Phone Number</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow others to see your phone number
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showPhone}
                    onCheckedChange={(checked) => 
                      setPrivacy({...privacy, showPhone: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Mentor Contact</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow mentors to contact you directly
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowMentorContact}
                    onCheckedChange={(checked) => 
                      setPrivacy({...privacy, allowMentorContact: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Let others see when you're online
                    </p>
                  </div>
                  <Switch
                    checked={privacy.showOnlineStatus}
                    onCheckedChange={(checked) => 
                      setPrivacy({...privacy, showOnlineStatus: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Data Collection</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow collection of usage data for analytics
                    </p>
                  </div>
                  <Switch
                    checked={privacy.allowDataCollection}
                    onCheckedChange={(checked) => 
                      setPrivacy({...privacy, allowDataCollection: checked})
                    }
                  />
                </div>
              </div>

              <Button onClick={handlePrivacySave} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? "Saving..." : "Save Privacy Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Change Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Update your account password
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Password change functionality will be available soon.",
                        variant: "default"
                      })
                    }}
                  >
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Feature Coming Soon",
                        description: "Two-factor authentication will be available soon.",
                        variant: "default"
                      })
                    }}
                  >
                    Enable 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Active Sessions</h4>
                    <p className="text-sm text-muted-foreground">
                      Manage your active login sessions
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Current Session",
                        description: "You have 1 active session (current device).",
                        variant: "default"
                      })
                    }}
                  >
                    View Sessions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6">
          <WalletSection />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}

// Wallet Section Component
function WalletSection() {
  const { toast } = useToast()
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const response = await fetch('/api/user/wallet')
        if (response.ok) {
          const walletData = await response.json()
          setWallet(walletData)
        } else {
          toast({
            title: "Error",
            description: "Failed to load wallet data",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error fetching wallet:', error)
        toast({
          title: "Error",
          description: "Failed to load wallet data. Please refresh the page.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWallet()
  }, [toast])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wallet className="mr-2 h-5 w-5" />
            Wallet Overview
          </CardTitle>
          <CardDescription>
            Manage your skill credits and transaction history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                ${wallet?.balance?.toFixed(2) || '0.00'}
              </div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${wallet?.totalEarned?.toFixed(2) || '0.00'}
              </div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                ${wallet?.totalSpent?.toFixed(2) || '0.00'}
              </div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Withdraw Funds
            </Button>
            <Button variant="outline">
              Add Funds
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your latest wallet activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {wallet?.transactions?.length > 0 ? (
            <div className="space-y-4">
              {wallet.transactions.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-medium ${
                    transaction.type === 'EARNED' || transaction.type === 'DEPOSIT' || transaction.type === 'BONUS'
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'EARNED' || transaction.type === 'DEPOSIT' || transaction.type === 'BONUS' ? '+' : '-'}
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No transactions yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}