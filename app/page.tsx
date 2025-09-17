"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, BookOpen, LineChart } from "lucide-react";
 
import { mockStudents } from "@/lib/mockData";

export default function LandingPage() {
  
		// Landing page uses /signup and /login routes; no inline auth logic.

	const sampleStudent = mockStudents["student1"];

	return (
		<div className="min-h-screen bg-gradient-to-b from-white via-blue-100 to-white text-gray-800">
			{/* Hero */}
			<section className="container mx-auto px-4 pt-20 pb-12">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
					<div>
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.7 }}
							className="text-4xl md:text-6xl font-extrabold tracking-tight text-blue-800"
						>
							Your Academic Excellence Assistant
						</motion.h1>
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2, duration: 0.6 }}
							className="mt-4 text-lg md:text-xl text-gray-700"
						>
							Stay on top of courses, get smart nudges, and discover curated resources to boost your GPA.
						</motion.p>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.4 }}
							className="mt-8 flex flex-wrap gap-3"
						>
											<Button size="lg" className="hover:bg-blue-600 hover:text-white" asChild>
												<a href="/signup" className="flex items-center gap-2">
													Get Started <ArrowRight className="size-4" />
												</a>
											</Button>
											<Button variant="outline" size="lg" asChild>
												<a href="/login">Log in</a>
											</Button>
						</motion.div>
					</div>
					<motion.div
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6 }}
						className="bg-white rounded-2xl shadow-xl p-6 border"
					>
						<h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><LineChart className="text-blue-600"/> Progress Snapshot</h3>
						<ul className="space-y-2">
							{sampleStudent.courses.map((c, i) => (
								<li key={i} className="flex justify-between text-sm">
									<span>{c.name}</span>
									<span className="font-medium text-blue-700">{c.progress}%</span>
								</li>
							))}
						</ul>
						<div className="mt-4 text-sm text-gray-600">Preview of your dashboard data.</div>
					</motion.div>
				</div>
			</section>

			{/* Features */}
			<section id="features" className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[
						{ icon: Bell, title: "Smart Nudges", desc: "Timely reminders for assignments and exams." },
						{ icon: BookOpen, title: "Curated Resources", desc: "Notes, past papers, and courses tailored to you." },
						{ icon: LineChart, title: "GPA Insights", desc: "Track performance trends and stay motivated." },
					].map((f, i) => (
						<motion.div
							key={f.title}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: i * 0.1 }}
							className="bg-white rounded-xl border shadow-md p-6"
						>
							<f.icon className="text-blue-600 mb-3" />
							<h3 className="text-lg font-semibold">{f.title}</h3>
							<p className="text-gray-600 mt-1">{f.desc}</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* Preview: Nudges & Resources from mockData */}
			<section className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
				<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-xl border shadow p-6">
					<h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell className="text-blue-600"/> Recent Nudges</h3>
					<ul className="space-y-3">
						{sampleStudent.nudges.map((n, i) => (
							<motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-yellow-50 border border-yellow-100 rounded-md p-3 text-sm">
								{n}
							</motion.li>
						))}
					</ul>
					<div className="mt-4">
									<Button asChild variant="secondary" className="hover:bg-blue-600 hover:text-white">
										<a href="/student/nudges?student=student1">View all nudges</a>
									</Button>
					</div>
				</motion.div>
				<motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-xl border shadow p-6">
					<h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><BookOpen className="text-blue-600"/> Recommended Resources</h3>
					<ul className="space-y-3">
						{sampleStudent.resources.map((r, i) => (
							<motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm">
								<a className="hover:underline" href={r.link} target="_blank" rel="noreferrer">{r.title}</a>
							</motion.li>
						))}
					</ul>
					<div className="mt-4">
									<Button asChild variant="secondary" className="hover:bg-blue-600 hover:text-white">
										<a href="/student/resources">View all resources</a>
									</Button>
					</div>
				</motion.div>
			</section>

					{/* Auth CTAs */}
					<section className="container mx-auto px-4 pb-20">
						<div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
						</div>
					</section>
		</div>
	);
}

