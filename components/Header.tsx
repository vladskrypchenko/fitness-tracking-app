import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Activity, LogOut, User } from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  goal: string
  isAuthenticated: boolean
}

interface HeaderProps {
  userProfile: UserProfile
  activeTab: string
  onTabChange: (tab: string) => void
  onLogout: () => void
}

export default function Header({ userProfile, activeTab, onTabChange, onLogout }: HeaderProps) {
  const tabs = [
    { id: 'overview', label: 'Обзор' },
    { id: 'workouts', label: 'Тренировки' },
    { id: 'calendar', label: 'Календарь' }
  ]

  const goalLabels = {
    lose_weight: 'Схуднення',
    gain_muscle: 'Набор маси',
    maintain: 'Підтримка форми',
    improve_endurance: 'Витривалість',
    increase_strength: 'Сила'
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border flex items-center justify-center">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">FitTracker Pro</h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab.id ? 'bg-accent' : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">
                {userProfile.name || 'Користувач'}
              </div>
              <div className="text-xs text-muted-foreground">
                {goalLabels[userProfile.goal as keyof typeof goalLabels] || 'Ціль не вказана'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 
