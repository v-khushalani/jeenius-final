
import React, { useState, useRef, useEffect, useMemo } from "react";
import { X, Send, Loader2, Sparkles, AlertCircle, Bot, Zap, Brain, ChevronDown } from "lucide-react";

// ==================== AI DOUBT SOLVER ====================
const AIDoubtSolver = ({ question, isOpen, onClose }) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("quick");
  const messagesEndRef = useRef(null);

  const RATE_LIMIT_MS = 3000;

  const initialMessage = useMemo(() => {
    const isGeneral = !question?.option_a || question?.question?.includes("koi bhi");
    if (isGeneral) {
      return `🧞‍♂️ Welcome to JEEnius! I am JEEnie -  
Your personal AI mentor for JEE 💙  
Ask any doubt — Physics, Chemistry, or Maths! ⚡`;
    } else {
      return `🧞‍♂️ **Hey! I'm JEEnie!**  
**Question:** ${question.question}  
${question.option_a ? `A) ${question.option_a}\n` : ""}${
        question.option_b ? `B) ${question.option_b}\n` : ""
      }${question.option_c ? `C) ${question.option_c}\n` : ""}${
        question.option_d ? `D) ${question.option_d}\n` : ""
      }\n💬 Tell me your doubt and I'll simplify it!`;
    }
  }, [question]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: initialMessage }]);
    }
  }, [isOpen, messages.length, initialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!input.trim()) return;
    setError(null);

    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastRequestTime)) / 1000);
      setError(`⏳ Wait ${waitTime}s before asking again`);
      return;
    }

    setLastRequestTime(now);
    setLoading(true);

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = `Great question! 🎯 Based on your doubt, let me explain this concept in simple terms. This involves understanding the fundamental principles and applying them step by step. Keep practicing! 💪`;
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
      setLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border-2 border-[#013062]/10">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#013062] to-[#0056D2] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg sm:text-xl flex items-center gap-2">
                JEEnie 
                <span className="text-2xl">🧞‍♂️</span>
              </h3>
              <p className="text-blue-100 text-[10px] sm:text-xs">Your AI Mentor - Powered by JEEnius</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex justify-center items-center gap-3 py-3 sm:py-4 bg-gradient-to-r from-blue-50 to-white border-b border-blue-100">
          <Zap className={`w-4 h-4 ${mode === "quick" ? "text-[#013062]" : "text-gray-400"}`} />
          <span className={`text-xs sm:text-sm font-semibold ${mode === "quick" ? "text-[#013062]" : "text-gray-400"}`}>
            Quick
          </span>
          <div className="relative">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={mode === "deep"}
                onChange={() => setMode(mode === "quick" ? "deep" : "quick")}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-[#013062] transition-all duration-300 peer-checked:bg-gradient-to-r peer-checked:from-[#013062] peer-checked:to-[#0056D2]"></div>
              <div className={`absolute top-0.5 left-0.5 h-6 w-6 bg-white rounded-full transition-all duration-300 shadow-lg ${mode === "deep" ? "translate-x-7" : ""}`}>
                {mode === "deep" && <Sparkles className="w-4 h-4 text-[#013062] m-auto mt-1" />}
              </div>
            </label>
          </div>
          <span className={`text-xs sm:text-sm font-semibold ${mode === "deep" ? "text-[#013062]" : "text-gray-400"}`}>
            Deep
          </span>
          <Brain className={`w-4 h-4 ${mode === "deep" ? "text-[#013062]" : "text-gray-400"}`} />
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gradient-to-b from-blue-50/30 to-white">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-3 sm:p-4 rounded-2xl shadow-md ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-[#013062] to-[#0056D2] text-white rounded-br-sm"
                    : "bg-white border-2 border-blue-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-100">
                    <div className="w-6 h-6 bg-gradient-to-br from-[#013062] to-[#0056D2] rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold text-[#013062]">JEEnie</span>
                  </div>
                )}
                <div className="text-sm leading-relaxed whitespace-pre-line">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-blue-100 p-3 sm:p-4 rounded-2xl flex items-center gap-2 shadow-md">
                <Loader2 className="animate-spin text-[#013062]" size={18} />
                <span className="text-sm text-gray-700 font-medium">
                  JEEnie soch raha hai... 🤔
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border-2 border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-700 shadow-sm">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t-2 border-blue-100 bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Apna doubt likho... 💭"
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-[#013062]/30 rounded-xl focus:border-[#013062] focus:ring-2 focus:ring-[#013062]/20 text-sm transition-all outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={loading}
              className="bg-gradient-to-r from-[#013062] to-[#0056D2] hover:from-[#012050] hover:to-[#0043A4] text-white shadow-lg px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
          <p className="text-center text-[10px] sm:text-xs text-[#013062]/70 mt-2">
            💎 Powered by <strong>JEEnius AI</strong> — Personalized Learning
          </p>
        </div>
      </div>
    </div>
  );
};
