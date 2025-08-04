
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Target, TrendingDown, Zap, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FitnessGoalsStepProps {
  form: UseFormReturn<any>;
}

const goalOptions = [
  {
    value: "weight_loss",
    label: "Lose Weight",
    description: "Burn fat and get leaner",
    icon: TrendingDown,
    color: "text-red-500"
  },
  {
    value: "muscle_gain",
    label: "Build Muscle",
    description: "Gain strength and muscle mass",
    icon: Zap,
    color: "text-blue-500"
  },
  {
    value: "endurance",
    label: "Improve Endurance",
    description: "Boost cardio and stamina",
    icon: Activity,
    color: "text-green-500"
  },
  {
    value: "general_fitness",
    label: "General Fitness",
    description: "Stay healthy and active",
    icon: Target,
    color: "text-purple-500"
  }
];

export function FitnessGoalsStep({ form }: FitnessGoalsStepProps) {
  const selectedGoal = form.watch("fitnessGoal");

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-hashim-100 flex items-center justify-center mx-auto mb-3">
          <Target className="text-hashim-600" size={24} />
        </div>
        <p className="text-sm text-muted-foreground">
          What's your primary fitness goal?
        </p>
      </div>

      <FormField
        control={form.control}
        name="fitnessGoal"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid gap-3"
              >
                {goalOptions.map((option) => (
                  <FormItem key={option.value} className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={option.value} className="sr-only" />
                    </FormControl>
                    <Card 
                      className={`flex-1 p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedGoal === option.value 
                          ? 'ring-2 ring-hashim-500 bg-hashim-50 dark:bg-hashim-900/20' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => field.onChange(option.value)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${option.color}`}>
                          <option.icon size={20} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{option.label}</h3>
                          <p className="text-sm text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                    </Card>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
