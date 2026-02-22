#!/bin/bash

echo "🚀 NidhiOne - Setup Script"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null
then
    echo "⚠️  PostgreSQL is not installed. Please install PostgreSQL v14 or higher."
    echo "   You can install it using: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL is installed"
echo ""

# Backend Setup
echo "📦 Setting up Backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your database credentials"
fi

echo "Installing backend dependencies..."
npm install

echo ""
echo "🔄 Running Prisma migrations..."
echo "⚠️  Make sure PostgreSQL is running and database credentials are correct in .env"
read -p "Press Enter to continue or Ctrl+C to abort..."

npm run prisma:migrate
npm run prisma:generate

cd ..

# Frontend Setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

echo "Installing frontend dependencies..."
npm install

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Update backend/.env with your PostgreSQL credentials"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: cd frontend && npm run dev"
echo ""
echo "🌐 URLs:"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "Happy Coding! 🎉"
