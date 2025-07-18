import { 
  Calendar,
  BarChart3,
  MessageCircle,
  Brain,
  Code,
  Settings,
  CheckSquare
} from 'lucide-react'

const modules = [
  {
    id: 'daily-ops',
    icon: Calendar,
    label: 'Daily Ops',
    color: 'text-orange-500'
  },
  {
    id: 'okr-tracker',
    icon: BarChart3,
    label: 'OKR Tracker',
    color: 'text-blue-500'
  },
  {
    id: 'team-pulse',
    icon: MessageCircle,
    label: 'Team Pulse',
    color: 'text-purple-500'
  },
  {
    id: 'knowledge-hub',
    icon: Brain,
    label: 'Knowledge Hub',
    color: 'text-blue-600'
  },
  {
    id: 'tech-sync',
    icon: Code,
    label: 'Tech Sync',
    color: 'text-orange-600'
  },
  {
    id: 'task-manager',
    icon: CheckSquare,
    label: 'Task Manager',
    color: 'text-green-600'
  },
  {
    id: 'gtm-ops',
    icon: Settings,
    label: 'GTM & Ops',
    color: 'text-orange-400'
  }
]

interface QuickAccessModulesProps {
  onModuleClick?: (moduleId: string, label: string) => void
}

export function QuickAccessModules({ onModuleClick }: QuickAccessModulesProps) {
  const getModulePrompt = (moduleId: string): string => {
    const prompts = {
      'daily-ops': 'Show me today\'s team status, blockers, and daily operations overview',
      'okr-tracker': 'Display current OKRs, progress tracking, and goal alignment for the team',
      'team-pulse': 'Analyze team sentiment, communication health, and engagement metrics',
      'knowledge-hub': 'Access our team knowledge base, documentation, and shared insights',
      'tech-sync': 'Show technical updates, development progress, and engineering status',
      'task-manager': 'Open task management system to create, assign, and track team tasks',
      'gtm-ops': 'Review go-to-market operations, business metrics, and operational insights'
    }
    return prompts[moduleId as keyof typeof prompts] || `Help me with ${moduleId}`
  }

  const handleModuleClick = (moduleId: string, label: string) => {
    const prompt = getModulePrompt(moduleId)
    onModuleClick?.(moduleId, prompt)
  }

  return (
    <div className="flex justify-center items-center space-x-12">
      {modules.map((module) => {
        const IconComponent = module.icon
        
        return (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module.id, module.label)}
            className="flex flex-col items-center space-y-3 p-4 rounded-lg hover:bg-white/50 transition-colors group"
          >
            <div className={`p-3 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow ${module.color}`}>
              <IconComponent className="h-6 w-6" />
            </div>
            
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {module.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}