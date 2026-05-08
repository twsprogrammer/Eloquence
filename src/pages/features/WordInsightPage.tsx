import React, { useState } from 'react';
import { BookOpen, Loader2, SendHorizonal, Search } from 'lucide-react';
import { askGemini } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function WordInsightPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    
    const prompt = `Provide deep insights for the English word: "${text}". 
IMPORTANT: Use normal sentence case (do NOT use all caps).

Output Format:
Briefly introduce the word in one or two sentences.

### Meanings:
[list multiple meanings or nuances]

### Example Sentences:
[provide 3 contextual examples]

### Usage Explanation:
[explain when to use and when to avoid it]`;

    const systemPrompt = "You are an expert lexicographer. Provide deep, easy-to-understand insights about specific English words. Always use natural sentence casing, never all-caps unless for emphasis in specific words. Format your output in Markdown.";
    
    const output = await askGemini(prompt, systemPrompt);
    setResult(output);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center gap-4">
        <div className="w-12 h-12 bg-maroon/5 text-maroon rounded-2xl flex items-center justify-center">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-serif">Word Insight</h1>
          <p className="text-clay/50 text-sm">Deep linguistic and vocabulary usage details</p>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[32px] border border-clay/5 shadow-sm space-y-6">
        <div className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-clay/30">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
            placeholder="Search word (e.g., 'Eloquence')"
            className="w-full pl-16 pr-24 py-6 bg-cream/30 rounded-full border border-clay/10 focus:outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 transition-all font-serif text-2xl"
          />
          <button
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-maroon text-cream px-8 py-3 rounded-full shadow-lg shadow-maroon/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all font-bold"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Inspect"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-12 rounded-[48px] border border-clay/5 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-maroon opacity-5">
              <BookOpen className="w-32 h-32" />
            </div>
            
            <h2 className="text-5xl font-serif text-maroon mb-12 border-b border-maroon/5 pb-6">"{text}"</h2>
            
            <div className="markdown-body">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
