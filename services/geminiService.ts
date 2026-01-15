
import { GoogleGenAI } from "@google/genai";
import { ActivityLog } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getIntelligentInsights(logs: ActivityLog[]) {
  const logString = logs.map(l => `${l.projectName}: ${l.duration} (${l.status})`).join('\n');
  
  const prompt = `Analiza los siguientes registros de actividad de un trabajador profesional y proporciona un "Consejo Pro" corto y motivador para la productividad. Mantenlo bajo 25 palabras y en español.
  
  Registros de Actividad:
  ${logString}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "¡Vas por buen camino! Mantén el enfoque en tus proyectos principales hoy.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Agrupa tareas similares para reducir la sobrecarga del cambio de contexto hoy.";
  }
}
