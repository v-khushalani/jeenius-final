import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { checkIsPremium } from "@/utils/premiumChecker";
import {
  X,
  Send,
  Loader2,
  Sparkles,
  AlertCircle,
  Wand2,
  Bot,
  User,
} from "lucide-react";
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

const AIDoubtSolver: React.FC<AIDoubtSolverProps> = ({
  question,
  isOpen,
  onClose,
}) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const RATE_LIMIT_MS = 3000;

  // ✅ Load subscription status once
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

  // ✅ Initial welcome message
  const initialMessage = useMemo(() => {
    const isGeneral =
      !question?.option_a || question?.question?.includes("koi bhi");
    if (isGeneral) {
      return `🧞‍♂️ **Hey Genius! I'm JEEnie** —  
Your magical AI mentor from **JEEnius 💙**.  
Ask me any doubt in Physics, Chemistry or Maths! ⚡`;
    } else {
      return `🧞‍♂️ **Let's decode this together!**  
**Question:** ${question.question}  
${question.option_a ? `A) ${question.option_a}\n` : ""}${
        question.option_b ? `B) ${question.option_b}\n` : ""
      }${question.option_c ? `C) ${question.option_c}\n` : ""}${
        question.option_d ? `D) ${question.option_d}\n` : ""
      }\n💬 Type your doubt below — I'll simplify it quickly!`;
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

  const playSound = (tone: "send" | "receive") => {
    const audio = new Audio(
      tone === "send"
        ? "https://cdn.pixabay.com/download/audio/2022/03/15/audio_040b9c8d6b.mp3?filename=click-124467.mp3"
        : "https://cdn.pixabay.com/download/audio/2022/03/15/audio_8f27e7a46a.mp3?filename=notification-5-173230.mp3"
    );
    audio.volume = 0.25;
    audio.play().catch(() => {});
  };

  // ✅ Supabase Edge Function call
  const callEdgeFunction = async (prompt: string): Promise<string> => {
    try {
      const response = await supabase.functions.invoke("jeenie", {
        body: { contextPrompt: prompt },
      });
      if (response.error) throw new Error("BACKEND_ERROR");
      if (!response.data || !response.data.content)
        throw new Error("EMPTY_RESPONSE");
      return response.data.content.trim();
    } catch (error) {
      console.error("❌ Error calling Edge Function:", error);
      throw error;
    }
  };

  // ✅ Send Message
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
      const waitTime = Math.ceil(
        (RATE_LIMIT_MS - (now - lastRequestTime)) / 1000
      );
      setError(`⏳ Wait ${waitTime}s before next question`);
      return;
    }

    setLastRequestTime(now);
    setLoading(true);
    playSound("send");

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const isGeneral =
        !question?.option_a || question?.question?.includes("koi bhi");
      const prompt = isGeneral
        ? `You are JEEnie 🧞‍♂️, a friendly AI tutor for JEE students. Use Hinglish, be concise, motivating, and add emojis. Student's doubt: "${userMsg.content}"`
        : `You are JEEnie 🧞‍♂️, helping with this JEE question: ${question.question}
Options: A) ${question.option_a}, B) ${question.option_b}, C) ${question.option_c}, D) ${question.option_d}
Student's doubt: "${userMsg.content}". Answer in Hinglish within 5-7 lines.`;

      setTyping(true);
      const aiResponse = await callEdgeFunction(prompt);
      const formatted = cleanAndFormatJeenieText(aiResponse);
      playSound("receive");
      setMessages((prev) => [...prev, { role: "assistant", content: formatted }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ Oops! Network ya backend issue ho gaya. Please try again later.",
        },
      ]);
    } finally {
      setTyping(false);
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
    <div className="fixed inset-0 bg-[#F6F9FF]/90 backdrop-blur-md z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-[#E3E8FF] relative">
        {/* Floating JEEnie Icon */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[#4C6FFF] to-[#013062] p-3 rounded-full shadow-lg animate-bounce">
          <Wand2 className="text-white w-6 h-6" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-[#E3E8FF] bg-gradient-to-r from-[#F8FAFF] to-[#EEF3FF] rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Bot className="text-[#4C6FFF]" size={22} />
            <div>
              <h3 className="font-bold text-[#013062] text-lg tracking-wide">
                JEEnie — AI Doubt Solver
              </h3>
              <p className="text-xs text-[#4C6FFF]/70 font-medium">
                Smart • Motivating • Fast
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#013062]/70 hover:text-[#013062] hover:bg-[#E8EDFF] p-2 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F6F9FF] text-[#013062]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="bg-[#E8EDFF] p-2 rounded-full mr-2">
                  <Bot className="text-[#4C6FFF]" size={16} />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-[#4C6FFF] to-[#013062] text-white rounded-br-sm"
                    : "bg-white border border-[#E0E7FF] text-[#013062] rounded-bl-sm"
                }`}
              >
                <div
                  className="text-[14px]"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(msg.content),
                  }}
                />
              </div>
              {msg.role === "user" && (
                <div className="bg-[#E8EDFF] p-2 rounded-full ml-2">
                  <User className="text-[#013062]" size={16} />
                </div>
              )}
            </div>
          ))}

          {/* Typing Animation */}
          {typing && (
            <div className="flex justify-start items-center gap-2 text-[#4C6FFF]">
              <div className="bg-white border border-[#E0E7FF] px-3 py-2 rounded-2xl shadow-sm flex gap-1 items-center">
                <span className="w-2 h-2 bg-[#4C6FFF] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#4C6FFF]/80 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-[#4C6FFF]/60 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center">
              <div className="bg-red-100 border border-red-200 text-red-700 px-3 py-2 rounded-xl flex items-center gap-2 text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#E3E8FF] bg-[#F8FAFF]">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your doubt... 💭"
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 bg-white border border-[#DDE5FF] rounded-xl text-[#013062] placeholder:text-[#4C6FFF]/60 focus:ring-2 focus:ring-[#4C6FFF] outline-none text-sm transition-all"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-[#4C6FFF] to-[#013062] hover:opacity-90 text-white px-6 rounded-xl transition-all shadow-md"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </div>
          <p className="text-center text-[11px] text-[#4C6FFF]/70 mt-2">
            💎 Powered by <strong>JEEnius AI</strong> — Learn Smarter
          </p>
        </div>
      </div>
    </div>
  );
};

function cleanAndFormatJeenieText(text: string): string {
  return text
    .replace(/\$(.*?)\$/g, '<code class="bg-[#E8EEFF] px-2 py-1 rounded text-[#013062]">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#4C6FFF]">$1</strong>')
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>")
    .trim();
}

export default AIDoubtSolver;
