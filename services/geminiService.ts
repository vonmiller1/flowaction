
import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function enhancePrompt(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Transform this project goal into a professional project objective: "${prompt}"`,
    config: { systemInstruction: "You are a senior project architect. Rewrite short prompts into comprehensive descriptions under 40 words." }
  });
  return response.text || prompt;
}

export async function extractTasksFromImage(base64Image: string): Promise<AIResponse> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { inlineData: { mimeType: "image/jpeg", data: base64Image } },
      { text: "Analyze these handwritten notes and extract a structured action plan. Decompose them into tasks with logical dependencies, priority, and estimated duration (minutes/hours/days/weeks)." }
    ],
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
  return JSON.parse(response.text) as AIResponse;
}

export async function generateActionFlow(prompt: string): Promise<AIResponse> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Decompose the following goal into a structured action plan: "${prompt}"`,
    config: {
      systemInstruction: "You are a world-class project manager. Breakdown goals into actionable tasks. Use appropriate units (minutes, hours, days, weeks) based on complexity.",
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
  return JSON.parse(response.text) as AIResponse;
}
