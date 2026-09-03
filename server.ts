import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer, WebSocket } from 'ws';
import multer from 'multer';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => res.json({status: 'ok'}));

const upload = multer({ dest: 'uploads/' });

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

// -------------------------------------------------------------
// REST Endpoint: Analyze Transcript
// -------------------------------------------------------------
app.post('/api/analyze', async (req, res) => {
  try {
    const { turns } = req.body;
    if (!turns || turns.length === 0) {
      return res.json({ riskScore: 0, signals: [], recommendedActions: [], suggestedQuestions: [], callerStatus: 'Unknown', locationStatus: 'Unknown', translatedTurns: [] });
    }

    const transcriptText = turns.map((t: any, index: number) => `[Turn ${index}] ${t.speaker}: ${t.text}`).join('\n');
    
    const prompt = `
    You are an emergency CAD operator AI assistant. Analyze this ongoing conversation transcript.
    If a party is speaking a language other than English (e.g., Bengali, Hindi), translate their turns to English.
    However, if a turn ends with "(PARTIAL - DO NOT TRANSLATE)", do NOT translate it yet. Only provide translations for finalized turns.
    
    Output your analysis as a strict JSON object with this shape:
    {
      "riskScore": number (0-100),
      "signals": [] (short list of danger signals detected, e.g., [{"category": "WEAPON", "keyword": "knife", "description": "Weapon mentioned"}]),
      "recommendedActions": string[] (e.g., ["Dispatch Police", "Mark Critical"]),
      "suggestedQuestions": string[] (e.g., ["Are you in a safe room?"]),
      "callerStatus": string (e.g., "In Danger", "Distressed"),
      "locationStatus": string ("unknown", "approximate", "known"),
      "translations": { 
         "0": "English translation for [Turn 0] if not English",
         "1": "..."
      }
    }
    
    Transcript:
    ${transcriptText}
    `;

    let parsedReport = {
      riskScore: 0, signals: [], recommendedActions: [], suggestedQuestions: [], callerStatus: 'Unknown', locationStatus: 'Unknown', translatedTurns: []
    };

    try {
      const interaction = await ai.interactions.create({
        model: 'gemini-3.7-flash',
        input: prompt,
      });

      let fullOutput = "";
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const textContent = step.content?.find((c: any) => c.type === 'text');
          if (textContent && (textContent as any).text) {
            fullOutput += (textContent as any).text;
          }
        }
      }

      const jsonMatch = fullOutput.match(/```json\s*([\s\S]*?)\s*```/) || fullOutput.match(/([\{\[][\s\S]*[\}\]])/);
      if (jsonMatch) {
        try {
          parsedReport = JSON.parse(jsonMatch[1]);
        } catch (err) {}
      } else {
        try {
          parsedReport = JSON.parse(fullOutput);
        } catch (err) {}
      }
    } catch (apiError: any) {
      console.warn("Gemini API Error (e.g. Rate Limit):", apiError.message);
      // Return the empty fallback report so the UI doesn't crash
      return res.json(parsedReport);
    }
    
    res.json(parsedReport);
  } catch (error: any) {
    console.error('Analysis Endpoint Error:', error.message || error);
    res.status(500).json({ error: error.message || 'Failed to analyze transcript' });
  }
});

// -------------------------------------------------------------
// REST Endpoint: File Upload Transcription (Using Gemini 1.5 Pro)
// -------------------------------------------------------------
app.post('/api/transcribe_file', upload.single('file'), async (req, res) => {
  let uploadRes: any = null;
  let filePath: string | null = null;
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    filePath = file.path;

    if (process.env.GEMINI_API_KEY) {
      console.log("Uploading file to Gemini File API...");
      uploadRes = await ai.files.upload({
        file: file.path,
        config: { mimeType: file.mimetype || 'audio/mpeg' }
      });
      
      const prompt = `
      Listen to this emergency audio file and provide a highly accurate, word-for-word transcript.

      CRITICAL INSTRUCTIONS:
      1. DIARIZATION: Identify the dispatcher as 'Operator' and the other person as 'Caller'.
      2. STRICT NATIVE LANGUAGE: The audio may contain Bengali, Hindi, and English. You MUST transcribe the words in their original spoken language. 
         - If they speak Bengali, write in Bengali script (বাংলা).
         - If they speak Hindi, write in Devanagari script (हिन्दी).
         - NEVER TRANSLATE Bengali or Hindi into English. For example, if they say "Kemon acho", write "কেমন আছো", DO NOT write "How are you".
         - NEVER TRANSLATE Bengali into Hindi.
      3. CODE-SWITCHING: They will switch languages mid-sentence. Capture these switches perfectly in their respective scripts.
      4. OUTPUT FORMAT: Output ONLY a JSON array. Do not include markdown code blocks. Each object in the array must have these fields:
         - speaker (string, 'Operator' or 'Caller')
         - start (number)
         - end (number)
         - text (string, the transcript)
         - isFinal (boolean, always true)
         - language (string, e.g. 'Bengali', 'Hindi', 'English', or 'Mixed')
      `;
      
      console.log("Requesting transcription from Gemini...");
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: [
          { fileData: { fileUri: uploadRes.uri, mimeType: uploadRes.mimeType } },
          { text: prompt }
        ]
      });
      
      let turns = [];
      try {
        let outText = response.text || "[]";
        const jsonMatch = outText.match(/```json\s*([\s\S]*?)\s*```/) || outText.match(/(\[\s*\{[\s\S]*\}\s*\])/);
        if (jsonMatch) {
          turns = JSON.parse(jsonMatch[1]);
        } else {
          turns = JSON.parse(outText);
        }
      } catch (e) {
        console.error("Failed to parse Gemini transcription JSON:", e);
      }
      
      return res.json({ turns });
    } else {
      return res.status(500).json({ error: "GEMINI_API_KEY is not set." });
    }
  } catch (error: any) {
    console.error("Transcription Error:", error);
    return res.status(500).json({ error: error.message || "Failed to transcribe file", turns: [] });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    }
    if (uploadRes && uploadRes.name) {
      try {
        await ai.files.delete({ name: uploadRes.name });
      } catch (e) {}
    }
  }
});

// -------------------------------------------------------------
// HTTP / Vite integration setup
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  // -------------------------------------------------------------
  // WebSocket Server Setup for Live Transcription
  // -------------------------------------------------------------
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws/transcribe') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws) => {
    console.log("Client connected to /ws/transcribe");
    let dgWs: WebSocket | null = null;

    if (!DEEPGRAM_API_KEY) {
      console.log("WARNING: DEEPGRAM_API_KEY not set. Sending mock data.");
      ws.on('message', (msg) => {
         ws.send(JSON.stringify({
            turns: [{
               speaker: "Operator",
               start: 0.0,
               end: 1.0,
               text: "Live transcription requires Deepgram API key.",
               isFinal: true
            }]
         }));
      });
      return;
    }

    try {
      dgWs = new WebSocket('wss://api.deepgram.com/v1/listen?model=nova-2&language=multi&smart_format=true&diarize=true', {
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`
        }
      });

      dgWs.on('open', () => {
        console.log("Connected to Deepgram");
      });

      dgWs.on('message', (data: any) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.channel) {
            const alts = msg.channel.alternatives[0];
            const words = alts.words || [];
            const is_final = msg.is_final || false;

            const turns: any[] = [];
            let current_turn: any = null;

            for (const w of words) {
              const speaker_id = w.speaker || 0;
              const speaker = speaker_id === 0 ? "Operator" : "Caller";

              if (current_turn && current_turn.speaker === speaker) {
                current_turn.text += ` ${w.punctuated_word}`;
                current_turn.end = w.end;
              } else {
                if (current_turn) turns.push(current_turn);
                current_turn = {
                  speaker: speaker,
                  start: w.start,
                  end: w.end,
                  text: w.punctuated_word,
                  isFinal: is_final
                };
              }
            }
            if (current_turn) turns.push(current_turn);

            if (turns.length > 0) {
              ws.send(JSON.stringify({ turns }));
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      });

      dgWs.on('close', () => console.log("Deepgram closed"));
      dgWs.on('error', (err) => console.error("Deepgram error:", err));

    } catch (err) {
      console.error("Failed to connect to Deepgram", err);
    }

    ws.on('message', (message) => {
      if (dgWs && dgWs.readyState === WebSocket.OPEN) {
        dgWs.send(message);
      }
    });

    ws.on('close', () => {
      console.log("Client disconnected");
      if (dgWs && dgWs.readyState === WebSocket.OPEN) {
        dgWs.close();
      }
    });
  });
}

startServer();
