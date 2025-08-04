
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface ActivitiesStepProps {
  form: UseFormReturn<any>;
}

const SPORTS_OPTIONS = [
  { id: "running", label: "Running", icon: "🏃‍♂️" },
  { id: "cycling", label: "Cycling", icon: "🚴‍♀️" },
  { id: "swimming", label: "Swimming", icon: "🏊‍♂️" },
  { id: "weightlifting", label: "Weightlifting", icon: "🏋️‍♀️" },
  { id: "yoga", label: "Yoga", icon: "🧘‍♀️" },
  { id: "basketball", label: "Basketball", icon: "🏀" },
  { id: "soccer", label: "Soccer", icon: "⚽" },
  { id: "tennis", label: "Tennis", icon: "🎾" },
];

const ALLERGY_OPTIONS = [
  { id: "dairy", label: "Dairy", icon: "🥛" },
  { id: "gluten", label: "Gluten", icon: "🌾" },
  { id: "nuts", label: "Nuts", icon: "🥜" },
  { id: "eggs", label: "Eggs", icon: "🥚" },
  { id: "soy", label: "Soy", icon: "🫘" },
  { id: "shellfish", label: "Shellfish", icon: "🦐" },
];

export function ActivitiesStep({ form }: ActivitiesStepProps) {
  const selectedSports = form.watch("sportsPlayed") || [];
  const selectedAllergies = form.watch("allergies") || [];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full bg-hashim-100 flex items-center justify-center mx-auto mb-3">
          <Activity className="text-hashim-600" size={24} />
        </div>
        <p className="text-sm text-muted-foreground">
          Tell us about your activities and any dietary restrictions
        </p>
      </div>

      <FormField
        control={form.control}
        name="sportsPlayed"
        render={() => (
          <FormItem>
            <FormLabel className="text-base font-medium">Sports & Activities</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">
              Select activities you participate in regularly
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SPORTS_OPTIONS.map((sport) => (
                <FormField
                  key={sport.id}
                  control={form.control}
                  name="sportsPlayed"
                  render={({ field }) => {
                    const isChecked = selectedSports.includes(sport.id);
                    return (
                      <Card 
                        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                          isChecked 
                            ? 'ring-2 ring-hashim-500 bg-hashim-50 dark:bg-hashim-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          const newValue = isChecked
                            ? selectedSports.filter((value) => value !== sport.id)
                            : [...selectedSports, sport.id];
                          field.onChange(newValue);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isChecked} className="sr-only" />
                          <span className="text-lg">{sport.icon}</span>
                          <span className="text-sm font-medium">{sport.label}</span>
                        </div>
                      </Card>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="allergies"
        render={() => (
          <FormItem>
            <FormLabel className="text-base font-medium">Food Allergies</FormLabel>
            <p className="text-sm text-muted-foreground mb-3">
              Select any food allergies or restrictions
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ALLERGY_OPTIONS.map((allergy) => (
                <FormField
                  key={allergy.id}
                  control={form.control}
                  name="allergies"
                  render={({ field }) => {
                    const isChecked = selectedAllergies.includes(allergy.id);
                    return (
                      <Card 
                        className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                          isChecked 
                            ? 'ring-2 ring-hashim-500 bg-hashim-50 dark:bg-hashim-900/20' 
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                        onClick={() => {
                          const newValue = isChecked
                            ? selectedAllergies.filter((value) => value !== allergy.id)
                            : [...selectedAllergies, allergy.id];
                          field.onChange(newValue);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox checked={isChecked} className="sr-only" />
                          <span className="text-lg">{allergy.icon}</span>
                          <span className="text-sm font-medium">{allergy.label}</span>
                        </div>
                      </Card>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
