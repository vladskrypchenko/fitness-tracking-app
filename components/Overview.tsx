'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, TrendingUp, Target, Award, Activity, Heart, Dumbbell, Zap, Clock, Flame, User, LogOut, Settings } from 'lucide-react'

interface DashboardProps {
  userProfile: any
  onLogout: () => void
}

export default function Dashboard({ userProfile, onLogout }: DashboardProps) {
  // отримуємо поточного користувача за email
  const currentUser = useQuery(api.users.getCurrentUser, 
    userProfile?.email ? { email: userProfile.email } : {}
  )
  
  // отримуємо профіль користувача з convex
  const convexProfile = useQuery(api.userProfiles.getCurrentUserProfile,
    currentUser ? { userId: currentUser._id } : "skip"
  )

  // мутації для редагування профілю
  const createUserProfile = useMutation(api.userProfiles.createUserProfile)
  const updateUserProfile = useMutation(api.userProfiles.updateUserProfile)
  const updateUser = useMutation(api.users.updateUser)

  // стан редагування профілю
  const [editMode, setEditMode] = useState(false)
  const [tempProfile, setTempProfile] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    goal: userProfile?.goal || ''
  })

  // оновлюємо тимчасовий профіль коли змінюється userProfile або convexProfile
  useEffect(() => {
    setTempProfile({
      name: userProfile?.name || convexProfile?.name || '',
      email: userProfile?.email || '',
      goal: userProfile?.goal || convexProfile?.fitnessGoal || ''
    })
  }, [userProfile, convexProfile])

  // обробляємо збереження профілю
  const handleSaveProfile = async () => {
    if (!currentUser) return

    try {
      // оновлюємо базову інформацію користувача
      if (tempProfile.name !== currentUser.name || tempProfile.email !== currentUser.email) {
        await updateUser({
          userId: currentUser._id,
          name: tempProfile.name,
          email: tempProfile.email
        })
      }

      // оновлюємо або створюємо профіль користувача
      if (convexProfile) {
        await updateUserProfile({
          userId: currentUser._id,
          name: tempProfile.name,
          fitnessGoal: tempProfile.goal as any
        })
      } else if (tempProfile.goal) {
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
  
  // обчислюємо початок поточного тижня (понеділок)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff)).toISOString().split('T')[0]
  }

  const currentWeekStart = getWeekStart(new Date())

  // отримуємо всі тренування користувача для статистики (fallback до порожнього масиву якщо немає користувача)
  const allWorkouts = useQuery(api.workouts.getAllUserWorkouts,
    currentUser ? { userId: currentUser._id } : "skip"
  ) || []
  
  // отримуємо тренування поточного тижня (fallback до порожнього масиву якщо немає користувача)
  const weekWorkouts = useQuery(api.workouts.getWeekWorkouts,
    currentUser ? { userId: currentUser._id, weekStart: currentWeekStart } : "skip"
  ) || []

  // обчислюємо статистику
  const totalWorkouts = allWorkouts?.length || 0
  const completedWorkouts = allWorkouts?.filter((w: any) => w.completed).length || 0
  const thisWeekWorkouts = weekWorkouts?.length || 0
  const thisWeekCompleted = weekWorkouts?.filter((w: any) => w.completed).length || 0
  
  const completionRate = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0
  const weekProgress = thisWeekWorkouts > 0 ? Math.round((thisWeekCompleted / thisWeekWorkouts) * 100) : 0

  // Calculate workout type statistics
  const workoutTypeStats = {
    cardio: allWorkouts?.filter((w: any) => w.type === 'cardio' && w.completed).length || 0,
    strength: allWorkouts?.filter((w: any) => w.type === 'strength' && w.completed).length || 0,
    stretching: allWorkouts?.filter((w: any) => w.type === 'stretching' && w.completed).length || 0
  }

  // Calculate streak (consecutive days with workouts)
  const calculateStreak = () => {
    if (!allWorkouts || allWorkouts.length === 0) return 0
    
    const completedDates = allWorkouts
      .filter((w: any) => w.completed)
      .map((w: any) => w.date)
      .sort()
      .reverse()
    
    if (completedDates.length === 0) return 0
    
    let streak = 0
    const today = new Date().toISOString().split('T')[0]
    let currentDate = today
    
    for (const date of completedDates) {
      if (date === currentDate || 
          new Date(currentDate).getTime() - new Date(date).getTime() <= 24 * 60 * 60 * 1000) {
        streak++
        const prevDay = new Date(date)
        prevDay.setDate(prevDay.getDate() - 1)
        currentDate = prevDay.toISOString().split('T')[0]
      } else {
        break
      }
    }
    
    return streak
  }

  const currentStreak = calculateStreak()

  const goalLabels = {
    lose_weight: 'Схуднення',
    gain_muscle: 'Набор маси',
    maintain: 'Підтримка форми',
    endurance: 'Витривалість'
  }

  const goalEmojis = {
    lose_weight: '🔥',
    gain_muscle: '💪',
    maintain: '⚖️',
    endurance: '🏃'
  }

  const displayProfile = {
    name: userProfile?.name || convexProfile?.name || currentUser?.name,
    goal: userProfile?.goal || convexProfile?.fitnessGoal
  }

  // Show loading only if user has email but queries are still loading
  if (userProfile?.email && (allWorkouts === undefined || weekWorkouts === undefined)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Загрузка обзора...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Ласкаво просимо, {displayProfile.name || 'Фітнес-ентузіаст'}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              Готові до нових спортивних досягнень?
            </p>
            {displayProfile.goal && (
              <div className="flex items-center gap-2 mt-4">
                <Target className="h-5 w-5 text-blue-200" />
                <span className="text-blue-100">
                  Ваша ціль: {goalLabels[displayProfile.goal as keyof typeof goalLabels]}
                </span>
                <span className="text-2xl">
                  {goalEmojis[displayProfile.goal as keyof typeof goalEmojis]}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setEditMode(!editMode)}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              {editMode ? 'Скасувати' : 'Налаштування'}
            </Button>
            <Button 
              variant="ghost"
              onClick={onLogout}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Вийти
            </Button>
            <div className="hidden md:block ml-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Section */}
      {editMode && (
        <Card className="border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
              <User className="h-5 w-5" />
              Редактирование профиля
            </CardTitle>
            <CardDescription>
              Обновите свою личную информацию и фитнес-цели
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Имя</Label>
                  <Input
                    id="edit-name"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Введите ваше имя"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                    type="email"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-goal">Фитнес цель</Label>
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
                      name: displayProfile.name || '',
                      email: userProfile?.email || '',
                      goal: displayProfile.goal || ''
                    })
                    setEditMode(false)
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mb-1">
              {completedWorkouts}
            </div>
            <div className="text-sm text-emerald-600 font-medium">
              Всего тренировок
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-700 mb-1">
              {thisWeekCompleted}/{thisWeekWorkouts}
            </div>
            <div className="text-sm text-blue-600 font-medium">
              На этой неделе
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-700 mb-1">
              {currentStreak}
            </div>
            <div className="text-sm text-orange-600 font-medium">
              Дней подряд
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-700 mb-1">
              {completionRate}%
            </div>
            <div className="text-sm text-purple-600 font-medium">
              Процент выполнения
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress and Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              Прогресс недели
            </CardTitle>
            <CardDescription>
              Виконано {thisWeekCompleted} з {thisWeekWorkouts} запланованих тренувань
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-slate-600 mb-2">
                  <span>Прогресс</span>
                  <span>{weekProgress}%</span>
                </div>
                <Progress value={weekProgress} className="h-3" />
              </div>
              
              {thisWeekWorkouts > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">
                    Осталось: {thisWeekWorkouts - thisWeekCompleted} тренировок
                  </span>
                  {weekProgress === 100 && (
                    <Badge className="bg-green-100 text-green-700">
                      🎉 Неделя завершена!
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Workout Types Distribution */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Activity className="h-5 w-5 text-blue-600" />
              Типы тренировок
            </CardTitle>
            <CardDescription>
              Распределение выполненных тренировок по типам
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-slate-700">Кардио</span>
                </div>
                <Badge className="bg-red-100 text-red-700">
                  {workoutTypeStats.cardio}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium text-slate-700">Силовые</span>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  {workoutTypeStats.strength}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium text-slate-700">Растяжка</span>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">
                  {workoutTypeStats.stretching}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Clock className="h-5 w-5 text-blue-600" />
            Последние тренировки
          </CardTitle>
          <CardDescription>
            Ваша активность за последние дни
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allWorkouts && allWorkouts.length > 0 ? (
            <div className="space-y-3">
              {allWorkouts
                .filter((w: any) => w.completed)
                .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((workout: any) => {
                  const workoutDate = new Date(workout.date)
                  const isToday = workout.date === new Date().toISOString().split('T')[0]
                  const isYesterday = workout.date === new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                  
                  let dateLabel = workoutDate.toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'short' 
                  })
                  if (isToday) dateLabel = 'Сегодня'
                  if (isYesterday) dateLabel = 'Вчера'
                  
                  const typeConfig = {
                    cardio: { icon: Heart, color: 'text-red-600', bg: 'bg-red-100' },
                    strength: { icon: Dumbbell, color: 'text-blue-600', bg: 'bg-blue-100' },
                    stretching: { icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-100' }
                  }
                  
                  const config = typeConfig[workout.type as keyof typeof typeConfig]
                  const IconComponent = config.icon
                  
                  return (
                    <div key={workout._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900">
                          {workout.type === 'cardio' ? 'Кардіо тренування' : 
                           workout.type === 'strength' ? 'Силове тренування' : 'Розтяжка'}
                        </div>
                        <div className="text-sm text-slate-600">{dateLabel}</div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        Выполнено
                      </Badge>
                    </div>
                  )
                })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-2">Пока нет выполненных тренировок</p>
              <p className="text-sm text-slate-500">
                Начните свой фитнес-путь с первой тренировки!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 