'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface OccupancyChartProps {
  occupied: number
  vacant: number
  notice: number
  maintenance: number
  occupancyRate: number
}

const COLORS = {
  occupied: '#2d9d5c',
  vacant: '#e2e8f0',
  notice: '#f59e0b',
  maintenance: '#ef4444',
}

interface TooltipPayload {
  name: string
  value: number
  payload: { fill: string }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-sm">
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-2.5 rounded-full"
          style={{ background: item.payload.fill }}
        />
        <span className="font-medium text-gray-700">{item.name}</span>
        <span className="font-bold text-gray-900">{item.value}</span>
      </div>
    </div>
  )
}

function CustomLabel({
  cx,
  cy,
  occupancyRate,
}: {
  cx: number
  cy: number
  occupancyRate: number
}) {
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle" className="fill-gray-900">
        <tspan fontSize={28} fontWeight={700} x={cx} dy={0}>
          {occupancyRate}%
        </tspan>
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" dominantBaseline="middle">
        <tspan fontSize={11} fill="#6b7280" x={cx} dy={0}>
          Occupancy
        </tspan>
      </text>
    </g>
  )
}

export function OccupancyChart({
  occupied,
  vacant,
  notice,
  maintenance,
  occupancyRate,
}: OccupancyChartProps) {
  const total = occupied + vacant + notice + maintenance

  const data = [
    { name: 'Occupied', value: occupied, fill: COLORS.occupied },
    { name: 'Vacant', value: vacant, fill: COLORS.vacant },
    { name: 'Notice', value: notice, fill: COLORS.notice },
    { name: 'Maintenance', value: maintenance, fill: COLORS.maintenance },
  ].filter((d) => d.value > 0)

  if (total === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-gray-400">
        No unit data available
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={96}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={(props) => (
              <CustomLabel cx={props.cx} cy={props.cy} occupancyRate={occupancyRate} />
            )}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-gray-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
