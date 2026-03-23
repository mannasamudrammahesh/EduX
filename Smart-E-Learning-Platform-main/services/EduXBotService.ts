import { GoogleGenAI, Chat } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }
  return ai;
};

export const createChatSession = (): Chat => {
  const client = getAI();
  return client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are EduxBot, a helpful, encouraging, and knowledgeable AI teaching assistant. Your goal is to help students learn, clarify doubts, and provide examples. Keep answers concise but informative.',
    },
  });
};
