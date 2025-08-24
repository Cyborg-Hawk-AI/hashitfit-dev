
import { ModernDashboard } from "@/components/ModernDashboard";
import { Logo } from "@/components/Logo";
import { NavigationBar } from "@/components/ui-components";
import { ChatFAB } from "@/components/ChatFAB";
import { RestTimerOverlay } from "@/components/RestTimerOverlay";
import { IconButton } from "@/components/ui-components";
import { Settings, User, Mic, Camera } from "lucide-react";
import { useState, useEffect } from "react";
import { UserStatsModal } from "@/components/UserStatsModal";
import { Button } from "@/components/ui/button";
import { useDashboardHandlers } from "@/hooks/useDashboardHandlers";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { PlanGenerationService } from "@/lib/supabase/services/PlanGenerationService";

export default function DashboardPage() {
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [isCheckingAssessment, setIsCheckingAssessment] = useState(true);
  const { handleLogWorkoutVoice, handleSnapMeal } = useDashboardHandlers();
  const { userId } = useAuth();
  const navigate = useNavigate();

  // Check if user has completed assessment
  useEffect(() => {
    const checkAssessmentStatus = async () => {
      console.log('🔍 Dashboard: Starting assessment status check');
      console.log('🔍 Dashboard: userId:', userId);
      
      if (!userId) {
        console.log('🔍 Dashboard: No userId, setting isCheckingAssessment to false');
        setIsCheckingAssessment(false);
        return;
      }

      console.log('🔍 Dashboard: UserId found, checking assessment status...');
      try {
        console.log('🔍 Dashboard: Calling PlanGenerationService.checkUserPlanStatus with userId:', userId);
        const hasCompleted = await PlanGenerationService.checkUserPlanStatus(userId);
        console.log('🔍 Dashboard: PlanGenerationService.checkUserPlanStatus returned:', hasCompleted);
        
        if (!hasCompleted) {
          console.log('🔍 Dashboard: User has not completed assessment, redirecting to /assessment');
          navigate('/assessment', { replace: true });
          return;
        } else {
          console.log('🔍 Dashboard: User has completed assessment, staying on dashboard');
        }
      } catch (error) {
        console.error('🔍 Dashboard: Error checking assessment status:', error);
        console.log('🔍 Dashboard: Error occurred, redirecting to /assessment');
        navigate('/assessment', { replace: true });
        return;
      } finally {
        console.log('🔍 Dashboard: Assessment check completed, setting isCheckingAssessment to false');
        setIsCheckingAssessment(false);
      }
    };

    checkAssessmentStatus();
  }, [userId, navigate]);

  // Show loading while checking assessment status
  if (isCheckingAssessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hashim-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-emerald-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-border sticky top-0 z-10 animate-fade-in">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center space-x-2">
            <IconButton 
              icon={Settings}
              variant="outline"
              onClick={() => {}}
            />
            <IconButton 
              icon={User}
              variant="outline"
              onClick={() => setShowStatsModal(true)}
            />
          </div>
        </div>
      </header>
      
      <main className="animate-fade-in">
        <ModernDashboard />
        {/* Bottom spacing for floating action buttons */}
        <div className="h-32"></div>
      </main>
      
      <NavigationBar />
      
      {/* Floating Action Buttons - Highest Z-Index */}
      <div className="fixed bottom-28 left-0 right-0 z-[100] flex justify-center">
        <div className="flex items-center justify-between w-64 px-4">
          {/* Log Workout Button */}
          <Button
            onClick={handleLogWorkoutVoice}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 p-0"
          >
            <Mic size={24} />
          </Button>
          
          {/* Log Meal Button */}
          <Button
            onClick={handleSnapMeal}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 p-0"
          >
            <Camera size={24} />
          </Button>
          
          {/* Spacer for ChatFAB (it positions itself) */}
          <div className="w-14 h-14"></div>
        </div>
      </div>
      
      <ChatFAB />
      <RestTimerOverlay />
      
      <UserStatsModal 
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
      />
    </div>
  );
}
