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
    const systemMessage = `You are a helpful AI fitness assistant with access to the user's actual fitness data. You can retrieve their profile information, progress metrics, workout logs, nutrition logs, and fitness assessments to provide personalized advice.

IMPORTANT CAPABILITIES:
- Use get_user_data() to access the user's actual weight, height, fitness goals, workout history, and nutrition logs
- Use search_memory() to find relevant user preferences and past conversations
- Use write_memory() to store important information about the user for future reference

WHEN USER ASKS ABOUT THEIR DATA:
- If they ask about weight, height, BMI, or body composition - use get_user_data() to retrieve their actual metrics
- If they ask about workout progress - use get_user_data() to get their recent workout logs
- If they ask about nutrition - use get_user_data() to get their nutrition logs
- Always provide specific, personalized advice based on their actual data

BEHAVIOR:
- Be encouraging and supportive while providing practical, evidence-based advice
- When you have access to their data, use it to provide specific, personalized recommendations
- If data is missing, ask for it politely or provide general guidance
- Use CDC BMI categories for weight classification (Underweight: <18.5, Healthy: 18.5-24.9, Overweight: 25-29.9, Obese: ≥30)
- Avoid medical claims; provide general wellness guidance only
- Respect privacy and never expose raw PII unless explicitly requested`

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
      stream: true,
      tools: [
        {
          type: "function",
          function: {
            name: "get_user_data",
            description: "Fetch user's fitness data from registered data sources (profiles, progress_metrics, workout_logs, nutrition_logs, fitness_assessments).",
            parameters: {
              type: "object",
              properties: {
                query: { 
                  type: "string",
                  description: "What data to retrieve (e.g., 'weight', 'height', 'recent workouts', 'nutrition logs', 'fitness goals')"
                },
                time_range: {
                  type: "object",
                  properties: {
                    from: { type: "string", description: "Start date (ISO format)" },
                    to: { type: "string", description: "End date (ISO format)" }
                  }
                },
                source_keys: {
                  type: "array",
                  items: { type: "string" },
                  description: "Specific data sources to query"
                },
                limit: { 
                  type: "integer", 
                  minimum: 1, 
                  maximum: 200, 
                  default: 50,
                  description: "Maximum number of records to return"
                }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "search_memory",
            description: "Vector search over user's stored memories and preferences.",
            parameters: {
              type: "object",
              properties: {
                query: { 
                  type: "string",
                  description: "Search query for memories"
                },
                k: { 
                  type: "integer", 
                  minimum: 1, 
                  maximum: 10, 
                  default: 5,
                  description: "Number of memories to retrieve"
                }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "write_memory",
            description: "Store new durable memory about the user.",
            parameters: {
              type: "object",
              properties: {
                kind: { 
                  type: "string", 
                  enum: ["fact", "preference", "summary", "note"],
                  description: "Type of memory to store"
                },
                content: { 
                  type: "string",
                  description: "Content of the memory"
                },
                importance: { 
                  type: "integer", 
                  minimum: 1, 
                  maximum: 5, 
                  default: 1,
                  description: "Importance level (1-5)"
                }
              },
              required: ["kind", "content"]
            }
          }
        }
      ]
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

    // Handle tool calls if needed
    const responseText = await upstream.text()
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      // If not JSON, it's a streaming response, return as-is
      console.log('Received streaming response, returning directly')
      return new Response(upstream.body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          ...corsHeaders
        }
      })
    }

    // Check if response requires tool calls
    if (responseData.requires_action && responseData.requires_action.type === 'submit_tool_outputs') {
      console.log('Tool calls required:', responseData.requires_action.submit_tool_outputs.tool_calls)
      
      const toolOutputs: Array<{ tool_call_id: string; output: string }> = []
      
      for (const toolCall of responseData.requires_action.submit_tool_outputs.tool_calls) {
        const { id, function: func } = toolCall
        
        try {
          let result
          
          switch (func.name) {
            case 'get_user_data':
              result = await getUserData(supabaseClient, userId, JSON.parse(func.arguments))
              break
            case 'search_memory':
              result = await searchMemory(supabaseClient, userId, JSON.parse(func.arguments))
              break
            case 'write_memory':
              result = await writeMemory(supabaseClient, userId, JSON.parse(func.arguments))
              break
            default:
              result = { error: `Unknown tool: ${func.name}` }
          }
          
          toolOutputs.push({
            tool_call_id: id,
            output: JSON.stringify(result)
          })
          
        } catch (error) {
          console.error(`Error executing tool ${func.name}:`, error)
          toolOutputs.push({
            tool_call_id: id,
            output: JSON.stringify({ error: error.message })
          })
        }
      }
      
      // Submit tool outputs back to OpenAI
      console.log('Submitting tool outputs:', toolOutputs)
      
      const toolResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: input,
          stream: true,
          tools: openaiReq.tools,
          tool_outputs: toolOutputs
        })
      })
      
      if (!toolResponse.ok || !toolResponse.body) {
        const body = await toolResponse.text()
        console.error('OpenAI tool response error:', body)
        throw new Error(`OpenAI tool response error: ${body}`)
      }
      
      // Return the tool response stream
      return new Response(toolResponse.body, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
          ...corsHeaders
        }
      })
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

    // IMPORTANT: Return the upstream SSE body as-is (Pattern A - Direct pass-through)
    // This is the most efficient approach for streaming at the edge
    return new Response(upstream.body, {
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

async function searchMemory(supabaseClient: any, userId: string, params: any) {
  console.log('Executing searchMemory with params:', params)
  
  const { query, k = 5 } = params
  
  try {
    const { data, error } = await supabaseClient
      .from('user_memories')
      .select('id, kind, content, importance')
      .eq('user_id', userId)
      .or(`content.ilike.%${query}%,content.ilike.%${query.split(' ').join('%')}%`)
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(k)

    if (error) {
      console.error('Error searching memories:', error)
      return { memories: [] }
    }

    const memories = data.map((memory: any) => ({
      id: memory.id,
      kind: memory.kind,
      content: memory.content,
      score: memory.importance / 5
    }))

    console.log('searchMemory results:', memories)
    return { memories }
    
  } catch (error) {
    console.error('Error in searchMemory:', error)
    return { memories: [] }
  }
}

async function writeMemory(supabaseClient: any, userId: string, params: any) {
  console.log('Executing writeMemory with params:', params)
  
  const { kind, content, importance = 1 } = params
  
  try {
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

    if (error) {
      console.error('Error writing memory:', error)
      return { success: false, error: error.message }
    }

    console.log('writeMemory success:', data)
    return { success: true, memory: data }
    
  } catch (error) {
    console.error('Error in writeMemory:', error)
    return { success: false, error: 'Failed to write memory' }
  }
}

async function getUserData(supabaseClient: any, userId: string, params: any) {
  console.log('Executing getUserData with params:', params)
  
  const { query, time_range, source_keys, limit = 50 } = params
  
  try {
    let results: any = {}
    
    // Get user profile data
    if (!source_keys || source_keys.includes('profiles')) {
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (profileError) {
        console.error('Error fetching profile:', profileError)
      } else {
        results.profile = profile
      }
    }
    
    // Get progress metrics (weight, height, etc.)
    if (!source_keys || source_keys.includes('progress_metrics')) {
      const { data: metrics, error: metricsError } = await supabaseClient
        .from('progress_metrics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (metricsError) {
        console.error('Error fetching metrics:', metricsError)
      } else {
        results.progress_metrics = metrics
      }
    }
    
    // Get recent workout logs
    if (!source_keys || source_keys.includes('workout_logs')) {
      const { data: workouts, error: workoutsError } = await supabaseClient
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (workoutsError) {
        console.error('Error fetching workouts:', workoutsError)
      } else {
        results.workout_logs = workouts
      }
    }
    
    // Get nutrition logs
    if (!source_keys || source_keys.includes('nutrition_logs')) {
      const { data: nutrition, error: nutritionError } = await supabaseClient
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (nutritionError) {
        console.error('Error fetching nutrition:', nutritionError)
      } else {
        results.nutrition_logs = nutrition
      }
    }
    
    // Get fitness assessments
    if (!source_keys || source_keys.includes('fitness_assessments')) {
      const { data: assessments, error: assessmentsError } = await supabaseClient
        .from('fitness_assessments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (assessmentsError) {
        console.error('Error fetching assessments:', assessmentsError)
      } else {
        results.fitness_assessments = assessments
      }
    }
    
    console.log('getUserData results:', results)
    return results
    
  } catch (error) {
    console.error('Error in getUserData:', error)
    return { error: 'Failed to retrieve user data' }
  }
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


