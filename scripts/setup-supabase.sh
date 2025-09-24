#!/bin/bash

# Setup script for MentorQuest Supabase configuration
# This script helps set up the database schema and seed data

set -e

echo "🚀 Setting up MentorQuest with Supabase"
echo "======================================"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please create a .env file with your Supabase credentials:"
    echo "VITE_SUPABASE_URL=your_supabase_project_url"
    echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key"
    exit 1
fi

# Source environment variables
source .env

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Missing required environment variables in .env file"
    exit 1
fi

echo "✅ Environment variables loaded"

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client tools."
    echo ""
    echo "On macOS: brew install postgresql"
    echo "On Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

echo "✅ PostgreSQL client found"

# Extract database URL from Supabase URL
DB_URL="${VITE_SUPABASE_URL/https:\/\//postgresql://postgres:[password]@}"
DB_URL="${DB_URL/supabase.co/supabase.co:5432/postgres}"

echo ""
echo "🔧 Running database migrations..."
echo "Note: You'll need to enter your Supabase database password"
echo ""

# Run the migration
if psql "$DB_URL" -f supabase/migrations/001_fix_auth_and_schema.sql; then
    echo "✅ Migration completed successfully"
else
    echo "❌ Migration failed"
    echo ""
    echo "Please check:"
    echo "1. Your Supabase database password is correct"
    echo "2. Your Supabase project is active"
    echo "3. You have the correct database URL"
    exit 1
fi

echo ""
echo "🌱 Running seed data..."

# Run the seed
if psql "$DB_URL" -f supabase/seed.sql; then
    echo "✅ Seed data inserted successfully"
else
    echo "❌ Seed data insertion failed"
    exit 1
fi

echo ""
echo "🧪 Running tests..."

# Run the test script
if bash scripts/test-auth.sh; then
    echo "✅ All tests passed"
else
    echo "❌ Some tests failed"
    exit 1
fi

echo ""
echo "🎉 MentorQuest setup complete!"
echo ""
echo "Your app is ready to use:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:5173"
echo "3. Use demo accounts:"
echo "   - Teacher: teacher@demo.com / demo123"
echo "   - Student: student@demo.com / demo123"
echo ""
echo "Happy learning! 🎓"