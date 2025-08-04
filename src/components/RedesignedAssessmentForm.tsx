
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { Form } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { PlanGenerationService, AssessmentData } from "@/lib/supabase/services/PlanGenerationService";
import { AssessmentStep } from "./assessment/AssessmentStep";
import { BasicInfoStep } from "./assessment/steps/BasicInfoStep";
import { FitnessGoalsStep } from "./assessment/steps/FitnessGoalsStep";
import { WorkoutPreferencesStep } from "./assessment/steps/WorkoutPreferencesStep";
import { ActivitiesStep } from "./assessment/steps/ActivitiesStep";
import { SummaryStep } from "./assessment/steps/SummaryStep";

const FormSchema = z.object({
  age: z.coerce.number().min(16).max(90),
  gender: z.enum(["male", "female", "other"]),
  height: z.coerce.number().min(120).max(230),
  weight: z.coerce.number().min(40).max(200),
  fitnessGoal: z.enum(["weight_loss", "muscle_gain", "endurance", "general_fitness"]),
  workoutFrequency: z.coerce.number().min(1).max(7),
  diet: z.enum(["standard", "vegetarian", "vegan", "keto", "paleo", "gluten_free"]),
  equipment: z.enum(["none", "minimal", "full_gym"]),
  sportsPlayed: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

const DEFAULT_VALUES: FormSchemaType = {
  age: 30,
  gender: "male",
  height: 175,
  weight: 75,
  fitnessGoal: "general_fitness",
  workoutFrequency: 3,
  diet: "standard",
  equipment: "minimal",
  sportsPlayed: [],
  allergies: [],
};

interface RedesignedAssessmentFormProps {
  onComplete: () => void;
  isProcessing?: boolean;
}

const STEPS = [
  { id: "basic", title: "Basic Information", subtitle: "Tell us about yourself" },
  { id: "goals", title: "Fitness Goals", subtitle: "What do you want to achieve?" },
  { id: "preferences", title: "Workout Preferences", subtitle: "How do you like to train?" },
  { id: "activities", title: "Activities & Diet", subtitle: "Your lifestyle and restrictions" },
  { id: "summary", title: "Review & Confirm", subtitle: "Let's build your plan!" },
];

export function RedesignedAssessmentForm({ onComplete, isProcessing = false }: RedesignedAssessmentFormProps) {
  const { userId } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const validateCurrentStep = (): boolean => {
    const currentStepId = STEPS[currentStep].id;
    const values = form.getValues();
    
    switch (currentStepId) {
      case "basic":
        return !!(values.age && values.gender && values.height && values.weight);
      case "goals":
        return !!values.fitnessGoal;
      case "preferences":
        return !!(values.workoutFrequency && values.diet && values.equipment);
      case "activities":
        return true; // Optional fields
      case "summary":
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      await handleSubmit();
    } else {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!userId) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to complete the assessment",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const formData = form.getValues();
      
      // Ensure all required fields are present before submission
      if (!formData.age || !formData.gender || !formData.height || !formData.weight || 
          !formData.fitnessGoal || !formData.workoutFrequency || !formData.diet || !formData.equipment) {
        throw new Error("Please complete all required fields");
      }
      
      // Cast to AssessmentData after validation
      const assessmentData: AssessmentData = {
        age: formData.age,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        fitnessGoal: formData.fitnessGoal,
        workoutFrequency: formData.workoutFrequency,
        diet: formData.diet,
        equipment: formData.equipment,
        sportsPlayed: formData.sportsPlayed || [],
        allergies: formData.allergies || [],
      };
      
      console.log('Submitting assessment data:', assessmentData);
      
      // Trigger plan generation immediately and show loading screen
      onComplete();
      
      // Generate the plan in the background - this will take some time
      setTimeout(async () => {
        try {
          await PlanGenerationService.generateFitnessPlan(assessmentData);
          console.log('Plan generation completed successfully');
        } catch (error) {
          console.error('Error generating fitness plan:', error);
          // The user will already be on the loading screen, so we don't show errors here
          // The loading screen will complete and redirect to dashboard anyway
        }
      }, 100);
      
    } catch (error: any) {
      console.error("Error in assessment submission:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error processing your assessment",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    const stepId = STEPS[currentStep].id;
    
    switch (stepId) {
      case "basic":
        return <BasicInfoStep form={form} />;
      case "goals":
        return <FitnessGoalsStep form={form} />;
      case "preferences":
        return <WorkoutPreferencesStep form={form} />;
      case "activities":
        return <ActivitiesStep form={form} />;
      case "summary":
        return <SummaryStep form={form} />;
      default:
        return null;
    }
  };

  const isLoading = submitting || isProcessing;

  return (
    <Form {...form}>
      <AssessmentStep
        title={STEPS[currentStep].title}
        subtitle={STEPS[currentStep].subtitle}
        currentStep={currentStep + 1}
        totalSteps={STEPS.length}
        onNext={handleNext}
        onPrev={handlePrev}
        canGoNext={validateCurrentStep()}
        canGoPrev={currentStep > 0}
        isLoading={isLoading}
      >
        {renderCurrentStep()}
      </AssessmentStep>
    </Form>
  );
}
