
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Sparkles, User, Target, Calendar, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface SummaryStepProps {
  form: UseFormReturn<any>;
}

export function SummaryStep({ form }: SummaryStepProps) {
  const [aiSummary, setAiSummary] = useState("");
  const formData = form.getValues();

  useEffect(() => {
    // Generate AI summary based on form data
    const generateSummary = () => {
      const goalMap = {
        weight_loss: "lose weight",
        muscle_gain: "build muscle",
        endurance: "improve endurance",
        general_fitness: "stay fit"
      };

      const equipmentMap = {
        none: "bodyweight exercises",
        minimal: "dumbbells and basic equipment",
        full_gym: "full gym access"
      };

      const goal = goalMap[formData.fitnessGoal] || "achieve your fitness goals";
      const equipment = equipmentMap[formData.equipment] || "available equipment";
      const frequency = formData.workoutFrequency;

      const summary = `Perfect! You want to ${goal}, train ${frequency}x per week, and prefer ${equipment}. Your personalized AI fitness plan is being crafted just for you!`;
      
      // Simulate typing effect
      let i = 0;
      const typeEffect = () => {
        if (i < summary.length) {
          setAiSummary(summary.slice(0, i + 1));
          i++;
          setTimeout(typeEffect, 30);
        }
      };
      typeEffect();
    };

    generateSummary();
  }, [formData]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-hashim-500 to-hashim-600 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="text-white" size={24} />
        </div>
        <h2 className="text-xl font-semibold mb-2">Almost Ready!</h2>
        <p className="text-sm text-muted-foreground">
          Let's review your fitness profile
        </p>
      </div>

      {/* AI Summary */}
      <Card className="p-4 bg-gradient-to-r from-hashim-50 to-blue-50 dark:from-hashim-900/20 dark:to-blue-900/20 border-hashim-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-hashim-500 text-white">
            <Sparkles size={16} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-hashim-700 dark:text-hashim-300 mb-2">
              AI Summary
            </h3>
            <p className="text-sm text-hashim-600 dark:text-hashim-400 leading-relaxed">
              {aiSummary}
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Summary */}
      <div className="grid gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <User className="text-hashim-500" size={18} />
            <h3 className="font-medium">Basic Info</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Age:</span>
            <span>{formData.age} years</span>
            <span className="text-muted-foreground">Gender:</span>
            <span className="capitalize">{formData.gender}</span>
            <span className="text-muted-foreground">Height:</span>
            <span>{formData.height} cm</span>
            <span className="text-muted-foreground">Weight:</span>
            <span>{formData.weight} kg</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Target className="text-hashim-500" size={18} />
            <h3 className="font-medium">Fitness Goal</h3>
          </div>
          <p className="text-sm capitalize">{formData.fitnessGoal?.replace('_', ' ')}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="text-hashim-500" size={18} />
            <h3 className="font-medium">Workout Plan</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Frequency:</span>
            <span>{formData.workoutFrequency}x per week</span>
            <span className="text-muted-foreground">Equipment:</span>
            <span className="capitalize">{formData.equipment?.replace('_', ' ')}</span>
            <span className="text-muted-foreground">Diet:</span>
            <span className="capitalize">{formData.diet?.replace('_', ' ')}</span>
          </div>
        </Card>

        {(formData.sportsPlayed?.length > 0 || formData.allergies?.length > 0) && (
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="text-hashim-500" size={18} />
              <h3 className="font-medium">Additional Info</h3>
            </div>
            <div className="space-y-2 text-sm">
              {formData.sportsPlayed?.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Sports: </span>
                  <span className="capitalize">{formData.sportsPlayed.join(', ')}</span>
                </div>
              )}
              {formData.allergies?.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Allergies: </span>
                  <span className="capitalize">{formData.allergies.join(', ')}</span>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
