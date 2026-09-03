import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Phone, 
  Clock, 
  FileText, 
  Activity, 
  Server, 
  Database, 
  Volume2, 
  MapPin, 
  MessageSquare,
  FileDigit,
  Fingerprint,
  Mic,
  MicOff,
  PlaySquare,
  Square,
  CheckCircle,
  XCircle
} from 'lucide-react';



// --- MOCK DATA ---
const MOCK_CASES = [
  { id: 'NHAA-0184', priority: 'CRITICAL', type: 'DOMESTIC VIOLENCE', location: 'Near Sealdah Station, Kolkata', phone: '+91-98765-XXXXX', lang: 'Bengali/Hindi', time: '02:14' },
  { id: 'NHAA-0178', priority: 'HIGH', type: 'HARASSMENT', location: 'Howrah Bridge Approach', phone: '+91-99034-XXXXX', lang: 'Hindi', time: '05:42' },
  { id: 'NHAA-0186', priority: 'PENDING', type: 'LEGAL AID REQUEST', location: 'Salt Lake Sector V', phone: '+91-87654-XXXXX', lang: 'English', time: 'Wait: 12m' },
  { id: 'NHAA-0187', priority: 'PENDING', type: 'INFORMATION REQUEST', location: 'Siliguri District', phone: '+91-76543-XXXXX', lang: 'Nepali/Hindi', time: 'Wait: 15m' },
  { id: 'NHAA-0168', priority: 'RESOLVED', type: 'CALLBACK COMPLETED', location: 'Asansol South', phone: '+91-65432-XXXXX', lang: 'Bengali', time: 'Closed' },
];

const PRIORITY_COLORS: Record<string, string> = {
  'CRITICAL': 'var(--critical)',
  'HIGH': 'var(--high)',
  'PENDING': 'var(--pending)',
  'RESOLVED': 'var(--resolved)',
};

// --- COMPONENTS ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'ACTIVE' | 'AUDIT'>('ACTIVE');
  const [selectedCase, setSelectedCase] = useState(MOCK_CASES[0]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-[var(--bg-main)] text-[var(--text-primary)] font-sans text-sm selection:bg-[var(--border)] selection:text-[var(--text-primary)]">
      {/* TOP NAVIGATION BAR */}
      <header className="flex items-center justify-between px-4 py-2 bg-[var(--bg-panel)] border-b border-[var(--border)] shrink-0">
        <div className="flex items-center gap-3 w-1/3">
          <Shield className="w-5 h-5 text-[var(--info-tag)]" />
          <span className="font-bold tracking-wider text-[var(--text-primary)]">NHAA 14566</span>
        </div>
        
        <div className="flex justify-center w-1/3 space-x-1">
          {(['QUEUE', 'ACTIVE', 'AUDIT'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors border ${
                activeTab === tab 
                  ? 'bg-[var(--bg-main)] border-[var(--border)] text-[var(--text-primary)]' 
                  : 'bg-transparent border-transparent text-[var(--text-secondary)] hover:bg-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab === 'QUEUE' ? 'Case Queue' : tab === 'ACTIVE' ? 'Active Call' : 'Evidence / Audit'}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-end gap-6 w-1/3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--resolved)]"></span>
            <span>SECURE SESSION: OPR-442</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <Clock className="w-3.5 h-3.5" />
            {currentTime.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <main className="flex-1 overflow-hidden p-2">
        {activeTab === 'QUEUE' && <CaseQueueView selectedCase={selectedCase} setSelectedCase={setSelectedCase} />}
        {activeTab === 'ACTIVE' && <ActiveCallView currentCase={selectedCase} />}
        {activeTab === 'AUDIT' && <EvidenceAuditView currentCase={selectedCase} />}
      </main>

      {/* BOTTOM STATUS STRIP */}
      <footer className="flex items-center justify-between px-3 py-1 bg-[var(--bg-panel)] border-t border-[var(--border)] shrink-0 text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5" />
            <span>Sys: ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>DB: SYNCED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--resolved)]" />
            <span>LATENCY: 42ms</span>
          </div>
        </div>
        <div className="italic text-[var(--info-tag)]">
          "AI suggestions support — not replace — operator judgment."
        </div>
      </footer>
    </div>
  );
}

// --- VIEWS ---

function CaseQueueView({ selectedCase, setSelectedCase }: { selectedCase: any, setSelectedCase: (c: any) => void }) {
  return (
    <div className="flex flex-col h-full gap-2 overflow-y-auto pr-1">
      {MOCK_CASES.map((c) => (
        <button
          key={c.id}
          onClick={() => setSelectedCase(c)}
          className={`flex text-left w-full bg-[var(--bg-panel)] border border-[var(--border)] transition-colors hover:bg-[var(--border)] focus:outline-none ${
            selectedCase.id === c.id ? 'ring-1 ring-[var(--info-tag)] bg-[var(--border)]' : ''
          }`}
          style={{ borderLeft: `6px solid ${PRIORITY_COLORS[c.priority]}` }}
        >
          <div className="flex flex-col flex-1 p-3 gap-1">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm text-[var(--text-primary)]">{c.id}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-[var(--bg-main)] border border-[var(--border)]" style={{ color: PRIORITY_COLORS[c.priority] }}>
                  {c.priority}
                </span>
                <span className="text-xs font-bold tracking-wide uppercase text-[var(--text-primary)]">{c.type}</span>
              </div>
              <div className="font-mono text-xs text-[var(--text-secondary)]">
                {c.time}
              </div>
            </div>
            
            <div className="flex items-center gap-6 mt-1 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {c.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {c.phone}
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                {c.lang}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function ActiveCallView({ currentCase }: { currentCase: any }) {
  const [isRunning, setIsRunning] = useState(false);
  const [backendUrl, setBackendUrl] = useState(() => {
    return localStorage.getItem('backendUrl') || window.location.origin;
  });

  useEffect(() => {
    localStorage.setItem('backendUrl', backendUrl);
  }, [backendUrl]);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [rawError, setRawError] = useState<string | null>(null);
  const [analysisUnavailable, setAnalysisUnavailable] = useState(false);
  const [turns, setTurns] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [analysis, setAnalysis] = useState<any>({
    riskScore: 0,
    signals: [],
    recommendedActions: [],
    suggestedQuestions: [],
    callerStatus: 'Unknown',
    locationStatus: 'Unknown',
    translations: {}
  });
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const pollInterval = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const isRunningRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const analysisTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Health check polling
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const base = backendUrl.trim() || window.location.origin;
        const res = await fetch(`${base}/health`);
        if (res.ok) {
          setIsConnected(true);
          setRawError(null);
        } else {
          setIsConnected(false);
          setRawError(`Health check failed: ${res.status} ${res.statusText}`);
        }
      } catch (err: any) {
        setIsConnected(false);
        setRawError(err.message || 'Health check failed to fetch');
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  // Auto-scroll transcript when new events arrive
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);
  const toggleIngestion = () => {
    if (isRunning) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setRawError(null);
    setTurns([]);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const base = backendUrl.trim() || window.location.origin;
      let cleanUrl = base.replace(/\/$/, '');
      if (cleanUrl.startsWith('ws://')) cleanUrl = cleanUrl.replace('ws://', 'http://');
      else if (cleanUrl.startsWith('wss://')) cleanUrl = cleanUrl.replace('wss://', 'https://');
      
      const uploadUrl = `${cleanUrl}/api/transcribe_file`;

      const res = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Upload failed with status ${res.status}`);
      }

      const data = await res.json();
      if (data.turns && Array.isArray(data.turns)) {
        setTurns(data.turns);
        analyzeTranscript(data.turns);
      } else {
        throw new Error('Invalid format received from backend');
      }
    } catch (err: any) {
      setRawError(`File Upload Error: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      let wsUrl = '';
      try {
        const base = backendUrl.trim() || window.location.origin;
        const parsedUrl = new URL(base);
        parsedUrl.protocol = parsedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
        parsedUrl.pathname = '/ws/transcribe';
        wsUrl = parsedUrl.toString();
      } catch (e) {
        // Fallback
        const base = backendUrl.trim() || window.location.origin;
        const cleanUrl = base.replace(/\/$/, '').replace(/^http/, 'ws');
        wsUrl = (cleanUrl.startsWith('ws') ? cleanUrl : 'wss://' + cleanUrl) + '/ws/transcribe';
      }
      
      console.log("Connecting WebSocket to:", wsUrl);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
          setIsConnected(true);
          setRawError(null);
          
          let options: MediaRecorderOptions = { mimeType: 'audio/webm;codecs=opus' };
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'audio/webm' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
              options = {};
            }
          }
          
          const recorder = new MediaRecorder(stream, options);
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
              ws.send(e.data);
            }
          };
          recorder.start(250); // Send chunks every 250ms for real-time streaming
          mediaRecorderRef.current = recorder;
          
          setIsRunning(true);
          isRunningRef.current = true;
          setMicError(null);
      };
      
      ws.onmessage = (e) => {
          try {
              const data = JSON.parse(e.data);
              if (data.turns) {
                  handleIncomingTurns(data.turns);
              }
          } catch (err) {}
      };
      
      ws.onerror = (e) => {
          console.error("WebSocket error:", e);
          setRawError('WebSocket connection error. Check backend logs or ngrok warning.');
          stopListening();
      };
      
      ws.onclose = (e) => {
          console.log("WebSocket closed", e.code, e.reason);
          setIsConnected(false);
          stopListening();
      };
      
    } catch (err: any) {
      setMicError(err.message || 'Microphone access denied or unavailable.');
      setIsRunning(false);
      isRunningRef.current = false;
    }
  };

  const stopListening = () => {
    isRunningRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    mediaRecorderRef.current = null;
    setIsRunning(false);
  };

  function handleIncomingTurns(incomingTurns: any[]) {
      setTurns(prevTurns => {
        if (!incomingTurns || incomingTurns.length === 0) return prevTurns;
        let updated = false;
        let finalAdded = false;
        const nextTurns = prevTurns.map(t => ({...t}));

        incomingTurns.forEach((inc: any) => {
          const existingIdx = nextTurns.findIndex(pt => Math.abs(pt.start - inc.start) < 0.2);
          if (existingIdx >= 0) {
            const existing = nextTurns[existingIdx];
            if (inc.speaker) existing.speaker = inc.speaker;
            if (existing.text !== inc.text || existing.end !== inc.end) {
              existing.text = inc.text;
              existing.end = inc.end;
              updated = true;
            } 
            if (inc.isFinal && !existing.isFinal) {
              existing.isFinal = true;
              updated = true;
              finalAdded = true;
            }
          } else {
            const lastTurn = nextTurns[nextTurns.length - 1];
            if (lastTurn && lastTurn.speaker === (inc.speaker || 'Unknown') && (inc.start - lastTurn.end) < 2.0) {
              lastTurn.text += " " + inc.text;
              lastTurn.end = inc.end;
              updated = true;
            } else {
              nextTurns.push({
                speaker: inc.speaker || 'Unknown',
                start: inc.start,
                end: inc.end,
                text: inc.text,
                isFinal: inc.isFinal || false
              });
              updated = true;
              if (inc.isFinal) finalAdded = true;
            }
          }
        });

        nextTurns.sort((a, b) => a.start - b.start);

        if (updated) {
          if (analysisTimerRef.current) clearTimeout(analysisTimerRef.current);
          const now = Date.now();
          const lastAnalysisTime = (analysisTimerRef as any).lastRun || 0;
          if (now - lastAnalysisTime > 15000) {
              (analysisTimerRef as any).lastRun = now;
              analyzeTranscript(nextTurns);
          } else {
              analysisTimerRef.current = setTimeout(() => {
                  (analysisTimerRef as any).lastRun = Date.now();
                  analyzeTranscript(nextTurns);
              }, 15000 - (now - lastAnalysisTime));
          }
          return nextTurns;
        }
        return prevTurns;
      });
  }

  const analyzeTranscript = async (currentTurns: any[]) => {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          turns: currentTurns.map(t => ({
              ...t,
              text: t.isFinal ? t.text : `${t.text} (PARTIAL - DO NOT TRANSLATE)`
          })) 
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis failed');
      }
      const data = await res.json();
      if (data) {
        setAnalysis(prev => ({ ...prev, ...data }));
        setAnalysisUnavailable(false);
      }
    } catch (err: any) {
      console.warn('Failed to run AI analysis:', err.message);
      setAnalysisUnavailable(true);
    }
  };
  const toggleSpeaker = (idx: number) => {
    setTurns(prev => {
      const next = [...prev];
      if (next[idx]) {
        next[idx].speaker = next[idx].speaker === 'Operator' ? 'Caller' : 'Operator';
      }
      return next;
    });
  };

  const renderTextWithHighlights = (text: string, signals: any[]) => {
    if (!text) return null;
    if (!signals || !signals.length) return <span>{text}</span>;
    const dangerWords = signals.flatMap(s => {
      const str = typeof s === 'string' ? s : (s && s.keyword ? s.keyword : JSON.stringify(s || ''));
      return str.toLowerCase().replace(/["']/g, '').split(' ');
    });
    const validWords = dangerWords.filter(w => w.length > 3);
    if (validWords.length === 0) return <span>{text}</span>;
    const regex = new RegExp(`(${validWords.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => {
      if (!part) return <span key={i}>{part}</span>;
      if (dangerWords.some(dw => dw.length > 3 && dw.toLowerCase() === part.toLowerCase())) {
        return <span key={i} className="text-[var(--critical)] bg-[var(--critical)]/10 px-1 font-bold">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };
  const riskScore = analysis.riskScore || 0;
  const riskSignals = analysis.signals || [];
  const recommendedActions = analysis.recommendedActions || [];
  const suggestedQuestions = analysis.suggestedQuestions || [];
  const riskPriority = riskScore >= 90 ? 'critical' : riskScore >= 50 ? 'high' : 'low';
  return (
    <div className="flex flex-col h-full gap-2">
      {/* ACTIVE CALL HEADER */}
      <div className="flex items-center justify-between p-2 bg-[var(--bg-panel)] border border-[var(--border)] shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-mono text-base font-bold text-[var(--text-primary)]">{currentCase.id}</span>
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 px-2 py-1 bg-[var(--bg-main)] border border-[var(--border)]">
            {isConnected === false ? (
              <XCircle className="w-3 h-3 text-[var(--critical)]" />
            ) : isConnected === true ? (
              <CheckCircle className="w-3 h-3 text-[var(--resolved)]" />
            ) : (
              <Activity className="w-3 h-3 text-[var(--text-secondary)]" />
            )}
            <span className={`text-xs font-mono ${isConnected === false ? 'text-[var(--critical)]' : isConnected === true ? 'text-[var(--resolved)]' : 'text-[var(--text-secondary)]'}`}>
              {isConnected === false ? 'BACKEND DISCONNECTED' : isConnected === true ? 'BACKEND CONNECTED' : 'WAITING FOR CONNECTION'}
            </span>
          </div>
          {/* Backend URL Config */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              disabled={isRunning}
              className="bg-[var(--bg-main)] border border-[var(--border)] text-xs text-[var(--text-primary)] px-2 py-1 w-48 focus:outline-none focus:border-[var(--info-tag)] disabled:opacity-50"
              placeholder="Optional: External backend URL"
            />
          </div>

          {/* Ingestion Status */}
          <div className="flex items-center gap-2 px-2 py-1 bg-[var(--bg-main)] border border-[var(--border)]">
            <div className={`w-2.5 h-2.5 rounded-full ${isRunning && isConnected ? 'bg-[var(--critical)] animate-pulse' : 'bg-[var(--text-secondary)]'}`}></div>
            <span className={`text-xs font-mono ${isRunning && isConnected ? 'text-[var(--critical)]' : 'text-[var(--text-secondary)]'}`}>
              {isRunning ? 'POLLING AUDIO TURNS' : 'INGESTION STOPPED'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)] uppercase">AI Risk Assessment</span>
          {analysisUnavailable && (
            <span className="text-[10px] text-[var(--critical)] font-bold animate-pulse">UNAVAILABLE</span>
          )}
          <span className={`text-xs font-bold px-2 py-1 ${riskScore >= 90 ? 'bg-[var(--critical)] text-[var(--bg-main)] border-[var(--critical)]' : riskScore >= 50 ? 'bg-[var(--high)] text-[var(--bg-main)] border-[var(--high)]' : 'bg-[var(--info-tag)] text-[var(--bg-main)] border-[var(--info-tag)]'}`}>
            {riskPriority.toUpperCase()} {riskScore}/100
          </span>
        </div>
      </div>
      {/* 3-COLUMN LAYOUT */}
      <div className="flex flex-1 gap-2 min-h-0">
        
        {/* LEFT COL: Caller Details */}
        <div className="w-1/4 flex flex-col gap-2">
          <div className="flex flex-col bg-[var(--bg-panel)] border border-[var(--border)] flex-1 p-3 gap-4">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border)] pb-2">Caller Profile</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Phone Number</div>
                <div className="font-mono text-sm bg-[var(--bg-main)] p-2 border border-[var(--border)]">{currentCase.phone}</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Source Language</div>
                <div className="font-mono text-sm bg-[var(--bg-main)] p-2 border border-[var(--border)] uppercase">
                  {currentCase.lang}
                </div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Caller Status</div>
                <div className={`font-mono text-sm bg-[var(--bg-main)] p-2 border border-[var(--border)] ${riskScore > 50 ? 'text-[var(--critical)]' : 'text-[var(--info-tag)]'}`}>
                  {analysis.callerStatus || 'Unknown'}
                </div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Geolocation</div>
                <div className="flex flex-col gap-1 font-mono text-xs bg-[var(--bg-main)] p-2 border border-[var(--border)]">
                  <span>{currentCase.location}</span>
                  <span className="text-[10px] text-[var(--info-tag)] uppercase">STATUS: {analysis.locationStatus || 'unknown'}</span>
                </div>
              </div>
            </div>
            {micError && (
              <div className="mt-4 p-3 border border-[var(--critical)] bg-[var(--critical)]/10 text-[var(--critical)] text-xs">
                <strong>Microphone Error</strong>
                <p className="mt-1 opacity-80 break-words">{micError}</p>
              </div>
            )}
            {rawError && (
              <div className="mt-4 p-3 border border-[var(--critical)] bg-[var(--critical)]/10 text-[var(--critical)] text-xs">
                <strong>Backend Error</strong>
                <p className="mt-1 opacity-80 break-words">{rawError}</p>
                {isConnected === false && <p className="mt-2 opacity-80">Make sure your backend server is running and accessible.</p>}
              </div>
            )}
          </div>
        </div>
        {/* CENTER COL: Transcript & Notes */}
        <div className="w-2/4 flex flex-col gap-2">
          <div className="flex flex-col bg-[var(--bg-panel)] border border-[var(--border)] flex-1">
            
            {/* Controls Header */}
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase border-b border-[var(--border)] p-2 bg-[var(--bg-panel)] shrink-0 flex justify-between items-center">
              <span>Live Transcript & Translation</span>
              
              <div className="flex items-center gap-3">
                <input 
                  type="file" 
                  accept="audio/mp3,audio/wav,audio/mpeg,audio/x-wav" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRunning || isUploading}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold border transition-colors bg-[var(--bg-main)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-50"
                >
                  <span className="w-3.5 h-3.5 flex items-center justify-center">⇧</span>
                  {isUploading ? 'UPLOADING...' : 'UPLOAD AUDIO'}
                </button>
                <button 
                  onClick={toggleIngestion}
                  disabled={isUploading}
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold border transition-colors ${
                    isRunning 
                      ? 'bg-[var(--critical)] text-[var(--bg-main)] border-[var(--critical)] animate-pulse' 
                      : 'bg-[var(--bg-main)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)] disabled:opacity-50'
                  }`}
                >
                  {isRunning ? <Square className="w-3 h-3" /> : <PlaySquare className="w-3 h-3" />}
                  {isRunning ? 'STOP LISTENING' : 'START LISTENING'}
                </button>
              </div>
            </h3>
            {/* Transcript Flow */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs text-[var(--text-secondary)] bg-[var(--bg-main)] m-2 border border-[var(--border)]">
              {turns.map((turn, idx) => (
                <div key={idx} className={`flex gap-3`}>
                  <span className="text-[var(--info-tag)] w-12 shrink-0">{turn.start.toFixed(1)}s</span>
                  <span 
                    className="text-[var(--text-primary)] font-bold w-16 shrink-0 truncate cursor-pointer hover:text-[var(--info-tag)] hover:underline transition-colors" 
                    title="Click to correct speaker"
                    onClick={() => toggleSpeaker(idx)}
                  >
                    {turn.speaker}:
                  </span>
                  <div className="flex flex-col gap-1">
                    {/* Display Translation if available, otherwise Original */}
                    {(turn.isFinal && analysis.translations && analysis.translations[idx.toString()]) ? (
                      <>
                        <span>{renderTextWithHighlights(analysis.translations[idx.toString()], riskSignals)}</span>
                        <span className="text-[10px] text-[var(--text-secondary)]/70 italic">
                          {turn.text}
                        </span>
                      </>
                    ) : (
                      <span className={!turn.isFinal ? "opacity-70" : ""}>
                        {renderTextWithHighlights(turn.text, riskSignals)}
                        {(turn.isFinal && analysisUnavailable) && (
                          <span className="ml-2 text-[10px] text-[var(--critical)] opacity-70 italic border border-[var(--critical)] px-1">Translation Failed</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {!isRunning && !isUploading && turns.length === 0 && (
                <div className="flex flex-col justify-center items-center h-full text-[var(--text-secondary)] gap-6 p-8">
                  <div className="text-center italic opacity-60">
                    No transcript data available. Choose an input method to begin.
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={toggleIngestion}
                      className="flex flex-col items-center gap-2 p-6 border-2 border-[var(--border)] hover:border-[var(--info-tag)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-panel)] w-48"
                    >
                      <Mic className="w-8 h-8" />
                      <span className="font-bold text-sm">LIVE AUDIO</span>
                      <span className="text-[10px] opacity-70">Stream via Microphone</span>
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-2 p-6 border-2 border-[var(--border)] hover:border-[var(--info-tag)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-panel)] w-48"
                    >
                      <span className="text-3xl font-bold">⇧</span>
                      <span className="font-bold text-sm">UPLOAD FILE</span>
                      <span className="text-[10px] opacity-70">MP3 / WAV Audio File</span>
                    </button>
                  </div>
                </div>
              )}
              {isRunning && turns.length === 0 && (
                <div className="flex justify-center items-center h-full text-[var(--text-secondary)] opacity-50 italic animate-pulse">
                  <div className="flex flex-col items-center gap-2"><Mic className="w-8 h-8 text-[var(--critical)] animate-bounce" />Listening for live audio...</div>
                </div>
              )}
              {isUploading && turns.length === 0 && (
                <div className="flex justify-center items-center h-full text-[var(--text-secondary)] opacity-70 italic animate-pulse">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xl font-bold">...</span>
                    <span>Uploading and transcribing file...</span>
                  </div>
                </div>
              )}
              
              <div ref={transcriptEndRef} />
            </div>
            
            {/* Operator Notes */}
            <div className="p-2 pt-0 shrink-0">
              <textarea 
                className="w-full h-16 bg-[var(--bg-main)] border border-[var(--border)] p-2 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--info-tag)] resize-none"
                placeholder="Enter operator notes here... (Time-stamped on submit)"
              ></textarea>
            </div>
          </div>
        </div>
        {/* RIGHT COL: AI Insights / Actions */}
        <div className="w-1/4 flex flex-col gap-2 overflow-y-auto">
          {/* Risk Score Panel */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] flex flex-col">
             <div className="bg-[#25394B] p-2 border-b border-[var(--border)] font-bold text-xs uppercase flex justify-between items-center">
               <span>AI Urgency Assessment</span>
               <AlertTriangle className={`w-4 h-4 ${riskScore >= 90 ? 'text-[var(--critical)]' : riskScore >= 50 ? 'text-[var(--high)]' : 'text-[var(--info-tag)]'}`} />
             </div>
             <div className="p-3 bg-[var(--bg-main)] space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span>RISK SCORE</span>
                  <span className={`${riskScore >= 90 ? 'text-[var(--critical)]' : riskScore >= 50 ? 'text-[var(--high)]' : 'text-[var(--info-tag)]'} font-bold`}>{riskScore} / 100</span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-panel)] border border-[var(--border)]">
                  <div className={`h-full ${riskScore >= 90 ? 'bg-[var(--critical)]' : riskScore >= 50 ? 'bg-[var(--high)]' : 'bg-[var(--info-tag)]'}`} style={{ width: `${riskScore}%` }}></div>
                </div>
             </div>
          </div>
          {/* Risk Signals */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] flex flex-col min-h-[100px]">
             <div className="bg-[#25394B] p-2 border-b border-[var(--border)] font-bold text-xs uppercase flex justify-between items-center">
               <span>Detected Risk Signals</span>
               <Activity className="w-4 h-4 text-[var(--info-tag)]" />
             </div>
             <div className="p-2 bg-[var(--bg-main)] text-xs font-mono space-y-1 flex-1">
                {riskSignals.length > 0 ? (
                  riskSignals.map((sig: any, i: number) => (
                    <div key={i} className="flex gap-2 p-1 border-b border-[var(--border)] text-[var(--text-primary)]">
                      <span className="text-[var(--critical)] shrink-0">⚠</span>
                      <span>{typeof sig === 'string' ? sig : `${sig.keyword || sig.category}: ${sig.description || ''}`}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[var(--text-secondary)] italic p-1">No major risk signals detected.</div>
                )}
             </div>
          </div>
          {/* Suggested Follow-ups */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] flex flex-col min-h-[100px]">
             <div className="bg-[#25394B] p-2 border-b border-[var(--border)] font-bold text-xs uppercase flex justify-between items-center">
               <span>Suggested Questions</span>
               <MessageSquare className="w-4 h-4 text-[var(--info-tag)]" />
             </div>
             <div className="p-2 bg-[var(--bg-main)] text-xs space-y-2 text-[var(--text-secondary)] flex-1">
                {suggestedQuestions.length > 0 ? (
                  suggestedQuestions.map((q: string, i: number) => (
                    <div key={i} className="p-2 border border-[var(--border)] bg-[var(--bg-panel)] hover:text-[var(--text-primary)] cursor-pointer">
                      "{q}"
                    </div>
                  ))
                ) : (
                  <div className="italic p-1">Listening for context...</div>
                )}
             </div>
          </div>
          {/* Actions */}
          <div className="bg-[var(--bg-panel)] border border-[var(--border)] flex flex-col mt-auto shrink-0">
             <div className="bg-[#25394B] p-2 border-b border-[var(--border)] font-bold text-xs uppercase">
               <span>Recommended Actions</span>
             </div>
             <div className="p-2 bg-[var(--bg-main)] grid grid-cols-1 gap-2">
                {recommendedActions.length > 0 ? (
                  recommendedActions.map((action: string, i: number) => (
                    <button key={i} className={`w-full p-2 font-bold text-xs uppercase border hover:opacity-90 ${action.includes('Critical') || action.includes('Dispatch') ? 'bg-[var(--critical)] text-[var(--bg-main)] border-[var(--critical)]' : 'bg-[var(--bg-panel)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--border)]'}`}>
                      {action}
                    </button>
                  ))
                ) : (
                  <button className="w-full p-2 bg-[var(--bg-panel)] text-[var(--text-secondary)] font-bold text-xs uppercase border border-[var(--border)] opacity-50 cursor-not-allowed">
                    Awaiting Analysis
                  </button>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function EvidenceAuditView({ currentCase }: { currentCase: any }) {
  return (
    <div className="flex flex-col h-full gap-2 p-2 bg-[var(--bg-panel)] border border-[var(--border)] max-w-5xl mx-auto">
      
      <div className="flex justify-between items-end border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-[var(--text-primary)]">{currentCase.id} - AUDIT RECORD</h2>
          <div className="text-xs text-[var(--text-secondary)] mt-1">Status: <span className="font-bold text-[var(--critical)]">LOCKED / READ-ONLY</span></div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[var(--bg-main)] border border-[var(--border)] text-xs font-mono">
           <Fingerprint className="w-4 h-4 text-[var(--info-tag)]" />
           CHAIN OF CUSTODY VERIFIED
        </div>
      </div>

      <div className="flex gap-4 mt-4 h-full min-h-0 overflow-hidden">
        {/* Audio / Technical Meta */}
        <div className="w-1/2 flex flex-col gap-4">
          
          <div className="border border-[var(--border)] bg-[var(--bg-main)] p-4 flex flex-col gap-4">
            <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase flex items-center gap-2">
              <Volume2 className="w-4 h-4" /> Original Audio Recording
            </h3>
            
            {/* Fake Waveform */}
            <div className="h-16 w-full bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center overflow-hidden px-1 space-x-[2px]">
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="w-1 bg-[var(--info-tag)]" style={{ height: `${Math.max(10, Math.random() * 100)}%`, opacity: i < 30 ? 1 : 0.3 }}></div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono mt-2">
              <div>
                <div className="text-[var(--text-secondary)]">Duration</div>
                <div>03:14:22</div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)]">Format</div>
                <div>PCM / 16kHz / Mono</div>
              </div>
            </div>
          </div>

          <div className="border border-[var(--border)] bg-[var(--bg-main)] p-4 flex flex-col gap-3">
             <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase flex items-center gap-2">
              <FileDigit className="w-4 h-4" /> Cryptographic Signatures
            </h3>
            
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Audio File SHA-256</div>
                <div className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)] break-all select-all">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">Transcript Version</div>
                <div className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)]">
                  v2.4.1-final (Locked)
                </div>
              </div>
              <div>
                <div className="text-[var(--text-secondary)] mb-1">AI Model Checksum</div>
                <div className="p-2 bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-primary)]">
                  gemini-1.5-pro-001 (0xF8A92C)
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Audit Log */}
        <div className="w-1/2 flex flex-col border border-[var(--border)] bg-[var(--bg-main)]">
           <div className="bg-[#25394B] p-3 border-b border-[var(--border)] font-bold text-xs uppercase flex items-center gap-2">
             <FileText className="w-4 h-4 text-[var(--info-tag)]" />
             System Audit Log
           </div>
           <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
              
              <div className="flex gap-4">
                <span className="text-[var(--text-secondary)] w-32 shrink-0">2024-10-24 02:14:01</span>
                <span className="text-[var(--info-tag)] w-24 shrink-0">[SYSTEM]</span>
                <span className="text-[var(--text-primary)]">Inbound call received. Case {currentCase.id} created.</span>
              </div>
              
              <div className="flex gap-4">
                <span className="text-[var(--text-secondary)] w-32 shrink-0">2024-10-24 02:14:05</span>
                <span className="text-[var(--text-secondary)] w-24 shrink-0">[OPERATOR]</span>
                <span className="text-[var(--text-primary)]">Call connected to OPR-442. Recording started.</span>
              </div>

              <div className="flex gap-4">
                <span className="text-[var(--text-secondary)] w-32 shrink-0">2024-10-24 02:14:08</span>
                <span className="text-[var(--high)] w-24 shrink-0">[AI_ENGINE]</span>
                <span className="text-[var(--text-primary)]">Real-time transcription & risk assessment initialized.</span>
              </div>

              <div className="flex gap-4">
                <span className="text-[var(--text-secondary)] w-32 shrink-0">2024-10-24 02:14:19</span>
                <span className="text-[var(--critical)] w-24 shrink-0">[ALERT]</span>
                <span className="text-[var(--text-primary)]">Risk score elevated &gt; 90. Trigger: "Weapon/Heavy object mentioned"</span>
              </div>

              <div className="flex gap-4">
                <span className="text-[var(--text-secondary)] w-32 shrink-0">2024-10-24 02:14:20</span>
                <span className="text-[var(--info-tag)] w-24 shrink-0">[SYSTEM]</span>
                <span className="text-[var(--text-primary)]">Silent supervisor alert triggered. SUP-08 notified.</span>
              </div>

              <div className="flex gap-4">
                <span className="text-[var(--text-secondary)] w-32 shrink-0">2024-10-24 02:14:25</span>
                <span className="text-[var(--text-secondary)] w-24 shrink-0">[OPERATOR]</span>
                <span className="text-[var(--text-primary)]">Operator action: Dispatched PCR Van 42 to geolocation.</span>
              </div>
              
              <div className="flex gap-4">
                <span className="text-[var(--text-secondary)] w-32 shrink-0">2024-10-24 02:17:36</span>
                <span className="text-[var(--text-secondary)] w-24 shrink-0">[OPERATOR]</span>
                <span className="text-[var(--text-primary)]">Call disconnected. Case status set to ACTIVE MONITORING.</span>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
