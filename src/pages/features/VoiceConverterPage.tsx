import React, { useState } from 'react';
import { Repeat, Loader2, SendHorizonal, FileDown, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { askGemini } from '@/lib/gemini';
import { cn, exportToPDF } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { saveHistory } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function VoiceConverterPage() {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [targetVoice, setTargetVoice] = useState<'active' | 'passive'>('active');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    
    const prompt = `Convert the following English text to ${targetVoice} voice: "${text}". 

Output Format:
### Converted Version:
[The text converted to ${targetVoice} voice]

### Analysis:
- **Major Changes**: [Briefly list verbs or subjects that changed]
- **Clarification**: [Explain why this voice is better for this specific sentence context]`;

    const systemPrompt = `You are a professional editor specializing in grammatical transformations. 
    Help users switch between Active and Passive voice while maintaining the original meaning and improving clarity.`;
    
    const output = await askGemini(prompt, systemPrompt);
    setResult(output);
    setLoading(false);

    // Save to history
    if (user && output) {
      saveHistory({
        user_id: user.id,
        feature_type: 'voice-converter',
        query_text: text,
        result_text: output
      });
    }
  };

  const handleExport = () => {
    if (result) {
      exportToPDF('result-content', `voice-converter-${Date.now()}`);
    }
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
          <Repeat className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-serif">Voice Converter</h1>
          <p className="text-clay/50 text-sm">Switch between Active and Passive voice effortlessly</p>
        </div>
      </header>

      <div className="bg-white p-8 rounded-[40px] border border-clay/5 shadow-xl space-y-8">
        <div className="flex gap-4">
          <button
            onClick={() => setTargetVoice('active')}
            className={cn(
              "flex-1 py-4 rounded-2xl border-2 transition-all font-serif text-lg",
              targetVoice === 'active' 
                ? "border-maroon bg-maroon/5 text-maroon font-bold" 
                : "border-clay/5 text-clay/40 hover:border-maroon/20"
            )}
          >
            Active Voice
          </button>
          <button
            onClick={() => setTargetVoice('passive')}
            className={cn(
              "flex-1 py-4 rounded-2xl border-2 transition-all font-serif text-lg",
              targetVoice === 'passive' 
                ? "border-maroon bg-maroon/5 text-maroon font-bold" 
                : "border-clay/5 text-clay/40 hover:border-maroon/20"
            )}
          >
            Passive Voice
          </button>
        </div>

        <div className="relative group">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter a sentence or paragraph to convert..."
            className="w-full h-48 p-8 bg-cream/30 rounded-[32px] border border-clay/10 focus:outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 transition-all font-serif text-xl resize-none"
          />
          <button
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="absolute bottom-6 right-6 bg-maroon text-cream p-4 rounded-full shadow-lg shadow-maroon/30 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <SendHorizonal className="w-6 h-6" />}
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
            <div className="absolute top-8 right-8 flex gap-2">
              <button
                onClick={handleExport}
                className="p-3 rounded-xl hover:bg-clay/5 transition-colors text-clay/40 group relative"
                title="Export as PDF"
              >
                <FileDown className="w-5 h-5 group-hover:text-maroon transition-colors" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-clay text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Export PDF</span>
              </button>
              <button 
                onClick={copyToClipboard}
                className="p-3 rounded-xl hover:bg-clay/5 transition-colors text-clay/40 group"
                title="Copy result"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 group-hover:text-maroon transition-colors" />}
              </button>
            </div>
            
            <div id="result-content">
              <h3 className="text-[10px] uppercase tracking-[0.2em] text-maroon font-bold mb-6 border-b border-maroon/10 pb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-maroon animate-pulse" />
                Transformation Result
              </h3>
              <div className="space-y-8 markdown-body font-sans">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
