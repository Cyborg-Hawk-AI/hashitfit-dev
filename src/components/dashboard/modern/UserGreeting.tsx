
import { Zap } from "lucide-react";

interface UserGreetingProps {
  userName: string;
}

export function UserGreeting({ userName }: UserGreetingProps) {
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {getTimeBasedGreeting()}, {userName} 👋
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
          Ready to crush your fitness goals?
        </p>
      </div>
      <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
        <Zap className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
