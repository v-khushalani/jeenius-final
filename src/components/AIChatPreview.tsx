import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Bot } from "lucide-react";

const AIChatPreview = () => {
  return (
    <Card className="relative overflow-hidden shadow-large border-border/50 bg-gradient-card">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-hero rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">JEEnius AI Tutor</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-xs text-success">Online</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="p-6 space-y-4 min-h-[400px]">
        {/* AI Message */}
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">AI</span>
          </div>
          <div className="flex-1">
            <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-3 max-w-sm">
              <p className="text-sm text-foreground">
                Hi! I noticed you're struggling with quadratic equations. Let me help you with a personalized approach.
              </p>
            </div>
          </div>
        </div>
        
        {/* User Message */}
        <div className="flex gap-3 justify-end">
          <div className="flex-1 flex justify-end">
            <div className="bg-primary rounded-2xl rounded-tr-none px-4 py-3 max-w-sm">
              <p className="text-sm text-primary-foreground">
                Yes, I find it confusing!
              </p>
            </div>
          </div>
        </div>
        
        {/* AI Response */}
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">AI</span>
          </div>
          <div className="flex-1">
            <div className="bg-secondary rounded-2xl rounded-tl-none px-4 py-3 max-w-sm">
              <p className="text-sm text-foreground">
                Perfect! Based on your learning style, I'll use visual diagrams. Here's your first question...
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input 
            placeholder="Ask me anything..." 
            className="flex-1 bg-secondary border-border/50"
          />
          <Button size="icon" variant="hero" className="flex-shrink-0">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AIChatPreview;
