# Docker Deployment Guide

Инструкция по развертыванию Fitness Tracking App с использованием Docker Compose.

## Предварительные требования

- Docker Desktop установлен и запущен
- Активный проект Convex с настроенным развертыванием
- Доступ к интернету для загрузки Convex API

## Быстрый старт

1. **Клонирование и настройка переменных окружения:**
   ```bash
   # Скопируйте пример конфигурации
   cp env.example .env
   
   # Отредактируйте .env файл с вашими реальными значениями
   nano .env
   ```

2. **Запуск приложения:**
   ```bash
   # Используйте готовый скрипт
   chmod +x docker-deploy.sh
   ./docker-deploy.sh
   
   # Или запустите вручную
   docker-compose up -d
   ```

3. **Проверка работы:**
   ```bash
   # Проверить статус сервисов
   docker-compose ps
   
   # Посмотреть логи
   docker-compose logs -f
   
   # Проверить health check
   curl http://localhost/health
   ```

## Конфигурация

### Переменные окружения

Создайте `.env` файл на основе `env.example`:

```env
# Обязательные переменные
VITE_CONVEX_URL=https://your-deployment-name.convex.cloud
CONVEX_SITE_URL=http://localhost:3000

# Опциональные
NODE_ENV=production
CUSTOM_DOMAIN=your-domain.com
```

**Как получить CONVEX_URL:**
1. Перейдите в [Convex Dashboard](https://dashboard.convex.dev)
2. Выберите ваш проект
3. Скопируйте URL развертывания

### Порты

- **80** - HTTP доступ к приложению
- **443** - HTTPS (если настроен SSL)

## Структура проекта

```
fitness-tracking-app/
├── Dockerfile              # Конфигурация контейнера
├── docker-compose.yml      # Определение сервисов
├── nginx.conf              # Конфигурация веб-сервера
├── .dockerignore           # Игнорируемые файлы
├── env.example             # Пример переменных окружения
└── docker-deploy.sh        # Скрипт развертывания
```

## Основные команды

### Управление сервисами
```bash
# Запуск в фоновом режиме
docker-compose up -d

# Запуск с выводом логов
docker-compose up

# Остановка сервисов
docker-compose down

# Перезапуск сервисов
docker-compose restart

# Пересборка образов
docker-compose build --no-cache
```

### Мониторинг
```bash
# Просмотр статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f frontend

# Проверка ресурсов
docker stats
```

### Отладка
```bash
# Вход в контейнер
docker-compose exec frontend sh

# Проверка конфигурации nginx
docker-compose exec frontend nginx -t

# Перезагрузка nginx
docker-compose exec frontend nginx -s reload
```

## Производственное развертывание

### SSL/HTTPS

Для включения HTTPS раскомментируйте секцию `nginx-proxy` в `docker-compose.yml`:

```yaml
nginx-proxy:
  image: nginxproxy/nginx-proxy:latest
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /var/run/docker.sock:/tmp/docker.sock:ro
    - certs:/etc/nginx/certs
    - vhost:/etc/nginx/vhost.d
    - html:/usr/share/nginx/html
```

### Мониторинг

Добавьте сервис мониторинга:

```yaml
# Добавить в docker-compose.yml
monitoring:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

### Backup

```bash
# Создание резервной копии конфигурации
tar -czf backup-$(date +%Y%m%d).tar.gz .env docker-compose.yml nginx.conf

# Восстановление
tar -xzf backup-YYYYMMDD.tar.gz
```

## Решение проблем

### Проблема: Приложение не запускается

1. **Проверьте переменные окружения:**
   ```bash
   cat .env
   ```

2. **Проверьте логи:**
   ```bash
   docker-compose logs frontend
   ```

3. **Проверьте доступность Convex:**
   ```bash
   curl -I $VITE_CONVEX_URL
   ```

### Проблема: Ошибка сборки

1. **Очистите Docker кеш:**
   ```bash
   docker system prune -a
   ```

2. **Пересоберите образ:**
   ```bash
   docker-compose build --no-cache
   ```

### Проблема: Медленная работа

1. **Проверьте ресурсы:**
   ```bash
   docker stats
   ```

2. **Увеличьте лимиты в docker-compose.yml:**
   ```yaml
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

## Безопасность

### Основные меры:
- Используйте `.env` файл для секретов
- Не коммитьте `.env` в git
- Настройте HTTPS для продакшна
- Регулярно обновляйте Docker образы

### Security headers:
Конфигурация nginx включает:
- CSP (Content Security Policy)
- X-Frame-Options
- X-Content-Type-Options
- Rate limiting

## Дополнительные ресурсы

- [Convex Documentation](https://docs.convex.dev)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)

## Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус: `docker-compose ps`
3. Проверьте конфигурацию Convex
4. Создайте issue в репозитории проекта 