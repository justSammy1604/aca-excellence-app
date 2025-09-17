"use client";
import { motion } from "framer-motion";
import { useCurrentStudent } from "@/lib/authClient";
import { useEffect, useMemo, useState } from "react";
import {
	getStudent,
	recordResourceView,
	toggleFavorite,
	voteResource,
	getFavorites,
	getVotes,
	getResourcesViewed,
} from "@/lib/dataClient";
import { isFeatureEnabled } from "@/lib/featureFlags";

export default function Resources() {
	const { loading, student: authStudent, displayName } = useCurrentStudent();
	const [favorites, setFavorites] = useState<string[]>([]);
	const [votes, setVotes] = useState<Record<string, number>>({});
	const [viewed, setViewed] = useState<string[]>([]);
	const [tagFilter, setTagFilter] = useState<string>("");
	const enableFav = isFeatureEnabled("resourceFavorites");
	const enableVoting = isFeatureEnabled("resourceVoting");
	const enableTagging = isFeatureEnabled("resourceTagging");

	const student = useMemo(() => getStudent(authStudent?.id), [authStudent]);

	useEffect(() => {
		if (!loading) {
			setFavorites(getFavorites());
			setVotes(getVotes());
			setViewed(getResourcesViewed());
		}
	}, [loading]);

	const allTags = useMemo(() => {
		if (!enableTagging) return [] as string[];
		// Derive naive tags from title words (placeholder until real tagging)
		const set = new Set<string>();
		student.resources.forEach(r => r.title.split(/\s+/).slice(0,2).forEach(w => set.add(w.toLowerCase())));
		return Array.from(set).sort();
	}, [student, enableTagging]);

	const filteredResources = useMemo(() => {
		if (!enableTagging || !tagFilter) return student.resources;
		return student.resources.filter(r => r.title.toLowerCase().includes(tagFilter));
	}, [student, tagFilter, enableTagging]);

	function onOpen(resourceTitle: string) {
		recordResourceView(resourceTitle);
		setViewed(v => v.includes(resourceTitle) ? v : [...v, resourceTitle]);
	}

	function onToggleFavorite(resourceTitle: string, e: React.MouseEvent) {
		e.preventDefault();
		const next = toggleFavorite(resourceTitle);
		setFavorites([...next]);
	}

	function onVote(resourceTitle: string, delta: 1|-1, e: React.MouseEvent) {
		e.preventDefault();
		const next = voteResource(resourceTitle, delta);
		setVotes({ ...next });
	}
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
				<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-600">Loading resources…</motion.div>
			</div>
		);
	}
	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
			<header className="text-center mb-8 space-y-4">
				<motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="text-4xl font-bold text-blue-800">Recommended Resources - {displayName}</motion.h1>
				{enableTagging && (
					<div className="flex flex-wrap justify-center gap-2">
						<button onClick={() => setTagFilter("")} className={`px-3 py-1 rounded-full border text-sm ${!tagFilter ? 'bg-blue-600 text-white' : 'bg-white'}`}>All</button>
						{allTags.map(t => (
							<button key={t} onClick={() => setTagFilter(t)} className={`px-3 py-1 rounded-full border text-sm ${tagFilter===t ? 'bg-blue-600 text-white' : 'bg-white'}`}>{t}</button>
						))}
					</div>
				)}
			</header>
			<section>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredResources.length === 0 && (
						<div className="col-span-full text-gray-600">No resources yet.</div>
					)}
					{filteredResources.map((resource, index) => {
						const fav = favorites.includes(resource.title);
						const score = votes[resource.title] || 0;
						const hasViewed = viewed.includes(resource.title);
						return (
						<motion.a
							key={index}
							href={resource.link}
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.2 }}
							className="bg-white p-6 rounded-lg shadow-lg hover:bg-blue-50 transition border border-gray-200 group"
							onClick={() => onOpen(resource.title)}
						>
							<div className="flex items-start justify-between gap-2">
								<h3 className="text-lg font-medium">{resource.title}</h3>
								{enableFav && (
									<button
										onClick={(e)=>onToggleFavorite(resource.title,e)}
										className={`text-sm px-2 py-1 rounded border ${fav? 'bg-yellow-400/90 border-yellow-500' : 'bg-white'}`}
										aria-label="Toggle favorite"
									>
										{fav ? '★' : '☆'}
									</button>
								)}
							</div>
							<div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
								{enableTagging && resource.title.split(/\s+/).slice(0,2).map(t => (
									<span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 border">{t.toLowerCase()}</span>
								))}
								{hasViewed && <span className="px-2 py-0.5 rounded-full bg-green-100 border border-green-300">viewed</span>}
							</div>
							{enableVoting && (
								<div className="mt-4 flex items-center gap-2 text-sm">
									<button onClick={(e)=>onVote(resource.title, 1, e)} className="px-2 py-1 border rounded hover:bg-blue-100" aria-label="Upvote">▲</button>
									<span className="min-w-6 text-center">{score}</span>
									<button onClick={(e)=>onVote(resource.title, -1, e)} className="px-2 py-1 border rounded hover:bg-blue-100" aria-label="Downvote">▼</button>
								</div>
							)}
						</motion.a>
					)})}
				</div>
			</section>
		</div>
	);
}
