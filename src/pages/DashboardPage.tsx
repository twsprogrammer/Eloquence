import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Languages, 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  Hash, 
  Zap,
  ArrowRight,
  Search,
  Repeat
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const tools = [
  { 
    id: 'smart-translate', 
    title: 'Smart Translate', 
    desc: 'Context-aware multilingual assistant.',
    icon: Languages, 
    color: 'bg-maroon/5 text-maroon',
    path: '/app/smart-translate'
  },
  { 
    id: 'fix-improve', 
    title: 'Fix & Improve', 
    desc: 'Natural sounding sentences.',
    icon: Sparkles, 
    color: 'bg-maroon/5 text-maroon',
    path: '/app/fix-improve'
  },
  { 
    id: 'word-insight', 
    title: 'Word Insight', 
    desc: 'Deep linguistic usage details.',
    icon: BookOpen, 
    color: 'bg-maroon/5 text-maroon',
    path: '/app/word-insight'
  },
  { 
    id: 'synonym-finder', 
    title: 'Synonym Finder', 
    desc: 'Find the perfect word match.',
    icon: Search, 
    color: 'bg-maroon/5 text-maroon',
    path: '/app/synonym-finder'
  },
  { 
    id: 'quick-reply', 
    title: 'Quick Reply', 
    desc: 'Instant replies in any tone.',
    icon: MessageSquare, 
    color: 'bg-maroon/5 text-maroon',
    path: '/app/quick-reply'
  },
  { 
    id: 'slang-decoder', 
    title: 'Slang Decoder', 
    desc: 'Modern English understood.',
    icon: Hash, 
    color: 'bg-maroon/5 text-maroon',
    path: '/app/slang-decoder'
  },
  { 
    id: 'level-simplifier', 
    title: 'Level Simplifier', 
    desc: 'Language adjusted to you.',
    icon: Zap, 
    color: 'bg-maroon/5 text-maroon',
    path: '/app/level-simplifier'
  },
  { 
    id: 'voice-converter', 
    title: 'Voice Converter', 
    desc: 'Switch between Active & Passive voice.',
    icon: Repeat, 
    color: 'bg-maroon/5 text-maroon',
    path: '/app/voice-converter'
  },
];

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-12">
      {/* Header */}
      <section>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest text-clay/40 mb-2">Linguistic Assistant</h2>
          <h1 className="text-5xl font-serif mb-6">
            Good to see you, <span className="text-maroon italic">{profile?.full_name || profile?.username}</span>.
          </h1>
          <p className="text-clay/60 border-l-2 border-maroon/20 pl-6 py-2 italic font-serif">
            Eloquence helps you adapt your English to any situation—whether professional, social, or creative. 
            Choose a tool below to find the perfect words for your context.
          </p>
        </motion.div>
      </section>

      {/* Quick Access Grid */}
      <section>
        <h3 className="text-xl font-serif mb-8 border-b border-clay/10 pb-4">Our Linguistic Tools</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={tool.path}
                className="group block p-8 bg-white border border-clay/5 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-maroon/5 transition-all relative overflow-hidden"
              >
                <div className={tool.color + " w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"}>
                  <tool.icon className="w-6 h-6" />
                </div>
                <h4 className="text-2xl font-serif mb-2">{tool.title}</h4>
                <p className="text-clay/60 text-sm mb-6 leading-relaxed">{tool.desc}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-maroon opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Tool <ArrowRight className="w-4 h-4" />
                </div>
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] scale-150 rotate-12 group-hover:scale-125 transition-transform">
                  <tool.icon className="w-24 h-24" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-12 pb-6 border-t border-clay/10 text-center">
        <p className="text-clay/40 font-serif text-sm italic">
          Created with eloquence & care.
        </p>
      </footer>
    </div>
  );
}
