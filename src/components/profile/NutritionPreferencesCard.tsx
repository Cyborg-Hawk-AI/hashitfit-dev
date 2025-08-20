
import { useState } from "react";
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile, Diet } from "@/context/UserContext";
import { Apple, Edit, Save, X } from "lucide-react";
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

interface NutritionPreferencesCardProps {
  user: UserProfile | null;
  updateUser: (updates: Partial<UserProfile>) => Promise<boolean>;
}

export function NutritionPreferencesCard({ user, updateUser }: NutritionPreferencesCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    diet: user?.diet || "standard",
    allergies: user?.allergies?.join(", ") || ""
  });

  const handleSave = async () => {
    const success = await updateUser({
      diet: formData.diet as Diet,
      allergies: formData.allergies.split(",").map(a => a.trim()).filter(a => a.length > 0)
    });
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      diet: user?.diet || "standard",
      allergies: user?.allergies?.join(", ") || ""
    });
    setIsEditing(false);
  };

  const dietLabels = {
    standard: "Standard",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    keto: "Keto",
    paleo: "Paleo",
    gluten_free: "Gluten Free"
  };

  return (
    <AnimatedCard className="mb-6" delay={400}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center">
              <Apple size={18} className="mr-2 text-hashim-600" />
              <h3 className="font-semibold">Nutrition Preferences</h3>
            </div>
            <div className="flex items-center space-x-2">
              {!isOpen && (
                <div className="text-sm text-muted-foreground">
                  {dietLabels[user?.diet || "standard"]}
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
                <label className="text-sm font-medium">Diet Type</label>
                <Select value={formData.diet} onValueChange={(value) => setFormData(prev => ({ ...prev, diet: value as Diet }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="keto">Keto</SelectItem>
                    <SelectItem value="paleo">Paleo</SelectItem>
                    <SelectItem value="gluten_free">Gluten Free</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Allergies & Restrictions</label>
                <Input
                  placeholder="e.g., nuts, dairy, shellfish (comma separated)"
                  value={formData.allergies}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                />
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
                <span className="text-muted-foreground">Diet Type</span>
                <span className="font-medium">{dietLabels[user?.diet || "standard"]}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Allergies</span>
                <span className="font-medium text-right max-w-[60%]">
                  {user?.allergies && user.allergies.length > 0 
                    ? user.allergies.join(", ") 
                    : "None specified"
                  }
                </span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="w-full mt-4"
              >
                <Edit size={16} className="mr-2" />
                Edit Nutrition
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </AnimatedCard>
  );
}
