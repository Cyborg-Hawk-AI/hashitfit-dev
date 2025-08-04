
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RedesignedAssessmentForm } from "@/components/RedesignedAssessmentForm";
import { PlanGenerationScreen } from "@/components/PlanGenerationScreen";
import { Logo } from "@/components/Logo";
import { AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";

export default function Assessment() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [showPlanGeneration, setShowPlanGeneration] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    try {
      if (!userId) {
        toast({
          title: "Not logged in",
          description: "You must be logged in to complete the assessment",
          variant: "destructive",
        });
        return;
      }
      
      setIsProcessing(true);
      setError(null);
      console.log("Assessment completed, showing plan generation screen");
      
      // Immediately show the plan generation screen
      setShowPlanGeneration(true);
      
    } catch (error) {
      console.error("Error handling assessment completion:", error);
      setError("There was an error processing your assessment. Please try again.");
      toast({
        title: "Error",
        description: "There was an error processing your assessment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlanGenerationComplete = () => {
    console.log("Plan generation completed, navigating to dashboard");
    // Replace current history entry so back button doesn't return here
    navigate("/dashboard", { replace: true });
  };

  if (showPlanGeneration) {
    return <PlanGenerationScreen onComplete={handlePlanGenerationComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-hashim-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="text-center pt-8 pb-4 px-4">
        <Logo size="lg" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold mt-4 mb-2">Welcome to HashimFit!</h1>
          <p className="text-muted-foreground">
            Let's create your personalized fitness journey
          </p>
        </motion.div>
      </div>
      
      {error && (
        <motion.div 
          className="mx-4 mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-2" size={18} />
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </motion.div>
      )}
      
      <RedesignedAssessmentForm onComplete={handleComplete} isProcessing={isProcessing} />
    </div>
  );
}
