import { useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import Feed from "./Feed";
import { 
   unfriend, 
   acceptFriendRequest, 
   declineFriendRequest, 
   sendFriendRequest 
} from "../../services/friendshipService";

export default function FriendDetail({ user }) {
   const navigate = useNavigate();

   // State quản lý trạng thái hiển thị
   const [isSent, setIsSent] = useState(false); // Giống isSent trong Sidebar
   const [isProcessing, setIsProcessing] = useState(false); // Giống isSending trong Sidebar
   const [isAccepted, setIsAccepted] = useState(false); // Giống isAccepted trong Sidebar
   const [showUnfriend, setShowUnfriend] = useState(false);
   
   const unfriendRef = useRef(null);

   // Reset trạng thái khi đổi sang xem user khác
   useEffect(() => {
      setIsSent(false);
      setIsAccepted(false);
      setShowUnfriend(false);
   }, [user.id]);

   const handleMessageClick = () => {
      navigate("/chat", { state: { selectedUser: user } });
   };

   // Đóng menu "Hủy bạn bè" khi click ngoài
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (unfriendRef.current && !unfriendRef.current.contains(event.target)) {
            setShowUnfriend(false);
         }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   // --- HÀM GỬI LỜI MỜI (GIỐNG SIDEBAR) ---
   const handleSendRequestAction = async () => {
      setIsProcessing(true);
      try {
         const response = await sendFriendRequest(user.id);
         if (response.data.code === 1000) {
            setIsSent(true); // Thành công thì đổi trạng thái nút
         }
      } catch (error) {
         console.error("Lỗi khi gửi lời mời:", error);
      } finally {
         setIsProcessing(false);
      }
   };

   // --- HÀM CHẤP NHẬN (GIỐNG SIDEBAR) ---
   const handleAcceptAction = async () => {
      setIsProcessing(true);
      try {
         const response = await acceptFriendRequest(user.id);
         if (response.data.code === 1000) {
            setIsAccepted(true);
         }
      } catch (error) {
         console.error(error);
      } finally {
         setIsProcessing(false);
      }
   };

   const handleDeclineAction = async () => {
      try {
         const response = await declineFriendRequest(user.id);
         if (response.data.code === 1000) {
            // Có thể navigate quay lại hoặc thông báo
            window.location.reload(); 
         }
      } catch (error) { console.error(error); }
   };

   const handleUnfriendAction = async () => {
      setIsProcessing(true);
      try {
         const response = await unfriend(user.id);
         if (response.data.code === 1000) {
            window.location.reload();
         }
      } catch (error) {
         console.error(error);
      } finally { setIsProcessing(false); }
   };

   const renderActions = () => {
      const btnBase = `w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm active:scale-[0.95] text-center mb-2 flex items-center justify-center gap-2`;

      // 1. Nếu đã bấm Chấp nhận hoặc đang là bạn bè
      if (isAccepted || user.relationshipStatus === "IS_FRIENDS_WITH") {
         return (
            <div className="flex flex-col w-full mt-6 space-y-1">
               <div className="relative" ref={unfriendRef}>
                  {showUnfriend && (
                     <div
                        className={`${btnBase} absolute bottom-full left-0 bg-slate-100 text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer z-10`}
                        onClick={handleUnfriendAction}>
                        <i className="fa-solid fa-user-xmark"></i> Hủy bạn bè
                     </div>
                  )}
                  <div
                     className={`${btnBase} bg-emerald-100 text-emerald-700 cursor-pointer`}
                     onClick={() => setShowUnfriend(!showUnfriend)}>
                     <i className="fa-solid fa-check"></i> Bạn bè
                  </div>
               </div>
               <div className={`${btnBase} bg-sky-500 text-white hover:bg-sky-600 cursor-pointer`} onClick={handleMessageClick}>
                  Nhắn tin
               </div>
            </div>
         );
      }

      // 2. Nếu là lời mời kết bạn (Pending)
      if (user.relationshipStatus === "SENT_REQUEST_TO") {
         return (
            <div className="flex flex-col w-full mt-6">
               <div onClick={handleAcceptAction} className={`${btnBase} bg-blue-500 hover:bg-blue-600 text-white cursor-pointer`}>
                  {isProcessing ? "Đang xử lý..." : "Chấp nhận"}
               </div>
               <div onClick={handleDeclineAction} className={`${btnBase} bg-slate-300 hover:bg-slate-400 text-slate-700 cursor-pointer`}>
                  Từ chối
               </div>
            </div>
         );
      }

      // 3. Logic Kết bạn / Đã gửi lời mời (GIỐNG SIDEBAR)
      if (isSent) {
         return (
            <div className={`${btnBase} bg-green-100 text-green-700 mt-6 cursor-default border border-green-200`}>
               <i className="fa-solid fa-paper-plane text-xs"></i> Đã gửi lời mời
            </div>
         );
      }

      return (
         <div 
            onClick={!isProcessing ? handleSendRequestAction : null}
            className={`${btnBase} bg-blue-500 hover:bg-blue-600 text-white mt-6 cursor-pointer`}>
            {isProcessing ? (
               <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <><i className="fa-solid fa-user-plus"></i> Kết bạn</>
            )}
         </div>
      );
   };

   return (
      <div className="w-full flex flex-row gap-6 items-start px-10 py-8 bg-linear-to-b from-blue-300 via-blue-400 to-indigo-200 animate-gradient min-h-screen">
         <aside className="w-[280px] sticky top-1 shrink-0 h-fit">
            <div className="bg-white rounded-[40px] p-4 border border-slate-200 shadow-sm flex flex-col items-center">
               <div className="mb-4">
                  <img
                     src={user.avatarUrl || "/default_user_avatar.png"}
                     alt="Avatar"
                     className="w-40 h-40 rounded-4xl object-cover border-4 border-white shadow-md"
                  />
               </div>

               <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">
                  {user.fullname}
               </h2>

               <div className="flex flex-col gap-3 text-sm text-slate-500 w-full border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-3">
                     <i className="fa-solid fa-cake-candles w-5 text-slate-400"></i>
                     <span>{user.dob || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <i className="fa-solid fa-location-dot w-5 text-slate-400"></i>
                     <span>{user.city || "Chưa cập nhật"}</span>
                  </div>
               </div>

               {renderActions()}
            </div>
         </aside>

         <main className="flex-1">
            <div className="flex items-center gap-4 mb-8">
               <span className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
                  BÀI VIẾT CỦA {user.fullname?.split(' ').pop()}
               </span>
               <div className="flex-1 h-px bg-slate-500"></div>
            </div>

            <div className="max-w-[700px] space-y-4">
               <Feed userId={user.userId} />
            </div>
         </main>
      </div>
   );
}