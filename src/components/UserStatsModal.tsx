import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { X, Heart, Activity, Weight, Dumbbell, Apple, TrendingUp, Target, BarChart3 } from "lucide-react";

interface UserStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserStatsModal({ isOpen, onClose }: UserStatsModalProps) {
  const { user } = useUser();
  
  if (!user) return null;
  
  // Function to convert weight from kg to lbs
  const kgToLbs = (kg: number) => Math.round(kg * 2.205);
  
  // Function to convert height from cm to ft/in
  const cmToFtIn = (cm: number) => {
    const totalInches = Math.round(cm / 2.54);
    const feet = Math.floor(totalInches / 12);
    const inches = totalInches % 12;
    return `${feet}'${inches}"`;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Your Fitness Stats
          </DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X size={18} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-4 grid gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-hashim-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <Weight className="text-hashim-600 mb-2" size={24} />
              <div className="text-sm text-muted-foreground">Current Weight</div>
              <div className="font-bold text-lg">{user.weight}kg</div>
              <div className="text-xs text-muted-foreground">({kgToLbs(user.weight)}lbs)</div>
            </div>
            
            <div className="bg-hashim-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <Activity className="text-hashim-600 mb-2" size={24} />
              <div className="text-sm text-muted-foreground">Height</div>
              <div className="font-bold text-lg">{user.height}cm</div>
              <div className="text-xs text-muted-foreground">({cmToFtIn(user.height)})</div>
            </div>
            
            <div className="bg-hashim-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <Heart className="text-hashim-600 mb-2" size={24} />
              <div className="text-sm text-muted-foreground">Age</div>
              <div className="font-bold text-lg">{user.age}</div>
              <div className="text-xs text-muted-foreground">Years</div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg flex items-center mb-3">
              <Dumbbell size={18} className="mr-2 text-hashim-600" />
              Strength Metrics
            </h3>
            <div className="border rounded-lg p-4">
              <div className="text-center text-muted-foreground">
                <Dumbbell size={48} className="mx-auto mb-4 opacity-20" />
                <p>Complete strength assessments to track your progress</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg flex items-center mb-3">
              <TrendingUp size={18} className="mr-2 text-hashim-600" />
              Progress Areas
            </h3>
            <div className="border rounded-lg p-4">
              <div className="text-center text-muted-foreground">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
                <p>Start working out to identify your progress areas</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg flex items-center mb-3">
              <Target size={18} className="mr-2 text-hashim-600" />
              Areas for Improvement
            </h3>
            <div className="border rounded-lg p-4">
              <div className="text-center text-muted-foreground">
                <Target size={48} className="mx-auto mb-4 opacity-20" />
                <p>Complete more workouts to get improvement suggestions</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg flex items-center mb-3">
              <Apple size={18} className="mr-2 text-hashim-600" />
              Diet Suggestions
            </h3>
            <div className="border rounded-lg p-4">
              <div className="text-center text-muted-foreground">
                <Apple size={48} className="mx-auto mb-4 opacity-20" />
                <p>Log your meals to receive personalized diet suggestions</p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={onClose}
            className="bg-hashim-600 hover:bg-hashim-700 text-white mt-4"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
