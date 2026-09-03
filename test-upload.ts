import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
const ai = new GoogleGenAI({});
async function run() {
  fs.writeFileSync('test.txt', 'hello');
  const uploadRes = await ai.files.upload({ file: 'test.txt' });
  console.log(uploadRes);
  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: [
      { fileData: { fileUri: uploadRes.uri, mimeType: uploadRes.mimeType } },
      { text: "What is this file?" }
    ]
  });
  console.log(response.text);
}
run().catch(console.error);
