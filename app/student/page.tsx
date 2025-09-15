"use client";
import { motion } from "framer-motion";
import { Line } from "react-chartjs-2";
import { Button } from "@/components/ui/button";
import { mockStudents } from "@/lib/mockData";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  // For demo, always use student1. Replace with dynamic logic if needed.
  const currentStudent = mockStudents["student1"];

  const gpaChartData = {
    labels: currentStudent.gpaTrends.labels,
    datasets: [
      {
        label: 'GPA',
        data: currentStudent.gpaTrends.data,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-800">Academic Excellence Dashboard - {currentStudent.name}</h1>
        <div className="flex justify-center gap-4 mt-6">
          <Button className="hover:bg-blue-600 hover:text-white transition-colors duration-200" variant="secondary" size="lg" asChild>
            <a href="/student/nudges">View Nudges</a>
          </Button>
          <Button className="hover:bg-blue-600 hover:text-white transition-colors duration-200" variant="secondary" size="lg" asChild>
            <a href="/student/resource">View Resources</a>
          </Button>
        </div>
      </header>

      {/* Course Progress Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Course Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentStudent.courses.map((course, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-lg"
            >
              <h3 className="text-xl font-medium mb-2">{course.name}</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <motion.div
                  className="bg-blue-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${course.progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <p className="text-sm text-gray-600">Progress: {course.progress}%</p>
              {course.risk && <p className="text-red-500 mt-2">{course.risk}</p>}
            </motion.div>
          ))}
        </div>
      </section>

      {/* GPA Trends Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">GPA Trends</h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-lg"
        >
          <Line data={gpaChartData} options={{ responsive: true }} />
        </motion.div>
      </section>

      {/* Smart Nudges Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Smart Nudges</h2>
        <ul className="space-y-4">
          {currentStudent.nudges.map((nudge, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.3 }}
              className="bg-yellow-100 p-4 rounded-lg shadow"
            >
              {nudge}
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Resource Recommendations Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recommended Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentStudent.resources.map((resource, index) => (
            <motion.a
              key={index}
              href={resource.link}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg shadow-lg hover:bg-blue-50 transition"
            >
              <h3 className="text-lg font-medium">{resource.title}</h3>
            </motion.a>
          ))}
        </div>
      </section>
    </div>
  );
}