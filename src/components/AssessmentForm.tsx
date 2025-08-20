import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { AssessmentService } from "@/lib/supabase/services/AssessmentService";
import { AnimatedCard } from "./ui-components";

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

const SPORTS_OPTIONS = [
  { id: "running", label: "Running" },
  { id: "cycling", label: "Cycling" },
  { id: "swimming", label: "Swimming" },
  { id: "weightlifting", label: "Weightlifting" },
  { id: "yoga", label: "Yoga" },
  { id: "basketball", label: "Basketball" },
  { id: "soccer", label: "Soccer" },
  { id: "tennis", label: "Tennis" },
];

const ALLERGY_OPTIONS = [
  { id: "dairy", label: "Dairy" },
  { id: "gluten", label: "Gluten" },
  { id: "nuts", label: "Nuts" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
  { id: "shellfish", label: "Shellfish" },
];

interface AssessmentFormProps {
  onComplete: () => void;
  isProcessing?: boolean;
}

export function AssessmentForm({ onComplete, isProcessing = false }: AssessmentFormProps) {
  const { userId } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  async function onSubmit(data: FormSchemaType) {
    if (!userId) {
      toast({
        title: "Not logged in",
        description: "You must be logged in to complete the assessment",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    console.log("Submitting assessment data:", data);
    
    try {
      // Ensure all required fields are present before submission
      if (!data.age || !data.gender || !data.height || !data.weight || 
          !data.fitnessGoal || !data.workoutFrequency || !data.diet || !data.equipment) {
        throw new Error("Please complete all required fields");
      }
      
      const success = await AssessmentService.analyzeAssessment(userId, data);
      
      if (success) {
        toast({
          title: "Assessment complete!",
          description: "Your personalized fitness plan is ready",
        });
        onComplete();
      } else {
        toast({
          title: "Error",
          description: "There was an error processing your assessment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error in assessment submission:", error);
      toast({
        title: "Error",
        description: error.message || "There was an error processing your assessment",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Determine if form is currently in a loading state
  const isLoading = submitting || isProcessing;

  return (
    <AnimatedCard className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Fitness Goals</h2>
            
            <FormField
              control={form.control}
              name="fitnessGoal"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Primary Fitness Goal</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="weight_loss" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Weight Loss
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="muscle_gain" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Muscle Gain
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="endurance" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Endurance
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="general_fitness" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          General Fitness
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="workoutFrequency"
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormLabel>Workout Days Per Week: {value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={7}
                      step={1}
                      defaultValue={[value]}
                      onValueChange={(vals) => onChange(vals[0])}
                    />
                  </FormControl>
                  <FormDescription>
                    How many days per week can you commit to working out?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Diet & Equipment</h2>
            
            <FormField
              control={form.control}
              name="diet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diet Type</FormLabel>
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
            
            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Available Equipment</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select available equipment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None (Bodyweight Only)</SelectItem>
                      <SelectItem value="minimal">Minimal (Dumbbells, Bands)</SelectItem>
                      <SelectItem value="full_gym">Full Gym Access</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    What equipment do you have access to?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Additional Information</h2>
            
            <FormField
              control={form.control}
              name="sportsPlayed"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Sports & Activities</FormLabel>
                    <FormDescription>
                      Select any sports or activities you participate in regularly
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {SPORTS_OPTIONS.map((sport) => (
                      <FormField
                        key={sport.id}
                        control={form.control}
                        name="sportsPlayed"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={sport.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(sport.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), sport.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== sport.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {sport.label}
                              </FormLabel>
                            </FormItem>
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
                  <div className="mb-4">
                    <FormLabel className="text-base">Food Allergies</FormLabel>
                    <FormDescription>
                      Select any food allergies or restrictions
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {ALLERGY_OPTIONS.map((allergy) => (
                      <FormField
                        key={allergy.id}
                        control={form.control}
                        name="allergies"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={allergy.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(allergy.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), allergy.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== allergy.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {allergy.label}
                              </FormLabel>
                            </FormItem>
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
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Complete Assessment"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </AnimatedCard>
  );
}
