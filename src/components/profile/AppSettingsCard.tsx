
import { useState } from "react";
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Settings, ChevronRight } from "lucide-react";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function AppSettingsCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: "system",
    units: "metric",
    workoutReminders: true,
    mealPrompts: true,
    weeklyReports: true,
    pushNotifications: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AnimatedCard className="mb-6" delay={600}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center">
              <Settings size={18} className="mr-2 text-hashim-600" />
              <h3 className="font-semibold">App Settings</h3>
            </div>
            <ChevronRight 
              size={16} 
              className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} 
            />
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4">
          <div className="space-y-4">
            {/* Theme */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Theme</span>
              <select
                className="text-sm bg-transparent border rounded px-2 py-1"
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            
            {/* Units */}
            <div className="flex justify-between items-center">
              <span className="text-sm">Units</span>
              <select
                className="text-sm bg-transparent border rounded px-2 py-1"
                value={settings.units}
                onChange={(e) => updateSetting('units', e.target.value)}
              >
                <option value="metric">Metric (kg/cm)</option>
                <option value="imperial">Imperial (lbs/ft)</option>
              </select>
            </div>
            
            {/* Notifications */}
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">Notifications</h4>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Workout Reminders</span>
                <Switch 
                  checked={settings.workoutReminders}
                  onCheckedChange={(checked) => updateSetting('workoutReminders', checked)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Meal Prompts</span>
                <Switch 
                  checked={settings.mealPrompts}
                  onCheckedChange={(checked) => updateSetting('mealPrompts', checked)}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Weekly Reports</span>
                <Switch 
                  checked={settings.weeklyReports}
                  onCheckedChange={(checked) => updateSetting('weeklyReports', checked)}
                />
              </div>
            </div>
            
            {/* Privacy & Data */}
            <div className="space-y-2 pt-2 border-t">
              <h4 className="text-sm font-medium">Privacy & Data</h4>
              <Button variant="ghost" size="sm" className="w-full justify-start text-sm">
                Export My Data
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-sm text-destructive">
                Delete Account
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </AnimatedCard>
  );
}
