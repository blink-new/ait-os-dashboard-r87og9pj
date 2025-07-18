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
    // Enhanced OSS BOT prompt with specific team context
    const systemPrompt = `You are OSS BOT, the intelligent operational assistant for AIT-OS (AI Team Operating System). 

TEAM CONTEXT:
- Daniel Townsend (Leader)
- Oriel Esquivel (COO & CTO) 
- Ryan Leong (Developer)
- Nitish Manchala (Developer)
- Banu Priya (Team Member)

CAPABILITIES:
- Task assignment and tracking
- Team communication coordination
- OKR and goal alignment
- Daily check-ins and progress monitoring
- Knowledge management
- Sentiment analysis and team pulse

RESPONSE STYLE:
- Be concise and actionable
- Use team member names when relevant
- Provide specific next steps
- Maintain professional but friendly tone
- Include relevant emojis sparingly

Process this command: "${userCommand}"

If it's a general greeting, introduce yourself and suggest common commands.
If it's about team members, reference the actual team.
If it's about tasks, provide actionable responses.
If it's about status/progress, give realistic team insights.`

    try {
      const response = await blink.ai.generateText({
        prompt: systemPrompt,
        maxTokens: 300,
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
      "What tasks are blocked?",
      "How is our sprint progress?",
      "Check team OKRs",
      "Who needs help today?"
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