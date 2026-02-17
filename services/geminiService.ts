
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client with the mandatory apiKey parameter from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSafetyInsights = async (alerts: any[], location: any) => {
  try {
    // Generate content using the recommended Gemini 3 Flash model for basic text analysis tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following user data for a visually impaired user and provide safety recommendations:
      - Current Location: ${JSON.stringify(location)}
      - Recent Alerts: ${JSON.stringify(alerts)}
      Provide the response as a short, encouraging summary for the caregiver.`,
      config: {
        // Disabling thinking budget for simple summarization tasks to minimize latency
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Use the .text property to extract the model's response string
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Unable to generate safety insights at this time.";
  }
};
