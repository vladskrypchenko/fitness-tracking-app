import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Activity, Mail, Lock, User, Target, ArrowRight, CheckCircle } from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  goal: string
  isAuthenticated: boolean
}

interface AuthScreenProps {
  onLogin: (profile: UserProfile) => void
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    goal: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const createUser = useMutation(api.users.createUser)
  const createUserProfile = useMutation(api.userProfiles.createUserProfile)

  const goals = [
    { value: 'lose_weight', label: 'Схуднення', icon: '🔥' },
    { value: 'gain_muscle', label: 'Набор маси', icon: '💪' },
    { value: 'maintain', label: 'Підтримка форми', icon: '⚖️' },
    { value: 'improve_endurance', label: 'Витривалість', icon: '🏃' },
    { value: 'increase_strength', label: 'Сила', icon: '🏋️' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      let userName = formData.name || formData.email.split('@')[0]
      
      // Создаем пользователя в базе данных
      const userId = await createUser({
        name: userName,
        email: formData.email,
      })

      // Создаем профиль пользователя, если указана цель
      if (formData.goal) {
        await createUserProfile({
          userId: userId,
          name: userName,
          fitnessGoal: formData.goal as any,
        })
      }
      
      const profile: UserProfile = {
        name: userName,
        email: formData.email,
        goal: formData.goal,
        isAuthenticated: true
      }
      
      onLogin(profile)
    } catch (error) {
      console.error('Error during authentication:', error)
      // В случае ошибки все равно авторизуем пользователя для демо
      const profile: UserProfile = {
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        goal: formData.goal,
        isAuthenticated: true
      }
      onLogin(profile)
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: CheckCircle, text: 'Персональні плани тренувань' },
    { icon: CheckCircle, text: 'Календар та планування' },
    { icon: CheckCircle, text: 'Відстеження прогресу' },
    { icon: CheckCircle, text: 'Детальна статистика' }
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      
      <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding & Features */}
        <div className="space-y-8 lg:pr-8">
          {/* Logo & Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border flex items-center justify-center">
                <Activity className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">
                  FitTracker Pro
                </h1>
                <p className="text-muted-foreground text-lg">Профессиональный фитнес трекер</p>
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Достигайте своих фитнес-целей с помощью персонализированных тренировок, 
              умного планирования и детального отслеживания прогресса.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-4">Возможности платформы:</h3>
            <div className="grid gap-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-muted-foreground">
                  <feature.icon className="h-5 w-5" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-sm text-muted-foreground">Пользователей</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm text-muted-foreground">Упражнений</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-muted-foreground">Поддержка</div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold">
                {isLogin ? 'Ласкаво просимо!' : 'Створити акаунт'}
              </CardTitle>
              <CardDescription>
                {isLogin 
                  ? 'Увійдіть до свого акаунту для продовження' 
                  : 'Почніть свій шлях до ідеальної форми'
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Имя
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ваше имя"
                      className="h-11"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="h-11"
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Ваша цель
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {goals.map((goal) => (
                        <button
                          key={goal.value}
                          type="button"
                          onClick={() => setFormData({...formData, goal: goal.value})}
                          className={`p-3 rounded-lg border-2 text-left ${
                            formData.goal === goal.value ? 'border-ring' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{goal.icon}</span>
                            <span className="font-medium">{goal.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={isLoading || (!isLogin && !formData.goal)} className="w-full h-11">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin"></div>
                      {isLogin ? 'Вхід...' : 'Створення акаунту...'}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {isLogin ? 'Увійти' : 'Створити акаунт'}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium"
                >
                  {isLogin 
                    ? 'Нет аккаунта? Создать' 
                    : 'Уже есть аккаунт? Войти'
                  }
                </button>
              </div>

              {isLogin && (
                <div className="text-center">
                  <Badge variant="outline" className="text-xs">
                    Демо: используйте любой email и пароль
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
