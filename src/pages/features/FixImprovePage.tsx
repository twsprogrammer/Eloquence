import React, { useState } from 'react';
import { Sparkles, Loader2, SendHorizonal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askGemini } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function FixImprovePage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    const prompt = `Fix and improve the following English sentence(s). Provide a structured output.
Sentence: "${text}"

Output Format:
### Corrected Sentence:
[grammatically correct version]

### Natural Version:
[how a native speaker would say it naturally]

### Short Explanation:
[briefly explain why the changes were made]`;

    const systemPrompt = "You are a professional editor. Improve English sentences to be more natural and grammatically perfect.";
    
    const output = await askGemini(prompt, systemPrompt);
    setResult(output);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-maroon/5 text-maroon rounded-2xl flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-serif">Fix & Improve</h1>
          <p className="text-clay/50 text-sm">Natural sounding sentences and grammar corrections</p>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[32px] border border-clay/5 shadow-sm space-y-6">
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your English sentence here..."
            className="w-full h-40 p-6 bg-cream/30 rounded-3xl border border-clay/10 focus:outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 transition-all resize-none font-sans text-lg"
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
            className="bg-white p-10 rounded-[32px] border border-clay/5 shadow-xl"
          >
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-maroon font-bold mb-6 border-b border-maroon/10 pb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-maroon animate-pulse" />
              Linguistic Refinement
            </h3>
            <div className="space-y-8">
                {result.split('###').map((part, i) => {
                  if (!part.trim()) return null;
                  const [title, ...contentLines] = part.split('\n');
                  const content = contentLines.join('\n').trim();
                  return (
                    <div key={i}>
                       <h4 className="text-clay/40 font-bold uppercase tracking-widest text-[10px] mb-2">{title.trim()}</h4>
                       <div className="bg-cream/20 p-5 rounded-2xl border border-clay/5 text-lg leading-relaxed font-medium markdown-body">
                          <ReactMarkdown>{content}</ReactMarkdown>
                       </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
