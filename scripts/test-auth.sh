#!/bin/bash

# Test script to verify authentication and database setup
# Run this after setting up Supabase and running migrations

set -e

echo "🧪 Testing MentorQuest Authentication & Database Setup"
echo "=================================================="

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Missing required environment variables:"
    echo "   VITE_SUPABASE_URL"
    echo "   VITE_SUPABASE_ANON_KEY"
    echo ""
    echo "Please set these in your .env file"
    exit 1
fi

echo "✅ Environment variables found"

# Test database connection
echo ""
echo "🔍 Testing database connection..."

# Test if we can reach the Supabase REST API
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY" \
    -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
    "$VITE_SUPABASE_URL/rest/v1/users?select=count")

if [ "$response" = "200" ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed (HTTP $response)"
    exit 1
fi

# Test table existence
echo ""
echo "🔍 Testing table structure..."

tables=("users" "student_progress" "quiz_results" "chat_messages" "courses" "lesson_plans")

for table in "${tables[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "apikey: $VITE_SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
        "$VITE_SUPABASE_URL/rest/v1/$table?select=count&limit=1")
    
    if [ "$response" = "200" ]; then
        echo "✅ Table '$table' exists and accessible"
    else
        echo "❌ Table '$table' not accessible (HTTP $response)"
        exit 1
    fi
done

# Test demo user existence
echo ""
echo "🔍 Testing demo users..."

demo_users=("teacher@demo.com" "student@demo.com")

for email in "${demo_users[@]}"; do
    response=$(curl -s \
        -H "apikey: $VITE_SUPABASE_ANON_KEY" \
        -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
        "$VITE_SUPABASE_URL/rest/v1/users?select=email,role&email=eq.$email")
    
    if echo "$response" | grep -q "$email"; then
        role=$(echo "$response" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Demo user '$email' exists with role '$role'"
    else
        echo "⚠️  Demo user '$email' not found (run seed.sql)"
    fi
done

echo ""
echo "🎉 All tests passed! Your MentorQuest setup is ready."
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:5173"
echo "3. Try logging in with demo accounts:"
echo "   - Teacher: teacher@demo.com / demo123"
echo "   - Student: student@demo.com / demo123"
echo "4. Or create a new account to test the signup flow"