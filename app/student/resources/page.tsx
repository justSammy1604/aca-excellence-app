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
import { useToast } from "@/components/ui/toast";

export default function Resources() {
	const { loading, student: authStudent, displayName } = useCurrentStudent();
	const [favorites, setFavorites] = useState<string[]>([]);
	const [votes, setVotes] = useState<Record<string, number>>({});
	const [viewed, setViewed] = useState<string[]>([]);
	const [tagFilter, setTagFilter] = useState<string>("");
	const [sortBy, setSortBy] = useState<"recent"|"popular"|"az">("recent");
	const [tagsMap, setTagsMap] = useState<Record<string,string[]>>({});
	const enableFav = isFeatureEnabled("resourceFavorites");
	const enableVoting = isFeatureEnabled("resourceVoting");
	const enableTagging = isFeatureEnabled("resourceTagging");
	const { toast } = useToast();

	const student = useMemo(() => getStudent(authStudent?.id), [authStudent]);

	useEffect(() => {
		if (!loading) {
			setFavorites(getFavorites());
			setVotes(getVotes());
			setViewed(getResourcesViewed());
			// load tags map from localStorage (namespaced by resource title)
			try { setTagsMap(JSON.parse(localStorage.getItem('resourceTags')||'{}')); } catch { setTagsMap({}); }
		}
	}, [loading]);

	const allTags = useMemo(() => {
		if (!enableTagging) return [] as string[];
		const set = new Set<string>();
		student.resources.forEach(r => {
			const t = tagsMap[r.title] || r.title.split(/\s+/).slice(0,2).map(w=>w.toLowerCase());
			t.forEach(x=>set.add(x));
		});
		return Array.from(set).sort();
	}, [student, enableTagging, tagsMap]);

	const filteredResources = useMemo(() => {
		let list = student.resources.slice();
		if (enableTagging && tagFilter) {
			list = list.filter(r => (tagsMap[r.title]||[]).includes(tagFilter) || r.title.toLowerCase().includes(tagFilter));
		}
		// sorting
		if (sortBy === 'az') {
			list.sort((a,b)=> a.title.localeCompare(b.title));
		} else if (sortBy === 'popular') {
			list.sort((a,b)=> (votes[b.title]||0) - (votes[a.title]||0));
		} else if (sortBy === 'recent') {
			list.sort((a,b)=> (viewed.indexOf(b.title)) - (viewed.indexOf(a.title)));
		}
		return list;
	}, [student, tagFilter, enableTagging, votes, sortBy, viewed, tagsMap]);

	function onOpen(resourceTitle: string) {
		recordResourceView(resourceTitle);
		setViewed(v => v.includes(resourceTitle) ? v : [...v, resourceTitle]);
		toast(`Opened: ${resourceTitle}`, { variant: 'info' });
	}

	function onToggleFavorite(resourceTitle: string, e: React.MouseEvent) {
		e.preventDefault();
		const next = toggleFavorite(resourceTitle);
		setFavorites([...next]);
		const isFav = next.includes(resourceTitle);
		toast(isFav ? 'Added to favorites' : 'Removed from favorites', { variant: isFav ? 'success' : 'info' });
	}

	function onVote(resourceTitle: string, delta: 1|-1, e: React.MouseEvent) {
		e.preventDefault();
		const next = voteResource(resourceTitle, delta);
		setVotes({ ...next });
		toast(`Vote recorded (${next[resourceTitle]||0})`, { variant: 'success' });
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
								<div className="flex items-center justify-center gap-3 text-sm">
										<label className="text-gray-700">Sort</label>
										<select value={sortBy} onChange={e=>setSortBy(e.target.value as "recent"|"popular"|"az")} className="border rounded px-2 py-1 bg-white">
												<option value="recent">Recently Viewed</option>
												<option value="popular">Most Popular</option>
												<option value="az">A – Z</option>
										</select>
								</div>
			</header>
			<section>
								{/* Recently viewed */}
								{viewed.length > 0 && (
									<div className="mb-6">
										<h2 className="text-lg font-semibold mb-2">Recently Viewed</h2>
										<div className="flex flex-wrap gap-2 text-sm">
											{viewed.slice(-5).reverse().map(v => (
												<span key={v} className="px-2 py-1 bg-gray-100 border rounded">{v}</span>
											))}
										</div>
									</div>
								)}
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
																{enableTagging && (tagsMap[resource.title] || resource.title.split(/\s+/).slice(0,2).map(w=>w.toLowerCase())).map(t => (
																		<span key={t} className="px-2 py-0.5 rounded-full bg-gray-100 border">{t}</span>
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
														{enableTagging && (
															<div className="mt-3">
																<TagEditor title={resource.title} tagsMap={tagsMap} onChange={(next)=>{ setTagsMap(next); localStorage.setItem('resourceTags', JSON.stringify(next)); }} />
															</div>
														)}
						</motion.a>
					)})}
				</div>
			</section>
		</div>
	);
}

function TagEditor({ title, tagsMap, onChange }: { title: string; tagsMap: Record<string,string[]>; onChange: (m: Record<string,string[]>)=>void }){
	const [editing, setEditing] = useState(false);
	const tags = tagsMap[title] || [];
	const [value, setValue] = useState(tags.join(", "));
	return (
		<div className="text-xs text-gray-600">
			{!editing ? (
				<button className="underline" onClick={(e)=>{ e.preventDefault(); setEditing(true); }}>Edit tags</button>
			) : (
				<form onSubmit={(e)=>{ e.preventDefault(); const arr = value.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean); onChange({ ...tagsMap, [title]: Array.from(new Set(arr)) }); setEditing(false); }} className="flex items-center gap-2">
					<input value={value} onChange={e=>setValue(e.target.value)} className="border rounded px-2 py-1 text-xs flex-1" placeholder="comma separated tags" />
					<button className="px-2 py-1 border rounded bg-blue-600 text-white">Save</button>
					<button type="button" className="px-2 py-1 border rounded" onClick={(e)=>{ e.preventDefault(); setEditing(false); setValue(tags.join(', ')); }}>Cancel</button>
				</form>
			)}
		</div>
	);
}
