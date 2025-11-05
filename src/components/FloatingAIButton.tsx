const FloatingAIButton = () => {
  const [showAI, setShowAI] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 100, y: window.innerHeight - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newX = Math.max(0, Math.min(window.innerWidth - 70, e.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 70, e.clientY - dragStart.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const newX = Math.max(0, Math.min(window.innerWidth - 70, touch.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 70, touch.clientY - dragStart.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = (e) => {
    if (isDragging) {
      setIsDragging(false);
      // Snap to nearest edge
      const snapX = position.x < window.innerWidth / 2 ? 20 : window.innerWidth - 90;
      setPosition({ x: snapX, y: position.y });
    } else {
      setShowAI(true);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      // Snap to nearest edge
      const snapX = position.x < window.innerWidth / 2 ? 20 : window.innerWidth - 90;
      setPosition({ x: snapX, y: position.y });
    } else {
      setShowAI(true);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragStart, position]);

  const generalQuestion = {
    question: "I have a doubt...",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
  };

  return (
    <>
      {/* Floating Button */}
      <div
        ref={buttonRef}
        onMouseEnter={() => !isDragging && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
          zIndex: 40,
          transition: isDragging ? 'none' : 'all 0.3s ease'
        }}
        className="group select-none"
        aria-label="AI Doubt Solver"
      >
        {/* Animated Background Rings */}
        {!isDragging && (
          <>
            <div className="absolute inset-0 animate-ping opacity-40">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#013062] to-[#0056D2]"></div>
            </div>
            <div className="absolute inset-0 animate-pulse opacity-30">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0056D2] to-[#013062]"></div>
            </div>
          </>
        )}

        {/* Main Button */}
        <div className={`relative w-16 h-16 bg-gradient-to-br from-[#013062] via-[#0056D2] to-[#0043A4] rounded-full shadow-2xl flex items-center justify-center transform transition-all duration-300 ${!isDragging && 'hover:scale-110'} border-2 border-white`}>
          {/* Sparkle Effect */}
          <div className="absolute -top-1 -right-1 animate-bounce">
            <Sparkles className="w-4 h-4 text-yellow-300" fill="currentColor" />
          </div>
          
          {/* Bot Icon */}
          <Bot className="w-8 h-8 text-white" />
          
          {/* Active Indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
        </div>

        {/* Tooltip on Hover */}
        {isHovered && !isDragging && (
          <div className="absolute bottom-full right-0 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-gradient-to-r from-[#013062] to-[#0056D2] text-white px-4 py-3 rounded-xl shadow-2xl whitespace-nowrap">
              <p className="text-sm font-bold flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Ask AI Anything!
              </p>
              <p className="text-xs opacity-90 mt-1">
                JEEnie - Premium AI Tutor 💎
              </p>
            </div>
            {/* Arrow */}
            <div className="absolute top-full right-4 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-[#013062]"></div>
          </div>
        )}
      </div>

      {/* AI Modal */}
      <AIDoubtSolver 
        question={generalQuestion}
        isOpen={showAI}
        onClose={() => setShowAI(false)}
      />
    </>
  );
};
