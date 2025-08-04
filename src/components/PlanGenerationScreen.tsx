
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Check, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

interface PlanGenerationScreenProps {
  onComplete: () => void;
}

const GENERATION_STEPS = [
  { id: 1, text: "📋 Saving your assessment", duration: 1000 },
  { id: 2, text: "🤖 Talking to your AI coach", duration: 3000 },
  { id: 3, text: "💪 Generating your 4-week workout plan", duration: 4000 },
  { id: 4, text: "🍽️ Building your personalized nutrition plan", duration: 3000 },
  { id: 5, text: "📊 Finalizing your recommendations", duration: 2000 },
  { id: 6, text: "✅ Syncing your dashboard", duration: 1000 },
];

export function PlanGenerationScreen({ onComplete }: PlanGenerationScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep < GENERATION_STEPS.length) {
      const step = GENERATION_STEPS[currentStep];
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, step.id]);
        setProgress(((currentStep + 1) / GENERATION_STEPS.length) * 100);
        
        if (currentStep + 1 === GENERATION_STEPS.length) {
          // All steps complete, wait a moment then redirect
          setTimeout(() => {
            onComplete();
          }, 1000);
        } else {
          setCurrentStep(prev => prev + 1);
        }
      }, step.duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, onComplete]);

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId);
  const isStepActive = (stepId: number) => currentStep + 1 === stepId && !isStepCompleted(stepId);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-hashim-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Progress Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <Logo size="sm" />
            <span className="text-sm font-medium text-hashim-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto w-full"
        >
          {/* Success Header */}
          <Card className="p-8 mb-6 text-center">
            <motion.div 
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 mx-auto"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Dumbbell className="text-green-600" size={32} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1 className="text-3xl font-bold mb-3">🎉 You're All Set!</h1>
              <p className="text-muted-foreground mb-4">
                Your personalized fitness and nutrition plan is being generated.
              </p>
            </motion.div>
          </Card>

          {/* Generation Steps */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Plan Generation Progress</h2>
            <div className="space-y-3">
              {GENERATION_STEPS.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                    isStepCompleted(step.id) 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : isStepActive(step.id)
                      ? 'bg-hashim-50 dark:bg-hashim-900/20 border border-hashim-200 dark:border-hashim-800'
                      : 'bg-gray-50 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <AnimatePresence mode="wait">
                      {isStepCompleted(step.id) ? (
                        <motion.div
                          key="check"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                        >
                          <Check size={12} className="text-white" />
                        </motion.div>
                      ) : isStepActive(step.id) ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Loader2 size={16} className="animate-spin text-hashim-500" />
                        </motion.div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600" />
                      )}
                    </AnimatePresence>
                  </div>
                  <span className={`text-sm ${
                    isStepCompleted(step.id) || isStepActive(step.id)
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  }`}>
                    {step.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* What's Next Info */}
          <motion.div 
            className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What's next?</h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Your workouts are being scheduled, nutrition targets are set, and your AI fitness assistant is ready to help!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
