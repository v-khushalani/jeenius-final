import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkIsPremium } from '@/utils/premiumChecker';
import { X, Send, Loader2, Sparkles, Flame } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const AIDoubtSolver = ({ question, isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [dailyAIUsage, setDailyAIUsage] = useState(0);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const AI_LIMIT_FREE = 5;
  const GEMINI_API_KEY = "AIzaSyCdBpYBvYdwZMJ9D_rh_vRlZLhfvTaDRts"; // Direct key

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const isPremium = await checkIsPremium();
      setIsPro(isPremium);

      if (!isPremium && user) {
        const today = new Date().toISOString().split('T')[0];
        const { count } = await supabase
          .from('ai_usage_log')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', `${today}T00:00:00`)
          .lte('created_at', `${today}T23:59:59`);

        setDailyAIUsage(count || 0);
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
          content: `🧞‍♂️ **Namaste! Main JEEnie hun!**\n**Kya doubt hai aaj?** 🎯` 
        }]);
      } else {
        setMessages([{
          role: 'assistant',
          content: `🧞‍♂️ **Hey! Main JEEnie hun!**\n\n**Question:** ${question.question}\n\n${question.option_a ? `A) ${question.option_a}` : ''}\n${question.option_b ? `B) ${question.option_b}` : ''}\n${question.option_c ? `C) ${question.option_c}` : ''}\n${question.option_d ? `D) ${question.option_d}` : ''}\n\n💬 **Kya doubt hai?**`
        }]);
      }
    }
  }, [isOpen, question]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Free limit check
    if (!isPro && dailyAIUsage >= AI_LIMIT_FREE) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🔒 **Daily Limit Reached!**\n\nYou've used ${AI_LIMIT_FREE} free queries today!\n\n**Upgrade to Pro for unlimited AI help** 💎`
      }]);
      setTimeout(() => navigate('/subscription-plans'), 2000);
      return;
    }

    const now = Date.now();
    if (now - lastRequestTime < 2000) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⏳ Ruko bhai, 2 seconds wait karo! 😅' 
      }]);
      return;
    }

    setLastRequestTime(now);
    setLoading(true);
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const isGeneral = !question?.option_a || question?.question?.includes("koi bhi");
      let prompt = '';

      if (isGeneral) {
        prompt = `Tu JEEnie hai, friendly AI tutor for JEE students. Student asks: "${input}". Reply in Hinglish (Hindi+English mix), short (4-5 lines), use emojis, be encouraging.`;
      } else {
        prompt = `Tu JEEnie hai. Question: ${question.question}\nOptions: A) ${question.option_a}, B) ${question.option_b}, C) ${question.option_c}, D) ${question.option_d}\n\nStudent doubt: "${input}"\n\nReply in Hinglish, short answer, help clarify doubt.`;
      }

      console.log('🚀 Calling Gemini directly...');

      // Direct Gemini API call
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 400
            }
          })
        }
      );

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error('GEMINI_API_ERROR');
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!content.trim()) {
        throw new Error('EMPTY_RESPONSE');
      }

      console.log('✅ Success!');

      const formatted = cleanAndFormatJeenieText(content);
      setMessages(prev => [...prev, { role: 'assistant', content: formatted }]);
      
      if (!isPro) {
        setDailyAIUsage(prev => prev + 1);
      }

    } catch (error) {
      console.error('🔥 Error:', error);
      
      let errorMsg = '❌ **Kuch issue aa gaya!** Retry karo.';
      
      if (error.message === 'GEMINI_API_ERROR') {
        errorMsg = '⚠️ **AI API issue!** Thoda wait karke retry karo.';
      } else if (error.message === 'EMPTY_RESPONSE') {
        errorMsg = '😕 **AI ne response nahi diya!** Question clear karke retry karo.';
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickDoubts = [
    "📐 Formula explain karo",
    "💡 Shortcut trick batao",
    "🎯 Concept clear karo",
    "⚡ Quick revision point"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl animate-pulse">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-white text-xl">JEEnie 🧞‍♂️</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-purple-50 to-white">
          {messages.length === 1 && (
            <div>
              <p className="text-xs text-gray-600 mb-2 text-center font-semibold">⚡ Quick doubts:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickDoubts.map((d, i) => (
                  <button 
                    key={i} 
                    onClick={() => setInput(d.split(' ').slice(1).join(' '))} 
                    className="text-xs p-2.5 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 rounded-lg text-left text-purple-700 transition-all hover:scale-105"
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white border-2 border-purple-100 text-gray-800'
              }`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-600">JEEnie 🧞‍♂️</span>
                  </div>
                )}
                <div className="jeenius-ai" dangerouslySetInnerHTML={{ __html: msg.content }} />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-purple-200 p-3 rounded-2xl shadow-md flex items-center gap-2">
                <Loader2 className="animate-spin text-purple-600" size={18} />
                <span className="text-sm text-gray-700 font-medium">JEEnie soch raha hai... 🤔</span>
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
              placeholder="Apna doubt yaha type karo..."
              className="flex-1 px-4 py-3 border-2 border-purple-300 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
              disabled={loading}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !input.trim()} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg px-6"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </Button>
          </div>
          {!isPro && (
            <div className="mt-2 text-xs text-orange-600 font-bold">
              {dailyAIUsage}/{AI_LIMIT_FREE} queries used today
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function cleanAndFormatJeenieText(text) {
  return text
    .replace(/\$(.*?)\$/g, '<span class="jeenius-formula">$1</span>')
    .replace(/\\frac{(.*?)}{(.*?)}/g, '<span class="jeenius-formula">($1)/($2)</span>')
    .replace(/\\theta/g, 'θ')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .trim();
}

export default AIDoubtSolver;
