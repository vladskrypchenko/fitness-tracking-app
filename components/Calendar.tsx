'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import WorkoutExecutionModal from './WorkoutExecutionModal'
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Play,
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Target,
  Check
} from 'lucide-react'

interface CalendarDay {
  date: string
  isCurrentMonth: boolean
  isToday: boolean
  workouts: any[]
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [showAddWorkout, setShowAddWorkout] = useState(false)
  const [selectedWorkoutType, setSelectedWorkoutType] = useState<string>('')
  const [executingWorkout, setExecutingWorkout] = useState<any>(null)
  const [showExecutionModal, setShowExecutionModal] = useState(false)

  // отримуємо поточного користувача
  const currentUser = useQuery(api.users.getCurrentUser, {})
  
  // отримуємо сесії тренувань для поточного місяця
  const workoutSessions = useQuery(api.workouts.getAllUserWorkouts, 
    currentUser ? { userId: currentUser._id } : "skip"
  )
  
  // отримуємо типи тренувань для вибору
  const workoutTypes = useQuery(api.workoutTypes.getAllWorkoutTypes,
    currentUser ? { userId: currentUser._id } : "skip"
  )
  
  // мутації
  const createWorkoutSession = useMutation(api.workouts.createWorkoutSession)
  const updateWorkoutSession = useMutation(api.workouts.updateWorkoutSession)

  if (!currentUser || workoutSessions === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка календаря...</p>
        </div>
      </div>
    )
  }

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const getWeekStart = (date: Date): string => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff)).toISOString().split('T')[0]
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1)
    
    const days: CalendarDay[] = []
    const today = formatDate(new Date())
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dateStr = formatDate(date)
      const dayWorkouts = workoutSessions?.filter(session => session.date === dateStr) || []
      
      days.push({
        date: dateStr,
        isCurrentMonth: date.getMonth() === month,
        isToday: dateStr === today,
        workouts: dayWorkouts
      })
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const toggleDateSelection = (date: string) => {
    setSelectedDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date)
      } else {
        return [...prev, date]
      }
    })
  }

  const handleAddWorkout = async () => {
    if (!selectedWorkoutType || selectedDates.length === 0) return
    
    const workoutType = workoutTypes?.find((wt: any) => wt._id === selectedWorkoutType)
    if (!workoutType) return

    try {
      for (const date of selectedDates) {
        const weekStart = getWeekStart(new Date(date))
        
        await createWorkoutSession({
          userId: currentUser._id,
          date,
          type: workoutType.type,
          workoutTypeId: workoutType._id,
          workoutTypeName: workoutType.name,
          completed: false,
          weekStart,
          completedSections: new Array(workoutType.sections?.length || 0).fill(false)
        })
      }
      
      setSelectedDates([])
      setSelectedWorkoutType('')
      setShowAddWorkout(false)
    } catch (error) {
      console.error('Error adding workouts:', error)
    }
  }

  const handleStartWorkout = (workout: any) => {
    if (!workout.workoutTypeId) return
    
    const workoutType = workoutTypes?.find((wt: any) => wt._id === workout.workoutTypeId)
    if (!workoutType) return
    
    setExecutingWorkout({
      sessionId: workout._id,
      workoutType: {
        ...workoutType,
        sections: workoutType.sections || []
      },
      isCompleted: workout.completed,
      completedSections: workout.completedSections || [],
      startTime: workout.startTime,
      endTime: workout.endTime,
      duration: workout.duration
    })
    setShowExecutionModal(true)
  }

  const handleCompleteWorkout = async (completedSections: boolean[]) => {
    if (!executingWorkout) return
    
    try {
      await updateWorkoutSession({
        sessionId: executingWorkout.sessionId,
        completed: true,
        completedSections,
        endTime: Date.now(),
        duration: Math.floor((Date.now() - (executingWorkout.startTime || Date.now())) / 60000)
      })
      
      setExecutingWorkout(null)
    } catch (error) {
      console.error('Error completing workout:', error)
    }
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Календарь тренировок</h2>
          <p className="text-lg text-muted-foreground mt-1">Планируйте и отслеживайте свои тренировки</p>
        </div>
        
        <Button
          onClick={() => setShowAddWorkout(true)}
          disabled={selectedDates.length === 0}
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить тренировку
          {selectedDates.length > 0 && (
            <Badge className="ml-2 bg-blue-100 text-blue-700">
              {selectedDates.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <CardTitle className="text-xl">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {calendarDays.map(day => {
              const isSelected = selectedDates.includes(day.date)
              const hasWorkouts = day.workouts.length > 0
              
              return (
                <div
                  key={day.date}
                  className={`
                    min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all
                    ${day.isCurrentMonth ? 'border-slate-200' : 'border-slate-100 bg-slate-50'}
                    ${day.isToday ? 'border-blue-400 bg-blue-50' : ''}
                    ${isSelected ? 'border-emerald-400 bg-emerald-50' : ''}
                    hover:border-slate-300
                  `}
                  onClick={() => toggleDateSelection(day.date)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className={`text-sm font-medium ${
                      day.isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                    } ${day.isToday ? 'text-primary' : ''}`}>
                      {new Date(day.date).getDate()}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {day.workouts.map(workout => (
                      <div
                        key={workout._id}
                        className={`text-xs p-1 rounded cursor-pointer ${
                          workout.completed ? 'bg-secondary' : 'bg-accent'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartWorkout(workout)
                        }}
                      >
                        <div className="flex items-center gap-1">
                          {workout.completed ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          <span className="truncate">
                            {workout.workoutTypeName || workout.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Add Workout Dialog */}
      <Dialog open={showAddWorkout} onOpenChange={setShowAddWorkout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Добавить тренировку</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Выберите тип тренировки
              </label>
              <Select value={selectedWorkoutType} onValueChange={setSelectedWorkoutType}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тренировку" />
                </SelectTrigger>
                <SelectContent>
                                     {workoutTypes?.map((workoutType: any) => (
                    <SelectItem key={workoutType._id} value={workoutType._id}>
                      <div className="flex items-center gap-2">
                        <span>{workoutType.emoji}</span>
                        <span>{workoutType.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Выбранные дни ({selectedDates.length})
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {selectedDates.map(date => (
                  <Badge key={date} variant="outline" className="cursor-pointer" 
                         onClick={() => toggleDateSelection(date)}>
                    {new Date(date).toLocaleDateString('ru-RU', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                    ×
                  </Badge>
                ))}
              </div>
              {selectedDates.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Выберите дни в календаре для добавления тренировки
                </p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button onClick={handleAddWorkout} disabled={!selectedWorkoutType || selectedDates.length === 0} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Додати в {selectedDates.length} {selectedDates.length === 1 ? 'день' : 'днів'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddWorkout(false)}>
                Скасувати
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workout Execution Modal */}
      <WorkoutExecutionModal
        workout={executingWorkout?.workoutType || null}
        isOpen={showExecutionModal}
        onClose={() => {
          setShowExecutionModal(false)
          setExecutingWorkout(null)
        }}
        onComplete={handleCompleteWorkout}
        executingWorkout={executingWorkout ? {
          sessionId: executingWorkout.sessionId,
          isCompleted: executingWorkout.isCompleted,
          completedSections: executingWorkout.completedSections,
          startTime: executingWorkout.startTime,
          endTime: executingWorkout.endTime,
          duration: executingWorkout.duration
        } : undefined}
      />
    </div>
  )
} 
