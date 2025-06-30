# Fitness Tracking App

A modern fitness tracking application built with React and Convex.

## Features

- Track workouts and fitness activities
- View statistics and progress
- User authentication
- Real-time data synchronization

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite
- **Backend:** Convex (Backend-as-a-Service)
- **Deployment:** Docker, Docker Compose
- **Web Server:** Nginx

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fitness-tracking-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Convex:**
   ```bash
   npm run setup
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Docker Deployment

### Quick Start

1. **Configure environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your Convex settings
   ```

2. **Deploy with Docker Compose:**
   ```bash
   # Using the deployment script
   chmod +x docker-deploy.sh
   ./docker-deploy.sh
   
   # Or manually
   docker-compose up -d
   ```

3. **Access the application:**
   - Main app: http://localhost:3000
   - Health check: http://localhost:3000/health

### Configuration

The application uses environment variables for configuration:

```env
# Required
VITE_CONVEX_URL=https://your-deployment-name.convex.cloud
CONVEX_SITE_URL=http://localhost:3000

# Optional
HTTP_PORT=3000
HTTPS_PORT=3443
NODE_ENV=production
```

### Docker Commands

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache
```

## Production Deployment

For production environments, use the production Docker Compose configuration:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Features:
- Optimized nginx configuration
- Health checks
- Security headers
- Gzip compression
- Static file caching

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your License]
