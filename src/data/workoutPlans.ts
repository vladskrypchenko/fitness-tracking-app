export interface WorkoutStep {
  id: number;
  name: string;
  description: string;
  duration?: string;
  reps?: string;
  sets?: number;
  restTime?: string;
  tips?: string[];
}

export interface WorkoutPlan {
  id: string;
  type: 'cardio' | 'strength' | 'stretching';
  name: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  steps: WorkoutStep[];
}

export const workoutPlans: WorkoutPlan[] = [
  // Cardio Plans
  {
    id: 'cardio-hiit-beginner',
    type: 'cardio',
    name: 'HIIT для початківців',
    description: 'Високоінтенсивне інтервальне тренування для новачків',
    duration: '20 хвилин',
    difficulty: 'beginner',
    equipment: ['Килимок'],
    steps: [
      {
        id: 1,
        name: 'Разминка',
        description: 'Легкая разминка для подготовки тела',
        duration: '3 минуты',
        tips: ['Двигайтесь плавно', 'Разогрейте все суставы']
      },
      {
        id: 2,
        name: 'Прыжки на месте',
        description: 'Энергичные прыжки с разведением рук и ног',
        duration: '30 секунд',
        restTime: '30 секунд',
        tips: ['Приземляйтесь на носки', 'Держите спину прямо']
      },
      {
        id: 3,
        name: 'Приседания',
        description: 'Классические приседания с собственным весом',
        reps: '10-15 раз',
        restTime: '30 секунд',
        tips: ['Колени не выходят за носки', 'Спина прямая']
      },
      {
        id: 4,
        name: 'Отжимания от колен',
        description: 'Отжимания с упором на колени',
        reps: '8-12 раз',
        restTime: '30 секунд',
        tips: ['Тело в одной линии', 'Контролируйте движение']
      },
      {
        id: 5,
        name: 'Планка',
        description: 'Статическое упражнение для кора',
        duration: '20-30 секунд',
        restTime: '30 секунд',
        tips: ['Тело прямое', 'Дышите равномерно']
      },
      {
        id: 6,
        name: 'Повтор цикла',
        description: 'Повторите упражнения 2-4 еще 2 раза',
        duration: '10 минут',
        tips: ['Отдыхайте между циклами 1-2 минуты']
      },
      {
        id: 7,
        name: 'Заминка',
        description: 'Легкая растяжка и восстановление дыхания',
        duration: '3 минуты',
        tips: ['Дышите глубоко', 'Растягивайте основные группы мышц']
      }
    ]
  },
  {
    id: 'cardio-running',
    type: 'cardio',
    name: 'Інтервальний біг',
    description: 'Кардіо тренування з чергуванням темпу',
    duration: '30 хвилин',
    difficulty: 'intermediate',
    equipment: ['Бігова доріжка або вулиця'],
    steps: [
      {
        id: 1,
        name: 'Разминка ходьбой',
        description: 'Легкая ходьба для разогрева',
        duration: '5 минут',
        tips: ['Постепенно увеличивайте темп']
      },
      {
        id: 2,
        name: 'Легкий бег',
        description: 'Бег в комфортном темпе',
        duration: '3 минуты',
        tips: ['Дышите ритмично', 'Не торопитесь']
      },
      {
        id: 3,
        name: 'Интенсивный бег',
        description: 'Бег в быстром темпе',
        duration: '1 минута',
        tips: ['Выкладывайтесь на 80%', 'Контролируйте дыхание']
      },
      {
        id: 4,
        name: 'Восстановление',
        description: 'Легкий бег или быстрая ходьба',
        duration: '2 минуты',
        tips: ['Восстановите дыхание']
      },
      {
        id: 5,
        name: 'Повтор интервалов',
        description: 'Повторите шаги 3-4 еще 5 раз',
        duration: '15 минут',
        tips: ['Следите за пульсом']
      },
      {
        id: 6,
        name: 'Заминка',
        description: 'Постепенное снижение темпа до ходьбы',
        duration: '5 минут',
        tips: ['Не останавливайтесь резко']
      }
    ]
  },

  // Strength Plans
  {
    id: 'strength-upper-body',
    type: 'strength',
    name: 'Верх тіла',
    description: 'Силове тренування для м\'язів верхньої частини тіла',
    duration: '45 хвилин',
    difficulty: 'intermediate',
    equipment: ['Гантелі', 'Килимок'],
    steps: [
      {
        id: 1,
        name: 'Разминка',
        description: 'Разогрев суставов и мышц',
        duration: '5 минут',
        tips: ['Круговые движения руками', 'Наклоны и повороты']
      },
      {
        id: 2,
        name: 'Отжимания',
        description: 'Классические отжимания от пола',
        sets: 3,
        reps: '8-12 раз',
        restTime: '60 секунд',
        tips: ['Тело в одной линии', 'Полная амплитуда движения']
      },
      {
        id: 3,
        name: 'Жим гантелей лежа',
        description: 'Жим гантелей на горизонтальной поверхности',
        sets: 3,
        reps: '10-12 раз',
        restTime: '90 секунд',
        tips: ['Контролируйте вес', 'Не блокируйте локти полностью']
      },
      {
        id: 4,
        name: 'Тяга гантелей в наклоне',
        description: 'Тяга гантелей к поясу в наклоне',
        sets: 3,
        reps: '10-12 раз',
        restTime: '90 секунд',
        tips: ['Спина прямая', 'Сводите лопатки']
      },
      {
        id: 5,
        name: 'Жим гантелей стоя',
        description: 'Жим гантелей над головой',
        sets: 3,
        reps: '8-10 раз',
        restTime: '90 секунд',
        tips: ['Не прогибайте поясницу', 'Контролируйте движение']
      },
      {
        id: 6,
        name: 'Подъемы на бицепс',
        description: 'Сгибание рук с гантелями',
        sets: 3,
        reps: '12-15 раз',
        restTime: '60 секунд',
        tips: ['Локти прижаты к телу', 'Не раскачивайтесь']
      },
      {
        id: 7,
        name: 'Планка',
        description: 'Статическое упражнение для кора',
        sets: 3,
        duration: '30-60 секунд',
        restTime: '60 секунд',
        tips: ['Тело прямое', 'Напрягите пресс']
      },
      {
        id: 8,
        name: 'Заминка',
        description: 'Растяжка проработанных мышц',
        duration: '5 минут',
        tips: ['Растягивайте каждую группу мышц 30 секунд']
      }
    ]
  },
  {
    id: 'strength-full-body',
    type: 'strength',
    name: 'Все тіло',
    description: 'Комплексне силове тренування на всі групи м\'язів',
    duration: '50 хвилин',
    difficulty: 'intermediate',
    equipment: ['Гантелі', 'Килимок'],
    steps: [
      {
        id: 1,
        name: 'Разминка',
        description: 'Общий разогрев всего тела',
        duration: '5 минут',
        tips: ['Суставная гимнастика', 'Легкие кардио движения']
      },
      {
        id: 2,
        name: 'Приседания с гантелями',
        description: 'Приседания с отягощением',
        sets: 3,
        reps: '12-15 раз',
        restTime: '90 секунд',
        tips: ['Колени в направлении носков', 'Полная амплитуда']
      },
      {
        id: 3,
        name: 'Становая тяга',
        description: 'Становая тяга с гантелями',
        sets: 3,
        reps: '10-12 раз',
        restTime: '90 секунд',
        tips: ['Спина прямая', 'Движение от бедер']
      },
      {
        id: 4,
        name: 'Отжимания',
        description: 'Отжимания от пола',
        sets: 3,
        reps: '8-12 раз',
        restTime: '60 секунд',
        tips: ['Тело в линию', 'Контролируйте опускание']
      },
      {
        id: 5,
        name: 'Выпады',
        description: 'Выпады с гантелями',
        sets: 3,
        reps: '10 раз на каждую ногу',
        restTime: '90 секунд',
        tips: ['Колено не касается пола', 'Держите равновесие']
      },
      {
        id: 6,
        name: 'Жим гантелей стоя',
        description: 'Жим над головой',
        sets: 3,
        reps: '8-10 раз',
        restTime: '90 секунд',
        tips: ['Корпус стабилен', 'Полная амплитуда']
      },
      {
        id: 7,
        name: 'Планка',
        description: 'Статическое упражнение',
        sets: 3,
        duration: '45-60 секунд',
        restTime: '60 секунд',
        tips: ['Все тело напряжено', 'Дышите равномерно']
      },
      {
        id: 8,
        name: 'Заминка',
        description: 'Растяжка всех групп мышц',
        duration: '5 минут',
        tips: ['Задерживайтесь в каждой позе 30 секунд']
      }
    ]
  },

  // Stretching Plans
  {
    id: 'stretching-morning',
    type: 'stretching',
    name: 'Ранкова розтяжка',
    description: 'М\'яка розтяжка для пробудження тіла',
    duration: '15 хвилин',
    difficulty: 'beginner',
    equipment: ['Килимок'],
    steps: [
      {
        id: 1,
        name: 'Потягивания',
        description: 'Потянитесь всем телом лежа на спине',
        duration: '30 секунд',
        tips: ['Тянитесь руками вверх, ногами вниз']
      },
      {
        id: 2,
        name: 'Колени к груди',
        description: 'Подтяните колени к груди лежа',
        duration: '30 секунд',
        tips: ['Обнимите колени руками', 'Расслабьте поясницу']
      },
      {
        id: 3,
        name: 'Скручивания позвоночника',
        description: 'Мягкие повороты лежа на спине',
        duration: '1 минута',
        tips: ['По 30 секунд в каждую сторону', 'Плечи на полу']
      },
      {
        id: 4,
        name: 'Поза ребенка',
        description: 'Сядьте на пятки, наклонитесь вперед',
        duration: '1 минута',
        tips: ['Руки вытянуты вперед', 'Расслабьте спину']
      },
      {
        id: 5,
        name: 'Кошка-корова',
        description: 'Прогибы и округления спины на четвереньках',
        duration: '1 минута',
        tips: ['Медленные плавные движения', 'Дышите с движением']
      },
      {
        id: 6,
        name: 'Растяжка бедер',
        description: 'Выпад с растяжкой передней поверхности бедра',
        duration: '1 минута',
        tips: ['По 30 секунд на каждую ногу', 'Держите равновесие']
      },
      {
        id: 7,
        name: 'Наклоны вперед сидя',
        description: 'Наклон к ногам сидя',
        duration: '1 минута',
        tips: ['Не округляйте спину', 'Тянитесь грудью к ногам']
      },
      {
        id: 8,
        name: 'Растяжка шеи',
        description: 'Мягкие наклоны и повороты головы',
        duration: '1 минута',
        tips: ['Медленные движения', 'Не делайте резких движений']
      },
      {
        id: 9,
        name: 'Растяжка плеч',
        description: 'Растяжка плечевого пояса',
        duration: '1 минута',
        tips: ['Тяните руку через грудь', 'По 30 секунд каждую руку']
      },
      {
        id: 10,
        name: 'Финальное расслабление',
        description: 'Лежа на спине, полное расслабление',
        duration: '2 минуты',
        tips: ['Закройте глаза', 'Дышите глубоко и спокойно']
      }
    ]
  },
  {
    id: 'stretching-evening',
    type: 'stretching',
    name: 'Вечірня розтяжка',
    description: 'Розслаблююча розтяжка перед сном',
    duration: '20 хвилин',
    difficulty: 'beginner',
    equipment: ['Килимок'],
    steps: [
      {
        id: 1,
        name: 'Дыхательная практика',
        description: 'Глубокое дыхание для расслабления',
        duration: '2 минуты',
        tips: ['Вдох 4 счета, выдох 6 счетов', 'Дышите животом']
      },
      {
        id: 2,
        name: 'Растяжка шеи и плеч',
        description: 'Снятие напряжения с верхней части тела',
        duration: '2 минуты',
        tips: ['Медленные круговые движения', 'Расслабьте челюсть']
      },
      {
        id: 3,
        name: 'Скручивания сидя',
        description: 'Повороты позвоночника сидя',
        duration: '2 минуты',
        tips: ['По минуте в каждую сторону', 'Дышите в скручивании']
      },
      {
        id: 4,
        name: 'Наклон вперед',
        description: 'Глубокий наклон к ногам',
        duration: '2 минуты',
        tips: ['Расслабьте спину', 'Не тянитесь силой']
      },
      {
        id: 5,
        name: 'Поза голубя',
        description: 'Растяжка бедер и ягодиц',
        duration: '3 минуты',
        tips: ['По 1.5 минуты на каждую сторону', 'Дышите глубоко']
      },
      {
        id: 6,
        name: 'Скручивание лежа',
        description: 'Мягкие повороты позвоночника лежа',
        duration: '2 минуты',
        tips: ['Колени в одну сторону, голова в другую']
      },
      {
        id: 7,
        name: 'Ноги на стену',
        description: 'Лежа с поднятыми ногами',
        duration: '3 минуты',
        tips: ['Руки расслаблены', 'Закройте глаза']
      },
      {
        id: 8,
        name: 'Шавасана',
        description: 'Полное расслабление тела',
        duration: '4 минуты',
        tips: ['Расслабьте каждую часть тела', 'Очистите разум']
      }
    ]
  }
];

export function getWorkoutPlan(type: 'cardio' | 'strength' | 'stretching', goal?: string): WorkoutPlan {
  const plansForType = workoutPlans.filter(plan => plan.type === type);
  
  if (plansForType.length === 0) {
    throw new Error(`No workout plans found for type: ${type}`);
  }
  
  return plansForType[0];
}

export function getAllWorkoutPlans(): WorkoutPlan[] {
  return workoutPlans;
}
