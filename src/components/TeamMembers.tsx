import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'

interface TeamMember {
  id: string
  user_id: string
  email: string
  display_name: string
  role: string
  avatar_url?: string
  status: string
}

interface TeamMembersProps {
  members: TeamMember[]
}

export function TeamMembers({ members }: TeamMembersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'away':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'team leader':
        return 'bg-purple-100 text-purple-800'
      case 'coo & cto':
        return 'bg-blue-100 text-blue-800'
      case 'developer':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading team members...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 text-center">Team Members</h3>
      
      <div className="flex flex-wrap justify-center gap-6">
        {members.map((member) => (
          <div 
            key={member.id}
            className="flex flex-col items-center space-y-2 p-4 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback className="bg-[#2563EB] text-white">
                  {member.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div 
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                title={`Status: ${member.status}`}
              />
            </div>
            
            <div className="text-center space-y-1">
              <p className="font-medium text-sm text-gray-900">{member.display_name}</p>
              <Badge 
                variant="secondary" 
                className={`text-xs ${getRoleColor(member.role)}`}
              >
                {member.role}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}