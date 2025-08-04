
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DailySnapshotRingProps {
  caloriesConsumed: number;
  caloriesTarget: number;
  proteinConsumed: number;
  proteinTarget: number;
}

export function DailySnapshotRing({ 
  caloriesConsumed, 
  caloriesTarget, 
  proteinConsumed, 
  proteinTarget 
}: DailySnapshotRingProps) {
  const calorieProgress = Math.min((caloriesConsumed / caloriesTarget) * 100, 100);
  const proteinProgress = Math.min((proteinConsumed / proteinTarget) * 100, 100);

  return (
    <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-white/40 dark:border-slate-700/40 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
          📊 Today's Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-6">
          {/* Calories Ring */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-slate-200 dark:text-slate-600"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  className="text-violet-500"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 32}`,
                    strokeDashoffset: `${2 * Math.PI * 32 * (1 - calorieProgress / 100)}`,
                    transition: 'stroke-dashoffset 0.5s ease-in-out',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-800 dark:text-white">
                  {Math.round(calorieProgress)}%
                </span>
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              🔥 {caloriesConsumed} / {caloriesTarget} cal
            </div>
          </div>

          {/* Protein Ring */}
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-slate-200 dark:text-slate-600"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="32"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  className="text-indigo-500"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 32}`,
                    strokeDashoffset: `${2 * Math.PI * 32 * (1 - proteinProgress / 100)}`,
                    transition: 'stroke-dashoffset 0.5s ease-in-out',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-800 dark:text-white">
                  {Math.round(proteinProgress)}%
                </span>
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300">
              💪 {proteinConsumed}g / {proteinTarget}g protein
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
