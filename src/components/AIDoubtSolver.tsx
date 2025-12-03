import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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

  // ✅ Use isPremium from AuthContext
  const { isPremium } = useAuth();
  
  useEffect(() => {
    setIsPro(isPremium);
  }, [isPremium]);

  // ✅ Initial welcome message
  const initialMessage = useMemo(() => {
    const isGeneral =
      !question?.option_a || question?.question?.includes("koi bhi");
    if (isGeneral) {
      return `**Hello Puttar!** 🧞‍♂️

Main hoon **JEEnie** — aapka personal AI mentor! 💙

🎯 Physics, Chemistry, Maths — kuch bhi pucho!`;
    } else {
      return `**Hello Puttar!** 🧞‍♂️

📌 **Question:** ${question.question}
${question.option_a ? `**A)** ${question.option_a}` : ""}
${question.option_b ? `**B)** ${question.option_b}` : ""}
${question.option_c ? `**C)** ${question.option_c}` : ""}
${question.option_d ? `**D)** ${question.option_d}` : ""}

💬 Apna doubt likho!`;
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

  // Generate truly contextual quick replies based on actual response content
  const generateContextualReplies = (response: string): Array<{ label: string; message: string }> => {
    const replies: Array<{ label: string; message: string }> = [];
    const cleanText = response.replace(/<[^>]*>/g, '').toLowerCase();
    
    // Extract specific concepts/terms mentioned in the response
    const conceptPatterns = [
      { regex: /lens formula|1\/f\s*=\s*1\/v/i, topic: "lens formula", followUp: "Lens formula ka sign convention samjhao" },
      { regex: /mirror formula/i, topic: "mirror formula", followUp: "Mirror aur lens formula mein kya difference hai?" },
      { regex: /convex lens/i, topic: "convex lens", followUp: "Concave lens mein kya change hoga?" },
      { regex: /concave lens/i, topic: "concave lens", followUp: "Convex lens mein kya alag hoga?" },
      { regex: /newton'?s law|force\s*=\s*ma/i, topic: "Newton's law", followUp: "Newton ke teeno laws ka relation batao" },
      { regex: /momentum|p\s*=\s*mv/i, topic: "momentum", followUp: "Momentum conservation kab apply hota hai?" },
      { regex: /energy conservation/i, topic: "energy", followUp: "Kinetic aur potential energy mein convert kaise hota hai?" },
      { regex: /ohm'?s law|v\s*=\s*ir/i, topic: "Ohm's law", followUp: "Ohm's law kab apply nahi hota?" },
      { regex: /kirchhoff/i, topic: "Kirchhoff", followUp: "KVL aur KCL mein difference kya hai?" },
      { regex: /thermodynamics/i, topic: "thermodynamics", followUp: "First aur second law mein kya farak hai?" },
      { regex: /organic chemistry|iupac/i, topic: "organic", followUp: "IUPAC naming ke rules batao" },
      { regex: /oxidation|reduction|redox/i, topic: "redox", followUp: "Oxidation number kaise calculate karte hain?" },
      { regex: /equilibrium|le\s*chatelier/i, topic: "equilibrium", followUp: "Equilibrium shift kab hota hai?" },
      { regex: /acid|base|ph/i, topic: "acid-base", followUp: "pH calculate karne ka formula kya hai?" },
      { regex: /derivative|differentiation/i, topic: "calculus", followUp: "Common derivatives ki list do" },
      { regex: /integral|integration/i, topic: "integration", followUp: "Integration ke important formulas batao" },
      { regex: /trigonometry|sin|cos|tan/i, topic: "trigonometry", followUp: "Trigonometric identities yaad karne ka trick batao" },
      { regex: /quadratic|ax²/i, topic: "quadratic", followUp: "Quadratic equation ke roots kab real hote hain?" },
      { regex: /matrix|determinant/i, topic: "matrix", followUp: "Matrix inverse kaise nikalte hain?" },
      { regex: /vector|dot product|cross product/i, topic: "vectors", followUp: "Dot aur cross product mein difference kya hai?" },
    ];
    
    // Find matching concepts and add specific follow-ups
    for (const pattern of conceptPatterns) {
      if (pattern.regex.test(response)) {
        replies.push({ label: `💡 ${pattern.topic}`, message: pattern.followUp });
        if (replies.length >= 2) break; // Max 2 concept-specific
      }
    }
    
    // Check what's missing in the response and suggest accordingly
    const hasFormula = /=|formula|equation/i.test(response);
    const hasExample = /example|consider|suppose|let'?s say|maan lo/i.test(cleanText);
    const hasSteps = /step|pehle|phir|then|finally|lastly/i.test(cleanText);
    const hasProTip = /tip|yaad|remember|important|dhyan/i.test(cleanText);
    const hasDiagram = /diagram|figure|graph|draw/i.test(cleanText);
    const hasNumeric = /\d+\s*(m|cm|kg|sec|amp|volt|ohm|mol)/i.test(response);
    
    // Only add if relevant and not already covered
    if (!hasExample && replies.length < 3) {
      replies.push({ label: "📝 Example do", message: "Ek solved example dikhao iska" });
    }
    
    if (!hasSteps && response.length > 200 && replies.length < 3) {
      replies.push({ label: "📋 Steps mein batao", message: "Step by step breakdown do" });
    }
    
    if (hasFormula && !hasNumeric && replies.length < 3) {
      replies.push({ label: "🔢 Numerical solve karo", message: "Ek numerical problem solve karke dikhao" });
    }
    
    if (!hasDiagram && (cleanText.includes('circuit') || cleanText.includes('ray') || cleanText.includes('graph')) && replies.length < 3) {
      replies.push({ label: "📊 Diagram samjhao", message: "Diagram se samjhao isko" });
    }
    
    if (hasProTip && replies.length < 3) {
      replies.push({ label: "⚠️ Common mistakes", message: "Students yahan kya galti karte hain?" });
    }
    
    // If still empty or only 1, add generic contextual ones
    if (replies.length < 2) {
      if (response.length > 150) {
        replies.push({ label: "🔍 Aur detail", message: "Thoda aur detail mein samjhao" });
      }
    }
    
    return replies;
  };
  
  // Get dynamic quick replies - recalculates on every message change
  const quickReplies = useMemo(() => {
    // Only show after first real conversation (skip welcome message)
    if (messages.length <= 1) return [];
    
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === "assistant");
    if (lastAssistantMsg && !lastAssistantMsg.content.includes("Hello Puttar")) {
      return generateContextualReplies(lastAssistantMsg.content);
    }
    return [];
  }, [messages]);

  const handleQuickReply = async (message: string) => {
    if (loading) return;
    setInput(message);
    // Directly send the message
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
    playSound("send");
    const userMsg: Message = { role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    try {
      const isGeneral = !question?.option_a || question?.question?.includes("koi bhi");
      const history = buildConversationHistory(messages);
      const prompt = isGeneral
        ? `Student's current doubt: "${message}". Give direct, on-point answer. No unnecessary elaboration.`
        : `Question: ${question.question}
Options: A) ${question.option_a}, B) ${question.option_b}, C) ${question.option_c}, D) ${question.option_d}
Student's current doubt: "${message}". Give direct solution, explain only what's needed.`;
      setTyping(true);
      const aiResponse = await callEdgeFunction(prompt, history);
      const formatted = cleanAndFormatJeenieText(aiResponse);
      playSound("receive");
      setMessages((prev) => [...prev, { role: "assistant", content: formatted }]);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : "❌ Oops! Network ya backend issue ho gaya. Please try again later.";
      setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  // Build conversation history for context
  const buildConversationHistory = (currentMessages: Message[]): string => {
    // Get last 6 messages for context (3 exchanges)
    const recentMessages = currentMessages.slice(-6);
    if (recentMessages.length === 0) return "";
    
    return recentMessages.map(msg => {
      const role = msg.role === "user" ? "Student" : "JEEnie";
      // Strip HTML tags for clean history
      const cleanContent = msg.content.replace(/<[^>]*>/g, '').substring(0, 300);
      return `${role}: ${cleanContent}`;
    }).join("\n");
  };

  // ✅ Supabase Edge Function call with improved error handling
  const callEdgeFunction = async (prompt: string, conversationHistory: string): Promise<string> => {
    try {
      console.log("🚀 Calling JEEnie edge function with history...");
      const response = await supabase.functions.invoke("jeenie", {
        body: { 
          contextPrompt: prompt,
          conversationHistory: conversationHistory 
        },
      });
      
      console.log("📥 Response received:", response);
      
      // Handle function invocation errors
      if (response.error) {
        console.error("❌ Function invocation error:", response.error);
        throw new Error(response.error.message || "BACKEND_ERROR");
      }
      
      // Handle API error responses
      if (response.data?.error) {
        console.error("❌ API error:", response.data.error);
        const errorType = response.data.error;
        
        if (errorType === "RATE_LIMIT") {
          throw new Error("JEEnie is a bit busy! Please wait a moment and try again.");
        } else if (errorType === "SERVICE_UNAVAILABLE") {
          throw new Error("JEEnie is temporarily overloaded. Please try again in a moment.");
        } else if (errorType === "SERVICE_TIMEOUT") {
          throw new Error("JEEnie is taking too long. Please try again.");
        } else if (errorType === "SAFETY_BLOCK") {
          throw new Error("Please rephrase your question in a different way.");
        } else if (errorType === "EMPTY_RESPONSE") {
          throw new Error("JEEnie couldn't generate a response. Try rephrasing your question.");
        } else {
          throw new Error(response.data.message || "Something went wrong. Please try again.");
        }
      }
      
      // Validate response content
      if (!response.data || !response.data.content) {
        console.error("❌ Empty response data:", response.data);
        throw new Error("No response received. Please try again.");
      }
      
      console.log("✅ Valid response received, length:", response.data.content.length);
      return response.data.content.trim();
      
    } catch (error) {
      console.error("❌ Error calling Edge Function:", error);
      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to connect to JEEnie. Please check your internet connection.");
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
      
      // Build conversation history from previous messages
      const history = buildConversationHistory(messages);
      
      const prompt = isGeneral
        ? `Student's current doubt: "${userMsg.content}". Give direct, on-point answer. No unnecessary elaboration.`
        : `Question: ${question.question}
Options: A) ${question.option_a}, B) ${question.option_b}, C) ${question.option_c}, D) ${question.option_d}
Student's current doubt: "${userMsg.content}". Give direct solution, explain only what's needed.`;

      setTyping(true);
      const aiResponse = await callEdgeFunction(prompt, history);
      const formatted = cleanAndFormatJeenieText(aiResponse);
      playSound("receive");
      setMessages((prev) => [...prev, { role: "assistant", content: formatted }]);
    } catch (error: any) {
      console.error("💥 Error in handleSendMessage:", error);
      
      // Display user-friendly error message from the thrown error
      const errorMessage = error instanceof Error 
        ? error.message 
        : "❌ Oops! Network ya backend issue ho gaya. Please try again later.";
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
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
    <div className="fixed inset-0 bg-[#F6F9FF]/90 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-3">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-[#E3E8FF] relative">
        {/* Floating JEEnie Icon */}
        <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[#4C6FFF] to-[#013062] p-2 sm:p-3 rounded-full shadow-lg animate-bounce">
          <Wand2 className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        </div>

        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-[#E3E8FF] bg-gradient-to-r from-[#F8FAFF] to-[#EEF3FF] rounded-t-xl sm:rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <Bot className="text-[#4C6FFF]" size={18} />
            <div>
              <h3 className="font-bold text-[#013062] text-sm sm:text-base md:text-lg tracking-wide">
                JEEnie — AI Doubt Solver
              </h3>
              <p className="text-xs text-[#4C6FFF]/70 font-medium hidden sm:block">
                Smart • Motivating • Fast
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#013062]/70 hover:text-[#013062] hover:bg-[#E8EDFF] p-1.5 sm:p-2 rounded-lg transition-all"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-[#F6F9FF] text-[#013062]">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="bg-[#E8EDFF] p-1.5 sm:p-2 rounded-full mr-1.5 sm:mr-2 flex-shrink-0">
                  <Bot className="text-[#4C6FFF]" size={14} />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-[#4C6FFF] to-[#013062] text-white rounded-br-sm"
                    : "bg-white border border-[#E0E7FF] text-[#013062] rounded-bl-sm"
                }`}
              >
                <div
                  className="text-xs sm:text-sm"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(msg.content),
                  }}
                />
              </div>
              {msg.role === "user" && (
                <div className="bg-[#E8EDFF] p-1.5 sm:p-2 rounded-full ml-1.5 sm:ml-2 flex-shrink-0">
                  <User className="text-[#013062]" size={14} />
                </div>
              )}
            </div>
          ))}

          {/* Quick Reply Buttons - Show after assistant messages */}
          {messages.length > 1 && messages[messages.length - 1]?.role === "assistant" && !typing && !loading && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mt-2">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(reply.message)}
                  className="px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs bg-white border border-[#DDE5FF] text-[#013062] rounded-full hover:bg-[#e6eeff] hover:border-[#4C6FFF] transition-all shadow-sm font-medium"
                >
                  {reply.label}
                </button>
              ))}
            </div>
          )}

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
        <div className="p-2.5 sm:p-3 border-t border-[#E3E8FF] bg-[#F8FAFF]">
          <div className="flex gap-1.5 sm:gap-2 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Apna doubt likho... 💭"
              onKeyPress={handleKeyPress}
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white border border-[#DDE5FF] rounded-lg sm:rounded-xl text-[#013062] placeholder:text-[#4C6FFF]/60 focus:ring-2 focus:ring-[#4C6FFF] outline-none text-xs sm:text-sm transition-all"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-[#4C6FFF] to-[#013062] hover:opacity-90 text-white px-3 sm:px-6 rounded-lg sm:rounded-xl transition-all shadow-md h-auto"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
          <p className="text-center text-[10px] sm:text-[11px] text-[#4C6FFF]/70 mt-1.5 sm:mt-2">
            💎 Powered by <strong>JEEnius AI</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

function cleanAndFormatJeenieText(text: string): string {
  let formatted = text
    // Greek letters - convert text to proper Unicode symbols
    .replace(/\\alpha|alpha/gi, 'α')
    .replace(/\\beta|beta/gi, 'β')
    .replace(/\\gamma|gamma/gi, 'γ')
    .replace(/\\delta|delta/gi, 'δ')
    .replace(/\\theta|theta/gi, 'θ')
    .replace(/\\lambda|lambda/gi, 'λ')
    .replace(/\\mu|mu(?![a-z])/gi, 'μ')
    .replace(/\\sigma|sigma/gi, 'σ')
    .replace(/\\pi|(?<![a-z])pi(?![a-z])/gi, 'π')
    .replace(/\\omega|omega/gi, 'ω')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\infty|infinity/gi, '∞')
    .replace(/\\rho|rho/gi, 'ρ')
    .replace(/\\epsilon|epsilon/gi, 'ε')
    .replace(/\\phi|phi/gi, 'φ')
    .replace(/\\psi|psi/gi, 'ψ')
    .replace(/\\tau|tau/gi, 'τ')
    .replace(/\\nu|(?<![a-z])nu(?![a-z])/gi, 'ν')
    // Math symbols
    .replace(/->/g, '→')
    .replace(/<-/g, '←')
    .replace(/<=>/g, '⇌')
    .replace(/>=/g, '≥')
    .replace(/<=/g, '≤')
    .replace(/!=/g, '≠')
    .replace(/~=/g, '≈')
    .replace(/\^2(?![0-9])/g, '²')
    .replace(/\^3(?![0-9])/g, '³')
    .replace(/\+-/g, '±')
    // Chemistry subscripts
    .replace(/H2O/g, 'H₂O')
    .replace(/CO2/g, 'CO₂')
    .replace(/O2(?![0-9])/g, 'O₂')
    .replace(/N2(?![0-9])/g, 'N₂')
    .replace(/H2(?![0-9O])/g, 'H₂')
    .replace(/SO4/g, 'SO₄')
    .replace(/NO3/g, 'NO₃')
    .replace(/NH3/g, 'NH₃')
    .replace(/CH4/g, 'CH₄')
    .replace(/H2SO4/g, 'H₂SO₄')
    .replace(/HNO3/g, 'HNO₃')
    // Convert underscore notation to subscripts (F_eq → F<sub>eq</sub>)
    .replace(/([A-Za-z])_([A-Za-z0-9]+)/g, '$1<sub>$2</sub>')
    // Format code/formulas with brand color background
    .replace(/\$(.*?)\$/g, '<code class="bg-[#e6eeff] px-2 py-1 rounded text-[#013062] font-semibold">$1</code>')
    // Bold text with brand color
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color: #013062;">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br>')
    // Bullet points enhancement
    .replace(/• /g, '<span style="color: #4C6FFF;">•</span> ')
    .replace(/🎯/g, '<span style="font-size: 1.1em;">🎯</span>')
    .replace(/💡/g, '<span style="font-size: 1.1em;">💡</span>')
    .replace(/✨/g, '<span style="font-size: 1.1em;">✨</span>')
    .replace(/⚡/g, '<span style="font-size: 1.1em;">⚡</span>')
    .replace(/🔥/g, '<span style="font-size: 1.1em;">🔥</span>')
    .replace(/📌/g, '<span style="font-size: 1.1em;">📌</span>')
    .replace(/✅/g, '<span style="font-size: 1.1em;">✅</span>');
  
  return formatted.trim();
}

export default AIDoubtSolver;
