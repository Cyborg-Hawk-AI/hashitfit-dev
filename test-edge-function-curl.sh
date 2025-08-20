#!/bin/bash

# Test script for Edge Function using curl
# You'll need to replace the JWT token with a valid one from your app

echo "🧪 Testing Edge Function with curl..."

# Replace this with a valid JWT token from your app
JWT_TOKEN="YOUR_JWT_TOKEN_HERE"

# Mock assessment data
ASSESSMENT_DATA='{
  "name": "Test User Curl",
  "age": 31,
  "gender": "male",
  "height": 176,
  "weight": 77,
  "fitnessGoal": "weight_loss",
  "workoutFrequency": 3,
  "diet": "standard",
  "equipment": "minimal",
  "sportsPlayed": ["cycling"],
  "allergies": ["shellfish"]
}'

echo "📋 Assessment data:"
echo "$ASSESSMENT_DATA"

echo ""
echo "🚀 Calling Edge Function..."

# Make the request
curl -X POST "https://haxiwqgajhanpapvicbm.supabase.co/functions/v1/generate-workout-plan" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "$ASSESSMENT_DATA" \
  -w "\n⏱️  Time: %{time_total}s\n📊 Status: %{http_code}\n"

echo ""
echo "✅ Test completed!"
echo ""
echo "📝 To get a valid JWT token:"
echo "1. Open your app in the browser"
echo "2. Sign in with your account"
echo "3. Open Developer Tools (F12)"
echo "4. Go to Application > Local Storage"
echo "5. Find the JWT token in the Supabase storage"
echo "6. Replace YOUR_JWT_TOKEN_HERE with the actual token" 