import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { addReply, createPost, getPosts } from "../../services/forumService";

function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${import.meta.env.VITE_API_URL}${encodeURI(path)}`;
}

function timeAgo(dateValue, t) {
  if (!dateValue) return t("Just now");
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(dateValue).getTime()) / 1000));
  const units = [
    [31536000, t("year")],
    [2592000, t("month")],
    [86400, t("day")],
    [3600, t("hour")],
    [60, t("minute")],
  ];
  for (const [unitSeconds, unitLabel] of units) {
    if (seconds >= unitSeconds) {
      const value = Math.floor(seconds / unitSeconds);
      return `${value} ${unitLabel}${value > 1 ? "s" : ""} ${t("ago")}`;
    }
  }
  return `${seconds} ${t("ago")}`;
}

function FarmerForum() {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [expandedReplies, setExpandedReplies] = useState({});
  const [form, setForm] = useState({
    crop: "",
    title: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: t("Newest") },
      { value: "most-replied", label: t("Most Replied") },
      { value: "oldest", label: t("Oldest") },
    ],
    [t]
  );

  const fetchPosts = async () => {
    try {
      setFetching(true);
      const data = await getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch posts failed", err);
    } finally {
      setFetching(false);
    }
  };

  const handleCreatePost = async () => {
    if (!form.crop || !form.title || !form.description) {
      alert(t("Please fill all fields"));
      return;
    }

    try {
      setLoading(true);

      const response = await createPost({
        crop: form.crop.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        image,
      });

      setPosts((prev) => [response.post, ...prev]);
      setForm({ crop: "", title: "", description: "" });
      setImage(null);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      alert(err.response?.data?.message || t("Post creation failed"));
    } finally {
      setLoading(false);
    }
  };

  const replyToPost = async (postId, message) => {
    if (!message.trim()) return;
    try {
      await addReply(postId, { message: message.trim() });
      fetchPosts();
      setExpandedReplies((prev) => ({ ...prev, [postId]: true }));
    } catch (err) {
      console.error("Reply failed", err);
    }
  };

  const cropOptions = useMemo(() => {
    const unique = [...new Set(posts.map((post) => (post.crop || "").trim()).filter(Boolean))];
    return unique.sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const stats = useMemo(() => {
    const totalPosts = posts.length;
    const totalReplies = posts.reduce((acc, post) => acc + (post.replies?.length || 0), 0);
    const activeCrops = new Set(posts.map((post) => post.crop?.trim().toLowerCase()).filter(Boolean)).size;
    return { totalPosts, totalReplies, activeCrops };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    let list = [...posts];

    if (selectedCrop !== "all") {
      list = list.filter((post) => post.crop?.toLowerCase() === selectedCrop.toLowerCase());
    }

    if (q) {
      list = list.filter((post) => {
        const haystack = `${post.title || ""} ${post.description || ""} ${post.crop || ""}`.toLowerCase();
        return haystack.includes(q);
      });
    }

    if (sortBy === "most-replied") {
      list.sort((a, b) => (b.replies?.length || 0) - (a.replies?.length || 0));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [posts, searchTerm, selectedCrop, sortBy]);

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,#F5F5DC_0%,#D9F99D_50%,#C4E07A_100%)] py-8 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-green-900">{t("Farmer Help Community")}</h1>
          <p className="text-sm md:text-base text-green-900/80 max-w-2xl mx-auto">
            {t("Ask crop questions, share practical advice, and learn from real field experiences.")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <StatCard label={t("Total Posts")} value={stats.totalPosts} />
          <StatCard label={t("Total Replies")} value={stats.totalReplies} />
          <StatCard label={t("Active Crops")} value={stats.activeCrops} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <aside className="lg:col-span-4 space-y-3 lg:sticky lg:top-20">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow border border-green-100 p-4 space-y-3">
              <h2 className="text-base font-semibold text-green-800">{t("Start a Discussion")}</h2>

              <input
                placeholder={t("Crop (e.g., Tomato)")}
                value={form.crop}
                onChange={(e) => setForm({ ...form, crop: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
              />

              <input
                placeholder={t("Problem Title")}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
              />

              <textarea
                placeholder={t("Describe symptoms, weather, and what you tried...")}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 min-h-24 text-sm"
              />

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{t("Add field context for better replies.")}</span>
                <span>{form.description.length}/600</span>
              </div>

              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full py-2 rounded-lg border-2 border-dashed border-green-400 text-green-700 font-medium hover:bg-green-50 text-sm"
              >
                {image ? t("Change Image") : t("Upload Crop Image")}
              </button>

              {image && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="preview"
                    className="rounded-xl max-h-44 w-full object-cover border"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-2.5 py-1 text-xs rounded-md"
                  >
                    {t("Remove")}
                  </button>
                </div>
              )}

              <button
                onClick={handleCreatePost}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-green-700 to-emerald-600 text-white font-semibold text-sm"
              >
                {loading ? t("Posting...") : t("Post Question")}
              </button>
            </div>

            <div className="bg-white/80 rounded-2xl border border-green-100 p-3 text-xs text-gray-600 space-y-2">
              <p className="font-semibold text-gray-700">{t("Community Guidelines")}</p>
              <p>{t("Use clear titles and mention location, irrigation, and season.")}</p>
              <p>{t("Share practical steps and avoid one-word replies.")}</p>
            </div>
          </aside>

          <main className="lg:col-span-8 space-y-3">
            <div className="bg-white/90 backdrop-blur rounded-2xl shadow border border-green-100 p-3.5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("Search title, crop, or description")}
                  className="w-full p-2.5 rounded-lg border border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
                />

                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-green-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
                >
                  <option value="all">{t("All Crops")}</option>
                  {cropOptions.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-green-200 bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {cropOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedCrop("all")}
                    className={`px-2.5 py-1 rounded-full text-xs border ${selectedCrop === "all" ? "bg-green-700 text-white border-green-700" : "bg-white text-green-700 border-green-200"}`}
                  >
                    {t("All")}
                  </button>
                  {cropOptions.slice(0, 10).map((crop) => (
                    <button
                      type="button"
                      key={crop}
                      onClick={() => setSelectedCrop(crop)}
                      className={`px-2.5 py-1 rounded-full text-xs border ${selectedCrop === crop ? "bg-green-700 text-white border-green-700" : "bg-white text-green-700 border-green-200"}`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {fetching ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border p-4 animate-pulse">
                    <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
                    <div className="h-3.5 w-full bg-gray-100 rounded mb-2" />
                    <div className="h-4 w-4/5 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow border border-green-100 p-6 text-center">
                <h3 className="text-lg font-semibold text-green-900">{t("No posts found")}</h3>
                <p className="text-sm text-gray-600 mt-2">{t("Try changing search text, crop filter, or sorting options.")}</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredPosts.map((post) => {
                  const replyCount = post.replies?.length || 0;
                  const isExpanded = !!expandedReplies[post._id];
                  const visibleReplies = isExpanded ? post.replies || [] : (post.replies || []).slice(0, 2);

                  return (
                    <article
                      key={post._id}
                      className="bg-white rounded-2xl shadow border border-green-100 p-4 md:p-5 space-y-3 hover:shadow-md transition"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2.5">
                        <div className="space-y-1">
                          <h2 className="text-lg font-bold text-gray-900">{post.title}</h2>
                          <p className="text-xs text-gray-500">
                            {t("By")} {post.farmer?.name || t("Farmer")} • {timeAgo(post.createdAt, t)}
                          </p>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[11px] font-semibold">{post.crop}</span>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed">{post.description}</p>

                      {post.image && (
                        <img
                          src={getImageUrl(post.image)}
                          alt="crop issue"
                          className="rounded-xl max-h-64 w-full object-cover border"
                        />
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2.5">
                        <span>{replyCount} {t("replies")}</span>
                        {replyCount > 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedReplies((prev) => ({
                                ...prev,
                                [post._id]: !prev[post._id],
                              }))
                            }
                            className="text-green-700 hover:text-green-800 font-medium text-xs"
                          >
                            {isExpanded ? t("Show less") : `${t("replies")} (${replyCount})`}
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {visibleReplies.map((reply) => (
                          <div key={reply._id} className="bg-green-50 border border-green-100 p-2.5 rounded-lg">
                            <span className="font-semibold text-sm text-green-800">{reply.user?.name || t("User")}</span>
                            <p className="text-sm text-gray-700">{reply.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{timeAgo(reply.createdAt, t)}</p>
                          </div>
                        ))}
                      </div>

                      <ReplyBox onReply={(msg) => replyToPost(post._id, msg)} />
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white/85 backdrop-blur rounded-xl border border-green-100 p-3 text-center shadow-sm">
      <p className="text-xl font-extrabold text-green-800">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}

function ReplyBox({ onReply }) {
  const { t } = useTranslation();
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const submitReply = async () => {
    if (!msg.trim() || sending) return;
    try {
      setSending(true);
      await onReply(msg);
      setMsg("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-2.5">
      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="flex-1 border border-green-200 p-2.5 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm"
        placeholder={t("Share your advice...")}
      />
      <button
        onClick={submitReply}
        disabled={!msg.trim() || sending}
        className="px-4 rounded-lg bg-green-600 text-white sm:w-auto w-full text-sm"
      >
        {sending ? t("Sending...") : t("Reply")}
      </button>
    </div>
  );
}

export default FarmerForum;
