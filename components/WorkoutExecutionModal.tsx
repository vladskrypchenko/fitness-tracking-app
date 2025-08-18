'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  Circle, 
  Timer,
  Target,
  Clock
} from 'lucide-react'

interface WorkoutSection {
  _id: string
  name: string
  duration: string
  instructions: string[]
  order: number
}

interface WorkoutType {
  _id: string
  name: string
  description: string
  duration: string
  calories: string
  emoji: string
  gradient: string
  sections: WorkoutSection[]
}

interface WorkoutExecutionModalProps {
  workout: WorkoutType | null
  isOpen: boolean
  onClose: () => void
  onComplete: (completedSections: boolean[]) => void
  executingWorkout?: {
    sessionId: string
    isCompleted?: boolean
    completedSections?: boolean[]
    startTime?: number
    endTime?: number
    duration?: number
  }
}

export default function WorkoutExecutionModal({ 
  workout, 
  isOpen, 
  onClose, 
  onComplete,
  executingWorkout
}: WorkoutExecutionModalProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [timer, setTimer] = useState(0)
  const [currentSection, setCurrentSection] = useState(0)
  const [sectionProgress, setSectionProgress] = useState<boolean[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)

  // Initialize section progress when workout changes
  useEffect(() => {
    if (workout) {
      // If workout is already completed, use existing progress
      if (executingWorkout?.isCompleted && executingWorkout?.completedSections) {
        setSectionProgress(executingWorkout.completedSections)
        // Set timer to completed duration if available
        if (executingWorkout.duration) {
          setTimer(executingWorkout.duration * 60) // Convert minutes to seconds
        }
      } else {
        setSectionProgress(new Array(workout.sections.length).fill(false))
        setTimer(0)
      }
      setCurrentSection(0)
      setIsRunning(false)
      setStartTime(executingWorkout?.startTime || null)
    }
  }, [workout, executingWorkout])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1)
      }, 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    if (!startTime) {
      setStartTime(Date.now())
    }
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const toggleSectionComplete = (index: number) => {
    const newProgress = [...sectionProgress]
    newProgress[index] = !newProgress[index]
    setSectionProgress(newProgress)
    
    // Auto-advance to next incomplete section
    if (newProgress[index] && index < workout!.sections.length - 1) {
      const nextIncompleteIndex = newProgress.findIndex((completed, i) => i > index && !completed)
      if (nextIncompleteIndex !== -1) {
        setCurrentSection(nextIncompleteIndex)
      }
    }
  }

  const completeWorkout = () => {
    pauseTimer()
    onComplete(sectionProgress)
    onClose()
  }

  const cancelWorkout = () => {
    setIsRunning(false)
    setTimer(0)
    setCurrentSection(0)
    setSectionProgress(new Array(workout?.sections.length || 0).fill(false))
    setStartTime(null)
    onClose()
  }

  if (!workout) return null

  const completedCount = sectionProgress.filter(Boolean).length
  const progressPercentage = (completedCount / workout.sections.length) * 100
  const currentSectionData = workout.sections[currentSection]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${workout.gradient} rounded-xl flex items-center justify-center relative`}>
              <span className="text-2xl">{workout.emoji}</span>
              {executingWorkout?.isCompleted && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold">{workout.name}</h3>
                {executingWorkout?.isCompleted && (
                  <Badge variant="outline">Выполнено</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{workout.description}</p>
              {executingWorkout?.isCompleted && executingWorkout?.endTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  Завершено: {new Date(executingWorkout.endTime).toLocaleString('ru-RU', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Timer and Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl border flex items-center justify-center">
                    {executingWorkout?.isCompleted ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : (
                      <Timer className="h-8 w-8" />
                    )}
                  </div>
                  <div>
                    <p className={`text-3xl font-mono font-bold`}>
                      {formatTime(timer)}
                    </p>
                    <p className={`text-sm text-muted-foreground`}>
                      {executingWorkout?.isCompleted ? 'Время выполнения' : 'Время тренировки'}
                    </p>
                  </div>
                </div>
                
                {!executingWorkout?.isCompleted && (
                  <div className="flex gap-2">
                    {!isRunning ? (
                      <Button onClick={startTimer}>
                        <Play className="h-4 w-4 mr-2" />
                        Старт
                      </Button>
                    ) : (
                      <Button onClick={pauseTimer} variant="outline">
                        <Pause className="h-4 w-4 mr-2" />
                        Пауза
                      </Button>
                    )}
                    <Button onClick={cancelWorkout} variant="outline" className="text-destructive">
                      <Square className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  </div>
                )}
                
                {executingWorkout?.isCompleted && (
                  <Button onClick={onClose} variant="outline">
                    Закрыть
                  </Button>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Прогресс: {completedCount} из {workout.sections.length} разделов</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Current Section */}
          {currentSectionData && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-bold text-emerald-800">Текущий раздел</h4>
                    <p className="text-emerald-600">Раздел {currentSection + 1} из {workout.sections.length}</p>
                  </div>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                    {currentSectionData.duration}
                  </Badge>
                </div>
                
                <h5 className="text-xl font-semibold text-emerald-900 mb-3">{currentSectionData.name}</h5>
                
                <div className="space-y-2 mb-4">
                  {currentSectionData.instructions.map((instruction, i) => (
                    <div key={i} className="flex items-start gap-2 text-emerald-800">
                      <span className="text-emerald-400 mt-1">•</span>
                      <span>{instruction}</span>
                    </div>
                  ))}
                </div>
                
                {!executingWorkout?.isCompleted && (
                  <Button
                    onClick={() => toggleSectionComplete(currentSection)}
                    className={`w-full ${
                      sectionProgress[currentSection] 
                        ? 'bg-emerald-600 hover:bg-emerald-700' 
                        : 'bg-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    {sectionProgress[currentSection] ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Раздел выполнен
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 mr-2" />
                        Отметить как выполненный
                      </>
                    )}
                  </Button>
                )}
                
                {executingWorkout?.isCompleted && (
                  <div className="w-full p-3 bg-green-100 text-green-800 rounded-lg text-center font-medium">
                    <CheckCircle className="h-4 w-4 mr-2 inline" />
                    Раздел был выполнен
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* All Sections Overview */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4">Все разделы тренировки</h4>
              <div className="space-y-3">
                {workout.sections.map((section, index) => {
                  const isCompleted = sectionProgress[index]
                  const isCurrent = index === currentSection
                  
                  return (
                    <div 
                      key={section._id} 
                      className={`p-3 rounded-lg border cursor-pointer ${
                        isCurrent
                          ? 'border-accent bg-accent'
                          : isCompleted
                            ? 'bg-secondary'
                            : ''
                      }`}
                      onClick={() => !executingWorkout?.isCompleted && setCurrentSection(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!executingWorkout?.isCompleted) {
                                toggleSectionComplete(index)
                              }
                            }}
                            className={`${isCompleted ? 'text-foreground' : 'text-muted-foreground'} ${!executingWorkout?.isCompleted ? 'hover:text-foreground' : 'cursor-default'}`}
                            disabled={executingWorkout?.isCompleted}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                          <div>
                            <h5 className={`font-medium ${isCurrent ? '' : ''}`}>
                              {section.name}
                            </h5>
                            <p className={`text-sm text-muted-foreground`}>
                              {section.duration}
                            </p>
                          </div>
                        </div>
                        {isCurrent && <Badge variant="outline">Текущий</Badge>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Complete Workout Button */}
          {!executingWorkout?.isCompleted && (
            <div className="flex gap-3">
              <Button onClick={completeWorkout} className="flex-1" disabled={completedCount === 0}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Завершить тренировку ({completedCount}/{workout.sections.length})
              </Button>
            </div>
          )}
          
          {executingWorkout?.isCompleted && (
            <div className="text-center p-4 bg-secondary rounded-lg border">
              <CheckCircle className="h-12 w-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-1">Тренировка завершена!</h3>
              <p className="text-sm text-muted-foreground">Отличная работа! Все разделы выполнены.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 
