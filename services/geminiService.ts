
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCountryFact = async (countryName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a short (one sentence), interesting, and surprising fact about the country: ${countryName}. Make it fun for a game player.`,
    });
    return response.text || "This country has a rich and diverse culture!";
  } catch (error) {
    console.error("Error fetching country fact:", error);
    return "Keep going! You're doing great at geography!";
  }
};

export const getDetailedCountryInfo = async (countryName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed 3-sentence summary about the country ${countryName}. Include its capital, a famous landmark, and something unique about its geography or history.`,
    });
    return response.text || "Information currently being updated by our global explorers.";
  } catch (error) {
    console.error("Error fetching detailed info:", error);
    return "We couldn't reach the archives right now, but this country is definitely worth a visit!";
  }
};
