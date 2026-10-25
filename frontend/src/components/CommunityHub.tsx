import React, { useState, useEffect } from "react";
import { api, CommunityPost } from "@/lib/api";
import { MetricCharts } from "@/components/MetricCharts";

interface CommunityHubProps {
  userId: string;
  athleteName?: string;
}

export const CommunityHub: React.FC<CommunityHubProps> = ({
  userId,
  athleteName = "Active Athlete",
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [selectedCircle, setSelectedCircle] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [topicCircle, setTopicCircle] = useState<string>("Athletic Amenorrhea & REDs");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const fetchPosts = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const circleParam = selectedCircle === "all" ? undefined : selectedCircle;
      const data = await api.getCommunityPosts(circleParam);
      setPosts(data);
    } catch (err) {
      console.error("Error fetching community posts:", err);
      setLoadError("Community discussions could not be loaded. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCircle]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCommunityPost({
        user_id: userId,
        topic_circle: topicCircle,
        title,
        content,
        is_anonymous: isAnonymous,
        author_display_name: isAnonymous ? "Anonymous Athlete" : athleteName.split(" ")[0],
      });
      setTitle("");
      setContent("");
      setIsAnonymous(false);
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      alert("Failed to submit post: " + err);
    }
  };

  const handleUpvote = async (postId: string) => {
    try {
      const res = await api.upvotePost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.post_id === postId ? { ...p, upvotes: res.upvotes } : p))
      );
    } catch (err) {
      console.error("Error upvoting post:", err);
    }
  };

  const circles = [
    { id: "all", label: "All Topic Circles" },
    { id: "Athletic Amenorrhea & REDs", label: "⚡ Athletic Amenorrhea & REDs" },
    { id: "PCOS Fitness & Nutrition", label: "🌸 PCOS Fitness & Nutrition" },
    { id: "Maternal Care", label: "🤰 Maternal Care" },
    { id: "General Wellness", label: "🌱 General Wellness" },
  ];

  return (
    <div className="space-y-6 text-text-primary">
      {/* Community Banner */}
      <div className="bg-gradient-to-r from-bg-card via-slate-900 to-bg-card border border-border-card rounded-3xl p-6 text-text-primary shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 border border-accent-emerald/30 px-2.5 py-1 rounded-full text-accent-emerald">
            Safe Space &bull; Peer Support
          </span>
          <h2 className="text-2xl font-black mt-2">Athlete Peer Community Hub</h2>
          <p className="text-text-secondary text-xs mt-1 max-w-xl leading-relaxed">
            Connect with active women, share recovery advice, discuss period communication strategies with coaches, and post anonymously.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-accent-emerald hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow transition flex items-center space-x-2 self-start sm:self-auto"
        >
          <span>+ Ask or Share Advice</span>
        </button>
      </div>

      {/* Circle Filter Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {circles.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCircle(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition ${
              selectedCircle === c.id
                ? "bg-accent-cyan text-slate-950 font-bold shadow-sm"
                : "bg-bg-card text-text-secondary hover:text-text-primary border border-border-card"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <MetricCharts
        charts={[
          {
            title: "Most upvoted discussions",
            unit: "upvotes",
            data: [...posts]
              .sort((a, b) => b.upvotes - a.upvotes)
              .slice(0, 5)
              .map((post) => ({
                label:
                  post.title.length > 18
                    ? `${post.title.slice(0, 18)}…`
                    : post.title,
                value: post.upvotes,
                color: "#10b981",
              })),
          },
        ]}
      />

      {/* Feed List */}
      <div className="space-y-4">
        {loadError ? (
          <div role="alert" className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-6 text-center text-xs text-rose-200">
            {loadError}
          </div>
        ) : loading ? (
          <div className="p-8 text-center text-text-secondary text-xs">Loading circle discussions...</div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-xs bg-bg-card rounded-2xl border border-border-card">
            No discussions found in this circle. Be the first to start a conversation!
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.post_id}
              className="bg-bg-card p-6 rounded-2xl border border-border-card shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 border border-accent-cyan/30 text-accent-cyan">
                    {post.topic_circle}
                  </span>
                  {post.is_anonymous ? (
                    <span className="text-[10px] font-semibold text-text-secondary bg-bg-main border border-border-card px-2 py-0.5 rounded-full">
                      Anonymous Post
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-accent-emerald bg-emerald-950 border border-accent-emerald/30 px-2 py-0.5 rounded-full">
                      Verified Peer
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-text-secondary">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-text-primary">{post.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{post.content}</p>
              <div className="pt-2 border-t border-border-card flex items-center justify-between text-xs text-text-secondary">
                <span className="font-semibold text-text-primary">By: {post.author_display_name}</span>
                <button
                  onClick={() => handleUpvote(post.post_id)}
                  className="flex items-center space-x-1.5 px-3 py-1 bg-bg-main hover:bg-border-card hover:text-accent-cyan rounded-lg border border-border-card transition font-bold text-text-primary"
                >
                  <span>👍</span>
                  <span>{post.upvotes}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for New Post */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-border-card space-y-4">
            <div className="flex justify-between items-center border-b border-border-card pb-3">
              <div>
                <h3 className="text-base font-bold text-text-primary">Post in Athlete Community Hub</h3>
                <p className="text-xs text-text-secondary">Ask questions, share advice, or discuss training with peers</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-text-secondary hover:text-white font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text-secondary">Topic Circle</label>
                <select
                  value={topicCircle}
                  onChange={(e) => setTopicCircle(e.target.value)}
                  className="mt-1 w-full p-2 bg-bg-main border border-border-card rounded-xl text-text-primary"
                >
                  <option value="Athletic Amenorrhea & REDs">⚡ Athletic Amenorrhea &amp; REDs</option>
                  <option value="PCOS Fitness & Nutrition">🌸 PCOS Fitness &amp; Nutrition</option>
                  <option value="Maternal Care">🤰 Maternal Care</option>
                  <option value="General Wellness">🌱 General Wellness</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-text-secondary">Discussion Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to discuss workload limits with a male coach"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full p-2 bg-bg-main border border-border-card rounded-xl text-text-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-text-secondary">Your Question or Experience</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share your experience or ask the community..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 w-full p-2 bg-bg-main border border-border-card rounded-xl text-text-primary"
                />
              </div>

              {/* Anonymous Toggle (PRD v9 FR-1.5) */}
              <div className="p-3 bg-bg-main rounded-xl border border-border-card flex items-center justify-between">
                <div>
                  <span className="font-bold text-text-primary block">Post Anonymously</span>
                  <span className="text-[11px] text-text-secondary">Hides your name and displays "Anonymous Athlete"</span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-accent-cyan rounded"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border-card rounded-xl text-text-secondary hover:bg-border-card font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent-cyan hover:bg-cyan-400 text-slate-950 rounded-xl font-bold shadow"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
