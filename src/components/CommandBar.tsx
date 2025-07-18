import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { 
  Mic, 
  Smile,
  Send,
  Loader2
} from 'lucide-react'
import { blink } from '../blink/client'

interface CommandResponse {
  id: string
  command: string
  response: string
  timestamp: number
}

interface CommandBarProps {
  onResponse?: (response: CommandResponse) => void
}

export function CommandBar({ onResponse }: CommandBarProps) {
  const [command, setCommand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const processCommand = async (userCommand: string): Promise<string> => {
    // Get team context from localStorage or use default
    const getTeamContext = () => {
      try {
        const storedMembers = localStorage.getItem('ait-os-team-members')
        if (storedMembers) {
          const members = JSON.parse(storedMembers)
          return members.map((m: any) => `- ${m.display_name} (${m.role})`).join('\n')
        }
      } catch (error) {
        console.error('Error loading team context:', error)
      }
      
      // Default team context
      return `- Daniel (CEO)
- Oriel (CTO) 
- Nitish (Full Stack Developer)
- Ryan (Full Stack Developer)
- Banu (Sales & Marketing)`
    }

    // Enhanced OSS BOT prompt with dynamic team context
    const systemPrompt = `You are OSS BOT, the intelligent operational assistant for AIT-OS (AI Team Operating System). 

CURRENT TEAM CONTEXT:
${getTeamContext()}

CAPABILITIES:
- Task assignment and tracking across team members
- Team communication coordination via WhatsApp and Slack
- OKR and goal alignment monitoring
- Daily check-ins and progress tracking
- Knowledge management and collective memory
- Sentiment analysis and team pulse monitoring
- Real-time workload distribution
- Blocker detection and resolution

RESPONSE STYLE:
- Be concise and actionable (max 2-3 sentences)
- Use actual team member names when relevant
- Provide specific next steps or recommendations
- Maintain professional but friendly tone
- Include relevant emojis sparingly for clarity
- If asking about specific team members, provide realistic status updates

CONTEXT AWARENESS:
- Remember this is a startup team working on AIT-OS
- Daniel leads strategy, Oriel handles tech architecture
- Nitish and Ryan are the core development team
- Banu drives sales and marketing initiatives
- Consider typical startup challenges: tight deadlines, resource constraints, rapid iteration

Process this command: "${userCommand}"

Examples of good responses:
- For greetings: Brief intro + suggest 2-3 common commands
- For team queries: Reference actual members with realistic insights
- For task requests: Provide actionable next steps with owner assignments
- For status checks: Give specific progress updates with metrics`

    try {
      const response = await blink.ai.generateText({
        prompt: systemPrompt,
        maxTokens: 400,
        model: 'gpt-4o-mini'
      })
      
      return response.text
    } catch (error) {
      console.error('AI processing error:', error)
      return "I'm experiencing some technical difficulties. Please try again in a moment. 🤖"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || isProcessing) return

    setIsProcessing(true)
    
    try {
      const response = await processCommand(command)
      
      const commandResponse: CommandResponse = {
        id: Date.now().toString(),
        command: command.trim(),
        response,
        timestamp: Date.now()
      }
      
      // Store in localStorage for persistence
      const existingHistory = JSON.parse(localStorage.getItem('oss-bot-history') || '[]')
      const updatedHistory = [commandResponse, ...existingHistory].slice(0, 50) // Keep last 50
      localStorage.setItem('oss-bot-history', JSON.stringify(updatedHistory))
      
      // Note: Database storage temporarily disabled due to database limits
      // Using localStorage for persistence instead
      
      // Notify parent component
      onResponse?.(commandResponse)
      
    } catch (error) {
      console.error('Command processing error:', error)
      const errorResponse: CommandResponse = {
        id: Date.now().toString(),
        command: command.trim(),
        response: "Sorry, I encountered an error processing your command. Please try again.",
        timestamp: Date.now()
      }
      onResponse?.(errorResponse)
    } finally {
      setIsProcessing(false)
      setCommand('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const suggestCommand = () => {
    const suggestions = [
      "What can you help me with today?",
      "Show me today's team status",
      "What tasks are blocked for Nitish and Ryan?",
      "How is our sprint progress?",
      "Check team OKRs and quarterly goals",
      "Who needs help today?",
      "What's Daniel working on this week?",
      "Any blockers for Oriel on the tech side?",
      "How are Banu's sales initiatives going?",
      "Schedule a team sync for tomorrow",
      "What are the top 3 priorities today?",
      "Show me team communication patterns",
      "Any urgent items that need attention?",
      "What's our current development velocity?"
    ]
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)]
    setCommand(randomSuggestion)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center bg-white border-2 border-gray-300 rounded-full px-6 py-4 shadow-sm hover:border-gray-400 focus-within:border-[#2563EB] transition-colors">
        <span className="text-gray-600 font-medium mr-2">@OSS BOT:</span>
        
        <Input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything, assign tasks, check goals..."
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-gray-500"
          disabled={isProcessing}
        />
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            title="Voice command (coming soon)"
          >
            <Mic className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            title="Suggest command"
            onClick={suggestCommand}
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          <Button
            type="submit"
            size="sm"
            className="h-8 w-8 p-0 bg-[#2563EB] hover:bg-[#2563EB]/90"
            disabled={!command.trim() || isProcessing}
            title="Send command"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}