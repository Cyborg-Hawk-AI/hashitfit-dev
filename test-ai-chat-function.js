
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
