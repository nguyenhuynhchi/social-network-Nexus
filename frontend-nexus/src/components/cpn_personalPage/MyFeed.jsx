import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPosts, createPost } from "../../services/postService";
import { getMyInfo } from "../../services/userService";
import { isAuthenticated, logOut } from "../../services/authenticationService";
import Post from "./Post";
import LoadingModal from "../cpn_other/LoadingModal";
import Toast from "../cpn_other/Toast";

import iconAddImage from "../../assets/icon_add_image.png";

export default function MyFeed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // States cho Composer & User Info
  const [userInfo, setUserInfo] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [tempFile, setTempFile] = useState(null);
  const [tempPreviewUrl, setTempPreviewUrl] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");

  const fileInputRef = useRef(null);
  const lastPostRef = useRef(null);
  const observer = useRef(null);
  const navigate = useNavigate();

  //  Logic Fetch User Info & Posts
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    const fetchInfo = async () => {
      try {
        const response = await getMyInfo();
        setUserInfo(response.data.result);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchInfo();
    loadPosts(1);
  }, []);

  const loadPosts = async (pageNum) => {
    try {
      setLoading(true);
      const res = await getMyPosts(pageNum);
      const result = res.data.result;
      console.log(result);
      setTotalPages(result.totalPages);
      setPosts((prev) => {
        const merged = pageNum === 1 ? result.data : [...prev, ...result.data];
        return Array.from(new Map(merged.map(p => [p.id, p])).values());
      });
      setHasMore(pageNum < result.totalPages);
    } catch (err) {
      if (err.response?.status === 401) { logOut(); navigate("/login"); }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (page > 1) loadPosts(page); }, [page]);

  // Đăng bài
  const handleCreatePost = async () => {
    if (isPosting) return; 
    setIsPosting(true); 
    try {
      await createPost(textContent, selectedFile);
      setToastMsg("Đăng bài thành công!");
      setToastType("success");
      setTextContent("");
      removeImage();
      loadPosts(1);
    } catch (error) {
      setToastMsg("Đăng bài thất bại!");
      setToastType("error");
    } finally {
      setIsPosting(false); // Tắt modal đăng bài
    }
  };

  // Logic Xử lý ảnh 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setTempFile(file);
    setTempPreviewUrl(url);
    setShowPreviewModal(true);
  };

  const confirmImage = () => {
    setSelectedFile(tempFile);
    setPreviewUrl(tempPreviewUrl);
    setTempFile(null);
    setTempPreviewUrl(null);
    setShowPreviewModal(false);
  };

  const cancelImage = () => {
    if (tempPreviewUrl) URL.revokeObjectURL(tempPreviewUrl);
    setTempFile(null);
    setTempPreviewUrl(null);
    setShowPreviewModal(false);
  };

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  //  Infinite scroll
  useEffect(() => {
    if (!hasMore || loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setPage((prev) => prev + 1);
    });
    if (lastPostRef.current) observer.current.observe(lastPostRef.current);
  }, [hasMore, loading]);

  return (
    <div className="flex px-4 md:px-4 py-6 w-full min-h-screen gap-8 justify-center 
                bg-linear-to-b from-blue-300 via-blue-500 to-indigo-400 animate-gradient">

      {/* CỘT TRÁI: COMPOSER  */}
      <aside className="hidden lg:block w-[250px] shrink-0 sticky top-6 h-fit">
        <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <img
              src={userInfo?.avatarUrl || "/default_user_avatar.png"}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50 shadow-sm"
              alt="avatar"
            />
            <p className="text-[14px] font-bold text-slate-800 mt-2">
              {userInfo?.fullname || "Người dùng"}
            </p>
          </div>

          {/* Input Text */}
          <textarea
            className="text-[13px] w-full min-h-[120px] p-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:outline-none text-slate-800 placeholder-slate-400 resize-none transition-all duration-200"
            placeholder="Hãy chia sẻ điều gì đó thú vị..."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />

          {/* Image Preview nhỏ */}
          {previewUrl && (
            <div className="relative mt-4 group">
              <div
                onClick={removeImage}
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-500 z-10 transition-colors shadow-lg"
              >✕</div>
              <img src={previewUrl} className="w-full h-52 object-cover rounded-xl border shadow-sm" alt="post-preview" />
            </div>
          )}

          {/* Toolbar */}
          <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
            <div onClick={() => fileInputRef.current.click()} className="flex items-center gap-2 cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-all">
                <img className="w-4 h-4" src={iconAddImage} />
              </div>
            </div>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {(selectedFile || textContent.trim()) && (
              <div
                onClick={handleCreatePost}
                disabled={loading}
                className={`px-6 py-2 rounded-full text-[11px] font-bold text-white whitespace-nowrap shadow-md transition-all active:scale-95 ${loading ? "bg-slate-300" : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
              >
                {loading ? "Đang xử lý..." : "Đăng bài"}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CỘT PHẢI: FEED BÀI VIẾT */}
      <main className="w-full max-w-[680px]">
        <div className="space-y-6">
          {posts.map((post, index) => (
            <Post
              key={`${post.id}-${index}`}
              ref={index === posts.length - 1 ? lastPostRef : null}
              post={post}
            />
          ))}

          {loading && <div className="text-center py-6 text-indigo-500 font-bold animate-pulse">Đang tải bài viết...</div>}

          {!hasMore && !loading && (
            <div className="text-center text-slate-500 font-bold py-10 bg-white rounded-2xl border border-dashed border-slate-300">
              Bạn đã xem hết các bài viết 🥳
            </div>
          )}
        </div>
      </main>

      {/* MODAL PREVIEW LỚN */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Kiểm tra lại hình ảnh</h3>
            <img src={tempPreviewUrl} className="w-full max-h-[60vh] object-contain rounded-2xl bg-slate-50 border shadow-inner" alt="modal-preview" />
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={cancelImage} className="px-6 py-2 rounded-full bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">Hủy</button>
              <button onClick={confirmImage} className="px-8 py-2 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md transition-all active:scale-95">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      <LoadingModal open={isPosting} />
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
    </div>
  );
}