import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { HistoryItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Clock, Trash2, ChevronRight, FileText, Languages, MessageSquare, BookOpen, Quote, Sparkles, Filter, FileDown } from 'lucide-react';
import { cn, exportToPDF } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

const FEATURE_ICONS: Record<string, any> = {
  'smart-translate': Languages,
  'fix-improve': Sparkles,
  'word-insight': BookOpen,
  'quick-reply': MessageSquare,
  'slang-decoder': Quote,
  'level-simplifier': FileText,
  'synonym-finder': Search,
};

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('history')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting history item:', error);
    } else {
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const filteredHistory = history.filter(item => 
    item.query_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.feature_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif">Explore History</h1>
          <p className="text-clay/50 text-sm">Review and export your previous linguistic insights</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-clay/30" />
          <input
            type="text"
            placeholder="Search your history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3 bg-white border border-clay/10 rounded-2xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-maroon/10 focus:border-maroon/20 transition-all text-sm"
          />
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* List Side */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 bg-white/50 border border-clay/5 rounded-3xl animate-pulse" />
              ))
            ) : filteredHistory.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-clay/30 gap-4">
                <History className="w-12 h-12 opacity-20" />
                <p className="font-medium">No history entries found</p>
              </div>
            ) : (
              filteredHistory.map((item) => {
                const Icon = FEATURE_ICONS[item.feature_type] || Search;
                const isSelected = selectedItem?.id === item.id;

                return (
                  <motion.div
                    layoutId={item.id}
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "p-5 rounded-3xl border transition-all cursor-pointer group flex items-center gap-4",
                      isSelected 
                        ? "bg-maroon text-cream border-maroon shadow-xl shadow-maroon/20" 
                        : "bg-white border-clay/5 hover:border-maroon/20 hover:shadow-lg hover:shadow-maroon/5 text-clay"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                      isSelected ? "bg-white/10" : "bg-cream"
                    )}>
                      <Icon className={cn("w-5 h-5", isSelected ? "text-cream" : "text-maroon")} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md",
                          isSelected ? "bg-white/20 text-cream" : "bg-maroon/5 text-maroon"
                        )}>
                          {item.feature_type.replace('-', ' ')}
                        </span>
                        <span className={cn(
                          "text-[9px] font-mono",
                          isSelected ? "text-cream/50" : "text-clay/30"
                        )}>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-serif text-lg truncate leading-none">"{item.query_text}"</h4>
                    </div>

                    <button
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className={cn(
                        "p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100",
                        isSelected ? "hover:bg-white/10 text-cream" : "hover:bg-red-50 text-red-400"
                      )}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className={cn("w-4 h-4", isSelected ? "text-cream/30" : "text-clay/10")} />
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Side */}
        <div className="lg:w-[450px] shrink-0">
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white h-full border border-clay/5 rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-8 border-b border-clay/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-maroon/5 text-maroon rounded-xl flex items-center justify-center">
                      {React.createElement(FEATURE_ICONS[selectedItem.feature_type] || Search, { className: "w-5 h-5" })}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold">Entry Details</h3>
                      <p className="text-[10px] text-clay/40 uppercase tracking-widest">{new Date(selectedItem.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => exportToPDF('history-detail-content', `eloquence-history-${selectedItem.id}`)}
                    className="flex items-center gap-2 bg-maroon text-cream px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-maroon/20"
                  >
                    <FileDown className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar" id="history-detail-content">
                  <div className="mb-10 text-center">
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-maroon/30 block mb-4">Input Query</span>
                    <h2 className="text-4xl font-serif text-maroon">"{selectedItem.query_text}"</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="p-6 bg-cream/30 rounded-3xl border border-clay/5 relative opacity-30 pointer-events-none">
                       <span className="absolute -top-3 left-6 px-2 bg-white text-[10px] font-bold uppercase tracking-widest text-clay/40">Metadata</span>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] text-clay/30 uppercase font-bold">Feature</p>
                            <p className="text-xs font-bold text-clay capitalize">{selectedItem.feature_type.replace('-', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-clay/30 uppercase font-bold">Timestamp</p>
                            <p className="text-xs font-bold text-clay">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                          </div>
                       </div>
                    </div>

                    <div className="markdown-body">
                       <ReactMarkdown>{selectedItem.result_text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-cream/20 h-full border-2 border-dashed border-clay/10 rounded-[40px] flex flex-col items-center justify-center p-12 text-center text-clay/30">
                <Clock className="w-12 h-12 mb-6 opacity-10" />
                <h3 className="font-serif text-xl mb-2">No entry selected</h3>
                <p className="text-sm">Click on a history item to view the detailed linguistic analysis and export it to PDF.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
