import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function askGemini(prompt: string, systemInstruction?: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Gemini API Key is missing. Please set it in the Settings menu.");
    return "Error: Gemini API Key is missing. Please set the API Key in the Settings menu.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    if (!response.text) {
      console.warn("Gemini returned empty response.");
      return "Sorry, I couldn't process that request. Please try again.";
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error?.message?.includes("API_KEY_INVALID")) {
      return "Error: Invalid Gemini API Key. Please check it in the Settings menu.";
    }
    return "An error occurred while communicating with the AI. Please try again in a few moments.";
  }
}
