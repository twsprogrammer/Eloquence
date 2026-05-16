import React, { useState } from 'react';
import { BookOpen, Loader2, SendHorizonal, Search, FileDown, Copy, Check } from 'lucide-react';
import { askGemini } from '@/lib/gemini';
import { cn, exportToPDF } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { saveHistory } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function WordInsightPage() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

    // Save to history
    if (user && output) {
      saveHistory({
        user_id: user.id,
        feature_type: 'word-insight',
        query_text: text,
        result_text: output
      });
    }
  };

  const handleExport = () => {
    if (result) {
      exportToPDF('result-content', `word-insight-${text.toLowerCase()}`);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="absolute top-0 right-0 p-8 flex gap-2">
              <button
                onClick={handleExport}
                className="bg-maroon/5 text-maroon p-3 rounded-full hover:bg-maroon/10 transition-colors tooltip relative group"
                title="Export as PDF"
              >
                <FileDown className="w-6 h-6" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-clay text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Export PDF</span>
              </button>
              <button
                onClick={copyToClipboard}
                className="bg-maroon/5 text-maroon p-3 rounded-full hover:bg-maroon/10 transition-colors group relative"
                title="Copy result"
              >
                {copied ? <Check className="w-6 h-6 text-green-600" /> : <Copy className="w-6 h-6" />}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-clay text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Copy Result</span>
              </button>
              <div className="text-maroon opacity-5">
                <BookOpen className="w-32 h-32" />
              </div>
            </div>
            
            <div id="result-content">
              <h2 className="text-5xl font-serif text-maroon mb-12 border-b border-maroon/5 pb-6">"{text}"</h2>
              
              <div className="markdown-body">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
