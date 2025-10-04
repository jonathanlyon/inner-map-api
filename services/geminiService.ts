// Fix: Add a triple-slash directive to include Vite client types, resolving the TypeScript error for `import.meta.env`.
/// <reference types="vite/client" />

import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, Insights, Pattern, SymbolicMap } from '../types';

// Correct Fix: Use import.meta.env.VITE_API_KEY to access the environment variable in the browser.
// The variable MUST be prefixed with VITE_ in your Vercel settings.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const chatSystemInstruction = `You are a wise and gentle guide helping a user on a journey of self-discovery. Your goal is to ask a series of deep, open-ended questions to understand their inner world. Start with lighter, more imaginative questions and gradually move to more personal ones if their answers invite it. IMPORTANT: Do not get stuck on one topic. After a user answers, ask a question that explores a *different* facet of their life, personality, or values. Your aim is to build a broad, holistic picture. Ask only one question at a time. Keep your questions concise, empathetic, and never number them.`;

const formatHistoryForPrompt = (history: ChatMessage[]) => {
  // We only need the user's answers for the final insight generation
  return history
    .filter(m => m.role === 'user')
    .map((m, i) => `Answer ${i + 1}: ${m.content}`)
    .join('\n\n');
};

const formatChatHistoryForQuestion = (history: ChatMessage[]) => {
    return history.map(message => `${message.role}: ${message.content}`).join('\n');
}

export async function startConversation(): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Start the conversation with a warm welcome and a single, gentle, imaginative question to begin a journey of self-discovery. For example: "If your current feelings were a landscape, what would it look like?"`,
      config: {
        systemInstruction: chatSystemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error starting conversation:", error);
    return "I'm having a little trouble starting. Please try refreshing the page.";
  }
}

export async function getNextQuestion(history: ChatMessage[]): Promise<string> {
  try {
    const prompt = formatChatHistoryForQuestion(history);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: chatSystemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error getting next question:", error);
    return "I seem to be lost for words. Could you try sending your message again?";
  }
}

export async function generateAllInsights(history: ChatMessage[]): Promise<Omit<Insights, 'timestamp'>> {
  const conversationSummary = formatHistoryForPrompt(history);

  // Step 1: Generate textual insights and a single image prompt.
  const insightsAndPromptsResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Based on the user's answers, please generate the required insights. \n\nAnswers:\n${conversationSummary}`,
    config: {
      systemInstruction: "You are a profound synthesizer of human experience. Analyze the user's answers to create a compassionate and insightful reflection. Based on the provided answers, generate a JSON object with the specified structure. Analyze the conversation for significant breakthroughs, shifts in perspective, or deep emotional revelations. If one is found, mark `isMilestone` as true and provide a brief `milestoneReason`.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reflection: { type: Type.STRING, description: "A long-form, insightful written reflection (250-350 words) for 'Your Inner Landscape'. It should synthesize patterns and core longings in a kind, empathetic tone." },
          poem: { type: Type.STRING, description: "A short, evocative poem (6-10 lines) for 'A Whisper From Within', distilling the essence of the user's inner world." },
          symbolicMapTitle: { type: Type.STRING, description: "A short, evocative title for the 'Symbolic Map', like 'The Garden of Becoming'." },
          symbolicMapDescription: { type: Type.STRING, description: "A 2-3 sentence description for the 'Symbolic Map'." },
          symbolicMapImagePrompt: { type: Type.STRING, description: "One detailed prompt for an AI image generator to create the main symbolic visual. Style: 'A serene and symbolic digital painting. Minimalist composition with a textured, painterly feel. Muted, sophisticated color palette. Focus on atmosphere and emotion over literal depiction.'" },
          patterns: {
            type: Type.ARRAY,
            description: "An array of 3 key patterns identified from the conversation.",
            items: {
              type: Type.OBJECT,
              properties: {
                iconName: { type: Type.STRING, enum: ['Shield', 'Seedling', 'Path', 'Heart', 'Anchor', 'Lightbulb'], description: "The most fitting icon name for this pattern." },
                title: { type: Type.STRING, description: "A short, impactful title for the pattern." },
                description: { type: Type.STRING, description: "A 2-3 sentence description of the pattern." }
              },
              required: ["iconName", "title", "description"]
            }
          },
          isMilestone: { type: Type.BOOLEAN, description: "Set to true if this session represents a significant breakthrough or turning point." },
          milestoneReason: { type: Type.STRING, description: "If isMilestone is true, a brief (1-2 sentence) explanation of why this is a milestone. Otherwise, null." }
        },
        required: ["reflection", "poem", "symbolicMapTitle", "symbolicMapDescription", "symbolicMapImagePrompt", "patterns", "isMilestone"],
      },
    },
  });

  const insightsData = JSON.parse(insightsAndPromptsResponse.text);

  // Step 2: Generate the single symbolic image.
  const imageResponse = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: insightsData.symbolicMapImagePrompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '1:1',
      outputMimeType: 'image/jpeg'
    }
  });
  
  const base64ImageBytes = imageResponse.generatedImages[0].image.imageBytes;
  const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

  const symbolicMap: SymbolicMap = {
    title: insightsData.symbolicMapTitle,
    description: insightsData.symbolicMapDescription,
    imageUrl: imageUrl,
  };

  const patterns: Pattern[] = insightsData.patterns;

  return { 
      reflection: insightsData.reflection,
      poem: insightsData.poem,
      symbolicMap,
      patterns,
      isMilestone: insightsData.isMilestone,
      milestoneReason: insightsData.milestoneReason || null,
      history: history,
  };
}