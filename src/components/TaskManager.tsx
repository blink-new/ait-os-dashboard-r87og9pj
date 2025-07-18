import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, Clock, User, AlertCircle, CheckCircle2, Circle, Pause } from 'lucide-react'

interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_to?: string
  created_by: string
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  tags?: string[]
  blockers?: string
  created_at: string
  updated_at: string
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

interface TaskManagerProps {
  currentUserId: string
  teamMembers: TeamMember[]
}

// Mock tasks for demonstration
const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    user_id: 'mock-user-1',
    title: 'Implement WhatsApp API integration',
    description: 'Set up WhatsApp Business API for OSS BOT communication',
    status: 'in_progress',
    priority: 'high',
    assigned_to: 'mock-user-1',
    created_by: 'mock-user-1',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'task-2',
    user_id: 'mock-user-2',
    title: 'Complete AI module documentation',
    description: 'Document the AI module for team reference',
    status: 'review',
    priority: 'medium',
    assigned_to: 'mock-user-2',
    created_by: 'mock-user-2',
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'task-3',
    user_id: 'mock-user-3',
    title: 'Tech sprint summary for Daniel',
    description: 'Prepare comprehensive tech sprint report',
    status: 'todo',
    priority: 'medium',
    assigned_to: 'mock-user-3',
    created_by: 'mock-user-3',
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'task-4',
    user_id: 'mock-user-1',
    title: 'Set up Slack integration',
    description: 'Configure Slack bot for team notifications',
    status: 'completed',
    priority: 'high',
    assigned_to: 'mock-user-1',
    created_by: 'mock-user-1',
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'task-5',
    user_id: 'mock-user-2',
    title: 'Database optimization',
    description: 'Optimize database queries for better performance',
    status: 'blocked',
    priority: 'low',
    assigned_to: 'mock-user-2',
    created_by: 'mock-user-2',
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    estimated_hours: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export function TaskManager({ currentUserId, teamMembers }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    assigned_to: '',
    due_date: '',
    estimated_hours: ''
  })

  useEffect(() => {
    // Load tasks from localStorage or use mock data
    const loadTasks = () => {
      try {
        const storedTasks = localStorage.getItem('ait-os-tasks')
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks))
        } else {
          setTasks(MOCK_TASKS)
          localStorage.setItem('ait-os-tasks', JSON.stringify(MOCK_TASKS))
        }
      } catch (error) {
        console.error('Error loading tasks:', error)
        setTasks(MOCK_TASKS)
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  const saveTasks = (updatedTasks: Task[]) => {
    try {
      localStorage.setItem('ait-os-tasks', JSON.stringify(updatedTasks))
      setTasks(updatedTasks)
    } catch (error) {
      console.error('Error saving tasks:', error)
    }
  }

  const createTask = () => {
    if (!newTask.title.trim()) return

    const taskData: Task = {
      id: `task-${Date.now()}`,
      user_id: currentUserId,
      title: newTask.title,
      description: newTask.description || undefined,
      status: 'todo',
      priority: newTask.priority,
      assigned_to: newTask.assigned_to || undefined,
      created_by: currentUserId,
      due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : undefined,
      estimated_hours: newTask.estimated_hours ? parseFloat(newTask.estimated_hours) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const updatedTasks = [taskData, ...tasks]
    saveTasks(updatedTasks)
    
    // Reset form
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      assigned_to: '',
      due_date: '',
      estimated_hours: ''
    })
    setShowCreateDialog(false)
  }

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updated_at: new Date().toISOString() } 
        : task
    )
    saveTasks(updatedTasks)
  }

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return <Circle className="h-4 w-4 text-gray-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'review':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'blocked':
        return <Pause className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAssignedMember = (userId?: string) => {
    return teamMembers.find(member => member.user_id === userId)
  }

  const statusColumns = [
    { key: 'todo' as const, title: 'To Do', color: 'border-gray-300' },
    { key: 'in_progress' as const, title: 'In Progress', color: 'border-blue-300' },
    { key: 'review' as const, title: 'Review', color: 'border-yellow-300' },
    { key: 'completed' as const, title: 'Completed', color: 'border-green-300' },
    { key: 'blocked' as const, title: 'Blocked', color: 'border-red-300' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Manager</h2>
          <p className="text-gray-600">Manage team tasks and track progress</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#2563EB] hover:bg-[#2563EB]/90">
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Assign To</label>
                  <Select value={newTask.assigned_to} onValueChange={(value) => setNewTask(prev => ({ ...prev, assigned_to: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map(member => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          {member.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Estimated Hours</label>
                  <Input
                    type="number"
                    value={newTask.estimated_hours}
                    onChange={(e) => setNewTask(prev => ({ ...prev, estimated_hours: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={createTask} disabled={!newTask.title.trim()}>
                  Create Task
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statusColumns.map(column => {
          const columnTasks = tasks.filter(task => task.status === column.key)
          
          return (
            <div key={column.key} className={`border-t-4 ${column.color} bg-white rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnTasks.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {columnTasks.map(task => {
                  const assignedMember = getAssignedMember(task.assigned_to)
                  
                  return (
                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                              {task.title}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(task.status)}
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                            
                            {assignedMember && (
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={assignedMember.avatar_url} />
                                <AvatarFallback className="text-xs">
                                  {assignedMember.display_name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          
                          {task.due_date && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </div>
                          )}
                          
                          {/* Status Update Buttons */}
                          <div className="flex flex-wrap gap-1">
                            {statusColumns
                              .filter(col => col.key !== task.status)
                              .slice(0, 2)
                              .map(col => (
                                <Button
                                  key={col.key}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-6 px-2"
                                  onClick={() => updateTaskStatus(task.id, col.key)}
                                >
                                  {col.title}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                
                {columnTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}