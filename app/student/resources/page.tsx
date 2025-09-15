"use client";
import { motion } from "framer-motion";

// Dummy data
const dummyResources = [
	{ id: 1, title: "Quantitative Methods Notes", link: "https://example.com/notes", category: "Notes" },
	{ id: 2, title: "Past Papers for ML", link: "https://example.com/papers", category: "Past Papers" },
	{ id: 3, title: "Khan Academy: Stats Basics", link: "https://khanacademy.org/stats", category: "Online Course" },
	{ id: 4, title: "Data Structures Tutorial", link: "https://example.com/tutorial", category: "Tutorial" },
];

export default function Resources() {
	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<header className="text-center mb-8">
				<h1 className="text-4xl font-bold text-blue-800">Recommended Resources</h1>
			</header>
			<section>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{dummyResources.map((resource, index) => (
						<motion.a
							key={resource.id}
							href={resource.link}
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.2 }}
							className="bg-white p-6 rounded-lg shadow-lg hover:bg-blue-50 transition"
						>
							<h3 className="text-lg font-medium">{resource.title}</h3>
							<p className="text-sm text-gray-600 mt-2">{resource.category}</p>
						</motion.a>
					))}
				</div>
			</section>
		</div>
	);
}
