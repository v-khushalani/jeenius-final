import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">JEEnius</h1>
            <p className="text-xs text-muted-foreground">AI Learning Platform</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-foreground hover:text-accent transition-colors">
            Home
          </a>
          <a href="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Why Us
          </a>
        </div>
        
        <Button variant="hero" size="lg">
          Sign In / Get Started
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
