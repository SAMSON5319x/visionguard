import { GoogleGenAI } from "@google/genai";

// ✅ Use Vite environment variable
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export const getSafetyInsights = async (alerts: any[], location: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",  // stable production model
      contents: `Analyze the following user data for a visually impaired user and provide safety recommendations:
      - Current Location: ${JSON.stringify(location)}
      - Recent Alerts: ${JSON.stringify(alerts)}
      Provide the response as a short, encouraging summary for the caregiver.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate safety insights at this time.";
  }
};
