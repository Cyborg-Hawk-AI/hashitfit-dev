
import { AnimatedCard } from "@/components/ui-components";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Scale, 
  Camera, 
  Bot, 
  BarChart3, 
  Settings 
} from "lucide-react";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

interface QuickActionPanelProps {
  onLogWeight?: () => void;
  onUploadPhoto?: () => void;
  onReassess?: () => void;
  onViewProgress?: () => void;
  onNutritionSettings?: () => void;
}

export function QuickActionPanel({
  onLogWeight,
  onUploadPhoto,
  onReassess,
  onViewProgress,
  onNutritionSettings
}: QuickActionPanelProps) {
  const quickActions: QuickAction[] = [
    {
      id: 'log-weight',
      label: 'Log Weight',
      icon: <Scale size={16} />,
      action: () => onLogWeight?.(),
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      id: 'upload-photo',
      label: 'Upload Photo',
      icon: <Camera size={16} />,
      action: () => onUploadPhoto?.(),
      color: 'bg-green-100 text-green-700 hover:bg-green-200'
    },
    {
      id: 'reassess',
      label: 'Reassess',
      icon: <Bot size={16} />,
      action: () => onReassess?.(),
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
    },
    {
      id: 'view-progress',
      label: 'View Progress',
      icon: <BarChart3 size={16} />,
      action: () => onViewProgress?.(),
      color: 'bg-orange-100 text-orange-700 hover:bg-orange-200'
    },
    {
      id: 'nutrition-settings',
      label: 'Nutrition Settings',
      icon: <Settings size={16} />,
      action: () => onNutritionSettings?.(),
      color: 'bg-red-100 text-red-700 hover:bg-red-200'
    }
  ];

  return (
    <AnimatedCard className="mb-6" delay={400}>
      <div className="flex items-center mb-4">
        <span className="text-lg mr-2">⚡</span>
        <h3 className="font-semibold">Quick Actions</h3>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex space-x-3 pb-2">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              onClick={action.action}
              className={`flex-shrink-0 flex flex-col items-center space-y-1 h-auto p-3 min-w-[80px] ${action.color}`}
            >
              {action.icon}
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </AnimatedCard>
  );
}
