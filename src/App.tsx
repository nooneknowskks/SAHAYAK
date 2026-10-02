import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mic, 
  Sun, 
  Moon, 
  GraduationCap, 
  Sprout, 
  HeartPulse, 
  Download, 
  MessageSquare, 
  X, 
  Send, 
  Facebook, 
  Twitter, 
  Linkedin, 
  ChevronRight,
  Landmark,
  Languages
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface SchemeCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconColor: string;
}

interface TestimonialProps {
  name: string;
  role: string;
  text: string;
  avatar: string;
}

// --- Components ---

const Ticker = () => (
  <div className="fixed top-0 left-0 w-full h-10 bg-primary text-white z-[100] flex items-center overflow-hidden">
    <div className="flex whitespace-nowrap animate-ticker">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-12 px-4">
          <span className="font-bold">🔔 PM-Kisan 16th Installment released! Check your status now.</span>
          <span className="font-bold">📑 Last date for Scholarship extended to May 2026.</span>
          <span className="font-bold">🚜 New subsidies for Solar Pumps announced.</span>
          <span className="font-bold">🏠 PMAY Housing list updated for 2024.</span>
        </div>
      ))}
    </div>
  </div>
);

const Navbar = ({ darkMode, toggleDarkMode }: { darkMode: boolean; toggleDarkMode: () => void }) => (
  <nav className="fixed top-14 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl glass rounded-2xl z-50 px-6 py-4 flex items-center justify-between shadow-lg">
    <div className="flex items-center gap-2">
      <div className="bg-primary p-2 rounded-xl text-white">
        <Landmark size={24} />
      </div>
      <span className="text-2xl font-extrabold tracking-tight dark:text-white">
        Bharat<span className="text-primary">AI</span>
      </span>
    </div>

    <div className="flex items-center gap-6">
      <div className="hidden md:flex items-center gap-2 glass px-3 py-1.5 rounded-xl">
        <Languages size={18} className="text-slate-500" />
        <select className="bg-transparent text-sm font-semibold outline-none dark:text-white">
          <option>English</option>
          <option>हिन्दी</option>
          <option>मराठी</option>
        </select>
      </div>
      
      <button 
        onClick={toggleDarkMode}
        className="p-2.5 rounded-xl bg-primary-light dark:bg-slate-800 text-primary transition-all hover:scale-110"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </div>
  </nav>
);

const Hero = () => (
  <section className="pt-48 pb-20 px-6 relative overflow-hidden">
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-light text-primary font-bold text-sm mb-8"
      >
        🇮🇳 Next-Gen Citizen Assistant
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-5xl md:text-7xl font-extrabold dark:text-white leading-tight mb-8"
      >
        Welfare Schemes, <br />
        <span className="gradient-text italic">Redefined for You</span>
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-500 dark:text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto"
      >
        The most advanced way to discover, verify, and apply for Indian government benefits in your own language.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass p-3 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-3 max-w-3xl mx-auto mb-12"
      >
        <div className="flex-1 flex items-center gap-3 px-4 w-full">
          <Search className="text-slate-400" size={24} />
          <input 
            type="text" 
            placeholder="Search schemes by name or category..."
            className="w-full bg-transparent outline-none text-lg dark:text-white"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-primary hover:bg-primary-light transition-colors">
            <Mic size={24} />
          </button>
          <button className="w-full md:w-auto px-8 py-4 rounded-2xl bg-primary text-white font-bold text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all">
            Find Schemes
          </button>
        </div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3">
        <span className="text-slate-400 font-bold uppercase text-xs tracking-widest w-full mb-2">Popular:</span>
        {['PM-Kisan', 'Scholarships', 'Ration Card', 'Housing Scheme'].map((chip) => (
          <button key={chip} className="glass px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary hover:text-white transition-all dark:text-white">
            {chip}
          </button>
        ))}
      </div>
    </div>
  </section>
);

const SchemeCard = ({ title, desc, icon, iconColor }: SchemeCardProps) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="glass p-8 rounded-[2rem] relative group cursor-pointer"
  >
    <button className="absolute top-6 right-6 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white">
      <Download size={20} />
    </button>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${iconColor}`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 dark:text-white">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
    <div className="mt-8 flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
      View Details <ChevronRight size={18} />
    </div>
  </motion.div>
);

const TestimonialCard = ({ name, role, text, avatar }: TestimonialProps) => (
  <div className="glass p-8 rounded-3xl">
    <div className="flex items-center gap-4 mb-6">
      <img src={avatar} alt={name} className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/20" />
      <div>
        <h4 className="font-bold dark:text-white">{name}</h4>
        <p className="text-sm text-primary font-semibold">{role}</p>
      </div>
    </div>
    <div className="flex gap-1 mb-4 text-orange-400">
      {[1, 2, 3, 4, 5].map((i) => <span key={i}>★</span>)}
    </div>
    <p className="italic text-slate-600 dark:text-slate-400 leading-relaxed">"{text}"</p>
  </div>
);

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Namaste! I am BharatAI Buddy. How can I help you today?", isAi: true }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, isAi: false }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "I'm looking into that for you. Which state are you from?", isAi: true }]);
    }, 1000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-primary text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 z-[100] hover:scale-105 transition-transform"
      >
        <div className="relative">
          <MessageSquare size={24} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-primary animate-pulse" />
        </div>
        Ask Assistant
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 right-8 w-[380px] h-[500px] glass rounded-[2.5rem] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            <div className="bg-primary p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Landmark size={20} />
                </div>
                <div>
                  <h4 className="font-bold">BharatAI Buddy</h4>
                  <p className="text-xs opacity-80">Online | AI Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.isAi 
                      ? 'bg-slate-100 dark:bg-slate-800 dark:text-white rounded-bl-none' 
                      : 'bg-primary text-white rounded-br-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 glass m-4 rounded-2xl flex items-center gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your query..."
                className="flex-1 bg-transparent outline-none text-sm dark:text-white"
              />
              <button onClick={handleSend} className="p-2 bg-primary text-white rounded-xl">
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main App ---

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-dark-bg text-dark-text' : 'bg-light-bg text-light-text'}`}>
      {/* Aesthetic Orbs */}
      <div className="fixed top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent-blue/20 rounded-full blur-[100px] pointer-events-none" />

      <Ticker />
      <Navbar darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
      
      <main className="container mx-auto">
        <Hero />

        {/* Schemes Grid */}
        <section className="py-20 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SchemeCard 
              title="Education"
              desc="Scholarships, fee waivers, and educational loans for meritorious students across India."
              icon={<GraduationCap size={32} />}
              iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            />
            <SchemeCard 
              title="Agriculture"
              desc="Direct income support, seed subsidies, and equipment grants for our hardworking farmers."
              icon={<Sprout size={32} />}
              iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
            />
            <SchemeCard 
              title="Healthcare"
              desc="Universal health insurance and free medical treatment for economically weaker sections."
              icon={<HeartPulse size={32} />}
              iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            />
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 dark:text-white">Voice of the Citizens</h2>
            <p className="text-slate-500">Real stories from people whose lives were changed by BharatAI.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <TestimonialCard 
              name="Arjun Sharma"
              role="Farmer, Haryana"
              avatar="https://i.pravatar.cc/150?u=arjun"
              text="The AI explained PM-Kisan in my native language. I got my installment within 15 days of applying through the guide!"
            />
            <TestimonialCard 
              name="Priya Patil"
              role="Student, Pune"
              avatar="https://i.pravatar.cc/150?u=priya"
              text="I was confused about scholarship documents. BharatAI gave me a checklist instantly. Highly recommended for students!"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 glass rounded-t-[3rem] border-b-0">
        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div>
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-primary p-2 rounded-xl text-white">
                  <Landmark size={24} />
                </div>
                <span className="text-2xl font-extrabold tracking-tight dark:text-white">
                  Bharat<span className="text-primary">AI</span>
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Empowering every Indian citizen through AI-driven access to welfare and government benefits.
              </p>
              <div className="flex gap-4">
                {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                  <button key={i} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-primary hover:text-white transition-all">
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-8 dark:text-white">Quick Links</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
                {['Find Schemes', 'Check Eligibility', 'How it Works', 'Help & FAQs'].map((link) => (
                  <li key={link} className="hover:text-primary cursor-pointer transition-colors flex items-center gap-2">
                    <ChevronRight size={16} /> {link}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xl font-bold mb-8 dark:text-white">Stay Updated</h4>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Get the latest scheme announcements in your inbox.</p>
              <div className="glass p-2 rounded-2xl flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your Email"
                  className="flex-1 bg-transparent px-4 outline-none text-sm dark:text-white"
                />
                <button className="bg-primary text-white p-3 rounded-xl hover:shadow-lg transition-all">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-8 text-center text-slate-500 text-sm">
          <p>© 2026 BharatAI Assistant. All Rights Reserved. Made with ❤️ in India</p>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}
