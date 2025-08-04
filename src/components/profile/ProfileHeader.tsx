
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { UserProfile } from "@/context/UserContext";
import { User, Camera } from "lucide-react";

interface ProfileHeaderProps {
  user: UserProfile | null;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  const getActivePlan = () => {
    if (!user) return "Getting Started";
    
    const goalMap = {
      muscle_gain: "Muscle Gain",
      weight_loss: "Weight Loss", 
      endurance: "Endurance",
      sport_specific: "Sport Training"
    };
    
    return `${goalMap[user.fitnessGoal]} – Phase 2 (Week 5/12)`;
  };

  const getProgressPercentage = () => {
    // Calculate based on user's journey (mock calculation)
    if (!user) return 0;
    return 42; // Example: 42% complete
  };

  const getStatusBadge = () => {
    // Mock logic - could be based on actual workout completion data
    const workoutsThisWeek = 3;
    const targetWorkouts = 4;
    const proteinCompliance = 72; // percentage
    
    if (workoutsThisWeek >= targetWorkouts && proteinCompliance >= 80) {
      return { label: "🔥 On Fire", color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400" };
    } else if (workoutsThisWeek >= targetWorkouts * 0.75) {
      return { label: "🎯 Focused", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" };
    } else {
      return { label: "🏁 Restarting", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400" };
    }
  };

  const getStatusMessage = () => {
    const workoutsThisWeek = 3;
    const targetWorkouts = 4;
    
    if (workoutsThisWeek >= targetWorkouts) {
      return "4 of 4 workouts done — you're crushing it! 💪";
    } else if (workoutsThisWeek >= 2) {
      return `${workoutsThisWeek} of ${targetWorkouts} workouts done — you're on pace 💪`;
    } else {
      return "You've missed 2 workouts — let's bounce back today ⚡";
    }
  };

  const progressPercentage = getProgressPercentage();
  const statusBadge = getStatusBadge();

  return (
    <div className="bg-gradient-to-r from-hashim-50 to-blue-50 dark:from-hashim-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-6">
      <div className="flex items-center space-x-4">
        {/* Avatar with Progress Ring */}
        <div className="relative">
          <div className="relative">
            {/* Progress Ring */}
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                className="text-hashim-600 transition-all duration-1000 ease-out animate-pulse"
                strokeLinecap="round"
              />
            </svg>
            
            {/* Avatar */}
            <Avatar className="absolute inset-2 w-16 h-16">
              <AvatarImage src="/placeholder.svg" alt={user?.name || "User"} />
              <AvatarFallback className="bg-hashim-100 text-hashim-700">
                <User size={20} />
              </AvatarFallback>
            </Avatar>
          </div>
          
          {/* Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white dark:bg-gray-800 border shadow-sm hover:scale-110 transition-transform"
            onClick={() => setIsEditingAvatar(true)}
          >
            <Camera size={10} />
          </Button>
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold mb-1">{user?.name || "Your Name"}</h1>
          
          <p className="text-sm text-muted-foreground mb-2">
            {getActivePlan()}
          </p>
          
          <div className="flex items-center space-x-3 mb-2">
            <Badge className={statusBadge.color}>
              {statusBadge.label}
            </Badge>
            <span className="text-sm font-medium text-hashim-600">
              {progressPercentage}% complete
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground italic">
            {getStatusMessage()}
          </p>
        </div>
      </div>
    </div>
  );
}
