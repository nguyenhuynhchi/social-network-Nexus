import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getFriendPosts } from "../../services/postService";
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
    <div className="flex-1 px-4 md:px-8 py-4 w-full bg-linear-to-b from-blue-300 via-blue-500 to-indigo-400 animate-gradient min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6"> {/* Tăng khoảng cách giữa các bài post */}
        {posts.map((post, index) => {
          const isLast = index === posts.length - 1;
          
          return (
            <Post 
              key={`${post.id}-${index}`}
              ref={isLast ? lastPostRef : null} 
              post={post} 
            />
          );
        })}

        {/* Loading & Empty state giữ nguyên */}
        {loading && (
          <div className="text-center py-6">
            <span className="text-white font-medium animate-pulse">Đang tải...</span>
          </div>
        )}

        {!hasMore && !loading && (
          <div className="text-center text-gray-700 font-semibold py-10 bg-white/70 backdrop-blur-lg rounded-2xl shadow-md">
            Bạn đã xem hết các bài viết 🥳
          </div>
        )}
      </div>
    </div>
  );
}