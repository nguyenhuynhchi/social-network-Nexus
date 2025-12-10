import React, { useState, useEffect, useRef, useCallback } from "react";
import NewChatPopover from "../components/cpn_chat/NewChatPopover";
import Navbar from "../components/cpn_home/Navbar";
import {
  getMyConversations,
  createConversation,
  getMessages,
  createMessage,
} from "../services/chatService";
import { io } from "socket.io-client";
import { getToken } from "../services/localStorageService";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [newChatAnchorEl, setNewChatAnchorEl] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesMap, setMessagesMap] = useState({});
  const messageContainerRef = useRef(null); // Function to scroll to the bottom of the message container
  const scrollToBottom = useCallback(() => {
    if (messageContainerRef.current) {
      // Immediate scroll attempt
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;

      // Backup attempt with a small timeout to ensure DOM updates are complete
      setTimeout(() => {
        messageContainerRef.current.scrollTop =
          messageContainerRef.current.scrollHeight;
      }, 100);

      // Final attempt with a longer timeout
      setTimeout(() => {
        messageContainerRef.current.scrollTop =
          messageContainerRef.current.scrollHeight;
      }, 300);
    }
  }, []);

  // New chat popover handlers
  const handleNewChatClick = (event) => {
    setNewChatAnchorEl(event.currentTarget);
  };

  const handleCloseNewChat = () => {
    setNewChatAnchorEl(null);
  };

  const handleSelectNewChatUser = async (user) => {
    const response = await createConversation({
      type: "DIRECT",
      participantIds: [user.userId],
    });

    const newConversation = response?.data?.result;

    // KIểm tra đã có cuộc trò chuyện này chưa
    const existingConversation = conversations.find(
      (conv) => conv.id === newConversation.id
    );

    if (existingConversation) {
      // Nếu đã có, chọn conversations đó
      setSelectedConversation(existingConversation);
    } else {
      // Không có thì thêm conversations vào list
      setConversations((prevConversations) => [
        newConversation,
        ...prevConversations,
      ]);

      // Chọn conversations mới tạo
      setSelectedConversation(newConversation);
    }
  };

  // Lấy list các conversations của người dùng
  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyConversations();
      setConversations(response?.data?.result || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Chọn cuộc trò chuyện đầu tiên trong danh sách khi load xong conversations
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Load messages from the conversation history when a conversation is selected
  useEffect(() => {
    const fetchMessages = async (conversationId) => {
      try {
        // Check if we already have messages for this conversation
        if (!messagesMap[conversationId]) {
          const response = await getMessages(conversationId);
          if (response?.data?.result) {
            // Sort messages by createdDate to ensure chronological order
            const sortedMessages = [...response.data.result].sort(
              (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
            );

            // Update messages map with the fetched messages
            setMessagesMap((prev) => ({
              ...prev,
              [conversationId]: sortedMessages,
            }));
          }
        }

        // Mark conversation as read when selected
        setConversations((prevConversations) =>
          prevConversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unread: 0 } : conv
          )
        );
      } catch (err) {
        console.error(
          `Error fetching messages for conversation ${conversationId}:`,
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
  // Automatically scroll to the bottom when messages change or after sending a message
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, scrollToBottom]);

  // Also scroll when the conversation changes
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation, scrollToBottom]);

  useEffect(() => {
    // Initialize socket connection
    console.log("Initializing socket connection...");

    const connectionUrl = "http://localhost:8099?token=" + getToken();

    const socket = new io(connectionUrl);

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("message", (messageString) => {
      console.log("New message received:", messageString);
      try {
        const message = JSON.parse(messageString); // Server gửi message dưới dạng JSON string

        // Chỉ xử lý nếu tin nhắn thuộc về cuộc trò chuyện hiện tại hoặc được hiển thị ở đâu đó
        if (message.conversationId) {
          setMessagesMap((prev) => {
            // Kiểm tra và thêm tin nhắn mới vào cuộc trò chuyện tương ứng
            const currentMessages = prev[message.conversationId] || [];

            // Tránh trùng lặp nếu tin nhắn đã được thêm do optimistic update
            const existingMessage = currentMessages.find((msg) => msg.id === message.id);

            if (!existingMessage) {
              const updatedMessages = [...currentMessages, message].sort(
                (a, b) => new Date(a.createdDate) - new Date(b.createdDate)
              );

              // Cập nhật messagesMap
              return {
                ...prev,
                [message.conversationId]: updatedMessages,
              };
            }
            return prev;
          });

          // Cập nhật lastMessage trong danh sách conversations
          setConversations((prevConversations) =>
            prevConversations.map((conv) =>
              conv.id === message.conversationId
                ? {
                  ...conv,
                  lastMessage: message.message, // Sử dụng message.message thay vì message.content
                  lastTimestamp: new Date().toLocaleString(),
                  unread: message.me ? conv.unread : conv.unread + 1, // Tăng unread nếu không phải là tin nhắn của mình
                }
                : conv
            )
          );
        }
      } catch (e) {
        console.error("Error parsing message JSON:", e);
      }
    });

    // Cleanup function - disconnect socket when component unmounts
    return () => {
      console.log("Disconnecting socket...");
      socket.disconnect();
    };
  }, []);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;

    const tempId = `temp-${Date.now()}`;
    const newMessage = {
      id: tempId,
      content: message,
      timestamp: new Date().toISOString(),
      me: true,
      pending: true,
    }; // Optimistically update UI with the new message (append to the end for chronological order)
    setMessagesMap((prev) => ({
      ...prev,
      [selectedConversation.id]: [
        ...(prev[selectedConversation.id] || []),
        newMessage,
      ],
    }));

    // Update last message in conversation list
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === selectedConversation.id
          ? {
            ...conv,
            lastMessage: message,
            lastTimestamp: new Date().toLocaleString(),
          }
          : conv
      )
    );

    // Clear input field
    setMessage("");

    try {
      // Send message to API
      const response = await createMessage({
        conversationId: selectedConversation.id,
        message: message,
      });

      console.log("Message sent successfully:", response);

      if (response?.data?.result) {
        // Replace temporary message with the one from the server
        setMessagesMap((prev) => {
          const updatedMessages = prev[selectedConversation.id].filter(
            (msg) => msg.id !== tempId
          );

          return {
            ...prev,
            [selectedConversation.id]: [
              ...updatedMessages,
              response.data.result,
            ].sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate)),
          };
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      // Mark message as failed
      setMessagesMap((prev) => {
        const updatedMessages = prev[selectedConversation.id].map((msg) =>
          msg.id === tempId ? { ...msg, failed: true, pending: false } : msg
        );

        return {
          ...prev,
          [selectedConversation.id]: updatedMessages,
        };
      });
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="w-full h-[calc(100vh-64px)] flex overflow-hidden bg-white shadow">

        {/* LEFT SIDEBAR – CONVERSATIONS */}
        <div className="w-[300px] border-r flex flex-col">

          {/* HEADER */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Chats</h2>

            <button
              onClick={handleNewChatClick}
              className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
            >
              <i className="fa fa-plus text-sm"></i>
            </button>

            <NewChatPopover
              anchorEl={newChatAnchorEl}
              open={Boolean(newChatAnchorEl)}
              onClose={handleCloseNewChat}
              onSelectUser={handleSelectNewChatUser}
            />
          </div>

          {/* CONVERSATIONS LIST */}
          <div className="flex-1 overflow-y-auto">

            {/* Loading */}
            {loading && (
              <div className="flex justify-center p-4">
                <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3">
                <div className="bg-red-100 text-red-600 p-3 rounded flex justify-between">
                  <span>{error}</span>
                  <button onClick={fetchConversations}>
                    <i className="fa fa-rotate-right"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && conversations?.length === 0 && (
              <div className="p-4 text-center text-gray-500">No conversations yet.</div>
            )}

            {/* Conversations */}
            <ul>
              {conversations?.map((c) => (
                <li
                  key={c.id}
                  onClick={() => handleConversationSelect(c)}
                  className={`p-3 cursor-pointer hover:bg-gray-100
              ${selectedConversation?.id === c.id ? "bg-gray-200" : ""}
            `}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={c.conversationAvatar || "/default_avatar_removebg.png"}
                        className="w-10 h-10 rounded-full"
                      />
                      {c.unread > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                          {c.unread}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between text-black text-sm mb-1">
                        <span className={`font-medium truncate ${c.unread > 0 && "font-bold"}`}>
                          {c.conversationName}
                        </span>

                        <span className="text-xs text-gray-500">
                          {new Date(c.modifiedDate).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <span className="text-sm text-gray-700 truncate">
                        {c.lastMessage || "Start a conversation !!!"}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* RIGHT – CHAT AREA */}
        <div className="flex-1 flex flex-col">

          {/* If no conversation selected */}
          {!selectedConversation && (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 text-lg">
                Select a conversation to start chatting
              </div>
            </div>
          )}

          {selectedConversation && (
            <>
              {/* TOP BAR */}
              <div className="p-4 border-b flex items-center">
                <img
                  src={selectedConversation.conversationAvatar || "/default_avatar_removebg.png"}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <h2 className="text-[18px] text-black font-semibold">
                  {selectedConversation.conversationName}
                </h2>
              </div>

              {/* MESSAGE LIST */}
              <div
                id="messageContainer"
                ref={messageContainerRef}
                className="flex-1 p-4 overflow-y-auto flex flex-col"
              >
                <div className="flex flex-col w-full mt-auto">

                  {currentMessages.map((msg) => (

                    <div
                      key={msg.id}
                      className={`flex mb-3 ${msg.me ? "justify-end" : "justify-start"
                        }`}
                    >
                      {!msg.me && (
                        <img
                          src={msg.sender?.avatarUrl || "/default_avatar_removebg.png"}
                          className="w-8 h-8 rounded-full mr-2 self-end"
                        />
                      )}

                      <div
                        className={`p-3 max-w-[70%] rounded-lg shadow text-black
                    ${msg.me ? (msg.failed ? "bg-red-100" : "bg-blue-100") : "bg-gray-100"}
                    ${msg.pending ? "opacity-70" : ""}
                  `}
                      >
                        <div>{msg.message}</div>

                        <div className="text-right text-xs text-gray-500 mt-1">

                          {msg.failed && (
                            <span className="text-red-500 mr-2">Failed</span>
                          )}

                          {msg.pending && (
                            <span className="text-gray-400 mr-2">Sending...</span>
                          )}

                          {new Date(msg.createdDate).toLocaleString()}
                        </div>
                      </div>

                      {msg.me && (
                        <div className="ml-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          You
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* INPUT BAR */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="p-4 border-t flex"
              >
                <input
                  className="flex-1 border-blue-300 rounded bg-gray-200 px-3 py-2 text-black focus:ring-blue-500"
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="ml-3 bg-white text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  <i className="fa fa-paper-plane text-xl"></i>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
