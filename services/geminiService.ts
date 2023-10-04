import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

/**
 * Ensures the API Key is present before making requests
 */
function getAIClient() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is configured.");
  }
  return new GoogleGenAI({ apiKey });
}

export async function enhancePrompt(prompt: string): Promise<string> {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: `Transform this project goal into a professional project objective: "${prompt}"` }] }],
      config: { 
        systemInstruction: "You are a senior project architect. Rewrite short prompts into comprehensive descriptions under 40 words." 
      }
    });
    return response.text || prompt;
  } catch (error) {
    console.error("AI Enhancement Error:", error);
    return prompt;
  }
}

export async function extractTasksFromImage(base64Image: string): Promise<AIResponse> {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Analyze these handwritten notes and extract a structured action plan. Decompose them into tasks with logical dependencies, priority, and estimated duration (minutes/hours/days/weeks)." }
      ]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
                duration: { type: Type.NUMBER },
                durationUnit: { type: Type.STRING, enum: ["minutes", "hours", "days", "weeks"] },
                dependencies: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "description", "priority", "duration", "durationUnit", "dependencies"]
            }
          }
        },
        required: ["name", "description", "tasks"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty response");
  
  try {
    return JSON.parse(text.trim()) as AIResponse;
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Invalid AI response format");
  }
}

export async function generateActionFlow(prompt: string): Promise<AIResponse> {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", // Upgraded to Pro for complex planning tasks
    contents: [{ parts: [{ text: `Decompose the following goal into a structured action plan: "${prompt}"` }] }],
    config: {
      systemInstruction: "You are a world-class project manager. Breakdown goals into actionable tasks. Use appropriate units (minutes, hours, days, weeks) based on complexity. Ensure dependencies refer to the exact 'title' of previous tasks.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["low", "medium", "high"] },
                duration: { type: Type.NUMBER },
                durationUnit: { type: Type.STRING, enum: ["minutes", "hours", "days", "weeks"] },
                dependencies: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["title", "description", "priority", "duration", "durationUnit", "dependencies"]
            }
          }
        },
        required: ["name", "description", "tasks"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty response");

  try {
    return JSON.parse(text.trim()) as AIResponse;
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Invalid AI response format");
  }
}