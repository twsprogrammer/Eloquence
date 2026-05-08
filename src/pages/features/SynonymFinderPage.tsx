import React, { useState } from 'react';
import { Search, Loader2, Copy, Check, Book } from 'lucide-react';
import { askGemini } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function SynonymFinderPage() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    
    const prompt = `Find synonyms for the English word: "${text}". 

Output Format:
### Common Synonyms:
[list common synonyms]

### Contextual Synonyms:
**[Context Name]**: [list synonyms for this context] - *Brief explanation*.

### Nuance Differences:
[Briefly explain the difference between some synonyms]`;

    const systemPrompt = "You are an expert linguist and thesaurus. Help users find perfect synonyms with context and nuance explanations.";
    
    const output = await askGemini(prompt, systemPrompt);
    setResult(output);
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="flex items-center gap-6">
        <div className="w-16 h-16 bg-maroon/5 rounded-[24px] flex items-center justify-center text-maroon">
          <Search className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-serif">Synonym Finder</h1>
          <p className="text-clay/50 text-sm">Find the perfect word match for your context</p>
        </div>
      </header>

      <div className="relative group">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-clay/30 group-focus-within:text-maroon transition-colors" />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleProcess()}
            placeholder="Search synonym (e.g., 'Happy')"
            className="w-full pl-16 pr-24 py-6 bg-cream/30 rounded-full border border-clay/10 focus:outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 transition-all font-serif text-2xl"
          />
          <button
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-maroon text-cream px-8 py-3 rounded-full shadow-lg shadow-maroon/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all font-bold"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Search"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-10 rounded-[40px] border border-clay/5 shadow-xl relative"
          >
            <button 
              onClick={copyToClipboard}
              className="absolute top-8 right-8 p-3 rounded-xl hover:bg-clay/5 transition-colors text-clay/40 group"
              title="Salin hasil"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 group-hover:text-maroon transition-colors" />}
            </button>
            
            <h2 className="text-5xl font-serif text-maroon mb-12 border-b border-maroon/5 pb-6">"{text}"</h2>
            
            <div className="markdown-body">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!result && !loading && (
        <div className="text-center py-20 opacity-20">
           <Book className="w-20 h-20 mx-auto mb-4" />
           <p className="font-serif italic text-xl">Great words start here.</p>
        </div>
      )}
    </div>
  );
}
