import { useLocation } from "react-router-dom";
import React, { useState, useEffect, useRef, useCallback } from "react";
import NewChatPopover from "../components/cpn_chat/NewChatPopover";
import NewGroupPopover from "../components/cpn_chat/NewGroupPopover";
import Navbar from "../components/Navbar";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authenticationService";

import {
   getMyConversations,
   createConversation,
   getMessages,
   createMessage,
} from "../services/chatService";
import { io } from "socket.io-client";
import { getToken } from "../services/localStorageService";
import { CONFIG } from "../configurations/configuration";

// Các thành phần hỗ trợ cho Tailwind CSS equivalents
const Avatar = ({ src, children, className = "" }) => (
   <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${className}`}
      style={{ backgroundImage: src ? `url(${src})` : 'url(/default_user_avatar.png)', backgroundSize: 'cover' }}
   >
      {!src && children}
   </div>
);

const IconButton = ({ children, onClick, disabled, className = "" }) => (
   <div
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-full transition-colors duration-200 ${disabled ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-100 active:bg-blue-200"
         } ${className}`}
   >
      {children}
   </div>
);

const Badge = ({ children, badgeContent, invisible = false, className = "" }) => {
   if (invisible || badgeContent === 0 || !badgeContent) {
      return children;
   }
   return (
      <div className="relative inline-block">
         {children}
         <span
            className={`absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 
                           inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none 
                           text-red-100 bg-red-600 rounded-full ${className}`}
         >
            {badgeContent}
         </span>
      </div>
   );
};

const Spinner = () => (
   <div className="flex justify-center p-3">
      <i className="fa-solid fa-spinner fa-spin text-blue-600 text-3xl"></i>
   </div>
);

const Alert = ({ severity, children, action }) => {
   let bgColor, textColor;
   switch (severity) {
      case 'error':
         bgColor = 'bg-red-100';
         textColor = 'text-red-700';
         break;
      default:
         bgColor = 'bg-gray-100';
         textColor = 'text-gray-700';
   }

   return (
      <div className={`p-3 rounded-lg flex items-center justify-between ${bgColor} ${textColor} mb-2`}>
         <span>{children}</span>
         {action && <div className="ml-4">{action}</div>}
      </div>
   );
};


export default function Chat() {
   const [message, setMessage] = useState("");
   const [newChatAnchorEl, setNewChatAnchorEl] = useState(null);
   const [conversations, setConversations] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [selectedConversation, setSelectedConversation] = useState(null);
   const [messagesMap, setMessagesMap] = useState({});
   const [newChatRect, setNewChatRect] = useState(null);
   const [newGroupAnchorEl, setNewGroupAnchorEl] = useState(null);
   const [newGroupRect, setNewGroupRect] = useState(null);
   const messageContainerRef = useRef(null);
   const socketRef = useRef(null);
   const location = useLocation();
   const hasProcessedInitialUser = useRef(false);

   useEffect(() => {
      if (!isAuthenticated()) {
         navigate("/login");
      }
   }, [Navigate]);

   useEffect(() => {
      if (location.state?.selectedUser && !hasProcessedInitialUser.current && !loading) {
         handleSelectNewChatUser(location.state.selectedUser);
         hasProcessedInitialUser.current = true;

         // Xóa state của location để tránh lặp lại khi F5 trang
         window.history.replaceState({}, document.title);
      }
   }, [location.state, loading]);

   // Hàm cuộn xuống dưới cùng của vùng message
   const scrollToBottom = useCallback(() => {
      if (messageContainerRef.current) {
         // Cuộn ngay lập tức
         messageContainerRef.current.scrollTop =
            messageContainerRef.current.scrollHeight;

         // Thử lại với delay nhỏ để đảm bảo DOM cập nhật xong
         setTimeout(() => {
            if (messageContainerRef.current) {
               messageContainerRef.current.scrollTop =
                  messageContainerRef.current.scrollHeight;
            }
         }, 100);

         // Thử lần cuối với delay lâu hơn
         setTimeout(() => {
            if (messageContainerRef.current) {
               messageContainerRef.current.scrollTop =
                  messageContainerRef.current.scrollHeight;
            }
         }, 300);
      }
   }, []);

   // Xử lý popover chat mới
   const handleNewChatClick = (event) => {
      setNewChatRect(event.currentTarget.getBoundingClientRect());
      setNewChatAnchorEl(event.currentTarget);
   };

   const handleCloseNewChat = () => {
      setNewChatAnchorEl(null);
   };

   const handleSelectNewChatUser = async (user) => {
      try {
         const response = await createConversation({
            type: "DIRECT",
            participantIds: [user.userId || user.id],
         });

         const newConversation = response?.data?.result;

         if (newConversation) {
            setConversations((prevConversations) => {
               // 1. Lọc bỏ conversation có trùng ID để tránh việc hiển thị 2 dòng giống nhau
               const filteredConversations = prevConversations.filter(
                  (conv) => conv.id !== newConversation.id
               );

               // 2. Thêm conversation (mới nhất) vào đầu danh sách
               return [newConversation, ...filteredConversations];
            });

            // 3. Chọn conversation này để hiển thị khung chat
            setSelectedConversation(newConversation);
         }
      } catch (error) {
         console.error("Lỗi khi xử lý chọn user nhắn tin:", error);
      }
   };

   const handleNewGroupClick = (event) => {
      setNewGroupRect(event.currentTarget.getBoundingClientRect());
      setNewGroupAnchorEl(event.currentTarget);
   };

   const handleCloseNewGroup = () => {
      setNewGroupAnchorEl(null);
      setNewGroupRect(null);
   };

   const handleCreateGroup = async ({ groupName, memberIds }) => {
      const trimmedGroupName = groupName ? groupName.trim() : '';

      const groupData = {
         type: "GROUP",
         conversationName: trimmedGroupName,
         // participantIds là các thành viên được chọn (không bao gồm người tạo)
         participantIds: memberIds,
      };
      console.log("Đang tạo Group:", groupData);
      console.log("Tên Conversation:", groupData.conversationName);

      try {
         // Gọi API tạo Conversation (GROUP)
         const response = await createConversation(groupData);

         const newConversation = response?.data?.result;

         console.log("Conversation nhóm mới được tạo:", newConversation);
         if (!newConversation) {
            console.error("Lỗi tạo conversation nhóm.");
            // Xử lý lỗi UI ở đây
            return;
         }

         // Thêm vào danh sách conversations
         setConversations((prevConversations) => [
            newConversation,
            ...prevConversations,
         ]);

         // Chọn conversation nhóm mới này
         setSelectedConversation(newConversation);

      } catch (error) {
         console.error("Lỗi tạo nhóm:", error);
         // Xử lý lỗi (ví dụ: hiển thị Toast/Alert)
      }

      // Đóng Popover
      handleCloseNewGroup();
   };

   // Lấy conversations từ API
   const fetchConversations = async () => {
      setLoading(true);
      setError(null);
      try {
         const response = await getMyConversations();
         // Sắp xếp theo modifiedDate giảm dần để hiển thị hoạt động mới nhất trước
         const sortedConversations = (response?.data?.result || []).sort(
            (a, b) => new Date(b.modifiedDate) - new Date(a.modifiedDate)
         );
         setConversations(sortedConversations);
      } catch (err) {
         console.error("Lỗi lấy conversations:", err);
         setError("Không thể tải conversations. Vui lòng thử lại sau.");
      } finally {
         setLoading(false);
      }
   };

   // Tải conversations khi component được mount
   useEffect(() => {
      fetchConversations();
   }, []);

   // Khởi tạo chọn conversation đầu tiên khi có sẵn
   useEffect(() => {
      // Tìm conversation được chọn mới nếu có và nó nằm trong danh sách cập nhật
      if (conversations.length > 0 && !selectedConversation) {
         setSelectedConversation(conversations[0]);
      }
   }, [conversations, selectedConversation]);

   // Tải messages từ lịch sử conversation khi conversation được chọn
   useEffect(() => {
      const fetchMessages = async (conversationId) => {
         try {
            // Kiểm tra xem đã có messages cho conversation này chưa
            if (!messagesMap[conversationId]) {
               const response = await getMessages(conversationId);
               if (response?.data?.result) {
                  // Sắp xếp messages theo createdDate để đảm bảo thứ tự thời gian
                  const sortedMessages = [...response.data.result].sort(
                     (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
                  );

                  // Cập nhật messages map với messages được lấy
                  setMessagesMap((prev) => ({
                     ...prev,
                     [conversationId]: sortedMessages,
                  }));
               }
            }

            // Đánh dấu conversation đã đọc khi được chọn
            setConversations((prevConversations) =>
               prevConversations.map((conv) =>
                  conv.id === conversationId ? { ...conv, unread: 0 } : conv
               )
            );
         } catch (err) {
            console.error(
               `Lỗi lấy messages cho conversation ${conversationId}:`,
               err
            );
         }
      };

      if (selectedConversation?.id) {
         fetchMessages(selectedConversation.id);
      }
   }, [selectedConversation, messagesMap]);

   const currentMessages = selectedConversation
      ? messagesMap[selectedConversation.id] || []
      : [];

   // Tự động cuộn xuống dưới khi messages thay đổi hoặc sau khi gửi message
   useEffect(() => {
      scrollToBottom();
   }, [currentMessages, scrollToBottom]);

   // Cũng cuộn khi conversation thay đổi
   useEffect(() => {
      scrollToBottom();
   }, [selectedConversation, scrollToBottom]);

   useEffect(() => {
      // Khởi tạo kết nối socket chỉ một lần
      if (!socketRef.current) {
         console.log("Đang khởi tạo kết nối socket...");

         const connectionUrl = `${CONFIG.CHAT_SOCKET}?token=${getToken()}`;

         socketRef.current = new io(connectionUrl);

         socketRef.current.on("connect", () => {
            console.log("Socket đã kết nối");
         });

         socketRef.current.on("disconnect", () => {
            console.log("Socket đã ngắt kết nối");
         });

         socketRef.current.on("message", (message) => {
            console.log("Message mới nhận được:", message);

            try {
               const messageObject = JSON.parse(message);
               console.log("Message object được parse:", messageObject);

               // Cập nhật messages trong UI khi nhận được message mới
               if (messageObject?.conversationId) {
                  handleIncomingMessage(messageObject);
                  console.log("Xử lý message đến:", messageObject);
               }
            } catch (e) {
               console.error("Lỗi parse message đến:", e);
            }
         });
      }

      // Hàm dọn dẹp - ngắt kết nối socket khi component bị unmount
      return () => {
         if (socketRef.current) {
            console.log("Đang ngắt kết nối socket...");
            socketRef.current.disconnect();
            socketRef.current = null;
         }
      };
   }, []);

   const handleConversationSelect = (conversation) => {
      setSelectedConversation(conversation);
   };

   const handleSendMessage = async () => {
      if (!message.trim() || !selectedConversation) return;

      const messageToSend = message;

      // Xóa input field ngay lập tức
      setMessage("");

      try {
         // Gửi message tới API (sau đó sẽ dùng socket.io để phát tới tất cả participants)
         await createMessage({
            conversationId: selectedConversation.id,
            message: messageToSend,
         });

         // Message object thực sẽ được thêm bởi socket handler (handleIncomingMessage)
         // khi server phát message trở lại.
      } catch (error) {
         console.error("Lỗi gửi message:", error);
         // Trong trường hợp lỗi, bạn có thể khôi phục optimistic update hoặc hiển thị trạng thái "Gửi thất bại".
      }
   };

   // Hàm hỗ trợ xử lý incoming socket messages
   const handleIncomingMessage = useCallback(
      (message) => {

         // Thêm message mới vào conversation tương ứng
         setMessagesMap((prev) => {
            const existingMessages = prev[message.conversationId] || [];

            // Kiểm tra xem message đã tồn tại hay chưa để tránh trùng lặp
            const messageExists = existingMessages.some((msg) => {
               // Chính: So sánh bằng ID nếu cả hai message đều có ID
               if (msg.id && message.id) {
                  return msg.id === message.id;
               }

               return false;
            });

            if (!messageExists) {
               const updatedMessages = [...existingMessages, message].sort(
                  (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
               );

               return {
                  ...prev,
                  [message.conversationId]: updatedMessages,
               };
            }

            console.log("Message đã tồn tại, không thêm vào");
            return prev;
         });

         // Cập nhật danh sách conversations với last message mới và unread count
         setConversations((prevConversations) => {
            let updatedConversations = prevConversations.map((conv) =>
               conv.id === message.conversationId
                  ? {
                     ...conv,
                     lastMessage: message.message,
                     lastTimestamp: new Date(message.createdDate).toLocaleString(),
                     unread:
                        selectedConversation?.id === message.conversationId
                           ? 0 // Nếu là chat hiện tại, đánh dấu đã đọc (xác nhận đọc optimistic)
                           : (conv.unread || 0) + 1, // Ngoài ra, tăng unread count
                     modifiedDate: message.createdDate,
                  }
                  : conv
            );

            // Sắp xếp lại danh sách conversations để cái có message mới lên top
            // Chúng tôi dùng custom sort để đảm bảo conversation mới nhất luôn đứng đầu.
            updatedConversations.sort((a, b) => new Date(b.modifiedDate) - new Date(a.modifiedDate));

            return updatedConversations;
         });
      },
      [selectedConversation] // Dependency trên selectedConversation cho logic unread
   );

   return (
      <div className="w-full h-screen flex flex-col bg-gray-50">
         <Navbar />
         <div className="w-full grow overflow-hidden bg-white shadow-lg">
            <div
               className="w-full h-full flex flex-row overflow-hidden border border-gray-200 rounded-lg"
               style={{ height: 'calc(100vh - 64px)' }} // Thiết lập height dựa trên kích thước màn hình trừ Navbar height
            >
               {/* Conversations List */}
               <div className="w-72 flex flex-col border-r border-gray-200">
                  {/* Header cho danh sách Chats */}
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                     <h2 className="text-[25px] text-blue-600 font-semibold">
                        <i className="fa-solid fa-comments mr-2 text-blue-600"></i>
                        Chats
                     </h2>
                     <div className="flex items-center space-x-3">
                        <div
                           className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200"
                           onClick={handleNewChatClick}
                        >
                           <i className="fa-solid fa-user-plus text-xl"></i>
                        </div>
                        {/* Nút tạo nhóm (Click để hiển thị NewGroupPopover) */}
                        <div
                           className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-colors duration-200"
                           onClick={handleNewGroupClick}
                        >
                           <i className="fa-solid fa-users text-xl"></i>
                        </div>
                     </div>
                     <NewChatPopover
                        anchorEl={newChatAnchorEl}
                        open={Boolean(newChatAnchorEl)}
                        onClose={handleCloseNewChat}
                        onSelectUser={handleSelectNewChatUser}
                        newChatRect={newChatRect}
                     />
                     <NewGroupPopover
                        anchorEl={newGroupAnchorEl}
                        open={Boolean(newGroupAnchorEl)}
                        onClose={handleCloseNewGroup}
                        onCreateGroup={handleCreateGroup} // Xử lý khi nhấn nút "Tạo Nhóm"
                        newGroupRect={newGroupRect} // Rect của nút tạo nhóm
                     />
                  </div>

                  {/* Các mục Conversation */}
                  <div className="grow overflow-y-auto">
                     {(() => {
                        if (loading) {
                           return <Spinner />;
                        }
                        if (error) {
                           return (
                              <div className="p-4">
                                 <Alert severity="error" action={
                                    <IconButton onClick={fetchConversations} className="text-red-700 hover:bg-red-200">
                                       <i className="fa-solid fa-sync-alt text-sm"></i>
                                    </IconButton>
                                 }>
                                    {error}
                                 </Alert>
                              </div>
                           );
                        }
                        if (conversations == null || conversations.length === 0) {
                           return (
                              <p className="p-4 text-center text-gray-500">
                                 Chưa có conversation nào. Bắt đầu chat mới để tiếp tục.
                              </p>
                           );
                        }
                        return (
                           <ul className="divide-y divide-gray-100">
                              {conversations.map((conversation) => (
                                 <li
                                    key={conversation.id}
                                    className={`flex items-start p-3 cursor-pointer transition-colors duration-150 ${selectedConversation?.id === conversation.id
                                       ? "bg-gray-100 border-l-4 border-blue-500"
                                       : "hover:bg-gray-50"
                                       }`}
                                    onClick={() => handleConversationSelect(conversation)}
                                 >
                                    <div className="mr-3 shrink-0">
                                       <Badge badgeContent={conversation.unread}>
                                          <Avatar src={conversation.conversationAvatar} />
                                       </Badge>
                                    </div>
                                    <div className="grow min-w-0">
                                       <div className="flex justify-between text-black items-center">
                                          <span
                                             className={`truncate text-sm ${conversation.unread > 0 ? "font-bold" : "font-semibold"}`}
                                          >
                                             {conversation.conversationName}
                                          </span>
                                          <span className="text-xs text-gray-500 ml-2 shrink-0">
                                             {new Date(conversation.modifiedDate).toLocaleString("vi-VN", {
                                                year: "numeric",
                                                month: "numeric",
                                                day: "numeric",
                                             })}
                                          </span>
                                       </div>
                                       <p className={`text-sm truncate ${conversation.unread > 0 ? "font-semibold text-gray-800" : "text-gray-500"}`}>
                                          {conversation.lastMessage || "Bắt đầu cuộc hội thoại"}
                                       </p>
                                    </div>
                                 </li>
                              ))}
                           </ul>
                        );
                     })()}
                  </div>
               </div>

               {/* Khu vực Chat */}
               <div className="grow flex flex-col">
                  {selectedConversation ? (
                     <>
                        {/* Header Chat */}
                        <div className="p-4 border-b border-gray-200 flex items-center bg-gray-50">
                           <Avatar src={selectedConversation.conversationAvatar} className="mr-3" />
                           <h3 className="text-x text-black font-semibold">{selectedConversation.conversationName}</h3>
                        </div>

                        {/* Messages Container */}
                        <div
                           id="messageContainer"
                           ref={messageContainerRef}
                           className="grow p-4 overflow-y-auto flex flex-col space-y-3"
                        >
                           {/* Wrapper để đẩy messages xuống dưới */}
                           <div className="flex flex-col grow justify-end w-full">
                              {currentMessages.map((msg) => {
                                 const isMe = msg.me;
                                 const bubbleColor = isMe
                                    ? (msg.failed ? "bg-red-200" : "bg-blue-100")
                                    : "bg-gray-100";
                                 const alignment = isMe ? "justify-end" : "justify-start";

                                 return (
                                    <div
                                       key={msg.id}
                                       className={`flex ${alignment} mb-2`}
                                    >
                                       {!isMe && (
                                          <Avatar
                                             src={msg.sender?.avatarUrl}
                                             className="mr-2 self-end w-8 h-8 shrink-0" // Avatar nhỏ hơn
                                          />
                                       )}
                                       <div
                                          className={`p-3 rounded-xl max-w-lg shadow-sm ${bubbleColor} ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                                       >
                                          <p className="text-sm text-gray-800 wrap-break-word">{msg.message}</p>
                                          <div className="flex items-center justify-end mt-1 space-x-2">
                                             {msg.failed && (
                                                <span className="text-xs text-red-600">
                                                   Gửi thất bại
                                                </span>
                                             )}
                                             <span className="text-xs text-gray-500 block text-right">
                                                {new Date(msg.createdDate).toLocaleString()}
                                             </span>
                                          </div>
                                       </div>
                                       {isMe && (
                                          <div
                                             className="rounded-full flex items-center justify-center text-white ml-2 self-end w-8 h-8 shrink-0 bg-blue-500 text-xs" // Avatar nhỏ cho 'Bạn'
                                          >
                                             Bạn
                                          </div>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>

                        {/* Input Message */}
                        <form
                           className="p-4 border-t border-gray-200 flex items-center bg-white"
                           onSubmit={(e) => {
                              e.preventDefault();
                              handleSendMessage();
                           }}
                        >
                           <input
                              type="text"
                              placeholder="Nhập message"
                              className="grow p-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                           />
                           <div
                              type="submit"
                              className={`ml-2 p-2 rounded-full transition-colors duration-200 ${!message.trim()
                                 ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                 : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                                 }`}
                              disabled={!message.trim()}
                           >
                              <i className="fa-solid fa-paper-plane text-2xl cursor-pointer"></i>
                           </div>
                        </form>
                     </>
                  ) : (
                     <div className="flex justify-center items-center h-full">
                        <p className="text-lg text-gray-500">
                           Chọn conversation để bắt đầu chat
                        </p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
