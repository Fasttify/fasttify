"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MetricLineChart, DistributionPieChart, ConversionFunnel } from './ChartComponents'

interface MetricCardProps {
  title: string
  value: number | string
  data: any
  color: string
  valueFormatter?: (value: number) => string
  metricName: string
  prefix?: string
  suffix?: string
}

interface DistributionCardProps {
  title: string
  data: any
}

interface ConversionCardProps {
  title: string
  rate: number
  conversionData: any
}

export function MetricCard({
  title,
  value,
  data,
  color,
  valueFormatter = (value: number) => value.toString(),
  metricName,
  prefix = '',
  suffix = '',
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <CardDescription className="text-2xl font-medium">
          {prefix}
          {value}
          {suffix}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <MetricLineChart
          data={data}
          color={color}
          valueFormatter={valueFormatter}
          metricName={metricName}
        />
      </CardContent>
    </Card>
  )
}

export function DistributionCard({ title, data }: DistributionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <DistributionPieChart data={data} />
      </CardContent>
    </Card>
  )
}

export function ConversionCard({ title, rate, conversionData }: ConversionCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <CardDescription className="text-2xl font-bold">{rate}%</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ConversionFunnel data={conversionData} />
      </CardContent>
    </Card>
  )
}
