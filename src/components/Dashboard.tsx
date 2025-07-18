import { useState, useEffect } from 'react'
import { blink } from '../blink/client'
import { CommandBar } from './CommandBar'
import { TeamMembers } from './TeamMembers'
import { QuickAccessModules } from './QuickAccessModules'
import { ResponsePanel } from './ResponsePanel'
import { TaskManager } from './TaskManager'
import { Menu, User, Clock, Plus, MessageSquare, ArrowLeft, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

interface CommandResponse {
  id: string
  command: string
  response: string
  timestamp: number
}

interface TeamMember {
  id: string
  user_id: string
  email: string
  display_name: string
  role: string
  avatar_url?: string
  status: string
}

// Mock team data for demonstration
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'mock-1',
    user_id: 'mock-user-1',
    email: 'oriel@ait-os.com',
    display_name: 'Oriel',
    role: 'Team Leader',
    status: 'active'
  },
  {
    id: 'mock-2',
    user_id: 'mock-user-2',
    email: 'nitish@ait-os.com',
    display_name: 'Nitish',
    role: 'Developer',
    status: 'active'
  },
  {
    id: 'mock-3',
    user_id: 'mock-user-3',
    email: 'daniel@ait-os.com',
    display_name: 'Daniel',
    role: 'COO & CTO',
    status: 'active'
  }
]

export function Dashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [latestResponse, setLatestResponse] = useState<CommandResponse | undefined>()
  const [showResponsePanel, setShowResponsePanel] = useState(false)
  const [currentView, setCurrentView] = useState<'dashboard' | 'task-manager'>('dashboard')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Initialize team members from localStorage or use mock data
      if (state.user && !state.isLoading) {
        initializeTeamMembers(state.user)
      }
    })
    return unsubscribe
  }, [])

  const initializeTeamMembers = (currentUser: any) => {
    try {
      // Load team members from localStorage
      const storedMembers = localStorage.getItem('ait-os-team-members')
      let members = storedMembers ? JSON.parse(storedMembers) : [...MOCK_TEAM_MEMBERS]
      
      // Add current user if not already in the list
      const currentUserMember: TeamMember = {
        id: currentUser.id,
        user_id: currentUser.id,
        email: currentUser.email || `${currentUser.id}@ait-os.com`,
        display_name: currentUser.email?.split('@')[0] || 'You',
        role: 'Team Member',
        status: 'active'
      }
      
      const exists = members.some((m: TeamMember) => m.user_id === currentUser.id)
      if (!exists) {
        members = [...members, currentUserMember]
        localStorage.setItem('ait-os-team-members', JSON.stringify(members))
      }
      
      setTeamMembers(members)
    } catch (error) {
      console.error('Error initializing team members:', error)
      setTeamMembers(MOCK_TEAM_MEMBERS)
    }
  }

  const handleCommandResponse = async (response: CommandResponse) => {
    setLatestResponse(response)
    setShowResponsePanel(true)

    // Store conversation in localStorage
    try {
      const existingHistory = JSON.parse(localStorage.getItem('oss-bot-conversations') || '[]')
      const conversation = {
        id: response.id,
        user_id: user?.id || 'anonymous',
        command: response.command,
        response: response.response,
        context: {},
        module_type: 'dashboard',
        channel: 'dashboard',
        created_at: new Date().toISOString()
      }
      const updatedHistory = [conversation, ...existingHistory].slice(0, 100)
      localStorage.setItem('oss-bot-conversations', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Error storing conversation:', error)
    }
  }

  const handleModuleClick = async (moduleId: string, prompt: string) => {
    // Handle task manager specially
    if (moduleId === 'task-manager') {
      setCurrentView('task-manager')
      return
    }

    // Simulate command processing for other modules
    try {
      const teamContext = teamMembers.map(member => 
        `- ${member.display_name} (${member.role})`
      ).join('\n')

      const response = await blink.ai.generateText({
        prompt: `You are OSS BOT for AIT-OS. Context: User clicked "${moduleId}" module. ${prompt}

TEAM CONTEXT:
${teamContext}

Provide a contextual response for this module with realistic team insights, actionable items, and relevant data points. Be specific and actionable.`,
        maxTokens: 400,
        model: 'gpt-4o-mini'
      })
      
      const commandResponse: CommandResponse = {
        id: Date.now().toString(),
        command: `[${moduleId.toUpperCase()}] ${prompt}`,
        response: response.text,
        timestamp: Date.now()
      }
      
      // Store in localStorage for quick access
      const existingHistory = JSON.parse(localStorage.getItem('oss-bot-history') || '[]')
      const updatedHistory = [commandResponse, ...existingHistory].slice(0, 50)
      localStorage.setItem('oss-bot-history', JSON.stringify(updatedHistory))
      
      handleCommandResponse(commandResponse)
    } catch (error) {
      console.error('Module processing error:', error)
      
      // Fallback response if AI fails
      const fallbackResponse: CommandResponse = {
        id: Date.now().toString(),
        command: `[${moduleId.toUpperCase()}] ${prompt}`,
        response: `OSS BOT is currently processing your request for the ${moduleId} module. This feature provides insights into ${prompt.toLowerCase()}. Please check back shortly for detailed analytics and recommendations.`,
        timestamp: Date.now()
      }
      
      handleCommandResponse(fallbackResponse)
    }
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
          <p className="text-gray-600">Initializing AIT-OS...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to AIT-OS</h1>
            <p className="text-gray-600">Your team's second brain. Please sign in to continue.</p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => blink.auth.login()}
              className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white py-3"
              size="lg"
            >
              Sign In to AIT-OS
            </Button>
            
            <p className="text-sm text-gray-500">
              Secure authentication powered by Blink
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Left Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 space-y-6 z-50">
        <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
          <Menu className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 ml-4">
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
          <Clock className="h-5 w-5" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-10 h-10 p-0"
          onClick={() => setShowResponsePanel(true)}
          title="View conversation history"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="ml-16 min-h-screen flex flex-col">
        {currentView === 'dashboard' ? (
          <>
            {/* Header Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
              <div className="w-full max-w-4xl mx-auto text-center space-y-8">
                
                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900">
                    AIT-OS Super Dashboard.
                  </h1>
                  <p className="text-lg text-gray-600">
                    Your team's second brain. Fully operational.
                  </p>
                </div>

                {/* Command Bar */}
                <div className="max-w-2xl mx-auto">
                  <CommandBar onResponse={handleCommandResponse} />
                </div>

                {/* Team Members */}
                <div className="py-8">
                  <TeamMembers members={teamMembers} />
                </div>

                {/* Quick Access Modules */}
                <div className="py-4">
                  <QuickAccessModules onModuleClick={handleModuleClick} />
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="py-6 text-center">
              <p className="text-sm text-gray-500">
                Powered by OSS BOT – AIT-OS | AI for high-performing teams.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Task Manager Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </div>
            </div>

            {/* Task Manager Content */}
            <div className="flex-1 px-8 py-6">
              <TaskManager currentUserId={user?.id || 'anonymous'} teamMembers={teamMembers} />
            </div>
          </>
        )}
      </div>

      {/* Response Panel */}
      <ResponsePanel 
        latestResponse={latestResponse}
        isVisible={showResponsePanel}
        onClose={() => setShowResponsePanel(false)}
      />
    </div>
  )
}