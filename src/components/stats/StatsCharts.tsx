// Cdw-Spm
"use client";

import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function StatsCharts({ data }: { data: any }) {
  if (!data) return null;

  return (
    <div className="grid gap-6">
      {data.consultations && (
        <div className="soft-card p-4">
          <h3 className="text-lg font-semibold mb-2">Consultations</h3>
          <Line data={data.consultations} />
        </div>
      )}
      {data.ca && (
        <div className="soft-card p-4">
          <h3 className="text-lg font-semibold mb-2">Chiffre d’affaires</h3>
          <Bar data={data.ca} />
        </div>
      )}
    </div>
  );
}
