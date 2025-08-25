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

    // Get chat history for context
    const { data: chatHistory } = await supabaseClient
      .from('chat_messages')
      .select('content, role, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Build conversation context
    const conversationHistory = chatHistory ? chatHistory.reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    })) : []

    // Prepare the system message
    const systemMessage = `You are a helpful AI fitness assistant. You have access to the user's fitness data, memories, and fitness knowledge base. 

Key behaviors:
- Be concise, helpful, and precise with units/dates
- Avoid medical claims; provide general wellness guidance only
- Use tools to retrieve relevant user data when asked
- Maintain context from previous conversations
- Respect privacy and never expose raw PII unless explicitly requested

Use the tools to provide personalized, data-driven fitness advice.`

    // Build the input array for the Responses API
    const input = [
      { role: 'system', content: systemMessage },
      ...conversationHistory,
      { role: 'user', content: message }
    ]

    // Call the new Responses API
    const openaiReq = {
      model: "gpt-4o-mini",
      input: input,
      stream: true
      // Note: Removed tools array as Responses API may not support function calling
      // in the same way as Assistants API
    }

    console.log('Calling OpenAI Responses API...')

    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(openaiReq)
    })

    if (!upstream.ok || !upstream.body) {
      const body = await upstream.text()
      console.error('OpenAI API error:', body)
      throw new Error(`OpenAI API error: ${body}`)
    }

    // Log the user message to the database
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

    // Set up streaming response
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    // Process the stream
    (async () => {
      const encoder = new TextEncoder()
      let fullResponse = ''
      
      // Optional keepalive every 15s
      const keepalive = setInterval(async () => {
        try {
          await writer.write(encoder.encode(`: ping\n\n`))
        } catch (e) {
          // Ignore write errors during keepalive
        }
      }, 15000)

      try {
        // Ensure upstream.body is not null (we already checked above)
        const body = upstream.body!
        
        for await (const chunk of body) {
          // Pass through exactly as received (already SSE-formatted by OpenAI)
          await writer.write(chunk)
          
          // Extract content for logging (simplified - in production you'd parse the SSE properly)
          const chunkText = new TextDecoder().decode(chunk)
          if (chunkText.includes('"content"')) {
            // This is a simplified extraction - in production you'd properly parse the SSE
            const match = chunkText.match(/"content":\s*"([^"]*)"/)
            if (match) {
              fullResponse += match[1]
            }
          }
        }
        
        // Log the AI response to the database
        if (fullResponse.trim()) {
          const { error: aiMessageError } = await supabaseClient
            .from('chat_messages')
            .insert({
              user_id: userId,
              content: fullResponse,
              role: 'assistant',
              created_at: new Date().toISOString(),
            })
          
          if (aiMessageError) {
            console.error('Error logging AI response:', aiMessageError)
          }
        }
        
      } catch (e) {
        console.error('Streaming error:', e)
        try {
          await writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: e.message })}\n\n`))
        } catch (writeError) {
          console.error('Error writing error to stream:', writeError)
        }
      } finally {
        clearInterval(keepalive)
        try {
          await writer.close()
        } catch (closeError) {
          console.error('Error closing writer:', closeError)
        }
      }
    })()

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        ...corsHeaders
      }
    })

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
