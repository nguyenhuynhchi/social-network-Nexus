import React, { useState, useEffect, useCallback } from "react";
import {
   getPendingRequests,
   getMyFriends,
   getSuggestFriends,
   acceptFriendRequest,
   sendFriendRequest,
   declineFriendRequest,
} from "../../services/friendshipService";

import { search } from "../../services/userService";

export default function FriendSidebar({ onSelectUser, onTabChange }) {
   const [activeTab, setActiveTab] = useState("all");
   const [data, setData] = useState([]);
   const [loading, setLoading] = useState(false);

   // Các state cho tìm kiếm
   const [searchQuery, setSearchQuery] = useState("");
   const [hasSearched, setHasSearched] = useState(false);

   const changeTab = (tab) => {
      setActiveTab(tab);
      onTabChange(tab); // Thông báo cho Home tab đã đổi
      // onSelectUser(null); // Tùy chọn: Reset detail khi đổi tab
   };

   // Hàm fetch dữ liệu theo Tab
   const fetchTabData = useCallback(async () => {
      setLoading(true);
      setHasSearched(false);
      setSearchQuery(""); // Reset search khi chuyển tab
      try {
         let response;
         if (activeTab === "pending") {
            response = await getPendingRequests();
            if (response.data.code === 1000) {
               setData(response.data.result.map(user => ({ ...user, isAccepted: false })));
               console.log("==> Pending requests:", response.data.result);
            }
         } else if (activeTab === "suggest") {
            response = await getSuggestFriends(10);
            if (response.data.code === 1000) {
               setData(response.data.result.map(user => ({ ...user, isSent: false })));
               console.log("==> Suggested friends:", response.data.result);
            }
         } else if (activeTab === "all") {
            response = await getMyFriends();
            if (response.data.code === 1000) {
               setData(response.data.result);
               console.log("==> My friends:", response.data.result);
            }
         }
      } catch (error) {
         console.error("Lỗi khi fetch data:", error);
      } finally {
         setLoading(false);
      }
   }, [activeTab]);

   // Gọi dữ liệu khi đổi tab
   useEffect(() => {
      fetchTabData();
   }, [fetchTabData]);

   // Hàm thực hiện tìm kiếm (Debounced)
   const handleSearchAction = useCallback(async (query) => {
      if (!query.trim()) {
         fetchTabData(); // Nếu xóa trắng thì quay lại dữ liệu của Tab
         return;
      }

      setLoading(true);
      setHasSearched(true);
      try {
         const response = await search(query.trim());
         if (response.data.code === 1000) {
            const resultsWithState = response.data.result.map(user => ({
               ...user,
               isSent: false,
               isSending: false // Khởi tạo trạng thái loading cho mỗi user tìm thấy
            }));
            setData(resultsWithState);
         }
      } catch (error) {
         console.error("Lỗi tìm kiếm:", error);
         setData([]);
      } finally {
         setLoading(false);
      }
   }, [fetchTabData]);

   // Xử lý Debounce tìm kiếm
   useEffect(() => {
      if (activeTab === "pending") return; // Tab lời mời không search

      const timeoutId = setTimeout(() => {
         if (searchQuery) {
            handleSearchAction(searchQuery);
         } else if (hasSearched) {
            fetchTabData();
         }
      }, 500);

      return () => clearTimeout(timeoutId);
   }, [searchQuery, handleSearchAction, activeTab, hasSearched, fetchTabData]);

   // Xử lý các tương tác nút
   const handleAccept = async (profileId) => {
      try {
         const response = await acceptFriendRequest(profileId);
         if (response.data.code === 1000) {
            setData(prev => prev.map(u => u.id === profileId ? { ...u, isAccepted: true } : u));
         }
      } catch (error) { console.error(error); }
   };

   const handleDecline = async (profileId) => {
      try {
         const response = await declineFriendRequest(profileId);
         if (response.data.code === 1000) {
            setData(prev => prev.filter(u => u.id !== profileId));
         }
      } catch (error) { alert("Không thể thực hiện yêu cầu này!"); }
   };

   const handleSendRequest = async (profileId) => {
      setData(prev => prev.map(u => u.id === profileId ? { ...u, isSending: true } : u));

      try {
         const response = await sendFriendRequest(profileId);
         if (response.data.code === 1000) {
            setData(prev => prev.map(u =>
               u.id === profileId ? { ...u, isSent: true, isSending: false } : u
            ));
         }
      } catch (error) {
         console.error("Lỗi khi gửi lời mời:", error);
         setData(prev => prev.map(u => u.id === profileId ? { ...u, isSending: false } : u));
      }
   };

   return (
      <div className="w-[300px] h-full bg-slate-50 flex flex-col p-4 border-r border-slate-200">
         {/* Header */}
         <div className="flex items-center gap-2 mb-6">
            <i className="fa-solid fa-users text-2xl text-blue-600"></i>
            <span className="font-bold text-blue-600 text-lg">Bạn bè</span>
         </div>

         {/* Tabs */}
         <div className="flex gap-2 mb-6">
            {["all", "suggest", "pending"].map((tab) => (
               <div
                  key={tab}
                  onClick={() => changeTab(tab)}
                  className={`flex-1 py-1.5 rounded-full text-[12px] text-center font-semibold cursor-pointer transition
            ${activeTab === tab
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                     }`}
               >
                  {tab === "all" ? "Tất cả" : tab === "suggest" ? "Gợi ý" : "Lời mời"}
               </div>
            ))}
         </div>

         {/* Search */}
         {activeTab !== "pending" && (
            <div className="relative mb-4">
               <input
                  type="text"
                  className="w-full py-2 pl-9 pr-8 rounded-xl bg-white border border-slate-300 
                     focus:ring-2 focus:ring-blue-400 focus:border-transparent 
                     text-sm text-slate-800 placeholder-slate-400"
                  placeholder="Tìm kiếm bạn bè..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
               <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>

               {searchQuery && (
                  <i
                     className="fa-solid fa-circle-xmark absolute right-3 top-1/2 -translate-y-1/2 
                       text-slate-400 hover:text-slate-600 cursor-pointer"
                     onClick={() => setSearchQuery("")}
                  />
               )}
            </div>
         )}

         {/* Content */}
         <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
            {loading ? (
               <div className="flex justify-center py-10">
                  <div className="w-7 h-7 border-3 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
               </div>
            ) : data.length > 0 ? (
               data.map((user) => (
                  <div
                     key={user.id}
                     onClick={() => onSelectUser(user)}
                     className="relative bg-slate-100 p-3 rounded-2xl flex gap-3 border border-slate-300 shadow-[0_2px_6px_rgba(0,0,0,0.05)]
                        hover:shadow-[0_6px_18px_rgba(37,99,235,0.15)]
                        hover:-translate-y-0.5
                        hover:border-blue-400
                        hover:bg-slate-200
                        transition-all
                        duration-300
                        ease-out
                        cursor-pointer"
                  >

                     <img
                        src={user.avatarUrl || "/default_user_avatar.png"}
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                        alt="avatar"
                     />

                     <div className="flex-1 min-w-0">
                        {/* Tên người dùng */}
                        <p className="font-semibold text-slate-800 truncate text-sm">
                           {user.fullname}
                        </p>

                        {/* KHỐI LOGIC ĐIỀU KIỆN DUY NHẤT */}
                        {(() => {
                           // 1. TRƯỜNG HỢP: ĐÃ LÀ BẠN BÈ (Ưu tiên kiểm tra trạng thái này đầu tiên)
                           // Nếu trạng thái là IS_FRIENDS_WITH hoặc đang ở tab "Tất cả" mà không search
                           if (user.relationshipStatus === "IS_FRIENDS_WITH" || (activeTab === "all" && !hasSearched)) {
                              return (
                                 <p className="text-[12px] text-slate-600 truncate">
                                    {user.city || "Chưa cập nhật"}
                                 </p>
                              );
                           }

                           // 2. TRƯỜNG HỢP: TAB LỜI MỜI (Pending)
                           if (activeTab === "pending") {
                              return (
                                 <div className="flex gap-2 mt-2">
                                    {user.isAccepted ? (
                                       <div className="w-full bg-emerald-100 text-emerald-700 text-[10px] py-1.5 rounded-lg text-center font-bold border border-emerald-300">
                                          <i className="fa-solid fa-user-check mr-1"></i> Đã là bạn bè
                                       </div>
                                    ) : (
                                       <div className="flex gap-2 w-full">
                                          <div
                                             onClick={(e) => { e.stopPropagation(); handleAccept(user.id); }}
                                             className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] py-1.5 rounded-lg text-center font-semibold cursor-pointer"
                                          >
                                             Chấp nhận
                                          </div>
                                          <div
                                             onClick={(e) => { e.stopPropagation(); handleDecline(user.id); }}
                                             className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-700 text-[10px] py-1.5 rounded-lg text-center font-semibold cursor-pointer"
                                          >
                                             Từ chối
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              );
                           }

                           // 3. TRƯỜNG HỢP: NGƯỜI LẠ (Search hoặc Gợi ý)
                           return (
                              <>
                                 <p className="text-[11px] text-blue-600 truncate mb-2">
                                    {activeTab === "suggest" && !hasSearched
                                       ? `${user.commonFriendsCount || 0} bạn chung`
                                       : (user.city || "Chưa cập nhật")}
                                 </p>

                                 {user.isSent || user.relationshipStatus === "SENT_REQUEST_TO" ? (
                                    <div className="bg-green-100 text-green-700 text-[10px] py-1 rounded-lg text-center font-semibold">
                                       <i className="fa-solid fa-paper-plane text-xs"></i> Đã gửi lời mời
                                    </div>
                                 ) : user.isSending ? (
                                    <div className="flex justify-center py-1">
                                       <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                 ) : (
                                    <div
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          handleSendRequest(user.id);
                                       }}
                                       className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] py-1.5 rounded-lg text-center font-semibold"
                                    >
                                       <i className="fa-solid fa-user-plus"></i> Kết bạn
                                    </div>
                                 )}
                              </>
                           );
                        })()}
                     </div>
                  </div>
               ))
            ) : (
               <p className="text-center text-slate-400 text-sm mt-10">
                  {hasSearched ? `Không tìm thấy "${searchQuery}"` : "Danh sách trống"}
               </p>
            )}
         </div>
      </div>
   );

}