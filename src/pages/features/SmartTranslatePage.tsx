import React, { useState } from 'react';
import { Languages, Loader2, SendHorizonal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askGemini } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartTranslatePage() {
  const [text, setText] = useState('');
  const [direction, setDirection] = useState<'ID_EN' | 'EN_ID'>('ID_EN');
  const [context, setContext] = useState('casual');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const contexts = [
    { id: 'formal', label: 'Formal' },
    { id: 'casual', label: 'Casual' },
    { id: 'friend', label: 'Friend' },
    { id: 'teacher', label: 'Teacher' },
    { id: 'boss', label: 'Boss' },
  ];

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    const prompt = `Translate the following text from ${direction === 'ID_EN' ? 'Indonesian to English' : 'English to Indonesian'}.
Context level: ${context}
Text: "${text}"

Rules:
- If ID -> EN, output: 
### Context Translation:
[the translation]
### Alternative Version:
[another variation]

- If EN -> ID, output:
### Formal Meaning:
[formal translation]
### Casual Meaning:
[casual translation]`;

    const systemPrompt = "You are a highly skilled linguistic assistant. Provide translations that focus on natural flow and context rather than word-for-word translation.";
    
    const output = await askGemini(prompt, systemPrompt);
    setResult(output);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-maroon/5 text-maroon rounded-2xl flex items-center justify-center">
          <Languages className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-serif">Smart Translate</h1>
          <p className="text-clay/50 text-sm">Context-aware multilingual assistant</p>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[32px] border border-clay/5 shadow-sm space-y-6">
        <div className="flex flex-wrap gap-4 items-center p-2 bg-cream/50 rounded-2xl w-fit">
          <button 
            onClick={() => setDirection('ID_EN')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              direction === 'ID_EN' ? "bg-maroon text-cream shadow-md" : "text-clay/60 hover:text-maroon"
            )}
          >
            ID → EN
          </button>
          <button 
            onClick={() => setDirection('EN_ID')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-bold transition-all",
              direction === 'EN_ID' ? "bg-maroon text-cream shadow-md" : "text-clay/60 hover:text-maroon"
            )}
          >
            EN → ID
          </button>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-clay/40 font-bold mb-3">Context Usage</label>
          <div className="flex flex-wrap gap-3">
            {contexts.map((c) => (
              <button
                key={c.id}
                onClick={() => setContext(c.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-medium border transition-all",
                  context === c.id 
                    ? "bg-maroon text-cream border-maroon" 
                    : "border-clay/10 text-clay/60 hover:border-maroon/20 hover:text-maroon"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-40 p-6 bg-cream/30 rounded-3xl border border-clay/10 focus:outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 transition-all resize-none font-sans text-lg"
          />
          <button
            onClick={handleTranslate}
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
              Linguistic Analysis Result
            </h3>
            <div className="space-y-8">
              {result.split('###').map((part, i) => {
                if (!part.trim()) return null;
                const [title, ...contentLines] = part.split('\n');
                const content = contentLines.join('\n').trim();
                return (
                  <div key={i}>
                     <h4 className="text-maroon font-serif text-xl mb-3 font-bold">{title.trim()}</h4>
                     <div className="bg-cream/40 p-4 rounded-xl border-l-4 border-maroon/20 markdown-body">
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
