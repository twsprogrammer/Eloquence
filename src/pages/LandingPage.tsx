import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowRight, 
  Languages, 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  ChevronDown 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const features = [
  {
    title: "Smart Translate",
    description: "Translate with context. Understand the difference between being formal with a boss and casual with a friend.",
    icon: Languages,
  },
  {
    title: "Fix & Improve",
    description: "Don't just fix grammar. Make your sentences sound more natural and professional for any situation.",
    icon: Sparkles,
  },
  {
    title: "Quick Reply",
    description: "Craft the perfect response instantly. Set your tone and never worry about sounding rude or awkward again.",
    icon: MessageSquare,
  },
  {
    title: "Word Insight",
    description: "Go beyond definitions. Learn how words are actually used in real-life conversations and settings.",
    icon: BookOpen,
  }
];

const faqs = [
  {
    q: "What is Eloquence?",
    a: "Eloquence is an English language assistant designed to help you use words and sentences accurately according to context, rather than just literal translation."
  },
  {
    q: "How is it different from a standard translator?",
    a: "Eloquence adjusts the tone and style based on your specific situation, whether it is formal, casual, or for a particular communication goal."
  },
  {
    q: "Are the results always accurate?",
    a: "Our results are crafted to sound natural and context-appropriate. However, we always recommend a final review for high-stakes formal communication."
  },
  {
    q: "Is this tool free to use?",
    a: "Yes, all current features are available for free."
  },
  {
    q: "Who is Eloquence for?",
    a: "Students, professionals, and anyone who wants to communicate in English with more precision and confidence."
  }
];

function Accordion({ question, answer }: { question: string, answer: string, key?: React.Key }) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-maroon/10 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full justify-between items-center text-left hover:text-maroon transition-colors group"
      >
        <span className="font-serif text-lg md:text-xl font-medium">{question}</span>
        <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isOpen && "rotate-180 text-maroon")} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pt-4 text-clay/70 leading-relaxed max-w-2xl">{answer}</p>
      </motion.div>
    </div>
  );
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/app');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-cream selection:bg-maroon selection:text-cream">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-cream/80 backdrop-blur-md border-b border-maroon/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-serif text-maroon font-black">E</span>
            <span className="text-xl font-serif font-bold tracking-tight">Eloquence</span>
          </div>
          <div className="flex items-center gap-8">
             {user ? (
               <Link to="/app" className="bg-maroon text-cream px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-maroon/20 hover:scale-105 active:scale-95 transition-all">
                  Dashboard
               </Link>
             ) : (
               <>
                 <Link to="/login" className="text-sm font-medium hover:text-maroon transition-colors hidden sm:block">Login</Link>
                 <Link to="/login" className="bg-maroon text-cream px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-maroon/20 hover:scale-105 active:scale-95 transition-all">
                    Get Started
                 </Link>
               </>
             )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6 overflow-hidden relative">
        <div className="absolute top-48 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] bg-maroon/5 rounded-full blur-3xl -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-serif mb-8 leading-[0.9]"
          >
            Speak English <br/>
            <span className="text-maroon italic">the right way.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-clay/50 mb-12 font-serif italic tracking-wide max-w-xl mx-auto"
          >
            Where words find their place
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              to={user ? "/app" : "/login"}
              className="inline-flex items-center gap-3 bg-maroon text-cream px-10 py-5 rounded-full text-lg font-bold shadow-2xl shadow-maroon/30 hover:bg-maroon-light transition-all group"
            >
              {user ? "Go to Dashboard" : "Get Started"} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-white border border-maroon/5 shadow-sm hover:shadow-xl hover:shadow-maroon/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-maroon/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-maroon group-hover:text-cream transition-all">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-serif mb-4">{f.title}</h3>
                <p className="text-clay/60 leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Explanation Section */}
      <section className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1">
             <div className="inline-block px-4 py-1 rounded-full border border-maroon/20 text-maroon text-xs font-bold uppercase tracking-widest mb-6">How it works</div>
             <h2 className="text-5xl md:text-6xl font-serif mb-10 leading-tight">
                Context is everything in <span className="italic">conversation.</span>
             </h2>
             
             <div className="space-y-8">
                {[
                  { t: "Beyond Literal Translation", d: "We don't just change words. We ensure your emotional and social intent is accurately conveyed in every sentence." },
                  { t: "AI Tuned for Nuance", d: "Our AI models are specially trained to distinguish between professional, casual, and intimate social settings." },
                  { t: "Educational Insights", d: "Every result comes with a brief explanation of why a particular phrase fits better than another, helping you learn faster." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-maroon font-serif text-3xl opacity-30 mt-1">{i + 1}.</div>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.t}</h4>
                      <p className="text-clay/60 leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="flex-1 relative">
             <div className="relative z-10 rounded-[48px] overflow-hidden shadow-2xl border-8 border-white bg-clay/5 flex items-center justify-center min-h-[400px]">
                <img 
                  src="https://images.unsplash.com/photo-1523240715630-97eb9da7135e?q=80&w=2070&auto=format&fit=crop" 
                  alt="A group of people studying and communicating elegantly" 
                  className="w-full h-auto grayscale-[0.2] transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop";
                  }}
                />
             </div>
             <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-maroon/10 rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-6 bg-maroon/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-16 underline decoration-maroon/20 underline-offset-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Accordion key={i} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-maroon/5 flex flex-col items-center gap-6">
         <div className="flex items-center gap-2">
            <span className="text-3xl font-serif text-maroon font-black">E</span>
            <span className="text-xl font-serif font-bold">Eloquence</span>
         </div>
         <p className="text-sm text-clay/40 font-mono italic">© 2026 Eloquence AI English Assistant. Made with precision.</p>
      </footer>
    </div>
  );
}
