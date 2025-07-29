"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navigation } from "@/components/navigation"
import { 
  Send, 
  Paperclip, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  Download,
  MessageSquare,
  Users
} from "lucide-react"

// Mock data
const mockData = {
  projectInfo: {
    title: "Frontend Development Internship",
    company: "TechCorp",
    mentor: "Sarah Johnson",
    progress: 75,
    startDate: "2024-01-01",
    endDate: "2024-03-31"
  },
  tasks: [
    {
      id: "1",
      title: "Implement user authentication",
      description: "Create login/signup forms with validation and integrate with backend API",
      status: "completed",
      dueDate: "2024-01-15",
      credits: 50,
      submittedAt: "2024-01-14",
      feedback: "Excellent work! Clean code and good error handling."
    },
    {
      id: "2",
      title: "Design responsive dashboard",
      description: "Create a responsive dashboard layout using Tailwind CSS",
      status: "in_progress",
      dueDate: "2024-01-20",
      credits: 75,
      submittedAt: null,
      feedback: null
    },
    {
      id: "3",
      title: "Write unit tests",
      description: "Add comprehensive unit tests for authentication components",
      status: "pending",
      dueDate: "2024-01-25",
      credits: 40,
      submittedAt: null,
      feedback: null
    }
  ],
  messages: [
    {
      id: "1",
      sender: "Sarah Johnson",
      content: "Welcome to the project room! Let's start with the authentication task.",
      timestamp: "2024-01-10 09:00",
      isMe: false
    },
    {
      id: "2",
      sender: "You",
      content: "Thank you! I've started working on the login form. Should I use any specific validation library?",
      timestamp: "2024-01-10 09:15",
      isMe: true
    },
    {
      id: "3",
      sender: "Sarah Johnson",
      content: "Great question! Please use Zod for validation as it integrates well with React Hook Form.",
      timestamp: "2024-01-10 09:20",
      isMe: false
    },
    {
      id: "4",
      sender: "You",
      content: "Perfect! I'll implement it with Zod. I've also uploaded the initial wireframes for review.",
      timestamp: "2024-01-10 14:30",
      isMe: true
    }
  ],
  files: [
    {
      id: "1",
      name: "authentication-wireframes.pdf",
      size: "2.4 MB",
      uploadedBy: "You",
      uploadedAt: "2024-01-10 14:30"
    },
    {
      id: "2",
      name: "project-requirements.docx",
      size: "1.2 MB",
      uploadedBy: "Sarah Johnson",
      uploadedAt: "2024-01-08 10:00"
    }
  ]
}

export default function ProjectRoomPage() {
  const [newMessage, setNewMessage] = useState("")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Add message logic here
      setNewMessage("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in_progress":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{mockData.projectInfo.title}</h1>
              <p className="text-muted-foreground">{mockData.projectInfo.company}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{mockData.projectInfo.mentor}</p>
                <p className="text-sm text-muted-foreground">Mentor</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
            <span>Start: {mockData.projectInfo.startDate}</span>
            <span>End: {mockData.projectInfo.endDate}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{mockData.projectInfo.progress}%</span>
            </div>
            <Progress value={mockData.projectInfo.progress} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="tasks" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              {/* Tasks Tab */}
              <TabsContent value="tasks" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Tasks</h2>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </div>

                <div className="space-y-4">
                  {mockData.tasks.map((task) => (
                    <Card key={task.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <CardTitle className="text-lg">{task.title}</CardTitle>
                            <CardDescription>{task.description}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusIcon(task.status)}
                            <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span>Due: {task.dueDate}</span>
                          <span>{task.credits} credits</span>
                        </div>
                        
                        {task.feedback && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                            <p className="text-sm text-green-800">
                              <strong>Feedback:</strong> {task.feedback}
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          {task.status === "pending" && (
                            <Button size="sm">Start Task</Button>
                          )}
                          {task.status === "in_progress" && (
                            <Button size="sm">Submit Task</Button>
                          )}
                          {task.status === "completed" && (
                            <Button size="sm" variant="outline">View Submission</Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Chat Tab */}
              <TabsContent value="chat" className="space-y-6">
                <Card className="h-96">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Project Chat
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {mockData.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.isMe
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.sender} • {message.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                      <Button size="icon" variant="outline">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button size="icon" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Files Tab */}
              <TabsContent value="files" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Project Files</h2>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </div>

                <div className="space-y-4">
                  {mockData.files.map((file) => (
                    <Card key={file.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {file.size} • Uploaded by {file.uploadedBy} on {file.uploadedAt}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed Tasks</span>
                  <span className="font-medium">
                    {mockData.tasks.filter(t => t.status === 'completed').length} / {mockData.tasks.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Credits Earned</span>
                  <span className="font-medium">
                    {mockData.tasks.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.credits, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Remaining</span>
                  <span className="font-medium">45</span>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>SJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">Mentor</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">You</p>
                    <p className="text-sm text-muted-foreground">Intern</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Submit Work
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Ask Question
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download Resources
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}