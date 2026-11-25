"use client";

// Grafik dashboard admin dipisah dari app/admin/page.jsx dan dimuat lewat
// next/dynamic, sehingga library recharts (besar) tidak menahan tampilan awal.
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export function MonthlyJobsChart({ chartData }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData.monthlyJobs}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={{ stroke: "#e2e8f0" }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748b" }}
          axisLine={{ stroke: "#e2e8f0" }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
          }}
          formatter={(value) => [`${value} lowongan`, "Jumlah"]}
        />
        <Bar
          dataKey="count"
          fill="#3b82f6"
          radius={[6, 6, 0, 0]}
          name="Lowongan"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function EmploymentPieChart({ employmentPieData, COLORS }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={employmentPieData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) =>
            `${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {employmentPieData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e293b",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
          }}
          formatter={(value) => [`${value} orang`, ""]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
