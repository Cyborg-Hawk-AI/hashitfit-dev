// Manual deployment script for AI Chat function
import fs from 'fs';
import path from 'path';

console.log('🚀 Deploying AI Chat Function...\n');

// Check if the function file exists
const functionPath = 'supabase/functions/ai-chat/index.ts';
if (!fs.existsSync(functionPath)) {
  console.error('❌ Function file not found:', functionPath);
  process.exit(1);
}

console.log('✅ Function file found');

// Read the function content
const functionContent = fs.readFileSync(functionPath, 'utf8');

// Check for required imports and features
const requiredFeatures = [
  'serve',
  'createClient',
  'corsHeaders',
  'search_memory',
  'write_memory',
  'get_user_data',
  'search_documents',
  'tools',
  'OpenAI-Beta',
  'assistants=v1'
];

console.log('\n🔍 Checking function implementation:');
requiredFeatures.forEach(feature => {
  const hasFeature = functionContent.includes(feature);
  console.log(`  ${hasFeature ? '✅' : '❌'} ${feature}`);
});

console.log('\n📋 Manual Deployment Instructions:');
console.log('Since Docker is not available, please follow these steps:');
console.log('');
console.log('1. Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard/project/haxiwqgajhanpapvicbm');
console.log('');
console.log('2. Navigate to Edge Functions:');
console.log('   Dashboard → Edge Functions');
console.log('');
console.log('3. Create a new function:');
console.log('   - Click "Create a new function"');
console.log('   - Name: ai-chat');
console.log('   - Copy the content from: supabase/functions/ai-chat/index.ts');
console.log('');
console.log('4. Set Environment Variables:');
console.log('   - OPENAI_API_KEY: Your OpenAI API key');
console.log('   - OPENAI_ASSISTANT_ID: Your OpenAI Assistant ID');
console.log('');
console.log('5. Deploy the function');
console.log('');
console.log('6. Test the function:');
console.log('   - Go to the function details');
console.log('   - Click "Invoke" to test');
console.log('   - Use this test payload:');
console.log('     { "message": "Hello, can you help me with fitness advice?" }');
console.log('');

// Create a test script for after deployment
const testScript = `
// Test script for AI Chat function
const testFunction = async () => {
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
};

testFunction();
`;

fs.writeFileSync('test-ai-chat-function.js', testScript);
console.log('✅ Created test script: test-ai-chat-function.js');

console.log('\n🔧 Alternative: Use Supabase CLI with Docker');
console.log('If you can start Docker Desktop:');
console.log('1. Start Docker Desktop');
console.log('2. Run: supabase functions deploy ai-chat');
console.log('');

console.log('📝 Function Content Preview:');
console.log('First 500 characters of the function:');
console.log(functionContent.substring(0, 500) + '...');
console.log('');
console.log('Full function content is in: supabase/functions/ai-chat/index.ts');
