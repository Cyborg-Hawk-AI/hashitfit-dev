
import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Button } from "./ui/button";
import { ChatInterface } from "./ChatInterface";

export function ChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed bottom-28 right-16 z-[100] rounded-full w-14 h-14 p-0 shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? "bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800" 
            : "bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700"
        }`}
      >
        <Dumbbell size={24} className="text-white" />
      </Button>
      
      <ChatInterface isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
