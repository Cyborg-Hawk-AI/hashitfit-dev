
// @ts-nocheck
// ^ Adding this directive to ignore TypeScript errors for this file

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { imageUrl, userId, mealType, userPrompt, mealDescription } = await req.json();

    if (!imageUrl || !userId || !mealType) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: imageUrl, userId, and mealType are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing meal photo for user ${userId}, meal type: ${mealType}`);
    console.log(`Image URL: ${imageUrl}`);
    console.log(`User description: ${mealDescription || 'No description provided'}`);
    console.log(`Using custom prompt: ${userPrompt ? 'Yes' : 'No'}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
      throw new Error("Server configuration error: Missing Supabase credentials");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download image from Supabase Storage
    console.log("Downloading image from Storage...");
    
    // Extract bucket and path from URL
    const urlParts = imageUrl.split('/storage/v1/object/public/');
    if (urlParts.length < 2) {
      throw new Error("Invalid image URL format");
    }
    
    const pathParts = urlParts[1].split('/', 1);
    const bucket = pathParts[0];
    const path = urlParts[1].substring(bucket.length + 1);
    
    console.log(`Bucket: ${bucket}, Path: ${path}`);
    
    const { data: fileData, error: fileError } = await supabase.storage
      .from(bucket)
      .download(path);
      
    if (fileError) {
      console.error("Download error:", fileError);
      throw new Error(`Failed to download image: ${fileError.message}`);
    }
    
    console.log("Image downloaded successfully, file size:", fileData.size);

    // Convert image to base64 for OpenAI Vision API
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    console.log("Processing with OpenAI Vision API...");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }
    
    // Use OpenAI Vision API to analyze the image with flexible prompt
    const nutritionData = await analyzeImageWithOpenAI(openaiApiKey, base64Image, mealType, userPrompt);
    
    console.log("Successfully analyzed nutritional content");
    
    // Store the nutrition data in the database with meal description
    return await storeMealData(supabase, nutritionData, imageUrl, userId, mealType, mealDescription);
    
  } catch (error) {
    console.error("Error in analyze-meal-photo function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
        timestamp: new Date().toISOString(),
        stack: error.stack || "No stack trace available"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Function to analyze image with OpenAI Vision API using flexible prompts
async function analyzeImageWithOpenAI(openaiApiKey: string, base64Image: string, mealType: string, userPrompt?: string) {
  console.log("Analyzing image with OpenAI Vision API...");
  
  // Default prompt if none provided
  const defaultPrompt = `Please analyze this ${mealType} image and identify all the food items you can see. Estimate realistic portion sizes and provide a comprehensive nutrition breakdown for each item. Consider this a typical adult meal portion.

Output structured JSON in this format:
{
  "meal_title": "A descriptive title for this meal",
  "food_items": [
    { 
      "name": "Food 1", 
      "portion": "Portion size with weight", 
      "calories": number, 
      "protein_g": number, 
      "carbs_g": number, 
      "fat_g": number 
    },
    { 
      "name": "Food 2", 
      "portion": "Portion size with weight", 
      "calories": number, 
      "protein_g": number, 
      "carbs_g": number, 
      "fat_g": number 
    }
  ],
  "total": {
    "calories": number,
    "protein_g": number,
    "carbs_g": number,
    "fat_g": number
  }
}

Return only the JSON in your response. No explanations or extra formatting.`;

  // Use provided prompt or default
  const finalPrompt = userPrompt || defaultPrompt;
  
  console.log("Using prompt:", finalPrompt.substring(0, 200) + "...");

  // Call OpenAI Vision API
  console.log("Sending request to OpenAI Vision API...");
  
  const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { 
          role: "user", 
          content: [
            { type: "text", text: finalPrompt },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })
  });
  
  console.log("OpenAI Vision API response status:", openaiResponse.status);
  
  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text();
    console.error("Error from OpenAI Vision API:", errorText);
    throw new Error(`OpenAI Vision API error: ${errorText}`);
  }
  
  const openaiData = await openaiResponse.json();
  console.log("OpenAI Vision response received, processing...");
  
  if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
    console.error("Unexpected OpenAI Vision response format:", JSON.stringify(openaiData));
    throw new Error("Unexpected OpenAI Vision response format");
  }
  
  const assistantMessage = openaiData.choices[0].message.content;
  
  console.log("OpenAI Vision response content:", assistantMessage.substring(0, 200) + "...");
  
  let nutritionData;
  try {
    // Extract JSON from the response
    const jsonMatch = assistantMessage.match(/{[\s\S]*}/);
    if (jsonMatch) {
      nutritionData = JSON.parse(jsonMatch[0]);
      console.log("Successfully parsed nutrition data JSON from Vision API");
    } else {
      console.error("Could not extract JSON from Vision response:", assistantMessage);
      throw new Error("Could not extract JSON from Vision response");
    }
  } catch (error) {
    console.error("Error parsing OpenAI Vision response:", error.message);
    console.log("Raw Vision response:", assistantMessage);
    throw new Error(`Failed to parse nutritional data: ${error.message}`);
  }

  return nutritionData;
}

// Function to store the meal data in the database with meal description
async function storeMealData(supabase: any, nutritionData: any, imageUrl: string, userId: string, mealType: string, mealDescription?: string) {
  console.log("Storing meal data in the database...");
  
  // Get current nutrition log for the day or create a new one
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  let nutritionLog;
  try {
    console.log(`Looking for existing nutrition log for user ${userId} on ${today}`);
    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today)
      .maybeSingle();

    if (error) {
      console.error("Error retrieving nutrition log:", error);
      throw error;
    }
    
    if (!data) {
      // Create new log if it doesn't exist
      console.log("Creating new nutrition log for today");
      
      // Ensure values are integers for database columns
      const totalCalories = Math.round(nutritionData.total.calories);
      const totalProtein = Math.round(nutritionData.total.protein_g);
      const totalCarbs = Math.round(nutritionData.total.carbs_g);
      const totalFat = Math.round(nutritionData.total.fat_g);
      
      console.log(`Creating nutrition log with values: calories=${totalCalories}, protein=${totalProtein}g, carbs=${totalCarbs}g, fat=${totalFat}g`);
      
      const { data: newLog, error: createError } = await supabase
        .from('nutrition_logs')
        .insert({
          user_id: userId,
          log_date: today,
          total_calories: totalCalories,
          total_protein_g: totalProtein,
          total_carbs_g: totalCarbs,
          total_fat_g: totalFat,
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating nutrition log:", createError);
        throw createError;
      }
      
      nutritionLog = newLog;
      console.log("New nutrition log created with ID:", nutritionLog.id);
    } else {
      // Update existing log with new totals
      console.log("Updating existing nutrition log:", data.id);
      
      // Ensure values are integers for database columns
      const totalCalories = Math.round(nutritionData.total.calories);
      const totalProtein = Math.round(nutritionData.total.protein_g);
      const totalCarbs = Math.round(nutritionData.total.carbs_g);
      const totalFat = Math.round(nutritionData.total.fat_g);
      
      console.log(`Updating nutrition log. Current values: calories=${data.total_calories || 0}, protein=${data.total_protein_g || 0}g, carbs=${data.total_carbs_g || 0}g, fat=${data.total_fat_g || 0}g`);
      console.log(`Adding: calories=${totalCalories}, protein=${totalProtein}g, carbs=${totalCarbs}g, fat=${totalFat}g`);
      
      const { data: updatedLog, error: updateError } = await supabase
        .from('nutrition_logs')
        .update({
          total_calories: (data.total_calories || 0) + totalCalories,
          total_protein_g: (data.total_protein_g || 0) + totalProtein,
          total_carbs_g: (data.total_carbs_g || 0) + totalCarbs,
          total_fat_g: (data.total_fat_g || 0) + totalFat,
        })
        .eq('id', data.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating nutrition log:", updateError);
        throw updateError;
      }
      
      nutritionLog = updatedLog;
      console.log("Nutrition log updated successfully");
    }
  } catch (error) {
    console.error("Error managing nutrition log:", error);
    throw new Error(`Failed to manage nutrition log: ${error.message}`);
  }

  // Create meal log entry with food_items JSONB data and meal description
  try {
    console.log("Creating meal log entry with food_items data and meal description");
    
    // Ensure values are integers for database columns
    const calories = Math.round(nutritionData.total.calories);
    const protein = Math.round(nutritionData.total.protein_g);
    const carbs = Math.round(nutritionData.total.carbs_g);
    const fat = Math.round(nutritionData.total.fat_g);
    
    console.log(`Creating meal log with values: calories=${calories}, protein=${protein}g, carbs=${carbs}g, fat=${fat}g`);
    console.log(`Meal title: ${nutritionData.meal_title}`);
    console.log(`Food items count: ${nutritionData.food_items?.length || 0}`);
    console.log(`Meal description: ${mealDescription || 'No description provided'}`);
    
    const { data: mealLog, error: mealError } = await supabase
      .from('meal_logs')
      .insert({
        nutrition_log_id: nutritionLog.id,
        meal_type: mealType,
        meal_title: nutritionData.meal_title,
        calories: calories,
        protein_g: protein,
        carbs_g: carbs,
        fat_g: fat,
        consumed_at: new Date().toISOString(),
        meal_image_url: imageUrl,
        food_items: nutritionData.food_items || [], // Store the detailed food items array
        meal_description: mealDescription || null, // Store user-provided description
        notes: `AI-analyzed from image: ${nutritionData.food_items?.map((item: any) => `${item.name} (${item.portion})`).join(", ") || "No items detected"}`,
      })
      .select()
      .single();

    if (mealError) {
      console.error("Error creating meal log:", mealError);
      throw mealError;
    }

    console.log("Meal log created successfully with ID:", mealLog.id);
    console.log("Process completed successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Food analysis complete",
        nutritionData,
        mealLog,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error creating meal log:", error);
    throw new Error(`Failed to create meal log: ${error.message}`);
  }
}
