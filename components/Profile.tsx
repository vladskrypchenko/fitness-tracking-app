'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { User, Target, LogOut, Settings, Award, Calendar, TrendingUp } from 'lucide-react'

interface ProfileProps {
  userProfile: any
  onLogout: () => void
  completedWorkouts: number
}

export default function Profile({ userProfile, onLogout, completedWorkouts }: ProfileProps) {
  // отримуємо поточного користувача з convex за email
  const currentUser = useQuery(api.users.getCurrentUser, 
    userProfile?.email ? { email: userProfile.email } : {}
  )
  
  // отримуємо профіль користувача з convex
  const convexProfile = useQuery(api.userProfiles.getCurrentUserProfile,
    currentUser ? { userId: currentUser._id } : "skip"
  )
  
  // отримуємо всі тренування користувача для статистики (fallback до порожнього масиву якщо немає користувача)
  const allWorkouts = useQuery(api.workouts.getAllUserWorkouts,
    currentUser ? { userId: currentUser._id } : "skip"
  ) || []

  // мутації
  const createUserProfile = useMutation(api.userProfiles.createUserProfile)
  const updateUserProfile = useMutation(api.userProfiles.updateUserProfile)
  const updateUser = useMutation(api.users.updateUser)

  const [editMode, setEditMode] = useState(false)
  const [tempProfile, setTempProfile] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    goal: convexProfile?.fitnessGoal || userProfile?.goal || ''
  })

  const handleSaveProfile = async () => {
    if (!currentUser) return

    try {
      // Update user basic info
      if (tempProfile.name !== currentUser.name || tempProfile.email !== currentUser.email) {
        await updateUser({
          userId: currentUser._id,
          name: tempProfile.name,
          email: tempProfile.email
        })
      }

      // Update or create user profile
      if (convexProfile) {
        await updateUserProfile({
          userId: currentUser._id,
          name: tempProfile.name,
          fitnessGoal: tempProfile.goal as any
        })
      } else {
        await createUserProfile({
          userId: currentUser._id,
          name: tempProfile.name,
          fitnessGoal: tempProfile.goal as any
        })
      }

      setEditMode(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  const goalLabels = {
    lose_weight: 'Похудение',
    gain_muscle: 'Набор массы',
    maintain: 'Поддержка формы',
    endurance: 'Выносливость'
  }

  const goalEmojis = {
    lose_weight: '🔥',
    gain_muscle: '💪',
    maintain: '⚖️',
    endurance: '🏃'
  }

  const goalColors = {
    lose_weight: 'bg-red-100 text-red-700',
    gain_muscle: 'bg-blue-100 text-blue-700',
    maintain: 'bg-green-100 text-green-700',
    endurance: 'bg-orange-100 text-orange-700'
  }

  // Calculate statistics
  const completedWorkoutsCount = allWorkouts?.filter((w: any) => w.completed).length || 0
  const totalWorkouts = allWorkouts?.length || 0
  const completionRate = totalWorkouts > 0 ? Math.round((completedWorkoutsCount / totalWorkouts) * 100) : 0

  // Calculate this week's stats
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff)).toISOString().split('T')[0]
  }

  const currentWeekStart = getWeekStart(new Date())
  const thisWeekWorkouts = allWorkouts?.filter((w: any) => w.weekStart === currentWeekStart) || []
  const thisWeekCompleted = thisWeekWorkouts.filter((w: any) => w.completed).length

  const displayProfile = {
    name: userProfile?.name || convexProfile?.name || currentUser?.name || tempProfile.name,
    email: userProfile?.email || currentUser?.email || tempProfile.email,
    goal: userProfile?.goal || convexProfile?.fitnessGoal || tempProfile.goal
  }

  // Show loading only if user has email but queries are still loading
  if (userProfile?.email && allWorkouts === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <Card className="border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-900">Личный кабинет</CardTitle>
                <CardDescription className="text-lg">Управляйте своим профилем и настройками</CardDescription>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setEditMode(!editMode)}
                className="text-slate-600 border-slate-300 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                {editMode ? 'Отмена' : 'Редактировать'}
              </Button>
              <Button 
                variant="outline" 
                onClick={onLogout}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Введите ваше имя"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    type="email"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Фитнес цель</Label>
                <Select 
                  value={tempProfile.goal} 
                  onValueChange={(value) => setTempProfile(prev => ({ ...prev, goal: value }))}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Выберите цель" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">🔥 Похудеть</SelectItem>
                    <SelectItem value="gain_muscle">💪 Набрать мышечную массу</SelectItem>
                    <SelectItem value="maintain">⚖️ Поддерживать форму</SelectItem>
                    <SelectItem value="endurance">🏃 Улучшить выносливость</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
                  Сохранить изменения
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setTempProfile({
                      name: displayProfile.name,
                      email: displayProfile.email,
                      goal: displayProfile.goal
                    })
                    setEditMode(false)
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-600">Имя</Label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <User className="h-5 w-5 text-slate-500" />
                    <span className="text-lg font-semibold text-slate-900">
                      {displayProfile.name || 'Не указано'}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-600">Email</Label>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <span className="text-lg font-semibold text-slate-900">
                      {displayProfile.email || 'Не указан'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-slate-600">Фитнес цель</Label>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-semibold text-slate-900">
                    {goalLabels[displayProfile.goal as keyof typeof goalLabels] || 'Не указана'}
                  </span>
                  <Badge className={`ml-auto ${goalColors[displayProfile.goal as keyof typeof goalColors] || 'bg-gray-100 text-gray-700'}`}>
                    {goalEmojis[displayProfile.goal as keyof typeof goalEmojis] || '🎯'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Award className="h-7 w-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-emerald-700 mb-2">
              {completedWorkoutsCount}
            </div>
            <div className="text-sm text-emerald-600 font-medium">
              Выполнено тренировок
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-blue-700 mb-2">
              {thisWeekCompleted}
            </div>
            <div className="text-sm text-blue-600 font-medium">
              На этой неделе
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <div className="text-3xl font-bold text-purple-700 mb-2">
              {completionRate}%
            </div>
            <div className="text-sm text-purple-600 font-medium">
              Процент выполнения
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-xl text-amber-900 flex items-center gap-2">
            <Award className="h-5 w-5" />
            Достижения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* First Workout Achievement */}
            <div className={`p-4 rounded-lg border ${completedWorkoutsCount >= 1 ? 'bg-green-100 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completedWorkoutsCount >= 1 ? 'bg-green-500' : 'bg-gray-400'}`}>
                  <span className="text-white text-lg">🏃</span>
                </div>
                <div>
                  <h4 className={`font-medium ${completedWorkoutsCount >= 1 ? 'text-green-800' : 'text-gray-600'}`}>
                    Первые шаги
                  </h4>
                  <p className={`text-sm ${completedWorkoutsCount >= 1 ? 'text-green-600' : 'text-gray-500'}`}>
                    Выполните первую тренировку
                  </p>
                </div>
              </div>
            </div>

            {/* 5 Workouts Achievement */}
            <div className={`p-4 rounded-lg border ${completedWorkoutsCount >= 5 ? 'bg-blue-100 border-blue-200' : 'bg-gray-100 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completedWorkoutsCount >= 5 ? 'bg-blue-500' : 'bg-gray-400'}`}>
                  <span className="text-white text-lg">💪</span>
                </div>
                <div>
                  <h4 className={`font-medium ${completedWorkoutsCount >= 5 ? 'text-blue-800' : 'text-gray-600'}`}>
                    Постоянство
                  </h4>
                  <p className={`text-sm ${completedWorkoutsCount >= 5 ? 'text-blue-600' : 'text-gray-500'}`}>
                    Выполните 5 тренировок
                  </p>
                </div>
              </div>
            </div>

            {/* Perfect Week Achievement */}
            <div className={`p-4 rounded-lg border ${thisWeekCompleted >= 5 ? 'bg-purple-100 border-purple-200' : 'bg-gray-100 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${thisWeekCompleted >= 5 ? 'bg-purple-500' : 'bg-gray-400'}`}>
                  <span className="text-white text-lg">🏆</span>
                </div>
                <div>
                  <h4 className={`font-medium ${thisWeekCompleted >= 5 ? 'text-purple-800' : 'text-gray-600'}`}>
                    Идеальная неделя
                  </h4>
                  <p className={`text-sm ${thisWeekCompleted >= 5 ? 'text-purple-600' : 'text-gray-500'}`}>
                    5 тренировок за неделю
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 