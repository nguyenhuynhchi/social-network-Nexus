import { useRef, useState, useEffect } from "react";
import LoadingModal from "../cpn_other/LoadingModal.jsx";
import Toast from "../cpn_other/Toast.jsx";
import { getMyInfo, updateProfile, uploadAvatar } from "../../services/userService.js";

export default function InfoProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [editingField, setEditingField] = useState(null);
  const [newValue, setNewValue] = useState("");

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const fetchUserInfo = async () => {
    setLoading(true);
    try {
      const response = await getMyInfo();
      if (response?.data?.code === 1000) setUserInfo(response.data.result);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUserInfo(); }, []);

  const handleAvatarClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowAvatarModal(true);
    }
  };

  const closeAvatarModal = () => {
    setShowAvatarModal(false);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    fileInputRef.current.value = "";
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const response = await uploadAvatar(selectedFile);
      if (response?.data?.code === 1000) {
        closeAvatarModal();
        window.location.reload();
      }
    } catch (error) {
      setToast({ show: true, message: "Lỗi upload!", type: "error" });
    } finally { setLoading(false); }
  };

  const handleSave = async (field) => {
    if (!newValue.trim()) return;
    setLoading(true);
    try {
      const response = await updateProfile({ [field]: newValue.trim() });
      if (response?.data?.code === 1000) {
        setUserInfo({ ...userInfo, [field]: newValue.trim() });
        setEditingField(null);
      }
    } catch (error) { setToast({ show: true, message: "Lỗi!", type: "error" }); }
    finally { setLoading(false); }
  };

  const renderInfoRow = (label, field, displayValue, type = "text") => (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <p className="text-[10px] font-bold text-gray-400 uppercase mb-0.5">{label}</p>
      <div className="flex justify-between items-center h-7">
        {editingField !== field ? (
          <>
            <span className="text-sm font-semibold text-gray-700 truncate w-[180px]">
              {displayValue || "Trống"}
            </span>
            {field !== "email" && (
              <i className="fa-solid fa-pen-to-square text-blue-400 cursor-pointer text-xs hover:text-blue-600"
                onClick={() => { setEditingField(field); setNewValue(userInfo[field] || ""); }}></i>
            )}
          </>
        ) : (
          <div className="flex items-center w-full gap-1">
            <input
              type={type === "date" ? "date" : "text"}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="flex-1 text-xs border rounded px-1 py-0.5 outline-none text-black border-blue-300 min-w-0"
              autoFocus
            />
            <i className="fa-solid fa-check text-green-500 cursor-pointer" onClick={() => handleSave(field)}></i>
            <i className="fa-solid fa-xmark text-red-400 cursor-pointer" onClick={() => setEditingField(null)}></i>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-[300px] bg-linear-to-b from-slate-50 via-slate-100 to-slate-50 h-full flex flex-col shadow-xl border-r border-gray-100 overflow-hidden">
      {loading && <LoadingModal />}
      {toast.show && <Toast {...toast} onClose={() => setToast({ ...toast, show: false })} />}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-4xl p-6 w-full max-w-[400px] flex flex-col items-center shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Cập nhật ảnh đại diện</h3>

            <div className="w-64 h-64 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-xl border-4 border-gray-50 mb-8">
              <img
                src={previewUrl}
                className="w-full h-full object-cover"
                alt="Avatar Preview"
              />
            </div>

            <div className="flex gap-3 w-full">
              <div
                onClick={closeAvatarModal}
                disabled={loading} // Vô hiệu hóa khi đang loading
                className="flex-1 flex items-center justify-center py-3 text-sm font-bold bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                Hủy
              </div>
              <div
                onClick={handleConfirmUpload}
                disabled={loading} // Vô hiệu hóa khi đang loading
                className="flex-1 py-3 text-sm font-bold bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition active:scale-95 disabled:bg-blue-400 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Đang lưu...
                  </>
                ) : (
                  "Xác nhận lưu"
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col items-center p-5 bg-linear-to-b from-blue-50 to-white">
        <div onClick={handleAvatarClick} className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-lg cursor-pointer">
          <img src={userInfo?.avatarUrl || "/default_user_avatar.png"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <i className="fa-solid fa-camera text-white text-lg"></i>
          </div>
        </div>

        <div className="mt-3 w-full text-center">
          {editingField === "fullname" ? (
            <div className="flex items-center justify-center gap-2"> {/* Tăng gap lên 2 cho thoáng */}
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="w-32 border-b text-black border-blue-400 text-center font-bold outline-none text-sm"
                autoFocus
              />
              <div className="flex gap-2"> {/* Nhóm 2 nút điều khiển */}
                <i
                  className="fa-solid fa-check text-green-500 cursor-pointer text-sm hover:text-green-600"
                  onClick={() => handleSave("fullname")}
                ></i>
                <i
                  className="fa-solid fa-xmark text-red-400 cursor-pointer text-sm hover:text-red-600"
                  onClick={() => setEditingField(null)}
                ></i>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 group">
              <h2 className="text-base font-bold text-gray-800 truncate max-w-[180px] leading-tight">
                {userInfo?.fullname || "Người dùng"}
              </h2>
              <i
                className="fa-solid fa-pen-to-square text-[12px] text-blue-400 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                onClick={() => { setEditingField("fullname"); setNewValue(userInfo?.fullname || ""); }}
              ></i>
            </div>
          )}
        </div>
      </div>

      {/* Info List */}
      <div className="px-5 space-y-1">
        {renderInfoRow("Email", "email", userInfo?.email)}
        {renderInfoRow("Ngày sinh", "dob", userInfo?.dob ? userInfo.dob.split('-').reverse().join('/') : "", "date")}
        {renderInfoRow("Thành phố", "city", userInfo?.city)}
      </div>
    </div>
  );
}