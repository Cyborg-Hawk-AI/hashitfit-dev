
import React from 'react';
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AICoachBubbleProps {
  message: string;
  isVisible: boolean;
  className?: string;
}

export function AICoachBubble({ message, isVisible, className }: AICoachBubbleProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "relative bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl p-4 mb-4 animate-fade-in",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/20 rounded-full animate-pulse">
          <Brain size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">AI Coach</p>
          <p className="text-sm text-white/90">{message}</p>
        </div>
        <Sparkles size={16} className="text-white/70 animate-pulse" />
      </div>
      
      {/* Speech bubble tail */}
      <div className="absolute bottom-0 left-6 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-purple-500 transform translate-y-full"></div>
    </div>
  );
}
