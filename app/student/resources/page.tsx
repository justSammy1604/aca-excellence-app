"use client";
import { motion } from "framer-motion";
import { useCurrentStudent } from "@/lib/authClient";

export default function Resources() {
	const { loading, student, displayName } = useCurrentStudent();
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-600">Loading resources…</motion.div>
			</div>
		);
	}
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
			<header className="text-center mb-8">
				<motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-4xl font-bold text-blue-800">Recommended Resources - {displayName}</motion.h1>
			</header>
			<section>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{student.resources.length === 0 && (
						<div className="col-span-full text-gray-600">No resources yet.</div>
					)}
					{student.resources.map((resource, index) => (
						<motion.a
							key={index}
							href={resource.link}
							initial={{ opacity: 0, y: 50 }}
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
