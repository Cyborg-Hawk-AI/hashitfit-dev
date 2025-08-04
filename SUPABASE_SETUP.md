
# Supabase Setup Instructions for HashimFit App

This guide provides step-by-step instructions for setting up your Supabase backend for the HashimFit fitness application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign in or create an account.
2. Create a new project by clicking "New Project".
3. Enter a project name (e.g., "hashimfit"), set a secure database password, and select a region close to your users.
4. Wait for your project to be provisioned (this may take a few minutes).

## 2. Set Up Database Schema

1. In your Supabase project dashboard, navigate to the SQL Editor.
2. Create a new query.
3. Copy the entire contents of `src/lib/supabase/schema.sql` into the SQL Editor.
4. Run the query to create all tables, indexes, relationships, and RLS policies.

## 3. Configure Authentication

1. In your Supabase dashboard, go to "Authentication" → "Providers".
2. Configure email authentication:
   - Enable "Confirm email" option for production.
   - For development, you may disable email confirmation for easier testing.
3. Customize the email templates under "Email Templates" to match your brand.
4. Set up password policies according to your security requirements.

## 4. Set Up Storage Buckets

1. Go to "Storage" in your Supabase dashboard.
2. Create the following buckets:
   - `profile-images` (for user profile pictures)
   - `meal-images` (for food/meal photos)
   - `workout-media` (for workout-related videos and images)
3. Configure bucket policies:
   - For each bucket, go to "Policies" and create RLS policies.
   - Allow authenticated users to upload their own files.
   - Allow public read access for profile images.

Example policy for profile-images:
```sql
-- Allow users to insert their own profile images
CREATE POLICY "Users can upload their own profile images"
ON storage.objects
FOR INSERT
WITH CHECK (
  auth.uid() = (storage.foldername(path))[1]::uuid
  AND bucket_id = 'profile-images'
);

-- Allow users to update/delete their own profile images
CREATE POLICY "Users can update/delete their own profile images"
ON storage.objects
FOR UPDATE, DELETE
USING (
  auth.uid() = (storage.foldername(path))[1]::uuid
  AND bucket_id = 'profile-images'
);

-- Allow public read access to profile images
CREATE POLICY "Public can view profile images"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'profile-images'
);
```

## 5. Deploy Edge Functions

1. Install the Supabase CLI if you haven't already:
   ```
   npm install -g supabase
   ```
2. Log in to Supabase CLI:
   ```
   supabase login
   ```
3. Link your project:
   ```
   supabase link --project-ref YOUR_PROJECT_REF
   ```
4. Create edge functions directory structure:
   ```
   mkdir -p supabase/functions/ai-chat
   mkdir -p supabase/functions/generate-workout
   ```
5. Copy the edge function templates to the appropriate directories:
   ```
   # Copy the content from src/lib/supabase/edge-function-templates/ai-chat.txt
   # to supabase/functions/ai-chat/index.ts
   
   # Copy the content from src/lib/supabase/edge-function-templates/generate-workout.txt
   # to supabase/functions/generate-workout/index.ts
   ```
6. Deploy the functions:
   ```
   supabase functions deploy ai-chat
   supabase functions deploy generate-workout
   ```

## 6. Add Secrets to Edge Functions

1. In your Supabase dashboard, go to "Settings" → "API".
2. Scroll down to "Project API keys" and copy your project's URL and anon key.
3. Use the Supabase CLI to add secrets to your edge functions:
   ```
   supabase secrets set OPENAI_API_KEY=your_openai_api_key
   ```
4. Add any other required secrets for third-party services (e.g., Stripe, email services, etc.).

## 7. Connect Your Frontend

Update your `src/lib/supabase.ts` file with your Supabase project URL and anon key:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = "https://your-project-ref.supabase.co";
export const supabaseAnonKey = "your-anon-key";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
```

## 8. Testing the Integration

1. Run your frontend application locally.
2. Test user signup and login functionality.
3. Verify that user profiles are created automatically upon signup.
4. Test data fetching and saving with various features:
   - Profile updates
   - Workout creation
   - Logging workouts
   - Tracking nutrition
   - Chat with AI assistant

## 9. Monitoring and Maintenance

1. In the Supabase dashboard, you can monitor:
   - Database usage under "Database"
   - Storage usage under "Storage"
   - Authentication events under "Authentication" → "Users"
   - Edge function logs under "Edge Functions"
2. Set up backup schedules for your database to prevent data loss.
3. Monitor API usage to optimize performance and manage costs.

## 10. Additional Security Considerations

1. Always use parameterized queries to prevent SQL injection.
2. Keep your Supabase keys secure and never expose them in client-side code.
3. Regularly audit and update your RLS policies as your application evolves.
4. Consider implementing additional authentication factors for sensitive operations.

## Troubleshooting

- If you encounter errors in your client application, check the browser console for detailed errors.
- For database issues, check the SQL query logs in the Supabase dashboard.
- For authentication issues, verify your RLS policies and ensure users have the necessary permissions.
- For edge function errors, check the logs in the Supabase dashboard under "Edge Functions".

## Need Help?

- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord Community: [https://discord.supabase.com](https://discord.supabase.com)
- GitHub Issues: [https://github.com/supabase/supabase/issues](https://github.com/supabase/supabase/issues)
