import { useEffect, useState, useRef, useCallback } from "react";
import { getPostsOfOne } from "../../services/postService";
import Post from "./Post";

export default function Feed({ userId }) {
   const [posts, setPosts] = useState([]);
   const [page, setPage] = useState(1);
   const [totalPages, setTotalPages] = useState(1);
   const [loading, setLoading] = useState(false);
   const [hasMore, setHasMore] = useState(false);

   const lastPostRef = useRef(null);
   const observer = useRef(null);

   // Reset khi đổi người dùng
   useEffect(() => {
      setPosts([]);
      setPage(1);
      setHasMore(false);
   }, [userId]);

   const loadPosts = useCallback(async (pageNum) => {
      // 2. Kiểm tra nếu userId không tồn tại thì không làm gì cả
      if (!userId) {
         console.warn("Feed: userId is missing");
         return;
      }

      try {
         setLoading(true);
         const res = await getPostsOfOne(userId, pageNum);
         const result = res.data.result;

         setTotalPages(result.totalPages);
         setPosts((prev) => {
            const merged = [...prev, ...result.data];
            // Xóa trùng lặp theo ID
            return Array.from(new Map(merged.map(p => [p.id, p])).values());
         });
         setHasMore(pageNum < result.totalPages);
      } catch (err) {
         // Lúc này userId đã được định nghĩa ở Props nên sẽ không còn lỗi ReferenceError
         console.error("Lỗi load feed cho userId:", userId, err);
      } finally {
         setLoading(false);
      }
   }, [userId]);

   useEffect(() => {
      loadPosts(page);
   }, [page, loadPosts]);

   useEffect(() => {
      if (!hasMore || loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
         if (entries[0].isIntersecting) {
            setPage((prev) => prev + 1);
         }
      });

      if (lastPostRef.current) observer.current.observe(lastPostRef.current);
   }, [hasMore, loading]);

   return (
      <div className="flex-1 px-6 py-6 w-full min-h-screen">
         <div className="w-full space-y-6">
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