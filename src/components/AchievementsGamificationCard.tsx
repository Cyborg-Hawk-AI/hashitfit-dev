
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  id: number;
  title: string;
  icon: string;
  description: string;
  progress?: number;
  target?: number;
}

interface AchievementsData {
  unlocked: Achievement[];
  upcoming: Achievement[];
}

interface AchievementsGamificationCardProps {
  achievements: AchievementsData;
  className?: string;
}

export function AchievementsGamificationCard({ 
  achievements, 
  className 
}: AchievementsGamificationCardProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  const handleViewAll = () => {
    // This would navigate to full achievements page
    console.log("View all achievements");
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const hasAchievements = achievements.unlocked.length > 0 || achievements.upcoming.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-hashim-600" />
            <CardTitle className="text-lg">Achievements</CardTitle>
            {showConfetti && (
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
            )}
          </div>
          {hasAchievements && (
            <Button variant="ghost" size="sm" className="text-hashim-600" onClick={handleViewAll}>
              View All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasAchievements ? (
          <div className="text-center py-8">
            <div className="mb-4 text-4xl">💡</div>
            <p className="text-sm font-medium mb-2">First workout = First badge!</p>
            <p className="text-xs text-muted-foreground">
              Complete your first workout to start unlocking achievements!
            </p>
          </div>
        ) : (
          <>
            {/* Unlocked Achievements */}
            {achievements.unlocked.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-green-600 flex items-center">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Unlocked
                </h4>
                {achievements.unlocked.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-green-800">{achievement.title}</p>
                      <p className="text-xs text-green-600">{achievement.description}</p>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      ✓
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Achievements */}
            {achievements.upcoming.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Lock className="h-4 w-4 mr-1" />
                  Coming Up
                </h4>
                {achievements.upcoming.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <span className="text-2xl opacity-50">{achievement.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                      {achievement.progress !== undefined && achievement.target && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{achievement.progress}/{achievement.target}</span>
                            <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(achievement.progress / achievement.target) * 100} 
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      🔓 Unlock
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
