import React, { useState } from 'react';
import { MessageSquare, Loader2, SendHorizonal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askGemini } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuickReplyPage() {
  const [text, setText] = useState('');
  const [tone, setTone] = useState('polite');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const tones = [
    { id: 'polite', label: 'Polite' },
    { id: 'casual', label: 'Casual' },
    { id: 'formal', label: 'Formal' },
    { id: 'friendly', label: 'Friendly' },
  ];

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    const prompt = `Give 3 English reply options for the following incoming message in a ${tone} tone.
Message: "${text}"

Output Format:
### Reply 1:
[option 1]
### Reply 2:
[option 2]
### Reply 3:
[option 3]`;

    const systemPrompt = "You are a communication expert. Help users reply to messages with the perfect tone and etiquette. Respond strictly using the requested output format.";
    
    const output = await askGemini(prompt, systemPrompt);
    setResult(output);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-maroon/5 text-maroon rounded-2xl flex items-center justify-center">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-serif">Quick Reply</h1>
          <p className="text-clay/50 text-sm">Instant replies tailored to any communication tone</p>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[32px] border border-clay/5 shadow-sm space-y-6">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-clay/40 font-bold mb-3">Tone Selection</label>
          <div className="flex flex-wrap gap-3">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium border transition-all",
                  tone === t.id 
                    ? "bg-maroon text-cream border-maroon shadow-lg shadow-maroon/20" 
                    : "border-clay/10 text-clay/60 hover:border-maroon/20 hover:text-maroon"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the message you received..."
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
            className="grid gap-6"
          >
             {result.split('###').map((part, i) => {
                if (!part.trim()) return null;
                const [title, ...contentLines] = part.split('\n');
                const content = contentLines.join('\n').trim();
                return (
                  <div key={i} className="bg-white p-8 rounded-[32px] border border-clay/5 shadow-sm hover:shadow-md transition-shadow">
                     <h4 className="text-maroon font-serif text-lg mb-4 italic">{title.trim()}</h4>
                     <div className="text-xl text-clay/80 leading-relaxed markdown-body">
                        <ReactMarkdown>{content}</ReactMarkdown>
                     </div>
                  </div>
                );
              })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
