import { useRef, useState, useEffect } from "react";
import { createPost } from "../../services/postService";
import LoadingModal from "../cpn_other/LoadingModal";
import Toast from "../cpn_other/Toast";
import { getMyInfo } from "../../services/userService.js";
import { useNavigate } from "react-router-dom";

import iconAddImage from "../../assets/icon_add_image.png";

export default function SidebarLeft() {

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [tempFile, setTempFile] = useState(null);
  const [tempPreviewUrl, setTempPreviewUrl] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [textContent, setTextContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await getMyInfo();
        setUserInfo(response.data.result);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchInfo();
  }, []);

  const handleCreatePost = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await createPost(textContent, selectedFile);
      setToastMsg("Đăng bài thành công!");
      setToastType("success");

      // Thêm logic dọn dẹp form sau khi đăng thành công (tùy chọn)
      setTextContent("");
      setSelectedFile(null);
      setPreviewUrl(null);

      navigate("/personal-page"); // Chuyển về trang personal sau khi đăng bài
    } catch (error) {
      console.error("Lỗi khi đăng bài:", error);
      setToastMsg("Đăng bài thất bại!");
      setToastType("error");
    } finally {
      // Luôn luôn tắt loading ở đây
      setLoading(false);
    }
  };

  /* Image handling  */

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

    // QUAN TRỌNG: Reset giá trị input để có thể chọn lại cùng 1 file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);

    // QUAN TRỌNG: Reset giá trị input ở đây nữa
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="
        w-[300px] h-screen flex flex-col gap-6 p-5
        bg-linear-to-b from-slate-50 via-slate-100 to-slate-50
        border-r border-slate-200
        shadow-[2px_0_12px_rgba(0,0,0,0.05)]
        overflow-y-auto 
        custom-scrollbar
      "
    >
      {/* Composer */}
      <div className="rounded-2xl bg-linear-to-br from-white to-slate-50 border border-slate-200 shadow-[0_8px_24px_rgba(0,0,0,0.06)] shrink-0 flex flex-col overflow-hidden">

        {/* Vùng nội dung có thể cuộn (Header + Text + Preview) */}
        <div className="p-4 overflow-y-auto max-h-[calc(100vh-150px)] custom-scrollbar">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <img
              src={userInfo?.avatarUrl || "/default_user_avatar.png"}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100 shadow-md"
            />
            <div>
              <p className="text-[14px] font-semibold text-slate-800">
                {userInfo?.fullname || "Người dùng"}
              </p>
            </div>
          </div>

          {/* Text */}
          <textarea
            className="
              text-[13px] w-full min-h-[100px] p-3 rounded-xl
              bg-slate-100 border border-slate-200
              focus:bg-white focus:border-indigo-300
              focus:outline-none
              text-slate-800 placeholder-slate-400
              resize-none
            "
            placeholder="Hãy chia sẻ điều gì đó thú vị..."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />

          {/* Preview vùng cuộn trong SidebarLeft */}
          {previewUrl && (
            <div className="relative mt-2 mb-4 group">
              <div
                onClick={removeImage}
                className="absolute top-2 right-2 w-7 h-7 bg-slate-900/60 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-red-500 z-10 shadow-lg">✕</div>

              <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                {/* KIỂM TRA LOẠI TỆP Ở ĐÂY */}
                {selectedFile?.type.startsWith("video/") ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-auto max-h-[300px] object-contain mx-auto"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    className="w-full h-auto max-h-[300px] object-contain mx-auto"
                    alt="preview"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Toolbar CỐ ĐỊNH (Sticky/Fixed) ở dưới đáy Composer */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-slate-200 bg-white/80 backdrop-blur-sm sticky bottom-0">
          <div
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <img className="w-4 h-4" src={iconAddImage} alt="add" />
            </div>
          </div>

          <input
            type="file"
            accept="image/*,video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {(selectedFile || textContent.trim()) && (
            <div
              onClick={handleCreatePost}
              disabled={loading}
              className={`px-6 py-2 rounded-full text-[13px] font-bold text-white shadow-md transition-all active:scale-95
                ${loading
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-linear-to-r from-indigo-500 to-indigo-600 hover:shadow-indigo-200 hover:shadow-lg"
                }`}
            >
              {loading ? "Đang đăng..." : "Đăng bài"}
            </div>
          )}
        </div>
      </div>

      {/* Popup preview lớn */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-300 rounded-2xl p-4 w-full max-w-md shadow-2xl">

            {/* KIỂM TRA LOẠI TỆP TRONG TEMP FILE */}
            {tempFile?.type.startsWith("video/") ? (
              <video
                src={tempPreviewUrl}
                controls
                autoPlay
                className="w-full max-h-[60vh] object-contain rounded-xl mb-4"
              />
            ) : (
              <img
                src={tempPreviewUrl}
                className="w-full max-h-[60vh] object-contain rounded-xl mb-4"
              />
            )}

            <div className="flex justify-end gap-3">
              <div onClick={cancelImage} className="px-4 py-2 rounded-full bg-slate-200 text-slate-700">Hủy</div>
              <div onClick={confirmImage} className="px-5 py-2 rounded-full bg-indigo-600 text-white">OK</div>
            </div>
          </div>
        </div>
      )}

      <LoadingModal open={loading} />
      <Toast message={toastMsg} type={toastType} onClose={() => setToastMsg("")} />
    </div>
  );
}
