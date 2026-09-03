import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI();
async function run() {
  let response = await ai.models.list();
  // using standard array iteration on response.items maybe? Let's just log response
}
