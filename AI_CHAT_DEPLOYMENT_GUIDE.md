# AI Chat Function Deployment Guide

## 🚨 Current Issue
The AI chat function is not deployed, causing CORS errors. Follow these steps to deploy it.

## 🚀 Quick Deployment (Recommended)

### Option 1: Manual Deployment via Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/haxiwqgajhanpapvicbm
   - Sign in to your account

2. **Navigate to Edge Functions**
   - Click on "Edge Functions" in the left sidebar
   - Click "Create a new function"

3. **Create the Function**
   - **Name**: `ai-chat`
   - **Copy the code** from `supabase/functions/ai-chat/index.ts`
   - Paste it into the function editor

4. **Set Environment Variables**
   - Click on "Settings" tab
   - Add these environment variables:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     OPENAI_ASSISTANT_ID=your_openai_assistant_id_here
     ```

5. **Deploy**
   - Click "Deploy" button
   - Wait for deployment to complete

### Option 2: CLI Deployment (Requires Docker)

1. **Start Docker Desktop**
   - Make sure Docker is running

2. **Deploy via CLI**
   ```bash
   supabase functions deploy ai-chat
   ```

## 🔧 Environment Variables Setup

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key and add it as `OPENAI_API_KEY`

### OpenAI Assistant ID
1. Go to https://platform.openai.com/assistants
2. Create a new assistant or use an existing one
3. Copy the Assistant ID and add it as `OPENAI_ASSISTANT_ID`

## 🧪 Testing the Deployment

### Test via Supabase Dashboard
1. Go to the function details
2. Click "Invoke"
3. Use this test payload:
   ```json
   {
     "message": "Hello, can you help me with fitness advice?"
   }
   ```

### Test via Browser Console
```javascript
// Replace YOUR_ANON_KEY with your actual anon key
const response = await fetch('https://haxiwqgajhanpapvicbm.supabase.co/functions/v1/ai-chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_ANON_KEY'
  },
  body: JSON.stringify({
    message: 'Hello, can you help me with fitness advice?'
  })
});

const data = await response.json();
console.log('Response:', data);
```

## 📋 Pre-Deployment Checklist

- [ ] Database tables created (run `create_ai_chat_tables.sql`)
- [ ] OpenAI API key obtained
- [ ] OpenAI Assistant created
- [ ] Function code copied from `supabase/functions/ai-chat/index.ts`
- [ ] Environment variables set
- [ ] Function deployed successfully

## 🔍 Troubleshooting

### CORS Error (404)
- **Cause**: Function not deployed
- **Solution**: Deploy the function following the steps above

### CORS Error (NetworkError)
- **Cause**: Function not accessible
- **Solution**: Check function deployment status

### Authentication Error
- **Cause**: Missing or invalid API key
- **Solution**: Verify environment variables are set correctly

### Tool Call Errors
- **Cause**: Database tables not created
- **Solution**: Run the SQL script in Supabase dashboard

## 📞 Support

If you encounter issues:
1. Check the Supabase function logs
2. Verify all environment variables are set
3. Ensure database tables are created
4. Test with the provided test script

## 🎯 Expected Behavior

After successful deployment:
- ✅ Chat interface opens without errors
- ✅ Messages are sent successfully
- ✅ AI responds with fitness advice
- ✅ User data is accessed when relevant
- ✅ Memory system works for preferences
- ✅ Document search provides fitness knowledge
