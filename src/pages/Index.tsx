
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ChevronRight, Dumbbell, Mic, User, Apple } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useAuth } from "@/hooks/useAuth";
import { PlanGenerationService } from "@/lib/supabase/services/PlanGenerationService";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { isAuthenticated, userId } = useAuth();
  const [isCheckingAssessment, setIsCheckingAssessment] = useState(false);

  useEffect(() => {
    const checkAssessmentStatus = async () => {
      console.log('🔍 Index: Starting assessment status check');
      console.log('🔍 Index: isAuthenticated:', isAuthenticated);
      console.log('🔍 Index: userId:', userId);
      
      if (!isAuthenticated || !userId) {
        console.log('🔍 Index: Not authenticated or no userId, skipping check');
        return;
      }

      console.log('🔍 Index: User is authenticated, checking assessment status...');
      setIsCheckingAssessment(true);
      
      try {
        console.log('🔍 Index: Calling PlanGenerationService.checkUserPlanStatus with userId:', userId);
        const hasCompleted = await PlanGenerationService.checkUserPlanStatus(userId);
        console.log('🔍 Index: PlanGenerationService.checkUserPlanStatus returned:', hasCompleted);
        
        if (hasCompleted) {
          console.log('🔍 Index: User has completed assessment, navigating to dashboard');
          navigate("/dashboard");
        } else {
          console.log('🔍 Index: User has NOT completed assessment, staying on index page');
        }
      } catch (error) {
        console.error('🔍 Index: Error checking assessment status:', error);
      } finally {
        console.log('🔍 Index: Assessment check completed, setting isCheckingAssessment to false');
        setIsCheckingAssessment(false);
      }
    };

    checkAssessmentStatus();
  }, [navigate, isAuthenticated, userId]);

  const features = [
    {
      icon: Dumbbell,
      title: "Personalized Workouts",
      description: "Get custom workout plans based on your fitness goals and equipment"
    },
    {
      icon: Mic,
      title: "Voice Logging",
      description: "Log your workouts with simple voice commands"
    },
    {
      icon: User,
      title: "Progress Tracking",
      description: "Track your fitness journey with detailed progress analytics"
    },
    {
      icon: Apple,
      title: "Personalized Diets",
      description: "Receive customized nutrition plans tailored to your body and goals"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-hashim-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 flex flex-col">
        <header className="container pt-8 flex justify-between items-center animate-fade-in">
          <Logo size="lg" />
          
          <div className="flex gap-3">
            {isAuthenticated ? (
              <Button 
                onClick={() => navigate("/dashboard")}
                className="bg-hashim-600 hover:bg-hashim-700 text-white"
                disabled={isCheckingAssessment}
              >
                {isCheckingAssessment ? "Checking..." : "Dashboard"}
                <ChevronRight className="ml-1" size={16} />
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/login")}
                  className="border-hashim-300 text-hashim-700 hover:bg-hashim-50"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => navigate("/signup")}
                  className="bg-hashim-600 hover:bg-hashim-700 text-white"
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </header>
        
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div 
            className="max-w-md mx-auto"
            style={{ animation: "slide-in 0.6s ease-out" }}
          >
            <h1 className="text-4xl font-bold mb-4">
              Your Personal AI Fitness Trainer
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Achieve your fitness goals with personalized workouts, nutrition plans, and voice-powered logging
            </p>
            
            <Button 
              className="hashim-button-primary text-lg py-6 px-8 animate-pulse-slow bg-hashim-600 hover:bg-hashim-700 text-white"
              onClick={() => isAuthenticated ? navigate("/dashboard") : navigate("/signup")}
              disabled={isCheckingAssessment}
            >
              {isAuthenticated 
                ? (isCheckingAssessment ? "Checking..." : "Go to Dashboard") 
                : "Start Your Fitness Journey"}
              <ChevronRight className="ml-2" />
            </Button>
          </div>
          
          <div className="mt-16 grid gap-6 grid-cols-2 md:grid-cols-4 max-w-3xl mx-auto">
            {features.map((feature, i) => (
              <div 
                key={feature.title}
                className="glassmorphism-card p-6 text-center"
                style={{ animation: `scale-in 0.5s ease-out ${300 + i * 100}ms backwards` }}
              >
                <div className="w-12 h-12 rounded-full bg-hashim-50 dark:bg-hashim-900/20 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="text-hashim-600" size={24} />
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
      
      <footer className="py-6 border-t border-border mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} HashimFit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
