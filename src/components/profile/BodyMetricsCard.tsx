
import { useState } from "react";
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserProfile } from "@/context/UserContext";
import { 
  Weight, 
  Ruler, 
  Calendar,
  Edit,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface BodyMetricsCardProps {
  user: UserProfile | null;
  updateUser: (updates: Partial<UserProfile>) => Promise<boolean>;
}

export function BodyMetricsCard({ user, updateUser }: BodyMetricsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    height: user?.height?.toString() || "",
    weight: user?.weight?.toString() || "",
    age: user?.age?.toString() || "",
    gender: user?.gender || "male"
  });

  const handleSave = async () => {
    const success = await updateUser({
      height: parseFloat(formData.height),
      weight: parseFloat(formData.weight),
      age: parseInt(formData.age, 10),
      gender: formData.gender as "male" | "female" | "other"
    });
    
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      height: user?.height?.toString() || "",
      weight: user?.weight?.toString() || "",
      age: user?.age?.toString() || "",
      gender: user?.gender || "male"
    });
    setIsEditing(false);
  };

  // Mock trend data - in real app this would come from progress metrics
  const getTrendIcon = (metric: string) => {
    const trends = {
      weight: { direction: "down", value: "-0.5" },
      height: { direction: "stable", value: "0" }
    };
    
    const trend = trends[metric as keyof typeof trends];
    if (!trend) return <Minus size={12} className="text-gray-400" />;
    
    if (trend.direction === "up") return <TrendingUp size={12} className="text-green-500" />;
    if (trend.direction === "down") return <TrendingDown size={12} className="text-blue-500" />;
    return <Minus size={12} className="text-gray-400" />;
  };

  return (
    <AnimatedCard className="mb-6" delay={200}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center">
              <Weight size={18} className="mr-2 text-hashim-600" />
              <h3 className="font-semibold">Body Metrics</h3>
            </div>
            <div className="flex items-center space-x-2">
              {!isOpen && (
                <div className="text-sm text-muted-foreground">
                  {user?.weight}kg • {user?.height}cm
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Height (cm)</label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Weight (kg)</label>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Age</label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.gender}
                    onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as "male" | "female" | "other" }))}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
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
                <span className="text-muted-foreground">Height</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{user?.height}cm</span>
                  {getTrendIcon("height")}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Weight</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{user?.weight}kg</span>
                  {getTrendIcon("weight")}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Age</span>
                <span className="font-medium">{user?.age} years</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Gender</span>
                <span className="font-medium capitalize">{user?.gender}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="w-full mt-4"
              >
                <Edit size={16} className="mr-2" />
                Edit Metrics
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </AnimatedCard>
  );
}
