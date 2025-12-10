import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPosts, getFriendPosts } from "../../services/postService";
import { isAuthenticated, logOut } from "../../services/authenticationService";
import Post from "./Post";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  const lastPostRef = useRef(null);
  const observer = useRef(null);
  const navigate = useNavigate();

  /** Load posts */
  const loadPosts = async (page) => {
    try {
      setLoading(true);
      // const res = await getMyPosts(page);
      const res = await getFriendPosts(page);

      const result = res.data.result;

      setTotalPages(result.totalPages);

      // Append posts thay vì replace
      setPosts((prev) => {
        const merged = [...prev, ...result.data];

        // Xóa trùng bằng Map (ổn định nhất)
        const unique = Array.from(new Map(merged.map(p => [p.id, p])).values());

        return unique;
      });

      // Kiểm tra còn trang tiếp không
      setHasMore(page < result.totalPages);
    } catch (err) {
      if (err.response?.status === 401) {
        logOut();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  /** Load page đầu tiên */
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    loadPosts(page);
  }, [page]);

  /** Infinite scroll logic */
  useEffect(() => {
    if (!hasMore) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (lastPostRef.current) {
      observer.current.observe(lastPostRef.current);
    }
  }, [hasMore]);

  return (
    <div
      className="flex-1 px-4 md:px-8 py-4 w-full bg-blue-300 min-h-screen"
    >

      {/* Wrapper cho bài post */}
      <div className="max-w-3xl mx-auto space-y-6">
        {posts.map((post, index) => {
          const uniqueKey = `${post.id}-${index}`;

          if (index === posts.length - 1) {
            return (
              <div
                ref={lastPostRef}
                key={uniqueKey}
                className="animate-fadeIn bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition-shadow"
              >
                <Post post={post} />
              </div>
            );
          }

          return (
            <div
              key={uniqueKey}
              className="animate-fadeIn bg-white rounded-2xl shadow-md p-5 hover:shadow-xl transition-shadow"
            >
              <Post post={post} />
            </div>
          );
        })}

        {/* Loading */}
        {loading && (
          <div className="text-center py-6">
            <span className="text-gray-600 font-medium animate-pulse">
              Đang tải...
            </span>
          </div>
        )}

        {/* Hết bài */}
        {!hasMore && !loading && (
          <div
            className="text-center text-gray-700 font-semibold py-10
                     bg-white/70 backdrop-blur-lg rounded-2xl shadow-md
                     animate-fadeIn"
          >
            Bạn đã xem hết các bài viết 🥳
          </div>
        )}
      </div>
    </div>
  );
}
