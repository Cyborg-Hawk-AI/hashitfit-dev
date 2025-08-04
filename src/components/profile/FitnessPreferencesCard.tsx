
import { useState } from "react";
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { UserProfile, FitnessGoal, Equipment, WorkoutFrequency } from "@/context/UserContext";
import { Dumbbell, Edit, Save, X } from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FitnessPreferencesCardProps {
  user: UserProfile | null;
  updateUser: (updates: Partial<UserProfile>) => Promise<boolean>;
}

export function FitnessPreferencesCard({ user, updateUser }: FitnessPreferencesCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fitnessGoal: user?.fitnessGoal || "muscle_gain",
    workoutFrequency: user?.workoutFrequency?.toString() || "3",
    equipment: user?.equipment || "full_gym"
  });

  const handleSave = async () => {
    const success = await updateUser({
      fitnessGoal: formData.fitnessGoal as FitnessGoal,
      workoutFrequency: parseInt(formData.workoutFrequency, 10) as WorkoutFrequency,
      equipment: formData.equipment as Equipment
    });
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fitnessGoal: user?.fitnessGoal || "muscle_gain",
      workoutFrequency: user?.workoutFrequency?.toString() || "3",
      equipment: user?.equipment || "full_gym"
    });
    setIsEditing(false);
  };

  const goalLabels = {
    muscle_gain: "Muscle Gain",
    weight_loss: "Weight Loss",
    endurance: "Endurance",
    sport_specific: "Sport Specific"
  };

  const equipmentLabels = {
    full_gym: "Full Gym Access",
    home_gym: "Home Gym Setup", 
    minimal: "Minimal Equipment",
    bodyweight_only: "Bodyweight Only"
  };

  return (
    <AnimatedCard className="mb-6" delay={300}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center">
              <Dumbbell size={18} className="mr-2 text-hashim-600" />
              <h3 className="font-semibold">Fitness Preferences</h3>
            </div>
            <div className="flex items-center space-x-2">
              {!isOpen && (
                <div className="text-sm text-muted-foreground">
                  {user?.workoutFrequency}x/week • {goalLabels[user?.fitnessGoal || "muscle_gain"]}
                </div>
              )}
              <Button variant="ghost" size="sm">
                {isOpen ? <X size={16} /> : <Edit size={16} />}
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Fitness Goal</label>
                <Select value={formData.fitnessGoal} onValueChange={(value) => setFormData(prev => ({ ...prev, fitnessGoal: value as FitnessGoal }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                    <SelectItem value="sport_specific">Sport Specific</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Workout Frequency (days/week)</label>
                <Select value={formData.workoutFrequency} onValueChange={(value) => setFormData(prev => ({ ...prev, workoutFrequency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="2">2 days</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="4">4 days</SelectItem>
                    <SelectItem value="5">5 days</SelectItem>
                    <SelectItem value="6">6 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Available Equipment</label>
                <Select value={formData.equipment} onValueChange={(value) => setFormData(prev => ({ ...prev, equipment: value as Equipment }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_gym">Full Gym Access</SelectItem>
                    <SelectItem value="home_gym">Home Gym Setup</SelectItem>
                    <SelectItem value="minimal">Minimal Equipment</SelectItem>
                    <SelectItem value="bodyweight_only">Bodyweight Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  className="bg-hashim-600 hover:bg-hashim-700"
                >
                  <Save size={16} className="mr-1" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Goal</span>
                <span className="font-medium">{goalLabels[user?.fitnessGoal || "muscle_gain"]}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Frequency</span>
                <span className="font-medium">{user?.workoutFrequency} days/week</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Equipment</span>
                <span className="font-medium">{equipmentLabels[user?.equipment || "full_gym"]}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="w-full mt-4"
              >
                <Edit size={16} className="mr-2" />
                Edit Preferences
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </AnimatedCard>
  );
}
