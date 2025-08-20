
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

interface DataPoint {
  date: string;
  [key: string]: any;
}

interface ProgressChartProps {
  data: DataPoint[];
  metrics?: {
    weight?: boolean;
    calories?: boolean;
    protein?: boolean;
    carbs?: boolean;
    fat?: boolean;
  };
  singleMetric?: 'weight' | 'calories' | 'protein' | 'carbs' | 'fat' | 'waist' | 'chest' | 'arms' | 'hips' | 'volume';
}

const CustomTooltip = ({ active, payload, label, metrics, singleMetric }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glassmorphism-card p-3 shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => {
          if (entry.dataKey === "value" && singleMetric) {
            const unit = getMetricUnit(singleMetric);
            return (
              <p key={index} className="text-sm text-hashim-800">
                {getMetricName(singleMetric)}: <span className="font-medium">{entry.value}{unit}</span>
              </p>
            );
          } else if (entry.dataKey !== "date") {
            const unit = getMetricUnit(entry.dataKey);
            return (
              <p key={index} className="text-sm text-hashim-800" style={{ color: entry.color }}>
                {getMetricName(entry.dataKey)}: <span className="font-medium">{entry.value}{unit}</span>
              </p>
            );
          }
          return null;
        })}
      </div>
    );
  }

  return null;
};

const getMetricUnit = (metric?: string) => {
  switch(metric) {
    case 'weight':
      return 'kg';
    case 'calories':
    case 'volume':
      return '';
    case 'protein':
    case 'carbs':
    case 'fat':
      return 'g';
    case 'waist':
    case 'chest':
    case 'arms':
    case 'hips':
      return 'cm';
    default:
      return '';
  }
};

const getMetricName = (metric?: string) => {
  switch(metric) {
    case 'weight':
      return 'Weight';
    case 'calories':
      return 'Calories';
    case 'protein':
      return 'Protein';
    case 'carbs':
      return 'Carbs';
    case 'fat':
      return 'Fat';
    case 'waist':
      return 'Waist';
    case 'chest':
      return 'Chest';
    case 'arms':
      return 'Arms';
    case 'hips':
      return 'Hips';
    case 'volume':
      return 'Volume';
    default:
      return 'Value';
  }
};

export function ProgressChart({ data, metrics, singleMetric = 'weight' }: ProgressChartProps) {
  // For backward compatibility - if we're using the old single metric mode
  if (singleMetric && !metrics) {
    const formattedData = data.map(item => ({
      date: item.date,
      value: item[singleMetric] || item.value
    }));

    return (
      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{
              top: 5,
              right: 10,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ strokeOpacity: 0.3 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ strokeOpacity: 0.3 }}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip content={<CustomTooltip singleMetric={singleMetric} />} />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle" 
              iconSize={8}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              name={getMetricName(singleMetric)} 
              stroke={getMetricColor(singleMetric)} 
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  
  // New multi-metric chart display
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ strokeOpacity: 0.3 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ strokeOpacity: 0.3 }}
          />
          <Tooltip content={<CustomTooltip metrics={metrics} />} />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            iconSize={8}
          />
          
          {metrics?.weight && (
            <Line 
              type="monotone" 
              dataKey="weight" 
              name="Weight" 
              stroke={getMetricColor('weight')} 
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              animationDuration={1500}
            />
          )}
          
          {metrics?.calories && (
            <Line 
              type="monotone" 
              dataKey="calories" 
              name="Calories" 
              stroke={getMetricColor('calories')} 
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              animationDuration={1500}
            />
          )}
          
          {metrics?.protein && (
            <Line 
              type="monotone" 
              dataKey="protein" 
              name="Protein" 
              stroke={getMetricColor('protein')} 
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              animationDuration={1500}
            />
          )}
          
          {metrics?.carbs && (
            <Line 
              type="monotone" 
              dataKey="carbs" 
              name="Carbs" 
              stroke={getMetricColor('carbs')} 
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              animationDuration={1500}
            />
          )}
          
          {metrics?.fat && (
            <Line 
              type="monotone" 
              dataKey="fat" 
              name="Fat" 
              stroke={getMetricColor('fat')} 
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 2 }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              animationDuration={1500}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function getMetricColor(metric?: string): string {
  switch(metric) {
    case 'weight':
    case 'waist':
    case 'chest':
    case 'arms':
    case 'hips':
      return '#be123c'; // Red
    case 'calories':
    case 'volume':
      return '#0891b2'; // Blue
    case 'protein':
      return '#4d7c0f'; // Green
    case 'carbs':
      return '#b45309'; // Orange
    case 'fat':
      return '#7c3aed'; // Purple
    default:
      return '#be123c';
  }
}
