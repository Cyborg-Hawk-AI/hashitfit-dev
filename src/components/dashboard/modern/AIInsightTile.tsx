
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { RecommendationsService, UserRecommendations } from "@/lib/supabase/services/RecommendationsService";
import { useAuth } from "@/hooks/useAuth";
import { useAICoach } from "@/hooks/useAICoach";
import { AICoachChatModal } from "@/components/AICoachChatModal";

interface AIInsightTileProps {
  onAskCoach?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AIInsightTile({ onAskCoach, isCollapsed = false, onToggleCollapse }: AIInsightTileProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  const { userId } = useAuth();
  const { isChatOpen, openChat, closeChat, generateNewRecommendations } = useAICoach();
  
  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };
  
  const collapsed = onToggleCollapse ? isCollapsed : localCollapsed;

  // Fetch user recommendations
  const { 
    data: recommendations, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['userRecommendations', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await RecommendationsService.getUserRecommendations(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleAskCoach = () => {
    if (onAskCoach) {
      onAskCoach();
    } else {
      openChat();
    }
  };

  const handleRefreshRecommendations = async () => {
    await generateNewRecommendations();
    refetch();
  };

  // Determine what content to show
  const getContent = () => {
    if (isLoading) {
      return {
        message: "Loading your personalized insights...",
        showRefresh: false,
        showLoading: true
      };
    }

    if (error) {
      return {
        message: "Unable to load recommendations. Please try again later. 💡 Based on your recent workouts, you're building great consistency! Consider adding a rest day between your strength sessions to optimize recovery.",
        showRefresh: true,
        showLoading: false
      };
    }

    if (!recommendations) {
      return {
        message: "Complete your fitness assessment to get personalized recommendations!",
        showRefresh: false,
        showLoading: false
      };
    }

    // Show the most relevant tip based on what's available
    if (recommendations.workout_tips) {
      return {
        message: recommendations.workout_tips,
        showRefresh: true,
        showLoading: false
      };
    } else if (recommendations.nutrition_tips) {
      return {
        message: recommendations.nutrition_tips,
        showRefresh: true,
        showLoading: false
      };
    } else if (recommendations.weekly_goals) {
      return {
        message: recommendations.weekly_goals,
        showRefresh: true,
        showLoading: false
      };
    }

    return {
      message: "Your AI coach is analyzing your progress. Check back soon for personalized insights!",
      showRefresh: true,
      showLoading: false
    };
  };

  const content = getContent();

  return (
    <>
      <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center space-x-2">
              <Brain className="h-5 w-5 text-violet-600" />
              <span>🧠 Coach Insights</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {content.showRefresh && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshRecommendations}
                  className="h-8 w-8 p-0"
                  title="Refresh recommendations"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggle}
                className="h-8 w-8 p-0"
              >
                {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        {!collapsed && (
          <CardContent className="pt-0">
            <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/50 dark:border-violet-700/50">
              <div className="flex items-start space-x-3 mb-4">
                {content.showLoading ? (
                  <Loader2 className="h-5 w-5 text-violet-600 animate-spin mt-0.5" />
                ) : (
                  <span className="text-lg">💡</span>
                )}
                <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                  {content.message}
                </p>
              </div>
              <Button 
                onClick={handleAskCoach}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                disabled={content.showLoading}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Ask Your Coach
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <AICoachChatModal isOpen={isChatOpen} onClose={closeChat} />
    </>
  );
}
