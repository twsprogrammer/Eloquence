import React, { useState } from 'react';
import { Zap, Loader2, SendHorizonal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askGemini } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function LevelSimplifierPage() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState('B1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    const prompt = `Simplify the following English text to ${level} level. 
Original Text: "${text}"

Rules:
- Adjust vocabulary to match ${level} CEFR level.
- Keep the original meaning intact.
- Output ONLY the simplified version.`;

    const systemPrompt = "You are a specialized ESL teacher. Adjust English text complexity to match specific CEFR levels accurately.";
    
    const output = await askGemini(prompt, systemPrompt);
    setResult(output);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-maroon/5 text-maroon rounded-2xl flex items-center justify-center">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-serif">Level Simplifier</h1>
          <p className="text-clay/50 text-sm">Adjust any text to your specific English proficiency level</p>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[32px] border border-clay/5 shadow-sm space-y-6">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-clay/40 font-bold mb-3">Target Level (CEFR)</label>
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={cn(
                  "w-12 h-12 rounded-full text-xs font-bold border transition-all flex items-center justify-center",
                  level === l 
                    ? "bg-maroon text-cream border-maroon shadow-lg shadow-maroon/20" 
                    : "border-clay/10 text-clay/60 hover:border-maroon/20 hover:text-maroon"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste a complex English text here..."
            className="w-full h-48 p-6 bg-cream/30 rounded-3xl border border-clay/10 focus:outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 transition-all resize-none font-sans text-lg"
          />
          <button
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="absolute bottom-4 right-4 bg-maroon text-cream p-4 rounded-2xl shadow-lg shadow-maroon/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizonal className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[40px] border border-clay/5 shadow-xl"
          >
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-maroon mb-6 border-b border-maroon/10 pb-4">Simplified Version ({level})</h3>
            <div className="text-xl leading-relaxed text-clay/80 font-sans markdown-body">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
