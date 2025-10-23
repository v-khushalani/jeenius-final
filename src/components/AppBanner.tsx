import { Button } from "@/components/ui/button";
import { Download, Smartphone } from "lucide-react";

const AppBanner = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-hero py-3">
      <div className="container mx-auto px-4 flex items-center justify-center gap-3 text-primary-foreground">
        <Smartphone className="w-5 h-5" />
        <span className="text-sm font-medium">
          📱 Get the full JEEnius experience - Download our Android App now!
        </span>
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-primary"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default AppBanner;
