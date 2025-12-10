import { useRef, useState, useEffect } from "react";
import { createPost } from "../../services/postService";
import LoadingModal from "../cpn_other/LoadingModal";
import Toast from "../cpn_other/Toast";
import { getMyInfo } from "../../services/userService.js";

export default function SidebarLeft() {

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState("success");


  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await getMyInfo();
        console.log("My info:", response);
        setUserInfo(response.data.result);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchInfo();
  }, []);

  const handleCreatePost = async () => {
    setLoading(true);

    try {
      const res = await createPost(textContent, selectedFile);
      setToastMsg("Đăng bài thành công!");
      setToastType("success");
    } catch (error) {
      setToastMsg("Đăng bài thất bại!");
      setToastType("error");
    } finally {
      setLoading(false);

      setTimeout(() => {
        window.location.reload();   // Reload trang
      }, 800);
    }
  }

  const handleClick = () => {
    fileInputRef.current.click(); // Hieenr thị hộp thoại chọn file
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file); // Luu file object 
      setPreviewUrl(URL.createObjectURL(file)); // review
    }
  };

  const removeImage = () => {
    setPreviewUrl(null);
    URL.revokeObjectURL(selectedFile); // dọn bộ nhớ
  };

  return (
    <div className="w-[250px] bg-gray-100 p-4 h-full flex flex-col gap-4">
      <div className="bg-red-200 p-3 rounded shadow relative flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <img
            src={userInfo?.avatarUrl || "/default_avatar_removebg.png"}
            alt="avatar"
            className="w-12 h-12 float-right rounded-full object-cover"
          />
          <textarea
            className="text-[13px] w-full min-h-[90px] p-3 rounded-xl bg-white border border-gray-300 
               focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent 
               text-gray-800 shadow-sm resize-none"
            placeholder="Hãy cho mọi người biết hôm nay có chuyện gì vui nào !!!       ............."
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
          />
        </div>

        {selectedFile && (
          <div className="relative mt-3">
            {/* Nút xoá ảnh */}
            <div
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-gray-500 text-gray-700 rounded-full shadow 
                         w-6 h-6 flex items-center justify-center hover:bg-gray-400 hover:text-red-500">
              <i className="fa-solid fa-xmark cursor-pointer"></i>
            </div>

            {/* Ảnh preview */}
            <img
              src={previewUrl}
              alt="preview"
              className="rounded-lg w-full max-h-[250px] object-cover border border-gray-300 shadow"
            />
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <img
            className=" rounded shadow-sm w-7 h-7 transition-transform duration-200 hover:scale-110 cursor-pointer"
            onClick={handleClick}
            src="../../src/assets/icon_add_image.png"
          />
          <input  // Input ẩn - Chọn hình ảnh (chỉ ảnh)
            type="file"
            accept="image/*. video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <img
            className=" rounded shadow-sm w-7 h-7 transition-transform duration-200 hover:scale-110"
            src="../../src/assets/icon_use_AI.png"
          />
          <input
          // thêm chức năng gọi api hỏi AI sau
          />
        </div>

        {/* Nút đăng chỉ hiển thị khi có ảnh hoặc có nội dung */}
        {(selectedFile || textContent.trim() !== "") && (
          <button
            style={{
              backgroundColor: "#3b82f6"
            }}
            onClick={handleCreatePost}
            className="w-full mt-3 bg-blue-200 hover:bg-blue-600 text-white py-2 rounded shadow"
          >
            Đăng
          </button>
        )}

        {/* Gọi loading popup */}
        <LoadingModal open={loading} />

        {/* Gọi toast */}
        <Toast
          message={toastMsg}
          type={toastType}
          onClose={() => setToastMsg("")}
        />

      </div>
    </div>
  );
}
