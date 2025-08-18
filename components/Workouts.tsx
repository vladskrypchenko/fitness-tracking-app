'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { CalendarDays, Dumbbell, Heart, Zap, Clock, Target, Activity, Edit, Plus, Trash2, Save, X, Check } from 'lucide-react'

interface WorkoutSection {
  _id: string
  name: string
  duration: string
  instructions: string[]
  order: number
  completed?: boolean
}

interface WorkoutType {
  _id: string
  name: string
  type: 'cardio' | 'strength' | 'stretching'
  description: string
  duration: string
  calories: string
  emoji: string
  color: string
  bgColor: string
  lightBg: string
  lightColor: string
  borderColor: string
  gradient: string
  isDefault: boolean
  sections: WorkoutSection[]
}


interface WorkoutsProps {
  onWorkoutComplete: () => void
}

export default function Workouts({ onWorkoutComplete }: WorkoutsProps) {
  // отримуємо поточного користувача (демо користувач поки що)
  const currentUser = useQuery(api.users.getCurrentUser, {})
  
  // отримуємо типи тренувань з секціями
  const workoutTypes = useQuery(api.workoutTypes.getUserWorkoutTypes, 
    currentUser ? { userId: currentUser._id } : "skip"
  ) as any[]
  
  // ініціалізуємо типи тренувань за замовчуванням
  const initializeWorkoutTypes = useMutation(api.workoutTypes.initializeDefaultWorkoutTypes)
  
  // мутації для управління тренуваннями
  const createWorkoutType = useMutation(api.workoutTypes.createWorkoutType)
  const updateWorkoutType = useMutation(api.workoutTypes.updateWorkoutType)
  const deleteWorkoutType = useMutation(api.workoutTypes.deleteWorkoutType)
  const createWorkoutSection = useMutation(api.workoutTypes.createWorkoutSection)
  const updateWorkoutSection = useMutation(api.workoutTypes.updateWorkoutSection)
  const deleteWorkoutSection = useMutation(api.workoutTypes.deleteWorkoutSection)
  
  const [editingWorkout, setEditingWorkout] = useState<string | null>(null)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingInstructions, setEditingInstructions] = useState<{[key: string]: string[]}>({})
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'workout' | 'section' | 'instruction'
    id: string
    sectionId?: string
    instructionIndex?: number
  } | null>(null)
  const [newWorkoutForm, setNewWorkoutForm] = useState<{
    name: string
    type: 'cardio' | 'strength' | 'stretching'
    description: string
    duration: string
    calories: string
    emoji: string
  } | null>(null)

  // ініціалізуємо типи тренувань за замовчуванням якщо їх немає
  useEffect(() => {
    if (currentUser && workoutTypes && workoutTypes.length === 0) {
      initializeWorkoutTypes({ userId: currentUser._id })
    }
  }, [currentUser, workoutTypes, initializeWorkoutTypes])


  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'cardio': return Heart
      case 'strength': return Dumbbell
      case 'stretching': return Zap
      default: return Activity
    }
  }

  const getTypeColors = (type: string) => {
    switch (type) {
      case 'cardio':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-500',
          lightBg: 'bg-red-50',
          lightColor: 'bg-red-100 text-red-700',
          borderColor: 'border-red-200',
          gradient: 'from-red-400 to-pink-500'
        }
      case 'strength':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-500',
          lightBg: 'bg-blue-50',
          lightColor: 'bg-blue-100 text-blue-700',
          borderColor: 'border-blue-200',
          gradient: 'from-blue-400 to-indigo-500'
        }
      case 'stretching':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-500',
          lightBg: 'bg-emerald-50',
          lightColor: 'bg-emerald-100 text-emerald-700',
          borderColor: 'border-emerald-200',
          gradient: 'from-emerald-400 to-teal-500'
        }
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-500',
          lightBg: 'bg-gray-50',
          lightColor: 'bg-gray-100 text-gray-700',
          borderColor: 'border-gray-200',
          gradient: 'from-gray-400 to-gray-500'
        }
    }
  }

  const handleCreateWorkout = async () => {
    if (!currentUser || !newWorkoutForm) return
    
    const colors = getTypeColors(newWorkoutForm.type)
    
    try {
      await createWorkoutType({
        userId: currentUser._id,
        ...newWorkoutForm,
        ...colors
      })
      setNewWorkoutForm(null)
    } catch (error) {
      console.error('Error creating workout:', error)
    }
  }

  const handleUpdateWorkout = async (workoutId: string, updates: any) => {
    try {
      await updateWorkoutType({
        workoutTypeId: workoutId as any,
        ...updates
      })
      setEditingWorkout(null)
    } catch (error) {
      console.error('Error updating workout:', error)
    }
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    try {
      await deleteWorkoutType({ workoutTypeId: workoutId as any })
      setDeleteConfirmation(null)
    } catch (error) {
      console.error('Error deleting workout:', error)
    }
  }

  const handleCreateSection = async (workoutTypeId: string) => {
    const workout = workoutTypes?.find((w: any) => w._id === workoutTypeId)
    if (!workout) return
    
    try {
      await createWorkoutSection({
        workoutTypeId: workoutTypeId as any,
        name: "Новый раздел",
        duration: "5 минут",
        instructions: ["Добавьте инструкции"],
        order: workout.sections.length + 1
      })
    } catch (error) {
      console.error('Error creating section:', error)
    }
  }

  const handleUpdateSection = async (sectionId: string, updates: any, exitEdit = true) => {
    try {
      await updateWorkoutSection({
        sectionId: sectionId as any,
        ...updates
      })
      if (exitEdit) {
        setEditingSection(null)
      }
    } catch (error) {
      console.error('Error updating section:', error)
    }
  }

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteWorkoutSection({ sectionId: sectionId as any })
      setDeleteConfirmation(null)
    } catch (error) {
      console.error('Error deleting section:', error)
    }
  }

  const handleDeleteInstruction = async (sectionId: string, instructionIndex: number) => {
    const section = workoutTypes
      ?.flatMap((w: any) => w.sections)
      ?.find((s: any) => s._id === sectionId)
    
    if (!section) return
    
    const newInstructions = section.instructions.filter((_: any, i: number) => i !== instructionIndex)
    
    try {
      await updateWorkoutSection({
        sectionId: sectionId as any,
        instructions: newInstructions
      })
      setDeleteConfirmation(null)
    } catch (error) {
      console.error('Error deleting instruction:', error)
    }
  }

  const handleEditSection = (sectionId: string) => {
    const section = workoutTypes
      ?.flatMap((w: any) => w.sections)
      ?.find((s: any) => s._id === sectionId)
    
    if (section) {
      setEditingInstructions(prev => ({
        ...prev,
        [sectionId]: [...section.instructions]
      }))
    }
    setEditingSection(editingSection === sectionId ? null : sectionId)
  }

  const handleInstructionChange = (sectionId: string, index: number, value: string) => {
    setEditingInstructions(prev => {
      const sectionInstructions = [...(prev[sectionId] || [])]
      sectionInstructions[index] = value
      return {
        ...prev,
        [sectionId]: sectionInstructions
      }
    })
  }

  const handleSaveInstructions = async (sectionId: string) => {
    const instructions = editingInstructions[sectionId]
    if (!instructions) return
    
    try {
      await updateWorkoutSection({
        sectionId: sectionId as any,
        instructions
      })
      setEditingSection(null)
      setEditingInstructions(prev => {
        const newState = { ...prev }
        delete newState[sectionId]
        return newState
      })
    } catch (error) {
      console.error('Error saving instructions:', error)
    }
  }

  if (!currentUser || workoutTypes === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Загрузка тренировок...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Тренировки</h2>
          <p className="text-lg text-slate-600 mt-1">Выберите тренировку и начните заниматься</p>
        </div>
        
        <Button
          onClick={() => setNewWorkoutForm({
            name: '',
            type: 'cardio',
            description: '',
            duration: '',
            calories: '',
            emoji: '💪'
          })}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить тренировку
        </Button>
      </div>


      {/* Workout Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workoutTypes.map((workout: any) => {
          const IconComponent = getWorkoutIcon(workout.type)
          
          return (
            <Card key={workout._id} className={`${workout.borderColor} shadow-lg transition-all duration-200 hover:shadow-xl`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${workout.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl">{workout.emoji}</span>
                    </div>
                    <div>
                      {editingWorkout === workout._id ? (
                        <div className="space-y-2">
                          <Input
                            defaultValue={workout.name}
                            onBlur={(e) => handleUpdateWorkout(workout._id, { name: e.target.value })}
                            className="font-bold text-lg"
                          />
                          <Input
                            defaultValue={workout.description}
                            onBlur={(e) => handleUpdateWorkout(workout._id, { description: e.target.value })}
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <>
                          <CardTitle className="text-xl text-slate-900">{workout.name}</CardTitle>
                          <CardDescription className="text-base">{workout.description}</CardDescription>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingWorkout(editingWorkout === workout._id ? null : workout._id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!workout.isDefault && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => setDeleteConfirmation({
                          type: 'workout',
                          id: workout._id
                        })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Workout Info */}
                  <div className="flex gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{workout.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      <span>{workout.calories}</span>
                    </div>
                  </div>

                  {/* Sections */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">Разделы тренировки</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCreateSection(workout._id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {workout.sections?.map((section: any, index: number) => {
                      return (
                        <div key={section._id} className="p-3 rounded-lg border bg-slate-50 border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              
                              {editingSection === section._id ? (
                                <div className="flex gap-2 flex-1">
                                  <Input
                                    defaultValue={section.name}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setEditingSection(null)
                                      }
                                    }}
                                    onBlur={(e) => {
                                      handleUpdateSection(section._id, { name: e.target.value }, false)
                                    }}
                                    className="font-medium"
                                    autoFocus
                                  />
                                  <Input
                                    defaultValue={section.duration}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        setEditingSection(null)
                                      }
                                    }}
                                    onBlur={(e) => {
                                      handleUpdateSection(section._id, { duration: e.target.value }, false)
                                    }}
                                    className="w-24"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingSection(null)}
                                    className="text-green-600"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div>
                                  <h5 className="font-medium text-slate-900">{section.name}</h5>
                                  <p className="text-sm text-slate-600">{section.duration}</p>
                                </div>
                              )}
                            </div>
                            
                            {editingSection !== section._id && (
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSection(section._id)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirmation({
                                    type: 'section',
                                    id: section._id
                                  })}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          {editingSection === section._id ? (
                            <div className="space-y-2">
                              {(editingInstructions[section._id] || section.instructions)?.map((instruction: string, i: number) => (
                                <div key={i} className="flex gap-2">
                                  <Input
                                    value={editingInstructions[section._id]?.[i] || instruction}
                                    onChange={(e) => handleInstructionChange(section._id, i, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleSaveInstructions(section._id)
                                      }
                                    }}
                                    className="text-sm flex-1"
                                    autoFocus={i === 0}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteConfirmation({
                                      type: 'instruction',
                                      id: section._id,
                                      sectionId: section._id,
                                      instructionIndex: i
                                    })}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const currentInstructions = editingInstructions[section._id] || section.instructions || []
                                    const newInstructions = [...currentInstructions, "Новая инструкция"]
                                    setEditingInstructions(prev => ({
                                      ...prev,
                                      [section._id]: newInstructions
                                    }))
                                  }}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Добавить инструкцию
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSaveInstructions(section._id)}
                                  className="text-green-600"
                                >
                                  Сохранить
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <ul className="text-sm text-slate-600 space-y-1">
                              {section.instructions?.map((instruction: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-slate-400 mt-0.5">•</span>
                                  <span>{instruction}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    })}
                  </div>

                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* New Workout Form Dialog */}
      {newWorkoutForm && (
        <AlertDialog open={!!newWorkoutForm} onOpenChange={() => setNewWorkoutForm(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Создать новую тренировку</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={newWorkoutForm.name}
                  onChange={(e) => setNewWorkoutForm(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Название тренировки"
                />
              </div>
              
              <div>
                <Label htmlFor="type">Тип</Label>
                <select
                  id="type"
                  value={newWorkoutForm.type}
                  onChange={(e) => setNewWorkoutForm(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="cardio">Кардио</option>
                  <option value="strength">Силовая</option>
                  <option value="stretching">Растяжка</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  value={newWorkoutForm.description}
                  onChange={(e) => setNewWorkoutForm(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Описание тренировки"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Длительность</Label>
                  <Input
                    id="duration"
                    value={newWorkoutForm.duration}
                    onChange={(e) => setNewWorkoutForm(prev => prev ? { ...prev, duration: e.target.value } : null)}
                    placeholder="30-45 минут"
                  />
                </div>
                
                <div>
                  <Label htmlFor="calories">Калории</Label>
                  <Input
                    id="calories"
                    value={newWorkoutForm.calories}
                    onChange={(e) => setNewWorkoutForm(prev => prev ? { ...prev, calories: e.target.value } : null)}
                    placeholder="300-500 ккал"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="emoji">Эмодзи</Label>
                <Input
                  id="emoji"
                  value={newWorkoutForm.emoji}
                  onChange={(e) => setNewWorkoutForm(prev => prev ? { ...prev, emoji: e.target.value } : null)}
                  placeholder="💪"
                  maxLength={2}
                />
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Скасувати</AlertDialogCancel>
              <AlertDialogAction onClick={handleCreateWorkout}>
                Создать
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {deleteConfirmation.type === 'workout' && 'Видалити тренування?'}
                {deleteConfirmation.type === 'section' && 'Видалити розділ?'}
                {deleteConfirmation.type === 'instruction' && 'Видалити інструкцію?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteConfirmation.type === 'workout' && 'Цю дію неможливо скасувати. Тренування та всі його розділи будуть видалені.'}
                {deleteConfirmation.type === 'section' && 'Цю дію неможливо скасувати. Розділ та всі його інструкції будуть видалені.'}
                {deleteConfirmation.type === 'instruction' && 'Цю дію неможливо скасувати. Інструкцію буде видалено.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Скасувати</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  if (deleteConfirmation.type === 'workout') {
                    handleDeleteWorkout(deleteConfirmation.id)
                  } else if (deleteConfirmation.type === 'section') {
                    handleDeleteSection(deleteConfirmation.id)
                  } else if (deleteConfirmation.type === 'instruction' && deleteConfirmation.sectionId !== undefined && deleteConfirmation.instructionIndex !== undefined) {
                    handleDeleteInstruction(deleteConfirmation.sectionId, deleteConfirmation.instructionIndex)
                  }
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                Видалити
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
} 