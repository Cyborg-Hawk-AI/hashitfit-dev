
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Dumbbell } from "lucide-react";

interface WorkoutPreferencesStepProps {
  form: UseFormReturn<any>;
}

export function WorkoutPreferencesStep({ form }: WorkoutPreferencesStepProps) {
  const workoutFrequency = form.watch("workoutFrequency");

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-hashim-100 flex items-center justify-center mx-auto mb-3">
          <Calendar className="text-hashim-600" size={24} />
        </div>
        <p className="text-sm text-muted-foreground">
          Tell us about your workout preferences
        </p>
      </div>

      <FormField
        control={form.control}
        name="workoutFrequency"
        render={({ field: { value, onChange } }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Calendar size={16} />
              Workout Days Per Week: {value}
            </FormLabel>
            <FormControl>
              <div className="px-2">
                <Slider
                  min={1}
                  max={7}
                  step={1}
                  defaultValue={[value]}
                  onValueChange={(vals) => onChange(vals[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>1 day</span>
                  <span>7 days</span>
                </div>
              </div>
            </FormControl>
            <FormDescription>
              How many days per week can you commit to working out?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="equipment"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Dumbbell size={16} />
              Available Equipment
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select available equipment" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <span>🏃‍♂️</span>
                    <span>None (Bodyweight Only)</span>
                  </div>
                </SelectItem>
                <SelectItem value="minimal">
                  <div className="flex items-center gap-2">
                    <span>🏋️‍♀️</span>
                    <span>Minimal (Dumbbells, Bands)</span>
                  </div>
                </SelectItem>
                <SelectItem value="full_gym">
                  <div className="flex items-center gap-2">
                    <span>🏢</span>
                    <span>Full Gym Access</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              What equipment do you have access to?
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="diet"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <span>🥗</span>
              Diet Type
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select diet type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="keto">Keto</SelectItem>
                <SelectItem value="paleo">Paleo</SelectItem>
                <SelectItem value="gluten_free">Gluten Free</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Select your current or preferred diet
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
