
import { GoogleGenAI, Type } from "@google/genai";
import { SetlistParams, Song } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSetlist = async (params: SetlistParams): Promise<Song[]> => {
  const prompt = `Act as a world-class professional DJ. Create a detailed, high-energy setlist for a "${params.context}" event featuring "${params.region}" music. 
  The set should last approximately ${params.durationMinutes} minutes. 
  The overall vibe should be ${params.intensity}.
  Provide a list of actual popular songs that fit this context, with estimated BPMs and transition styles.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            artist: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            durationSeconds: { type: Type.NUMBER },
            energyLevel: { type: Type.NUMBER },
            transitionType: { type: Type.STRING },
            genre: { type: Type.STRING }
          },
          required: ["id", "title", "artist", "bpm", "durationSeconds", "energyLevel", "transitionType", "genre"]
        }
      }
    }
  });

  try {
    // Safely handle potential undefined text from the response
    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    return [];
  }
};

export const getVibeDescription = async (songs: Song[]): Promise<string> => {
  const titles = songs.map(s => s.title).join(', ');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a 2-sentence hype description for a DJ set containing these songs: ${titles}. Make it sound like a professional club promoter.`,
  });
  return response.text || "Getting the party started...";
};
