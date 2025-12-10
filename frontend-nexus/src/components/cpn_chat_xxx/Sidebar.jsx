import React, { useState } from "react";
import NewChatPopover from "./NewChatPopover_v2.jsx";

export default function Sidebar({ onUserSelect }) {
   const [openPopover, setOpenPopover] = useState(false);

   return (
      <div className="w-80 h-full border-r flex flex-col bg-gray-50">
         {/* HEADER */}
         <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">Chats</h2>

            {/* Nút + */}
            <button
               onClick={() => setOpenPopover(true)}
               className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
               +
            </button>
         </div>

         {/* LIST CHAT */}
         <div className="flex-1 overflow-y-auto">
            {/* Hiện danh sách chat nếu có */}
            <div className="p-4 text-gray-400 text-sm">
               Chưa có cuộc hội thoạiii
            </div>
         </div>

         {/* POPUP */}
         <NewChatPopover
            open={openPopover}                // ✔ Truyền prop open đúng
            onClose={() => setOpenPopover(false)}
            onSelectUser={onUserSelect}      // ✔ Đúng tên prop NewChatPopover yêu cầu
         />
      </div>
   );
}
