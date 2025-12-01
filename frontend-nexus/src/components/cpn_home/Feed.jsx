import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPosts } from "../../services/postService";
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
      const res = await getMyPosts(page);
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
    <div className="flex-1 px-6 py-4 w-full bg-blue-400">
      {/* <div className="text-lg font-semibold mb-4">Your posts</div> */}

      {/* Danh sách bài post */}
      {posts.map((post, index) => {
        const uniqueKey = `${post.id}-${index}`;

        if (index === posts.length - 1) {
          return (
            <div ref={lastPostRef} key={uniqueKey}>
              <Post post={post} />
            </div>
          );
        }

        return <Post key={uniqueKey} post={post} />;
      })}


      {/* Loading indicator */}
      <div className="w-full">
        {loading && (
          <div className="w-full text-center py-4">
            <span className="text-gray-500">Đang tải...</span>
          </div>
        )}

        {/* No more posts */}
        {!hasMore && !loading && (
          <div className="w-full text-center text-black font-semibold py-4">
            Bạn đã xem hết các bài viết 🥳
          </div>
        )}
      </div>
    </div>
  );
}
