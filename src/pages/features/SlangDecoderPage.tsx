import React, { useState } from 'react';
import { Hash, Loader2, SendHorizonal, FileDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askGemini } from '@/lib/gemini';
import { cn, exportToPDF } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { saveHistory } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function SlangDecoderPage() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'sentence' | 'word'>('sentence');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    const prompt = mode === 'sentence' 
      ? `Decode this slang sentence and change it to formal English: "${text}"`
      : `Provide the meaning and example usage for this English slang word: "${text}"`;

    const systemPrompt = "You are a modern linguist expert in Gen-Z and urban English slang. Translate slang into standard/formal English or explain it clearly.";
    
    const output = await askGemini(prompt, systemPrompt);
    setResult(output);
    setLoading(false);

    // Save to history
    if (user && output) {
      saveHistory({
        user_id: user.id,
        feature_type: 'slang-decoder',
        query_text: text,
        result_text: output
      });
    }
  };

  const handleExport = () => {
    if (result) {
      exportToPDF('result-content', `slang-decoder-${Date.now()}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-maroon/5 text-maroon rounded-2xl flex items-center justify-center">
          <Hash className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-serif">Slang Decoder</h1>
          <p className="text-clay/50 text-sm">Decode modern English slang and Gen-Z speak</p>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[32px] border border-clay/5 shadow-sm space-y-6">
        <div className="flex gap-4 p-1 bg-cream/50 rounded-2xl w-fit">
          <button 
            onClick={() => setMode('sentence')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              mode === 'sentence' ? "bg-maroon text-cream shadow-md" : "text-clay/60 hover:text-maroon"
            )}
          >
            Slang Sentence
          </button>
          <button 
            onClick={() => setMode('word')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              mode === 'word' ? "bg-maroon text-cream shadow-md" : "text-clay/60 hover:text-maroon"
            )}
          >
            Slang Word
          </button>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === 'sentence' ? "e.g., 'That movie was mid no cap fr'" : "e.g., 'mid' or 'no cap'"}
            className="w-full h-32 p-6 bg-cream/30 rounded-3xl border border-clay/10 focus:outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 transition-all resize-none font-sans text-lg"
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
            className="bg-maroon text-cream p-10 rounded-[32px] shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={handleExport}
                className="bg-white/10 text-cream p-2 rounded-xl hover:bg-white/20 transition-colors group relative"
                title="Export as PDF"
              >
                <FileDown className="w-5 h-5" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-maroon text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Export PDF</span>
              </button>
            </div>
            
            <div id="result-content">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Hash className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] uppercase tracking-widest font-black mb-6 border-b border-cream/20 pb-4">Interpretation</h3>
                <div className="text-xl md:text-2xl font-serif italic leading-relaxed markdown-body text-cream!">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
