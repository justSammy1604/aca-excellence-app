"use client";
import { motion } from "framer-motion";
// no local state needed here
import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
// mockStudents resolved within hook; not needed here
import { useCurrentStudent } from "@/lib/authClient";

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

export default function StudentDashboardPage() {
	const { loading, student, displayName } = useCurrentStudent();

	const gpaChartData = {
		labels: student.gpaTrends.labels,
		datasets: [
			{
				label: "GPA",
				data: student.gpaTrends.data,
				borderColor: "rgb(75, 192, 192)",
				tension: 0.1,
			},
		],
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-600">Loading your dashboard…</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
			<header className="text-center mb-8">
						<motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-4xl font-bold text-blue-800">
							Academic Excellence Dashboard - {displayName}
						</motion.h1>
			</header>

			<section className="mb-12">
				<h2 className="text-2xl font-semibold mb-4">Course Progress</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{student.courses.length === 0 && (
						<div className="col-span-full text-gray-600">No courses yet.</div>
					)}
					{student.courses.map((course, index) => (
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
							<p className="text-sm text-gray-600">
								Progress: {course.progress}%
							</p>
							{course.risk && (
								<p className="text-red-500 mt-2">{course.risk}</p>
							)}
						</motion.div>
					))}
				</div>
			</section>

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

			<section className="mb-12">
				<h2 className="text-2xl font-semibold mb-4">Smart Nudges</h2>
				<ul className="space-y-4">
					{student.nudges.length === 0 && (
						<li className="text-gray-600">No nudges at the moment.</li>
					)}
					{student.nudges.map((nudge, index) => (
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

			<section>
				<h2 className="text-2xl font-semibold mb-4">Recommended Resources</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{student.resources.length === 0 && (
						<div className="col-span-full text-gray-600">No resources yet.</div>
					)}
					{student.resources.map((resource, index) => (
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

 
