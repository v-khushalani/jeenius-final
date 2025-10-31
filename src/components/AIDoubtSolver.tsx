import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkIsPremium } from '@/utils/premiumChecker';
import { X, Send, Loader2, Sparkles, Flame, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIDoubtSolverProps {
  question?: {
    question: string;
    option_a?: string;
    option_b?: string;
    option_c?: string;
    option_d?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const AIDoubtSolver: React.FC<AIDoubtSolverProps> = ({ question, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [dailyAIUsage, setDailyAIUsage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const AI_LIMIT_FREE = 5;
  const RATE_LIMIT_MS = 3000;

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user logged in');
        return;
      }

      const isPremium = await checkIsPremium();
      setIsPro(isPremium);

      if (!isPremium) {
        const today = new Date().toISOString().split('T')[0];
        const { count, error } = await supabase
          .from('ai_usage_log')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00Z`)
          .lte('created_at', `${today}T23:59:59Z`);

        if (error) {
          console.error('Error fetching usage:', error);
        } else {
          setDailyAIUsage(count || 0);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const isGeneral = !question?.option_a || question?.question?.includes("koi bhi");
      
      if (isGeneral) {
        setMessages([{ 
          role: 'assistant', 
          content: `🧞‍♂️ **Namaste! Main JEEnie hun!**\n\n**Aaj kaunsa doubt clear karna hai?** 🎯\n\nMath, Physics, Chemistry - kuch bhi poocho!` 
        }]);
      } else {
        setMessages([{
          role: 'assistant',
          content: `🧞‍♂️ **Hey! Main JEEnie hun!**\n\n**Question:** ${question.question}\n\n${question.option_a ? `**A)** ${question.option_a}\n` : ''}${question.option_b ? `**B)** ${question.option_b}\n` : ''}${question.option_c ? `**C)** ${question.option_c}\n` : ''}${question.option_d ? `**D)** ${question.option_d}\n` : ''}\n💬 **Isme kya doubt hai? Poori tarah se explain karunga!**`
        }]);
      }
    }
  }, [isOpen, question]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const logAIUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !isPro) {
        await supabase.from('ai_usage_log').insert({
          user_id: user.id,
          query_type: 'doubt_solver'
        });
      }
    } catch (error) {
      console.error('Error logging usage:', error);
    }
  };

  const callSupabaseFunction = async (prompt: string): Promise<string> => {
    console.log('📡 Calling Supabase Edge Function...');
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { contextPrompt: prompt }
      });

      console.log('📊 Function response:', data);

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error('FUNCTION_ERROR');
      }

      if (data?.error) {
        console.error('❌ Function returned error:', data.error);
        
        if (data.error === 'RATE_LIMIT_EXCEEDED') {
          throw new Error('RATE_LIMIT');
        } else if (data.error === 'API_KEY_MISSING') {
          throw new Error('API_KEY_MISSING');
        } else if (data.error === 'EMPTY_RESPONSE') {
          throw new Error('EMPTY_RESPONSE');
        } else {
          throw new Error('API_ERROR');
        }
      }

      if (!data?.content || data.content.trim() === '') {
        throw new Error('EMPTY_RESPONSE');
      }

      console.log('✅ Success!');
      return data.content.trim();
    } catch (error: any) {
      console.error('🔥 Error calling function:', error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Please login to use AI Doubt Solver');
      return;
    }

    if (!isPro && dailyAIUsage >= AI_LIMIT_FREE) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🔒 **Daily Limit Reached!**\n\nAapne aaj ${AI_LIMIT_FREE} free queries use kar liye!\n\n**Pro upgrade karo for unlimited AI help** 💎`
      }]);
      setTimeout(() => navigate('/subscription-plans'), 3000);
      return;
    }

    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastRequestTime)) / 1000);
      setError(`⏳ Please wait ${waitTime} seconds before next question`);
      return;
    }

    setLastRequestTime(now);
    setLoading(true);
    
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const isGeneral = !question?.option_a || question?.question?.includes("koi bhi");
      let prompt = '';

      if (isGeneral) {
        prompt = `Student asks: "${input}"\n\nReply in 5-7 lines using Hinglish (Hindi + English mix). Be clear, encouraging, and use simple examples with emojis. If it's a concept, explain step-by-step. For problems, give hints not direct answers.`;
      } else {
        prompt = `Question: ${question.question}
Options:
A) ${question.option_a}
B) ${question.option_b}
C) ${question.option_c}
D) ${question.option_d}

Student's doubt: "${input}"

Reply in Hinglish (6-8 lines). Explain the concept, show approach, point out common mistakes. Guide them to think, don't give direct answer.`;
      }

      console.log('📝 Sending prompt to Supabase function...');
      const aiResponse = await callSupabaseFunction(prompt);
      const formatted = cleanAndFormatJeenieText(aiResponse);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: formatted 
      }]);

      await logAIUsage();
      if (!isPro) {
        setDailyAIUsage(prev => prev + 1);
      }

    } catch (error: any) {
      console.error('❌ Error in handleSendMessage:', error.message);
      
      let errorMsg = '';
      
      if (error.message === 'API_KEY_MISSING') {
        errorMsg = '🔑 **API Key missing in backend!**\n\nPlease contact admin to configure Gemini API key.';
      } else if (error.message === 'RATE_LIMIT') {
        errorMsg = '⚠️ **Too many requests!**\n\n1 minute wait karo aur phir try karo.';
      } else if (error.message === 'EMPTY_RESPONSE') {
        errorMsg = '😕 **AI ne response nahi diya!**\n\nQuestion thoda clear karke poocho.';
      } else if (error.message === 'FUNCTION_ERROR') {
        errorMsg = '❌ **Backend function error!**\n\nPlease try again or contact support.';
      } else {
        errorMsg = '❌ **Kuch technical issue aa gaya!**\n\nPlease try again. Agar problem continue ho to support contact karo.';
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMsg 
      }]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickDoubts = [
    "📐 Formula samjhao",
    "💡 Shortcut trick batao",
    "🎯 Concept clear karo",
    "⚡ Quick revision do"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl animate-pulse">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xl">JEEnie 🧞‍♂️</h3>
              <p className="text-white/80 text-xs">Your AI Study Buddy</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-purple-50 to-white">
          {messages.length === 1 && (
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2 text-center font-semibold">⚡ Quick doubts:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickDoubts.map((d, i) => (
                  <button 
                    key={i} 
                    onClick={() => setInput(d.split(' ').slice(1).join(' '))} 
                    className="text-xs p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-lg text-left text-purple-700 transition-all hover:scale-105 font-medium"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-sm'
                  : 'bg-white border-2 border-purple-100 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-100">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-600">JEEnie</span>
                  </div>
                )}
                <div 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: msg.content }} 
                />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-purple-200 p-3 rounded-2xl rounded-bl-sm shadow-md flex items-center gap-2">
                <Loader2 className="animate-spin text-purple-600" size={18} />
                <span className="text-sm text-gray-700 font-medium">JEEnie soch raha hai... 🤔</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border-2 border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Apna doubt yaha type karo... 💭"
              className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm transition-all"
              disabled={loading}
              maxLength={500}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !input.trim()} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg px-6 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
            </Button>
          </div>
          
          {!isPro && (
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-600">
                <span className="font-bold text-orange-600">{dailyAIUsage}/{AI_LIMIT_FREE}</span> queries used today
              </div>
              {dailyAIUsage >= AI_LIMIT_FREE - 2 && dailyAIUsage < AI_LIMIT_FREE && (
                <div className="text-xs text-orange-600 font-semibold animate-pulse">
                  ⚠️ Only {AI_LIMIT_FREE - dailyAIUsage} left!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function cleanAndFormatJeenieText(text: string): string {
  return text
    .replace(/\$(.*?)\$/g, '<code class="bg-purple-100 px-2 py-1 rounded text-purple-800">$1</code>')
    .replace(/\\frac{(.*?)}{(.*?)}/g, '<span class="font-mono">($1)/($2)</span>')
    .replace(/\\theta/g, 'θ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-purple-700">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
    .replace(/\n{3,}/g, '<br><br>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .trim();
}

export default AIDoubtSolver;
