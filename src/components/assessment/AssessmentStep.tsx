
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AssessmentStepProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLoading?: boolean;
}

export function AssessmentStep({
  title,
  subtitle,
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  canGoNext,
  canGoPrev,
  isLoading = false
}: AssessmentStepProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-hashim-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Progress Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-hashim-600">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-4 py-6">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-lg mx-auto w-full"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <Card className="p-6 mb-6">
            {children}
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onPrev}
              disabled={!canGoPrev}
              className="flex items-center"
            >
              <ChevronLeft size={16} className="mr-1" />
              Back
            </Button>

            <Button
              onClick={onNext}
              disabled={!canGoNext || isLoading}
              className="flex items-center"
            >
              {currentStep === totalSteps ? "Complete Assessment" : "Next"}
              {currentStep !== totalSteps && <ChevronRight size={16} className="ml-1" />}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
