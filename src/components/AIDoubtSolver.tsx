import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { checkIsPremium } from "@/utils/premiumChecker";
import { X, Send, Loader2, Sparkles, Flame, AlertCircle, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";

interface Message {
  role: "user" | "assistant";
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
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"quick" | "deep">("quick");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const RATE_LIMIT_MS = 3000;

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return setIsPro(false);
      const isPremium = await checkIsPremium();
      setIsPro(isPremium);
    } catch (error) {
      console.error("Error checking subscription:", error);
    }
  };

  const initialMessage = useMemo(() => {
    const isGeneral = !question?.option_a || question?.question?.includes("koi bhi");
    if (isGeneral) {
      return `🧞‍♂️ **Welcome to JEEnius!**  
Your personal AI mentor for JEE students 💙  
Ask any doubt — Physics, Chemistry, or Maths! ⚡`;
    } else {
      return `🧞‍♂️ **Hey! I’m JEEnius!**  
**Question:** ${question.question}  
${question.option_a ? `A) ${question.option_a}\n` : ""}${
        question.option_b ? `B) ${question.option_b}\n` : ""
      }${question.option_c ? `C) ${question.option_c}\n` : ""}${
        question.option_d ? `D) ${question.option_d}\n` : ""
      }\n💬 Tell me your doubt and I’ll simplify it!`;
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

  const callEdgeFunction = async (prompt: string): Promise<string> => {
    try {
      console.log("📤 Calling JEEnie Edge Function...");
      const response = await supabase.functions.invoke("jeenie", {
        body: { contextPrompt: prompt, mode },
      });
      console.log("📥 Response received:", response);

      if (response.error) throw new Error("BACKEND_ERROR");
      if (!response.data || !response.data.content) throw new Error("EMPTY_RESPONSE");

      return response.data.content.trim();
    } catch (error: any) {
      console.error("❌ Error calling Edge Function:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Please login to use JEEnius AI");
      return;
    }

    // Restrict Deep Mode to premium users
    if (mode === "deep" && !isPro) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `🔒 **Deep Mode is for Premium users only!**  
Upgrade for detailed, step-by-step AI guidance 💎`,
        },
      ]);
      setTimeout(() => navigate("/subscription-plans"), 3000);
      return;
    }

    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastRequestTime)) / 1000);
      setError(`⏳ Wait ${waitTime}s before asking again`);
      return;
    }

    setLastRequestTime(now);
    setLoading(true);

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const isGeneral = !question?.option_a || question?.question?.includes("koi bhi");
      const prompt = isGeneral
        ? `You are JEEnius 🧞‍♂️, a friendly AI tutor for JEE students.
Use Hinglish, be concise, motivating, and include emojis.
Student's doubt: "${userMsg.content}"`
        : `You are JEEnius 🧞‍♂️, helping with this JEE question:
${question.question}
Options: A) ${question.option_a}, B) ${question.option_b}, C) ${question.option_c}, D) ${question.option_d}
Student's doubt: "${userMsg.content}"
Answer in Hinglish within 5-7 lines.`;

      const aiResponse = await callEdgeFunction(prompt);
      const formatted = cleanAndFormatJeenieText(aiResponse);

      setMessages((prev) => [...prev, { role: "assistant", content: formatted }]);
    } catch (error: any) {
      console.error("Error:", error.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Technical issue! Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#013062] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-blue-900">
        {/* Header */}
        <div className="p-4 bg-[#013062] flex justify-between items-center border-b border-blue-800">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="JEEnius Logo" className="w-8 h-8 rounded-md" />
            <div>
              <h3 className="font-bold text-white text-xl">JEEnius 🧞‍♂️</h3>
              <p className="text-blue-200 text-xs">Your Smart JEE AI Buddy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center items-center gap-3 py-2 bg-[#002652] border-b border-blue-900">
          <span className={`text-xs font-semibold ${mode === "quick" ? "text-blue-400" : "text-gray-400"}`}>
            ⚡ Quick
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mode === "deep"}
              onChange={() => setMode(mode === "quick" ? "deep" : "quick")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 
              rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] 
              after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
              after:transition-all peer-checked:bg-blue-500"></div>
          </label>
          <span className={`text-xs font-semibold ${mode === "deep" ? "text-blue-400" : "text-gray-400"}`}>
            🧠 Deep
          </span>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#f5f8ff] to-white">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl shadow ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-br-sm"
                    : "bg-white border border-blue-100 text-gray-800 rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-100">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-blue-600">JEEnius</span>
                  </div>
                )}
                <div
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(msg.content, {
                      ALLOWED_TAGS: ["strong", "em", "code", "br", "span"],
                      ALLOWED_ATTR: ["class"],
                    }),
                  }}
                />
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-blue-200 p-3 rounded-2xl flex items-center gap-2">
                <Loader2 className="animate-spin text-blue-600" size={18} />
                <span className="text-sm text-gray-700 font-medium">
                  JEEnius soch raha hai... 🤔
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#002652] border-t border-blue-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Apna doubt yaha likho... 💭"
              className="flex-1 px-4 py-3 border-2 border-blue-400 rounded-xl focus:ring-2 focus:ring-blue-300 text-sm transition-all"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </Button>
          </div>
          <p className="text-center text-[11px] text-blue-300 mt-2">
            💎 Powered by <strong>JEEnius AI</strong> — Your smart genie for learning.
          </p>
        </div>
      </div>
    </div>
  );
};

function cleanAndFormatJeenieText(text: string): string {
  return text
    .replace(/\$(.*?)\$/g, '<code class="bg-blue-100 px-2 py-1 rounded text-blue-800">$1</code>')
    .replace(/\\frac{(.*?)}{(.*?)}/g, '<span class="font-mono">($1)/($2)</span>')
    .replace(/\\theta/g, "θ")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\delta/g, "δ")
    .replace(/\\pi/g, "π")
    .replace(/\\sin/g, "sin")
    .replace(/\\cos/g, "cos")
    .replace(/\\tan/g, "tan")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-blue-700">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>')
    .replace(/\n{2,}/g, "<br><br>")
    .trim();
}

export default AIDoubtSolver;
