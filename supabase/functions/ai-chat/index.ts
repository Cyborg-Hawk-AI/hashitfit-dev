import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tool definitions for the AI assistant
const tools = [
  {
    type: "function",
    function: {
      name: "search_memory",
      description: "Retrieve top-K durable memories for the user (facts, notes, summaries, preferences)",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          k: { type: "integer", minimum: 1, maximum: 10, default: 5 }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "write_memory",
      description: "Persist durable user memory",
      parameters: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["fact", "preference", "summary", "note"] },
          content: { type: "string" },
          importance: { type: "integer", minimum: 1, maximum: 5, default: 1 }
        },
        required: ["kind", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_user_data",
      description: "Fetch relevant rows from one or more registered data sources in Supabase",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          time_range: {
            type: "object",
            properties: {
              from: { type: "string" },
              to: { type: "string" }
            }
          },
          source_keys: {
            type: "array",
            items: { type: "string" },
            minItems: 0
          },
          limit: { type: "integer", minimum: 1, maximum: 200, default: 50 }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_documents",
      description: "Semantic retrieval from fitness documents and guides",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string" },
          k: { type: "integer", default: 5 }
        },
        required: ["query"]
      }
    }
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    // Get environment variables with fallback to hardcoded values
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://haxiwqgajhanpapvicbm.supabase.co'
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhheGl3cWdhamhhbnBhcHZpY2JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyMDQ2MjQsImV4cCI6MjA1ODc4MDYyNH0.VLmhGBlkRWMcaJ5WwxPYdPIA_LOU49ECWd6Nrh_teiI'
    
    console.log('Using Supabase URL:', supabaseUrl)
    console.log('Using Supabase Anon Key:', supabaseAnonKey.substring(0, 20) + '...')

    // Extract JWT token from Authorization header
    const token = authHeader.replace('Bearer ', '')
    console.log('JWT Token received:', token.substring(0, 20) + '...')

    // Decode JWT to get user ID (this is safe as JWT is signed)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const userId = payload.sub
    console.log('Extracted user ID from JWT:', userId)
    
    if (!userId) {
      throw new Error('No user ID found in JWT')
    }

    // Create Supabase client with the JWT token
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verify the user exists by trying to fetch their profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('id, name')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      throw new Error(`User verification failed: ${profileError.message}`)
    }

    if (!profile) {
      throw new Error('User profile not found')
    }

    console.log(`Successfully verified user: ${profile.name} (${userId})`)

    // Get the request body
    const { message, stream = false } = await req.json()
    
    // Get API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    
    if (!openaiApiKey) {
      console.log('No OpenAI API key found, using fallback response')
      // Return a fallback response instead of error
      return new Response(
        JSON.stringify({
          message: "I'm currently being set up with advanced AI capabilities. For now, here's some great fitness advice: Focus on compound movements like squats, deadlifts, and bench press. Aim for 3-4 workouts per week and prioritize consistency over intensity. Remember to stay hydrated and get adequate sleep for optimal recovery!"
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    console.log(`Processing message for user ${userId}`)

    // Get or create thread for this user
    let threadId = null
    
    const { data: threadData } = await supabaseClient
      .from('user_assistant_threads')
      .select('thread_id')
      .eq('user_id', userId)
      .single()
    
    if (threadData?.thread_id) {
      threadId = threadData.thread_id
      console.log(`Using existing thread: ${threadId}`)
    } else {
      // Create a new thread
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v1'
        },
        body: JSON.stringify({})
      })
      
      if (!threadResponse.ok) {
        const errorText = await threadResponse.text()
        throw new Error(`Failed to create thread: ${errorText}`)
      }
      
      const threadResult = await threadResponse.json()
      threadId = threadResult.id
      console.log(`Created new thread: ${threadId}`)
      
      // Save the thread ID for this user
      await supabaseClient
        .from('user_assistant_threads')
        .insert({
          user_id: userId,
          thread_id: threadId,
          created_at: new Date().toISOString()
        })
    }

    // Add the user message to the thread
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        role: 'user',
        content: message
      })
    })
    
    if (!messageResponse.ok) {
      const errorText = await messageResponse.text()
      throw new Error(`Failed to add message to thread: ${errorText}`)
    }

    // Create a run with tools
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        assistant_id: Deno.env.get('OPENAI_ASSISTANT_ID'),
        instructions: `You are a helpful AI fitness assistant. You have access to the user's fitness data, memories, and fitness knowledge base. 

Key behaviors:
- Be concise, helpful, and precise with units/dates
- Avoid medical claims; provide general wellness guidance only
- Use tools to retrieve relevant user data when asked
- Maintain context from previous conversations
- Respect privacy and never expose raw PII unless explicitly requested

Use the tools to provide personalized, data-driven fitness advice.`,
        tools: tools
      })
    })
    
    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      throw new Error(`Failed to run assistant: ${errorText}`)
    }
    
    const runResult = await runResponse.json()
    const runId = runResult.id
    
    // Wait for the run to complete and handle tool calls
    let runStatus = runResult.status
    let attempts = 0
    const maxAttempts = 60
    
    while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const runCheckResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'OpenAI-Beta': 'assistants=v1'
        }
      })
      
      if (!runCheckResponse.ok) {
        const errorText = await runCheckResponse.text()
        throw new Error(`Failed to check run status: ${errorText}`)
      }
      
      const runCheckResult = await runCheckResponse.json()
      runStatus = runCheckResult.status
      console.log(`Run status: ${runStatus}`)
      
      // Handle tool calls if the run requires action
      if (runStatus === 'requires_action' && runCheckResult.required_action?.type === 'submit_tool_outputs') {
        const toolCalls = runCheckResult.required_action.submit_tool_outputs.tool_calls
        const toolOutputs = []
        
        for (const toolCall of toolCalls) {
          const functionName = toolCall.function.name
          const functionArgs = JSON.parse(toolCall.function.arguments)
          
          try {
            let result
            switch (functionName) {
              case 'search_memory':
                result = await searchMemory(supabaseClient, userId, functionArgs.query, functionArgs.k)
                break
              case 'write_memory':
                result = await writeMemory(supabaseClient, userId, functionArgs.kind, functionArgs.content, functionArgs.importance)
                break
              case 'get_user_data':
                result = await getUserData(supabaseClient, userId, functionArgs.query, functionArgs.time_range, functionArgs.source_keys, functionArgs.limit)
                break
              case 'search_documents':
                result = await searchDocuments(supabaseClient, functionArgs.query, functionArgs.k)
                break
              default:
                result = { error: `Unknown function: ${functionName}` }
            }
            
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: JSON.stringify(result)
            })
          } catch (error) {
            console.error(`Error executing tool ${functionName}:`, error)
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: JSON.stringify({ error: error.message })
            })
          }
        }
        
        // Submit tool outputs
        const submitResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v1'
          },
          body: JSON.stringify({
            tool_outputs: toolOutputs
          })
        })
        
        if (!submitResponse.ok) {
          const errorText = await submitResponse.text()
          throw new Error(`Failed to submit tool outputs: ${errorText}`)
        }
        
        // Reset run status to continue
        runStatus = 'queued'
      }
      
      attempts++
    }
    
    if (runStatus !== 'completed') {
      throw new Error(`Run did not complete in time: ${runStatus}`)
    }
    
    // Retrieve the assistant's messages
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages?limit=1`, {
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'OpenAI-Beta': 'assistants=v1'
      }
    })
    
    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text()
      throw new Error(`Failed to retrieve messages: ${errorText}`)
    }
    
    const messagesResult = await messagesResponse.json()
    const assistantMessage = messagesResult.data.find(m => m.role === 'assistant')
    
    if (!assistantMessage) {
      throw new Error('No assistant message found')
    }
    
    const assistantResponse = assistantMessage.content[0].text.value
    
    // Log the chat message to the database
    const { data: userMessageData, error: userMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        user_id: userId,
        content: message,
        role: 'user',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (userMessageError) throw userMessageError
    
    // Log the AI response
    const { data: aiMessageData, error: aiMessageError } = await supabaseClient
      .from('chat_messages')
      .insert({
        user_id: userId,
        content: assistantResponse,
        role: 'assistant',
        created_at: new Date().toISOString(),
        thread_id: threadId,
        run_id: runId
      })
      .select()
      .single()
    
    if (aiMessageError) throw aiMessageError

    return new Response(
      JSON.stringify({
        message: assistantResponse,
        thread_id: threadId,
        run_id: runId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in AI chat function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

// Tool implementation functions

async function searchMemory(supabaseClient: any, userId: string, query: string, k: number = 5) {
  const { data, error } = await supabaseClient
    .from('user_memories')
    .select('id, kind, content, importance')
    .eq('user_id', userId)
    .or(`content.ilike.%${query}%,content.ilike.%${query.split(' ').join('%')}%`)
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(k)

  if (error) throw error

  return {
    items: data.map((memory: any) => ({
      id: memory.id,
      kind: memory.kind,
      content: memory.content,
      score: memory.importance / 5
    }))
  }
}

async function writeMemory(supabaseClient: any, userId: string, kind: string, content: string, importance: number = 1) {
  const { data, error } = await supabaseClient
    .from('user_memories')
    .insert({
      user_id: userId,
      kind,
      content,
      importance: Math.max(1, Math.min(5, importance))
    })
    .select('id, created_at')
    .single()

  if (error) throw error

  return {
    id: data.id,
    created_at: data.created_at
  }
}

async function getUserData(supabaseClient: any, userId: string, query: string, timeRange?: any, sourceKeys?: string[], limit: number = 50) {
  // Get available data sources
  const { data: sources, error: sourcesError } = await supabaseClient
    .from('data_source_registry')
    .select('*')
    .eq('is_active', true)
    .in('key', sourceKeys || ['profiles', 'progress_metrics', 'workout_logs', 'exercise_logs', 'nutrition_logs', 'meal_logs', 'fitness_assessments'])

  if (sourcesError) throw sourcesError

  const results: Array<{ key: string; rows: any[] }> = []

  for (const source of sources) {
    try {
      let queryBuilder = supabaseClient
        .from(source.config.table)
        .select(source.config.columns.join(', '))
        .limit(limit)

      // Apply time range filters if specified
      if (timeRange?.from) {
        const dateColumns = source.config.columns.filter((col: string) => 
          col.includes('date') || col.includes('time') || col.includes('created_at')
        )
        if (dateColumns.length > 0) {
          queryBuilder = queryBuilder.gte(dateColumns[0], timeRange.from)
        }
      }
      if (timeRange?.to) {
        const dateColumns = source.config.columns.filter((col: string) => 
          col.includes('date') || col.includes('time') || col.includes('created_at')
        )
        if (dateColumns.length > 0) {
          queryBuilder = queryBuilder.lte(dateColumns[0], timeRange.to)
        }
      }

      // Apply ordering
      if (source.config.order_by) {
        const [column, direction] = source.config.order_by.split(' ')
        queryBuilder = queryBuilder.order(column, { ascending: direction !== 'desc' })
      }

      const { data, error } = await queryBuilder

      if (error) {
        console.error(`Error fetching data from ${source.key}:`, error)
        continue
      }

      results.push({
        key: source.key,
        rows: data || []
      })
    } catch (error) {
      console.error(`Error processing source ${source.key}:`, error)
    }
  }

  return { sources: results }
}

async function searchDocuments(supabaseClient: any, query: string, k: number = 5) {
  const { data, error } = await supabaseClient
    .from('documents')
    .select('id, title, content, category')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,content.ilike.%${query.split(' ').join('%')}%`)
    .order('created_at', { ascending: false })
    .limit(k)

  if (error) throw error

  return {
    chunks: data.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      excerpt: doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : ''),
      score: 0.8
    }))
  }
}
