"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

interface MetricLineChartProps {
  data: any[]
  color?: string
  valueKey?: string
  previousValueKey?: string
  valueFormatter?: (value: number) => string
  metricName?: string
}

interface DistributionPieChartProps {
  data: any[]
  dataKey?: string
  nameKey?: string
}

interface ConversionDataItem {
  stage: string
  rate: number
  sessions: number
}

interface ConversionFunnelProps {
  data: ConversionDataItem[]
}

export function MetricLineChart({
  data,
  color = '#0088FE',
  valueKey = 'value',
  previousValueKey = 'previousValue',
  valueFormatter = (value: number) => value.toString(),
  metricName = 'Value',
}: MetricLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter}
        />
        <Tooltip
          formatter={value => [valueFormatter(Number(value)), metricName]}
          labelFormatter={label => `Date: ${label}`}
          wrapperClassName='rounded-xl'
        />
        <Line
          type="monotone"
          dataKey={valueKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey={previousValueKey}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DistributionPieChart({
  data,
  dataKey = 'value',
  nameKey = 'name',
}: DistributionPieChartProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={value => [`$${Number(value).toFixed(2)}`, 'Revenue']}
          wrapperClassName="rounded-xl"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{item.stage}</span>
            <div className="flex space-x-4">
              <span>{item.rate}%</span>
              <span className="text-muted-foreground">{item.sessions} sessions</span>
            </div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${item.rate}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
