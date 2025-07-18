import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Badge } from './ui/badge'
import { 
  Bot, 
  User, 
  Clock,
  Trash2,
  Copy,
  Check,
  Database
} from 'lucide-react'
import { blink } from '../blink/client'

interface CommandResponse {
  id: string
  command: string
  response: string
  timestamp: number
  module_type?: string
  channel?: string
}

interface ResponsePanelProps {
  latestResponse?: CommandResponse
  isVisible: boolean
  onClose: () => void
}

export function ResponsePanel({ latestResponse, isVisible, onClose }: ResponsePanelProps) {
  const [history, setHistory] = useState<CommandResponse[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadHistory = useCallback(() => {
    setLoading(true)
    try {
      // Use localStorage only due to database limitations
      loadLocalHistory()
    } catch (error) {
      console.error('Error loading history:', error)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isVisible) {
      loadHistory()
    }
  }, [isVisible, latestResponse, loadHistory])

  const loadLocalHistory = () => {
    const stored = localStorage.getItem('oss-bot-history')
    if (stored) {
      setHistory(JSON.parse(stored))
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const clearHistory = () => {
    try {
      // Clear localStorage and local state
      localStorage.removeItem('oss-bot-history')
      setHistory([])
    } catch (error) {
      console.error('Error clearing history:', error)
      setHistory([])
    }
  }

  const getModuleColor = (moduleType?: string) => {
    switch (moduleType) {
      case 'command_bar':
        return 'bg-blue-100 text-blue-800'
      case 'daily_ops':
        return 'bg-green-100 text-green-800'
      case 'okr_tracker':
        return 'bg-purple-100 text-purple-800'
      case 'team_pulse':
        return 'bg-orange-100 text-orange-800'
      case 'task_manager':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-[#2563EB]" />
            <h2 className="text-lg font-semibold">OSS BOT Conversation History</h2>
            <Badge variant="secondary" className="ml-2">
              {history.length} conversations
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
        
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
                <p className="text-gray-500">Loading conversation history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No conversations yet. Start by asking OSS BOT something!</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try: "What can you help me with today?" or "Show team status"
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {history.map((item) => (
                  <div key={item.id} className="space-y-3">
                    {/* User Command */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">You</span>
                            {item.module_type && (
                              <Badge className={`text-xs ${getModuleColor(item.module_type)}`}>
                                {item.module_type.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{formatTime(item.timestamp)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{item.command}</p>
                      </div>
                    </div>

                    {/* OSS BOT Response */}
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-[#2563EB]">OSS BOT</span>
                            {item.channel && item.channel !== 'dashboard' && (
                              <Badge variant="outline" className="text-xs">
                                {item.channel}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(item.response, item.id)}
                          >
                            {copiedId === item.id ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{item.response}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}