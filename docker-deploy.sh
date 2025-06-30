#!/bin/bash

# Docker deployment script for Fitness Tracking App

set -e

echo "🏃‍♂️ Starting Fitness Tracking App deployment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "📝 Please create .env file based on env.example"
    echo "   cp env.example .env"
    echo "   # Then edit .env with your actual Convex values"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "🐳 Please start Docker Desktop and try again"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$VITE_CONVEX_URL" ]; then
    echo "❌ VITE_CONVEX_URL is not set in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 Application is running at: http://localhost:3000"
    echo "📊 Health check: http://localhost:3000/health"
    echo ""
    echo "📋 Useful commands:"
    echo "   docker-compose logs -f         # View logs"
    echo "   docker-compose down            # Stop services"
    echo "   docker-compose restart         # Restart services"
    echo "   docker-compose ps              # Check status"
else
    echo "❌ Deployment failed!"
    echo "📋 Check logs with: docker-compose logs"
    exit 1
fi 