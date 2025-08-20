
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";

interface StreakMomentumBadgeProps {
  streakDays: number;
}

export function StreakMomentumBadge({ streakDays }: StreakMomentumBadgeProps) {
  if (streakDays === 0) return null;

  return (
    <div className="mt-2">
      <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-3 py-1 rounded-full shadow-lg">
        <Flame className="h-4 w-4 mr-1" />
        🔥 {streakDays}-day streak! Keep going!
      </Badge>
    </div>
  );
}
