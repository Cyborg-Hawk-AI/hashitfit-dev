
import { useState } from "react";
import { AnimatedCard } from "@/components/ui-components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/context/UserContext";
import { User, Edit, Camera } from "lucide-react";

interface ProfileOverviewCardProps {
  user: UserProfile | null;
}

export function ProfileOverviewCard({ user }: ProfileOverviewCardProps) {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  const getFitnessLevel = () => {
    if (!user) return "Beginner";
    
    // Simple logic to determine fitness level based on workout frequency and goals
    if (user.workoutFrequency >= 5) return "Advanced";
    if (user.workoutFrequency >= 3) return "Intermediate";
    return "Beginner";
  };

  const getGoalDisplay = () => {
    if (!user) return "Getting Started";
    
    const goalMap = {
      muscle_gain: "Muscle Gain",
      weight_loss: "Weight Loss", 
      endurance: "Endurance",
      sport_specific: "Sport Training"
    };
    
    return `${goalMap[user.fitnessGoal]} – 12 Week Plan`;
  };

  const getAIMessage = () => {
    const messages = [
      "Welcome back! Focus on consistency this week.",
      "Great progress! Let's push for 4 workouts this week.",
      "You're on track! Time to increase your protein intake.",
      "Excellent momentum! Consider adding a rest day."
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const fitnessLevel = getFitnessLevel();
  const levelColors = {
    Beginner: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    Intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400", 
    Advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
  };

  return (
    <AnimatedCard className="mb-6">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <Avatar className="w-16 h-16">
            <AvatarImage src="/placeholder.svg" alt={user?.name || "User"} />
            <AvatarFallback className="bg-hashim-100 text-hashim-700">
              <User size={24} />
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="sm"
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white dark:bg-gray-800 border shadow-sm"
            onClick={() => setIsEditingAvatar(true)}
          >
            <Camera size={12} />
          </Button>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold truncate">{user?.name || "Your Name"}</h2>
            <Button variant="ghost" size="sm">
              <Edit size={16} />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <Badge className={levelColors[fitnessLevel]}>
              {fitnessLevel}
            </Badge>
            <span className="text-sm text-muted-foreground">•</span>
            <span className="text-sm font-medium">{getGoalDisplay()}</span>
          </div>
          
          <div className="bg-hashim-50 dark:bg-hashim-900/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-2 h-2 bg-hashim-500 rounded-full mt-2"></div>
              <p className="text-sm text-hashim-700 dark:text-hashim-300 font-medium">
                {getAIMessage()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedCard>
  );
}
