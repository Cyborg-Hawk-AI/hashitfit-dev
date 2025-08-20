
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reflection {
  id: number;
  question: string;
  answer: string;
  date: string;
}

interface WeeklyReflectionModalProps {
  reflections?: Reflection[];
  onSaveReflection?: (reflections: Reflection[]) => void;
  className?: string;
}

export function WeeklyReflectionModal({ 
  reflections = [], 
  onSaveReflection,
  className 
}: WeeklyReflectionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState({
    workoutFeel: "",
    biggestChallenge: "",
    nextWeekGoal: ""
  });

  const questions = [
    {
      key: "workoutFeel" as keyof typeof answers,
      label: "How did you feel about your workouts this week?",
      placeholder: "e.g., Energized, challenging, need more rest..."
    },
    {
      key: "biggestChallenge" as keyof typeof answers,
      label: "What was your biggest challenge?",
      placeholder: "e.g., Time management, motivation, nutrition..."
    },
    {
      key: "nextWeekGoal" as keyof typeof answers,
      label: "What's one thing you want to improve next week?",
      placeholder: "e.g., Consistency, form, meal prep..."
    }
  ];

  const handleSave = () => {
    if (onSaveReflection) {
      const newReflections = questions.map((q, index) => ({
        id: Date.now() + index,
        question: q.label,
        answer: answers[q.key],
        date: new Date().toLocaleDateString()
      })).filter(r => r.answer.trim() !== "");

      onSaveReflection([...reflections, ...newReflections]);
    }
    
    setAnswers({ workoutFeel: "", biggestChallenge: "", nextWeekGoal: "" });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("hover:scale-105 transition-all", className)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Reflection
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-hashim-600" />
            📝 Weekly Reflection
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Take a moment to reflect on your week. These insights help improve your AI coaching!
          </p>
          
          {questions.map((question, index) => (
            <div key={index} className="space-y-2">
              <label className="text-sm font-medium">{question.label}</label>
              <Textarea
                placeholder={question.placeholder}
                value={answers[question.key]}
                onChange={(e) => setAnswers(prev => ({
                  ...prev,
                  [question.key]: e.target.value
                }))}
                className="min-h-20"
              />
            </div>
          ))}
          
          {reflections.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Recent Reflections</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {reflections.slice(-2).map((reflection) => (
                  <div key={reflection.id} className="p-2 bg-gray-50 rounded text-xs">
                    <Badge variant="secondary" className="text-xs mb-1">
                      {reflection.date}
                    </Badge>
                    <p className="font-medium">{reflection.question}</p>
                    <p className="text-muted-foreground">{reflection.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Reflection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
