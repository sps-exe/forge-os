'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export interface RatingPoint {
  label: string
  rating: number
}

export interface RatingChartProps {
  data: RatingPoint[]
  color?: string
  height?: number
}

/** Smooth area chart for contest rating history. */
export function RatingChart({ data, color = '#318ce7', height = 220 }: RatingChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 13% 20%)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'hsl(212 9% 58%)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
        />
        <YAxis
          tick={{ fill: 'hsl(212 9% 58%)', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          domain={['dataMin - 100', 'dataMax + 100']}
        />
        <Tooltip
          contentStyle={{
            background: 'hsl(214 14% 16%)',
            border: '1px solid hsl(214 13% 20%)',
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: 'hsl(210 17% 91%)' }}
        />
        <Area
          type="monotone"
          dataKey="rating"
          stroke={color}
          strokeWidth={2}
          fill="url(#ratingGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
