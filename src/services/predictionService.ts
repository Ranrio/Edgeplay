import { GoogleGenAI, Type } from "@google/genai";

export enum FixedStatus {
  FIXED = "Fixed",
  SUSPICIOUS = "Suspicious",
  CLEAN = "Clean"
}

export interface PredictionResult {
  detected_fixture: {
    home_team: string;
    away_team: string;
    competition: string;
    date_time: string;
    venue: string;
  };
  fixed_status: FixedStatus;
  one_x_two: "1" | "X" | "2";
  is_strong_home_win: boolean;
  investor_controlled_score: string;
  safest_bet: string;
  "over_under_2.5": "Over 2.5" | "Under 2.5";
  btts: "YES" | "NO";
  ht_ft: "1/2" | "2/1" | "1/1" | "2/2" | "X/X" | "1/X" | "2/X";
  soccer_pools_type: "Pool" | "Jackpot";
  dark_pool_score: string;
  insider_correct_score: string;
  insider_influence_level: "None" | "Low" | "Medium" | "High" | "Critical";
  influence_details: string;
  confidence: number;
  reasoning_summary: string;
}

// Optimization: Cache static head-to-head and fixture data locally
const predictionCache = new Map<string, PredictionResult>();

export async function analyzeFixture(fixture: string): Promise<PredictionResult> {
  const normalizedFixture = fixture.toLowerCase().trim();
  
  // Cache Hit Check
  if (predictionCache.has(normalizedFixture)) {
    console.log("Optimization: Prediction Cache Hit");
    return predictionCache.get(normalizedFixture)!;
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not defined. Please ensure it is configured in the environment Settings.");
  }
  const ai = new GoogleGenAI({ apiKey: key });

  /**
   * Optimization: Parallel Modules
   * We split the analysis into Core Prediction and Forensic Insights 
   * to allow for "Lightweight output" behavior.
   */
  
  const currentDate = new Date().toISOString().split('T')[0];

  const fetchCore = async () => {
    // Factor Batching: Grouping Score + Match Outcome + Confidence
    const coreInstruct = `Analyze fixture: ${fixture}. Date: ${currentDate}. Output core prediction JSON.`;
    const coreResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: coreInstruct,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detected_fixture: {
              type: Type.OBJECT,
              properties: {
                home_team: { type: Type.STRING },
                away_team: { type: Type.STRING },
                competition: { type: Type.STRING },
                date_time: { type: Type.STRING },
                venue: { type: Type.STRING }
              },
              required: ["home_team", "away_team", "competition", "date_time", "venue"]
            },
            fixed_status: { type: Type.STRING, enum: ["Fixed", "Suspicious", "Clean"] },
            one_x_two: { type: Type.STRING, enum: ["1", "X", "2"] },
            investor_controlled_score: { type: Type.STRING },
            insider_correct_score: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            safest_bet: { type: Type.STRING }
          },
          required: ["detected_fixture", "fixed_status", "one_x_two", "investor_controlled_score", "insider_correct_score", "confidence", "safest_bet"]
        }
      }
    });
    const text = coreResponse.text;
    if (!text) throw new Error("Core prediction failed.");
    return JSON.parse(text);
  };

  const fetchDetails = async () => {
    // Factor Batching: Grouping Insider signals + Market anomalies + Forensic reasoning
    const detailInstruct = `Analyze fixture: ${fixture}. Output forensic details JSON.`;
    const detailResponse = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: detailInstruct,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insider_influence_level: { type: Type.STRING, enum: ["None", "Low", "Medium", "High", "Critical"] },
            influence_details: { type: Type.STRING },
            is_strong_home_win: { type: Type.BOOLEAN },
            dark_pool_score: { type: Type.STRING },
            "over_under_2.5": { type: Type.STRING, enum: ["Over 2.5", "Under 2.5"] },
            btts: { type: Type.STRING, enum: ["YES", "NO"] },
            ht_ft: { type: Type.STRING, enum: ["1/2", "2/1", "1/1", "2/2", "X/X", "1/X", "2/X"] },
            soccer_pools_type: { type: Type.STRING, enum: ["Pool", "Jackpot"] },
            reasoning_summary: { type: Type.STRING }
          },
          required: ["insider_influence_level", "influence_details", "is_strong_home_win", "dark_pool_score", "over_under_2.5", "btts", "ht_ft", "soccer_pools_type", "reasoning_summary"]
        }
      }
    });
    const text = detailResponse.text;
    if (!text) throw new Error("Forensic details failed.");
    return JSON.parse(text);
  };

  try {
    // Optimization: Running Parallel Threads for faster resolution
    const [core, details] = await Promise.all([fetchCore(), fetchDetails()]);
    
    const result: PredictionResult = { ...core, ...details };
    
    // Store in Cache
    predictionCache.set(normalizedFixture, result);
    
    return result;
  } catch (error: any) {
    console.error("Optimized Engine Error:", error);
    if (error?.status === 403 || error?.message?.includes("403")) {
      throw new Error("Access Denied (403): Gemini key permissions or regional restriction.");
    }
    if (error?.status === 429 || error?.message?.includes("429")) {
      throw new Error("Quota Exceeded (429): Rate limits reached.");
    }
    throw new Error(`Engine Error: ${error.message || "Failed to resolve parallel modules."}`);
  }
}
