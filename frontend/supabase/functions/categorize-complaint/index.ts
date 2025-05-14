
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComplaintData {
  id: string;
  title: string;
  description: string;
}

serve(async (req) => {
  // This is needed for pre-flight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the complaint data from the request
    const { id, title, description } = await req.json() as ComplaintData;

    if (!id || !title || !description) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          } 
        }
      );
    }

    // For now, we'll use a simple rule-based categorization
    // In a production environment, you'd integrate with a proper ML service
    const text = (title + " " + description).toLowerCase();
    let predictedCategory = "";
    let confidence = 0;

    const categories = {
      water: ["water", "leak", "pipe", "supply", "drinking", "flood", "drainage"],
      electricity: ["electricity", "power", "outage", "blackout", "electric", "transformer"],
      roads: ["road", "pothole", "street", "traffic", "signal", "highway", "pavement"],
      sanitation: ["garbage", "waste", "trash", "sanitation", "clean", "sewer", "hygiene"],
      public: ["park", "safety", "noise", "public", "community", "pollution", "neighbor"],
    };

    // Count matches for each category
    const scores: Record<string, number> = {};
    let maxScore = 0;
    let bestMatch = "other"; // Default if no good match

    for (const [category, keywords] of Object.entries(categories)) {
      let score = 0;
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, "gi");
        const matches = text.match(regex);
        if (matches) {
          score += matches.length;
        }
      }
      
      scores[category] = score;
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    }

    // Set a minimum threshold for confidence
    if (maxScore > 0) {
      predictedCategory = bestMatch;
      
      // Calculate a simple confidence score (0-1)
      // Sum all scores to normalize
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      confidence = maxScore / totalScore;
    } else {
      predictedCategory = "other";
      confidence = 1; // High confidence it's "other" if no keywords matched
    }

    // Calculate priority
    let predictedPriority = "medium" as "low" | "medium" | "high" | "critical";
    const urgentTerms = ["urgent", "emergency", "danger", "immediate", "serious", "severe"];
    const lowPriorityTerms = ["minor", "small", "low", "slight"];
    
    // Check for urgent terms
    for (const term of urgentTerms) {
      if (text.includes(term)) {
        predictedPriority = "high";
        break;
      }
    }
    
    // Check for low priority terms
    for (const term of lowPriorityTerms) {
      if (text.includes(term) && predictedPriority !== "high") {
        predictedPriority = "low";
        break;
      }
    }

    // Create a Supabase client with the admin role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the complaint with the predicted category
    const { error: updateError } = await supabase
      .from("complaints")
      .update({
        predicted_category: predictedCategory,
        confidence_score: confidence,
        predicted_priority: predictedPriority
      })
      .eq("id", id);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        id,
        predicted_category: predictedCategory,
        confidence_score: confidence,
        predicted_priority: predictedPriority
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error in categorize-complaint function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
