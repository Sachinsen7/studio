'use client';

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Project } from '@/lib/data';

type ProjectStatusChartProps = {
  projects: Project[];
};

const chartConfig = {
  progress: {
    label: 'Progress',
  },
};

export function ProjectStatusChart({ projects }: ProjectStatusChartProps) {
  const statusColors: Record<Project['status'], string> = {
    'On Track': 'hsl(var(--chart-1))',
    'At Risk': 'hsl(var(--chart-3))',
    Completed: 'hsl(var(--chart-2))',
  };

  const chartData = projects.map((p) => ({
    ...p,
    fill: statusColors[p.status],
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Project Progress</CardTitle>
        <CardDescription>
          An overview of current project completion percentages.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <XAxis
                  type="number"
                  dataKey="progress"
                  tickFormatter={(value) => `${value}%`}
                  domain={[0, 100]}
                  hide
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(label, payload) =>
                        payload?.[0]?.payload.name ?? label
                      }
                      formatter={(value, name, item) => (
                          <div className="flex items-center gap-2">
                             <span className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.payload.fill}} />
                             <span className="text-sm">{`${value}% - ${item.payload.status}`}</span>
                          </div>
                      )}
                      indicator="dot"
                    />
                  }
                />
                <Bar dataKey="progress" radius={5}>
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.id}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
