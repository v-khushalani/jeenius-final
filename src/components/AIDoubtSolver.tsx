import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { checkIsPremium } from "@/utils/premiumChecker";
import { X, Send, Loader2, Sparkles, AlertCircle, Wand2 } from "lucide-react";
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
      return `🧞‍♂️ **Hey there! I’m JEEnie** —  
your magical AI study partner from **JEEnius 💙**  
Ask me any doubt in Physics, Chemistry, or Maths! ⚡`;
    } else {
      return `🧞‍♂️ **Hello Genius!**  
**Question:** ${question.question}  
${question.option_a ? `A) ${question.option_a}\n` : ""}${
        question.option_b ? `B) ${question.option_b}\n` : ""
      }${question.option_c ? `C) ${question.option_c}\n` : ""}${
        question.option_d ? `D) ${question.option_d}\n` : ""
      }\n💬 Type your doubt below — I’ll simplify it instantly!`;
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
        body: { contextPrompt: prompt },
      });

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
      setError("Please login to get mentored by JEEnie.");
      return;
    }

    const now = Date.now();
    if (now - lastRequestTime < RATE_LIMIT_MS) {
      const waitTime = Math.ceil((RATE_LIMIT_MS - (now - lastRequestTime)) / 1000);
      setError(`⏳ Wait ${waitTime}s before next question`);
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
        ? `You are JEEnie 🧞‍♂️, a friendly AI tutor for JEE students. Use Hinglish, be concise, motivating, and add emojis. Student's doubt: "${userMsg.content}"`
        : `You are JEEnie 🧞‍♂️, helping with this JEE question: ${question.question}
Options: A) ${question.option_a}, B) ${question.option_b}, C) ${question.option_c}, D) ${question.option_d}
Student's doubt: "${userMsg.content}" Answer in Hinglish within 5-7 lines.`;

      const aiResponse = await callEdgeFunction(prompt);
      const formatted = cleanAndFormatJeenieText(aiResponse);
      setMessages((prev) => [...prev, { role: "assistant", content: formatted }]);
    } catch (error: any) {
      console.error("Error:", error.message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ Technical issue! Please try again later." },
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
    <div className="fixed inset-0 bg-[#010b1f]/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="bg-[#0a1b3d] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-blue-900/40">
        
        {/* Header */}
        <div className="p-4 border-b border-blue-800/40 bg-gradient-to-r from-[#0d214a] to-[#0a1938] rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
              <Wand2 className="text-white w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-xl tracking-wide">JEEnie 🧞‍♂️</h3>
              <p className="text-blue-200 text-xs">Your AI Mentor - JEEnius Labs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-[#0a1938] via-[#0f2352] to-[#152c63] text-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] p-3 rounded-2xl shadow-md transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-br-sm"
                    : "bg-gradient-to-b from-blue-100/10 to-blue-50/10 border border-blue-700/40 text-blue-100 backdrop-blur-sm rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 pb-1 border-b border-blue-800/30">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span className="text-xs font-bold text-yellow-300">JEEnie</span>
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
              <div className="bg-blue-900/40 p-3 rounded-2xl border border-blue-700/40 text-blue-100 flex items-center gap-2">
                <Loader2 className="animate-spin text-yellow-300" size={18} />
                <span className="text-sm font-medium">JEEnie soch raha hai... 🤔</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-900/30 border border-red-600/50 p-3 rounded-xl flex items-center gap-2 text-red-300">
                <AlertCircle size={18} />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-blue-800/40 bg-gradient-to-r from-[#09183a] to-[#0b1e4a]">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Apna doubt likho... 💭"
              className="flex-1 px-4 py-3 bg-[#0d214a]/40 border border-blue-800/40 rounded-xl text-blue-100 placeholder:text-blue-300/70 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
              onKeyPress={handleKeyPress}
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg px-6 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
            </Button>
          </div>
          <p className="text-center text-[11px] text-blue-300 mt-3 tracking-wide">
            💎 Powered by <strong>JEEnius AI</strong> — Shaping the Next Generation of Learners
          </p>
        </div>
      </div>
    </div>
  );
};

function cleanAndFormatJeenieText(text: string): string {
  return text
    .replace(/\$(.*?)\$/g, '<code class="bg-blue-900/30 px-2 py-1 rounded text-blue-200">$1</code>')
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
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-yellow-300">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-blue-950/30 px-1 rounded text-sm text-blue-200">$1</code>')
    .replace(/\n{2,}/g, "<br><br>")
    .trim();
}

export default AIDoubtSolver;
